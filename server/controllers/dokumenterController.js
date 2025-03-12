import mongoose from "mongoose"
import Dokument from '../models/dokumenterModel.js'
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// GET alle dokumenter
const getDokumenter = async (req,res) => {
    const dokumenter = await Dokument.find({}).sort({createdAt: -1})
    res.status(200).json(dokumenter)
}

// GET et enkelt dokument
const getDokument = async (req,res) => {
    const { id } = req.params;
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Intet dokument fundet med et matchende ID.'})
    }

    const dokument = await Dokument.findById(id)

    if(!dokument) {
        return res.status(404).json({error: 'Ingen dokumenter fundet med et matchende ID.'})
    }

    res.status(200).json(dokument)
}

// CREATE et dokument
const createDokument = async (req, res) => {
    const { titel, begraensAdgang, brugerAdgang, opgaveID, beskrivelse, kraevSamtykke, filURL } = req.body;
    try {
        const dokument = await Dokument.create({ titel, begraensAdgang, brugerAdgang, opgaveID, beskrivelse, kraevSamtykke, filURL })
        res.status(200).json(dokument)
    } catch (error) {
        res.status(400).json({error: error.message})
    }
}

// DELETE et dokument
const deleteDokument = async (req, res) => {
    const { id } = req.params

    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(400).json({error: 'Ingen dokumenter fundet med et matchende ID.'})
    }

    const dokument = await Dokument.findOneAndDelete({_id: id})

    if(!dokument) {
        return res.status(400).json({error: 'Ingen dokumenter fundet med et matchende ID.'})
    }

    res.status(200).json(dokument)
}

// OPDATER et dokument
const updateDokument = async (req,res) => {
    const { id } = req.params

    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(400).json({error: 'Ingen dokumenter fundet med et matchende ID.'})
    }

    const dokument = await Dokument.findOneAndUpdate({_id: id}, {
        ...req.body
    })

    if(!dokument) {
        return res.status(400).json({error: 'Ingen dokumenter fundet med et matchende ID.'})
    }

    res.status(200).json(dokument)
}


export {
    getDokumenter,
    createDokument,
    getDokument,
    deleteDokument,
    updateDokument
}