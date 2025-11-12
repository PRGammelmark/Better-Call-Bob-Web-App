import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { sendEmail } from '../emailService.js';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import Kunde from '../models/kunderModel.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const sendFakturaIgen = async ({ to, subject, body, html, fakturaNummer }) => {
    const filePath = path.join(__dirname, `faktura-${fakturaNummer}.pdf`);
    
    try {
        // Hent PDF fra e-conomic
        const fakturaURL = `https://restapi.e-conomic.com/invoices/booked/${fakturaNummer}/pdf`;
        const response = await axios.get(fakturaURL, {
            headers: {
                'Accept': 'application/json',
                'X-AppSecretToken': process.env.ECONOMIC_BCBSECRETTOKEN,
                'X-AgreementGrantToken': process.env.ECONOMIC_BCBAGREEMENTGRANTTOKEN
            },
            responseType: 'arraybuffer'
        });

        // Gem midlertidigt
        fs.writeFileSync(filePath, response.data);
        console.log(fs.existsSync(filePath))

        // Send email med vedhæftning
        await sendEmail(to, subject, body, html, [
            { filename: `Faktura-${fakturaNummer}.pdf`, path: filePath }
        ]);

        // Send SMS hvis telefonnummer er registreret
        try {
            const kunde = await Kunde.findOne({ email: to });
            if (kunde?.telefon && String(kunde.telefon).length === 8) {
                const username = 'some_value_to_be_ignored';
                const apiKey = process.env.INMOBILE_API_KEY;
                const encodedCredentials = Buffer.from(`${username}:${apiKey}`).toString('base64');
                const fornavn = kunde.fornavn || kunde.navn.split(" ")[0] || "kunde";

                const smsData = {
                    messages: [{
                        to: String(kunde.telefon),
                        countryHint: "45",
                        respectBlacklist: true,
                        text: kunde.engelskKunde
                            ? `Dear ${fornavn},\n\nWe are missing your payment. As a friendly reminder we have sent you a copy of invoice ${fakturaNummer} to your email.\n\nBest regards,\nBetter Call Bob`
                            : `Kære ${fornavn},\n\nVi mangler din betaling. Som venlig påmindelse har vi sendt en kopi af faktura ${fakturaNummer} til ${kunde.email || "din e-mail"}.\n\nDbh.,\nBetter Call Bob`,
                        from: "Bob",
                        flash: false,
                        encoding: "gsm7"
                    }]
                };

                await axios.post('https://api.inmobile.com/v4/sms/outgoing', smsData, {
                    headers: {
                        'Authorization': `Basic ${encodedCredentials}`,
                        'Content-Type': 'application/json'
                    }
                });
                console.log("SMS sendt til kunden.");
            }
        } catch (smsError) {
            console.error("Fejl: Kunne ikke sende SMS til kunden.", smsError.response?.data || smsError.message);
        }
    } catch (error) {
        console.error('Error sending email:', error);
    } finally {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
};
