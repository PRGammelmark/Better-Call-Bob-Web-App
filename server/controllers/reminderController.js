import Reminder from "../models/reminderModel.js";
import { opretNotifikation } from "../utils/notifikationFunktioner.js";

export const opretReminder = async (req, res) => {
  try {
    const { brugerID, opgaveID, titel, beskrivelse, sendesKl, linkType, kundeID } = req.body;
    if (!brugerID || !opgaveID || !titel || !sendesKl) {
      return res.status(400).json({ message: "Mangler påkrævede felter" });
    }

    const reminderData = { 
      brugerID, 
      opgaveID, 
      titel, 
      beskrivelse, 
      sendesKl: new Date(sendesKl),
      linkType: linkType || 'opgave',
      kundeID: linkType === 'kunde' && kundeID ? kundeID : undefined
    };

    const reminder = await Reminder.create(reminderData);

    // Determine link for confirmation notification
    const confirmationLink = linkType === 'kunde' && kundeID 
      ? `/kunde/${kundeID}` 
      : `/opgave/${opgaveID}`;

    // Bekræftelsesnotifikation nu
    try {
      await opretNotifikation({
        modtagerID: brugerID,
        udløserID: brugerID,
        type: "reminderOprettet",
        titel: `Reminder oprettet: ${titel}`,
        besked: beskrivelse ? beskrivelse : "Din reminder er oprettet.",
        link: confirmationLink
      });
    } catch (e) {
      console.error("Kunne ikke oprette bekræftelsesnotifikation:", e);
    }

    res.status(201).json(reminder);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const hentMineReminders = async (req, res) => {
  try {
    const { brugerID } = req.params;
    const reminders = await Reminder.find({ brugerID }).sort({ sendesKl: 1 });
    res.json(reminders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const sletReminder = async (req, res) => {
  try {
    const { id } = req.params;
    await Reminder.findByIdAndDelete(id);
    res.status(204).end();
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const opdaterReminder = async (req, res) => {
  try {
    const { id } = req.params;
    const { titel, beskrivelse, sendesKl, status, brugerID, linkType, kundeID } = req.body;
    const update = {};
    if (titel !== undefined) update.titel = titel;
    if (beskrivelse !== undefined) update.beskrivelse = beskrivelse;
    if (sendesKl !== undefined) update.sendesKl = new Date(sendesKl);
    if (status !== undefined) update.status = status;
    if (brugerID !== undefined) update.brugerID = brugerID;
    if (linkType !== undefined) update.linkType = linkType;
    if (kundeID !== undefined) {
      update.kundeID = linkType === 'kunde' && kundeID ? kundeID : undefined;
    }
    const r = await Reminder.findByIdAndUpdate(id, update, { new: true });
    res.json(r);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const hentReminderForOpgave = async (req, res) => {
  try {
    const { brugerID, opgaveID } = req.params;
    const r = await Reminder.findOne({ brugerID, opgaveID, status: { $ne: 'cancelled' } });
    if (!r) return res.status(404).end();
    res.json(r);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


