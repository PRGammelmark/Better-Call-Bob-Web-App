import express from "express";
import requireAuth from "../middleware/requireAuth.js";
import Postering from "../models/posteringModel.js";

const router = express.Router();

// Apply authentication middleware only to the routes that require it
router.use(requireAuth);

// POST registrer opkrævninger
router.post('/registrer-opkraevninger', async (req, res) => {
    
    const { posteringer, reference, metode, opkrævningsbeløb } = req.body;

    // Valider at opkrævningsbeløb er med og er et gyldigt tal
    if (opkrævningsbeløb === undefined || opkrævningsbeløb === null || isNaN(Number(opkrævningsbeløb))) {
        return res.status(400).json({ error: 'Opkrævningsbeløb skal altid være med og være et gyldigt tal.' });
    }

            const opkrævningsDato = new Date();
            // Set betalingsfrist to 8 days from opkrævningsdato if metode is 'faktura'
            const betalingsfrist = metode === 'faktura' 
                ? new Date(opkrævningsDato.getTime() + 8 * 24 * 60 * 60 * 1000)
                : undefined;

            for (const postering of posteringer) {
                const dbPostering = await Postering.findById(postering._id);
                if (dbPostering) {
                    const opkrævning = {
                        reference: reference,
                        opkrævningsbeløb: Number(opkrævningsbeløb),
                        metode: metode,
                        dato: opkrævningsDato
                    };
                    
                    if (betalingsfrist) {
                        opkrævning.betalingsfrist = betalingsfrist;
                    }
                    
                    dbPostering.opkrævninger.push(opkrævning);
                    await dbPostering.save();
                }
            }

    res.status(200).json({ message: 'Opkrævninger registreret.' });
});

export default router;