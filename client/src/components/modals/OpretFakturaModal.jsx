import React, { useState } from 'react'
import Modal from '../Modal.jsx'
import ÅbenOpgaveCSS from '../../pages/ÅbenOpgave.module.css'
import Styles from './OpretFakturaModal.module.css'
import SwitcherStyles from '../../pages/Switcher.module.css'
import useBetalMedFaktura from '../../hooks/useBetalMedFaktura.js'
import BarLoader from '../loaders/BarLoader.js'
import BackButton from '../../assets/back.svg'
import PageAnimation from '../PageAnimation.jsx'

const OpretFakturaModal = ({user, opgave, setOpgave, opgaveID, kunde, posteringer, setOpgaveAfsluttet, åbnOpretFakturaModal, setÅbnOpretFakturaModal, totalFaktura, redigerKundeModal, setRedigerKundeModal, isEnglish}) => {
  const [opgaveLøstTilfredsstillende, setOpgaveLøstTilfredsstillende] = useState(false)
  const [allePosteringerUdfyldt, setAllePosteringerUdfyldt] = useState(false)
  const [cvrKorrekt, setCvrKorrekt] = useState(false)
  const [alternativEmail, setAlternativEmail] = useState('')
  const [loadingFakturaSubmission, setLoadingFakturaSubmission] = useState(false)
  const [successFakturaSubmission, setSuccessFakturaSubmission] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  function åbnRedigerKundeModal() {
    setÅbnOpretFakturaModal(false)
    setRedigerKundeModal(true)
  }

    return (
    <Modal trigger={åbnOpretFakturaModal} setTrigger={setÅbnOpretFakturaModal}>
        {errorMessage && 
            <PageAnimation>
                <div className={Styles.errorSubmission}>
                    <div className={Styles.betalSenereModalHeader}>
                        <img src={BackButton} className={Styles.backButton} onClick={() => {setErrorMessage(false); setLoadingFakturaSubmission(false)}} alt="Tilbage" /><h2 style={{fontFamily: 'OmnesBold'}} className={Styles.errorHeading}>Betaling mislykkedes 🚫</h2>
                    </div>
                    <p className={Styles.errorText}><b style={{fontFamily: 'OmnesBold'}}>Fejlmeddelelse: </b>{errorMessage}</p>
                </div>
            </PageAnimation>
        }
        {loadingFakturaSubmission && !errorMessage &&
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
        {!loadingFakturaSubmission && successFakturaSubmission && !errorMessage && (kunde?.CVR || kunde?.virksomhed) &&
        <div className={Styles.successSubmission}>
            <h2>Fakturakladde oprettet 👍</h2>
            <p>En fakturakladde er blevet oprettet, og sendt videre til manuel gennemgang. Du kan nu lukke dette vindue.</p>
        </div>}
        {!loadingFakturaSubmission && successFakturaSubmission && !(kunde?.CVR || kunde?.virksomhed) && !errorMessage &&
        <div className={Styles.successSubmission}>
            <h2>Faktura sendt! 🎉</h2>
            <p>Fakturaen er blevet oprettet, og sendt til kundens email ({kunde?.email}).</p>
        </div>}
        {!loadingFakturaSubmission && !successFakturaSubmission && !errorMessage && <>
        <div>
            <h2 className={ÅbenOpgaveCSS.modalHeading} style={{paddingRight: 20}}>Opret faktura</h2>
                <form action="">
                    {/* <p className={ÅbenOpgaveCSS.bottomMargin10}>Du er ved at oprette en faktura til kunden på i alt <b className={ÅbenOpgaveCSS.bold}>{(kunde?.virksomhed || kunde?.CVR) ? totalFaktura.toLocaleString('da-DK') + " kr. ekskl. moms (" + } kr.</b> inkl. moms ({totalFaktura ? totalFaktura.toLocaleString('da-DK') : '0'} kr. ekskl. moms).</p> */}
                    {(kunde?.virksomhed || kunde?.CVR) && <>
                        <p className={ÅbenOpgaveCSS.bottomMargin10}>Du er ved at oprette en faktura til kunden på i alt <b className={ÅbenOpgaveCSS.bold}>{totalFaktura?.toLocaleString('da-DK', {minimumFractionDigits: 2, maximumFractionDigits: 2})} kr. ekskl. moms</b> ({(totalFaktura * 1.25)?.toLocaleString('da-DK', {minimumFractionDigits: 2, maximumFractionDigits: 2})} kr. inkl. moms.)</p>
                        <p>Da kunden er en erhvervskunde vil systemet oprette en fakturakladde til manuel gennemgang. Kunden modtager derfor ikke fakturaen med det samme.</p>
                    </>}
                    {!(kunde?.virksomhed || kunde?.CVR) && <>
                        <p className={ÅbenOpgaveCSS.bottomMargin10}>Du er ved at oprette en faktura til kunden på i alt <b className={ÅbenOpgaveCSS.bold}>{(totalFaktura * 1.25)?.toLocaleString('da-DK', {minimumFractionDigits: 2, maximumFractionDigits: 2})} kr. inkl. moms</b> ({totalFaktura?.toLocaleString('da-DK', {minimumFractionDigits: 2, maximumFractionDigits: 2})} kr. ekskl. moms.)</p>
                        <p>Fakturaen vil automatisk blive sendt til kundens registrerede email.</p>
                    </>}
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
                        {kunde?.CVR ? 
                        <div className={SwitcherStyles.checkboxContainer}>
                            <label className={SwitcherStyles.switch} htmlFor="cvrKorrekt">
                                <input type="checkbox" id="cvrKorrekt" name="cvrKorrekt" className={SwitcherStyles.checkboxInput} required checked={cvrKorrekt} onChange={(e) => setCvrKorrekt(e.target.checked)} />
                                <span className={SwitcherStyles.slider}></span>
                            </label>
                            <b>Er kundens CVR-nummer – <b className={ÅbenOpgaveCSS.bold}>{kunde?.CVR}</b> – korrekt?</b>
                        </div>
                        :
                        <p className={ÅbenOpgaveCSS.marginTop10}>Kunden er registreret som erhvervskunde, men intet CVR-nummer er oplyst. <span className={ÅbenOpgaveCSS.inlineButton} onClick={() => åbnRedigerKundeModal()}>Registrer CVR-nummer her.</span></p>}
                    </div>

                    {opgaveLøstTilfredsstillende && allePosteringerUdfyldt && cvrKorrekt && 
                    <div> 
                        {!(kunde?.CVR || kunde?.virksomhed) && <input 
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
                                    useBetalMedFaktura(user, opgave, setOpgave, opgaveID, kunde, posteringer, setOpgaveAfsluttet, alternativEmail, setLoadingFakturaSubmission, setSuccessFakturaSubmission, bekræftAdmGebyr, isEnglish, setErrorMessage);
                                } else {
                                    alert("Indtast en gyldig e-mailadresse, eller efterlad feltet tomt.");
                                }
                            }}
                        >
                            Opret {(kunde?.virksomhed || kunde?.CVR) ? ("fakturakladde (" + (totalFaktura?.toLocaleString('da-DK')) + " kr. ekskl. moms)") : ("og send faktura (" +(totalFaktura * 1.25)?.toLocaleString('da-DK') + " kr. ekskl. moms)")}<br />
                            {(kunde?.virksomhed || kunde?.CVR) && <span>Sendes til manuel gennemgang</span>}
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
