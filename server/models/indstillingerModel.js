import mongoose from "mongoose";

const indstillingerSchema = new mongoose.Schema({
  // Der må kun oprettes ét indstillinger-dokument i DB
  singleton: {
    type: String,
    default: "ONLY_ONE",
    unique: true,
  },
  opgavetyperKategorier: {
    type: [String],
    default: ["Handyman", "Tømrer", "VVS", "Elektriker", "Murer", "Rengøring"]
  },
  arbejdsområdeKilometerRadius: {
    type: Number,
    default: 20
  },
  sidsteFakturaBetalingstjek: {
    type: Date,
    default: null
  },
  virksomhedsnavn: {
    type: String,
    default: ""
  },
  cvrNummer: {
    type: String,
    default: ""
  },
  adresse: {
    type: String,
    default: ""
  },
  postnummer: {
    type: String,
    default: ""
  },
  by: {
    type: String,
    default: ""
  },
  telefonnummer: {
    type: String,
    default: ""
  },
  email: {
    type: String,
    default: ""
  },
  hjemmeside: {
    type: String,
    default: ""
  },
  handelsbetingelser: {
    type: String,
    default: ""
  },
  persondatapolitik: {
    type: String,
    default: ""
  },
  aiExtraRules: {
    type: String,
    default: ""
  },
  aiTidsestimaterPrompt: {
    type: String,
    default: ""
  },
  logo: {
    type: String,
    default: ""
  },
  logoSize: {
    type: Number,
    default: 100
  },
  bookingLogo: {
    type: String,
    default: ""
  },
  bookingFavicon: {
    type: String,
    default: ""
  },
  bookingRedirectUrl: {
    type: String,
    default: ""
  },
  medarbejdereKanGiveRabat: {
    type: Boolean,
    default: false
  },
  maksRabatSats: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  modregnKunderabatIMedarbejderlon: {
    type: Boolean,
    default: false
  },
  modregningsmetode: {
    type: String,
    enum: ["Match beløb", "Match procentdel"],
    default: "Match beløb"
  },
  laasPosteringerEfterAntalDage: {
    type: Boolean,
    default: false
  },
  laasPosteringerEfterAntalDageVærdi: {
    type: Number,
    default: 1,
    min: 1,
    max: 7
  },
  laasPosteringerAutomatisk: {
    type: Boolean,
    default: false
  },
  laasPosteringerAutomatiskType: {
    type: String,
    enum: ["ugedag", "månedsdag"],
    default: "ugedag"
  },
  laasPosteringerAutomatiskUgedag: {
    type: Number,
    default: 1,
    min: 0,
    max: 6
  },
  laasPosteringerAutomatiskMånedsdag: {
    type: Number,
    default: 1,
    min: 1,
    max: 31
  },
  // Moms indstillinger
  tilgængeligeMomssatser: {
    type: [{
      land: { type: String, required: true },
      sats: { type: Number, required: true, min: 0, max: 100 },
      navn: { type: String }
    }],
    default: [
      { land: 'DK', sats: 25, navn: 'Danmark (25%)' },
      { land: 'DK', sats: 0, navn: 'Momsfri (0%)' }
    ]
  },
  standardMomssats: {
    type: {
      land: { type: String, default: 'DK' },
      sats: { type: Number, default: 25, min: 0, max: 100 }
    },
    default: { land: 'DK', sats: 25 }
  },
  // Honorar indstillinger
  timelønViaArbejdssedler: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

export default mongoose.model("Indstillinger", indstillingerSchema);
