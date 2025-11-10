import Postering from '../models/posteringModel.js'
import Bruger from '../models/brugerModel.js'
import Kunde from '../models/kunderModel.js'
import Opgave from '../models/opgaveModel.js'
import { opretNotifikation } from "../utils/notifikationFunktioner.js"
import mongoose from "mongoose"
import axios from "axios"
import archiver from "archiver"

// GET alle posteringer
const getPosteringer = async (req,res) => {
    const posteringer = await Postering.find({}).sort({createdAt: -1}).populate('kunde').populate('bruger').populate('opgave')
    res.status(200).json(posteringer)
}

// GET en enkelt postering
const getPostering = async (req,res) => {
    const { id } = req.params;
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Ingen posteringer fundet med et matchende ID.'})
    }

    const postering = await Postering.findById(id).populate('kunde').populate('bruger').populate('opgave')

    if(!postering) {
        return res.status(404).json({error: 'Ingen posteringer fundet med et matchende ID.'})
    }

    res.status(200).json(postering)
}

// GET alle posteringer for en bruger
const getPosteringerForBruger = async (req,res) => {
    const { userID } = req.params;
    const posteringer = await Postering.find({ brugerID: userID }).sort({createdAt: -1}).populate('kunde').populate('bruger').populate('opgave')
    res.status(200).json(posteringer)
}

// GET alle posteringer for en opgave
const getPosteringerForOpgave = async (req,res) => {
    const { opgaveID } = req.params;
    const posteringer = await Postering.find({ opgaveID: opgaveID }).sort({createdAt: -1}).populate('kunde').populate('bruger').populate('opgave')
    res.status(200).json(posteringer)
}

// GET alle posteringer betalt med MobilePay
const getPosteringerBetaltMedMobilePay = async (req, res) => {
  try {
    const posteringer = await Postering.find({ "betalinger.betalingsmetode": "mobilepay" }).sort({createdAt: -1}).populate('kunde');
    res.status(200).json(posteringer);
  } catch (error) {
    console.error("Fejl ved hentning af posteringer:", error);
    res.status(500).json({ message: "Der opstod en serverfejl" });
  }
};

// GET unpaid posteringer (betalt missing or null, populated opgave)
const getUnpaidPosteringer = async (req, res) => {
    try {
        const posteringer = await Postering.find({
            $or: [
                { betalt: { $exists: false } },
                { betalt: null }
            ]
        }).populate({
            path: 'opgave',
            populate: {
                path: 'kunde'
            }
        }).sort({ createdAt: -1 });
        res.status(200).json(posteringer)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
};


// GET selected posteringers udlæg som zip
const downloadSelectedUdlaeg = async (req, res) => {
    try {
      const { posteringIds } = req.body
      if (!Array.isArray(posteringIds) || posteringIds.length === 0) {
        return res.status(400).json({ error: "Ingen posteringer valgt." })
      }
  
      const posteringer = await Postering.find({ _id: { $in: posteringIds } })
  
      // Opsæt zip-stream
      res.setHeader('Content-Type', 'application/zip')
      res.setHeader('Content-Disposition', 'attachment; filename=udlaeg.zip')
      const archive = archiver('zip', { zlib: { level: 9 } })
      archive.pipe(res)
  
      // Tilføj alle udlæg
      for (const p of posteringer) {
        for (let j = 0; j < p.udlæg.length; j++) {
          const udlaeg = p.udlæg[j]
          if (!udlaeg.kvittering) continue
  
          try {
            const response = await axios.get(udlaeg.kvittering, { responseType: 'arraybuffer' })
            const data = Buffer.from(response.data)
  
            // Find filtype
            const contentType = response.headers['content-type'] || 'application/octet-stream'
            const extMatch = contentType.match(/image\/(jpeg|png|webp|heic)/i)
            const ext = extMatch ? `.${extMatch[1]}` : '.jpg'
  
            const filename = `postering_${p._id}_udlaeg_${j}${ext}`
  
            archive.append(data, { name: filename })
          } catch (err) {
            console.error(`Kunne ikke hente kvittering for postering ${p._id}, udlæg ${j}:`, err)
          }
        }
      }
  
      await archive.finalize()
      console.log('Zip sendt til klient')
    } catch (err) {
      console.error('downloadSelectedUdlaeg fejl:', err)
      if (!res.headersSent) res.status(500).json({ error: "Kunne ikke downloade kvitteringer." })
      else try { res.end() } catch (e) {}
    }
  }

// CREATE en postering
const createPostering = async (req, res) => {
    try {
        const postering = await Postering.create(req.body)
        
        // Opret notifikation
        const bruger = await Bruger.findById(req.user._id);
        const opgave = await Opgave.findById(postering.opgaveID);
        const kunde = await Kunde.findById(opgave.kundeID);
        await opretNotifikation({ modtagerID: postering.brugerID, udløserID: req.user._id, type: "posteringOprettet", titel: `${bruger.navn} har oprettet en postering for dig.`, besked: `Posteringen er oprettet på opgaven hos ${kunde.virksomhed ? kunde.virksomhed : kunde.navn} på ${kunde.adresse}, ${kunde.postnummerOgBy}.`, link: `/opgave/${postering.opgaveID}` })
        await opretNotifikation({ modtagerID: "admin", udløserID: req.user._id, type: "posteringOprettet", titel: `${bruger.navn} har oprettet en ny postering (totalpris: ${postering.totalPris} kr.) på opgaven på ${kunde.adresse}, ${kunde.postnummerOgBy}.`, besked: `Gå til opgavesiden for at se flere detaljer.`, link: `/opgave/${postering.opgaveID}` })

        res.status(200).json(postering)
    } catch (error) {
        res.status(400).json({error: error.message})
    }
}

// DELETE en postering
const deletePostering = async (req, res) => {
  const { id } = req.params;
  const bruger = await Bruger.findById(req.user._id);

  if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Ugyldigt ID.' });
  }

  const postering = await Postering.findByIdAndDelete(id);

  if (!postering) {
      return res.status(404).json({ error: 'Ingen postering fundet med det ID.' });
  }

  const opgave = await Opgave.findById(postering.opgaveID);
  const kunde = await Kunde.findById(opgave.kundeID);

  await opretNotifikation({ modtagerID: postering.brugerID, udløserID: req.user._id, type: "posteringFjernet", titel: `${bruger.navn} har fjernet din postering på opgaven på ${kunde.adresse}, ${kunde.postnummerOgBy}.`, besked: `Gå til opgavesiden for at se flere detaljer.`, link: `/opgave/${postering.opgaveID}` })
  await opretNotifikation({ modtagerID: "admin", udløserID: req.user._id, type: "posteringFjernet", titel: `${bruger.navn} har fjernet en postering (totalpris: ${postering.totalPris} kr.) fra opgaven på ${kunde.adresse}, ${kunde.postnummerOgBy}.`, besked: `Gå til opgavesiden for at se flere detaljer.`, link: `/opgave/${postering.opgaveID}` })

  res.status(200).json(postering);
};

