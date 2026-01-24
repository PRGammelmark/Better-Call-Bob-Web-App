import Varer from '../models/varerModel.js'
import mongoose from "mongoose"

// GET alle varer
const getVarer = async (req, res) => {
    try {
        const varer = await Varer.find({}).sort({ rækkefølge: 1, createdAt: -1 })
        res.status(200).json(varer)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// GET en enkelt vare
const getVarerById = async (req, res) => {
    const { id } = req.params;
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Ingen vare fundet med et matchende ID.'})
    }

    try {
        const vare = await Varer.findById(id)

        if(!vare) {
            return res.status(404).json({error: 'Ingen vare fundet med et matchende ID.'})
        }

        res.status(200).json(vare)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// CREATE en vare
const createVarer = async (req, res) => {
    const { varenummer, navn, beskrivelse, billedeURL, kostpris, listepris, aktiv, rækkefølge } = req.body;
    
    try {
        const nyVare = await Varer.create({ 
            varenummer, 
            navn,
            beskrivelse, 
            billedeURL, 
            kostpris: kostpris || 0, 
            listepris: listepris || 0,
            aktiv: aktiv !== undefined ? aktiv : true,
            rækkefølge: rækkefølge || 0
        });
        res.status(200).json(nyVare);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

// DELETE en vare
const deleteVarer = async (req, res) => {
    const { id } = req.params

    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(400).json({error: 'Ingen vare fundet med et matchende ID.'})
    }

    try {
        const vare = await Varer.findOneAndDelete({_id: id})

        if(!vare) {
            return res.status(400).json({error: 'Ingen vare fundet med et matchende ID.'})
        }

        res.status(200).json(vare)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// OPDATER en vare
const updateVarer = async (req, res) => {
    const { id } = req.params;
  
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Ugyldigt ID.' });
    }
  
    try {
        const vare = await Varer.findOneAndUpdate(
            { _id: id },
            { ...req.body },
            { new: true }
        );
  
        if (!vare) {
            return res.status(404).json({ error: 'Ingen vare fundet med det ID.' });
        }
  
        res.status(200).json(vare);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

export {
    getVarer,
    getVarerById,
    createVarer,
    deleteVarer,
    updateVarer
}

