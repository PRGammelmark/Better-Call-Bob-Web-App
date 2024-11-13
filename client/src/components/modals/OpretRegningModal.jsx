import React from 'react'
import Modal from '../Modal.jsx'
import ÅbenOpgaveCSS from '../../pages/ÅbenOpgave.module.css'
import SwitcherStyles from '../../pages/Switcher.module.css'

const OpretRegningModal = ({user, opgave, opgaveID, posteringer, setOpgaveAfsluttet, bekræftIndsendelseModal, setBekræftIndsendelseModal, vilBetaleMedMobilePay, setVilBetaleMedMobilePay, opgaveLøstTilfredsstillende, setOpgaveLøstTilfredsstillende, allePosteringerUdfyldt, setAllePosteringerUdfyldt, useBetalMedFaktura, totalFaktura}) => {
  return (
    <Modal trigger={bekræftIndsendelseModal} setTrigger={setBekræftIndsendelseModal}>
        <h2 className={ÅbenOpgaveCSS.modalHeading} style={{paddingRight: 20}}>Opret regning</h2>
        <form action="">
            <p className={ÅbenOpgaveCSS.bottomMargin10}>Du er ved at oprette en regning til kunden på i alt <b className={ÅbenOpgaveCSS.bold}>{totalFaktura ? (totalFaktura * 1.25).toLocaleString('da-DK') : '0'} kr.</b> inkl. moms ({totalFaktura ? totalFaktura.toLocaleString('da-DK') : '0'} kr. ekskl. moms).</p>
            <p>Når regningen er oprettet vil den automatisk blive sendt til kundens e-mail.</p>
        <div className={ÅbenOpgaveCSS.bekræftIndsendelseDiv}>
            <b className={ÅbenOpgaveCSS.bold}>Bekræft følgende:</b>
            <div className={SwitcherStyles.checkboxContainer}>
                <label className={SwitcherStyles.switch} htmlFor="vilBetaleMedDetSamme">
                    <input type="checkbox" id="vilBetaleMedDetSamme" name="vilBetaleMedDetSamme" className={SwitcherStyles.checkboxInput} required checked={vilBetaleMedMobilePay} onChange={(e) => setVilBetaleMedMobilePay(e.target.checked)} />
                    <span className={SwitcherStyles.slider}></span>
                </label>
                <b>Vil kunden betale med det samme via Mobile Pay?<br /><span className={ÅbenOpgaveCSS.spar50KrTekst}>(Kunden sparer 50 kr. i administrationsgebyr)</span></b>
            </div>
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
        {opgaveLøstTilfredsstillende && allePosteringerUdfyldt && <button className={ÅbenOpgaveCSS.opretFaktura} onClick={() => useBetalMedFaktura(user, opgave, opgaveID, posteringer, setOpgaveAfsluttet)}>Opret og send regning</button>}
    </Modal>
  )
}

export default OpretRegningModal
