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

const RegistrerBetalingsModal = (props) => {

    const { user } = useAuthContext()
    const [betalingsDato, setBetalingsDato] = useState("")

    const handleSubmit = (e) => {
        e.preventDefault()
        
        axios.patch(`${import.meta.env.VITE_API_URL}/opgaver/${props.opgave._id}`, {
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
            <h2 className={ÅbenOpgaveCSS.modalHeading}>Registrér betaling</h2>
            <p className={Styles.modalText}>Markér herunder hvornår betalingen for opgaven blev modtaget.</p>
            <form className={`${ÅbenOpgaveCSS.modalForm} ${Styles.modalForm}`} onSubmit={handleSubmit}>
                <input className={ÅbenOpgaveCSS.modalInput} type="date" id="betalingsDato" name="betalingsDato" value={betalingsDato} onChange={(e) => setBetalingsDato(e.target.value)} onFocus={(e) => e.target.showPicker()} />
                {betalingsDato && <button className={Styles.modalButton} >Registrér betaling</button>}
            </form>
        </Modal>
    )
}

export default RegistrerBetalingsModal