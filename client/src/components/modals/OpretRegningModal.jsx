import React, { useState } from 'react'
import Modal from '../Modal.jsx'
import ÅbenOpgaveCSS from '../../pages/ÅbenOpgave.module.css'
import Styles from './OpretRegningModal.module.css'
import SwitcherStyles from '../../pages/Switcher.module.css'
import useBetalMedFaktura from '../../hooks/useBetalMedFaktura.js'
import useBetalMedMobilePay from '../../hooks/useBetalMedMobilePay.js'
import mobilePayLogo from '../../assets/mobilePay.png'
import BarLoader from '../loaders/BarLoader.js'
import BackButton from '../../assets/back.svg'



const OpretRegningModal = ({user, opgave, opgaveID, posteringer, setOpgaveAfsluttet, åbnOpretRegningModal, setÅbnOpretRegningModal, totalFaktura}) => {
    const [opgaveLøstTilfredsstillende, setOpgaveLøstTilfredsstillende] = useState(false)
    const [allePosteringerUdfyldt, setAllePosteringerUdfyldt] = useState(false)
    const [betalSenereModalState, setBetalSenereModalState] = useState(false)
    const [bekræftAdmGebyr, setBekræftAdmGebyr] = useState(false)
    const [loadingFakturaSubmission, setLoadingFakturaSubmission] = useState(false)
    const [successFakturaSubmission, setSuccessFakturaSubmission] = useState(false)

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
        {!loadingFakturaSubmission && !successFakturaSubmission && !betalSenereModalState &&
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
        {opgaveLøstTilfredsstillende && allePosteringerUdfyldt && <button className={Styles.betalNuKnap} onClick={() => useBetalMedMobilePay(user, opgave, opgaveID, posteringer, setOpgaveAfsluttet)}>Betal nu med Mobile Pay <img className={Styles.mobilePayLogo} src={mobilePayLogo} alt="Mobile Pay" /></button>}
        {opgaveLøstTilfredsstillende && allePosteringerUdfyldt && <button className={Styles.betalSenereKnap} onClick={() => setBetalSenereModalState(true)}>Betal senere med faktura – kr. 49,-</button>}
        </>
        }
        
        {/* ====== SECOND FORM – PAYING LATER ====== */}
        {!loadingFakturaSubmission && !successFakturaSubmission && betalSenereModalState &&
        <>
            <div className={Styles.betalSenereModalHeader}>
                <img src={BackButton} className={Styles.backButton} onClick={() => setBetalSenereModalState(false)} alt="Tilbage" /><h2>Betal senere med faktura</h2>
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
    </Modal>
  )
}

export default OpretRegningModal
