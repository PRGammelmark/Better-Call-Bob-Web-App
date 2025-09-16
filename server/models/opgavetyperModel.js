import mongoose from "mongoose"

const Schema = mongoose.Schema;

const opgavetyperSchema = new Schema({
    opgavetype: {
        type: String,
        required: true
    },
    kategorier: {
        type: [
            String
        ],
        default: []
    },
    kompleksitet: {
        type: Number,
        required: false
    }
})

const model = mongoose.model('Opgavetyper', opgavetyperSchema);

export default model;