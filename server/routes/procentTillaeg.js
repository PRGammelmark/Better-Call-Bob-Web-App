import express from "express"
import { getProcentTillaeg, getProcentTillaegById, createProcentTillaeg, deleteProcentTillaeg, updateProcentTillaeg } from "../controllers/procentTillaegController.js"
import requireAuth from "../middleware/requireAuth.js";

const router = express.Router();

router.use(requireAuth) 

// GET alle procentTillaeg
router.get("/", getProcentTillaeg)

// GET en enkelt procentTillaeg
router.get('/:id', getProcentTillaegById)

// POST en ny procentTillaeg
router.post('/', createProcentTillaeg)

// DELETE en procentTillaeg
router.delete('/:id', deleteProcentTillaeg)

// OPDATER en procentTillaeg
router.patch('/:id', updateProcentTillaeg)

export default router;

