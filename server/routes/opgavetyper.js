import express from "express"
import { getOpgavetyper, getOpgavetype, createOpgavetype, deleteOpgavetype, updateOpgavetype } from "../controllers/opgavetyperController.js"
import requireAuth from "../middleware/requireAuth.js";

const router = express.Router();

router.use(requireAuth) 

// GET alle posteringer
router.get("/", getOpgavetyper)

// GET en enkelt postering
router.get('/:id', getOpgavetype)

// POST en ny postering
router.post('/', createOpgavetype)

// DELETE en postering
router.delete('/:id', deleteOpgavetype)

// OPDATER en postering
router.patch('/:id', updateOpgavetype)

export default router;