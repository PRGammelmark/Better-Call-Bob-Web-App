// server/routes/sms.js
import express from 'express';
import axios from 'axios';
const router = express.Router();

router.post('/send-sms', async (req, res) => {
    const { smsData } = req.body;

    // Use an arbitrary username and the API key as the password
    const username = 'some_value_to_be_ignored';
    const apiKey = process.env.INMOBILE_API_KEY;
    const encodedCredentials = Buffer.from(`${username}:${apiKey}`).toString('base64');

    try {
        const response = await axios.post('https://api.inmobile.com/v4/sms/outgoing', smsData, {
            headers: {
                'Authorization': `Basic ${encodedCredentials}`, // Ensure this is set in your server environment
                'Content-Type': 'application/json'
            }
        });
        console.log("SMS sendt til kunden.");
        res.status(200).json(response.data);
    } catch (error) {
        console.error("Fejl: Kunne ikke sende SMS til kunden.", error.response.data);
        res.status(500).json({ error: "Fejl: Kunne ikke sende SMS til kunden." });
    }
});

export default router;