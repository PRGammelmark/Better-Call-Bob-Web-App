import express from "express"
import { getPauser, getPauseById, createPause, deletePause, updatePause } from "../controllers/pauseController.js"
import requireAuth from "../middleware/requireAuth.js";

const router = express.Router();

router.use(requireAuth) 

// GET alle pauser
router.get("/", getPauser)

// GET en enkelt pause
router.get('/:id', getPauseById)

// POST en ny pause
router.post('/', createPause)

// DELETE en pause
router.delete('/:id', deletePause)

// OPDATER en pause
router.patch('/:id', updatePause)

export default router;

