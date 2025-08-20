import React from 'react'
import Styles from './OpgaveStatus.module.css'
import ÅbenOpgaveCSS from '../pages/ÅbenOpgave.module.css'
import * as beregn from '../utils/beregninger.js'
import axios from 'axios'
import dayjs from 'dayjs'

const OpgaveStatus = ({ opgave, posteringer, user, kunde, færdiggjort, opgaveAfsluttet, setTvingAfslutOpgaveModal, åbnForÆndringer, setUpdateOpgave, updateOpgave, setOpenVælgMobilePayBetalingsmetodeModal, setOpenBetalViaFakturaModal, setOpenBetalViaMobilePayAnmodningModal, setOpenBetalViaMobilePayScanQRModal }) => {

    const akkumuleredeBetalinger = (posteringer) => {
        const posteringerArray = Array.isArray(posteringer) ? posteringer : [posteringer]
        const sum = posteringerArray?.reduce((acc, postering) => acc + postering.betalinger?.reduce((acc, betaling) => acc + betaling.betalingsbeløb, 0), 0)
      
        return Math.round((sum + Number.EPSILON) * 100) / 100
    }

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

            if(kunde?.virksomhed || kunde?.CVR) {
                setOpenBetalViaFakturaModal(true)
            } else {
                setOpenVælgMobilePayBetalingsmetodeModal(true)
            }
        })
        .catch(error => console.log(error))
    }

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
                opgaveAfsluttet && (
                <div className={ÅbenOpgaveCSS.færdigOpgaveDiv}>
                    
                    {/* InfoLines */}
                    <p style={{ marginTop: 10 }} className={ÅbenOpgaveCSS.infoLine}><span style={{ fontSize: '1rem', marginRight: 10 }}>✔︎</span>Opgaven er afsluttet {typeof opgaveAfsluttet !== 'boolean' && `d. ${new Date(opgaveAfsluttet).toLocaleDateString('da-DK',{day:'2-digit',month:'long',year:'numeric'})}`}.</p>

                    {opgave.fakturaSendt && (
                        <div className={ÅbenOpgaveCSS.infoLineFaktura} style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <p style={{ marginTop: kunde?.virksomhed || kunde?.CVR ? -3 : 0 }}><span style={{ fontSize: '1rem', marginRight: 10 }}>📨</span>{kunde?.virksomhed || kunde?.CVR ? `Fakturakladde oprettet d. ${new Date(opgave.fakturaSendt).toLocaleDateString('da-DK',{day:'2-digit',month:'long',year:'numeric'})}.` : `Faktura sendt til kunden d. ${new Date(opgave.fakturaSendt).toLocaleDateString('da-DK',{day:'2-digit',month:'long',year:'numeric'})}.`}</p>
                            {!(kunde?.virksomhed || kunde?.CVR) && (<a href={opgave.fakturaPDFUrl} target="_blank" rel="noopener noreferrer" className={ÅbenOpgaveCSS.åbnFakturaATag}><button className={ÅbenOpgaveCSS.åbnFakturaButton}>Se faktura</button></a>)}
                        </div>
                    )}

                    {opgave.opgaveBetaltMedMobilePay && <p style={{ marginTop: 10 }} className={ÅbenOpgaveCSS.infoLine}><span style={{ fontSize: '1rem', marginRight: 10 }}>💵</span>Mobile Pay-betaling registreret d. {new Date(opgave.opgaveBetaltMedMobilePay).toLocaleDateString('da-DK',{day:'2-digit',month:'long',year:'numeric'})}.</p>}
                    {opgave.fakturaBetalt && <p style={{ marginTop: 10 }} className={ÅbenOpgaveCSS.infoLine}><span style={{ fontSize: '1rem', marginRight: 10 }}>💵</span>Faktura betalt d.{' '}{new Date(opgave.fakturaBetalt).toLocaleDateString('da-DK', {day: '2-digit', month: 'long', year: 'numeric'})}.</p>}

                    {/* {(kunde?.virksomhed || kunde?.CVR) && (!opgave.fakturaSendt && (
                        <button
                        className={ÅbenOpgaveCSS.startBetalingButton}
                        onClick={() => setÅbnOpretFakturaModal(true)}
                        >
                        Opret faktura ({beregn.totalPris(posteringer, 2, visInklMoms)?.formateret})
                        <br />
                        <span>Kunden er registreret som erhvervskunde</span>
                        </button>
                    ))}
                    {!(kunde?.virksomhed || kunde?.CVR) && (!opgave.fakturaSendt && (
                        <button
                        className={ÅbenOpgaveCSS.startBetalingButton}
                        onClick={() => setÅbnOpretRegningModal(true)}
                        >
                        Opret regning ({beregn.totalPris(posteringer, 2, visInklMoms)?.formateret})
                        <br />
                        <span>Kunden er registreret som privatkunde</span>
                        </button>
                    ))
                    } */}

                    {iAltAtBetale(posteringer) >= 0.5 && <div className={Styles.betalingsKnapDiv}>
                        <button className={Styles.betalingsKnap} onClick={() => setOpenVælgMobilePayBetalingsmetodeModal(true)}>Betal via Mobile Pay <br /> <span style={{fontSize: '0.8rem', color: '#ffffff'}}>{iAltAtBetale(posteringer)} kr.</span></button>
                        <button className={Styles.betalingsKnap} onClick={() => setOpenBetalViaFakturaModal(true)}>Betal via faktura <br /> <span style={{fontSize: '0.8rem', color: '#ffffff'}}>{iAltAtBetale(posteringer)} kr.</span></button>
                    </div>}
                </div>)
            )}

            {!opgaveAfsluttet && iAltAtBetale(posteringer) > 0 && (
                <div
                    className={ÅbenOpgaveCSS.ikkeAfsluttetButtonsDiv}
                    style={{ display: 'flex', gap: 10, justifyContent: 'center' }}
                >
                    {iAltAtBetale(posteringer) > 0 && (
                    <button className={ÅbenOpgaveCSS.genåbnButtonFullWidth} style={{ fontSize: '16px' }} onClick={() => handleAfslutOpgave()}>
                        Afslut opgave <br />
                        <span style={{ color: '#ffffff', fontSize: '13px' }}>Manglende betaling: {iAltAtBetale(posteringer)} kr.</span>
                    </button>
                    )}
                </div>
            )}

            {/* --- Genåbn afsluttet opgave --- */}
            {(opgave.opgaveAfsluttet || opgaveAfsluttet) && user.isAdmin && (
                <button
                className={ÅbenOpgaveCSS.genåbnButtonFullWidth}
                onClick={() => åbnForÆndringer()}
                >
                Genåbn afsluttet opgave
                </button>
            )}
        </>
      )}
    </div>
  )
}

