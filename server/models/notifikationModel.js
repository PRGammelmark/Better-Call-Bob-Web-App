import mongoose from "mongoose"

const Schema = mongoose.Schema;

const notifikationSchema = new Schema({
    modtagerID: {
        type: Schema.Types.ObjectId,
        ref: 'Bruger'
    },
    udløserID:{
        type: Schema.Types.ObjectId,
        ref: 'Bruger'
    },
    type: {
        type: String,
        required: true
    },
    titel: {
        type: String,
        required: true
    },
    besked: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: false
    },
    læst: {
        type: Boolean,
        default: false
    },
    set: {
        type: Boolean,
        default: false
    },
    arkiveret: {
        type: Boolean,
        default: false
    },
    erVigtig: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })

notifikationSchema.index({ modtagerID: 1, læst: 1, createdAt: -1 });

notifikationSchema.index(
    { createdAt: 1 },
    { expireAfterSeconds: 60 * 60 * 24 * 365 * 2 } // 2 år
  );

const model = mongoose.model('Notifikation', notifikationSchema);

export default model;