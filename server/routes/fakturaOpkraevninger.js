import express from "express";
import requireAuth from "../middleware/requireAuth.js";
import Postering from "../models/posteringModel.js";

const router = express.Router();

// Apply authentication middleware only to the routes that require it
router.use(requireAuth);

// POST registrer opkrævninger
router.post('/registrer-opkraevninger', async (req, res) => {
    
    const { posteringer, reference, metode, opkrævningsbeløb } = req.body;

            for (const postering of posteringer) {
                const dbPostering = await Postering.findById(postering._id);
                if (dbPostering) {
                    dbPostering.opkrævninger.push({
                        reference: reference,
                        opkrævningsbeløb: opkrævningsbeløb,
                        metode: metode,
                        dato: new Date()
                    });
                    await dbPostering.save();
                }
            }

    res.status(200).json({ message: 'Opkrævninger registreret.' });
});

export default router;