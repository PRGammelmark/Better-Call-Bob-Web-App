import express from "express"
import { getKunder, getKunde, deleteKunde, createKunde, updateKunde } from '../controllers/kunderController.js'
import requireAuth from "../middleware/requireAuth.js";

const router = express.Router();
router.use(requireAuth) 

// GET alle brugere
router.get("/", getKunder)

// GET en enkelt bruger
router.get('/:id', getKunde)

// OPDATER en bruger
router.patch('/:id', updateKunde)

// DELETE en kunde
router.delete('/:id', deleteKunde)

// CREATE en kunde
router.post('/', createKunde)

export default router;