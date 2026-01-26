// =============================================================================
// BEREGNINGER.JS - Opdateret til ny posteringstruktur (version 2)
// =============================================================================
// Posteringer bruger nu arrays: timeregistrering[], fasteTillæg[], procentTillæg[], materialer[]
// Hver post har pre-beregnede værdier: pris.totalEksMoms, pris.momsBeløb, honorar.total
// Posteringen har også totaler: totalPrisEksklMoms, totalMoms, totalDynamiskHonorar, etc.
// =============================================================================

// LISTE: FUNKTIONER TIL PRIS-BEREGNINGER
// -----------------------------------------------
// fastPris()
// timeregistreringPris()
// fasteTillægPris()
// procentTillægPris()
// materialePris()
// udlægPris()
// rabatPris()
// totalPris()
// totalMoms()

// LISTE: FUNKTIONER TIL HONORAR-BEREGNINGER
// -----------------------------------------------
// fastHonorar()
// timeregistreringHonorar()
// fasteTillægHonorar()
// procentTillægHonorar()
// materialeUdlæg() (medarbejders udlæg for materialer)
// udlægHonorar()
// rabatHonorar()
// totalHonorar()

// LISTE: FUNKTIONER TIL ANTAL-BEREGNINGER
// -----------------------------------------------
// antalTimeregistreringer()
// antalFasteTillæg()
// antalProcentTillæg()
// antalMaterialer()
// antalUdlæg()

// LISTE: FUNKTIONER TIL BETALING-BEREGNINGER
// -----------------------------------------------
// totalBetalinger()

// LISTE: LEGACY WRAPPER-FUNKTIONER (bevaret for kompatibilitet)
// -----------------------------------------------
// opstartPris/Honorar, handymanPris/Honorar, tømrerPris/Honorar, 
// rådgivningPris/Honorar, trailerPris/Honorar, aftenTillægPris/Honorar, 
// natTillægPris/Honorar, etc.

// =============================================================================
// HJÆLPE-FUNKTIONER
// =============================================================================

function lavListe(posteringer) {
    return Array.isArray(posteringer) ? posteringer : [posteringer];
}

/**
 * Henter total pris inkl. moms for en enkelt postering
 * Understøtter både ny struktur (totalPrisInklMoms) og gammel struktur (totalPris * 1.25)
 * @param {Object} postering - Posteringen
 * @returns {number} Total pris inkl. moms
 */
export function getPosteringTotalPrisInklMoms(postering) {
    if (!postering) return 0;
    // Ny struktur har totalPrisInklMoms direkte
    if (postering.totalPrisInklMoms !== undefined && postering.totalPrisInklMoms !== null) {
        return postering.totalPrisInklMoms;
    }
    // Gammel struktur: totalPris er eks. moms, så vi ganger med 1.25
    return (postering.totalPris || 0) * 1.25;
}

function formaterBeløb(beløb, decimaler = 2) {
    return {
        beløb: beløb,
        formateret: beløb.toLocaleString('da-DK', {
            style: 'currency',
            currency: 'DKK',
            minimumFractionDigits: decimaler,
            maximumFractionDigits: decimaler
        })
    };
}

// =============================================================================
// FUNKTIONER TIL BETALING-BEREGNINGER
// =============================================================================

export function totalBetalinger(posteringer, decimaler = 2) {
    if (!posteringer) return;
    const posteringerListe = lavListe(posteringer);

    const total = posteringerListe.reduce((akk, nuv) => {
        const betalinger = Array.isArray(nuv.betalinger) ? nuv.betalinger : [];
        return akk + betalinger.reduce((sum, betaling) => sum + (betaling.betalingsbeløb || 0), 0);
    }, 0) * 1.25;

    return formaterBeløb(total, decimaler);
}

// =============================================================================
// FUNKTIONER TIL PRIS-BEREGNINGER (NYE)
// =============================================================================

/**
 * Fast pris (tilbudspris) - bruges når dynamiskPrisBeregning er false
 */
