import express from "express";
import requireAuth from "../middleware/requireAuth.js";
import Postering from "../models/posteringModel.js";

const router = express.Router();

// Apply authentication middleware only to the routes that require it
router.use(requireAuth);

// POST registrer opkrævninger
router.post('/registrer-opkraevninger', async (req, res) => {
    
    const { posteringer, reference, metode, opkrævningsbeløb } = req.body;

            const opkrævningsDato = new Date();
            // Set betalingsdato to 8 days from opkrævningsdato if metode is 'faktura'
            const betalingsdato = metode === 'faktura' 
                ? new Date(opkrævningsDato.getTime() + 8 * 24 * 60 * 60 * 1000)
                : undefined;

            for (const postering of posteringer) {
                const dbPostering = await Postering.findById(postering._id);
                if (dbPostering) {
                    const opkrævning = {
                        reference: reference,
                        opkrævningsbeløb: opkrævningsbeløb,
                        metode: metode,
                        dato: opkrævningsDato
                    };
                    
                    if (betalingsdato) {
                        opkrævning.betalingsdato = betalingsdato;
                    }
                    
                    dbPostering.opkrævninger.push(opkrævning);
                    await dbPostering.save();
                }
            }

    res.status(200).json({ message: 'Opkrævninger registreret.' });
});

export default router;