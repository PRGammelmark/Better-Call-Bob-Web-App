import axios from "axios";
import dayjs from "dayjs";
import satser from "../variables";
import BCBLogo from "../assets/mobilePay.png";

const useBetalMedMobilePayViaAnmodning = (user, opgave, opgaveID, posteringer, setOpgaveAfsluttet, totalFaktura, telefonnummerTilAnmodning, setQrURL, setQrTimer, setQrPaymentAuthorized, setLoadingMobilePaySubmission, setSuccessMobilePaySubmission, setQrErrorMessage, setÅbnOpretRegningModal) => {

    console.log("Betaling med Mobile Pay via anmodning igangsættes.")

    const paymentInformation = {
        opgave: opgave,
        posteringer: posteringer,
        totalFaktura: totalFaktura,
        telefonnummerTilAnmodning: telefonnummerTilAnmodning || ""
    }
    
    const authHeaders = {
        'Authorization': `Bearer ${user.token}`
    }

    function beregnRabat(postering) {
        const rabatProcent = postering.rabatProcent > 0 ? postering.rabatProcent * postering.totalPris : 0;
        const samledeUdlæg = postering.udlæg.reduce((total, udlæg) => total + udlæg.beløb, 0);
        const totalRabat = (postering.totalPris - samledeUdlæg) * (1 - (rabatProcent / 100));
        return totalRabat;
    }

    // ===== BEREGNINGER TIL KVITTERING =====
    const antalOpstartsgebyrer = posteringer.reduce((total, postering) => total + ((postering.opstart) || 0), 0);
    const antalHandymanTimer = posteringer.reduce((total, postering) => total + ((postering.aftenTillæg || postering.natTillæg) ? 0 : postering.handymanTimer), 0);
    const antalTømrerTimer = posteringer.reduce((total, postering) => total + ((postering.aftenTillæg || postering.natTillæg) ? 0 : postering.tømrerTimer), 0);
    const antalRådgivningOpmålingVejledning = posteringer.reduce((total, postering) => total + ((postering.aftenTillæg || postering.natTillæg) ? 0 : postering.rådgivningOpmålingVejledning), 0);
    const antalHandymanTimerAftenTillæg = posteringer.reduce((total, postering) => total + (postering.aftenTillæg ? (postering.handymanTimer) : 0), 0);
    const antalTømrerTimerAftenTillæg = posteringer.reduce((total, postering) => total + (postering.aftenTillæg ? (postering.tømrerTimer) : 0), 0);
    const antalRådgivningOpmålingVejledningAftenTillæg = posteringer.reduce((total, postering) => total + (postering.aftenTillæg ? (postering.rådgivningOpmålingVejledning) : 0), 0);
    const antalHandymanTimerNatTillæg = posteringer.reduce((total, postering) => total + (postering.natTillæg ? (postering.handymanTimer) : 0), 0);
    const antalTømrerTimerNatTillæg = posteringer.reduce((total, postering) => total + (postering.natTillæg ? (postering.tømrerTimer) : 0), 0);
    const antalRådgivningOpmålingVejledningNatTillæg = posteringer.reduce((total, postering) => total + (postering.natTillæg ? (postering.rådgivningOpmålingVejledning) : 0), 0);
    const antalTrailer = posteringer.reduce((total, postering) => total + (postering.trailer ? 1 : 0), 0);
    
    const totalOpstartsgebyrer = antalOpstartsgebyrer * satser.opstartPris
    const totalHandymanTimer = antalHandymanTimer * satser.handymanTimerPris
    const totalTømrerTimer = antalTømrerTimer * satser.tømrerTimerPris
    const totalRådgivningOpmålingVejledning = antalRådgivningOpmålingVejledning * satser.rådgivningOpmålingVejledningPris
    const totalHandymanTimerAftenTillæg = antalHandymanTimerAftenTillæg * satser.handymanTimerPrisInklAftenTillæg
    const totalTømrerTimerAftenTillæg = antalTømrerTimerAftenTillæg * satser.tømrerTimerPrisInklAftenTillæg
    const totalRådgivningOpmålingVejledningAftenTillæg = antalRådgivningOpmålingVejledningAftenTillæg * satser.tømrerTimerPrisInklAftenTillæg
    const totalHandymanTimerNatTillæg = antalHandymanTimerNatTillæg * satser.handymanTimerPrisInklNatTillæg
    const totalTømrerTimerNatTillæg = antalTømrerTimerNatTillæg * satser.tømrerTimerPrisInklNatTillæg
    const totalRådgivningOpmålingVejledningNatTillæg = antalRådgivningOpmålingVejledningNatTillæg * satser.tømrerTimerPrisInklNatTillæg
    const totalTrailer = antalTrailer * satser.trailerPris

    const totalRabat = posteringer.reduce((total, postering) => total + beregnRabat(postering), 0);
    const totalUdlæg = posteringer.reduce((total, postering) => total + (Array.isArray(postering.udlæg) ? postering.udlæg.reduce((sum, udlæg) => sum + (udlæg.beløb), 0) : 0), 0);
    
    const total = posteringer.reduce((total, postering) => total + postering.totalPris, 0);
    const totalInklMoms = total * 1.25
    const momsAfTotal = total * 0.25

    // ===== OPSÆTNING AF KVITTERINGSLINJER =====
    const opstartsgebyrLinje = antalOpstartsgebyrer > 0 ? `
        <tr>
            <td>${antalOpstartsgebyrer} opstartsgebyr(er):</td>
            <td style="text-align: right;">${(totalOpstartsgebyrer * 1.25).toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</td>
        </tr>` : '';

    const handymanTimerLinje = antalHandymanTimer > 0 ? `
        <tr>
            <td>${antalHandymanTimer} handymantimer:</td>
            <td style="text-align: right;">${(totalHandymanTimer * 1.25).toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</td>
        </tr>` : '';

    const tømrerTimerLinje = antalTømrerTimer > 0 ? `
        <tr>
            <td>${antalTømrerTimer} tømrertimer:</td>
            <td style="text-align: right;">${(totalTømrerTimer * 1.25).toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</td>
        </tr>` : '';

    const rådgivningOpmålingVejledningLinje = antalRådgivningOpmålingVejledning > 0 ? `
        <tr>
            <td>${antalRådgivningOpmålingVejledning} rådgivnings- og vejledningstimer:</td>
            <td style="text-align: right;">${(totalRådgivningOpmålingVejledning * 1.25).toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</td>
        </tr>` : '';

    const handymanTimerInklAftenTillægLinje = antalHandymanTimerAftenTillæg > 0 ? `
    <tr>
        <td>${antalHandymanTimerAftenTillæg} handymantimer (inkl. aftentillæg):</td>
        <td style="text-align: right;">${(totalHandymanTimerAftenTillæg * 1.25).toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</td>
    </tr>` : '';

    const tømrerTimerInklAftenTillægLinje = antalTømrerTimerAftenTillæg > 0 ? `
        <tr>
            <td>${antalTømrerTimerAftenTillæg} tømrertimer (inkl. aftentillæg):</td>
            <td style="text-align: right;">${(totalTømrerTimerAftenTillæg * 1.25).toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</td>
        </tr>` : '';

    const rådgivningOpmålingVejledningInklAftenTillægLinje = antalRådgivningOpmålingVejledningAftenTillæg > 0 ? `
        <tr>
            <td>${antalRådgivningOpmålingVejledningAftenTillæg} rådgivnings- og vejledningstimer (inkl. aftentillæg):</td>
            <td style="text-align: right;">${(totalRådgivningOpmålingVejledningAftenTillæg * 1.25).toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</td>
        </tr>` : '';

    const handymanTimerInklNatTillægLinje = antalHandymanTimerNatTillæg > 0 ? `
    <tr>
        <td>${antalHandymanTimerNatTillæg} handymantimer (inkl. nattillæg):</td>
        <td style="text-align: right;">${(totalHandymanTimerNatTillæg * 1.25).toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</td>
    </tr>` : '';

    const tømrerTimerInklNatTillægLinje = antalTømrerTimerNatTillæg > 0 ? `
        <tr>
            <td>${antalTømrerTimerNatTillæg} tømrertimer (inkl. nattillæg):</td>
            <td style="text-align: right;">${(totalTømrerTimerNatTillæg * 1.25).toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</td>
        </tr>` : '';

    const rådgivningOpmålingVejledningInklNatTillægLinje = antalRådgivningOpmålingVejledningNatTillæg > 0 ? `
        <tr>
            <td>${antalRådgivningOpmålingVejledningNatTillæg} rådgivnings- og vejledningstimer (inkl. nattillæg):</td>
            <td style="text-align: right;">${(totalRådgivningOpmålingVejledningNatTillæg * 1.25).toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</td>
        </tr>` : '';

    const trailerLinje = antalTrailer > 0 ? `
        <tr>
            <td>${antalTrailer} x trailerbrug:</td>
            <td style="text-align: right;">${(totalTrailer * 1.25).toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</td>
        </tr>` : '';

    const rabatLinje = totalRabat > 0 ? `
        <tr>
            <td>Rabat:</td>
            <td style="text-align: right;">${(totalRabat * 1.25).toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</td>
        </tr>` : '';

    const materialerLinje = totalUdlæg > 0 ? `
        <tr>
            <td>Udlæg & materialer, i alt:</td>
            <td style="text-align: right;">${(totalUdlæg * 1.25).toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</td>
        </tr>` : '';

    const materialeHeader = `
        <tr>
            <td style="padding-top: 10px;">Udlæg & materialer:</td>
        </tr>
        `
    
    const materialeudlægDetaljer = posteringer.map(postering => postering.udlæg.map(udlæg => `
        <tr>
            <td style="font-size: 0.8rem; opacity: 0.5;">- ${udlæg.beskrivelse}:</td>
            <td style="text-align: right; font-size: 0.8rem; opacity: 0.5;">${(udlæg.beløb * 1.25).toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</td>
        </tr>`).join('')).join('');

    const totalLinje = `
        <tr style="border-top: 1px solid black; padding-top: 20px;">
            <td style="font-size: 1.3rem; padding-top: 10px;"><b>Total:</b></td>
            <td style="text-align: right; font-size: 1.3rem; padding-top: 10px;"><b>${(totalInklMoms).toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</b></td>
        </tr>`;

    const momsLinje = `
        <tr>
            <td style="opacity: 0.5;">Heraf moms:</td>
            <td style="text-align: right; opacity: 0.5;">${(momsAfTotal).toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</td>
        </tr>`;

    const tableHeadings = `
        <tr style="font-size: 1.3rem; border: 1px solid white; padding-bottom: 20px;">
            <th style="text-align: left;"><b>Beskrivelse</b></th>
            <th style="text-align: right;"><b>Beløb</b></th>
        </tr>`;

    const kvittering = `
        <div style="background-color: #fff; color: #000; padding: 20px; border-radius: 10px; display: inline-block; box-shadow: rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px;">
            <img src="https://bettercallbob.dk/wp-content/uploads/2024/01/Better-Call-Bob-logo-v2-1.svg" alt="BCB Logo" style="width: 150px; height: auto; margin-top: -20px; display: flex; justify-content: flex-end;" />
            <div>
                <p style="font-size: 1.2rem;">Kvittering for arbejde på adressen <br /><b style="font-size: 2rem; margin-top: 10px; display: inline-block;">${opgave.adresse}</b><br />${opgave.postnummerOgBy}</p>
                <p><b>Dato:</b> ${dayjs().format('DD. MMMM YYYY')}<br />
                <b>Udført af:</b> ${opgave.ansvarlig.length > 0 ? opgave.ansvarlig.map(ansvarlig => ansvarlig.navn).join(', ') : 'Bob'}</p>
            </div>
            <hr style="border: 1px solid black; margin: 20px 0;" />
            <table style="width: 250px;">
                ${tableHeadings}
                ${opstartsgebyrLinje}
                ${handymanTimerLinje}
                ${tømrerTimerLinje}
                ${rådgivningOpmålingVejledningLinje}
                ${handymanTimerInklAftenTillægLinje}
                ${tømrerTimerInklAftenTillægLinje}
                ${rådgivningOpmålingVejledningInklAftenTillægLinje}
                ${handymanTimerInklNatTillægLinje}
                ${tømrerTimerInklNatTillægLinje}
                ${rådgivningOpmålingVejledningInklNatTillægLinje}
                ${trailerLinje}
                ${rabatLinje}
                ${materialeHeader}
                ${materialerLinje}
                ${materialeudlægDetaljer}
                ${totalLinje}
                ${momsLinje}
            </table>
        </div>`;

//  body: `Kære ${opgave.navn},\n\nTak fordi du valgte at være kunde hos Better Call Bob.\n\nHerunder kan du se din kvittering:\n\n ${kvittering} \n\nVi glæder os til at hjælpe dig igen! \n\nDbh.,\nBob`,

    // REQUEST SERVER TO GET QR CODE
    axios.post(`${import.meta.env.VITE_API_URL}/mobilepay/get-qr-code`, paymentInformation, {
        headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        console.log(response.data.redirectUrl);
        setQrURL(response.data.redirectUrl)
        setQrTimer(600)
        setLoadingMobilePaySubmission(false)
        console.log("Listening for payment status...")
        console.log(response.data)
        
        // REQUEST SERVER TO LISTEN FOR PAYMENT STATUS
        axios.post(`${import.meta.env.VITE_API_URL}/mobilepay/listen-for-payment-status/${response.data.reference}`, {}, {
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        })
        .then(response => {
            console.log(response.data)
            if (response.data === 'AUTHORIZED') {
                setOpgaveAfsluttet(dayjs().format('YYYY-MM-DD'))
                setQrPaymentAuthorized(true)
                setLoadingMobilePaySubmission(false)
                setSuccessMobilePaySubmission(true)
                setÅbnOpretRegningModal(true)
                axios.patch(`${import.meta.env.VITE_API_URL}/opgaver/${opgaveID}`, {
                    opgaveBetaltMedMobilePay: dayjs().format('YYYY-MM-DD'),
                    opgaveAfsluttet: dayjs().toISOString()
                }, {
                    headers: authHeaders
                })
                .then(response => {
                    console.log('Opgave betalt dato sat:', response.data);
                    
                    // ===== SEND KVITTERING PÅ MAIL =====
                    axios.post(`${import.meta.env.VITE_API_URL}/send-email`, {
                        to: opgave && opgave.email,
                        subject: `Kvittering fra Better Call Bob`,
                        html: `<p>Kære ${opgave.navn},</p>
                            <p>Tak fordi du valgte at være kunde hos Better Call Bob.</p>
                            <p>Herunder kan du se detaljer om dit køb af vores service:</p>
                            ${kvittering}
                            <p>Vi glæder os til at hjælpe dig igen! Du er altid velkommen.</p>
                            <p>Dbh.,<br/>Better Call Bob<br/>Tlf.: <a href="tel:71994848">71 99 48 48</a><br/>Web: <a href="https://bettercallbob.dk">https://bettercallbob.dk</a></p>`,
                    }, {
                        headers: authHeaders
                    })
                    .then(response => {
                        console.log("Email med kvittering sendt til kunden.");
                    })
                    .catch(error => {
                        console.log("Fejl: Kunne ikke sende email til kunden.");
                        console.log(error);
                    })
                    // ===== ===== ===== ===== =====
                })
                .catch(error => {
                    console.error('Error setting opgave betalt dato:', error);
                });
            } else {
                setQrPaymentAuthorized(false)
                setÅbnOpretRegningModal(true)
                setQrErrorMessage('Betalingen er ikke gået igennem. Prøv igen.')
                setLoadingMobilePaySubmission(false)
                setSuccessMobilePaySubmission(false)
            }
        })
        .catch(error => {
            console.error('Error listening for payment status: ', error);
        });
    })
    .catch(error => {
        console.error('Error getting access token from MobilePay: ', error);
    });
}

export default useBetalMedMobilePayViaAnmodning;