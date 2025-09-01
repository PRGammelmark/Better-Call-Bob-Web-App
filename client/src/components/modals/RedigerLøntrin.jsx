import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Modal from '../Modal.jsx'
import styles from './RedigerLøntrin.module.css'
import SwitcherStyles from '../../pages/Switcher.module.css'
import dayjs from 'dayjs'
import satser from '../../variables'
import SwithArrowsBlack from '../../assets/switchArrowsBlack.svg'
import RabatIcon from '../../assets/rabatIcon.svg'
import { useAuthContext } from '../../hooks/useAuthContext'

const RedigerLøntrin = (props) => {

    const bruger = props.trigger
    const { user } = useAuthContext()
    const [brugerSatser, setBrugerSatser] = useState(satser)
    const [akkumuleredeBrugerSatser, setAkkumuleredeBrugerSatser] = useState(0)
    const [forudindstilletLøntrin, setForudindstilletLøntrin] = useState(null)
    const [løntrin, setLøntrin] = useState(null)

    const akkumuleredeStandardSatser = 
        Number(satser.handymanTimerHonorar) + 
        Number(satser.tømrerTimerHonorar) + 
        Number(satser.rådgivningOpmålingVejledningHonorar) + 
        Number(satser.opstartsgebyrHonorar) + 
        Number(satser.aftenTillægHonorar) + 
        Number(satser.natTillægHonorar) + 
        Number(satser.trailerHonorar)
    ;
    
    useEffect(() => {
        setForudindstilletLøntrin(null)
    }, [props.trigger])
    

    useEffect(() => {
        setBrugerSatser(bruger && bruger.satser ? bruger.satser : satser)
    }, [bruger]);
    
    useEffect(() => {
        const provAkkBrugerSatser = 
            Number(brugerSatser.handymanTimerHonorar) + 
            Number(brugerSatser.tømrerTimerHonorar) + 
            Number(brugerSatser.rådgivningOpmålingVejledningHonorar) + 
            Number(brugerSatser.opstartsgebyrHonorar) + 
            Number(brugerSatser.aftenTillægHonorar) + 
            Number(brugerSatser.natTillægHonorar) + 
            Number(brugerSatser.trailerHonorar);
    
        setAkkumuleredeBrugerSatser(provAkkBrugerSatser);
    }, [brugerSatser, bruger]);
        

    const indstilLøntrin = (løntrin) => {
        const løntrinTilSatser = løntrin * 10;
    
        const nyeLønsatser = {
            handymanTimerHonorar: Math.round(satser.handymanTimerHonorar * (løntrinTilSatser / 100)),
            tømrerTimerHonorar: Math.round(satser.tømrerTimerHonorar * (løntrinTilSatser / 100)),
            rådgivningOpmålingVejledningHonorar: Math.round(satser.rådgivningOpmålingVejledningHonorar * (løntrinTilSatser / 100)),
            opstartsgebyrHonorar: Math.round(satser.opstartsgebyrHonorar * (løntrinTilSatser / 100)),
            aftenTillægHonorar: Math.round(satser.aftenTillægHonorar * (løntrinTilSatser / 100)),
            natTillægHonorar: Math.round(satser.natTillægHonorar * (løntrinTilSatser / 100)),
            trailerHonorar: Math.round(satser.trailerHonorar * (løntrinTilSatser / 100)),
        };
    
        setForudindstilletLøntrin(løntrin);
        setBrugerSatser(nyeLønsatser);
    };

    useEffect(() => {    
        const updatedLøntrin = Math.floor((akkumuleredeBrugerSatser / akkumuleredeStandardSatser) * 10);
        setLøntrin(updatedLøntrin);
    }, [akkumuleredeBrugerSatser, akkumuleredeStandardSatser, bruger]);
     

    const handleSubmit = (e) => {
        e.preventDefault()
        console.log(brugerSatser)

        axios.patch(`${import.meta.env.VITE_API_URL}/brugere/${bruger._id}`, {
            satser: brugerSatser
        }, {
            headers: {
                "Authorization": `Bearer ${user.token}`
            }
        })
        .then(res => {
            console.log(res)
            props.setTrigger(false)
        })
        .catch(err => {
            console.log(err)
        })
    }

    return (
        <Modal trigger={props.trigger} setTrigger={props.setTrigger} style={{backgroundColor: 'red'}}>
            <h2 className={styles.modalHeading}>Indstil lønsatser for {bruger && bruger.navn.split(' ')[0]}</h2>
            <form action="" onSubmit={handleSubmit}>
                <b style={{fontFamily: 'OmnesBold'}}>Nuværende løntrin: {løntrin}</b>
                <p className={styles.infoText}>Løntrinnet er baseret på forholdet mellem medarbejderens lønsatser og standardsatser.</p>
                <h3 className={styles.modalHeading3}>Lønsatser (ekskl. moms)</h3>
                <div className={styles.inputLinesContainer}>
                    <div className={styles.inputLine}>
                        <label className={styles.label} htmlFor="">Handymantimer<br /><span className={styles.subLabel}>Kr./timen</span></label>
                        <input className={styles.modalInput} type="number" value={brugerSatser.handymanTimerHonorar} min={0} max={999} onChange={(e) => {setBrugerSatser({...brugerSatser, handymanTimerHonorar: e.target.value}), setForudindstilletLøntrin(null)}}/>
                    </div>
                    <div className={styles.inputLine}>
                        <label className={styles.label} htmlFor="">Tømrertimer <br /><span className={styles.subLabel}>Kr./timen</span></label>
                        <input className={styles.modalInput} type="number" value={brugerSatser.tømrerTimerHonorar} min={0} max={999} onChange={(e) => {setBrugerSatser({...brugerSatser, tømrerTimerHonorar: e.target.value}), setForudindstilletLøntrin(null)}}/>
                    </div>
                    <div className={styles.inputLine}>
                        <label className={styles.label} htmlFor="">Rådgivning/opmåling <br /><span className={styles.subLabel}>Kr./timen</span></label>
                        <input className={styles.modalInput} type="number" value={brugerSatser.rådgivningOpmålingVejledningHonorar} min={0} max={999} onChange={(e) => {setBrugerSatser({...brugerSatser, rådgivningOpmålingVejledningHonorar: e.target.value}), setForudindstilletLøntrin(null)}}/>
                    </div>
                    <div className={styles.inputLine}>
                        <label className={styles.label} htmlFor="">Opstartsgebyr <br /><span className={styles.subLabel}>Kr./gang</span></label>
                        <input className={styles.modalInput} type="number" value={brugerSatser.opstartsgebyrHonorar} min={0} max={999} onChange={(e) => {setBrugerSatser({...brugerSatser, opstartsgebyrHonorar: e.target.value}), setForudindstilletLøntrin(null)}}/>
                    </div>
                    <div className={styles.inputLine}>
                        <label className={styles.label} htmlFor="">Aftentillæg <br /><span className={styles.subLabel}>Kr./timen</span></label>
                        <input className={styles.modalInput} type="number" value={brugerSatser.aftenTillægHonorar} min={0} max={999} onChange={(e) => {setBrugerSatser({...brugerSatser, aftenTillægHonorar: e.target.value}), setForudindstilletLøntrin(null)}}/>
                    </div>
                    <div className={styles.inputLine}>
                        <label className={styles.label} htmlFor="">Nattillæg <br /><span className={styles.subLabel}>Kr./timen</span></label>
                        <input className={styles.modalInput} type="number" value={brugerSatser.natTillægHonorar} min={0} max={999} onChange={(e) => {setBrugerSatser({...brugerSatser, natTillægHonorar: e.target.value}), setForudindstilletLøntrin(null)}}/>
                    </div>
                    <div className={styles.inputLine}>
                        <label className={styles.label} htmlFor="">Trailer <br /><span className={styles.subLabel}>Kr./gang</span></label>
                        <input className={styles.modalInput} type="number" value={brugerSatser.trailerHonorar} min={0} max={999} onChange={(e) => {setBrugerSatser({...brugerSatser, trailerHonorar: e.target.value}), setForudindstilletLøntrin(null)}}/>
                    </div>
                </div>
                <h3 className={styles.modalHeading3}>Indstil minimumssatser til løntrin</h3>
                <div className={styles.lynButtonContainer}>
                    <button type="button" className={`${styles.lynButton} ${forudindstilletLøntrin === 5 ? styles.activeLynButton : ''}`} onClick={() => indstilLøntrin(5)}>Løntrin 5</button>
                    <button type="button" className={`${styles.lynButton} ${forudindstilletLøntrin === 6 ? styles.activeLynButton : ''}`} onClick={() => indstilLøntrin(6)}>Løntrin 6</button>
                    <button type="button" className={`${styles.lynButton} ${forudindstilletLøntrin === 7 ? styles.activeLynButton : ''}`} onClick={() => indstilLøntrin(7)}>Løntrin 7</button>
                    <button type="button" className={`${styles.lynButton} ${forudindstilletLøntrin === 8 ? styles.activeLynButton : ''}`} onClick={() => indstilLøntrin(8)}>Løntrin 8</button>
                    <button type="button" className={`${styles.lynButton} ${forudindstilletLøntrin === 9 ? styles.activeLynButton : ''}`} onClick={() => indstilLøntrin(9)}>Løntrin 9</button>
                    <button type="button" className={`${styles.lynButton} ${forudindstilletLøntrin === 10 ? styles.activeLynButton : ''}`} onClick={() => indstilLøntrin(10)}>Løntrin 10</button>
                </div>
                <div className={styles.obsInfo}>
                    <p>OBS! Ændringer i medarbejderens lønsatser gælder for fremtidige posteringer – ikke nuværende eller tidligere.</p>
                </div>
                <button className={styles.submitButton}><b>Gem lønsatser</b></button>
            </form>
        </Modal>
    )
}

export default RedigerLøntrin