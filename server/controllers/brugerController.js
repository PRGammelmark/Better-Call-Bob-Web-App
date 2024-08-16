import Bruger from '../models/brugerModel.js'
import mongoose from 'mongoose'
import jwt from "jsonwebtoken"

const createToken = (_id) => {
    return jwt.sign({_id}, process.env.SECRET, { expiresIn: '28d' })
}

// login bruger

const loginBruger = async (req,res) => {
    const { email, password } = req.body;

    try {
        const bruger = await Bruger.login(email, password);

        // create token
        const token = createToken(bruger._id)

        res.status(200).json({email, navn: bruger.navn, token})
    } catch (error) {
        res.status(400).json({error: error.message})
    }
}

// signup bruger

const signupBruger = async (req,res) => {

    const { navn, adresse, telefon, email, password } = req.body;

    try {
        const bruger = await Bruger.signup(navn, adresse, telefon, email, password);
        res.status(200).json({email, bruger})
    } catch (error) {
        res.status(400).json({error: error.message})
    }
}

export {
    loginBruger,
    signupBruger
}