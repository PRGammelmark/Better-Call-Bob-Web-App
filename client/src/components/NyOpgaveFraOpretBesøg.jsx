import React, { useEffect } from 'react'
import NyOpgaveCSS from "../pages/NyOpgave.module.css"
import PageAnimation from '../components/PageAnimation'
import { useState } from 'react'
import SwitcherStyles from '../pages/Switcher.module.css'
import axios from 'axios'
import { useAuthContext } from '../hooks/useAuthContext'
import ModalStyles from '../components/modals/AddBesøg.module.css'

const NyOpgaveFraOpretBesøg = (props) => {

    // State managers
    const [opgaveBeskrivelse, setOpgaveBeskrivelse] = useState("");
    const [fornavn, setFornavn] = useState("");
    const [efternavn, setEfternavn] = useState("");
    const [CVR, setCVR] = useState("");
    const [virksomhed, setVirksomhed] = useState("");
    const [adresse, setAdresse] = useState("");
    const [postnummerOgBy, setPostnummerOgBy] = useState("");
    const [harStige, setHarStige] = useState(true);
    const [telefon, setTelefon] = useState("");
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState("");
    const [fakturaOprettesManuelt, setFakturaOprettesManuelt] = useState(false);
    const [tilbudAfgivet, setTilbudAfgivet] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [opgaveID, setOpgaveID] = useState("");
    const [medarbejdere, setMedarbejdere] = useState(null);
    const [ansvarlig, setAnsvarlig] = useState("");
    const setTilknyttetAnsvarlig = props.setTilknyttetAnsvarlig;
    const tilknyttetAnsvarlig = props.tilknyttetAnsvarlig;
    
    const {user} = useAuthContext()

    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API_URL}/brugere`, {
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        })
        .then(response => {
            setMedarbejdere(response.data)
        })
        .catch(error => {
            console.log(error)
        })
    }, [user])

    const submitOpgave = async (e) => {
        e.preventDefault();
        setLoading(true);

        const opgave = {
            opgaveBeskrivelse,
            navn: fornavn + " " + efternavn,
            CVR,
            virksomhed,
            adresse,
            postnummerOgBy,
            harStige,
            telefon,
            email,
            tilbudAfgivet,
            fakturaOprettesManuelt
            // ansvarlig: tilknyttetAnsvarlig || ansvarlig
        }

        axios.post(`${import.meta.env.VITE_API_URL}/opgaver`, opgave, {
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        })
        .then(response => {
            setLoading(false)
            setError(null)
            setOpgaveID(response.data._id)
            props.setTilknyttetOpgave(response.data)
            // props.setTilknyttetAnsvarlig(response.data.ansvarlig[0])
            props.setTilknyttetAnsvarlig(tilknyttetAnsvarlig || ansvarlig)
            props.setOpgaveOprettet(true)
        })
        .catch(error => {
            setLoading(false)
            setError(error.response ? error.response.data.error : 'An error occurred')
        })
    }

  return (
    <PageAnimation>
        <div>
            <form onSubmit={submitOpgave} className={NyOpgaveCSS.form}>
                {(props?.tilknyttetAnsvarlig && props.fraLedigTid) ? "" : <>
                <h3 className={NyOpgaveCSS.subHeading}>Vælg ansvarlig:</h3>
                <select className={ModalStyles.modalInput} id="ansvarlige" value={tilknyttetAnsvarlig && JSON.stringify(tilknyttetAnsvarlig)} style={{cursor: "pointer"}} required onChange={(e) => {setTilknyttetAnsvarlig(JSON.parse(e.target.value))}}>
                    <option value="" disabled hidden selected>Vælg ansvarlig ...</option>
                    {medarbejdere && medarbejdere.length > 0 ? (
                        medarbejdere.map((ansvarlig, index) => (
                            <option key={index} value={JSON.stringify(ansvarlig)}>{ansvarlig.navn}</option>
                        ))
                    ) : (
                        <option value="">Ingen ansvarlige</option>
                        )}
                </select>
                </>}
                <h3 className={NyOpgaveCSS.subHeading}>Opret ny opgave</h3>
                <textarea className={NyOpgaveCSS.opgavebeskrivelse} type="textarea" autoFocus="autofocus" name="opgavebeskrivelse" placeholder="Beskriv opgaven ..." onChange={(e) => setOpgaveBeskrivelse(e.target.value)} value={opgaveBeskrivelse} required/>
                <div className={NyOpgaveCSS.kolonner}>
                    <div className={NyOpgaveCSS.kolonneEt}>
                        <label className={NyOpgaveCSS.label}>Fornavn</label>
                        <input type="text" name="fornavn" placeholder="Fornavn" className={NyOpgaveCSS.input} onChange={(e) => setFornavn(e.target.value)} value={fornavn} required/>
                        <label className={NyOpgaveCSS.label}>Efternavn</label>
                        <input type="text" name="efternavn" placeholder="Efternavn" className={NyOpgaveCSS.input} onChange={(e) => setEfternavn(e.target.value)} value={efternavn} required/>
                        <label className={NyOpgaveCSS.label}>Adresse</label>
                        <input type="text" name="adresse" placeholder="Adresse" className={NyOpgaveCSS.input} onChange={(e) => setAdresse(e.target.value)} value={adresse} required/>
                        <label className={NyOpgaveCSS.label}>Postnummer og by</label>
                        <input type="text" name="postnummerOgBy" placeholder="Postnummer og by" className={NyOpgaveCSS.input} onChange={(e) => setPostnummerOgBy(e.target.value)} value={postnummerOgBy} required/>
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
                        <label className={SwitcherStyles.switch} htmlFor="harStige">
                            <input type="checkbox" id="harStige" name="harStige" className={SwitcherStyles.checkboxInput} checked={harStige} onChange={(e) => setHarStige(e.target.checked)} />
                            <span className={SwitcherStyles.slider}></span>
                        </label>
                        <b>Har kunden en stige?</b>
                    </div>
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
                <button type="submit" className={NyOpgaveCSS.submitButtonFullWidth}>Opret opgave & tilføj besøg</button>
            </form>
            {error && <div className={NyOpgaveCSS.error}>{error}</div>}
        </div>
    </PageAnimation>
  )
}

export default NyOpgaveFraOpretBesøg
