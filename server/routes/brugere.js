import express from "express"
import { loginBruger, signupBruger, getBrugere, getBruger, updateBruger, updateBrugerPassword } from '../controllers/brugerController.js'
import requireAuth from "../middleware/requireAuth.js";

const router = express.Router();
// router.use(requireAuth) 

// GET alle brugere
router.get("/", getBrugere)

// GET en enkelt bruger
router.get('/:id', getBruger)

// OPDATER en bruger
router.patch('/:id', updateBruger)

// OPDATER en brugers password
router.patch('/updatePassword/:id', updateBrugerPassword)

// login route
router.post('/login', loginBruger)

// signup route
router.post('/signup', signupBruger)

export default router;