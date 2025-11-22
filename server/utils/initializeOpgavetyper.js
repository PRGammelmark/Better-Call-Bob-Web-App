import Opgavetyper from '../models/opgavetyperModel.js';

/**
 * Initialiserer standard-opgavetyper hvis databasen er tom
 */
export const initializeOpgavetyper = async () => {
    try {
        // Tjek om der allerede findes opgavetyper i databasen
        const existingOpgavetyper = await Opgavetyper.find({});
        
        if (existingOpgavetyper.length > 0) {
            console.log(`✅ Der findes allerede ${existingOpgavetyper.length} opgavetype(r) i databasen. Springer initialisering over.`);
            return;
        }

        // Standard-opgavetyper baseret på kategorierne
        const standardOpgavetyper = [
            {
                opgavetype: "Ad hoc handymanarbejde",
                kategorier: ["Handyman"],
                kompleksitet: 1
            }
        ];

        // Opret alle standard-opgavetyper
        await Opgavetyper.insertMany(standardOpgavetyper);
        console.log(`✅ Initialiseret ${standardOpgavetyper.length} standard-opgavetyper i databasen.`);
    } catch (error) {
        console.error('❌ Fejl ved initialisering af standard-opgavetyper:', error);
    }
};

