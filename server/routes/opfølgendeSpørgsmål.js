import express from "express"
import { 
    getOpfølgendeSpørgsmål, 
    getSpørgsmålForKategorier,
    getOpfølgendeSpørgsmålById, 
    createOpfølgendeSpørgsmål, 
    deleteOpfølgendeSpørgsmål, 
    updateOpfølgendeSpørgsmål 
} from "../controllers/opfølgendeSpørgsmålController.js"
import requireAuth from "../middleware/requireAuth.js";

const router = express.Router();

// Åben route til booking systemet (ingen auth)
router.post("/forKategorier", getSpørgsmålForKategorier);

// Beskyttede routes (kræver auth)
router.use(requireAuth);

// GET alle spørgsmål
router.get("/", getOpfølgendeSpørgsmål);

// POST et nyt spørgsmål (skal komme før /:id routes)
router.post('/', createOpfølgendeSpørgsmål);

// GET en enkelt spørgsmål
router.get('/:id', getOpfølgendeSpørgsmålById);

// DELETE et spørgsmål
router.delete('/:id', deleteOpfølgendeSpørgsmål);

// OPDATER et spørgsmål
router.patch('/:id', updateOpfølgendeSpørgsmål);

export default router;

