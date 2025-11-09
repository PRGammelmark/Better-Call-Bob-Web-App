import Reminder from "../models/reminderModel.js";
import { opretNotifikation } from "../utils/notifikationFunktioner.js";

export const startReminderScheduler = () => {
  // Check every 2 minutes
  setInterval(async () => {
    try {
      const nu = new Date();
      const due = await Reminder.find({ status: 'pending', sendesKl: { $lte: nu } }).limit(50);
      for (const r of due) {
        try {
          console.log(`📅 Sender reminder notifikation for reminder ${r._id} til bruger ${r.brugerID}`);
          await opretNotifikation({
            modtagerID: r.brugerID,
            udløserID: undefined, // Reminders are self-triggered, so no udløserID
            type: 'reminder',
            titel: r.titel,
            besked: r.beskrivelse || 'Reminder',
            link: `/opgave/${r.opgaveID}`,
            erVigtig: true
          });
          r.status = 'sent';
          await r.save();
          console.log(`✅ Reminder ${r._id} markeret som sendt`);
        } catch (e) {
          console.error(`❌ Fejl ved udsendelse af reminder-notifikation for ${r._id}:`, e);
        }
      }
    } catch (err) {
      console.error('Reminder scheduler fejl:', err);
    }
  }, 2 * 60 * 1000);
};


