import mongoose from "mongoose"

const Schema = mongoose.Schema;

const dokumenterSchema = new Schema({
    titel: {
        type: String,
        required: true
    },
    begraensAdgang: {
        type: Boolean,
        required: false
    },
    brugerAdgang: {
        type: Array,
        required: false
    },
    opgaveID: {
        type: String,
        required: false
    },
    beskrivelse: {
        type: String,
        required: false
    },
    kraevSamtykke: {
        type: Boolean,
        required: false
    },
    filSti: {
        type: String,
        required: true
    },
    samtykkeListe: {
        type: [{
            bruger: {
                type: Object,
                required: true
            },
            samtykkeDato: {
                type: Date,
                required: true
            }
        }],
        required: false
    }
}, { timestamps: true })

const model = mongoose.model('Dokument', dokumenterSchema);

export default model;