import mongoose from "mongoose"

const Schema = mongoose.Schema;

const ledigeTiderSchema = new Schema({
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
    kommentar: {
        type: String,
        required: false
    },
    objectIsLedigTid: {
        type: Boolean,
        required: true
    }
})

const model = mongoose.model('LedigeTider', ledigeTiderSchema);

export default model;