import React, { useState } from 'react'
import Modal from '../Modal.jsx'
import ÅbenOpgaveCSS from '../../pages/ÅbenOpgave.module.css'
import Styles from './OpretRegningModal.module.css'
import SwitcherStyles from '../../pages/Switcher.module.css'
import useBetalMedFaktura from '../../hooks/useBetalMedFaktura.js'
import useBetalMedMobilePay from '../../hooks/useBetalMedMobilePay.js'
import mobilePayLogo from '../../assets/mobilePay.png'
import BarLoader from '../loaders/BarLoader.js'


const OpretRegningModal = ({user, opgave, opgaveID, posteringer, setOpgaveAfsluttet, åbnOpretRegningModal, setÅbnOpretRegningModal, totalFaktura}) => {
    const [opgaveLøstTilfredsstillende, setOpgaveLøstTilfredsstillende] = useState(false)
    const [allePosteringerUdfyldt, setAllePosteringerUdfyldt] = useState(false)
    const [loadingFakturaSubmission, setLoadingFakturaSubmission] = useState(false)
    const [successFakturaSubmission, setSuccessFakturaSubmission] = useState(false)


  return (
    <Modal trigger={åbnOpretRegningModal} setTrigger={setÅbnOpretRegningModal}>
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
        {opgaveLøstTilfredsstillende && allePosteringerUdfyldt && <button className={Styles.betalSenereKnap} onClick={(e) => {e.preventDefault(); setLoadingFakturaSubmission(true); useBetalMedFaktura(user, opgave, opgaveID, posteringer, setOpgaveAfsluttet)}}>Betal senere med faktura – kr. 49,-</button>}
    </Modal>
  )
}

export default OpretRegningModal
