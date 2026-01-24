import mongoose from "mongoose"

const Schema = mongoose.Schema;

const posteringSchema = new Schema({
    dato: Date,
    beskrivelse: String,
    type: {
        type: String,
        enum: ['debet', 'kredit'],
        default: 'debet'
    },
    kreditererPostering: {
        type: Schema.Types.ObjectId,
        ref: 'Postering'
    },
    kreditKommentar: String,
    satser: Object,
    timeregistrering: {
        type: [{
            _id: { type: Schema.Types.ObjectId, auto: true },
            timetypeId: { type: Schema.Types.ObjectId, ref: 'Timetype' },
            navn: String,
            beskrivelse: String,
            antal: {
                type: Number,
                required: true,
                min: 0
            },
            pris: {
                sats: { type: Number, required: true, min: 0 },
                rabatProcent: { type: Number, min: 0, max: 100, default: 0 },
                rabatBeløb: { type: Number, min: 0, default: 0 },
                momsLand: { type: String, default: 'DK' },
                momsSats: { type: Number, default: 25 },
                momsType: { type: String, enum: ['default', 'overskriv', 'momsfri'], default: 'default' },
                totalEksMoms: { type: Number, required: true, min: 0 },
                momsBeløb: { type: Number, required: true, min: 0 },
                totalInklMoms: { type: Number, required: true, min: 0 }
            },
            honorar: {
                sats: { type: Number, required: true, min: 0 },
                rabatProcent: { type: Number, min: 0, max: 100, default: 0 },
                rabatBeløb: { type: Number, min: 0, default: 0 },
                total: { type: Number, required: true, min: 0 }
            }
        }],
        default: []
    },
    fasteTillæg: {
        type: [{
            _id: { type: Schema.Types.ObjectId, auto: true },
            tillaegId: { type: Schema.Types.ObjectId, ref: 'FasteTillaeg' },
            navn: String,
            beskrivelse: String,
            antal: {
                type: Number,
                required: true,
                min: 0
            },
            pris: {
                sats: { type: Number, required: true, min: 0 },
                rabatProcent: { type: Number, min: 0, max: 100, default: 0 },
                rabatBeløb: { type: Number, min: 0, default: 0 },
                momsLand: { type: String, default: 'DK' },
                momsSats: { type: Number, default: 25 },
                momsType: { type: String, enum: ['default', 'overskriv', 'momsfri'], default: 'default' },
                totalEksMoms: { type: Number, required: true, min: 0 },
                momsBeløb: { type: Number, required: true, min: 0 },
                totalInklMoms: { type: Number, required: true, min: 0 }
            },
            honorar: {
                sats: { type: Number, required: true, min: 0 },
                rabatProcent: { type: Number, min: 0, max: 100, default: 0 },
                rabatBeløb: { type: Number, min: 0, default: 0 },
                total: { type: Number, required: true, min: 0 }
            }     
        }],
        default: []
    },
    procentTillæg: {
        type: [{
            _id: { type: Schema.Types.ObjectId, auto: true },
            procentTillaegId: { type: Schema.Types.ObjectId, ref: 'ProcentTillaeg' },
            timetypeId: { type: Schema.Types.ObjectId, ref: 'Timetype' },
            navn: String,
            beskrivelse: String,
            timetypeNavn: String,
            timetypeAntal: Number,
            pris: {
                procentSats: { type: Number, required: true, min: 0 },
                grundlag: { type: Number, required: true, min: 0 },
                rabatProcent: { type: Number, min: 0, max: 100, default: 0 },
                rabatBeløb: { type: Number, min: 0, default: 0 },
                momsLand: { type: String, default: 'DK' },
                momsSats: { type: Number, default: 25 },
                momsType: { type: String, enum: ['default', 'overskriv', 'momsfri'], default: 'default' },
                totalEksMoms: { type: Number, required: true, min: 0 },
                momsBeløb: { type: Number, required: true, min: 0 },
                totalInklMoms: { type: Number, required: true, min: 0 }
            },
            honorar: {
                procentSats: { type: Number, required: true, min: 0 },
                grundlag: { type: Number, required: true, min: 0 },
                rabatProcent: { type: Number, min: 0, max: 100, default: 0 },
                rabatBeløb: { type: Number, min: 0, default: 0 },
                total: { type: Number, required: true, min: 0 }
            }     
        }],
        default: []
    },
    materialer: {
        type: [{
            _id: { type: Schema.Types.ObjectId, auto: true },
            varenummer: String,
            beskrivelse: String,
            antal: {
                type: Number,
                required: true,
                min: 0
            },
            kostpris: {
                type: Number,
                required: true,
                min: 0
            },
            salgspris: {
                type: Number,
                min: 0
            },
            momsLand: { type: String, default: 'DK' },
            momsSats: { type: Number, default: 25 },
            momsType: { type: String, enum: ['default', 'overskriv', 'momsfri'], default: 'default' },
            totalEksMoms: { type: Number, required: true, min: 0 },
            momsBeløb: { type: Number, required: true, min: 0 },
            totalInklMoms: { type: Number, required: true, min: 0 },
            manueltRegistreret: {
                type: Boolean,
                default: false
            },
            erUdlaeg: {
                type: Boolean,
                default: false
            },
            totalMedarbejderUdlaeg: {
                type: Number,
                default: 0
            },
            restMedarbejderUdlaeg: {
                type: Number,
                default: 0
            },
            kvittering: String,
            billede: String
        }],
        default: []
    },
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
    opgaveID: String,
    brugerID: String,
    kundeID: String,
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
            betalingsfrist: Date,
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
    betalt: Date,
    lukket: Date,
    kommentar: String,
    låst: {
        type: Boolean,
        default: false
    },
    momsDefault: {
        land: { type: String, default: "DK" },
        sats: { type: Number, default: 25 }
    },
    tilbudsPrisEksklMoms: {
        type: Number,
        default: undefined
    },
    totalPrisEksklMoms: Number,
    totalMoms: Number,
    totalPrisInklMoms: Number,
    totalDynamiskHonorar: Number,
    totalFastHonorar: Number,
    brugDynamiskHonorar: {
        type: Boolean,
        default: false
    },
    brugFastHonorar: {
        type: Boolean,
        default: false
    },
    billeder: {
        type: [String],
        default: []
    },
    posteringVersion: {
        type: Number,
        default: undefined
    },
    // ** ----- End of new fields ----- **//


    // ** ----- LEGACY: Gamle felter, der skal migreres og fjernes på sigt ----- **//
    opstart: Number,
    handymanTimer: Number,
    tømrerTimer: Number,
    rådgivningOpmålingVejledning: Number,
    aftenTillæg: Boolean,
    natTillæg: Boolean,
    trailer: Boolean,
    rabatProcent: Number,
    dynamiskHonorarBeregning: Boolean,
    dynamiskPrisBeregning: Boolean,
    fastHonorar: Number,
    fastPris: Number,
    dynamiskHonorar: Number,
    dynamiskPris: Number,
    totalHonorar: Number,
    totalPris: Number,
    udlæg: { 
        type:[{
            beskrivelse: String,
            beløb: Number,
            momsSats: { type: Number, default: 25 },
            momsBeløb: { type: Number, required: true, min: 0 },
            totalEksMoms: { type: Number, required: true, min: 0 },
            totalInklMoms: { type: Number, required: true, min: 0 },
            kvittering: String
        }], 
        default: [] 
    }
}, { timestamps: true })

const model = mongoose.model('Postering', posteringSchema);

export default model;