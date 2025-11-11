import axios from "axios";
import dayjs from "dayjs";
import useEconomicLines from "./useEconomicLines.js";
import { storage } from '../firebase.js'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import nyNotifikation from "../utils/nyNotifikation.js";

const useBetalMedFaktura = async (user, opgave, setOpgave, opgaveID, kunde, posteringer, setOpgaveAfsluttet, alternativEmail, setLoadingFakturaSubmission, setSuccessFakturaSubmission, inklAdministrationsGebyr, isEnglish, setErrorMessage) => {

    const authHeaders = {
        'Authorization': `Bearer ${user.token}`
    }
    
    const economicHeaders = {
        'Content-Type': 'application/json',
        'X-AppSecretToken': import.meta.env.VITE_BCBSECRETTOKEN,
        'X-AgreementGrantToken': import.meta.env.VITE_BCBAGREEMENTGRANTTOKEN
    }

    // Importer linjer til faktura fra posteringer
    const economicLines = useEconomicLines(posteringer, inklAdministrationsGebyr, isEnglish);

    const cvrNummer = kunde?.CVR ? ("corporateIdentificationNumber: kunde?.CVR") : "";
    const erErhvervskunde = kunde?.CVR || kunde?.virksomhed;

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

    const uploadFakturaToFirebase = (fakturaPDF, opgaveID) => {
        const fakturaBlob = new Blob([fakturaPDF.data], { type: 'application/pdf' });
        const storageRef = ref(storage, `fakturaer/faktura_${opgaveID}.pdf`);
    
        return uploadBytes(storageRef, fakturaBlob)
            .then(() => getDownloadURL(storageRef)) // Get the file URL
            .then((downloadURL) => {
                console.log("File uploaded. URL:", downloadURL);
                return downloadURL; // Return the URL
            })
            .catch((error) => {
                console.error("Upload error:", error);
                throw error;
            });
    };


    // ===== BETALINGSFLOW =====

    // 1) -> OPRET NY KUNDE 
    // 2) -> OPRET FAKTURAKLADDE 

    // ERHVERVSKUNDEFLOW
    // 3) -> SEND NOTIFIKATIONSMAIL & PUSH-NOTIFIKATION TIL ADMIN
    // 4) -> MARKER FAKTURA SOM SENDT, AFSLUT OPGAVE & GENINDLÆS OPGAVE
    // 5) -> MARKER FAKTURA SENDT, AFSLUT OPGAVE & GENINDLÆS OPGAVE

    // PRIVATKUNDEFLOW
    // 3) -> BOOK FAKTURA 
    // 4) -> LAGR FAKTURA PDF I FIREBASE
    // 5) -> SEND SMS MED LINK TIL FAKTURA
    // 6) -> SEND EMAIL MED LINK TIL FAKTURA
    // 7) -> MARKER FAKTURA SENDT, AFSLUT OPGAVE & GENINDLÆS OPGAVE


    // 1) -> OPRET NY KUNDE
    // axios.post('https://restapi.e-conomic.com/customers', nyKundeObject, {
    //     headers: economicHeaders
    // })
    // .then(response => {
    //     console.log("Kunde oprettet.");

    //     // 2) -> OPRET FAKTURAKLADDE ================================
    //     axios.post('https://restapi.e-conomic.com/invoices/drafts', nyfakturakladdeObject(response), {
    //         headers: economicHeaders
    //     })
    //     .then(response => {
    //         console.log("Fakturakladde oprettet.");

    //         // ERHVERVSKUNDEFLOW
    //         if(kunde?.CVR || kunde?.virksomhed){

    //             console.log("Starter erhvervskundeflow ...")

    //             // SEND NOTIFIKATIONSEMAIL TIL REGNSKABSANSVARLIG
    //             axios.post(`${import.meta.env.VITE_API_URL}/send-email`, {
    //                 to: "hej@bettercallbob.dk",
    //                 subject: `Ny fakturakladde i Economic`,
    //                 body: `Hej 👋\n\nEn erhvervskunde har fået færdiggjort en opgave, og der er derfor blevet oprettet en ny fakturakladde i Economic. Fakturaen er IKKE blevet sendt til kunden endnu. \n\nInformationer om kunden:\n\n Navn: ${kunde?.navn} \n Virksomhed: ${kunde?.virksomhed} \n CVR: ${kunde?.CVR} \n Opgavebeskrivelse: ${opgave?.opgaveBeskrivelse} \n\n Gå ind i dit regnskabssystem, og bekræft data og satser i fakturaen før du sender den videre. \n\n Dbh.,\n App-robotten 🤖`
    //             }, {
    //                 headers: {
    //                     'Authorization': `Bearer ${user.token}`
    //                 }
    //             })
    //             .then(response => {
    //                 console.log("Email sendt til regnskabsansvarlig.");

    //                 // ===== SEND PUSH-NOTIFIKATION TIL ADMIN =====
    //                 nyNotifikation(user, "admin", "Ny fakturakladde i Economic", `En erhvervskunde har fået færdiggjort en opgave, og der er derfor blevet oprettet en ny fakturakladde i Economic.`, `/opgave/${opgaveID}`)

    //                 setLoadingFakturaSubmission(false);
    //                 setSuccessFakturaSubmission(true);
    //             })
    //             .catch(error => {
    //                 console.log("Fejl: Kunne ikke sende email til regnskabsansvarlig.");
    //                 console.log(error);
    //             })
    //             setLoadingFakturaSubmission(false);
    //             setSuccessFakturaSubmission(true);

    //             // MARKER FAKTURA SOM SENDT, AFSLUT OPGAVE & GENINDLÆS OPGAVE ================================
    //             axios.patch(`${import.meta.env.VITE_API_URL}/opgaver/${opgaveID}`, {
    //                 fakturaSendt: new Date().toISOString(),
    //                 opgaveAfsluttet: new Date().toISOString()
    //             }, {
    //                 headers: authHeaders
    //             })
    //             .then(response => {
    //                 console.log("Faktura sendt, opgave afsluttet og genindlæst.")
    //                 setOpgave(response.data)
    //             })
    //             .catch(error => {
    //                 console.log("Fejl: Kunne ikke markere opgave som afsluttet eller genindlæse opgaven.");
    //                 console.log(error);
    //             });
    //         }

    //         // PRIVATKUNDEFLOW
    //         if(!(kunde?.CVR || kunde?.virksomhed)) {

    //             console.log("Starter privatkundeflow ...")

    //             // 3) -> BOOK FAKTURA ================================
    //             axios.post('https://restapi.e-conomic.com/invoices/booked', {
    //                 draftInvoice: {
    //                     draftInvoiceNumber: response.data.draftInvoiceNumber
    //                 }
    //             }, {
    //                 headers: economicHeaders
    //             })
    //             .then(response => {
    //                 console.log("Faktura booket.");

    //                 // ===== SEND PUSH-NOTIFIKATION TIL ADMIN =====
    //                 nyNotifikation(user, "admin", "Ny faktura oprettet", `En privatkunde har fået færdiggjort en opgave, og der er blevet oprettet en ny faktura.`, `/opgaver/${opgaveID}`)

    //                 // 4) -> LAGR FAKTURA PDF I FIREBASE ================================
    //                 axios.get(response.data.pdf.download, {
    //                     responseType: 'blob',
    //                     headers: economicHeaders
    //                 })
    //                 .then(fakturaPDF => {
    //                     uploadFakturaToFirebase(fakturaPDF, opgaveID)
    //                     .then(fakturaURL => {
    //                         axios.patch(`${import.meta.env.VITE_API_URL}/opgaver/${opgaveID}`, {
    //                             fakturaPDFUrl: fakturaURL
    //                         }, {
    //                             headers: authHeaders
    //                         })
    //                         .then(response => {
    //                             console.log("Faktura PDF-URL'en genereret.");

    //                             // 5) -> SEND SMS MED LINK TIL FAKTURA ================================
    //                             if (kunde?.telefon && String(kunde?.telefon).length === 8) {
    //                                 const smsData = {
    //                                     "messages": [
    //                                         {
    //                                             "to": `${kunde?.telefon}`,
    //                                             "countryHint": "45",
    //                                             "respectBlacklist": true,
    //                                             "text": `${isEnglish ? `Dear ${kunde?.navn},\n\nThank you for being a customer at Better Call Bob.\n\nYou can see your invoice here: ${fakturaURL}\n\nWe look forward to helping you again! \n\nBest regards,\nBob` : `Kære ${kunde?.navn},\n\nTak fordi du valgte at være kunde hos Better Call Bob.\n\nDu kan se din regning her: ${fakturaURL}\n\nVi glæder os til at hjælpe dig igen! \n\nDbh.,\nBob`}`,
    //                                             "from": "Bob",
    //                                             "flash": false,
    //                                             "encoding": "gsm7"
    //                                         }
    //                                     ]
    //                                 }

    //                                 axios.post(`${import.meta.env.VITE_API_URL}/sms/send-sms`, { smsData }, {
    //                                     headers: {
    //                                         'Authorization': `Bearer ${user.token}`
    //                                     }
    //                                 })
    //                                 .then(response => {
    //                                     console.log("SMS sendt til kunden.");
    //                                 })
    //                                 .catch(error => {
    //                                     console.log("Error: Could not send SMS to customer.");
    //                                     console.log(error);
    //                                 });
    //                             } else {
    //                                 console.log("Intet gyldigt telefonnummer fundet for kunden – SMS ikke sendt.")
    //                             }

    //                             // 6) -> SEND EMAIL MED LINK TIL FAKTURA ==================================================
    //                             axios.post(`${import.meta.env.VITE_API_URL}/send-email`, {
    //                                 to: alternativEmail ? alternativEmail : kunde?.email,
    //                                 subject: `${isEnglish ? "Invoice from Better Call Bob" : "Faktura fra Better Call Bob"}`,
    //                                 body: `${isEnglish ? `Dear ${kunde?.navn},\n\nThank you for being a customer at Better Call Bob.\n\nYou can see your invoice here: ${fakturaURL}\n\nWe look forward to helping you again! \n\nBest regards,\nBob` : `Kære ${kunde?.navn},\n\nTak fordi du valgte at være kunde hos Better Call Bob.\n\nDu kan se din regning her: ${fakturaURL}\n\nVi glæder os til at hjælpe dig igen! \n\nDbh.,\nBob`}`
    //                             }, {
    //                                 headers: {
    //                                     'Authorization': `Bearer ${user.token}`
    //                                 }
    //                             })
    //                             .then(response => {
    //                                 console.log("Email sendt til kunden.");
    //                             })
    //                             .catch(error => {
    //                                 console.log("Fejl: Kunne ikke sende email til kunden.");
    //                                 console.log(error);
    //                             })

    //                             setLoadingFakturaSubmission(false);
    //                             setSuccessFakturaSubmission(true);

    //                             // 7) -> MARKER FAKTURA SENDT, AFSLUT OPGAVE & GENINDLÆS OPGAVE ================================
    //                             axios.patch(`${import.meta.env.VITE_API_URL}/opgaver/${opgaveID}`, {
    //                                 fakturaSendt: new Date().toISOString(),
    //                                 opgaveAfsluttet: new Date().toISOString()
    //                             }, {
    //                                 headers: authHeaders
    //                             })
    //                             .then(response => {
    //                                 console.log("Faktura sendt, opgave afsluttet og genindlæst.")
    //                                 setOpgave(response.data)
    //                             })
    //                             .catch(error => {
    //                                 console.log("Fejl: Kunne ikke genindlæse opgaven.");
    //                                 console.log(error);
    //                             });
    //                         });
    //                     })
    //                     .catch(error => {
    //                         console.log("Fejl: Kunne ikke uploade faktura PDF til server-mappen.");
    //                         console.log(error);
    //                     });
    //                     }
    //                 )
    //                 .catch(error => {
    //                     console.log("Fejl: Faktura-PDF er ikke blevet gemt i databasen.");
    //                     console.log(error);
    //                 });
    //                 // ============== LAGR FAKTURA I DB ==============
    //             })
    //             .catch(error => {
    //                 console.log("Fejl: Faktura blev ikke booket.")
    //                 console.log(error)
    //             })
    //         }
    //     })
    //     .catch(error => {
    //         console.log("Fejl: Fakturakladde blev ikke oprettet.")
    //         console.log(error)
    //     });
    // })
    // .catch(error => {
    //     console.log("Fejl: Kunde blev ikke oprettet.")
    //     console.log(error)
    // });

// =================================================== V2 ===================================================

//     setLoadingFakturaSubmission(true);

//   try {
//     // 1. Opret kunde
//     const kundeResponse = await axios.post('https://restapi.e-conomic.com/customers', nyKundeObject, { headers: economicHeaders });
//     console.log("Kunde oprettet");

//     // 2. Opret fakturakladde
//     const kladdeResponse = await axios.post('https://restapi.e-conomic.com/invoices/drafts', nyfakturakladdeObject(kundeResponse.data.customerNumber), { headers: economicHeaders });
//     console.log("Fakturakladde oprettet");

    
//     if (erErhvervskunde) {
//     // ERHVERVSKUNDEFLOW ================================
//       console.log("Erhvervskundeflow starter");

//       // NOTIFIKATIONER
//       nyNotifikation(user, "admin", "Ny fakturakladde i Economic", `Fakturakladde oprettet for erhvervskunde.`, `/opgave/${opgaveID}`);

//       await axios.post(`${import.meta.env.VITE_API_URL}/send-email`, {
//         to: "hej@bettercallbob.dk",
//         subject: `Ny fakturakladde i Economic`,
//         body: `Hej 👋\n\nDer er blevet oprettet en ny fakturakladde i Economic.\n\nNavn: ${kunde?.navn}\nVirksomhed: ${kunde?.virksomhed}\nCVR: ${kunde?.CVR}\nOpgave: ${opgave?.opgaveBeskrivelse}`
//       }, { headers: authHeaders });

//       // MARKER FAKTURA SOM SENDT & AFSLUT OPGAVE
//       await axios.patch(`${import.meta.env.VITE_API_URL}/opgaver/${opgaveID}`, {
//         fakturaSendt: new Date().toISOString(),
//         opgaveAfsluttet: new Date().toISOString()
//       }, { headers: authHeaders });

//       // AFSLUT OPGAVE STATE
//       setOpgaveAfsluttet(true);

//     } else {
//       // PRIVATKUNDEFLOW ================================
//       console.log("Privatkundeflow starter");

//       const bookingResponse = await axios.post('https://restapi.e-conomic.com/invoices/booked', {
//         draftInvoice: { draftInvoiceNumber: kladdeResponse.data.draftInvoiceNumber }
//       }, { headers: economicHeaders });

//       nyNotifikation(user, "admin", "Ny faktura oprettet", `Privatkunde har fået oprettet faktura.`, `/opgave/${opgaveID}`);

//       const fakturaPDF = await axios.get(bookingResponse.data.pdf.download, {
//         responseType: 'blob',
//         headers: economicHeaders
//       });

//       const fakturaURL = await uploadFakturaToFirebase(fakturaPDF, opgaveID);

//       await axios.patch(`${import.meta.env.VITE_API_URL}/opgaver/${opgaveID}`, {
//         fakturaPDFUrl: fakturaURL
//       }, { headers: authHeaders });

//       // Send SMS hvis muligt
//       if (kunde?.telefon && String(kunde?.telefon).length === 8) {
//         await axios.post(`${import.meta.env.VITE_API_URL}/sms/send-sms`, {
//           smsData: {
//             messages: [{
//               to: `${kunde?.telefon}`,
//               countryHint: "45",
//               respectBlacklist: true,
//               text: isEnglish
//                 ? `Dear ${kunde?.navn},\n\nThank you for being a customer at Better Call Bob.\n\nYou can see your invoice here: ${fakturaURL}`
//                 : `Kære ${kunde?.navn},\n\nDu kan se din regning her: ${fakturaURL}`,
//               from: "Bob",
//               flash: false,
//               encoding: "gsm7"
//             }]
//           }
//         }, { headers: authHeaders });
//         console.log("SMS sendt");
//       }

//       // Send e-mail
//       await axios.post(`${import.meta.env.VITE_API_URL}/send-email`, {
//         to: alternativEmail || kunde?.email,
//         subject: isEnglish ? "Invoice from Better Call Bob" : "Faktura fra Better Call Bob",
//         body: isEnglish
//           ? `Dear ${kunde?.navn},\n\nYou can see your invoice here: ${fakturaURL}`
//           : `Kære ${kunde?.navn},\n\nDu kan se din regning her: ${fakturaURL}`
//       }, { headers: authHeaders });

//       await axios.patch(`${import.meta.env.VITE_API_URL}/opgaver/${opgaveID}`, {
//         fakturaSendt: new Date().toISOString(),
//         opgaveAfsluttet: new Date().toISOString()
//       }, { headers: authHeaders });

//       setOpgaveAfsluttet(true);
//     }

//     setSuccessFakturaSubmission(true);
//   } catch (err) {
//     console.error("Fejl under faktura-flow:", err);
//     setSuccessFakturaSubmission(false);
//   } finally {
//     setLoadingFakturaSubmission(false);
//   }

// }

// =================================================== V3 ===================================================

setLoadingFakturaSubmission(true);

let kundeResponse, kladdeResponse, bookingResponse, fakturaPDF, fakturaURL;

try {
  // 1. Opret kunde
  kundeResponse = await axios.post('https://restapi.e-conomic.com/customers', nyKundeObject, { headers: economicHeaders });
  console.log("✅ Kunde oprettet");
} catch (err) {
  console.error("❌ Kunde kunne ikke oprettes:", err);
  setErrorMessage("Fejl i oprettelse af kunde. Prøv igen.");
  setSuccessFakturaSubmission(false);
  setLoadingFakturaSubmission(false);
  return;
}

try {
  // 2. Opret fakturakladde
  kladdeResponse = await axios.post('https://restapi.e-conomic.com/invoices/drafts', nyfakturakladdeObject(kundeResponse.data.customerNumber), { headers: economicHeaders });
  console.log("✅ Fakturakladde oprettet");
} catch (err) {
  console.error("❌ Fakturakladde kunne ikke oprettes:", err);
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

    await axios.patch(`${import.meta.env.VITE_API_URL}/opgaver/${opgaveID}`, {
      fakturaSendt: new Date().toISOString(),
      opgaveAfsluttet: new Date().toISOString()
    }, { headers: authHeaders });

    setOpgaveAfsluttet(true);
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
} catch (err) {
  console.error("❌ Faktura kunne ikke bookes:", err);
  setErrorMessage("Kunne ikke booke fakturakladden. Prøv igen.");
  setSuccessFakturaSubmission(false);
  setLoadingFakturaSubmission(false);
  return;
}

// Registrer opkrævninger
try {
  const posteringerTotalPris = posteringer.reduce((acc, postering) => acc + postering.totalPris, 0);
  const posteringerTotalPrisInklMoms = posteringerTotalPris * 1.25; // totalPris is without VAT, need to add 25% VAT
  const alleredeBetaltBeløb = posteringer.reduce((acc, postering) => acc + postering.betalinger?.reduce((acc, betaling) => acc + betaling.betalingsbeløb, 0), 0);
  const administrationsGebyrInklMoms = inklAdministrationsGebyr ? 49 * 1.25 : 0; // Administration fee: 49 DKK excl. VAT = 61.25 DKK incl. VAT
  const restbeløbTilOpkrævning = posteringerTotalPrisInklMoms + administrationsGebyrInklMoms - alleredeBetaltBeløb;

  await axios.post(`${import.meta.env.VITE_API_URL}/faktura-opkraevninger/registrer-opkraevninger`, {
    posteringer: posteringer,
    opkrævningsbeløb: restbeløbTilOpkrævning,
    reference: bookingResponse.data.self,
    metode: "faktura"
  }, { headers: authHeaders });
  console.log("✅ Opkrævninger registreret på posteringer");
} catch (err) {
  console.error("❌ Kunne ikke registrere opkrævning på posteringer:", err);
}

try {
  nyNotifikation(user, "admin", "Ny faktura oprettet", `Privatkunde har fået oprettet faktura.`, `/opgave/${opgaveID}`);

  // Download PDF
  fakturaPDF = await axios.get(bookingResponse.data.pdf.download, {
    responseType: 'blob',
    headers: economicHeaders
  });

  // Upload PDF
  fakturaURL = await uploadFakturaToFirebase(fakturaPDF, opgaveID);

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
  }

  // Send Email
  await axios.post(`${import.meta.env.VITE_API_URL}/send-email`, {
    to: alternativEmail || kunde?.email,
    subject: isEnglish ? "Invoice from Better Call Bob" : "Faktura fra Better Call Bob",
    body: isEnglish
      ? `Dear ${kunde?.navn},\n\nYou can see your invoice here: ${fakturaURL}`
      : `Kære ${kunde?.navn},\n\nDu kan se din regning her: ${fakturaURL}`
  }, { headers: authHeaders });

  await axios.patch(`${import.meta.env.VITE_API_URL}/opgaver/${opgaveID}`, {
    fakturaSendt: new Date().toISOString(),
    opgaveAfsluttet: new Date().toISOString()
  }, { headers: authHeaders });

  setOpgaveAfsluttet(true);
  setSuccessFakturaSubmission(true);
  console.log("✅ Privatkundeflow gennemført");
} catch (err) {
  console.error("❌ Fejl i privatkundeflow:", err);
  setErrorMessage("Kunne ikke opdatere opgavens status. Prøv igen.");
  setSuccessFakturaSubmission(false);
} finally {
  setLoadingFakturaSubmission(false);
}
}

export default useBetalMedFaktura;