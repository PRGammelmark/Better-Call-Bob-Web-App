import React, {useState, useEffect} from 'react'
import PosteringSatserModal from './modals/PosteringSatserModal';
import VisBilledeModal from './modals/VisBillede.jsx'
import RedigerPostering from './modals/RedigerPostering';
import RetPrissatsModal from './modals/RetPrissatsModal';
import RetLønsatsModal from './modals/RetLønsatsModal';
import Styles from './Postering.module.css'
import axios from 'axios';
import dayjs from 'dayjs';
import { storage } from '../firebase.js'
import { ref, deleteObject } from 'firebase/storage'
import * as beregn from '../utils/beregninger.js'
import PosteringMereKnap from './PosteringMereKnap.jsx'
import { Lock } from 'lucide-react';
import BetalViaMobilePayAnmodningModal from './modals/betalingsflows/BetalViaMobilePayAnmodningModal.jsx'
import BetalViaMobilePayQRModal from './modals/betalingsflows/BetalViaMobilePayQRModal.jsx'
import BetalViaFakturaModal from './modals/betalingsflows/BetalViaFakturaModal.jsx'
import VælgMobilePayBetalingsmetode from './modals/VælgMobilePayBetalingsmetode.jsx'
import SeBetalingerModal from './modals/SeBetalingerModal.jsx'
import RegistrerBetalingModal from './modals/betalingsflows/registrerBetalingModal.jsx'
import RegistrerOpkrævningModal from './modals/betalingsflows/registrerOpkrævningModal.jsx'
import SeOpkrævningerModal from './modals/SeOpkrævningerModal.jsx'

