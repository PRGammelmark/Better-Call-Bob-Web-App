import LedigTid from '../models/ledigeTiderModel.js'
import Besøg from '../models/besøgModel.js'
import mongoose from "mongoose"
import { opretNotifikation } from "../utils/notifikationFunktioner.js"
import Bruger from '../models/brugerModel.js'
import dayjs from 'dayjs'
import 'dayjs/locale/da.js'
import 'dayjs/locale/en.js'
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

// GET næste to sammenhængende ledige timer (offentligt endpoint)
const getNæsteToLedigeTimer = async (req, res) => {
    try {
        // Sæt dansk locale for dayjs
        dayjs.locale('da');
        
        // Hjælpefunktion til at få tidspunkt i dansk tidszone (Europe/Copenhagen)
        const getDanskTidspunkt = (dateInput) => {
            if (!dateInput) {
                // Hvis ingen dato, brug nuværende tid i dansk tidszone
                const now = new Date();
                // Brug dansk locale til at få korrekt tid i dansk tidszone
                const danskTidString = now.toLocaleString('da-DK', { timeZone: 'Europe/Copenhagen' });
                // Konverter dansk format (DD.MM.YYYY, HH.mm.ss) til ISO format
                if (!danskTidString || !danskTidString.includes(',')) {
                    return dayjs(now);
                }
                const [datePart, timePart] = danskTidString.split(', ');
                if (!datePart || !timePart) {
                    return dayjs(now);
                }
                const [day, month, year] = datePart.split('.');
                const [hour, minute, second] = timePart.split('.');
                return dayjs(`${year}-${month}-${day}T${hour}:${minute}:${second || '00'}`);
            }
            
            // Konverter input til Date objekt hvis det er en string
            const dateObj = dateInput instanceof Date ? dateInput : new Date(dateInput);
            
            // Tjek om datoen er gyldig
            if (isNaN(dateObj.getTime())) {
                console.error('Invalid date in getDanskTidspunkt:', dateInput);
                return dayjs(dateInput); // Fallback til dayjs parsing
            }
            
            // Konverter Date objekt til dansk tidszone med dansk locale
            const danskTidString = dateObj.toLocaleString('da-DK', { timeZone: 'Europe/Copenhagen' });
            
            // Konverter dansk format (DD.MM.YYYY, HH.mm.ss) til ISO format
            if (!danskTidString || !danskTidString.includes(',')) {
                // Fallback hvis formatet ikke er som forventet
                return dayjs(dateObj);
            }
            
            const [datePart, timePart] = danskTidString.split(', ');
            if (!datePart || !timePart) {
                return dayjs(dateObj);
            }
            
            const [day, month, year] = datePart.split('.');
            const [hour, minute, second] = timePart.split('.');
            
            if (!day || !month || !year || !hour || !minute) {
                return dayjs(dateObj);
            }
            
            return dayjs(`${year}-${month}-${day}T${hour}:${minute}:${second || '00'}`);
        };
        
        // Få nuværende tid i dansk tidszone
        const nuDansk = getDanskTidspunkt();
        
        // Beregn datointerval: fra i morgen til 2 uger frem (i dansk tidszone)
        const iMorgen = nuDansk.add(1, 'day').startOf('day');
        const slutDato = nuDansk.add(2, 'week').endOf('day');
        
        // Byg query for ledige tider - alle brugere
        const ledigeTiderQuery = {
            datoTidFra: { $lte: slutDato.toDate() },
            datoTidTil: { $gte: iMorgen.toDate() }
        };
        
        // Byg query for besøg - alle brugere
        const besøgQuery = {
            datoTidFra: { $lte: slutDato.toDate() },
            datoTidTil: { $gte: iMorgen.toDate() }
        };
        
        // Hent ledige tider og besøg
        const [relevanteLedigeTider, relevanteBesøg] = await Promise.all([
            LedigTid.find(ledigeTiderQuery).lean(),
            Besøg.find(besøgQuery).lean()
        ]);
        
        // Beregn ledige tider minus besøg
        const ledigeTiderMinusBesøg = beregnLedigeTiderMinusBesøg(relevanteLedigeTider, relevanteBesøg);
        
        // Find første to sammenhængende hele timer (2-timers blok)
        let næsteToTimer = null;
        
        // Saml alle potentielle 2-timers blokke
        const toTimersBlokke = [];
        
        ledigeTiderMinusBesøg.forEach(ledigTid => {
            // Konverter til dansk tidszone
            const start = getDanskTidspunkt(new Date(ledigTid.datoTidFra));
            const end = getDanskTidspunkt(new Date(ledigTid.datoTidTil));
            
            // Start fra første hele time efter eller ved starttidspunktet
            let currentStart = start.startOf('hour');
            if (start.isAfter(currentStart)) {
                currentStart = currentStart.add(1, 'hour');
            }
            
            // Tjek om vi skal starte fra i morgen (i dansk tidszone)
            if (currentStart.isBefore(iMorgen)) {
                currentStart = iMorgen.startOf('hour');
            }
            
            // Tjek at currentStart stadig er inden for den ledige periode
            if (currentStart.isAfter(end) || currentStart.isSame(end)) {
                return; // Skip denne ledige tid hvis den slutter før i morgen
            }
            
            // Generer 2-timers blokke indtil slutningen
            while (currentStart.isBefore(end)) {
                const blokSlut = currentStart.add(2, 'hour');
                
                // Tjek at tiden er fra i morgen eller senere
                if (currentStart.isBefore(iMorgen)) {
                    currentStart = currentStart.add(1, 'hour');
                    continue;
                }
                
                // Tjek at hele 2-timers blokken er inden for den ledige tid
                if (blokSlut.isAfter(end)) {
                    break;
                }
                
                // Tjek at det er hele timer (start og slut skal være ved hele timer)
                if (currentStart.minute() === 0 && currentStart.second() === 0 && 
                    blokSlut.minute() === 0 && blokSlut.second() === 0) {
                    toTimersBlokke.push({
                        datoTidFra: currentStart.toDate(),
                        datoTidTil: blokSlut.toDate(),
                        brugerID: ledigTid.brugerID
                    });
                }
                
                currentStart = currentStart.add(1, 'hour');
            }
        });
        
        // Sorter efter datoTidFra for at finde den tidligste
        toTimersBlokke.sort((a, b) => {
            return dayjs(a.datoTidFra).diff(dayjs(b.datoTidFra));
        });
        
        if (toTimersBlokke.length === 0) {
            return res.status(404).json({ error: 'Ingen ledige timer fundet' });
        }
        
        næsteToTimer = toTimersBlokke[0];
        
        // Formatér tidspunkt i dansk tidszone
        const tidspunkt = getDanskTidspunkt(new Date(næsteToTimer.datoTidFra));
        const time = tidspunkt.format('HH:mm');
        const dato = tidspunkt.startOf('day');
        const dageFraNu = dato.diff(nuDansk.startOf('day'), 'day');
        
        // Bestem dateFromNow (dansk)
        let dateFromNow;
        if (dageFraNu === 1) {
            dateFromNow = 'i morgen';
        } else if (dageFraNu >= 2 && dageFraNu <= 7) {
            // Brug dansk locale for ugedag
            dateFromNow = `på ${tidspunkt.format('dddd')}`;
        } else {
            // Hvis uden for 2-7 dage, brug stadig ugedag (skulle ikke ske da vi kun kigger 2 uger frem)
            dateFromNow = `på ${tidspunkt.format('dddd')}`;
        }
        
        // Bestem dateFromNowEng (engelsk)
        dayjs.locale('en');
        const tidspunktEng = getDanskTidspunkt(new Date(næsteToTimer.datoTidFra));
        let dateFromNowEng;
        if (dageFraNu === 1) {
            dateFromNowEng = 'tomorrow';
        } else if (dageFraNu >= 2 && dageFraNu <= 7) {
            // Brug engelsk locale for ugedag
            dateFromNowEng = `${tidspunktEng.format('dddd')}`;
        } else {
            // Hvis uden for 2-7 dage, brug stadig ugedag (skulle ikke ske da vi kun kigger 2 uger frem)
            dateFromNowEng = `${tidspunktEng.format('dddd')}`;
        }
        
        // Formatér timeEng med AM/PM (12-timers format)
        const timeEng = tidspunktEng.format('hh:mm A');
        
        // Sæt locale tilbage til dansk
        dayjs.locale('da');
        
        res.status(200).json({
            time: time,
            dateFromNow: dateFromNow,
            timeEng: timeEng,
            dateFromNowEng: dateFromNowEng
        });
    } catch (error) {
        console.error('getNæsteToLedigeTimer: Fejl ved beregning af næste ledige timer:', error);
        res.status(500).json({ error: error.message });
    }
}

