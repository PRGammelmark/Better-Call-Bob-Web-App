import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Modal from '../Modal.jsx'
import ÅbenOpgaveCSS from '../../pages/ÅbenOpgave.module.css'
import styles from './PosteringSatserModal.module.css'
import dayjs from 'dayjs'
import satser from '../../variables'

const PosteringSatserModal = (props) => {
    const postering = props.postering;

    const getBrugerName = (brugerID) => {
        const bruger = props.brugere && props.brugere.find(user => user._id === brugerID);
        return bruger ? bruger.navn : 'Unknown User';
    };

    const beregnLøngruppe = (postering) => {
        const akkumuleredeStandardSatser = 
            Number(satser.handymanTimerHonorar) + 
            Number(satser.tømrerTimerHonorar) + 
            Number(satser.rådgivningOpmålingVejledningHonorar) + 
            Number(satser.opstartsgebyrHonorar) + 
            Number(satser.aftenTillægHonorar) + 
            Number(satser.natTillægHonorar) + 
            Number(satser.trailerHonorar);

        const akkumuleredeBrugerSatser = 
            Number(postering.satser.handymanTimerHonorar) + 
            Number(postering.satser.tømrerTimerHonorar) + 
            Number(postering.satser.rådgivningOpmålingVejledningHonorar) + 
            Number(postering.satser.opstartsgebyrHonorar) + 
            Number(postering.satser.aftenTillægHonorar) + 
            Number(postering.satser.natTillægHonorar) + 
            Number(postering.satser.trailerHonorar);

        const løntrin = Math.floor((akkumuleredeBrugerSatser / akkumuleredeStandardSatser) * 10);
        return løntrin;
    }

    return (
        <Modal trigger={props.trigger} setTrigger={props.setTrigger} style={{backgroundColor: 'red'}}>
            <h2 className={styles.modalHeading}>Satser for postering</h2>
            <p className={styles.løngruppeP}>{getBrugerName(postering.brugerID)} er på <span style={{fontFamily: 'OmnesBold', background: '#f0f0f0', padding: '2px 8px', borderRadius: '10px'}}><b>løntrin {beregnLøngruppe(postering)}.</b></span></p>
            <div className={ÅbenOpgaveCSS.posteringCard}>
                <div>
                    <p className={ÅbenOpgaveCSS.posteringDato}>{postering.dato && postering.dato.slice(0,10)}</p>
                    <p className={ÅbenOpgaveCSS.posteringBruger}>{getBrugerName(postering.brugerID)}</p>
                    <i className={ÅbenOpgaveCSS.posteringBeskrivelse}>{postering.beskrivelse ? postering.beskrivelse : "Ingen beskrivelse."}</i>
                    <div className={ÅbenOpgaveCSS.kvitteringBillederListe}>
                        {postering.udlæg.map((udlæg, index) => {
                            return udlæg.kvittering ? 
                            <img 
                            key={`udlæg-${index}`}
                            className={ÅbenOpgaveCSS.kvitteringBillede} 
                            src={`${import.meta.env.VITE_API_URL}${udlæg.kvittering}`} 
                            alt={udlæg.beskrivelse} 
                            onClick={() => {
                                setKvitteringBillede(udlæg.kvittering);
                            }}/> 
                            : 
                            null;
                        })}
                    </div>
                </div>
                <div className={styles.posteringListe}>
                    <div className={styles.posteringRække}>
                        <span className={styles.posteringRækkeBeskrivelse}><b>Beskrivelse</b></span>
                        <span className={styles.posteringRækkeSatser}><b>Sats</b></span>
                        <span className={styles.posteringRækkeSatser}><b>Total</b></span>
                    </div>
                    {postering.opstart > 0 && (
                        <div className={styles.posteringRække}>
                            <span className={styles.posteringRækkeBeskrivelse}>1 Opstart</span>
                            <span className={styles.posteringRækkeSatser}>a' {postering.satser.opstartsgebyrHonorar} kr.</span>
                            <span className={styles.posteringRækkeSatser}>{(postering.opstart * postering.satser.opstartsgebyrHonorar).toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                        </div>
                    )}
                    {postering.handymanTimer > 0 && (
                        <div className={styles.posteringRække}>
                            <span className={styles.posteringRækkeBeskrivelse}>{postering.handymanTimer || 0} timer (handyman) </span>
                            <span className={styles.posteringRækkeSatser}>a' {postering.satser.handymanTimerHonorar} kr.</span>    
                            <span className={styles.posteringRækkeSatser}>{(postering.handymanTimer * postering.satser.handymanTimerHonorar).toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                        </div>
                    )}
                    {postering.tømrerTimer > 0 && (
                        <div className={styles.posteringRække}>
                            <span className={styles.posteringRækkeBeskrivelse}>{postering.tømrerTimer || 0} timer (tømrer) </span>
                            <span className={styles.posteringRækkeSatser}>a' {postering.satser.tømrerTimerHonorar} kr.</span>
                            <span className={styles.posteringRækkeSatser}>{(postering.tømrerTimer * postering.satser.tømrerTimerHonorar).toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                        </div>
                    )}
                    {postering.rådgivningOpmålingVejledning > 0 && (
                        <div className={styles.posteringRække}>
                            <span className={styles.posteringRækkeBeskrivelse}>{postering.rådgivningOpmålingVejledning || 0} timer (rådgivning) </span>
                            <span className={styles.posteringRækkeSatser}>a' {postering.satser.rådgivningOpmålingVejledningHonorar} kr.</span>
                            <span className={styles.posteringRækkeSatser}>{(postering.rådgivningOpmålingVejledning * postering.satser.rådgivningOpmålingVejledningHonorar).toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                        </div>
                    )}
                    {postering.aftenTillæg && (
                        <div className={styles.posteringRække}>
                            <span className={styles.posteringRækkeBeskrivelse}>Aftentillæg ({postering.satser.aftenTillægHonorar} x {postering.handymanTimer + postering.tømrerTimer + postering.rådgivningOpmålingVejledning}) </span>
                            <span className={styles.posteringRækkeSatser}>a' {postering.satser.aftenTillægHonorar} kr.</span>
                            <span className={styles.posteringRækkeSatser}>{((postering.handymanTimer + postering.tømrerTimer + postering.rådgivningOpmålingVejledning) * (postering.satser.aftenTillægHonorar)).toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                        </div>
                    )}
                    {postering.natTillæg && (
                        <div className={styles.posteringRække}>
                            <span className={styles.posteringRækkeBeskrivelse}>Nattillæg ({postering.satser.natTillægHonorar} x {postering.handymanTimer + postering.tømrerTimer + postering.rådgivningOpmålingVejledning}) </span>
                            <span className={styles.posteringRækkeSatser}>a' {postering.satser.natTillægHonorar} kr.</span>
                            <span className={styles.posteringRækkeSatser}>{((postering.handymanTimer + postering.tømrerTimer + postering.rådgivningOpmålingVejledning) * (postering.satser.natTillægHonorar)).toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                        </div>
                    )}
                    {postering.trailer && (
                        <div className={styles.posteringRække}>
                            <span className={styles.posteringRækkeBeskrivelse}>Trailer </span>
                            <span className={styles.posteringRækkeSatser}>a' {postering.satser.trailerHonorar} kr.</span>
                            <span className={styles.posteringRækkeSatser}>{(postering.satser.trailerHonorar).toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                        </div>
                    )}
                    {postering.udlæg.length > 0 && (
                        <div className={styles.posteringRække}>
                            <span className={styles.posteringRækkeBeskrivelse}>{postering.udlæg.length > 0 ? postering.udlæg.length : 0} udlæg </span>
                            <span className={styles.posteringRækkeSatser}>-</span>
                            <span className={styles.posteringRækkeSatser}>{(postering.udlæg.reduce((sum, item) => sum + Number(item.beløb), 0)).toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                        </div>
                    )}
                    {postering.rabatProcent > 0 && (
                        <div className={styles.posteringRække}>
                            <span className={styles.posteringRækkeBeskrivelse}>{postering.rabatProcent}% rabat</span>
                            <span className={styles.posteringRækkeSatser}>-</span>
                            <span>-{((postering.totalHonorar / (100 - postering.rabatProcent) * 100) * (postering.rabatProcent/100)).toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                        </div>
                    )}
                    <div className={styles.totalRække}>
                        <b className={styles.totalRækkeBeskrivelse}>Total: </b>
                        <b className={styles.totalRækkeResultat}>{(postering.totalHonorar).toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</b>
                    </div>
                </div>
                
            </div>
        </Modal>
    )
}

export default PosteringSatserModal