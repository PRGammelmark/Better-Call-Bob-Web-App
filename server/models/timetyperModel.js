import mongoose from "mongoose"

const Schema = mongoose.Schema;

const timetypeSchema = new Schema({
    navn: {
        type: String,
        required: true
    },
    nummer: {
        type: Number,
        required: true,
        unique: true
    },
    farve: {
        type: String,
        required: false,
        default: "#3b82f6" // Standard blå farve
    },
    listepris: {
        type: Number,
        required: true,
        min: 0
    },
    kostpris: {
        type: Number,
        required: true,
        min: 0
    },
    beskrivelse: {
        type: String,
        required: false
    },
    aktiv: {
        type: Boolean,
        default: true
    },
    rækkefølge: {
        type: Number,
        default: 0
    }
}, { timestamps: true })

const model = mongoose.model('Timetype', timetypeSchema);

export default model;

