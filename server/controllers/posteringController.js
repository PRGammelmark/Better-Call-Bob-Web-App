import Postering from '../models/posteringModel.js'
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

// // GET første udlæg for valgte posteringer
// const downloadSelectedUdlaeg = async (req, res) => {
//     try {
//       const { posteringIds } = req.body
//       if (!Array.isArray(posteringIds) || posteringIds.length === 0) {
//         return res.status(400).json({ error: "Ingen posteringer valgt." })
//       }

//       const posteringer = await Postering.find({ _id: { $in: posteringIds } })

//       // Find første udlæg med kvittering
//       let firstUdlaeg = null
//       let pId = null
//       let index = null
//       outer: for (const p of posteringer) {
//         for (let j = 0; j < p.udlæg.length; j++) {
//           if (p.udlæg[j].kvittering) {
//             firstUdlaeg = p.udlæg[j].kvittering // fuldt link fra databasen
//             pId = p._id
//             index = j
//             break outer
//           }
//         }
//       }

//       if (!firstUdlaeg) {
//         return res.status(404).json({ error: "Ingen kvitteringer fundet." })
//       }

//       console.log("Henter første fil direkte via link:", firstUdlaeg)

//       // Hent fil via axios
//       const response = await axios.get(firstUdlaeg, { responseType: "arraybuffer" })
//       const data = Buffer.from(response.data)

//       // Find filtype
//       const contentType = response.headers["content-type"] || "application/octet-stream"
//       const extMatch = contentType.match(/image\/(jpeg|png|webp|heic)/i)
//       const ext = extMatch ? `.${extMatch[1]}` : ".jpg"
//       const filename = `postering_${pId}_udlaeg_${index}${ext}`

//       res.setHeader("Content-Type", contentType)
//       res.setHeader("Content-Disposition", `attachment; filename=${filename}`)
//       res.setHeader("Content-Length", data.length)

//       res.send(data)
//       console.log("Billede sendt direkte til klient via fuldt link")
//     } catch (err) {
//       console.error("downloadSelectedUdlaeg fejl:", err)
//       if (!res.headersSent) {
//         res.status(500).json({ error: "Kunne ikke downloade kvittering." })
//       } else {
//         try { res.end() } catch (e) {}
//       }
//     }
// }

// CREATE en postering
const createPostering = async (req, res) => {
    try {
        const postering = await Postering.create(req.body)
        res.status(200).json(postering)
    } catch (error) {
        res.status(400).json({error: error.message})
    }
}

// DELETE en postering
const deletePostering = async (req, res) => {
    const { id } = req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(400).json({error: 'Ingen posteringer fundet med et matchende ID.'})
    }
    const postering = await Postering.findOneAndDelete({_id: id})
    if(!postering) return res.status(400).json({error: 'Ingen posteringer fundet med et matchende ID.'})
    res.status(200).json(postering)
}

// OPDATER en postering
const updatePostering = async (req,res) => {
    const { id } = req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(400).json({error: 'Ingen posteringer fundet med et matchende ID.'})
    }
    const postering = await Postering.findOneAndUpdate({_id: id}, req.body, { new: true })
    if(!postering) return res.status(400).json({error: 'Ingen posteringer fundet med et matchende ID.'})
    res.status(200).json(postering)
}


export {
    getPosteringer,
    createPostering,
    getPostering,
    deletePostering,
    updatePostering,
    getPosteringerForBruger,
    getPosteringerForOpgave,
    downloadSelectedUdlaeg
}


// import Postering from '../models/posteringModel.js'
// import mongoose from "mongoose"
// import archiver from "archiver"
// import axios from "axios"
// import stream from "stream"
// const { PassThrough } = stream
// import streamBuffers from "stream-buffers"
// import sharp from "sharp"
// import bucket from "../config/firebaseAdmin.js"

// // GET alle posteringer
// const getPosteringer = async (req,res) => {
//     const posteringer = await Postering.find({}).sort({createdAt: -1}).populate('kunde').populate('bruger').populate('opgave')
//     res.status(200).json(posteringer)
// }

// // GET en enkelt postering
// const getPostering = async (req,res) => {
//     const { id } = req.params;
//     if(!mongoose.Types.ObjectId.isValid(id)){
//         return res.status(404).json({error: 'Ingen posteringer fundet med et matchende ID.'})
//     }

//     const postering = await Postering.findById(id).populate('kunde').populate('bruger').populate('opgave')

//     if(!postering) {
//         return res.status(404).json({error: 'Ingen posteringer fundet med et matchende ID.'})
//     }

//     res.status(200).json(postering)
// }

// // GET alle posteringer for en bruger
// const getPosteringerForBruger = async (req,res) => {
//     const { userID } = req.params;
//     const posteringer = await Postering.find({ brugerID: userID }).sort({createdAt: -1}).populate('kunde').populate('bruger').populate('opgave')
//     res.status(200).json(posteringer)
// }

