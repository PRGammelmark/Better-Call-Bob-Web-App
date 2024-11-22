import React, { useState } from 'react'
import Modal from '../Modal.jsx'
import ÅbenOpgaveCSS from '../../pages/ÅbenOpgave.module.css'
import Styles from './OpretFakturaModal.module.css'

const OpretFakturaModal = ({åbnBetalFakturaModal, setÅbnBetalFakturaModal}) => {
    const [betalingsdato, setBetalingsdato] = useState('')

    return (
    <Modal trigger={åbnBetalFakturaModal} setTrigger={setÅbnBetalFakturaModal}>
        <h2 className={ÅbenOpgaveCSS.modalHeading}>Registrer fakturabetaling</h2>
        <p className={ÅbenOpgaveCSS.prefix} style={{marginBottom: 10}}>Hvornår blev fakturaen betalt?</p>
        <input type="date" className={ÅbenOpgaveCSS.modalInput} value={betalingsdato} onChange={(e) => setBetalingsdato(e.target.value)} />
        <p style={{marginBottom: 10}}>Registrering af fakturabetaling vil markere opgaven som afsluttet.</p>
        <button className={ÅbenOpgaveCSS.registrerPosteringButton}>Registrer fakturabetaling</button>
    </Modal>
  )
}

export default OpretFakturaModal