// OPDATER en postering
const updatePostering = async (req,res) => {
    const { id } = req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(400).json({error: 'Ingen posteringer fundet med et matchende ID.'})
    }

    // Valider at alle opkrævninger har et opkrævningsbeløb
    if (req.body.opkrævninger && Array.isArray(req.body.opkrævninger)) {
        for (const opkrævning of req.body.opkrævninger) {
            if (opkrævning.opkrævningsbeløb === undefined || opkrævning.opkrævningsbeløb === null || isNaN(Number(opkrævning.opkrævningsbeløb))) {
                return res.status(400).json({error: 'Alle opkrævninger skal have et gyldigt opkrævningsbeløb.'})
            }
        }
    }

    const bruger = await Bruger.findById(req.user._id);
    const gammelPostering = await Postering.findById(id);
    const postering = await Postering.findOneAndUpdate({_id: id}, req.body, { new: true })
    if(!postering) return res.status(400).json({error: 'Ingen posteringer fundet med et matchende ID.'})

    const opgave = await Opgave.findById(postering.opgaveID);
    const kunde = await Kunde.findById(opgave.kundeID);

    await opretNotifikation({ modtagerID: postering.brugerID, udløserID: req.user._id, type: "posteringOpdateret", titel: `${bruger.navn} har opdateret din postering på opgaven på ${kunde.adresse}, ${kunde.postnummerOgBy}.`, besked: `Gå til opgavesiden for at se flere detaljer.`, link: `/opgave/${postering.opgaveID}` })
    await opretNotifikation({ modtagerID: "admin", udløserID: req.user._id, type: "posteringOpdateret", titel: `${bruger.navn} har opdateret en af sine posteringer på opgaven på ${kunde.adresse}, ${kunde.postnummerOgBy}.`, besked: `Pris primo: ${gammelPostering.totalPris} kr., ultimo: ${postering.totalPris} kr. Honorar primo: ${gammelPostering.totalHonorar} kr., ultimo: ${postering.totalHonorar} kr.`, link: `/opgave/${postering.opgaveID}` })

    res.status(200).json(postering)
}

export {
    getPosteringer,
    getPosteringerForOpgave,
    getPosteringerBetaltMedMobilePay,
    createPostering,
    getPostering,
    deletePostering,
    updatePostering,
    getPosteringerForBruger,
    downloadSelectedUdlaeg,
    getUnpaidPosteringer
}