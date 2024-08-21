import express from "express"
import { getKommentarer, createKommentar, getKommentar, deleteKommentar, updateKommentar } from "../controllers/kommentarController.js"
import requireAuth from "../middleware/requireAuth.js";

const router = express.Router();

router.use(requireAuth) 

// GET alle kommentarer
router.get("/", getKommentarer)

// GET en enkelt kommentar
router.get('/:id', getKommentar)

// POST en ny kommentar
router.post('/', createKommentar)

// DELETE en kommentar
router.delete('/:id', deleteKommentar)

// OPDATER en kommentar
router.patch('/:id', updateKommentar)

export default router;