import FasteTillaeg from '../models/fasteTillaegModel.js'
import mongoose from "mongoose"

// GET alle fasteTillaeg
const getFasteTillaeg = async (req, res) => {
    try {
        const fasteTillaeg = await FasteTillaeg.find({}).sort({ rækkefølge: 1, nummer: 1 })
        res.status(200).json(fasteTillaeg)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// GET en enkelt fasteTillaeg
const getFasteTillaegById = async (req, res) => {
    const { id } = req.params;
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Ingen fasteTillaeg fundet med et matchende ID.'})
    }

    try {
        const fasteTillaeg = await FasteTillaeg.findById(id)

        if(!fasteTillaeg) {
            return res.status(404).json({error: 'Ingen fasteTillaeg fundet med et matchende ID.'})
        }

        res.status(200).json(fasteTillaeg)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// CREATE en fasteTillaeg
const createFasteTillaeg = async (req, res) => {
    const { navn, nummer, farve, listepris, kostpris, beskrivelse, aktiv, rækkefølge } = req.body;
    
    try {
        // Valider at nummer ikke allerede eksisterer
        const eksisterendeFasteTillaeg = await FasteTillaeg.findOne({ nummer })
        if (eksisterendeFasteTillaeg) {
            return res.status(400).json({ error: 'En fasteTillaeg med dette nummer eksisterer allerede.' })
        }

        const nyFasteTillaeg = await FasteTillaeg.create({ 
            navn, 
            nummer, 
            farve, 
            listepris, 
            kostpris, 
            beskrivelse, 
            aktiv, 
            rækkefølge 
        });
        res.status(200).json(nyFasteTillaeg);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

// DELETE en fasteTillaeg
const deleteFasteTillaeg = async (req, res) => {
    const { id } = req.params

    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(400).json({error: 'Ingen fasteTillaeg fundet med et matchende ID.'})
    }

    try {
        const fasteTillaeg = await FasteTillaeg.findOneAndDelete({_id: id})

        if(!fasteTillaeg) {
            return res.status(400).json({error: 'Ingen fasteTillaeg fundet med et matchende ID.'})
        }

        res.status(200).json(fasteTillaeg)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// OPDATER en fasteTillaeg
const updateFasteTillaeg = async (req, res) => {
    const { id } = req.params;
  
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Ugyldigt ID.' });
    }
  
    try {
        // Hvis nummer opdateres, tjek at det ikke allerede eksisterer
        if (req.body.nummer) {
            const eksisterendeFasteTillaeg = await FasteTillaeg.findOne({ 
                nummer: req.body.nummer,
                _id: { $ne: id }
            })
            if (eksisterendeFasteTillaeg) {
                return res.status(400).json({ error: 'En fasteTillaeg med dette nummer eksisterer allerede.' })
            }
        }

        const fasteTillaeg = await FasteTillaeg.findOneAndUpdate(
            { _id: id },
            { ...req.body },
            { new: true }
        );
  
        if (!fasteTillaeg) {
            return res.status(404).json({ error: 'Ingen fasteTillaeg fundet med det ID.' });
        }
  
        res.status(200).json(fasteTillaeg);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

export {
    getFasteTillaeg,
    getFasteTillaegById,
    createFasteTillaeg,
    deleteFasteTillaeg,
    updateFasteTillaeg
}

