import mongoose from "mongoose"
import bcrypt from "bcrypt"
import validator from "validator"

const Schema = mongoose.Schema;

const brugerSchema = new Schema({
    navn: {
        type: String,
        required: true
    },
    telefon: {
        type: Number,
        required: false
    },
    adresse: {
        type: String,
        required: false
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
})

// static signup method
brugerSchema.statics.signup = async function (navn, adresse, telefon, email, password) {
    
    // validation
    if (!email || !password) {
        throw Error("Du skal udfylde de påkrævede felter.")
    }

    if (!validator.isEmail(email)) {
        throw Error("Emailen er ikke gyldig.")
    }

    if(!validator.isStrongPassword(password)) {
        throw Error("Din adgangskode er ikke stærk nok. Brug en kombination af store bogstaver, små bogstaver, tal og symboler.")
    }

    const exists = await this.findOne({ email })

    if(exists) {
        throw Error("Emailen findes allerede.")
    }

    // signup bruger
    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(password, salt)

    const bruger = await this.create({ navn, telefon, adresse, email, password: hash })

    return bruger
}

// static login method
brugerSchema.statics.login = async function(email, password) {
    
    if (!email || !password) {
        throw Error("Du skal udfylde de påkrævede felter.")
    }

    const bruger = await this.findOne({ email })

    if(!bruger) {
        throw Error("Der findes ingen brugere med denne email i databasen.")
    }

    const match = await bcrypt.compare(password, bruger.password)

    if(!match) {
        throw Error("Forkert kodeord.")
    }

    return bruger
}

const model = mongoose.model('Bruger', brugerSchema);

export default model;