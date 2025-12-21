import express from "express"
import { getLedigeTider, createLedigTid, getLedigTid, deleteLedigTid, updateLedigTid, getLedigeTiderForMedarbejder, getLedighed, getLedighedForMultipleUsers, getLedigeBookingTider, getNæsteToLedigeTimer, getNæste7LedigeDatoer } from "../controllers/ledigeTiderController.js"
import requireAuth from "../middleware/requireAuth.js";

const router = express.Router();

// GET næste to sammenhængende ledige timer - offentligt endpoint (placeret først for at sikre matching)
router.get("/naeste-to-ledige-timer", getNæsteToLedigeTimer)

// GET næste 7 datoer med mindst to sammenhængende ledige timer - offentligt endpoint
router.get("/naeste-7-ledige-datoer", getNæste7LedigeDatoer)

// GET ledighed (ledige tider minus besøg) - ingen auth påkrævet
router.get("/ledighed", getLedighed)

// POST ledighed for multiple users (for booking system) - ingen auth påkrævet
router.post("/ledighed-for-brugere", getLedighedForMultipleUsers)

// POST ledige booking tider (konverteret til slots baseret på tidsforbrug) - ingen auth påkrævet
router.post("/get-ledige-booking-tider", getLedigeBookingTider)

router.use(requireAuth) 

// GET alle ledigeTider
router.get("/", getLedigeTider)

// GET alle ledigeTider for en medarbejder
router.get('/medarbejder/:id', getLedigeTiderForMedarbejder)

// GET en enkelt ledigTid
router.get('/:id', getLedigTid)

// POST en ny ledigTid
router.post('/', createLedigTid)

// DELETE en ledigTid
router.delete('/:id', deleteLedigTid)

// OPDATER en ledigTid
router.patch('/:id', updateLedigTid)

export default router;