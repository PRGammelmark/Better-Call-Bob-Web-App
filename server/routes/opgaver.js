import express from "express"
import { getOpgaver, getOpgaverPopulateKunder, openCreateOpgave, createOpgave, createBooking, getOpgave, deleteOpgave, updateOpgave, getOpgaverForKunde, getOpgaverForMedarbejder, tilfoejAnsvarlig, fjernAnsvarlig, opdaterOpgavebeskrivelse, afslutOpgave, genåbnOpgave, tilføjBilleder, getOpgaverNew, getOpgaverOpen, getOpgaverPlanned, getOpgaverDone, getOpgaverArchived, getOpgaverDeleted, getOpgaverPersonalCurrent, getOpgaverPersonalClosed } from "../controllers/opgaveController.js"
import requireAuth from "../middleware/requireAuth.js";
import { shortTermLimiter, dailyLimiter, hourlyLimiter, bookingShortTermLimiter } from "../middleware/rateLimit.js"

const router = express.Router();

// router.use(requireAuth) 

// GET alle opgaver
router.get("/", requireAuth, getOpgaver)

// GET alle opgaver med kunder
router.get("/populateKunder", requireAuth, getOpgaverPopulateKunder)

// New tab endpoints
router.get("/new", requireAuth, getOpgaverNew)
router.get("/open", requireAuth, getOpgaverOpen)
router.get("/planned", requireAuth, getOpgaverPlanned)
router.get("/done", requireAuth, getOpgaverDone)
router.get("/archived", requireAuth, getOpgaverArchived)
router.get("/deleted", requireAuth, getOpgaverDeleted)

// Personal view endpoints
router.get("/personal/current", requireAuth, getOpgaverPersonalCurrent)
router.get("/personal/closed", requireAuth, getOpgaverPersonalClosed)

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

// POST booking (åben route med kunde oprettelse og fil upload)
// Rate limit: maks 3 i minuttet, maks 10 i timen
router.post('/booking', bookingShortTermLimiter, hourlyLimiter, createBooking)

// DELETE en opgave
router.delete('/:id', requireAuth, deleteOpgave)

// OPDATER en opgave
router.patch('/:id', requireAuth, updateOpgave)

// Specifikke routes for patch af opgaver ================================

// Tilføj ansvarlig til en opgave
router.patch('/:id/tilfoejAnsvarlig', requireAuth, tilfoejAnsvarlig)

// Fjern ansvarlig fra en opgave
router.patch('/:id/fjernAnsvarlig', requireAuth, fjernAnsvarlig)

// Opdater opgavebeskrivelse på opgave
router.patch('/:id/opdaterOpgavebeskrivelse', requireAuth, opdaterOpgavebeskrivelse)

// Afslut opgave
router.patch('/:id/afslutOpgave', requireAuth, afslutOpgave)

// Genåbn opgave
router.patch('/:id/genåbnOpgave', requireAuth, genåbnOpgave)

// Tilføj nye billeder til en opgave
router.patch('/:id/tilføjBilleder', requireAuth, tilføjBilleder)

// ========================================================================

export default router;