import mongoose from "mongoose"

const Schema = mongoose.Schema;

const varerSchema = new Schema({
    varenummer: {
        type: String,
        trim: true
    },
    navn: {
        type: String,
        trim: true
    },
    beskrivelse: {
        type: String,
        required: true,
        trim: true
    },
    billedeURL: {
        type: String,
        trim: true
    },
    kostpris: {
        type: Number,
        default: 0,
        min: 0
    },
    listepris: {
        type: Number,
        default: 0,
        min: 0
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

export default mongoose.model('Varer', varerSchema);

