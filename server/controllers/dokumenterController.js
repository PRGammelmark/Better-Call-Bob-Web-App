import mongoose from "mongoose"
import Dokument from '../models/dokumenterModel.js'
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
// import fs from 'fs';
// import path from 'path';
// import multer from "multer"

// // Ensure the uploads directory exists
// const uploadsDir = path.resolve('dokumenter-uploads');
// if (!fs.existsSync(uploadsDir)) {
//     fs.mkdirSync(uploadsDir, { recursive: true });
// }

// // Set up multer for file uploads with disk storage
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, uploadsDir);
//     },
//     filename: (req, file, cb) => {
//         const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//         cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
//     }
// });

// const upload = multer({ storage: storage });

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
    const { titel, begraensAdgang, brugerAdgang, opgaveID, beskrivelse, kraevSamtykke } = req.body;
    const filSti = `/dokumenter-uploads/${req.file.filename}`;
    try {
        const dokument = await Dokument.create({ titel, begraensAdgang, brugerAdgang, opgaveID, beskrivelse, kraevSamtykke, filSti })
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

    // Delete the file located at filSti property
    
    const filePath = path.resolve('dokumenter-uploads', dokument.filSti.split('/').pop());

    fs.unlink(filePath, (err) => {
        if (err) {
            console.error('Fejl ved sletning af fil:', err);
        }
    });

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