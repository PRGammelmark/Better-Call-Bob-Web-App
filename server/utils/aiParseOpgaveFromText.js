// aiParser.js
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config({ path: "../.env" }); // sørger for at process.env er fyldt

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export const aiParseOpgaveFromText = async (tekstblok) => {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // ikke "nano"
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content: `Udtræk følgende felter fra teksten og returnér som **ren JSON**: 
fornavn, efternavn, email, telefon, virksomhed, cvr. Email, telefon og cvr må ikke indeholde mellemrum.
Hvis information mangler, så brug empty string. Returnér kun gyldig JSON uden forklaring.`
        },
        {
          role: "user",
          content: tekstblok
        }
      ]
    });

    const content = completion.choices[0].message.content;

    const parsed = JSON.parse(content);
    return parsed;

  } catch (err) {
    console.error("Fejl under AI-parsing:", err);
    return null;
  }
};

const tekst = `
Hej, jeg hedder Jens Petersen og jeg vil gerne høre om jeres tilbud.
Du kan ringe til mig på 22 33 44 55 eller skrive til jens@firma.dk.
Jeg repræsenterer Petersen Byg ApS.
`;

aiParseOpgaveFromText(tekst).then(console.log);