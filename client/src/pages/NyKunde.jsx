import React, { useState } from 'react'
import styles from './NyKunde.module.css'
import PageAnimation from '../components/PageAnimation'
import { useNavigate } from 'react-router-dom'
import SwitcherStyles from '../pages/Switcher.module.css'
import axios from 'axios'
import { useAuthContext } from '../hooks/useAuthContext'


const NyKunde = () => {

    const {user} = useAuthContext()
    
    if (!user) {
        return "Du skal være logget ind."
    }

    const [fornavn, setFornavn] = useState("");
    const [efternavn, setEfternavn] = useState("");
    const [adresse, setAdresse] = useState("");
    const [postnummerOgBy, setPostnummerOgBy] = useState("");
    const [telefon, setTelefon] = useState("");
    const [email, setEmail] = useState("");
    const [harStige, setHarStige] = useState(false);
    const [måKontaktesMedReklame, setMåKontaktesMedReklame] = useState(false);
    const [cvr, setCvr] = useState("");
    const [virksomhed, setVirksomhed] = useState("");
    const [engelskKunde, setEngelskKunde] = useState(false);
    const [noter, setNoter] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [succes, setSucces] = useState(false);
    const [kundeID, setKundeID] = useState("")

    const navigate = useNavigate();
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSucces(false);
    
        const trimmedFornavn = fornavn.trim();
        const trimmedTelefon = telefon.trim();
        const trimmedEmail = email.trim();
        const trimmedCvr = cvr.trim();
    
        const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        const isValidTelefon = (telefon) => "" || /^\d{8}$/.test(telefon);
        const isValidCVR = (cvr) => cvr === "" || /^[A-Z0-9]+$/.test(cvr);
        const isValidPostnummerOgBy = (val) => /^\d{4}\s+\D+/.test(val);
    
        if (!trimmedFornavn || !efternavn || !adresse || !postnummerOgBy || !trimmedEmail) {
            setError("Alle påkrævede felter skal udfyldes.");
            return;
        }
    
        if (!isValidEmail(trimmedEmail)) {
            setError("Ugyldig emailadresse.");
            return;
        }
    
        if (trimmedTelefon && !isValidTelefon(trimmedTelefon)) {
            setError("Telefonnummer skal være 8 cifre.");
            return;
        }
    
        if (!isValidCVR(trimmedCvr)) {
            setError("CVR skal være et gyldigt CVR-nummer (op til 20 tegn, kun bogstaver og tal, ingen mellemrum).");
            return;
        }
    
        if (!isValidPostnummerOgBy(postnummerOgBy)) {
            setError("Du skal udfylde 'Postnummer & by'.");
            return;
        }
    
        setLoading(true);

        const kunde = {
            fornavn,
            efternavn,
            virksomhed,
            CVR: cvr,
            adresse,
            postnummerOgBy,
            telefon,
            email,
            harStige,
            måKontaktesMedReklame,
            engelskKunde,
            noter
        }
    
            axios.post(`${import.meta.env.VITE_API_URL}/kunder/`, kunde, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            })
            .then(res => {
                setSucces(true);
                console.log(res.data)
                setLoading(false)
                setKundeID(res.data._id)
            })
            .catch(error => {
                console.log(error)
                setLoading(false)
                // setError(error.response.data.error)
                if (error.response?.data?.error?.includes("E11000 duplicate key error") && error.response?.data?.error?.includes("email")) {
                    setError("Der findes allerede en kunde med denne email i systemet.");
                    
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
    };
    

    function startForfra(){
        setFornavn("");
        setEfternavn("");
        setAdresse("");
        setPostnummerOgBy("");
        setTelefon("");
        setEmail("");
        setHarStige(false);
        setMåKontaktesMedReklame(false);
        setCvr("");
        setVirksomhed("");
        setEngelskKunde(false);
        setNoter("");
        setSucces(false);
    }

    return (
            <div>
                <span className={styles.headingSpan}><h1 className={styles.overskrift}>💁‍♀️ Opret ny kunde</h1></span>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <h2 className={styles.subHeading}>Kundeoplysninger & præferencer</h2>
                    <div className={styles.kolonner}>
                        <div className={styles.kolonneEt}>
                            <label className={styles.label}>Fornavn</label>
                            <input tabIndex={1} type="text" name="fornavn" placeholder="Fornavn" className={styles.input} onChange={(e) => setFornavn(e.target.value)} value={fornavn} required onBlur={(e) => setFornavn(e.target.value.trim())}/>
                            <label className={styles.label}>Adresse</label>
                            <input tabIndex={3} type="text" name="adresse" placeholder="Adresse" className={styles.input} onChange={(e) => setAdresse(e.target.value)} value={adresse} required onBlur={(e) => setAdresse(e.target.value.trim())}/>
                            <label className={styles.label}>Evt. virksomhed</label>
                            <input tabIndex={5} type="text" name="virksomhed" placeholder="Virksomhed" className={styles.input} onChange={(e) => setVirksomhed(e.target.value)} value={virksomhed} onBlur={(e) => setVirksomhed(e.target.value.trim())}/>
                        </div>
                        <div className={styles.kolonneTo}>
                            <label className={styles.label}>Efternavn</label>
                            <input tabIndex={2} type="text" name="efternavn" placeholder="Efternavn" className={styles.input} onChange={(e) => setEfternavn(e.target.value)} value={efternavn} required onBlur={(e) => setEfternavn(e.target.value.trim())}/>
                            <label className={styles.label}>Postnummer og by</label>
                            <input tabIndex={4} type="text" name="postnummerOgBy" placeholder="Postnummer og by" className={styles.input} onChange={(e) => setPostnummerOgBy(e.target.value)} value={postnummerOgBy} required onBlur={(e) => setPostnummerOgBy(e.target.value.trim())}/>
                            <label className={styles.label}>Evt. CVR</label>
                            <input tabIndex={6} type="text" name="cvr" placeholder="CVR-nummer" className={styles.input} onChange={(e) => setCvr(e.target.value.toUpperCase().replace(/\s+/g, ''))} value={cvr} onBlur={(e) => setCvr(e.target.value.toUpperCase().replace(/\s+/g, ''))}/>
                        </div>
                    </div>
                    <div className={styles.noterWrapper}>
                        <label className={styles.label}>Noter</label>
                        <textarea tabIndex={7} className={styles.noter} type="textarea" name="noter" placeholder="Evt. noter til kunden ..." onChange={(e) => setNoter(e.target.value)} value={noter} />
                    </div>
                    <div style={{marginTop: 30, display: "flex", flexDirection: "column", gap: 8}}>
                        <div className={SwitcherStyles.checkboxContainer}>
                            <label className={SwitcherStyles.switch} htmlFor="harStige">
                                <input type="checkbox" id="harStige" name="harStige" className={SwitcherStyles.checkboxInput} checked={harStige} onChange={(e) => setHarStige(e.target.checked)} />
                                <span className={SwitcherStyles.slider}></span>
                            </label>
                            <p style={{fontSize: 14, fontFamily: "OmnesBold"}}>Har egen stige</p>
                        </div>
                    </div>
                    <h2 className={styles.subHeading} style={{marginTop: "40px"}}>Kontaktinformation</h2>
                    <div className={styles.kolonner}>
                        <div className={styles.kolonneEt}>
                            <label className={styles.label}>Email</label>
                            <input tabIndex={8} type="text" name="email" placeholder="Email" className={styles.input} onChange={(e) => setEmail(e.target.value)} value={email} required onBlur={(e) => setEmail(e.target.value.replace(/\s+/g, ''))}/>
                        </div>
                        <div className={styles.kolonneTo}>
                            <label className={styles.label}>Telefon</label>
                            <input tabIndex={9} type="text" name="telefon" placeholder="Telefon" className={styles.input} onChange={(e) => setTelefon(e.target.value)} value={telefon} onBlur={(e) => setTelefon(e.target.value.replace(/\s+/g, ''))}/>
                        </div>
                    </div>
                    <div style={{marginTop: 30, display: "flex", flexDirection: "column", gap: 8}}>
                        <div className={SwitcherStyles.checkboxContainer}>
                            <label className={SwitcherStyles.switch} htmlFor="måKontaktesMedReklamer">
                                <input type="checkbox" id="måKontaktesMedReklamer" name="måKontaktesMedReklamer" className={SwitcherStyles.checkboxInput} checked={måKontaktesMedReklame} onChange={(e) => setMåKontaktesMedReklame(e.target.checked)} />
                                <span className={SwitcherStyles.slider}></span>
                            </label>
                            <p style={{fontSize: 14, fontFamily: "OmnesBold"}}>Må kontaktes med reklamer</p>
                        </div>
                        <div className={SwitcherStyles.checkboxContainer}>
                            <label className={SwitcherStyles.switch} htmlFor="kundenErEngelsk">
                                <input type="checkbox" id="kundenErEngelsk" name="kundenErEngelsk" className={SwitcherStyles.checkboxInput} checked={engelskKunde} onChange={(e) => setEngelskKunde(e.target.checked)} />
                                <span className={SwitcherStyles.slider}></span>
                            </label>
                            <p style={{fontSize: 14, fontFamily: "OmnesBold"}}>Foretrækker kommunikation på engelsk</p>
                        </div>
                    </div>
                    <div className={styles.submitMeddelelser}>
                        {succes ? <div>
                            <h2>Kunde oprettet! 🎉</h2>
                            <div className={styles.succesButtonsDiv}>
                                <button className={styles.submitButton} type="button" onClick={startForfra} >Opret ny kunde</button>
                                {kundeID ? <button className={styles.submitButton} type="button" onClick={() => navigate(`/kunde/${kundeID}`)} >Gå til kunde</button> : ""}
                            </div>
                        </div> : 
                        <button className={styles.submitButton} disabled={loading}>
                            {loading ? "Opretter kunde ..." : "Opret kunde"}
                        </button>}
                    </div>
                    {error && <div className={styles.error}>{error}</div>}
                </form>
            </div>
    )
}

export default NyKunde
