import express from "express";
import Joi from "joi";
import Indstillinger from "../models/indstillingerModel.js";

const router = express.Router();

// Valideringsskema
const indstillingerSchema = Joi.object({
    opgavetyperKategorier: Joi.array()
      .items(Joi.string().min(2).max(50)) // hver kategori skal være en tekst
      .min(1)
      .optional(),
  
    arbejdsområdeKilometerRadius: Joi.number()
      .min(1)
      .max(200)
      .optional()
});

// SSE stream
router.get("/stream", async (req, res) => {
  res.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive"
  });
  res.flushHeaders();

  // Send en første event med aktuelle indstillinger
  const current = await Indstillinger.findOne();
  res.write(`data: ${JSON.stringify(current)}\n\n`);

  // Gem response så vi kan skrive til den senere
  global.clients = global.clients || [];
  global.clients.push(res);

  // Ryd op når klienten lukker forbindelsen
  req.on("close", () => {
    global.clients = global.clients.filter(c => c !== res);
  });
});

// Når indstillinger opdateres et andet sted i dit API
export const notifyClients = (newSettings) => {
  if (global.clients) {
    global.clients.forEach(res => {
      res.write(`data: ${JSON.stringify(newSettings)}\n\n`);
    });
  }
};

// Hent indstillinger (returnerer det ene dokument, hvis det findes)
// Der laves en "findOneAndUpdate"-funktion, da den returnerer det fundne dokument, og alternativt opretter nye indstillinger med default values
router.get("/", async (req, res) => {
  try {
    const indstillinger = await Indstillinger.findOneAndUpdate(
      { singleton: "ONLY_ONE" }, 
      {}, 
      { new: true, upsert: true }
    );

    res.status(200).json(indstillinger);
  } catch (err) {
    console.error("Fejl ved hentning af indstillinger:", err);
    res.status(500).json({ error: "Kunne ikke hente indstillinger" });
  }
});

// Opdater indstillinger (PATCH)
router.patch("/", async (req, res) => {
  try {
    const { error, value } = indstillingerSchema.validate(req.body, { abortEarly: false });

    if (error) {
      return res.status(400).json({ 
        error: "Valideringsfejl", 
        details: error.details.map(d => d.message) 
      });
    }

    const indstillinger = await Indstillinger.findOneAndUpdate(
      { singleton: "ONLY_ONE" },
      value,
      { new: true, upsert: true }
    );

    notifyClients(indstillinger);

    res.status(200).json(indstillinger);
  } catch (err) {
    console.error("Fejl ved opdatering af indstillinger:", err);
    res.status(500).json({ error: "Kunne ikke opdatere indstillinger" });
  }
});

export default router;
