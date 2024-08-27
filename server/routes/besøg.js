import express from "express"
import { getAlleBesøg, createBesøg, getEtBesøg, deleteBesøg, updateBesøg } from "../controllers/besøgController.js"
import requireAuth from "../middleware/requireAuth.js";

const router = express.Router();

router.use(requireAuth) 

// GET alle besøg
router.get("/", getAlleBesøg)

// GET et enkelt besøg
router.get('/:id', getEtBesøg)

// POST et ny besøg
router.post('/', createBesøg)

// DELETE et besøg
router.delete('/:id', deleteBesøg)

// OPDATER et besøg
router.patch('/:id', updateBesøg)

export default router;