import Timetype from '../models/timetyperModel.js'
import mongoose from "mongoose"

// GET alle timetyper
const getTimetyper = async (req, res) => {
    try {
        const timetyper = await Timetype.find({}).sort({ rækkefølge: 1, nummer: 1 })
        res.status(200).json(timetyper)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// GET en enkelt timetype
const getTimetype = async (req, res) => {
    const { id } = req.params;
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Ingen timetype fundet med et matchende ID.'})
    }

    try {
        const timetype = await Timetype.findById(id)

        if(!timetype) {
            return res.status(404).json({error: 'Ingen timetype fundet med et matchende ID.'})
        }

        res.status(200).json(timetype)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// CREATE en timetype
const createTimetype = async (req, res) => {
    const { navn, nummer, farve, listepris, kostpris, beskrivelse, aktiv, rækkefølge } = req.body;
    
    try {
        // Valider at nummer ikke allerede eksisterer
        const eksisterendeTimetype = await Timetype.findOne({ nummer })
        if (eksisterendeTimetype) {
            return res.status(400).json({ error: 'En timetype med dette nummer eksisterer allerede.' })
        }

        const nyTimetype = await Timetype.create({ 
            navn, 
            nummer, 
            farve, 
            listepris, 
            kostpris, 
            beskrivelse, 
            aktiv, 
            rækkefølge 
        });
        res.status(200).json(nyTimetype);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

// DELETE en timetype
const deleteTimetype = async (req, res) => {
    const { id } = req.params

    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(400).json({error: 'Ingen timetype fundet med et matchende ID.'})
    }

    try {
        const timetype = await Timetype.findOneAndDelete({_id: id})

        if(!timetype) {
            return res.status(400).json({error: 'Ingen timetype fundet med et matchende ID.'})
        }

        res.status(200).json(timetype)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// OPDATER en timetype
const updateTimetype = async (req, res) => {
    const { id } = req.params;
  
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Ugyldigt ID.' });
    }
  
    try {
        // Hvis nummer opdateres, tjek at det ikke allerede eksisterer
        if (req.body.nummer) {
            const eksisterendeTimetype = await Timetype.findOne({ 
                nummer: req.body.nummer,
                _id: { $ne: id }
            })
            if (eksisterendeTimetype) {
                return res.status(400).json({ error: 'En timetype med dette nummer eksisterer allerede.' })
            }
        }

        const timetype = await Timetype.findOneAndUpdate(
            { _id: id },
            { ...req.body },
            { new: true }
        );
  
        if (!timetype) {
            return res.status(404).json({ error: 'Ingen timetype fundet med det ID.' });
        }
  
        res.status(200).json(timetype);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

export {
    getTimetyper,
    getTimetype,
    createTimetype,
    deleteTimetype,
    updateTimetype
}