// // GET alle posteringer for en opgave
// const getPosteringerForOpgave = async (req,res) => {
//     const { opgaveID } = req.params;
//     const posteringer = await Postering.find({ opgaveID: opgaveID }).sort({createdAt: -1}).populate('kunde').populate('bruger').populate('opgave')
//     res.status(200).json(posteringer)
// }

// // GET første udlæg for valgte posteringer
// const downloadSelectedUdlaeg = async (req, res) => {
//     try {
//       const { posteringIds } = req.body
//       if (!Array.isArray(posteringIds) || posteringIds.length === 0) {
//         return res.status(400).json({ error: "Ingen posteringer valgt." })
//       }
  
//       const posteringer = await Postering.find({ _id: { $in: posteringIds } })
  
//       // Find første udlæg med kvittering
//       let firstUdlaeg = null
//       let pId = null
//       let index = null
//       outer: for (const p of posteringer) {
//         for (let j = 0; j < p.udlæg.length; j++) {
//           if (p.udlæg[j].kvittering) {
//             firstUdlaeg = p.udlæg[j].kvittering // fuldt link fra databasen
//             pId = p._id
//             index = j
//             break outer
//           }
//         }
//       }
  
//       if (!firstUdlaeg) {
//         return res.status(404).json({ error: "Ingen kvitteringer fundet." })
//       }
  
//       console.log("Henter første fil direkte via link:", firstUdlaeg)
  
//       // Hent fil via axios
//       const response = await axios.get(firstUdlaeg, { responseType: "arraybuffer" })
//       const data = Buffer.from(response.data)
  
//       // Find filtype
//       const contentType = response.headers["content-type"] || "application/octet-stream"
//       const extMatch = contentType.match(/image\/(jpeg|png|webp|heic)/i)
//       const ext = extMatch ? `.${extMatch[1]}` : ".jpg"
//       const filename = `postering_${pId}_udlaeg_${index}${ext}`
  
//       res.setHeader("Content-Type", contentType)
//       res.setHeader("Content-Disposition", `attachment; filename=${filename}`)
//       res.setHeader("Content-Length", data.length)
  
//       res.send(data)
//       console.log("Billede sendt direkte til klient via fuldt link")
//     } catch (err) {
//       console.error("downloadSelectedUdlaeg fejl:", err)
//       if (!res.headersSent) {
//         res.status(500).json({ error: "Kunne ikke downloade kvittering." })
//       } else {
//         try { res.end() } catch (e) {}
//       }
//     }
//   }
  
  

// // CREATE en postering
// const createPostering = async (req, res) => {
//     const { dato, beskrivelse, opstart, handymanTimer, tømrerTimer, udlæg, aftenTillæg, natTillæg, trailer, rådgivningOpmålingVejledning, satser, rabatProcent, dynamiskHonorarBeregning, dynamiskPrisBeregning, fastHonorar, fastPris, dynamiskHonorar, dynamiskPris, totalHonorar, totalPris, opgaveID, brugerID, kundeID, kunde, opgave, bruger } = req.body;
//     try {
//         const postering = await Postering.create({ dato, beskrivelse, opstart, handymanTimer, tømrerTimer, udlæg, aftenTillæg, natTillæg, trailer, rådgivningOpmålingVejledning, satser, rabatProcent, dynamiskHonorarBeregning, dynamiskPrisBeregning, fastHonorar, fastPris, dynamiskHonorar, dynamiskPris, totalHonorar, totalPris, opgaveID, brugerID, kundeID, kunde, opgave, bruger })
//         res.status(200).json(postering)
//     } catch (error) {
//         res.status(400).json({error: error.message})
//     }
// }

// // DELETE en postering
// const deletePostering = async (req, res) => {
//     const { id } = req.params

//     if(!mongoose.Types.ObjectId.isValid(id)){
//         return res.status(400).json({error: 'Ingen posteringer fundet med et matchende ID.'})
//     }

//     const postering = await Postering.findOneAndDelete({_id: id})

//     if(!postering) {
//         return res.status(400).json({error: 'Ingen posteringer fundet med et matchende ID.'})
//     }

//     res.status(200).json(postering)
// }

// // OPDATER en postering
// const updatePostering = async (req,res) => {
//     const { id } = req.params

//     if(!mongoose.Types.ObjectId.isValid(id)){
//         return res.status(400).json({error: 'Ingen posteringer fundet med et matchende ID.'})
//     }

//     const postering = await Postering.findOneAndUpdate({_id: id}, {
//         ...req.body
//     })

//     if(!postering) {
//         return res.status(400).json({error: 'Ingen posteringer fundet med et matchende ID.'})
//     }

//     res.status(200).json(postering)
// }


// export {
//     getPosteringer,
//     createPostering,
//     getPostering,
//     deletePostering,
//     updatePostering,
//     getPosteringerForBruger,
//     downloadSelectedUdlaeg
// }