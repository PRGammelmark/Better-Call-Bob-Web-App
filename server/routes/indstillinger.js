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
      .max(1000)
      .optional()
  });

// Hent indstillinger (returnerer det ene dokument, hvis det findes)
router.get("/", async (req, res) => {
  try {
    let indstillinger = await Indstillinger.findOne();

    // Hvis ingen dokument findes, så opret et med defaults
    if (!indstillinger) {
      indstillinger = await Indstillinger.create({});
    }

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
        {},
        value,
        { new: true, upsert: true }
      );
  
      res.status(200).json(indstillinger);
    } catch (err) {
      console.error("Fejl ved opdatering af indstillinger:", err);
      res.status(500).json({ error: "Kunne ikke opdatere indstillinger" });
    }
  });

export default router;
