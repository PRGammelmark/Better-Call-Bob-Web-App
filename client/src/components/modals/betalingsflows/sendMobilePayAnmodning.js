import axios from "axios";
import dayjs from "dayjs";
import satser from "../../../variables";
import sendKvittering from './sendKvittering.js'
import * as beregn from '../../../utils/beregninger.js'

const mobilePayAnmodning = ({posteringer, user, telefonnummerTilAnmodning, setLoading, setBetalingsfristTimer, setPaymentRequested, setPaymentCaptured, setErrorMessage}) => {

    console.log("Betaling med Mobile Pay via ny anmodning igangsættes.")

    const authHeaders = {
        'Authorization': `Bearer ${user.token}`,
        'Content-Type': 'application/json'
    }
    
    const posteringerListe = Array.isArray(posteringer) ? posteringer : [posteringer];

    const betalinger = posteringerListe.reduce((sum, postering) => sum + postering.betalinger.reduce((sum, betaling) => sum + betaling.betalingsbeløb, 0), 0)
    const anmodningBeløbInklMoms = (Math.ceil(beregn.totalPris(posteringerListe, 2, true).beløb * 100) / 100) - betalinger;
    const anmodningBeløb = anmodningBeløbInklMoms * 0.8;
    
    const paymentInformation = {
        opgave: posteringerListe[0].opgave,
        kunde: posteringerListe[0].kunde,
        posteringer: posteringerListe,
        totalFaktura: anmodningBeløb,
        telefonnummerTilAnmodning: telefonnummerTilAnmodning || ""
    }

    // REQUEST SERVER TO GET QR CODE
    axios.post(`${import.meta.env.VITE_API_URL}/mobilepay/send-payment-request`, paymentInformation, { headers: authHeaders })
    .then(response => {
        setPaymentRequested(true)
        setBetalingsfristTimer(600)
        setLoading(false)
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
            if (response.data?.status === 'CAPTURED') {
                setPaymentCaptured(true);
                sendKvittering({ posteringer: posteringerListe, user, kunde: paymentInformation.kunde, opgave: paymentInformation.opgave, setErrorMessage });
                setPaymentRequested(false);
                setLoading(false);
            } else {
                switch (response.data) {
                    case 'ABORTED':
                        console.log("Kunden annullerede betalingen.")
                        setErrorMessage('Kunden annullerede betalingen.');
                        setPaymentRequested(false)
                        setLoading(false);
                        break;
                    case 'FAILED':
                        setErrorMessage('Kundens betaling fejlede.');
                        setPaymentRequested(false)
                        setLoading(false);
                        break;
                    case 'EXPIRED':
                        setErrorMessage('Betalingen er udløbet.');
                        setPaymentRequested(false)
                        setLoading(false);
                        break;
                }
            }
        })
        .catch(error => {
            console.error('Error listening for payment status: ', error);
            setErrorMessage('Betalingen blev ikke gennemført.');
            setPaymentRequested(false)
            setLoading(false);
        });
    })
    .catch(error => {
        console.error('Error getting access token from MobilePay: ', error);
        setErrorMessage('Mobile Pay afviste anmodningen. Prøv igen.');
        setPaymentRequested(false)
        setLoading(false);
    });
}

export default mobilePayAnmodning;