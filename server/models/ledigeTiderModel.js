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
        type: Schema.Types.ObjectId,
        ref: 'Bruger'
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