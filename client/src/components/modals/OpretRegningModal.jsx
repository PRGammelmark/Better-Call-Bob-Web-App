import React, { useState, useEffect } from 'react'
import Modal from '../Modal.jsx'
import ÅbenOpgaveCSS from '../../pages/ÅbenOpgave.module.css'
import Styles from './OpretRegningModal.module.css'
import SwitcherStyles from '../../pages/Switcher.module.css'
import useBetalMedFaktura from '../../hooks/useBetalMedFaktura.js'
import useBetalMedMobilePayViaAnmodning from '../../hooks/useBetalMedMobilePayViaAnmodning.jsx'
import useBetalMedMobilePayQR from '../../hooks/useBetalMedMobilePayQR.jsx'
import mobilePayLogo from '../../assets/mobilePay.png'
import BarLoader from '../loaders/BarLoader.js'
import BackButton from '../../assets/back.svg'
import PageAnimation from '../../components/PageAnimation'
import axios from 'axios'


const OpretRegningModal = ({user, opgave, setOpgave, opgaveID, kunde, posteringer, setOpgaveAfsluttet, åbnOpretRegningModal, setÅbnOpretRegningModal, vilBetaleMedMobilePay, setVilBetaleMedMobilePay, opgaveLøstTilfredsstillende, setOpgaveLøstTilfredsstillende, allePosteringerUdfyldt, setAllePosteringerUdfyldt, totalFaktura, isEnglish}) => {
    const [betalSenereModalState, setBetalSenereModalState] = useState(false)
    const [betalNuMedAnmodningModalState, setBetalNuMedAnmodningModalState] = useState(false)
    const [betalNuMedQRModalState, setBetalNuMedQRModalState] = useState(false)
    const [qrLoading, setQrLoading] = useState(true)
    const [qrPaymentAuthorized, setQrPaymentAuthorized] = useState(false)
    const [qrURL, setQrURL] = useState('')
    const [qrTimer, setQrTimer] = useState(0)
    const [qrErrorMessage, setQrErrorMessage] = useState('')
    const [bekræftAdmGebyr, setBekræftAdmGebyr] = useState(false)
    const [inklAdministrationsGebyr, setInklAdministrationsGebyr] = useState(true)
    const [telefonnummerTilAnmodning, setTelefonnummerTilAnmodning] = useState(kunde && kunde.telefon ? kunde.telefon : '')
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
        useBetalMedMobilePayQR(user, opgave, opgaveID, kunde, posteringer, setOpgaveAfsluttet, totalFaktura, setQrURL, setQrTimer, setQrPaymentAuthorized, setQrErrorMessage)
    }

    function initierAnmodningState() {
        setBetalNuMedAnmodningModalState(true)
        setLoadingMobilePaySubmission(true)
        useBetalMedMobilePayViaAnmodning(user, opgave, opgaveID, kunde, posteringer, setOpgave, totalFaktura, telefonnummerTilAnmodning, setQrURL, setQrTimer, setQrPaymentAuthorized, setLoadingMobilePaySubmission, setSuccessMobilePaySubmission, setQrErrorMessage, setÅbnOpretRegningModal, isEnglish)
    }

  return (
    <Modal trigger={åbnOpretRegningModal} setTrigger={setÅbnOpretRegningModal}>
        
        {/* ====== FAKTURA SUCCESS ====== */}
        {!loadingFakturaSubmission && successFakturaSubmission && 
        <PageAnimation>
            <div className={Styles.successSubmission}>
                <h2>Faktura sendt! 🎉</h2>
                <p>Fakturaen er blevet oprettet, og sendt til kundens e-mail.</p>
            </div>
        </PageAnimation>}
        
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
        
        {loadingMobilePaySubmission && 
        <div className={Styles.loadingSubmission}>
            <h2>Sender anmodning ...</h2>
            <BarLoader
                color="#59bf1a"
                width={100}
                ariaLabel="oval-loading"
                wrapperStyle={{}}
                wrapperClass=""
            />
        </div>}

        {/* ====== FIRST FORM – CHOOSE BETWEEN PAYING NOW OR LATER ====== */}
        {!loadingFakturaSubmission && !successFakturaSubmission && !betalSenereModalState && !betalNuMedAnmodningModalState && !betalNuMedQRModalState && !qrPaymentAuthorized && !qrErrorMessage &&
        <>
        <PageAnimation>
            <h2 className={ÅbenOpgaveCSS.modalHeading} style={{paddingRight: 20}}>Opret regning</h2>
            <form action="">
            <p className={ÅbenOpgaveCSS.bottomMargin10}>Du er ved at oprette en regning til kunden på i alt <b className={ÅbenOpgaveCSS.bold}>{(totalFaktura * 1.25)?.toLocaleString('da-DK', {minimumFractionDigits: 2, maximumFractionDigits: 2})} kr.</b> inkl. moms ({totalFaktura?.toLocaleString('da-DK', {maximumFractionDigits: 2, minimumFractionDigits: 2})} kr. ekskl. moms).</p>
            <p>Når regningen er oprettet vil den automatisk blive sendt via sms og/eller e-mail til kunden.</p>
            <div className={ÅbenOpgaveCSS.bekræftIndsendelseDiv}>
                <b className={ÅbenOpgaveCSS.bold}>Bekræft følgende:</b>
                <div className={SwitcherStyles.checkboxContainer}>
                    <label className={SwitcherStyles.switch} htmlFor="opgaveLøst">
                        <input type="checkbox" id="opgaveLøst" name="opgaveLøst" className={SwitcherStyles.checkboxInput} required checked={opgaveLøstTilfredsstillende} onChange={(e) => setOpgaveLøstTilfredsstillende(e.target.checked)} />
                        <span className={SwitcherStyles.slider}></span>
                    </label>
                    <b>Er opgaverne gennemgået og godkendt af kunden?</b>
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
        {opgaveLøstTilfredsstillende && allePosteringerUdfyldt && <input style={{marginTop: 10, marginBottom: 10, textAlign: 'center', paddingRight: 65}} className={ÅbenOpgaveCSS.modalInput} type="tel" name="telefonnummer" id="telefonnummer" placeholder="Indtast evt. andet nummer til anmodning" onChange={(e) => setTelefonnummerTilAnmodning(e.target.value)} />}
        {opgaveLøstTilfredsstillende && allePosteringerUdfyldt && <button className={Styles.betalNuKnap} onClick={() => initierAnmodningState()}><span>Send Mobile Pay-anmodning<br /><span style={{fontSize: 13}}>Tlf.: {telefonnummerTilAnmodning ? telefonnummerTilAnmodning : kunde?.telefon}</span></span> <img className={Styles.mobilePayLogo} src={mobilePayLogo} alt="Mobile Pay" /></button>}
        {opgaveLøstTilfredsstillende && allePosteringerUdfyldt && <button className={Styles.betalSenereKnap} onClick={() => setBetalSenereModalState(true)}>Betal senere med faktura – kr. 49,-</button>}
        </PageAnimation>
        </>
        }
        
        {/* ====== SECOND FORM – PAYING LATER ====== */}
        {!loadingFakturaSubmission && !successFakturaSubmission && !qrErrorMessage && betalSenereModalState &&
        <>
        <PageAnimation>
            <div className={Styles.betalSenereModalHeader}>
                <img src={BackButton} className={Styles.backButton} onClick={() => setBetalSenereModalState(false)} alt="Tilbage" /><h2 className={ÅbenOpgaveCSS.modalHeading}>Betal senere med faktura</h2>
            </div>
            <form action="">
                <p className={ÅbenOpgaveCSS.bottomMargin10}>Du er ved at oprette en faktura til kunden på i alt <b className={ÅbenOpgaveCSS.bold}>{((totalFaktura + (inklAdministrationsGebyr ? 49 : 0)) * 1.25)?.toLocaleString('da-DK', {minimumFractionDigits: 2, maximumFractionDigits: 2})} kr.</b> inkl. moms ({(totalFaktura + (inklAdministrationsGebyr ? 49 : 0))?.toLocaleString('da-DK', {minimumFractionDigits: 2, maximumFractionDigits: 2})} kr. ekskl. moms){inklAdministrationsGebyr ? ", inkl. administrationsgebyr på 49 kr" : ""}.</p>
                <p>{inklAdministrationsGebyr && "Husk at gøre kunden opmærksom på administrationsgebyret. "}Fakturaen skal betales senest 8 dage efter oprettelsen.</p>
                <div className={ÅbenOpgaveCSS.bekræftIndsendelseDiv}>
                    <b className={ÅbenOpgaveCSS.bold}>Valgmuligheder:</b>
                    <div className={SwitcherStyles.checkboxContainer}>
                        <label className={SwitcherStyles.switch} htmlFor="fritagForAdministrationsgebyr">
                            <input type="checkbox" id="fritagForAdministrationsgebyr" name="fritagForAdministrationsgebyr" className={SwitcherStyles.checkboxInput} checked={!inklAdministrationsGebyr} onChange={(e) => setInklAdministrationsGebyr(!e.target.checked)} />
                            <span className={SwitcherStyles.slider}></span>
                        </label>
                        <b>Fjern administrationsgebyr på 49kr.</b>
                    </div>
                </div>
            </form>
            <button 
            className={Styles.betalMedFakturaKnap} 
            onClick={(e) => {
                e.preventDefault()
                setLoadingFakturaSubmission(true)
                const alternativEmail = kunde && kunde.email
                useBetalMedFaktura(user, opgave, setOpgave, opgaveID, kunde, posteringer, setOpgaveAfsluttet, alternativEmail, setLoadingFakturaSubmission, setSuccessFakturaSubmission, inklAdministrationsGebyr, isEnglish)        
            }}>Betal senere med faktura {inklAdministrationsGebyr ? "(+ 49 kr.)" : "(intet gebyr)"}</button>
        </PageAnimation>
        </>
        }

        {/* ====== THIRD FORM – PAYING NOW W. ANMODNING ====== */}
        {!loadingMobilePaySubmission && !successMobilePaySubmission && !qrErrorMessage && betalNuMedAnmodningModalState &&
        <>
        <PageAnimation>
            <div className={Styles.betalSenereModalHeader}>
                <img src={BackButton} className={Styles.backButton} onClick={() => setBetalNuMedAnmodningModalState(false)} alt="Tilbage" /><h2 className={ÅbenOpgaveCSS.modalHeading}>Betal nu med Mobile Pay</h2>
            </div>
            <p>En gebyrfri Mobile Pay-betalingsanmodning på <b className={ÅbenOpgaveCSS.bold}>{totalFaktura ? (totalFaktura * 1.25).toLocaleString('da-DK') : '0'} kr.</b> er blevet sendt til kunden.</p>
            <div className={Styles.loadingSubmission}>
            <b style={{display: 'block', textAlign: 'center', fontSize: 18, fontFamily: 'OmnesBold'}}>Afventer kundens godkendelse ...</b>
            {qrTimer > 0 ? (
                    <p className={Styles.qrTimer}>
                        Anmodningen udløber om {Math.floor(qrTimer / 60)} minutter og {qrTimer % 60} sekunder.
                    </p>
                )
                :
                <p className={Styles.qrTimerUdløbet}>Anmodningen er udløbet.</p>
                }
            </div>
        </PageAnimation>
        </>
        }

        {/* ====== FOURTH FORM – PAYING NOW W. QR-CODE ====== */}
        {!loadingMobilePaySubmission && !successMobilePaySubmission && !qrPaymentAuthorized && !qrErrorMessage && betalNuMedQRModalState &&
        <>
        <PageAnimation>
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
        </PageAnimation>
        </>
        }
        {qrPaymentAuthorized && !qrErrorMessage && 
            <PageAnimation>
                <div className={Styles.successSubmission}>
                    <h2 className={Styles.successHeading}>Betalingen er godkendt 🎉</h2>
                <p className={Styles.successText}>Betalingen er blevet godkendt, og opgaven er nu afsluttet.</p>
            </div>
        </PageAnimation>
        }
        {qrErrorMessage && 
        <PageAnimation>
            <div className={Styles.errorSubmission}>
                <div className={Styles.betalSenereModalHeader}>
                    <img src={BackButton} className={Styles.backButton} onClick={() => setQrErrorMessage(false)} alt="Tilbage" /><h2 style={{marginBottom: 10, fontFamily: 'OmnesBold'}} className={Styles.errorHeading}>Betaling mislykkedes 🚫</h2>
                </div>
                <p className={Styles.errorText}>Betalingen blev ikke godkendt. Prøv igen.</p>
            </div>
        </PageAnimation>
        }
    </Modal>
  )
}

export default OpretRegningModal