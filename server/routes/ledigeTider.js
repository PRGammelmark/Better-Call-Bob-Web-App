import express from "express"
import { getLedigeTider, createLedigTid, getLedigTid, deleteLedigTid, updateLedigTid, getLedigeTiderForMedarbejder } from "../controllers/ledigeTiderController.js"
import requireAuth from "../middleware/requireAuth.js";

const router = express.Router();

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