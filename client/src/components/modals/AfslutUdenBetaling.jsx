import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Modal from '../Modal.jsx'
import ÅbenOpgaveCSS from '../../pages/ÅbenOpgave.module.css'
import Styles from './AfslutUdenBetaling.module.css'
import SwitcherStyles from '../../pages/Switcher.module.css'
import dayjs from 'dayjs'
import satser from '../../variables'
import SwithArrowsBlack from '../../assets/switchArrowsBlack.svg'
import RabatIcon from '../../assets/rabatIcon.svg'
import { useAuthContext } from '../../hooks/useAuthContext'

const AfslutUdenBetaling = (props) => {

    const { user } = useAuthContext()
    const [betalingsDato, setBetalingsDato] = useState("")

    const handleSubmit = (e) => {
        e.preventDefault()
        
        axios.patch(`${import.meta.env.VITE_API_URL}/opgaver/${props.opgave._id}`, {
            opgaveAfsluttet: dayjs(),
            opgaveBetaltPåAndenVis: betalingsDato ? dayjs(betalingsDato) : null
        }, {
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        })
        .then(res => {
            props.setUpdateOpgave(!props.updateOpgave)
            props.setTrigger(false)
        })
        .catch(error => console.log(error))
    }

    return (
        <Modal trigger={props.trigger} setTrigger={props.setTrigger} >
            <h2 className={ÅbenOpgaveCSS.modalHeading}>Afslut uden betaling?</h2>
            <p className={Styles.modalText}>Du er ved at afslutte opgaven uden om de integrerede betalingsløsninger.</p>
            <p className={Styles.modalText}>Du kan registrere betalingsdatoen herunder, hvis du har modtaget betaling for opgaven på anden vis.</p>
            <form className={`${ÅbenOpgaveCSS.modalForm} ${Styles.modalForm}`} onSubmit={handleSubmit}>
                <input className={ÅbenOpgaveCSS.modalInput} type="date" id="betalingsDato" name="betalingsDato" value={betalingsDato} onChange={(e) => setBetalingsDato(e.target.value)} onFocus={(e) => e.target.showPicker()} />
                {betalingsDato && <button type="button" className={Styles.linklikeButton} onClick={() => setBetalingsDato("")}>Ryd betalingsdato</button>}
                <button className={Styles.modalButton} >Afslut opgaven<br /><span className={Styles.modalButtonDate}>{betalingsDato ? `Betalt d. ${dayjs(betalingsDato).format('DD. MMMM YYYY')}` : 'Ingen betaling registreret.'}</span></button>
            </form>
        </Modal>
    )
}

export default AfslutUdenBetaling