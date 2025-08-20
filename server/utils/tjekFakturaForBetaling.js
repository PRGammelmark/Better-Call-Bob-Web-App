import axios from 'axios';
import dotenv from 'dotenv';
import { registrerBetalinger } from './registrerBetalinger.js';

dotenv.config();

export const tjekFakturaForBetaling = async (fakturaNummer) => {

    const response = await axios.get(`https://restapi.e-conomic.com/invoices/booked/${fakturaNummer}`, {
        headers: {
        'Accept': 'application/json',
        'X-AppSecretToken': process.env.ECONOMIC_BCBSECRETTOKEN,
        'X-AgreementGrantToken': process.env.ECONOMIC_BCBAGREEMENTGRANTTOKEN
        }
    });

    const faktureret = response.data.grossAmount;
    const restbeløb = response.data.remainder;
    const betaltBeløb = faktureret - restbeløb;

    const economicApiLink = `https://restapi.e-conomic.com/invoices/booked/${fakturaNummer}`;
    
    if(restbeløb <= 0) {
        await registrerBetalinger(betaltBeløb, economicApiLink, "faktura");
    }

    return restbeløb <= 0;
}