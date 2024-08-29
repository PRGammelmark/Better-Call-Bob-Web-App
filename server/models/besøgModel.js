import mongoose from "mongoose"

const Schema = mongoose.Schema;

const besøgSchema = new Schema({
    datoTidFra: {
        type: Date,
        required: true
    },
    datoTidTil: {
        type: Date,
        required: true
    },
    brugerID: {
        type: String,
        required: true
    },
    opgaveID: {
        type: String,
        required: true
    }
})

const model = mongoose.model('Besøg', besøgSchema);

export default model;