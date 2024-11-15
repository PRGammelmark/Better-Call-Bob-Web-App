const useEconomicLines = (posteringer, bekræftAdmGebyr) => {

    const lines = []; 

    let lineNumber = 1;
    
    posteringer.forEach((postering) => {
        if (postering.opstart > 0 ) {
            lines.push({
                lineNumber: lineNumber++,
                description: `Startpris (${postering.dato ? postering.dato.slice(0,10) : null})`,
                product: {
                    productNumber: "5"
                },
                quantity: 1,
                unitNetPrice: 319.20,
                discountPercentage: 0.00
            });
        }

        if (postering.handymanTimer > 0 ) {
            lines.push({
                lineNumber: lineNumber++,
                description: `Handymanarbejde: ${postering.beskrivelse}`,
                product: {
                    productNumber: "1"
                },
                quantity: (postering.handymanTimer),
                unitNetPrice: 447.20,
                discountPercentage: 0.00
            });
        }

        if (postering.tømrerTimer > 0) {
            lines.push({
                lineNumber: lineNumber++,
                description: `Tømrerarbejde: ${postering.beskrivelse}`,
                product: {
                    productNumber: "6"
                },
                quantity: (postering.tømrerTimer),
                unitNetPrice: 480,
                discountPercentage: 0.00
            });
        }

        if (postering.udlæg && postering.udlæg.length > 0) {
            lines.push({
                lineNumber: lineNumber++,
                description: `Materialer: ${postering.udlæg.map(udlæg => udlæg.beskrivelse).join(', ')}`,
                product: {
                    productNumber: "2"
                },
                quantity: 1,
                unitNetPrice: postering.udlæg.reduce((total, udlæg) => total + udlæg.beløb, 0),
                discountPercentage: 0.00
            })
        }

        if (postering.øvrigt && postering.øvrigt.length > 0) {
            postering.øvrigt.forEach(posteringØvrig => {
                lines.push({
                    lineNumber: lineNumber++,
                    description: `${posteringØvrig.beskrivelse}`,
                    product: {
                        productNumber: "3"
                    },
                    quantity: 1,
                    unitNetPrice: posteringØvrig.beløb,
                    discountPercentage: 0.00
                })
            })
        }

        if (bekræftAdmGebyr) {
            lines.push({
                lineNumber: lineNumber++,
                description: "Administrationsgebyr",
                product: {
                productNumber: "4"
            },
            quantity: 1,
            unitNetPrice: 49,
                discountPercentage: 0.00
            })
        }

    })

    return lines;
}

export default useEconomicLines;