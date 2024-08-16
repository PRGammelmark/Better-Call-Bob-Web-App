import Bruger from '../models/brugerModel.js'
import mongoose from 'mongoose'
import jwt from "jsonwebtoken"

const createToken = (_id) => {
    return jwt.sign({_id}, process.env.SECRET, { expiresIn: '28d' })
}

// GET alle brugere
const getBrugere = async (req,res) => {
    const brugere = await Bruger.find({}).sort({createdAt: -1})
    res.status(200).json(brugere)
}

// GET en enkelt bruger
const getBruger = async (req,res) => {
    const { id } = req.params;
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Ingen bruger fundet med et matchende ID.'})
    }

    const bruger = await Bruger.findById(id)

    if(!bruger) {
        return res.status(404).json({error: 'Ingen bruger fundet med et matchende ID.'})
    }

    res.status(200).json(bruger)
}

// login bruger

const loginBruger = async (req,res) => {
    const { email, password } = req.body;

    try {
        const bruger = await Bruger.login(email, password);

        // create token
        const token = createToken(bruger._id)

        res.status(200).json({email, navn: bruger.navn, isAdmin: bruger.isAdmin, token})
    } catch (error) {
        res.status(400).json({error: error.message})
    }
}

// signup bruger

const signupBruger = async (req,res) => {

    const { navn, adresse, titel, telefon, email, password, isAdmin } = req.body;

    try {
        const bruger = await Bruger.signup(navn, adresse, titel, telefon, email, password, isAdmin);
        res.status(200).json({email, bruger})
    } catch (error) {
        res.status(400).json({error: error.message})
    }
}

export {
    loginBruger,
    signupBruger,
    getBrugere,
    getBruger
}