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



// // GET alle brugere
// router.get("/", (req,res) => {
//     res.json({mssg: "GET alle brugere."})
// })

// // GET en enkelt bruger
// router.get('/:id', (req,res) => {
//     res.json({mssg: 'GET en enkelt bruger'})
// })

// // POST en ny bruger
// router.post('/', (req,res) => {
//     res.json({mssg: 'POST en ny bruger'})
// })

// // DELETE en bruger
// router.delete('/:id', (req,res) => {
//     res.json({mssg: 'DELETE en bruger'})
// })

// // OPDATER en bruger
// router.patch('/:id', (req,res) => {
//     res.json({mssg: 'OPDATER en ny bruger'})
// })

export default router;