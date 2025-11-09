import Kommentar from '../models/kommentarModel.js'
import mongoose from "mongoose"
import { opretNotifikation } from "../utils/notifikationFunktioner.js"
import Bruger from '../models/brugerModel.js'
import Opgave from '../models/opgaveModel.js'
import Kunde from '../models/kunderModel.js'

// GET alle kommentarer
const getKommentarer = async (req,res) => {
    const kommentarer = await Kommentar.find({}).sort({createdAt: -1})
    res.status(200).json(kommentarer)
}

// GET en enkelt kommentar
const getKommentar = async (req,res) => {
    const { id } = req.params;
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Ingen kommentarer fundet med et matchende ID.'})
    }

    const kommentar = await Kommentar.findById(id)

    if(!kommentar) {
        return res.status(404).json({error: 'Ingen kommentarer fundet med et matchende ID.'})
    }

    res.status(200).json(kommentar)
}

// CREATE en kommentar
const createKommentar = async (req, res) => {
    const { kommentarIndhold, brugerID, opgaveID } = req.body;
    try {
        const kommentar = await Kommentar.create({kommentarIndhold, brugerID, opgaveID})
        
        const bruger = await Bruger.findById(req.user._id);
        const opgave = await Opgave.findById(opgaveID);
        const kunde = await Kunde.findById(opgave.kundeID);
        await opretNotifikation({ modtagerID: opgave.ansvarlige, udløserID: req.user._id, type: "kommentarOprettet", titel: `${bruger.navn} har tilføjet en ny kommentar på opgaven på ${kunde.adresse}, ${kunde.postnummerOgBy}.`, besked: `Gå til opgavesiden for at se eller redigere i kommentaren.`, link: `/opgave/${opgave._id}`, erVigtig: true })
        await opretNotifikation({ modtagerID: "admin", udløserID: req.user._id, type: "kommentarOprettet", titel: `${bruger.navn} har tilføjet en ny kommentar på opgaven på ${kunde.adresse}, ${kunde.postnummerOgBy}.`, besked: `Gå til opgavesiden for at se eller redigere i kommentaren.`, link: `/opgave/${opgave._id}`, erVigtig: true })

        res.status(200).json(kommentar)
    } catch (error) {
        res.status(400).json({error: error.message})
    }
}

// DELETE en kommentar
const deleteKommentar = async (req, res) => {
    const { id } = req.params

    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(400).json({error: 'Ingen kommentarer fundet med et matchende ID.'})
    }

    const kommentar = await Kommentar.findOneAndDelete({_id: id})

    if(!kommentar) {
        return res.status(400).json({error: 'Ingen kommentarer fundet med et matchende ID.'})
    }

    res.status(200).json(kommentar)
}

// OPDATER en kommentar
const updateKommentar = async (req,res) => {
    const { id } = req.params

    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(400).json({error: 'Ingen kommentarer fundet med et matchende ID.'})
    }

    const kommentar = await Kommentar.findOneAndUpdate({_id: id}, {
        ...req.body
    })

    if(!kommentar) {
        return res.status(400).json({error: 'Ingen kommentarer fundet med et matchende ID.'})
    }

    const bruger = await Bruger.findById(req.user._id);
    const opgave = await Opgave.findById(kommentar.opgaveID);
    const ansvarlige = opgave.ansvarlig;
    const kunde = await Kunde.findById(opgave.kundeID);
    for (const ansvarlig of ansvarlige) {
        await opretNotifikation({ modtagerID: ansvarlig._id, udløserID: req.user._id, type: "kommentarOpdateret", titel: `${bruger.navn} har opdateret en kommentar på opgaven på ${kunde.adresse}, ${kunde.postnummerOgBy}.`, besked: `Gå til opgavesiden for at se flere detaljer.`, link: `/opgave/${opgave._id}`, erVigtig: true })
    }
    await opretNotifikation({ modtagerID: "admin", udløserID: req.user._id, type: "kommentarOpdateret", titel: `${bruger.navn} har opdateret en kommentar på opgaven på ${kunde.adresse}, ${kunde.postnummerOgBy}.`, besked: `Gå til opgavesiden for at se eller redigere i kommentaren.`, link: `/opgave/${opgave._id}`, erVigtig: true })

    res.status(200).json(kommentar)
}


export {
    getKommentarer,
    createKommentar,
    getKommentar,
    deleteKommentar,
    updateKommentar
}