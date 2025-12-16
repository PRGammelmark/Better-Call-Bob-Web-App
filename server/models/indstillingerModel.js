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
  }
}, { timestamps: true });

export default mongoose.model("Indstillinger", indstillingerSchema);
