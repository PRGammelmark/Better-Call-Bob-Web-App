import OpfølgendeSpørgsmål from '../models/opfølgendeSpørgsmålModel.js'
import mongoose from "mongoose"

// GET alle opfølgende spørgsmål
const getOpfølgendeSpørgsmål = async (req, res) => {
    try {
        const spørgsmål = await OpfølgendeSpørgsmål.find({}).sort({ rækkefølge: 1, spørgsmål: 1 });
        res.status(200).json(spørgsmål);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

// GET spørgsmål for specifikke kategorier (til booking systemet)
const getSpørgsmålForKategorier = async (req, res) => {
    const { kategorier } = req.body; // Array af kategorier
    
    try {
        // Normaliser kategorier til lowercase for matching
        const kategorierLower = (kategorier || []).map(k => k.toLowerCase().trim());
        
        // Hent alle spørgsmål (vi filtrerer manuelt for case-insensitive matching)
        const alleSpørgsmål = await OpfølgendeSpørgsmål.find({}).sort({ rækkefølge: 1 });
        
        // Filtrer spørgsmål der enten er standard eller matcher kategorierne (case-insensitive)
        const spørgsmål = alleSpørgsmål.filter(sp => {
            // Hvis det er et standard spørgsmål, inkluder det
            if (sp.erStandard) {
                return true;
            }
            
            // Tjek om nogen af spørgsmålets opgavetyper matcher kategorierne (case-insensitive)
            if (sp.opgavetyper && sp.opgavetyper.length > 0) {
                return sp.opgavetyper.some(opgavetype => {
                    const opgavetypeLower = opgavetype.toLowerCase().trim();
                    return kategorierLower.includes(opgavetypeLower);
                });
            }
            
            return false;
        });
        
        res.status(200).json(spørgsmål);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

// GET en enkelt spørgsmål
const getOpfølgendeSpørgsmålById = async (req, res) => {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: 'Ingen spørgsmål fundet med et matchende ID.' });
    }

    const spørgsmål = await OpfølgendeSpørgsmål.findById(id);

    if (!spørgsmål) {
        return res.status(404).json({ error: 'Ingen spørgsmål fundet med et matchende ID.' });
    }

    res.status(200).json(spørgsmål);
}

// CREATE et nyt spørgsmål
const createOpfølgendeSpørgsmål = async (req, res) => {
    const { spørgsmål, type, opgavetyper, selectOptions, erStandard, rækkefølge, feltNavn } = req.body;
    
    try {
        const nytSpørgsmål = await OpfølgendeSpørgsmål.create({ 
            spørgsmål, 
            type, 
            opgavetyper: opgavetyper || [], 
            selectOptions: selectOptions || [], 
            erStandard: erStandard || false,
            rækkefølge: rækkefølge || 0,
            feltNavn 
        });
        res.status(200).json(nytSpørgsmål);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

// UPDATE et spørgsmål
const updateOpfølgendeSpørgsmål = async (req, res) => {
    const { id } = req.params;
  
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Ugyldigt ID.' });
    }
  
    const spørgsmål = await OpfølgendeSpørgsmål.findOneAndUpdate(
        { _id: id },
        { ...req.body },
        { new: true }
    );
  
    if (!spørgsmål) {
        return res.status(404).json({ error: 'Ingen spørgsmål fundet med det ID.' });
    }
  
    res.status(200).json(spørgsmål);
}

// DELETE et spørgsmål
const deleteOpfølgendeSpørgsmål = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Ingen spørgsmål fundet med et matchende ID.' });
    }

    const spørgsmål = await OpfølgendeSpørgsmål.findOneAndDelete({ _id: id });

    if (!spørgsmål) {
        return res.status(400).json({ error: 'Ingen spørgsmål fundet med et matchende ID.' });
    }

    res.status(200).json(spørgsmål);
}

export {
    getOpfølgendeSpørgsmål,
    getSpørgsmålForKategorier,
    getOpfølgendeSpørgsmålById,
    createOpfølgendeSpørgsmål,
    updateOpfølgendeSpørgsmål,
    deleteOpfølgendeSpørgsmål
}

