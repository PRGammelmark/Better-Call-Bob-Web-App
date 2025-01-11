import Opgave from '../models/opgaveModel.js'
import mongoose from "mongoose"
import Counter from '../models/counterModel.js';

const getOpgaver = async (req, res) => {
    try {
        const opgaver = await Opgave.find({}).sort({ createdAt: -1 });

        // Convert fakturaPDF buffer to base64 for each opgave
        const opgaverWithBase64PDF = opgaver.map(opgave => ({
            ...opgave.toObject(),
            fakturaPDF: opgave.fakturaPDF ? opgave.fakturaPDF.toString('base64') : null
        }));

        res.status(200).json(opgaverWithBase64PDF);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getOpgave = async (req, res) => {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: 'Ingen opgaver fundet med et matchende ID.' });
    }

    try {
        const opgave = await Opgave.findById(id);

        if (!opgave) {
            return res.status(404).json({ error: 'Ingen opgaver fundet med et matchende ID.' });
        }

        // Convert fakturaPDF buffer to base64
        const opgaveWithBase64PDF = {
            ...opgave.toObject(),
            fakturaPDF: opgave.fakturaPDF ? opgave.fakturaPDF.toString('base64') : null
        };

        res.status(200).json(opgaveWithBase64PDF);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// CREATE en opgave
const createOpgave = async (req, res) => {

    const counter = await Counter.findOneAndUpdate(
        { name: 'opgaveID' },
        { $inc: { value: 1 } },
        { new: true, upsert: true }
    );

    const { opgaveBeskrivelse, navn, CVR, virksomhed, adresse, postnummerOgBy, telefon, email, onsketDato, status, fakturaOprettesManuelt, tilbudAfgivet, markeretSomFærdig, opgaveAfsluttet, opgaveBetalt, fakturaPDF, fakturaPDFUrl, isDeleted, posteringer } = req.body;
    try {
        const opgave = await Opgave.create({opgaveBeskrivelse, navn, CVR, virksomhed, adresse, postnummerOgBy, telefon, email, onsketDato, status, fakturaOprettesManuelt, tilbudAfgivet, markeretSomFærdig, opgaveAfsluttet, opgaveBetalt, fakturaPDF, incrementalID: counter.value, fakturaPDFUrl, isDeleted, posteringer: []})
        res.status(200).json(opgave)
    } catch (error) {
        res.status(400).json({error: error.message})
    }
}

// DELETE en opgave
const deleteOpgave = async (req, res) => {
    const { id } = req.params

    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(400).json({error: 'Ingen opgaver fundet med et matchende ID.'})
    }

    const opgave = await Opgave.findOneAndDelete({_id: id})

    if(!opgave) {
        return res.status(400).json({error: 'Ingen opgaver fundet med et matchende ID.'})
    }

    res.status(200).json(opgave)
}

const updateOpgave = async (req, res) => {
    const { id } = req.params;
    const { fakturaPDF, ...rest } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Ingen opgaver fundet med et matchende ID.' });
    }

    try {
        // Prepare the update data
        const updateData = {
            ...rest
        };

        // If fakturaPDF is provided as base64, convert it to Buffer
        if (fakturaPDF) {
            updateData.fakturaPDF = Buffer.from(fakturaPDF, 'base64');
        }

        // Update the document
        const opgave = await Opgave.findOneAndUpdate(
            { _id: id },
            updateData,
            { new: true }
        );

        if (!opgave) {
            return res.status(400).json({ error: 'Ingen opgaver fundet med et matchende ID.' });
        }

        res.status(200).json(opgave);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export {
    getOpgaver,
    createOpgave,
    getOpgave,
    deleteOpgave,
    updateOpgave
}