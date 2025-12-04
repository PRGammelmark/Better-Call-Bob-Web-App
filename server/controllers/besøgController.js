import Besøg from '../models/besøgModel.js'
import Kunde from '../models/kunderModel.js'
import Bruger from '../models/brugerModel.js'
import dayjs from 'dayjs'
import Opgave from '../models/opgaveModel.js'
import mongoose from "mongoose"
import { opretNotifikation } from "../utils/notifikationFunktioner.js"
import { justerForDST } from "../utils/justerForDST.js"

// GET alle besøg
const getAlleBesøg = async (req,res) => {
    const besøg = await Besøg.find({}).sort({ createdAt: -1 }).lean();
    const besøgMedJusteretTid = besøg.map(b => {
        const { start, end } = justerForDST(b.datoTidFra, b.datoTidTil);
        return { ...b, datoTidFra: start, datoTidTil: end };
    });

    res.status(200).json(besøg)
}

// GET alle besøg for en enkelt bruger
const getAlleBesøgForEnBruger = async (req, res) => {
    const { userID } = req.params;

    try {
        const besøg = await Besøg.find({ brugerID: userID }).sort({ createdAt: -1 }).lean();
        const besøgMedJusteretTid = besøg.map(b => {
            const { start, end } = justerForDST(b.datoTidFra, b.datoTidTil);
            return { ...b, datoTidFra: start, datoTidTil: end };
        });
        // res.status(200).json(besøgMedJusteretTid);
        res.status(200).json(besøg);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// GET et enkelt besøg
const getEtBesøg = async (req,res) => {
    const { id } = req.params;
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Ingen besøg fundet med et matchende ID.'})
    }

    const besøg = await Besøg.findById(id)
    const { start, end } = justerForDST(besøg.datoTidFra, besøg.datoTidTil);
    const besøgMedJusteretTid = {
        ...besøg,
        datoTidFra: start,
        datoTidTil: end
    };

    if(!besøg) {
        return res.status(404).json({error: 'Ingen besøg fundet med et matchende ID.'})
    }

    // res.status(200).json(besøgMedJusteretTid)
    res.status(200).json(besøg)
}

// CREATE et besøg
const createBesøg = async (req, res) => {
    const { datoTidFra, datoTidTil, brugerID, opgaveID, kundeID, kommentar, eventColor } = req.body;
    const bruger = await Bruger.findById(req.user._id);
    const opgave = await Opgave.findById(opgaveID);
    const udledtKundeID = opgave?.kundeID;
    const kunde = await Kunde.findById(udledtKundeID);

    try {
        const besøg = await Besøg.create({ datoTidFra, datoTidTil, brugerID, opgaveID, kundeID: udledtKundeID, kommentar, eventColor })
        
        // Update opgave status to "Dato aftalt" if it's not already set
        if (opgave && opgave.status !== "Dato aftalt") {
            opgave.status = "Dato aftalt";
            await opgave.save();
        }
        
        await opretNotifikation({ modtagerID: brugerID, udløserID: req.user._id, type: "besøgOprettet", titel: `Du har fået et besøg i kalenderen (reg. af ${bruger.navn}) d. ${dayjs(datoTidFra).format("DD. MMMM HH:mm")} - ${dayjs(datoTidTil).format("HH:mm")} på ${kunde?.adresse || "(adresse ikke fundet)"}, ${kunde?.postnummerOgBy || "(område ikke fundet)"}.`, besked: `Se din kalender for at få et overblik.`, link: `/` })
        res.status(200).json(besøg)
    } catch (error) {
        res.status(400).json({error: error.message})
    }
}

// DELETE et besøg
const deleteBesøg = async (req, res) => {
    const { id } = req.params
    const bruger = await Bruger.findById(req.user._id);
    
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(400).json({error: 'Ingen besøg fundet med et matchende ID.'})
    }

    const besøg = await Besøg.findOneAndDelete({_id: id})

    if(!besøg) {
        return res.status(400).json({error: 'Ingen besøg fundet med et matchende ID.'})
    }

    let kundeID = besøg.kundeID;

    if (!kundeID) {
        const opgave = await Opgave.findById(besøg.opgaveID);
        if (opgave) kundeID = opgave.kundeID;
    }    

    const kunde = await Kunde.findById(kundeID);

    if(kunde) {
        await opretNotifikation({ modtagerID: besøg.brugerID, udløserID: req.user._id, type: "besøgFjernet", titel: `${bruger.navn} har fjernet dit besøg på ${kunde?.adresse || "(adresse ikke fundet)"}, ${kunde?.postnummerOgBy || "(område ikke fundet)"} d. ${dayjs(besøg.datoTidFra).format("DD. MMMM HH:mm")} - ${dayjs(besøg.datoTidTil).format("HH:mm")}.`, besked: `Se din kalender for at få et overblik.`, link: `/` })
    } else {
        await opretNotifikation({ modtagerID: besøg.brugerID, udløserID: req.user._id, type: "besøgFjernet", titel: `${bruger.navn} har fjernet dit besøg hos en kunde d. ${dayjs(besøg.datoTidFra).format("DD. MMMM HH:mm")} - ${dayjs(besøg.datoTidTil).format("HH:mm")}.`, besked: `Se din kalender for at få et overblik.`, link: `/` })
    }
    

    res.status(200).json(besøg)
}

// OPDATER et besøg
const updateBesøg = async (req,res) => {
    const { id } = req.params
    const bruger = await Bruger.findById(req.user._id);

    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(400).json({error: 'Ingen besøg fundet med et matchende ID.'})
    }

    const besøg = await Besøg.findOneAndUpdate({_id: id}, {
        ...req.body
    })

    if(!besøg) {
        return res.status(400).json({error: 'Ingen besøg fundet med et matchende ID.'})
    }

    let kundeID = besøg.kundeID;

    if (!kundeID) {
        const opgave = await Opgave.findById(besøg.opgaveID);
        if (opgave) kundeID = opgave.kundeID;
    }

    const kunde = await Kunde.findById(kundeID);

    await opretNotifikation({ modtagerID: besøg.brugerID, udløserID: req.user._id, type: "besøgOpdateret", titel: `${bruger.navn} har ændret dit besøg på ${kunde?.adresse || "(adresse ikke fundet)"}, ${kunde?.postnummerOgBy || "(område ikke fundet)"} fra ${dayjs(besøg.datoTidFra).format("DD. MMMM HH:mm")} - ${dayjs(besøg.datoTidTil).format("HH:mm")} til ${dayjs(req.body.datoTidFra).format("DD. MMMM HH:mm")} - ${dayjs(req.body.datoTidTil).format("HH:mm")}.`, besked: `Se din kalender for at få et overblik.`, link: `/` })

    res.status(200).json(besøg)
}

export {
    getAlleBesøg,
    getAlleBesøgForEnBruger,
    createBesøg,
    getEtBesøg,
    deleteBesøg,
    updateBesøg
}