import React, {useState, useEffect} from 'react'
import Styles from './Postering.module.css'
import axios from 'axios';
import dayjs from 'dayjs';
import * as beregn from '../utils/beregninger.js'

const PosteringLønsatserForhåndsvisning = ({ forhåndsvistPostering }) => {

  return (
    <div className={`${Styles.posteringDiv} ${Styles.posteringDivForhåndsvisning}`} key={forhåndsvistPostering._id}>
        <div className={`${Styles.posteringCard} ${Styles.posteringCardMedSatser} ${Styles.posteringWrapper}`}>
            <div className={`${Styles.forhåndsvisningPill}`}>
                <p>Forhåndsvisning</p>
            </div>
            <div className={Styles.posteringFrontHeader}>
                <p className={Styles.posteringDato}>{dayjs(forhåndsvistPostering?.dato).format('D. MMMM YYYY')}</p>
                <p className={Styles.posteringBruger}>{forhåndsvistPostering?.bruger?.navn || "Ikke fundet"}</p>
                <p className={Styles.posteringFrontHeaderBeskrivelse}>Medarbejder</p>
            </div>
            <div className={Styles.posteringContent}>
                <i className={Styles.posteringBeskrivelse}>{forhåndsvistPostering?.beskrivelse ? forhåndsvistPostering?.beskrivelse : "Ingen beskrivelse."}</i>
                <div className={Styles.kvitteringBillederListe}>
                    {forhåndsvistPostering?.udlæg.map((udlæg, index) => {
                        return udlæg.kvittering ? 
                        <img 
                        key={`udlæg-${index}`}
                        className={Styles.kvitteringBillede} 
                        src={udlæg.kvittering} 
                        alt={udlæg.beskrivelse} 
                        onClick={() => {
                            setKvitteringBillede(udlæg.kvittering);
                        }}/> 
                        : 
                        null;
                    })}
                </div>
                <div className={Styles.posteringForhåndsvisningOverskrifter}>
                    <b>Beskrivelse</b>
                    <b>Sats</b>
                    <b style={{textAlign: 'right'}}>Løn</b>
                </div>
                <div className={Styles.posteringListe}>
                    {forhåndsvistPostering?.opstart > 0 && forhåndsvistPostering?.dynamiskHonorarBeregning && (
                        <div className={`${Styles.posteringRække} ${Styles.posteringForhåndsvisningRække}`}>
                            <span className={Styles.posteringRækkeBeskrivelse}>{forhåndsvistPostering.opstart} x opstart </span>
                            <span>{forhåndsvistPostering.satser.opstartsgebyrHonorar} kr.</span>
                            <span style={{textAlign: 'right'}}>{beregn.opstartHonorar(forhåndsvistPostering).formateret}</span>
                        </div>
                    )}
                    {forhåndsvistPostering?.handymanTimer > 0 && forhåndsvistPostering?.dynamiskHonorarBeregning && (
                        <div className={`${Styles.posteringRække} ${Styles.posteringForhåndsvisningRække}`}>
                            <span className={Styles.posteringRækkeBeskrivelse}>{forhåndsvistPostering.handymanTimer || 0} x timer (handyman) </span>
                            <span>{forhåndsvistPostering.satser.handymanTimerHonorar} kr.</span>
                            <span style={{textAlign: 'right'}}>{beregn.handymanHonorar(forhåndsvistPostering).formateret}</span>
                        </div>
                    )}
                    {forhåndsvistPostering?.tømrerTimer > 0 && forhåndsvistPostering?.dynamiskHonorarBeregning && (
                        <div className={`${Styles.posteringRække} ${Styles.posteringForhåndsvisningRække}`}>
                            <span className={Styles.posteringRækkeBeskrivelse}>{forhåndsvistPostering.tømrerTimer || 0} x timer (tømrer) </span>
                            <span>{forhåndsvistPostering.satser.tømrerTimerHonorar} kr.</span>
                            <span style={{textAlign: 'right'}}>{beregn.tømrerHonorar(forhåndsvistPostering).formateret}</span>
                        </div>
                    )}
                    {forhåndsvistPostering?.rådgivningOpmålingVejledning > 0 && forhåndsvistPostering?.dynamiskHonorarBeregning && (
                        <div className={`${Styles.posteringRække} ${Styles.posteringForhåndsvisningRække}`}>
                            <span className={Styles.posteringRækkeBeskrivelse}>{forhåndsvistPostering.rådgivningOpmålingVejledning || 0} x timer (rådgivning) </span>
                            <span>{forhåndsvistPostering.satser.rådgivningOpmålingVejledningHonorar} kr.</span>
                            <span style={{textAlign: 'right'}}>{beregn.rådgivningHonorar(forhåndsvistPostering).formateret}</span>
                        </div>
                    )}
                    {forhåndsvistPostering?.aftenTillæg && forhåndsvistPostering?.dynamiskHonorarBeregning && (
                        <div className={`${Styles.posteringRække} ${Styles.posteringForhåndsvisningRække}`}>
                            <span className={Styles.posteringRækkeBeskrivelse}>Aftentillæg pr. time</span>
                            <span>+{forhåndsvistPostering.satser.aftenTillægHonorar}%</span>
                            <span style={{textAlign: 'right'}}>{beregn.aftenTillægHonorar(forhåndsvistPostering).formateret}</span>
                        </div>
                    )}
                    {forhåndsvistPostering?.natTillæg && forhåndsvistPostering?.dynamiskHonorarBeregning && (
                        <div className={`${Styles.posteringRække} ${Styles.posteringForhåndsvisningRække}`}>
                            <span className={Styles.posteringRækkeBeskrivelse}>Nattillæg pr. time</span>
                            <span>+{forhåndsvistPostering.satser.natTillægHonorar}%</span>
                            <span style={{textAlign: 'right'}}>{beregn.natTillægHonorar(forhåndsvistPostering).formateret}</span>
                        </div>
                    )}
                    {forhåndsvistPostering?.trailer && forhåndsvistPostering?.dynamiskHonorarBeregning && (
                        <div className={`${Styles.posteringRække} ${Styles.posteringForhåndsvisningRække}`}>
                            <span className={Styles.posteringRækkeBeskrivelse}>Trailer </span>
                            <span>{forhåndsvistPostering.satser.trailerHonorar} kr.</span>
                            <span style={{textAlign: 'right'}}>{beregn.trailerHonorar(forhåndsvistPostering).formateret}</span>
                        </div>
                    )}
                    {forhåndsvistPostering?.udlæg?.length > 0 && forhåndsvistPostering?.dynamiskHonorarBeregning && (
                        <div className={`${Styles.posteringRække} ${Styles.posteringForhåndsvisningRække}`}>
                            <span className={Styles.posteringRækkeBeskrivelse}>{forhåndsvistPostering.udlæg.length > 0 ? forhåndsvistPostering.udlæg.length : 0} udlæg </span>
                            <span>-</span>
                            <span style={{textAlign: 'right'}}>{beregn.udlægHonorar(forhåndsvistPostering).formateret}</span>
                        </div>
                    )}
                    {forhåndsvistPostering?.rabatProcent > 0 && forhåndsvistPostering?.dynamiskHonorarBeregning && (
                        <div className={`${Styles.posteringRække} ${Styles.posteringForhåndsvisningRække}`}>
                            <span className={Styles.posteringRækkeBeskrivelse}>{forhåndsvistPostering.rabatProcent}% rabat</span>
                            <span>-</span>
                            <span style={{textAlign: 'right'}}>- {beregn.rabatHonorar({...forhåndsvistPostering, totalHonorar: beregn.totalHonorar(forhåndsvistPostering).beløb}).formateret}</span>
                        </div>
                    )}
                    {!forhåndsvistPostering?.dynamiskHonorarBeregning && (
                        <div className={`${Styles.posteringRække} ${Styles.posteringForhåndsvisningRække}`}>
                            <span className={Styles.posteringRækkeBeskrivelse}>Fast honorar: </span>
                            <span>-</span>
                            <span style={{textAlign: 'right'}}>{beregn.fastHonorar(forhåndsvistPostering).formateret}</span>
                        </div>
                    )}
                    <div className={Styles.totalRække}>
                        <b className={Styles.totalRækkeBeskrivelse}>Løn, total: </b>
                        <b className={Styles.totalRækkeResultat}>{beregn.totalHonorar(forhåndsvistPostering).formateret}</b>
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}

export default PosteringLønsatserForhåndsvisning
