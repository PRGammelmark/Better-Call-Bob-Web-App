import Kunde from '../models/kunderModel.js'
import mongoose from "mongoose"
import Counter from '../models/counterModel.js';
import Joi from "joi"
import axios from 'axios'

const kundeSchema = Joi.object({
    fornavn: Joi.string().min(2).max(100).required(),
    efternavn: Joi.string().min(2).max(100).required(),
    virksomhed: Joi.string().max(100).allow("", null),
    CVR: Joi.string().max(20).pattern(/^[A-Z0-9]+$/).allow("", null),
    adresse: Joi.string().min(5).max(200).required(),
    postnummerOgBy: Joi.string().pattern(/^\d{4}\s[a-zA-ZæøåÆØÅ\s\-]+$/).required(),
    telefon: Joi.string().pattern(/^\d{8}$/).required(),
    email: Joi.string().email().required(),
    harStige: Joi.boolean().required(),
    måKontaktesMedReklame: Joi.boolean().required(),
    engelskKunde: Joi.boolean().required(),
    noter: Joi.string().min(10).max(2000).allow("", null)
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

const getKunder = async (req, res) => {
    try {
        const kunder = await Kunde.find({}).sort({ createdAt: -1 });
        res.status(200).json(kunder);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getKunde = async (req, res) => {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: 'Ingen kunder fundet med et matchende ID.' });
    }

    try {
        const kunde = await Kunde.findById(id);

        if (!kunde) {
            return res.status(404).json({ error: 'Ingen kunder fundet med et matchende ID.' });
        }

        res.status(200).json(kunde);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// CREATE en kunde
const createKunde = async (req, res) => {

    const { fornavn, efternavn, virksomhed, CVR, fakturerbarAdresse, adresse, postnummerOgBy, telefon, email, harStige, måKontaktesMedReklame, engelskKunde, noter } = req.body;
    try {
        const kunde = await Kunde.create({fornavn, efternavn, virksomhed, CVR, fakturerbarAdresse, adresse, postnummerOgBy, telefon, email, harStige, måKontaktesMedReklame, engelskKunde, noter, navn: fornavn + " " + efternavn})
        res.status(200).json(kunde)
    } catch (error) {
        res.status(400).json({error: error.message})
    }
}

// CREATE en kunde (åben route)
// const openCreateKunde = async (req, res) => {
    
//     const { error } = kundeSchema.validate(req.body)

//     if (error) {
//         return res.status(400).json({ message: "Ugyldigt input", details: error.details })
//     }

//     const { fornavn, efternavn, virksomhed, CVR, adresse, postnummerOgBy, telefon, email, harStige, måKontaktesMedReklame, engelskKunde, noter } = req.body;
//     const captchaRes = await verifyCaptcha(recaptchaToken)

//     if (!captchaRes.success || captchaRes.score < 0.5) {
//         return res.status(403).json({ message: "Captcha verificering fejlede. Din captcha-score: " + captchaRes.score + "!" })
//     }

//     const counter = await Counter.findOneAndUpdate(
//         { name: 'opgaveID' },
//         { $inc: { value: 1 } },
//         { new: true, upsert: true }
//     );

//     try {
//         const opgave = await Opgave.create({opgaveBeskrivelse, navn, CVR, virksomhed, adresse, postnummerOgBy, telefon, email, onsketDato, status, ansvarlig, fakturaOprettesManuelt, tilbudAfgivet, markeretSomFærdig, opgaveAfsluttet, opgaveBetalt, fakturaPDF, incrementalID: counter.value, fakturaPDFUrl, isDeleted, fastlagtFakturaBeløb, isEnglish, harStige, opgaveBilleder})
//         res.status(200).json(opgave)
//     } catch (error) {
//         res.status(400).json({error: error.message})
//     }
// }

// DELETE en kunde
const deleteKunde = async (req, res) => {
    const { id } = req.params

    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(400).json({error: 'Ingen kunder fundet med et matchende ID.'})
    }

    const kunde = await Kunde.findOneAndDelete({_id: id})

    if(!kunde) {
        return res.status(400).json({error: 'Ingen kunder fundet med et matchende ID.'})
    }

    res.status(200).json(kunde)
}

const updateKunde = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Ingen kunder fundet med et matchende ID.' });
    }

    try {

        // Update the customer
        const kunde = await Kunde.findOneAndUpdate(
            { _id: id },
            req.body
        );

        if (!kunde) {
            return res.status(400).json({ error: 'Ingen kunder fundet med et matchende ID.' });
        }

        res.status(200).json(kunde);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export {
    getKunder,
    getKunde,
    // openCreateOpgave,
    createKunde,
    deleteKunde,
    updateKunde
}