import React, { useState, useEffect } from 'react'
import Modal from '../../Modal.jsx'
import ÅbenOpgaveCSS from '../../../pages/ÅbenOpgave.module.css'
import Styles from './BetalViaFakturaModal.module.css'
import SwitcherStyles from '../../../pages/Switcher.module.css'
import BarLoader from '../../loaders/BarLoader.js'
import BackButton from '../../../assets/back.svg'
import PageAnimation from '../../PageAnimation.jsx'
import { useAuthContext } from '../../../hooks/useAuthContext.js'
import * as beregn from '../../../utils/beregninger.js'
import sendFaktura from './sendFaktura.js'

const betalViaFakturaModal = ({trigger, setTrigger, postering, setOpgave, refetchPostering}) => {
  const [opgaveLøstTilfredsstillende, setOpgaveLøstTilfredsstillende] = useState(false)
  const [admGebyr, setAdmGebyr] = useState(false)
  const [allePosteringerUdfyldt, setAllePosteringerUdfyldt] = useState(false)
  const [cvrKorrekt, setCvrKorrekt] = useState(false)
  const [alternativEmail, setAlternativEmail] = useState('')
  const [loadingFakturaSubmission, setLoadingFakturaSubmission] = useState(false)
  const [loadingProgressMessages, setLoadingProgressMessages] = useState([])
  const [successFakturaSubmission, setSuccessFakturaSubmission] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const { user } = useAuthContext();

  const posteringer = Array.isArray(postering) ? postering : [postering];

  const kunde = posteringer[0]?.kunde
  // const totalFaktura = postering.betalinger.reduce((sum, betaling) => sum + betaling.betalingsbeløb, 0)
  const admGebyrBeløb = 49;

  const fakturaBeløbInklMoms = parseFloat(((Math.ceil(beregn.totalPris(posteringer, 2, true).beløb * 100) / 100) + (admGebyr ? admGebyrBeløb * 1.25 : 0)).toFixed(2))
  const fakturaBeløbEksklMoms = parseFloat(((fakturaBeløbInklMoms / 1.25)).toFixed(2))

  useEffect(() => {
    if(!(kunde?.CVR || kunde?.virksomhed)) {
      setAdmGebyr(true)
    }
  }, [kunde])
  
  function åbnRedigerKundeModal() {
    // setTrigger(false)
    // setRedigerKundeModal(true)
    console.log('åbnRedigerKundeModal')
  }

  function handleOpretFaktura(e) {
    e.preventDefault();

    if(!(alternativEmail.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/) || alternativEmail === '')) {
        alert("Indtast en gyldig e-mailadresse, eller efterlad feltet tomt.");
        return;
    }

    setLoadingFakturaSubmission(true);

    sendFaktura({posteringer, inklAdministrationsGebyr: admGebyr, user, setLoadingFakturaSubmission, loadingProgressMessages, setLoadingProgressMessages, setSuccessFakturaSubmission, setErrorMessage});
    
  }

    return (
    <Modal trigger={trigger} setTrigger={setTrigger}>
        {!loadingFakturaSubmission && !successFakturaSubmission && !errorMessage && <>
        <div>
            <h2 className={ÅbenOpgaveCSS.modalHeading} style={{paddingRight: 20}}>Opret faktura</h2>
                <form action="">
                    {/* <p className={ÅbenOpgaveCSS.bottomMargin10}>Du er ved at oprette en faktura til kunden på i alt <b className={ÅbenOpgaveCSS.bold}>{(kunde?.virksomhed || kunde?.CVR) ? totalFaktura.toLocaleString('da-DK') + " kr. ekskl. moms (" + } kr.</b> inkl. moms ({totalFaktura ? totalFaktura.toLocaleString('da-DK') : '0'} kr. ekskl. moms).</p> */}
                    {(kunde?.virksomhed || kunde?.CVR) && <>
                        <p className={ÅbenOpgaveCSS.bottomMargin10}>Du er ved at oprette en faktura til kunden på i alt <b className={ÅbenOpgaveCSS.bold}>{fakturaBeløbEksklMoms?.toLocaleString('da-DK', {minimumFractionDigits: 2, maximumFractionDigits: 2})} kr. ekskl. moms</b> ({fakturaBeløbInklMoms?.toLocaleString('da-DK', {minimumFractionDigits: 2, maximumFractionDigits: 2})} kr. inkl. moms.)</p>
                        <p>Da kunden er en erhvervskunde vil systemet oprette en fakturakladde til manuel gennemgang. Kunden modtager derfor ikke fakturaen med det samme.</p>
                    </>}
                    {!(kunde?.virksomhed || kunde?.CVR) && <>
                        <p className={ÅbenOpgaveCSS.bottomMargin10}>Du er ved at oprette en faktura til kunden på i alt <b className={ÅbenOpgaveCSS.bold}>{fakturaBeløbInklMoms?.toLocaleString('da-DK', {minimumFractionDigits: 2, maximumFractionDigits: 2})} kr. inkl. moms</b> ({fakturaBeløbEksklMoms?.toLocaleString('da-DK', {minimumFractionDigits: 2, maximumFractionDigits: 2})} kr. ekskl. moms.)</p>
                        <p>Fakturaen vil automatisk blive sendt til kundens registrerede email (<i>{kunde?.email}</i>).</p>
                    </>}
                    {posteringer.length > 1 && <p style={{marginTop: 10, fontSize: "14px", color: "gray"}}>Bemærk, at denne faktura vil opkræve det samlede beløb for alle posteringer. Hvis du allerede har modtaget betaling for en eller flere af posteringerne skal kunden blot betale restbeløbet. Vil du derimod oprette en særskilt faktura for en enkelt postering skal du gøre det gennem den pågældende posterings menu.</p>}
                    <div className={ÅbenOpgaveCSS.bekræftIndsendelseDiv}>
                        <b className={ÅbenOpgaveCSS.bold}>Bekræft:</b>
                        <div className={SwitcherStyles.checkboxContainer}>
                            <label className={SwitcherStyles.switch} htmlFor="opgaveLøst">
                                <input type="checkbox" id="opgaveLøst" name="opgaveLøst" className={SwitcherStyles.checkboxInput} required checked={opgaveLøstTilfredsstillende} onChange={(e) => setOpgaveLøstTilfredsstillende(e.target.checked)} />
                                <span className={SwitcherStyles.slider}></span>
                            </label>
                            <b>Er opgaverne for {posteringer.length > 1 ? "posteringerne" : "posteringen"} gennemgået og godkendt af kunden?</b>
                        </div>
                        {(kunde?.CVR || kunde?.virksomhed) && (kunde?.CVR ? 
                        <div className={SwitcherStyles.checkboxContainer}>
                            <label className={SwitcherStyles.switch} htmlFor="cvrKorrekt">
                                <input type="checkbox" id="cvrKorrekt" name="cvrKorrekt" className={SwitcherStyles.checkboxInput} required checked={cvrKorrekt} onChange={(e) => setCvrKorrekt(e.target.checked)} />
                                <span className={SwitcherStyles.slider}></span>
                            </label>
                            <b>Er kundens CVR-nummer – <b className={ÅbenOpgaveCSS.bold}>{kunde?.CVR}</b> – korrekt?</b>
                        </div>
                        :
                        <p className={ÅbenOpgaveCSS.marginTop10}>Kunden er registreret som erhvervskunde, men intet CVR-nummer er oplyst. <span className={ÅbenOpgaveCSS.inlineButton} onClick={() => åbnRedigerKundeModal()}>Registrer CVR-nummer her.</span></p>)}
                    </div>

                    {opgaveLøstTilfredsstillende && ((kunde?.CVR || kunde?.virksomhed) ? cvrKorrekt : true) && 
                    <div> 
                        <b className={ÅbenOpgaveCSS.bold}>Inkludér administrationsgebyr?</b>
                        <br />
                        <i style={{fontSize: "14px", color: "gray"}}>Gebyret er på 49 kr. ekskl. moms, og er standard for privatkunder.</i>
                        <div className={SwitcherStyles.checkboxContainer}>
                            <label className={SwitcherStyles.switch} htmlFor="admGebyr">
                                <input type="checkbox" id="admGebyr" name="admGebyr" className={SwitcherStyles.checkboxInput} required checked={admGebyr} onChange={(e) => setAdmGebyr(e.target.checked)} />
                                <span className={SwitcherStyles.slider}></span>
                            </label>
                        </div>
                        {!(kunde?.CVR || kunde?.virksomhed) && <input 
                            type="email" 
                            style={{marginTop: "20px"}}
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
                                handleOpretFaktura(e);
                            }}
                        >
                            Opret { (kunde?.virksomhed || kunde?.CVR)
                                ? (
                                    <>
                                        fakturakladde
                                        <br />
                                        <span>
                                        {fakturaBeløbEksklMoms?.toLocaleString('da-DK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kr. ekskl. moms
                                        </span>
                                    </>
                                    )
                                : (
                                    <>
                                        og send faktura
                                        <br />
                                        <span>
                                                {fakturaBeløbInklMoms?.toLocaleString('da-DK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kr. inkl. moms
                                        </span>
                                    </>
                                    )
                                }
                        </button>
                    </div>
                    }
                </form>
        </div>
        </>}
        {loadingFakturaSubmission && !errorMessage &&
        <div className={Styles.loadingSubmission}>
            <h2>Sender faktura – vent venligst ... </h2>
            <div style={{marginTop: "20px", marginBottom: "10px"}}>
            <b style={{fontFamily: 'OmnesBold', marginTop: "20px", marginBottom: "10px", fontSize: "18px"}}>Status:</b>
                <div style={{marginTop: "10px"}}>
                {loadingProgressMessages.map((message, index) => (
                    <p key={index} style={{marginLeft: "10px"}}>{message}</p>
                ))}
                </div>
            </div>
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
            <div style={{marginTop: "20px", marginBottom: "10px"}}>
            <b style={{fontFamily: 'OmnesBold', marginTop: "20px", marginBottom: "10px", fontSize: "18px"}}>Status:</b>
                <div style={{marginTop: "10px"}}>
                {loadingProgressMessages.map((message, index) => (
                    <p key={index} style={{marginLeft: "10px"}}>{message}</p>
                ))}
                </div>
            </div>
        </div>}
        {!loadingFakturaSubmission && successFakturaSubmission && !(kunde?.CVR || kunde?.virksomhed) && !errorMessage &&
        <div className={Styles.successSubmission}>
            <h2>Faktura sendt! 🎉</h2>
            <p>Fakturaen er blevet oprettet, og sendt til kundens email ({kunde?.email}).</p>
            <div style={{marginTop: "20px", marginBottom: "10px"}}>
            <b style={{fontFamily: 'OmnesBold', marginTop: "20px", marginBottom: "10px", fontSize: "18px"}}>Status:</b>
                <div style={{marginTop: "10px"}}>
                {loadingProgressMessages.map((message, index) => (
                    <p key={index} style={{marginLeft: "10px"}}>{message}</p>
                ))}
                </div>
            </div>
        </div>}
        {errorMessage && 
            <PageAnimation>
                <div className={Styles.errorSubmission}>
                    <div className={Styles.betalSenereModalHeader}>
                        <img src={BackButton} className={Styles.backButton} onClick={() => {setErrorMessage(false); setLoadingFakturaSubmission(false)}} alt="Tilbage" /><h2 style={{fontFamily: 'OmnesBold'}} className={Styles.errorHeading}>Betaling mislykkedes 🚫</h2>
                    </div>
                    <div style={{marginTop: "20px", marginBottom: "10px"}}>
                    <b style={{fontFamily: 'OmnesBold', marginTop: "20px", marginBottom: "10px", fontSize: "18px"}}>Status:</b>
                        <div style={{marginTop: "10px"}}>
                        {loadingProgressMessages.map((message, index) => (
                            <p key={index} style={{marginLeft: "10px"}}>{message}</p>
                        ))}
                        </div>
                    </div>
                    <p className={Styles.errorText}><b style={{fontFamily: 'OmnesBold'}}>Fejlmeddelelse: </b>{errorMessage}</p>
                </div>
            </PageAnimation>
        }
    </Modal>
  )
}

export default betalViaFakturaModal
