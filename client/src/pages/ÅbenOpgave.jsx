import React from 'react'
import ÅbenOpgaveCSS from './ÅbenOpgave.module.css'
import PageAnimation from '../components/PageAnimation'
import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect, useReducer } from 'react'
import BackIcon from "../assets/back.svg"
import Paperclip from "../assets/paperclip.svg"
import axios from "axios"
import dayjs from 'dayjs'
import { useAuthContext } from '../hooks/useAuthContext'
import Modal from '../components/Modal.jsx'
import ÅbenOpgaveCalendar from '../components/traditionalCalendars/ÅbenOpgaveCalendar.jsx'
import { useTaskAndDate } from '../context/TaskAndDateContext.jsx'
import { useBesøg } from '../context/BesøgContext.jsx'
import ModalCSS from '../components/Modal.module.css'
import OpretRegningModal from '../components/modals/OpretRegningModal.jsx'
import OpretFakturaModal from '../components/modals/OpretFakturaModal.jsx'
import useBetalMedFaktura from '../hooks/useBetalMedFaktura.js'
import RegistrerBetalFakturaModal from '../components/modals/RegistrerBetalFakturaModal.jsx'
import PhoneIcon from "../assets/phone.svg"
import MailIcon from "../assets/mail.svg"
import SmsIcon from "../assets/smsIcon.svg"
import CloseIcon from "../assets/closeIcon.svg"
import SwitcherStyles from './Switcher.module.css'
import satser from '../variables'
import AddPostering from '../components/modals/AddPostering.jsx'
import PosteringSatserModal from '../components/modals/PosteringSatserModal.jsx'
import RedigerPostering from '../components/modals/RedigerPostering.jsx'
import AfslutUdenBetaling from '../components/modals/AfslutUdenBetaling.jsx'
import RegistrerBetalingsModal from '../components/modals/RegistrerBetalingsModal.jsx'

