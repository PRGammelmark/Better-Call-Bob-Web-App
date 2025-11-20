import express from "express"
import { getLedigeTider, createLedigTid, getLedigTid, deleteLedigTid, updateLedigTid, getLedigeTiderForMedarbejder, getLedighed, getLedighedForMultipleUsers, getLedigeBookingTider } from "../controllers/ledigeTiderController.js"
import requireAuth from "../middleware/requireAuth.js";

const router = express.Router();

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