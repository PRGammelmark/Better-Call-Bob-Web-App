import LedigTid from '../models/ledigeTiderModel.js'
import mongoose from "mongoose"
import { opretNotifikation } from "../utils/notifikationFunktioner.js"
import Bruger from '../models/brugerModel.js'
import dayjs from 'dayjs'

// GET alle ledige tider
const getLedigeTider = async (req,res) => {
    const ledigeTider = await LedigTid.find({}).sort({createdAt: -1})
    res.status(200).json(ledigeTider)
}

// GET alle ledige tider for en medarbejder
const getLedigeTiderForMedarbejder = async (req, res) => {
    const { id } = req.params;
    const ledigeTider = await LedigTid.find({ brugerID: id });
    res.status(200).json(ledigeTider);
}

// GET en enkelt ledig tid
const getLedigTid = async (req,res) => {
    const { id } = req.params;
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Ingen ledige tider fundet med et matchende ID.'})
    }

    const ledigTid = await LedigTid.findById(id)

    if(!ledigTid) {
        return res.status(404).json({error: 'Ingen ledige tider fundet med et matchende ID.'})
    }

    res.status(200).json(ledigTid)
}

// CREATE en ledig tid
const createLedigTid = async (req, res) => {
    const data = req.body;
    const bruger = await Bruger.findById(req.user._id);

    try {
        // Check if data is an array
        if (Array.isArray(data)) {
            // Handle multiple LedigTid entries
            const createdLedigeTider = await LedigTid.insertMany(data);
            await opretNotifikation({ modtagerID: data.brugerID, udløserID: req.user._id, type: "ledigTidOprettet", titel: `${bruger.navn} har registreret dig som ledig på flere datoer, bl.a. ${dayjs(data[0].datoTidFra).format("DD. MMMM HH:mm")} - ${dayjs(data[0].datoTidTil).format("HH:mm")}.`, besked: `Se din kalender for at få et overblik.`, link: `/` })
            return res.status(200).json(createdLedigeTider);
        } else {
            // Handle a single LedigTid entry
            const { datoTidFra, datoTidTil, brugerID, kommentar, objectIsLedigTid } = data;
            const newLedigTid = await LedigTid.create({ datoTidFra, datoTidTil, brugerID, kommentar, objectIsLedigTid });
            await opretNotifikation({ modtagerID: data.brugerID, udløserID: req.user._id, type: "ledigTidOprettet", titel: `${bruger.navn} har registreret dig som ledig fra ${dayjs(datoTidFra).format("DD. MMMM HH:mm")} - ${dayjs(datoTidTil).format("HH:mm")}.`, besked: `Se din kalender for at få et overblik.`, link: `/` })
            return res.status(200).json(newLedigTid);
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

// DELETE en ledig tid
const deleteLedigTid = async (req, res) => {
    const { id } = req.params
    const bruger = await Bruger.findById(req.user._id);

    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(400).json({error: 'Ingen ledige tider fundet med et matchende ID.'})
    }

    const ledigTid = await LedigTid.findOneAndDelete({_id: id})

    if(!ledigTid) {
        return res.status(400).json({error: 'Ingen ledige tider fundet med et matchende ID.'})
    }

    await opretNotifikation({ modtagerID: ledigTid.brugerID, udløserID: req.user._id, type: "ledigTidFjernet", titel: `${bruger.navn} har fjernet din ledighed fra ${dayjs(ledigTid.datoTidFra).format("DD. MMMM HH:mm")} - ${dayjs(ledigTid.datoTidTil).format("HH:mm")}.`, besked: `Se din kalender for at få et overblik.`, link: `/` })

    res.status(200).json(ledigTid)
}

// OPDATER en ledig tid
const updateLedigTid = async (req,res) => {
    const { id } = req.params
    const bruger = await Bruger.findById(req.user._id);
    
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(400).json({error: 'Ingen ledige tider fundet med et matchende ID.'})
    }

    const ledigTid = await LedigTid.findOneAndUpdate({_id: id}, {
        ...req.body
    })

    if(!ledigTid) {
        return res.status(400).json({error: 'Ingen ledige tider fundet med et matchende ID.'})
    }

    const notifikation = await opretNotifikation({ modtagerID: ledigTid.brugerID, udløserID: req.user._id, type: "ledigTidOpdateret", titel: `${bruger.navn} har opdateret din ledighed fra ${dayjs(ledigTid.datoTidFra).format("DD. MMMM HH:mm")} - ${dayjs(ledigTid.datoTidTil).format("HH:mm")} til ${dayjs(req.body.datoTidFra).format("DD. MMMM HH:mm")} - ${dayjs(req.body.datoTidTil).format("HH:mm")}.`, besked: `Se din kalender for at få et overblik.`, link: `/` })
    console.log(notifikation)
    res.status(200).json(ledigTid)
    
}


export {
    getLedigeTider,
    createLedigTid,
    getLedigTid,
    deleteLedigTid,
    updateLedigTid,
    getLedigeTiderForMedarbejder
}