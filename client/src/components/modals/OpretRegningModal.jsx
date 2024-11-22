import React, { useState, useEffect } from 'react'
import Modal from '../Modal.jsx'
import ÅbenOpgaveCSS from '../../pages/ÅbenOpgave.module.css'
import Styles from './OpretRegningModal.module.css'
import SwitcherStyles from '../../pages/Switcher.module.css'
import useBetalMedFaktura from '../../hooks/useBetalMedFaktura.js'
import useBetalMedMobilePayAnmodning from '../../hooks/useBetalMedMobilePayAnmodning.js'
import useBetalMedMobilePayQR from '../../hooks/useBetalMedMobilePayQR.js'
import mobilePayLogo from '../../assets/mobilePay.png'
import BarLoader from '../loaders/BarLoader.js'
import BackButton from '../../assets/back.svg'
import axios from 'axios'


const OpretRegningModal = ({user, opgave, opgaveID, posteringer, setOpgaveAfsluttet, åbnOpretRegningModal, setÅbnOpretRegningModal, totalFaktura}) => {
    const [opgaveLøstTilfredsstillende, setOpgaveLøstTilfredsstillende] = useState(false)
    const [allePosteringerUdfyldt, setAllePosteringerUdfyldt] = useState(false)
    const [betalSenereModalState, setBetalSenereModalState] = useState(false)
    const [betalNuMedAnmodningModalState, setBetalNuMedAnmodningModalState] = useState(false)
    const [betalNuMedQRModalState, setBetalNuMedQRModalState] = useState(false)
    const [qrLoading, setQrLoading] = useState(true)
    const [qrPaymentAuthorized, setQrPaymentAuthorized] = useState(false)
    const [qrURL, setQrURL] = useState('')
    const [qrTimer, setQrTimer] = useState(0)
    const [qrErrorMessage, setQrErrorMessage] = useState('')
    const [bekræftAdmGebyr, setBekræftAdmGebyr] = useState(false)
    const [telefonnummerTilAnmodning, setTelefonnummerTilAnmodning] = useState(opgave && opgave.telefon ? opgave.telefon : '')
    const [loadingFakturaSubmission, setLoadingFakturaSubmission] = useState(false)
    const [successFakturaSubmission, setSuccessFakturaSubmission] = useState(false)
    const [loadingMobilePaySubmission, setLoadingMobilePaySubmission] = useState(false)
    const [successMobilePaySubmission, setSuccessMobilePaySubmission] = useState(false)

    useEffect(() => {
        let timer;
        if (qrTimer > 0) {
            timer = setInterval(() => {
                setQrTimer(prevTimer => prevTimer - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [qrTimer]);
    
    function initierQRState() {
        setBetalNuMedQRModalState(true)
        setQrLoading(true)
        setQrURL('')
        useBetalMedMobilePayQR(user, opgave, opgaveID, posteringer, setOpgaveAfsluttet, totalFaktura, setQrURL, setQrTimer, setQrPaymentAuthorized, setQrErrorMessage)
    }

    // const pollPaymentStatus = (orderId) => {
    //     setInterval(() => {
    //         axios.get(`https://api.vipps.no/ecomm/v2/payments/${orderId}/details`, {
    //             headers: {
    //                 'Authorization': `Bearer ${user.token}`
    //             }
    //         })
    //         .then(response => {
    //             console.log(response.data)
    //         })
    //         .catch(error => {
    //             console.error('Error polling payment status: ', error);
    //         });
    //     }, 2000);
    // }

    // useEffect(() => {
    //     if (qrURL) {
    //         const orderId = qrURL.split('/').pop(); // Assuming the orderId is the last part of the URL
    //         pollPaymentStatus(orderId);
    //     }
    // }, [qrURL]);

  return (
    <Modal trigger={åbnOpretRegningModal} setTrigger={setÅbnOpretRegningModal}>
        
        {/* ====== FAKTURA SUCCESS ====== */}
        {!loadingFakturaSubmission && successFakturaSubmission && 
        <div className={Styles.successSubmission}>
            <h2>Faktura sendt! 🎉</h2>
            <p>Fakturaen er blevet oprettet, og sendt til kundens e-mail.</p>
        </div>}
        
        {/* ====== LOADING ====== */}
        {loadingFakturaSubmission && 
        <div className={Styles.loadingSubmission}>
            <h2>Sender faktura – vent venligst ... </h2>
            <BarLoader
                color="#59bf1a"
                width={100}
                ariaLabel="oval-loading"
                wrapperStyle={{}}
                wrapperClass=""
            />
        </div>}
        
        {/* ====== FIRST FORM – CHOOSE BETWEEN PAYING NOW OR LATER ====== */}
        {!loadingFakturaSubmission && !successFakturaSubmission && !betalSenereModalState && !betalNuMedAnmodningModalState && !betalNuMedQRModalState && !qrPaymentAuthorized &&
        <>
        <h2 className={ÅbenOpgaveCSS.modalHeading} style={{paddingRight: 20}}>Opret regning</h2>
        <form action="">
            <p className={ÅbenOpgaveCSS.bottomMargin10}>Du er ved at oprette en regning til kunden på i alt <b className={ÅbenOpgaveCSS.bold}>{totalFaktura ? (totalFaktura * 1.25).toLocaleString('da-DK') : '0'} kr.</b> inkl. moms ({totalFaktura ? totalFaktura.toLocaleString('da-DK') : '0'} kr. ekskl. moms).</p>
            <p>Når regningen er oprettet vil den automatisk blive sendt via sms og/eller e-mail til kunden.</p>
            <div className={ÅbenOpgaveCSS.bekræftIndsendelseDiv}>
                <b className={ÅbenOpgaveCSS.bold}>Bekræft følgende:</b>
                <div className={SwitcherStyles.checkboxContainer}>
                    <label className={SwitcherStyles.switch} htmlFor="opgaveLøst">
                        <input type="checkbox" id="opgaveLøst" name="opgaveLøst" className={SwitcherStyles.checkboxInput} required checked={opgaveLøstTilfredsstillende} onChange={(e) => setOpgaveLøstTilfredsstillende(e.target.checked)} />
                        <span className={SwitcherStyles.slider}></span>
                    </label>
                    <b>Er kundens opgave blevet løst tilfredsstillende?</b>
                </div>
                <div className={SwitcherStyles.checkboxContainer}>
                    <label className={SwitcherStyles.switch} htmlFor="posteringerUdfyldt">
                        <input type="checkbox" id="posteringerUdfyldt" name="posteringerUdfyldt" className={SwitcherStyles.checkboxInput} required checked={allePosteringerUdfyldt} onChange={(e) => setAllePosteringerUdfyldt(e.target.checked)} />
                        <span className={SwitcherStyles.slider}></span>
                    </label>
                    <b>Er alle posteringer tilknyttet denne opgave blevet oprettet og udfyldt?</b>
                </div>
            </div>
        </form>
        {opgaveLøstTilfredsstillende && allePosteringerUdfyldt && <button className={Styles.betalNuKnap} onClick={() => initierQRState()}>Betal nu med Mobile Pay <img className={Styles.mobilePayLogo} src={mobilePayLogo} alt="Mobile Pay" /></button>}
        {opgaveLøstTilfredsstillende && allePosteringerUdfyldt && <button className={Styles.betalSenereKnap} onClick={() => setBetalSenereModalState(true)}>Betal senere med faktura – kr. 49,-</button>}
        </>
        }
        
        {/* ====== SECOND FORM – PAYING LATER ====== */}
        {!loadingFakturaSubmission && !successFakturaSubmission && betalSenereModalState &&
        <>
            <div className={Styles.betalSenereModalHeader}>
                <img src={BackButton} className={Styles.backButton} onClick={() => setBetalSenereModalState(false)} alt="Tilbage" /><h2 className={ÅbenOpgaveCSS.modalHeading}>Betal senere med faktura</h2>
            </div>
            <form action="">
                <p className={ÅbenOpgaveCSS.bottomMargin10}>Du er ved at oprette en faktura til kunden på i alt <b className={ÅbenOpgaveCSS.bold}>{totalFaktura ? ((totalFaktura + 49) * 1.25).toLocaleString('da-DK') : '0'} kr.</b> inkl. moms ({totalFaktura ? (totalFaktura + 49).toLocaleString('da-DK') : '0'} kr. ekskl. moms), inkl. administrationsgebyr på 49 kr.</p>
                <p>Fakturaen skal betales senest 8 dage efter oprettelsen.</p>
                <div className={ÅbenOpgaveCSS.bekræftIndsendelseDiv}>
                    <b className={ÅbenOpgaveCSS.bold}>Bekræft følgende:</b>
                    <div className={SwitcherStyles.checkboxContainer}>
                        <label className={SwitcherStyles.switch} htmlFor="bekræftAdmGebyr">
                            <input type="checkbox" id="bekræftAdmGebyr" name="bekræftAdmGebyr" className={SwitcherStyles.checkboxInput} required checked={bekræftAdmGebyr} onChange={(e) => setBekræftAdmGebyr(e.target.checked)} />
                            <span className={SwitcherStyles.slider}></span>
                        </label>
                        <b>Kunden er indforstået med, at denne løsning indeholder et administrationsgebyr på 49 kr.</b>
                    </div>
                </div>
            </form>
            {bekræftAdmGebyr && 
            <button 
            className={Styles.betalMedFakturaKnap} 
            onClick={(e) => {
                e.preventDefault()
                setLoadingFakturaSubmission(true)
                const alternativEmail = opgave && opgave.email
                useBetalMedFaktura(user, opgave, opgaveID, posteringer, setOpgaveAfsluttet, alternativEmail, setLoadingFakturaSubmission, setSuccessFakturaSubmission, bekræftAdmGebyr)        
            }}>Betal senere med faktura – kr. 49,-</button>}
        </>}

        {/* ====== THIRD FORM – PAYING NOW W. ANMODNING ====== */}
        {!loadingMobilePaySubmission && !successMobilePaySubmission && betalNuMedAnmodningModalState &&
        <>
            <div className={Styles.betalSenereModalHeader}>
                <img src={BackButton} className={Styles.backButton} onClick={() => setBetalNuMedAnmodningModalState(false)} alt="Tilbage" /><h2 className={ÅbenOpgaveCSS.modalHeading}>Betal nu med Mobile Pay</h2>
            </div>
            <p>Du er ved at igangsætte en gebyrfri Mobile Pay-betalingsanmodning på <b className={ÅbenOpgaveCSS.bold}>{totalFaktura ? (totalFaktura * 1.25).toLocaleString('da-DK') : '0'} kr.</b> til kunden.</p>
            <form action="">
                <div className={ÅbenOpgaveCSS.bekræftIndsendelseDiv}>
                    <b style={{marginTop: 5, display: 'inline-block'}} className={ÅbenOpgaveCSS.bold}>Bekræft nummeret, der skal anmodes herunder:</b>
                    <input style={{marginTop: 10, marginBottom: 10}} className={ÅbenOpgaveCSS.modalInput} type="tel" name="telefonnummer" id="telefonnummer" value={telefonnummerTilAnmodning} onChange={(e) => setTelefonnummerTilAnmodning(e.target.value)} />
                </div>
            </form>
            <button className={Styles.betalNuKnap} onClick={() => useBetalMedMobilePayAnmodning(user, opgave, opgaveID, posteringer, setOpgaveAfsluttet, telefonnummerTilAnmodning)}>Send anmodning på {totalFaktura ? (totalFaktura * 1.25).toLocaleString('da-DK') : '0'} kr. <img className={Styles.mobilePayLogo} src={mobilePayLogo} alt="Mobile Pay" /></button>
        </>}

        {/* ====== FOURTH FORM – PAYING NOW W. QR-CODE ====== */}
        {!loadingMobilePaySubmission && !successMobilePaySubmission && !qrPaymentAuthorized && !qrErrorMessage && betalNuMedQRModalState &&
        <>
            <div className={Styles.betalSenereModalHeader}>
                <img src={BackButton} className={Styles.backButton} onClick={() => setBetalNuMedQRModalState(false)} alt="Tilbage" /><h2 className={ÅbenOpgaveCSS.modalHeading}>Betal nu med Mobile Pay</h2>
            </div>
            {!qrURL && 
                <div className={Styles.loadingSubmission}>
                    <BarLoader
                    color="#59bf1a"
                    width={100}
                    ariaLabel="oval-loading"
                    wrapperStyle={{}}
                    wrapperClass=""
                />
            </div>}
            {qrURL && <div>
                <p>En gebyrfri Mobile Pay-betaling på <b className={ÅbenOpgaveCSS.bold}>{totalFaktura ? (totalFaktura * 1.25).toLocaleString('da-DK') : '0'} kr.</b> er blevet oprettet.</p>
                <p>Bed kunden om at scanne QR-koden nedenfor for at betale.</p>
                <img src={qrURL} alt="QR-kode" style={{width: '70%', marginLeft: '15%', marginTop: '15%', marginBottom: '15%'}}/>
                {qrTimer > 0 ? (
                    <p className={Styles.qrTimer}>
                        QR-koden udløber om {Math.floor(qrTimer / 60)} minutter og {qrTimer % 60} sekunder.
                    </p>
                )
                :
                <p className={Styles.qrTimerUdløbet}>QR-koden er udløbet.</p>
                }
                <p className={Styles.generérNyQRKnap} onClick={() => initierQRState()}>Generér ny QR-kode</p>
            </div>}
        </>}
        {qrPaymentAuthorized && 
            <div className={Styles.successSubmission}>
                <h2 className={Styles.successHeading}>Betalingen er godkendt 🎉</h2>
                <p className={Styles.successText}>Betalingen er blevet godkendt, og opgaven er nu afsluttet.</p>
            </div>
        }
        {qrErrorMessage && 
            <div className={Styles.errorSubmission}>
                <h2 className={Styles.errorHeading}>Betaling mislykkedes 🚫</h2>
                <p className={Styles.errorText}>Betalingen er ikke godkendt. Prøv igen.</p>
            </div>
        }
    </Modal>
  )
}

export default OpretRegningModal