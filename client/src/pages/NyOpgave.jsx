// Denne fil er implementeret efter Henriks ønske, og er en ny version af "Opret Opgave"-formularen.
//
// Hvor den gamle formular var opdelt i 4 trin, så er den nye formular opdelt i 3 trin.
//
// 1. Opgave & kunde
// 2. Medarbejder
// 3. Besøg
//
// Den gamle formular er implementeret i NyOpgave (deprecated).jsx.

import React, { useEffect, useState } from 'react'
import NyOpgaveCSS from "./NyOpgave.module.css"
import PageAnimation from '../components/PageAnimation'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuthContext } from '../hooks/useAuthContext'
import SwitcherStyles from './Switcher.module.css'
import KunderStyles from './Kunder.module.css'
import KunderTabel from '../components/tables/KunderTabel'
import MedarbejdereTabel from '../components/tables/MedarbejdereTabel'
import NyOpgaveMedarbejderCalendar from '../components/traditionalCalendars/NyOpgaveMedarbejderCalendar'
import axios from 'axios'
import { ArrowRight, CircleCheck, Bot } from 'lucide-react'
import dayjs from 'dayjs'
import { PulseLoader } from "react-spinners";


const NyOpgave = () => {

    // Context & constants
    const {user} = useAuthContext()

    if (!user) {
        return "Du skal være logget ind."
    }

    const navigate = useNavigate();

    const {kundeID} = useParams()
    
    // The "TilknytMedarbejder" constant determines the selectable behavior on the medarbejder-table
    const tilknytMedarbejder = true;

    function navigerTilOpgave(){
        navigate(`../opgave/${opgaveID}`)
    }

    // State managers for data
    const [brugere, setBrugere] = useState([]);
    const [besøg, setBesøg] = useState([]);
    const [opgaver, setOpgaver] = useState([]);

    // State managers for progress, success & error messages
    const [bekræftDetaljer, setBekræftDetaljer] = useState(false);
    const [trinEtOpgaveOgKunde, setTrinEtOpgaveOgKunde] = useState(true);
    const [trinToMedarbejder, setTrinToMedarbejder] = useState(false);
    const [trinTreBesøg, setTrinTreBesøg] = useState(false);
    const [error, setError] = useState(null);
    const [opgavebeskrivelseError, setOpgavebeskrivelseError] = useState(null);
    const [succes, setSucces] = useState(false);
    const [loading, setLoading] = useState(false);
    const [opgaveID, setOpgaveID] = useState("");
    const [search, setSearch] = useState("");
    const [udtrækkerData, setUdtrækkerData] = useState(false);
    const [dataUdtrukket, setDataUdtrukket] = useState(true);

    // State managers for opgave
    const [opgaveBeskrivelse, setOpgaveBeskrivelse] = useState("");
    const [onsketDato, setOnsketDato] = useState("");
    const [fakturaOprettesManuelt, setFakturaOprettesManuelt] = useState(false);
    const [tilbudAfgivet, setTilbudAfgivet] = useState("");
    
    // Stage managers for kunde
    const [vælgEksisterendeKunde, setVælgEksisterendeKunde] = useState(false);
    const [valgtKunde, setValgtKunde] = useState(null);
    const [opretNyKunde, setOpretNyKunde] = useState(true);
    const [fornavn, setFornavn] = useState("");
    const [efternavn, setEfternavn] = useState("");
    const [CVR, setCVR] = useState("");
    const [virksomhed, setVirksomhed] = useState("");
    const [adresse, setAdresse] = useState("");
    const [postnummerOgBy, setPostnummerOgBy] = useState("");
    const [telefon, setTelefon] = useState("");
    const [email, setEmail] = useState("");
    const [harStige, setHarStige] = useState(false);
    const [isEnglish, setIsEnglish] = useState(false);
    const [accepterMarkedsføring, setAccepterMarkedsføring] = useState(false);

    // Stage managers for medarbejder
    // const [tilknytMedarbejder, setTilknytMedarbejder] = useState(false);
    const [valgtMedarbejder, setValgtMedarbejder] = useState(null);
    const [visMedarbejdereFilter, setVisMedarbejdereFilter] = useState(true);
    const [visAdministratorerFilter, setVisAdministratorerFilter] = useState(true);
    const [medarbejdereSearch, setMedarbejdereSearch] = useState("");

    // Stage managers for besøg
    const [besøgPåOpgaven, setBesøgPåOpgaven] = useState(null);

    // Progress checkers    
    const opgaveUdfyldt = (opgaveBeskrivelse.length >= 10)
    const kundeUdfyldt = ((vælgEksisterendeKunde && valgtKunde) || (opretNyKunde && (fornavn.length > 1 && efternavn.length > 1 && adresse.length > 1 && postnummerOgBy.length > 3 && (telefon.length  > 7) && email.length > 5)))
    const opgaveOgKundeUdfyldt = opgaveUdfyldt && kundeUdfyldt
    const medarbejderUdfyldt = tilknytMedarbejder && valgtMedarbejder
    const besøgUdfyldt = besøgPåOpgaven?.datoTidFra && besøgPåOpgaven?.datoTidTil && besøgPåOpgaven?.brugerID;

    // Object selectors
    const opgaven = {
        opgaveBeskrivelse: opgaveBeskrivelse,
        onsketDato: onsketDato,
        fakturaOprettesManuelt: fakturaOprettesManuelt,
        tilbudAfgivet: tilbudAfgivet,
    }

    const kunden = vælgEksisterendeKunde ? valgtKunde : {
        fornavn: fornavn,
        efternavn: efternavn,
        adresse: adresse,
        postnummerOgBy: postnummerOgBy,
        telefon: telefon,
        email: email,
        CVR: CVR,
        virksomhed: virksomhed,
        isEnglish: isEnglish,
        accepterMarkedsføring: accepterMarkedsføring,
        harStige: harStige
    }

    // Fetch all data (medarbejdere & opgaver)
    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API_URL}/brugere/`, {
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        })
        .then(res => {
            setBrugere(res.data)
        })
        .catch(error => {
            console.log(error)
        })

        axios.get(`${import.meta.env.VITE_API_URL}/opgaver`, {
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        })
        .then(res => {
            setOpgaver(res.data)
            setLoading(false)
        })
        .catch(error => {
            console.log(error)
        })
    }, [user])

    useEffect(() => {
        if(kundeID){
            axios.get(`${import.meta.env.VITE_API_URL}/kunder/${kundeID}`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            })
            .then(res => {
                setValgtKunde(res.data)
                setVælgEksisterendeKunde(true)
                setOpretNyKunde(false)
            })
            .catch(error => {
                console.log(error)
            })
        }
    }, [kundeID])

    useEffect(() => {
        if(valgtMedarbejder && !besøgUdfyldt){
            setTrinToMedarbejder(false);
            setTrinTreBesøg(true);
            setTrinEtOpgaveOgKunde(false);
            setBekræftDetaljer(false);
        }
    }, [valgtMedarbejder])

    useEffect(() => {
        setDataUdtrukket(false)
    }, [opgaveBeskrivelse])

    const submitOpgave = async (e) => {
        e.preventDefault();
        setLoading(true);

        if(opretNyKunde){
            if(fornavn === "" || efternavn === "" || adresse === "" || postnummerOgBy === "" || telefon === "" || email === ""){
                setError("Du skal udfylde alle felter i kunde-sektionen.")
                setLoading(false)
                return
            }
        }

        if(vælgEksisterendeKunde){
            if(!valgtKunde){
                setError("Du skal vælge en kunde.")
                setLoading(false)
                return
            }
        }

        const opgaveMedEksisterendeKunde = {
            ...opgaven,
            kundeID: vælgEksisterendeKunde && valgtKunde?._id,
            ansvarlig: valgtMedarbejder ? [valgtMedarbejder] : []
        }

        if(vælgEksisterendeKunde && valgtKunde){
            axios.post(`${import.meta.env.VITE_API_URL}/opgaver`, opgaveMedEksisterendeKunde, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            })
            .then(res => {
                setOpgaveID(res.data._id)

                if(besøgUdfyldt){
                    console.log({...besøgPåOpgaven, opgaveID: res.data._id, kundeID: valgtKunde._id})
                    axios.post(`${import.meta.env.VITE_API_URL}/besoeg`, {
                        ...besøgPåOpgaven,
                        opgaveID: res.data._id,
                        kundeID: valgtKunde._id
                    }, {
                        headers: {
                            'Authorization': `Bearer ${user.token}`
                        }
                    })
                    .then(res => {
                        setLoading(false)
                        setError(null)
                        setSucces(true)
                    })
                    .catch(error => {
                        console.log(error)
                        setLoading(false)
                        setError(error.response.data.error)
                    })
                } else {
                    setLoading(false)
                    setError(null)
                    setSucces(true)
                }
            })
            .catch(error => {
                console.log(error)
                setLoading(false)
                setError(error.response.data.error)
            })
        }

        if(opretNyKunde && kundeUdfyldt){
            axios.post(`${import.meta.env.VITE_API_URL}/kunder`, kunden, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            })
            .then(res => {
                
                const kundeID = res.data._id;
                
                const opgaveMedNyKundeID = {
                    ...opgaven,
                    kundeID: kundeID,
                    ansvarlig: valgtMedarbejder ? [valgtMedarbejder] : []
                }
                
                axios.post(`${import.meta.env.VITE_API_URL}/opgaver`, opgaveMedNyKundeID, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    }
                })
                .then(res => {
                    setOpgaveID(res.data._id)

                    if(besøgUdfyldt){
                        console.log({...besøgPåOpgaven, opgaveID: res.data._id, kundeID: kundeID})
                        axios.post(`${import.meta.env.VITE_API_URL}/besoeg`, {
                            ...besøgPåOpgaven,
                            opgaveID: res.data._id,
                            kundeID: kundeID
                        }, {
                            headers: {
                                'Authorization': `Bearer ${user.token}`
                            }
                        })
                        .then(res => {
                            setLoading(false)
                            setError(null)
                            setSucces(true)
                        })
                        .catch(error => {
                            console.log(error)
                            setLoading(false)
                            setError(error.response.data.error)
                        })
                    } else {
                    setLoading(false)
                    setError(null)
                    setSucces(true)
                    }
                })
                .catch(error => {
                    console.log(error)
                    setLoading(false)
                    setError(error.response.data.error)
                })
            })
            .catch(error => {
                console.log(error)
                setLoading(false)
                // setError(error.response.data.error)
                if (error.response?.data?.error?.includes("E11000 duplicate key error") && error.response?.data?.error?.includes("email")) {
                    setError("Der findes allerede en kunde med denne email i systemet. Tilknyt denne kunde, eller indtast en anden email.");
                    setTimeout(() => {
                        setError(null)
                    }, 10000)
                } else {
                    setError(error.response.data.error)
                    setTimeout(() => {
                        setError(null)
                    }, 10000)
                }
            })
        }
    }

    const checkOpgaveBeskrivelse = () => {
        if(opgaveBeskrivelse.length < 10){
            setOpgavebeskrivelseError("Lav en mere fyldig opgavebeskrivelse.")
        } else {
            setOpgavebeskrivelseError(null)
        }
    }

    function startForfra(){
    
        setBekræftDetaljer(false);
        setTrinEtOpgaveOgKunde(true);
        setTrinToMedarbejder(false);
        setTrinTreBesøg(false);
        setError(null);
        setSucces(false);
        setLoading(false);
        setOpgaveID("");
        setSearch("");
        setOpgaveBeskrivelse("");
        setOnsketDato("");
        setFakturaOprettesManuelt(false);
        setTilbudAfgivet("");
        setVælgEksisterendeKunde(false);
        setValgtKunde(null);
        setOpretNyKunde(false);
        setFornavn("");
        setEfternavn("");
        setCVR("");
        setVirksomhed("");
        setAdresse("");
        setPostnummerOgBy("");
        setTelefon("");
        setEmail("");
        setHarStige(false);
        setIsEnglish(false);
        setAccepterMarkedsføring(false);
        setValgtMedarbejder(null);
        setVisMedarbejdereFilter(true);
        setVisAdministratorerFilter(true);
        setMedarbejdereSearch("");
        setBesøgPåOpgaven(null);

    }
    
    const aiUdtrækData = async () => {
        setUdtrækkerData(true)
        setOpgavebeskrivelseError(null)
        
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/ai/parseOpgaveFromText`, {
                tekstblok: opgaveBeskrivelse
            })
            
            console.log(response.data)
    
            if(response.data.fornavn){
                setFornavn(response.data.fornavn)
            }
    
            if(response.data.efternavn){
                setEfternavn(response.data.efternavn)
            }
    
            if(response.data.adresse){
                setAdresse(response.data.adresse)
            }
    
            if(response.data.postnummerOgBy){
                setPostnummerOgBy(response.data.postnummerOgBy)
            }
    
            if(response.data.email){
                setEmail(response.data.email)
            }
    
            if(response.data.telefon){
                setTelefon(response.data.telefon)
            }
            
            if(response.data.virksomhed){
                setVirksomhed(response.data.virksomhed)
            }
    
            if(response.data.CVR){
                setCVR(response.data.CVR)
            }
    
            setUdtrækkerData(false)
    
            if(response.data.fornavn || response.data.efternavn || response.data.adresse || response.data.postnummerOgBy || response.data.email || response.data.telefon || response.data.virksomhed || response.data.CVR){
                setDataUdtrukket(true)
            } else {
                setDataUdtrukket(false)
                setOpgavebeskrivelseError("Ingen gyldige data blev fundet i opgavebeskrivelsen.")
            }
        } catch (error) {
            if(error.response.data.error){
                setOpgavebeskrivelseError(error.response.data.error)
                console.log(error.response.data)
            } else {
                setOpgavebeskrivelseError("En fejl opstod under udtrækning af data.")
            }
            setUdtrækkerData(false)
        }
    }

  return (
    <PageAnimation>
        <>
        <div style={{position: "static!important"}}>
            <span className={NyOpgaveCSS.headingSpan}><h1 className={NyOpgaveCSS.overskrift}>📋 Opret ny opgave</h1></span>
            {!succes && <div className={NyOpgaveCSS.trinDiv}>
                {/* OPGAVE- OG KUNDE-TRIN */}
                <h2 
                    onClick={() => {setTrinToMedarbejder(false); setTrinTreBesøg(false); setTrinEtOpgaveOgKunde(true); setBekræftDetaljer(false);}} 
                    className={`${NyOpgaveCSS.trinDivHeading} ${(trinEtOpgaveOgKunde && !bekræftDetaljer) ? NyOpgaveCSS.trinDivHeadingActive : ""} ${opgaveOgKundeUdfyldt ? NyOpgaveCSS.trinDivHeadingDone : ""} ${NyOpgaveCSS.trinDivHeadingClickable}`}
                >
                    Opgave & kunde <CircleCheck className={`${NyOpgaveCSS.trinDivHeadingDoneIcon} ${opgaveOgKundeUdfyldt ? NyOpgaveCSS.trinDivHeadingDoneIconActive : ""}`} />
                </h2>

                {/* MEDARBEJDER-TRIN */}
                <h2 
                    onClick={() => {
                        if((opgaveOgKundeUdfyldt) || medarbejderUdfyldt){
                            setTrinToMedarbejder(true); 
                            setTrinTreBesøg(false); 
                            setTrinEtOpgaveOgKunde(false);
                            setBekræftDetaljer(false);
                        }}} 
                    className={`${NyOpgaveCSS.trinDivHeading} ${(trinToMedarbejder && !bekræftDetaljer) ? NyOpgaveCSS.trinDivHeadingActive : ""} ${medarbejderUdfyldt ? NyOpgaveCSS.trinDivHeadingDone : ""} ${((opgaveOgKundeUdfyldt) || medarbejderUdfyldt) ? NyOpgaveCSS.trinDivHeadingClickable : ""} ${(bekræftDetaljer && !medarbejderUdfyldt) ? NyOpgaveCSS.trinDivHeadingRemoved : ""}`}
                >
                    Medarbejder <CircleCheck className={`${NyOpgaveCSS.trinDivHeadingDoneIcon} ${medarbejderUdfyldt ? NyOpgaveCSS.trinDivHeadingDoneIconActive : ""}`} />
                </h2>
                {/* BESØG-TRIN */}
                <h2 
                    onClick={() => {
                        if(opgaveOgKundeUdfyldt){
                            setTrinToMedarbejder(false); 
                            setTrinTreBesøg(true); 
                            setTrinEtOpgaveOgKunde(false);
                            setBekræftDetaljer(false);
                        }}} 
                    className={`${NyOpgaveCSS.trinDivHeading} ${(trinTreBesøg && !bekræftDetaljer) ? NyOpgaveCSS.trinDivHeadingActive : ""} ${besøgUdfyldt ? NyOpgaveCSS.trinDivHeadingDone : ""} ${opgaveOgKundeUdfyldt ? NyOpgaveCSS.trinDivHeadingClickable : ""} ${(bekræftDetaljer && !besøgUdfyldt) ? NyOpgaveCSS.trinDivHeadingRemoved : ""}`}
                >
                    Besøg <CircleCheck className={`${NyOpgaveCSS.trinDivHeadingDoneIcon} ${besøgUdfyldt ? NyOpgaveCSS.trinDivHeadingDoneIconActive : ""}`} />
                </h2>
            </div>}
            <form onSubmit={submitOpgave} className={NyOpgaveCSS.form}>
                {!bekræftDetaljer && <>
                    
                    {trinEtOpgaveOgKunde && <PageAnimation>
                    <div>
                        <label className={NyOpgaveCSS.label}>Opgavebeskrivelse</label>
                        <div className={NyOpgaveCSS.opgavebeskrivelseContainer}>
                            <textarea className={NyOpgaveCSS.opgavebeskrivelse} type="textarea" autoFocus name="opgavebeskrivelse" placeholder="Beskriv opgaven ..." onChange={(e) => setOpgaveBeskrivelse(e.target.value)} value={opgaveBeskrivelse} required onBlur={() => checkOpgaveBeskrivelse()} onFocus={() => setOpgavebeskrivelseError(null)}/>
                            {opgaveBeskrivelse.length > 10 && <button type="button" className={`${NyOpgaveCSS.aiParseButton} ${dataUdtrukket ? NyOpgaveCSS.aiParseButtonSuccess : ""}`} onClick={aiUdtrækData}>{dataUdtrukket ? "Succes!" : (udtrækkerData ? <PulseLoader color="#fff" size={5} /> : <><Bot size={16} style={{marginBottom: 2, marginLeft: -2}} /> Udtræk data</>)}</button>}
                        </div>
                        {opgavebeskrivelseError && <p className={NyOpgaveCSS.opgavebeskrivelseError}>{opgavebeskrivelseError}</p>}
                        {/* <label className={NyOpgaveCSS.label}>Ønskes opgaven udført på et bestemt tidspunkt?</label>
                        <input type="datetime-local" name="tid&dato" className={NyOpgaveCSS.input} onChange={(e) => setOnsketDato(e.target.value)} value={onsketDato} /> */}
                        <div style={{marginTop: 0, marginBottom: 50}} className={SwitcherStyles.checkboxContainer}>
                            <label className={SwitcherStyles.switch} htmlFor="fakturaOprettesManuelt">
                                <input type="checkbox" id="fakturaOprettesManuelt" name="fakturaOprettesManuelt" className={SwitcherStyles.checkboxInput} checked={fakturaOprettesManuelt} onChange={(e) => setFakturaOprettesManuelt(e.target.checked)} />
                                <span className={SwitcherStyles.slider}></span>
                            </label>
                            <b>Fast tilbud afgivet</b>
                        </div>
                        {fakturaOprettesManuelt && 
                            <div style={{marginTop: -30}}>
                                <ul style={{marginBottom: 10, fontSize: 13, marginLeft: 20}}>
                                    <li>Når du har afgivet et fast tilbud vil den første postering på opgaven automatisk blive oprettet med tilbudsprisen som en fast pris. Dette kan ændres manuelt af den ansvarshavende medarbejder.</li>
                                    <li>Tilbudsopgaver vil altid blive sendt til manuel godkendelse inden endelig fakturering af kunden.</li>
                                </ul>
                                <label className={NyOpgaveCSS.label}>Indtast aftalt tilbudspris i kr.</label>
                                <input style={{marginTop: 5}} type="number" name="tilbudAfgivet" className={NyOpgaveCSS.input} onChange={(e) => setTilbudAfgivet(e.target.value)} value={tilbudAfgivet} required/>
                            </div>
                        }
                    </div>
                    <div style={{marginTop: 30}}>
                        <div className={NyOpgaveCSS.vælgKundeButtons}>
                            <button type="button" className={`${NyOpgaveCSS.vælgKundeButton} ${opretNyKunde ? NyOpgaveCSS.vælgKundeButtonActive : ""}`} onClick={() => {setVælgEksisterendeKunde(false); setOpretNyKunde(true)}}>Opret ny kunde</button>
                            <button type="button" className={`${NyOpgaveCSS.vælgKundeButton} ${vælgEksisterendeKunde ? NyOpgaveCSS.vælgKundeButtonActive : ""}`} onClick={() => {setVælgEksisterendeKunde(true); setOpretNyKunde(false)}}>Vælg eksisterende kunde</button>
                        </div>
                        {opretNyKunde && 
                            <div>
                                <div className={NyOpgaveCSS.kolonner}>
                                    <div className={NyOpgaveCSS.kolonneEt}>
                                        <label className={NyOpgaveCSS.label}>Fornavn</label>
                                        <input type="text" name="fornavn" placeholder="Fornavn" className={NyOpgaveCSS.input} onChange={(e) => setFornavn(e.target.value)} value={fornavn} required onBlur={(e) => setFornavn(e.target.value.trim())}/>
                                        <label className={NyOpgaveCSS.label}>Efternavn</label>
                                        <input type="text" name="efternavn" placeholder="Efternavn" className={NyOpgaveCSS.input} onChange={(e) => setEfternavn(e.target.value)} value={efternavn} required onBlur={(e) => setEfternavn(e.target.value.trim())}/>
                                        <label className={NyOpgaveCSS.label}>Adresse</label>
                                        <input type="text" name="adresse" placeholder="Adresse" className={NyOpgaveCSS.input} onChange={(e) => setAdresse(e.target.value)} value={adresse} required onBlur={(e) => setAdresse(e.target.value.trim())}/>
                                        <label className={NyOpgaveCSS.label}>Postnummer og by</label>
                                        <input type="text" name="postnummerOgBy" placeholder="Postnummer og by" className={NyOpgaveCSS.input} onChange={(e) => setPostnummerOgBy(e.target.value)} value={postnummerOgBy} required onBlur={(e) => setPostnummerOgBy(e.target.value.trim())}/>
                                    </div>
                                    <div className={NyOpgaveCSS.kolonneTo}>
                                        <label className={NyOpgaveCSS.label}>Evt. CVR</label>
                                        <input type="text" name="CVR" className={NyOpgaveCSS.input} onChange={(e) => setCVR(e.target.value)} value={CVR} onBlur={(e) => setCVR(e.target.value.replace(/\s+/g, ''))}/>
                                        <label className={NyOpgaveCSS.label}>Evt. virksomhed</label>
                                        <input type="text" name="virksomhed" className={NyOpgaveCSS.input} onChange={(e) => setVirksomhed(e.target.value)} value={virksomhed} onBlur={(e) => setVirksomhed(e.target.value.trim())}/>
                                        <label className={NyOpgaveCSS.label}>Telefon</label>
                                        <input type="tel" name="telefon" className={NyOpgaveCSS.input} onChange={(e) => setTelefon(e.target.value)} value={telefon} required onBlur={(e) => setTelefon(e.target.value.replace(/\s+/g, ''))}/>
                                        <label className={NyOpgaveCSS.label}>Email</label>
                                        <input type="email" name="email" className={NyOpgaveCSS.input} onChange={(e) => setEmail(e.target.value)} value={email} required onBlur={(e) => setEmail(e.target.value.replace(/\s+/g, ''))}/>
                                    </div>
                                </div>
                                <div style={{marginTop: 20}}>
                                    <div className={SwitcherStyles.checkboxContainer}>
                                        <label className={SwitcherStyles.switch} htmlFor="isEnglish">
                                            <input type="checkbox" id="accepterMarkedsføring" name="accepterMarkedsføring" className={SwitcherStyles.checkboxInput} checked={accepterMarkedsføring} onChange={(e) => setAccepterMarkedsføring(e.target.checked)} />
                                            <span className={SwitcherStyles.slider}></span>
                                        </label>
                                        <b>Vil gerne modtage sæsontilbud og rabatter</b>
                                    </div>
                                    <div className={SwitcherStyles.checkboxContainer}>
                                        <label className={SwitcherStyles.switch} htmlFor="harStige">
                                            <input type="checkbox" id="harStige" name="harStige" className={SwitcherStyles.checkboxInput} checked={harStige} onChange={(e) => setHarStige(e.target.checked)} />
                                            <span className={SwitcherStyles.slider}></span>
                                        </label>
                                        <b>Kunden har egen stige</b>
                                    </div>
                                    <p style={{marginTop: 8, marginBottom: 20, fontSize: 13}}>(Relevant hvis kundens opgaver kræver, at medarbejderen skal op i højden.)</p>
                                    <div className={SwitcherStyles.checkboxContainer}>
                                        <label className={SwitcherStyles.switch} htmlFor="isEnglish">
                                            <input type="checkbox" id="isEnglish" name="isEnglish" className={SwitcherStyles.checkboxInput} checked={isEnglish} onChange={(e) => setIsEnglish(e.target.checked)} />
                                            <span className={SwitcherStyles.slider}></span>
                                        </label>
                                        <b>Engelsk kunde</b>
                                    </div>
                                    <p style={{marginTop: 8, marginBottom: 20, fontSize: 13}}>(Automatiske e-mails, SMS'er og regninger til kunden vil være på engelsk.)</p>
                                </div>
                            </div>
                        }
                        {vælgEksisterendeKunde && 
                            <div className={NyOpgaveCSS.kunderTabelContainer}>
                                <input type="text" placeholder="Søg efter kunde ..." value={search} onChange={(e) => setSearch(e.target.value)} className={`${KunderStyles.searchInput} ${NyOpgaveCSS.searchInput}`} style={{width: "100%", borderRadius: 10, marginBottom: 5}}/>
                                <KunderTabel vælgKunde={true} setValgtKunde={setValgtKunde} valgtKunde={valgtKunde} search={search} setSearch={setSearch}/>
                            </div>
                        }
                    </div>
                    </PageAnimation>
                    }
                    
                    {trinToMedarbejder && 
                    <PageAnimation>
                        <div>
                            <div className={NyOpgaveCSS.medarbejdereTabelContainer}>
                                <div className={NyOpgaveCSS.vælgKundeButtons}>
                                    <button type="button" className={`${NyOpgaveCSS.vælgKundeButton} ${visMedarbejdereFilter ? NyOpgaveCSS.vælgKundeButtonActive : ""}`} onClick={() => {setVisMedarbejdereFilter(!visMedarbejdereFilter)}}>Vis medarbejdere</button>
                                    <button type="button" className={`${NyOpgaveCSS.vælgKundeButton} ${visAdministratorerFilter ? NyOpgaveCSS.vælgKundeButtonActive : ""}`} onClick={() => {setVisAdministratorerFilter(!visAdministratorerFilter)}}>Vis administratorer</button>
                                </div>
                                <input type="text" placeholder="Søg efter medarbejder ..." value={medarbejdereSearch} onChange={(e) => setMedarbejdereSearch(e.target.value)} className={`${KunderStyles.searchInput} ${NyOpgaveCSS.searchInput}`} style={{width: "100%", borderRadius: 10, marginBottom: 5}}/>
                                <MedarbejdereTabel setBesøgPåOpgaven={setBesøgPåOpgaven} vælgMedarbejder={tilknytMedarbejder} setValgtMedarbejder={setValgtMedarbejder} valgtMedarbejder={valgtMedarbejder} filter={visMedarbejdereFilter ? (visAdministratorerFilter ? "visAlle" : "visMedarbejdere") : (visAdministratorerFilter ? "visAdministratorer" : "visAlle")} search={medarbejdereSearch} setSearch={setMedarbejdereSearch}/>
                            </div>
                        </div>
                    </PageAnimation>}
                    {trinTreBesøg && 
                        <PageAnimation>
                            <div className={NyOpgaveCSS.besøgDiv}>  
                                {valgtMedarbejder && <h2 className={NyOpgaveCSS.formHeading}>Opret besøg for {valgtMedarbejder.navn}</h2>}
                                {!valgtMedarbejder && <h2 className={NyOpgaveCSS.formHeading}>Opret besøg</h2>}
                                <NyOpgaveMedarbejderCalendar 
                                    tilknyttetMedarbejder={valgtMedarbejder ? valgtMedarbejder : null}
                                    setValgtMedarbejder={setValgtMedarbejder}
                                    user={user}
                                    brugere={brugere}
                                    tilknyttetKunde={valgtKunde}
                                    setBesøg={setBesøg}
                                    setBesøgPåOpgaven={setBesøgPåOpgaven}
                                    setBekræftDetaljer={setBekræftDetaljer}
                                    opgaver={opgaver}
                                    setTrinToMedarbejder={setTrinToMedarbejder}
                                    setTrinTreBesøg={setTrinTreBesøg}
                                />
                            </div>
                        </PageAnimation>
                    }
                </>}
                
                <div className={NyOpgaveCSS.submitMeddelelser}>


                    <div className={`${NyOpgaveCSS.bekræftDetaljerButtons} ${(opgaveOgKundeUdfyldt) ? NyOpgaveCSS.bekræftDetaljerButtonsActive : ""}`}>
                        <div style={{display: "flex", flexDirection: "row", gap: 10}}>
                            {!valgtMedarbejder && !trinToMedarbejder && !trinTreBesøg && !bekræftDetaljer && <button type="button" className={NyOpgaveCSS.tilknytMedarbejderButton} onClick={() => {setTrinToMedarbejder(true); setTrinTreBesøg(false); setTrinEtOpgaveOgKunde(false);}}>+ Tilknyt medarbejder</button>}
                            {!valgtMedarbejder && !trinToMedarbejder && !trinTreBesøg && !bekræftDetaljer && <button type="button" className={NyOpgaveCSS.tilknytMedarbejderButton} onClick={() => {setTrinToMedarbejder(false); setTrinTreBesøg(true); setTrinEtOpgaveOgKunde(false);}}>+ Opret besøg</button>}
                        </div>
                        {!bekræftDetaljer && <button type="button" className={`${NyOpgaveCSS.submitButton} ${NyOpgaveCSS.submitButtonFullWidth}`} onClick={() => setBekræftDetaljer(true)}>Bekræft detaljer</button>} 
                    </div>
                    
                    {bekræftDetaljer && 
                        (succes ? 
                            <PageAnimation>
                                <div className={NyOpgaveCSS.succesDiv}>
                                    <h2>Opgave oprettet! 🎉</h2>
                                    <div>
                                        <p><b style={{fontFamily: "OmnesBold"}}>Beskrivelse:</b> "{opgaveBeskrivelse}"</p>
                                        <p><b style={{fontFamily: "OmnesBold"}}>Hos:</b> {(kunden.virksomhed || kunden.CVR) ? kunden.virksomhed : kunden.fornavn + " " + kunden.efternavn}</p>
                                        {valgtMedarbejder && <p><b style={{fontFamily: "OmnesBold"}}>Medarbejder på opgaven:</b> {valgtMedarbejder?.navn}</p>}
                                        {besøgPåOpgaven && <p><b style={{fontFamily: "OmnesBold"}}>Besøg:</b> {besøgPåOpgaven?.datoTidFra ? dayjs(besøgPåOpgaven.datoTidFra).format("D. MMMM HH:mm") : "Ingen dato"} - {besøgPåOpgaven?.datoTidTil ? dayjs(besøgPåOpgaven.datoTidTil).format("HH:mm") : "Ingen dato"}</p>}
                                    </div>
                                    <div className={NyOpgaveCSS.succesButtonsDiv}>
                                        <button className={NyOpgaveCSS.submitButton} type="button" onClick={navigerTilOpgave}><b>Gå til opgave</b></button>
                                        <button className={`${NyOpgaveCSS.submitButton} ${NyOpgaveCSS.startForfraButton}`} type="button" onClick={startForfra} >+ Opret ny opgave</button>
                                    </div>
                                </div> 
                            </PageAnimation>
                        : 
                            <PageAnimation>
                                <div className={NyOpgaveCSS.nyOpgaveDetaljerFørOprettelse}>
                                    <h2>Bekræft følgende:</h2>
                                    {opgaveUdfyldt && <div className={NyOpgaveCSS.nyOpgaveDetaljerFørOprettelseSubDiv}>
                                        <b style={{fontFamily: "OmnesBold", fontSize: 18, marginBottom: 10, display: "block"}}>Opgave</b>
                                        <p>"{opgaveBeskrivelse}"</p>
                                        <p>Fast tilbud afgivet: {fakturaOprettesManuelt ? "Ja: " + tilbudAfgivet + " kr." : "Nej"}</p>
                                    </div>}
                                    {kundeUdfyldt && <div className={`${NyOpgaveCSS.nyOpgaveDetaljerFørOprettelseSubDiv} ${NyOpgaveCSS.nyOpgaveDetaljerFørOprettelseKundeDiv}`}>
                                        {(kunden.CVR || kunden.virksomhed) && <>
                                            <b style={{fontFamily: "OmnesBold", fontSize: 18, marginBottom: 10, display: "block"}}>{opretNyKunde && "Erhvervskunde (ny)"}{vælgEksisterendeKunde && "Erhvervskunde (tilbagevendende)"}</b>
                                            <b className={NyOpgaveCSS.nyOpgaveDetaljerFørOprettelseKundeName}>{kunden.virksomhed}</b>
                                            {kunden.CVR && <p style={{marginBottom: 10}}>CVR: {kunden.CVR}</p>}
                                            <p>{kunden.adresse}</p>
                                            <p>{kunden.postnummerOgBy}</p>
                                            <p>Kontaktperson: {kunden.fornavn} {kunden.efternavn}</p>
                                            <p>Tel.: {kunden.telefon}</p>
                                            <p>E-mail: {kunden.email}</p>
                                        </>}
                                        {!(kunden.CVR || kunden.virksomhed) && <>
                                            <b style={{fontFamily: "OmnesBold", fontSize: 18, marginBottom: 10, display: "block"}}>{opretNyKunde && "Privatkunde (ny)"}{vælgEksisterendeKunde && "Privatkunde (tilbagevendende)"}</b>
                                            <b className={NyOpgaveCSS.nyOpgaveDetaljerFørOprettelseKundeName}>{kunden.fornavn} {kunden.efternavn}</b>
                                            <p>{kunden.adresse}</p>
                                            <p>{kunden.postnummerOgBy}</p>
                                            <p>Tel.: {kunden.telefon}</p>
                                            <p>E-mail: {kunden.email}</p>
                                        </>}
                                    </div>}
                                    {medarbejderUdfyldt && <div className={NyOpgaveCSS.nyOpgaveDetaljerFørOprettelseSubDiv}>
                                        <b style={{fontFamily: "OmnesBold", fontSize: 18, marginBottom: 10, display: "block"}}>Medarbejder på opgaven</b>
                                        <p>{valgtMedarbejder.navn}</p>
                                    </div>}
                                    {besøgUdfyldt && <div className={NyOpgaveCSS.nyOpgaveDetaljerFørOprettelseSubDiv}>
                                        <b style={{fontFamily: "OmnesBold", fontSize: 18, marginBottom: 10, display: "block"}}>Besøg</b>
                                        <p>Dato: {besøgPåOpgaven?.datoTidFra ? dayjs(besøgPåOpgaven.datoTidFra).format("D. MMMM") : "Ingen dato"}</p>
                                        <p>Tid: {besøgPåOpgaven?.datoTidFra ? dayjs(besøgPåOpgaven.datoTidFra).format("HH:mm") : "Ingen tid"} - {besøgPåOpgaven?.datoTidTil ? dayjs(besøgPåOpgaven.datoTidTil).format("HH:mm") : "Ingen tid"}</p>
                                    </div>}
                                </div>
                                <div className={NyOpgaveCSS.bekræftEllerTilbageButtons}>
                                    <button className={NyOpgaveCSS.tilbageButton} type="button" onClick={() => setBekræftDetaljer(false)}>Tilbage</button>
                                    <button className={`${NyOpgaveCSS.submitButton} ${NyOpgaveCSS.submitButtonFullWidth}`}>{loading ? "Opretter opgave ..." : "Bekræft & opret opgave"}</button>
                                </div>
                            </PageAnimation>
                        )
                    }
                </div>
                {error && <div className={NyOpgaveCSS.error}>{error}</div>}
            </form>
        </div>
        </>
    </PageAnimation>
  )
}

export default NyOpgave
