// LISTE: FUNKTIONER TIL HONORAR-BEREGNINGER
// -----------------------------------------------
// beregnFasteHonorarer()
// beregnOpstartHonorar()
// beregnHandymanHonorar()
// beregnTømrerHonorar()
// beregnRådgivningHonorar()
// beregnTrailerHonorar()
// beregnAftenTillægHonorar()
// beregnNatTillægHonorar()
// beregnUdlægHonorar()
// beregnRabatterHonorar()
// beregnTotalHonorar()

// LISTE: FUNKTIONER TIL PRIS-BEREGNINGER
// -----------------------------------------------
// beregnFastePriser()
// beregnOpstartPris()
// beregnHandymanPris()
// beregnTømrerPris()
// beregnRådgivningPris()
// beregnTrailerPris()
// beregnAftenTillægPris()
// beregnNatTillægPris()
// beregnUdlægPris()
// beregnRabatterPris()
// beregnTotalPris()





// FUNKTIONER TIL PRIS-BEREGNINGER

export function fastPris(posteringer, decimaler = 2, inklMoms = false){
    if(!posteringer){
        return
    }
    
    const posteringerListe = Array.isArray(posteringer) ? posteringer : [posteringer];
    let totalFastePriser = posteringerListe.reduce((akk, nuv) => akk + (!nuv.dynamiskPrisBeregning ? nuv.fastPris : 0), 0);

    if (inklMoms) {
        totalFastePriser *= 1.25;
    }

    return {
        beløb: totalFastePriser,
        formateret: totalFastePriser.toLocaleString('da-DK', {
            style: 'currency',
            currency: 'DKK',
            minimumFractionDigits: decimaler,
            maximumFractionDigits: decimaler
        })
    }
}

export function opstartPris(posteringer, decimaler = 2, inklMoms = false){
    if(!posteringer){
        return
    }
    
    const posteringerListe = Array.isArray(posteringer) ? posteringer : [posteringer];
    let totalOpstartPris = posteringerListe.reduce((akk, nuv) => akk + (nuv.dynamiskPrisBeregning ? (nuv.opstart * nuv.satser.opstartsgebyrPris) : 0), 0)

    if (inklMoms) {
        totalOpstartPris *= 1.25;
    }

    return {
        beløb: totalOpstartPris,
        formateret: totalOpstartPris.toLocaleString('da-DK', {
            style: 'currency',
            currency: 'DKK',
            minimumFractionDigits: decimaler,
            maximumFractionDigits: decimaler
        })
    }
}

export function handymanPris(posteringer, decimaler = 2, inklMoms = false){
    if(!posteringer){
        return
    }
    
    const posteringerListe = Array.isArray(posteringer) ? posteringer : [posteringer];
    let totalHandymanPris = posteringerListe.reduce((akk, nuv) => akk + (nuv.dynamiskPrisBeregning ? (nuv.handymanTimer * nuv.satser.handymanTimerPris) : 0), 0);

    if (inklMoms) {
        totalHandymanPris *= 1.25;
    }

    return {
        beløb: totalHandymanPris,
        formateret: totalHandymanPris.toLocaleString('da-DK', {
            style: 'currency',
            currency: 'DKK',
            minimumFractionDigits: decimaler,
            maximumFractionDigits: decimaler
        })
    }
}

export function tømrerPris(posteringer, decimaler = 2, inklMoms = false){
    if(!posteringer){
        return
    }
    
    const posteringerListe = Array.isArray(posteringer) ? posteringer : [posteringer];
    let totalTømrerPris = posteringerListe.reduce((akk, nuv) => akk + (nuv.dynamiskPrisBeregning ? (nuv.tømrerTimer * nuv.satser.tømrerTimerPris) : 0), 0);

    if (inklMoms) {
        totalTømrerPris *= 1.25;
    }

    return {
        beløb: totalTømrerPris,
        formateret: totalTømrerPris.toLocaleString('da-DK', {
            style: 'currency',
            currency: 'DKK',
            minimumFractionDigits: decimaler,
            maximumFractionDigits: decimaler
        })
    }
}

