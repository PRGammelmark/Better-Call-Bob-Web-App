// import satser from "../variables.js";

const useEconomicLines = (posteringer, inklAdministrationsGebyr, isEnglish) => {

    const lines = []; 

    let lineNumber = 1;
    
    posteringer.forEach((postering) => {
        let satser = postering.satser;

        if(postering.dynamiskPrisBeregning){
            if (postering.opstart > 0 ) {
                lines.push({
                    lineNumber: lineNumber++,
                    description: `${isEnglish ? "Start-up fee" : "Startpris"} (${postering?.dato.slice(0,10) || ""})`,
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
                    description: `${isEnglish ? "Handyman work" : "Handymanarbejde"}${postering.beskrivelse ? (": " + postering.beskrivelse) : ""}`,
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
                    description: `${isEnglish ? "Handyman work (plus evening fee)" : "Handymanarbejde (inkl. aftentillæg)"}${postering.beskrivelse ? (": " + postering.beskrivelse) : ""}`,
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
                    description: `${isEnglish ? "Handyman work (plus night fee)" : "Handymanarbejde (inkl. nattillæg)"}${postering.beskrivelse ? (": " + postering.beskrivelse) : ""}`,
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
                    description: `${isEnglish ? "Carpenter work" : "Tømrerarbejde"}${postering.beskrivelse ? (": " + postering.beskrivelse) : ""}`,
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
                    description: `${isEnglish ? "Carpenter work (plus evening fee)" : "Tømrerarbejde (inkl. aftentillæg)"}${postering.beskrivelse ? (": " + postering.beskrivelse) : ""}`,
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
                    description: `${isEnglish ? "Carpenter work (plus night fee)" : "Tømrerarbejde (inkl. nattillæg)"}${postering.beskrivelse ? (": " + postering.beskrivelse) : ""}`,
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
                    description: `${isEnglish ? "Counseling & advice work" : "Rådgivning, opmåling og vejledning"}${postering.beskrivelse ? (": " + postering.beskrivelse) : ""}`,
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
                    description: `${isEnglish ? "Counseling & advice work (plus evening fee)" : "Rådgivning, opmåling og vejledning (inkl. aftentillæg)"}${postering.beskrivelse ? (": " + postering.beskrivelse) : ""}`,
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
                    description: `${isEnglish ? "Counseling & advice work (plus night fee)" : "Rådgivning, opmåling og vejledning (inkl. nattillæg)"}${postering.beskrivelse ? (": " + postering.beskrivelse) : ""}`,
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
                    description: `${isEnglish ? "Trailer" : "Trailer"}`,
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
                    description: `${isEnglish ? "Materials" : "Materialer"}: ${postering.udlæg.map(udlæg => udlæg.beskrivelse).join(', ')}`,
                    product: {
                        productNumber: "2"
                    },
                    quantity: 1,
                    unitNetPrice: postering.udlæg.reduce((total, udlæg) => total + udlæg.beløb, 0).toFixed(2),
                    discountPercentage: 0.00
                })
            }
        } else {
            lines.push({
                lineNumber: lineNumber++,
                description: `${isEnglish ? "Fixed price on work completed/initiated at " : "Fast pris på arbejde udført/opstartet d. "} ${postering?.dato.slice(0,10) || ""}`,
                product: {
                    productNumber: "4"
                },
                quantity: 1,
                unitNetPrice: postering.fastPris,
                discountPercentage: 0.00
            })
        }
    })

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
        })
    }

    return lines;
}

export default useEconomicLines;