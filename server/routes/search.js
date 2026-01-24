import express from "express";
import requireAuth from "../middleware/requireAuth.js";
import Opgave from "../models/opgaveModel.js";
import Kunde from "../models/kunderModel.js";
import Bruger from "../models/brugerModel.js";
import Besøg from "../models/besøgModel.js";

const router = express.Router();

// GET /api/search?q=searchterm
router.get("/", requireAuth, async (req, res) => {
    try {
        const { q } = req.query;
        
        if (!q || q.trim().length < 2) {
            return res.status(400).json({ error: "Søgetekst skal være mindst 2 tegn" });
        }
        
        const searchTerm = q.trim();
        const searchRegex = new RegExp(searchTerm, "i");
        
        // Søg parallelt i alle kollektioner
        const [opgaver, kunder, brugere, besøg] = await Promise.all([
            // Søg i opgaver
            Opgave.find({
                $and: [
                    { isDeleted: { $exists: false } },
                    {
                        $or: [
                            { opgaveBeskrivelse: searchRegex },
                            { kortOpgavebeskrivelse: searchRegex },
                            { status: searchRegex }
                        ]
                    }
                ]
            })
            .populate('kunde', 'navn adresse postnummerOgBy telefon email')
            .select('_id opgaveBeskrivelse kortOpgavebeskrivelse status incrementalID kunde createdAt ansvarlig')
            .sort({ createdAt: -1 })
            .limit(10)
            .lean(),
            
            // Søg i kunder
            Kunde.find({
                $or: [
                    { navn: searchRegex },
                    { fornavn: searchRegex },
                    { efternavn: searchRegex },
                    { email: searchRegex },
                    { telefon: !isNaN(searchTerm) ? Number(searchTerm) : null },
                    { adresse: searchRegex },
                    { postnummerOgBy: searchRegex },
                    { virksomhed: searchRegex }
                ].filter(condition => {
                    // Filter out telefon condition if searchTerm is not a number
                    if (condition.telefon === null) return false;
                    return true;
                })
            })
            .select('_id navn fornavn efternavn email telefon adresse postnummerOgBy virksomhed')
            .sort({ createdAt: -1 })
            .limit(10)
            .lean(),
            
            // Søg i brugere (medarbejdere)
            Bruger.find({
                $or: [
                    { navn: searchRegex },
                    { email: searchRegex },
                    { titel: searchRegex },
                    { telefon: !isNaN(searchTerm) ? Number(searchTerm) : null }
                ].filter(condition => {
                    if (condition.telefon === null) return false;
                    return true;
                })
            })
            .select('_id navn email titel telefon profilbillede eventColor')
            .limit(10)
            .lean(),
            
            // Søg i besøg (via kommentar eller relaterede data)
            Besøg.find({
                kommentar: searchRegex
            })
            .populate('brugerID', 'navn')
            .populate('opgaveID', 'incrementalID kortOpgavebeskrivelse')
            .populate('kundeID', 'navn adresse')
            .select('_id datoTidFra datoTidTil kommentar brugerID opgaveID kundeID')
            .sort({ datoTidFra: -1 })
            .limit(10)
            .lean()
        ]);
        
        // Formater og kombiner resultater
        const results = {
            kunder: kunder.map(k => ({
                _id: k._id,
                type: 'kunde',
                navn: k.navn,
                subtitle: k.adresse ? `${k.adresse}, ${k.postnummerOgBy || ''}` : k.email,
                telefon: k.telefon,
                email: k.email,
                virksomhed: k.virksomhed
            })),
            opgaver: opgaver.map(o => ({
                _id: o._id,
                type: 'opgave',
                navn: o.kortOpgavebeskrivelse || o.opgaveBeskrivelse?.substring(0, 50) || 'Ingen beskrivelse',
                subtitle: o.kunde?.navn || 'Ukendt kunde',
                incrementalID: o.incrementalID,
                status: o.status,
                kundeNavn: o.kunde?.navn,
                kundeAdresse: o.kunde?.adresse
            })),
            medarbejdere: brugere.map(b => ({
                _id: b._id,
                type: 'medarbejder',
                navn: b.navn,
                subtitle: b.titel || b.email,
                email: b.email,
                telefon: b.telefon,
                profilbillede: b.profilbillede,
                eventColor: b.eventColor
            })),
            besøg: besøg.map(b => ({
                _id: b._id,
                type: 'besøg',
                navn: b.kundeID?.navn || 'Ukendt kunde',
                subtitle: b.kommentar || `Besøg d. ${new Date(b.datoTidFra).toLocaleDateString('da-DK')}`,
                datoTidFra: b.datoTidFra,
                datoTidTil: b.datoTidTil,
                medarbejder: b.brugerID?.navn,
                opgaveID: b.opgaveID?._id,
                opgaveNummer: b.opgaveID?.incrementalID,
                kundeID: b.kundeID?._id
            }))
        };
        
        // Beregn total antal resultater
        const totalResults = results.kunder.length + results.opgaver.length + results.medarbejdere.length + results.besøg.length;
        
        res.status(200).json({
            query: searchTerm,
            totalResults,
            results
        });
        
    } catch (error) {
        console.error("Søgefejl:", error);
        res.status(500).json({ error: "Der opstod en fejl ved søgning" });
    }
});

export default router;

