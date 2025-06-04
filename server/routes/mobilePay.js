import express from 'express';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
const router = express.Router();
import dotenv from 'dotenv';

router.use(express.json());
dotenv.config();

const mpHeadersForAccessToken = {
    'Content-Type': 'application/json',
    'client_id': process.env.VITE_MP_CLIENT_ID,
    'client_secret': process.env.VITE_MP_CLIENT_SECRET,
    'Ocp-Apim-Subscription-Key': process.env.VITE_OCP_APIM_SUBSCRIPTION_KEY_PRIMARY,
    'Merchant-Serial-Number': process.env.VITE_MSN,
    'Vipps-System-Name': 'YOUR-SYSTEM-NAME',
    'Vipps-System-Version': 'YOUR-SYSTEM-VERSION',
    'Vipps-System-Plugin-Name': 'YOUR-PLUGIN-NAME',
    'Vipps-System-Plugin-Version': 'YOUR-PLUGIN-VERSION'
}

router.post('/initiate-mobilepay-payment', async (req, res) => {
    console.log("Initiating MobilePay payment.");
    
    // STEP 1: GET ACCESS TOKEN
    console.log("Getting access token from MobilePay.")
    axios.post('https://api.vipps.no/accesstoken/get', {}, {
        headers: mpHeadersForAccessToken
    })
    .then(response => {
        const accessToken = response.data.access_token;
        console.log("Access token received from MobilePay.");

        // STEP 2: INITIATE PAYMENT
        axios.post('https://api.vipps.no/epayment/v1/payments', {
            "amount": {
                "currency":"DKK",
                "value":100
            },
            "customer": {
                "phoneNumber":"004542377567"
            },
            "paymentMethod": {
                "type":"WALLET"
            },
            "reference": `bcb-${uuidv4()}`,
            "paymentDescription": "Handymanarbejde i flere timer, mand",
            "userFlow": "PUSH_MESSAGE"
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
                'Ocp-Apim-Subscription-Key': `${process.env.VITE_OCP_APIM_SUBSCRIPTION_KEY_PRIMARY}`,
                'Merchant-Serial-Number': `${process.env.VITE_MSN}`,
                'Idempotency-Key': `${uuidv4()}`,
                'Vipps-System-Name': 'Better Call Bob',
                'Vipps-System-Version': '1.0',
                'Vipps-System-Plugin-Name': 'No plugin',
                'Vipps-System-Plugin-Version': '1.0'
            }
        })
        .then(response => {
            console.log('Payment initiated successfully:', response.data);
            res.status(200).json(response.data);
        })
        .catch(error => {
            console.error('Error initiating payment:', error);
            console.log(error.response.data.extraDetails)
            res.status(500).json({ error: 'Error initiating payment' });
        });
    })
    .catch(error => {
        console.error('Error getting access token from MobilePay: ', error);
        res.status(500).json({ error: 'Error getting access token from MobilePay' });
    });
})

router.post('/get-qr-code', async (req, res) => {
    console.log("Initiating MobilePay payment.");

    const paymentInformationObject = req.body;
    const opgave = paymentInformationObject.opgave;
    const telefonnummerTilAnmodning = paymentInformationObject.telefonnummerTilAnmodning;
    
    // STEP 1: GET ACCESS TOKEN
    console.log("Getting access token from MobilePay.")
    axios.post('https://api.vipps.no/accesstoken/get', {}, {
        headers: mpHeadersForAccessToken
    })
    .then(response => {
        const accessToken = response.data.access_token;
        console.log("Access token received from MobilePay.");

        // STEP 2: INITIATE PAYMENT
        axios.post('https://api.vipps.no/epayment/v1/payments', {
            "amount": {
                "currency":"DKK",
                "value": ((paymentInformationObject.totalFaktura * 1.25) * 100)
            },
            "customer": {
                "phoneNumber":`45${telefonnummerTilAnmodning ||opgave.telefon}`
            },
            "paymentMethod": {
                "type":"WALLET"
            },
            "reference": `bcb-${uuidv4()}`,
            "paymentDescription": `Opgave: ${opgave.opgaveBeskrivelse.slice(0, 80)}`,
            "userFlow": "PUSH_MESSAGE"
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
                'Ocp-Apim-Subscription-Key': `${process.env.VITE_OCP_APIM_SUBSCRIPTION_KEY_PRIMARY}`,
                'Merchant-Serial-Number': `${process.env.VITE_MSN}`,
                'Idempotency-Key': `${uuidv4()}`,
                'Vipps-System-Name': 'Better Call Bob',
                'Vipps-System-Version': '1.0',
                'Vipps-System-Plugin-Name': 'No plugin',
                'Vipps-System-Plugin-Version': '1.0'
            }
        })
        .then(response => {
            console.log('Payment initiated successfully:', response.data);
            res.status(200).json(response.data);
        })
        .catch(error => {
            console.error('Error initiating payment:', error);
            console.log(error.response.data.extraDetails)
            res.status(500).json({ error: 'Error initiating payment' });
        });
    })
    .catch(error => {
        console.error('Error getting access token from MobilePay: ', error);
        res.status(500).json({ error: 'Error getting access token from MobilePay' });
    });
});

router.post('/listen-for-payment-status/:orderId', async (req, res) => {
    const { orderId } = req.params;
    console.log(orderId);

    const startTime = Date.now();

    const pollPaymentStatus = (orderId) => {
        if (Date.now() - startTime >= 10 * 60 * 1000) {
            console.log('Polling stopped after 10 minutes.');
            return res.status(408).json({ error: 'Polling timed out after 10 minutes' });
        }

        axios.post('https://api.vipps.no/accesstoken/get', {}, {
            headers: mpHeadersForAccessToken
        })
        .then(response => { 
            const accessToken = response.data.access_token;
            console.log(`https://api.vipps.no/ecomm/v2/payments/${orderId}/details`);
            axios.get(`https://api.vipps.no/epayment/v1/payments/${orderId}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                    'Ocp-Apim-Subscription-Key': `${process.env.VITE_OCP_APIM_SUBSCRIPTION_KEY_PRIMARY}`,
                    'Merchant-Serial-Number': `${process.env.VITE_MSN}`
                }
            })
            .then(response => {
                console.log(response.data.state);
                if (response.data.state === 'AUTHORIZED') {
                    return res.status(200).json(response.data.state);
                } else if (response.data.state === 'ABORTED') {
                    return res.status(200).json(response.data.state);
                } else if (response.data.state === 'FAILED') {
                    return res.status(200).json(response.data.state);
                } else if (response.data.state === 'EXPIRED') {
                    return res.status(200).json(response.data.state);
                } else {
                    setTimeout(() => pollPaymentStatus(orderId), 3000);
                }
            })
            .catch(error => {
                console.error('Error polling payment status: ', error);
                res.status(500).json({ error: `Error polling payment status for orderId: ${orderId}` });
            });
        })
        .catch(error => {
            console.error('Error getting access token from MobilePay: ', error);
            res.status(500).json({ error: 'Error getting access token from MobilePay' });
        });
    }

    pollPaymentStatus(orderId);
});

export default router;