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
import opretMobilePayQR from './opretMobilePayQR.js'
import * as beregn from '../../../utils/beregninger.js'
import { useAuthContext } from '../../../hooks/useAuthContext.js'

const BetalViaMobilePayQRModal = ({trigger, setTrigger, postering, setOpgave, refetchPostering}) => {
    const [opgaveLøstTilfredsstillende, setOpgaveLøstTilfredsstillende] = useState(false)
    const [loading, setLoading] = useState(false)
    const [betalingsfristTimer, setBetalingsfristTimer] = useState(0)
    const [qrOprettet, setQrOprettet] = useState(false)
    const [qrURL, setQrURL] = useState('')
    const [paymentCaptured, setPaymentCaptured] = useState(false)
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

    function opretQR() {
        setLoading(true)
        opretMobilePayQR({posteringer: postering, user, setLoading, setBetalingsfristTimer, setQrOprettet, setQrURL, setPaymentCaptured, setErrorMessage, refetchPostering})
    }

    const posteringer = Array.isArray(postering) ? postering : [postering];
    const kunde = posteringer[0]?.kunde;
    const anmodningBeløb = posteringer && posteringer.length > 0 ? parseFloat((Math.ceil(beregn.totalPris(posteringer, 2, true).beløb * 100) / 100 -posteringer.reduce((sum, p) => sum + (p.betalinger?.reduce((s, b) => s + b.betalingsbeløb, 0) || 0), 0)).toFixed(2)) : 0

  return (
    <Modal trigger={trigger} setTrigger={setTrigger}>

        {/* ====== SEND ANMODNING ====== */}
        {!loading && !qrOprettet && !paymentCaptured && !errorMessage &&
        <>
        <PageAnimation>
            <h2 className={ÅbenOpgaveCSS.modalHeading} style={{paddingRight: 20}}>Mobile Pay-betaling – scan QR-kode ({anmodningBeløb?.toLocaleString('da-DK', {minimumFractionDigits: 2, maximumFractionDigits: 2})} kr.)</h2>
            <form action="">
            <p className={ÅbenOpgaveCSS.bottomMargin10}>Du er ved at oprette en QR-kode, som {postering?.kunde?.navn.split(' ')[0]} kan scanne for at betale. Beløbet er <b className={ÅbenOpgaveCSS.bold}>{anmodningBeløb.toLocaleString('da-DK', {minimumFractionDigits: 2, maximumFractionDigits: 2})} kr.</b> inkl. moms.</p>
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
        {opgaveLøstTilfredsstillende && <button className={Styles.betalNuKnap} onClick={() => opretQR()}><span>Opret QR-kode</span> <img className={Styles.mobilePayLogo} src={mobilePayLogo} alt="Mobile Pay" /></button>}
        </PageAnimation>
        </>
        }

        {/* ====== SENDER ANMODNING ====== */}
        {loading && 
        <><div className={Styles.loadingSubmission}>
            <h2>Opretter QR-kode ...</h2>
            <BarLoader
                color="#59bf1a"
                width={100}
                ariaLabel="oval-loading"
                wrapperStyle={{}}
                wrapperClass=""
            />
            </div>
            <button className={Styles.annullerKnap} onClick={() => {setLoading(false); setQrOprettet(false); setErrorMessage('')}}>Annuller</button>
        </>}

        {/* ====== AFVENTER OVERFØRSEL AF BETALING ====== */}
        {(qrOprettet && !(loading || paymentCaptured || errorMessage)) &&
        <>
        <PageAnimation>
            <div className={Styles.betalSenereModalHeader}>
                <img src={BackButton} className={Styles.backButton} onClick={() => setQrOprettet(false)} alt="Tilbage" /><h2 className={ÅbenOpgaveCSS.modalHeading}>Scan QR-koden</h2>
            </div>
            <div style={{display: 'flex', flexDirection: 'column', gap: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 20}}>
                <img style={{width: '50%', height: 'auto'}} src={qrURL ? qrURL : ''} alt="QR-kode" />
                <b style={{fontFamily: 'OmnesBold', fontSize: 20}}>Beløb: {anmodningBeløb.toLocaleString('da-DK', {minimumFractionDigits: 2, maximumFractionDigits: 2})} kr.</b>
            </div>
            <p>Bed kunden om at scanne QR-koden ovenfor for at starte betalingen.</p>
            <div className={Styles.loadingSubmission}>
            <b style={{display: 'block', textAlign: 'center', fontSize: 18, fontFamily: 'OmnesBold'}}>Afventer kundens betaling ...</b>
            {betalingsfristTimer > 0 ? (
                    <p className={Styles.betalingsfristTimer}>
                        QR-koden udløber om {Math.floor(betalingsfristTimer / 60)} minutter og {betalingsfristTimer % 60} sekunder.
                    </p>
                )
                :
                <p className={Styles.betalingsfristTimerUdløbet}>QR-koden er udløbet – prøv igen.</p>
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

export default BetalViaMobilePayQRModal