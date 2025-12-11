import express from "express";
import Joi from "joi";
import Indstillinger from "../models/indstillingerModel.js";
import requireAuth from "../middleware/requireAuth.js";

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
      .optional(),
    
    virksomhedsnavn: Joi.string()
      .max(200)
      .allow("")
      .optional(),
    
    cvrNummer: Joi.string()
      .max(20)
      .allow("")
      .optional(),
    
    adresse: Joi.string()
      .max(500)
      .allow("")
      .optional(),
    
    handelsbetingelser: Joi.string()
      .max(1000)
      .allow("")
      .optional(),
    
    persondatapolitik: Joi.string()
      .max(1000)
      .allow("")
      .optional(),
    
    aiExtraRules: Joi.string()
      .max(5000)
      .allow("")
      .optional(),
    
    aiTidsestimaterPrompt: Joi.string()
      .max(5000)
      .allow("")
      .optional(),
    
    bookingLogo: Joi.string()
      .max(1000)
      .allow("")
      .optional(),
    
    bookingFavicon: Joi.string()
      .max(1000)
      .allow("")
      .optional(),
    
    bookingRedirectUrl: Joi.string()
      .max(2000)
      .allow("")
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
router.patch("/", requireAuth, async (req, res) => {
  try {
    console.log("PATCH /indstillinger - Modtaget data:", req.body);
    
    const { error, value } = indstillingerSchema.validate(req.body, { abortEarly: false });

    if (error) {
      console.error("Valideringsfejl:", error.details);
      return res.status(400).json({ 
        error: "Valideringsfejl", 
        details: error.details.map(d => d.message) 
      });
    }

    console.log("Valideret data:", value);

    // Brug $set for at sikre at alle felter bliver opdateret korrekt
    const updateData = {};
    if (value.virksomhedsnavn !== undefined) updateData.virksomhedsnavn = value.virksomhedsnavn;
    if (value.cvrNummer !== undefined) updateData.cvrNummer = value.cvrNummer;
    if (value.adresse !== undefined) updateData.adresse = value.adresse;
    if (value.arbejdsområdeKilometerRadius !== undefined) updateData.arbejdsområdeKilometerRadius = value.arbejdsområdeKilometerRadius;
    if (value.opgavetyperKategorier !== undefined) updateData.opgavetyperKategorier = value.opgavetyperKategorier;
    if (value.handelsbetingelser !== undefined) updateData.handelsbetingelser = value.handelsbetingelser;
    if (value.persondatapolitik !== undefined) updateData.persondatapolitik = value.persondatapolitik;
    if (value.aiExtraRules !== undefined) updateData.aiExtraRules = value.aiExtraRules;
    if (value.aiTidsestimaterPrompt !== undefined) updateData.aiTidsestimaterPrompt = value.aiTidsestimaterPrompt;
    if (value.bookingLogo !== undefined) updateData.bookingLogo = value.bookingLogo;
    if (value.bookingFavicon !== undefined) updateData.bookingFavicon = value.bookingFavicon;
    if (value.bookingRedirectUrl !== undefined) updateData.bookingRedirectUrl = value.bookingRedirectUrl;

    console.log("Update data:", updateData);

    const indstillinger = await Indstillinger.findOneAndUpdate(
      { singleton: "ONLY_ONE" },
      { $set: updateData },
      { new: true, upsert: true }
    );

    console.log("Opdateret indstillinger:", indstillinger);

    notifyClients(indstillinger);

    res.status(200).json(indstillinger);
  } catch (err) {
    console.error("Fejl ved opdatering af indstillinger:", err);
    res.status(500).json({ error: "Kunne ikke opdatere indstillinger" });
  }
});

export default router;
