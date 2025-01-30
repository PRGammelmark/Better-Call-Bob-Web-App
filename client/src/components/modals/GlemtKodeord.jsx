import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Modal from '../Modal.jsx'
import ÅbenOpgaveCSS from '../../pages/ÅbenOpgave.module.css'
import Styles from './GlemtKodeord.module.css'
import SwitcherStyles from '../../pages/Switcher.module.css'
import dayjs from 'dayjs'
import satser from '../../variables'
import SwithArrowsBlack from '../../assets/switchArrowsBlack.svg'
import RabatIcon from '../../assets/rabatIcon.svg'
import { useAuthContext } from '../../hooks/useAuthContext'
import BackIcon from '../../assets/back.svg'

const GlemtKodeord = (props) => {
    const { user } = useAuthContext()
    const [email, setEmail] = useState("")
    const [success, setSuccess] = useState(false)

    const handleSubmit = (e) => {
        e.preventDefault()
        
        axios.post(`${import.meta.env.VITE_API_URL}/password/request-reset-password`, {
                email: email
            })
            .then(response => {
                setSuccess(true)
            })
            .catch(error => {
                console.log("Der skete en fejl.");
                console.log(error);
            })
    }

    return (
        <Modal trigger={props.trigger} setTrigger={props.setTrigger} >
            {!success && <div className={Styles.modalHeadingContainer}>
                <h2 className={Styles.modalHeading}>Gendan kodeord</h2>
            </div>}
            {!success && <p className={Styles.modalText}>Indtast din email herunder – så sender vi dig et link til gendannelse af dit kodeord.</p>}
            {!success && <form className={`${ÅbenOpgaveCSS.modalForm} ${Styles.modalForm}`} onSubmit={handleSubmit}>
                <input className={ÅbenOpgaveCSS.modalInput} type="email" id="email" name="email" value={email} required onChange={(e) => setEmail(e.target.value)} />
                <button className={Styles.modalButton} >Send link</button>
            </form>}
            {success && 
            <div className={Styles.success}>
                <div className={Styles.modalHeadingContainer}>
                    <img className={Styles.backIcon} src={BackIcon} alt="switch arrows" onClick={() => {setSuccess(false); setEmail("")}} />
                    <h2 className={Styles.modalHeading}>Gendan kodeord</h2>
                </div>
                <p className={Styles.modalText}>Hvis emailen – <i>{email}</i> – er registreret i vores system har vi sendt dig et link. Kig i din mailindbakke for yderligere instruktioner.</p>
                <button className={Styles.modalButton} onClick={() => props.setTrigger(false)}>Tilbage til login</button>
            </div>}
        </Modal>
    )
}

export default GlemtKodeord