import * as beregn from '../../../utils/beregninger.js'
import dayjs from 'dayjs'
import axios from 'axios'

// ===== HJÆLPEFUNKTIONER =====

/**
 * Formaterer et beløb til dansk valuta
 */
function formaterBeløb(beløb, decimaler = 2) {
    return beløb.toLocaleString('da-DK', {
        style: 'currency',
        currency: 'DKK',
        minimumFractionDigits: decimaler,
        maximumFractionDigits: decimaler
    });
}

/**
 * Aggregerer timeregistreringer fra alle posteringer
 * Grupperer på timetypeId og summerer antal og pris
 */
function aggregerTimeregistreringer(posteringer) {
    const map = new Map();
    
    posteringer.forEach(postering => {
        (postering.timeregistrering || []).forEach(tr => {
            const key = tr.timetypeId?.toString() || tr.navn || 'unknown';
            if (map.has(key)) {
                const existing = map.get(key);
                existing.antal += tr.antal || 0;
                existing.totalInklMoms += tr.pris?.totalInklMoms || 0;
            } else {
                map.set(key, {
                    navn: tr.navn || 'Timer',
                    antal: tr.antal || 0,
                    totalInklMoms: tr.pris?.totalInklMoms || 0
                });
            }
        });
    });
    
    return Array.from(map.values());
}

/**
 * Aggregerer faste tillæg fra alle posteringer
 * Grupperer på tillaegId og summerer antal og pris
 */
function aggregerFasteTillæg(posteringer) {
    const map = new Map();
    
    posteringer.forEach(postering => {
        (postering.fasteTillæg || []).forEach(ft => {
            const key = ft.tillaegId?.toString() || ft.navn || 'unknown';
            if (map.has(key)) {
                const existing = map.get(key);
                existing.antal += ft.antal || 0;
                existing.totalInklMoms += ft.pris?.totalInklMoms || 0;
            } else {
                map.set(key, {
                    navn: ft.navn || 'Tillæg',
                    antal: ft.antal || 0,
                    totalInklMoms: ft.pris?.totalInklMoms || 0
                });
            }
        });
    });
    
    return Array.from(map.values());
}

/**
 * Aggregerer procent tillæg fra alle posteringer
 * Grupperer på procentTillaegId og summerer pris
 */
function aggregerProcentTillæg(posteringer) {
    const map = new Map();
    
    posteringer.forEach(postering => {
        (postering.procentTillæg || []).forEach(pt => {
            const key = pt.procentTillaegId?.toString() || pt.navn || 'unknown';
            if (map.has(key)) {
                const existing = map.get(key);
                existing.antal += 1;
                existing.totalInklMoms += pt.pris?.totalInklMoms || 0;
            } else {
                map.set(key, {
                    navn: pt.navn || 'Procent tillæg',
                    antal: 1,
                    totalInklMoms: pt.pris?.totalInklMoms || 0
                });
            }
        });
    });
    
    return Array.from(map.values());
}

/**
 * Samler alle materialer fra alle posteringer (uden aggregering)
 */
function samlMaterialer(posteringer) {
    const materialer = [];
    
    posteringer.forEach(postering => {
        (postering.materialer || []).forEach(m => {
            materialer.push({
                beskrivelse: m.beskrivelse || m.varenummer || 'Materiale',
                antal: m.antal || 1,
                totalInklMoms: m.totalInklMoms || 0,
                erUdlaeg: m.erUdlaeg || false
            });
        });
    });
    
    return materialer;
}

/**
 * Beregner total pris inkl. moms fra alle posteringer
 */
function beregnTotalInklMoms(posteringer) {
    return posteringer.reduce((sum, p) => sum + (p.totalPrisInklMoms || 0), 0);
}

/**
 * Beregner total moms fra alle posteringer
 */
function beregnTotalMoms(posteringer) {
    return posteringer.reduce((sum, p) => sum + (p.totalMoms || 0), 0);
}

/**
 * Beregner total betalinger fra alle posteringer
 */
