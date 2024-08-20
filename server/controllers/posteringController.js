import Postering from '../models/posteringModel.js'
import mongoose from "mongoose"

// GET alle posteringer
const getPosteringer = async (req,res) => {
    const posteringer = await Postering.find({}).sort({createdAt: -1})
    res.status(200).json(posteringer)
}

// GET en enkelt postering
const getPostering = async (req,res) => {
    const { id } = req.params;
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Ingen posteringer fundet med et matchende ID.'})
    }

    const postering = await Postering.findById(id)

    if(!postering) {
        return res.status(404).json({error: 'Ingen posteringer fundet med et matchende ID.'})
    }

    res.status(200).json(postering)
}

// CREATE en postering
const createPostering = async (req, res) => {
    const { dato, handymanTimer, tømrerTimer, udlæg, øvrigt, opgaveID, brugerID } = req.body;
    try {
        const postering = await Postering.create({ dato, handymanTimer, tømrerTimer, udlæg, øvrigt, opgaveID, brugerID })
        res.status(200).json(postering)
    } catch (error) {
        res.status(400).json({error: error.message})
    }
}

// DELETE en postering
const deletePostering = async (req, res) => {
    const { id } = req.params

    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(400).json({error: 'Ingen posteringer fundet med et matchende ID.'})
    }

    const postering = await Postering.findOneAndDelete({_id: id})

    if(!postering) {
        return res.status(400).json({error: 'Ingen posteringer fundet med et matchende ID.'})
    }

    res.status(200).json(postering)
}

// OPDATER en postering
const updatePostering = async (req,res) => {
    const { id } = req.params

    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(400).json({error: 'Ingen posteringer fundet med et matchende ID.'})
    }

    const postering = await Postering.findOneAndUpdate({_id: id}, {
        ...req.body
    })

    if(!postering) {
        return res.status(400).json({error: 'Ingen posteringer fundet med et matchende ID.'})
    }

    res.status(200).json(postering)
}


export {
    getPosteringer,
    createPostering,
    getPostering,
    deletePostering,
    updatePostering
}