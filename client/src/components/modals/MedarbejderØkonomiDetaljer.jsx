import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import Styles from './MedarbejderØkonomiDetaljer.module.css'
import ÅbenOpgaveCSS from '../../pages/ÅbenOpgave.module.css'
import Modal from '../Modal.jsx'
import satser from '../../variables'



const MedarbejderØkonomiDetaljer = (props) => {

    const [posteringerDetaljer, setPosteringerDetaljer] = useState(null)

    const navigate = useNavigate()
    
    const posteringer = props && props.trigger
    const opgaveIDs = posteringer && posteringer.map(postering => postering.opgaveID);
    const uniqueOpgaveIDs = opgaveIDs && [...new Set(opgaveIDs)]
    const user = props && props.user
    const opgaver = props && props.opgaver

    const getBrugerName = (brugerID) => {
        const bruger = props.brugere && props.brugere.find(user => user._id === brugerID);
        return bruger ? bruger.navn : 'Ukendt bruger';
    };

    const navn = posteringer && getBrugerName(posteringer[0].brugerID)
    const opgaverForBruger = opgaver && uniqueOpgaveIDs && opgaver.filter(opgave => uniqueOpgaveIDs.includes(opgave._id))

    function beregnTjent(posteringer) {
        if(!posteringer) return 0
        const månedensOpstartsgebyrer = posteringer.reduce((sum, postering) => sum + postering.opstart * postering.satser.opstartsgebyrHonorar, 0)
        const månedensHandymantimer = posteringer.reduce((sum, postering) => sum + postering.handymanTimer * postering.satser.handymanTimerHonorar, 0)
        const månedensTømrertimer = posteringer.reduce((sum, postering) => sum + postering.tømrerTimer * postering.satser.tømrerTimerHonorar, 0)
        const månedensRådgivningOpmålingVejledning = posteringer.reduce((sum, postering) => sum + postering.rådgivningOpmålingVejledning * postering.satser.rådgivningOpmålingVejledningHonorar, 0)
        const månedensAftenTillæg = posteringer.reduce((sum, postering) => sum + (postering.aftenTillæg ? (((postering.handymanTimer * postering.satser.handymanTimerHonorar) + (postering.tømrerTimer * postering.satser.tømrerTimerHonorar) + (postering.rådgivningOpmålingVejledning * postering.satser.rådgivningOpmålingVejledningHonorar)) * (postering.satser.aftenTillægHonorar / 100)) : 0), 0)
        const månedensNatTillæg = posteringer.reduce((sum, postering) => sum + (postering.natTillæg ? (((postering.handymanTimer * postering.satser.handymanTimerHonorar) + (postering.tømrerTimer * postering.satser.tømrerTimerHonorar) + (postering.rådgivningOpmålingVejledning * postering.satser.rådgivningOpmålingVejledningHonorar)) * (postering.satser.natTillægHonorar / 100)) : 0), 0)
        const månedensTrailer = posteringer.reduce((sum, postering) => sum + (postering.trailer ? postering.satser.trailerHonorar : 0), 0)

        return månedensOpstartsgebyrer + månedensHandymantimer + månedensTømrertimer + månedensRådgivningOpmålingVejledning + månedensAftenTillæg + månedensNatTillæg + månedensTrailer
    }

    function beregnUdlagt(posteringer) {
        if(!posteringer) return 0
        const månedensUdlæg = posteringer.reduce((sum, postering) => {
            const udlægSum = postering.udlæg.reduce((udlægSum, udlægItem) => udlægSum + udlægItem.beløb, 0);
            return sum + udlægSum;
        }, 0);

        return månedensUdlæg;
    }

    const getOpgaveAdresse = (opgaveID) => {
        const opgave = opgaver && opgaver.find(opgave => opgave._id === opgaveID);
        return opgave ? opgave.adresse : 'Adresse utilgængelig';
    };
  
    return (
    <Modal trigger={props.trigger} setTrigger={props.setTrigger}>
        <div>
            <h2 className={Styles.adminØkonomiHeading} style={{fontFamily: 'OmnesBold'}}>{navn &&navn.split(' ')[0]}s økonomi <br /><span style={{fontFamily: 'Omnes', fontSize: '16px', color: '#696969'}}>- {props.customMåned.end.format('MMMM YYYY')}</span></h2>
            <div className={Styles.adminØkonomiContainer}>
                <div style={{borderTopLeftRadius: '10px', borderTopRightRadius: '10px'}} className={`${Styles.adminØkonomiHeadings} ${Styles.adminØkonomiHeadingsDesktop}`}>
                    <div>
                        <b>Medarbejder</b>
                    </div>
                    <div>
                        <b>Optjent</b>
                    </div>
                    <div>
                        <b>Udlæg</b>
                    </div>
                    <div>
                        <b>Honorar</b>
                    </div>
                </div>
                <div style={{borderTopLeftRadius: '10px', borderTopRightRadius: '10px'}} className={`${Styles.adminØkonomiHeadings} ${Styles.adminØkonomiHeadingsMobile}`}>
                    <div>
                        <b>Medarb.</b>
                    </div>
                    <div>
                        <b>Tjent</b>
                    </div>
                    <div>
                        <b>Udlæg</b>
                    </div>
                    <div>
                        <b>Honorar</b>
                    </div>
                </div>
                <div className={`${Styles.måned} ${Styles.uligeMåned} ${Styles.månedOverblikDesktop}`}>
                    <p>{navn && navn.split(' ')[0]}</p>
                    <p>{beregnTjent(posteringer).toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p>
                    <p>{beregnUdlagt(posteringer).toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p>
                    <p>{(beregnTjent(posteringer) + beregnUdlagt(posteringer)).toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p>
                </div>
                <div className={`${Styles.måned} ${Styles.uligeMåned} ${Styles.månedOverblikMobile}`}>
                    <p>{navn && navn.split(' ')[0]}</p>
                    <p>{beregnTjent(posteringer).toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                    <p>{beregnUdlagt(posteringer).toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                    <p>{(beregnTjent(posteringer) + beregnUdlagt(posteringer)).toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                </div>
            </div>
            <b>Fordelt på følgende opgaver:</b>
            <div className={Styles.adminØkonomiContainer}>
                <div style={{borderTopLeftRadius: '10px', borderTopRightRadius: '10px'}} className={`${Styles.adminØkonomiOpgaverHeadings} ${Styles.adminØkonomiOpgaverHeadingsDesktop}`}>
                    <div>
                        <b>Adresse</b>
                    </div>
                    <div>
                        <b>Opgavestatus</b>
                    </div>
                    <div>
                        <b>Honorar</b>
                    </div>
                    <div>
                        <b></b>
                    </div>
                    <div>
                        <b></b>
                    </div>
                </div>
                <div style={{borderTopLeftRadius: '10px', borderTopRightRadius: '10px'}} className={`${Styles.adminØkonomiOpgaverHeadings} ${Styles.adminØkonomiOpgaverHeadingsMobile}`}>
                    <div>
                        <b>Adresse</b>
                    </div>
                    <div>
                        <b>Status</b>
                    </div>
                    <div>
                        <b>Honorar</b>
                    </div>
                </div>
                {opgaverForBruger && opgaverForBruger.map(opgave => {
                    const posteringerForOpgave = posteringer && posteringer.filter(postering => postering.opgaveID === opgave._id)
                    return ( 
                    <>
                    <div key={opgave._id} className={`${Styles.opgaver} ${Styles.uligeMåned} ${Styles.adminØkonomiOpgaverRækkeDesktop} ${posteringerDetaljer && posteringerDetaljer[0].opgaveID === opgave._id ? Styles.selectedOpgave : ''}`}>
                        <p>{opgave.adresse}</p>
                        <p>{(opgave.fakturaBetalt || opgave.opgaveBetaltMedMobilePay) ? "✅ Betalt" : "❗️ Åben"}</p>
                        <p>{(beregnTjent(posteringerForOpgave)+beregnUdlagt(posteringerForOpgave)).toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p>
                        <p><button onClick={() => posteringerDetaljer && posteringerDetaljer[0].opgaveID === opgave._id ? setPosteringerDetaljer(null) : setPosteringerDetaljer(posteringerForOpgave)} className={Styles.sePosteringerButton}>Se posteringer</button></p>
                        <p><button onClick={() => navigate(`/opgave/${opgave._id}`)}>Gå til opgave</button></p>
                    </div>
                    <div key={opgave._id} onClick={() => posteringerDetaljer && posteringerDetaljer[0].opgaveID === opgave._id ? setPosteringerDetaljer(null) : setPosteringerDetaljer(posteringerForOpgave)} className={`${Styles.opgaver} ${Styles.uligeMåned} ${Styles.adminØkonomiOpgaverRækkeMobile} ${posteringerDetaljer && posteringerDetaljer[0].opgaveID === opgave._id ? Styles.selectedOpgave : ''}`}>
                        <p>{opgave.adresse}</p>
                        <p>{(opgave.fakturaBetalt || opgave.opgaveBetaltMedMobilePay) ? "✅ Betalt" : "❗️ Åben"}</p>
                        <p>{(beregnTjent(posteringerForOpgave)+beregnUdlagt(posteringerForOpgave)).toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p>
                    </div>
                    </>
                    )
                })}
            </div>
            {posteringerDetaljer && 
                <div className={Styles.posteringerContainer}>
                    <button className={Styles.lukPosteringerButton} onClick={() => setPosteringerDetaljer(null)}>-</button>
                    <div className={Styles.posteringerDiv}>
                        {posteringerDetaljer.map((postering, index) => (
                            <div className={ÅbenOpgaveCSS.posteringDiv} key={postering._id}>
                            <div className={ÅbenOpgaveCSS.posteringCard}>

                                <div>
                                    <p className={ÅbenOpgaveCSS.posteringDato}>{postering.dato && postering.dato.slice(0,10)}</p>
                                    <p className={ÅbenOpgaveCSS.posteringBruger}>{postering.opgaveID && getOpgaveAdresse(postering.opgaveID)}</p>
                                    <i className={ÅbenOpgaveCSS.posteringBeskrivelse}>{postering.beskrivelse ? postering.beskrivelse : "Ingen beskrivelse."}</i>
                                    <div className={ÅbenOpgaveCSS.kvitteringBillederListe}>
                                        {postering.udlæg.map((udlæg, index) => {
                                            return udlæg.kvittering ? 
                                            <img 
                                            key={`udlæg-${index}`}
                                            className={ÅbenOpgaveCSS.kvitteringBillede} 
                                            src={udlæg.kvittering} 
                                            alt={udlæg.beskrivelse} 
                                            onClick={() => {
                                                setKvitteringBillede(udlæg.kvittering);
                                            }}/> 
                                            : 
                                            null;
                                        })}
                                    </div>
                                </div>
                                <div className={ÅbenOpgaveCSS.posteringListe}>
                                    {postering.opstart > 0 && postering.dynamiskHonorarBeregning && (
                                        <div className={ÅbenOpgaveCSS.posteringRække}>
                                            <span className={ÅbenOpgaveCSS.posteringRækkeBeskrivelse}>Opstart </span>
                                            <span>{(postering.opstart * postering.satser.opstartsgebyrHonorar).toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                                        </div>
                                    )}
                                    {postering.handymanTimer > 0 && postering.dynamiskHonorarBeregning && (
                                        <div className={ÅbenOpgaveCSS.posteringRække}>
                                            <span className={ÅbenOpgaveCSS.posteringRækkeBeskrivelse}>{postering.handymanTimer || 0} timer (handyman) </span>
                                            <span>{(postering.handymanTimer * postering.satser.handymanTimerHonorar).toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                                        </div>
                                    )}
                                    {postering.tømrerTimer > 0 && postering.dynamiskHonorarBeregning && (
                                        <div className={ÅbenOpgaveCSS.posteringRække}>
                                            <span className={ÅbenOpgaveCSS.posteringRækkeBeskrivelse}>{postering.tømrerTimer || 0} timer (tømrer) </span>
                                            <span>{(postering.tømrerTimer * postering.satser.tømrerTimerHonorar).toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                                        </div>
                                    )}
                                    {postering.rådgivningOpmålingVejledning > 0 && postering.dynamiskHonorarBeregning && (
                                        <div className={ÅbenOpgaveCSS.posteringRække}>
                                            <span className={ÅbenOpgaveCSS.posteringRækkeBeskrivelse}>{postering.rådgivningOpmålingVejledning || 0} timer (rådgivning) </span>
                                            <span>{(postering.rådgivningOpmålingVejledning * postering.satser.rådgivningOpmålingVejledningHonorar).toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                                        </div>
                                    )}
                                    {postering.aftenTillæg && postering.dynamiskHonorarBeregning && (
                                        <div className={ÅbenOpgaveCSS.posteringRække}>
                                            <span className={ÅbenOpgaveCSS.posteringRækkeBeskrivelse}>Aftentillæg (+50% pr. time) </span>
                                            <span>{(((postering.handymanTimer * postering.satser.handymanTimerHonorar) + (postering.tømrerTimer * postering.satser.tømrerTimerHonorar) + (postering.rådgivningOpmålingVejledning * postering.satser.rådgivningOpmålingVejledningHonorar)) * (postering.satser.aftenTillægHonorar / 100)).toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                                        </div>
                                    )}
                                    {postering.natTillæg && postering.dynamiskHonorarBeregning && (
                                        <div className={ÅbenOpgaveCSS.posteringRække}>
                                            <span className={ÅbenOpgaveCSS.posteringRækkeBeskrivelse}>Nattillæg (+100% pr. time) </span>
                                            <span>{(((postering.handymanTimer * postering.satser.handymanTimerHonorar) + (postering.tømrerTimer * postering.satser.tømrerTimerHonorar) + (postering.rådgivningOpmålingVejledning * postering.satser.rådgivningOpmålingVejledningHonorar)) * (postering.satser.natTillægHonorar / 100)).toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                                        </div>
                                    )}
                                    {postering.trailer && postering.dynamiskHonorarBeregning && (
                                        <div className={ÅbenOpgaveCSS.posteringRække}>
                                            <span className={ÅbenOpgaveCSS.posteringRækkeBeskrivelse}>Trailer </span>
                                            <span>{(postering.satser.trailerHonorar).toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                                        </div>
                                    )}
                                    {postering.udlæg.length > 0 && postering.dynamiskHonorarBeregning && (
                                        <div className={ÅbenOpgaveCSS.posteringRække}>
                                            <span className={ÅbenOpgaveCSS.posteringRækkeBeskrivelse}>{postering.udlæg.length > 0 ? postering.udlæg.length : 0} udlæg </span>
                                            <span>{(postering.udlæg.reduce((sum, item) => sum + Number(item.beløb), 0)).toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                                        </div>
                                    )}
                                    {postering.rabatProcent > 0 && postering.dynamiskHonorarBeregning && (
                                        <div className={ÅbenOpgaveCSS.posteringRække}>
                                            <span className={ÅbenOpgaveCSS.posteringRækkeBeskrivelse}>{postering.rabatProcent}% rabat</span>
                                            <span>- {(((postering.totalHonorar - postering.udlæg.reduce((sum, item) => sum + Number(item.beløb), 0)) / (100 - postering.rabatProcent) * 100) * (postering.rabatProcent/100)).toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                                        </div>
                                    )}
                                    {!postering.dynamiskHonorarBeregning && (
                                        <div className={ÅbenOpgaveCSS.posteringRække}>
                                            <span className={ÅbenOpgaveCSS.posteringRækkeBeskrivelse}>Fast honorar: </span>
                                            <span>{postering.fastHonorar.toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                                        </div>
                                    )}
                                    <div className={ÅbenOpgaveCSS.totalRække}>
                                        <b className={ÅbenOpgaveCSS.totalRækkeBeskrivelse}>Total: </b>
                                        <b className={ÅbenOpgaveCSS.totalRækkeResultat}>{(postering.totalHonorar).toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</b>
                                    </div>
                                </div>
                            </div>
                            <p style={{display: 'flex', marginTop: 10, justifyContent: 'center', cursor: 'pointer'}} className={ÅbenOpgaveCSS.prefix} onClick={() => {
                                navigate(`/opgave/${postering.opgaveID}`)
                            }}>Gå til opgave</p>
                        </div>
                    ))}
                </div>
            </div>}
        </div>
    </Modal>
  )
}

export default MedarbejderØkonomiDetaljer