import React, {useState} from 'react'
import PosteringSatserModal from './modals/PosteringSatserModal';
import RedigerPostering from './modals/RedigerPostering';
import ÅbenOpgaveCSS from '../pages/ÅbenOpgave.module.css'
import SwitchArrows from "../assets/switchArrowsBlack.svg"
import axios from 'axios';
import dayjs from 'dayjs';
import { storage } from '../firebase.js'
import { ref, uploadBytesResumable, getDownloadURL, getStorage, deleteObject } from 'firebase/storage'

const Postering = ({ postering, brugere, user, posteringer, setPosteringer, færdiggjort, openPosteringModalID, setOpenPosteringModalID }) => {

    const [openPosteringSatser, setOpenPosteringSatser] = useState(null)
    const [honorarVisning, setHonorarVisning] = useState(true)
    const aftenTillægMultiplikator = postering.aftenTillæg ? (postering.satser.aftenTillægHonorar / 100) : 1;
    const natTillægMultiplikator = postering.natTillæg ? (postering.satser.natTillægHonorar / 100) : 1;

    const getBrugerName = (brugerID) => {
        const bruger = brugere && brugere.find(user => user._id === brugerID);
        return bruger ? bruger.navn : 'Unknown User';
    };

    function sletPostering(posteringID){
        const cutoffDate = dayjs().date(19).endOf('day');
        const posteringDate = dayjs(postering.createdAt);
    
        const isPosteringBeforeCutoffDate = posteringDate.isBefore(cutoffDate);
        const areWePastCutoffDate = dayjs().isAfter(cutoffDate);
    
        if (isPosteringBeforeCutoffDate && areWePastCutoffDate) {
            console.log("Postering tilhører afsluttet lønperiode.");
            setOpenPosteringModalID(postering._id)
            return;
        }
        
        if (window.confirm("Er du sikker på, at du vil slette denne postering?")) {
            const postering = posteringer.find(postering => postering._id === posteringID);

            // Delete files associated with udlæg
            postering.udlæg.forEach(udlæg => {
                if (udlæg?.kvittering) {
                    const storageRef = ref(storage, udlæg.kvittering);
        
                    deleteObject(storageRef)
                        .then(() => console.log("Image deleted successfully"))
                        .catch(error => console.log("Error deleting image:", error));
                }
            });

            // Delete the postering itself
            axios.delete(`${import.meta.env.VITE_API_URL}/posteringer/${posteringID}`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            })
            .then(() => {
                setPosteringer(prevPosteringer => 
                    prevPosteringer.filter(postering => postering._id !== posteringID)
                );
            })
            .catch(error => {
                console.error("Der opstod en fejl ved sletning af posteringen:", error);
            });
        }
    }

  return (
      <div className={ÅbenOpgaveCSS.posteringDiv} key={postering._id}>
        <div className={ÅbenOpgaveCSS.posteringFlipContainer}>
            <div className={`${ÅbenOpgaveCSS.posteringFlipper} ${honorarVisning ? '' : ÅbenOpgaveCSS.flipped}`}>
                <div className={ÅbenOpgaveCSS.posteringFront}>
                    <div className={ÅbenOpgaveCSS.posteringCard}>
                        {user.isAdmin && <div className={`${ÅbenOpgaveCSS.dækningsbidragPill} ${honorarVisning ? ÅbenOpgaveCSS.dækningsbidragPillActive : ''}`}>
                            <p>{(postering.totalPris - postering.totalHonorar).toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                        </div>}
                        <div>
                            <p className={ÅbenOpgaveCSS.posteringDato}>{postering.dato && postering.dato.slice(0,10)}</p>
                            <p className={ÅbenOpgaveCSS.posteringBruger}>{getBrugerName(postering.brugerID)}</p>
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
                                    <span className={ÅbenOpgaveCSS.posteringRækkeBeskrivelse}>Aftentillæg (+{postering.satser.aftenTillægHonorar}% pr. time) </span>
                                    <span>{(((postering.handymanTimer * postering.satser.handymanTimerHonorar) * aftenTillægMultiplikator) + ((postering.tømrerTimer * postering.satser.tømrerTimerHonorar) * aftenTillægMultiplikator) + ((postering.rådgivningOpmålingVejledning * postering.satser.rådgivningOpmålingVejledningHonorar) * aftenTillægMultiplikator)).toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                                </div>
                            )}
                            {postering.natTillæg && postering.dynamiskHonorarBeregning && (
                                <div className={ÅbenOpgaveCSS.posteringRække}>
                                    <span className={ÅbenOpgaveCSS.posteringRækkeBeskrivelse}>Nattillæg (+{postering.satser.natTillægHonorar}% pr. time) </span>
                                    <span>{(((postering.handymanTimer * postering.satser.handymanTimerHonorar) * natTillægMultiplikator) + ((postering.tømrerTimer * postering.satser.tømrerTimerHonorar) * natTillægMultiplikator) + ((postering.rådgivningOpmålingVejledning * postering.satser.rådgivningOpmålingVejledningHonorar) * natTillægMultiplikator)).toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
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
                                <b className={ÅbenOpgaveCSS.totalRækkeBeskrivelse}>Honorar, total: </b>
                                <b className={ÅbenOpgaveCSS.totalRækkeResultat}>{(postering.totalHonorar).toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</b>
                            </div>
                        </div>
                    </div>
                    <div className={`${ÅbenOpgaveCSS.posteringKnapper} ${!honorarVisning && ÅbenOpgaveCSS.posteringKnapperFadeOut}`}>
                        {user.isAdmin && <button className={ÅbenOpgaveCSS.posteringKnap} onClick={() => setHonorarVisning(!honorarVisning)}><img className={ÅbenOpgaveCSS.posteringSwitchKnap} src={SwitchArrows} />Honorar</button>}
                        <div>
                            <button className={ÅbenOpgaveCSS.posteringKnap} onClick={() => {setOpenPosteringSatser(postering)}}>Satser</button>
                            <PosteringSatserModal trigger={openPosteringSatser && openPosteringSatser._id === postering._id} setTrigger={setOpenPosteringSatser} postering={postering} brugere={brugere} />
                            {færdiggjort ? null : <button className={ÅbenOpgaveCSS.posteringKnap} onClick={() => {setOpenPosteringModalID(postering._id), setEditedPostering(postering)}}>Rediger</button>}
                            <RedigerPostering trigger={openPosteringModalID === postering._id} setTrigger={setOpenPosteringModalID} postering={postering} />
                            {færdiggjort ? null : <button className={ÅbenOpgaveCSS.posteringKnap} onClick={() => {sletPostering(postering._id)}}>Slet</button>}
                        </div>
                    </div>
                </div>
                <div className={ÅbenOpgaveCSS.posteringBack}>
                    <div className={ÅbenOpgaveCSS.posteringCard}>
                        {user.isAdmin && <div className={`${ÅbenOpgaveCSS.dækningsbidragPill} ${honorarVisning ? '' : ÅbenOpgaveCSS.dækningsbidragPillActive}`}>
                            <p>{(postering.totalPris - postering.totalHonorar).toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                        </div>}
                        <div>
                            <p className={ÅbenOpgaveCSS.posteringDato}>{postering.dato && postering.dato.slice(0,10)}</p>
                            <p className={ÅbenOpgaveCSS.posteringBruger}>{getBrugerName(postering.brugerID)}</p>
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
                            {postering.opstart > 0 && postering.dynamiskPrisBeregning && (
                                <div className={ÅbenOpgaveCSS.posteringRække}>
                                    <span className={ÅbenOpgaveCSS.posteringRækkeBeskrivelse}>Opstart </span>
                                    <span>{(postering.opstart * postering.satser.opstartsgebyrPris).toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                                </div>
                            )}
                            {postering.handymanTimer > 0 && postering.dynamiskPrisBeregning && (
                                <div className={ÅbenOpgaveCSS.posteringRække}>
                                    <span className={ÅbenOpgaveCSS.posteringRækkeBeskrivelse}>{postering.handymanTimer || 0} timer (handyman) </span>
                                    <span>{(postering.handymanTimer * postering.satser.handymanTimerPris).toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                                </div>
                            )}
                            {postering.tømrerTimer > 0 && postering.dynamiskPrisBeregning && (
                                <div className={ÅbenOpgaveCSS.posteringRække}>
                                    <span className={ÅbenOpgaveCSS.posteringRækkeBeskrivelse}>{postering.tømrerTimer || 0} timer (tømrer) </span>
                                    <span>{(postering.tømrerTimer * postering.satser.tømrerTimerPris).toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                                </div>
                            )}
                            {postering.rådgivningOpmålingVejledning > 0 && postering.dynamiskPrisBeregning && (
                                <div className={ÅbenOpgaveCSS.posteringRække}>
                                    <span className={ÅbenOpgaveCSS.posteringRækkeBeskrivelse}>{postering.rådgivningOpmålingVejledning || 0} timer (rådgivning) </span>
                                    <span>{(postering.rådgivningOpmålingVejledning * postering.satser.rådgivningOpmålingVejledningPris).toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                                </div>
                            )}
                            {postering.aftenTillæg && postering.dynamiskPrisBeregning && (
                                <div className={ÅbenOpgaveCSS.posteringRække}>
                                    <span className={ÅbenOpgaveCSS.posteringRækkeBeskrivelse}>Aftentillæg </span>
                                    <span>{((postering.handymanTimer * (postering.satser.handymanTimerPrisInklAftenTillæg - postering.satser.handymanTimerPris)) + (postering.tømrerTimer * (postering.satser.tømrerTimerPrisInklAftenTillæg - postering.satser.tømrerTimerPris)) + (postering.rådgivningOpmålingVejledning * (postering.satser.tømrerTimerPrisInklAftenTillæg - postering.satser.rådgivningOpmålingVejledningPris))).toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                                </div>
                            )}
                            {postering.natTillæg && postering.dynamiskPrisBeregning && (
                                <div className={ÅbenOpgaveCSS.posteringRække}>
                                    <span className={ÅbenOpgaveCSS.posteringRækkeBeskrivelse}>Nattillæg </span>
                                    <span>{((postering.handymanTimer * (postering.satser.handymanTimerPrisInklNatTillæg - postering.satser.handymanTimerPris)) + (postering.tømrerTimer * (postering.satser.tømrerTimerPrisInklNatTillæg - postering.satser.tømrerTimerPris)) + (postering.rådgivningOpmålingVejledning * (postering.satser.tømrerTimerPrisInklNatTillæg - postering.satser.rådgivningOpmålingVejledningPris))).toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                                </div>
                            )}
                            {postering.trailer && postering.dynamiskPrisBeregning && (
                                <div className={ÅbenOpgaveCSS.posteringRække}>
                                    <span className={ÅbenOpgaveCSS.posteringRækkeBeskrivelse}>Trailer </span>
                                    <span>{(postering.satser.trailerPris).toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                                </div>
                            )}
                            {postering.udlæg.length > 0 && postering.dynamiskPrisBeregning && (
                                <div className={ÅbenOpgaveCSS.posteringRække}>
                                    <span className={ÅbenOpgaveCSS.posteringRækkeBeskrivelse}>{postering.udlæg.length > 0 ? postering.udlæg.length : 0} udlæg </span>
                                    <span>{(postering.udlæg.reduce((sum, item) => sum + Number(item.beløb), 0)).toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                                </div>
                            )}
                            {postering.rabatProcent > 0 && postering.dynamiskPrisBeregning && (
                                <div className={ÅbenOpgaveCSS.posteringRække}>
                                    <span className={ÅbenOpgaveCSS.posteringRækkeBeskrivelse}>{postering.rabatProcent}% rabat</span>
                                    <span>- {(((postering.totalPris - postering.udlæg.reduce((sum, item) => sum + Number(item.beløb), 0)) / (100 - postering.rabatProcent) * 100) * (postering.rabatProcent/100)).toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                                </div>
                            )}
                            {!postering.dynamiskPrisBeregning && (
                                <div className={ÅbenOpgaveCSS.posteringRække}>
                                    <span className={ÅbenOpgaveCSS.posteringRækkeBeskrivelse}>Fast pris: </span>
                                    <span>{(postering.fastPris).toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                                </div>
                            )}
                            <div className={ÅbenOpgaveCSS.totalRække}>
                                <b className={ÅbenOpgaveCSS.totalRækkeBeskrivelse}>Indtægt, total: </b>
                                <b className={ÅbenOpgaveCSS.totalRækkeResultat}>{(postering.totalPris).toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</b>
                            </div>
                        </div>
                    </div>
                    <div className={`${ÅbenOpgaveCSS.posteringKnapper} ${honorarVisning && ÅbenOpgaveCSS.posteringKnapperFadeOut}`}>
                        {user.isAdmin && <button className={ÅbenOpgaveCSS.posteringKnap} onClick={() => setHonorarVisning(!honorarVisning)}><img className={ÅbenOpgaveCSS.posteringSwitchKnap} src={SwitchArrows} />Indtægt</button>}
                        <div>
                            {færdiggjort ? null : <button className={ÅbenOpgaveCSS.posteringKnap} onClick={() => {setOpenPosteringModalID(postering._id), setEditedPostering(postering)}}>Rediger</button>}
                            {færdiggjort ? null : <button className={ÅbenOpgaveCSS.posteringKnap} onClick={() => {sletPostering(postering._id)}}>Slet</button>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}

export default Postering
