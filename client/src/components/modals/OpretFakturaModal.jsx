import React, { useState } from 'react'
import Modal from '../Modal.jsx'
import ÅbenOpgaveCSS from '../../pages/ÅbenOpgave.module.css'
import Styles from './OpretFakturaModal.module.css'
import SwitcherStyles from '../../pages/Switcher.module.css'
import useBetalMedFaktura from '../../hooks/useBetalMedFaktura.js'
import BarLoader from '../loaders/BarLoader.js'

const OpretFakturaModal = ({user, opgave, setOpgave, opgaveID, posteringer, setOpgaveAfsluttet, åbnOpretFakturaModal, setÅbnOpretFakturaModal, totalFaktura, redigerKundeModal, setRedigerKundeModal}) => {
  const [opgaveLøstTilfredsstillende, setOpgaveLøstTilfredsstillende] = useState(false)
  const [allePosteringerUdfyldt, setAllePosteringerUdfyldt] = useState(false)
  const [cvrKorrekt, setCvrKorrekt] = useState(false)
  const [alternativEmail, setAlternativEmail] = useState('')
  const [loadingFakturaSubmission, setLoadingFakturaSubmission] = useState(false)
  const [successFakturaSubmission, setSuccessFakturaSubmission] = useState(false)

  function åbnRedigerKundeModal() {
    setÅbnOpretFakturaModal(false)
    setRedigerKundeModal(true)
  }

    return (
    <Modal trigger={åbnOpretFakturaModal} setTrigger={setÅbnOpretFakturaModal}>
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
        {!loadingFakturaSubmission && successFakturaSubmission && 
        <div className={Styles.successSubmission}>
            <h2>Faktura sendt! 🎉</h2>
            <p>Fakturaen er blevet oprettet, og sendt til {(opgave.CVR || opgave.virksomhed) ? "regnskabsansvarlig" : "kundens email"}.</p>
        </div>}
        {!loadingFakturaSubmission && !successFakturaSubmission && <>
        <div>
            <h2 className={ÅbenOpgaveCSS.modalHeading} style={{paddingRight: 20}}>Opret faktura</h2>
                <form action="">
                    <p className={ÅbenOpgaveCSS.bottomMargin10}>Du er ved at oprette en faktura til kunden på i alt <b className={ÅbenOpgaveCSS.bold}>{totalFaktura ? (totalFaktura * 1.25).toLocaleString('da-DK') : '0'} kr.</b> inkl. moms ({totalFaktura ? totalFaktura.toLocaleString('da-DK') : '0'} kr. ekskl. moms).</p>
                    <p>Når fakturaen er oprettet vil den automatisk blive sendt til {(opgave.CVR || opgave.virksomhed) ? "firmaets regnskabsansvarlige" : "kundens email"}.</p>
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
                        {opgave.CVR ? 
                        <div className={SwitcherStyles.checkboxContainer}>
                            <label className={SwitcherStyles.switch} htmlFor="cvrKorrekt">
                                <input type="checkbox" id="cvrKorrekt" name="cvrKorrekt" className={SwitcherStyles.checkboxInput} required checked={cvrKorrekt} onChange={(e) => setCvrKorrekt(e.target.checked)} />
                                <span className={SwitcherStyles.slider}></span>
                            </label>
                            <b>Er kundens CVR-nummer – <b className={ÅbenOpgaveCSS.bold}>{opgave.CVR}</b> – korrekt?</b>
                        </div>
                        :
                        <p className={ÅbenOpgaveCSS.marginTop10}>Kunden er registreret som erhvervskunde, men intet CVR-nummer er oplyst. <span className={ÅbenOpgaveCSS.inlineButton} onClick={() => åbnRedigerKundeModal()}>Registrer CVR-nummer her.</span></p>}
                    </div>

                    {opgaveLøstTilfredsstillende && allePosteringerUdfyldt && cvrKorrekt && 
                    <div> 
                        {!(opgave.CVR || opgave.virksomhed) && <input 
                            type="email" 
                            id="alternativEmail" 
                            name="alternativEmail" 
                            className={ÅbenOpgaveCSS.modalInput} 
                            placeholder="Indtast evt. alternativ e-mail som fakturaen skal sendes til" 
                            value={alternativEmail} 
                            onChange={(e) => setAlternativEmail(e.target.value)} 
                            pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$" 
                        />}
                        <button 
                            className={ÅbenOpgaveCSS.opretFaktura} 
                            onClick={(e) => {
                                e.preventDefault();
                                if (alternativEmail.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/) || alternativEmail === '') {
                                    setLoadingFakturaSubmission(true);
                                    const bekræftAdmGebyr = false;
                                    useBetalMedFaktura(user, opgave, setOpgave, opgaveID, posteringer, setOpgaveAfsluttet, alternativEmail, setLoadingFakturaSubmission, setSuccessFakturaSubmission, bekræftAdmGebyr);
                                } else {
                                    alert("Indtast en gyldig e-mailadresse, eller efterlad feltet tomt.");
                                }
                            }}
                        >
                        Opret og send faktura
                        </button>
                    </div>
                    }
                </form>
        </div>
        </>}
    </Modal>
  )
}

export default OpretFakturaModal
