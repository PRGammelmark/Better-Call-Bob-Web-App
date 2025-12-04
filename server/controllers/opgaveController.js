import Opgave from '../models/opgaveModel.js'
import Bruger from '../models/brugerModel.js'
import Postering from '../models/posteringModel.js'
import Kunde from '../models/kunderModel.js'
import Besøg from '../models/besøgModel.js'
import mongoose from "mongoose"
import Counter from '../models/counterModel.js';
import Joi from "joi"
import axios from 'axios'
import dayjs from 'dayjs'

import { opretNotifikation } from '../utils/notifikationFunktioner.js'

const opgaveSchema = Joi.object({
    opgaveBeskrivelse: Joi.string().min(10).max(2000).required(),
    opgaveBilleder: Joi.array().items(Joi.string()).optional(),
    navn: Joi.string().min(2).max(100).required(),
    adresse: Joi.string().min(5).max(200).required(),
    postnummerOgBy: Joi.string().pattern(/^\d{4}\s[a-zA-ZæøåÆØÅ\s\-]+$/).required(),
    onsketDato: Joi.date().iso().required(),
    telefon: Joi.string().pattern(/^\d{8}$/).required(),
    email: Joi.string().email().required(),
    CVR: Joi.string().max(20).pattern(/^[A-Z0-9]+$/).allow("", null),
    virksomhed: Joi.string().max(100).allow("", null),
    harStige: Joi.boolean().required(),
    recaptchaToken: Joi.string().required(),
    kundeID: Joi.string().required()
})

const bookingSchema = Joi.object({
    opgaveBeskrivelse: Joi.string().min(10).max(2000).required(),
    opgaveBilleder: Joi.array().items(Joi.string().uri()).optional(),
    fornavn: Joi.string().min(2).max(100).required(),
    efternavn: Joi.string().min(2).max(100).required(),
    adresse: Joi.string().min(5).max(200).required(),
    postnummerOgBy: Joi.string().pattern(/^\d{4}\s[a-zA-ZæøåÆØÅ\s\-]+$/).required(),
    onsketDato: Joi.date().iso().required(),
    telefon: Joi.string().pattern(/^\d{8}$/).required(),
    email: Joi.string().email().required(),
    CVR: Joi.string().max(20).pattern(/^[A-Z0-9]+$/).allow("", null),
    virksomhed: Joi.string().max(100).allow("", null),
    harStige: Joi.boolean().required(),
    recaptchaToken: Joi.string().required(),
    engelskKunde: Joi.boolean().optional().default(false),
    måKontaktesMedReklame: Joi.boolean().optional().default(false),
    kommentarer: Joi.string().allow("", null).optional(),
    opfølgendeSpørgsmålSvar: Joi.object().optional(),
    valgtTidspunkt: Joi.object({
        brugerID: Joi.string().optional(),
        start: Joi.date().iso().optional(),
        end: Joi.date().iso().optional()
    }).optional().allow(null)
})

const debounceTimers = {};

const verifyCaptcha = async (token, expectedAction = 'submit') => {
    const secret = process.env.GOOGLE_CAPTCHA_V3_SECRET_KEY
  
    if (!secret) { throw new Error('reCAPTCHA secret mangler i miljøvariablerne') }
    if (!token) { throw new Error('reCAPTCHA token mangler') }
  
    try {
      const response = await axios.post('https://www.google.com/recaptcha/api/siteverify', null,
        { params: { secret, response: token } }
      )
  
      const data = response.data
  
      return {
        success: data.success === true,
        score: data.score || 0,
        action: data.action || expectedAction,
        hostname: data.hostname || null,
        challenge_ts: data.challenge_ts || null
      }
    } catch (error) {
      console.error('Fejl ved verificering af reCAPTCHA:', error.response?.data || error.message)
      throw new Error('Kunne ikke verificere reCAPTCHA')
    }
  }

