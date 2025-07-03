import axios from "axios";
import dayjs from "dayjs";
import BCBLogo from "../assets/mobilePay.png";

const useBetalMedMobilePayQR = (user, opgave, opgaveID, kunde, posteringer, setOpgaveAfsluttet, totalFaktura, setQrURL, setQrTimer, setQrPaymentAuthorized, setQrErrorMessage) => {

    console.log("Betaling med Mobile Pay QR-kode igangsættes.")

    const paymentInformation = {
        opgave: opgave,
        posteringer: posteringer,
        totalFaktura: totalFaktura
    }
    
    const authHeaders = {
        'Authorization': `Bearer ${user.token}`
    }

    // ===== BEREGNINGER TIL KVITTERING =====
    const totalOpstartsgebyrer = posteringer.reduce((total, postering) => total + ((postering.opstart / 200) || 0), 0);
    const totalHandymanTimer = posteringer.reduce((total, postering) => total + (postering.handymanTimer || 0), 0);
    const totalTømrerTimer = posteringer.reduce((total, postering) => total + (postering.tømrerTimer || 0), 0);
    const totalMaterialer = posteringer.reduce((total, postering) => total + (Array.isArray(postering.udlæg) ? postering.udlæg.reduce((sum, udlæg) => sum + (udlæg.beløb * 1.25), 0) : 0), 0);
    const totalØvrigt = posteringer.reduce((total, postering) => total + (Array.isArray(postering.øvrigt) ? postering.øvrigt.reduce((sum, øvrigt) => sum + (øvrigt.beløb * 1.25), 0) : 0), 0);
    const total = (totalOpstartsgebyrer * 399) + (totalHandymanTimer * 559) + (totalTømrerTimer * 600) + totalMaterialer + totalØvrigt
    const totalMoms = total * 0.20

    // ===== OPSÆTNING AF KVITTERINGSLINJER =====
    const opstartsgebyrLinje = totalOpstartsgebyrer > 0 ? `
        <tr>
            <td>${totalOpstartsgebyrer} opstartsgebyr(er):</td>
            <td style="text-align: right;">${(totalOpstartsgebyrer * 399).toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</td>
        </tr>` : '';

    const handymanTimerLinje = totalHandymanTimer > 0 ? `
        <tr>
            <td>${totalHandymanTimer} handymantimer:</td>
            <td style="text-align: right;">${(totalHandymanTimer * 559).toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</td>
        </tr>` : '';

    const tømrerTimerLinje = totalTømrerTimer > 0 ? `
        <tr>
            <td>${totalTømrerTimer} tømrertimer:</td>
            <td style="text-align: right;">${(totalTømrerTimer * 600).toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</td>
        </tr>` : '';

    const materialerLinje = totalMaterialer > 0 ? `
        <tr>
            <td>Materialer, i alt:</td>
            <td style="text-align: right;">${(totalMaterialer).toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</td>
        </tr>` : '';

    const materialeHeader = `
        <tr>
            <td style="padding-top: 10px;">Materialer:</td>
        </tr>
        `
    
    const materialeudlægDetaljer = posteringer.map(postering => postering.udlæg.map(udlæg => `
        <tr>
            <td style="font-size: 0.8rem; opacity: 0.5;">- ${udlæg.beskrivelse}:</td>
            <td style="text-align: right; font-size: 0.8rem; opacity: 0.5;">${(udlæg.beløb * 1.25).toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</td>
        </tr>`).join('')).join('');

    const øvrigtLinje = totalØvrigt > 0 ? `
        <tr>
            <td>Øvrigt, i alt:</td>
            <td style="text-align: right;">${(totalØvrigt).toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</td>
        </tr>` : '';

    const øvrigtHeader = `
        <tr>
            <td style="padding-top: 10px;">Øvrigt:</td>
        </tr>
        `

    const øvrigtDetaljer = posteringer.map(postering => postering.øvrigt.map(øvrigt => `
        <tr>
            <td style="font-size: 0.8rem; opacity: 0.5;">- ${øvrigt.beskrivelse}:</td>
            <td style="text-align: right; font-size: 0.8rem; opacity: 0.5;">${(øvrigt.beløb * 1.25).toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</td>
        </tr>`).join('')).join('');

    const totalLinje = `
        <tr style="border-top: 1px solid black; padding-top: 20px;">
            <td style="font-size: 1.3rem; padding-top: 10px;"><b>Total:</b></td>
            <td style="text-align: right; font-size: 1.3rem; padding-top: 10px;"><b>${(total).toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</b></td>
        </tr>`;

    const momsLinje = `
        <tr>
            <td style="opacity: 0.5;">Heraf moms:</td>
            <td style="text-align: right; opacity: 0.5;">${(totalMoms).toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</td>
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
                <p style="font-size: 1.2rem;">Kvittering for arbejde på adressen <br /><b style="font-size: 2rem; margin-top: 10px; display: inline-block;">${kunde?.adresse}</b><br />${kunde?.postnummerOgBy}</p>
                <p><b>Dato:</b> ${dayjs().format('DD. MMMM YYYY')}<br />
                <b>Udført af:</b> ${opgave.ansvarlig.length > 0 ? opgave.ansvarlig.map(ansvarlig => ansvarlig.navn).join(', ') : 'Bob'}</p>
            </div>
            <hr style="border: 1px solid black; margin: 20px 0;" />
            <table style="width: 250px;">
                ${tableHeadings}
                ${opstartsgebyrLinje}
                ${handymanTimerLinje}
                ${tømrerTimerLinje}
                ${materialeHeader}
                ${materialeudlægDetaljer}
                ${materialerLinje}
                ${øvrigtHeader}
                ${øvrigtDetaljer}
                ${øvrigtLinje}
                ${totalLinje}
                ${momsLinje}
            </table>
        </div>`;

//  body: `Kære ${kunde?.navn},\n\nTak fordi du valgte at være kunde hos Better Call Bob.\n\nHerunder kan du se din kvittering:\n\n ${kvittering} \n\nVi glæder os til at hjælpe dig igen! \n\nDbh.,\nBob`,

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
            if (response.data.status === 'CAPTURED') {
                setOpgaveAfsluttet(true)
                setQrPaymentAuthorized(true)
                axios.patch(`${import.meta.env.VITE_API_URL}/opgaver/${opgaveID}`, {
                    opgaveBetaltMedMobilePay: dayjs().format('YYYY-MM-DD'),
                    opgaveAfsluttet: true
                }, {
                    headers: authHeaders
                })
                .then(response => {
                    console.log('Opgave betalt dato sat:', response.data);
                    
                    // ===== SEND KVITTERING PÅ MAIL =====
                    axios.post(`${import.meta.env.VITE_API_URL}/send-email`, {
                        to: kunde?.email,
                        subject: `Kvittering fra Better Call Bob`,
                        html: `<p>Kære ${kunde?.navn},</p>
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
                setQrErrorMessage('Betalingen er ikke gået igennem. Prøv igen.')
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

export default useBetalMedMobilePayQR;