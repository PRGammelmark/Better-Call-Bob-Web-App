import Kommentar from '../models/kommentarModel.js'
import mongoose from "mongoose"

// GET alle kommentarer
const getKommentarer = async (req,res) => {
    const kommentarer = await Kommentar.find({}).sort({createdAt: -1})
    res.status(200).json(kommentarer)
}

// GET en enkelt kommentar
const getKommentar = async (req,res) => {
    const { id } = req.params;
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Ingen kommentarer fundet med et matchende ID.'})
    }

    const kommentar = await Kommentar.findById(id)

    if(!kommentar) {
        return res.status(404).json({error: 'Ingen kommentarer fundet med et matchende ID.'})
    }

    res.status(200).json(kommentar)
}

// CREATE en kommentar
const createKommentar = async (req, res) => {
    const { kommentarIndhold, brugerID, opgaveID } = req.body;
    try {
        const kommentar = await Kommentar.create({kommentarIndhold, brugerID, opgaveID})
        res.status(200).json(kommentar)
    } catch (error) {
        res.status(400).json({error: error.message})
    }
}

// DELETE en kommentar
const deleteKommentar = async (req, res) => {
    const { id } = req.params

    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(400).json({error: 'Ingen kommentarer fundet med et matchende ID.'})
    }

    const kommentar = await Kommentar.findOneAndDelete({_id: id})

    if(!kommentar) {
        return res.status(400).json({error: 'Ingen kommentarer fundet med et matchende ID.'})
    }

    res.status(200).json(kommentar)
}

// OPDATER en kommentar
const updateKommentar = async (req,res) => {
    const { id } = req.params

    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(400).json({error: 'Ingen kommentarer fundet med et matchende ID.'})
    }

    const kommentar = await Kommentar.findOneAndUpdate({_id: id}, {
        ...req.body
    })

    if(!kommentar) {
        return res.status(400).json({error: 'Ingen kommentarer fundet med et matchende ID.'})
    }

    res.status(200).json(kommentar)
}


export {
    getKommentarer,
    createKommentar,
    getKommentar,
    deleteKommentar,
    updateKommentar
}