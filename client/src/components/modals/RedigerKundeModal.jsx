import React, { useState, useEffect } from 'react'
import Modal from '../Modal'
import ModalCSS from '../Modal.module.css'
import Styles from './RedigerKundeModal.module.css'
import SwitcherStyles from '../../pages/Switcher.module.css'
import ÅbenOpgaveCSS from '../../pages/ÅbenOpgave.module.css'
import axios from 'axios'
import { useAuthContext } from '../../hooks/useAuthContext'

const RedigerKundeModal = ({redigerKundeModal, setRedigerKundeModal, kunde, opdaterKunde, setOpdaterKunde}) => {

    const { user } = useAuthContext()
    
    const [nyeKundeinformationer, setNyeKundeinformationer] = useState({
        fornavn: kunde?.fornavn,
        efternavn: kunde?.efternavn,
        navn: kunde?.fornavn + " " + kunde?.efternavn,
        adresse: kunde?.adresse,
        postnummerOgBy: kunde?.postnummerOgBy,
        telefon: kunde?.telefon,
        email: kunde?.email,
        virksomhed: kunde?.virksomhed,
        CVR: kunde?.CVR,
        engelskKunde: kunde?.engelskKunde,
        harStige: kunde?.harStige,
        måKontaktesMedReklame: kunde?.måKontaktesMedReklame
    })
    const [error, setError] = useState("")

    // Sætter friske kundeinformationer i modalen, når kunden er initialiseret i parent-komponenten
    useEffect(() => {
        if (kunde) {
            setNyeKundeinformationer({
                fornavn: kunde.fornavn || "",
                efternavn: kunde.efternavn || "",
                navn: (kunde.fornavn || "") + " " + (kunde.efternavn || ""),
                adresse: kunde.adresse || "",
                postnummerOgBy: kunde.postnummerOgBy || "",
                telefon: kunde.telefon || "",
                email: kunde.email || "",
                virksomhed: kunde.virksomhed || "",
                CVR: kunde.CVR || "",
                engelskKunde: kunde.engelskKunde || false,
                harStige: kunde.harStige || false,
                måKontaktesMedReklame: kunde.måKontaktesMedReklame || false
            })
        }
    }, [kunde])

    // Sikrer, at navn opdateres korrekt, når fornavn eller efternavn ændres
    useEffect(() => {
        setNyeKundeinformationer(prev => ({
            ...prev,
            navn: `${prev.fornavn} ${prev.efternavn}`.trim()
        }))
    }, [nyeKundeinformationer.fornavn, nyeKundeinformationer.efternavn])

    function redigerKunde(e) {
        e.preventDefault()
        
        axios.patch(`${import.meta.env.VITE_API_URL}/kunder/${kunde._id}`, nyeKundeinformationer, {
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        })
        .then(res => {
            console.log(res)
            setOpdaterKunde(!opdaterKunde)
            setRedigerKundeModal(false)
        })
        .catch(err => {
            console.log(err)
            setError(err.response.data.error)
        })
    }

    useEffect(() => {
        console.log(kunde)
    }, [redigerKundeModal])

  return (
    <Modal trigger={redigerKundeModal} setTrigger={setRedigerKundeModal}>
            <h2 className={ÅbenOpgaveCSS.modalHeading}>Rediger kundeinformationer</h2>
            <form className={ÅbenOpgaveCSS.redigerKundeForm} onSubmit={redigerKunde}>
                <label className={ÅbenOpgaveCSS.label} htmlFor="fornavn">Fornavn</label>
                <input type="text" name="fornavn" required className={ÅbenOpgaveCSS.modalInput} value={nyeKundeinformationer.fornavn} onChange={(e) => setNyeKundeinformationer({...nyeKundeinformationer, fornavn: e.target.value})} onBlur={(e) => setNyeKundeinformationer({...nyeKundeinformationer, fornavn: e.target.value.trim()})}/>
                <label className={ÅbenOpgaveCSS.label} htmlFor="efternavn">Efternavn</label>
                <input type="text" name="efternavn" required className={ÅbenOpgaveCSS.modalInput} value={nyeKundeinformationer.efternavn} onChange={(e) => setNyeKundeinformationer({...nyeKundeinformationer, efternavn: e.target.value})} onBlur={(e) => setNyeKundeinformationer({...nyeKundeinformationer, efternavn: e.target.value.trim()})}/>
                <label className={ÅbenOpgaveCSS.label} htmlFor="navn">Adresse</label>
                <input type="text" name="adresse" required className={ÅbenOpgaveCSS.modalInput} value={nyeKundeinformationer.adresse} onChange={(e) => setNyeKundeinformationer({...nyeKundeinformationer, adresse: e.target.value})} onBlur={(e) => setNyeKundeinformationer({...nyeKundeinformationer, adresse: e.target.value.trim()})}/>
                <label className={ÅbenOpgaveCSS.label} htmlFor="postnummerOgBy">Postnummer og by</label>
                <input type="text" name="postnummerOgBy" required className={ÅbenOpgaveCSS.modalInput} value={nyeKundeinformationer.postnummerOgBy} onChange={(e) => setNyeKundeinformationer({...nyeKundeinformationer, postnummerOgBy: e.target.value})} onBlur={(e) => setNyeKundeinformationer({...nyeKundeinformationer, postnummerOgBy: e.target.value.trim()})}/>
                <label className={ÅbenOpgaveCSS.label} htmlFor="email">E-mail</label>
                <input type="text" name="email" required className={ÅbenOpgaveCSS.modalInput} value={nyeKundeinformationer.email} onChange={(e) => setNyeKundeinformationer({...nyeKundeinformationer, email: e.target.value})} onBlur={(e) => setNyeKundeinformationer({...nyeKundeinformationer, email: e.target.value.replace(/\s+/g, '')})}/>
                <label className={ÅbenOpgaveCSS.label} htmlFor="telefon">Telefon</label>
                <input type="text" name="telefon" required className={ÅbenOpgaveCSS.modalInput} value={nyeKundeinformationer.telefon} onChange={(e) => setNyeKundeinformationer({...nyeKundeinformationer, telefon: e.target.value})} onBlur={(e) => setNyeKundeinformationer({...nyeKundeinformationer, telefon: e.target.value.replace(/\s+/g, '')})}/>
                <label className={ÅbenOpgaveCSS.label} htmlFor="virksomhed">Virksomhed</label>
                <input type="text" name="virksomhed" className={ÅbenOpgaveCSS.modalInput} value={nyeKundeinformationer.virksomhed} onChange={(e) => setNyeKundeinformationer({...nyeKundeinformationer, virksomhed: e.target.value})} onBlur={(e) => setNyeKundeinformationer({...nyeKundeinformationer, virksomhed: e.target.value.trim()})}/>
                <label className={ÅbenOpgaveCSS.label} htmlFor="cvr">CVR-nummer</label>
                <input type="text" name="cvr" className={ÅbenOpgaveCSS.modalInput} value={nyeKundeinformationer.CVR} onChange={(e) => setNyeKundeinformationer({...nyeKundeinformationer, CVR: e.target.value})} onBlur={(e) => setNyeKundeinformationer({...nyeKundeinformationer, CVR: e.target.value.replace(/\s+/g, '')})}/>
                <div className={SwitcherStyles.checkboxContainer}>
                    <label className={SwitcherStyles.switch} htmlFor="måKontaktesMedReklame">
                        <input type="checkbox" id="måKontaktesMedReklame" name="måKontaktesMedReklame" className={SwitcherStyles.checkboxInput} checked={nyeKundeinformationer.måKontaktesMedReklame} onChange={(e) => setNyeKundeinformationer({...nyeKundeinformationer, måKontaktesMedReklame: e.target.checked})} />
                        <span className={SwitcherStyles.slider}></span>
                    </label>
                    <b>Må kontaktes med reklame</b>
                </div>
                <div className={SwitcherStyles.checkboxContainer}>
                    <label className={SwitcherStyles.switch} htmlFor="harStige">
                        <input type="checkbox" id="harStige" name="harStige" className={SwitcherStyles.checkboxInput} checked={nyeKundeinformationer.harStige} onChange={(e) => setNyeKundeinformationer({...nyeKundeinformationer, harStige: e.target.checked})} />
                        <span className={SwitcherStyles.slider}></span>
                    </label>
                    <b>Har stige</b>
                </div>
                <div className={SwitcherStyles.checkboxContainer}>
                    <label className={SwitcherStyles.switch} htmlFor="engelskKunde">
                        <input type="checkbox" id="engelskKunde" name="engelskKunde" className={SwitcherStyles.checkboxInput} checked={nyeKundeinformationer.engelskKunde} onChange={(e) => setNyeKundeinformationer({...nyeKundeinformationer, engelskKunde: e.target.checked})} />
                        <span className={SwitcherStyles.slider}></span>
                    </label>
                    <b>Engelsk kunde</b>
                </div>
                <p style={{marginTop: 10, fontSize: 13}}>(Automatiske e-mails, SMS'er og regninger til kunden vil være på engelsk.)</p>
                <button className={ModalCSS.buttonFullWidth} type="submit">Opdater kunde</button>
                {error && <p style={{color: "red", marginTop: 10}}>{error}</p>}
            </form>
        </Modal>
  )
}

export default RedigerKundeModal
