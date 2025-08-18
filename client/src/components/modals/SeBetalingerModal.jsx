import React, { useState, useEffect } from 'react'
import Modal from '../Modal.jsx'
import Styles from './SeBetalingerModal.module.css'
import { useAuthContext } from '../../hooks/useAuthContext.js'
import dayjs from 'dayjs'
import { Smartphone, Banknote, BanknoteArrowDown } from 'lucide-react'
import axios from 'axios'

const SeBetalingerModal = (props) => {
    const [visMere, setVisMere] = useState(false)
    const [betalinger, setBetalinger] = useState(props.postering.betalinger);
    const { user } = useAuthContext();

    useEffect(() => {
        setBetalinger(props.postering.betalinger);
    }, [props.postering.betalinger]);
    
    
    const handleDelete = async (betaling) => {
        if (!window.confirm("Er du sikker på, at du vil slette denne betaling?")) return;
    
        try {
            const updated = betalinger.filter(b => b.betalingsID !== betaling.betalingsID);
    
            await axios.patch(
                `${import.meta.env.VITE_API_URL}/posteringer/${props.postering._id}`,
                { betalinger: updated },
                {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    }
                }
            );
    
            setBetalinger(updated); // Opdater UI
            props.refetchPostering();
    
        } catch (err) {
            console.error("Fejl ved sletning af betaling:", err);
            alert("Kunne ikke slette betalingen");
        }
    };
    

  return (
    <Modal trigger={props.trigger} setTrigger={props.setTrigger}> 
        <h2>Betalinger for denne postering</h2>
        <div className={Styles.betalingerContainer}>
            {betalinger.map((betaling) => {
                let betalingsMetode;

                if(betaling.betalingsmetode === 'mobilepay') {
                    betalingsMetode = <span style={{display: 'flex', alignItems: 'center', gap: 5}}><Smartphone style={{width: 18, height: 18}}/> <b style={{fontFamily: 'OmnesBold'}}>Mobile Pay</b></span>
                } else if(betaling.betalingsmetode === 'faktura') {
                    betalingsMetode = <span style={{display: 'flex', alignItems: 'center', gap: 5}}><Banknote style={{width: 18, height: 18}}/> <b style={{fontFamily: 'OmnesBold'}}>Faktura</b></span>
                } else if(betaling.betalingsmetode === 'bankoverførsel') {
                    betalingsMetode = <span style={{display: 'flex', alignItems: 'center', gap: 5}}><BanknoteArrowDown style={{width: 18, height: 18}}/> <b style={{fontFamily: 'OmnesBold'}}>Bankoverførsel</b></span>
                }

                return (
                    <div key={betaling.betalingsID} className={Styles.betalingWrapper}>
                        <div className={Styles.betalingCard}>
                            <div className={Styles.betalingerHeader}>
                                <div>
                                    <p>{dayjs(betaling.dato).format('D. MMMM YYYY')}</p>
                                    <p className={Styles.klokkeslæt}>Kl. {dayjs(betaling.dato).format('HH:mm')}</p>
                                </div>
                                <b style={{fontFamily: 'OmnesBold'}}>{betalingsMetode}</b>
                            </div>
                            <div className={Styles.betalingerBody}>
                                <p className={Styles.beløb}>Beløb: {betaling.betalingsbeløb.toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                            </div>
                            <div className={Styles.betalingerFooter}>
                                {betaling.betalingsID && <>
                                    <p style={{fontSize: 12, color: '#808080'}}>Betalings-ID: {visMere ? betaling.betalingsID : (betaling?.betalingsID?.substring(0, 10) + " ...")}</p>
                                    <p className={Styles.visMereKnap} onClick={() => setVisMere(!visMere)}>{visMere ? 'Vis mindre' : 'Vis mere'}</p>
                                </>}
                                {!betaling.betalingsID && <i style={{fontSize: 12, color: '#808080'}}>Betalings-ID ikke angivet</i>}
                            </div>
                        </div>
                        {betaling.manueltRegistreret && (
                            <button
                                className={Styles.sletBetalingKnap}
                                onClick={() => handleDelete(betaling)}
                            >
                                Slet betaling
                            </button>
                        )}
                    </div>
                )
            })}
        </div>
    </Modal>
  )
}

export default SeBetalingerModal

