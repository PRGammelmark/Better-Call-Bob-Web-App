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
        type: Schema.Types.ObjectId,
        ref: 'Bruger'
    },
    opgaveID: {
        type: Schema.Types.ObjectId,
        ref: 'Opgave'
    },
    kundeID: {
        type: Schema.Types.ObjectId,
        ref: 'Kunde'
    },
    kommentar: {
        type: String,
        required: false
    },
    eventColor: {
        type: String,
        required: false
    },
    aiCreated: {
        type: Boolean,
        default: false
    }
})

const model = mongoose.model('Besøg', besøgSchema);

export default model;