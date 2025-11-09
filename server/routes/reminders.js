import express from "express";
import { opretReminder, hentMineReminders, sletReminder, opdaterReminder, hentReminderForOpgave } from "../controllers/reminderController.js";

const router = express.Router();

router.post('/', opretReminder);
router.get('/bruger/:brugerID', hentMineReminders);
router.get('/bruger/:brugerID/opgave/:opgaveID', hentReminderForOpgave);
router.delete('/:id', sletReminder);
router.patch('/:id', opdaterReminder);

export default router;


