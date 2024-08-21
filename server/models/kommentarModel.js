import mongoose from "mongoose"

const Schema = mongoose.Schema;

const kommentarSchema = new Schema({
    kommentarIndhold: {
        type: String,
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
}, { timestamps: true })

const model = mongoose.model('Kommentar', kommentarSchema);

export default model;