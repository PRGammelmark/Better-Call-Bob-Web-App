import Pause from '../models/pauseModel.js'
import mongoose from "mongoose"

// GET alle pauser
const getPauser = async (req, res) => {
    try {
        const pauser = await Pause.find({}).sort({ rækkefølge: 1, createdAt: -1 })
        res.status(200).json(pauser)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// GET en enkelt pause
const getPauseById = async (req, res) => {
    const { id } = req.params;
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Ingen pause fundet med et matchende ID.'})
    }

    try {
        const pause = await Pause.findById(id)

        if(!pause) {
            return res.status(404).json({error: 'Ingen pause fundet med et matchende ID.'})
        }

        res.status(200).json(pause)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// CREATE en pause
const createPause = async (req, res) => {
    const { navn, beskrivelse, varighed, lønnet, aktiv, rækkefølge } = req.body;
    
    try {
        const nyPause = await Pause.create({ 
            navn,
            beskrivelse, 
            varighed: varighed || 30,
            lønnet: lønnet || false,
            aktiv: aktiv !== undefined ? aktiv : true,
            rækkefølge: rækkefølge || 0
        });
        res.status(200).json(nyPause);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

// DELETE en pause
const deletePause = async (req, res) => {
    const { id } = req.params

    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(400).json({error: 'Ingen pause fundet med et matchende ID.'})
    }

    try {
        const pause = await Pause.findOneAndDelete({_id: id})

        if(!pause) {
            return res.status(400).json({error: 'Ingen pause fundet med et matchende ID.'})
        }

        res.status(200).json(pause)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// OPDATER en pause
const updatePause = async (req, res) => {
    const { id } = req.params;
  
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Ugyldigt ID.' });
    }
  
    try {
        const pause = await Pause.findOneAndUpdate(
            { _id: id },
            { ...req.body },
            { new: true }
        );
  
        if (!pause) {
            return res.status(404).json({ error: 'Ingen pause fundet med det ID.' });
        }
  
        res.status(200).json(pause);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

export {
    getPauser,
    getPauseById,
    createPause,
    deletePause,
    updatePause
}

