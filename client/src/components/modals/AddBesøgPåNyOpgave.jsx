import React from 'react'
import ModalStyles from "../Modal.module.css"
import Styles from "./AddBesøg.module.css"
import { useState, useEffect } from 'react'
import Modal from "../Modal.jsx"
import { useTaskAndDate } from '../../context/TaskAndDateContext.jsx'
import dayjs from 'dayjs'
import { useAuthContext } from '../../hooks/useAuthContext'
import axios from 'axios'
import { useBesøg } from '../../context/BesøgContext.jsx'
import VælgOpgaveVedNytBesøg from '../tables/VælgOpgaveVedNytBesøg.jsx'
import NyOpgaveFraOpretBesøg from '../NyOpgaveFraOpretBesøg.jsx'
import SwitchArrows from "../../assets/switchArrowsBlack.svg"

const AddBesøgPåNyOpgave = (props) => {

    const { user } = useAuthContext();
    const { chosenDate, setChosenDate, chosenTask, chosenEndDate, setChosenEndDate } = useTaskAndDate();
    const { refetchBesøg, setRefetchBesøg } = useBesøg();

    const userID = user?.id || user?._id;

    const [opgaveTilknyttetBesøg, setopgaveTilknyttetBesøg] = useState(props.opgaveTilknyttetBesøg);
    const [tilknyttetAnsvarlig, setTilknyttetAnsvarlig] = useState(props.tilknyttetMedarbejder);
    const [selectedTimeFrom, setSelectedTimeFrom] = useState("08:00");
    const [selectedTimeTo, setSelectedTimeTo] = useState("12:00");
    const [comment, setComment] = useState("");
    const [opretBesøgError, setOpretBesøgError] = useState("");
    const [medarbejdere, setMedarbejdere] = useState([]);

    const resetState = () => {
        setopgaveTilknyttetBesøg(null);
        setTilknyttetAnsvarlig(null);
        setSelectedTimeFrom("08:00");
        setSelectedTimeTo("12:00");
        setComment("");
    }

    useEffect(() => {
        if (props.trigger) {
          // Blur any focused element to prevent keyboard from showing
          if (document.activeElement) {
            document.activeElement.blur();
          }
        }
      }, [props.trigger]);
    
    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API_URL}/brugere`, {
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        })
        .then(response => {
            setMedarbejdere(response.data)
        })
        .catch(error => {
            console.log(error)
        })
    }, [user])

    useEffect(() => {
        if(!user.isAdmin){
            setSelectedAnsvarlig(userID)
        }
    }, [user])
    
    useEffect(() => {
        if (props?.trigger?.action === "select") {
            setSelectedTimeFrom(dayjs(props.trigger.start).format("HH:mm"))
            setSelectedTimeTo(dayjs(props.trigger.end).format("HH:mm"))
        } else if (props?.trigger?.action === "ledigTidSelect") {
            const ansvarlig = medarbejdere ? medarbejdere.find(bruger => bruger._id === props.trigger.ansvarligID) : null;
            setTilknyttetAnsvarlig(ansvarlig)
            setChosenDate(dayjs(props.trigger.start).format("YYYY-MM-DD"))
            setSelectedTimeFrom(dayjs(props.trigger.start).format("HH:mm"))
            setSelectedTimeTo(dayjs(props.trigger.end).format("HH:mm"))
        } else {
            setSelectedTimeFrom("08:00")
            setSelectedTimeTo("12:00")
        }
    }, [props, medarbejdere])

    function opretBesøgsKladde(e){
        if (document.activeElement && document.activeElement.blur) {
            document.activeElement.blur();
          }
          
        e.preventDefault();
    
        const besøg = {
            datoTidFra: `${chosenDate ? dayjs(chosenDate).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD")}T${selectedTimeFrom}:00.000${dayjs().format("Z")}`,
            datoTidTil: `${chosenEndDate ? dayjs(chosenEndDate).format("YYYY-MM-DD") : chosenDate ? dayjs(chosenDate).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD")}T${selectedTimeTo}:00.000${dayjs().format("Z")}`,
            brugerID: tilknyttetAnsvarlig._id || tilknyttetAnsvarlig,
            opgaveID: "",
            kommentar: comment ? comment : ""
        }

        console.log(props)

        props.setBesøgPåOpgaven(besøg)
        props.setBekræftDetaljer(true)
        props.setTrigger(false)
    }

    return (
        <Modal trigger={props.trigger} setTrigger={props.setTrigger} onClose={() => {
            resetState()
        }}>
            <h2 className={ModalStyles.modalHeading}>Tilføj besøg for {props?.tilknyttetMedarbejder?.navn}</h2>
            <div className={Styles.modalSubheadingContainer}>
                <b style={{fontFamily: "OmnesBold"}}>Hos kunde:</b>
                <p>{props?.tilknyttetKunde?.fornavn + " " + props?.tilknyttetKunde?.efternavn || "..."}</p>
                <p>{props?.tilknyttetKunde?.adresse || "..."}</p>
                <p>{props?.tilknyttetKunde?.postnummerOgBy}</p>
            </div>
            {props.trigger.action === "ledigTidSelect" && <p className={Styles.modalSubheading}>for {props.trigger.ansvarligNavn}<br />ledig d. {dayjs(props.trigger.start).format("DD. MMMM")} fra kl. {dayjs(props.trigger.start).format("HH:mm")}-{dayjs(props.trigger.end).format("HH:mm")}</p>}
                {/* BESØGSDETALJER */}
                <div className={`${Styles.opretBesøgFraOverblikContainer} ${Styles.activeOpretBesøgFraOverblikContainer}`}>
                    <h3 className={Styles.subHeading}>Besøgsdetaljer:</h3>
                    <div style={{display: "flex", flexDirection: "column", gap: "10px"}}>
                        {chosenEndDate ? 
                        <div>
                            <div className={Styles.dateInputContainer}>
                                <div className={Styles.dateInput}> 
                                    <label className={Styles.modalLabel} htmlFor="besøg-dato">Dato, fra</label>
                                    <input className={Styles.modalInput} type="date" id="besøg-dato" value={chosenDate ? dayjs(chosenDate).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD")} onChange={(e) => setChosenDate(e.target.value)} />
                                </div>
                                <div className={Styles.timeSeparator}>–</div>
                                <div className={Styles.dateInput}> 
                                    <label className={Styles.modalLabel} htmlFor="besøg-dato">Dato, til</label>
                                    <input className={Styles.modalInput} type="date" id="besøg-dato" value={chosenEndDate ? dayjs(chosenEndDate).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD")} onChange={(e) => setChosenEndDate(e.target.value)} />
                                </div>
                            </div>
                        </div>
                        : 
                        <div className={Styles.dateInputContainer}>
                            <div className={Styles.dateInput}> 
                                <label className={Styles.modalLabel} htmlFor="besøg-dato">Dato</label>
                                <input className={Styles.modalInput} type="date" id="besøg-dato" value={chosenDate ? dayjs(chosenDate).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD")} onChange={(e) => setChosenDate(e.target.value)} />
                            </div>
                            <button className={Styles.addEndDateButton} onClick={() => setChosenEndDate(dayjs(chosenDate).add(1, 'day').format("YYYY-MM-DD"))} type="button">+ Tilføj slutdato</button>
                        </div>}
                        {!chosenEndDate && <label className={ModalStyles.modalLabel} htmlFor="besøg-tid-fra">Tidspunkt</label>}
                        <div className={ModalStyles.timeInputs}>
                            <div className={ModalStyles.timeInput}>
                                {chosenEndDate && <label className={ModalStyles.modalLabel} htmlFor="besøg-tid-fra">Kl.</label>}
                                <input className={ModalStyles.modalInput} type="time" id="besøg-tid-fra" value={selectedTimeFrom} onChange={(e) => setSelectedTimeFrom(e.target.value)} />
                            </div>
                            {!chosenEndDate && <div className={ModalStyles.timeSeparator}>–</div>}
                            <div className={ModalStyles.timeInput}>
                                {chosenEndDate && <label className={ModalStyles.modalLabel} htmlFor="besøg-tid-til">Kl.</label>}
                                <input className={ModalStyles.modalInput} type="time" id="besøg-tid-til" value={selectedTimeTo} onChange={(e) => setSelectedTimeTo(e.target.value)} />
                            </div>
                        </div>
                        {chosenEndDate && <button className={Styles.removeEndDateButton} onClick={() => setChosenEndDate(null)} type="button">Fjern slutdato</button>}
                        <label className={ModalStyles.modalLabel} htmlFor="besøg-kommentar">Evt. kommentar til besøget</label>
                        <textarea className={ModalStyles.modalInput} id="besøg-kommentar" rows="3" value={comment} onChange={(e) => setComment(e.target.value)}></textarea>
                        <button className={ModalStyles.buttonFullWidth} type="button" style={{marginBottom: "0"}} onClick={opretBesøgsKladde}>Gå videre</button>
                        {opretBesøgError && <p className={ModalStyles.errorMessage}>{opretBesøgError}</p>}
                    </div>
                </div>
        </Modal>
    )
}

export default AddBesøgPåNyOpgave