export function fastPris(posteringer, decimaler = 2, inklMoms = false) {
    if (!posteringer) return;
    const posteringerListe = lavListe(posteringer);

    let total = posteringerListe.reduce((akk, nuv) => {
        // Brug tilbudsPrisEksklMoms hvis sat, ellers check om dynamiskPrisBeregning er false
        if (!nuv.dynamiskPrisBeregning) {
            return akk + (nuv.tilbudsPrisEksklMoms ?? nuv.totalPrisEksklMoms ?? 0);
        }
        return akk;
    }, 0);

    if (inklMoms) {
        total *= 1.25;
    }

    return formaterBeløb(total, decimaler);
}

/**
 * Pris fra timeregistrering array
 */
export function timeregistreringPris(posteringer, decimaler = 2, inklMoms = false) {
    if (!posteringer) return;
    const posteringerListe = lavListe(posteringer);

    let total = posteringerListe.reduce((akk, nuv) => {
        if (!nuv.dynamiskPrisBeregning) return akk;
        const sum = (nuv.timeregistrering || []).reduce((s, tr) => s + (tr.pris?.totalEksMoms || 0), 0);
        return akk + sum;
    }, 0);

    if (inklMoms) {
        total *= 1.25;
    }

    return formaterBeløb(total, decimaler);
}

/**
 * Pris fra faste tillæg array
 */
export function fasteTillægPris(posteringer, decimaler = 2, inklMoms = false) {
    if (!posteringer) return;
    const posteringerListe = lavListe(posteringer);

    let total = posteringerListe.reduce((akk, nuv) => {
        if (!nuv.dynamiskPrisBeregning) return akk;
        const sum = (nuv.fasteTillæg || []).reduce((s, ft) => s + (ft.pris?.totalEksMoms || 0), 0);
        return akk + sum;
    }, 0);

    if (inklMoms) {
        total *= 1.25;
    }

    return formaterBeløb(total, decimaler);
}

/**
 * Pris fra procent tillæg array
 */
export function procentTillægPris(posteringer, decimaler = 2, inklMoms = false) {
    if (!posteringer) return;
    const posteringerListe = lavListe(posteringer);

    let total = posteringerListe.reduce((akk, nuv) => {
        if (!nuv.dynamiskPrisBeregning) return akk;
        const sum = (nuv.procentTillæg || []).reduce((s, pt) => s + (pt.pris?.totalEksMoms || 0), 0);
        return akk + sum;
    }, 0);

    if (inklMoms) {
        total *= 1.25;
    }

    return formaterBeløb(total, decimaler);
}

/**
 * Pris fra materialer array
 */
export function materialePris(posteringer, decimaler = 2, inklMoms = false) {
    if (!posteringer) return;
    const posteringerListe = lavListe(posteringer);

    let total = posteringerListe.reduce((akk, nuv) => {
        if (!nuv.dynamiskPrisBeregning) return akk;
        const sum = (nuv.materialer || []).reduce((s, m) => s + (m.totalEksMoms || 0), 0);
        return akk + sum;
    }, 0);

    if (inklMoms) {
        total *= 1.25;
    }

    return formaterBeløb(total, decimaler);
}

/**
 * Pris fra udlæg array
 */
export function udlægPris(posteringer, decimaler = 2, inklMoms = false) {
    if (!posteringer) return;
    const posteringerListe = lavListe(posteringer);

    let total = posteringerListe.reduce((akk, nuv) => {
        if (!nuv.dynamiskPrisBeregning) return akk;
        const sum = (nuv.udlæg || []).reduce((s, u) => s + (u.totalEksMoms ?? parseFloat(u.beløb) ?? 0), 0);
        return akk + sum;
    }, 0);

    if (inklMoms) {
        total *= 1.25;
    }

    return formaterBeløb(total, decimaler);
}

/**
 * Samlet rabat på pris - sum af alle rabatBeløb fra arrays
 */
