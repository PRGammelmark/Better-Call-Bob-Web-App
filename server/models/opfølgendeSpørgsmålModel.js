import mongoose from "mongoose"

const Schema = mongoose.Schema;

const opfølgendeSpørgsmålSchema = new Schema({
    spørgsmål: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['Ja/nej', 'Valgmuligheder'],
        required: true
    },
    opgavetyper: {
        type: [String], // Array af opgavetype navne (f.eks. ["Ophængning", "Maling"])
        default: []
    },
    selectOptions: {
        type: [String], // Kun relevant hvis type === 'Valgmuligheder'
        default: []
    },
    erStandard: {
        type: Boolean,
        default: false // Hvis true, vises for alle kategorier
    },
    rækkefølge: {
        type: Number,
        default: 0 // For at sortere spørgsmål
    },
    feltNavn: {
        type: String,
        required: true,
        unique: true // Unikt navn til at gemme svaret (f.eks. "harStige", "harMaterialer")
    }
}, { timestamps: true })

const model = mongoose.model('OpfølgendeSpørgsmål', opfølgendeSpørgsmålSchema);
export default model;

