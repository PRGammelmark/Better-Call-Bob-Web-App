import React, { useState, useEffect } from 'react'
import Modal from '../../Modal.jsx'
import ÅbenOpgaveCSS from '../../../pages/ÅbenOpgave.module.css'
import Styles from '../OpretRegningModal.module.css'
import SwitcherStyles from '../../../pages/Switcher.module.css'
import mobilePayLogo from '../../../assets/mobilePay.png'
import BarLoader from '../../loaders/BarLoader.js'
import BackButton from '../../../assets/back.svg'
import PageAnimation from '../../PageAnimation.jsx'
import axios from 'axios'
import sendMobilePayAnmodning from './sendMobilePayAnmodning.js'
import * as beregn from '../../../utils/beregninger.js'
import { useAuthContext } from '../../../hooks/useAuthContext'

const BetalViaMobilePayAnmodningModal = ({trigger, setTrigger, postering, setOpgave, refetchPostering}) => {
    const [opgaveLøstTilfredsstillende, setOpgaveLøstTilfredsstillende] = useState(false)
    const [telefonnummerTilAnmodning, setTelefonnummerTilAnmodning] = useState(postering[0]?.kunde?.telefon || '')
    const [loading, setLoading] = useState(false)
    const [betalingsfristTimer, setBetalingsfristTimer] = useState(0)
    const [paymentRequested, setPaymentRequested] = useState(false)
    const [paymentCaptured, setPaymentCaptured] = useState(false)
    // const [paymentCancelled, setPaymentCancelled] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')

    const { user } = useAuthContext();

    useEffect(() => {
        let timer;
        if (betalingsfristTimer > 0) {
            timer = setInterval(() => {
                setBetalingsfristTimer(prevTimer => prevTimer - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [betalingsfristTimer]);

    useEffect(() => {
        if(paymentCaptured) {
            refetchPostering()
        }
    }, [paymentCaptured])

    function sendAnmodning() {
        setLoading(true)
        sendMobilePayAnmodning({posteringer: posteringer, user, telefonnummerTilAnmodning, setLoading, setBetalingsfristTimer, setPaymentRequested, setPaymentCaptured, setErrorMessage})
    }

    const posteringer = Array.isArray(postering) ? postering : [postering];
    const kunde = posteringer[0]?.kunde;
    const anmodningBeløb = posteringer && posteringer.length > 0 ? parseFloat((Math.ceil(beregn.totalPris(posteringer, 2, true).beløb * 100) / 100 - posteringer.reduce((sum, p) => sum + (p.betalinger?.reduce((s, b) => s + b.betalingsbeløb, 0) || 0), 0)).toFixed(2)) : 0



  return (
    <Modal trigger={trigger} setTrigger={setTrigger}>

        {/* ====== SEND ANMODNING ====== */}
        {!loading && !paymentRequested && !paymentCaptured && !errorMessage &&
        <>
        <PageAnimation>
            <h2 className={ÅbenOpgaveCSS.modalHeading} style={{paddingRight: 20}}>Send Mobile Pay-anmodning ({anmodningBeløb?.toLocaleString('da-DK', {minimumFractionDigits: 2, maximumFractionDigits: 2})} kr.)</h2>
            <form action="">
            <p className={ÅbenOpgaveCSS.bottomMargin10}>Du er ved at oprette en Mobile Pay-anmodning til {postering?.kunde?.navn.split(' ')[0]} på i alt <b className={ÅbenOpgaveCSS.bold}>{anmodningBeløb?.toLocaleString('da-DK', {minimumFractionDigits: 2, maximumFractionDigits: 2})} kr.</b> inkl. moms.</p>
            <div className={ÅbenOpgaveCSS.bekræftIndsendelseDiv}>
                <b className={ÅbenOpgaveCSS.bold}>Bekræft følgende:</b>
                <div className={SwitcherStyles.checkboxContainer}>
                    <label className={SwitcherStyles.switch} htmlFor="opgaveLøst">
                        <input type="checkbox" id="opgaveLøst" name="opgaveLøst" className={SwitcherStyles.checkboxInput} required checked={opgaveLøstTilfredsstillende} onChange={(e) => setOpgaveLøstTilfredsstillende(e.target.checked)} />
                        <span className={SwitcherStyles.slider}></span>
                    </label>
                    <b>Er opgaverne for posteringen gennemgået og godkendt af kunden?</b>
                </div>
            </div>
        </form>
        {opgaveLøstTilfredsstillende && <input style={{marginTop: 10, marginBottom: 10, textAlign: 'center', paddingRight: 65}} className={ÅbenOpgaveCSS.modalInput} type="tel" name="telefonnummer" id="telefonnummer" placeholder="Indtast evt. andet nummer til anmodning" onChange={(e) => setTelefonnummerTilAnmodning(e.target.value)} />}
        {opgaveLøstTilfredsstillende && <button className={Styles.betalNuKnap} onClick={() => sendAnmodning()}><span>Send Mobile Pay-anmodning<br /><span style={{fontSize: 13}}>Tlf.: {telefonnummerTilAnmodning ? telefonnummerTilAnmodning : kunde?.telefon}</span></span> <img className={Styles.mobilePayLogo} src={mobilePayLogo} alt="Mobile Pay" /></button>}
        </PageAnimation>
        </>
        }

        {/* ====== SENDER ANMODNING ====== */}
        {loading && 
        <><div className={Styles.loadingSubmission}>
            <h2>Sender anmodning ...</h2>
            <BarLoader
                color="#59bf1a"
                width={100}
                ariaLabel="oval-loading"
                wrapperStyle={{}}
                wrapperClass=""
            />
            </div>
            <button className={Styles.annullerKnap} onClick={() => {setLoading(false); setPaymentRequested(false); setErrorMessage('')}}>Annuller</button>
        </>}

        {/* ====== AFVENTER OVERFØRSEL AF BETALING ====== */}
        {(paymentRequested && !(loading || paymentCaptured || errorMessage)) &&
        <>
        <PageAnimation>
            <div className={Styles.betalSenereModalHeader}>
                <img src={BackButton} className={Styles.backButton} onClick={() => setPaymentRequested(false)} alt="Tilbage" /><h2 className={ÅbenOpgaveCSS.modalHeading}>Afventer betaling ...</h2>
            </div>
            <p>En Mobile Pay-betalingsanmodning på <b className={ÅbenOpgaveCSS.bold}>{anmodningBeløb?.toLocaleString('da-DK', {minimumFractionDigits: 2, maximumFractionDigits: 2})} kr.</b> er blevet sendt til kunden.</p>
            <div className={Styles.loadingSubmission}>
            <b style={{display: 'block', textAlign: 'center', fontSize: 18, fontFamily: 'OmnesBold'}}>Afventer kundens godkendelse ...</b>
            {betalingsfristTimer > 0 ? (
                    <p className={Styles.betalingsfristTimer}>
                        Anmodningen udløber om {Math.floor(betalingsfristTimer / 60)} minutter og {betalingsfristTimer % 60} sekunder.
                    </p>
                )
                :
                <p className={Styles.betalingsfristTimerUdløbet}>Anmodningen er udløbet – prøv igen.</p>
                }
            </div>
        </PageAnimation>
        </>
        }

        {/* ====== BETALING GODKENDT ====== */}
        {paymentCaptured && !errorMessage &&
            <PageAnimation>
                <div className={Styles.successSubmission}>
                    <h2 className={Styles.successHeading}>Betalingen er godkendt 🎉</h2>
                <p className={Styles.successText}>Betalingen er blevet godkendt og registreret på posteringen.</p>
            </div>
        </PageAnimation>
        }

        {/* ====== FEJL ====== */}
        {errorMessage && 
        <PageAnimation>
            <div className={Styles.errorSubmission}>
                <div className={Styles.betalSenereModalHeader}>
                    <img src={BackButton} className={Styles.backButton} onClick={() => setErrorMessage('')} alt="Tilbage" /><h2 style={{fontFamily: 'OmnesBold'}} className={Styles.errorHeading}>{errorMessage} 🚫</h2>
                </div>
                <p className={Styles.errorText}>Betalingen blev ikke gennemført. Gå tilbage og prøv igen.</p>
                <button className={Styles.annullerKnap} style={{marginTop: 30}} onClick={() => setErrorMessage('')}>Gå tilbage</button>
            </div>
        </PageAnimation>
        }
    </Modal>
  )
}

export default BetalViaMobilePayAnmodningModal