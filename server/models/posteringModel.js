import mongoose from "mongoose"

const Schema = mongoose.Schema;

const posteringSchema = new Schema({
    dato: Date,
    beskrivelse: String,
    opstart: Number,
    handymanTimer: Number,
    tømrerTimer: Number,
    udlæg: { 
        type:[{
            beskrivelse: String,
            beløb: Number,
            kvittering: String
        }], 
        default: [] 
    },
    aftenTillæg: Boolean,
    natTillæg: Boolean,
    trailer: Boolean,
    rådgivningOpmålingVejledning: Number,
    satser: Object,
    rabatProcent: Number,
    dynamiskHonorarBeregning: Boolean,
    dynamiskPrisBeregning: Boolean,
    fastHonorar: Number,
    fastPris: Number,
    dynamiskHonorar: Number,
    dynamiskPris: Number,
    totalHonorar: Number,
    totalPris: Number,
    opgaveID: String,
    brugerID: String,
    kundeID: String,
    opgave: { 
        type: Schema.Types.ObjectId,
        ref: 'Opgave'
    },
    bruger: { 
        type: Schema.Types.ObjectId,
        ref: 'Bruger'
    },
    kunde: { 
        type: Schema.Types.ObjectId,
        ref: 'Kunde'
    },
    betalt: Date,
    opkrævninger: {
        type: [{
            reference: String,
            url: String,
            metode: {
                type: String,
                enum: ['mobilepay', 'faktura', 'bankoverførsel', 'kontant', 'betalingskort'],
                required: true
            },
            dato: Date,
            manueltRegistreret: {
                type: Boolean,
                default: false
            }
        }],
        default: []
    },
    betalinger: { 
        type: [{
            betalingsID: String,
            betalingsbeløb: Number,
            betalingsmetode: {
                type: String,
                enum: ['mobilepay', 'faktura', 'bankoverførsel', 'kontant', 'betalingskort'],
                required: true
            },
            opkrævetAfBrugerID: {
                type: Schema.Types.ObjectId,
                ref: 'Bruger'
            },
            manueltRegistreret: {
                type: Boolean,
                default: false
            },
            dato: Date,
        }],
        default: [] 
    },
    lukket: Date,
    kommentar: String,
    låst: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })

const model = mongoose.model('Postering', posteringSchema);

export default model;