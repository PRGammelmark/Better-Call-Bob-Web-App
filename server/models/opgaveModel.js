import mongoose from "mongoose"

const Schema = mongoose.Schema;

const opgaverSchema = new Schema({
    opgaveBeskrivelse: {
        type: String,
        required: true
    },
    navn: {
        type: String,
        required: true
    },
    adresse: {
        type: String,
        required: true
    },
    postnummerOgBy: {
        type: String,
        required: true
    },
    telefon: {
        type: Number,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    onsketDato: {
        type: Date,
        required: true
    },
    harStige: {
        type: Boolean,
        required: false
    },
    status: {
        type: String,
        required: true,
        default: "Modtaget"
    },
    fremskridt: {
        type: String,
        required: true,
        default: "Åben opgave"
    },
    ansvarlig: [{
        type: Object,
        required: false
    }],
    planlagt: [{
        dato: Date,
        tidFra: String,
        tidTil: String,
        ansvarlig: String
    }],
    markeretSomFærdig: {
        type: Boolean,
        default: false,
        required: false
    },
    opgaveAfsluttet: {
        type: Boolean,
        default: false,
        required: false
    },
    opgaveBetalt: {
        type: Boolean,
        default: false,
        required: false
    },
    fakturaPDF: {
        type: Buffer,
        required: false
    },
    fakturaPDFUrl: {
        type: String,
        required: false
    },
    incrementalID: {
        type: Number,
        unique: true
    }
}, { timestamps: true })

const model = mongoose.model('Opgave', opgaverSchema);

export default model;