export function rabatPris(posteringer, decimaler = 2, inklMoms = false) {
    if (!posteringer) return;
    const posteringerListe = lavListe(posteringer);

    let total = posteringerListe.reduce((akk, nuv) => {
        if (!nuv.dynamiskPrisBeregning) return akk;
        
        // Sum rabatBeløb fra alle arrays
        const trRabat = (nuv.timeregistrering || []).reduce((s, tr) => s + (tr.pris?.rabatBeløb || 0), 0);
        const ftRabat = (nuv.fasteTillæg || []).reduce((s, ft) => s + (ft.pris?.rabatBeløb || 0), 0);
        const ptRabat = (nuv.procentTillæg || []).reduce((s, pt) => s + (pt.pris?.rabatBeløb || 0), 0);
        
        return akk + trRabat + ftRabat + ptRabat;
    }, 0);

    if (inklMoms) {
        total *= 1.25;
    }

    return formaterBeløb(total, decimaler);
}

/**
 * Total pris ekskl. udlæg og rabat (til rabatberegning)
 */
export function totalPrisEksklUdlægOgRabat(posteringer, decimaler = 2, inklMoms = false) {
    if (!posteringer) return;
    
    const total = 
        fastPris(posteringer, 2, inklMoms).beløb +
        timeregistreringPris(posteringer, 2, inklMoms).beløb +
        fasteTillægPris(posteringer, 2, inklMoms).beløb +
        procentTillægPris(posteringer, 2, inklMoms).beløb +
        materialePris(posteringer, 2, inklMoms).beløb;

    return formaterBeløb(total, decimaler);
}

/**
 * Total pris - bruger pre-beregnet værdi eller summer fra arrays
 */
export function totalPris(posteringer, decimaler = 2, inklMoms = false) {
    if (!posteringer) return;
    const posteringerListe = lavListe(posteringer);

    let total = posteringerListe.reduce((akk, nuv) => {
        // Brug pre-beregnet total hvis tilgængelig
        if (nuv.dynamiskPrisBeregning) {
            return akk + (nuv.totalPrisEksklMoms || 0);
        } else {
            // For fast pris, brug tilbudsPrisEksklMoms
            return akk + (nuv.tilbudsPrisEksklMoms ?? nuv.totalPrisEksklMoms ?? 0);
        }
    }, 0);

    if (inklMoms) {
        total *= 1.25;
    }

    return formaterBeløb(total, decimaler);
}

/**
 * Total moms - sum af alle momsbeløb
 */
export function totalMoms(posteringer, decimaler = 2) {
    if (!posteringer) return;
    const posteringerListe = lavListe(posteringer);

    const total = posteringerListe.reduce((akk, nuv) => {
        return akk + (nuv.totalMoms || 0);
    }, 0);

    return formaterBeløb(total, decimaler);
}

// =============================================================================
// FUNKTIONER TIL HONORAR-BEREGNINGER (NYE)
// =============================================================================

/**
 * Fast honorar - bruges når brugDynamiskHonorar er false
 */
export function fastHonorar(posteringer, decimaler = 2, inklMoms = false) {
    if (!posteringer) return;
    const posteringerListe = lavListe(posteringer);

    let total = posteringerListe.reduce((akk, nuv) => {
        if (!nuv.brugDynamiskHonorar && nuv.brugFastHonorar) {
            return akk + (nuv.totalFastHonorar || 0);
        }
        return akk;
    }, 0);

    if (inklMoms) {
        total *= 1.25;
    }

    return formaterBeløb(total, decimaler);
}

/**
 * Honorar fra timeregistrering array
 */
export function timeregistreringHonorar(posteringer, decimaler = 2, inklMoms = false) {
    if (!posteringer) return;
    const posteringerListe = lavListe(posteringer);

    let total = posteringerListe.reduce((akk, nuv) => {
        if (!nuv.brugDynamiskHonorar) return akk;
        const sum = (nuv.timeregistrering || []).reduce((s, tr) => s + (tr.honorar?.total || 0), 0);
        return akk + sum;
    }, 0);

    if (inklMoms) {
        total *= 1.25;
    }

    return formaterBeløb(total, decimaler);
}

/**
 * Honorar fra faste tillæg array
 */
