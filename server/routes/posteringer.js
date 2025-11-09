import express from "express"
import { getPosteringer, getPostering, createPostering, deletePostering, updatePostering, getPosteringerForBruger, getPosteringerForOpgave, downloadSelectedUdlaeg, getPosteringerBetaltMedMobilePay, getUnpaidPosteringer } from "../controllers/posteringController.js"
import requireAuth from "../middleware/requireAuth.js";

const router = express.Router();

router.use(requireAuth) 

// GET alle posteringer
router.get("/", getPosteringer)

// GET alle posteringer for en bruger
router.get("/bruger/:userID", getPosteringerForBruger)

// GET alle posteringer for en opgave
router.get("/opgave/:opgaveID", getPosteringerForOpgave)

// GET alle posteringer der er blevet betalt med mobile pay
router.get("/betalt-med-mobile-pay", getPosteringerBetaltMedMobilePay)

// GET alle posteringer der er ikke betalt
router.get("/unpaid", getUnpaidPosteringer)

// GET en enkelt postering
router.get('/:id', getPostering)

// POST en download-udlæg request  
router.post("/udlaeg/download-selected", downloadSelectedUdlaeg)


// POST en ny postering
router.post('/', createPostering)

// DELETE en postering
router.delete('/:id', deletePostering)

// OPDATER en postering
router.patch('/:id', updatePostering)

export default router;