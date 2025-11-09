import mongoose from "mongoose"

const Schema = mongoose.Schema;

const kundeSchema = new Schema({
    fornavn: {
        type: String,
        required: true
    },
    efternavn: {
        type: String,
        required: true
    },
    navn: {
        type: String,
        required: true
    },
    virksomhed: {
        type: String,
        required: false
    },
    CVR: {
        type: String,
        required: false
    },
    fakturerbarAdresse: {
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
        required: false
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    harStige: {
        type: Boolean,
        default: false
    },
    måKontaktesMedReklame: {
        type: Boolean,
        default: false
    },
    engelskKunde: {
        type: Boolean,
        default: false
    },
    satser: {
        type: Object,
        required: false
    },
    noter: {
        type: String,
        required: false
    },
    kilde: {
        type: String,
        required: false
    }
}, { timestamps: true })

const model = mongoose.model('Kunde', kundeSchema);

export default model;