export function fasteTillægHonorar(posteringer, decimaler = 2, inklMoms = false) {
    if (!posteringer) return;
    const posteringerListe = lavListe(posteringer);

    let total = posteringerListe.reduce((akk, nuv) => {
        if (!nuv.brugDynamiskHonorar) return akk;
        const sum = (nuv.fasteTillæg || []).reduce((s, ft) => s + (ft.honorar?.total || 0), 0);
        return akk + sum;
    }, 0);

    if (inklMoms) {
        total *= 1.25;
    }

    return formaterBeløb(total, decimaler);
}

/**
 * Honorar fra procent tillæg array
 */
export function procentTillægHonorar(posteringer, decimaler = 2, inklMoms = false) {
    if (!posteringer) return;
    const posteringerListe = lavListe(posteringer);

    let total = posteringerListe.reduce((akk, nuv) => {
        if (!nuv.brugDynamiskHonorar) return akk;
        const sum = (nuv.procentTillæg || []).reduce((s, pt) => s + (pt.honorar?.total || 0), 0);
        return akk + sum;
    }, 0);

    if (inklMoms) {
        total *= 1.25;
    }

    return formaterBeløb(total, decimaler);
}

/**
 * Medarbejder-udlæg fra materialer (kostpris der skal refunderes)
 */
export function materialeUdlæg(posteringer, decimaler = 2) {
    if (!posteringer) return;
    const posteringerListe = lavListe(posteringer);

    const total = posteringerListe.reduce((akk, nuv) => {
        if (!nuv.brugDynamiskHonorar) return akk;
        const sum = (nuv.materialer || []).reduce((s, m) => s + (m.totalMedarbejderUdlaeg || 0), 0);
        return akk + sum;
    }, 0);

    return formaterBeløb(total, decimaler);
}

/**
 * Honorar fra materiale-udlæg (medarbejderens udlæg for materialer)
 * NOTE: Legacy udlæg-array tælles IKKE med - kun materialer med erUdlaeg flag
 */
export function udlægHonorar(posteringer, decimaler = 2, inklMoms = false) {
    if (!posteringer) return;
    const posteringerListe = lavListe(posteringer);

    let total = posteringerListe.reduce((akk, nuv) => {
        if (!nuv.brugDynamiskHonorar) return akk;
        // Kun materiale-udlæg tælles med (medarbejderen har lagt ud for materialer)
        const materialeSum = (nuv.materialer || []).reduce((s, m) => s + (m.totalMedarbejderUdlaeg || 0), 0);
        return akk + materialeSum;
    }, 0);

    // Honorar normalt ikke inkl. moms, men behold parameter for kompatibilitet
    if (inklMoms) {
        total *= 1;
    }

    return formaterBeløb(total, decimaler);
}

/**
 * Samlet rabat på honorar - sum af alle honorar rabatBeløb fra arrays
 */
export function rabatHonorar(posteringer, decimaler = 2, inklMoms = false) {
    if (!posteringer) return;
    const posteringerListe = lavListe(posteringer);

    let total = posteringerListe.reduce((akk, nuv) => {
        if (!nuv.brugDynamiskHonorar) return akk;
        
        // Sum rabatBeløb fra alle arrays
        const trRabat = (nuv.timeregistrering || []).reduce((s, tr) => s + (tr.honorar?.rabatBeløb || 0), 0);
        const ftRabat = (nuv.fasteTillæg || []).reduce((s, ft) => s + (ft.honorar?.rabatBeløb || 0), 0);
        const ptRabat = (nuv.procentTillæg || []).reduce((s, pt) => s + (pt.honorar?.rabatBeløb || 0), 0);
        
        return akk + trRabat + ftRabat + ptRabat;
    }, 0);

    if (inklMoms) {
        total *= 1.25;
    }

    return formaterBeløb(total, decimaler);
}

/**
 * Total honorar ekskl. udlæg og rabat (til rabatberegning)
 */
export function totalHonorarEksklUdlægOgRabat(posteringer, decimaler = 2, inklMoms = false) {
    if (!posteringer) return;
    
    const total = 
        fastHonorar(posteringer, 2, inklMoms).beløb +
        timeregistreringHonorar(posteringer, 2, inklMoms).beløb +
        fasteTillægHonorar(posteringer, 2, inklMoms).beløb +
        procentTillægHonorar(posteringer, 2, inklMoms).beløb;

    return formaterBeløb(total, decimaler);
}