export function rådgivningPris(posteringer, decimaler = 2, inklMoms = false){
    if(!posteringer){
        return
    }

    const posteringerListe = Array.isArray(posteringer) ? posteringer : [posteringer];
    let totalRådgivningPris = posteringerListe.reduce((akk, nuv) => akk + (nuv.dynamiskPrisBeregning ? (nuv.rådgivningOpmålingVejledning * nuv.satser.rådgivningOpmålingVejledningPris) : 0), 0);

    if (inklMoms) {
        totalRådgivningPris *= 1.25;
    }

    return {
        beløb: totalRådgivningPris,
        formateret: totalRådgivningPris.toLocaleString('da-DK', {
            style: 'currency',
            currency: 'DKK',
            minimumFractionDigits: decimaler,
            maximumFractionDigits: decimaler
        })
    }
}

export function trailerPris(posteringer, decimaler = 2, inklMoms = false){
    if(!posteringer){
        return
    }

    const posteringerListe = Array.isArray(posteringer) ? posteringer : [posteringer];
    let totalTrailerPris = posteringerListe.reduce((akk, nuv) => akk + (nuv.dynamiskPrisBeregning ? (nuv.trailer * nuv.satser.trailerPris) : 0), 0);

    if (inklMoms) {
        totalTrailerPris *= 1.25;
    }

    return {
        beløb: totalTrailerPris,
        formateret: totalTrailerPris.toLocaleString('da-DK', {
            style: 'currency',
            currency: 'DKK',
            minimumFractionDigits: decimaler,
            maximumFractionDigits: decimaler
        })
    }
}

export function aftenTillægPris(posteringer, decimaler = 2, inklMoms = false){
    if(!posteringer){
        return
    }

    const posteringerListe = Array.isArray(posteringer) ? posteringer : [posteringer];
    let totalAftenTillægPris = posteringerListe.reduce((akk, nuv) => akk + (nuv.dynamiskPrisBeregning ? (nuv.aftenTillæg ? ((nuv.handymanTimer * (nuv.satser.handymanTimerPrisInklAftenTillæg - nuv.satser.handymanTimerPris) + ((nuv.tømrerTimer + nuv.rådgivningOpmålingVejledning) * (nuv.satser.tømrerTimerPrisInklAftenTillæg - nuv.satser.tømrerTimerPris)))) : 0) : 0), 0);

    if (inklMoms) {
        totalAftenTillægPris *= 1.25;
    }

    return {
        beløb: totalAftenTillægPris,
        formateret: totalAftenTillægPris.toLocaleString('da-DK', {
            style: 'currency',
            currency: 'DKK',
            minimumFractionDigits: decimaler,
            maximumFractionDigits: decimaler
        })
    }
}

export function natTillægPris(posteringer, decimaler = 2, inklMoms = false){
    if(!posteringer){
        return
    }

    const posteringerListe = Array.isArray(posteringer) ? posteringer : [posteringer];
    let totalNatTillægPris = posteringerListe.reduce((akk, nuv) => akk + (nuv.dynamiskPrisBeregning ? (nuv.natTillæg ? ((nuv.handymanTimer * (nuv.satser.handymanTimerPrisInklNatTillæg - nuv.satser.handymanTimerPris) + ((nuv.tømrerTimer + nuv.rådgivningOpmålingVejledning) * (nuv.satser.tømrerTimerPrisInklNatTillæg - nuv.satser.tømrerTimerPris)))) : 0) : 0), 0);

    if (inklMoms) {
        totalNatTillægPris *= 1.25;
    }

    return {
        beløb: totalNatTillægPris,
        formateret: totalNatTillægPris.toLocaleString('da-DK', {
            style: 'currency',
            currency: 'DKK',
            minimumFractionDigits: decimaler,
            maximumFractionDigits: decimaler
        })
    }
}

export function udlægPris(posteringer, decimaler = 2, inklMoms = false){
    if(!posteringer){
        return
    }

    const posteringerListe = Array.isArray(posteringer) ? posteringer : [posteringer];
    let totalUdlægPris = posteringerListe.reduce((akk, nuv) => {
        const udlægSum = nuv.udlæg.reduce((sum, udlæg) => sum + (parseFloat(udlæg.beløb) || 0), 0);
        return akk + (nuv.dynamiskPrisBeregning ? udlægSum : 0);
    }, 0);

    if (inklMoms) {
        totalUdlægPris *= 1.25;
    }

    return {
        beløb: totalUdlægPris,
        formateret: totalUdlægPris.toLocaleString('da-DK', {
            style: 'currency',
            currency: 'DKK',
            minimumFractionDigits: decimaler,
            maximumFractionDigits: decimaler
        })
    }
}