const getOpgaver = async (req, res) => {
    try {
        const opgaver = await Opgave.find({}).sort({ createdAt: -1 });

        res.status(200).json(opgaver);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getOpgaverPopulateKunder = async (req, res) => {
    try {
        const opgaver = await Opgave.find({}).sort({ createdAt: -1 }).populate('kunde');
        res.status(200).json(opgaver);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const getOpgaverForKunde = async (req, res) => {
    const { id } = req.params;
    try {
        const opgaver = await Opgave.find({ kundeID: id });
        res.status(200).json(opgaver);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}


const getOpgaverForMedarbejder = async (req, res) => {
    const { id } = req.params;
    try {
        const opgaver = await Opgave.find({
            ansvarlig: { $elemMatch: { _id: id } }
        });
        res.status(200).json(opgaver);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

const getOpgave = async (req, res) => {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: 'Ingen opgaver fundet med et matchende ID.' });
    }

    try {
        const opgave = await Opgave.findById(id).populate('kunde');

        if (!opgave) {
            return res.status(404).json({ error: 'Ingen opgaver fundet med et matchende ID.' });
        }

        // Convert fakturaPDF buffer to base64
        const opgaveWithBase64PDF = {
            ...opgave.toObject(),
            fakturaPDF: opgave.fakturaPDF ? opgave.fakturaPDF.toString('base64') : null
        };

        res.status(200).json(opgaveWithBase64PDF);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// CREATE en opgave
const createOpgave = async (req, res) => {
    const counter = await Counter.findOneAndUpdate(
        { name: 'opgaveID' },
        { $inc: { value: 1 } },
        { new: true, upsert: true }
    );

    const {
        _id,
        opgaveBeskrivelse,
        onsketDato,
        status,
        ansvarlig,
        fakturaOprettesManuelt,
        tilbudAfgivet,
        markeretSomFærdig,
        opgaveAfsluttet,
        opgaveBetalt,
        fakturaPDF,
        fakturaPDFUrl,
        isDeleted,
        fastlagtFakturaBeløb,
        opgaveBilleder,
        kundeID
    } = req.body;

    try {
        const data = {
            opgaveBeskrivelse,
            onsketDato,
            status,
            ansvarlig,
            fakturaOprettesManuelt,
            tilbudAfgivet,
            markeretSomFærdig,
            opgaveAfsluttet,
            opgaveBetalt,
            fakturaPDF,
            incrementalID: counter.value,
            fakturaPDFUrl,
            isDeleted,
            fastlagtFakturaBeløb,
            opgaveBilleder,
            kundeID,
            kunde: kundeID
        };

        if (_id) data._id = _id;

        const opgave = await Opgave.create(data);
        const kunde = await Kunde.findById(kundeID);
        await opretNotifikation({ modtagerID: "admin", udløserID: req.user._id, type: "opgaveOprettet", titel: "En ny opgave er blevet oprettet.", besked: `Opgaven skal løses på ${kunde.adresse}, ${kunde.postnummerOgBy}.`, link: `/opgave/${opgave._id}`, erVigtig: true })

        if (ansvarlig.length > 0) {
            for (const person of ansvarlig) {
              await opretNotifikation({
                modtagerID: person._id,
                udløserID: req.user._id,
                type: "opgaveTildelt",
                titel: "Du har fået en ny opgave.",
                besked: `Opgaven skal løses på ${kunde.adresse}, ${kunde.postnummerOgBy}.`,
                link: `/opgave/${opgave._id}`,
                erVigtig: true
              });
            }
          }
          

        res.status(200).json(opgave);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// CREATE en opgave (åben route)
const openCreateOpgave = async (req, res) => {
    
    const { error } = opgaveSchema.validate(req.body)

    if (error) {
        return res.status(400).json({ message: "Ugyldigt input", details: error.details })
    }

    const { opgaveBeskrivelse, navn, CVR, virksomhed, adresse, postnummerOgBy, telefon, email, onsketDato, status, ansvarlig, fakturaOprettesManuelt, tilbudAfgivet, markeretSomFærdig, opgaveAfsluttet, opgaveBetalt, fakturaPDF, fakturaPDFUrl, isDeleted, fastlagtFakturaBeløb, harStige, recaptchaToken, opgaveBilleder, kundeID } = req.body;
    let captchaRes

    try {
        captchaRes = await verifyCaptcha(recaptchaToken)
    } catch (captchaError) {
        console.error('Fejl ved captcha-verifikation (openCreateOpgave):', captchaError)
        return res.status(500).json({ message: 'Fejl ved verificering af captcha', details: captchaError.message })
    }

    if (!captchaRes.success || captchaRes.score < 0.5) {
        return res.status(403).json({ message: "Captcha verificering fejlede. Din captcha-score: " + captchaRes.score + "!" })
    }

    const counter = await Counter.findOneAndUpdate(
        { name: 'opgaveID' },
        { $inc: { value: 1 } },
        { new: true, upsert: true }
    );

    try {
        const opgave = await Opgave.create({opgaveBeskrivelse, navn, CVR, virksomhed, adresse, postnummerOgBy, telefon, email, onsketDato, status, ansvarlig, fakturaOprettesManuelt, tilbudAfgivet, markeretSomFærdig, opgaveAfsluttet, opgaveBetalt, fakturaPDF, incrementalID: counter.value, fakturaPDFUrl, isDeleted, fastlagtFakturaBeløb, isEnglish, harStige, opgaveBilleder})

        await opretNotifikation({ modtagerID: "admin", udløserID: req.user._id, type: "opgaveOprettet", titel: "En ny opgave er blevet oprettet.", besked: `Opgaven skal løses på ${adresse}, ${postnummerOgBy}.`, link: `/opgave/${opgave._id}`, erVigtig: true })
        
        res.status(200).json(opgave)
    } catch (error) {
        res.status(400).json({error: error.message})
    }
}

// CREATE booking (åben route med kunde oprettelse)
const createBooking = async (req, res) => {
    const { error } = bookingSchema.validate(req.body)

    if (error) {
        return res.status(400).json({ message: "Ugyldigt input", details: error.details })
    }

    const { opgaveBeskrivelse, opgaveBilleder, fornavn, efternavn, CVR, virksomhed, adresse, postnummerOgBy, telefon, email, onsketDato, harStige, recaptchaToken, engelskKunde, måKontaktesMedReklame, valgtTidspunkt } = req.body;
    let captchaRes

    try {
        captchaRes = await verifyCaptcha(recaptchaToken)
    } catch (captchaError) {
        console.error('Fejl ved captcha-verifikation (createBooking):', captchaError)
        return res.status(500).json({ message: 'Fejl ved verificering af captcha', details: captchaError.message })
    }

    if (!captchaRes.success || captchaRes.score < 0.5) {
        return res.status(403).json({ message: "Captcha verificering fejlede. Din captcha-score: " + captchaRes.score + "!" })
    }

    try {
        // Check if customer already exists by email
        let kunde = await Kunde.findOne({ email: email });
        
        if (!kunde) {
            // Create new customer
            kunde = await Kunde.create({
                fornavn,
                efternavn,
                virksomhed: virksomhed || "",
                CVR: CVR || "",
                adresse,
                postnummerOgBy,
                telefon,
                email,
                harStige: harStige || false,
                måKontaktesMedReklame: måKontaktesMedReklame || false,
                engelskKunde: engelskKunde || false,
                navn: fornavn + " " + efternavn,
                kilde: "booking"
            });
        } else {
            // Update existing customer with new information if provided
            if (adresse && adresse !== kunde.adresse) {
                kunde.adresse = adresse;
            }
            if (postnummerOgBy && postnummerOgBy !== kunde.postnummerOgBy) {
                kunde.postnummerOgBy = postnummerOgBy;
            }
            if (telefon && telefon !== kunde.telefon) {
                kunde.telefon = telefon;
            }
            await kunde.save();
        }

        // Get incremental ID for opgave
        const counter = await Counter.findOneAndUpdate(
            { name: 'opgaveID' },
            { $inc: { value: 1 } },
            { new: true, upsert: true }
        );

        // Prepare ansvarlig array - add employee if valgtTidspunkt has brugerID
        let ansvarlig = [];
        if (valgtTidspunkt && valgtTidspunkt.brugerID) {
            try {
                const medarbejder = await Bruger.findById(valgtTidspunkt.brugerID);
                if (medarbejder) {
                    // Add employee to ansvarlig array (as object with _id and navn)
                    ansvarlig = [{
                        _id: medarbejder._id,
                        navn: medarbejder.navn
                    }];
                }
            } catch (error) {
                console.error("Error fetching medarbejder for ansvarlig:", error);
                // Continue without adding to ansvarlig if fetch fails
            }
        }

        // Create opgave
        const opgave = await Opgave.create({
            opgaveBeskrivelse,
            opgaveBilleder: opgaveBilleder || [],
            onsketDato,
            status: "Modtaget",
            kundeID: kunde._id.toString(),
            kunde: kunde._id,
            incrementalID: counter.value,
            kilde: "booking",
            ansvarlig: ansvarlig,
            aiCreated: true
        });

        // Send notification to admin (without user ID since this is an open route)
        try {
            await opretNotifikation({ 
                modtagerID: "admin", 
                udløserID: "system", 
                type: "opgaveOprettet", 
                titel: "En ny opgave er blevet oprettet via booking.", 
                besked: `Opgaven skal løses på ${adresse}, ${postnummerOgBy}.`, 
                link: `/opgave/${opgave._id}`, 
                erVigtig: true 
            });
        } catch (notifError) {
            console.error("Error creating notification:", notifError);
            // Don't fail the request if notification fails
        }

        // Send notification to employee if they were added to ansvarlig
        if (ansvarlig.length > 0) {
            try {
                await opretNotifikation({ 
                    modtagerID: ansvarlig[0]._id, 
                    udløserID: "system", 
                    type: "opgaveTildelt", 
                    titel: "Du har fået en ny opgave via booking.", 
                    besked: `Opgaven skal løses på ${adresse}, ${postnummerOgBy}.`, 
                    link: `/opgave/${opgave._id}`, 
                    erVigtig: true 
                });
            } catch (notifError) {
                console.error("Error creating ansvarlig notification:", notifError);
                // Don't fail the request if notification fails
            }
        }

        // Create besøg if valgtTidspunkt exists with brugerID, start, and end
        if (valgtTidspunkt && valgtTidspunkt.brugerID && valgtTidspunkt.start && valgtTidspunkt.end) {
            try {
                const besøg = await Besøg.create({
                    datoTidFra: new Date(valgtTidspunkt.start),
                    datoTidTil: new Date(valgtTidspunkt.end),
                    brugerID: valgtTidspunkt.brugerID,
                    opgaveID: opgave._id,
                    kundeID: kunde._id,
                    aiCreated: true
                });

                // Send notification to employee about the visit
                try {
                    await opretNotifikation({ 
                        modtagerID: valgtTidspunkt.brugerID, 
                        udløserID: "system", 
                        type: "besøgOprettet", 
                        titel: "Du har fået et besøg i kalenderen via booking.", 
                        besked: `Besøget er d. ${dayjs(valgtTidspunkt.start).format("DD. MMMM HH:mm")} - ${dayjs(valgtTidspunkt.end).format("HH:mm")} på ${adresse}, ${postnummerOgBy}.`, 
                        link: `/`, 
                        erVigtig: true 
                    });
                } catch (notifError) {
                    console.error("Error creating besøg notification:", notifError);
                    // Don't fail the request if notification fails
                }
            } catch (besøgError) {
                console.error("Error creating besøg:", besøgError);
                // Don't fail the request if besøg creation fails
            }
        }
        
        res.status(200).json({ 
            success: true,
            opgave: opgave,
            kunde: kunde
        });
    } catch (error) {
        console.error("Error creating booking:", error);
        res.status(400).json({error: error.message});
    }
};

// DELETE en opgave
const deleteOpgave = async (req, res) => {
    const { id } = req.params

    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(400).json({error: 'Ingen opgaver fundet med et matchende ID.'})
    }

    console.log("Systemet forsøgte at slette en opgave med id: ", id)
    console.log(req.body)
    await sendEmail("patrickroeikjaer@gmail.com", `System-forsøg på at slette en opgave blev blokeret.`, `Systemet forsøgte at slette en opgave med id: ${id}.<br /><br />Tjek server-loggen for detaljer.` );

    res.status(200).json({message: "Systemet forsøgte at slette en opgave. Tjek server-loggen."})

    // const opgave = await Opgave.findOneAndDelete({_id: id})

    // if(!opgave) {
    //     return res.status(400).json({error: 'Ingen opgaver fundet med et matchende ID.'})
    // }

    // res.status(200).json(opgave)
}

const updateOpgave = async (req, res) => {
    const { id } = req.params;
    const { fakturaPDF, ...rest } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Ingen opgaver fundet med et matchende ID.' });
    }

    try {
        // Prepare the update data
        const updateData = {
            ...rest
        };

        // If fakturaPDF is provided as base64, convert it to Buffer
        if (fakturaPDF) {
            updateData.fakturaPDF = Buffer.from(fakturaPDF, 'base64');
        }

        // Update the document
        const opgave = await Opgave.findOneAndUpdate(
            { _id: id },
            updateData,
            { new: true }
        );

        if (!opgave) {
            return res.status(400).json({ error: 'Ingen opgaver fundet med et matchende ID.' });
        }

        res.status(200).json(opgave);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const tilfoejAnsvarlig = async (req, res) => {
    const { id } = req.params;
    const { ansvarlig } = req.body;
    const bruger = await Bruger.findById(req.user._id);

    const opgave = await Opgave.findByIdAndUpdate(id, { $push: { ansvarlig: ansvarlig } }, { new: true }).populate('kunde');
    await opretNotifikation({ modtagerID: ansvarlig._id, udløserID: req.user._id, type: "opgaveTildelt", titel: "Du har fået en ny opgave.", besked: `Opgaven skal løses på ${opgave.kunde.adresse}, ${opgave.kunde.postnummerOgBy}.`, link: `/opgave/${opgave._id}` })

    res.status(200).json(opgave);
}

const fjernAnsvarlig = async (req, res) => {
    // opgave-ID
    const { id } = req.params;
    // ansvarlig-objekt
    const { ansvarlig } = req.body;
    const bruger = await Bruger.findById(req.user._id);

    const opgave = await Opgave.findByIdAndUpdate(id, { $pull: { ansvarlig: ansvarlig } }, { new: true }).populate('kunde');
    await opretNotifikation({ modtagerID: ansvarlig._id, udløserID: req.user._id, type: "opgaveFjernet", titel: `${bruger.navn} har fjernet dig fra en opgave.`, besked: `Du er ikke længere ansvarlig for opgaven på ${opgave.kunde.adresse}, ${opgave.kunde.postnummerOgBy}.`, link: `/opgave/${opgave._id}` })

    res.status(200).json(opgave);
}

const opdaterOpgavebeskrivelse = async (req, res) => {
    const { id } = req.params;
    const { opgaveBeskrivelse, ansvarlige } = req.body;
    const bruger = await Bruger.findById(req.user._id);

    const opgave = await Opgave.findByIdAndUpdate(id, { $set: { opgaveBeskrivelse: opgaveBeskrivelse } }, { new: true }).populate('kunde');
    
    if (debounceTimers[id]) clearTimeout(debounceTimers[id]);
    console.log("Starter timer ...")

    // Start en ny timer på 2 minutter
    debounceTimers[id] = setTimeout(async () => {
        for (const ansvarlig of ansvarlige) {
            await opretNotifikation({
                modtagerID: ansvarlig._id, 
                udløserID: req.user._id,
                type: "opgaveBeskrivelseOpdateret",
                titel: `${bruger.navn} har rettet i opgavebeskrivelsen på en opgave, du er ansvarlig for.`,
                besked: `Opgavebeskrivelsen er blevet ændret for opgaven på ${opgave.kunde.adresse}, ${opgave.kunde.postnummerOgBy}.`,
                link: `/opgave/${opgave._id}`
            });
        }

        delete debounceTimers[id]; // ryd op efter afsendelse
    }, 2 * 60 * 1000); // 2 minutter

    res.status(200).json(opgave);
}

const afslutOpgave = async (req, res) => {
    const { id } = req.params;
    const { ansvarlige } = req.body;
    const bruger = await Bruger.findById(req.user._id);

    const opgave = await Opgave.findByIdAndUpdate(id, { $set: { opgaveAfsluttet: new Date() } }, { new: true }).populate('kunde');
    
    for (const ansvarlig of ansvarlige) {
        await opretNotifikation({ modtagerID: ansvarlig._id, udløserID: req.user._id, type: "opgaveAfsluttet", titel: `${bruger.navn} har afsluttet en opgave, du er ansvarlig for.`, besked: `Opgaven på ${opgave.kunde.adresse}, ${opgave.kunde.postnummerOgBy} er blevet afsluttet.`, link: `/opgave/${opgave._id}` })
    }

    await opretNotifikation({ modtagerID: "admin", udløserID: req.user._id, type: "opgaveAfsluttet", titel: `${bruger.navn} har afsluttet en opgave.`, besked: `Opgaven på ${opgave.kunde.adresse}, ${opgave.kunde.postnummerOgBy} er blevet afsluttet.`, link: `/opgave/${opgave._id}` })

    res.status(200).json(opgave);
}

const genåbnOpgave = async (req, res) => {
    const { id } = req.params;
    const { ansvarlige } = req.body;
    const bruger = await Bruger.findById(req.user._id);

    const opgave = await Opgave.findByIdAndUpdate(id, { $set: { opgaveAfsluttet: undefined, markeretSomFærdig: false, isDeleted: undefined } }, { new: true }).populate('kunde');
    
    for (const ansvarlig of ansvarlige) {
        await opretNotifikation({ modtagerID: ansvarlig._id, udløserID: req.user._id, type: "opgaveGenåbnet", titel: `${bruger.navn} har genåbnet en opgave, du er ansvarlig for.`, besked: `En opgave på ${opgave.kunde.adresse}, ${opgave.kunde.postnummerOgBy} er blevet genåbnet.`, link: `/opgave/${opgave._id}` })
    }

    await opretNotifikation({ modtagerID: "admin", udløserID: req.user._id, type: "opgaveGenåbnet", titel: `${bruger.navn} har genåbnet en opgave.`, besked: `En opgave på ${opgave.kunde.adresse}, ${opgave.kunde.postnummerOgBy} er blevet genåbnet.`, link: `/opgave/${opgave._id}` })

    res.status(200).json(opgave);
}

const tilføjBilleder = async (req, res) => {
    const { id } = req.params;
    const { nyeBilleder, ansvarlige } = req.body;
    const bruger = await Bruger.findById(req.user._id);

    const opgave = await Opgave.findByIdAndUpdate(id, { $push: { opgaveBilleder: nyeBilleder } }, { new: true }).populate('kunde');
    
    for (const ansvarlig of ansvarlige) {
        await opretNotifikation({ modtagerID: ansvarlig._id, udløserID: req.user._id, type: "opgaveBillederTilføjet", titel: `${bruger.navn} har tilføjet nye billeder til en opgave, du er ansvarlig for.`, besked: `Billeder tilføjet til opgaven på ${opgave.kunde.adresse}, ${opgave.kunde.postnummerOgBy}.`, link: `/opgave/${opgave._id}` })
    }

    res.status(200).json(opgave);
}

// Fetch opgaver for tab: New
const getOpgaverNew = async (req, res) => {
    try {
        const opgaver = await Opgave.find({
            status: "Modtaget",
            isDeleted: { $exists: false },
            isArchived: { $exists: false },
            opgaveAfsluttet: { $exists: false },
            $or: [
                { ansvarlig: { $size: 0 } },
                { ansvarlig: { $exists: false } }
            ]
        }).sort({ createdAt: -1 }).populate("kunde");
        res.status(200).json(opgaver);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Fetch opgaver for tab: Open
const getOpgaverOpen = async (req, res) => {
    try {
        const opgaver = await Opgave.find({
            status: "Afventer svar",
            isDeleted: { $exists: false },
            isArchived: { $exists: false },
            opgaveAfsluttet: { $exists: false },
            $or: [
                { ansvarlig: { $size: 0 } },
                { ansvarlig: { $exists: false } }
            ]
        }).sort({ createdAt: -1 }).populate("kunde");
        res.status(200).json(opgaver);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Fetch opgaver for tab: Planned
const getOpgaverPlanned = async (req, res) => {
    try {
        const opgaver = await Opgave.find({
            $and: [
                {
                    $or: [
                        { isDeleted: { $exists: false } },
                        { isDeleted: null }
                    ]
                },
                { isArchived: { $exists: false } },
                {
                    $or: [
                        { opgaveAfsluttet: { $exists: false } },
                        { opgaveAfsluttet: null }
                    ]
                },
                { markeretSomFærdig: { $ne: true } },
                { ansvarlig: { $not: { $size: 0 } } }
            ]
        }).sort({ createdAt: -1 }).populate("kunde");
        res.status(200).json(opgaver);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Fetch opgaver for tab: Done (paid, afsluttet, not deleted)
const getOpgaverDone = async (req, res) => {
    try {
        // Paid filter is simplified here. Advanced: also check posteringers.
        const opgaver = await Opgave.find({
            opgaveAfsluttet: { $exists: true, $ne: null },
            isDeleted: { $exists: false },
            isArchived: { $exists: false },
            $or: [
                { fakturaBetalt: { $exists: true, $ne: null, $ne: "" } },
                { opgaveBetaltMedMobilePay: { $exists: true, $ne: null, $ne: "" } },
                { opgaveBetaltPåAndenVis: { $exists: true, $ne: null } }
            ]
        }).sort({ createdAt: -1 }).populate("kunde");
        res.status(200).json(opgaver);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Fetch opgaver for tab: Archived
const getOpgaverArchived = async (req, res) => {
    try {
        const opgaver = await Opgave.find({
            isArchived: { $exists: true, $ne: null }
        }).sort({ isArchived: -1 }).populate("kunde");
        res.status(200).json(opgaver);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Fetch opgaver for tab: Deleted
const getOpgaverDeleted = async (req, res) => {
    try {
        const opgaver = await Opgave.find({
            isDeleted: { $exists: true, $ne: null }
        }).sort({ isDeleted: -1 }).populate("kunde");
        res.status(200).json(opgaver);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Fetch opgaver for personal view: Current (planned tasks where user is ansvarlig)
const getOpgaverPersonalCurrent = async (req, res) => {
    try {
        const userId = String(req.user._id);
        console.log("Fetching personal current tasks for user:", userId);
        
        // Fetch all matching opgaver and filter in memory to handle both ObjectId and string formats
        const allOpgaver = await Opgave.find({
            $and: [
              { $or: [{ isDeleted: null }, { isDeleted: { $exists: false } }] },
              { $or: [{ isArchived: null }, { isArchived: { $exists: false } }] },
              { $or: [{ opgaveAfsluttet: null }, { opgaveAfsluttet: { $exists: false } }] },
              { ansvarlig: { $exists: true, $ne: [] } }
            ]
          }).sort({ createdAt: -1 }).populate("kunde");
          
        
        // Filter to only include opgaver where user is ansvarlig
        const opgaver = allOpgaver.filter(opgave => {
            return opgave.ansvarlig && opgave.ansvarlig.some(ansvarlig => 
                String(ansvarlig._id) === userId
            );
        });
        
        console.log(`Found ${opgaver.length} current tasks for user ${userId} out of ${allOpgaver.length} total`);
        res.status(200).json(opgaver);
    } catch (error) {
        console.error("Error in getOpgaverPersonalCurrent:", error);
        res.status(500).json({ error: error.message });
    }
};

// Fetch opgaver for personal view: Closed (done + unpaid tasks where user is ansvarlig)
const getOpgaverPersonalClosed = async (req, res) => {
    try {
        const userId = String(req.user._id);
        console.log("Fetching personal closed tasks for user:", userId);
        
        // Get all done tasks and filter in memory
        const allDoneOpgaver = await Opgave.find({
            opgaveAfsluttet: { $exists: true, $ne: null },
            isDeleted: { $exists: false },
            isArchived: { $exists: false },
            ansvarlig: { $exists: true, $ne: [] }
        }).populate("kunde");
        
        // Filter to only include opgaver where user is ansvarlig
        const doneOpgaver = allDoneOpgaver.filter(opgave => {
            return opgave.ansvarlig && opgave.ansvarlig.some(ansvarlig => 
                String(ansvarlig._id) === userId
            );
        });
        
        // Get unpaid posteringer and extract unique opgaver where user is ansvarlig
        const unpaidPosteringer = await Postering.find({
            $or: [
                { betalt: { $exists: false } },
                { betalt: null }
            ]
        }).populate({
            path: 'opgave',
            populate: {
                path: 'kunde'
            }
        });
        
        // Filter posteringer where opgave exists and user is ansvarlig
        const unpaidOpgaverMap = new Map();
        unpaidPosteringer.forEach(postering => {
            if (postering.opgave && postering.opgave.ansvarlig) {
                const isUserAnsvarlig = postering.opgave.ansvarlig.some(
                    ansvarlig => String(ansvarlig._id) === String(userId)
                );
                if (isUserAnsvarlig) {
                    const opgaveId = String(postering.opgave._id || postering.opgave.id);
                    if (!unpaidOpgaverMap.has(opgaveId)) {
                        unpaidOpgaverMap.set(opgaveId, postering.opgave);
                    }
                }
            }
        });
        
        // Group unpaid posteringer by opgaveID for easy lookup
        const posteringerByOpgaveId = new Map();
        unpaidPosteringer.forEach(postering => {
          if (postering.opgave && postering.opgave.ansvarlig) {
            const isUserAnsvarlig = postering.opgave.ansvarlig.some(
              ansvarlig => String(ansvarlig._id) === String(userId)
            );
            if (isUserAnsvarlig) {
              const opgaveId = String(postering.opgave._id || postering.opgave.id);
              if (!posteringerByOpgaveId.has(opgaveId)) {
                posteringerByOpgaveId.set(opgaveId, []);
              }
              posteringerByOpgaveId.get(opgaveId).push(postering);
            }
          }
        });
        
        // Combine done and unpaid opgaver, avoiding duplicates
        const allOpgaverMap = new Map();
        doneOpgaver.forEach(opgave => {
          const opgaveId = String(opgave._id);
          // Attach posteringer if they exist
          const posteringer = posteringerByOpgaveId.get(opgaveId);
          if (posteringer) {
            allOpgaverMap.set(opgaveId, {
              ...opgave.toObject ? opgave.toObject() : opgave,
              _posteringer: posteringer
            });
          } else {
            allOpgaverMap.set(opgaveId, opgave.toObject ? opgave.toObject() : opgave);
          }
        });
        unpaidOpgaverMap.forEach((opgave, opgaveId) => {
          if (!allOpgaverMap.has(opgaveId)) {
            // Attach posteringer if they exist
            const posteringer = posteringerByOpgaveId.get(opgaveId);
            if (posteringer) {
              allOpgaverMap.set(opgaveId, {
                ...(opgave.toObject ? opgave.toObject() : opgave),
                _posteringer: posteringer
              });
            } else {
              allOpgaverMap.set(opgaveId, opgave.toObject ? opgave.toObject() : opgave);
            }
          }
        });
        
        const allOpgaver = Array.from(allOpgaverMap.values());
        allOpgaver.sort((a, b) => {
          const aDate = a.opgaveAfsluttet || a.createdAt;
          const bDate = b.opgaveAfsluttet || b.createdAt;
          return new Date(bDate) - new Date(aDate);
        });
        
        console.log(`Found ${allOpgaver.length} closed tasks for user ${userId}`);
        res.status(200).json(allOpgaver);
    } catch (error) {
        console.error("Error in getOpgaverPersonalClosed:", error);
        res.status(500).json({ error: error.message });
    }
};

export {
    getOpgaver,
    getOpgaverPopulateKunder,
    openCreateOpgave,
    createOpgave,
    createBooking,
    getOpgave,
    deleteOpgave,
    updateOpgave,
    getOpgaverForKunde,
    getOpgaverForMedarbejder,
    tilfoejAnsvarlig,
    fjernAnsvarlig,
    opdaterOpgavebeskrivelse,
    afslutOpgave,
    genåbnOpgave,
    tilføjBilleder,
    getOpgaverNew,
    getOpgaverOpen,
    getOpgaverPlanned,
    getOpgaverDone,
    getOpgaverArchived,
    getOpgaverDeleted,
    getOpgaverPersonalCurrent,
    getOpgaverPersonalClosed
}