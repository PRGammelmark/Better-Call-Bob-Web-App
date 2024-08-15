import React from 'react'
import ÅbenOpgaveCSS from './ÅbenOpgave.module.css'
import PageAnimation from '../components/PageAnimation'
import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import BackIcon from "../assets/back.svg"
import axios from "axios"

const ÅbenOpgave = () => {
    const { opgaveID } = useParams();
    const navigate = useNavigate();

    // state managers
    const [opgave, setOpgave] = useState(null);
    const [loading, setLoading] = useState(true);
    const [opgaveBeskrivelse, setOpgaveBeskrivelse] = useState(null);
    const [status, setStatus] = useState("");
    const [navn, setNavn] = useState("");
    const [adresse, setAdresse] = useState("");
    const [onsketDato, setOnsketDato] = useState("");
    const [harStige, setHarStige] = useState(false);
    const [telefon, setTelefon] = useState("");
    const [email, setEmail] = useState("");
    const [timer, setTimer] = useState(null);

    useEffect(() => {
        axios.get(`http://localhost:3000/api/opgaver/${opgaveID}`)
        .then(res => {
            setOpgave(res.data);
            setOpgaveBeskrivelse(res.data.opgaveBeskrivelse);
            setStatus(res.data.status);
            setNavn(res.data.navn);
            setAdresse(res.data.adresse);
            setHarStige(res.data.harStige);
            setTelefon(res.data.telefon);
            setEmail(res.data.email);
            setLoading(false)
        })
        .catch(error => console.log(error))
    }, [])

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
        })
        .then(res => console.log(res.data))
        .catch(error => console.log(error))
    }

    const conditionalStyles = {
        backgroundColor: status === "accepteret" ? 'rgba(89, 191, 26, 0.25)' : status === "afventerSvar" ? 'rgba(224, 227, 50, 0.25)' : status === "afvist" ? 'rgba(193, 26, 57, 0.25)' : 'white',
        color: status === "accepteret" ? 'rgba(89, 191, 26, 1)' : status === "afventerSvar" ? 'rgba(179, 116, 0, 0.85)' : status === "afvist" ? 'rgba(193, 26, 57, 1)' : '#333333'
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

                <p>Opgave-ID: {opgave._id}</p>
                <p>Navn: {opgave.navn}</p>
                <p>Adresse: {opgave.adresse}</p>
                <p>Modtaget: {new Date(opgave.createdAt).toLocaleDateString()}</p>
                <p>Status: {opgave.status}</p>
                <p>Fremskridt: {opgave.fremskridt}</p>
                <p>Ansvarlig: {opgave.ansvarlig ? opgave.ansvarlig : "Ikke uddelegeret"}</p>
            </div>
            </PageAnimation>
        </div>
  )
}

export default ÅbenOpgave
