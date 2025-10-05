import Besøg from '../models/besøgModel.js'
import Kunde from '../models/kunderModel.js'
import Bruger from '../models/brugerModel.js'
import dayjs from 'dayjs'
import Opgave from '../models/opgaveModel.js'
import mongoose from "mongoose"
import { opretNotifikation } from "../utils/notifikationFunktioner.js"

// GET alle besøg
const getAlleBesøg = async (req,res) => {
    const besøg = await Besøg.find({}).sort({createdAt: -1})
    res.status(200).json(besøg)
}

// GET alle besøg for en enkelt bruger
const getAlleBesøgForEnBruger = async (req, res) => {
    const { userID } = req.params;

    try {
        const besøg = await Besøg.find({ brugerID: userID }).sort({ createdAt: -1 });
        res.status(200).json(besøg); // returner altid liste (kan være tom)
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// GET et enkelt besøg
const getEtBesøg = async (req,res) => {
    const { id } = req.params;
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Ingen besøg fundet med et matchende ID.'})
    }

    const besøg = await Besøg.findById(id)

    if(!besøg) {
        return res.status(404).json({error: 'Ingen besøg fundet med et matchende ID.'})
    }

    res.status(200).json(besøg)
}

// CREATE et besøg
const createBesøg = async (req, res) => {
    const { datoTidFra, datoTidTil, brugerID, opgaveID, kundeID, kommentar, eventColor } = req.body;
    const bruger = await Bruger.findById(req.user._id);
    const kunde = await Kunde.findById(kundeID);

    try {
        const besøg = await Besøg.create({ datoTidFra, datoTidTil, brugerID, opgaveID, kundeID, kommentar, eventColor })
        await opretNotifikation({ modtagerID: brugerID, udløserID: req.user._id, type: "besøgOprettet", titel: `Du har fået et besøg i kalenderen (reg. af ${bruger.navn}) d. ${dayjs(datoTidFra).format("DD. MMMM HH:mm")} - ${dayjs(datoTidTil).format("HH:mm")} på ${kunde.adresse}, ${kunde.postnummerOgBy}.`, besked: `Se din kalender for at få et overblik.`, link: `/` })
        res.status(200).json(besøg)
    } catch (error) {
        res.status(400).json({error: error.message})
    }
}

// DELETE et besøg
const deleteBesøg = async (req, res) => {
    const { id } = req.params
    const bruger = await Bruger.findById(req.user._id);
    
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(400).json({error: 'Ingen besøg fundet med et matchende ID.'})
    }

    const besøg = await Besøg.findOneAndDelete({_id: id})

    if(!besøg) {
        return res.status(400).json({error: 'Ingen besøg fundet med et matchende ID.'})
    }

    const kunde = await Kunde.findById(besøg.kundeID);
    await opretNotifikation({ modtagerID: besøg.brugerID, udløserID: req.user._id, type: "besøgFjernet", titel: `${bruger.navn} har fjernet dit besøg på ${kunde.adresse}, ${kunde.postnummerOgBy} d. ${dayjs(besøg.datoTidFra).format("DD. MMMM HH:mm")} - ${dayjs(besøg.datoTidTil).format("HH:mm")}.`, besked: `Se din kalender for at få et overblik.`, link: `/` })

    res.status(200).json(besøg)
}

// OPDATER et besøg
const updateBesøg = async (req,res) => {
    const { id } = req.params
    const bruger = await Bruger.findById(req.user._id);

    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(400).json({error: 'Ingen besøg fundet med et matchende ID.'})
    }

    const besøg = await Besøg.findOneAndUpdate({_id: id}, {
        ...req.body
    })

    if(!besøg) {
        return res.status(400).json({error: 'Ingen besøg fundet med et matchende ID.'})
    }

    const kunde = await Kunde.findById(besøg.kundeID);
    await opretNotifikation({ modtagerID: besøg.brugerID, udløserID: req.user._id, type: "besøgOpdateret", titel: `${bruger.navn} har ændret dit besøg på ${kunde.adresse}, ${kunde.postnummerOgBy} fra ${dayjs(besøg.datoTidFra).format("DD. MMMM HH:mm")} - ${dayjs(besøg.datoTidTil).format("HH:mm")} til ${dayjs(req.body.datoTidFra).format("DD. MMMM HH:mm")} - ${dayjs(req.body.datoTidTil).format("HH:mm")}.`, besked: `Se din kalender for at få et overblik.`, link: `/` })

    res.status(200).json(besøg)
}

export {
    getAlleBesøg,
    getAlleBesøgForEnBruger,
    createBesøg,
    getEtBesøg,
    deleteBesøg,
    updateBesøg
}