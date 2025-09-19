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
  }
}, { timestamps: true });

export default mongoose.model("Indstillinger", indstillingerSchema);
