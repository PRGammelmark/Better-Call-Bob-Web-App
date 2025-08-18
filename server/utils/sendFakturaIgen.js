import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { sendEmail } from '../emailService.js';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

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

    } catch (error) {
        console.error('Error sending email:', error);
    } finally {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
};
