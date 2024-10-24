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
import { Base64 } from 'js-base64';
import SwitcherStyles from './Switcher.module.css'

const ÅbenOpgave = () => {
    
    const {user} = useAuthContext();
    
    if (!user) {
        return
    }

    const { opgaveID } = useParams();
    // const userID = user.id;
    const navigate = useNavigate();

    // state managers
    const { egneLedigeTider, alleLedigeTider, egneBesøg, alleBesøg, setEgneLedigeTider, setEgneBesøg, refetchLedigeTider, refetchBesøg, setRefetchLedigeTider, setRefetchBesøg, setAlleLedigeTider, setAlleBesøg, userID } = useBesøg();
    const [opgave, setOpgave] = useState(null);
    const [loading, setLoading] = useState(true);
    const [opgaveBeskrivelse, setOpgaveBeskrivelse] = useState(null);
    const [status, setStatus] = useState("");
    const [brugere, setBrugere] = useState(null);
    const [nuværendeAnsvarlige, setNuværendeAnsvarlige] = useState(null);
    const [navn, setNavn] = useState("");
    const [adresse, setAdresse] = useState("");
    const [onsketDato, setOnsketDato] = useState("");
    const [harStige, setHarStige] = useState(false);
    const [telefon, setTelefon] = useState("");
    const [email, setEmail] = useState("");
    const [timer, setTimer] = useState(null);
    const [openModal, setOpenModal] = useState(false);
    const [openCommentModalID, setOpenCommentModalID] = useState(null);
    const [openPosteringModalID, setOpenPosteringModalID] = useState(null);
    const [editedComment, setEditedComment] = useState("");
    const [editedPostering, setEditedPostering] = useState("");
    const [outlays, setOutlays] = useState([]);
    const [øvrige, setØvrige] = useState([]);
    const [handymantimer, setHandymantimer] = useState("");
    const [tømrertimer, setTømrertimer] = useState("");
    const [posteringDato, setPosteringDato] = useState(dayjs().format('YYYY-MM-DD'));
    const [posteringBeskrivelse, setPosteringBeskrivelse] = useState("");
    const [inkluderOpstart, setInkluderOpstart] = useState(200);
    const [postering, setPostering] = useState("");
    const [posteringer, setPosteringer] = useState("");
    const [kommentar, setKommentar] = useState("");
    const [kommentarer, setKommentarer] = useState([]);
    const [færdiggjort, setFærdiggjort] = useState(false);
    const [opgaveAfsluttet, setOpgaveAfsluttet] = useState(false)
    const [bekræftIndsendelseModal, setBekræftIndsendelseModal] = useState(false);
    const [ledigeTider, setLedigeTider] = useState(null)
    const [visUddelegeringskalender, setVisUddelegeringskalender] = useState(false)
    const [openBesøgModal, setOpenBesøgModal] = useState(false)
    const [selectedOpgaveDate, setSelectedOpgaveDate] = useState(null)
    const [planlægBesøgFraTidspunkt, setPlanlægBesøgFraTidspunkt] = useState("08:00")
    const [planlægBesøgTilTidspunkt, setPlanlægBesøgTilTidspunkt] = useState("12:00")
    // const [alleBesøg, setAlleBesøg] = useState([])
    const [planlagteOpgaver, setPlanlagteOpgaver] = useState(null)
    const [triggerPlanlagteOpgaver, setTriggerPlanlagteOpgaver] = useState(false)
    // const [egneBesøg, setEgneBesøg] = useState([])
    // const [egneLedigeTider, setEgneLedigeTider] = useState([])
    const [visKalender, setVisKalender] = useState(false)
    const [opretBesøgError, setOpretBesøgError] = useState("")
    const [triggerLedigeTiderRefetch, setTriggerLedigeTiderRefetch] = useState(false)
    const [kvitteringBillede, setKvitteringBillede] = useState(null)
    const [opgaveLøstTilfredsstillende, setOpgaveLøstTilfredsstillende] = useState(false)
    const [allePosteringerUdfyldt, setAllePosteringerUdfyldt] = useState(false)
    const [vilBetaleMedMobilePay, setVilBetaleMedMobilePay] = useState(false)
    const [invoiceImage, setInvoiceImage] = useState(null)

    const { chosenTask, setChosenTask } = useTaskAndDate();
    const initialDate = opgave && opgave.onsketDato ? dayjs(opgave.onsketDato) : null;
    const [selectedDate, setSelectedDate] = useState(initialDate);
    const [, forceUpdate] = useReducer(x => x + 1, 0);
    const [openDialog, setOpenDialog] = useState(false)
    const [eventData, setEventData] = useState(null)
    const [tilknyttetOpgave, setTilknyttetOpgave] = useState(null)
    const [aktueltBesøg, setAktueltBesøg] = useState(null)

    useEffect(() => {
        console.log(outlays);
    }, [outlays]);
    
    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API_URL}/brugere`, {
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        })
        .then(res => {
            setBrugere(res.data)
            console.log(res.data)
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
    
      const handleOutlayChange = (index, event) => {
        const newOutlays = [...outlays];
        newOutlays[index][event.target.name] = event.target.value;
        setOutlays(newOutlays);
    };

    const handleØvrigeChange = (index, event) => {
        const newØvrige = [...øvrige];
        newØvrige[index][event.target.name] = event.target.value;
        setØvrige(newØvrige);
    }

    const addOutlay = (e) => {
        e.preventDefault();
        setOutlays([...outlays, { beskrivelse: '', beløb: '', kvittering: '' }]);
    }

    const addØvrig = (e) => {
        e.preventDefault();
        setØvrige([...øvrige, { description: '', amount: '' }]);
    }

    const deleteOutlay = (index) => {
        const newOutlays = [...outlays];
        const deletedOutlay = newOutlays.splice(index, 1)[0];
        setOutlays(newOutlays);

        if (deletedOutlay.kvittering) {
            axios.delete(`${import.meta.env.VITE_API_URL}${deletedOutlay.kvittering}`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            })
            .catch(error => console.log(error));
        }
    };

    const deleteØvrig = (index) => {
        const newØvrige = [...øvrige];
        const deletedØvrig = newØvrige.splice(index, 1)[0];
        setØvrige(newØvrige);

        if (deletedØvrig.kvittering) {
            axios.delete(`${import.meta.env.VITE_API_URL}${deletedØvrig.kvittering}`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            })
            .catch(error => console.log(error));
        }
    };

    function tilføjPostering (e) {
        
        const total = (handymantimer * 300) + (tømrertimer * 360) + inkluderOpstart + (outlays.reduce((sum, item) => sum + Number(item.beløb), 0)) + (øvrige.reduce((sum, item) => sum + Number(item.beløb), 0));
        
        const postering = {
            dato: posteringDato,
            handymanTimer: handymantimer,
            tømrerTimer: tømrertimer,
            udlæg: outlays,
            øvrigt: øvrige,
            opgaveID: opgaveID,
            brugerID: userID,
            opstart: inkluderOpstart,
            beskrivelse: posteringBeskrivelse,
            total: total
        }

        axios.post(`${import.meta.env.VITE_API_URL}/posteringer/`, postering, {
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        })
        .then(res => {
            setOpenModal(false);
            setPosteringDato("");
            setHandymantimer("");
            setTømrertimer("");
            setOutlays([]);
            setØvrige([]);
        })
        .catch(error => console.log(error))
    }

    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API_URL}/opgaver/${opgaveID}`, {
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        })
        .then(res => {
            setOpgave(res.data);
            setOpgaveBeskrivelse(res.data.opgaveBeskrivelse);
            setStatus(res.data.status);
            setNavn(res.data.navn);
            setNuværendeAnsvarlige(res.data.ansvarlig)
            setAdresse(res.data.adresse);
            setHarStige(res.data.harStige);
            setTelefon(res.data.telefon);
            setEmail(res.data.email);
            setFærdiggjort(res.data.markeretSomFærdig);
            setLoading(false);
        })
        .catch(error => console.log(error))
    }, [])

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
    }, [openModal])

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
        backgroundColor: status === "accepteret" ? 'rgba(89, 191, 26, 0.25)' : status === "afventerSvar" ? 'rgba(224, 227, 50, 0.25)' : status === "afvist" ? 'rgba(193, 26, 57, 0.25)' : 'white',
        color: status === "accepteret" ? 'rgba(89, 191, 26, 1)' : status === "afventerSvar" ? 'rgba(179, 116, 0, 0.85)' : status === "afvist" ? 'rgba(193, 26, 57, 1)' : '#333333'
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
                console.log(res.data);
            })
            .catch(error => console.log(error));
        }
    }

    function fjernAnsvarlig(ansvarligDerSkalFjernes){
        const opdateredeAnsvarlige = nuværendeAnsvarlige.filter(ansvarlig => ansvarlig !== ansvarligDerSkalFjernes);

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

            // Delete files associated with øvrigt
            postering.øvrigt.forEach(øvrigt => {
                if (øvrigt.kvittering) {
                    axios.delete(`${import.meta.env.VITE_API_URL}${øvrigt.kvittering}`, {
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
        const genåbn = {
            markeretSomFærdig: false,
            opgaveAfsluttet: false
        }

        if (opgave.opgaveAfsluttet) {
            if (window.confirm("Der er allerede en faktura oprettet for denne opgave. Hvis du genåbner opgaven for at foretage ændringer i posteringerne skal du huske manuelt at kreditere den tidligere faktura i dit regnskabssystem, og gøre kunden opmærksom på dette.")) {
                axios.patch(`${import.meta.env.VITE_API_URL}/opgaver/${opgaveID}`, genåbn, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    }
                })
                .then(response => {
                    setFærdiggjort(false);
                })
                .catch(error => console.log(error))
            } 
        } else {
            if (window.confirm("Der er endnu ikke oprettet en faktura eller modtaget betaling for denne opgave. Du kan frit genåbne og ændre.")) {
                axios.patch(`${import.meta.env.VITE_API_URL}/opgaver/${opgaveID}`, genåbn, {
                        headers: {
                            'Authorization': `Bearer ${user.token}`
                        }
                    })
                    .then(response => {
                        setFærdiggjort(false);
                    })
                    .catch(error => console.log(error))
            }
        }  
    }

    function bekræftIndsendelseTilEconomic () {
        setBekræftIndsendelseModal(true);
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

            if (postering.øvrigt && postering.øvrigt.length > 0) {
                postering.øvrigt.forEach(posteringØvrig => {
                    lines.push({
                        lineNumber: lineNumber++,
                        description: `${posteringØvrig.beskrivelse}`,
                        product: {
                            productNumber: "3"
                        },
                        quantity: 1,
                        unitNetPrice: posteringØvrig.beløb,
                        discountPercentage: 0.00
                    })
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
                        opgaveAfsluttet: true
                    }, {
                        headers: authHeaders
                    })
                    .then(res => {
                        setOpgaveAfsluttet(true);
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
                                                "text": `Kære ${opgave.navn},\n\nTusind tak fordi du valgte at være kunde hos Better Call Bob.\n\nDu kan se din regning på dette link: ${fullFakturaPDFUrl}`,
                                                "from": "Bob",
                                                "flash": false,
                                                "encoding": "gsm7"
                                            }
                                        ]
                                    }

                                    // "sendTime": `${dayjs().format("YYYY-MM-DDTHH:mm:ssZ")}`,

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
    const opstartTotalHonorar = posteringer && posteringer.reduce((akk, nuv) => akk + (nuv.opstart || 0), 0);
    const handymanTotalHonorar = posteringer && (posteringer.reduce((akk, nuv) => akk + (nuv.handymanTimer || 0), 0)) * 300;
    const tømrerTotalHonorar = posteringer && (posteringer.reduce((akk, nuv) => akk + (nuv.tømrerTimer || 0), 0) * 360);
    const udlægTotalHonorar = posteringer && posteringer.reduce((akk, nuv) => {
        const udlægSum = nuv.udlæg.reduce((sum, udlæg) => sum + (parseFloat(udlæg.beløb) || 0), 0);
        return akk + udlægSum;
    }, 0);
    const øvrigtTotalHonorar = posteringer && posteringer.reduce((akk, nuv) => {
        const øvrigSum = nuv.øvrigt.reduce((sum, øvrig) => sum + (parseFloat(øvrig.beløb) || 0), 0);
        return akk + øvrigSum;
    }, 0);

    const totalHonorar = opstartTotalHonorar + handymanTotalHonorar + tømrerTotalHonorar + udlægTotalHonorar + øvrigtTotalHonorar;

    // konstanter til regnskabsopstillingen -- FAKTURA --
    const opstartTotalFaktura = posteringer && Math.round((posteringer.reduce((akk, nuv) => akk + (nuv.opstart || 0), 0)) / 200 * 319.2);
    const handymanTotalFaktura = posteringer && Math.round((posteringer.reduce((akk, nuv) => akk + (nuv.handymanTimer || 0), 0)) * 447.2);
    const tømrerTotalFaktura = posteringer && Math.round((posteringer.reduce((akk, nuv) => akk + (nuv.tømrerTimer || 0), 0)) * 480);
    const udlægTotalFaktura = posteringer && posteringer.reduce((akk, nuv) => {
        const udlægSum = nuv.udlæg.reduce((sum, udlæg) => sum + (parseFloat(udlæg.beløb) || 0), 0);
        return akk + udlægSum;
    }, 0);
    const øvrigtTotalFaktura = posteringer && posteringer.reduce((akk, nuv) => {
        const øvrigSum = nuv.øvrigt.reduce((sum, øvrig) => sum + (parseFloat(øvrig.beløb) || 0), 0);
        return akk + øvrigSum;
    }, 0);
    const administrationsgebyr = vilBetaleMedMobilePay ? 0 : 50;

    const totalFaktura = opstartTotalFaktura + handymanTotalFaktura + tømrerTotalFaktura + udlægTotalFaktura + øvrigtTotalFaktura + administrationsgebyr;

    function openOrDownloadPDF(base64PDF, fileName = 'faktura.pdf') {
        const base64String = base64PDF.includes('dataapplication/octet+streambase64') ? base64PDF.split('dataapplication/octet+streambase64')[1] : base64PDF;
        const byteCharacters = atob(base64String);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
    
        // Create a blob and download the PDF
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);

        // Open the PDF in a new tab
        window.open(url, '_blank');
    }

    return (
    
        <div className={ÅbenOpgaveCSS.primærContainer}>
            <PageAnimation>
            <div className={ÅbenOpgaveCSS.tilbageOpgaveSektion}>
                <img src={BackIcon} alt="" onClick={() => navigate(-1)} className={ÅbenOpgaveCSS.tilbageKnap} />
                <div>
                    <b className={ÅbenOpgaveCSS.opgaveIDHeader}>Opgave #{opgave._id.slice(opgave._id.length - 3, opgave._id.length)} på</b>
                    <h2 className={ÅbenOpgaveCSS.adresseHeading}>{opgave.adresse}</h2>
                    <a href={`https://maps.google.com/?q=${opgave.adresse}`} target="_blank" className={ÅbenOpgaveCSS.kortLink}>🌍 Find på kort</a>
                </div>
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
                        <div>
                            <b className={`${ÅbenOpgaveCSS.prefix} ${ÅbenOpgaveCSS.kundeHeading}`}>Kunde: <span className={ÅbenOpgaveCSS.postfix}>{opgave.navn}</span></b>
                            <div className={ÅbenOpgaveCSS.kundeKontaktDesktop}>
                                <p className={`${ÅbenOpgaveCSS.marginTop10}`}>📞 <a className={`${ÅbenOpgaveCSS.postfix} ${ÅbenOpgaveCSS.link}`} href={"tel:" + opgave.telefon}>{opgave.telefon}</a></p>
                                <p>✉️ <a className={`${ÅbenOpgaveCSS.postfix} ${ÅbenOpgaveCSS.link}`} href={"mailto:" + opgave.email}>{opgave.email}</a></p>
                            </div>
                            <div className={ÅbenOpgaveCSS.kundeKontaktMobile}>
                                <a className={`${ÅbenOpgaveCSS.postfix} ${ÅbenOpgaveCSS.link}`} href={"tel:" + opgave.telefon}>Ring op</a>
                                <a className={`${ÅbenOpgaveCSS.postfix} ${ÅbenOpgaveCSS.link}`} href={"mailto:" + opgave.email}>Send en mail</a>
                            </div>
                        </div>
                        <div className={ÅbenOpgaveCSS.opgavestatusContainerDesktop}>
                            <b className={ÅbenOpgaveCSS.prefix}>Opgavestatus{færdiggjort ? ": " : null}</b>{færdiggjort ? <span className={ÅbenOpgaveCSS.statusTekstVedFærdiggjort}>{status}</span> : null}
                            {færdiggjort ? null : <form className={`${ÅbenOpgaveCSS.opgavestatusForm} ${ÅbenOpgaveCSS.marginTop10}`}>
                                <select style={conditionalStyles} name="opgavestatus" className={ÅbenOpgaveCSS.opgavestatus} onChange={opdaterOpgavestatus} value={status}>
                                    <option value="modtaget">Opgave modtaget</option>
                                    <option value="afventerSvar">Sendt tilbud</option>
                                    <option value="accepteret">Tilbud accepteret</option>
                                    <option value="afvist">Tilbud afvist</option>
                                </select>
                            </form>}
                        </div>
                        <div className={ÅbenOpgaveCSS.opgavestatusContainerMobile}>
                            {færdiggjort ? null : <form className={`${ÅbenOpgaveCSS.opgavestatusForm} ${ÅbenOpgaveCSS.marginTop10}`}>
                                <select style={conditionalStyles} name="opgavestatus" className={ÅbenOpgaveCSS.opgavestatus} onChange={opdaterOpgavestatus} value={status}>
                                    <option value="modtaget">Opgave modtaget</option>
                                    <option value="afventerSvar">Sendt tilbud</option>
                                    <option value="accepteret">Tilbud accepteret</option>
                                    <option value="afvist">Tilbud afvist</option>
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
                                    <p key={ansvarlig._id}>{ansvarlig.navn}{færdiggjort ? null : <button className={ÅbenOpgaveCSS.fjernAnsvarlig} onClick={() => {fjernAnsvarlig(ansvarlig)}}>-</button>}</p>
                                )
                            })}
                            </div>
                        </div>
                    </div>
                    <div className={`${ÅbenOpgaveCSS.uddelegeringMobile}`}>
                        {færdiggjort ? null : user.isAdmin && <form className={ÅbenOpgaveCSS.tildelAnsvarligeForm} action="">

                            <select className={ÅbenOpgaveCSS.tildelAnsvarlige} defaultValue="Tildel ansvarlig til opgaven ..." name="vælgBob" onChange={tildelAnsvar}>
                                <option disabled>Tildel ansvarlig til opgaven ...</option>
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
                                    <p key={ansvarlig._id}>{ansvarlig.navn}{færdiggjort ? null : <button className={ÅbenOpgaveCSS.fjernAnsvarlig} onClick={() => {fjernAnsvarlig(ansvarlig)}}>-</button>}</p>
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
                                                {postering.øvrigt.map((øvrigt, index) => {
                                                    return øvrigt.kvittering ? 
                                                    <img 
                                                    key={`øvrigt-${index}`}
                                                    className={ÅbenOpgaveCSS.kvitteringBillede} 
                                                    src={`${import.meta.env.VITE_API_URL}${øvrigt.kvittering}`} 
                                                    alt={øvrigt.beskrivelse} 
                                                    onClick={() => {
                                                        setKvitteringBillede(øvrigt.kvittering);
                                                    }}/> 
                                                    : 
                                                    null;
                                                })}
                                            </div>
                                        </div>
                                        <div className={ÅbenOpgaveCSS.posteringListe}>
                                            <div className={ÅbenOpgaveCSS.posteringRække}>
                                                <span className={ÅbenOpgaveCSS.posteringRækkeBeskrivelse}>Opstart: </span>
                                                <span>{(postering.opstart ? postering.opstart : "0") + " kr."}</span>
                                            </div>
                                            <div className={ÅbenOpgaveCSS.posteringRække}>
                                                <span className={ÅbenOpgaveCSS.posteringRækkeBeskrivelse}>{postering.handymanTimer} timer (handyman): </span>
                                                <span>{(postering.handymanTimer * 300) + " kr."}</span>
                                            </div>
                                            <div className={ÅbenOpgaveCSS.posteringRække}>
                                                <span className={ÅbenOpgaveCSS.posteringRækkeBeskrivelse}>{postering.tømrerTimer} timer (tømrer): </span>
                                                <span>{(postering.tømrerTimer * 360) + " kr."}</span>
                                            </div>
                                            <div className={ÅbenOpgaveCSS.posteringRække}>
                                                <span className={ÅbenOpgaveCSS.posteringRækkeBeskrivelse}>{postering.udlæg.length > 0 ? postering.udlæg.length : 0} udlæg: </span>
                                                <span>{postering.udlæg.reduce((sum, item) => sum + Number(item.beløb), 0) + " kr."}</span>
                                            </div>
                                            <div className={ÅbenOpgaveCSS.posteringRække}>
                                                <span className={ÅbenOpgaveCSS.posteringRækkeBeskrivelse}>{postering.øvrigt.length > 0 ? postering.øvrigt.length : 0} øvrigt: </span>
                                                <span>{postering.øvrigt.reduce((sum, item) => sum + Number(item.beløb), 0) + " kr."}</span>
                                            </div>
                                            <div className={ÅbenOpgaveCSS.totalRække}>
                                                <b className={ÅbenOpgaveCSS.totalRækkeBeskrivelse}>Total: </b>
                                                <b className={ÅbenOpgaveCSS.totalRækkeResultat}>{postering.total + " kr."}</b>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={ÅbenOpgaveCSS.posteringKnapper}>
                                        {færdiggjort ? null : <button className={ÅbenOpgaveCSS.posteringKnap} onClick={() => {setOpenPosteringModalID(postering._id), setEditedPostering(postering)}}>Rediger</button>}
                                        <Modal trigger={openPosteringModalID === postering._id} setTrigger={setOpenPosteringModalID}>
                                                <h2 className={ÅbenOpgaveCSS.modalHeading}>Rediger {getBrugerName(editedPostering.brugerID).split(" ")[0]}s postering</h2>
                                                <form className={ÅbenOpgaveCSS.editKommentarForm} onSubmit={(e) => {
                                                    e.preventDefault();
                                                    // console.log(editedPostering)
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
                                                    <div className={ÅbenOpgaveCSS.udlæg}>
                                                        <h3 className={ÅbenOpgaveCSS.modalHeading3}>Øvrige</h3>
                                                        <div className={ÅbenOpgaveCSS.listeOverUdlæg}>
                                                        {(editedPostering.øvrigt || []).map((øvrig, index) => (
                                                            <div className={ÅbenOpgaveCSS.enkeltUdlæg} key={index}>
                                                                <div className={ÅbenOpgaveCSS.udlægKvittering}>
                                                                    {øvrig.kvittering ? (
                                                                        <img className={ÅbenOpgaveCSS.udlægKvitteringImg} src={`${import.meta.env.VITE_API_URL}${øvrig.kvittering}`} alt={øvrig.beskrivelse} />
                                                                    ) : (
                                                                        <label>
                                                                            <div className={ÅbenOpgaveCSS.udlægKvitteringInputContainer} onClick={() => document.getElementById(`øvrig-file-input-${index}`).click()}>
                                                                            </div>
                                                                            <input
                                                                                type="file"
                                                                                accept="image/*"
                                                                                className={ÅbenOpgaveCSS.udlægKvitteringInput}
                                                                                id={`øvrig-file-input-${index}`}
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
                                                                                        const updatedØvrig = { ...editedPostering.øvrigt[index], kvittering: res.data.filePath }; // Ensure kvittering is updated correctly
                                                                                        const newØvrigt = [...editedPostering.øvrigt];
                                                                                        newØvrigt[index] = updatedØvrig; // Replace the øvrig at index
                                                                                        setEditedPostering({...editedPostering, øvrigt: newØvrigt});
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
                                                                        value={øvrig.beskrivelse}
                                                                        onChange={(e) => {
                                                                            const newØvrigt = [...editedPostering.øvrigt];
                                                                            newØvrigt[index].beskrivelse = e.target.value;
                                                                            setEditedPostering({...editedPostering, øvrigt: newØvrigt});
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
                                                                        value={øvrig.beløb}
                                                                        onChange={(e) => {
                                                                            const newØvrigt = [...editedPostering.øvrigt];
                                                                            newØvrigt[index].beløb = e.target.value;
                                                                            setEditedPostering({...editedPostering, øvrigt: newØvrigt});
                                                                        }}
                                                                    />
                                                                </div>
                                                                <button className={ÅbenOpgaveCSS.sletUdlægButton} onClick={async (e) => {
                                                                    e.preventDefault();
                                                                    const deletedØvrig = editedPostering.øvrigt[index];
                                                                    const newØvrigt = editedPostering.øvrigt.filter((_, i) => i !== index);
                                                                    setEditedPostering({...editedPostering, øvrigt: newØvrigt});
                                                                    
                                                                    if (deletedØvrig.kvittering) {
                                                                        try {
                                                                            await axios.delete(`${import.meta.env.VITE_API_URL}${deletedØvrig.kvittering}`, {
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
                                                            const newØvrigt = [...editedPostering.øvrigt, { beskrivelse: "", beløb: "" }];
                                                            setEditedPostering({...editedPostering, øvrigt: newØvrigt});
                                                        }}>+ Ny øvrig</button>
                                                        </div>
                                                    </div>
                                                    <button className={ÅbenOpgaveCSS.registrerPosteringButton} type="submit">Opdater postering</button>
                                                </form>
                                        </Modal>
                                        {færdiggjort ? null : <button className={ÅbenOpgaveCSS.posteringKnap} onClick={() => {sletPostering(postering._id)}}>Slet</button>}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                    {færdiggjort ? null : <button onClick={() => setOpenModal(true)} className={ÅbenOpgaveCSS.tilføjPosteringButton}>+ Ny postering</button>}
                    <Modal trigger={openModal} setTrigger={setOpenModal}>
                    <h2 className={ÅbenOpgaveCSS.modalHeading}>Ny postering 📄</h2>
                            <form className={ÅbenOpgaveCSS.modalForm} onSubmit={(e) => {
                                e.preventDefault();
                                tilføjPostering();
                            }}>
                                <label className={ÅbenOpgaveCSS.prefix} htmlFor="">Vælg dato ...</label>
                                <input className={ÅbenOpgaveCSS.modalInput} type="date" value={posteringDato} onChange={(e) => setPosteringDato(e.target.value)} />
                                <label className={ÅbenOpgaveCSS.prefix} htmlFor="">Beskrivelse</label>
                                <textarea className={ÅbenOpgaveCSS.modalInput} type="text" value={posteringBeskrivelse} onChange={(e) => setPosteringBeskrivelse(e.target.value)} />
                                <div className={ÅbenOpgaveCSS.opstartsgebyrDiv}>
                                    <input className={ÅbenOpgaveCSS.posteringCheckbox} type="checkbox" checked={inkluderOpstart === 200 ? true : false} onChange={(e) => setInkluderOpstart(inkluderOpstart === 200 ? 0 : 200)}/>
                                    <label className={ÅbenOpgaveCSS.prefix}>Inkludér opstartsgebyr (kr. 200,-)</label>
                                </div>
                                <div className={ÅbenOpgaveCSS.modalKolonner}>
                                    <div>
                                        <label className={ÅbenOpgaveCSS.prefix} htmlFor="">Antal handymantimer:</label>
                                        <input className={ÅbenOpgaveCSS.modalInput} value={handymantimer} onChange={(e) => setHandymantimer(e.target.value)} type="number" />
                                    </div>
                                    <div>
                                        <label className={ÅbenOpgaveCSS.prefix} htmlFor="">Antal tømrertimer:</label>
                                        <input className={ÅbenOpgaveCSS.modalInput} value={tømrertimer} onChange={(e) => setTømrertimer(e.target.value)} type="number" />
                                    </div>
                                </div>
                                
                                <div className={ÅbenOpgaveCSS.udlæg}>
                                    <h3 className={ÅbenOpgaveCSS.modalHeading3}>Udlæg</h3>
                                    <div className={ÅbenOpgaveCSS.listeOverUdlæg}>
                                    {outlays.map((outlay, index) => (
                                        <div className={ÅbenOpgaveCSS.enkeltUdlæg} key={index}>
                                            <div className={ÅbenOpgaveCSS.udlægKvittering}>
                                                {outlay.kvittering ? (
                                                    <img className={ÅbenOpgaveCSS.udlægKvitteringImg} src={`${import.meta.env.VITE_API_URL}${outlay.kvittering}`} alt={outlay.beskrivelse} />
                                                ) : (
                                                    <label>
                                                        <div className={ÅbenOpgaveCSS.udlægKvitteringInputContainer} onClick={() => document.getElementById(`ny-udlæg-file-input-${index}`).click()}>
                                                        </div>
                                                        <input
                                                            id={`ny-udlæg-file-input-${index}`}
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
                                                                    const updatedOutlay = { ...outlays[index], kvittering: res.data.filePath }; // Ensure kvittering is updated correctly
                                                                    const newOutlays = [...outlays];
                                                                    newOutlays[index] = updatedOutlay; // Replace the outlay at index
                                                                    setOutlays(newOutlays);
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
                                                    onChange={(e) => handleOutlayChange(index, e)}
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
                                                    onChange={(e) => handleOutlayChange(index, e)}
                                                />
                                            </div>
                                            <button className={ÅbenOpgaveCSS.sletUdlægButton} onClick={(e) => {e.preventDefault(); deleteOutlay(index)}}>-</button>
                                        </div>
                                    ))}
                                    <button className={ÅbenOpgaveCSS.tilføjUdlægButton} onClick={addOutlay}>+ Nyt udlæg</button>
                                    </div>
                                    
                                </div>
                                <div className={ÅbenOpgaveCSS.udlæg}>
                                    <h3 className={ÅbenOpgaveCSS.modalHeading3}>Øvrige</h3>
                                    <div className={ÅbenOpgaveCSS.listeOverUdlæg}>
                                    {øvrige.map((øvrig, index) => (
                                        <div className={ÅbenOpgaveCSS.enkeltUdlæg} key={index}>
                                            <div className={ÅbenOpgaveCSS.udlægKvittering}>
                                                {øvrig.kvittering ? (
                                                    <img className={ÅbenOpgaveCSS.udlægKvitteringImg} src={`${import.meta.env.VITE_API_URL}${øvrig.kvittering}`} alt={øvrig.beskrivelse} />
                                                ) : (
                                                    <label>
                                                        <div className={ÅbenOpgaveCSS.udlægKvitteringInputContainer} onClick={() => document.getElementById(`ny-øvrig-file-input-${index}`).click()}>
                                                        </div>
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            className={ÅbenOpgaveCSS.udlægKvitteringInput}
                                                            id={`ny-øvrig-file-input-${index}`}
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
                                                                    const updatedØvrige = { ...øvrige[index], kvittering: res.data.filePath }; // Ensure kvittering is updated correctly
                                                                    const newØvrige = [...øvrige];
                                                                    newØvrige[index] = updatedØvrige; // Replace the outlay at index
                                                                    setØvrige(newØvrige);
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
                                                    value={øvrig.beskrivelse}
                                                    onChange={(e) => handleØvrigeChange(index, e)}
                                                />
                                            </div>
                                            <div className={ÅbenOpgaveCSS.udlægBeløb}>
                                                <label className={ÅbenOpgaveCSS.prefix} htmlFor={`beløb-${index}`}>Beløb:</label>
                                                <input
                                                    type="number"
                                                    className={ÅbenOpgaveCSS.udlægInput}
                                                    name="beløb"
                                                    id={`beløb-${index}`}
                                                    value={øvrig.beløb}
                                                    onChange={(e) => handleØvrigeChange(index, e)}
                                                />
                                            </div>
                                            <button className={ÅbenOpgaveCSS.sletUdlægButton} onClick={(e) => {e.preventDefault(); deleteØvrig(index)}}>-</button>
                                        </div>
                                    ))}
                                    <button className={ÅbenOpgaveCSS.tilføjUdlægButton} onClick={addØvrig}>+ Ny øvrig</button>
                                    </div>
                                    
                                </div>
                                <button className={ÅbenOpgaveCSS.registrerPosteringButton} type="submit">Registrér postering</button>
                            </form>
                    </Modal>
                    <div>
                    {færdiggjort ? <div className={ÅbenOpgaveCSS.færdigOpgaveDiv}><p className={ÅbenOpgaveCSS.prefix}>Opgaven er markeret som færdig og låst.</p><button className={ÅbenOpgaveCSS.genåbnButton} onClick={() => åbnForÆndringer()}>Genåbn for ændringer</button><button className={ÅbenOpgaveCSS.indsendTilEconomicButton} onClick={() => bekræftIndsendelseTilEconomic()}>Opret regning</button></div> : posteringer.length > 0 && <button className={ÅbenOpgaveCSS.markerSomFærdigKnap} onClick={() => færdiggørOpgave()}>Markér opgave som færdig</button>}
                    <Modal trigger={bekræftIndsendelseModal} setTrigger={setBekræftIndsendelseModal}>
                        <h2 className={ÅbenOpgaveCSS.modalHeading} style={{paddingRight: 20}}>Opret regning</h2>
                        <form action="">
                            <p className={ÅbenOpgaveCSS.bottomMargin10}>Du er ved at oprette en regning til kunden på i alt <b className={ÅbenOpgaveCSS.bold}>{(totalFaktura * 1.25).toLocaleString('da-DK')} kr.</b> inkl. moms ({totalFaktura.toLocaleString('da-DK')} kr. ekskl. moms).</p>
                            <p>Når regningen er oprettet vil den automatisk blive sendt til kundens e-mail.</p>
                        <div className={ÅbenOpgaveCSS.bekræftIndsendelseDiv}>
                            <b className={ÅbenOpgaveCSS.bold}>Bekræft følgende:</b>
                            <div className={SwitcherStyles.checkboxContainer}>
                                <label className={SwitcherStyles.switch} htmlFor="vilBetaleMedDetSamme">
                                    <input type="checkbox" id="vilBetaleMedDetSamme" name="vilBetaleMedDetSamme" className={SwitcherStyles.checkboxInput} required checked={vilBetaleMedMobilePay} onChange={(e) => setVilBetaleMedMobilePay(e.target.checked)} />
                                    <span className={SwitcherStyles.slider}></span>
                                </label>
                                <b>Vil kunden betale med det samme via Mobile Pay?<br /><span className={ÅbenOpgaveCSS.spar50KrTekst}>(Kunden sparer 50 kr. i administrationsgebyr)</span></b>
                            </div>
                            <div className={SwitcherStyles.checkboxContainer}>
                                <label className={SwitcherStyles.switch} htmlFor="opgaveLøst">
                                    <input type="checkbox" id="opgaveLøst" name="opgaveLøst" className={SwitcherStyles.checkboxInput} required checked={opgaveLøstTilfredsstillende} onChange={(e) => setOpgaveLøstTilfredsstillende(e.target.checked)} />
                                    <span className={SwitcherStyles.slider}></span>
                                </label>
                                <b>Er kundens opgave blevet løst tilfredsstillende?</b>
                            </div>
                            <div className={SwitcherStyles.checkboxContainer}>
                                <label className={SwitcherStyles.switch} htmlFor="posteringerUdfyldt">
                                    <input type="checkbox" id="posteringerUdfyldt" name="posteringerUdfyldt" className={SwitcherStyles.checkboxInput} required checked={allePosteringerUdfyldt} onChange={(e) => setAllePosteringerUdfyldt(e.target.checked)} />
                                    <span className={SwitcherStyles.slider}></span>
                                </label>
                                <b>Er alle posteringer tilknyttet denne opgave blevet oprettet og udfyldt?</b>
                            </div>
                        </div>
                        </form>
                        {opgaveLøstTilfredsstillende && allePosteringerUdfyldt && <button className={ÅbenOpgaveCSS.opretFaktura} onClick={() => opretFakturakladde()}>Opret og send regning</button>}
                    </Modal>
                    </div>
                </div>
                {posteringer.length > 0 && <div className={ÅbenOpgaveCSS.økonomiDiv}>
                    {opgave.fakturaPDF 
                    ? 
                    <div className={ÅbenOpgaveCSS.fakturaPDFDiv}>
                        <button className={ÅbenOpgaveCSS.fakturaPDFLink} onClick={() => openOrDownloadPDF(opgave.fakturaPDF)}>Se faktura</button>
                    </div> 
                    : 
                    null}
                    <b className={ÅbenOpgaveCSS.prefix}>Økonomisk overblik</b>
                    <div className={ÅbenOpgaveCSS.regnskabContainer}>
                        <b className={`${ÅbenOpgaveCSS.prefix} ${ÅbenOpgaveCSS.bottomMargin10}`}>Indtægter</b>
                        {opstartTotalFaktura > 0 && <div className={ÅbenOpgaveCSS.regnskabRække}>
                            <span className={ÅbenOpgaveCSS.regnskabTekst}>Opstartsgebyrer (i alt):</span>
                            <span className={ÅbenOpgaveCSS.regnskabTekst}>{opstartTotalFaktura} kr.</span>
                        </div>}
                        {handymanTotalFaktura > 0 && <div className={ÅbenOpgaveCSS.regnskabRække}>
                            <span className={ÅbenOpgaveCSS.regnskabTekst}>Handymantimer (i alt):</span>
                            <span className={ÅbenOpgaveCSS.regnskabTekst}>{handymanTotalFaktura} kr.</span>
                        </div>}
                        {tømrerTotalFaktura > 0 && <div className={ÅbenOpgaveCSS.regnskabRække}>
                            <span className={ÅbenOpgaveCSS.regnskabTekst}>Tømrertimer (i alt):</span>
                            <span className={ÅbenOpgaveCSS.regnskabTekst}>{tømrerTotalFaktura} kr.</span>
                        </div>}
                        {udlægTotalFaktura > 0 && <div className={ÅbenOpgaveCSS.regnskabRække}>
                            <span className={ÅbenOpgaveCSS.regnskabTekst}>Udlæg (i alt):</span>
                            <span className={ÅbenOpgaveCSS.regnskabTekst}>{udlægTotalFaktura} kr.</span>
                        </div>}
                        {øvrigtTotalFaktura > 0 && <div className={ÅbenOpgaveCSS.regnskabRække}>
                            <span className={ÅbenOpgaveCSS.regnskabTekst}>Øvrigt (i alt):</span>
                            <span className={ÅbenOpgaveCSS.regnskabTekst}>{øvrigtTotalFaktura} kr.</span>
                        </div>}
                        {administrationsgebyr > 0 && <div className={ÅbenOpgaveCSS.regnskabRække}>
                            <span className={ÅbenOpgaveCSS.regnskabTekst}>Administrationsgebyr:</span>
                            <span className={ÅbenOpgaveCSS.regnskabTekst}>{administrationsgebyr} kr.</span>
                        </div>}
                        <div className={ÅbenOpgaveCSS.subtotalRække}>
                            <span className={ÅbenOpgaveCSS.subtotalFaktura}>Total, fakturabeløb:</span>
                            <span className={ÅbenOpgaveCSS.subtotalFaktura}>{totalFaktura} kr.</span>
                        </div>
                        <b className={`${ÅbenOpgaveCSS.prefix} ${ÅbenOpgaveCSS.bottomMargin10}`}>Honorar-udgifter</b>
                        {opstartTotalHonorar > 0 && <div className={ÅbenOpgaveCSS.regnskabRække}>
                            <span className={ÅbenOpgaveCSS.regnskabTekst}>Opstartsgebyrer (i alt):</span>
                            <span className={ÅbenOpgaveCSS.regnskabTekst}>{opstartTotalHonorar} kr.</span>
                        </div>}
                        {handymanTotalHonorar > 0 && <div className={ÅbenOpgaveCSS.regnskabRække}>
                            <span className={ÅbenOpgaveCSS.regnskabTekst}>Handymantimer (i alt):</span>
                            <span className={ÅbenOpgaveCSS.regnskabTekst}>{handymanTotalHonorar} kr.</span>
                        </div>}
                        {tømrerTotalHonorar > 0 && <div className={ÅbenOpgaveCSS.regnskabRække}>
                            <span className={ÅbenOpgaveCSS.regnskabTekst}>Tømrertimer (i alt):</span>
                            <span className={ÅbenOpgaveCSS.regnskabTekst}>{tømrerTotalHonorar} kr.</span>
                        </div>}
                        {udlægTotalHonorar > 0 && <div className={ÅbenOpgaveCSS.regnskabRække}>
                            <span className={ÅbenOpgaveCSS.regnskabTekst}>Udlæg (i alt):</span>
                            <span className={ÅbenOpgaveCSS.regnskabTekst}>{udlægTotalHonorar} kr.</span>
                        </div>}
                        {øvrigtTotalHonorar > 0 && <div className={ÅbenOpgaveCSS.regnskabRække}>
                            <span className={ÅbenOpgaveCSS.regnskabTekst}>Øvrigt (i alt):</span>
                            <span className={ÅbenOpgaveCSS.regnskabTekst}>{øvrigtTotalHonorar} kr.</span>
                        </div>}
                        <div className={ÅbenOpgaveCSS.subtotalRække}>
                            <span className={ÅbenOpgaveCSS.subtotalHonorar}>Total, honorarbeløb:</span>
                            <span className={ÅbenOpgaveCSS.subtotalHonorar}>{totalHonorar} kr.</span>
                        </div>
                        <b className={`${ÅbenOpgaveCSS.prefix} ${ÅbenOpgaveCSS.bottomMargin10}`}>Opgørelse</b>
                        <div className={ÅbenOpgaveCSS.regnskabRække}>
                            <span className={`${ÅbenOpgaveCSS.regnskabTekst} ${ÅbenOpgaveCSS.grønTekst}`}>Fakturabeløb:</span>
                            <span className={`${ÅbenOpgaveCSS.regnskabTekst} ${ÅbenOpgaveCSS.grønTekst}`}>{totalFaktura} kr.</span>
                        </div>
                        <div className={ÅbenOpgaveCSS.regnskabRække}>
                            <span className={`${ÅbenOpgaveCSS.regnskabTekst} ${ÅbenOpgaveCSS.rødTekst}`}>Honorarbeløb:</span>
                            <span className={`${ÅbenOpgaveCSS.regnskabTekst} ${ÅbenOpgaveCSS.rødTekst}`}>{totalHonorar} kr.</span>
                        </div>
                        <div className={ÅbenOpgaveCSS.dækningsbidragRække}>
                            <span className={`${ÅbenOpgaveCSS.subtotalFaktura} ${ÅbenOpgaveCSS.sortTekst}`}>Dækningsbidrag:</span>
                            <span className={`${ÅbenOpgaveCSS.subtotalFaktura} ${ÅbenOpgaveCSS.sortTekst}`}>{totalFaktura - totalHonorar} kr.</span>
                        </div>
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
                                        {færdiggjort ? null : <button className={ÅbenOpgaveCSS.kommentarKnap} onClick={() => {setOpenCommentModalID(kommentar._id), setEditedComment(kommentar.kommentarIndhold)}}>Rediger</button>}
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
                                        {færdiggjort ? null : <button className={ÅbenOpgaveCSS.kommentarKnap} onClick={() => {sletKommentar(kommentar._id)}}>Slet</button>}
                                        <span className={ÅbenOpgaveCSS.kommentarRegigeretMarkør}>{kommentar.createdAt === kommentar.updatedAt ? null : "Redigeret"}</span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                    {færdiggjort ? null : <form>
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
                    </form>}
                </div>
            </div>
            </PageAnimation>
        </div>
  )
}

export default ÅbenOpgave
