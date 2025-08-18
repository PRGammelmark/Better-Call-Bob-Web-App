import React, { useState, useEffect } from 'react'
import Modal from '../../Modal.jsx'
import ÅbenOpgaveCSS from '../../../pages/ÅbenOpgave.module.css'
import Styles from './registrerBetalingModal.module.css'
import PageAnimation from '../../PageAnimation.jsx'
import axios from 'axios'
import * as beregn from '../../../utils/beregninger.js'
import { useAuthContext } from '../../../hooks/useAuthContext'
import { Trash, Coins } from 'lucide-react'

const RegistrerBetalingModal = ({trigger, setTrigger, postering, refetchPostering}) => {

    const { user } = useAuthContext();

    const [samletPris, setSamletPris] = useState(0)
    const [tidligereBetalinger, setTidligereBetalinger] = useState(0)
    const [restbeløb, setRestbeløb] = useState(0)
    const [tilføjBetalingsID, setTilføjBetalingsID] = useState(false)

    // Form state
    const [beløb, setBeløb] = useState(0)
    const [betalingsmetode, setBetalingsmetode] = useState('mobilepay')
    const [betalingsID, setBetalingsID] = useState('')
    const [dato, setDato] = useState(new Date().toISOString().split('T')[0])


    useEffect(() => {
        const samletPris = Math.ceil(postering.totalPris * 1.25 * 100) / 100
        const tidligereBetalinger = postering.betalinger.reduce((sum, betaling) => sum + betaling.betalingsbeløb, 0)
        const restbeløb = samletPris - tidligereBetalinger

        setSamletPris(samletPris)
        setTidligereBetalinger(tidligereBetalinger)
        setRestbeløb(restbeløb)

        setBeløb(restbeløb)
    }, [postering])

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        // Validering
        if (tilføjBetalingsID && !betalingsID.trim()) {
            alert("Indtast et betalings-ID");
            return;
        }
        if (beløb <= 0) {
            alert("Beløbet skal være større end 0");
            return;
        }
    
        const betaling = {
            betalingsID: betalingsID || "manual_" + new Date().getTime().toString(),
            betalingsbeløb: beløb,
            betalingsmetode: betalingsmetode,
            dato: dato,
            manueltRegistreret: true,
        };
    
        try {
            await axios.patch(
                `${import.meta.env.VITE_API_URL}/posteringer/${postering._id}`,
                { betalinger: [...postering.betalinger, betaling] },
                { headers: { 'Authorization': `Bearer ${user.token}` } }
            );
        
            await refetchPostering(); // ← afvent at state opdateres
            setTrigger(false); // ← luk først modal efter refetch
        } catch (err) {
            console.error("Fejl ved registrering af betaling:", err);
            alert("Der opstod en fejl ved registrering af betalingen");
        }
        
    };    

    return (
        <Modal trigger={trigger} setTrigger={setTrigger}>
            <PageAnimation>
                <h2 className={ÅbenOpgaveCSS.modalHeading}>Registrer eksisterende betaling</h2>
                <div className={Styles.overblikContainer}>
                    <div className={Styles.overblikLinje}>
                        <p>Samlet pris (inkl. moms):</p>
                        <p>{samletPris.toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                    <div className={Styles.overblikLinje}>
                        <p>Tidligere betalinger:</p>
                        <p>{tidligereBetalinger.toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                    <div className={Styles.overblikLinje} style={{borderTop: '1px solid #e0e0e0', paddingTop: 10}}>
                        <p><b style={{fontFamily: 'OmnesBold'}}>Restbeløb:</b></p>
                        <p><b style={{fontFamily: 'OmnesBold'}}>{restbeløb.toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b></p>
                    </div>
                </div>
                <form action="" onSubmit={handleSubmit}>
                    <div className={Styles.registrerBetalingContainer}>
                        <label className={ÅbenOpgaveCSS.label} htmlFor="">Dato for betalingen</label>
                        <input className={ÅbenOpgaveCSS.modalInput} type="date" style={{marginTop: -10}} value={dato} onChange={(e) => setDato(e.target.value)} />
                        <div className={Styles.kolonner}>
                            <div>
                                <label className={ÅbenOpgaveCSS.label}>Beløb (DKK):</label>
                                <input className={ÅbenOpgaveCSS.modalInput} type="number" id="beløb" name="beløb" value={beløb} onChange={(e) => setBeløb(Number(e.target.value))} />
                                {beløb > restbeløb && <p style={{fontSize: 12, color: '#ff0000', marginTop: -10}}>OBS! Dette beløb overbetaler posteringen</p>}
                                {beløb < restbeløb && <p style={{fontSize: 12, color: '#ff0000', marginTop: -10}}>OBS! Dette beløb underbetaler posteringen</p>}
                            </div>
                            <div>
                                <label className={ÅbenOpgaveCSS.label}>Betalingsmetode:</label>
                                <select className={Styles.select} name="betalingsmetode" id="betalingsmetode" value={betalingsmetode} onChange={(e) => setBetalingsmetode(e.target.value)}>
                                    <option value="mobilepay">Mobile Pay</option>
                                    <option value="faktura">Faktura</option>
                                    <option value="bankoverførsel">Bankoverførsel</option>
                                    <option value="betalingskort">Betalingskort</option>
                                    <option value="kontant">Kontant</option>
                                </select>
                            </div>
                        </div>
                        {!tilføjBetalingsID && <button type="button" className={`${ÅbenOpgaveCSS.subheadingTextButton} ${tilføjBetalingsID ? ÅbenOpgaveCSS.subheadingTextButtonActive : ""}`} onClick={() => setTilføjBetalingsID(!tilføjBetalingsID)}>Tilføj betalings-ID</button>}
                        {tilføjBetalingsID && 
                        <div>
                            <label className={ÅbenOpgaveCSS.label}>Betalings-ID:</label>
                            <div className={Styles.betalingsIDContainer}>
                                <input className={ÅbenOpgaveCSS.modalInput} type="text" id="betalingsID" name="betalingsID" value={betalingsID} onChange={(e) => setBetalingsID(e.target.value)} />
                                <button type="button" className={Styles.fjernBetalingsIDButton} onClick={() => setTilføjBetalingsID(!tilføjBetalingsID)}><Trash style={{width: 16, height: 16, color: '#ff0000'}} /></button>
                            </div>
                        </div>
                        }
                        <button className={Styles.submitButton} type="submit">Registrer betaling <Coins style={{width: 20, height: 20, color: '#fff'}} /></button>
                    </div>
                </form>
            </PageAnimation>
        </Modal>
    )
}

export default RegistrerBetalingModal