export function rabatPris(posteringer, decimaler = 2, inklMoms = false){
    if(!posteringer){
        return
    }

    const posteringerListe = Array.isArray(posteringer) ? posteringer : [posteringer];
    let totalRabatterPris = posteringerListe.reduce((akk, nuv) => {
        const rabatProcent = nuv.rabatProcent || 0;
        const totalPrisEksklUdlæg = nuv.totalPris - nuv.udlæg.reduce((sum, udlæg) => sum + (parseFloat(udlæg.beløb) || 0), 0);
        const rabatBeregning = (nuv.dynamiskPrisBeregning ? ((totalPrisEksklUdlæg / (100 - rabatProcent) * 100) * (rabatProcent / 100)) : 0);
        return akk + rabatBeregning;
    }, 0)

    if (inklMoms) {
        totalRabatterPris *= 1.25;
    }

    return {
        beløb: totalRabatterPris,
        formateret: totalRabatterPris.toLocaleString('da-DK', {
            style: 'currency',
            currency: 'DKK',
            minimumFractionDigits: decimaler,
            maximumFractionDigits: decimaler
        })
    }
}

export function totalPris(posteringer, decimaler = 2, inklMoms = false){
    if(!posteringer){
        return
    }

    const totalPris = (
        fastPris(posteringer, 2, inklMoms).beløb
        + opstartPris(posteringer, 2, inklMoms).beløb
        + handymanPris(posteringer, 2, inklMoms).beløb
        + tømrerPris(posteringer, 2, inklMoms).beløb
        + rådgivningPris(posteringer, 2, inklMoms).beløb
        + trailerPris(posteringer, 2, inklMoms).beløb
        + aftenTillægPris(posteringer, 2, inklMoms).beløb
        + natTillægPris(posteringer, 2, inklMoms).beløb
        + udlægPris(posteringer, 2, inklMoms).beløb
        - rabatPris(posteringer, 2, inklMoms).beløb
    )

    return {
        beløb: totalPris,
        formateret: totalPris.toLocaleString('da-DK', {
            style: 'currency',
            currency: 'DKK',
            minimumFractionDigits: decimaler,
            maximumFractionDigits: decimaler
        })
    }
}

// FUNKTIONER TIL HONORAR-BEREGNINGER

export function fastHonorar(posteringer, decimaler = 2, inklMoms = false){
    if(!posteringer){
        return
    }
    
    const posteringerListe = Array.isArray(posteringer) ? posteringer : [posteringer];
    let totalFasteHonorarer = posteringerListe.reduce((akk, nuv) => akk + (!nuv.dynamiskHonorarBeregning ? nuv.fastHonorar : 0), 0);

    if (inklMoms) {
        totalFasteHonorarer *= 1.25;
    }

    return {
        beløb: totalFasteHonorarer,
        formateret: totalFasteHonorarer.toLocaleString('da-DK', {
            style: 'currency',
            currency: 'DKK',
            minimumFractionDigits: decimaler,
            maximumFractionDigits: decimaler
        })
    }
}

export function opstartHonorar(posteringer, decimaler = 2, inklMoms = false){
    if(!posteringer){
        return
    }

    const posteringerListe = Array.isArray(posteringer) ? posteringer : [posteringer];
    let totalOpstartHonorar = posteringerListe.reduce((akk, nuv) => akk + (nuv.dynamiskHonorarBeregning ? (nuv.opstart * nuv.satser.opstartsgebyrHonorar) : 0), 0);
    
    if (inklMoms) {
        totalOpstartHonorar *= 1.25;
    }

    return {
        beløb: totalOpstartHonorar,
        formateret: totalOpstartHonorar.toLocaleString('da-DK', {
            style: 'currency',
            currency: 'DKK',
            minimumFractionDigits: decimaler,
            maximumFractionDigits: decimaler
        })
    }
}

