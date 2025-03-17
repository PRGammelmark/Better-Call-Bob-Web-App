import axios from "axios";
import dayjs from "dayjs";
import useEconomicLines from "./useEconomicLines.js";
import { storage } from '../firebase.js'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'

const useBetalMedFaktura = (user, opgave, setOpgave, opgaveID, posteringer, setOpgaveAfsluttet, alternativEmail, setLoadingFakturaSubmission, setSuccessFakturaSubmission, bekræftAdmGebyr) => {

    const authHeaders = {
        'Authorization': `Bearer ${user.token}`
    }
    
    const economicHeaders = {
        'Content-Type': 'application/json',
        'X-AppSecretToken': import.meta.env.VITE_BCBSECRETTOKEN,
        'X-AgreementGrantToken': import.meta.env.VITE_BCBAGREEMENTGRANTTOKEN
    }
    
    // Importer linjer til faktura fra posteringer
    const economicLines = useEconomicLines(posteringer, bekræftAdmGebyr);

    const cvrNummer = opgave.CVR ? ("corporateIdentificationNumber: opgave.CVR") : "";

    const nyKundeObject = {
        name: opgave.navn ? opgave.navn : "Intet navn oplyst",
        address: opgave.adresse ? opgave.adresse : "Ingen adresse oplyst",
        email: alternativEmail ? alternativEmail : opgave.email ? opgave.email : null,
        vatZone: {
            vatZoneNumber: 1
        },
        cvrNummer,
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
    // 3) -> BOOK FAKTURA 
    // 4) -> MARKER OPGAVE SOM AFSLUTTET
    // 5) -> LAGR FAKTURA PDF I DB
    // 6) -> SEND SMS TIL KUNDEN MED LINK TIL FAKTURA
    // 7) -> SEND EMAIL TIL KUNDEN MED LINK TIL FAKTURA (KOMMENTERET UD FOR NU)


    // 1) -> OPRET NY KUNDE
    axios.post('https://restapi.e-conomic.com/customers', {
        name: opgave.navn ? opgave.navn : "Intet navn oplyst",
        address: opgave.adresse ? opgave.adresse : "Ingen adresse oplyst",
        email: alternativEmail ? alternativEmail : opgave.email ? opgave.email : null,
        vatZone: {
            vatZoneNumber: 1
        },
        // corporateIdentificationNumber: opgave.CVR ? opgave.CVR : null,
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
    },{
        headers: economicHeaders
    })
    .then(response => {
        console.log("Kunde oprettet.");

        // 2) -> OPRET FAKTURAKLADDE ================================
        axios.post('https://restapi.e-conomic.com/invoices/drafts', {
            date: dayjs().format("YYYY-MM-DD"),
            currency: "DKK",
            customer: {
                customerNumber: response.data.customerNumber
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
                name: `${opgave.navn}`,
                address: `${opgave.adresse}`,
                city: `${opgave.postnummerOgBy ? opgave.postnummerOgBy : "1000 København"}`,
                country: "Danmark",
                vatZone: {
                    name: "Domestic",
                    vatZoneNumber: 1,
                    enabledForCustomer: true,
                    enabledForSupplier: true
                }
            },
            lines: economicLines
        },{
            headers: economicHeaders
        })
        .then(response => {
            console.log("Fakturakladde oprettet.");

            // 3) -> BOOK FAKTURA ================================
            axios.post('https://restapi.e-conomic.com/invoices/booked', {
                draftInvoice: {
                    draftInvoiceNumber: response.data.draftInvoiceNumber
                }
            }, {
                headers: economicHeaders
            })
            .then(response => {
                console.log("Faktura booket.");

                // 4) -> MARKER FAKTURA SOM SENDT ================================
                axios.patch(`${import.meta.env.VITE_API_URL}/opgaver/${opgaveID}`, {
                    fakturaSendt: new Date().toISOString()
                }, {
                    headers: authHeaders
                })
                .then(res => {
                    console.log("Faktura markeret som sendt.")
                })
                .catch(error => {
                    console.log("Fejl: Faktura blev ikke markeret som sendt.")
                    console.log(error)
                })
                
                // 5) -> LAGR FAKTURA PDF I FIREBASE ================================
                axios.get(response.data.pdf.download, {
                    responseType: 'blob',
                    headers: economicHeaders
                })
                .then(fakturaPDF => {
                    uploadFakturaToFirebase(fakturaPDF, opgaveID)
                    .then(fakturaURL => {
                        axios.patch(`${import.meta.env.VITE_API_URL}/opgaver/${opgaveID}`, {
                            fakturaPDFUrl: fakturaURL
                        }, {
                            headers: authHeaders
                        })
                        .then(response => {
                            console.log("Faktura PDF-URL'en genereret.");

                            // 6) -> SEND SMS MED LINK TIL FAKTURA ================================
                            if (opgave.telefon && String(opgave.telefon).length === 8) {
                                const smsData = {
                                    "messages": [
                                        {
                                            "to": `${opgave.telefon}`,
                                            "countryHint": "45",
                                            "respectBlacklist": true,
                                            "text": `Kære ${opgave.navn},\n\nTak fordi du valgte at være kunde hos Better Call Bob.\n\nDu kan se din regning her: ${fakturaURL}\n\nVi glæder os til at hjælpe dig igen! \n\nDbh.,\nBob`,
                                            "from": "Bob",
                                            "flash": false,
                                            "encoding": "gsm7"
                                        }
                                    ]
                                }

                                axios.post(`${import.meta.env.VITE_API_URL}/sms/send-sms`, { smsData }, {
                                    headers: {
                                        'Authorization': `Bearer ${user.token}`
                                    }
                                })
                                .then(response => {
                                    console.log("SMS sendt til kunden.");
                                    setLoadingFakturaSubmission(false);
                                    setSuccessFakturaSubmission(true);

                                    // 7) -> RELOAD OPGAVE ================================
                                    axios.patch(`${import.meta.env.VITE_API_URL}/opgaver/${opgaveID}`, {
                                        opgaveAfsluttet: new Date().toISOString()
                                    }, {
                                        headers: authHeaders
                                    })
                                    .then(response => {
                                        setOpgave(response.data)
                                    })
                                    .catch(error => {
                                        console.log("Fejl: Kunne ikke genindlæse opgaven.");
                                        console.log(error);
                                    });
                                })
                                .catch(error => {
                                    console.log("Error: Could not send SMS to customer.");
                                    console.log(error);
                                });
                            } else {
                                console.log("Intet gyldigt telefonnummer fundet for kunden – SMS ikke sendt.")
                            }

                            // 7) -> SEND EMAIL MED LINK TIL FAKTURA ==================================================
                            axios.post(`${import.meta.env.VITE_API_URL}/send-email`, {
                                to: alternativEmail ? alternativEmail : opgave.email,
                                subject: `Faktura fra Better Call Bob`,
                                body: `Kære ${opgave.navn},\n\nTak fordi du valgte at være kunde hos Better Call Bob.\n\nDu kan se din faktura her: ${fakturaURL}\n\nVi glæder os til at hjælpe dig igen! \n\nDbh.,\nBob`
                            }, {
                                headers: {
                                    'Authorization': `Bearer ${user.token}`
                                }
                            })
                            .then(response => {
                                console.log("Email sendt til kunden.");
                                setLoadingFakturaSubmission(false);
                                setSuccessFakturaSubmission(true);
                            })
                            .catch(error => {
                                console.log("Fejl: Kunne ikke sende email til kunden.");
                                console.log(error);
                            })
                        });
                    })
                    .catch(error => {
                        console.log("Fejl: Kunne ikke uploade faktura PDF til server-mappen.");
                        console.log(error);
                    });
                    }
                )
                .catch(error => {
                    console.log("Fejl: Faktura-PDF er ikke blevet gemt i databasen.");
                    console.log(error);
                });
                // ============== LAGR FAKTURA I DB ==============
            })
            .catch(error => {
                console.log("Fejl: Faktura blev ikke booket.")
                console.log(error)
            });
        })
        .catch(error => {
            console.log("Fejl: Fakturakladde blev ikke oprettet.")
            console.log(error)
        });
    })
    .catch(error => {
        console.log("Fejl: Kunde blev ikke oprettet.")
        console.log(error)
    });
}

export default useBetalMedFaktura;