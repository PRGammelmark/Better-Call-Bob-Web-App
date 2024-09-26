import React from 'react'
import PageAnimation from '../components/PageAnimation'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import styles from "./NyBruger.module.css"
import { useSignup } from '../hooks/useSignup'

const NyBruger = () => {
    
// State managers
const [navn, setNavn] = useState("");
const [adresse, setAdresse] = useState("");
const [titel, setTitel] = useState("");
const [password, setPassword] = useState("");
const [telefon, setTelefon] = useState("");
const [email, setEmail] = useState("");
const [isAdmin, setIsAdmin] = useState(false);
const [brugerID, setBrugerID] = useState("");
const { signup, error, loading, succes, setSucces } = useSignup();

const handleSubmit = async (e) => {
    e.preventDefault();

    await signup(navn, adresse, titel, telefon, email, password, isAdmin)
}

function startForfra(){
    setNavn("");
    setTelefon("");
    setAdresse("");
    setIsAdmin(false);
    setEmail("");
    setTitel("");
    setPassword("");
    setSucces(false);
    setBrugerID("");
}

const navigate = useNavigate();

function navigerTilBruger(){
    navigate(`../brugere/${brugerID}`)
}

function autoKode(){
    let randomPassword = ""
    const setOfCharacters = "abcdefghijklmnopqrstuvwxyzæøåABCDEFGHIJKLMNOPQRSTUVWXYZÆØÅ123456789!#€%&/()=^*_-.,";
    const setLength = setOfCharacters.length;
    let codeLength = 24;
    let counter = 0;

    while (counter < codeLength){
        randomPassword += setOfCharacters.charAt(Math.floor(Math.random() * setLength));
        counter += 1;
    }

    setPassword(randomPassword);
}

return (
<PageAnimation>
    <div>
        <span className={styles.headingSpan}><h1 className={styles.overskrift}>👷🏼‍♂️ Opret ny bruger</h1></span>
        <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.kolonner}>
                <div className={styles.kolonneEt}>
                    <label className={styles.label}>Navn</label>
                    <input type="text" name="navn" placeholder="Navn" className={styles.input} onChange={(e) => setNavn(e.target.value)} value={navn} required/>
                    <label className={styles.label}>Adresse</label>
                    <input type="text" name="adresse" placeholder="Adresse" className={styles.input} onChange={(e) => setAdresse(e.target.value)} value={adresse} required/>
                    <label className={styles.label}>Titel</label>
                    <input type="text" name="titel" className={styles.input} onChange={(e) => setTitel(e.target.value)} value={titel} />
                    <div className={styles.checkboxContainer}>
                        <input type="checkbox" name="isAdmin" className={styles.checkbox} onChange={(e) => setIsAdmin(e.target.checked)} checked={isAdmin}/>  
                        <label className={styles.label}>Giv administrator-rettigheder</label>
                    </div>
                    
                </div>
                <div className={styles.kolonneTo}>
                    <label className={styles.label}>Telefon</label>
                    <input type="tel" name="telefon" className={styles.input} onChange={(e) => setTelefon(e.target.value)} value={telefon} required/>
                    <label className={styles.label}>Email</label>
                    <input type="email" name="email" className={styles.input} onChange={(e) => setEmail(e.target.value)} value={email} required/>
                    <label className={styles.label}>Kodeord</label>
                    <input type="text" name="password" className={styles.input} onChange={(e) => setPassword(e.target.value)} value={password} required/>
                    <button type="button" className={styles.button} onClick={autoKode}>Autogenerér kodeord</button>
                </div>
            </div>
            <div className={styles.submitMeddelelser}>
                {succes ? <div>
                    <h2>Bruger oprettet! 🎉</h2>
                    <div className={styles.succesButtonsDiv}>
                        <button className={styles.submitButton} type="button" onClick={startForfra} >Opret ny bruger</button>
                        <button className={styles.submitButton} type="button" onClick={navigerTilBruger}>Gå til bruger</button>
                    </div>
                </div> : <button className={styles.submitButton}>{loading ? "Opretter bruger ..." : "Opret bruger"}</button>}
            </div>
        </form>
        {error && <div className={styles.error}>{error}</div>}
    </div>
</PageAnimation>
)
}

export default NyBruger
