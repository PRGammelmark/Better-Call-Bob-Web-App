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
    
    postnummer: Joi.string()
      .max(20)
      .allow("")
      .optional(),
    
    by: Joi.string()
      .max(100)
      .allow("")
      .optional(),
    
    telefonnummer: Joi.string()
      .max(50)
      .allow("")
      .optional(),
    
    email: Joi.string()
      .email()
      .max(200)
      .allow("")
      .optional(),
    
    hjemmeside: Joi.string()
      .max(500)
      .allow("")
      .optional()
      .custom((value, helpers) => {
        if (value && value.trim() !== "") {
          // Check if it's a valid URL (with or without protocol)
          const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i;
          if (!urlPattern.test(value)) {
            return helpers.error('string.uri');
          }
        }
        return value;
      }),
    
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
    
    logo: Joi.string()
      .max(1000)
      .allow("")
      .optional(),
    
    logoSize: Joi.number()
      .min(50)
      .max(100)
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
      .optional(),
    
    medarbejdereKanGiveRabat: Joi.boolean()
      .optional(),
    
    maksRabatSats: Joi.number()
      .min(0)
      .max(100)
      .optional(),
    
    modregnKunderabatIMedarbejderlon: Joi.boolean()
      .optional(),
    
    modregningsmetode: Joi.string()
      .valid("Match beløb", "Match procentdel")
      .optional(),
    
    laasPosteringerEfterAntalDage: Joi.boolean()
      .optional(),
    
    laasPosteringerEfterAntalDageVærdi: Joi.number()
      .min(1)
      .max(7)
      .optional(),
    
    laasPosteringerAutomatisk: Joi.boolean()
      .optional(),
    
    laasPosteringerAutomatiskType: Joi.string()
      .valid("ugedag", "månedsdag")
      .optional(),
    
    laasPosteringerAutomatiskUgedag: Joi.number()
      .min(0)
      .max(6)
      .optional(),
    
    laasPosteringerAutomatiskMånedsdag: Joi.number()
      .min(1)
      .max(31)
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
    if (value.postnummer !== undefined) updateData.postnummer = value.postnummer;
    if (value.by !== undefined) updateData.by = value.by;
    if (value.telefonnummer !== undefined) updateData.telefonnummer = value.telefonnummer;
    if (value.email !== undefined) updateData.email = value.email;
    if (value.hjemmeside !== undefined) updateData.hjemmeside = value.hjemmeside;
    if (value.arbejdsområdeKilometerRadius !== undefined) updateData.arbejdsområdeKilometerRadius = value.arbejdsområdeKilometerRadius;
    if (value.opgavetyperKategorier !== undefined) updateData.opgavetyperKategorier = value.opgavetyperKategorier;
    if (value.handelsbetingelser !== undefined) updateData.handelsbetingelser = value.handelsbetingelser;
    if (value.persondatapolitik !== undefined) updateData.persondatapolitik = value.persondatapolitik;
    if (value.aiExtraRules !== undefined) updateData.aiExtraRules = value.aiExtraRules;
    if (value.aiTidsestimaterPrompt !== undefined) updateData.aiTidsestimaterPrompt = value.aiTidsestimaterPrompt;
    if (value.logo !== undefined) updateData.logo = value.logo;
    if (value.logoSize !== undefined) updateData.logoSize = value.logoSize;
    if (value.bookingLogo !== undefined) updateData.bookingLogo = value.bookingLogo;
    if (value.bookingFavicon !== undefined) updateData.bookingFavicon = value.bookingFavicon;
    if (value.bookingRedirectUrl !== undefined) updateData.bookingRedirectUrl = value.bookingRedirectUrl;
    if (value.medarbejdereKanGiveRabat !== undefined) updateData.medarbejdereKanGiveRabat = value.medarbejdereKanGiveRabat;
    if (value.maksRabatSats !== undefined) updateData.maksRabatSats = value.maksRabatSats;
    if (value.modregnKunderabatIMedarbejderlon !== undefined) updateData.modregnKunderabatIMedarbejderlon = value.modregnKunderabatIMedarbejderlon;
    if (value.modregningsmetode !== undefined) updateData.modregningsmetode = value.modregningsmetode;
    if (value.laasPosteringerEfterAntalDage !== undefined) updateData.laasPosteringerEfterAntalDage = value.laasPosteringerEfterAntalDage;
    if (value.laasPosteringerEfterAntalDageVærdi !== undefined) updateData.laasPosteringerEfterAntalDageVærdi = value.laasPosteringerEfterAntalDageVærdi;
    if (value.laasPosteringerAutomatisk !== undefined) updateData.laasPosteringerAutomatisk = value.laasPosteringerAutomatisk;
    if (value.laasPosteringerAutomatiskType !== undefined) updateData.laasPosteringerAutomatiskType = value.laasPosteringerAutomatiskType;
    if (value.laasPosteringerAutomatiskUgedag !== undefined) updateData.laasPosteringerAutomatiskUgedag = value.laasPosteringerAutomatiskUgedag;
    if (value.laasPosteringerAutomatiskMånedsdag !== undefined) updateData.laasPosteringerAutomatiskMånedsdag = value.laasPosteringerAutomatiskMånedsdag;

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
