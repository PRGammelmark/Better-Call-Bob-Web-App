/**
 * Beregningsfunktioner til posteringer
 * Udtrukket fra AddPosteringV2.jsx for bedre vedligeholdelse
 */

/**
 * Henter honorarSats fra satser-objekt, håndterer både gammel og ny struktur
 * @param {Object} satser - Satser objektet
 * @param {String} type - Type af sats ('timetyper', 'fasteTillaeg', 'procentTillaeg')
 * @param {String} id - ID på typen
 * @param {Number} fallback - Fallback værdi hvis sats ikke findes
 * @returns {Number} HonorarSats værdien
 */
function getHonorarSats(satser, type, id, fallback) {
    const sats = satser?.[type]?.[id];
    if (typeof sats === 'object' && sats?.honorarSats !== undefined) {
        return sats.honorarSats;
    }
    if (typeof sats === 'number') {
        return sats;
    }
    return fallback;
}

/**
 * Beregner dynamisk honorar og pris baseret på valgte timetyper, tillæg og rabat
 * @param {Object} brugerSatser - Medarbejderens individuelle honorarsatser (kun for honorar, ikke pris)
 * @returns {{ totalHonorar: number, totalPris: number, totalOutlays: number }}
 */
export function beregnDynamiskHonorarOgPris({
    valgteTimetyper,
    valgteFasteTillaeg,
    valgteProcentTillaeg,
    outlays,
    materialer = [],
    rabatProcent,
    timetyper,
    fasteTillaeg,
    procentTillaeg,
    indstillinger,
    brugerSatser = {}  // NY: Medarbejderens individuelle honorarsatser
}) {
    let totalHonorar = 0;
    let totalPris = 0;

    // Beregn timeregistrering
    valgteTimetyper.forEach(({ timetypeId, antal }) => {
        const timetype = timetyper.find(t => t._id === timetypeId);
        if (timetype && antal > 0) {
            // Honorar: Brug brugerens sats hvis den findes, ellers standard kostpris
            const honorarSats = getHonorarSats(brugerSatser, 'timetyper', timetypeId, timetype.kostpris);
            // Pris: Altid standard listepris (global)
            const prisSats = timetype.listepris;
            
            // Anvend rabat
            const rabatMultiplikator = (1 - rabatProcent / 100);
            
            // Beregn honorar (rabat påvirker honorar hvis indstillet)
            const honorarMedRabat = indstillinger?.modregnKunderabatIMedarbejderlon 
                ? honorarSats * antal * rabatMultiplikator
                : honorarSats * antal;
            
            // Beregn pris
            const prisMedRabat = prisSats * antal * rabatMultiplikator;
            
            totalHonorar += honorarMedRabat;
            totalPris += prisMedRabat;
        }
    });

    // Beregn faste tillæg
    valgteFasteTillaeg.forEach(({ tillaegId, antal }) => {
        const tillaeg = fasteTillaeg.find(t => t._id === tillaegId);
        if (tillaeg && antal > 0) {
            // Honorar: Brug brugerens sats hvis den findes, ellers standard kostpris
            const honorarSats = getHonorarSats(brugerSatser, 'fasteTillaeg', tillaegId, tillaeg.kostpris);
            // Pris: Altid standard listepris (global)
            const prisSats = tillaeg.listepris;
            
            const rabatMultiplikator = (1 - rabatProcent / 100);
            
            const honorarMedRabat = indstillinger?.modregnKunderabatIMedarbejderlon 
                ? honorarSats * antal * rabatMultiplikator
                : honorarSats * antal;
            
            const prisMedRabat = prisSats * antal * rabatMultiplikator;
            
            totalHonorar += honorarMedRabat;
            totalPris += prisMedRabat;
        }
    });

    // Beregn procent tillæg (påvirker kun de specifikke timetyper de er tildelt)
    valgteTimetyper.forEach(({ timetypeId, antal, tillaeg: timerTillaeg }) => {
        if (!timerTillaeg || timerTillaeg.length === 0) return;
        
        const timetype = timetyper.find(t => t._id === timetypeId);
        if (!timetype || antal <= 0) return;

        // Grundlag for honorar: Brug brugerens timetype-sats hvis den findes
        const brugerTimetypeSats = getHonorarSats(brugerSatser, 'timetyper', timetypeId, timetype.kostpris);
        const grundlagHonorar = brugerTimetypeSats * antal;
        // Grundlag for pris: Altid standard listepris
        const grundlagPris = timetype.listepris * antal;

        // Anvend hvert procent tillæg der er tildelt denne timer
        timerTillaeg.forEach((tillaegId) => {
            const tillaeg = procentTillaeg.find(t => t._id === tillaegId);
            if (!tillaeg) return;

            // Pris-procent: Altid standard listeSats (global)
            const procentSats = tillaeg.listeSats / 100;
            // Honorar-procent: Brug brugerens sats hvis den findes, ellers standard kostSats
            const honorarProcentSats = getHonorarSats(brugerSatser, 'procentTillaeg', tillaegId, tillaeg.kostSats) / 100;
            
            // ListeSats tilføjes til pris-beløbet
            const tillægPris = grundlagPris * procentSats;
            // KostSats tilføjes til honorarbeløbet
            const tillægHonorar = grundlagHonorar * honorarProcentSats;
            
            // Anvend rabat på procent tillæg
            const rabatMultiplikator = (1 - rabatProcent / 100);
            totalPris += tillægPris * rabatMultiplikator;
            
            if (indstillinger?.modregnKunderabatIMedarbejderlon) {
                totalHonorar += tillægHonorar * rabatMultiplikator;
            } else {
                totalHonorar += tillægHonorar;
            }
        });
    });

    // Tilføj udlæg (rabat påvirker ikke udlæg)
    const totalOutlays = outlays.reduce((sum, item) => sum + Number(item.beløb || 0), 0);
    totalHonorar += totalOutlays;
    totalPris += totalOutlays;

    // Tilføj materialer
    materialer.forEach((materiale) => {
        const antal = Number(materiale.antal) || 1;
        const kostpris = Number(materiale.kostpris) || 0;
        const salgspris = Number(materiale.salgspris) || kostpris;
        
        // Hvis medarbejder har lagt ud, tilføj kun kostpris til honorar
        if (materiale.erUdlaeg) {
            totalHonorar += kostpris * antal;
        }
        
        // Tilføj salgspris til totalPris (ekskl. moms)
        totalPris += salgspris * antal;
    });

    return { totalHonorar, totalPris, totalOutlays };
}

