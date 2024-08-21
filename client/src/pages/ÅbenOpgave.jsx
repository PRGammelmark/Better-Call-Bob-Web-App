import React from 'react'
import ÅbenOpgaveCSS from './ÅbenOpgave.module.css'
import PageAnimation from '../components/PageAnimation'
import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import BackIcon from "../assets/back.svg"
import Paperclip from "../assets/paperclip.svg"
import axios from "axios"
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
    const [posteringer, setPosteringer] = useState("");
    const [kommentar, setKommentar] = useState("");
    const [kommentarer, setKommentarer] = useState([]);

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
    }, [submitKommentar])
    
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

        // console.log("Bruger: " + user.id)
        // console.log("Opgave: " + opgaveID)
        // console.log("Form data ...")
        // console.log("Dato: " + posteringDato)
        // console.log("Handymantimer: " + handymantimer)
        // console.log("Tømrertimer: " + tømrertimer)
        // console.log("Udlæg: " + JSON.stringify(outlays))
        // console.log("Øvrige: " + JSON.stringify(øvrige))


        const postering = {
            dato: posteringDato,
            handymanTimer: handymantimer,
            tømrerTimer: tømrertimer,
            udlæg: outlays,
            øvrigt: øvrige,
            opgaveID: opgaveID,
            brugerID: userID
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
            setOutlays("");
            setØvrige("");
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
            setLoading(false)
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
        const bruger = ledigeAnsvarlige.find(user => user._id === brugerID);
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
        const nyAnsvarlig = ledigeAnsvarlige.find(ansvarlig => ansvarlig._id === nyAnsvarligId);
    
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
            console.log("Kommentar slettet:", response.data);
        })
        .catch(error => {
            console.error("Der opstod en fejl ved sletning af kommentaren:", error);
            // Optionally, display an error message to the user
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
                <form>
                    <label className={ÅbenOpgaveCSS.label} htmlFor="opgavebeskrivelse">Opgavebeskrivelse</label>
                    <textarea name="opgavebeskrivelse" className={ÅbenOpgaveCSS.opgavebeskrivelse} value={opgaveBeskrivelse} onChange={opdaterOpgavebeskrivelse} ></textarea>
                </form>
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
                            <b className={ÅbenOpgaveCSS.prefix}>Opgavestatus</b>
                            <form className={`${ÅbenOpgaveCSS.opgavestatusForm} ${ÅbenOpgaveCSS.marginTop10}`}>
                                <select style={conditionalStyles} name="opgavestatus" className={ÅbenOpgaveCSS.opgavestatus} onChange={opdaterOpgavestatus} value={status}>
                                    <option value="modtaget">Modtaget</option>
                                    <option value="accepteret">Accepteret</option>
                                    <option value="afventerSvar">Afventer svar</option>
                                    <option value="afvist">Afvist</option>
                                </select>
                            </form>
                        </div>
                    </div>
                </div>

                <div className={ÅbenOpgaveCSS.praktisk}>
                    <div className={ÅbenOpgaveCSS.uddelegering}>
                        <form className={ÅbenOpgaveCSS.tildelAnsvarligeForm} action="">
                            <b className={ÅbenOpgaveCSS.prefix}>Tildel ansvarlige:</b>
                            <select className={ÅbenOpgaveCSS.tildelAnsvarlige} defaultValue="Vælg Bob ..." name="vælgBob" onChange={tildelAnsvar}>
                                <option disabled>Vælg Bob ...</option>
                                {ledigeAnsvarlige && ledigeAnsvarlige.map((ledigAnsvarlig) => {
                                    return(
                                        <option key={ledigAnsvarlig._id} value={ledigAnsvarlig._id}>{ledigAnsvarlig.navn}</option>
                                    )
                                })}
                            </select>
                        </form>
                        
                        <div className={ÅbenOpgaveCSS.ansvarshavendeListe}>
                            <b className={ÅbenOpgaveCSS.prefix}>Nuv. ansvarlige:</b>
                            <div className={ÅbenOpgaveCSS.ansvarlige}>
                            {nuværendeAnsvarlige && nuværendeAnsvarlige.map((ansvarlig) => {
                                return (
                                    <p key={ansvarlig._id}>{ansvarlig.navn}<button className={ÅbenOpgaveCSS.fjernAnsvarlig} onClick={() => {fjernAnsvarlig(ansvarlig)}}>-</button></p>
                                )
                            })}
                            </div>
                        </div>
                    </div>
                [Kalender & plan indsættes her]
                </div>
                <div className={ÅbenOpgaveCSS.posteringer}>
                    <b className={ÅbenOpgaveCSS.prefix}>Posteringer & økonomi</b>
                    <div className={ÅbenOpgaveCSS.aktuellePosteringer}>
                        {posteringer && posteringer.map((postering) => {
                            return (
                                <div className={ÅbenOpgaveCSS.posteringCard} key={postering._id}>
                                    <img src={Paperclip} className={ÅbenOpgaveCSS.paperclip} alt="" />
                                    <p className={ÅbenOpgaveCSS.posteringDato}>{postering.dato.slice(0,10)}</p>
                                    <p className={ÅbenOpgaveCSS.posteringBruger}>{getBrugerName(postering.brugerID)}</p>
                                    <div className={ÅbenOpgaveCSS.posteringListe}>
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
                                            <b className={ÅbenOpgaveCSS.totalRækkeResultat}>{((postering.handymanTimer * 300)+(postering.tømrerTimer * 360)+(postering.udlæg.reduce((sum, item) => sum + Number(item.beløb), 0))+(postering.øvrigt.reduce((sum, item) => sum + Number(item.beløb), 0))) + " kr."}</b>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                    <button onClick={() => setOpenModal(true)} className={ÅbenOpgaveCSS.tilføjPosteringButton}>+ Ny postering</button>
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
                </div>
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
                                        <button className={ÅbenOpgaveCSS.kommentarKnap} onClick={() => {setOpenCommentModalID(kommentar._id), setEditedComment(kommentar.kommentarIndhold)}}>Rediger</button>
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
