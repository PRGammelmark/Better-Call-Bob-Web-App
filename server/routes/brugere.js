import express from "express"
import { loginBruger, signupBruger, getBrugere, getBruger, updateBruger, updateBrugerPassword, subscribeToPush, unSubscribeToPush } from '../controllers/brugerController.js'
import requireAuth from "../middleware/requireAuth.js";

const router = express.Router();

// login route
router.post('/login', loginBruger)

// signup route
router.post('/signup', signupBruger)

// GET alle brugere
router.get("/", getBrugere)

router.use(requireAuth) 

// GET en enkelt bruger
router.get('/:id', getBruger)

// OPDATER en bruger
router.patch('/:id', updateBruger)

// OPDATER en brugers password
router.patch('/updatePassword/:id', updateBrugerPassword)

// subscribe to push
router.post('/push-subscribe', subscribeToPush)

// unsubscribe from push
router.post('/push-unsubscribe', unSubscribeToPush)

export default router;