import React, { useState, useEffect } from 'react'
import Modal from '../../Modal.jsx'
import ÅbenOpgaveCSS from '../../../pages/ÅbenOpgave.module.css'
import Styles from './registrerBetalingModal.module.css'
import PageAnimation from '../../PageAnimation.jsx'
import axios from 'axios'
import * as beregn from '../../../utils/beregninger.js'
import { useAuthContext } from '../../../hooks/useAuthContext'
import { Trash, Coins, ReceiptText } from 'lucide-react'

const RegistrerOpkrævningModal = ({trigger, setTrigger, postering, refetchPostering}) => {

    const { user } = useAuthContext();

    // Form state

    const [dato, setDato] = useState(new Date().toISOString().split('T')[0] + "T12:00:00");
    const [fakturaNummer, setFakturaNummer] = useState('')

    const handleDatoChange = (e) => {
        const selectedDate = e.target.value;
        setDato(selectedDate + "T12:00:00");
    };

    
    const handleSubmit = async (e) => {
        e.preventDefault();

        const economicWrapperReference = `https://restapi.e-conomic.com/invoices/booked/${fakturaNummer}`    
        
        const opkrævningsDato = new Date(dato);
        // Set betalingsdato to 8 days from opkrævningsdato
        const betalingsdato = new Date(opkrævningsDato.getTime() + 8 * 24 * 60 * 60 * 1000);
        
        // Beregn opkrævningsbeløb: totalPris inkl. moms minus allerede betalte beløb
        const totalPrisInklMoms = (postering.totalPris || 0) * 1.25;
        const alleredeBetaltBeløb = postering.betalinger?.reduce((sum, betaling) => sum + (betaling.betalingsbeløb || 0), 0) || 0;
        const opkrævningsbeløb = totalPrisInklMoms - alleredeBetaltBeløb;
    
        const opkrævning = {
            reference: economicWrapperReference,
            opkrævningsbeløb: opkrævningsbeløb,
            metode: "faktura",
            dato: dato,
            betalingsdato: betalingsdato,
            manueltRegistreret: true
        }

        try {
            await axios.patch(
                `${import.meta.env.VITE_API_URL}/posteringer/${postering._id}`,
                { opkrævninger: [...postering.opkrævninger, opkrævning] },
                { headers: { 'Authorization': `Bearer ${user.token}` } }
            );
        
            await refetchPostering(); // ← afvent at state opdateres
            setTrigger(false); // ← luk først modal efter refetch
        } catch (err) {
            console.error("Fejl ved registrering af opkrævning:", err);
            alert("Der opstod en fejl ved registrering af opkrævningen");
        }
        
    };    

    return (
        <Modal trigger={trigger} setTrigger={setTrigger}>
            <PageAnimation>
                <h2 className={ÅbenOpgaveCSS.modalHeading}>Registrer faktura-opkrævning</h2>
                <form action="" onSubmit={handleSubmit}>
                    <div className={Styles.registrerBetalingContainer}>
                        <label className={ÅbenOpgaveCSS.label} htmlFor="">Dato for opkrævningen</label>
                        <input className={ÅbenOpgaveCSS.modalInput} type="date" style={{marginTop: -10}} value={dato.split("T")[0]} onChange={handleDatoChange} />
                        <div>
                            <label className={ÅbenOpgaveCSS.label}>Faktura-nummer:</label>
                            <input className={ÅbenOpgaveCSS.modalInput} type="text" id="fakturaNummer" name="fakturaNummer" value={fakturaNummer} onChange={(e) => setFakturaNummer(e.target.value)} />
                        </div>
                        <button className={Styles.submitButton} disabled={!fakturaNummer} type="submit">Registrer faktura-opkrævning <ReceiptText style={{width: 20, height: 20, color: '#fff'}} /></button>
                    </div>
                </form>
            </PageAnimation>
        </Modal>
    )
}

export default RegistrerOpkrævningModal