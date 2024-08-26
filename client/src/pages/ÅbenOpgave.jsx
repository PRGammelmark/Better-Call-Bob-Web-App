import React from 'react'
import ÅbenOpgaveCSS from './ÅbenOpgave.module.css'
import PageAnimation from '../components/PageAnimation'
import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import BackIcon from "../assets/back.svg"
import Paperclip from "../assets/paperclip.svg"
import VisLedighed from "../components/VisLedighed.jsx"
import axios from "axios"
import TaskCalendar from "../components/calendars/TaskCalendar.jsx"
import dayjs from 'dayjs'
import { useAuthContext } from '../hooks/useAuthContext'

const ÅbenOpgave = () => {
    const {user} = useAuthContext();
    
    if (!user) {
        return
    }

    const { opgaveID } = useParams();
    const userID = user.id;
    const navigate = useNavigate();

    // state managers
    const [opgave, setOpgave] = useState(null);
    const [loading, setLoading] = useState(true);
    const [opgaveBeskrivelse, setOpgaveBeskrivelse] = useState(null);
    const [status, setStatus] = useState("");
    const [ledigeAnsvarlige, setLedigeAnsvarlige] = useState(null);
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
    const [editedComment, setEditedComment] = useState("");
    const [outlays, setOutlays] = useState([]);
    const [øvrige, setØvrige] = useState([]);
    const [handymantimer, setHandymantimer] = useState("");
    const [tømrertimer, setTømrertimer] = useState("");
    const [posteringDato, setPosteringDato] = useState("");
    const [posteringBeskrivelse, setPosteringBeskrivelse] = useState("");
    const [inkluderOpstart, setInkluderOpstart] = useState(200);
    const [posteringer, setPosteringer] = useState("");
    const [kommentar, setKommentar] = useState("");
    const [kommentarer, setKommentarer] = useState([]);
    const [færdiggjort, setFærdiggjort] = useState(false);
    const [opgaveAfsluttet, setOpgaveAfsluttet] = useState(false)
    const [bekræftIndsendelseModal, setBekræftIndsendelseModal] = useState(false);
    const [ledigeTider, setLedigeTider] = useState(null)
    
    const initialDate = opgave && opgave.onsketDato ? dayjs(opgave.onsketDato) : null;
    const [selectedDate, setSelectedDate] = useState(initialDate);

    useEffect(() => {
        axios.get('http://localhost:3000/api/ledige-tider', {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            })
            .then(res => {
                setLedigeTider(res.data)
            })
            .catch(error => console.log(error))
    }, [])

    const submitKommentar = () => {
        
        const kommentarObject = {
            kommentarIndhold: kommentar,
            brugerID: userID,
            opgaveID: opgaveID
        }
        
        console.log(kommentarObject)

        axios.post('http://localhost:3000/api/kommentarer/', kommentarObject, {
            headers: {
                'Authorization': `Bearer ${user.token}`
            } 
        })
        .then(res => {
            setKommentar("");
            axios.get('http://localhost:3000/api/kommentarer', {
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
        axios.get('http://localhost:3000/api/kommentarer', {
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
    }

    const handleØvrigeChange = (index, event) => {
        const newØvrige = [...øvrige];
        newØvrige[index][event.target.name] = event.target.value;
        setØvrige(newØvrige);
    }

    const addOutlay = (e) => {
        e.preventDefault();
        setOutlays([...outlays, { description: '', amount: '' }]);
    }

    const addØvrig = (e) => {
        e.preventDefault();
        setØvrige([...øvrige, { description: '', amount: '' }]);
    }

    const deleteOutlay = (index) => {
        const newOutlays = [...outlays];
        newOutlays.splice(index, 1);
        setOutlays(newOutlays);
    };

    const deleteØvrig = (index) => {
        const newØvrige = [...øvrige];
        newØvrige.splice(index, 1);
        setØvrige(newØvrige);
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

        axios.post('http://localhost:3000/api/posteringer/', postering, {
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
        axios.get(`http://localhost:3000/api/opgaver/${opgaveID}`, {
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
        axios.get('http://localhost:3000/api/brugere', {
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        })
        .then(res => {
            setLedigeAnsvarlige(res.data)
        })
        .catch(error => console.log(error))
    }, [])

    const getBrugerName = (brugerID) => {
        const bruger = ledigeAnsvarlige && ledigeAnsvarlige.find(user => user._id === brugerID);
        return bruger ? bruger.navn : 'Unknown User';
    };

    useEffect(() => {
        axios.get('http://localhost:3000/api/posteringer', {
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
        axios.patch(`http://localhost:3000/api/opgaver/${opgaveID}`, {
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
        
        axios.patch(`http://localhost:3000/api/opgaver/${opgaveID}`, {
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
        const nyAnsvarlig = ledigeAnsvarlige && ledigeAnsvarlige.find(ansvarlig => ansvarlig._id === nyAnsvarligId);
    
        if (nyAnsvarlig) {
            
            const isAlreadyResponsible = nuværendeAnsvarlige.some(ansvarlig => ansvarlig._id === nyAnsvarlig._id);
        
            if (isAlreadyResponsible) {
                console.log("Denne person er allerede ansvarlig.");
                return; // Exit the function if already responsible
            }

            const opdateretAnsvarlige = [...nuværendeAnsvarlige, nyAnsvarlig];
        
            axios.patch(`http://localhost:3000/api/opgaver/${opgaveID}`, {
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

        axios.patch(`http://localhost:3000/api/opgaver/${opgaveID}`, {
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
        axios.delete(`http://localhost:3000/api/kommentarer/${kommentarID}`, {
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        })
        .then(response => {
            // Assuming `setKommentarer` is a state update function that you've defined
            setKommentarer(prevKommentarer => 
                prevKommentarer.filter(kommentar => kommentar._id !== kommentarID)
            );
        })
        .catch(error => {
            console.error("Der opstod en fejl ved sletning af kommentaren:", error);
        });
    }

    function sletPostering(posteringID){
        axios.delete(`http://localhost:3000/api/posteringer/${posteringID}`, {
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        })
        .then(response => {
            setPosteringer(prevPosteringer => 
                prevPosteringer.filter(postering => postering._id !== posteringID)
            );
        })
        .catch(error => {
            console.error("Der opstod en fejl ved sletning af posteringen:", error);
        });
    }

    function editKommentar(kommentarID) {

        const opdateretKommentar = {
            kommentarIndhold: editedComment
        }

        axios.patch(`http://localhost:3000/api/kommentarer/${kommentarID}`, opdateretKommentar, {
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

    function færdiggørOpgave () {

        const færdiggør = {
            markeretSomFærdig: true
        }
        
        axios.patch(`http://localhost:3000/api/opgaver/${opgaveID}`, færdiggør, {
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
        const færdiggør = {
            markeretSomFærdig: false
        }

        axios.patch(`http://localhost:3000/api/opgaver/${opgaveID}`, færdiggør, {
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        })
        .then(response => {
            setFærdiggjort(false);
        })
        .catch(error => console.log(error))

    }

    function bekræftIndsendelseTilEconomic () {
        setBekræftIndsendelseModal(true);
    }

    function opretFakturakladde () {
        
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
        })
        
        axios.post('https://restapi.e-conomic.com/invoices/drafts', {
            date: "2024-08-23",
            currency: "DKK",
            customer: {
                customerNumber: 100
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
                city: "1000 København",
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
            headers: {
                'Content-Type': 'application/json',
                'X-AppSecretToken': import.meta.env.VITE_BCBSECRETTOKEN,
                'X-AgreementGrantToken': import.meta.env.VITE_BCBAGREEMENTGRANTTOKEN
            }
        })
        .then(response => {
            console.log(response.data);
            setOpgaveAfsluttet(true);

            axios.patch(`http://localhost:3000/api/opgaver/${opgaveID}`, {
                opgaveAfsluttet: true
            }, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            })
            .then(res => console.log(res.data))
            .catch(error => console.log(error))
            })
        .catch(error => console.log(error))
    }
    
    // konstater til regnskabsopstillingen -- HONORARER --
    const opstartTotalHonorar = posteringer && posteringer.reduce((akk, nuv) => akk + (nuv.opstart || 0), 0);
    const handymanTotalHonorar = posteringer && (posteringer.reduce((akk, nuv) => akk + (nuv.handymanTimer || 0), 0)) * 300;
    const tømrerTotalHonorar = posteringer && (posteringer.reduce((akk, nuv) => akk + (nuv.tømrerTimer || 0), 0) * 360);
    const udlægTotalHonorar = posteringer && posteringer.reduce((akk, nuv) => {const udlægSum = nuv.udlæg.reduce((sum, udlæg) => sum + (udlæg.beløb || 0), 0); return akk + udlægSum;}, 0);
    const øvrigtTotalHonorar = posteringer && posteringer.reduce((akk, nuv) => {const øvrigSum = nuv.øvrigt.reduce((sum, øvrig) => sum + (øvrig.beløb || 0), 0); return akk + øvrigSum;}, 0);

    const totalHonorar = opstartTotalHonorar + handymanTotalHonorar + tømrerTotalHonorar + udlægTotalHonorar + øvrigtTotalHonorar;

    // konstanter til regnskabsopstillingen -- FAKTURA --
    const opstartTotalFaktura = posteringer && Math.round((posteringer.reduce((akk, nuv) => akk + (nuv.opstart || 0), 0)) / 200 * 319.2);
    const handymanTotalFaktura = posteringer && Math.round((posteringer.reduce((akk, nuv) => akk + (nuv.handymanTimer || 0), 0)) * 447.2);
    const tømrerTotalFaktura = posteringer && Math.round((posteringer.reduce((akk, nuv) => akk + (nuv.tømrerTimer || 0), 0)) * 480);
    const udlægTotalFaktura = posteringer && posteringer.reduce((akk, nuv) => {const udlægSum = nuv.udlæg.reduce((sum, udlæg) => sum + (udlæg.beløb || 0), 0); return akk + udlægSum;}, 0);
    const øvrigtTotalFaktura = posteringer && posteringer.reduce((akk, nuv) => {const øvrigSum = nuv.øvrigt.reduce((sum, øvrig) => sum + (øvrig.beløb || 0), 0); return akk + øvrigSum;}, 0);

    const totalFaktura = opstartTotalFaktura + handymanTotalFaktura + tømrerTotalFaktura + udlægTotalFaktura + øvrigtTotalFaktura;

    return (
    
        <div>
            <PageAnimation>
            <div className={ÅbenOpgaveCSS.tilbageOpgaveSektion}>
                <img src={BackIcon} alt="" onClick={() => navigate(-1)} className={ÅbenOpgaveCSS.tilbageKnap} />
                <div>
                    <b>Opgave #{opgave._id.slice(opgave._id.length - 3, opgave._id.length)} på</b>
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
                            <b className={ÅbenOpgaveCSS.prefix}>Kunde:</b> <span className={ÅbenOpgaveCSS.postfix}>{opgave.navn}</span>
                            <p className={ÅbenOpgaveCSS.marginTop10}>📞 <a className={`${ÅbenOpgaveCSS.postfix} ${ÅbenOpgaveCSS.link}`} href={"tel:" + opgave.telefon}>{opgave.telefon}</a></p>
                            <p>✉️ <a className={`${ÅbenOpgaveCSS.postfix} ${ÅbenOpgaveCSS.link}`} href={"mailto:" + opgave.email}>{opgave.email}</a></p>
                        </div>
                        <div>
                            <b className={ÅbenOpgaveCSS.prefix}>Opgavestatus{færdiggjort ? ": " : null}</b>{færdiggjort ? <span className={ÅbenOpgaveCSS.statusTekstVedFærdiggjort}>{status}</span> : null}
                            {færdiggjort ? null : <form className={`${ÅbenOpgaveCSS.opgavestatusForm} ${ÅbenOpgaveCSS.marginTop10}`}>
                                <select style={conditionalStyles} name="opgavestatus" className={ÅbenOpgaveCSS.opgavestatus} onChange={opdaterOpgavestatus} value={status}>
                                    <option value="modtaget">Modtaget</option>
                                    <option value="accepteret">Accepteret</option>
                                    <option value="afventerSvar">Afventer svar</option>
                                    <option value="afvist">Afvist</option>
                                </select>
                            </form>}
                        </div>
                    </div>
                </div>

                <div className={ÅbenOpgaveCSS.praktisk}>
                    <div className={ÅbenOpgaveCSS.uddelegering}>
                        {færdiggjort ? null : <form className={ÅbenOpgaveCSS.tildelAnsvarligeForm} action="">
                            <b className={ÅbenOpgaveCSS.prefix}>Tildel ansvarlige:</b>
                            <select className={ÅbenOpgaveCSS.tildelAnsvarlige} defaultValue="Vælg Bob ..." name="vælgBob" onChange={tildelAnsvar}>
                                <option disabled>Vælg Bob ...</option>
                                {ledigeAnsvarlige && ledigeAnsvarlige.map((ledigAnsvarlig) => {
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
                    <div className={ÅbenOpgaveCSS.calendarDiv}>
                        <TaskCalendar selectedDate={selectedDate} setSelectedDate={setSelectedDate} opgave={opgave}/>
                        <div className={ÅbenOpgaveCSS.dayDetail}>
                            <p className={`${ÅbenOpgaveCSS.prefix} ${ÅbenOpgaveCSS.bottomMargin20}`}>{selectedDate ? selectedDate.format('DD/MM – YYYY') : 'Ingen valgt dato'}</p>
                            {(selectedDate && dayjs(selectedDate).isSame(opgave.onsketDato, 'day')) && <p style={{fontSize: '0.9rem'}}>Kunden ønsker opgaven udført fra kl. {dayjs(opgave.onsketDato).format('HH:mm')} denne dag.</p>}
                            {selectedDate && <div className={ÅbenOpgaveCSS.ledigeMedarbejdere}>
                                <p className={`${ÅbenOpgaveCSS.prefix} ${ÅbenOpgaveCSS.bottomMargin20}`}>Ledige medarbejdere denne dag:</p>
                                {ledigeTider && ledigeTider.map((ledigTid) => {
                                    if (dayjs(ledigTid.datoTidFra).format("DD-MM-YYYY") === dayjs(selectedDate).format("DD-MM-YYYY")) {
                                        return (
                                            <div className={ÅbenOpgaveCSS.ledigTidDisplay}>
                                                <p className={ÅbenOpgaveCSS.ledigTidBeskrivelse}>{dayjs(ledigTid.datoTidFra).format("HH:mm")} – {dayjs(ledigTid.datoTidTil).format("HH:mm")}</p>
                                                <p className={ÅbenOpgaveCSS.ledigTidMedarbejder}>{getBrugerName(ledigTid.brugerID)}</p>
                                            </div>
                                        )
                                    } else {
                                        return null
                                    }
                                })}
                            </div>}
                        </div>
                    </div>
                </div>
                <div className={ÅbenOpgaveCSS.posteringer}>
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
                                    {færdiggjort ? null : <button className={ÅbenOpgaveCSS.sletPosteringKnap} onClick={() => {sletPostering(postering._id)}}>Slet</button>}
                                </div>
                            )
                        })}
                    </div>
                    {færdiggjort ? null : <button onClick={() => setOpenModal(true)} className={ÅbenOpgaveCSS.tilføjPosteringButton}>+ Ny postering</button>}
                    {openModal ? 
                    <div className={ÅbenOpgaveCSS.overlay} onClick={() => setOpenModal(false)}>
                        <div className={ÅbenOpgaveCSS.modal} onClick={(e) => e.stopPropagation()}>
                            <button onClick={() => {setOpenModal(false)}}className={ÅbenOpgaveCSS.lukModal}>-</button>
                            <h2 className={ÅbenOpgaveCSS.modalHeading}>Ny postering 📄</h2>
                            <form className={ÅbenOpgaveCSS.modalForm} onSubmit={(e) => {
                                e.preventDefault();
                                tilføjPostering();
                            }}>
                                <label className={ÅbenOpgaveCSS.prefix} htmlFor="">Vælg dato ...</label>
                                <input className={ÅbenOpgaveCSS.modalInput} type="date" value={posteringDato} onChange={(e) => setPosteringDato(e.target.value)} />
                                <label className={ÅbenOpgaveCSS.prefix} htmlFor="">Beskrivelse</label>
                                <textarea className={ÅbenOpgaveCSS.modalInput} type="text" required value={posteringBeskrivelse} onChange={(e) => setPosteringBeskrivelse(e.target.value)} />
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
                        </div>
                    </div>
                    : 
                    null}
                    <div>
                    {færdiggjort ? <div className={ÅbenOpgaveCSS.færdigOpgaveDiv}><p className={ÅbenOpgaveCSS.prefix}>Opgaven er markeret som færdig og låst.</p><button className={ÅbenOpgaveCSS.genåbnButton} onClick={() => åbnForÆndringer()}>Genåbn for ændringer</button><button className={ÅbenOpgaveCSS.indsendTilEconomicButton} onClick={() => bekræftIndsendelseTilEconomic()}>Opret fakturakladde</button></div> : posteringer.length > 0 && <button className={ÅbenOpgaveCSS.markerSomFærdigKnap} onClick={() => færdiggørOpgave()}>Markér opgave som færdig</button>}
                    {bekræftIndsendelseModal && ( 
                                        <div className={ÅbenOpgaveCSS.overlay} onClick={() => setBekræftIndsendelseModal(false)}>
                                            <div className={ÅbenOpgaveCSS.modal} onClick={(e) => e.stopPropagation()}>
                                                <button onClick={() => {setBekræftIndsendelseModal(false)}}className={ÅbenOpgaveCSS.lukModal}>-</button>
                                                <h2 className={ÅbenOpgaveCSS.modalHeading} style={{paddingRight: 20}}>Bekræft: Vil du lukke opgaven og oprette en fakturakladde i E-conomic?</h2>
                                                <button className={ÅbenOpgaveCSS.opretFaktura} onClick={() => opretFakturakladde()}>Opret fakturakladde</button>
                                            </div>
                                        </div>
                                        )}
                    </div>
                </div>
                {posteringer.length > 0 && <div className={ÅbenOpgaveCSS.økonomiDiv}>
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
                    <b className={ÅbenOpgaveCSS.prefix}>Kommentarer</b>
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
                                        {openCommentModalID === kommentar._id && ( 
                                        <div className={ÅbenOpgaveCSS.overlay} onClick={() => setOpenCommentModalID(null)}>
                                            <div className={ÅbenOpgaveCSS.modal} onClick={(e) => e.stopPropagation()}>
                                                <button onClick={() => {setOpenCommentModalID(null)}}className={ÅbenOpgaveCSS.lukModal}>-</button>
                                                <h2 className={ÅbenOpgaveCSS.modalHeading}>Rediger kommentar</h2>
                                                <form className={ÅbenOpgaveCSS.editKommentarForm} onSubmit={(e) => {
                                                    e.preventDefault();
                                                    editKommentar(kommentar._id);
                                                }}>
                                                    <textarea className={ÅbenOpgaveCSS.redigerKommentarInput} type="text" value={editedComment} onChange={(e) => setEditedComment(e.target.value)} />
                                                    <button className={ÅbenOpgaveCSS.registrerPosteringButton} type="submit">Opdater kommentar</button>
                                                </form>
                                            </div>
                                        </div>
                                        )}
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