const Postering = ({ postering, brugere, user, posteringer, setPosteringer, færdiggjort, openPosteringModalID, setOpenPosteringModalID, visInklMoms }) => {

    const [openPosteringSatser, setOpenPosteringSatser] = useState(null)
    const [openRetPrissatsModalID, setOpenRetPrissatsModalID] = useState(null)
    const [openRetLønsatsModalID, setOpenRetLønsatsModalID] = useState(null)
    const [openSeBetalingerModal, setOpenSeBetalingerModal] = useState(false)
    const [openRegistrerBetalingModalID, setOpenRegistrerBetalingModalID] = useState(null)
    const [openRegistrerOpkrævningModalID, setOpenRegistrerOpkrævningModalID] = useState(null)
    const [openSeOpkrævningerModal, setOpenSeOpkrævningerModal] = useState(false)
    const [honorarVisning, setHonorarVisning] = useState(false)
    const [kvitteringBillede, setKvitteringBillede] = useState("")
    const [openMenuForPosteringID, setOpenMenuForPosteringID] = useState(null)
    const [openBetalViaMobilePayAnmodningModal, setOpenBetalViaMobilePayAnmodningModal] = useState(null)
    const [openBetalViaMobilePayScanQRModal, setOpenBetalViaMobilePayScanQRModal] = useState(false)
    const [openVælgMobilePayBetalingsmetodeModal, setOpenVælgMobilePayBetalingsmetodeModal] = useState(false)
    const [openBetalViaFakturaModal, setOpenBetalViaFakturaModal] = useState(false)

    const userID = user?.id || user?._id;

    const getBrugerName = (brugerID) => {
        const bruger = brugere && brugere.find(user => (user?._id || user?.id) === brugerID);
        return bruger ? bruger.navn : 'Ukendt medarbejder';
    };

    // 0 = postering ikke betalt
    // 1 = postering delvist betalt
    // 2 = postering helt betalt
    // 3 = faktura sendt

    let posteringBetalt = 0;
    const posteringTotalPris = postering.totalPris * 1.25;
    const betalingerSum = postering?.betalinger?.reduce((sum, betaling) => sum + betaling.betalingsbeløb, 0) || 0;
    if(betalingerSum > 0) {
        if(betalingerSum < posteringTotalPris) {
            posteringBetalt = 1;
        } else {
            posteringBetalt = 2;
        }
    } else {
        if(postering?.opkrævninger?.length > 0 && postering.opkrævninger.some(opkrævning => opkrævning.metode === 'faktura')) {
            posteringBetalt = 3;
        } else {
            posteringBetalt = 0;
        }
    }
      
    const posteringStatus = (statusNummer) => {
        if(statusNummer === 3) {
            return "Faktura sendt";
        } else if(statusNummer === 2) {
            return "Betalt";
        } else if(statusNummer === 1) {
            return "Delvist betalt";
        } else {
            return "Ikke opkrævet";
        }
    }

    const refetchPostering = async () => {
        try {
          const res = await axios.get(`${import.meta.env.VITE_API_URL}/posteringer/${postering._id}`, {
            headers: {
              'Authorization': `Bearer ${user.token}`
            }
          });
          const opdateret = res.data;
          setPosteringer(prev =>
            prev.map(p => p._id === postering._id ? opdateret : p)
          );
        } catch (err) {
          console.error("Kunne ikke hente postering:", err);
        }
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

    const vendPostering = () => {
        if(user?.isAdmin || user?.id === postering?.brugerID) {
            setHonorarVisning(!honorarVisning)
        }
        if(user?.isAdmin){
            console.log(postering)
        }
    }
    
  return (
      <div className={Styles.posteringDiv} key={postering._id} onClick={() => console.log(postering)}>
        <div className={Styles.posteringFlipContainer}>
            <div className={`${Styles.posteringFlipper} ${honorarVisning ? '' : Styles.flipped}`}>
                <div className={Styles.posteringFront}>
                <div className={`${Styles.posteringCard} ${Styles.posteringWrapper} ${(openMenuForPosteringID === postering._id && honorarVisning) ? Styles.blurred : ''}`} onClick={() => vendPostering()}>
                        <div className={`${Styles.betalingStatusPill} ${posteringBetalt === 2 ? Styles.betalt : Styles.ikkeBetalt} ${honorarVisning ? Styles.betalingStatusPillActive : ''}`}>
                            <p>{posteringStatus(posteringBetalt)}</p>
                        </div>
                        <div className={Styles.posteringFrontHeader}>
                            <p className={Styles.posteringDato}>{dayjs(postering?.dato).format('D. MMMM YYYY')}</p>
                            <p className={Styles.posteringBruger}>{postering?.bruger?.navn || "Ikke fundet"}</p>
                            <p className={Styles.posteringFrontHeaderBeskrivelse}>Medarbejder</p>
                        </div>
                        <div className={Styles.posteringContent}>
                            <i className={Styles.posteringBeskrivelse}>{postering.beskrivelse ? postering.beskrivelse : "Ingen beskrivelse."}</i>
                            <div className={Styles.kvitteringBillederListe}>
                                {postering.udlæg.map((udlæg, index) => {
                                    return udlæg.kvittering ? 
                                    <img 
                                    key={`udlæg-${index}`}
                                    className={Styles.kvitteringBillede} 
                                    src={udlæg.kvittering} 
                                    alt={udlæg.beskrivelse} 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setKvitteringBillede(udlæg.kvittering);
                                    }}/> 
                                    : 
                                    null;
                                })}
                            </div>
                            <div className={Styles.posteringListe}>
                                {postering.opstart > 0 && postering.dynamiskHonorarBeregning && (
                                    <div className={Styles.posteringRække}>
                                        <span className={Styles.posteringRækkeBeskrivelse}>Opstart </span>
                                        <span>{beregn.opstartHonorar(postering).formateret}</span>
                                    </div>
                                )}
                                {postering.handymanTimer > 0 && postering.dynamiskHonorarBeregning && (
                                    <div className={Styles.posteringRække}>
                                        <span className={Styles.posteringRækkeBeskrivelse}>{postering.handymanTimer || 0} timer (handyman) </span>
                                        <span>{beregn.handymanHonorar(postering).formateret}</span>
                                    </div>
                                )}
                                {postering.tømrerTimer > 0 && postering.dynamiskHonorarBeregning && (
                                    <div className={Styles.posteringRække}>
                                        <span className={Styles.posteringRækkeBeskrivelse}>{postering.tømrerTimer || 0} timer (tømrer) </span>
                                        <span>{beregn.tømrerHonorar(postering).formateret}</span>
                                    </div>
                                )}
                                {postering.rådgivningOpmålingVejledning > 0 && postering.dynamiskHonorarBeregning && (
                                    <div className={Styles.posteringRække}>
                                        <span className={Styles.posteringRækkeBeskrivelse}>{postering.rådgivningOpmålingVejledning || 0} timer (rådgivning) </span>
                                        <span>{beregn.rådgivningHonorar(postering).formateret}</span>
                                    </div>
                                )}
                                {postering.aftenTillæg && postering.dynamiskHonorarBeregning && (
                                    <div className={Styles.posteringRække}>
                                        <span className={Styles.posteringRækkeBeskrivelse}>Aftentillæg (+{postering.satser.aftenTillægHonorar}% pr. time) </span>
                                        <span>{beregn.aftenTillægHonorar(postering).formateret}</span>
                                    </div>
                                )}
                                {postering.natTillæg && postering.dynamiskHonorarBeregning && (
                                    <div className={Styles.posteringRække}>
                                        <span className={Styles.posteringRækkeBeskrivelse}>Nattillæg (+{postering.satser.natTillægHonorar}% pr. time) </span>
                                        <span>{beregn.natTillægHonorar(postering).formateret}</span>
                                    </div>
                                )}
                                {postering.trailer && postering.dynamiskHonorarBeregning && (
                                    <div className={Styles.posteringRække}>
                                        <span className={Styles.posteringRækkeBeskrivelse}>Trailer </span>
                                        <span>{beregn.trailerHonorar(postering).formateret}</span>
                                    </div>
                                )}
                                {postering.udlæg.length > 0 && postering.dynamiskHonorarBeregning && (
                                    <div className={Styles.posteringRække}>
                                        <span className={Styles.posteringRækkeBeskrivelse}>{postering.udlæg.length > 0 ? postering.udlæg.length : 0} udlæg </span>
                                        <span>{beregn.udlægHonorar(postering).formateret}</span>
                                    </div>
                                )}
                                {postering.rabatProcent > 0 && postering.dynamiskHonorarBeregning && (
                                    <div className={Styles.posteringRække}>
                                        <span className={Styles.posteringRækkeBeskrivelse}>{postering.rabatProcent}% rabat</span>
                                        <span>- {beregn.rabatHonorar(postering).formateret}</span>
                                    </div>
                                )}
                                {!postering.dynamiskHonorarBeregning && (
                                    <div className={Styles.posteringRække}>
                                        <span className={Styles.posteringRækkeBeskrivelse}>Fast honorar: </span>
                                        <span>{beregn.fastHonorar(postering).formateret}</span>
                                    </div>
                                )}
                                <div className={Styles.totalRække}>
                                    <b className={Styles.totalRækkeBeskrivelse}>Løn, total: </b>
                                    <b className={Styles.totalRækkeResultat}>{beregn.totalHonorar(postering).formateret}</b>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={`${Styles.posteringKnapper} ${!honorarVisning && Styles.posteringKnapperFadeOut}`}>
                        <Lock className={`${Styles.posteringLåstIcon} ${postering?.låst ? Styles.posteringLåstIconActive : ''}`}/>
                        <PosteringMereKnap user={user} userID={userID} postering={postering} setOpenMenuForPosteringID={setOpenMenuForPosteringID} openMenuForPosteringID={openMenuForPosteringID} sletPostering={sletPostering} setOpenPosteringModalID={setOpenPosteringModalID} setHonorarVisning={setHonorarVisning} honorarVisning={honorarVisning} setOpenPosteringSatser={setOpenPosteringSatser} refetchPostering={refetchPostering} setOpenRetPrissatsModalID={setOpenRetPrissatsModalID} setOpenRetLønsatsModalID={setOpenRetLønsatsModalID} setOpenRegistrerBetalingModalID={setOpenRegistrerBetalingModalID} setOpenRegistrerOpkrævningModalID={setOpenRegistrerOpkrævningModalID} setOpenBetalViaMobilePayAnmodningModal={setOpenBetalViaMobilePayAnmodningModal} setOpenBetalViaMobilePayScanQRModal={setOpenBetalViaMobilePayScanQRModal} setOpenVælgMobilePayBetalingsmetodeModal={setOpenVælgMobilePayBetalingsmetodeModal} posteringBetalt={posteringBetalt} setOpenSeBetalingerModal={setOpenSeBetalingerModal} setOpenBetalViaFakturaModal={setOpenBetalViaFakturaModal} setOpenSeOpkrævningerModal={setOpenSeOpkrævningerModal} />
                    </div>
                </div>
                
                <div className={`${Styles.posteringBack}`}>
                    <div className={`${Styles.posteringCard} ${Styles.posteringWrapper} ${(openMenuForPosteringID === postering._id && !honorarVisning) ? Styles.blurred : ''}`} onClick={() => vendPostering()}>
                        <div className={`${Styles.betalingStatusPill} ${posteringBetalt === 2 ? Styles.betalt : Styles.ikkeBetalt} ${honorarVisning ? '' : Styles.betalingStatusPillActive}`}>
                            <p>{posteringStatus(posteringBetalt)}</p>
                        </div>
                        <div className={Styles.posteringBackHeader}>
                            <p className={Styles.posteringDato}>{dayjs(postering?.dato).format('D. MMMM YYYY')}</p>
                            <p className={Styles.posteringBruger}>{postering?.kunde?.navn}</p>
                            <p className={Styles.posteringFrontHeaderBeskrivelse}>Kunde</p>
                        </div>
                        <div className={Styles.posteringContent}>
                            <i className={Styles.posteringBeskrivelse}>{postering.beskrivelse ? postering.beskrivelse : "Ingen beskrivelse."}</i>
                            <div className={Styles.kvitteringBillederListe}>
                                {postering.udlæg.map((udlæg, index) => {
                                    return udlæg.kvittering ? 
                                    <img 
                                    key={`udlæg-${index}`}
                                    className={Styles.kvitteringBillede} 
                                    src={udlæg.kvittering} 
                                    alt={udlæg.beskrivelse} 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setKvitteringBillede(udlæg.kvittering);
                                    }}/> 
                                    : 
                                    null;
                                })}
                            </div>
                            <div className={Styles.posteringListe}>
                                {postering.opstart > 0 && postering.dynamiskPrisBeregning && (
                                    <div className={Styles.posteringRække}>
                                        <span className={Styles.posteringRækkeBeskrivelse}>Opstart </span>
                                        <span>{beregn.opstartPris(postering, 2, visInklMoms).formateret}</span>
                                    </div>
                                )}
                                {postering.handymanTimer > 0 && postering.dynamiskPrisBeregning && (
                                    <div className={Styles.posteringRække}>
                                        <span className={Styles.posteringRækkeBeskrivelse}>{postering.handymanTimer || 0} timer (handyman) </span>
                                        <span>{beregn.handymanPris(postering, 2, visInklMoms).formateret}</span>
                                    </div>
                                )}
                                {postering.tømrerTimer > 0 && postering.dynamiskPrisBeregning && (
                                    <div className={Styles.posteringRække}>
                                        <span className={Styles.posteringRækkeBeskrivelse}>{postering.tømrerTimer || 0} timer (tømrer) </span>
                                        <span>{beregn.tømrerPris(postering, 2, visInklMoms).formateret}</span>
                                    </div>
                                )}
                                {postering.rådgivningOpmålingVejledning > 0 && postering.dynamiskPrisBeregning && (
                                    <div className={Styles.posteringRække}>
                                        <span className={Styles.posteringRækkeBeskrivelse}>{postering.rådgivningOpmålingVejledning || 0} timer (rådgivning) </span>
                                        <span>{beregn.rådgivningPris(postering, 2, visInklMoms).formateret}</span>
                                    </div>
                                )}
                                {postering.aftenTillæg && postering.dynamiskPrisBeregning && (
                                    <div className={Styles.posteringRække}>
                                        <span className={Styles.posteringRækkeBeskrivelse}>Aftentillæg </span>
                                        <span>{beregn.aftenTillægPris(postering, 2, visInklMoms).formateret}</span>
                                    </div>
                                )}
                                {postering.natTillæg && postering.dynamiskPrisBeregning && (
                                    <div className={Styles.posteringRække}>
                                        <span className={Styles.posteringRækkeBeskrivelse}>Nattillæg </span>
                                        <span>{beregn.natTillægPris(postering, 2, visInklMoms).formateret}</span>
                                    </div>
                                )}
                                {postering.trailer && postering.dynamiskPrisBeregning && (
                                    <div className={Styles.posteringRække}>
                                        <span className={Styles.posteringRækkeBeskrivelse}>Trailer </span>
                                        <span>{beregn.trailerPris(postering, 2, visInklMoms).formateret}</span>
                                    </div>
                                )}
                                {postering.udlæg.length > 0 && postering.dynamiskPrisBeregning && (
                                    <div className={Styles.posteringRække}>
                                        <span className={Styles.posteringRækkeBeskrivelse}>{postering.udlæg.length > 0 ? postering.udlæg.length : 0} udlæg </span>
                                        <span>{beregn.udlægPris(postering, 2, visInklMoms).formateret}</span>
                                    </div>
                                )}
                                {postering.rabatProcent > 0 && postering.dynamiskPrisBeregning && (
                                    <div className={Styles.posteringRække}>
                                        <span className={Styles.posteringRækkeBeskrivelse}>{postering.rabatProcent}% rabat</span>
                                        <span>- {beregn.rabatPris(postering, 2, visInklMoms).formateret}</span>
                                    </div>
                                )}
                                {!postering.dynamiskPrisBeregning && (
                                    <div className={Styles.posteringRække}>
                                        <span className={Styles.posteringRækkeBeskrivelse}>Fast pris: </span>
                                        <span>{beregn.fastPris(postering, 2, visInklMoms).formateret}</span>
                                    </div>
                                )}
                                <div className={Styles.totalRække}>
                                    <b className={Styles.totalRækkeBeskrivelse}>Pris, total: </b>
                                    <b className={Styles.totalRækkeResultat}>{beregn.totalPris(postering, 2, visInklMoms).formateret}</b>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={`${Styles.posteringKnapper} ${honorarVisning && Styles.posteringKnapperFadeOut}`}>
                        <Lock className={`${Styles.posteringLåstIcon} ${postering?.låst ? Styles.posteringLåstIconActive : ''}`}/>  
                        <PosteringMereKnap user={user} userID={userID} postering={postering} setOpenMenuForPosteringID={setOpenMenuForPosteringID} openMenuForPosteringID={openMenuForPosteringID} sletPostering={sletPostering} setOpenPosteringModalID={setOpenPosteringModalID} setHonorarVisning={setHonorarVisning} honorarVisning={honorarVisning} setOpenPosteringSatser={setOpenPosteringSatser} refetchPostering={refetchPostering} setOpenRetPrissatsModalID={setOpenRetPrissatsModalID} setOpenRetLønsatsModalID={setOpenRetLønsatsModalID} setOpenRegistrerBetalingModalID={setOpenRegistrerBetalingModalID} setOpenBetalViaMobilePayAnmodningModal={setOpenBetalViaMobilePayAnmodningModal} setOpenBetalViaMobilePayScanQRModal={setOpenBetalViaMobilePayScanQRModal} setOpenVælgMobilePayBetalingsmetodeModal={setOpenVælgMobilePayBetalingsmetodeModal} posteringBetalt={posteringBetalt} setOpenSeBetalingerModal={setOpenSeBetalingerModal} setOpenBetalViaFakturaModal={setOpenBetalViaFakturaModal} setOpenSeOpkrævningerModal={setOpenSeOpkrævningerModal} setOpenRegistrerOpkrævningModalID={setOpenRegistrerOpkrævningModalID}/>
                    </div>
                </div>
            </div>
        </div>
        <VisBilledeModal trigger={kvitteringBillede} setTrigger={setKvitteringBillede}/>
        <RedigerPostering trigger={openPosteringModalID === postering._id} setTrigger={setOpenPosteringModalID} postering={postering} refetchPostering={refetchPostering} />
        <PosteringSatserModal trigger={openPosteringSatser && openPosteringSatser._id === postering._id} setTrigger={setOpenPosteringSatser} postering={postering} brugere={brugere} />
        <RetPrissatsModal trigger={openRetPrissatsModalID === postering._id} setTrigger={setOpenRetPrissatsModalID} postering={postering} refetchPostering={refetchPostering} />
        <RetLønsatsModal trigger={openRetLønsatsModalID === postering._id} setTrigger={setOpenRetLønsatsModalID} postering={postering} refetchPostering={refetchPostering}/>
        <RegistrerBetalingModal trigger={openRegistrerBetalingModalID === postering._id} setTrigger={setOpenRegistrerBetalingModalID} postering={postering} refetchPostering={refetchPostering}/>
        <RegistrerOpkrævningModal trigger={openRegistrerOpkrævningModalID === postering._id} setTrigger={setOpenRegistrerOpkrævningModalID} postering={postering} refetchPostering={refetchPostering}/>
        <BetalViaMobilePayAnmodningModal trigger={openBetalViaMobilePayAnmodningModal?._id === postering._id} setTrigger={setOpenBetalViaMobilePayAnmodningModal} postering={postering} refetchPostering={refetchPostering}/>
        <BetalViaMobilePayQRModal trigger={openBetalViaMobilePayScanQRModal?._id === postering._id} setTrigger={setOpenBetalViaMobilePayScanQRModal} postering={postering} refetchPostering={refetchPostering}/>
        <BetalViaFakturaModal trigger={openBetalViaFakturaModal?._id === postering._id} setTrigger={setOpenBetalViaFakturaModal} postering={postering} refetchPostering={refetchPostering}/>
        <VælgMobilePayBetalingsmetode trigger={openVælgMobilePayBetalingsmetodeModal} setTrigger={setOpenVælgMobilePayBetalingsmetodeModal} postering={postering} setOpenBetalViaMobilePayAnmodningModal={setOpenBetalViaMobilePayAnmodningModal} setOpenBetalViaMobilePayScanQRModal={setOpenBetalViaMobilePayScanQRModal} />
        <SeBetalingerModal trigger={openSeBetalingerModal} setTrigger={setOpenSeBetalingerModal} postering={postering} refetchPostering={refetchPostering}/>
        <SeOpkrævningerModal trigger={openSeOpkrævningerModal} setTrigger={setOpenSeOpkrævningerModal} postering={postering} refetchPostering={refetchPostering} />
    </div>
  )
}

export default Postering