/**
 * Total honorar - bruger pre-beregnet værdi
 */
export function totalHonorar(posteringer, decimaler = 2, inklMoms = false) {
    if (!posteringer) return;
    const posteringerListe = lavListe(posteringer);

    let total = posteringerListe.reduce((akk, nuv) => {
        if (nuv.brugDynamiskHonorar) {
            return akk + (nuv.totalDynamiskHonorar || 0);
        } else if (nuv.brugFastHonorar) {
            return akk + (nuv.totalFastHonorar || 0);
        }
        // Fallback til totalDynamiskHonorar hvis ingen flags sat
        return akk + (nuv.totalDynamiskHonorar || nuv.totalFastHonorar || 0);
    }, 0);

    if (inklMoms) {
        total *= 1.25;
    }

    return formaterBeløb(total, decimaler);
}

// =============================================================================
// FUNKTIONER TIL ANTAL-BEREGNINGER (NYE)
// =============================================================================

/**
 * Antal timeregistreringer (sum af antal fra alle timeregistrering poster)
 */
export function antalTimeregistreringer(posteringer) {
    if (!posteringer) return 0;
    const posteringerListe = lavListe(posteringer);

    return posteringerListe.reduce((akk, nuv) => {
        const sum = (nuv.timeregistrering || []).reduce((s, tr) => s + (tr.antal || 0), 0);
        return akk + sum;
    }, 0);
}

/**
 * Antal faste tillæg (sum af antal fra alle fasteTillæg poster)
 */
export function antalFasteTillæg(posteringer) {
    if (!posteringer) return 0;
    const posteringerListe = lavListe(posteringer);

    return posteringerListe.reduce((akk, nuv) => {
        const sum = (nuv.fasteTillæg || []).reduce((s, ft) => s + (ft.antal || 0), 0);
        return akk + sum;
    }, 0);
}

/**
 * Antal procent tillæg (antal poster, ikke sum)
 */
export function antalProcentTillæg(posteringer) {
    if (!posteringer) return 0;
    const posteringerListe = lavListe(posteringer);

    return posteringerListe.reduce((akk, nuv) => {
        return akk + (nuv.procentTillæg?.length || 0);
    }, 0);
}

/**
 * Antal materialer (antal poster)
 */
export function antalMaterialer(posteringer) {
    if (!posteringer) return 0;
    const posteringerListe = lavListe(posteringer);

    return posteringerListe.reduce((akk, nuv) => {
        return akk + (nuv.materialer?.length || 0);
    }, 0);
}

/**
 * Antal udlæg
 */
export function antalUdlæg(posteringer) {
    if (!posteringer) return 0;
    const posteringerListe = lavListe(posteringer);

    return posteringerListe.reduce((akk, nuv) => {
        return akk + (nuv.udlæg?.length || 0);
    }, 0);
}

// =============================================================================
// LEGACY WRAPPER-FUNKTIONER (bevaret for kompatibilitet med eksisterende kode)
// Disse funktioner finder poster i de nye arrays baseret på navn
// =============================================================================

/**
 * Helper: Find poster i timeregistrering baseret på navne-match
 */
function findTimeregistreringByName(posteringer, navnMatch) {
    const posteringerListe = lavListe(posteringer);
    return posteringerListe.flatMap(p => 
        (p.timeregistrering || []).filter(tr => 
            tr.navn?.toLowerCase().includes(navnMatch.toLowerCase())
        )
    );
}

/**
 * Helper: Find poster i fasteTillæg baseret på navne-match
 */
function findFasteTillægByName(posteringer, navnMatch) {
    const posteringerListe = lavListe(posteringer);
    return posteringerListe.flatMap(p => 
        (p.fasteTillæg || []).filter(ft => 
            ft.navn?.toLowerCase().includes(navnMatch.toLowerCase())
        )
    );
}

/**
 * Helper: Find poster i procentTillæg baseret på navne-match
 */