/**
 * Bygger timeregistrering array til postering
 * @param {Object} brugerSatser - Medarbejderens individuelle honorarsatser (kun for honorar, ikke pris)
 */
export function bygTimeregistrering({
    valgteTimetyper,
    timetyper,
    rabatProcent,
    indstillinger,
    brugerSatser = {}  // NY: Medarbejderens individuelle honorarsatser
}) {
    return valgteTimetyper
        .filter(vt => vt.antal > 0)
        .map(({ timetypeId, antal }) => {
            const timetype = timetyper.find(t => t._id === timetypeId);
            if (!timetype) return null;

            const rabatMultiplikator = (1 - rabatProcent / 100);
            // Pris: Altid standard listepris (global)
            const prisSats = timetype.listepris;
            // Honorar: Brug brugerens sats hvis den findes, ellers standard kostpris
            const honorarSats = getHonorarSats(brugerSatser, 'timetyper', timetypeId, timetype.kostpris);

            const totalEksMoms = prisSats * antal * rabatMultiplikator;
            const momsSats = 25; // Standard moms
            const momsBeløb = totalEksMoms * (momsSats / 100);
            const totalInklMoms = totalEksMoms + momsBeløb;

            const honorarTotal = indstillinger?.modregnKunderabatIMedarbejderlon
                ? honorarSats * antal * rabatMultiplikator
                : honorarSats * antal;

            return {
                navn: timetype.navn,
                beskrivelse: timetype.beskrivelse || "",
                antal: antal,
                pris: {
                    sats: prisSats,
                    rabatProcent: rabatProcent,
                    rabatBeløb: prisSats * antal * (rabatProcent / 100),
                    momsSats: momsSats,
                    momsBeløb: momsBeløb,
                    totalEksMoms: totalEksMoms,
                    totalInklMoms: totalInklMoms
                },
                honorar: {
                    sats: honorarSats,
                    rabatProcent: indstillinger?.modregnKunderabatIMedarbejderlon ? rabatProcent : 0,
                    rabatBeløb: indstillinger?.modregnKunderabatIMedarbejderlon ? honorarSats * antal * (rabatProcent / 100) : 0,
                    total: honorarTotal
                }
            };
        })
        .filter(Boolean);
}

/**
 * Bygger faste tillæg array til postering
 * @param {Object} brugerSatser - Medarbejderens individuelle honorarsatser (kun for honorar, ikke pris)
 */
