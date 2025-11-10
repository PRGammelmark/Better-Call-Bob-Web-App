import express from "express";
import requireAuth from "../middleware/requireAuth.js";
import { natligFakturaBetalingTjek } from "../utils/natligFakturaBetalingTjek.js";
import Bruger from "../models/brugerModel.js";

const router = express.Router();

// POST endpoint til manuel kørsel af fakturabetalingstjek
router.post("/", requireAuth, async (req, res) => {
    try {
        // Tjek om brugeren er admin
        const bruger = await Bruger.findById(req.user._id);
        
        if (!bruger || !bruger.isAdmin) {
            return res.status(403).json({ error: "Kun administratorer kan køre fakturabetalingstjek manuelt." });
        }

        // Kør fakturabetalingstjek med manualCallerID
        await natligFakturaBetalingTjek({ manualCallerID: req.user._id.toString() });

        res.status(200).json({ 
            message: "Fakturabetalingstjek gennemført. Du vil modtage en notifikation med resultatet." 
        });
    } catch (error) {
        console.error("Fejl ved manuel kørsel af fakturabetalingstjek:", error);
        res.status(500).json({ error: "Kunne ikke køre fakturabetalingstjek." });
    }
});

export default router;

