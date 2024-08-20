import mongoose from "mongoose"

const Schema = mongoose.Schema;

const posteringSchema = new Schema({
    dato: Date,
    handymanTimer: Number,
    tømrerTimer: Number,
    udlæg: [{
        beskrivelse: String,
        beløb: Number
    }],
    øvrigt: [{
        beskrivelse: String,
        beløb: Number
    }],
    opgaveID: String,
    brugerID: String
}, { timestamps: true })

const model = mongoose.model('Postering', posteringSchema);

export default model;