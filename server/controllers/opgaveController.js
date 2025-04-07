import Opgave from '../models/opgaveModel.js'
import mongoose from "mongoose"
import Counter from '../models/counterModel.js';
import Joi from "joi"
import axios from 'axios'

const opgaveSchema = Joi.object({
    opgaveBeskrivelse: Joi.string().min(10).max(2000).required(),
    navn: Joi.string().min(2).max(100).required(),
    adresse: Joi.string().min(5).max(200).required(),
    postnummerOgBy: Joi.string().pattern(/^\d{4}\s[a-zA-ZæøåÆØÅ\s\-]+$/).required(),
    onsketDato: Joi.date().iso().required(),
    telefon: Joi.string().pattern(/^\d{8}$/).required(),
    email: Joi.string().email().required(),
    CVR: Joi.string().length(8).pattern(/^\d+$/).allow("", null),
    virksomhed: Joi.string().max(100).allow("", null),
    recaptchaToken: Joi.string().required()
})

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

        // Convert fakturaPDF buffer to base64 for each opgave
        const opgaverWithBase64PDF = opgaver.map(opgave => ({
            ...opgave.toObject(),
            fakturaPDF: opgave.fakturaPDF ? opgave.fakturaPDF.toString('base64') : null
        }));

        res.status(200).json(opgaverWithBase64PDF);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getOpgave = async (req, res) => {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: 'Ingen opgaver fundet med et matchende ID.' });
    }

    try {
        const opgave = await Opgave.findById(id);

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

    const { opgaveBeskrivelse, navn, CVR, virksomhed, adresse, postnummerOgBy, telefon, email, onsketDato, status, ansvarlig, fakturaOprettesManuelt, tilbudAfgivet, markeretSomFærdig, opgaveAfsluttet, opgaveBetalt, fakturaPDF, fakturaPDFUrl, isDeleted, fastlagtFakturaBeløb, isEnglish, harStige } = req.body;
    try {
        const opgave = await Opgave.create({opgaveBeskrivelse, navn, CVR, virksomhed, adresse, postnummerOgBy, telefon, email, onsketDato, status, ansvarlig, fakturaOprettesManuelt, tilbudAfgivet, markeretSomFærdig, opgaveAfsluttet, opgaveBetalt, fakturaPDF, incrementalID: counter.value, fakturaPDFUrl, isDeleted, fastlagtFakturaBeløb, isEnglish, harStige})
        res.status(200).json(opgave)
    } catch (error) {
        res.status(400).json({error: error.message})
    }
}

// CREATE en opgave (åben route)
const openCreateOpgave = async (req, res) => {
    
    const { error } = opgaveSchema.validate(req.body)

    if (error) {
        return res.status(400).json({ message: "Ugyldigt input", details: error.details })
    }

    const { opgaveBeskrivelse, navn, CVR, virksomhed, adresse, postnummerOgBy, telefon, email, onsketDato, status, ansvarlig, fakturaOprettesManuelt, tilbudAfgivet, markeretSomFærdig, opgaveAfsluttet, opgaveBetalt, fakturaPDF, fakturaPDFUrl, isDeleted, fastlagtFakturaBeløb, isEnglish, harStige, recaptchaToken } = req.body;
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
        const opgave = await Opgave.create({opgaveBeskrivelse, navn, CVR, virksomhed, adresse, postnummerOgBy, telefon, email, onsketDato, status, ansvarlig, fakturaOprettesManuelt, tilbudAfgivet, markeretSomFærdig, opgaveAfsluttet, opgaveBetalt, fakturaPDF, incrementalID: counter.value, fakturaPDFUrl, isDeleted, fastlagtFakturaBeløb, isEnglish, harStige})
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

    const opgave = await Opgave.findOneAndDelete({_id: id})

    if(!opgave) {
        return res.status(400).json({error: 'Ingen opgaver fundet med et matchende ID.'})
    }

    res.status(200).json(opgave)
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

export {
    getOpgaver,
    openCreateOpgave,
    createOpgave,
    getOpgave,
    deleteOpgave,
    updateOpgave
}