export function bygFasteTillaeg({
    valgteFasteTillaeg,
    fasteTillaeg,
    rabatProcent,
    indstillinger,
    brugerSatser = {}  // NY: Medarbejderens individuelle honorarsatser
}) {
    return valgteFasteTillaeg
        .filter(vt => vt.antal > 0)
        .map(({ tillaegId, antal }) => {
            const tillaeg = fasteTillaeg.find(t => t._id === tillaegId);
            if (!tillaeg) return null;

            const rabatMultiplikator = (1 - rabatProcent / 100);
            // Pris: Altid standard listepris (global)
            const prisSats = tillaeg.listepris;
            // Honorar: Brug brugerens sats hvis den findes, ellers standard kostpris
            const honorarSats = getHonorarSats(brugerSatser, 'fasteTillaeg', tillaegId, tillaeg.kostpris);

            const totalEksMoms = prisSats * antal * rabatMultiplikator;
            const momsSats = 25;
            const momsBeløb = totalEksMoms * (momsSats / 100);
            const totalInklMoms = totalEksMoms + momsBeløb;

            const honorarTotal = indstillinger?.modregnKunderabatIMedarbejderlon
                ? honorarSats * antal * rabatMultiplikator
                : honorarSats * antal;

            return {
                navn: tillaeg.navn,
                beskrivelse: tillaeg.beskrivelse || "",
                antal: antal,
                pris: {
                    sats: prisSats,
                    rabatProcent: rabatProcent,
                    rabatBeløb: prisSats * antal * (rabatProcent / 100),
                    momsSats: momsSats,
                    momsBeløb: momsBeløb,
                    totalEksMoms: totalEksMoms,
                    totalInklMoms: totalInklMoms
                },
                honorar: {
                    sats: honorarSats,
                    rabatProcent: indstillinger?.modregnKunderabatIMedarbejderlon ? rabatProcent : 0,
                    rabatBeløb: indstillinger?.modregnKunderabatIMedarbejderlon ? honorarSats * antal * (rabatProcent / 100) : 0,
                    total: honorarTotal
                }
            };
        })
        .filter(Boolean);
}

/**
 * Bygger procent tillæg array til postering
 * ProcentTillæg gælder kun for de specifikke timetyper de er tildelt
 * @param {Object} brugerSatser - Medarbejderens individuelle honorarsatser (kun for honorar, ikke pris)
 */
export function bygProcentTillaeg({
    valgteTimetyper,
    timetyper,
    procentTillaeg,
    rabatProcent,
    indstillinger,
    brugerSatser = {}  // NY: Medarbejderens individuelle honorarsatser
}) {
    const procentTillægArray = [];

    // Iterer gennem hver timer og byg procentTillæg for de tillæg der er tildelt den
    valgteTimetyper.forEach((valgtTimetype) => {
        const { timetypeId, antal, tillaeg: timerTillaeg } = valgtTimetype;
        
        if (!timerTillaeg || timerTillaeg.length === 0) return;
        if (antal <= 0) return;
        
        const timetype = timetyper.find(t => t._id === timetypeId);
        if (!timetype) return;

        // Grundlag for pris: Altid standard listepris (global)
        const grundlagPris = timetype.listepris * antal;
        // Grundlag for honorar: Brug brugerens timetype-sats hvis den findes
        const brugerTimetypeSats = getHonorarSats(brugerSatser, 'timetyper', timetypeId, timetype.kostpris);
        const grundlagHonorar = brugerTimetypeSats * antal;

        // Byg procentTillæg for hvert tillæg der er tildelt denne timer
        timerTillaeg.forEach((tillaegId) => {
            const tillaeg = procentTillaeg.find(t => t._id === tillaegId);
            if (!tillaeg) return;

            // Pris-procent: Altid standard listeSats (global)
            const procentSats = tillaeg.listeSats / 100;
            // Honorar-procent: Brug brugerens sats hvis den findes, ellers standard kostSats
            const brugerProcentSats = getHonorarSats(brugerSatser, 'procentTillaeg', tillaegId, tillaeg.kostSats);
            const honorarProcentSats = brugerProcentSats / 100;

            // ListeSats tilføjes til pris-beløbet
            const tillægPris = grundlagPris * procentSats;
            // KostSats tilføjes til honorarbeløbet
            const tillægHonorar = grundlagHonorar * honorarProcentSats;

            const rabatMultiplikator = (1 - rabatProcent / 100);
            const totalEksMoms = tillægPris * rabatMultiplikator;
            const momsSats = 25;
            const momsBeløb = totalEksMoms * (momsSats / 100);
            const totalInklMoms = totalEksMoms + momsBeløb;

            const honorarTotal = indstillinger?.modregnKunderabatIMedarbejderlon
                ? tillægHonorar * rabatMultiplikator
                : tillægHonorar;

            procentTillægArray.push({
                navn: tillaeg.navn,
                beskrivelse: tillaeg.beskrivelse || "",
                timetypeNavn: timetype.navn,
                timetypeAntal: antal,
                pris: {
                    procentSats: tillaeg.listeSats,
                    grundlag: grundlagPris,
                    rabatProcent: rabatProcent,
                    rabatBeløb: tillægPris * (rabatProcent / 100),
                    momsSats: momsSats,
                    momsBeløb: momsBeløb,
                    totalEksMoms: totalEksMoms,
                    totalInklMoms: totalInklMoms
                },
                honorar: {
                    procentSats: brugerProcentSats,
                    grundlag: grundlagHonorar,
                    rabatProcent: indstillinger?.modregnKunderabatIMedarbejderlon ? rabatProcent : 0,
                    rabatBeløb: indstillinger?.modregnKunderabatIMedarbejderlon ? tillægHonorar * (rabatProcent / 100) : 0,
                    total: honorarTotal
                }
            });
        });
    });

    return procentTillægArray;
}

