// Funktionen tager to inputs:
// 1. betalingsbeløb: Beløbet, der skal registreres på posteringerne
// 2. betalingsID: IDet på betalingen, der skal registreres på posteringerne. Dette kan enten være MobilePay eller Economic.
// Når en betaling igangsættes (enten via MobilePay eller faktura), lagres betalingsID'et på den pågældende postering. Hvis en betaling registreres i en poll, så vil funktionen herunder finde de posteringer med ID'et, og fordele pengene ud på dem.

import Postering from "../models/posteringModel.js";

export async function registrerBetalinger(betalingsbeløb, betalingsID) {
    console.log("Registrerer betalinger på posteringer ...")
    const posteringer = await Postering.find({
        "opkrævninger.reference": { $in: betalingsID }
    });
    const sorteredePosteringer = posteringer.sort((a, b) => a.totalPris - b.totalPris);
    console.log("Sorterede posteringer: ", sorteredePosteringer)
    console.log("Samlet betalingsbeløb: ", betalingsbeløb)
    
    let fikseretBetalingsbeløb = 0;
    
    if(!betalingsbeløb) {
        const manglendeBetalingsbeløbForAllePosteringer = sorteredePosteringer.reduce((sum, postering) => sum + (postering.totalPris * 1.25) - postering.betalinger.reduce((sum, betaling) => sum + betaling.betalingsbeløb, 0), 0);
        fikseretBetalingsbeløb = manglendeBetalingsbeløbForAllePosteringer;
        return;
    }

    let resterendeBetaltBeløb = betalingsbeløb || fikseretBetalingsbeløb;

    console.log("Looper igennem posteringer ...")

    while(resterendeBetaltBeløb > 0) { 
        const postering = sorteredePosteringer.shift();
        const posteringManglendeBeløb = (postering.totalPris * 1.25) - postering.betalinger.reduce((sum, betaling) => sum + betaling.betalingsbeløb, 0);

        if(sorteredePosteringer.length === 0) {
            postering.betalinger.push({
                betalingsID,
                betalingsbeløb: resterendeBetaltBeløb,
                betalingsmetode: 'mobilepay',
                dato: new Date()
            });
            if(posteringManglendeBeløb <= resterendeBetaltBeløb) {
                postering.betalt = new Date();
            }
            postering.låst = true;
            await postering.save();
            console.log("Betalt " + resterendeBetaltBeløb + " kr. på posteringID: " + postering._id + ", da det var den sidste postering i rækken.")
            return;
        }

        if (posteringManglendeBeløb <= 0) {
            console.log("Springer postering over – allerede fuldt betalt eller overbetalt");
            continue;
        }

        if(posteringManglendeBeløb <= resterendeBetaltBeløb) {
            postering.betalinger.push({
                betalingsID,
                betalingsbeløb: posteringManglendeBeløb,
                betalingsmetode: 'mobilepay',
                dato: new Date()
            });
            postering.betalt = new Date();
            postering.låst = true;
            await postering.save();
            resterendeBetaltBeløb -= posteringManglendeBeløb;
            console.log("Betalt " + posteringManglendeBeløb + " kr. som en fuld betaling på posteringID: " + postering._id)
            console.log("Resterende betalingsbeløb: ", resterendeBetaltBeløb)
        } else {
            postering.betalinger.push({
                betalingsID,
                betalingsbeløb: resterendeBetaltBeløb,
                betalingsmetode: 'mobilepay',
                dato: new Date()
            });
            postering.låst = true;
            await postering.save();
            resterendeBetaltBeløb = 0;
            console.log("Betalt " + resterendeBetaltBeløb + " kr. som en delvis betaling på posteringID: " + postering._id)
            console.log("Resterende betalingsbeløb: ", resterendeBetaltBeløb)
        }
    }
}