import mongoose from "mongoose"

const Schema = mongoose.Schema;

const kommentarSchema = new Schema({
    kommentarIndhold: {
        type: String,
        required: true
    },
    brugerID: {
        type: Schema.Types.ObjectId,
        ref: 'Bruger'
    },
    opgaveID: {
        type: Schema.Types.ObjectId,
        ref: 'Opgave'
    }
}, { timestamps: true })

const model = mongoose.model('Kommentar', kommentarSchema);

export default model;