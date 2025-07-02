import express from "express";
import OpenAI from "openai";
import dotenv from "dotenv";
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
            Svar kun med gyldig JSON uden yderligere tekst.`
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

export default router;