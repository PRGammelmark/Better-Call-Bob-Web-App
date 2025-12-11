import mongoose from "mongoose"

const Schema = mongoose.Schema;

const opgaverSchema = new Schema({
    opgaveBeskrivelse: String,
    kortOpgavebeskrivelse: String,
    onsketDato: Date,
    onsketTidspunkt: String,
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
    isArchived: {
        type: Date,
        default: undefined
    },
    opgaveBilleder: Array,
    kundeID: String,
    kunde: {
        type: Schema.Types.ObjectId,
        ref: 'Kunde'
    },
    kilde: {
        type: String,
        required: false
    },
    aiCreated: {
        type: Boolean,
        default: false
    },
    // UTM tracking parameters grouped in an object
    utm: {
        source: {
            type: String,
            required: false
        },
        campaign: {
            type: String,
            required: false
        },
        medium: {
            type: String,
            required: false
        },
        term: {
            type: String,
            required: false
        },
        content: {
            type: String,
            required: false
        }
    },
    gclid: {
        type: String,
        required: false
    }
}, { timestamps: true })

const model = mongoose.model('Opgave', opgaverSchema);

export default model;