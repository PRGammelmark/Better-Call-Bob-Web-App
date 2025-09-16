import Opgavetyper from '../models/opgavetyperModel.js'
import mongoose from "mongoose"

// GET alle opgavetyper
const getOpgavetyper = async (req,res) => {
    const opgavetyper = await Opgavetyper.find({})
    res.status(200).json(opgavetyper)
}

// GET en enkelt opgavetype
const getOpgavetype = async (req,res) => {
    const { id } = req.params;
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Ingen opgavetyper fundet med et matchende ID.'})
    }

    const opgavetype = await Opgavetyper.findById(id)

    if(!opgavetype) {
        return res.status(404).json({error: 'Ingen opgavetyper fundet med et matchende ID.'})
    }

    res.status(200).json(opgavetype)
}

// CREATE en opgavetype
const createOpgavetype = async (req, res) => {
    const { opgavetype, kategorier, kompleksitet } = req.body;
    try {
        const nyOpgavetype = await Opgavetyper.create({ opgavetype, kategorier, kompleksitet });
        res.status(200).json(nyOpgavetype);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

// DELETE en opgavetype
const deleteOpgavetype = async (req, res) => {
    const { id } = req.params

    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(400).json({error: 'Ingen opgavetyper fundet med et matchende ID.'})
    }

    const opgavetype = await Opgavetyper.findOneAndDelete({_id: id})

    if(!opgavetype) {
        return res.status(400).json({error: 'Ingen opgavetyper fundet med et matchende ID.'})
    }

    res.status(200).json(opgavetype)
}

// OPDATER en opgavetype
const updateOpgavetype = async (req,res) => {
    const { id } = req.params;
  
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Ugyldigt ID.' });
    }
  
    const opgavetype = await Opgavetyper.findOneAndUpdate(
      { _id: id },
      { ...req.body },
      { new: true }
    );
  
    if (!opgavetype) {
      return res.status(404).json({ error: 'Ingen opgavetype fundet med det ID.' });
    }
  
    res.status(200).json(opgavetype);
  };
  


export {
    getOpgavetyper,
    getOpgavetype,
    createOpgavetype,
    deleteOpgavetype,
    updateOpgavetype
}