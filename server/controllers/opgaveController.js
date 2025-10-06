import Opgave from '../models/opgaveModel.js'
import Bruger from '../models/brugerModel.js'
import mongoose from "mongoose"
import Counter from '../models/counterModel.js';
import Joi from "joi"
import axios from 'axios'

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
    CVR: Joi.string().length(8).pattern(/^\d+$/).allow("", null),
    virksomhed: Joi.string().max(100).allow("", null),
    harStige: Joi.boolean().required(),
    recaptchaToken: Joi.string().required(),
    kundeID: Joi.string().required()
})

const debounceTimers = {};

const verifyCaptcha = async (token) => {
    const secret = process.env.GOOGLE_CAPTCHA_V3_SECRET_KEY
    const response = await axios.post(`https://www.google.com/recaptcha/api/siteverify`, null, {
      params: {
        secret,
        response: token
      }
    })
    return response.data
}

const getOpgaver = async (req, res) => {
    try {
        const opgaver = await Opgave.find({}).sort({ createdAt: -1 });

        // // Convert fakturaPDF buffer to base64 for each opgave
        // const opgaverWithBase64PDF = opgaver.map(opgave => ({
        //     ...opgave.toObject(),
        //     fakturaPDF: opgave.fakturaPDF ? opgave.fakturaPDF.toString('base64') : null
        // }));

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
        await opretNotifikation({ modtagerID: "admin", udløserID: req.user._id, type: "opgaveOprettet", titel: "En ny opgave er blevet oprettet.", besked: `Opgaven skal løses på ${opgave.kunde.adresse}, ${opgave.kunde.postnummerOgBy}.`, link: `/opgave/${opgave._id}` })

        if (ansvarlig.length > 0) {
            for (const person of ansvarlig) {
              await opretNotifikation({
                modtagerID: person._id,
                udløserID: req.user._id,
                type: "opgaveTildelt",
                titel: "Du har fået en ny opgave.",
                besked: `Opgaven skal løses på ${opgave.kunde.adresse}, ${opgave.kunde.postnummerOgBy}.`,
                link: `/opgave/${opgave._id}`
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
    const captchaRes = await verifyCaptcha(recaptchaToken)

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

        await opretNotifikation({ modtagerID: "admin", udløserID: req.user._id, type: "opgaveOprettet", titel: "En ny opgave er blevet oprettet.", besked: `Opgaven skal løses på ${opgave.kunde.adresse}, ${opgave.kunde.postnummerOgBy}.`, link: `/opgave/${opgave._id}` })
        
        res.status(200).json(opgave)
    } catch (error) {
        res.status(400).json({error: error.message})
    }
}

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

export {
    getOpgaver,
    getOpgaverPopulateKunder,
    openCreateOpgave,
    createOpgave,
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
    tilføjBilleder
}