import React, {useState} from 'react'
import PosteringSatserModal from './modals/PosteringSatserModal';
import VisBilledeModal from './modals/VisBillede.jsx'
import RedigerPostering from './modals/RedigerPostering';
import ÅbenOpgaveCSS from '../pages/ÅbenOpgave.module.css'
import SwitchArrows from "../assets/switchArrowsBlack.svg"
import axios from 'axios';
import dayjs from 'dayjs';
import { storage } from '../firebase.js'
import { ref, uploadBytesResumable, getDownloadURL, getStorage, deleteObject } from 'firebase/storage'
import * as beregn from '../utils/beregninger.js'

const Postering = ({ postering, brugere, user, posteringer, setPosteringer, færdiggjort, openPosteringModalID, setOpenPosteringModalID, visInklMoms }) => {

    const [openPosteringSatser, setOpenPosteringSatser] = useState(null)
    const [honorarVisning, setHonorarVisning] = useState(false)
    const [kvitteringBillede, setKvitteringBillede] = useState("")
    // const aftenTillægMultiplikator = postering.aftenTillæg ? (postering.satser.aftenTillægHonorar / 100) : 1;
    // const natTillægMultiplikator = postering.natTillæg ? (postering.satser.natTillægHonorar / 100) : 1;

    const userID = user?.id || user?._id;

    const getBrugerName = (brugerID) => {
        const bruger = brugere && brugere.find(user => (user?._id || user?.id) === brugerID);
        return bruger ? bruger.navn : 'Ukendt medarbejder';
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
                    <div className={ÅbenOpgaveCSS.posteringCard} onClick={() => setHonorarVisning(!honorarVisning)}>
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
                                    <span>{beregn.opstartHonorar(postering).formateret}</span>
                                </div>
                            )}
                            {postering.handymanTimer > 0 && postering.dynamiskHonorarBeregning && (
                                <div className={ÅbenOpgaveCSS.posteringRække}>
                                    <span className={ÅbenOpgaveCSS.posteringRækkeBeskrivelse}>{postering.handymanTimer || 0} timer (handyman) </span>
                                    <span>{beregn.handymanHonorar(postering).formateret}</span>
                                </div>
                            )}
                            {postering.tømrerTimer > 0 && postering.dynamiskHonorarBeregning && (
                                <div className={ÅbenOpgaveCSS.posteringRække}>
                                    <span className={ÅbenOpgaveCSS.posteringRækkeBeskrivelse}>{postering.tømrerTimer || 0} timer (tømrer) </span>
                                    <span>{beregn.tømrerHonorar(postering).formateret}</span>
                                </div>
                            )}
                            {postering.rådgivningOpmålingVejledning > 0 && postering.dynamiskHonorarBeregning && (
                                <div className={ÅbenOpgaveCSS.posteringRække}>
                                    <span className={ÅbenOpgaveCSS.posteringRækkeBeskrivelse}>{postering.rådgivningOpmålingVejledning || 0} timer (rådgivning) </span>
                                    <span>{beregn.rådgivningHonorar(postering).formateret}</span>
                                </div>
                            )}
                            {postering.aftenTillæg && postering.dynamiskHonorarBeregning && (
                                <div className={ÅbenOpgaveCSS.posteringRække}>
                                    <span className={ÅbenOpgaveCSS.posteringRækkeBeskrivelse}>Aftentillæg (+{postering.satser.aftenTillægHonorar}% pr. time) </span>
                                    <span>{beregn.aftenTillægHonorar(postering).formateret}</span>
                                </div>
                            )}
                            {postering.natTillæg && postering.dynamiskHonorarBeregning && (
                                <div className={ÅbenOpgaveCSS.posteringRække}>
                                    <span className={ÅbenOpgaveCSS.posteringRækkeBeskrivelse}>Nattillæg (+{postering.satser.natTillægHonorar}% pr. time) </span>
                                    <span>{beregn.natTillægHonorar(postering).formateret}</span>
                                </div>
                            )}
                            {postering.trailer && postering.dynamiskHonorarBeregning && (
                                <div className={ÅbenOpgaveCSS.posteringRække}>
                                    <span className={ÅbenOpgaveCSS.posteringRækkeBeskrivelse}>Trailer </span>
                                    <span>{beregn.trailerHonorar(postering).formateret}</span>
                                </div>
                            )}
                            {postering.udlæg.length > 0 && postering.dynamiskHonorarBeregning && (
                                <div className={ÅbenOpgaveCSS.posteringRække}>
                                    <span className={ÅbenOpgaveCSS.posteringRækkeBeskrivelse}>{postering.udlæg.length > 0 ? postering.udlæg.length : 0} udlæg </span>
                                    <span>{beregn.udlægHonorar(postering).formateret}</span>
                                </div>
                            )}
                            {postering.rabatProcent > 0 && postering.dynamiskHonorarBeregning && (
                                <div className={ÅbenOpgaveCSS.posteringRække}>
                                    <span className={ÅbenOpgaveCSS.posteringRækkeBeskrivelse}>{postering.rabatProcent}% rabat</span>
                                    <span>- {beregn.rabatHonorar(postering).formateret}</span>
                                </div>
                            )}
                            {!postering.dynamiskHonorarBeregning && (
                                <div className={ÅbenOpgaveCSS.posteringRække}>
                                    <span className={ÅbenOpgaveCSS.posteringRækkeBeskrivelse}>Fast honorar: </span>
                                    <span>{beregn.fastHonorar(postering).formateret}</span>
                                </div>
                            )}
                            <div className={ÅbenOpgaveCSS.totalRække}>
                                <b className={ÅbenOpgaveCSS.totalRækkeBeskrivelse}>Honorar, total: </b>
                                <b className={ÅbenOpgaveCSS.totalRækkeResultat}>{beregn.totalHonorar(postering).formateret}</b>
                            </div>
                        </div>
                    </div>
                    <div className={`${ÅbenOpgaveCSS.posteringKnapper} ${!honorarVisning && ÅbenOpgaveCSS.posteringKnapperFadeOut}`}>
                        <button className={ÅbenOpgaveCSS.posteringKnap} onClick={() => setHonorarVisning(!honorarVisning)}><img className={ÅbenOpgaveCSS.posteringSwitchKnap} src={SwitchArrows} />Honorar</button>
                        {(user.isAdmin || userID === postering.brugerID) && <div>
                            <button className={ÅbenOpgaveCSS.posteringKnap} onClick={() => {setOpenPosteringSatser(postering)}}>Satser</button>
                            <PosteringSatserModal trigger={openPosteringSatser && openPosteringSatser._id === postering._id} setTrigger={setOpenPosteringSatser} postering={postering} brugere={brugere} />
                            {færdiggjort ? null : <button className={ÅbenOpgaveCSS.posteringKnap} onClick={() => {setOpenPosteringModalID(postering._id)}}>Rediger</button>}
                            <RedigerPostering trigger={openPosteringModalID === postering._id} setTrigger={setOpenPosteringModalID} postering={postering} />
                            {færdiggjort ? null : <button className={ÅbenOpgaveCSS.posteringKnap} onClick={() => {sletPostering(postering._id)}}>Slet</button>}
                        </div>}
                    </div>
                </div>
                <div className={ÅbenOpgaveCSS.posteringBack}>
                    <div className={ÅbenOpgaveCSS.posteringCard} onClick={() => setHonorarVisning(!honorarVisning)}>
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
                                    <span>{beregn.opstartPris(postering, 2, visInklMoms).formateret}</span>
                                </div>
                            )}
                            {postering.handymanTimer > 0 && postering.dynamiskPrisBeregning && (
                                <div className={ÅbenOpgaveCSS.posteringRække}>
                                    <span className={ÅbenOpgaveCSS.posteringRækkeBeskrivelse}>{postering.handymanTimer || 0} timer (handyman) </span>
                                    <span>{beregn.handymanPris(postering, 2, visInklMoms).formateret}</span>
                                </div>
                            )}
                            {postering.tømrerTimer > 0 && postering.dynamiskPrisBeregning && (
                                <div className={ÅbenOpgaveCSS.posteringRække}>
                                    <span className={ÅbenOpgaveCSS.posteringRækkeBeskrivelse}>{postering.tømrerTimer || 0} timer (tømrer) </span>
                                    <span>{beregn.tømrerPris(postering, 2, visInklMoms).formateret}</span>
                                </div>
                            )}
                            {postering.rådgivningOpmålingVejledning > 0 && postering.dynamiskPrisBeregning && (
                                <div className={ÅbenOpgaveCSS.posteringRække}>
                                    <span className={ÅbenOpgaveCSS.posteringRækkeBeskrivelse}>{postering.rådgivningOpmålingVejledning || 0} timer (rådgivning) </span>
                                    <span>{beregn.rådgivningPris(postering, 2, visInklMoms).formateret}</span>
                                </div>
                            )}
                            {postering.aftenTillæg && postering.dynamiskPrisBeregning && (
                                <div className={ÅbenOpgaveCSS.posteringRække}>
                                    <span className={ÅbenOpgaveCSS.posteringRækkeBeskrivelse}>Aftentillæg </span>
                                    <span>{beregn.aftenTillægPris(postering, 2, visInklMoms).formateret}</span>
                                </div>
                            )}
                            {postering.natTillæg && postering.dynamiskPrisBeregning && (
                                <div className={ÅbenOpgaveCSS.posteringRække}>
                                    <span className={ÅbenOpgaveCSS.posteringRækkeBeskrivelse}>Nattillæg </span>
                                    <span>{beregn.natTillægPris(postering, 2, visInklMoms).formateret}</span>
                                </div>
                            )}
                            {postering.trailer && postering.dynamiskPrisBeregning && (
                                <div className={ÅbenOpgaveCSS.posteringRække}>
                                    <span className={ÅbenOpgaveCSS.posteringRækkeBeskrivelse}>Trailer </span>
                                    <span>{beregn.trailerPris(postering, 2, visInklMoms).formateret}</span>
                                </div>
                            )}
                            {postering.udlæg.length > 0 && postering.dynamiskPrisBeregning && (
                                <div className={ÅbenOpgaveCSS.posteringRække}>
                                    <span className={ÅbenOpgaveCSS.posteringRækkeBeskrivelse}>{postering.udlæg.length > 0 ? postering.udlæg.length : 0} udlæg </span>
                                    <span>{beregn.udlægPris(postering, 2, visInklMoms).formateret}</span>
                                </div>
                            )}
                            {postering.rabatProcent > 0 && postering.dynamiskPrisBeregning && (
                                <div className={ÅbenOpgaveCSS.posteringRække}>
                                    <span className={ÅbenOpgaveCSS.posteringRækkeBeskrivelse}>{postering.rabatProcent}% rabat</span>
                                    <span>- {beregn.rabatPris(postering, 2, visInklMoms).formateret}</span>
                                </div>
                            )}
                            {!postering.dynamiskPrisBeregning && (
                                <div className={ÅbenOpgaveCSS.posteringRække}>
                                    <span className={ÅbenOpgaveCSS.posteringRækkeBeskrivelse}>Fast pris: </span>
                                    <span>{beregn.fastPris(postering, 2, visInklMoms).formateret}</span>
                                </div>
                            )}
                            <div className={ÅbenOpgaveCSS.totalRække}>
                                <b className={ÅbenOpgaveCSS.totalRækkeBeskrivelse}>Indtægt, total: </b>
                                <b className={ÅbenOpgaveCSS.totalRækkeResultat}>{beregn.totalPris(postering, 2, visInklMoms).formateret}</b>
                            </div>
                        </div>
                    </div>
                    <div className={`${ÅbenOpgaveCSS.posteringKnapper} ${honorarVisning && ÅbenOpgaveCSS.posteringKnapperFadeOut}`}>
                        <button className={ÅbenOpgaveCSS.posteringKnap} onClick={() => setHonorarVisning(!honorarVisning)}><img className={ÅbenOpgaveCSS.posteringSwitchKnap} src={SwitchArrows} />Indtægt</button>
                        <div>
                            {færdiggjort ? null : <button className={ÅbenOpgaveCSS.posteringKnap} onClick={() => {setOpenPosteringModalID(postering._id)}}>Rediger</button>}
                            {færdiggjort ? null : <button className={ÅbenOpgaveCSS.posteringKnap} onClick={() => {sletPostering(postering._id)}}>Slet</button>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <VisBilledeModal trigger={kvitteringBillede} setTrigger={setKvitteringBillede}/>
    </div>
  )
}

export default Postering
