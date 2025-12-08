import express from "express";
import OpenAI from "openai";
import dotenv from "dotenv";
import Opgavetyper from "../models/opgavetyperModel.js";
import Indstillinger from "../models/indstillingerModel.js";

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

  console.log("=== AI KATEGORI IDENTIFIKATION START ===");
  console.log("Timestamp:", new Date().toISOString());
  console.log("Request body opgaveBeskrivelse length:", opgaveBeskrivelse?.length || 0);
  console.log("Request body opgaveBeskrivelse preview:", opgaveBeskrivelse?.substring(0, 200) || "Manglende");

  if (!opgaveBeskrivelse) {
    console.error("❌ FEJL: Manglende opgaveBeskrivelse i request body");
    return res.status(400).json({ error: "Manglende opgaveBeskrivelse i request body" });
  }

  try {
    console.log("📥 Henter opgavetyper fra database...");
    // Hent alle opgavetyper fra databasen
    const opgavetyper = await Opgavetyper.find({});
    
    // Udtræk alle opgavetyper (opgavetype feltet)
    const opgavetyperListe = opgavetyper
      .map(opgavetype => opgavetype.opgavetype)
      .filter(opgavetype => opgavetype && opgavetype.trim() !== "");

    console.log("📋 Antal opgavetyper i database:", opgavetyper.length);
    console.log("📋 Antal opgavetyper efter filtrering:", opgavetyperListe.length);
    console.log("📋 Opgavetyper liste:", opgavetyperListe);

    if (opgavetyperListe.length === 0) {
      console.error("❌ FEJL: Ingen opgavetyper fundet i databasen");
      return res.status(400).json({ error: "Ingen opgavetyper fundet i databasen" });
    }

    const systemPrompt = `Du skal analysere en opgavebeskrivelse og give den en kategori. 
          Du må gerne give den flere kategorier, hvis det giver mening.
          
          Tilgængelige kategorier: ${opgavetyperListe.join(", ")}
          
          Returnér kun et array af kategorier som JSON, f.eks.: ["kategori1", "kategori2"].
          Vælg kun en kategori hvis den tydeligt matcher opgavens kerne. 
          Hvis teksten ikke specifikt nævner noget, der passer til en kategori, må du IKKE gætte.
          Er du usikker på om en kategori passer til opgaven skal du IKKE inkludere den. Hvis der ikke er nogen relevante kategorier at give til opgaven, så skal du returnere et tomt array: [].
          Returnér kun gyldig JSON som output, uden markdown eller forklaringer.`;

    const userPrompt = `Analysér følgende opgavebeskrivelse, og giv mig en liste over kategorier:\n\n${opgaveBeskrivelse}`;

    console.log("🤖 Sender request til OpenAI...");
    console.log("🤖 Model: gpt-4.1-mini");
    console.log("🤖 System prompt length:", systemPrompt.length);
    console.log("🤖 User prompt length:", userPrompt.length);
    console.log("🤖 User prompt preview:", userPrompt.substring(0, 300));

    // Send til AI for at analysere opgavebeskrivelsen og matche opgavetyper
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: userPrompt,
        }
      ],
    });

    const content = completion.choices[0].message.content;
    console.log("✅ OpenAI response modtaget");
    console.log("📝 Raw AI content length:", content?.length || 0);
    console.log("📝 Raw AI content:", content);

    // Parse JSON fra AI-svar
    let parsed;
    try {
      // Fjern eventuel markdown formatting
      const cleanedContent = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      console.log("🧹 Cleaned content:", cleanedContent);
      
      parsed = JSON.parse(cleanedContent);
      console.log("✅ JSON parsing succesfuld");
      console.log("📦 Parsed resultat:", parsed);
      console.log("📦 Parsed resultat type:", typeof parsed);
      console.log("📦 Er array?", Array.isArray(parsed));
      
      // Valider at det er et array
      if (!Array.isArray(parsed)) {
        console.warn("⚠️ Parsed resultat er ikke et array, konverterer til tomt array");
        parsed = [];
      }
      
      console.log("📦 Parsed array length:", parsed.length);
      
      // Filtrer kun opgavetyper der faktisk eksisterer i databasen
      // Match case-insensitively, men returner de originale værdier fra databasen
      console.log("🔍 Filtrerer opgavetyper mod database...");
      const validOpgavetyper = parsed
        .map(o => o.trim())
        .filter(o => {
          const oLower = o.toLowerCase();
          const isValid = opgavetyperListe.some(x => x.trim().toLowerCase() === oLower);
          if (!isValid) {
            console.log(`  ⚠️ "${o}" matcher ikke nogen opgavetype i databasen`);
          }
          return isValid;
        })
        .map(o => {
          // Find den originale værdi fra databasen (med korrekt case)
          const oLower = o.toLowerCase();
          const match = opgavetyperListe.find(x => x.trim().toLowerCase() === oLower);
          return match ? match.trim() : o;
        })
        .map(opgavetypeNavn => {
          // Find the full opgavetype object from database to get English name
          const opgavetypeObj = opgavetyper.find(ot => 
            ot.opgavetype && ot.opgavetype.trim().toLowerCase() === opgavetypeNavn.toLowerCase()
          );
          
          // Return object with both Danish and English names
          return {
            opgavetype: opgavetypeNavn,
            opgavetypeEn: opgavetypeObj?.opgavetypeEn || opgavetypeNavn
          };
        });
      
      console.log("✅ Filtrering færdig");
      console.log("📊 Valid opgavetyper count:", validOpgavetyper.length);
      console.log("📊 Valid opgavetyper:", validOpgavetyper);
      console.log("📊 Original parsed count:", parsed.length);
      console.log("📊 Filtrerede væk:", parsed.length - validOpgavetyper.length);
      
      console.log("=== AI KATEGORI IDENTIFIKATION SLUT ===");
      console.log("📤 Sender response tilbage:", validOpgavetyper);
      
      res.json(validOpgavetyper);
    } catch (e) {
      console.error("❌ JSON parsing fejl:", e.message);
      console.error("❌ Raw content der fejlede:", content);
      console.error("❌ Stack trace:", e.stack);
      return res.status(500).json({ error: "Kunne ikke parse AI's JSON output", raw: content });
    }
  } catch (error) {
    console.error("❌ AI opgavetype kategorisering fejl:", error.message);
    console.error("❌ Error stack:", error.stack);
    console.error("❌ Error details:", error);
    if (error.response) {
      console.error("❌ OpenAI API error response:", error.response.data);
      console.error("❌ OpenAI API error status:", error.response.status);
    }
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
          
          KRITISK: Du SKAL returnere BÅDE en dansk opsummering (opsummeringDa) OG en engelsk opsummering (opsummeringEn). Begge felter er påkrævet.
          
          Returnér kun gyldig JSON som output med følgende struktur:
          {
            "opsummeringDa": "den danske opsummering her (maks 10 ord)",
            "opsummeringEn": "the English summary here (max 10 words)",
            "estimeretTidsforbrugTimer": <helt tal>
          }
          
          Estimeret tidsforbrug skal være et helt tal (antal timer). Vurder realistisk hvor lang tid opgaven tager for en professionel håndværker at udføre.
          
          VIGTIGT: Returnér kun gyldig JSON, uden markdown formatting (ingen \`\`\`json eller \`\`\`), uden forklaringer eller ekstra tekst.`
        },
        {
          role: "user",
          content: `Opsummér følgende opgavebeskrivelse til præcis 10 ord eller mindre. Du skal give mig BÅDE en dansk opsummering (opsummeringDa) OG en engelsk opsummering (opsummeringEn). Vurder også tidsforbruget i hele timer.\n\nOpgavebeskrivelse:\n${opgaveBeskrivelse}`,
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
      
      // Helper function to validate and truncate summary to 10 words
      const validateAndTruncate = (opsummering) => {
        if (!opsummering) return "";
        const wordCount = opsummering.split(/\s+/).filter(word => word.length > 0).length;
        if (wordCount > 10) {
          const words = opsummering.split(/\s+/).filter(word => word.length > 0);
          return words.slice(0, 10).join(' ');
        }
        return opsummering;
      };
      
      // Valider at opsummeringerne er 10 ord eller mindre
      // Prioritize opsummeringDa/opsummeringEn over legacy fields
      let opsummeringDa = validateAndTruncate(parsed.opsummeringDa || "");
      let opsummeringEn = validateAndTruncate(parsed.opsummeringEn || "");
      
      // If one is missing but we have a generic summary, use it for both
      if (!opsummeringDa && !opsummeringEn) {
        // Fallback to legacy fields if new fields are missing
        const fallbackSummary = parsed.opsummering || parsed.summary || "";
        if (fallbackSummary) {
          opsummeringDa = validateAndTruncate(fallbackSummary);
          opsummeringEn = validateAndTruncate(fallbackSummary);
        }
      } else if (!opsummeringDa && opsummeringEn) {
        // If only English is provided, use it for Danish too (better than nothing)
        opsummeringDa = opsummeringEn;
      } else if (opsummeringDa && !opsummeringEn) {
        // If only Danish is provided, use it for English too (better than nothing)
        opsummeringEn = opsummeringDa;
      }
      
      // Valider og sikre at estimeret tidsforbrug er et helt tal
      let estimeretTidsforbrugTimer = parsed.estimeretTidsforbrugTimer || parsed.estimatedHours || 1;
      estimeretTidsforbrugTimer = Math.max(1, Math.round(Number(estimeretTidsforbrugTimer))); // Minimum 1 time, runder til nærmeste heltal
      estimeretTidsforbrugTimer = Math.min(8, estimeretTidsforbrugTimer); // Maksimum 8 timer
      
      res.json({
        opsummeringDa,
        opsummeringEn,
        estimeretTidsforbrugTimer
      });
    } catch (e) {
      console.error("Kunne ikke parse AI's JSON output:", content);
      // Fallback: returner opsummeringer hvis JSON parsing fejler
      const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
      let finalContent = content;
      if (wordCount > 10) {
        const words = content.split(/\s+/).filter(word => word.length > 0);
        finalContent = words.slice(0, 10).join(' ');
      }
      res.json({
        opsummeringDa: finalContent,
        opsummeringEn: finalContent,
        estimeretTidsforbrugTimer: 1 // Default fallback
      });
    }
  } catch (error) {
    console.error("AI opsummering fejl:", error);
    res.status(500).json({ error: "Fejl ved AI opsummering" });
  }
});

