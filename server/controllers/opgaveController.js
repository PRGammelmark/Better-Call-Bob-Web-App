import Opgave from '../models/opgaveModel.js'
import mongoose from "mongoose"

// GET alle opgaver
const getOpgaver = async (req,res) => {
    const opgaver = await Opgave.find({}).sort({createdAt: -1})
    res.status(200).json(opgaver)
}

// GET en enkelt opgave
const getOpgave = async (req,res) => {
    const { id } = req.params;
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Ingen opgaver fundet med et matchende ID.'})
    }

    const opgave = await Opgave.findById(id)

    if(!opgave) {
        return res.status(404).json({error: 'Ingen opgaver fundet med et matchende ID.'})
    }

    res.status(200).json(opgave)
}

// CREATE en opgave
const createOpgave = async (req, res) => {
    const { opgaveBeskrivelse, navn, adresse, telefon, email, onsketDato, status, fremskridt, markeretSomFærdig } = req.body;
    try {
        const opgave = await Opgave.create({opgaveBeskrivelse, navn, adresse, telefon, email, onsketDato, status, fremskridt, markeretSomFærdig})
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

// OPDATER en opgave
const updateOpgave = async (req,res) => {
    const { id } = req.params

    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(400).json({error: 'Ingen opgaver fundet med et matchende ID.'})
    }

    const opgave = await Opgave.findOneAndUpdate({_id: id}, {
        ...req.body
    })

    if(!opgave) {
        return res.status(400).json({error: 'Ingen opgaver fundet med et matchende ID.'})
    }

    res.status(200).json(opgave)
}


export {
    getOpgaver,
    createOpgave,
    getOpgave,
    deleteOpgave,
    updateOpgave
}