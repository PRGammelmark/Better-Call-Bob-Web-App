import express from "express"
import { getOpgavetyper, getOpgavetype, createOpgavetype, deleteOpgavetype, updateOpgavetype, importOpgavetyperHandler, getAvailableOpgavetyper } from "../controllers/opgavetyperController.js"
import requireAuth from "../middleware/requireAuth.js";

const router = express.Router();

router.use(requireAuth) 

// GET alle opgavetyper
router.get("/", getOpgavetyper)

// GET tilgængelige opgavetyper for en kategori
router.get("/available/:kategori", getAvailableOpgavetyper)

// GET en enkelt opgavetype
router.get('/:id', getOpgavetype)

// POST en ny opgavetype
router.post('/', createOpgavetype)

// POST import opgavetyper
router.post('/import', importOpgavetyperHandler)

// DELETE en opgavetype
router.delete('/:id', deleteOpgavetype)

// OPDATER en opgavetype
router.patch('/:id', updateOpgavetype)

export default router;