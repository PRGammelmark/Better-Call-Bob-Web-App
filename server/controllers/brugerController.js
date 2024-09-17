import Bruger from '../models/brugerModel.js'
import mongoose from 'mongoose'
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import validator from "validator"

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

// OPDATER en bruger
const updateBruger = async (req,res) => {
    const { id } = req.params

    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(400).json({error: 'Ingen brugere fundet med et matchende ID.'})
    }

    const bruger = await Bruger.findOneAndUpdate({_id: id}, {
        ...req.body
    })

    if(!bruger) {
        return res.status(400).json({error: 'Ingen brugere fundet med et matchende ID.'})
    }

    res.status(200).json(bruger)
}

// OPDATER en brugers kodeord

const updateBrugerPassword = async (req, res) => {
    const { id } = req.params
    const { password } = req.body

    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(400).json({error: 'Ingen brugere fundet med et matchende ID.'})
    }

    // if(!validator.isStrongPassword(password)) {
    //     res.status(500).send('Adgangskode er ikke stærk nok!');
    // }

    const salt = await bcrypt.genSalt(12)
    const hash = await bcrypt.hash(password, salt)

    const bruger = await Bruger.findOneAndUpdate({_id: id}, {password: hash})

    res.status(200).json(hash)
}

// login bruger

const loginBruger = async (req,res) => {
    const { email, password } = req.body;

    try {
        const bruger = await Bruger.login(email, password);

        // create token
        const token = createToken(bruger._id)

        res.status(200).json({id: bruger._id, email, navn: bruger.navn, isAdmin: bruger.isAdmin, token})
    } catch (error) {
        res.status(400).json({error: error.message})
    }
}

// signup bruger

const signupBruger = async (req,res) => {

    const { navn, adresse, titel, telefon, email, password, isAdmin, showTraditionalCalendar } = req.body;

    try {
        const bruger = await Bruger.signup(navn, adresse, titel, telefon, email, password, isAdmin, showTraditionalCalendar);
        res.status(200).json({email, bruger})
    } catch (error) {
        res.status(400).json({error: error.message})
    }
}

export {
    loginBruger,
    signupBruger,
    getBrugere,
    getBruger,
    updateBruger,
    updateBrugerPassword
}