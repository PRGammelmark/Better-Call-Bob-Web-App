import * as beregn from '../../../utils/beregninger.js'
import dayjs from 'dayjs'
import axios from 'axios'

function sendKvittering({posteringer, user, kunde, opgave, setErrorMessage}) {

    console.log("Kvittering sendes.")

    const authHeaders = {
        'Authorization': `Bearer ${user.token}`
    }

    // ===== BEREGNING AF KVITTERINGSDATO =====
    const antalPosteringer = posteringer.length;
    let datoFormateret = "";

    if(antalPosteringer === 1){
        const dato = posteringer[0].dato;
        datoFormateret = dayjs(dato).format('DD. MMMM YYYY');
    }

    if(antalPosteringer > 1){
        const tidligsteDato = posteringer.reduce((min, postering) => postering.dato < min ? postering.dato : min, posteringer[0].dato);
        const senesteDato = posteringer.reduce((max, postering) => postering.dato > max ? postering.dato : max, posteringer[0].dato);
        if(tidligsteDato === senesteDato){
            datoFormateret = dayjs(tidligsteDato).format('DD. MMMM YYYY');
        } else {
            const tidligsteDatoFormateret = dayjs(tidligsteDato).format('DD. MMMM YYYY');
            const senesteDatoFormateret = dayjs(senesteDato).format('DD. MMMM YYYY');
            datoFormateret = `${tidligsteDatoFormateret} - ${senesteDatoFormateret}`;
        }
    }

    // ===== ANSVARLIGE MEDARBEJDERE =====
    let ansvarligeMedarbejdere = "";

    if(antalPosteringer === 1){
        ansvarligeMedarbejdere = posteringer[0].bruger.navn;
    }

    if(antalPosteringer > 1){
        ansvarligeMedarbejdere = [...new Set(posteringer.map(postering => postering.bruger.navn))].join(', ');
    }

    // ===== BEREGNING AF KVITTERINGSINDHOLD =====
    const antalOpstartsgebyrer = beregn.antalOpstartsgebyrerForPris(posteringer)
    const antalHandymanTimer = beregn.antalHandymanTimerForPris(posteringer)
    const antalTømrerTimer = beregn.antalTømrerTimerForPris(posteringer)
    const antalRådgivningOpmålingVejledning = beregn.antalRådgivningOpmålingVejledningForPris(posteringer)
    const antalTrailer = beregn.antalTrailerForPris(posteringer)
    const antalAftenTillæg = beregn.antalAftenTillægForPris(posteringer)
    const antalNatTillæg = beregn.antalNatTillægForPris(posteringer)
    const antalUdlæg = beregn.antalUdlæg(posteringer)

    const isEnglish = kunde?.isEnglish || false;

    // ===== OPSÆTNING AF KVITTERINGSLINJER =====
    const opstartsgebyrLinje = antalOpstartsgebyrer > 0 ? `
        <tr>
            <td>${antalOpstartsgebyrer} x ${isEnglish ? "start-up fees" : "opstartsgebyr(er)"}:</td>
            <td style="text-align: right;">${beregn.opstartPris(posteringer, 2, true).formateret}</td>
        </tr>` : '';

    const handymanTimerLinje = antalHandymanTimer > 0 ? `
        <tr>
            <td>${antalHandymanTimer} x ${isEnglish ? "handyman hours" : "handymantimer"}:</td>
            <td style="text-align: right;">${beregn.handymanPris(posteringer, 2, true).formateret}</td>
        </tr>` : '';

    const tømrerTimerLinje = antalTømrerTimer > 0 ? `
        <tr>
            <td>${antalTømrerTimer} x ${isEnglish ? "carpenter hours" : "tømrertimer"}:</td>
            <td style="text-align: right;">${beregn.tømrerPris(posteringer, 2, true).formateret}</td>
        </tr>` : '';

    const rådgivningOpmålingVejledningLinje = antalRådgivningOpmålingVejledning > 0 ? `
        <tr>
            <td>${antalRådgivningOpmålingVejledning} x ${isEnglish ? "counseling hours" : "rådgivnings- og vejledningstimer"}:</td>
            <td style="text-align: right;">${beregn.rådgivningPris(posteringer, 2, true).formateret}</td>
        </tr>` : '';

    const aftenTillægLinje = antalAftenTillæg > 0 ? `
        <tr>
            <td>${antalAftenTillæg} x ${isEnglish ? "evening fees" : "aftentillæg"}:</td>
            <td style="text-align: right;">${beregn.aftenTillægPris(posteringer, 2, true).formateret}</td>
        </tr>` : '';

    const natTillægLinje = antalNatTillæg > 0 ? `
        <tr>
            <td>${antalNatTillæg} x ${isEnglish ? "night fees" : "nattilæg"}:</td>
            <td style="text-align: right;">${beregn.natTillægPris(posteringer, 2, true).formateret}</td>
        </tr>` : '';

    // const handymanTimerInklAftenTillægLinje = antalHandymanTimerAftenTillæg > 0 ? `
    // <tr>
    //     <td>${antalHandymanTimerAftenTillæg} ${isEnglish ? "handyman hours (plus evening fee)" : "handymantimer (inkl. aftentillæg)"}:</td>
    //     <td style="text-align: right;">${(totalHandymanTimerAftenTillæg * 1.25).toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</td>
    // </tr>` : '';

    // const tømrerTimerInklAftenTillægLinje = antalTømrerTimerAftenTillæg > 0 ? `
    //     <tr>
    //         <td>${antalTømrerTimerAftenTillæg} ${isEnglish ? "carpenter hours (plus evening fee)" : "tømrertimer (inkl. aftentillæg)"}:</td>
    //         <td style="text-align: right;">${(totalTømrerTimerAftenTillæg * 1.25).toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</td>
    //     </tr>` : '';

    // const rådgivningOpmålingVejledningInklAftenTillægLinje = antalRådgivningOpmålingVejledningAftenTillæg > 0 ? `
    //     <tr>
    //         <td>${antalRådgivningOpmålingVejledningAftenTillæg} ${isEnglish ? "counseling hours (plus evening fee)" : "rådgivnings- og vejledningstimer (inkl. aftentillæg)"}:</td>
    //         <td style="text-align: right;">${(totalRådgivningOpmålingVejledningAftenTillæg * 1.25).toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</td>
    //     </tr>` : '';

    // const handymanTimerInklNatTillægLinje = antalHandymanTimerNatTillæg > 0 ? `
    // <tr>
    //     <td>${antalHandymanTimerNatTillæg} ${isEnglish ? "handyman hours (plus night fee)" : "handymantimer (inkl. nattillæg)"}:</td>
    //     <td style="text-align: right;">${(totalHandymanTimerNatTillæg * 1.25).toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</td>
    // </tr>` : '';

    // const tømrerTimerInklNatTillægLinje = antalTømrerTimerNatTillæg > 0 ? `
    //     <tr>
    //         <td>${antalTømrerTimerNatTillæg} ${isEnglish ? "carpenter hours (plus night fee)" : "tømrertimer (inkl. nattillæg)"}:</td>
    //         <td style="text-align: right;">${(totalTømrerTimerNatTillæg * 1.25).toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</td>
    //     </tr>` : '';

    // const rådgivningOpmålingVejledningInklNatTillægLinje = antalRådgivningOpmålingVejledningNatTillæg > 0 ? `
    //     <tr>
    //         <td>${antalRådgivningOpmålingVejledningNatTillæg} ${isEnglish ? "counseling hours (plus night fee)" : "rådgivnings- og vejledningstimer (inkl. nattillæg)"}:</td>
    //         <td style="text-align: right;">${(totalRådgivningOpmålingVejledningNatTillæg * 1.25).toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</td>
    //     </tr>` : '';

    const trailerLinje = antalTrailer > 0 ? `
        <tr>
            <td>${antalTrailer} x ${isEnglish ? "trailer use" : "trailerbrug"}:</td>
            <td style="text-align: right;">${beregn.trailerPris(posteringer, 2, true).formateret}</td>
        </tr>` : '';

    const rabatLinje = beregn.rabatPris(posteringer).beløb > 0 ? `
        <tr>
            <td>${isEnglish ? "Discount" : "Rabat"}:</td>
            <td style="text-align: right;">-${beregn.rabatPris(posteringer, 2, true).formateret}</td>
        </tr>` : '';

    const fastPrisLinje = beregn.fastPris(posteringer).beløb > 0 ? `
        <tr>
            <td>${isEnglish ? "Fixed price" : "Fast pris"}:</td>
            <td style="text-align: right;">${beregn.fastPris(posteringer, 2, true).formateret}</td>
        </tr>` : '';

    const materialerLinje = antalUdlæg > 0 ? `
        <tr>
            <td>${isEnglish ? "Total outlays and materials" : "Udlæg & materialer, i alt"}:</td>
            <td style="text-align: right;">${beregn.udlægPris(posteringer, 2, true).formateret}</td>
        </tr>` : '';
    
    const materialeudlægDetaljer = posteringer.map(postering => postering.udlæg.map(udlæg => `
        <tr>
            <td style="font-size: 0.8rem; opacity: 0.5;">- ${udlæg.beskrivelse}:</td>
            <td style="text-align: right; font-size: 0.8rem; opacity: 0.5;">${(udlæg.beløb * 1.25).toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</td>
        </tr>`).join('')).join('');

    const totalLinje = `
        <tr style="border-top: 1px solid black; padding-top: 20px;">
            <td style="font-size: 1.3rem; padding-top: 10px;"><b>Total:</b></td>
            <td style="text-align: right; font-size: 1.3rem; padding-top: 10px;"><b>${beregn.totalPris(posteringer, 2, true).formateret}</b></td>
        </tr>`;

    const momsLinje = `
        <tr>
            <td style="opacity: 0.5;">${isEnglish ? "VAT" : "Heraf moms"}:</td>
            <td style="text-align: right; opacity: 0.5;">${(beregn.totalPris(posteringer, 2, true).beløb * 0.2).toFixed(2)} kr.</td>
        </tr>`;

    const tableHeadings = `
        <tr style="font-size: 1.3rem; border: 1px solid white; padding-bottom: 20px;">
            <th style="text-align: left;"><b>${isEnglish ? "Description" : "Beskrivelse"}</b></th>
            <th style="text-align: right;"><b>${isEnglish ? "Amount" : "Beløb"}</b></th>
        </tr>`;

    const betalingerDetaljer = posteringer.map(postering => postering.betalinger.map(betaling => `
        <tr>
            <td style="font-size: 0.8rem; opacity: 0.5;">- ${betaling.betalingsmetode + " " + dayjs(betaling.dato).format('DD. MMMM YYYY')}:</td>
            <td style="text-align: right; font-size: 0.8rem; opacity: 0.5;">${(betaling.betalingsbeløb).toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        </tr>`).join('')).join('');

    const betalingerLinje = `
    <tr style="border-top: 1px solid black; padding-top: 20px;">
        <td style="font-size: 1.3rem; padding-top: 10px;"><b>Betalt, i alt:</b></td>
        <td style="text-align: right; font-size: 1.3rem; padding-top: 10px;"><b>${beregn.totalBetalinger(posteringer, 2).formateret}</b></td>
    </tr>`;

    // <img src="https://bettercallbob.dk/wp-content/uploads/2024/01/Better-Call-Bob-logo-v2-1.svg" alt="BCB Logo via hjemmeside" style="width: 150px; height: auto; margin-top: -20px; display: flex; justify-content: flex-end;" />

    const kvittering = `
        <div style="background-color: #fff; color: #000; padding: 20px; border-radius: 10px; display: inline-block; box-shadow: rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px;">
            <img src="https://bettercallbob.dk/wp-content/uploads/2025/05/bcb-logo.png" alt="BCB Logo via hjemmeside" style="width: 150px; height: auto; margin-top: -20px;" />
            <div>
                <p style="font-size: 1.2rem;">${isEnglish ? "Receipt for work done at" : "Kvittering for arbejde på adressen"} <br /><b style="font-size: 2rem; margin-top: 10px; display: inline-block;">${kunde?.adresse}</b><br />${kunde?.postnummerOgBy}</p>
                <p><b>${isEnglish ? "Date" : "Dato"}:</b> ${datoFormateret}<br />
                <b>${isEnglish ? "Done by" : "Udført af"}:</b> ${ansvarligeMedarbejdere}</p>
            </div>
            <hr style="border: 1px solid black; margin: 20px 0;" />
            <table style="width: 250px;">
                ${tableHeadings}
                ${opstartsgebyrLinje}
                ${handymanTimerLinje}
                ${tømrerTimerLinje}
                ${rådgivningOpmålingVejledningLinje}
                ${aftenTillægLinje}
                ${natTillægLinje}
                ${trailerLinje}
                ${rabatLinje}
                ${fastPrisLinje}
                ${materialerLinje}
                ${materialeudlægDetaljer}
                ${totalLinje}
                ${momsLinje}
                ${betalingerLinje}
                ${betalingerDetaljer}
            </table>
        </div>`;

        let html = "";

        if(isEnglish){
            html = `<p>Dear ${kunde?.navn},</p>
                <p>Thank you for being a customer at Better Call Bob.</p>
                <p>You will find details about your purchase of our service below:</p>
                ${kvittering}
                <p>We look forward to helping you again! You are always welcome.</p>
                <p>Best regards,<br/>Better Call Bob<br/>Phone: <a href="tel:71994848">71 99 48 48</a><br/>Web: <a href="https://bettercallbob.dk">https://bettercallbob.dk</a></p>`
        } else {
            html = `<p>Kære ${kunde?.navn},</p>
                <p>Tak fordi du valgte at være kunde hos Better Call Bob.</p>
                <p>Herunder kan du se detaljer om dit køb af vores service:</p>
                ${kvittering}
                <p>Vi glæder os til at hjælpe dig igen! Du er altid velkommen.</p>
                <p>Dbh.,<br/>Better Call Bob<br/>Tlf.: <a href="tel:71994848">71 99 48 48</a><br/>Web: <a href="https://bettercallbob.dk">https://bettercallbob.dk</a></p>`
        }

        axios.post(`${import.meta.env.VITE_API_URL}/send-email`, {
            to: kunde?.email,
            subject: `${isEnglish ? "Receipt from Better Call Bob" : "Kvittering fra Better Call Bob"}`,
            html: html,
        }, {
            headers: authHeaders
        })
        .then(response => {
            console.log("Email med kvittering sendt til kunde på mail: " + kunde?.email);
        })
        .catch(error => {
            console.log(error)
        })

    return
}

export default sendKvittering;