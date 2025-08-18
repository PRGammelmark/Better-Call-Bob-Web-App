import Postering from '../models/posteringModel.js'
import mongoose from "mongoose"

// GET alle posteringer
const getPosteringer = async (req,res) => {
    const posteringer = await Postering.find({}).sort({createdAt: -1}).populate('kunde').populate('bruger').populate('opgave')
    res.status(200).json(posteringer)
}

// GET en enkelt postering
const getPostering = async (req,res) => {
    const { id } = req.params;
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Ingen posteringer fundet med et matchende ID.'})
    }

    const postering = await Postering.findById(id).populate('kunde').populate('bruger').populate('opgave')

    if(!postering) {
        return res.status(404).json({error: 'Ingen posteringer fundet med et matchende ID.'})
    }

    res.status(200).json(postering)
}

// GET alle posteringer for en bruger
const getPosteringerForBruger = async (req,res) => {
    const { userID } = req.params;
    const posteringer = await Postering.find({ brugerID: userID }).sort({createdAt: -1}).populate('kunde').populate('bruger').populate('opgave')
    res.status(200).json(posteringer)
}

// GET alle posteringer for en opgave
const getPosteringerForOpgave = async (req,res) => {
    const { opgaveID } = req.params;
    const posteringer = await Postering.find({ opgaveID: opgaveID }).sort({createdAt: -1}).populate('kunde').populate('bruger').populate('opgave')
    res.status(200).json(posteringer)
}

// CREATE en postering
const createPostering = async (req, res) => {
    const { dato, beskrivelse, opstart, handymanTimer, tømrerTimer, udlæg, aftenTillæg, natTillæg, trailer, rådgivningOpmålingVejledning, satser, rabatProcent, dynamiskHonorarBeregning, dynamiskPrisBeregning, fastHonorar, fastPris, dynamiskHonorar, dynamiskPris, totalHonorar, totalPris, opgaveID, brugerID, kundeID, kunde, opgave, bruger } = req.body;
    try {
        const postering = await Postering.create({ dato, beskrivelse, opstart, handymanTimer, tømrerTimer, udlæg, aftenTillæg, natTillæg, trailer, rådgivningOpmålingVejledning, satser, rabatProcent, dynamiskHonorarBeregning, dynamiskPrisBeregning, fastHonorar, fastPris, dynamiskHonorar, dynamiskPris, totalHonorar, totalPris, opgaveID, brugerID, kundeID, kunde, opgave, bruger })
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
    updatePostering,
    getPosteringerForBruger
}