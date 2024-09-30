import Besøg from '../models/besøgModel.js'
import mongoose from "mongoose"

// GET alle besøg
const getAlleBesøg = async (req,res) => {
    const besøg = await Besøg.find({}).sort({createdAt: -1})
    res.status(200).json(besøg)
}

// GET alle besøg for en enkelt bruger
const getAlleBesøgForEnBruger = async (req, res) => {
    const { userID } = req.params; // Get brugerID from request params

    try {
        const besøg = await Besøg.find({ brugerID: userID }).sort({ createdAt: -1 });
        if (besøg.length === 0) {
            return res.status(404).json({ error: 'Ingen besøg fundet for denne bruger.' });
        }
        res.status(200).json(besøg);
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
    const { datoTidFra, datoTidTil, brugerID, opgaveID } = req.body;
    try {
        const besøg = await Besøg.create({ datoTidFra, datoTidTil, brugerID, opgaveID })
        res.status(200).json(besøg)
    } catch (error) {
        res.status(400).json({error: error.message})
    }
}

// DELETE et besøg
const deleteBesøg = async (req, res) => {
    const { id } = req.params

    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(400).json({error: 'Ingen besøg fundet med et matchende ID.'})
    }

    const besøg = await Besøg.findOneAndDelete({_id: id})

    if(!besøg) {
        return res.status(400).json({error: 'Ingen besøg fundet med et matchende ID.'})
    }

    res.status(200).json(besøg)
}

// OPDATER et besøg
const updateBesøg = async (req,res) => {
    const { id } = req.params

    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(400).json({error: 'Ingen besøg fundet med et matchende ID.'})
    }

    const besøg = await Besøg.findOneAndUpdate({_id: id}, {
        ...req.body
    })

    if(!besøg) {
        return res.status(400).json({error: 'Ingen opgaver fundet med et matchende ID.'})
    }

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