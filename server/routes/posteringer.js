import express from "express"
import { getPosteringer, getPostering, createPostering, deletePostering, updatePostering, getPosteringerForBruger } from "../controllers/posteringController.js"
import requireAuth from "../middleware/requireAuth.js";

const router = express.Router();

router.use(requireAuth) 

// GET alle posteringer
router.get("/", getPosteringer)

// GET alle posteringer for en bruger
router.get("/bruger/:userID", getPosteringerForBruger)

// GET en enkelt postering
router.get('/:id', getPostering)

// POST en ny postering
router.post('/', createPostering)

// DELETE en postering
router.delete('/:id', deletePostering)

// OPDATER en postering
router.patch('/:id', updatePostering)

export default router;