export default OpgaveStatus


// import React from 'react'
// import Styles from './OpgaveStatus.module.css'
// import ÅbenOpgaveCSS from '../pages/ÅbenOpgave.module.css'
// import * as beregn from '../utils/beregninger.js'



// const OpgaveStatus = ({ opgave, posteringer, user, kunde, færdiggjort, opgaveAfsluttet, visInklMoms }) => {
//   return (
//     <div>
//         {!opgave.isDeleted && (
//             opgave.fakturaOprettesManuelt && (færdiggjort ? 
//                 <div className={ÅbenOpgaveCSS.færdigOpgaveDiv}>
//                     {/* <p className={ÅbenOpgaveCSS.prefix}><span style={{fontSize: '1.2rem', marginRight: 10}}>🔒</span> Opgaven er markeret som færdig og låst.</p> */}
//                     {!user.isAdmin && <p className={ÅbenOpgaveCSS.prefix}><span style={{fontSize: '1.2rem', marginRight: 10}}>🧾</span> Faktura oprettes og administreres separat. Du skal ikke foretage dig yderligere.</p>}
//                     {user.isAdmin && <p className={ÅbenOpgaveCSS.prefix}><span style={{fontSize: '1.2rem', marginRight: 10}}>🧾</span> Faktura oprettes og administreres separat. {opgave.tilbudAfgivet ? ` Oprindeligt tilbud afgivet: ${opgave.tilbudAfgivet} kr.` : "Intet konkret tilbud afgivet."}</p>}
//                     {user.isAdmin && !opgave.opgaveAfsluttet && <button className={ÅbenOpgaveCSS.afslutButton} onClick={() => afslutOpgave()}>Afslut opgave</button>}
//                     {user.isAdmin && opgave.opgaveAfsluttet && <p className={ÅbenOpgaveCSS.prefix}><span style={{fontSize: '1.2rem', marginRight: 10}}>✅</span> Opgaven er afsluttet d. {new Date(opgave.opgaveAfsluttet).toLocaleDateString('da-DK', { day: '2-digit', month: 'long', year: 'numeric' })}.</p>}
//                 </div>
//                 :
//                 posteringer.length > 0 && <button className={ÅbenOpgaveCSS.markerSomFærdigKnap} onClick={() => færdiggørOpgave()}><b className={ÅbenOpgaveCSS.markerSomFærdigKnapPrisHeadline}>Pris ({visInklMoms ? "inkl. moms": "ekskl. moms"}): {beregn.totalPris(posteringer, 2, visInklMoms).formateret}</b><br />Markér opgave som færdig</button>
//             )
//             !opgave.fakturaOprettesManuelt && 
//                 (færdiggjort
//                     ? 
//                     <div className={ÅbenOpgaveCSS.færdigOpgaveDiv}>
                        
