import mongoose from "mongoose"

const Schema = mongoose.Schema;

const posteringSchema = new Schema({
    dato: Date,
    beskrivelse: String,
    opstart: Number,
    handymanTimer: Number,
    tømrerTimer: Number,
    udlæg: [{
        beskrivelse: String,
        beløb: Number,
        kvittering: String // Added field to store image
    }],
    øvrigt: [{
        beskrivelse: String,
        beløb: Number,
        kvittering: String // Added field to store image
    }],
    aftentillæg: Boolean,
    natTillæg: Boolean,
    satser: Object,
    fastHonorar: Number,
    fastPris: Number,
    dynamiskHonorar: Number,
    dynamiskPris: Number,
    opgaveID: String,
    brugerID: String
}, { timestamps: true })

const model = mongoose.model('Postering', posteringSchema);

export default model;