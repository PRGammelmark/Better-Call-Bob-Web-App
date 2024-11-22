import axios from "axios";
import dayjs from "dayjs";
import useEconomicLines from "./useEconomicLines.js";

const useBetalMedMobilePayAnmodning = (user, opgave, opgaveID, posteringer, setOpgaveAfsluttet) => {

    console.log("Betaling med Mobile Pay igangsættes.")
    
    const authHeaders = {
        'Authorization': `Bearer ${user.token}`
    }

    // REQUEST SERVER TO GET ACCESS TOKEN
    axios.post(`${import.meta.env.VITE_API_URL}/mobilepay/initiate-mobilepay-payment`, {}, {
        headers: {
            'Authorization': `Bearer ${user.token}`
        }
    })
    .then(response => {
        console.log(response.data);
        return response.data.redirectUrl
    })
    .catch(error => {
        console.error('Error getting access token from MobilePay: ', error);
    });
    
    // const economicHeaders = {
    //     'Content-Type': 'application/json',
    //     'X-AppSecretToken': import.meta.env.VITE_BCBSECRETTOKEN,
    //     'X-AgreementGrantToken': import.meta.env.VITE_BCBAGREEMENTGRANTTOKEN
    // }
    
    // // Importer linjer til faktura fra posteringer
    // const economicLines = useEconomicLines(posteringer, vilBetaleMedMobilePay);


    // // ===== BETALINGSFLOW =====

    // // 1) -> OPRET NY KUNDE 
    // // 2) -> OPRET FAKTURAKLADDE 
    // // 3) -> BOOK FAKTURA 
    // // 4) -> MARKER OPGAVE SOM AFSLUTTET
    // // 5) -> LAGR FAKTURA PDF I DB
    // // 6) -> SEND SMS MED LINK TIL FAKTURA


    // // 1) -> OPRET NY KUNDE
    // axios.post('https://restapi.e-conomic.com/customers', {
    //     name: opgave.navn ? opgave.navn : "Intet navn oplyst",
    //     address: opgave.adresse ? opgave.adresse : "Ingen adresse oplyst",
    //     email: opgave.email ? opgave.email : null,
    //     vatZone: {
    //         vatZoneNumber: 1
    //     },
    //     currency: "DKK",
    //     customerGroup: {
    //         customerGroupNumber: 1
    //     },
    //     paymentTerms: {
    //         paymentTermsNumber: 1,
    //         daysOfCredit: 8,
    //         name: "Netto 8 dage",
    //         paymentTermsType: "net"
    //     }
    // },{
    //     headers: economicHeaders
    // })
    // .then(response => {
    //     console.log("Kunde oprettet.");

    //     // 2) -> OPRET FAKTURAKLADDE ================================
    //     axios.post('https://restapi.e-conomic.com/invoices/drafts', {
    //         date: dayjs().format("YYYY-MM-DD"),
    //         currency: "DKK",
    //         customer: {
    //             customerNumber: response.data.customerNumber
    //         },
    //         paymentTerms: {
    //             paymentTermsNumber: 1,
    //             daysOfCredit: 8,
    //             name: "Netto 8 dage",
    //             paymentTermsType: "net"
    //         },
    //         layout: {
    //             layoutNumber: 3
    //         },
    //         recipient: {
    //             name: `${opgave.navn}`,
    //             address: `${opgave.adresse}`,
    //             city: `${opgave.postnummerOgBy ? opgave.postnummerOgBy : "1000 København"}`,
    //             country: "Danmark",
    //             vatZone: {
    //                 name: "Domestic",
    //                 vatZoneNumber: 1,
    //                 enabledForCustomer: true,
    //                 enabledForSupplier: true
    //             }
    //         },
    //         lines: economicLines
    //     },{
    //         headers: economicHeaders
    //     })
    //     .then(response => {
    //         console.log("Fakturakladde oprettet.");

    //         // 3) -> BOOK FAKTURA ================================
    //         axios.post('https://restapi.e-conomic.com/invoices/booked', {
    //             draftInvoice: {
    //                 draftInvoiceNumber: response.data.draftInvoiceNumber
    //             }
    //         }, {
    //             headers: economicHeaders
    //         })
    //         .then(response => {
    //             console.log("Faktura booket.");

    //             // 4) -> MARKER OPGAVE SOM AFSLUTTET ================================
    //             axios.patch(`${import.meta.env.VITE_API_URL}/opgaver/${opgaveID}`, {
    //                 opgaveAfsluttet: true
    //             }, {
    //                 headers: authHeaders
    //             })
    //             .then(res => {
    //                 setOpgaveAfsluttet(true);
    //                 console.log("Opgaven markeret som afsluttet.")
    //             })
    //             .catch(error => {
    //                 console.log("Fejl: Opgaven blev ikke markeret som afsluttet.")
    //                 console.log(error)
    //             })
                
    //             // 5) -> LAGR FAKTURA PDF I DB ================================
    //             axios.get(response.data.pdf.download, {
    //                 responseType: 'blob',
    //                 headers: economicHeaders
    //             })
    //             .then(fakturaPDF => {
    //                 const reader = new FileReader();
    //                 reader.readAsDataURL(new Blob([fakturaPDF.data]));
    //                 reader.onloadend = function() {
    //                     const base64data = reader.result;
                        
    //                     axios.patch(`${import.meta.env.VITE_API_URL}/opgaver/${opgaveID}`, {
    //                         fakturaPDF: base64data
    //                     }, {
    //                         headers: authHeaders
    //                     })
    //                     .then(response => {
    //                         console.log("Faktura-PDF'en gemt i databasen i base64-format.");
    //                     })
    //                     .catch(error => {
    //                         console.log("Fejl: Kunne ikke lagre faktura PDF i databasen.");
    //                         console.log(error);
    //                     });

    //                 // 6) -> LAGR FAKTURA PDF I SERVER-MAPPE ================================
    //                 const fakturaBlob = new Blob([fakturaPDF.data], { type: 'application/pdf' });
    //                 const formData = new FormData();
    //                 formData.append('file', fakturaBlob, `faktura_${opgaveID}.pdf`);

    //                 axios.post(`${import.meta.env.VITE_API_URL}/fakturaer`, formData, {
    //                     headers: {
    //                         'Authorization': `Bearer ${user.token}`,
    //                         'Content-Type': 'multipart/form-data'
    //                     }
    //                 })
    //                 .then(response => {
    //                     console.log("Faktura PDF uploadet til server-mappen.");
    //                     axios.patch(`${import.meta.env.VITE_API_URL}/opgaver/${opgaveID}`, {
    //                         fakturaPDFUrl: response.data.filePath
    //                     }, {
    //                         headers: authHeaders
    //                     })
    //                     .then(response => {
    //                         console.log("Faktura PDF-URL'en gemt i databasen.");
    //                         console.log(response.data);
    //                         opgave.fakturaPDFUrl = response.data.fakturaPDFUrl;
    //                         const fullFakturaPDFUrl = `${import.meta.env.VITE_API_URL}${opgave.fakturaPDFUrl}`;

    //                         // 6) -> SEND SMS MED LINK TIL FAKTURA ================================
    //                         if (opgave.telefon && String(opgave.telefon).length === 8) {
    //                             const smsData = {
    //                                 "messages": [
    //                                     {
    //                                         "to": `${opgave.telefon}`,
    //                                         "countryHint": "45",
    //                                         "respectBlacklist": true,
    //                                         "text": `Kære ${opgave.navn},\n\nTak fordi du valgte at være kunde hos Better Call Bob.\n\nDu kan se din regning her: ${fullFakturaPDFUrl}\n\nVi glæder os til at hjælpe dig igen! \n\nDbh.,\nBob`,
    //                                         "from": "Bob",
    //                                         "flash": false,
    //                                         "encoding": "gsm7"
    //                                     }
    //                                 ]
    //                             }

    //                             axios.post(`${import.meta.env.VITE_API_URL}/sms/send-sms`, { smsData }, {
    //                                 headers: {
    //                                     'Authorization': `Bearer ${user.token}`
    //                                 }
    //                             })
    //                             .then(response => {
    //                                 console.log("SMS sent to customer.");
    //                                 console.log(response.data);
    //                             })
    //                             .catch(error => {
    //                                 console.log("Error: Could not send SMS to customer.");
    //                                 console.log(error);
    //                             });
    //                         } else {
    //                             console.log("Intet gyldigt telefonnummer fundet for kunden – SMS ikke sendt.")
    //                         }
    //                         // ==================================================
    //                     })
    //                     .catch(error => {
    //                         console.log("Fejl: Kunne ikke lagre faktura PDF URL i databasen.");
    //                         console.log(error);
    //                     });
    //                 })
    //                 .catch(error => {
    //                     console.log("Fejl: Kunne ikke uploade faktura PDF til server-mappen.");
    //                     console.log(error);
    //                 });
    //                 }
    //             })
    //             .catch(error => {
    //                 console.log("Fejl: Faktura-PDF er ikke blevet gemt i databasen.");
    //                 console.log(error);
    //             });
    //             // ============== LAGR FAKTURA I DB ==============
    //         })
    //         .catch(error => {
    //             console.log("Fejl: Faktura blev ikke booket.")
    //             console.log(error)
    //         });
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
}

export default useBetalMedMobilePayAnmodning;