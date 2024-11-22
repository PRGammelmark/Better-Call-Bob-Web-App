import axios from "axios";
import dayjs from "dayjs";
import useEconomicLines from "./useEconomicLines.js";

const useBetalMedMobilePayQR = (user, opgave, opgaveID, posteringer, setOpgaveAfsluttet, totalFaktura, setQrURL, setQrTimer, setQrPaymentAuthorized, setQrErrorMessage) => {

    console.log("Betaling med Mobile Pay QR-kode igangsættes.")

    const paymentInformation = {
        opgave: opgave,
        posteringer: posteringer,
        totalFaktura: totalFaktura
    }
    
    const authHeaders = {
        'Authorization': `Bearer ${user.token}`
    }

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
            if (response.data === 'AUTHORIZED') {
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