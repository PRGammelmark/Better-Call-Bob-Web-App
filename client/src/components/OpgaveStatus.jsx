import React from 'react'
import Styles from './OpgaveStatus.module.css'
import ÅbenOpgaveCSS from '../pages/ÅbenOpgave.module.css'
import * as beregn from '../utils/beregninger.js'
import axios from 'axios'
import dayjs from 'dayjs'
import { Check } from 'lucide-react'

const OpgaveStatus = ({ opgave, posteringer, user, kunde, færdiggjort, opgaveAfsluttet, setTvingAfslutOpgaveModal, åbnForÆndringer, setUpdateOpgave, updateOpgave, setOpenVælgMobilePayBetalingsmetodeModal, setOpenBetalViaFakturaModal, setOpenBetalViaMobilePayAnmodningModal, setOpenBetalViaMobilePayScanQRModal }) => {

    const akkumuleredeBetalinger = (posteringer) => {
        const posteringerArray = Array.isArray(posteringer) ? posteringer : [posteringer]
        const sum = posteringerArray?.reduce((acc, postering) => acc + postering.betalinger?.reduce((acc, betaling) => acc + betaling.betalingsbeløb, 0), 0)
      
        return Math.round((sum + Number.EPSILON) * 100) / 100
    }

    const opkrævningerRegistreret = (posteringer) => {
        const posteringerArray = Array.isArray(posteringer) ? posteringer : [posteringer]
        const opkrævninger = posteringerArray?.reduce((acc, postering) => acc + postering.opkrævninger?.length, 0)
        return opkrævninger > 0
    }

    const fakturaOpkrævningerRegistreret = (posteringer) => {
        return posteringer.some((postering) =>
            postering?.opkrævninger?.length > 0 &&
            postering.opkrævninger.some(
              (opkrævning) => opkrævning.metode === 'faktura'
            )
        );
    };

    const iAltAtBetale = (posteringer) => {
        if (!posteringer?.length) return 0
      
        const total = beregn.totalPris(posteringer, 2, true)?.beløb ?? 0
        const akkumuleret = akkumuleredeBetalinger(posteringer) ?? 0
        const iAlt = total - akkumuleret
      
        return Math.ceil((iAlt + Number.EPSILON) * 100) / 100
    }

    const handleAfslutOpgave = () => {
        axios.patch(`${import.meta.env.VITE_API_URL}/opgaver/${opgave._id}`, {
            opgaveAfsluttet: dayjs()
        }, {
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        })
        .then(res => {
            setUpdateOpgave(!updateOpgave)

            // Hvis den manglende betaling er meget lille (< 0.5 kr.), vis ikke betalingsmuligheder
            if (iAltAtBetale(posteringer) < 0.5) {
                return
            }

            if(kunde?.virksomhed || kunde?.CVR) {
                setOpenBetalViaFakturaModal(true)
            } else {
                setOpenVælgMobilePayBetalingsmetodeModal(true)
            }
        })
        .catch(error => console.log(error))
    }

    const erErhvervskunde = kunde?.virksomhed || kunde?.CVR

  return (
    <div>
      {!opgave.isDeleted && (
        <>
            {opgave.fakturaOprettesManuelt && (
                opgaveAfsluttet && (
                <div className={ÅbenOpgaveCSS.færdigOpgaveDiv}>
                    {!user.isAdmin && <p className={ÅbenOpgaveCSS.prefix}><span style={{ fontSize: '1.2rem', marginRight: 10 }}>🧾</span>Faktura oprettes og administreres separat. Du skal ikke foretage dig yderligere.</p>}
                    {user.isAdmin && (
                    <>
                        <p className={ÅbenOpgaveCSS.prefix}><span style={{ fontSize: '1.2rem', marginRight: 10 }}>🧾</span>Faktura oprettes og administreres separat.{opgave.tilbudAfgivet ? ` Oprindeligt tilbud afgivet: ${opgave.tilbudAfgivet} kr.` : ' Intet konkret tilbud afgivet.'}</p>
                        <p className={ÅbenOpgaveCSS.prefix}><span style={{ fontSize: '1.2rem', marginRight: 10 }}>✅</span>Opgaven er afsluttet d.{' '}{new Date(opgave.opgaveAfsluttet).toLocaleDateString('da-DK', {day: '2-digit', month: 'long', year: 'numeric'})}.</p>
                    </>
                    )}
                </div>
            ))}

            {!opgave.fakturaOprettesManuelt && (
                
                <div className={ÅbenOpgaveCSS.færdigOpgaveDiv}>

                    {opgaveAfsluttet && iAltAtBetale(posteringer) >= 0.5 && !fakturaOpkrævningerRegistreret(posteringer) && <div className={Styles.betalingsKnapDiv}>
                        <button className={`${Styles.betalingsKnap} ${!erErhvervskunde ? Styles.betalingsknapFremhævet : ""}`} onClick={() => setOpenVælgMobilePayBetalingsmetodeModal(true)}>Betal med Mobile Pay <br /> <span>{iAltAtBetale(posteringer)} kr.</span></button>
                        <button className={`${Styles.betalingsKnap} ${erErhvervskunde ? Styles.betalingsknapFremhævet : ""}`} onClick={() => setOpenBetalViaFakturaModal(true)}>Betal med faktura <br /> <span>{iAltAtBetale(posteringer)} kr.</span></button>
                    </div>}

                    {!opgaveAfsluttet && posteringer?.length > 0 && (
                        <div
                            className={ÅbenOpgaveCSS.ikkeAfsluttetButtonsDiv}
                            style={{ display: 'flex', gap: 10, justifyContent: 'center' }}
                        >
                            
                            <button className={ÅbenOpgaveCSS.genåbnButtonFullWidth} style={{ fontSize: '16px' }} onClick={() => handleAfslutOpgave()}>
                                Afslut opgave <br />
                                <span style={{ color: '#ffffff', fontSize: '13px' }}>{iAltAtBetale(posteringer) < 0.5 ? 'Ingen manglende betaling' : `Manglende betaling: ${iAltAtBetale(posteringer)} kr.`}</span>
                            </button>
                            
                        </div>
                    )}

                    {/* --- Genåbn afsluttet opgave --- */}
                    {(opgave.opgaveAfsluttet || opgaveAfsluttet) && user.isAdmin && (
                        <button
                        className={Styles.genåbnButtonFullWidth}
                        onClick={() => åbnForÆndringer()}
                        >
                        Genåbn opgave
                        </button>
                    )}

                    {opgaveAfsluttet && <div className={Styles.infoLinesDiv}>
                    
                        {/* InfoLines */}
                        <p style={{ marginTop: 10 }} className={ÅbenOpgaveCSS.infoLine}><Check style={{ width: '16px'}} />Opgaven er afsluttet {typeof opgaveAfsluttet !== 'boolean' && `d. ${new Date(opgaveAfsluttet).toLocaleDateString('da-DK',{day:'2-digit',month:'long',year:'numeric'})}`}.</p>
                        {opgave.fakturaSendt && (
                            <div className={ÅbenOpgaveCSS.infoLineFaktura} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <p style={{ marginTop: kunde?.virksomhed || kunde?.CVR ? -3 : 0 }}><span style={{ fontSize: '1rem', marginRight: 10 }}>📨</span>{kunde?.virksomhed || kunde?.CVR ? `Fakturakladde oprettet d. ${new Date(opgave.fakturaSendt).toLocaleDateString('da-DK',{day:'2-digit',month:'long',year:'numeric'})}.` : `Faktura sendt til kunden d. ${new Date(opgave.fakturaSendt).toLocaleDateString('da-DK',{day:'2-digit',month:'long',year:'numeric'})}.`}</p>
                                {!(kunde?.virksomhed || kunde?.CVR) && (<a href={opgave.fakturaPDFUrl} target="_blank" rel="noopener noreferrer" className={ÅbenOpgaveCSS.åbnFakturaATag}><button className={ÅbenOpgaveCSS.åbnFakturaButton}>Se faktura</button></a>)}
                            </div>
                        )}

                        {opgave.opgaveBetaltMedMobilePay && <p style={{ marginTop: 10 }} className={ÅbenOpgaveCSS.infoLine}><span style={{ fontSize: '1rem', marginRight: 10 }}>💵</span>Mobile Pay-betaling registreret d. {new Date(opgave.opgaveBetaltMedMobilePay).toLocaleDateString('da-DK',{day:'2-digit',month:'long',year:'numeric'})}.</p>}
                        {opgave.fakturaBetalt && <p style={{ marginTop: 10 }} className={ÅbenOpgaveCSS.infoLine}><span style={{ fontSize: '1rem', marginRight: 10 }}>💵</span>Faktura betalt d.{' '}{new Date(opgave.fakturaBetalt).toLocaleDateString('da-DK', {day: '2-digit', month: 'long', year: 'numeric'})}.</p>}
                    
                    </div>}
                </div>
            )}
        </>
      )}
    </div>
  )
}

export default OpgaveStatus