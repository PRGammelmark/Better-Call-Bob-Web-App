import dayjs from "dayjs";
import 'dayjs/locale/da';

/**
 * Hook til at generere Economic-fakturalinjer fra posteringer
 * Bruger ny posteringsstruktur (version 2) med arrays
 */
const useEconomicLines = (posteringer, inklAdministrationsGebyr, isEnglish) => {

    const lines = []; 
    let lineNumber = 1;
    
    // Helper function to format date in Danish format
    const formatDato = (dato) => {
        if (!dato) return "";
        try {
            return dayjs(dato).locale('da').format('D. MMMM YYYY');
        } catch (error) {
            return dato.slice ? dato.slice(0,10) : "";
        }
    };

    // Product number mapping for timetyper
    const getProductNumber = (navn) => {
        const navnLower = navn?.toLowerCase() || '';
        if (navnLower.includes('handyman')) return "1";
        if (navnLower.includes('tømrer') || navnLower.includes('carpenter')) return "6";
        if (navnLower.includes('rådgivning') || navnLower.includes('counseling')) return "7";
        return "1"; // Default til handyman
    };

    // Product number mapping for faste tillæg
    const getFastTillægProductNumber = (navn) => {
        const navnLower = navn?.toLowerCase() || '';
        if (navnLower.includes('opstart') || navnLower.includes('start')) return "5";
        if (navnLower.includes('trailer')) return "8";
        return "4"; // Default til "fast pris"
    };
    
    posteringer.forEach((postering) => {
        const formateretDato = formatDato(postering?.dato);

        // Tjek om det er en tilbudspris (fast pris)
        const erTilbudspris = postering.tilbudsPrisEksklMoms !== undefined && postering.tilbudsPrisEksklMoms !== null;

        if (erTilbudspris) {
            // TILBUDSPRIS / FAST PRIS
            lines.push({
                lineNumber: lineNumber++,
                description: `${isEnglish ? "Fixed price on work completed/initiated at " : "Fast pris på arbejde udført/opstartet d. "}${formateretDato || ""}`,
                product: {
                    productNumber: "4"
                },
                quantity: 1,
                unitNetPrice: postering.tilbudsPrisEksklMoms,
                discountPercentage: 0.00
            });
        } else {
            // DYNAMISK PRIS (Version 2 struktur)
            
            // 1. Timeregistreringer
            if (postering.timeregistrering && postering.timeregistrering.length > 0) {
                postering.timeregistrering.forEach((tr) => {
                    if (tr.antal > 0) {
                        // Find eventuelle procentTillæg for denne timetype
                        const procentTillægForTimetype = postering.procentTillæg?.filter(
                            pt => pt.timetypeId?.toString() === tr.timetypeId?.toString()
                        ) || [];
                        
                        // Beregn samlet procenttillæg
                        const samletProcentTillæg = procentTillægForTimetype.reduce(
                            (sum, pt) => sum + (pt.pris?.procentSats || 0), 0
                        );
                        
                        // Beregn enhedspris inkl. procenttillæg
                        const basisPris = tr.pris?.sats || 0;
                        const enhedsPrisMedTillæg = basisPris * (1 + samletProcentTillæg / 100);
                        
                        // Generer beskrivelse med tillæg
                        let tillægBeskrivelse = '';
                        if (procentTillægForTimetype.length > 0) {
                            const tillægNavne = procentTillægForTimetype.map(pt => {
                                if (pt.navn?.toLowerCase().includes('aften')) {
                                    return isEnglish ? 'evening fee' : 'aftentillæg';
                                } else if (pt.navn?.toLowerCase().includes('nat')) {
                                    return isEnglish ? 'night fee' : 'nattillæg';
                                }
                                return pt.navn;
                            });
                            tillægBeskrivelse = ` (inkl. ${tillægNavne.join(', ')})`;
                        }

                        // Generer beskrivelse baseret på timetype
                        let typeBeskrivelse = tr.navn || 'Arbejde';
                        if (tr.navn?.toLowerCase().includes('handyman')) {
                            typeBeskrivelse = isEnglish ? 'Handyman work' : 'Handymanarbejde';
                        } else if (tr.navn?.toLowerCase().includes('tømrer')) {
                            typeBeskrivelse = isEnglish ? 'Carpenter work' : 'Tømrerarbejde';
                        } else if (tr.navn?.toLowerCase().includes('rådgivning')) {
                            typeBeskrivelse = isEnglish ? 'Counseling & advice work' : 'Rådgivning, opmåling og vejledning';
                        }

                        lines.push({
                            lineNumber: lineNumber++,
                            description: `${typeBeskrivelse}${tillægBeskrivelse}${formateretDato ? ` (d. ${formateretDato})` : ""}${postering.beskrivelse ? (": " + postering.beskrivelse) : ""}`,
                            product: {
                                productNumber: getProductNumber(tr.navn)
                            },
                            quantity: tr.antal,
                            unitNetPrice: enhedsPrisMedTillæg,
                            discountPercentage: tr.pris?.rabatProcent || 0.00
                        });
                    }
                });
            }

            // 2. Faste tillæg (opstart, trailer, osv.)
            if (postering.fasteTillæg && postering.fasteTillæg.length > 0) {
                postering.fasteTillæg.forEach((ft) => {
                    if (ft.antal > 0) {
                        let ftBeskrivelse = ft.navn || 'Tillæg';
                        if (ft.navn?.toLowerCase().includes('opstart')) {
                            ftBeskrivelse = isEnglish ? 'Start-up fee' : 'Startpris';
                        } else if (ft.navn?.toLowerCase().includes('trailer')) {
                            ftBeskrivelse = isEnglish ? 'Trailer' : 'Trailer';
                        }

                        lines.push({
                            lineNumber: lineNumber++,
                            description: `${ftBeskrivelse}${formateretDato ? ` (d. ${formateretDato})` : ""}`,
                            product: {
                                productNumber: getFastTillægProductNumber(ft.navn)
                            },
                            quantity: ft.antal,
                            unitNetPrice: ft.pris?.sats || 0,
                            discountPercentage: ft.pris?.rabatProcent || 0.00
                        });
                    }
                });
            }

            // 3. Materialer (inkl. udlæg)
            if (postering.materialer && postering.materialer.length > 0) {
                // Grupper materialer for en samlet fakturalinje
                const materialeBeskrivelserUdenUdlaeg = postering.materialer
                    .filter(m => !m.erUdlaeg)
                    .map(m => m.beskrivelse)
                    .filter(Boolean);
                
                const materialeTotalUdenUdlaeg = postering.materialer
                    .filter(m => !m.erUdlaeg)
                    .reduce((sum, m) => sum + (m.totalEksMoms || 0), 0);

                if (materialeTotalUdenUdlaeg > 0) {
                    lines.push({
                        lineNumber: lineNumber++,
                        description: `${isEnglish ? "Materials" : "Materialer"}${formateretDato ? ` (d. ${formateretDato})` : ""}${materialeBeskrivelserUdenUdlaeg.length > 0 ? ": " + materialeBeskrivelserUdenUdlaeg.join(', ') : ""}`,
                        product: {
                            productNumber: "2"
                        },
                        quantity: 1,
                        unitNetPrice: parseFloat(materialeTotalUdenUdlaeg.toFixed(2)),
                        discountPercentage: 0.00
                    });
                }

                // Udlæg håndteres separat
                const udlaegBeskrivelser = postering.materialer
                    .filter(m => m.erUdlaeg)
                    .map(m => m.beskrivelse)
                    .filter(Boolean);
                
                const udlaegTotal = postering.materialer
                    .filter(m => m.erUdlaeg)
                    .reduce((sum, m) => sum + (m.totalEksMoms || 0), 0);

                if (udlaegTotal > 0) {
                    lines.push({
                        lineNumber: lineNumber++,
                        description: `${isEnglish ? "Expenses" : "Udlæg"}${formateretDato ? ` (d. ${formateretDato})` : ""}${udlaegBeskrivelser.length > 0 ? ": " + udlaegBeskrivelser.join(', ') : ""}`,
                        product: {
                            productNumber: "2"
                        },
                        quantity: 1,
                        unitNetPrice: parseFloat(udlaegTotal.toFixed(2)),
                        discountPercentage: 0.00
                    });
                }
            }
        }
    });

    if (inklAdministrationsGebyr) {
        lines.push({
            lineNumber: lineNumber++,
            description: `${isEnglish ? "Administration fee" : "Administrationsgebyr"}`,
            product: {
            productNumber: "4"
            },
            quantity: 1,
            unitNetPrice: 49,
            discountPercentage: 0.00
        });
    }

    return lines;
}

