import express from "express"
import { getOpgaver, createOpgave, getOpgave, deleteOpgave, updateOpgave } from "../controllers/opgaveController.js"
import requireAuth from "../middleware/requireAuth.js";

const router = express.Router();

router.use(requireAuth) 

// GET alle opgaver
router.get("/", getOpgaver)

// GET en enkelt opgave
router.get('/:id', getOpgave)

// POST en ny opgave
router.post('/', createOpgave)

// DELETE en opgave
router.delete('/:id', deleteOpgave)

// OPDATER en opgave
router.patch('/:id', updateOpgave)

export default router;