/**
 * Bygger udlæg array til postering
 */
export function bygUdlaeg(outlays) {
    return outlays.map(outlay => {
        const beløb = Number(outlay.beløb) || 0;
        const momsSats = 25;
        const momsBeløb = beløb * (momsSats / 125); // Moms inkluderet i beløbet
        const totalEksMoms = beløb - momsBeløb;
        const totalInklMoms = beløb;

        return {
            beskrivelse: outlay.beskrivelse || "",
            beløb: beløb,
            momsSats: momsSats,
            momsBeløb: momsBeløb,
            totalEksMoms: totalEksMoms,
            totalInklMoms: totalInklMoms,
            kvittering: outlay.kvittering || ""
        };
    });
}

/**
 * Bygger materialer array til postering
 */
export function bygMaterialer(materialer) {
    return materialer.map(materiale => {
        const antal = Number(materiale.antal) || 1;
        const kostpris = Number(materiale.kostpris) || 0;
        const salgspris = Number(materiale.salgspris) || kostpris;
        const momsSats = 25;
        const momsLand = 'DK';
        
        // Beregn totaler baseret på salgspris
        const totalEksMoms = salgspris * antal;
        const momsBeløb = totalEksMoms * (momsSats / 100);
        const totalInklMoms = totalEksMoms + momsBeløb;
        
        // Medarbejderudlæg
        const totalMedarbejderUdlaeg = materiale.erUdlaeg ? kostpris * antal : 0;
        const restMedarbejderUdlaeg = materiale.erUdlaeg ? kostpris * antal : 0;

        return {
            varenummer: materiale.varenummer || "",
            beskrivelse: materiale.beskrivelse || "",
            antal: antal,
            kostpris: kostpris,
            salgspris: salgspris,
            momsLand: momsLand,
            momsSats: momsSats,
            momsBeløb: momsBeløb,
            totalEksMoms: totalEksMoms,
            totalInklMoms: totalInklMoms,
            manueltRegistreret: materiale.manueltRegistreret || false,
            totalMedarbejderUdlaeg: totalMedarbejderUdlaeg,
            restMedarbejderUdlaeg: restMedarbejderUdlaeg,
            kvittering: materiale.kvittering || "",
            billede: materiale.billede || ""
        };
    });
}

/**
 * Beregner totaler fra alle dele
 */
export function beregnTotaler(timeregistrering, fasteTillæg, procentTillæg, udlæg, materialer = []) {
    const totalPrisEksklMoms = 
        timeregistrering.reduce((sum, tr) => sum + tr.pris.totalEksMoms, 0) +
        fasteTillæg.reduce((sum, ft) => sum + ft.pris.totalEksMoms, 0) +
        procentTillæg.reduce((sum, pt) => sum + pt.pris.totalEksMoms, 0) +
        udlæg.reduce((sum, u) => sum + u.totalEksMoms, 0) +
        materialer.reduce((sum, m) => sum + m.totalEksMoms, 0);

    const totalMoms = 
        timeregistrering.reduce((sum, tr) => sum + tr.pris.momsBeløb, 0) +
        fasteTillæg.reduce((sum, ft) => sum + ft.pris.momsBeløb, 0) +
        procentTillæg.reduce((sum, pt) => sum + pt.pris.momsBeløb, 0) +
        udlæg.reduce((sum, u) => sum + u.momsBeløb, 0) +
        materialer.reduce((sum, m) => sum + m.momsBeløb, 0);

    const totalPrisInklMoms = totalPrisEksklMoms + totalMoms;

    const totalHonorar = 
        timeregistrering.reduce((sum, tr) => sum + tr.honorar.total, 0) +
        fasteTillæg.reduce((sum, ft) => sum + ft.honorar.total, 0) +
        procentTillæg.reduce((sum, pt) => sum + pt.honorar.total, 0) +
        udlæg.reduce((sum, u) => sum + u.totalEksMoms, 0) +
        materialer.reduce((sum, m) => sum + m.totalMedarbejderUdlaeg, 0);

    return {
        totalPrisEksklMoms,
        totalMoms,
        totalPrisInklMoms,
        totalHonorar
    };
}