router.post("/generateQuestions", async (req, res) => {
  const { opgaveBeskrivelse } = req.body;

  if (!opgaveBeskrivelse) {
    return res.status(400).json({ error: "Manglende opgaveBeskrivelse i request body" });
  }

  try {
    // Standard system prompt (hardcoded)
    const standardSystemPrompt = `Du skal analysere en opgavebeskrivelse og generere relevante opfølgende spørgsmål, der kan hjælpe med at få mere information om opgaven.
    
Generer kun spørgsmål hvis opgavebeskrivelsen mangler vigtige detaljer. Hvis opgavebeskrivelsen allerede er meget udførlig og indeholder alle nødvendige oplysninger, skal du returnere et tomt array.

Hvert spørgsmål skal have både en dansk og en engelsk version.

Returnér kun gyldig JSON som output med følgende struktur:
[
  {
    "spørgsmål": "Det danske spørgsmål her",
    "spørgsmålEn": "The English question here"
  },
  ...
]

Hvis der ikke er behov for opfølgende spørgsmål, returnér et tomt array: [].

VIGTIGT: Returnér kun gyldig JSON, uden markdown formatting (ingen \`\`\`json eller \`\`\`), uden forklaringer eller ekstra tekst.`;

    // Fetch extra rules from settings and combine with standard prompt
    let systemPrompt = standardSystemPrompt;
    try {
      const indstillinger = await Indstillinger.findOne({ singleton: "ONLY_ONE" });
      if (indstillinger?.aiExtraRules && indstillinger.aiExtraRules.trim() !== "") {
        // Combine standard prompt with extra rules
        systemPrompt = `${standardSystemPrompt}\n\nYDERLIGERE REGLER:\n${indstillinger.aiExtraRules}`;
      }
    } catch (err) {
      console.warn("Kunne ikke hente indstillinger for ekstra regler, bruger kun standard:", err);
    }

    const userPrompt = `Analysér følgende opgavebeskrivelse og generer relevante opfølgende spørgsmål hvis nødvendigt:\n\n${opgaveBeskrivelse}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: userPrompt,
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
      
      // Valider at det er et array
      if (!Array.isArray(parsed)) {
        console.warn("Parsed resultat er ikke et array, konverterer til tomt array");
        parsed = [];
      }
      
      // Valider at hvert spørgsmål har de korrekte felter
      parsed = parsed.filter(q => q.spørgsmål && q.spørgsmålEn).map(q => ({
        spørgsmål: String(q.spørgsmål).trim(),
        spørgsmålEn: String(q.spørgsmålEn).trim()
      }));
      
      res.json(parsed);
    } catch (e) {
      console.error("Kunne ikke parse AI's JSON output:", content);
      // Hvis parsing fejler, returner tomt array
      res.json([]);
    }
  } catch (error) {
    console.error("AI spørgsmålsgenerering fejl:", error);
    res.status(500).json({ error: "Fejl ved AI spørgsmålsgenerering" });
  }
});

export default router;