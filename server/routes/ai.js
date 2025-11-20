import express from "express";
import OpenAI from "openai";
import dotenv from "dotenv";
import Opgavetyper from "../models/opgavetyperModel.js";

dotenv.config({ path: "../.env" });

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post("/parseOpgaveFromText", async (req, res) => {
  const { tekstblok } = req.body;

  if (!tekstblok) {
    return res.status(400).json({ error: "Manglende tekstblok i request body" });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content: `Udtræk følgende felter fra teksten og returnér som ren JSON: 
            fornavn, efternavn, email, telefon, virksomhed, cvr, adresse, postnummerOgBy. Hvis information mangler, så brug empty string. Email, telefon og cvr må ikke indeholde mellemrum.
            Returnér kun gyldig JSON som output, uden markdown eller forklaringer.`
        },
        {
          role: "user",
          content: tekstblok,
        }
      ],
    });

    const content = completion.choices[0].message.content;

    // Parse JSON fra AI-svar
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      return res.status(500).json({ error: "Kunne ikke parse AI's JSON output", raw: content });
    }

    res.json(parsed);
  } catch (error) {
    console.error("AI parsing fejl:", error);
    res.status(500).json({ error: "Fejl ved AI parsing" });
  }
});

router.post("/parseKategorierFromText", async (req, res) => {
  const { opgaveBeskrivelse } = req.body;

  if (!opgaveBeskrivelse) {
    return res.status(400).json({ error: "Manglende opgaveBeskrivelse i request body" });
  }

  try {
    // Hent alle opgavetyper fra databasen
    const opgavetyper = await Opgavetyper.find({});
    
    // Udtræk alle opgavetyper (opgavetype feltet)
    const opgavetyperListe = opgavetyper
      .map(opgavetype => opgavetype.opgavetype)
      .filter(opgavetype => opgavetype && opgavetype.trim() !== "");

    if (opgavetyperListe.length === 0) {
      return res.status(400).json({ error: "Ingen opgavetyper fundet i databasen" });
    }

    // Send til AI for at analysere opgavebeskrivelsen og matche opgavetyper
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content: `Du skal analysere en opgavebeskrivelse og give den en kategori. 
          Du må gerne give den flere kategorier, hvis det giver mening.
          
          Tilgængelige kategorier: ${opgavetyperListe.join(", ")}
          
          Returnér kun et array af kategorier som JSON, f.eks.: ["kategori1", "kategori2"].
          Vælg kun en kategori hvis den tydeligt matcher opgavens kerne. 
          Hvis teksten ikke specifikt nævner noget, der passer til en kategori, må du IKKE gætte.
          Er du usikker på om en kategori passer til opgaven skal du IKKE inkludere den. Hvis der ikke er nogen relevante kategorier at give til opgaven, så skal du returnere et tomt array: [].
          Returnér kun gyldig JSON som output, uden markdown eller forklaringer.`
        },
        {
          role: "user",
          content: `Analysér følgende opgavebeskrivelse, og giv mig en liste over kategorier:\n\n${opgaveBeskrivelse}`,
        }
      ],
    });

    const content = completion.choices[0].message.content;

    // Parse JSON fra AI-svar
    let parsed;
    try {
      // Fjern eventuel markdown formatting
      const cleanedContent = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(cleanedContent);
      
      // Valider at det er et array
      if (!Array.isArray(parsed)) {
        parsed = [];
      }
      
      // Filtrer kun opgavetyper der faktisk eksisterer i databasen
      // Match case-insensitively, men returner de originale værdier fra databasen
      const validOpgavetyper = parsed
        .map(o => o.trim())
        .filter(o => {
          const oLower = o.toLowerCase();
          return opgavetyperListe.some(x => x.trim().toLowerCase() === oLower);
        })
        .map(o => {
          // Find den originale værdi fra databasen (med korrekt case)
          const oLower = o.toLowerCase();
          const match = opgavetyperListe.find(x => x.trim().toLowerCase() === oLower);
          return match ? match.trim() : o;
        });
      
      res.json(validOpgavetyper);
    } catch (e) {
      console.error("Kunne ikke parse AI's JSON output:", content);
      return res.status(500).json({ error: "Kunne ikke parse AI's JSON output", raw: content });
    }
  } catch (error) {
    console.error("AI opgavetype kategorisering fejl:", error);
    res.status(500).json({ error: "Fejl ved AI opgavetype kategorisering" });
  }
});

router.post("/summarizeOpgavebeskrivelse", async (req, res) => {
  const { opgaveBeskrivelse } = req.body;

  if (!opgaveBeskrivelse) {
    return res.status(400).json({ error: "Manglende opgaveBeskrivelse i request body" });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content: `Du skal opsummere en opgavebeskrivelse til præcis 10 ord eller mindre, og samtidig vurdere hvor lang tid opgaven tager i hele timer.
          Opsummeringen skal være præcis og informativ, og fange essensen af opgaven.
          Returnér kun gyldig JSON som output med følgende struktur:
          {
            "opsummering": "opsummeringen her",
            "estimeretTidsforbrugTimer": <helt tal>
          }
          Estimeret tidsforbrug skal være et helt tal (antal timer). Vurder realistisk hvor lang tid opgaven tager for en professionel håndværker at udføre.
          Returnér kun gyldig JSON, uden markdown eller forklaringer.`
        },
        {
          role: "user",
          content: `Opsumer følgende opgavebeskrivelse til 10 ord eller mindre, og vurder tidsforbruget:\n\n${opgaveBeskrivelse}`,
        }
      ],
    });

    const content = completion.choices[0].message.content.trim();

    // Parse JSON fra AI-svar
    let parsed;
    try {
      // Fjern eventuel markdown formatting
      const cleanedContent = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(cleanedContent);
      
      // Valider at opsummeringen er 10 ord eller mindre
      const opsummering = parsed.opsummering || parsed.summary || "";
      const wordCount = opsummering.split(/\s+/).filter(word => word.length > 0).length;
      
      let finalOpsummering = opsummering;
      if (wordCount > 10) {
        // Hvis AI'en returnerer mere end 10 ord, tag de første 10 ord
        const words = opsummering.split(/\s+/).filter(word => word.length > 0);
        finalOpsummering = words.slice(0, 10).join(' ');
      }
      
      // Valider og sikre at estimeret tidsforbrug er et helt tal
      let estimeretTidsforbrugTimer = parsed.estimeretTidsforbrugTimer || parsed.estimatedHours || 1;
      estimeretTidsforbrugTimer = Math.max(1, Math.round(Number(estimeretTidsforbrugTimer))); // Minimum 1 time, runder til nærmeste heltal
      
      res.json({
        opsummering: finalOpsummering,
        estimeretTidsforbrugTimer
      });
    } catch (e) {
      console.error("Kunne ikke parse AI's JSON output:", content);
      // Fallback: returner kun opsummeringen hvis JSON parsing fejler
      const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
      let finalContent = content;
      if (wordCount > 10) {
        const words = content.split(/\s+/).filter(word => word.length > 0);
        finalContent = words.slice(0, 10).join(' ');
      }
      res.json({
        opsummering: finalContent,
        estimeretTidsforbrugTimer: 1 // Default fallback
      });
    }
  } catch (error) {
    console.error("AI opsummering fejl:", error);
    res.status(500).json({ error: "Fejl ved AI opsummering" });
  }
});

export default router;