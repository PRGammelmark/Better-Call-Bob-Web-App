import LedigTid from '../models/ledigeTiderModel.js'
import Besøg from '../models/besøgModel.js'
import mongoose from "mongoose"
import { opretNotifikation } from "../utils/notifikationFunktioner.js"
import Bruger from '../models/brugerModel.js'
import dayjs from 'dayjs'
import { justerForDST } from "../utils/justerForDST.js"

// GET alle ledige tider
const getLedigeTider = async (req,res) => {
    const ledigeTider = await LedigTid.find({}).sort({createdAt: -1}).lean();
    const ledigeTiderMedJusteretTid = ledigeTider.map(lt => {
        const { start, end } = justerForDST(lt.datoTidFra, lt.datoTidTil);
        return { ...lt, datoTidFra: start, datoTidTil: end };
    });
    // res.status(200).json(ledigeTiderMedJusteretTid)
    res.status(200).json(ledigeTider)
}

// GET alle ledige tider for en medarbejder
const getLedigeTiderForMedarbejder = async (req, res) => {
    const { id } = req.params;
    const ledigeTider = await LedigTid.find({ brugerID: id }).lean();
    const ledigeTiderMedJusteretTid = ledigeTider.map(lt => {
        const { start, end } = justerForDST(lt.datoTidFra, lt.datoTidTil);
        return { ...lt, datoTidFra: start, datoTidTil: end };
    });

    // res.status(200).json(ledigeTiderMedJusteretTid);
    res.status(200).json(ledigeTider);
}

// GET en enkelt ledig tid
const getLedigTid = async (req,res) => {
    const { id } = req.params;
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Ingen ledige tider fundet med et matchende ID.'})
    }

    const ledigTid = await LedigTid.findById(id).lean();
    const { start, end } = justerForDST(ledigTid.datoTidFra, ledigTid.datoTidTil);
    const ledigTidMedJusteretTid = {
        ...ledigTid,
        datoTidFra: start,
        datoTidTil: end
    };

    if(!ledigTid) {
        return res.status(404).json({error: 'Ingen ledige tider fundet med et matchende ID.'})
    }

    // res.status(200).json(ledigTidMedJusteretTid)
    res.status(200).json(ledigTid)
}

