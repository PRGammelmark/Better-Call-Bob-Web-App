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
    CVR: {
        type: String,
        required: false
    },
    virksomhed: {
        type: String,
        required: false
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
    fakturaOprettesManuelt: {
        type: Boolean,
        default: false
    },
    tilbudAfgivet: {
        type: String,
        required: false
    },
    markeretSomFærdig: {
        type: Boolean,
        default: false
    },
    opgaveAfsluttet: {
        type: Boolean,
        default: false,
        required: false
    },
    opgaveBetaltMedMobilePay: {
        type: String,
        required: false
    },
    fakturaSendt: {
        type: String,
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
    fakturaBetalt: {
        type: String,
        required: false
    },
    incrementalID: {
        type: Number,
        unique: true
    },
    sidsteSMSSendtTilKundenOmPåVej: {
        type: Date,
        required: false
    },
    isDeleted: {
        type: Date,
        default: false
    }
}, { timestamps: true })

const model = mongoose.model('Opgave', opgaverSchema);

export default model;