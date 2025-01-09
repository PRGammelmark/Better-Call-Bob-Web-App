import React from 'react'
import NyOpgaveCSS from "./NyOpgave.module.css"
import PageAnimation from '../components/PageAnimation'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuthContext } from '../hooks/useAuthContext'
import SwitcherStyles from './Switcher.module.css'


const NyOpgave = () => {

    const {user} = useAuthContext()
    if (!user) {
        return "Du skal være logget ind."
    }

    // State managers
    const [opgaveBeskrivelse, setOpgaveBeskrivelse] = useState("");
    const [navn, setNavn] = useState("");
    const [CVR, setCVR] = useState("");
    const [virksomhed, setVirksomhed] = useState("");
    const [adresse, setAdresse] = useState("");
    const [postnummerOgBy, setPostnummerOgBy] = useState("");
    const [onsketDato, setOnsketDato] = useState("");
    const [harStige, setHarStige] = useState(true);
    const [telefon, setTelefon] = useState("");
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState("");
    const [fakturaOprettesManuelt, setFakturaOprettesManuelt] = useState(false);
    const [tilbudAfgivet, setTilbudAfgivet] = useState("");
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
            CVR,
            virksomhed,
            adresse,
            postnummerOgBy,
            onsketDato,
            harStige,
            telefon,
            email,
            tilbudAfgivet,
            fakturaOprettesManuelt
        }

        const response = await fetch(`${import.meta.env.VITE_API_URL}/opgaver`, {
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
        setCVR("");
        setVirksomhed("");
        setAdresse("");
        setPostnummerOgBy("");
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
                        <label className={NyOpgaveCSS.label}>Postnummer og by</label>
                        <input type="text" name="postnummerOgBy" placeholder="Postnummer og by" className={NyOpgaveCSS.input} onChange={(e) => setPostnummerOgBy(e.target.value)} value={postnummerOgBy} required/>
                        <label className={NyOpgaveCSS.label}>Hvornår ønskes opgaven udført?</label>
                        <input type="datetime-local" name="tid&dato" className={NyOpgaveCSS.input} onChange={(e) => setOnsketDato(e.target.value)} value={onsketDato} required/>
                        <div className={NyOpgaveCSS.checkboxContainer}>
                            <input type="checkbox" name="harStige" className={NyOpgaveCSS.checkbox} onChange={(e) => setHarStige(e.target.checked)} checked={harStige}/>  
                            <label className={NyOpgaveCSS.label}>Har kunden en stige?</label>
                        </div>
                        
                    </div>
                    <div className={NyOpgaveCSS.kolonneTo}>
                        <label className={NyOpgaveCSS.label}>Evt. CVR</label>
                        <input type="text" name="CVR" className={NyOpgaveCSS.input} onChange={(e) => setCVR(e.target.value)} value={CVR}/>
                        <label className={NyOpgaveCSS.label}>Evt. virksomhed</label>
                        <input type="text" name="virksomhed" className={NyOpgaveCSS.input} onChange={(e) => setVirksomhed(e.target.value)} value={virksomhed}/>
                        <label className={NyOpgaveCSS.label}>Telefon</label>
                        <input type="tel" name="telefon" className={NyOpgaveCSS.input} onChange={(e) => setTelefon(e.target.value)} value={telefon} required/>
                        <label className={NyOpgaveCSS.label}>Email</label>
                        <input type="email" name="email" className={NyOpgaveCSS.input} onChange={(e) => setEmail(e.target.value)} value={email} required/>
                    </div>
                </div>
                <div className={NyOpgaveCSS.manuelFakturaOprettelseDiv}>
                    <div className={SwitcherStyles.checkboxContainer}>
                        <label className={SwitcherStyles.switch} htmlFor="fakturaOprettesManuelt">
                            <input type="checkbox" id="fakturaOprettesManuelt" name="fakturaOprettesManuelt" className={SwitcherStyles.checkboxInput} checked={fakturaOprettesManuelt} onChange={(e) => setFakturaOprettesManuelt(e.target.checked)} />
                            <span className={SwitcherStyles.slider}></span>
                        </label>
                        <b>Opret faktura manuelt?</b>
                    </div>
                    <p style={{marginTop: 10, fontSize: 13}}>(Hvis du fx har talt med kunden om rammer for prisen på forhånd.)</p>
                    {fakturaOprettesManuelt && 
                    <div style={{marginTop: 20}}>
                        <label className={NyOpgaveCSS.label}>Indtast evt. aftalt tilbudspris i kr.</label>
                        <input style={{marginTop: 5}} type="number" name="tilbudAfgivet" className={NyOpgaveCSS.input} onChange={(e) => setTilbudAfgivet(e.target.value)} value={tilbudAfgivet} required/>
                    </div>}
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