const ÅbenOpgave = () => {
    
    const navigate = useNavigate();
    const { opgaveID } = useParams();
    const {user} = useAuthContext();
    
    if (!user) {
        return
    }

    // state managers
    const { egneLedigeTider, alleLedigeTider, egneBesøg, alleBesøg, setEgneLedigeTider, setEgneBesøg, refetchLedigeTider, refetchBesøg, setRefetchLedigeTider, setRefetchBesøg, setAlleLedigeTider, setAlleBesøg, userID } = useBesøg();
    const [opgave, setOpgave] = useState(null);
    const [loading, setLoading] = useState(true);
    const [opgaveBeskrivelse, setOpgaveBeskrivelse] = useState(null);
    const [updateOpgave, setUpdateOpgave] = useState(false);
    const [status, setStatus] = useState("");
    const [brugere, setBrugere] = useState(null);
    const [nuværendeAnsvarlige, setNuværendeAnsvarlige] = useState(null);
    const [navn, setNavn] = useState("");
    const [adresse, setAdresse] = useState("");
    const [harStige, setHarStige] = useState(false);
    const [telefon, setTelefon] = useState("");
    const [email, setEmail] = useState("");
    const [timer, setTimer] = useState(null);
    const [openModal, setOpenModal] = useState(false);
    const [openCommentModalID, setOpenCommentModalID] = useState(null);
    const [openPosteringModalID, setOpenPosteringModalID] = useState(null);
    const [editedComment, setEditedComment] = useState("");
    const [editedPostering, setEditedPostering] = useState("");
    const [posteringer, setPosteringer] = useState("");
    const [kommentar, setKommentar] = useState("");
    const [kommentarer, setKommentarer] = useState([]);
    const [færdiggjort, setFærdiggjort] = useState(false);
    const [opgaveAfsluttet, setOpgaveAfsluttet] = useState(opgave && opgave.opgaveAfsluttet)
    const [åbnOpretRegningModal, setÅbnOpretRegningModal] = useState(false);
    const [åbnOpretFakturaModal, setÅbnOpretFakturaModal] = useState(false);
    const [ledigeTider, setLedigeTider] = useState(null)
    const [selectedOpgaveDate, setSelectedOpgaveDate] = useState(null)
    const [planlægBesøgFraTidspunkt, setPlanlægBesøgFraTidspunkt] = useState("08:00")
    const [planlægBesøgTilTidspunkt, setPlanlægBesøgTilTidspunkt] = useState("12:00")
    const [planlagteOpgaver, setPlanlagteOpgaver] = useState(null)
    const [triggerPlanlagteOpgaver, setTriggerPlanlagteOpgaver] = useState(false)
    const [smsSendtTilKundenOmPåVej, setSmsSendtTilKundenOmPåVej] = useState("")
    const [sætPåmindelseSMS, setSætPåmindelseSMS] = useState(false)
    const [smsPåmindelseIndstillet, setSmsPåmindelseIndstillet] = useState("")
    const [visKalender, setVisKalender] = useState(false)
    const [opretBesøgError, setOpretBesøgError] = useState("")
    const [triggerLedigeTiderRefetch, setTriggerLedigeTiderRefetch] = useState(false)
    const [kvitteringBillede, setKvitteringBillede] = useState(null)
    const [opgaveLøstTilfredsstillende, setOpgaveLøstTilfredsstillende] = useState(false)
    const [allePosteringerUdfyldt, setAllePosteringerUdfyldt] = useState(false)
    const [vilBetaleMedMobilePay, setVilBetaleMedMobilePay] = useState(false)
    const [invoiceImage, setInvoiceImage] = useState(null)
    const [åbnBetalFakturaModal, setÅbnBetalFakturaModal] = useState(false)
    const { chosenTask, setChosenTask } = useTaskAndDate();
    const initialDate = opgave && opgave.onsketDato ? dayjs(opgave.onsketDato) : null;
    const [selectedDate, setSelectedDate] = useState(initialDate);
    const [, forceUpdate] = useReducer(x => x + 1, 0);
    const [openDialog, setOpenDialog] = useState(false)
    const [eventData, setEventData] = useState(null)
    const [tilknyttetOpgave, setTilknyttetOpgave] = useState(null)
    const [aktueltBesøg, setAktueltBesøg] = useState(null)
    const [sletOpgaveModal, setSletOpgaveModal] = useState(false)
    const [genåbnOpgaveModal, setGenåbnOpgaveModal] = useState(false)
    const [sletOpgaveInput, setSletOpgaveInput] = useState("")
    const [redigerKundeModal, setRedigerKundeModal] = useState(false) 
    const [nyeKundeinformationer, setNyeKundeinformationer] = useState(null)
    const [openPosteringSatser, setOpenPosteringSatser] = useState(null)
    const [tvingAfslutOpgaveModal, setTvingAfslutOpgaveModal] = useState(false)
    const [registrerBetalingsModal, setRegistrerBetalingsModal] = useState(false)
    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API_URL}/brugere`, {
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        })
        .then(res => {
            setBrugere(res.data)
        })
        .catch(error => console.log(error))
    }, [])
    
    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API_URL}/ledige-tider`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            })
            .then(res => {
                setLedigeTider(res.data)
                const filterEgneLedigeTider = res.data.filter((ledigTid) => ledigTid.brugerID === userID)
                setEgneLedigeTider(filterEgneLedigeTider)
            })
            .catch(error => console.log(error))
    }, [triggerLedigeTiderRefetch])

    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API_URL}/besoeg`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            })
            .then(res => {
                setAlleBesøg(res.data)
                const filterEgneBesøg = res.data.filter(opgave => opgave.brugerID === userID)
                setEgneBesøg(filterEgneBesøg)
                const filterOpgaveBesøg = res.data.filter(opgave => opgave.opgaveID === opgaveID);
                setPlanlagteOpgaver(filterOpgaveBesøg);
            })
            .catch(error => console.log(error))
    }, [triggerPlanlagteOpgaver])

    const submitKommentar = () => {
        
        const kommentarObject = {
            kommentarIndhold: kommentar,
            brugerID: userID,
            opgaveID: opgaveID
        }

        axios.post(`${import.meta.env.VITE_API_URL}/kommentarer/`, kommentarObject, {
            headers: {
                'Authorization': `Bearer ${user.token}`
            } 
        })
        .then(res => {
            setKommentar("");
            axios.get(`${import.meta.env.VITE_API_URL}/kommentarer`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            })
            .then(res => {
                const filteredKommentarer = res.data.filter(kommentar => kommentar.opgaveID === opgaveID);
                setKommentarer(filteredKommentarer);
            })
            .catch(error => console.log(error))
            })
            .catch(error => console.log(error))
    }

    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API_URL}/kommentarer`, {
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        })
        .then(res => {
            const filteredKommentarer = res.data.filter(kommentar => kommentar.opgaveID === opgaveID);
            setKommentarer(filteredKommentarer);
        })
        .catch(error => console.log(error))
    }, [])

    useEffect(() => {
        if (opgave && opgave.onsketDato) {
          setSelectedDate(dayjs(opgave.onsketDato));
        }
      }, [opgave]);

    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API_URL}/opgaver/${opgaveID}`, {
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        })
        .then(res => {
            setOpgave(res.data);
            setNyeKundeinformationer(res.data);
            setOpgaveBeskrivelse(res.data.opgaveBeskrivelse);
            setStatus(res.data.status);
            setNavn(res.data.navn);
            setNuværendeAnsvarlige(res.data.ansvarlig)
            setAdresse(res.data.adresse);
            setHarStige(res.data.harStige);
            setTelefon(res.data.telefon);
            setEmail(res.data.email);
            setFærdiggjort(res.data.markeretSomFærdig);
            setOpgaveAfsluttet(res.data.opgaveAfsluttet);
            setLoading(false);
        })
        .catch(error => console.log(error))
    }, [updateOpgave])

    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API_URL}/opgaver/${opgaveID}`, {
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        })
        .then(res => {
            setChosenTask(res.data);
        })
        .catch(error => console.log(error))
    }, [nuværendeAnsvarlige])

    const getBrugerName = (brugerID) => {
        const bruger = brugere && brugere.find(user => user._id === brugerID);
        return bruger ? bruger.navn : 'Unknown User';
    };

    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API_URL}/posteringer`, {
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        })
        .then(res => {
            const filteredPosteringer = res.data.filter(postering => postering.opgaveID === opgaveID);
            setPosteringer(filteredPosteringer);
        })
        .catch(error => console.log(error))
    }, [openModal, openPosteringModalID])

    if (loading) {
        return (
            null
        );
    }

    function opdaterOpgavebeskrivelse(e){
        e.preventDefault();
        setOpgaveBeskrivelse(e.target.value);
        const syncOpgaveBeskrivelse = e.target.value;

        // timer to prevent constant db calls
        if (timer) {
            clearTimeout(timer)
        }

        const newTimer = setTimeout(() => {
            indsendOpgavebeskrivelse(syncOpgaveBeskrivelse);
        }, 500);

        setTimer(newTimer);
    }

    function indsendOpgavebeskrivelse (x) {    
        axios.patch(`${import.meta.env.VITE_API_URL}/opgaver/${opgaveID}`, {
            opgaveBeskrivelse: x
        }, {
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        })
        .then(res => console.log(res.data))
        .catch(error => console.log(error))
    }

    function opdaterOpgavestatus (e) {
        e.preventDefault();
        setStatus(e.target.value);
        if(e.target.value === "Afventer svar"){
            setSætPåmindelseSMS(true);
        } else {
            setSætPåmindelseSMS(false);
        }

        const syncOpgavestatus = e.target.value;
        
        axios.patch(`${import.meta.env.VITE_API_URL}/opgaver/${opgaveID}`, {
            status: syncOpgavestatus
        },{
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        })
        .then(res => console.log(res.data))
        .catch(error => console.log(error))
    }

    const conditionalStyles = {
        backgroundColor: status === "Dato aftalt" ? 'rgba(89, 191, 26, 0.20)' : status === "Afventer svar" ? 'rgba(224, 227, 50, 0.25)' : status === "afvist" ? 'rgba(193, 26, 57, 0.25)' : 'white',
        color: status === "Dato aftalt" ? 'rgba(89, 191, 26, 1)' : status === "Afventer svar" ? 'rgba(179, 116, 0, 0.85)' : status === "afvist" ? 'rgba(193, 26, 57, 1)' : '#59bf1a',
        boxShadow: status === "Dato aftalt" ? 'rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(89, 191, 26, 0.6) 0px 0px 0px 1px' : status === "Afventer svar" ? 'rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(179, 116, 0, 0.26) 0px 0px 0px 1px' : status === "afvist" ? 'rgba(193, 26, 57, 0.16) 0px 10px 36px 0px, rgba(193, 26, 57, 0.46) 0px 0px 0px 1px' : 'rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(89, 191, 26, 0.6) 0px 0px 0px 1px'
    }

    function tildelAnsvar(e){
        e.preventDefault();

        const nyAnsvarligId = e.target.value;
        const nyAnsvarlig = brugere && brugere.find(ansvarlig => ansvarlig._id === nyAnsvarligId);
    
        if (nyAnsvarlig) {
            
            const isAlreadyResponsible = nuværendeAnsvarlige.some(ansvarlig => ansvarlig._id === nyAnsvarlig._id);
        
            if (isAlreadyResponsible) {
                console.log("Denne person er allerede ansvarlig.");
                return; // Exit the function if already responsible
            }

            const opdateretAnsvarlige = [...nuværendeAnsvarlige, nyAnsvarlig];
        
            axios.patch(`${import.meta.env.VITE_API_URL}/opgaver/${opgaveID}`, {
                ansvarlig: opdateretAnsvarlige,
            }, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            })
            .then(res => {
                setNuværendeAnsvarlige(opdateretAnsvarlige);              
            })
            .catch(error => console.log(error));
        }
    }

    function fjernAnsvarlig(ansvarligDerSkalFjernes){
        const opdateredeAnsvarlige = nuværendeAnsvarlige.filter(ansvarlig => ansvarlig !== ansvarligDerSkalFjernes);

        if (window.confirm("Er du sikker på, at du vil fjerne " + ansvarligDerSkalFjernes.navn + " fra opgaven?")) {
            axios.patch(`${import.meta.env.VITE_API_URL}/opgaver/${opgaveID}`, {
                ansvarlig: opdateredeAnsvarlige,
            }, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            })
            .then(res => {
                setNuværendeAnsvarlige(opdateredeAnsvarlige);
                console.log(res.data);
            })
            .catch(error => console.log(error));
        }
    }

    function sletKommentar(kommentarID){
        axios.delete(`${import.meta.env.VITE_API_URL}/kommentarer/${kommentarID}`, {
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        })
        .then(response => {
            setKommentarer(prevKommentarer => 
                prevKommentarer.filter(kommentar => kommentar._id !== kommentarID)
            );
        })
        .catch(error => {
            console.error("Der opstod en fejl ved sletning af kommentaren:", error);
        });
    }

    function sletPostering(posteringID){
        if (window.confirm("Er du sikker på, at du vil slette denne postering?")) {
            const postering = posteringer.find(postering => postering._id === posteringID);

            // Delete files associated with udlæg
            postering.udlæg.forEach(udlæg => {
                if (udlæg.kvittering) {
                    axios.delete(`${import.meta.env.VITE_API_URL}${udlæg.kvittering}`, {
                                               headers: {
                            'Authorization': `Bearer ${user.token}`
                        }
                    })
                    .catch(error => console.error("Der opstod en fejl ved sletning af kvittering:", error));
                }
            });

            // Delete the postering itself
            axios.delete(`${import.meta.env.VITE_API_URL}/posteringer/${posteringID}`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            })
            .then(() => {
                setPosteringer(prevPosteringer => 
                    prevPosteringer.filter(postering => postering._id !== posteringID)
                );
            })
            .catch(error => {
                console.error("Der opstod en fejl ved sletning af posteringen:", error);
            });
        }
    }

    function editKommentar(kommentarID) {

        const opdateretKommentar = {
            kommentarIndhold: editedComment
        }

        axios.patch(`${import.meta.env.VITE_API_URL}/kommentarer/${kommentarID}`, opdateretKommentar, {
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        })
        .then(response => {
            console.log("Kommentar opdateret:", response.data);
            setOpenCommentModalID(null)
            setEditedComment("");
        })
        .catch(error => {
            console.error("Der opstod en fejl ved opdatering af kommentaren:", error);
        });
    }

    function editPostering (posteringID) {
        const opdateretPostering = editedPostering;

        const opdateretPosteringTotal = ((opdateretPostering.handymanTimer || 0) * 300) + ((opdateretPostering.tømrerTimer || 0) * 360) + (opdateretPostering.opstart || 0) + (opdateretPostering.udlæg.reduce((sum, item) => sum + Number(item.beløb), 0) || 0);
        opdateretPostering.total = opdateretPosteringTotal;

        axios.patch(`${import.meta.env.VITE_API_URL}/posteringer/${posteringID}`, opdateretPostering, {
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        })
        .then(response => {
            console.log("Postering opdateret:", response.data);
            setOpenPosteringModalID(null)
            setEditedPostering("");
            setPosteringer(prevPosteringer => 
                prevPosteringer.map(postering => 
                    postering._id === opdateretPostering._id ? opdateretPostering : postering
                )
            );
        })
        .catch(error => {
            console.error("Der opstod en fejl ved opdatering af posteringen:", error);
        });
    }

    function færdiggørOpgave () {

        const færdiggør = {
            markeretSomFærdig: true
        }
        
        axios.patch(`${import.meta.env.VITE_API_URL}/opgaver/${opgaveID}`, færdiggør, {
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        })
        .then(response => {
            setFærdiggjort(true);
        })
        .catch(error => console.log(error))
    }

    function åbnForÆndringer () {
        const genåbnOpgaveOgSletFaktura = {
            markeretSomFærdig: false,
            opgaveAfsluttet: null,
            fakturaSendt: null,
            fakturaPDF: null,
            fakturaPDFUrl: null,
            fakturaBetalt: null
        }


        if (window.confirm(opgave.fakturaSendt ? "En faktura for denne opgave er allerede oprettet og sendt til kunden. Betaling for fakturaen er endnu ikke registreret. Hvis du genåbner opgaven for at foretage ændringer i posteringerne slettes den gamle faktura fra app'en her, men ikke fra dit regnskabssystem. Du skal huske manuelt at kreditere den tidligere faktura i dit regnskabssystem, og gøre kunden opmærksom på, at den gamle faktura ikke skal betales." : "Der er endnu ikke oprettet en faktura eller modtaget betaling for denne opgave. Du kan frit genåbne og ændre.")) {
            axios.patch(`${import.meta.env.VITE_API_URL}/opgaver/${opgaveID}`, genåbnOpgaveOgSletFaktura, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            })
            .then(response => {
                setFærdiggjort(false);
                setOpgaveAfsluttet(null);

                axios.get(`${import.meta.env.VITE_API_URL}/opgaver/${opgaveID}`, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    }
                })
                .then(res => {
                    setOpgave(res.data);
                })
                .catch(error => console.log(error))
            })
            .catch(error => console.log(error))
        }
    }

    function opretFakturakladde () {
        
        const authHeaders = {
            'Authorization': `Bearer ${user.token}`
        }
        
        const economicHeaders = {
            'Content-Type': 'application/json',
            'X-AppSecretToken': import.meta.env.VITE_BCBSECRETTOKEN,
            'X-AgreementGrantToken': import.meta.env.VITE_BCBAGREEMENTGRANTTOKEN
        }
        
        // definer linjestrukturen for hver postering
        const lines = []; 

        let lineNumber = 1;
        
        posteringer.forEach((postering) => {
            if (postering.opstart > 0 ) {
                lines.push({
                    lineNumber: lineNumber++,
                    description: `Startpris (${postering.dato ? postering.dato.slice(0,10) : null})`,
                    product: {
                        productNumber: "5"
                    },
                    quantity: 1,
                    unitNetPrice: 319.20,
                    discountPercentage: 0.00
                });
            }

            if (postering.handymanTimer > 0 ) {
                lines.push({
                    lineNumber: lineNumber++,
                    description: `Handymanarbejde: ${postering.beskrivelse}`,
                    product: {
                        productNumber: "1"
                    },
                    quantity: (postering.handymanTimer),
                    unitNetPrice: 447.20,
                    discountPercentage: 0.00
                });
            }

            if (postering.tømrerTimer > 0) {
                lines.push({
                    lineNumber: lineNumber++,
                    description: `Tømrerarbejde: ${postering.beskrivelse}`,
                    product: {
                        productNumber: "6"
                    },
                    quantity: (postering.tømrerTimer),
                    unitNetPrice: 480,
                    discountPercentage: 0.00
                });
            }

            if (postering.udlæg && postering.udlæg.length > 0) {
                lines.push({
                    lineNumber: lineNumber++,
                    description: `Materialer: ${postering.udlæg.map(udlæg => udlæg.beskrivelse).join(', ')}`,
                    product: {
                        productNumber: "2"
                    },
                    quantity: 1,
                    unitNetPrice: postering.udlæg.reduce((total, udlæg) => total + udlæg.beløb, 0),
                    discountPercentage: 0.00
                })
            }

            if (!vilBetaleMedMobilePay) {
                lines.push({
                    lineNumber: lineNumber++,
                    description: "Administrationsgebyr",
                    product: {
                        productNumber: "4"
                    },
                    quantity: 1,
                    unitNetPrice: 50,
                    discountPercentage: 0.00
                })
            }
        })

        // OPRET NY KUNDE
        axios.post('https://restapi.e-conomic.com/customers', {
            name: opgave.navn ? opgave.navn : "Intet navn oplyst",
            address: opgave.adresse ? opgave.adresse : "Ingen adresse oplyst",
            email: opgave.email ? opgave.email : null,
            vatZone: {
                vatZoneNumber: 1
            },
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
        // OPRET FAKTURAKLADDE
        .then(response => {
            console.log("Kunde oprettet.");
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
                lines: lines
            },{
                headers: economicHeaders
            })
            // BOOK FAKTURA
            .then(response => {
                console.log("Fakturakladde oprettet.");

                const draftInvoiceNumber = response.data.draftInvoiceNumber;

                axios.post('https://restapi.e-conomic.com/invoices/booked', {
                    draftInvoice: {
                        draftInvoiceNumber: draftInvoiceNumber
                    }
                }, {
                    headers: economicHeaders
                })
                // MARKER OPGAVE SOM AFSLUTTET & LAGR FAKTURA I DB
                .then(response => {
                    console.log("Faktura booket.");
                    console.log(response.data);

                    axios.patch(`${import.meta.env.VITE_API_URL}/opgaver/${opgaveID}`, {
                        opgaveAfsluttet: dayjs().toISOString()
                    }, {
                        headers: authHeaders
                    })
                    .then(res => {
                        setOpgaveAfsluttet(dayjs().format("YYYY-MM-DD"));
                        console.log("Opgaven er afsluttet.")
                        
                    })
                    .catch(error => {
                        console.log("Fejl: Opgaven blev ikke markeret som afsluttet.")
                        console.log(error)
                    })
                    // ============== LAGR FAKTURA I DB ==============
                    axios.get(response.data.pdf.download, {
                        responseType: 'blob',
                        headers: economicHeaders
                    })
                    .then(fakturaPDF => {
                        const reader = new FileReader();
                        reader.readAsDataURL(new Blob([fakturaPDF.data]));
                        reader.onloadend = function() {
                            const base64data = reader.result;
                            
                            axios.patch(`${import.meta.env.VITE_API_URL}/opgaver/${opgaveID}`, {
                                fakturaPDF: base64data
                            }, {
                                headers: authHeaders
                            })
                            .then(response => {
                                console.log("Faktura-PDF'en gemt i databasen i base64-format.");
                            })
                            .catch(error => {
                                console.log("Fejl: Kunne ikke lagre faktura PDF i databasen.");
                                console.log(error);
                            });

                        // Store fakturaPDF in the server fakturaer-folder
                        const fakturaBlob = new Blob([fakturaPDF.data], { type: 'application/pdf' });
                        const formData = new FormData();
                        formData.append('file', fakturaBlob, `faktura_${opgaveID}.pdf`);

                        axios.post(`${import.meta.env.VITE_API_URL}/fakturaer`, formData, {
                            headers: {
                                'Authorization': `Bearer ${user.token}`,
                                'Content-Type': 'multipart/form-data'
                            }
                        })
                        .then(response => {
                            console.log("Faktura PDF uploadet til server-mappen.");
                            console.log(response.data);
                            axios.patch(`${import.meta.env.VITE_API_URL}/opgaver/${opgaveID}`, {
                                fakturaPDFUrl: response.data.filePath
                            }, {
                                headers: authHeaders
                            })
                            .then(response => {
                                console.log("Faktura PDF-URL'en gemt i databasen.");
                                console.log(response.data);
                                opgave.fakturaPDFUrl = response.data.fakturaPDFUrl;
                                const fullFakturaPDFUrl = `${import.meta.env.VITE_API_URL}${opgave.fakturaPDFUrl}`;

                                // OG HER SKAL DER SENDES EN SMS MED LINK TIL FAKTURA
                                if (opgave.telefon && String(opgave.telefon).length === 8) {
                                    const smsData = {
                                        "messages": [
                                            {
                                                "to": `${opgave.telefon}`,
                                                "countryHint": "45",
                                                "respectBlacklist": true,
                                                "text": `Kære ${opgave.navn},\n\nTak fordi du valgte at være kunde hos Better Call Bob.\n\nDu kan se din regning her: ${fullFakturaPDFUrl}\n\nVi glæder os til at hjælpe dig igen! \n\nDbh.,\nBob`,
                                                "from": "Bob",
                                                "flash": false,
                                                "encoding": "gsm7"
                                            }
                                        ]
                                    }

                                    axios.post(`${import.meta.env.VITE_API_URL}/sms/send-sms`, { smsData }, {
                                        headers: {
                                            'Authorization': `Bearer ${user.token}` // If needed for your server authentication
                                        }
                                    })
                                    .then(response => {
                                        console.log("SMS sent to customer.");
                                        console.log(response.data);
                                    })
                                    .catch(error => {
                                        console.log("Error: Could not send SMS to customer.");
                                        console.log(error);
                                    });
                                } else {
                                    console.log("Intet gyldigt telefonnummer fundet for kunden – SMS ikke sendt.")
                                }
                                // ==================================================
                            })
                            .catch(error => {
                                console.log("Fejl: Kunne ikke lagre faktura PDF URL i databasen.");
                                console.log(error);
                            });
                        })
                        .catch(error => {
                            console.log("Fejl: Kunne ikke uploade faktura PDF til server-mappen.");
                            console.log(error);
                        });
                        }
                    })
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
        //     axios.get(response.data.pdf.download, {
        //         responseType: 'blob',
        //         headers: {
        //             'Content-Type': 'application/json',
        //             'X-AppSecretToken': import.meta.env.VITE_BCBSECRETTOKEN,
        //             'X-AgreementGrantToken': import.meta.env.VITE_BCBAGREEMENTGRANTTOKEN
        //         }
        //     })
        //     .then(res => {
        //         const reader = new FileReader();
        //         reader.readAsDataURL(new Blob([res.data]));
        //         reader.onloadend = function() {
        //             const base64data = reader.result;
        //             axios.post(`${import.meta.env.VITE_API_URL}/storeFile`, {
        //                 fileName: 'invoice.pdf',
        //                 fileData: base64data,
        //                 opgaveID: opgaveID
        //             }, {
        //                 headers: {
        //                     'Authorization': `Bearer ${user.token}`
        //                 }
        //             })
        //             .then(response => {
        //                 console.log("File stored successfully in the database.");
        //             })
        //             .catch(error => console.log(error));
    }

    function tilføjBesøg () {
    
        const besøg = {
            datoTidFra: dayjs(selectedOpgaveDate).format("YYYY-MM-DD") + "T" + planlægBesøgFraTidspunkt + ":00.000",
            datoTidTil: dayjs(selectedOpgaveDate).format("YYYY-MM-DD") + "T" + planlægBesøgTilTidspunkt + ":00.000",
            brugerID: userID,
            opgaveID: opgave._id
        }

        if (besøg.datoTidFra >= besøg.datoTidTil) {
            setOpretBesøgError("'Fra kl.' skal være før 'Til kl.'.")
            setTimeout(() => {
                setOpretBesøgError("")
            }, 5000)
            return
        }

        const egneLedigeTiderIDag = egneLedigeTider.filter(ledigTid => dayjs(ledigTid.datoTidFra).format("YYYY-MM-DD") === dayjs(besøg.datoTidFra).format("YYYY-MM-DD"))
        console.log(egneLedigeTiderIDag)
        
        let isWithinAvailableTime = false;

        egneLedigeTiderIDag.forEach(ledigTid => {
            const ledigTidFra = dayjs(ledigTid.datoTidFra);
            const ledigTidTil = dayjs(ledigTid.datoTidTil);
    
            const besøgFra = dayjs(besøg.datoTidFra);
            const besøgTil = dayjs(besøg.datoTidTil);
    
            if (besøgFra >= ledigTidFra && besøgTil <= ledigTidTil) {
                isWithinAvailableTime = true;
            }
        });
    
        if (isWithinAvailableTime) {
            console.log("Besøget er inden for en ledig tid.");
            
            axios.post(`${import.meta.env.VITE_API_URL}/besoeg`, besøg, {
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
            })
            .then(res => {
                triggerPlanlagteOpgaver ? setTriggerPlanlagteOpgaver(false) : setTriggerPlanlagteOpgaver(true)
            })
            .catch(error => console.log(error))

        } else {
            
            setOpretBesøgError(<>Besøg er uden for en ledig tid. <span style={{color:"#59bf1a", cursor:"pointer", fontFamily: "OmnesBold"}} onClick={opretBesøgOgLedighed}>Opret alligevel?</span></>)
            setTimeout(() => {
                setOpretBesøgError("");
            }, 5000);
        }
    }

    function opretBesøgOgLedighed () {
        const ledigTid = {
            datoTidFra: dayjs(selectedOpgaveDate).format("YYYY-MM-DD") + "T" + planlægBesøgFraTidspunkt + ":00.000",
            datoTidTil: dayjs(selectedOpgaveDate).format("YYYY-MM-DD") + "T" + planlægBesøgTilTidspunkt + ":00.000",
            brugerID: userID
        }
        
        const besøg = {
            datoTidFra: dayjs(selectedOpgaveDate).format("YYYY-MM-DD") + "T" + planlægBesøgFraTidspunkt + ":00.000",
            datoTidTil: dayjs(selectedOpgaveDate).format("YYYY-MM-DD") + "T" + planlægBesøgTilTidspunkt + ":00.000",
            brugerID: userID,
            opgaveID: opgave._id
        }

        // OPRET LEDIG TID
        axios.post(`${import.meta.env.VITE_API_URL}/ledige-tider/`, ledigTid, {
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        })
        .then(res => {
            triggerLedigeTiderRefetch ? setTriggerLedigeTiderRefetch(false) : setTriggerLedigeTiderRefetch(true)
        })
        .catch(error => console.log(error))

        // OPRET BESØG
        axios.post(`${import.meta.env.VITE_API_URL}/besoeg`, besøg, {
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        })
        .then(res => {
            triggerPlanlagteOpgaver ? setTriggerPlanlagteOpgaver(false) : setTriggerPlanlagteOpgaver(true)
        })
        .catch(error => console.log(error))
    }

    function sletBesøg(besøgID){
        axios.delete(`${import.meta.env.VITE_API_URL}/besoeg/${besøgID}`, {
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        })
        .then(response => {
            setPlanlagteOpgaver(prevPlanlagteOpg => 
                prevPlanlagteOpg.filter(opg => opg._id !== besøgID)
            );
            triggerPlanlagteOpgaver ? setTriggerPlanlagteOpgaver(false) : setTriggerPlanlagteOpgaver(true)
        })
        .catch(error => {
            console.error("Der opstod en fejl ved sletning af besøget:", error);
        });
    }

    function navigateToOpgave (id) {
        navigate(`/opgave/${id}`)
        navigate(0)
    }

    function toggleVisKalender () {
        visKalender ? setVisKalender(false) : setVisKalender(true)
    }

    const openTableEvent = (besøg) => {
        const besøgID = besøg.tættesteBesøgID;
        const besøgTilÅbning = egneBesøg.find(besøg => besøg._id === besøgID);
    
        axios.get(`${import.meta.env.VITE_API_URL}/opgaver/${besøgTilÅbning.opgaveID}`, {
            headers: {
              'Authorization': `Bearer ${user.token}`
            }
          })
          .then(res => {
            setTilknyttetOpgave(res.data)
          })
          .catch(error => console.log(error))
    
        setEventData(besøgTilÅbning);
        setOpenDialog(true);
      };

    // konstater til regnskabsopstillingen -- HONORARER --
    const fasteHonorarerTotal = posteringer && posteringer.reduce((akk, nuv) => akk + (!nuv.dynamiskHonorarBeregning ? nuv.fastHonorar : 0), 0);
    const opstartTotalHonorar = posteringer && posteringer.reduce((akk, nuv) => akk + (nuv.dynamiskHonorarBeregning ? (nuv.opstart * satser.opstartsgebyrHonorar) : 0), 0);
    const handymanTotalHonorar = posteringer && (posteringer.reduce((akk, nuv) => akk + (nuv.dynamiskHonorarBeregning ? (nuv.handymanTimer * satser.handymanTimerHonorar) : 0), 0));
    const tømrerTotalHonorar = posteringer && (posteringer.reduce((akk, nuv) => akk + (nuv.dynamiskHonorarBeregning ? (nuv.tømrerTimer * satser.tømrerTimerHonorar) : 0), 0));
    const rådgivningOpmålingVejledningTotalHonorar = posteringer && (posteringer.reduce((akk, nuv) => akk + (nuv.dynamiskHonorarBeregning ? (nuv.rådgivningOpmålingVejledning * satser.rådgivningOpmålingVejledningHonorar) : 0), 0));
    const trailerTotalHonorar = posteringer && (posteringer.reduce((akk, nuv) => akk + (nuv.dynamiskHonorarBeregning ? (nuv.trailer * satser.trailerHonorar) : 0), 0));
    const aftenTillægTotalHonorar = posteringer && (posteringer.reduce((akk, nuv) => akk + (nuv.dynamiskHonorarBeregning ? (nuv.aftenTillæg ? ((nuv.handymanTimer + nuv.tømrerTimer + nuv.rådgivningOpmålingVejledning) * satser.aftenTillægHonorar) : 0) : 0), 0));
    const natTillægTotalHonorar = posteringer && (posteringer.reduce((akk, nuv) => akk + (nuv.dynamiskHonorarBeregning ? (nuv.natTillæg ? ((nuv.handymanTimer * (satser.handymanTimerPrisInklNatTillæg - satser.handymanTimerPris) + ((nuv.tømrerTimer + nuv.rådgivningOpmålingVejledning) * (satser.tømrerTimerPrisInklNatTillæg - satser.tømrerTimerPris)))) : 0) : 0), 0));
    const udlægTotalHonorar = posteringer && posteringer.length > 0 && posteringer.reduce((akk, nuv) => {
        const udlægSum = nuv.udlæg.reduce((sum, udlæg) => sum + (parseFloat(udlæg.beløb) || 0), 0);
        return akk + (nuv.dynamiskHonorarBeregning ? udlægSum : 0);
    }, 0);
    const rabatterTotalHonorar = posteringer && posteringer.length > 0 && posteringer.reduce((akk, nuv) => {
        const rabatProcent = nuv.rabatProcent || 0;
        const totalHonorarEksklUdlæg = (nuv.totalHonorar - nuv.udlæg.reduce((sum, udlæg) => sum + (parseFloat(udlæg.beløb) || 0), 0));
        return akk + (nuv.dynamiskHonorarBeregning ? ((totalHonorarEksklUdlæg / (100 - rabatProcent) * 100) * (rabatProcent / 100)) : 0);
    }, 0);
    const totalHonorar = Number(fasteHonorarerTotal) + Number(opstartTotalHonorar) + Number(handymanTotalHonorar) + Number(tømrerTotalHonorar) + Number(rådgivningOpmålingVejledningTotalHonorar) + Number(trailerTotalHonorar) + Number(aftenTillægTotalHonorar) + Number(natTillægTotalHonorar) + Number(udlægTotalHonorar) - Number(rabatterTotalHonorar);

    // konstanter til regnskabsopstillingen -- FAKTURA --
    const fastPrisTotalFaktura = posteringer && Math.round((posteringer.reduce((akk, nuv) => akk + (!nuv.dynamiskPrisBeregning ? nuv.fastPris : 0), 0)));
    const opstartTotalFaktura = posteringer && Math.round((posteringer.reduce((akk, nuv) => akk + (nuv.dynamiskPrisBeregning ? (nuv.opstart * nuv.satser.opstartsgebyrPris) : 0), 0)));
    const handymanTotalFaktura = posteringer && Math.round((posteringer.reduce((akk, nuv) => akk + (nuv.dynamiskPrisBeregning ? (nuv.handymanTimer * nuv.satser.handymanTimerPris) : 0), 0)));
    const tømrerTotalFaktura = posteringer && Math.round((posteringer.reduce((akk, nuv) => akk + (nuv.dynamiskPrisBeregning ? (nuv.tømrerTimer * nuv.satser.tømrerTimerPris) : 0), 0)));
    const rådgivningOpmålingVejledningTotalFaktura = posteringer && Math.round((posteringer.reduce((akk, nuv) => akk + (nuv.dynamiskPrisBeregning ? (nuv.rådgivningOpmålingVejledning * nuv.satser.rådgivningOpmålingVejledningPris) : 0), 0)));
    const trailerTotalFaktura = posteringer && Math.round((posteringer.reduce((akk, nuv) => akk + (nuv.dynamiskPrisBeregning ? (nuv.trailer * nuv.satser.trailerPris) : 0), 0)));
    const aftenTillægTotalFaktura = posteringer && Math.round((posteringer.reduce((akk, nuv) => akk + (nuv.dynamiskPrisBeregning ? (nuv.aftenTillæg ? ((nuv.handymanTimer * (nuv.satser.handymanTimerPrisInklAftenTillæg - nuv.satser.handymanTimerPris) + ((nuv.tømrerTimer + nuv.rådgivningOpmålingVejledning) * (nuv.satser.tømrerTimerPrisInklAftenTillæg - nuv.satser.tømrerTimerPris)))) : 0) : 0), 0)));
    const natTillægTotalFaktura = posteringer && Math.round((posteringer.reduce((akk, nuv) => akk + (nuv.dynamiskPrisBeregning ? (nuv.natTillæg ? ((nuv.handymanTimer * (nuv.satser.handymanTimerPrisInklNatTillæg - nuv.satser.handymanTimerPris) + ((nuv.tømrerTimer + nuv.rådgivningOpmålingVejledning) * (nuv.satser.tømrerTimerPrisInklNatTillæg - nuv.satser.tømrerTimerPris)))) : 0) : 0), 0)));
    const udlægTotalFaktura = posteringer && posteringer.length > 0 && posteringer.reduce((akk, nuv) => {
        const udlægSum = nuv.udlæg.reduce((sum, udlæg) => sum + (parseFloat(udlæg.beløb) || 0), 0);
        return akk + (nuv.dynamiskPrisBeregning ? udlægSum : 0);
    }, 0);
    const rabatterTotalFaktura = posteringer && posteringer.length > 0 && posteringer.reduce((akk, nuv) => {
        const rabatProcent = nuv.rabatProcent || 0;
        const totalPrisEksklUdlæg = (nuv.totalPris - nuv.udlæg.reduce((sum, udlæg) => sum + (parseFloat(udlæg.beløb) || 0), 0));
        return akk + (nuv.dynamiskPrisBeregning ? ((totalPrisEksklUdlæg / (100 - rabatProcent) * 100) * (rabatProcent / 100)) : 0);
    }, 0);
    const totalFaktura = Number(fastPrisTotalFaktura) + Number(opstartTotalFaktura) + Number(handymanTotalFaktura) + Number(tømrerTotalFaktura) + Number(rådgivningOpmålingVejledningTotalFaktura) + Number(trailerTotalFaktura) + Number(aftenTillægTotalFaktura) + Number(natTillægTotalFaktura) + Number(udlægTotalFaktura) - Number(rabatterTotalFaktura);

    function openPDFFromDatabase(base64PDF, fileName = 'faktura.pdf') {
        if (opgave && opgave.fakturaPDFUrl) {
            const baseURL = import.meta.env.VITE_API_URL;
            window.open(`${baseURL}${opgave.fakturaPDFUrl}`, '_blank');
        }
    }

    function sletOpgave() {
        axios.patch(`${import.meta.env.VITE_API_URL}/opgaver/${opgave._id}`, {
            isDeleted: dayjs().toISOString(),
            markeretSomFærdig: true,
            ansvarlig: []
        }, {
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        })
        .then(response => {
            console.log('Opgave slettet:', response.data);
            const posteringerPåDenneOpgave = posteringer && posteringer.filter(postering => postering.opgaveID === opgave._id);
            const besøgPåDenneOpgave = alleBesøg && alleBesøg.filter(besøg => besøg.opgaveID === opgave._id)
            
            // Slet posteringer
            if(posteringerPåDenneOpgave.length > 0) {
                posteringerPåDenneOpgave.forEach(postering => {
                axios.delete(`${import.meta.env.VITE_API_URL}/posteringer/${postering._id}`, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    }
                })
                .then(response => {
                    console.log('Postering slettet:', response.data);
                })
                .catch(error => {
                        console.error('Error deleting postering:', error);
                    });
                })
            }

            // Slet besøg
            if(besøgPåDenneOpgave.length > 0) {
                besøgPåDenneOpgave.forEach(besøg => {
                    axios.delete(`${import.meta.env.VITE_API_URL}/besoeg/${besøg._id}`, {
                        headers: {
                            'Authorization': `Bearer ${user.token}`
                        }
                    })
                    .then(response => {
                        console.log('Besøg slettet:', response.data);
                    })
                    .catch(error => {
                            console.error('Error deleting besøg:', error);
                    });
                })
            }

            navigate(-1)
        })
        .catch(error => {
            console.error('Error deleting opgave:', error);
        });
    }

    function genåbnOpgave() {
        axios.patch(`${import.meta.env.VITE_API_URL}/opgaver/${opgave._id}`, {
            isDeleted: null,
            markeretSomFærdig: false
        }, {
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        })
        .then(response => {
            console.log('Opgave genåbnet:', response.data);
            navigate(-1)
        })
        .catch(error => {
            console.error('Error reopening opgave:', error);
        });
    }

    function redigerKunde(e) {
        e.preventDefault()

        axios.patch(`${import.meta.env.VITE_API_URL}/opgaver/${opgave._id}`, {
            navn: nyeKundeinformationer.navn,
            adresse: nyeKundeinformationer.adresse,
            telefon: nyeKundeinformationer.telefon,
            email: nyeKundeinformationer.email,
            virksomhed: nyeKundeinformationer.virksomhed,
            CVR: nyeKundeinformationer.CVR
        }, {
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        })
        .then(response => {
            console.log('Kunde opdateret.');
            setOpgave({...opgave, ...nyeKundeinformationer})
            setRedigerKundeModal(false)
        })
        .catch(error => {
            console.error('Error updating customer:', error);
        });
    }

    function afslutOpgave() {
        if (window.confirm("Du er ved at afslutte opgaven. Har du oprettet fakturaen for denne opgave, og modtaget betaling?")) {
            axios.patch(`${import.meta.env.VITE_API_URL}/opgaver/${opgave._id}`, {
                opgaveAfsluttet: dayjs().toISOString()
            }, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            })
            .then(response => {
                console.log('Opgave afsluttet:', response.data);
                navigate(-1)
            })
            .catch(error => {
                console.error('Fejl ved afslutning af opgave:', error);
            });
        }
    }

    function informerKundenOmPåVej() {
        const smsData = {
            "messages": [
                {
                    "to": `${opgave.telefon}`,
                    "countryHint": "45",
                    "respectBlacklist": true,
                    "text": `Kære ${opgave.navn},\n\nVi vil blot informere dig om, at vores medarbejder ${getBrugerName(userID)} nu er på vej ud til dig for at løse din opgave. Vi er hos dig inden længe.\n\nVi glæder os til at hjælpe dig! \n\nDbh.,\nBetter Call Bob`,
                    "from": "Bob",
                    "flash": false,
                    "encoding": "gsm7"
                }
            ]
        }

        // REGISTRER HVORNÅR SIDSTE SMS ER SENDT
        axios.patch(`${import.meta.env.VITE_API_URL}/opgaver/${opgave._id}`, {
            sidsteSMSSendtTilKundenOmPåVej: dayjs().toISOString()
        }, {
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        })

        // SEND SMS
        axios.post(`${import.meta.env.VITE_API_URL}/sms/send-sms`, { smsData }, {
            headers: {
                'Authorization': `Bearer ${user.token}` // If needed for your server authentication
            }
        })
        .then(response => {
            setSmsSendtTilKundenOmPåVej("SMS sendt kl. " + dayjs().format("HH:mm"))
        })
        .catch(error => {
            setSmsSendtTilKundenOmPåVej("Fejl: Kunne ikke sende SMS til kunden.");
            console.log(error);
        });
    }

    function indstilPåmindelseSMS(timer) {
        const smsData = {
            "messages": [
                {
                    "to": `${user.telefon}`,
                    "countryHint": "45",
                    "respectBlacklist": true,
                    "text": `Automatisk ${timer} timers reminder: Følg op på kontakt til kunde ${opgave.navn}.\n\nKontaktinfo:\n\nTelefon: ${opgave.telefon}\nE-mail: ${opgave.email}${opgave.virksomhed && "\nVirksomhed: " + opgave.virksomhed}\n\nDbh.,\nBetter Call Bob`,
                    "from": "BobReminders",
                    "sendTime": `${dayjs().add(timer - 1, 'hour').format('YYYY-MM-DDTHH:mm:ss') + "Z"}`,
                    "flash": false,
                    "encoding": "gsm7"
                }
            ]
        }

        // SEND SMS
        axios.post(`${import.meta.env.VITE_API_URL}/sms/send-sms`, { smsData }, {
            headers: {
                'Authorization': `Bearer ${user.token}` // If needed for your server authentication
            }
        })
        .then(response => {
            setSmsPåmindelseIndstillet("Du får en påmindelse om " + timer + " timer ⏱️")
        })
        .catch(error => {
            setSmsPåmindelseIndstillet("Fejl: Kunne ikke indstille påmindelsen. Prøv igen.");
            console.log(error);
        });
    }

    return (
    
        <div className={ÅbenOpgaveCSS.primærContainer}>
            <PageAnimation>
            <div className={ÅbenOpgaveCSS.tilbageOpgaveSektion}>
                <img src={BackIcon} alt="" onClick={() => navigate(-1)} className={ÅbenOpgaveCSS.tilbageKnap} />
                <div>
                    <b className={`${ÅbenOpgaveCSS.opgaveIDHeader} ${opgave.isDeleted ? ÅbenOpgaveCSS.slettetOverstregning : null}`}>Opgave #{opgave._id.slice(opgave._id.length - 3, opgave._id.length)} på</b>
                    <h2 className={`${ÅbenOpgaveCSS.adresseHeading} ${opgave.isDeleted ? ÅbenOpgaveCSS.slettetOverstregning : null}`}>{opgave.adresse}</h2>
                    <div className={ÅbenOpgaveCSS.kortLinkContainer}>
                        <a href={`https://maps.google.com/?q=${opgave.adresse}`} target="_blank" className={ÅbenOpgaveCSS.kortLink}>🌍 Find på kort</a>
                        {egneBesøg && egneBesøg.some(besøg => besøg.opgaveID === opgaveID && Math.abs(dayjs(besøg.datoTidFra).diff(dayjs(), 'hour')) <= 1) && opgave.telefon && (smsSendtTilKundenOmPåVej || (opgave.sidsteSMSSendtTilKundenOmPåVej && Math.abs(dayjs(opgave.sidsteSMSSendtTilKundenOmPåVej).diff(dayjs(), 'hour')) <= 1 )) && 
                        <p className={ÅbenOpgaveCSS.smsSendtTekst}>✔︎ {smsSendtTilKundenOmPåVej ? smsSendtTilKundenOmPåVej : "SMS sendt kl. " + dayjs(opgave.sidsteSMSSendtTilKundenOmPåVej).format("HH:mm") + " om, at du er på vej."}</p>}
                        {egneBesøg && egneBesøg.some(besøg => besøg.opgaveID === opgaveID && Math.abs(dayjs(besøg.datoTidFra).diff(dayjs(), 'hour')) <= 1) && opgave.telefon && !(smsSendtTilKundenOmPåVej || (opgave.sidsteSMSSendtTilKundenOmPåVej && Math.abs(dayjs(opgave.sidsteSMSSendtTilKundenOmPåVej).diff(dayjs(), 'hour')) <= 1 )) &&
                        <button className={ÅbenOpgaveCSS.informerKundenOmPåVej} onClick={() => {informerKundenOmPåVej()}}>Fortæl kunden du er på vej 💬 </button>}
                    </div>
                </div>
                {user.isAdmin && (
                    <>
                        <div className={ÅbenOpgaveCSS.sletOpgaveKnap}>
                            {!opgave.isDeleted && !opgave.markeretSomFærdig && <button className={ÅbenOpgaveCSS.sletOpgave} onClick={() => setSletOpgaveModal(true)}>Slet</button>}
                            {opgave.isDeleted && <button className={ÅbenOpgaveCSS.genåbnOpgave} onClick={() => setGenåbnOpgaveModal(true)}>Genåbn opgave</button>}
                        </div>
                        <Modal trigger={sletOpgaveModal} setTrigger={setSletOpgaveModal}>
                            <h2 className={ÅbenOpgaveCSS.modalHeading}>ADVARSEL!</h2>
                            <p className={ÅbenOpgaveCSS.modalTekst}>
                                <b className={ÅbenOpgaveCSS.bold}>Du er ved at slette denne opgave.</b><br /><br />
                                Alle posteringer, besøg og kommentarer, som er tilknyttet denne opgave, vil blive permanent slettet i processen. Dette kan have konsekvenser for dem, der er tilknyttet som ansvarlige for opgaven.
                                <br />
                                <br />
                                Vil du fortsætte?
                                <br />
                                <br />
                                <b className={ÅbenOpgaveCSS.prefix}>Skriv "SLET" i feltet herunder for at bekræfte handlingen.</b>
                            </p>
                            <input type="text" className={ÅbenOpgaveCSS.modalInput} onChange={(e) => setSletOpgaveInput(e.target.value)}/>
                            {sletOpgaveInput === "SLET" ? <button className={ModalCSS.buttonFullWidth} onClick={sletOpgave}>Slet opgave</button> : null}
                        </Modal>
                        <Modal trigger={genåbnOpgaveModal} setTrigger={setGenåbnOpgaveModal}>
                            <h2 className={ÅbenOpgaveCSS.modalHeading}>Vil du genåbne opgaven?</h2>
                            <p className={ÅbenOpgaveCSS.modalTekst}>
                                Genåbning af opgaven vil gendanne opgaven til den status, den havde, før den blev slettet.
                            </p>
                            <button className={ModalCSS.buttonFullWidth} onClick={genåbnOpgave}>Genåbn opgave</button>
                        </Modal>
                    </>
                )}

            </div>
            
            <div className={ÅbenOpgaveCSS.opgaveContainer}>
                {færdiggjort ? <div><b className={ÅbenOpgaveCSS.prefix}>Opgavebeskrivelse</b><p className={ÅbenOpgaveCSS.færdiggjortOpgavebeskrivelse}>{opgaveBeskrivelse}</p></div> : <form>
                    <label className={ÅbenOpgaveCSS.label} htmlFor="opgavebeskrivelse">Opgavebeskrivelse</label>
                    <textarea name="opgavebeskrivelse" className={ÅbenOpgaveCSS.opgavebeskrivelse} value={opgaveBeskrivelse} onChange={opdaterOpgavebeskrivelse} ></textarea>
                </form>}
                <div className={ÅbenOpgaveCSS.oprettetUdførtContainer}>
                    <span className={ÅbenOpgaveCSS.prefix}>Oprettet: <span className={ÅbenOpgaveCSS.postfix}>{new Date(opgave.createdAt).toLocaleDateString()}</span></span>
                    <span className={ÅbenOpgaveCSS.prefix}>Ønskes udført: <span className={ÅbenOpgaveCSS.postfix}>{new Date(opgave.onsketDato).toLocaleDateString()}, fra kl. {new Date(opgave.onsketDato).toLocaleTimeString().slice(0,5)}</span></span>
                </div>
                

                <div className={ÅbenOpgaveCSS.kundeinformationer}>
                    <div className={ÅbenOpgaveCSS.kolonner}>
                        <div className={ÅbenOpgaveCSS.kundeInformationerContainer}>
                            <div className={ÅbenOpgaveCSS.kundeHeadingContainer}>
                                <b className={`${ÅbenOpgaveCSS.prefix} ${ÅbenOpgaveCSS.kundeHeading}`}>{opgave.navn}</b>
                                {(!opgave.CVR && !opgave.virksomhed) ? <p className={ÅbenOpgaveCSS.privatEllerErhvervskunde}>Privatkunde</p> : <p className={ÅbenOpgaveCSS.privatEllerErhvervskunde}>Erhvervskunde</p>}
                                <button className={ÅbenOpgaveCSS.redigerKundeButtonMobile} onClick={() => setRedigerKundeModal(true)}>Rediger</button>
                            </div>
                            <Modal trigger={redigerKundeModal} setTrigger={setRedigerKundeModal}>
                                <h2 className={ÅbenOpgaveCSS.modalHeading}>Rediger kundeinformationer</h2>
                                <form className={ÅbenOpgaveCSS.redigerKundeForm} onSubmit={redigerKunde}>
                                    <label className={ÅbenOpgaveCSS.label} htmlFor="navn">Navn</label>
                                    <input type="text" name="navn" required className={ÅbenOpgaveCSS.modalInput} value={nyeKundeinformationer.navn} onChange={(e) => setNyeKundeinformationer({...nyeKundeinformationer, navn: e.target.value})} />
                                    <label className={ÅbenOpgaveCSS.label} htmlFor="navn">Adresse</label>
                                    <input type="text" name="adresse" required className={ÅbenOpgaveCSS.modalInput} value={nyeKundeinformationer.adresse} onChange={(e) => setNyeKundeinformationer({...nyeKundeinformationer, adresse: e.target.value})} />
                                    <label className={ÅbenOpgaveCSS.label} htmlFor="telefon">Telefon</label>
                                    <input type="text" name="telefon" required className={ÅbenOpgaveCSS.modalInput} value={nyeKundeinformationer.telefon} onChange={(e) => setNyeKundeinformationer({...nyeKundeinformationer, telefon: e.target.value})} />
                                    <label className={ÅbenOpgaveCSS.label} htmlFor="email">E-mail</label>
                                    <input type="text" name="email" required className={ÅbenOpgaveCSS.modalInput} value={nyeKundeinformationer.email} onChange={(e) => setNyeKundeinformationer({...nyeKundeinformationer, email: e.target.value})} />
                                    <label className={ÅbenOpgaveCSS.label} htmlFor="virksomhed">Virksomhed</label>
                                    <input type="text" name="virksomhed" className={ÅbenOpgaveCSS.modalInput} value={nyeKundeinformationer.virksomhed} onChange={(e) => setNyeKundeinformationer({...nyeKundeinformationer, virksomhed: e.target.value})} />
                                    <label className={ÅbenOpgaveCSS.label} htmlFor="cvr">CVR-nummer</label>
                                    <input type="text" name="cvr" className={ÅbenOpgaveCSS.modalInput} value={nyeKundeinformationer.CVR} onChange={(e) => setNyeKundeinformationer({...nyeKundeinformationer, CVR: e.target.value})} />
                                    <button className={ModalCSS.buttonFullWidth} type="submit">Opdater kunde</button>
                                </form>
                            </Modal>
                            <p className={ÅbenOpgaveCSS.adresseTekst}>{opgave.adresse}, {opgave.postnummerOgBy}</p>
                            {(opgave.virksomhed || opgave.CVR) && 
                            <div className={ÅbenOpgaveCSS.virksomhedInfo}>
                                <b className={`${ÅbenOpgaveCSS.prefix} ${ÅbenOpgaveCSS.virksomhedHeading}`}>Virksomhed</b>
                                {opgave.virksomhed ? <p className={ÅbenOpgaveCSS.virksomhedTekst}>{opgave.virksomhed}</p> : null}
                                {opgave.CVR ? <p className={ÅbenOpgaveCSS.virksomhedTekst}>CVR: {opgave.CVR}</p> : null}
                            </div>}
                            <div className={ÅbenOpgaveCSS.kundeKontaktDesktop}>
                                <p className={`${ÅbenOpgaveCSS.marginTop10}`}>📞 <a className={`${ÅbenOpgaveCSS.postfix} ${ÅbenOpgaveCSS.link}`} href={"tel:" + opgave.telefon}>{opgave.telefon}</a></p>
                                <p>✉️ <a className={`${ÅbenOpgaveCSS.postfix} ${ÅbenOpgaveCSS.link}`} href={"mailto:" + opgave.email}>{opgave.email}</a></p>
                            </div>
                            <div className={ÅbenOpgaveCSS.kundeKontaktMobile}>
                                <a className={`${ÅbenOpgaveCSS.postfix} ${ÅbenOpgaveCSS.link}`} href={"tel:" + opgave.telefon}><img src={PhoneIcon} alt="Phone Icon" /> {opgave.telefon}</a>
                                <a className={`${ÅbenOpgaveCSS.postfix} ${ÅbenOpgaveCSS.link}`} href={"sms:" + opgave.telefon + "&body=Hej%20" + opgave.navn.split(" ")[0] + ", "}><img src={SmsIcon} alt="SMS Icon" /> SMS</a>
                                <a className={`${ÅbenOpgaveCSS.postfix} ${ÅbenOpgaveCSS.link}`} href={"mailto:" + opgave.email}><img src={MailIcon} alt="Mail Icon" /> Mail</a>
                            </div>
                            <br /><button className={ÅbenOpgaveCSS.redigerKundeButtonDesktop} onClick={() => setRedigerKundeModal(true)}>Rediger kundeinformationer</button>
                        </div>
                        <div className={ÅbenOpgaveCSS.opgavestatusContainerDesktop}>
                            <b className={ÅbenOpgaveCSS.prefix}>Opgavestatus{færdiggjort ? ": " : null}</b>{færdiggjort ? <span className={ÅbenOpgaveCSS.statusTekstVedFærdiggjort}>{status}</span> : null}
                            {færdiggjort ? null : <form className={`${ÅbenOpgaveCSS.opgavestatusForm} ${ÅbenOpgaveCSS.marginTop10}`}>
                                <select style={conditionalStyles} name="opgavestatus" className={ÅbenOpgaveCSS.opgavestatus} onChange={opdaterOpgavestatus} value={status}>
                                    <option value="Modtaget">Opgave modtaget</option>
                                    <option value="Afventer svar">Kunde kontaktet – afventer</option>
                                    <option value="Dato aftalt">Dato aftalt</option>
                                </select>
                            </form>}
                            {sætPåmindelseSMS && 
                            <div className={ÅbenOpgaveCSS.påmindOmOpgave}>
                                {smsPåmindelseIndstillet ? 
                                <div className={ÅbenOpgaveCSS.påmindOmOpgaveKnapper}>
                                    <p className={ÅbenOpgaveCSS.smsPåmindelseIndstillet}>{smsPåmindelseIndstillet}</p>
                                </div>
                                :
                                <PageAnimation>
                                    <>
                                        <b style={{fontSize: "0.9rem"}}>- indstil SMS-påmindelse?</b>
                                        <div className={ÅbenOpgaveCSS.påmindOmOpgaveKnapper}>
                                            <button className={ÅbenOpgaveCSS.påmindOmOpgaveKnap} onClick={() => indstilPåmindelseSMS(24)}>24 timer</button>
                                            <button className={ÅbenOpgaveCSS.påmindOmOpgaveKnap} onClick={() => indstilPåmindelseSMS(48)}>48 timer</button>
                                        </div>
                                    </>
                                </PageAnimation>
                                }
                            </div>}
                        </div>  
                        <div className={ÅbenOpgaveCSS.opgavestatusContainerMobile}>
                            {færdiggjort ? null : <form className={`${ÅbenOpgaveCSS.opgavestatusForm} ${ÅbenOpgaveCSS.marginTop10}`}>
                                <select style={conditionalStyles} name="opgavestatus" className={ÅbenOpgaveCSS.opgavestatus} onChange={opdaterOpgavestatus} value={status}>
                                    <option value="Modtaget">Status: Opgave modtaget</option>
                                    <option value="Afventer svar">Status: Kunde kontaktet – afventer</option>
                                    <option value="Dato aftalt">Status: Dato aftalt</option>
                                </select>
                            </form>}
                            
                        </div>
                        
                    </div>
                </div>

                <div className={ÅbenOpgaveCSS.praktisk}>
                    <div className={`${ÅbenOpgaveCSS.uddelegeringDesktop}`}>
                        {færdiggjort ? null : user.isAdmin && <form className={ÅbenOpgaveCSS.tildelAnsvarligeForm} action="">
                            <b className={ÅbenOpgaveCSS.prefix}>Tildel ansvarlige:</b>
                            <select className={ÅbenOpgaveCSS.tildelAnsvarlige} defaultValue="Vælg Bob ..." name="vælgBob" onChange={tildelAnsvar}>
                                <option disabled>Vælg Bob ...</option>
                                {brugere && brugere.map((ledigAnsvarlig) => {
                                    return(
                                        <option key={ledigAnsvarlig._id} value={ledigAnsvarlig._id}>{ledigAnsvarlig.navn}</option>
                                    )
                                })}
                            </select>
                        </form>}
                        
                        <div className={ÅbenOpgaveCSS.ansvarshavendeListe}>
                            <b className={ÅbenOpgaveCSS.prefix}>Nuv. ansvarlige:</b>
                            <div className={ÅbenOpgaveCSS.ansvarlige}>
                            {nuværendeAnsvarlige && nuværendeAnsvarlige.map((ansvarlig) => {
                                return (
                                    <div key={ansvarlig._id} className={ÅbenOpgaveCSS.ansvarligDiv}>
                                        <p>{ansvarlig.navn}</p>
                                        {færdiggjort ? null : <button className={ÅbenOpgaveCSS.fjernAnsvarlig} onClick={() => {fjernAnsvarlig(ansvarlig)}}><img src={CloseIcon} alt="Close Icon" className={ÅbenOpgaveCSS.closeIcon} /></button>}
                                    </div>
                                )
                            })}
                            </div>
                        </div>
                    </div>
                    <div className={`${ÅbenOpgaveCSS.uddelegeringMobile}`}>
                        {færdiggjort ? null : user.isAdmin && <form className={ÅbenOpgaveCSS.tildelAnsvarligeForm} action="">

                            <select className={ÅbenOpgaveCSS.tildelAnsvarlige} defaultValue="Tildel ansvarlige til opgaven ..." name="vælgBob" onChange={tildelAnsvar}>
                                <option disabled>Tildel ansvarlige til opgaven ...</option>
                                {brugere && brugere.map((ledigAnsvarlig) => {
                                    return(
                                        <option key={ledigAnsvarlig._id} value={ledigAnsvarlig._id}>{ledigAnsvarlig.navn}</option>
                                    )
                                })}
                            </select>
                        </form>}
                        
                        <div className={ÅbenOpgaveCSS.ansvarshavendeListe}>
                            <b className={`${ÅbenOpgaveCSS.prefix} ${ÅbenOpgaveCSS.ansvarshavendeHeading}`}>Ansvarshavende</b>
                            <div className={ÅbenOpgaveCSS.ansvarlige}>
                            {nuværendeAnsvarlige && nuværendeAnsvarlige.length > 0 ? nuværendeAnsvarlige.map((ansvarlig) => {
                                return (
                                    <div key={ansvarlig._id} className={ÅbenOpgaveCSS.ansvarligDiv}>
                                        <p>{ansvarlig.navn}</p>
                                        {færdiggjort ? null : <button className={ÅbenOpgaveCSS.fjernAnsvarlig} onClick={() => {fjernAnsvarlig(ansvarlig)}}><img src={CloseIcon} alt="Close Icon" className={ÅbenOpgaveCSS.closeIcon} /></button>}
                                    </div>
                                )
                            }) : <p>Der er ikke udpeget en ansvarlig til opgaven.</p>}
                            </div>
                        </div>
                    </div>
                </div>
                <div className={ÅbenOpgaveCSS.planDiv}>
                    <ÅbenOpgaveCalendar 
                        user={user} 
                        tilknyttetOpgave={tilknyttetOpgave}
                        setTilknyttetOpgave={setTilknyttetOpgave}
                        openDialog={openDialog}
                        setOpenDialog={setOpenDialog}
                        eventData={eventData}
                        setEventData={setEventData} 
                        aktueltBesøg={aktueltBesøg} 
                        opgaveID={opgaveID}
                        getBrugerName={getBrugerName}
                        brugere={brugere}
                        egneLedigeTider={egneLedigeTider}
                        alleLedigeTider={alleLedigeTider}
                        egneBesøg={egneBesøg}
                        alleBesøg={alleBesøg}
                        setEgneLedigeTider={setEgneLedigeTider}
                        setEgneBesøg={setEgneBesøg}
                        refetchLedigeTider={refetchLedigeTider}
                        refetchBesøg={refetchBesøg}
                        setRefetchLedigeTider={setRefetchLedigeTider}
                        setRefetchBesøg={setRefetchBesøg}
                        setAlleLedigeTider={setAlleLedigeTider}
                        setAlleBesøg={setAlleBesøg}
                        userID={userID}
                        />
                </div>
                <div className={ÅbenOpgaveCSS.posteringer}>
                <Modal trigger={kvitteringBillede} setTrigger={setKvitteringBillede}>
                    <h2 className={ÅbenOpgaveCSS.modalHeading}>Billede fra postering</h2>
                    <img src={`${import.meta.env.VITE_API_URL}${kvitteringBillede}`} alt="Kvittering" className={ÅbenOpgaveCSS.kvitteringBilledeStort} />
                </Modal>
                    <b className={ÅbenOpgaveCSS.prefix}>Posteringer</b>
                    <div className={ÅbenOpgaveCSS.aktuellePosteringer}>
                        {posteringer && posteringer.map((postering) => {
                            return (
                                <div className={ÅbenOpgaveCSS.posteringDiv} key={postering._id}>
                                    <div className={ÅbenOpgaveCSS.posteringCard}>
                                        <img src={Paperclip} className={ÅbenOpgaveCSS.paperclip} alt="" />
                                        <div>
                                            <p className={ÅbenOpgaveCSS.posteringDato}>{postering.dato && postering.dato.slice(0,10)}</p>
                                            <p className={ÅbenOpgaveCSS.posteringBruger}>{getBrugerName(postering.brugerID)}</p>
                                            <i className={ÅbenOpgaveCSS.posteringBeskrivelse}>{postering.beskrivelse ? postering.beskrivelse : "Ingen beskrivelse."}</i>
                                            <div className={ÅbenOpgaveCSS.kvitteringBillederListe}>
                                                {postering.udlæg.map((udlæg, index) => {
                                                    return udlæg.kvittering ? 
                                                    <img 
                                                    key={`udlæg-${index}`}
                                                    className={ÅbenOpgaveCSS.kvitteringBillede} 
                                                    src={`${import.meta.env.VITE_API_URL}${udlæg.kvittering}`} 
                                                    alt={udlæg.beskrivelse} 
                                                    onClick={() => {
                                                        setKvitteringBillede(udlæg.kvittering);
                                                    }}/> 
                                                    : 
                                                    null;
                                                })}
                                            </div>
                                        </div>
                                        <div className={ÅbenOpgaveCSS.posteringListe}>
                                            {postering.opstart > 0 && postering.dynamiskHonorarBeregning && (
                                                <div className={ÅbenOpgaveCSS.posteringRække}>
                                                    <span className={ÅbenOpgaveCSS.posteringRækkeBeskrivelse}>Opstart </span>
                                                    <span>{(postering.opstart * postering.satser.opstartsgebyrHonorar).toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                                                </div>
                                            )}
                                            {postering.handymanTimer > 0 && postering.dynamiskHonorarBeregning && (
                                                <div className={ÅbenOpgaveCSS.posteringRække}>
                                                    <span className={ÅbenOpgaveCSS.posteringRækkeBeskrivelse}>{postering.handymanTimer || 0} timer (handyman) </span>
                                                    <span>{(postering.handymanTimer * postering.satser.handymanTimerHonorar).toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                                                </div>
                                            )}
                                            {postering.tømrerTimer > 0 && postering.dynamiskHonorarBeregning && (
                                                <div className={ÅbenOpgaveCSS.posteringRække}>
                                                    <span className={ÅbenOpgaveCSS.posteringRækkeBeskrivelse}>{postering.tømrerTimer || 0} timer (tømrer) </span>
                                                    <span>{(postering.tømrerTimer * postering.satser.tømrerTimerHonorar).toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                                                </div>
                                            )}
                                            {postering.rådgivningOpmålingVejledning > 0 && postering.dynamiskHonorarBeregning && (
                                                <div className={ÅbenOpgaveCSS.posteringRække}>
                                                    <span className={ÅbenOpgaveCSS.posteringRækkeBeskrivelse}>{postering.rådgivningOpmålingVejledning || 0} timer (rådgivning) </span>
                                                    <span>{(postering.rådgivningOpmålingVejledning * postering.satser.rådgivningOpmålingVejledningHonorar).toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                                                </div>
                                            )}
                                            {postering.aftenTillæg && postering.dynamiskHonorarBeregning && (
                                                <div className={ÅbenOpgaveCSS.posteringRække}>
                                                    <span className={ÅbenOpgaveCSS.posteringRækkeBeskrivelse}>Aftentillæg ({postering.satser.aftenTillægHonorar} x {postering.handymanTimer + postering.tømrerTimer + postering.rådgivningOpmålingVejledning}) </span>
                                                    <span>{((postering.handymanTimer + postering.tømrerTimer + postering.rådgivningOpmålingVejledning) * (postering.satser.aftenTillægHonorar)).toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                                                </div>
                                            )}
                                            {postering.natTillæg && postering.dynamiskHonorarBeregning && (
                                                <div className={ÅbenOpgaveCSS.posteringRække}>
                                                    <span className={ÅbenOpgaveCSS.posteringRækkeBeskrivelse}>Nattillæg ({postering.satser.natTillægHonorar} x {postering.handymanTimer + postering.tømrerTimer + postering.rådgivningOpmålingVejledning}) </span>
                                                    <span>{((postering.handymanTimer + postering.tømrerTimer + postering.rådgivningOpmålingVejledning) * (postering.satser.natTillægHonorar)).toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                                                </div>
                                            )}
                                            {postering.trailer && postering.dynamiskHonorarBeregning && (
                                                <div className={ÅbenOpgaveCSS.posteringRække}>
                                                    <span className={ÅbenOpgaveCSS.posteringRækkeBeskrivelse}>Trailer </span>
                                                    <span>{(postering.satser.trailerHonorar).toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                                                </div>
                                            )}
                                            {postering.udlæg.length > 0 && postering.dynamiskHonorarBeregning && (
                                                <div className={ÅbenOpgaveCSS.posteringRække}>
                                                    <span className={ÅbenOpgaveCSS.posteringRækkeBeskrivelse}>{postering.udlæg.length > 0 ? postering.udlæg.length : 0} udlæg </span>
                                                    <span>{(postering.udlæg.reduce((sum, item) => sum + Number(item.beløb), 0)).toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                                                </div>
                                            )}
                                            {postering.rabatProcent > 0 && postering.dynamiskHonorarBeregning && (
                                                <div className={ÅbenOpgaveCSS.posteringRække}>
                                                    <span className={ÅbenOpgaveCSS.posteringRækkeBeskrivelse}>{postering.rabatProcent}% rabat</span>
                                                    <span>- {(((postering.totalHonorar - postering.udlæg.reduce((sum, item) => sum + Number(item.beløb), 0)) / (100 - postering.rabatProcent) * 100) * (postering.rabatProcent/100)).toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                                                </div>
                                            )}
                                            {!postering.dynamiskHonorarBeregning && (
                                                <div className={ÅbenOpgaveCSS.posteringRække}>
                                                    <span className={ÅbenOpgaveCSS.posteringRækkeBeskrivelse}>Fast honorar: </span>
                                                    <span>{postering.fastHonorar.toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                                                </div>
                                            )}
                                            <div className={ÅbenOpgaveCSS.totalRække}>
                                                <b className={ÅbenOpgaveCSS.totalRækkeBeskrivelse}>Total: </b>
                                                <b className={ÅbenOpgaveCSS.totalRækkeResultat}>{(postering.totalHonorar).toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</b>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={ÅbenOpgaveCSS.posteringKnapper}>
                                        <button className={ÅbenOpgaveCSS.posteringKnap} onClick={() => {setOpenPosteringSatser(postering)}}>Satser</button>
                                        <PosteringSatserModal trigger={openPosteringSatser && openPosteringSatser._id === postering._id} setTrigger={setOpenPosteringSatser} postering={postering} brugere={brugere} />
                                        {færdiggjort ? null : <button className={ÅbenOpgaveCSS.posteringKnap} onClick={() => {setOpenPosteringModalID(postering._id), setEditedPostering(postering)}}>Rediger</button>}
                                        <RedigerPostering trigger={openPosteringModalID === postering._id} setTrigger={setOpenPosteringModalID} postering={postering} />
                                        {/* <Modal trigger={openPosteringModalID === postering._id} setTrigger={setOpenPosteringModalID}>
                                                <h2 className={ÅbenOpgaveCSS.modalHeading}>Rediger {getBrugerName(editedPostering.brugerID).split(" ")[0]}s postering</h2>
                                                <form className={ÅbenOpgaveCSS.editKommentarForm} onSubmit={(e) => {
                                                    e.preventDefault();
                                                    editPostering(postering._id);
                                                }}>
                                                    <label className={ÅbenOpgaveCSS.prefix} htmlFor="">Dato</label>
                                                    <input className={ÅbenOpgaveCSS.modalInput} type="date" value={dayjs(editedPostering.dato).format("YYYY-MM-DD")} onChange={(e) => setEditedPostering({...editedPostering, dato: e.target.value})} />
                                                    <label className={ÅbenOpgaveCSS.prefix} htmlFor="">Beskrivelse</label>
                                                    <textarea className={ÅbenOpgaveCSS.modalInput} type="text" value={editedPostering.beskrivelse} onChange={(e) => setEditedPostering({...editedPostering, beskrivelse: e.target.value})} />
                                                    <div className={ÅbenOpgaveCSS.opstartsgebyrDiv}>
                                                        <input className={ÅbenOpgaveCSS.posteringCheckbox} type="checkbox" checked={editedPostering.opstart === 200} onChange={(e) => setEditedPostering({...editedPostering, opstart: editedPostering.opstart === 200 ? 0 : 200})}/>
                                                        <label className={ÅbenOpgaveCSS.prefix}>Inkludér opstartsgebyr (kr. 200,-)</label>
                                                    </div>
                                                    <div className={ÅbenOpgaveCSS.modalKolonner}>
                                                        <div>
                                                            <label className={ÅbenOpgaveCSS.prefix} htmlFor="">Antal handymantimer:</label>
                                                            <input className={ÅbenOpgaveCSS.modalInput} value={editedPostering.handymanTimer || ""} onChange={(e) => setEditedPostering({...editedPostering, handymanTimer: e.target.value})} type="number" />
                                                        </div>
                                                        <div>
                                                            <label className={ÅbenOpgaveCSS.prefix} htmlFor="">Antal tømrertimer:</label>
                                                            <input className={ÅbenOpgaveCSS.modalInput} value={editedPostering.tømrerTimer || ""} onChange={(e) => setEditedPostering({...editedPostering, tømrerTimer: e.target.value})} type="number" />
                                                        </div>
                                                    </div>
                                                    
                                                    <div className={ÅbenOpgaveCSS.udlæg}>
                                                        <h3 className={ÅbenOpgaveCSS.modalHeading3}>Udlæg</h3>
                                                        <div className={ÅbenOpgaveCSS.listeOverUdlæg}>
                                                        {(editedPostering.udlæg || []).map((outlay, index) => (
                                                            <div className={ÅbenOpgaveCSS.enkeltUdlæg} key={index}>
                                                                <div className={ÅbenOpgaveCSS.udlægKvittering}>
                                                                    {outlay.kvittering ? (
                                                                        <img className={ÅbenOpgaveCSS.udlægKvitteringImg} src={`${import.meta.env.VITE_API_URL}${outlay.kvittering}`} alt={outlay.beskrivelse} />
                                                                    ) : (
                                                                        <label>
                                                                            <div className={ÅbenOpgaveCSS.udlægKvitteringInputContainer} onClick={() => document.getElementById(`udlæg-file-input-${index}`).click()}>
                                                                            </div>
                                                                            <input
                                                                                id={`udlæg-file-input-${index}`}
                                                                                type="file"
                                                                                accept="image/*"
                                                                                className={ÅbenOpgaveCSS.udlægKvitteringInput}
                                                                                onChange={(e) => {
                                                                                    const formData = new FormData();
                                                                                    formData.append('file', e.target.files[0]);
                                                                                    axios.post(`${import.meta.env.VITE_API_URL}/uploads`, formData, {
                                                                                        headers: {
                                                                                            'Content-Type': 'multipart/form-data',
                                                                                            'Authorization': `Bearer ${user.token}`
                                                                                        }
                                                                                    })
                                                                                    .then(res => {
                                                                                        console.log(res.data)
                                                                                        const updatedOutlay = { ...editedPostering.udlæg[index], kvittering: res.data.filePath }; // Ensure kvittering is updated correctly
                                                                                        const newUdlæg = [...editedPostering.udlæg];
                                                                                        newUdlæg[index] = updatedOutlay; // Replace the outlay at index
                                                                                        setEditedPostering({...editedPostering, udlæg: newUdlæg});
                                                                                    })
                                                                                    .catch(error => console.log(error));
                                                                                }}
                                                                            />
                                                                        </label>
                                                                    )}
                                                                </div>
                                                                <div className={ÅbenOpgaveCSS.udlægBeskrivelse}>
                                                                    <label className={ÅbenOpgaveCSS.prefix} htmlFor={`beskrivelse-${index}`}>Beskrivelse:</label>
                                                                    <input
                                                                        type="text"
                                                                        className={ÅbenOpgaveCSS.udlægInput}
                                                                        name="beskrivelse"
                                                                        id={`beskrivelse-${index}`}
                                                                        value={outlay.beskrivelse}
                                                                        onChange={(e) => {
                                                                            const newUdlæg = [...editedPostering.udlæg];
                                                                            newUdlæg[index].beskrivelse = e.target.value;
                                                                            setEditedPostering({...editedPostering, udlæg: newUdlæg});
                                                                        }}
                                                                    />
                                                                </div>
                                                                <div className={ÅbenOpgaveCSS.udlægBeløb}>
                                                                    <label className={ÅbenOpgaveCSS.prefix} htmlFor={`beløb-${index}`}>Beløb:</label>
                                                                    <input
                                                                        type="number"
                                                                        className={ÅbenOpgaveCSS.udlægInput}
                                                                        name="beløb"
                                                                        id={`beløb-${index}`}
                                                                        value={outlay.beløb}
                                                                        onChange={(e) => {
                                                                            const newUdlæg = [...editedPostering.udlæg];
                                                                            newUdlæg[index].beløb = e.target.value;
                                                                            setEditedPostering({...editedPostering, udlæg: newUdlæg});
                                                                        }}
                                                                    />
                                                                </div>
                                                                <button className={ÅbenOpgaveCSS.sletUdlægButton} onClick={async (e) => {
                                                                    e.preventDefault();
                                                                    const deletedUdlæg = editedPostering.udlæg[index];
                                                                    const newUdlæg = editedPostering.udlæg.filter((_, i) => i !== index);
                                                                    setEditedPostering({...editedPostering, udlæg: newUdlæg});
                                                                    
                                                                    if (deletedUdlæg.kvittering) {
                                                                        try {
                                                                            await axios.delete(`${import.meta.env.VITE_API_URL}${deletedUdlæg.kvittering}`, {
                                                                                headers: {
                                                                                    'Authorization': `Bearer ${user.token}`
                                                                                }
                                                                            });
                                                                        } catch (error) {
                                                                            console.log(error);
                                                                        }
                                                                    }
                                                                }}>-</button>
                                                            </div>
                                                        ))}
                                                        <button className={ÅbenOpgaveCSS.tilføjUdlægButton} onClick={(e) => {
                                                            e.preventDefault();
                                                            const newUdlæg = [...editedPostering.udlæg, { beskrivelse: "", beløb: "" }];
                                                            setEditedPostering({...editedPostering, udlæg: newUdlæg});
                                                        }}>+ Nyt udlæg</button>
                                                        </div>
                                                        
                                                    </div>
                                                    <button className={ÅbenOpgaveCSS.registrerPosteringButton} type="submit">Opdater postering</button>
                                                </form>
                                        </Modal> */}
                                        {færdiggjort ? null : <button className={ÅbenOpgaveCSS.posteringKnap} onClick={() => {sletPostering(postering._id)}}>Slet</button>}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                    {færdiggjort ? null : <button onClick={() => setOpenModal(true)} className={ÅbenOpgaveCSS.tilføjPosteringButton}>+ Ny postering</button>}
                    <AddPostering trigger={openModal} setTrigger={setOpenModal} opgaveID={opgaveID} userID={userID} user={user} />
                    <div>
                    {!opgave.isDeleted && opgave.fakturaOprettesManuelt && (færdiggjort ? 
                        <div className={ÅbenOpgaveCSS.færdigOpgaveDiv}>
                            <p className={ÅbenOpgaveCSS.prefix}><span style={{fontSize: '1.2rem', marginRight: 10}}>🔒</span> Opgaven er markeret som færdig og låst.</p>
                            {!user.isAdmin && <p className={ÅbenOpgaveCSS.prefix}><span style={{fontSize: '1.2rem', marginRight: 10}}>🧾</span> Faktura oprettes og administreres separat. Du skal ikke foretage dig yderligere.</p>}
                            {user.isAdmin && <p className={ÅbenOpgaveCSS.prefix}><span style={{fontSize: '1.2rem', marginRight: 10}}>🧾</span> Faktura oprettes og administreres separat. {opgave.tilbudAfgivet ? ` Oprindeligt tilbud afgivet: ${opgave.tilbudAfgivet} kr.` : "Intet konkret tilbud afgivet."}</p>}
                            {user.isAdmin && !opgave.opgaveAfsluttet && <button className={ÅbenOpgaveCSS.genåbnButton} onClick={() => åbnForÆndringer()}>Genåbn for ændringer</button>}
                            {user.isAdmin && !opgave.opgaveAfsluttet && <button className={ÅbenOpgaveCSS.afslutButton} onClick={() => afslutOpgave()}>Afslut opgave</button>}
                            {user.isAdmin && opgave.opgaveAfsluttet && <p className={ÅbenOpgaveCSS.prefix}><span style={{fontSize: '1.2rem', marginRight: 10}}>✅</span> Opgaven er afsluttet d. {new Date(opgave.opgaveAfsluttet).toLocaleDateString('da-DK', { day: '2-digit', month: 'long', year: 'numeric' })}.</p>}
                        </div>
                        :
                        posteringer.length > 0 && 
                                <button className={ÅbenOpgaveCSS.markerSomFærdigKnap} onClick={() => færdiggørOpgave()}>Markér opgave som færdig</button>
                    )}
                    {!opgave.isDeleted && !opgave.fakturaOprettesManuelt && 
                        (færdiggjort
                            ? 
                            <div className={ÅbenOpgaveCSS.færdigOpgaveDiv}>
                                {!opgave.opgaveAfsluttet && <p className={ÅbenOpgaveCSS.infoLine}><span style={{fontSize: '1rem', marginRight: 10}}>🔒</span> Opgaven er markeret som færdig og låst.</p>}
                                {opgave.fakturaSendt && <p className={ÅbenOpgaveCSS.infoLine}><span style={{fontSize: '1rem', marginRight: 10}}>📨</span> Faktura sendt til kunden d. {new Date(opgave.fakturaSendt).toLocaleDateString('da-DK', { day: '2-digit', month: 'long', year: 'numeric' })}.</p>}
                                {opgave.fakturaSendt 
                                    ? 
                                        <div className={ÅbenOpgaveCSS.fakturaDiv}>
                                            <button className={ÅbenOpgaveCSS.startBetalingButton} onClick={() => openPDFFromDatabase(opgave.fakturaPDF)}><span style={{fontSize: '1.2rem', marginRight: 10}}>🧾</span> Se faktura</button>
                                            <button className={ÅbenOpgaveCSS.betalFakturaButton} onClick={() => setÅbnBetalFakturaModal(true)}><span style={{fontSize: '1.2rem', marginRight: 10}}>💵</span> Registrer fakturabetaling</button>
                                            <RegistrerBetalFakturaModal åbnBetalFakturaModal={åbnBetalFakturaModal} setÅbnBetalFakturaModal={setÅbnBetalFakturaModal} />
                                        </div>
                                    : 
                                        ((opgave.virksomhed || opgave.CVR) && 
                                            <button className={ÅbenOpgaveCSS.startBetalingButton} onClick={() => setÅbnOpretFakturaModal(true)}>Opret faktura</button> 
                                        )
                                    } 
                                {opgave.opgaveBetaltMedMobilePay 
                                    ? 
                                        <p style={{marginTop: 10}} className={ÅbenOpgaveCSS.infoLine}><span style={{fontSize: '1rem', marginRight: 10}}>💵</span> Mobile Pay-betaling registreret d. {new Date(opgave.opgaveBetaltMedMobilePay).toLocaleDateString('da-DK', { day: '2-digit', month: 'long', year: 'numeric' })}.</p> 
                                    : 
                                        opgave.opgaveBetaltPåAndenVis 
                                        ?
                                            <p style={{marginTop: 10}} className={ÅbenOpgaveCSS.infoLine}><span style={{fontSize: '1rem', marginRight: 10}}>💵</span> Betaling manuelt registreret d. {new Date(opgave.opgaveBetaltPåAndenVis).toLocaleDateString('da-DK', { day: '2-digit', month: 'long', year: 'numeric' })}.</p> 
                                        :
                                            !(opgave.virksomhed || opgave.CVR) && !opgave.opgaveAfsluttet && <button className={ÅbenOpgaveCSS.startBetalingButton} onClick={() => setÅbnOpretRegningModal(true)}>Betaling</button>
                                }
                                {opgave.opgaveAfsluttet && !(opgave.opgaveBetaltMedMobilePay || opgave.opgaveBetaltPåAndenVis || opgave.fakturaBetalt) && <><button className={ÅbenOpgaveCSS.startBetalingButton} onClick={() => setRegistrerBetalingsModal(true)}>Registrer betaling</button><p style={{marginTop: 10}} className={ÅbenOpgaveCSS.infoLine}><span style={{fontSize: '1rem', marginRight: 10}}>💵</span>Betaling endnu ikke registreret.</p> </>}
                                <RegistrerBetalingsModal trigger={registrerBetalingsModal} setTrigger={setRegistrerBetalingsModal} opgave={opgave} setUpdateOpgave={setUpdateOpgave} updateOpgave={updateOpgave}/>
                                {opgave.fakturaBetalt 
                                    ? <p style={{marginTop: 10}} className={ÅbenOpgaveCSS.infoLine}><span style={{fontSize: '1rem', marginRight: 10}}>💵</span> Faktura betalt d. {new Date(opgave.fakturaBetalt).toLocaleDateString('da-DK', { day: '2-digit', month: 'long', year: 'numeric' })}.</p>
                                    : null
                                }
                                {opgave.opgaveAfsluttet 
                                    ? 
                                    ((typeof opgave.opgaveAfsluttet === 'boolean') 
                                        ? <p style={{marginTop: 10}}className={ÅbenOpgaveCSS.infoLine}><span style={{fontSize: '1rem', marginRight: 10}}>✔︎</span> Opgaven er afsluttet.</p> 
                                        : <p style={{marginTop: 10}}className={ÅbenOpgaveCSS.infoLine}><span style={{fontSize: '1rem', marginRight: 10}}>✔︎</span> Opgaven er afsluttet d. {new Date(opgave.opgaveAfsluttet).toLocaleDateString('da-DK', { day: '2-digit', month: 'long', year: 'numeric' })}.</p>
                                    )
                                    : 
                                    <div className={ÅbenOpgaveCSS.ikkeAfsluttetButtonsDiv}>
                                        <button className={ÅbenOpgaveCSS.genåbnButton} onClick={() => setTvingAfslutOpgaveModal(true)}>Afslut uden betaling</button>
                                        <button className={ÅbenOpgaveCSS.genåbnButton} onClick={() => åbnForÆndringer()}>Genåbn opgave</button>
                                    </div>
                                }

                            </div> 
                            : 
                            posteringer.length > 0 && 
                                <button className={ÅbenOpgaveCSS.markerSomFærdigKnap} onClick={() => færdiggørOpgave()}>Markér opgave som færdig</button>
                        )
                    }
                    {!opgave.virksomhed && !opgave.CVR && <OpretRegningModal user={user} opgave={opgave} setOpgave={setOpgave} opgaveID={opgaveID} posteringer={posteringer} setOpgaveAfsluttet={setOpgaveAfsluttet} åbnOpretRegningModal={åbnOpretRegningModal} setÅbnOpretRegningModal={setÅbnOpretRegningModal} vilBetaleMedMobilePay={vilBetaleMedMobilePay} setVilBetaleMedMobilePay={setVilBetaleMedMobilePay} opgaveLøstTilfredsstillende={opgaveLøstTilfredsstillende} setOpgaveLøstTilfredsstillende={setOpgaveLøstTilfredsstillende} allePosteringerUdfyldt={allePosteringerUdfyldt} setAllePosteringerUdfyldt={setAllePosteringerUdfyldt} useBetalMedFaktura={useBetalMedFaktura} totalFaktura={totalFaktura} />}
                    {(opgave.virksomhed || opgave.CVR) && <OpretFakturaModal user={user} opgave={opgave} setOpgave={setOpgave} opgaveID={opgaveID} posteringer={posteringer} setOpgaveAfsluttet={setOpgaveAfsluttet} åbnOpretFakturaModal={åbnOpretFakturaModal} setÅbnOpretFakturaModal={setÅbnOpretFakturaModal} vilBetaleMedMobilePay={vilBetaleMedMobilePay} setVilBetaleMedMobilePay={setVilBetaleMedMobilePay} opgaveLøstTilfredsstillende={opgaveLøstTilfredsstillende} setOpgaveLøstTilfredsstillende={setOpgaveLøstTilfredsstillende} allePosteringerUdfyldt={allePosteringerUdfyldt} setAllePosteringerUdfyldt={setAllePosteringerUdfyldt} useBetalMedFaktura={useBetalMedFaktura} totalFaktura={totalFaktura} setRedigerKundeModal={setRedigerKundeModal} redigerKundeModal={redigerKundeModal} />}
                    </div>
                </div>
                <AfslutUdenBetaling trigger={tvingAfslutOpgaveModal} setTrigger={setTvingAfslutOpgaveModal} opgave={opgave} updateOpgave={updateOpgave} setUpdateOpgave={setUpdateOpgave} />
                {posteringer.length > 0 && user.isAdmin && <div className={ÅbenOpgaveCSS.økonomiDiv}>
                    <b className={ÅbenOpgaveCSS.prefix}>Opgavens økonomi</b>
                    <div className={ÅbenOpgaveCSS.regnskabContainer}>
                        <b className={`${ÅbenOpgaveCSS.prefix} ${ÅbenOpgaveCSS.bottomMargin10}`}>Indtægter</b>
                        <p className={ÅbenOpgaveCSS.opgaveØkonomiGreenSubheading}>(kunden skal betale)</p>
                        {opgave.fakturaOprettesManuelt ? 
                        <>
                            {opgave.tilbudAfgivet 
                            ? 
                            <div className={ÅbenOpgaveCSS.regnskabRække}>
                                <span className={ÅbenOpgaveCSS.regnskabTekst}>Oprindeligt tilbud afgivet:</span>
                                <span className={ÅbenOpgaveCSS.regnskabTekst}>{opgave.tilbudAfgivet.toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                            </div>
                            :
                            <div className={ÅbenOpgaveCSS.regnskabRække}>
                                <span className={ÅbenOpgaveCSS.regnskabTekst}>Intet oprindeligt tilbud afgivet</span>
                                <span className={ÅbenOpgaveCSS.regnskabTekst}>0 kr.</span>
                            </div>}
                            <div className={`${ÅbenOpgaveCSS.subtotalRække} ${ÅbenOpgaveCSS.totalFakturaRække}`}>
                                <span className={ÅbenOpgaveCSS.subtotalFaktura}>Indtægter, i alt:</span>
                                <span className={ÅbenOpgaveCSS.subtotalFaktura}>{opgave.tilbudAfgivet ? opgave.tilbudAfgivet.toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 }) : 0} kr.</span>
                            </div>
                        </>
                        :
                        <>
                            {fastPrisTotalFaktura > 0 && <div className={ÅbenOpgaveCSS.regnskabRække}>
                                <span className={ÅbenOpgaveCSS.regnskabTekst}>Faste priser (i alt):</span>
                                <span className={ÅbenOpgaveCSS.regnskabTekst}>{fastPrisTotalFaktura.toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                            </div>}
                            {opstartTotalFaktura > 0 && <div className={ÅbenOpgaveCSS.regnskabRække}>
                                <span className={ÅbenOpgaveCSS.regnskabTekst}>Opstartsgebyrer (i alt):</span>
                                <span className={ÅbenOpgaveCSS.regnskabTekst}>{opstartTotalFaktura.toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                            </div>}
                            {handymanTotalFaktura > 0 && <div className={ÅbenOpgaveCSS.regnskabRække}>
                                <span className={ÅbenOpgaveCSS.regnskabTekst}>Handymantimer (i alt):</span>
                                <span className={ÅbenOpgaveCSS.regnskabTekst}>{handymanTotalFaktura.toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                            </div>}
                            {tømrerTotalFaktura > 0 && <div className={ÅbenOpgaveCSS.regnskabRække}>
                                <span className={ÅbenOpgaveCSS.regnskabTekst}>Tømrertimer (i alt):</span>
                                <span className={ÅbenOpgaveCSS.regnskabTekst}>{tømrerTotalFaktura.toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                            </div>}
                            {rådgivningOpmålingVejledningTotalFaktura > 0 && <div className={ÅbenOpgaveCSS.regnskabRække}>
                                <span className={ÅbenOpgaveCSS.regnskabTekst}>Rådgivning, opmåling og vejledning (i alt):</span>
                                <span className={ÅbenOpgaveCSS.regnskabTekst}>{rådgivningOpmålingVejledningTotalFaktura.toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                            </div>}
                            {aftenTillægTotalFaktura > 0 && <div className={ÅbenOpgaveCSS.regnskabRække}>
                                <span className={ÅbenOpgaveCSS.regnskabTekst}>Aftentillæg (i alt):</span>
                                <span className={ÅbenOpgaveCSS.regnskabTekst}>{aftenTillægTotalFaktura.toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                            </div>}
                            {natTillægTotalFaktura > 0 && <div className={ÅbenOpgaveCSS.regnskabRække}>
                                <span className={ÅbenOpgaveCSS.regnskabTekst}>Nattilæg (i alt):</span>
                                <span className={ÅbenOpgaveCSS.regnskabTekst}>{natTillægTotalFaktura.toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                            </div>}
                            {trailerTotalFaktura > 0 && <div className={ÅbenOpgaveCSS.regnskabRække}>
                                <span className={ÅbenOpgaveCSS.regnskabTekst}>Trailer (i alt):</span>
                                <span className={ÅbenOpgaveCSS.regnskabTekst}>{trailerTotalFaktura.toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                            </div>}
                            {udlægTotalFaktura > 0 && <div className={ÅbenOpgaveCSS.regnskabRække}>
                                <span className={ÅbenOpgaveCSS.regnskabTekst}>Udlæg (i alt):</span>
                                <span className={ÅbenOpgaveCSS.regnskabTekst}>{udlægTotalFaktura.toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                            </div>}
                            {rabatterTotalFaktura > 0 && <div className={ÅbenOpgaveCSS.regnskabRække}>
                                <span className={ÅbenOpgaveCSS.regnskabTekst}>Rabat (i alt):</span>
                                <span className={ÅbenOpgaveCSS.regnskabTekst}>- {rabatterTotalFaktura.toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                            </div>}
                            <div className={`${ÅbenOpgaveCSS.subtotalRække} ${ÅbenOpgaveCSS.totalFakturaRække}`}>
                                <span className={ÅbenOpgaveCSS.subtotalFaktura}>Indtægter, i alt:</span>
                                <span className={ÅbenOpgaveCSS.subtotalFaktura}>{totalFaktura.toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                            </div>
                        </>}
                        <b className={`${ÅbenOpgaveCSS.prefix} ${ÅbenOpgaveCSS.bottomMargin10}`}>Udgifter</b>
                        <p className={ÅbenOpgaveCSS.opgaveØkonomiRedSubheading}>{opgave && opgave.ansvarlig.length > 1 ? "(medarbejderne skal have)" : "(medarbejderen skal have)"}</p>
                        {fasteHonorarerTotal > 0 && <div className={ÅbenOpgaveCSS.regnskabRække}>
                                <span className={ÅbenOpgaveCSS.regnskabTekst}>Faste honorarer (i alt):</span>
                                <span className={ÅbenOpgaveCSS.regnskabTekst}>{fasteHonorarerTotal.toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                        </div>}
                        {opstartTotalHonorar > 0 && <div className={ÅbenOpgaveCSS.regnskabRække}>
                            <span className={ÅbenOpgaveCSS.regnskabTekst}>Opstartsgebyrer (i alt):</span>
                            <span className={ÅbenOpgaveCSS.regnskabTekst}>{opstartTotalHonorar.toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                        </div>}
                        {handymanTotalHonorar > 0 && <div className={ÅbenOpgaveCSS.regnskabRække}>
                            <span className={ÅbenOpgaveCSS.regnskabTekst}>Handymantimer (i alt):</span>
                            <span className={ÅbenOpgaveCSS.regnskabTekst}>{handymanTotalHonorar.toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                        </div>}
                        {tømrerTotalHonorar > 0 && <div className={ÅbenOpgaveCSS.regnskabRække}>
                            <span className={ÅbenOpgaveCSS.regnskabTekst}>Tømrertimer (i alt):</span>
                            <span className={ÅbenOpgaveCSS.regnskabTekst}>{tømrerTotalHonorar.toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                        </div>}
                        {rådgivningOpmålingVejledningTotalHonorar > 0 && <div className={ÅbenOpgaveCSS.regnskabRække}>
                            <span className={ÅbenOpgaveCSS.regnskabTekst}>Rådgivning, opmåling og vejledning (i alt):</span>
                            <span className={ÅbenOpgaveCSS.regnskabTekst}>{rådgivningOpmålingVejledningTotalHonorar.toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                        </div>}
                        {aftenTillægTotalHonorar > 0 && <div className={ÅbenOpgaveCSS.regnskabRække}>
                            <span className={ÅbenOpgaveCSS.regnskabTekst}>Aftentillæg (i alt):</span>
                            <span className={ÅbenOpgaveCSS.regnskabTekst}>{aftenTillægTotalHonorar.toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                        </div>}
                        {natTillægTotalHonorar > 0 && <div className={ÅbenOpgaveCSS.regnskabRække}>
                            <span className={ÅbenOpgaveCSS.regnskabTekst}>Nattilæg (i alt):</span>
                            <span className={ÅbenOpgaveCSS.regnskabTekst}>{natTillægTotalHonorar.toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                        </div>}
                        {trailerTotalHonorar > 0 && <div className={ÅbenOpgaveCSS.regnskabRække}>
                            <span className={ÅbenOpgaveCSS.regnskabTekst}>Trailer (i alt):</span>
                            <span className={ÅbenOpgaveCSS.regnskabTekst}>{trailerTotalHonorar.toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                        </div>}
                        {udlægTotalHonorar > 0 && <div className={ÅbenOpgaveCSS.regnskabRække}>
                            <span className={ÅbenOpgaveCSS.regnskabTekst}>Udlæg (i alt):</span>
                            <span className={ÅbenOpgaveCSS.regnskabTekst}>{udlægTotalHonorar.toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                        </div>}
                        {rabatterTotalHonorar > 0 && <div className={ÅbenOpgaveCSS.regnskabRække}>
                            <span className={ÅbenOpgaveCSS.regnskabTekst}>Rabat (i alt):</span>
                            <span className={ÅbenOpgaveCSS.regnskabTekst}>- {rabatterTotalHonorar.toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                        </div>}
                        <div className={`${ÅbenOpgaveCSS.subtotalRække} ${ÅbenOpgaveCSS.totalHonorarRække}`}>
                            <span className={ÅbenOpgaveCSS.subtotalHonorar}>Udgifter, i alt:</span>
                            <span className={ÅbenOpgaveCSS.subtotalHonorar}>{totalHonorar.toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                        </div>
                        {user.isAdmin && <>
                            <b className={`${ÅbenOpgaveCSS.prefix} ${ÅbenOpgaveCSS.bottomMargin10}`}>Total</b>
                            {opgave.fakturaOprettesManuelt ? 
                            <>
                                <div className={ÅbenOpgaveCSS.regnskabRække}>
                                    <span className={`${ÅbenOpgaveCSS.regnskabTekst} ${ÅbenOpgaveCSS.grønTekst}`}>Indtægter:</span>
                                    <span className={`${ÅbenOpgaveCSS.regnskabTekst} ${ÅbenOpgaveCSS.grønTekst}`}>{opgave.tilbudAfgivet ? opgave.tilbudAfgivet.toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 }) : "Intet tilbud afgivet."} kr.</span>
                                </div>
                                <div className={ÅbenOpgaveCSS.regnskabRække}>
                                    <span className={`${ÅbenOpgaveCSS.regnskabTekst} ${ÅbenOpgaveCSS.rødTekst}`}>Udgifter:</span>
                                    <span className={`${ÅbenOpgaveCSS.regnskabTekst} ${ÅbenOpgaveCSS.rødTekst}`}>{totalHonorar.toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                                </div>
                                <div className={ÅbenOpgaveCSS.dækningsbidragRække}>
                                    <span className={`${ÅbenOpgaveCSS.subtotalFaktura} ${ÅbenOpgaveCSS.sortTekst}`}>Dækningsbidrag:</span>
                                    <span className={`${ÅbenOpgaveCSS.subtotalFaktura} ${ÅbenOpgaveCSS.sortTekst}`}>{opgave.tilbudAfgivet ? (opgave.tilbudAfgivet - totalHonorar).toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 }) : (0 - totalHonorar).toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                                </div>
                            </>
                            :
                            <>
                                <div className={ÅbenOpgaveCSS.regnskabRække}>
                                    <span className={`${ÅbenOpgaveCSS.regnskabTekst} ${ÅbenOpgaveCSS.grønTekst}`}>Fakturabeløb:</span>
                                    <span className={`${ÅbenOpgaveCSS.regnskabTekst} ${ÅbenOpgaveCSS.grønTekst}`}>{totalFaktura.toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                                </div>
                                <div className={ÅbenOpgaveCSS.regnskabRække}>
                                    <span className={`${ÅbenOpgaveCSS.regnskabTekst} ${ÅbenOpgaveCSS.rødTekst}`}>Honorarbeløb:</span>
                                    <span className={`${ÅbenOpgaveCSS.regnskabTekst} ${ÅbenOpgaveCSS.rødTekst}`}>{totalHonorar.toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                                </div>
                                <div className={ÅbenOpgaveCSS.dækningsbidragRække}>
                                    <span className={`${ÅbenOpgaveCSS.subtotalFaktura} ${ÅbenOpgaveCSS.sortTekst}`}>Dækningsbidrag:</span>
                                    <span className={`${ÅbenOpgaveCSS.subtotalFaktura} ${ÅbenOpgaveCSS.sortTekst}`}>{(totalFaktura - totalHonorar).toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                                </div>
                            </>}
                        </>}
                    </div>
                </div>}
                <div className={ÅbenOpgaveCSS.kommentarer}>
                    {kommentarer.length > 0 ? <b className={ÅbenOpgaveCSS.prefix}>Kommentarer</b> : <b className={ÅbenOpgaveCSS.prefix}>Ingen kommentarer på denne opgave</b>}
                    <div className={ÅbenOpgaveCSS.kommentarListe}>
                        {kommentarer && kommentarer.map((kommentar) => {
                            return (
                                <div key={kommentar._id} className={ÅbenOpgaveCSS.kommentarContainer}>
                                    <div className={ÅbenOpgaveCSS.kommentar}>
                                        <div className={ÅbenOpgaveCSS.kommentarHeader}>
                                            <span className={ÅbenOpgaveCSS.kommentarForfatter}>{getBrugerName(kommentar.brugerID)}</span>
                                            <span className={ÅbenOpgaveCSS.kommentarDato}>{kommentar.createdAt.slice(0,10)}</span>
                                        </div>
                                        <p className={ÅbenOpgaveCSS.kommentarIndhold}>{kommentar.kommentarIndhold}</p>
                                    </div>
                                    <div className={ÅbenOpgaveCSS.kommentarKnapper}>   
                                        <button className={ÅbenOpgaveCSS.kommentarKnap} onClick={() => {setOpenCommentModalID(kommentar._id), setEditedComment(kommentar.kommentarIndhold)}}>Rediger</button>
                                        <Modal trigger={openCommentModalID === kommentar._id} setTrigger={setOpenCommentModalID}>
                                                <h2 className={ÅbenOpgaveCSS.modalHeading}>Rediger kommentar</h2>
                                                <form className={ÅbenOpgaveCSS.editKommentarForm} onSubmit={(e) => {
                                                    e.preventDefault();
                                                    editKommentar(kommentar._id);
                                                }}>
                                                    <textarea className={ÅbenOpgaveCSS.redigerKommentarInput} type="text" value={editedComment} onChange={(e) => setEditedComment(e.target.value)} />
                                                    <button className={ÅbenOpgaveCSS.registrerPosteringButton} type="submit">Opdater kommentar</button>
                                                </form>
                                        </Modal>
                                        <button className={ÅbenOpgaveCSS.kommentarKnap} onClick={() => {sletKommentar(kommentar._id)}}>Slet</button>
                                        <span className={ÅbenOpgaveCSS.kommentarRegigeretMarkør}>{kommentar.createdAt === kommentar.updatedAt ? null : "Redigeret"}</span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                    <form>
                        <textarea 
                            type="text" 
                            className={ÅbenOpgaveCSS.nyKommentar} 
                            placeholder='Skriv en kommentar til opgaven ...' 
                            value={kommentar} 
                            onChange={(e) => setKommentar(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault();
                                  submitKommentar();
                                }
                              }}
                        />
                    </form>
                </div>

            </div>
            </PageAnimation>
        </div>
  )
}

export default ÅbenOpgave
