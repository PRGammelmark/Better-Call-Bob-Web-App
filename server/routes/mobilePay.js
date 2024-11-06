// server/routes/sms.js
import express from 'express';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
const router = express.Router();

router.post('/get-qr-code', async (req, res) => {
    // GET ACCESS TOKEN
    axios.post('https://apitest.vipps.no/accesstoken/get', {}, {
        headers: {
            'Content-Type': 'application/json',
            'client_id': `${process.env.VITE_MP_CLIENT_ID}`,
            'client_secret': `${process.env.VITE_MP_CLIENT_SECRET}`,
            'Ocp-Apim-Subscription-Key': `${process.env.VITE_OCP_APIM_SUBSCRIPTION_KEY_PRIMARY}`,
            'Merchant-Serial-Number': `${process.env.VITE_MSN}`,
            'Vipps-System-Name': 'YOUR-SYSTEM-NAME',
            'Vipps-System-Version': 'YOUR-SYSTEM-VERSION',
            'Vipps-System-Plugin-Name': 'YOUR-PLUGIN-NAME',
            'Vipps-System-Plugin-Version': 'YOUR-PLUGIN-VERSION'
        }
    })
    .then(response => {
        const accessToken = response.data.access_token;
        console.log(accessToken);
        // res.status(200).json(response.data);
        
        // GET QR-CODE
        axios.post('https://apitest.vipps.no/epayment/v1/payments', {
            "amount": {
                "currency": "DKK",
                "value": 3
            },
            "paymentMethod": {
                "type": "WALLET"
            },
            "reference": "acme-shop-123-order123abc",
            "returnUrl": "https://app.bettercallbob.dk",
            "userFlow": "QR",
            "paymentDescription": "Two pairs of socks, paid with a QR code",
            "qrFormat": {
                "format": "IMAGE/SVG+XML",
                "size": 1024
            }
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
            console.log('QR-code received:', response.data);
            res.status(200).json(response.data);
        })
        .catch(error => {
            console.error('Error fetching QR-code:', error);
            res.status(500).json({ error: 'Error fetching QR-code' });
        });
    })
    .catch(error => {
        console.error('Error fetching access token:', error);
        res.status(500).json({ error: 'Error fetching access token' });
    });
    
    
    // try {
    //     const response = await axios.post('https://apitest.vipps.no/accesstoken/get', {}, {
    //         headers: {
    //             'Content-Type': 'application/json',
    //             'client_id': `${process.env.VITE_MP_CLIENT_ID}`,
    //             'client_secret': `${process.env.VITE_MP_CLIENT_SECRET}`,
    //             'Ocp-Apim-Subscription-Key': `${process.env.VITE_OCP_APIM_SUBSCRIPTION_KEY_PRIMARY}`,
    //             'Merchant-Serial-Number': `${process.env.VITE_MSN}`,
    //             'Vipps-System-Name': 'YOUR-SYSTEM-NAME',
    //             'Vipps-System-Version': 'YOUR-SYSTEM-VERSION',
    //             'Vipps-System-Plugin-Name': 'YOUR-PLUGIN-NAME',
    //             'Vipps-System-Plugin-Version': 'YOUR-PLUGIN-VERSION'
    //         }
    //     });
    //     console.log("Access token received from MobilePay.");
    //     res.status(200).json(response.data);
    // } catch (error) {
    //     console.error("Fejl: Kunne ikke hente access token fra MobilePay.", error);
    //     res.status(500).json({ error: "Fejl: Kunne ikke hente access token fra MobilePay." });
    // }
});

export default router;