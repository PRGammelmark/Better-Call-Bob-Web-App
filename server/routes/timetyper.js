import express from "express"
import { getTimetyper, getTimetype, createTimetype, deleteTimetype, updateTimetype } from "../controllers/timetyperController.js"
import requireAuth from "../middleware/requireAuth.js";

const router = express.Router();

router.use(requireAuth) 

// GET alle timetyper
router.get("/", getTimetyper)

// GET en enkelt timetype
router.get('/:id', getTimetype)

// POST en ny timetype
router.post('/', createTimetype)

// DELETE en timetype
router.delete('/:id', deleteTimetype)

// OPDATER en timetype
router.patch('/:id', updateTimetype)

export default router;

