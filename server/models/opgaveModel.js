import mongoose from "mongoose"

const Schema = mongoose.Schema;

const opgaverSchema = new Schema({
    opgaveBeskrivelse: String,
    onsketDato: Date,
    status: {
        type: String,
        default: "Modtaget"
    },
    ansvarlig: [{
        type: Object
    }],
    fakturaOprettesManuelt: Boolean,
    tilbudAfgivet: String,
    markeretSomFærdig: Boolean,
    opgaveAfsluttet: Date,
    opgaveBetaltMedMobilePay: String,
    fakturaSendt: String,
    fakturaPDF: Buffer,
    fakturaPDFUrl: String,
    fakturaBetalt: String,
    opgaveBetaltPåAndenVis: Date,
    incrementalID: {
        type: Number,
        unique: true
    },
    sidsteSMSSendtTilKundenOmPåVej: Date,
    isDeleted: {
        type: Date,
        default: undefined
    },
    opgaveBilleder: Array,
    kundeID: String,
    kunde: {
        type: Schema.Types.ObjectId,
        ref: 'Kunde'
    }
}, { timestamps: true })

const model = mongoose.model('Opgave', opgaverSchema);

export default model;