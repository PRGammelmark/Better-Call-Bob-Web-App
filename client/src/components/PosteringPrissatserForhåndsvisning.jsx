import React, {useState, useEffect} from 'react'
import Styles from './Postering.module.css'
import axios from 'axios';
import dayjs from 'dayjs';
import * as beregn from '../utils/beregninger.js'

const PosteringPrissatserForhåndsvisning = ({ forhåndsvistPostering }) => {

  return (
    <div className={`${Styles.posteringDiv} ${Styles.posteringDivForhåndsvisning}`} key={forhåndsvistPostering._id}>
        <div className={`${Styles.posteringCard} ${Styles.posteringCardMedSatser} ${Styles.posteringWrapper}`}>
            <div className={`${Styles.forhåndsvisningPill}`}>
                <p>Forhåndsvisning</p>
            </div>
            <div className={Styles.posteringBackHeader}>
                <p className={Styles.posteringDato}>{dayjs(forhåndsvistPostering?.dato).format('D. MMMM YYYY')}</p>
                <p className={Styles.posteringBruger}>{forhåndsvistPostering?.kunde?.navn || "Ikke fundet"}</p>
                <p className={Styles.posteringFrontHeaderBeskrivelse}>Kunde</p>
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
                    <b>Sats (u. moms)</b>
                    <b style={{textAlign: 'right'}}>Pris</b>
                </div>
                <div className={Styles.posteringListe}>
                    {forhåndsvistPostering?.opstart > 0 && forhåndsvistPostering?.dynamiskPrisBeregning && (
                        <div className={`${Styles.posteringRække} ${Styles.posteringForhåndsvisningRække}`}>
                            <span className={Styles.posteringRækkeBeskrivelse}>{forhåndsvistPostering.opstart} x opstart </span>
                            <span>{forhåndsvistPostering.satser.opstartsgebyrPris} kr.</span>
                            <span style={{textAlign: 'right'}}>{beregn.opstartPris(forhåndsvistPostering).formateret}</span>
                        </div>
                    )}
                    {forhåndsvistPostering?.handymanTimer > 0 && forhåndsvistPostering?.dynamiskPrisBeregning && (
                        <div className={`${Styles.posteringRække} ${Styles.posteringForhåndsvisningRække}`}>
                            <span className={Styles.posteringRækkeBeskrivelse}>{forhåndsvistPostering.handymanTimer || 0} x timer (handyman) </span>
                            <span>{forhåndsvistPostering.satser.handymanTimerPris} kr.</span>
                            <span style={{textAlign: 'right'}}>{beregn.handymanPris(forhåndsvistPostering).formateret}</span>
                        </div>
                    )}
                    {forhåndsvistPostering?.tømrerTimer > 0 && forhåndsvistPostering?.dynamiskPrisBeregning && (
                        <div className={`${Styles.posteringRække} ${Styles.posteringForhåndsvisningRække}`}>
                            <span className={Styles.posteringRækkeBeskrivelse}>{forhåndsvistPostering.tømrerTimer || 0} x timer (tømrer) </span>
                            <span>{forhåndsvistPostering.satser.tømrerTimerPris} kr.</span>
                            <span style={{textAlign: 'right'}}>{beregn.tømrerPris(forhåndsvistPostering).formateret}</span>
                        </div>
                    )}
                    {forhåndsvistPostering?.rådgivningOpmålingVejledning > 0 && forhåndsvistPostering?.dynamiskPrisBeregning && (
                        <div className={`${Styles.posteringRække} ${Styles.posteringForhåndsvisningRække}`}>
                            <span className={Styles.posteringRækkeBeskrivelse}>{forhåndsvistPostering.rådgivningOpmålingVejledning || 0} x timer (rådgivning) </span>
                            <span>{forhåndsvistPostering.satser.rådgivningOpmålingVejledningPris} kr.</span>
                            <span style={{textAlign: 'right'}}>{beregn.rådgivningPris(forhåndsvistPostering).formateret}</span>
                        </div>
                    )}
                    {forhåndsvistPostering?.aftenTillæg && forhåndsvistPostering?.dynamiskPrisBeregning && (
                        <div className={`${Styles.posteringRække} ${Styles.posteringForhåndsvisningRække}`}>
                            <span className={Styles.posteringRækkeBeskrivelse}>Aftentillæg pr. time</span>
                            <span>+{forhåndsvistPostering.satser.aftenTillægPris}%</span>
                            <span style={{textAlign: 'right'}}>{beregn.aftenTillægPris(forhåndsvistPostering).formateret}</span>
                        </div>
                    )}
                    {forhåndsvistPostering?.natTillæg && forhåndsvistPostering?.dynamiskPrisBeregning && (
                        <div className={`${Styles.posteringRække} ${Styles.posteringForhåndsvisningRække}`}>
                            <span className={Styles.posteringRækkeBeskrivelse}>Nattillæg pr. time</span>
                            <span>+{forhåndsvistPostering.satser.natTillægPris}%</span>
                            <span style={{textAlign: 'right'}}>{beregn.natTillægPris(forhåndsvistPostering).formateret}</span>
                        </div>
                    )}
                    {forhåndsvistPostering?.trailer && forhåndsvistPostering?.dynamiskPrisBeregning && (
                        <div className={`${Styles.posteringRække} ${Styles.posteringForhåndsvisningRække}`}>
                            <span className={Styles.posteringRækkeBeskrivelse}>Trailer </span>
                            <span>{forhåndsvistPostering.satser.trailerPris} kr.</span>
                            <span style={{textAlign: 'right'}}>{beregn.trailerPris(forhåndsvistPostering).formateret}</span>
                        </div>
                    )}
                    {forhåndsvistPostering?.udlæg?.length > 0 && forhåndsvistPostering?.dynamiskPrisBeregning && (
                        <div className={`${Styles.posteringRække} ${Styles.posteringForhåndsvisningRække}`}>
                            <span className={Styles.posteringRækkeBeskrivelse}>{forhåndsvistPostering.udlæg.length > 0 ? forhåndsvistPostering.udlæg.length : 0} udlæg </span>
                            <span>-</span>
                            <span style={{textAlign: 'right'}}>{beregn.udlægPris(forhåndsvistPostering).formateret}</span>
                        </div>
                    )}
                    {forhåndsvistPostering?.rabatProcent > 0 && forhåndsvistPostering?.dynamiskPrisBeregning && (
                        <div className={`${Styles.posteringRække} ${Styles.posteringForhåndsvisningRække}`}>
                            <span className={Styles.posteringRækkeBeskrivelse}>{forhåndsvistPostering.rabatProcent}% rabat</span>
                            <span>-</span>
                            <span style={{textAlign: 'right'}}>- {beregn.rabatPris({...forhåndsvistPostering, totalPris: beregn.totalPris(forhåndsvistPostering).beløb}).formateret}</span>
                        </div>
                    )}
                    {!forhåndsvistPostering?.dynamiskPrisBeregning && (
                        <div className={`${Styles.posteringRække} ${Styles.posteringForhåndsvisningRække}`}>
                            <span className={Styles.posteringRækkeBeskrivelse}>Fast honorar: </span>
                            <span>-</span>
                            <span style={{textAlign: 'right'}}>{beregn.fastHonorar(forhåndsvistPostering).formateret}</span>
                        </div>
                    )}
                    <div className={Styles.totalRække}>
                        <b className={Styles.totalRækkeBeskrivelse}>Pris u. moms, total: </b>
                        <b className={Styles.totalRækkeResultat}>{beregn.totalPris(forhåndsvistPostering).formateret}</b>
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}

export default PosteringPrissatserForhåndsvisning
