import mongoose from "mongoose"

const Schema = mongoose.Schema;

const posteringSchema2 = new Schema({
    dato: Date,
    beskrivelse: String,
    timeregistrering: {
        type: [{
            navn: String,
            enhedspris: Number,
            honorar: Number,
            antal: Number,
            totalPris: Number,
            totalHonorar
        }],
        default: []
    },
    fasteTillæg: {
        type: [{
            navn: String,
            enhedspris: Number,
            honorar: Number,
            antal: {
                type: Number,
                default: 1
            },
            totalPris: Number,
            totalHonorar: Number
        }],
        default: []
    },
    procentTillæg: {
        type: [{
            navn: String,
            procent: Number,
            givTillægPåTimeregistrering: {
                type: Boolean,
                default: true
            },
            givTillægPåFasteTillæg: {
                type: Boolean,
                default: true
            },
            givTillægPåUdlæg: {
                type: Boolean,
                default: false
            },
            honorarTillægMatcherFaktiskTillæg: {
                type: Boolean,
                default: false,
            },
            honorarTillægMatcherProcentvisTillæg: {
                type: Boolean,
                default: true
            },
            totalPris: Number,
            totalHonorar: Number
        }],
        default: []
    },
    udlæg: { 
        type:[{
            beskrivelse: String,
            beløb: Number,
            kvittering: String
        }], 
        default: [] 
    },
    rabat: {
        type: [{
            procentvisRabat: Number,
            fastBeløbRabat: Number,
            givRabatPåTimeregistrering: {
                type: Boolean,
                default: true
            },
            givRabatPåFasteTillæg: {
                type: Boolean,
                default: true
            },
            givRabatPåProcentTillæg: {
                type: Boolean,
                default: true
            },
            givRabatPåUdlæg: {
                type: Boolean,
                default: false
            },
            honorarRabatMatcherFaktiskRabat: {
                type: Boolean,
                default: false
            },
            honorarRabatMatcherProcentvisRabat: {
                type: Boolean,
                default: false
            }
        }]
    },
    satser: Object,
    moms: {
        type: {
            land: String,
            sats: Number
        }
    },
    beregninger: {
        type: {
            dynamiskHonorarBeregning: Boolean,
            dynamiskPrisBeregning: Boolean,
            fastHonorar: Number,
            fastPris: Number,
            dynamiskHonorar: Number,
            dynamiskPris: Number,
            totalHonorar: Number,
            totalPris: Number,
        }
    },
    relationer: {
        type: {
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
            }
        }
    },
    betalt: Date,
    opkrævninger: {
        type: [{
            reference: String,
            url: String,
            opkrævningsbeløb: Number,
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

const model = mongoose.model('Postering', posteringSchema2);

export default model;