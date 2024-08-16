import React from 'react'
import NyOpgaveCSS from "./NyOpgave.module.css"
import PageAnimation from '../components/PageAnimation'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuthContext } from '../hooks/useAuthContext'

const NyOpgave = () => {

    const {user} = useAuthContext()
    if (!user) {
        return "Du skal være logget ind."
    }

    // State managers
    const [opgaveBeskrivelse, setOpgaveBeskrivelse] = useState("");
    const [navn, setNavn] = useState("");
    const [adresse, setAdresse] = useState("");
    const [onsketDato, setOnsketDato] = useState("");
    const [harStige, setHarStige] = useState(true);
    const [telefon, setTelefon] = useState("");
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState("");
    const [fremskridt, setFremskridt] = useState("");
    const [error, setError] = useState(null);
    const [ansvarlig, setAnsvarlig] = useState("");
    const [succes, setSucces] = useState(false);
    const [loading, setLoading] = useState(false);
    const [opgaveID, setOpgaveID] = useState("");

    const submitOpgave = async (e) => {
        e.preventDefault();
        setLoading(true);

        const opgave = {
            opgaveBeskrivelse,
            navn,
            adresse,
            onsketDato,
            harStige,
            telefon,
            email
        }

        const response = await fetch('http://localhost:3000/api/opgaver', {
            method: 'POST',
            body: JSON.stringify(opgave),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.token}`
            }
        })

        const json = await response.json()

        if (!response.ok) {
            setLoading(false)
            setError(json.error)
        }

        if (response.ok) {
            setLoading(false)
            setError(null);
            setSucces(true);
            setOpgaveID(json._id);
        }
    }

    function startForfra(){
        setOpgaveBeskrivelse("");
        setNavn("");
        setAdresse("");
        setOnsketDato("");
        setHarStige(false);
        setTelefon("");
        setEmail("");
        setSucces(false);
        setOpgaveID("");
    }

    const navigate = useNavigate();

    function navigerTilOpgave(){
        navigate(`../opgave/${opgaveID}`)
    }

  return (
    <PageAnimation>
        <div>
            <span className={NyOpgaveCSS.headingSpan}><h1 className={NyOpgaveCSS.overskrift}>📋 Opret ny opgave</h1></span>
            <form onSubmit={submitOpgave} className={NyOpgaveCSS.form}>
                <textarea className={NyOpgaveCSS.opgavebeskrivelse} type="textarea" autoFocus="autofocus" name="opgavebeskrivelse" placeholder="Beskriv opgaven ..." onChange={(e) => setOpgaveBeskrivelse(e.target.value)} value={opgaveBeskrivelse} required/>
                <div className={NyOpgaveCSS.kolonner}>
                    <div className={NyOpgaveCSS.kolonneEt}>
                        <label className={NyOpgaveCSS.label}>Navn</label>
                        <input type="text" name="navn" placeholder="Navn" className={NyOpgaveCSS.input} onChange={(e) => setNavn(e.target.value)} value={navn} required/>
                        <label className={NyOpgaveCSS.label}>Adresse</label>
                        <input type="text" name="adresse" placeholder="Adresse" className={NyOpgaveCSS.input} onChange={(e) => setAdresse(e.target.value)} value={adresse} required/>
                        <label className={NyOpgaveCSS.label}>Hvornår ønskes opgaven udført?</label>
                        <input type="datetime-local" name="tid&dato" className={NyOpgaveCSS.input} onChange={(e) => setOnsketDato(e.target.value)} value={onsketDato} required/>
                        <div className={NyOpgaveCSS.checkboxContainer}>
                            <input type="checkbox" name="harStige" className={NyOpgaveCSS.checkbox} onChange={(e) => setHarStige(e.target.value)} checked={harStige}/>  
                            <label className={NyOpgaveCSS.label}>Har kunden en stige?</label>
                        </div>
                        
                    </div>
                    <div className={NyOpgaveCSS.kolonneTo}>
                        <label className={NyOpgaveCSS.label}>Telefon</label>
                        <input type="tel" name="telefon" className={NyOpgaveCSS.input} onChange={(e) => setTelefon(e.target.value)} value={telefon} required/>
                        <label className={NyOpgaveCSS.label}>Email</label>
                        <input type="email" name="email" className={NyOpgaveCSS.input} onChange={(e) => setEmail(e.target.value)} value={email} required/>
                    </div>
                </div>
                <div className={NyOpgaveCSS.submitMeddelelser}>
                    {succes ? <div>
                        <h2>Opgave oprettet! 🎉</h2>
                        <div className={NyOpgaveCSS.succesButtonsDiv}>
                            <button className={NyOpgaveCSS.submitButton} type="button" onClick={startForfra} >Opret ny</button>
                            <button className={NyOpgaveCSS.submitButton} type="button" onClick={navigerTilOpgave}>Gå til opgave</button>
                        </div>
                    </div> : <button className={NyOpgaveCSS.submitButton}>{loading ? "Opretter opgave ..." : "Opret opgave"}</button>}
                </div>
            </form>
            {error && <div className={NyOpgaveCSS.error}>{error}</div>}
        </div>
    </PageAnimation>
  )
}

export default NyOpgave