function beregnTotalBetalinger(posteringer) {
    return posteringer.reduce((sum, p) => {
        const betalingerSum = (p.betalinger || []).reduce((bSum, b) => bSum + (b.betalingsbeløb || 0), 0);
        return sum + betalingerSum;
    }, 0);
}

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

    const isEnglish = kunde?.isEnglish || false;

    // ===== AGGREGER DATA FRA NYE FELTER =====
    const timeregistreringer = aggregerTimeregistreringer(posteringer);
    const fasteTillæg = aggregerFasteTillæg(posteringer);
    const procentTillæg = aggregerProcentTillæg(posteringer);
    const materialer = samlMaterialer(posteringer);
    
    // ===== BEREGN TOTALER =====
    const totalInklMoms = beregnTotalInklMoms(posteringer);
    const totalMoms = beregnTotalMoms(posteringer);
    const totalBetalinger = beregnTotalBetalinger(posteringer);

    // ===== GENERER KVITTERINGSLINJER =====
    
    // Timeregistreringer (timer)
    const timeregistreringLinjer = timeregistreringer
        .filter(tr => tr.totalInklMoms > 0)
        .map(tr => `
        <tr>
            <td>${tr.antal} x ${tr.navn}:</td>
            <td style="text-align: right;">${formaterBeløb(tr.totalInklMoms)}</td>
        </tr>`).join('');

    // Faste tillæg (opstart, trailer, etc.)
    const fasteTillægLinjer = fasteTillæg
        .filter(ft => ft.totalInklMoms > 0)
        .map(ft => `
        <tr>
            <td>${ft.antal} x ${ft.navn}:</td>
            <td style="text-align: right;">${formaterBeløb(ft.totalInklMoms)}</td>
        </tr>`).join('');

    // Procent tillæg (aften, nat, etc.)
    const procentTillægLinjer = procentTillæg
        .filter(pt => pt.totalInklMoms > 0)
        .map(pt => `
        <tr>
            <td>${pt.antal > 1 ? pt.antal + ' x ' : ''}${pt.navn}:</td>
            <td style="text-align: right;">${formaterBeløb(pt.totalInklMoms)}</td>
        </tr>`).join('');

    // Materialer samlet linje + detaljer
    const materialerTotal = materialer.reduce((sum, m) => sum + m.totalInklMoms, 0);
    const materialerLinje = materialerTotal > 0 ? `
        <tr>
            <td>${isEnglish ? "Materials" : "Materialer"}, i alt:</td>
            <td style="text-align: right;">${formaterBeløb(materialerTotal)}</td>
        </tr>` : '';
    
    const materialeDetaljer = materialer
        .filter(m => m.totalInklMoms > 0)
        .map(m => `
        <tr>
            <td style="font-size: 0.8rem; opacity: 0.5;">- ${m.antal > 1 ? m.antal + ' x ' : ''}${m.beskrivelse}:</td>
            <td style="text-align: right; font-size: 0.8rem; opacity: 0.5;">${formaterBeløb(m.totalInklMoms)}</td>
        </tr>`).join('');

    // Rabat linje (beregnet fra rabatBeløb i arrays)
    const rabatBeløb = beregn.rabatPris(posteringer, 2, true)?.beløb || 0;
    const rabatLinje = rabatBeløb > 0 ? `
        <tr>
            <td>${isEnglish ? "Discount" : "Rabat"}:</td>
            <td style="text-align: right;">-${formaterBeløb(rabatBeløb)}</td>
        </tr>` : '';

    // Fast pris linje (tilbudspris)
    const fastPrisBeløb = beregn.fastPris(posteringer, 2, true)?.beløb || 0;
    const fastPrisLinje = fastPrisBeløb > 0 ? `
        <tr>
            <td>${isEnglish ? "Fixed price" : "Fast pris"}:</td>
            <td style="text-align: right;">${formaterBeløb(fastPrisBeløb)}</td>
        </tr>` : '';

    // Total linje
    const totalLinje = `
        <tr style="border-top: 1px solid black; padding-top: 20px;">
            <td style="font-size: 1.3rem; padding-top: 10px;"><b>Total:</b></td>
            <td style="text-align: right; font-size: 1.3rem; padding-top: 10px;"><b>${formaterBeløb(totalInklMoms)}</b></td>
        </tr>`;

    // Moms linje
    const momsLinje = `
        <tr>
            <td style="opacity: 0.5;">${isEnglish ? "VAT" : "Heraf moms"}:</td>
            <td style="text-align: right; opacity: 0.5;">${formaterBeløb(totalMoms)}</td>
        </tr>`;

    // Table headings
    const tableHeadings = `
        <tr style="font-size: 1.3rem; border: 1px solid white; padding-bottom: 20px;">
            <th style="text-align: left;"><b>${isEnglish ? "Description" : "Beskrivelse"}</b></th>
            <th style="text-align: right;"><b>${isEnglish ? "Amount" : "Beløb"}</b></th>
        </tr>`;

    // Betalinger detaljer
    const betalingerDetaljer = posteringer.map(postering => (postering.betalinger || []).map(betaling => `
        <tr>
            <td style="font-size: 0.8rem; opacity: 0.5;">- ${betaling.betalingsmetode + " " + dayjs(betaling.dato).format('DD. MMMM YYYY')}:</td>
            <td style="text-align: right; font-size: 0.8rem; opacity: 0.5;">${formaterBeløb(betaling.betalingsbeløb)}</td>
        </tr>`).join('')).join('');

    // Betalinger total linje
    const betalingerLinje = `
    <tr style="border-top: 1px solid black; padding-top: 20px;">
        <td style="font-size: 1.3rem; padding-top: 10px;"><b>${isEnglish ? "Paid, total" : "Betalt, i alt"}:</b></td>
        <td style="text-align: right; font-size: 1.3rem; padding-top: 10px;"><b>${formaterBeløb(totalBetalinger)}</b></td>
    </tr>`;

    // ===== SAML KVITTERING =====
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
                ${timeregistreringLinjer}
                ${fasteTillægLinjer}
                ${procentTillægLinjer}
                ${rabatLinje}
                ${fastPrisLinje}
                ${materialerLinje}
                ${materialeDetaljer}
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