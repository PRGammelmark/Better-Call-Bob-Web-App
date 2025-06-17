import LedigTid from '../models/ledigeTiderModel.js'
import mongoose from "mongoose"

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

    try {
        // Check if data is an array
        if (Array.isArray(data)) {
            // Handle multiple LedigTid entries
            const createdLedigeTider = await LedigTid.insertMany(data);
            return res.status(200).json(createdLedigeTider);
        } else {
            // Handle a single LedigTid entry
            const { datoTidFra, datoTidTil, brugerID, kommentar, objectIsLedigTid } = data;
            const newLedigTid = await LedigTid.create({ datoTidFra, datoTidTil, brugerID, kommentar, objectIsLedigTid });
            return res.status(200).json(newLedigTid);
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

// DELETE en ledig tid
const deleteLedigTid = async (req, res) => {
    const { id } = req.params

    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(400).json({error: 'Ingen ledige tider fundet med et matchende ID.'})
    }

    const ledigTid = await LedigTid.findOneAndDelete({_id: id})

    if(!ledigTid) {
        return res.status(400).json({error: 'Ingen ledige tider fundet med et matchende ID.'})
    }

    res.status(200).json(ledigTid)
}

// OPDATER en ledig tid
const updateLedigTid = async (req,res) => {
    const { id } = req.params

    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(400).json({error: 'Ingen ledige tider fundet med et matchende ID.'})
    }

    const ledigTid = await LedigTid.findOneAndUpdate({_id: id}, {
        ...req.body
    })

    if(!ledigTid) {
        return res.status(400).json({error: 'Ingen ledige tider fundet med et matchende ID.'})
    }

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