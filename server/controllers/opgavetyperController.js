import Opgavetyper from '../models/opgavetyperModel.js'
import Bruger from '../models/brugerModel.js'
import mongoose from "mongoose"
import { importOpgavetyper, getOpgavetyperForKategori } from '../utils/initializeOpgavetyper.js'

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
    const { opgavetype, opgavetypeEn, kategorier, kompleksitet } = req.body;
    try {
        const nyOpgavetype = await Opgavetyper.create({ opgavetype, opgavetypeEn, kategorier, kompleksitet });
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
  
    // Hent den eksisterende opgavetype for at få det gamle navn
    const gammelOpgavetype = await Opgavetyper.findById(id);
    if (!gammelOpgavetype) {
      return res.status(404).json({ error: 'Ingen opgavetype fundet med det ID.' });
    }
    
    const gammeltNavn = gammelOpgavetype.opgavetype;
    const nytNavn = req.body.opgavetype;
  
    const opgavetype = await Opgavetyper.findOneAndUpdate(
      { _id: id },
      { ...req.body },
      { new: true }
    );
  
    if (!opgavetype) {
      return res.status(404).json({ error: 'Ingen opgavetype fundet med det ID.' });
    }
  
    // Find alle medarbejdere, der har denne opgavetype tilknyttet
    const idString = id.toString();
    const medarbejdereMedOpgavetype = await Bruger.find({
      opgavetyper: idString
    });
  
    console.log(`Opdateret opgavetype "${opgavetype.opgavetype}" (ID: ${id})`);
    console.log(`Antal medarbejdere med denne opgavetype: ${medarbejdereMedOpgavetype.length}`);
    if (medarbejdereMedOpgavetype.length > 0) {
      console.log(`Medarbejdere berørt: ${medarbejdereMedOpgavetype.map(m => m.navn).join(', ')}`);
    }
  
    // Hvis navnet er ændret, opdater alle opfølgende spørgsmål der refererer til det gamle navn
    if (nytNavn && gammeltNavn && nytNavn !== gammeltNavn) {
      const OpfølgendeSpørgsmål = (await import('../models/opfølgendeSpørgsmålModel.js')).default;
      
      const resultat = await OpfølgendeSpørgsmål.updateMany(
        { opgavetyper: gammeltNavn },
        { $set: { 'opgavetyper.$': nytNavn } }
      );
      
      // Hvis $set ikke virker (fordi det er et array), brug en anden tilgang
      if (resultat.modifiedCount === 0) {
        // Find alle spørgsmål der indeholder det gamle navn
        const spørgsmålMedGammeltNavn = await OpfølgendeSpørgsmål.find({
          opgavetyper: gammeltNavn
        });
        
        // Opdater hver enkelt
        for (const spørgsmål of spørgsmålMedGammeltNavn) {
          const opdateretArray = spørgsmål.opgavetyper.map(ot => 
            ot === gammeltNavn ? nytNavn : ot
          );
          await OpfølgendeSpørgsmål.findByIdAndUpdate(
            spørgsmål._id,
            { opgavetyper: opdateretArray }
          );
        }
        
        console.log(`Opdateret ${spørgsmålMedGammeltNavn.length} opfølgende spørgsmål fra "${gammeltNavn}" til "${nytNavn}"`);
      } else {
        console.log(`Opdateret ${resultat.modifiedCount} opfølgende spørgsmål fra "${gammeltNavn}" til "${nytNavn}"`);
      }
    }
  
    res.status(200).json(opgavetype);
  };

// GET tilgængelige opgavetyper for en kategori
const getAvailableOpgavetyper = async (req, res) => {
    const { kategori } = req.params;
    
    if (!kategori) {
        return res.status(400).json({ error: 'Kategori er påkrævet' });
    }

    try {
        const opgavetyper = getOpgavetyperForKategori(kategori);
        res.status(200).json(opgavetyper);
    } catch (error) {
        console.error('Fejl ved hentning af opgavetyper:', error);
        res.status(500).json({ error: 'Fejl ved hentning af opgavetyper: ' + error.message });
    }
};

// IMPORT specifikke opgavetyper
const importOpgavetyperHandler = async (req, res) => {
    const { opgavetyper } = req.body;
    
    if (!opgavetyper || !Array.isArray(opgavetyper) || opgavetyper.length === 0) {
        return res.status(400).json({ error: 'Du skal vælge mindst én opgavetype at importere.' });
    }

    try {
        const result = await importOpgavetyper(opgavetyper, Opgavetyper);
        
        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(400).json({ error: result.message });
        }
    } catch (error) {
        console.error('Fejl ved import af opgavetyper:', error);
        res.status(500).json({ error: 'Fejl ved import af opgavetyper: ' + error.message });
    }
};


export {
    getOpgavetyper,
    getOpgavetype,
    createOpgavetype,
    deleteOpgavetype,
    updateOpgavetype,
    importOpgavetyperHandler,
    getAvailableOpgavetyper
}