export function handymanHonorar(posteringer, decimaler = 2, inklMoms = false){
    if(!posteringer){
        return
    }

    const posteringerListe = Array.isArray(posteringer) ? posteringer : [posteringer];
    let totalHandymanHonorar = posteringerListe.reduce((akk, nuv) => akk + (nuv.dynamiskHonorarBeregning ? (nuv.handymanTimer * nuv.satser.handymanTimerHonorar) : 0), 0);
    
    if (inklMoms) {
        totalHandymanHonorar *= 1.25;
    }

    return {
        beløb: totalHandymanHonorar,
        formateret: totalHandymanHonorar.toLocaleString('da-DK', {
            style: 'currency',
            currency: 'DKK',
            minimumFractionDigits: decimaler,
            maximumFractionDigits: decimaler
        })
    }
}

export function tømrerHonorar(posteringer, decimaler = 2, inklMoms = false){ 
    if(!posteringer){
        return
    }

    const posteringerListe = Array.isArray(posteringer) ? posteringer : [posteringer];
    let totalTømrerHonorar = posteringerListe.reduce((akk, nuv) => akk + (nuv.dynamiskHonorarBeregning ? (nuv.tømrerTimer * nuv.satser.tømrerTimerHonorar) : 0), 0)
    
    if (inklMoms) {
        totalTømrerHonorar *= 1.25;
    }

    return {
        beløb: totalTømrerHonorar,
        formateret: totalTømrerHonorar.toLocaleString('da-DK', {
            style: 'currency',
            currency: 'DKK',
            minimumFractionDigits: decimaler,
            maximumFractionDigits: decimaler
        })
    }
}

export function rådgivningHonorar(posteringer, decimaler = 2, inklMoms = false){
    if(!posteringer){
        return
    }

    const posteringerListe = Array.isArray(posteringer) ? posteringer : [posteringer];
    let totalRådgivningHonorar = posteringerListe.reduce((akk, nuv) => akk + (nuv.dynamiskHonorarBeregning ? (nuv.rådgivningOpmålingVejledning * nuv.satser.rådgivningOpmålingVejledningHonorar) : 0), 0);

    if (inklMoms) {
        totalRådgivningHonorar *= 1.25;
    }

    return {
        beløb: totalRådgivningHonorar,
        formateret: totalRådgivningHonorar.toLocaleString('da-DK', {
            style: 'currency',
            currency: 'DKK',
            minimumFractionDigits: decimaler,
            maximumFractionDigits: decimaler
        })
    }
}

export function trailerHonorar(posteringer, decimaler = 2, inklMoms = false){
    if(!posteringer){
        return
    }

    const posteringerListe = Array.isArray(posteringer) ? posteringer : [posteringer];
    let totalTrailerHonorar = posteringerListe.reduce((akk, nuv) => akk + (nuv.dynamiskHonorarBeregning ? (nuv.trailer * nuv.satser.trailerHonorar) : 0), 0);

    if (inklMoms) {
        totalTrailerHonorar *= 1.25;
    }

    return {
        beløb: totalTrailerHonorar,
        formateret: totalTrailerHonorar.toLocaleString('da-DK', {
            style: 'currency',
            currency: 'DKK',
            minimumFractionDigits: decimaler,
            maximumFractionDigits: decimaler
        })
    }
}

export function aftenTillægHonorar(posteringer, decimaler = 2, inklMoms = false){
    if(!posteringer){
        return
    }

    const posteringerListe = Array.isArray(posteringer) ? posteringer : [posteringer];
    let totalAftenTillægHonorar = posteringerListe.reduce((akk, nuv) => akk + (nuv.dynamiskHonorarBeregning ? (nuv.aftenTillæg ? ((((nuv.handymanTimer * nuv.satser.handymanTimerHonorar) + (nuv.tømrerTimer * nuv.satser.tømrerTimerHonorar) + (nuv.rådgivningOpmålingVejledning * nuv.satser.rådgivningOpmålingVejledningHonorar)) * nuv.satser.aftenTillægHonorar / 100)) : 0) : 0), 0);

    if (inklMoms) {
        totalAftenTillægHonorar *= 1.25;
    }

    return {
        beløb: totalAftenTillægHonorar,
        formateret: totalAftenTillægHonorar.toLocaleString('da-DK', {
            style: 'currency',
            currency: 'DKK',
            minimumFractionDigits: decimaler,
            maximumFractionDigits: decimaler
        })
    }
}