// CREATE en ledig tid
const createLedigTid = async (req, res) => {
    const data = req.body;
    const bruger = await Bruger.findById(req.user._id);

    try {
        // Check if data is an array
        if (Array.isArray(data)) {
            // Handle multiple LedigTid entries
            const createdLedigeTider = await LedigTid.insertMany(data);
            await opretNotifikation({ modtagerID: data.brugerID, udløserID: req.user._id, type: "ledigTidOprettet", titel: `${bruger.navn} har registreret dig som ledig på flere datoer, bl.a. ${dayjs(data[0].datoTidFra).format("DD. MMMM HH:mm")} - ${dayjs(data[0].datoTidTil).format("HH:mm")}.`, besked: `Se din kalender for at få et overblik.`, link: `/` })
            return res.status(200).json(createdLedigeTider);
        } else {
            // Handle a single LedigTid entry
            const { datoTidFra, datoTidTil, brugerID, kommentar, objectIsLedigTid } = data;
            const newLedigTid = await LedigTid.create({ datoTidFra, datoTidTil, brugerID, kommentar, objectIsLedigTid });
            await opretNotifikation({ modtagerID: data.brugerID, udløserID: req.user._id, type: "ledigTidOprettet", titel: `${bruger.navn} har registreret dig som ledig fra ${dayjs(datoTidFra).format("DD. MMMM HH:mm")} - ${dayjs(datoTidTil).format("HH:mm")}.`, besked: `Se din kalender for at få et overblik.`, link: `/` })
            return res.status(200).json(newLedigTid);
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

// DELETE en ledig tid
const deleteLedigTid = async (req, res) => {
    const { id } = req.params
    const bruger = await Bruger.findById(req.user._id);

    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(400).json({error: 'Ingen ledige tider fundet med et matchende ID.'})
    }

    const ledigTid = await LedigTid.findOneAndDelete({_id: id})

    if(!ledigTid) {
        return res.status(400).json({error: 'Ingen ledige tider fundet med et matchende ID.'})
    }

    await opretNotifikation({ modtagerID: ledigTid.brugerID, udløserID: req.user._id, type: "ledigTidFjernet", titel: `${bruger.navn} har fjernet din ledighed fra ${dayjs(ledigTid.datoTidFra).format("DD. MMMM HH:mm")} - ${dayjs(ledigTid.datoTidTil).format("HH:mm")}.`, besked: `Se din kalender for at få et overblik.`, link: `/` })

    res.status(200).json(ledigTid)
}

// OPDATER en ledig tid
const updateLedigTid = async (req,res) => {
    const { id } = req.params
    const bruger = await Bruger.findById(req.user._id);
    
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(400).json({error: 'Ingen ledige tider fundet med et matchende ID.'})
    }

    const ledigTid = await LedigTid.findOneAndUpdate({_id: id}, {
        ...req.body
    })

    if(!ledigTid) {
        return res.status(400).json({error: 'Ingen ledige tider fundet med et matchende ID.'})
    }

    const notifikation = await opretNotifikation({ modtagerID: ledigTid.brugerID, udløserID: req.user._id, type: "ledigTidOpdateret", titel: `${bruger.navn} har opdateret din ledighed fra ${dayjs(ledigTid.datoTidFra).format("DD. MMMM HH:mm")} - ${dayjs(ledigTid.datoTidTil).format("HH:mm")} til ${dayjs(req.body.datoTidFra).format("DD. MMMM HH:mm")} - ${dayjs(req.body.datoTidTil).format("HH:mm")}.`, besked: `Se din kalender for at få et overblik.`, link: `/` })
    console.log(notifikation)
    res.status(200).json(ledigTid)
    
}

/**
 * Hjælpefunktion til at beregne ledige tider minus besøg
 * @private
 */
function beregnLedigeTiderMinusBesøg(relevanteLedigeTider, relevanteBesøg) {
    return relevanteLedigeTider.flatMap(tid => {
        let updatedTider = [tid];
        
        relevanteBesøg.forEach(besøg => {
            // Tjek kun besøg for samme bruger
            if (String(besøg.brugerID) === String(tid.brugerID)) {
                const besøgStart = dayjs(besøg.datoTidFra);
                const besøgEnd = dayjs(besøg.datoTidTil);
                
                updatedTider = updatedTider.flatMap(t => {
                    const tidStart = dayjs(t.datoTidFra);
                    const tidEnd = dayjs(t.datoTidTil);
                    
                    // Tjek om besøget overlapper med den ledige tid
                    if (besøgStart.isBefore(tidEnd) && besøgEnd.isAfter(tidStart)) {
                        if (besøgStart.isAfter(tidStart) && besøgEnd.isBefore(tidEnd)) {
                            // Besøget er midt i den ledige tid - split i to dele
                            return [
                                { ...t, datoTidTil: besøgStart.toDate() },
                                { ...t, datoTidFra: besøgEnd.toDate() }
                            ];
                        } else if (besøgStart.isAfter(tidStart)) {
                            // Besøget starter midt i den ledige tid - trim slutningen
                            return [{ ...t, datoTidTil: besøgStart.toDate() }];
                        } else if (besøgEnd.isBefore(tidEnd)) {
                            // Besøget slutter midt i den ledige tid - trim starten
                            return [{ ...t, datoTidFra: besøgEnd.toDate() }];
                        } else {
                            // Besøget overlapper fuldstændigt med den ledige tid
                            return [];
                        }
                    }
                    return [t];
                });
            }
        });
        
        return updatedTider;
    });
}

// GET ledighed (ledige tider minus besøg)
const getLedighed = async (req, res) => {
    try {
        const { brugerID } = req.query;
        
        // Beregn datointerval: sidste måned, denne måned, og næste 6 måneder
        const startDato = dayjs().subtract(1, 'month').startOf('month').toDate();
        const slutDato = dayjs().add(6, 'month').endOf('month').toDate();
        
        // Byg query for ledige tider
        let ledigeTiderQuery = {
            datoTidFra: { $lte: slutDato },
            datoTidTil: { $gte: startDato }
        };
        
        // Byg query for besøg
        let besøgQuery = {
            datoTidFra: { $lte: slutDato },
            datoTidTil: { $gte: startDato }
        };
        
        // Hvis brugerID er givet, filtrer på det
        if (brugerID) {
            if (!mongoose.Types.ObjectId.isValid(brugerID)) {
                return res.status(400).json({ error: 'Ugyldigt brugerID' });
            }
            ledigeTiderQuery.brugerID = new mongoose.Types.ObjectId(brugerID);
            besøgQuery.brugerID = new mongoose.Types.ObjectId(brugerID);
        }
        
        // Hent ledige tider og besøg
        const [relevanteLedigeTider, relevanteBesøg] = await Promise.all([
            LedigTid.find(ledigeTiderQuery).lean(),
            Besøg.find(besøgQuery).lean()
        ]);
        
        // Beregn ledige tider minus besøg
        const ledigeTiderMinusBesøg = beregnLedigeTiderMinusBesøg(relevanteLedigeTider, relevanteBesøg);
        
        res.status(200).json(ledigeTiderMinusBesøg);
    } catch (error) {
        console.error('getLedighed: Fejl ved beregning af ledighed:', error);
        res.status(500).json({ error: error.message });
    }
}

// GET ledighed for multiple users (for booking system)
const getLedighedForMultipleUsers = async (req, res) => {
    try {
        const { brugerIDs } = req.body; // Array of user IDs
        
        if (!brugerIDs || !Array.isArray(brugerIDs) || brugerIDs.length === 0) {
            return res.status(400).json({ error: 'brugerIDs array er påkrævet' });
        }
        
        // Valider alle IDs
        const validBrugerIDs = brugerIDs.filter(id => mongoose.Types.ObjectId.isValid(id));
        if (validBrugerIDs.length === 0) {
            return res.status(400).json({ error: 'Ingen gyldige brugerIDs' });
        }
        
        // Beregn datointerval: sidste måned, denne måned, og næste 6 måneder
        const startDato = dayjs().subtract(1, 'month').startOf('month').toDate();
        const slutDato = dayjs().add(6, 'month').endOf('month').toDate();
        
        // Byg query for ledige tider - filtrer på flere bruger IDs
        const ledigeTiderQuery = {
            datoTidFra: { $lte: slutDato },
            datoTidTil: { $gte: startDato },
            brugerID: { $in: validBrugerIDs.map(id => new mongoose.Types.ObjectId(id)) }
        };
        
        // Byg query for besøg - filtrer på flere bruger IDs
        const besøgQuery = {
            datoTidFra: { $lte: slutDato },
            datoTidTil: { $gte: startDato },
            brugerID: { $in: validBrugerIDs.map(id => new mongoose.Types.ObjectId(id)) }
        };
        
        // Hent ledige tider og besøg
        const [relevanteLedigeTider, relevanteBesøg] = await Promise.all([
            LedigTid.find(ledigeTiderQuery).lean(),
            Besøg.find(besøgQuery).lean()
        ]);
        
        // Beregn ledige tider minus besøg
        const ledigeTiderMinusBesøg = beregnLedigeTiderMinusBesøg(relevanteLedigeTider, relevanteBesøg);
        
        res.status(200).json(ledigeTiderMinusBesøg);
    } catch (error) {
        console.error('getLedighedForMultipleUsers: Fejl ved beregning af ledighed:', error);
        res.status(500).json({ error: error.message });
    }
}

/**
 * Konverterer en medarbejders ledige tid til booking slots baseret på tidsforbrug
 * @param {Object} ledigTid - En ledig tid objekt med datoTidFra og datoTidTil
 * @param {Number} tidsforbrugTimer - Antal timer der skal bookes
 * @returns {Array} Array af booking slots
 */
function konverterTilBookingSlots(ledigTid, tidsforbrugTimer) {
    const slots = [];
    const start = dayjs(ledigTid.datoTidFra);
    const end = dayjs(ledigTid.datoTidTil);
    
    // Start fra første hele time efter eller ved starttidspunktet
    let currentStart = start.startOf('hour');
    // Hvis starttidspunktet ikke er ved en hel time, start fra næste time
    if (start.isAfter(currentStart)) {
        currentStart = currentStart.add(1, 'hour');
    }
    
    // Generer slots for hver hele time indtil slutningen
    while (currentStart.isBefore(end)) {
        const slotEnd = currentStart.add(tidsforbrugTimer, 'hour');
        
        // Tjek at slotten ikke går ud over den ledige tid
        if (slotEnd.isAfter(end)) {
            break;
        }
        
        // Tjek at slotten starter efter eller ved starttidspunktet
        if (currentStart.isBefore(start)) {
            currentStart = currentStart.add(1, 'hour');
            continue;
        }
        
        slots.push({
            datoTidFra: currentStart.toDate(),
            datoTidTil: slotEnd.toDate(),
            brugerID: ledigTid.brugerID
        });
        
        // Gå til næste hele time
        currentStart = currentStart.add(1, 'hour');
    }
    
    return slots;
}

/**
 * Fjerner duplikat tidsblokke og beholder den med højeste score (rating + prioritet)
 * @param {Array} slots - Array af booking slots med brugerID
 * @param {Map} brugerScores - Map af brugerID til score (rating + prioritet)
 * @returns {Array} Array af unikke booking slots
 */
function fjernDuplikaterOgSorterEfterRating(slots, brugerScores) {
    // Gruppér slots efter tidsinterval (datoTidFra og datoTidTil)
    const slotMap = new Map();
    
    slots.forEach(slot => {
        const key = `${dayjs(slot.datoTidFra).toISOString()}_${dayjs(slot.datoTidTil).toISOString()}`;
        const score = brugerScores.get(String(slot.brugerID)) || 7; // Default score: rating 4 + prioritet 3 = 7
        
        if (!slotMap.has(key)) {
            slotMap.set(key, {
                slot: slot,
                score: score,
                brugerID: slot.brugerID
            });
        } else {
            const existing = slotMap.get(key);
            // Hvis bedre score, erstatt
            if (score > existing.score) {
                slotMap.set(key, {
                    slot: slot,
                    score: score,
                    brugerID: slot.brugerID
                });
            } else if (score === existing.score) {
                // Hvis samme score, vælg tilfældigt
                if (Math.random() > 0.5) {
                    slotMap.set(key, {
                        slot: slot,
                        score: score,
                        brugerID: slot.brugerID
                    });
                }
            }
        }
    });
    
    // Returnér kun slot objekterne
    return Array.from(slotMap.values()).map(item => item.slot);
}

// GET ledige booking tider (konverteret til slots baseret på tidsforbrug)
const getLedigeBookingTider = async (req, res) => {
    try {
        const { brugerIDs, estimeretTidsforbrugTimer } = req.body;
        
        if (!brugerIDs || !Array.isArray(brugerIDs) || brugerIDs.length === 0) {
            return res.status(400).json({ error: 'brugerIDs array er påkrævet' });
        }
        
        if (!estimeretTidsforbrugTimer || typeof estimeretTidsforbrugTimer !== 'number' || estimeretTidsforbrugTimer <= 0) {
            return res.status(400).json({ error: 'estimeretTidsforbrugTimer skal være et positivt tal' });
        }
        
        // Valider alle IDs
        const validBrugerIDs = brugerIDs.filter(id => mongoose.Types.ObjectId.isValid(id));
        if (validBrugerIDs.length === 0) {
            return res.status(400).json({ error: 'Ingen gyldige brugerIDs' });
        }
        
        // Beregn datointerval: sidste måned, denne måned, og næste 6 måneder
        const startDato = dayjs().subtract(1, 'month').startOf('month').toDate();
        const slutDato = dayjs().add(6, 'month').endOf('month').toDate();
        
        // Byg query for ledige tider - filtrer på flere bruger IDs
        const ledigeTiderQuery = {
            datoTidFra: { $lte: slutDato },
            datoTidTil: { $gte: startDato },
            brugerID: { $in: validBrugerIDs.map(id => new mongoose.Types.ObjectId(id)) }
        };
        
        // Byg query for besøg - filtrer på flere bruger IDs
        const besøgQuery = {
            datoTidFra: { $lte: slutDato },
            datoTidTil: { $gte: startDato },
            brugerID: { $in: validBrugerIDs.map(id => new mongoose.Types.ObjectId(id)) }
        };
        
        // Hent ledige tider, besøg og brugere (for rating og prioritet)
        const [relevanteLedigeTider, relevanteBesøg, brugere] = await Promise.all([
            LedigTid.find(ledigeTiderQuery).lean(),
            Besøg.find(besøgQuery).lean(),
            Bruger.find({ _id: { $in: validBrugerIDs.map(id => new mongoose.Types.ObjectId(id)) } }).select('_id rating prioritet').lean()
        ]);
        
        // Beregn ledige tider minus besøg
        const ledigeTiderMinusBesøg = beregnLedigeTiderMinusBesøg(relevanteLedigeTider, relevanteBesøg);
        
        // Opret map af bruger scores (rating + prioritet)
        const brugerScores = new Map();
        brugere.forEach(bruger => {
            const rating = bruger.rating ?? 4; // Default rating 4
            const prioritet = bruger.prioritet ?? 3; // Default prioritet 3
            const score = rating + prioritet;
            brugerScores.set(String(bruger._id), score);
        });
        
        // Konverter hver ledig tid til booking slots
        const alleSlots = [];
        ledigeTiderMinusBesøg.forEach(ledigTid => {
            const slots = konverterTilBookingSlots(ledigTid, estimeretTidsforbrugTimer);
            alleSlots.push(...slots);
        });
        
        // Fjern duplikater og sorter efter score (rating + prioritet)
        const unikkeSlots = fjernDuplikaterOgSorterEfterRating(alleSlots, brugerScores);
        
        // Sorter slots efter datoTidFra
        unikkeSlots.sort((a, b) => {
            return dayjs(a.datoTidFra).diff(dayjs(b.datoTidFra));
        });
        
        res.status(200).json(unikkeSlots);
    } catch (error) {
        console.error('getLedigeBookingTider: Fejl ved beregning af booking tider:', error);
        res.status(500).json({ error: error.message });
    }
}


export {
    getLedigeTider,
    createLedigTid,
    getLedigTid,
    deleteLedigTid,
    updateLedigTid,
    getLedigeTiderForMedarbejder,
    getLedighed,
    getLedighedForMultipleUsers,
    getLedigeBookingTider
}