function findProcentTillægByName(posteringer, navnMatch) {
    const posteringerListe = lavListe(posteringer);
    return posteringerListe.flatMap(p => 
        (p.procentTillæg || []).filter(pt => 
            pt.navn?.toLowerCase().includes(navnMatch.toLowerCase())
        )
    );
}

// ----- PRIS WRAPPERS -----

export function opstartPris(posteringer, decimaler = 2, inklMoms = false) {
    if (!posteringer) return;
    const poster = findFasteTillægByName(posteringer, 'opstart');
    let total = poster.reduce((s, ft) => s + (ft.pris?.totalEksMoms || 0), 0);
    if (inklMoms) total *= 1.25;
    return formaterBeløb(total, decimaler);
}

export function handymanPris(posteringer, decimaler = 2, inklMoms = false) {
    if (!posteringer) return;
    const poster = findTimeregistreringByName(posteringer, 'handyman');
    let total = poster.reduce((s, tr) => s + (tr.pris?.totalEksMoms || 0), 0);
    if (inklMoms) total *= 1.25;
    return formaterBeløb(total, decimaler);
}

export function tømrerPris(posteringer, decimaler = 2, inklMoms = false) {
    if (!posteringer) return;
    const poster = findTimeregistreringByName(posteringer, 'tømrer');
    let total = poster.reduce((s, tr) => s + (tr.pris?.totalEksMoms || 0), 0);
    if (inklMoms) total *= 1.25;
    return formaterBeløb(total, decimaler);
}

export function rådgivningPris(posteringer, decimaler = 2, inklMoms = false) {
    if (!posteringer) return;
    const poster = findTimeregistreringByName(posteringer, 'rådgivning');
    let total = poster.reduce((s, tr) => s + (tr.pris?.totalEksMoms || 0), 0);
    if (inklMoms) total *= 1.25;
    return formaterBeløb(total, decimaler);
}

export function trailerPris(posteringer, decimaler = 2, inklMoms = false) {
    if (!posteringer) return;
    const poster = findFasteTillægByName(posteringer, 'trailer');
    let total = poster.reduce((s, ft) => s + (ft.pris?.totalEksMoms || 0), 0);
    if (inklMoms) total *= 1.25;
    return formaterBeløb(total, decimaler);
}

export function aftenTillægPris(posteringer, decimaler = 2, inklMoms = false) {
    if (!posteringer) return;
    const poster = findProcentTillægByName(posteringer, 'aften');
    let total = poster.reduce((s, pt) => s + (pt.pris?.totalEksMoms || 0), 0);
    if (inklMoms) total *= 1.25;
    return formaterBeløb(total, decimaler);
}

export function natTillægPris(posteringer, decimaler = 2, inklMoms = false) {
    if (!posteringer) return;
    const poster = findProcentTillægByName(posteringer, 'nat');
    let total = poster.reduce((s, pt) => s + (pt.pris?.totalEksMoms || 0), 0);
    if (inklMoms) total *= 1.25;
    return formaterBeløb(total, decimaler);
}

// Inkl. tillæg varianter - returnerer 0 da tillæg nu er separate poster
export function handymanPrisInklAftenTillæg(posteringer, decimaler = 2, inklMoms = false) {
    return handymanPris(posteringer, decimaler, inklMoms);
}

export function handymanPrisInklNatTillæg(posteringer, decimaler = 2, inklMoms = false) {
    return handymanPris(posteringer, decimaler, inklMoms);
}

export function tømrerPrisInklAftenTillæg(posteringer, decimaler = 2, inklMoms = false) {
    return tømrerPris(posteringer, decimaler, inklMoms);
}

export function tømrerPrisInklNatTillæg(posteringer, decimaler = 2, inklMoms = false) {
    return tømrerPris(posteringer, decimaler, inklMoms);
}

// ----- HONORAR WRAPPERS -----

export function opstartHonorar(posteringer, decimaler = 2, inklMoms = false) {
    if (!posteringer) return;
    const poster = findFasteTillægByName(posteringer, 'opstart');
    let total = poster.reduce((s, ft) => s + (ft.honorar?.total || 0), 0);
    if (inklMoms) total *= 1.25;
    return formaterBeløb(total, decimaler);
}

