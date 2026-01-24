import mongoose from "mongoose"

const Schema = mongoose.Schema;

const pauseSchema = new Schema({
    navn: {
        type: String,
        required: true,
        trim: true
    },
    beskrivelse: {
        type: String,
        trim: true
    },
    varighed: {
        type: Number,
        required: true,
        min: 0,
        default: 30 // Varighed i minutter
    },
    lønnet: {
        type: Boolean,
        default: false
    },
    aktiv: {
        type: Boolean,
        default: true
    },
    rækkefølge: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

export default mongoose.model('Pause', pauseSchema);