// GET næste 7 datoer med mindst to sammenhængende ledige timer (offentligt endpoint)
const getNæste7LedigeDatoer = async (req, res) => {
    try {
        // Sæt dansk locale for dayjs
        dayjs.locale('da');
        
        // Hjælpefunktion til at få tidspunkt i dansk tidszone (Europe/Copenhagen)
        const getDanskTidspunkt = (dateInput) => {
            if (!dateInput) {
                // Hvis ingen dato, brug nuværende tid i dansk tidszone
                const now = new Date();
                // Brug dansk locale til at få korrekt tid i dansk tidszone
                const danskTidString = now.toLocaleString('da-DK', { timeZone: 'Europe/Copenhagen' });
                // Konverter dansk format (DD.MM.YYYY, HH.mm.ss) til ISO format
                if (!danskTidString || !danskTidString.includes(',')) {
                    return dayjs(now);
                }
                const [datePart, timePart] = danskTidString.split(', ');
                if (!datePart || !timePart) {
                    return dayjs(now);
                }
                const [day, month, year] = datePart.split('.');
                const [hour, minute, second] = timePart.split('.');
                return dayjs(`${year}-${month}-${day}T${hour}:${minute}:${second || '00'}`);
            }
            
            // Konverter input til Date objekt hvis det er en string
            const dateObj = dateInput instanceof Date ? dateInput : new Date(dateInput);
            
            // Tjek om datoen er gyldig
            if (isNaN(dateObj.getTime())) {
                console.error('Invalid date in getDanskTidspunkt:', dateInput);
                return dayjs(dateInput); // Fallback til dayjs parsing
            }
            
            // Konverter Date objekt til dansk tidszone med dansk locale
            const danskTidString = dateObj.toLocaleString('da-DK', { timeZone: 'Europe/Copenhagen' });
            
            // Konverter dansk format (DD.MM.YYYY, HH.mm.ss) til ISO format
            if (!danskTidString || !danskTidString.includes(',')) {
                // Fallback hvis formatet ikke er som forventet
                return dayjs(dateObj);
            }
            
            const [datePart, timePart] = danskTidString.split(', ');
            if (!datePart || !timePart) {
                return dayjs(dateObj);
            }
            
            const [day, month, year] = datePart.split('.');
            const [hour, minute, second] = timePart.split('.');
            
            if (!day || !month || !year || !hour || !minute) {
                return dayjs(dateObj);
            }
            
            return dayjs(`${year}-${month}-${day}T${hour}:${minute}:${second || '00'}`);
        };
        
        // Få nuværende tid i dansk tidszone
        const nuDansk = getDanskTidspunkt();
        
        // Beregn datointerval: fra i morgen til 2 måneder frem (i dansk tidszone)
        const iMorgen = nuDansk.add(1, 'day').startOf('day');
        const slutDato = nuDansk.add(2, 'month').endOf('day');
        
        // Byg query for ledige tider - alle brugere
        const ledigeTiderQuery = {
            datoTidFra: { $lte: slutDato.toDate() },
            datoTidTil: { $gte: iMorgen.toDate() }
        };
        
        // Byg query for besøg - alle brugere
        const besøgQuery = {
            datoTidFra: { $lte: slutDato.toDate() },
            datoTidTil: { $gte: iMorgen.toDate() }
        };
        
        // Hent ledige tider og besøg
        const [relevanteLedigeTider, relevanteBesøg] = await Promise.all([
            LedigTid.find(ledigeTiderQuery).lean(),
            Besøg.find(besøgQuery).lean()
        ]);
        
        // Beregn ledige tider minus besøg
        const ledigeTiderMinusBesøg = beregnLedigeTiderMinusBesøg(relevanteLedigeTider, relevanteBesøg);
        
        // Find datoer med mindst to sammenhængende ledige timer
        const datoerMedToTimer = new Set();
        
        ledigeTiderMinusBesøg.forEach(ledigTid => {
            // Konverter til dansk tidszone
            const start = getDanskTidspunkt(new Date(ledigTid.datoTidFra));
            const end = getDanskTidspunkt(new Date(ledigTid.datoTidTil));
            
            // Start fra første hele time efter eller ved starttidspunktet
            let currentStart = start.startOf('hour');
            if (start.isAfter(currentStart)) {
                currentStart = currentStart.add(1, 'hour');
            }
            
            // Tjek om vi skal starte fra i morgen (i dansk tidszone)
            if (currentStart.isBefore(iMorgen)) {
                currentStart = iMorgen.startOf('hour');
            }
            
            // Tjek at currentStart stadig er inden for den ledige periode
            if (currentStart.isAfter(end) || currentStart.isSame(end)) {
                return; // Skip denne ledige tid hvis den slutter før i morgen
            }
            
            // Generer 2-timers blokke indtil slutningen
            while (currentStart.isBefore(end)) {
                const blokSlut = currentStart.add(2, 'hour');
                
                // Tjek at tiden er fra i morgen eller senere
                if (currentStart.isBefore(iMorgen)) {
                    currentStart = currentStart.add(1, 'hour');
                    continue;
                }
                
                // Tjek at hele 2-timers blokken er inden for den ledige tid
                if (blokSlut.isAfter(end)) {
                    break;
                }
                
                // Tjek at det er hele timer (start og slut skal være ved hele timer)
                if (currentStart.minute() === 0 && currentStart.second() === 0 && 
                    blokSlut.minute() === 0 && blokSlut.second() === 0) {
                    // Tilføj datoen til settet (format: YYYY-MM-DD)
                    const dato = currentStart.format('YYYY-MM-DD');
                    datoerMedToTimer.add(dato);
                }
                
                currentStart = currentStart.add(1, 'hour');
            }
        });
        
        // Konverter til array og sorter efter dato
        const ledigeDatoer = Array.from(datoerMedToTimer)
            .sort((a, b) => {
                return dayjs(a).diff(dayjs(b));
            })
            .slice(0, 7); // Tag kun de første 7
        
        // Hvis der ikke er nok datoer, returner tom array
        if (ledigeDatoer.length === 0) {
            return res.status(200).json({
                ledigeDatoer: [],
                månederDansk: [],
                månederEngelsk: []
            });
        }
        
        // Ekstraher unikke måneder fra datoerne og find første dato for hver måned
        const månederMap = new Map(); // Map af månedsnummer til månedsnavn og første dato
        
        // Sæt dansk locale
        dayjs.locale('da');
        ledigeDatoer.forEach(dato => {
            const datoObj = dayjs(dato);
            const månedsnummer = datoObj.month(); // 0-11
            const månedsnavnDansk = datoObj.format('MMMM'); // F.eks. "januar"
            if (!månederMap.has(månedsnummer)) {
                månederMap.set(månedsnummer, { 
                    dansk: månedsnavnDansk,
                    førsteDato: dato // Gem første dato i denne måned
                });
            } else {
                // Opdater første dato hvis denne dato er tidligere
                const eksisterende = månederMap.get(månedsnummer);
                if (dayjs(dato).isBefore(dayjs(eksisterende.førsteDato))) {
                    eksisterende.førsteDato = dato;
                }
            }
        });
        
        // Sæt engelsk locale
        dayjs.locale('en');
        ledigeDatoer.forEach(dato => {
            const datoObj = dayjs(dato);
            const månedsnummer = datoObj.month(); // 0-11
            const månedsnavnEngelsk = datoObj.format('MMMM'); // F.eks. "January"
            if (månederMap.has(månedsnummer)) {
                månederMap.get(månedsnummer).engelsk = månedsnavnEngelsk;
            }
        });
        
        // Konverter til array og sorter efter første dato (kronologisk)
        const månederSorteret = Array.from(månederMap.entries())
            .sort((a, b) => {
                // Sorter efter første dato i hver måned (kronologisk)
                return dayjs(a[1].førsteDato).diff(dayjs(b[1].førsteDato));
            });
        
        const månederDansk = månederSorteret.map(([_, navne]) => navne.dansk);
        const månederEngelsk = månederSorteret.map(([_, navne]) => navne.engelsk);
        
        // Sæt locale tilbage til dansk
        dayjs.locale('da');
        
        res.status(200).json({
            ledigeDatoer: ledigeDatoer,
            månederDansk: månederDansk,
            månederEngelsk: månederEngelsk
        });
    } catch (error) {
        console.error('getNæste7LedigeDatoer: Fejl ved beregning af ledige datoer:', error);
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
    getLedigeBookingTider,
    getNæsteToLedigeTimer,
    getNæste7LedigeDatoer
}