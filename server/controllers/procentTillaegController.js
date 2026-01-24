import ProcentTillaeg from '../models/procentTillaegModel.js'
import mongoose from "mongoose"

// GET alle procentTillaeg
const getProcentTillaeg = async (req, res) => {
    try {
        const procentTillaeg = await ProcentTillaeg.find({}).sort({ rækkefølge: 1, nummer: 1 })
        res.status(200).json(procentTillaeg)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// GET en enkelt procentTillaeg
const getProcentTillaegById = async (req, res) => {
    const { id } = req.params;
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Ingen procentTillaeg fundet med et matchende ID.'})
    }

    try {
        const procentTillaeg = await ProcentTillaeg.findById(id)

        if(!procentTillaeg) {
            return res.status(404).json({error: 'Ingen procentTillaeg fundet med et matchende ID.'})
        }

        res.status(200).json(procentTillaeg)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// CREATE en procentTillaeg
const createProcentTillaeg = async (req, res) => {
    const { navn, nummer, farve, listeSats, kostSats, beskrivelse, aktiv, rækkefølge } = req.body;
    
    try {
        // Valider at nummer ikke allerede eksisterer
        const eksisterendeProcentTillaeg = await ProcentTillaeg.findOne({ nummer })
        if (eksisterendeProcentTillaeg) {
            return res.status(400).json({ error: 'En procentTillaeg med dette nummer eksisterer allerede.' })
        }

        const nyProcentTillaeg = await ProcentTillaeg.create({ 
            navn, 
            nummer, 
            farve, 
            listeSats, 
            kostSats, 
            beskrivelse, 
            aktiv, 
            rækkefølge 
        });
        res.status(200).json(nyProcentTillaeg);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

// DELETE en procentTillaeg
const deleteProcentTillaeg = async (req, res) => {
    const { id } = req.params

    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(400).json({error: 'Ingen procentTillaeg fundet med et matchende ID.'})
    }

    try {
        const procentTillaeg = await ProcentTillaeg.findOneAndDelete({_id: id})

        if(!procentTillaeg) {
            return res.status(400).json({error: 'Ingen procentTillaeg fundet med et matchende ID.'})
        }

        res.status(200).json(procentTillaeg)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// OPDATER en procentTillaeg
const updateProcentTillaeg = async (req, res) => {
    const { id } = req.params;
  
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Ugyldigt ID.' });
    }
  
    try {
        // Hvis nummer opdateres, tjek at det ikke allerede eksisterer
        if (req.body.nummer) {
            const eksisterendeProcentTillaeg = await ProcentTillaeg.findOne({ 
                nummer: req.body.nummer,
                _id: { $ne: id }
            })
            if (eksisterendeProcentTillaeg) {
                return res.status(400).json({ error: 'En procentTillaeg med dette nummer eksisterer allerede.' })
            }
        }

        const procentTillaeg = await ProcentTillaeg.findOneAndUpdate(
            { _id: id },
            { ...req.body },
            { new: true }
        );
  
        if (!procentTillaeg) {
            return res.status(404).json({ error: 'Ingen procentTillaeg fundet med det ID.' });
        }
  
        res.status(200).json(procentTillaeg);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

export {
    getProcentTillaeg,
    getProcentTillaegById,
    createProcentTillaeg,
    deleteProcentTillaeg,
    updateProcentTillaeg
}

