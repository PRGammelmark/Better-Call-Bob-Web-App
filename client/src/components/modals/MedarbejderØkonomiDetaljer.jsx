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
        return bruger ? bruger.navn : 'Unknown User';
    };

    const navn = posteringer && getBrugerName(posteringer[0].brugerID)
    const opgaverForBruger = opgaver && uniqueOpgaveIDs && opgaver.filter(opgave => uniqueOpgaveIDs.includes(opgave._id))

    function beregnTjent(posteringer) {
        if(!posteringer) return 0
        const månedensOpstartsgebyrer = posteringer.reduce((sum, postering) => sum + postering.opstart, 0)
        const månedensHandymantimer = posteringer.reduce((sum, postering) => sum + postering.handymanTimer, 0)
        const månedensTømrertimer = posteringer.reduce((sum, postering) => sum + postering.tømrerTimer, 0)

        return månedensOpstartsgebyrer + (månedensHandymantimer * satser.handymanTimerHonorar) + (månedensTømrertimer * satser.tømrerTimerHonorar)
    }

    function beregnUdlagt(posteringer) {
        if(!posteringer) return 0
        const månedensUdlæg = posteringer.reduce((sum, postering) => {
            const udlægSum = postering.udlæg.reduce((udlægSum, udlægItem) => udlægSum + udlægItem.beløb, 0);
            return sum + udlægSum;
        }, 0);
        const månedensØvrigt = posteringer.reduce((sum, postering) => {
            const øvrigtSum = postering.øvrigt.reduce((øvrigtSum, øvrigtItem) => øvrigtSum + øvrigtItem.beløb, 0);
            return sum + øvrigtSum;
        }, 0);

        return månedensUdlæg + månedensØvrigt;
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
                            <p className={ÅbenOpgaveCSS.posteringDato}>{postering.dato ? dayjs(postering.dato).format('DD. MMM YYYY') : "Ingen dato valgt"} – for opgave på</p>
                            <p className={ÅbenOpgaveCSS.posteringBruger}>{postering.opgaveID && getOpgaveAdresse(postering.opgaveID)}</p>
                            <i className={ÅbenOpgaveCSS.posteringBeskrivelse}>{postering.beskrivelse ? postering.beskrivelse : "Ingen beskrivelse."}</i>
                            <div className={ÅbenOpgaveCSS.kvitteringBillederListe}>
                                {postering.udlæg.map((udlæg, index) => {
                                    return udlæg.kvittering ? 
                                    <img 
                                    key={`udlæg-${index}`}
                                    className={ÅbenOpgaveCSS.kvitteringBillede} 
                                    src={`${import.meta.env.VITE_API_URL}${udlæg.kvittering}`} 
                                    alt={udlæg.beskrivelse} 
                                    onClick={() => {
                                        setKvitteringBillede(udlæg.kvittering);
                                    }}/> 
                                    : 
                                    null;
                                })}
                                {postering.øvrigt.map((øvrigt, index) => {
                                    return øvrigt.kvittering ? 
                                    <img 
                                    key={`øvrigt-${index}`}
                                    className={ÅbenOpgaveCSS.kvitteringBillede} 
                                    src={`${import.meta.env.VITE_API_URL}${øvrigt.kvittering}`} 
                                    alt={øvrigt.beskrivelse} 
                                    onClick={() => {
                                        setKvitteringBillede(øvrigt.kvittering);
                                    }}/> 
                                    : 
                                    null;
                                })}
                            </div>
                        </div>
                        <div className={ÅbenOpgaveCSS.posteringListe}>
                            <div className={ÅbenOpgaveCSS.posteringRække}>
                                <span className={ÅbenOpgaveCSS.posteringRækkeBeskrivelse}>Opstart: </span>
                                <span>{(postering.opstart ? postering.opstart : "0") + " kr."}</span>
                            </div>
                            <div className={ÅbenOpgaveCSS.posteringRække}>
                                <span className={ÅbenOpgaveCSS.posteringRækkeBeskrivelse}>{postering.handymanTimer > 0 ? postering.handymanTimer : 0} timer (handyman): </span>
                                <span>{(postering.handymanTimer * 300) + " kr."}</span>
                            </div>
                            <div className={ÅbenOpgaveCSS.posteringRække}>
                                <span className={ÅbenOpgaveCSS.posteringRækkeBeskrivelse}>{postering.tømrerTimer ? postering.tømrerTimer : 0} timer (tømrer): </span>
                                <span>{(postering.tømrerTimer * 360) + " kr."}</span>
                            </div>
                            <div className={ÅbenOpgaveCSS.posteringRække}>
                                <span className={ÅbenOpgaveCSS.posteringRækkeBeskrivelse}>{postering.udlæg.length > 0 ? postering.udlæg.length : 0} udlæg: </span>
                                <span>{postering.udlæg.reduce((sum, item) => sum + Number(item.beløb), 0) + " kr."}</span>
                            </div>
                            <div className={ÅbenOpgaveCSS.posteringRække}>
                                <span className={ÅbenOpgaveCSS.posteringRækkeBeskrivelse}>{postering.øvrigt.length > 0 ? postering.øvrigt.length : 0} øvrigt: </span>
                                <span>{postering.øvrigt.reduce((sum, item) => sum + Number(item.beløb), 0) + " kr."}</span>
                            </div>
                            <div className={ÅbenOpgaveCSS.totalRække}>
                                <b className={ÅbenOpgaveCSS.totalRækkeBeskrivelse}>Total: </b>
                                <b className={ÅbenOpgaveCSS.totalRækkeResultat}>{postering.total + " kr."}</b>
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