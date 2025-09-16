import mongoose from "mongoose";

const indstillingerSchema = new mongoose.Schema({
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