export function natTillægHonorar(posteringer, decimaler = 2, inklMoms = false){
    if(!posteringer){
        return
    }

    const posteringerListe = Array.isArray(posteringer) ? posteringer : [posteringer];
    let totalNatTillægHonorar = posteringerListe.reduce((akk, nuv) => akk + (nuv.dynamiskHonorarBeregning ? (nuv.natTillæg ? ((((nuv.handymanTimer * nuv.satser.handymanTimerHonorar) + (nuv.tømrerTimer * nuv.satser.tømrerTimerHonorar) + (nuv.rådgivningOpmålingVejledning * nuv.satser.rådgivningOpmålingVejledningHonorar)) * nuv.satser.natTillægHonorar / 100)) : 0) : 0), 0);

    if (inklMoms) {
        totalNatTillægHonorar *= 1.25;
    }

    return {
        beløb: totalNatTillægHonorar,
        formateret: totalNatTillægHonorar.toLocaleString('da-DK', {
            style: 'currency',
            currency: 'DKK',
            minimumFractionDigits: decimaler,
            maximumFractionDigits: decimaler
        })
    }
}

export function udlægHonorar(posteringer, decimaler = 2, inklMoms = false){
    if(!posteringer){
        return
    }

    const posteringerListe = Array.isArray(posteringer) ? posteringer : [posteringer];
    let totalUdlægHonorar = posteringerListe.reduce((akk, nuv) => {
        const udlægSum = nuv.udlæg.reduce((sum, udlæg) => sum + (parseFloat(udlæg.beløb) || 0), 0);
        return akk + (nuv.dynamiskHonorarBeregning ? udlægSum : 0);
    }, 0);

    if (inklMoms) {
        totalUdlægHonorar *= 1;
    }

    return {
        beløb: totalUdlægHonorar,
        formateret: totalUdlægHonorar.toLocaleString('da-DK', {
            style: 'currency',
            currency: 'DKK',
            minimumFractionDigits: decimaler,
            maximumFractionDigits: decimaler
        })
    }
}

export function rabatHonorar(posteringer, decimaler = 2, inklMoms = false){
    if(!posteringer){
        return
    }

    const posteringerListe = Array.isArray(posteringer) ? posteringer : [posteringer];
    let totalRabatterHonorar = posteringerListe.reduce((akk, nuv) => {
        const rabatProcent = nuv.rabatProcent || 0;
        const totalHonorarEksklUdlæg = (nuv.totalHonorar - nuv.udlæg.reduce((sum, udlæg) => sum + (parseFloat(udlæg.beløb) || 0), 0));
        return akk + (nuv.dynamiskHonorarBeregning ? ((totalHonorarEksklUdlæg / (100 - rabatProcent) * 100) * (rabatProcent / 100)) : 0);
    }, 0);

    if (inklMoms) {
        totalRabatterHonorar *= 1.25;
    }

    return {
        beløb: totalRabatterHonorar,
        formateret: totalRabatterHonorar.toLocaleString('da-DK', {
            style: 'currency',
            currency: 'DKK',
            minimumFractionDigits: decimaler,
            maximumFractionDigits: decimaler
        })
    }
}

export function totalHonorar(posteringer, decimaler = 2, inklMoms = false){
    if(!posteringer){
        return
    }

    const totalHonorar = (
       fastHonorar(posteringer, 2, inklMoms).beløb
        + opstartHonorar(posteringer, 2, inklMoms).beløb
        + handymanHonorar(posteringer, 2, inklMoms).beløb
        + tømrerHonorar(posteringer, 2, inklMoms).beløb
        + rådgivningHonorar(posteringer, 2, inklMoms).beløb
        + trailerHonorar(posteringer, 2, inklMoms).beløb
        + aftenTillægHonorar(posteringer, 2, inklMoms).beløb
        + natTillægHonorar(posteringer, 2, inklMoms).beløb
        + udlægHonorar(posteringer, 2, inklMoms).beløb
        - rabatHonorar(posteringer, 2, inklMoms).beløb
    )

    return {
        beløb: totalHonorar,
        formateret: totalHonorar.toLocaleString('da-DK', {
            style: 'currency',
            currency: 'DKK',
            minimumFractionDigits: decimaler,
            maximumFractionDigits: decimaler
        })
    }
}