export default useEconomicLines;


// =============================================================================
// GAMMEL STRUKTUR (Legacy - udkommenteret for reference)
// =============================================================================
// Bruges til posteringer med den gamle struktur (handymanTimer, opstart, osv.)
// Kan genaktiveres ved at tilføje tjek for posteringVersion !== 2
// =============================================================================

/*
// GAMMEL STRUKTUR - Eksempel på hvordan det var før:

if (postering.dynamiskPrisBeregning) {
    let satser = postering.satser || {};

    if (postering.opstart > 0) {
        lines.push({
            lineNumber: lineNumber++,
            description: `${isEnglish ? "Start-up fee" : "Startpris"} (${formateretDato ? `d. ${formateretDato}` : ""})`,
            product: {
                productNumber: "5"
            },
            quantity: 1,
            unitNetPrice: satser.opstartsgebyrPris,
            discountPercentage: postering.rabatProcent || 0.00
        });
    }

    if (postering.handymanTimer > 0 && !(postering.aftenTillæg || postering.natTillæg)) {
        lines.push({
            lineNumber: lineNumber++,
            description: `${isEnglish ? "Handyman work" : "Handymanarbejde"}${formateretDato ? ` (d. ${formateretDato})` : ""}${postering.beskrivelse ? (": " + postering.beskrivelse) : ""}`,
            product: {
                productNumber: "1"
            },
            quantity: (postering.handymanTimer),
            unitNetPrice: satser.handymanTimerPris,
            discountPercentage: postering.rabatProcent || 0.00
        });
    }

    if (postering.handymanTimer > 0 && postering.aftenTillæg) {
        lines.push({
            lineNumber: lineNumber++,
            description: `${isEnglish ? "Handyman work (plus evening fee)" : "Handymanarbejde (inkl. aftentillæg)"}${formateretDato ? ` (d. ${formateretDato})` : ""}${postering.beskrivelse ? (": " + postering.beskrivelse) : ""}`,
            product: {
                productNumber: "1"
            },
            quantity: (postering.handymanTimer),
            unitNetPrice: satser.handymanTimerPrisInklAftenTillæg,
            discountPercentage: postering.rabatProcent || 0.00
        });
    }

    if (postering.handymanTimer > 0 && postering.natTillæg) {
        lines.push({
            lineNumber: lineNumber++,
            description: `${isEnglish ? "Handyman work (plus night fee)" : "Handymanarbejde (inkl. nattillæg)"}${formateretDato ? ` (d. ${formateretDato})` : ""}${postering.beskrivelse ? (": " + postering.beskrivelse) : ""}`,
            product: {
                productNumber: "1"
            },
            quantity: (postering.handymanTimer),
            unitNetPrice: satser.handymanTimerPrisInklNatTillæg,
            discountPercentage: postering.rabatProcent || 0.00
        });
    }

    if (postering.tømrerTimer > 0 && !(postering.aftenTillæg || postering.natTillæg)) {
        lines.push({
            lineNumber: lineNumber++,
            description: `${isEnglish ? "Carpenter work" : "Tømrerarbejde"}${formateretDato ? ` (d. ${formateretDato})` : ""}${postering.beskrivelse ? (": " + postering.beskrivelse) : ""}`,
            product: {
                productNumber: "6"
            },
            quantity: (postering.tømrerTimer),
            unitNetPrice: 480,
            discountPercentage: postering.rabatProcent || 0.00
        });
    }

    if (postering.tømrerTimer > 0 && postering.aftenTillæg) {
        lines.push({
            lineNumber: lineNumber++,
            description: `${isEnglish ? "Carpenter work (plus evening fee)" : "Tømrerarbejde (inkl. aftentillæg)"}${formateretDato ? ` (d. ${formateretDato})` : ""}${postering.beskrivelse ? (": " + postering.beskrivelse) : ""}`,
            product: {
                productNumber: "6"
            },
            quantity: (postering.tømrerTimer),
            unitNetPrice: satser.tømrerTimerPrisInklAftenTillæg,
            discountPercentage: postering.rabatProcent || 0.00
        });
    }

    if (postering.tømrerTimer > 0 && postering.natTillæg) {
        lines.push({
            lineNumber: lineNumber++,
            description: `${isEnglish ? "Carpenter work (plus night fee)" : "Tømrerarbejde (inkl. nattillæg)"}${formateretDato ? ` (d. ${formateretDato})` : ""}${postering.beskrivelse ? (": " + postering.beskrivelse) : ""}`,
            product: {
                productNumber: "6"
            },
            quantity: (postering.tømrerTimer),
            unitNetPrice: satser.tømrerTimerPrisInklNatTillæg,
            discountPercentage: postering.rabatProcent || 0.00
        });
    }

    if (postering.rådgivningOpmålingVejledning > 0 && !(postering.aftenTillæg || postering.natTillæg)) {
        lines.push({
            lineNumber: lineNumber++,
            description: `${isEnglish ? "Counseling & advice work" : "Rådgivning, opmåling og vejledning"}${formateretDato ? ` (d. ${formateretDato})` : ""}${postering.beskrivelse ? (": " + postering.beskrivelse) : ""}`,
            product: {
                productNumber: "7"
            },
            quantity: (postering.rådgivningOpmålingVejledning),
            unitNetPrice: satser.rådgivningOpmålingVejledningPris,
            discountPercentage: postering.rabatProcent || 0.00
        });
    }

    if (postering.rådgivningOpmålingVejledning > 0 && postering.aftenTillæg) {
        lines.push({
            lineNumber: lineNumber++,
            description: `${isEnglish ? "Counseling & advice work (plus evening fee)" : "Rådgivning, opmåling og vejledning (inkl. aftentillæg)"}${formateretDato ? ` (d. ${formateretDato})` : ""}${postering.beskrivelse ? (": " + postering.beskrivelse) : ""}`,
            product: {
                productNumber: "7"
            },
            quantity: (postering.rådgivningOpmålingVejledning),
            unitNetPrice: satser.tømrerTimerPrisInklAftenTillæg,
            discountPercentage: postering.rabatProcent || 0.00
        });
    }

    if (postering.rådgivningOpmålingVejledning > 0 && postering.natTillæg) {
        lines.push({
            lineNumber: lineNumber++,
            description: `${isEnglish ? "Counseling & advice work (plus night fee)" : "Rådgivning, opmåling og vejledning (inkl. nattillæg)"}${formateretDato ? ` (d. ${formateretDato})` : ""}${postering.beskrivelse ? (": " + postering.beskrivelse) : ""}`,
            product: {
                productNumber: "7"
            },
            quantity: (postering.rådgivningOpmålingVejledning),
            unitNetPrice: satser.tømrerTimerPrisInklNatTillæg,
            discountPercentage: postering.rabatProcent || 0.00
        });
    }

    if (postering.trailer) {
        lines.push({
            lineNumber: lineNumber++,
            description: `${isEnglish ? "Trailer" : "Trailer"}${formateretDato ? ` (d. ${formateretDato})` : ""}`,
            product: {
                productNumber: "8"
            },
            quantity: 1,
            unitNetPrice: satser.trailerPris,
            discountPercentage: postering.rabatProcent || 0.00
        });
    }

    if (postering.udlæg && postering.udlæg.length > 0) {
        lines.push({
            lineNumber: lineNumber++,
            description: `${isEnglish ? "Materials" : "Materialer"}${formateretDato ? ` (d. ${formateretDato})` : ""}: ${postering.udlæg.map(udlæg => udlæg.beskrivelse).join(', ')}`,
            product: {
                productNumber: "2"
            },
            quantity: 1,
            unitNetPrice: parseFloat(
                postering.udlæg.reduce((total, udlæg) => total + udlæg.beløb, 0).toFixed(2)
              ),
            discountPercentage: 0.00
        });
    }
} else {
    // Fast pris (gammel struktur)
    lines.push({
        lineNumber: lineNumber++,
        description: `${isEnglish ? "Fixed price on work completed/initiated at " : "Fast pris på arbejde udført/opstartet d. "}${formateretDato || ""}`,
        product: {
            productNumber: "4"
        },
        quantity: 1,
        unitNetPrice: postering.fastPris,
        discountPercentage: 0.00
    });
}
*/
