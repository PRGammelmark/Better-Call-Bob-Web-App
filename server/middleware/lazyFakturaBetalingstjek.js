import Indstillinger from "../models/indstillingerModel.js";
import { natligFakturaBetalingTjek } from "../utils/natligFakturaBetalingTjek.js";

let isRunning = false; // Forhindrer flere samtidige kørsler
let cachedLastCheck = null; // Cache for sidsteFakturaBetalingstjek
let cacheInitialized = false; // Tjek om cache er initialiseret

/**
 * Lazy cron middleware der kører fakturabetalingstjek én gang om morgenen
 * når serveren begynder at modtage requests efter kl. 03:00 (Europe/Copenhagen timezone)
 */
export const lazyFakturaBetalingstjek = async (req, res, next) => {
    // Kør kun for API requests (ikke for statiske filer osv.)
    if (!req.path.startsWith('/api/')) {
        return next();
    }

    // Spring over hvis det er manuelt kald via API endpoint
    if (req.path === '/api/faktura-betalingstjek' || req.path === '/faktura-betalingstjek') {
        return next();
    }

    // Hvis tjekket allerede kører, spring over
    if (isRunning) {
        return next();
    }

    try {
        // Brug Europe/Copenhagen timezone
        const nu = new Date();
        // Få tidspunktet i Europe/Copenhagen timezone som string og parse det
        const copenhagenTimeString = nu.toLocaleString("en-US", { 
            timeZone: "Europe/Copenhagen",
            hour12: false,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        // Parse til Date objekt (format: MM/DD/YYYY, HH:mm:ss)
        const [datePart, timePart] = copenhagenTimeString.split(', ');
        const [month, day, year] = datePart.split('/');
        const [hours, minutes] = timePart.split(':');
        const copenhagenTime = {
            hours: parseInt(hours),
            minutes: parseInt(minutes)
        };
        
        const nuTime = copenhagenTime.hours * 60 + copenhagenTime.minutes; // Minutter siden midnat
        const targetTime = 3 * 60; // 03:00 = 180 minutter

        // Tjek om det er efter kl. 03:00
        if (nuTime < targetTime) {
            return next(); // For tidligt på dagen
        }

        // Hent sidste kørsel fra cache eller database
        let sidsteFakturaBetalingstjek = cachedLastCheck;
        
        if (!cacheInitialized || !sidsteFakturaBetalingstjek) {
            // Hent fra database hvis cache ikke er initialiseret
            const indstillinger = await Indstillinger.findOne({ singleton: "ONLY_ONE" });
            if (indstillinger && indstillinger.sidsteFakturaBetalingstjek) {
                sidsteFakturaBetalingstjek = indstillinger.sidsteFakturaBetalingstjek;
                cachedLastCheck = sidsteFakturaBetalingstjek;
            }
            cacheInitialized = true;
        }

        // Tjek om tjekket allerede er kørt i dag (i Europe/Copenhagen timezone)
        if (sidsteFakturaBetalingstjek) {
            const sidsteKørsel = new Date(sidsteFakturaBetalingstjek);
            const nu = new Date();
            
            // Få datoer i Europe/Copenhagen timezone
            const sidsteKørselDatoString = sidsteKørsel.toLocaleDateString("en-US", { timeZone: "Europe/Copenhagen" });
            const iDagDatoString = nu.toLocaleDateString("en-US", { timeZone: "Europe/Copenhagen" });

            // Hvis tjekket allerede er kørt i dag, spring over
            if (sidsteKørselDatoString === iDagDatoString) {
                return next();
            }
        }

        // Marker at tjekket kører
        isRunning = true;
        console.log(`🌅 Lazy cron: Starter fakturabetalingstjek (kl. ${String(copenhagenTime.hours).padStart(2, '0')}:${String(copenhagenTime.minutes).padStart(2, '0')})...`);

        // Kør tjekket i baggrunden (vent ikke på det)
        natligFakturaBetalingTjek()
            .then(async () => {
                // Opdater sidste kørsel i databasen og cache
                const nu = new Date();
                await Indstillinger.findOneAndUpdate(
                    { singleton: "ONLY_ONE" },
                    { sidsteFakturaBetalingstjek: nu },
                    { upsert: true }
                );
                // Opdater cache
                cachedLastCheck = nu;
                console.log("✅ Lazy fakturabetalingstjek gennemført og opdateret i database og cache");
            })
            .catch((error) => {
                console.error("❌ Fejl ved lazy fakturabetalingstjek:", error);
            })
            .finally(() => {
                isRunning = false;
            });

        // Fortsæt med requesten (vent ikke på tjekket)
        next();

    } catch (error) {
        console.error("Fejl ved lazy fakturabetalingstjek middleware:", error);
        // Fortsæt med requesten selvom der er fejl
        next();
    }
};

