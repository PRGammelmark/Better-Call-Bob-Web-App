import mongoose from "mongoose";

const Schema = mongoose.Schema;

const reminderSchema = new Schema({
  brugerID: { type: Schema.Types.ObjectId, ref: 'Bruger', required: true },
  opgaveID: { type: Schema.Types.ObjectId, ref: 'Opgave', required: true },
  titel: { type: String, required: true, maxlength: 60 },
  beskrivelse: { type: String, required: false, maxlength: 200 },
  sendesKl: { type: Date, required: true },
  status: { type: String, enum: ['pending', 'sent', 'cancelled'], default: 'pending' },
  linkType: { type: String, enum: ['opgave', 'kunde'], default: 'opgave' },
  kundeID: { type: Schema.Types.ObjectId, ref: 'Kunde', required: false }
}, { timestamps: true });

reminderSchema.index({ status: 1, sendesKl: 1 });

const Reminder = mongoose.model('Reminder', reminderSchema);

export default Reminder;


