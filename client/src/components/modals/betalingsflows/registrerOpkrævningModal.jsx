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
    const [loading, setLoading] = useState(false)

    const handleDatoChange = (e) => {
        const selectedDate = e.target.value;
        setDato(selectedDate + "T12:00:00");
    };

    const economicHeaders = {
        'Accept': 'application/json',
        'X-AppSecretToken': import.meta.env.VITE_BCBSECRETTOKEN,
        'X-AgreementGrantToken': import.meta.env.VITE_BCBAGREEMENTGRANTTOKEN
    }
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Hent fakturaen fra e-conomic for at validere beløb og hente betalingsfrist
            const fakturaResponse = await axios.get(
                `https://restapi.e-conomic.com/invoices/booked/${fakturaNummer}`,
                { headers: economicHeaders }
            );

            const faktura = fakturaResponse.data;
            
            // Hent faktiske værdier fra fakturaen
            const fakturaBeløb = faktura.grossAmountInBaseCurrency || faktura.grossAmount;
            const fakturaDueDate = faktura.dueDate;

            // Brug fakturaens dueDate som betalingsfrist, eller dato + 8 dage hvis dueDate ikke findes
            const opkrævningsDato = new Date(dato);
            let betalingsfrist;
            
            if (fakturaDueDate) {
                // Konverter dueDate (YYYY-MM-DD) til Date objekt med kl. 12:00
                betalingsfrist = new Date(fakturaDueDate + 'T12:00:00');
            } else {
                // Fallback til 8 dage fra opkrævningsdato
                betalingsfrist = new Date(opkrævningsDato.getTime() + 8 * 24 * 60 * 60 * 1000);
            }

            const economicWrapperReference = `https://restapi.e-conomic.com/invoices/booked/${fakturaNummer}`;

            const opkrævning = {
                reference: economicWrapperReference,
                opkrævningsbeløb: Number(fakturaBeløb.toFixed(2)),
                metode: "faktura",
                dato: opkrævningsDato.toISOString(),
                betalingsfrist: betalingsfrist.toISOString(),
                manueltRegistreret: true
            }

            await axios.patch(
                `${import.meta.env.VITE_API_URL}/posteringer/${postering._id}`,
                { opkrævninger: [...(postering.opkrævninger || []), opkrævning] },
                { headers: { 'Authorization': `Bearer ${user.token}` } }
            );
        
            await refetchPostering();
            setTrigger(false);
        } catch (err) {
            console.error("Fejl ved registrering af opkrævning:", err);
            
            if (err.response?.status === 404) {
                alert(`Faktura ${fakturaNummer} blev ikke fundet i e-conomic. Tjek at fakturanummeret er korrekt.`);
            } else if (err.response?.status === 401 || err.response?.status === 403) {
                alert("Fejl ved autentificering med e-conomic. Kontakt administrator.");
            } else {
                const errorMessage = err.response?.data?.error || err.message || "Ukendt fejl";
                alert(`Der opstod en fejl ved registrering af opkrævningen: ${errorMessage}`);
            }
        } finally {
            setLoading(false);
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
                        <button className={Styles.submitButton} disabled={!fakturaNummer || loading} type="submit">
                            {loading ? 'Henter faktura...' : 'Registrer faktura-opkrævning'} 
                            {!loading && <ReceiptText style={{width: 20, height: 20, color: '#fff'}} />}
                        </button>
                    </div>
                </form>
            </PageAnimation>
        </Modal>
    )
}

export default RegistrerOpkrævningModal