//                         {/* InfoLines */}
//                         {!opgave.opgaveAfsluttet && <p className={ÅbenOpgaveCSS.infoLine}><span style={{fontSize: '1rem', marginRight: 10}}>🔒</span> Opgaven er markeret som færdig og låst.</p>}
//                         {opgave.fakturaSendt && ((kunde?.virksomhed || kunde?.CVR) ? <div className={ÅbenOpgaveCSS.infoLineFaktura} style={{display: "flex", justifyContent: "space-between"}}><p style={{marginTop: -3}}><span style={{fontSize: '1rem', marginRight: 10}}>📨</span> Fakturakladde oprettet d. {new Date(opgave.fakturaSendt).toLocaleDateString('da-DK', { day: '2-digit', month: 'long', year: 'numeric' })}.</p></div> : <div className={ÅbenOpgaveCSS.infoLineFaktura} style={{display: "flex", justifyContent: "space-between"}}><p><span style={{fontSize: '1rem', marginRight: 10}}>📨</span> Faktura sendt til kunden d. {new Date(opgave.fakturaSendt).toLocaleDateString('da-DK', { day: '2-digit', month: 'long', year: 'numeric' })}.</p><a href={opgave.fakturaPDFUrl} target="_blank" rel="noopener noreferrer" className={ÅbenOpgaveCSS.åbnFakturaATag}><button className={ÅbenOpgaveCSS.åbnFakturaButton}>Se faktura</button></a></div>)}
//                         {/* const dato = new Date(opgave?.opgaveAfsluttet);
//                         const erGyldigDato = !isNaN(dato); */}
//                         {opgaveAfsluttet && ((typeof opgaveAfsluttet === 'boolean') ? <p style={{marginTop: 10}}className={ÅbenOpgaveCSS.infoLine}><span style={{fontSize: '1rem', marginRight: 10}}>✔︎</span> Opgaven er afsluttet.</p> : <p style={{marginTop: 10}}className={ÅbenOpgaveCSS.infoLine}><span style={{fontSize: '1rem', marginRight: 10}}>✔︎</span> Opgaven er afsluttet d. {new Date(opgave?.opgaveAfsluttet).toLocaleDateString('da-DK', { day: '2-digit', month: 'long', year: 'numeric' })}.</p>)}
//                         {opgave.opgaveBetaltMedMobilePay && <p style={{marginTop: 10}} className={ÅbenOpgaveCSS.infoLine}><span style={{fontSize: '1rem', marginRight: 10}}>💵</span> Mobile Pay-betaling registreret d. {new Date(opgave.opgaveBetaltMedMobilePay).toLocaleDateString('da-DK', { day: '2-digit', month: 'long', year: 'numeric' })}.</p>}
//                         {opgave.fakturaBetalt && <p style={{marginTop: 10}} className={ÅbenOpgaveCSS.infoLine}><span style={{fontSize: '1rem', marginRight: 10}}>💵</span> Faktura betalt d. {new Date(opgave.fakturaBetalt).toLocaleDateString('da-DK', { day: '2-digit', month: 'long', year: 'numeric' })}.</p>}
                        
                        
//                         {/* Erhvervskunde -> send faktura || !Erhvervskunde -> Opret regning*/}
//                         {(kunde?.virksomhed || kunde?.CVR) ? 
//                             (!opgave.fakturaSendt && !opgaveAfsluttet) && <button className={ÅbenOpgaveCSS.startBetalingButton} onClick={() => setÅbnOpretFakturaModal(true)}>Opret faktura ({beregn.totalPris(posteringer, 2, visInklMoms)?.formateret})<br /><span>Kunden er registreret som erhvervskunde</span></button> 
//                             : 
//                             (!opgave.fakturaSendt && !opgaveAfsluttet) && <button className={ÅbenOpgaveCSS.startBetalingButton} onClick={() => setÅbnOpretRegningModal(true)}>Opret regning ({beregn.totalPris(posteringer, 2, visInklMoms)?.formateret})<br /><span>Kunden er registreret som privatkunde</span></button>
//                         }
    
//                         {/* <RegistrerBetalingsModal trigger={registrerBetalingsModal} setTrigger={setRegistrerBetalingsModal} opgave={opgave} setUpdateOpgave={setUpdateOpgave} updateOpgave={updateOpgave}/> */}
//                         {!opgaveAfsluttet 
//                             && 
//                             <div className={ÅbenOpgaveCSS.ikkeAfsluttetButtonsDiv} style={{display: "flex", gap: 10, justifyContent: "center"}}>
//                                 {user.isAdmin && <button className={ÅbenOpgaveCSS.genåbnButton} onClick={() => setTvingAfslutOpgaveModal(true)}>Afslut uden betaling</button>}
//                                 <button className={ÅbenOpgaveCSS.genåbnButton} onClick={() => åbnForÆndringer()}>Genåbn opgave</button>
//                             </div>
//                         }
    
//                     </div> 
//                     : 
//                     posteringer.length > 0 && 
//                         <button className={ÅbenOpgaveCSS.markerSomFærdigKnap} onClick={() => færdiggørOpgave()}><b className={ÅbenOpgaveCSS.markerSomFærdigKnapPrisHeadline}>Pris ({visInklMoms ? "inkl. moms": "ekskl. moms"}): {beregn.totalPris(posteringer, 2, visInklMoms).formateret}</b><br />Markér opgave som færdig</button>
//                 )
            
    
//             {/* Genåbn afsluttet opgave */}
//             (opgave.opgaveAfsluttet || opgaveAfsluttet) && user.isAdmin && <button className={ÅbenOpgaveCSS.genåbnButtonFullWidth} onClick={() => åbnForÆndringer()}>Genåbn afsluttet opgave</button>
//         )}
//         </div>
//   )
// }

// export default OpgaveStatus