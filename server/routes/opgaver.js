import express from "express"
import { getOpgaver, getOpgaverPopulateKunder, openCreateOpgave, createOpgave, getOpgave, deleteOpgave, updateOpgave, getOpgaverForKunde, getOpgaverForMedarbejder } from "../controllers/opgaveController.js"
import requireAuth from "../middleware/requireAuth.js";
import { shortTermLimiter, dailyLimiter } from "../middleware/rateLimit.js"

const router = express.Router();

// router.use(requireAuth) 

// GET alle opgaver
router.get("/", requireAuth, getOpgaver)

// GET alle opgaver med kunder
router.get("/populateKunder", requireAuth, getOpgaverPopulateKunder)

// GET en enkelt opgave
router.get('/:id', requireAuth, getOpgave)

// GET alle opgaver for en kunde
router.get('/kunde/:id', requireAuth, getOpgaverForKunde)

// GET alle opgaver for en medarbejder
router.get('/medarbejder/:id', requireAuth, getOpgaverForMedarbejder)

// POST en ny opgave (fra app'en)
router.post('/', requireAuth, createOpgave)

// POST en ny opgave (åben route)
router.post('/openRoute', shortTermLimiter, dailyLimiter, openCreateOpgave)

// DELETE en opgave
router.delete('/:id', requireAuth, deleteOpgave)

// OPDATER en opgave
router.patch('/:id', requireAuth, updateOpgave)

export default router;