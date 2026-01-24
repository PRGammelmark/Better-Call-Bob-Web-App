import express from "express"
import { getFasteTillaeg, getFasteTillaegById, createFasteTillaeg, deleteFasteTillaeg, updateFasteTillaeg } from "../controllers/fasteTillaegController.js"
import requireAuth from "../middleware/requireAuth.js";

const router = express.Router();

router.use(requireAuth) 

// GET alle fasteTillaeg
router.get("/", getFasteTillaeg)

// GET en enkelt fasteTillaeg
router.get('/:id', getFasteTillaegById)

// POST en ny fasteTillaeg
router.post('/', createFasteTillaeg)

// DELETE en fasteTillaeg
router.delete('/:id', deleteFasteTillaeg)

// OPDATER en fasteTillaeg
router.patch('/:id', updateFasteTillaeg)

export default router;

