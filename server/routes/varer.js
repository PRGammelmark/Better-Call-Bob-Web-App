import express from "express"
import { getVarer, getVarerById, createVarer, deleteVarer, updateVarer } from "../controllers/varerController.js"
import requireAuth from "../middleware/requireAuth.js";

const router = express.Router();

router.use(requireAuth) 

// GET alle varer
router.get("/", getVarer)

// GET en enkelt vare
router.get('/:id', getVarerById)

// POST en ny vare
router.post('/', createVarer)

// DELETE en vare
router.delete('/:id', deleteVarer)

// OPDATER en vare
router.patch('/:id', updateVarer)

export default router;