/**
 * Bygger komplet posteringsobjekt
 */
export function bygPosteringObjekt({
    posteringDato,
    posteringBeskrivelse,
    timeregistrering,
    fasteTillæg,
    procentTillæg,
    udlæg,
    materialer,
    posteringBilleder,
    posteringSatser,
    rabatProcent,
    dynamiskHonorarBeregning,
    dynamiskPrisBeregning,
    posteringFastHonorar,
    posteringFastPris,
    opgaveID,
    brugerID,
    kundeID,
    opretPosteringPåVegneAfEnAnden,
    valgtMedarbejder,
    // Nye felter
    posteringType = 'debet',
    kreditererPostering = null,
    kreditKommentar = '',
    låsPosteringVedOprettelse = false,
    tilbudsPrisEksklMoms = null,
    momsDefault = null
}) {
    const totaler = beregnTotaler(timeregistrering, fasteTillæg, procentTillæg, udlæg, materialer);

    // Brug tilbudspris hvis den er sat, ellers dynamisk pris
    const finalTilbudsPris = tilbudsPrisEksklMoms !== null && tilbudsPrisEksklMoms !== '' 
        ? Number(tilbudsPrisEksklMoms) 
        : null;

    return {
        dato: posteringDato,
        beskrivelse: posteringBeskrivelse,
        type: posteringType,
        kreditererPostering: posteringType === 'kredit' && kreditererPostering ? kreditererPostering._id : undefined,
        kreditKommentar: posteringType === 'kredit' ? kreditKommentar : undefined,
        låst: låsPosteringVedOprettelse,
        timeregistrering: timeregistrering,
        fasteTillæg: fasteTillæg,
        procentTillæg: procentTillæg,
        udlæg: udlæg,
        materialer: materialer,
        totalPrisEksklMoms: totaler.totalPrisEksklMoms,
        totalMoms: totaler.totalMoms,
        totalPrisInklMoms: totaler.totalPrisInklMoms,
        billeder: posteringBilleder,
        posteringVersion: 2,
        // Nye felter
        brugDynamiskHonorar: dynamiskHonorarBeregning,
        brugFastHonorar: !dynamiskHonorarBeregning && Number(posteringFastHonorar) > 0,
        totalDynamiskHonorar: totaler.totalHonorar,
        totalFastHonorar: Number(posteringFastHonorar),
        tilbudsPrisEksklMoms: finalTilbudsPris,
        momsDefault: momsDefault,
        // Gamle felter for bagudkompatibilitet
        opstart: 0,
        handymanTimer: 0,
        tømrerTimer: 0,
        rådgivningOpmålingVejledning: 0,
        aftenTillæg: false,
        natTillæg: false,
        trailer: false,
        satser: posteringSatser,
        rabatProcent: rabatProcent,
        dynamiskHonorarBeregning: dynamiskHonorarBeregning,
        dynamiskPrisBeregning: dynamiskPrisBeregning,
        fastHonorar: Number(posteringFastHonorar),
        fastPris: Number(posteringFastPris),
        dynamiskHonorar: totaler.totalHonorar,
        dynamiskPris: totaler.totalPrisEksklMoms,
        totalHonorar: dynamiskHonorarBeregning ? totaler.totalHonorar : Number(posteringFastHonorar),
        totalPris: dynamiskPrisBeregning ? totaler.totalPrisEksklMoms : (finalTilbudsPris !== null ? finalTilbudsPris : Number(posteringFastPris)),
        opgaveID: opgaveID,
        brugerID: opretPosteringPåVegneAfEnAnden ? (valgtMedarbejder?._id || brugerID) : brugerID,
        kundeID: kundeID,
        kunde: kundeID,
        bruger: opretPosteringPåVegneAfEnAnden ? (valgtMedarbejder?._id || brugerID) : brugerID,
        opgave: opgaveID
    };
}

/**
 * Helper til at hente initialer fra navn
 */
export function getInitials(name) {
    if (!name) return "?";
    const parts = String(name).trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}
