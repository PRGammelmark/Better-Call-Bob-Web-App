import Postering from "../models/posteringModel.js";
import { tjekFakturaForBetaling } from "./tjekFakturaForBetaling.js";
import { opretNotifikation } from "./notifikationFunktioner.js";

/*
 * Natlig funktion der tjekker alle posteringer for fakturabetalinger
 * Kører hver nat kl. 03.00
 * @param {Object} options - Options for funktionen
 * @param {string} options.manualCallerID - Hvis angivet, sendes notifikation kun til denne bruger (manuel kald)
 */

export const natligFakturaBetalingTjek = async (options = {}) => {
    const { manualCallerID } = options;
    const isManualCall = !!manualCallerID;
    
    if (isManualCall) {
        console.log(`🔧 Starter manuelt fakturabetalingstjek (kaldt af bruger: ${manualCallerID})...`);
    } else {
        console.log("Starter fakturabetalingstjek...");
    }
    
    try {
        // Find alle posteringer der er opkrævet via faktura
        const allePosteringer = await Postering.find({ "opkrævninger.metode": "faktura" });

        console.log("Tjekker " + allePosteringer.length + " posteringer...");
        
        let antalBetalingerRegistreret = 0;
        let samletBetaltBeløb = 0;
        const betalteFakturaer = [];
        
        // Hjælpefunktion til at få total pris inkl. moms (understøtter både ny og gammel struktur)
        const getTotalPrisInklMoms = (postering) => {
            // Ny struktur har totalPrisInklMoms direkte
            if (postering.totalPrisInklMoms !== undefined && postering.totalPrisInklMoms !== null) {
                return postering.totalPrisInklMoms;
            }
            // Gammel struktur: totalPris er eks. moms, så vi ganger med 1.25
            return (postering.totalPris || 0) * 1.25;
        };

        // Gennemgå hver postering
        for (const postering of allePosteringer) {
            // Beregn om posteringen er fuldt betalt
            const posteringTotalPris = getTotalPrisInklMoms(postering);
            const betalingerSum = postering.betalinger?.reduce((sum, betaling) => sum + betaling.betalingsbeløb, 0) || 0;
            
            // Spring over hvis posteringen allerede er fuldt betalt
            if (betalingerSum >= posteringTotalPris) {
                continue;
            }
            
            // Tjek om der er fakturaopkrævninger
            const fakturaOpkrævninger = postering.opkrævninger?.filter(
                opkrævning => opkrævning.metode === 'faktura' && opkrævning.reference
            ) || [];
            
            if (fakturaOpkrævninger.length === 0) {
                continue;
            }
            
            // Tjek hver fakturaopkrævning
            for (const opkrævning of fakturaOpkrævninger) {
                try {
                    const fakturaNummer = opkrævning.reference.split('/').pop();
                    const economicApiLink = `https://restapi.e-conomic.com/invoices/booked/${fakturaNummer}`;
                    
                    // Tjek om der allerede er registreret en betaling for denne faktura
                    const betalingAlleredeRegistreret = postering.betalinger?.some(
                        betaling => betaling.betalingsID === economicApiLink || 
                                   betaling.betalingsID === opkrævning.reference
                    );
                    
                    if (betalingAlleredeRegistreret) {
                        // Spring over hvis betalingen allerede er registreret
                        continue;
                    }
                    
                    // Gem antal betalinger før tjekket
                    const antalBetalingerFør = postering.betalinger?.length || 0;
                    
                    // Tjek om fakturaen er betalt (dette registrerer også betalingen hvis den er betalt)
                    const erBetalt = await tjekFakturaForBetaling(fakturaNummer);
                    
                    if (erBetalt) {
                        // Hent posteringen igen for at få opdaterede betalinger
                        const opdateretPostering = await Postering.findById(postering._id);
                        const antalBetalingerEfter = opdateretPostering.betalinger?.length || 0;
                        
                        // Hvis der er blevet tilføjet en ny betaling
                        if (antalBetalingerEfter > antalBetalingerFør) {
                            // Find den nyeste betaling (den der lige er blevet registreret)
                            const nyeBetalinger = opdateretPostering.betalinger || [];
                            const senesteBetaling = nyeBetalinger
                                .filter(b => b.betalingsmetode === 'faktura')
                                .sort((a, b) => new Date(b.dato) - new Date(a.dato))[0];
                            
                            if (senesteBetaling) {
                                antalBetalingerRegistreret++;
                                samletBetaltBeløb += senesteBetaling.betalingsbeløb || 0;
                                
                                betalteFakturaer.push({
                                    posteringID: postering._id,
                                    fakturaNummer: fakturaNummer,
                                    beløb: senesteBetaling.betalingsbeløb || 0
                                });
                                
                                console.log(`✅ Faktura ${fakturaNummer} er betalt. Registreret betaling på ${senesteBetaling.betalingsbeløb} kr. for postering ${postering._id}`);
                            }
                        }
                    }
                } catch (error) {
                    console.error(`❌ Fejl ved tjek af faktura ${opkrævning.reference} for postering ${postering._id}:`, error);
                    // Fortsæt med næste opkrævning selvom denne fejler
                }
            }
        }
        
        // Opret notifikation til admins hvis der er registreret betalinger
        if (antalBetalingerRegistreret > 0) {
            const formateretBeløb = new Intl.NumberFormat('da-DK', {
                style: 'currency',
                currency: 'DKK',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(samletBetaltBeløb);
            
            // Opret liste over betalte fakturaer
            const fakturaListe = betalteFakturaer.map(faktura => {
                const formateretFakturaBeløb = new Intl.NumberFormat('da-DK', {
                    style: 'currency',
                    currency: 'DKK',
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }).format(faktura.beløb);
                return `• Faktura ${faktura.fakturaNummer}: ${formateretFakturaBeløb}`;
            }).join('\n');
            
            const titel = "Fakturabetalingstjek gennemført";
            const besked = isManualCall 
                ? `Der er blevet registreret ${antalBetalingerRegistreret} ${antalBetalingerRegistreret === 1 ? 'betaling' : 'betalinger'} med et samlet beløb på ${formateretBeløb}.\n\nBetalte fakturaer:\n${fakturaListe}`
                : `Siden i går er der blevet registreret ${antalBetalingerRegistreret} ${antalBetalingerRegistreret === 1 ? 'betaling' : 'betalinger'} med et samlet beløb på ${formateretBeløb}.\n\nBetalte fakturaer:\n${fakturaListe}`;
            
            await opretNotifikation({
                modtagerID: isManualCall ? manualCallerID : "admin",
                udløserID: undefined,
                type: "natligBetalingstjek",
                titel: titel,
                besked: besked,
                link: "/alle-opgaver",
                erVigtig: false
            });
            
            console.log(`📧 Notifikation sendt ${isManualCall ? 'til bruger' : 'til admins'}: ${antalBetalingerRegistreret} betalinger registreret, samlet beløb: ${formateretBeløb}`);             
        } else {
            console.log("ℹ️ Ingen nye betalinger registreret i nat.");
        }
        
        console.log("✅ Fakturabetalingstjek gennemført.");

        if (isManualCall) {
            return { succes: true, antalBetalingerRegistreret, samletBetaltBeløb, betalteFakturaer };
        } 
        
    } catch (error) {
        console.error("❌ Fejl ved fakturabetalingstjek:", error);
        
        // Opret notifikation om fejlen
        await opretNotifikation({
            modtagerID: isManualCall ? manualCallerID : "admin",
            udløserID: undefined,
            type: "natligBetalingstjekFejl",
            titel: "Fejl ved fakturabetalingstjek",
            besked: `Der opstod en fejl ved fakturabetalingstjek. Tjek server-loggen for detaljer.`,
            link: "/alle-opgaver",
            erVigtig: true
        });

        if (isManualCall) {
            return { succes: false, error: error };
        } 
    }
};