export function handymanHonorar(posteringer, decimaler = 2, inklMoms = false) {
    if (!posteringer) return;
    const poster = findTimeregistreringByName(posteringer, 'handyman');
    let total = poster.reduce((s, tr) => s + (tr.honorar?.total || 0), 0);
    if (inklMoms) total *= 1.25;
    return formaterBeløb(total, decimaler);
}

export function tømrerHonorar(posteringer, decimaler = 2, inklMoms = false) {
    if (!posteringer) return;
    const poster = findTimeregistreringByName(posteringer, 'tømrer');
    let total = poster.reduce((s, tr) => s + (tr.honorar?.total || 0), 0);
    if (inklMoms) total *= 1.25;
    return formaterBeløb(total, decimaler);
}

export function rådgivningHonorar(posteringer, decimaler = 2, inklMoms = false) {
    if (!posteringer) return;
    const poster = findTimeregistreringByName(posteringer, 'rådgivning');
    let total = poster.reduce((s, tr) => s + (tr.honorar?.total || 0), 0);
    if (inklMoms) total *= 1.25;
    return formaterBeløb(total, decimaler);
}

export function trailerHonorar(posteringer, decimaler = 2, inklMoms = false) {
    if (!posteringer) return;
    const poster = findFasteTillægByName(posteringer, 'trailer');
    let total = poster.reduce((s, ft) => s + (ft.honorar?.total || 0), 0);
    if (inklMoms) total *= 1.25;
    return formaterBeløb(total, decimaler);
}

export function aftenTillægHonorar(posteringer, decimaler = 2, inklMoms = false) {
    if (!posteringer) return;
    const poster = findProcentTillægByName(posteringer, 'aften');
    let total = poster.reduce((s, pt) => s + (pt.honorar?.total || 0), 0);
    if (inklMoms) total *= 1.25;
    return formaterBeløb(total, decimaler);
}

export function natTillægHonorar(posteringer, decimaler = 2, inklMoms = false) {
    if (!posteringer) return;
    const poster = findProcentTillægByName(posteringer, 'nat');
    let total = poster.reduce((s, pt) => s + (pt.honorar?.total || 0), 0);
    if (inklMoms) total *= 1.25;
    return formaterBeløb(total, decimaler);
}

// ----- ANTAL WRAPPERS -----

export function antalOpstartsgebyrerForPris(posteringer) {
    if (!posteringer) return 0;
    const poster = findFasteTillægByName(posteringer, 'opstart');
    return poster.reduce((s, ft) => s + (ft.antal || 0), 0);
}

export function antalHandymanTimerForPris(posteringer) {
    if (!posteringer) return 0;
    const poster = findTimeregistreringByName(posteringer, 'handyman');
    return poster.reduce((s, tr) => s + (tr.antal || 0), 0);
}

export function antalTømrerTimerForPris(posteringer) {
    if (!posteringer) return 0;
    const poster = findTimeregistreringByName(posteringer, 'tømrer');
    return poster.reduce((s, tr) => s + (tr.antal || 0), 0);
}

export function antalRådgivningOpmålingVejledningForPris(posteringer) {
    if (!posteringer) return 0;
    const poster = findTimeregistreringByName(posteringer, 'rådgivning');
    return poster.reduce((s, tr) => s + (tr.antal || 0), 0);
}

export function antalTrailerForPris(posteringer) {
    if (!posteringer) return 0;
    const poster = findFasteTillægByName(posteringer, 'trailer');
    return poster.reduce((s, ft) => s + (ft.antal || 0), 0);
}

export function antalAftenTillægForPris(posteringer) {
    if (!posteringer) return 0;
    const poster = findProcentTillægByName(posteringer, 'aften');
    return poster.length;
}

export function antalNatTillægForPris(posteringer) {
    if (!posteringer) return 0;
    const poster = findProcentTillægByName(posteringer, 'nat');
    return poster.length;
}
