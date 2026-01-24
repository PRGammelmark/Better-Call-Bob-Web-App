import axios from "axios";
import dayjs from "dayjs";
import useEconomicLines from "../../../hooks/useEconomicLines.js";
import { storage } from '../../../firebase.js'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import nyNotifikation from "../../../utils/nyNotifikation.js";
import uploadFakturaTilFirebase from './uploadFakturaTilFirebase.js'


const sendFaktura = async ({ posteringer, inklAdministrationsGebyr, user, alternativEmail, setLoadingFakturaSubmission, loadingProgressMessages, setLoadingProgressMessages, setSuccessFakturaSubmission, setErrorMessage }) => {

    console.log("Betaling med faktura igangsættes ...");

    const authHeaders = {
        'Authorization': `Bearer ${user.token}`
    }
    
    const economicHeaders = {
        'Content-Type': 'application/json',
        'X-AppSecretToken': import.meta.env.VITE_BCBSECRETTOKEN,
        'X-AgreementGrantToken': import.meta.env.VITE_BCBAGREEMENTGRANTTOKEN
    }

    const kunde = posteringer[0]?.kunde;
    const erErhvervskunde = kunde?.CVR || kunde?.virksomhed;
    const isEnglish = kunde?.isEnglish || false;
    const opgaveID = posteringer[0]?.opgaveID;
    // Understøt både ny struktur (totalPrisInklMoms) og gammel struktur (totalPris * 1.25)
    const posteringerTotalPrisInklMoms = posteringer.reduce((acc, postering) => {
        // Ny struktur har totalPrisInklMoms direkte
        if (postering.totalPrisInklMoms !== undefined && postering.totalPrisInklMoms !== null) {
            return acc + postering.totalPrisInklMoms;
        }
        // Gammel struktur: totalPris er eks. moms, så vi ganger med 1.25
        return acc + (postering.totalPris || 0) * 1.25;
    }, 0);
    const alleredeBetaltBeløb = posteringer.reduce((acc, postering) => acc + postering.betalinger?.reduce((acc, betaling) => acc + betaling.betalingsbeløb, 0), 0);
    const administrationsGebyrInklMoms = inklAdministrationsGebyr ? 49 * 1.25 : 0; // Administration fee: 49 DKK excl. VAT = 61.25 DKK incl. VAT
    const restbeløbTilOpkrævning = posteringerTotalPrisInklMoms + administrationsGebyrInklMoms - alleredeBetaltBeløb;

    // Importer linjer til faktura fra posteringer
    const economicLines = useEconomicLines(posteringer, inklAdministrationsGebyr, isEnglish);

    const faktureringsAdresse = kunde?.fakturerbarAdresse || kunde?.adresse;
    const nyKundeObject = {
        ...(erErhvervskunde && { name: kunde?.virksomhed ? kunde?.virksomhed : "Virksomhedsnavn ikke oplyst" }),
        ...(!erErhvervskunde && { name: kunde?.navn ? kunde?.navn : "Intet navn oplyst" }),
        address: faktureringsAdresse ? faktureringsAdresse : "Ingen adresse oplyst",
        email: alternativEmail ? alternativEmail : kunde?.email ? kunde?.email : null,
        vatZone: {
            vatZoneNumber: 1
        },
        ...(kunde?.CVR && { corporateIdentificationNumber: kunde?.CVR.toString() }),
        currency: "DKK",
        customerGroup: {
            customerGroupNumber: 1
        },
        paymentTerms: {
            paymentTermsNumber: 1,
            daysOfCredit: 8,
            name: "Netto 8 dage",
            paymentTermsType: "net"
        }
    }

    const nyfakturakladdeObject = (customerNumber) => {
        return {
            date: dayjs().format("YYYY-MM-DD"),
            currency: "DKK",
            customer: {
                customerNumber: customerNumber
            },
            paymentTerms: {
                paymentTermsNumber: 1,
                daysOfCredit: 8,
                name: "Netto 8 dage",
                paymentTermsType: "net"
            },
            layout: {
                layoutNumber: 3
            },
            remainder: Number(Number(restbeløbTilOpkrævning).toFixed(2)),
            recipient: {
                ...(erErhvervskunde && { name: kunde?.virksomhed ? kunde?.virksomhed : "Virksomhedsnavn ikke oplyst" }),
                ...(!erErhvervskunde && { name: kunde?.navn ? kunde?.navn : "Intet navn oplyst" }),
                address: `${faktureringsAdresse}`,
                city: `${kunde?.postnummerOgBy ? kunde?.postnummerOgBy : "1000 København"}`,
                country: "Danmark",
                vatZone: {
                    name: "Domestic",
                    vatZoneNumber: 1,
                    enabledForCustomer: true,
                    enabledForSupplier: true
                }
            },
            lines: economicLines
        }
    }


// ===== BETALINGSFLOW =====

// =================================================== V3 ===================================================

setLoadingFakturaSubmission(true);

let kundeResponse, kladdeResponse, bookingResponse, fakturaPDF, fakturaURL;

try {
  // 1. Opret kunde
  kundeResponse = await axios.post('https://restapi.e-conomic.com/customers', nyKundeObject, { headers: economicHeaders });
  console.log("✅ Kunde oprettet");
  setLoadingProgressMessages(prev => [...prev, "✅ Kunde oprettet"]);
} catch (err) {
  console.error("❌ Kunde kunne ikke oprettes:", err);
  setLoadingProgressMessages(prev => [...prev, "❌ Kunde kunne ikke oprettes"]);
  setErrorMessage("Fejl i oprettelse af kunde. Prøv igen.");
  setSuccessFakturaSubmission(false);
  setLoadingFakturaSubmission(false);
  return;
}

try {
  // 2. Opret fakturakladde
  kladdeResponse = await axios.post('https://restapi.e-conomic.com/invoices/drafts', nyfakturakladdeObject(kundeResponse.data.customerNumber), { headers: economicHeaders });
  console.log("✅ Fakturakladde oprettet");
  setLoadingProgressMessages(prev => [...prev, "✅ Fakturakladde oprettet"]);
} catch (err) {
  console.error("❌ Fakturakladde kunne ikke oprettes:", err);
  setLoadingProgressMessages(prev => [...prev, "❌ Fakturakladde kunne ikke oprettes"]);
  setErrorMessage("Fejl i oprettelse af fakturakladde. Prøv igen.");
  setSuccessFakturaSubmission(false);
  setLoadingFakturaSubmission(false);
  return;
}

if (erErhvervskunde) {
  try {
    nyNotifikation(user, "admin", "Ny fakturakladde i Economic", `Fakturakladde oprettet for erhvervskunde.`, `/opgave/${opgaveID}`);

    await axios.post(`${import.meta.env.VITE_API_URL}/send-email`, {
      to: "hej@bettercallbob.dk",
      subject: `Ny fakturakladde i Economic`,
      body: `Kunde: ${kunde?.navn} – Virksomhed: ${kunde?.virksomhed}`
    }, { headers: authHeaders });

    // await axios.patch(`${import.meta.env.VITE_API_URL}/opgaver/${opgaveID}`, {
    //   fakturaSendt: new Date().toISOString(),
    //   opgaveAfsluttet: new Date().toISOString()
    // }, { headers: authHeaders });

    // setOpgaveAfsluttet(true);
    setSuccessFakturaSubmission(true);
    console.log("✅ Erhvervskundeflow gennemført");
  } catch (err) {
    console.error("❌ Fejl i erhvervskundeflow:", err);
    setErrorMessage("Kunne ikke opdatere opgavens status. Prøv igen.");
    setSuccessFakturaSubmission(false);
  } finally {
    setLoadingFakturaSubmission(false);
  }
  return;
}

try {
  // PRIVATKUNDE: Book faktura
  bookingResponse = await axios.post('https://restapi.e-conomic.com/invoices/booked', {
    draftInvoice: { draftInvoiceNumber: kladdeResponse.data.draftInvoiceNumber }
  }, { headers: economicHeaders });
  console.log("✅ Faktura booket");
  console.log(bookingResponse.data)
  setLoadingProgressMessages(prev => [...prev, "✅ Faktura booket"]);
} catch (err) {
  console.error("❌ Faktura kunne ikke bookes:", err);
  setLoadingProgressMessages(prev => [...prev, "❌ Faktura kunne ikke bookes"]);
  setErrorMessage("Kunne ikke booke fakturakladden. Prøv igen.");
  setSuccessFakturaSubmission(false);
  setLoadingFakturaSubmission(false);
  return;
}

// Registrer opkrævninger
try {
  await axios.post(`${import.meta.env.VITE_API_URL}/faktura-opkraevninger/registrer-opkraevninger`, {
    posteringer: posteringer,
    opkrævningsbeløb: restbeløbTilOpkrævning,
    reference: bookingResponse.data.self,
    metode: "faktura"
  }, { headers: authHeaders });
  setLoadingProgressMessages(prev => [...prev, "✅ Opkrævninger registreret på posteringer"]);
} catch (err) {
  console.error("❌ Kunne ikke registrere opkrævning på posteringer:", err);
  setLoadingProgressMessages(prev => [...prev, "❌ Kunne ikke registrere opkrævning på posteringer"]);
  setSuccessFakturaSubmission(false);
}

try {
  nyNotifikation(user, "admin", "Ny faktura oprettet", `Privatkunde har fået oprettet faktura.`, `/opgave/${opgaveID}`);

  try {
    // Download PDF
    fakturaPDF = await axios.get(bookingResponse.data.pdf.download, {
      responseType: 'blob',
      headers: economicHeaders
    });
  
    // Upload PDF
    fakturaURL = await uploadFakturaTilFirebase(fakturaPDF, opgaveID);

  await axios.patch(`${import.meta.env.VITE_API_URL}/opgaver/${opgaveID}`, {
    fakturaPDFUrl: fakturaURL
  }, { headers: authHeaders });

  // Send SMS
  if (kunde?.telefon && String(kunde?.telefon).length === 8) {
    await axios.post(`${import.meta.env.VITE_API_URL}/sms/send-sms`, {
      smsData: {
        messages: [{
          to: kunde.telefon,
          countryHint: "45",
          text: isEnglish
            ? `Dear ${kunde?.navn},\n\nYou can see your invoice here: ${fakturaURL}`
            : `Kære ${kunde?.navn},\n\nDu kan se din regning her: ${fakturaURL}`,
          from: "Bob",
          flash: false,
          encoding: "gsm7"
        }]
      }
    }, { headers: authHeaders });
    console.log("✅ SMS sendt");
    setLoadingProgressMessages(prev => [...prev, "✅ SMS sendt til kunden"]);
  }

  // Send Email
  await axios.post(`${import.meta.env.VITE_API_URL}/send-email`, {
    to: alternativEmail || kunde?.email,
    subject: isEnglish ? "Invoice from Better Call Bob" : "Faktura fra Better Call Bob",
    body: isEnglish
      ? `Dear ${kunde?.navn},\n\nYou can see your invoice here: ${fakturaURL}`
      : `Kære ${kunde?.navn},\n\nDu kan se din regning her: ${fakturaURL}`
  }, { headers: authHeaders });

  setLoadingProgressMessages(prev => [...prev, "✅ Email sendt til kunden"]);

  // await axios.patch(`${import.meta.env.VITE_API_URL}/opgaver/${opgaveID}`, {
  //   fakturaSendt: new Date().toISOString(),
  //   opgaveAfsluttet: new Date().toISOString()
  // }, { headers: authHeaders });

//   setOpgaveAfsluttet(true);
  setSuccessFakturaSubmission(true);
  console.log("✅ Privatkundeflow gennemført");
} catch (err) {
  console.error("❌ Fejl i privatkundeflow:", err);
  setErrorMessage("Kunne ikke opdatere opgavens status. Prøv igen.");
  setSuccessFakturaSubmission(false);
} finally {
  setLoadingFakturaSubmission(false);
}
} catch (err) {
  console.error("❌ Fejl i privatkundeflow:", err);
  setErrorMessage("Kunne ikke opdatere opgavens status. Prøv igen.");
  setSuccessFakturaSubmission(false);
} finally {
  setLoadingFakturaSubmission(false);
}
}

export default sendFaktura;