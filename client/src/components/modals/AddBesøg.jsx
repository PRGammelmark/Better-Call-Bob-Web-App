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

const AddBesøg = (props) => {

    const { user } = useAuthContext();
    const { chosenDate, setChosenDate, chosenTask, chosenEndDate, setChosenEndDate } = useTaskAndDate();
    const { refetchBesøg, setRefetchBesøg } = useBesøg();
    const [isOnTaskPage, setIsOnTaskPage] = useState(false);
    const [opretOpgave, setOpretOpgave] = useState(false);
    const [oprettetOpgave, setOprettetOpgave] = useState(null);
    const [tilknytOpgave, setTilknytOpgave] = useState(false);
    const [tilknyttetOpgave, setTilknyttetOpgave] = useState(null);
    const [tilknytAnsvarlig, setTilknytAnsvarlig] = useState(false);
    const [tilknyttetAnsvarlig, setTilknyttetAnsvarlig] = useState(null);
    const [isOnDocumentsPage, setIsOnDocumentsPage] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedAnsvarlig, setSelectedAnsvarlig] = useState(chosenTask && chosenTask.ansvarlig && chosenTask.ansvarlig.length > 0 && chosenTask.ansvarlig[0]._id || user.id);
    const [selectedTimeFrom, setSelectedTimeFrom] = useState("08:00");
    const [selectedTimeTo, setSelectedTimeTo] = useState("09:00");
    const [comment, setComment] = useState("");
    const [opretBesøgError, setOpretBesøgError] = useState("");
    const [selectedWeekday, setSelectedWeekday] = useState("1");
    const [regelmæssigLedighedDatoFra, setRegelmæssigLedighedDatoFra] = useState("");
    const [weekdays, setWeekdays] = useState([]);
    const [opgaver, setOpgaver] = useState(null);
    const [opgaverLoading, setOpgaverLoading] = useState(true);
    const [opgaveID, setOpgaveID] = useState(null);
    const [opgaveOprettet, setOpgaveOprettet] = useState(false);
    const [vælgAnsvarligBlandtAlleMedarbejdere, setVælgAnsvarligBlandtAlleMedarbejdere] = useState(false);
    const [medarbejdere, setMedarbejdere] = useState([]);

    const resetState = () => {
        setOpretOpgave(false);
        setOprettetOpgave(null);
        setTilknytOpgave(false);
        setTilknyttetOpgave(null);
        setTilknytAnsvarlig(false);
        setTilknyttetAnsvarlig(null);
    }

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
        if (props.trigger.action === "select") {
            setSelectedTimeFrom(dayjs(props.trigger.start).format("HH:mm"))
            setSelectedTimeTo(dayjs(props.trigger.end).format("HH:mm"))
        } else {
            setSelectedTimeFrom("08:00")
            setSelectedTimeTo("12:00")
        }
    }, [props.trigger])

    useEffect(()=>{
        axios.get(`${import.meta.env.VITE_API_URL}/opgaver`, {
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        })
        .then(response => {
          const ufærdigeOpgaverUdenAnsvarlige = response.data.filter(opgave => opgave.markeretSomFærdig === false && !opgave.isDeleted)
          setOpgaver(ufærdigeOpgaverUdenAnsvarlige);
          setOpgaverLoading(false)
        })
        .catch(error => {
          console.error(error)
        })
      }, [user])
    
    useEffect(() => {
        setIsOnTaskPage(window.location.pathname.includes("/opgave/"));
        setIsOnDocumentsPage(window.location.pathname.includes("/dokumenter"));
    }, [window.location.pathname]);

    useEffect(() => {
        let currentDate = dayjs() || regelmæssigLedighedDatoFra;
        const endDate = chosenDate && dayjs(chosenDate).format("YYYY-MM-DD");
        const ugedage = [];

        while (currentDate.isBefore(endDate) || currentDate.isSame(endDate, 'day')) {
            if (currentDate.day() === Number(selectedWeekday)) {
                ugedage.push(currentDate.format("YYYY-MM-DD"));
            }
            currentDate = currentDate.add(1, 'day');
        }
        setWeekdays(ugedage);
    }, [regelmæssigLedighedDatoFra, chosenDate, selectedWeekday])

    function submitNewBesøgFromOverblikPage(e){
        e.preventDefault();
        
        const besøg = {
            datoTidFra: `${chosenDate ? dayjs(chosenDate).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD")}T${selectedTimeFrom}:00.000`,
            datoTidTil: `${chosenEndDate ? dayjs(chosenEndDate).format("YYYY-MM-DD") : chosenDate ? dayjs(chosenDate).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD")}T${selectedTimeTo}:00.000`,
            brugerID: tilknyttetAnsvarlig._id,
            opgaveID: tilknyttetOpgave._id,
            kommentar: comment ? comment : ""
        }

        if (besøg.datoTidFra >= besøg.datoTidTil) {
            setOpretBesøgError("Fra-tidspunktet skal være tidligere end til-tidspunktet.")
            setTimeout(() => {
                setOpretBesøgError("")
            }, 5000)
            return
        }

        const nyAnsvarlig = tilknyttetOpgave.ansvarlig.find(medarbejder => medarbejder._id === besøg.brugerID);
        const eksisterendeAnsvarlig = tilknyttetOpgave.ansvarlig.find(medarbejder => medarbejder._id === besøg.brugerID);

        if (!eksisterendeAnsvarlig) {
            axios.patch(`${import.meta.env.VITE_API_URL}/opgaver/${tilknyttetOpgave._id}`, {
                ansvarlig: [...tilknyttetOpgave.ansvarlig, tilknyttetAnsvarlig]
            }, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            })
            .then(res => {
                console.log("Tilknyttet ny ansvarlig til opgaven.")
                console.log(res)
            })
            .catch(error => {
                console.log(error)
            })
        }
        
        axios.post(`${import.meta.env.VITE_API_URL}/besoeg`, besøg, {
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        })
        .then(res => {
            refetchBesøg ? setRefetchBesøg(false) : setRefetchBesøg(true)

            // ===== SEND EMAIL-NOTIFIKATION TIL MEDABEJDER, DER HAR ANSVAR FOR BESØGET =====
            if (besøg.brugerID !== user.id) {
                axios.post(`${import.meta.env.VITE_API_URL}/send-email`, {
                    to: nyAnsvarlig.email,
                    subject: `Du har fået et nyt besøg d. ${dayjs(besøg.datoTidFra).format("DD/MM")} kl. ${dayjs(besøg.datoTidFra).format("HH:mm")}-${dayjs(besøg.datoTidTil).format("HH:mm")}`,
                    html: `<p><b>Hej ${nyAnsvarlig.navn.split(' ')[0]},</b></p>
                        <p>Du er blevet booket til et nyt besøg på en opgave for Better Call Bob. Besøget er på:</p>
                        <p style="font-size: 1.2rem"><b>${chosenTask.adresse}, ${chosenTask.postnummerOgBy}</b><br/><span style="font-size: 1rem">${dayjs(besøg.datoTidFra).format("dddd [d.] DD. MMMM")} kl. ${dayjs(besøg.datoTidFra).format("HH:mm")}-${dayjs(besøg.datoTidTil).format("HH:mm")}</span></p>
                        <hr style="border: none; border-top: 1px solid #3c5a3f; margin: 20px 0;" />
                        <p><b>Overordnet opgavebeskrivelse:</b><br />${chosenTask.opgaveBeskrivelse}</p>
                        <p><b>Kommentar til besøget:</b><br />${besøg.kommentar ? besøg.kommentar : "Ingen kommentar til besøget."}</p>
                        <p><b>Kundens navn:</b><br />${chosenTask.navn}</p>
                        <hr style="border: none; border-top: 1px solid #3c5a3f; margin: 20px 0;" />
                        <p><a href="https://app.bettercallbob.dk">Åbn Better Call Bob-app'en</a> for at se flere detaljer.</p>
                        <p>Dbh.,<br/><b>Better Call Bob</b><br/>Tlf.: <a href="tel:71994848">71 99 48 48</a><br/>Web: <a href="https://bettercallbob.dk">https://bettercallbob.dk</a><br /><a href="https://app.bettercallbob.dk"><img src="https://bettercallbob.dk/wp-content/uploads/2024/01/Better-Call-Bob-logo-v2-1.svg" alt="BCB Logo" style="width: 200px; height: auto; display: flex; justify-content: flex-start; padding: 10px 20px 20px 20px; cursor: pointer; border-radius: 10px; margin-top: 20px; box-shadow: rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px;" /></a> <span style="color: #fff">.</span></p>`,
                    }, {
                        headers: {
                            'Authorization': `Bearer ${user.token}`
                        }
                    }
                )
                .then(response => {
                    console.log("Email-notifikation sendt til medarbejderen.");
                })
                .catch(error => {
                    console.log("Fejl: Kunne ikke sende email-notifikation til medarbejderen.");
                    console.log(error);
                })
            }
        })
        .catch(error => console.log(error))

        setChosenEndDate(null)
        props.setTrigger(false)
    }
    
    function submitNewBesøgFromTaskPage(e){
        e.preventDefault();
        
        const besøg = {
            datoTidFra: `${chosenDate ? dayjs(chosenDate).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD")}T${selectedTimeFrom}:00.000`,
            datoTidTil: `${chosenEndDate ? dayjs(chosenEndDate).format("YYYY-MM-DD") : chosenDate ? dayjs(chosenDate).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD")}T${selectedTimeTo}:00.000`,
            brugerID: selectedAnsvarlig,
            opgaveID: chosenTask._id,
            kommentar: comment ? comment : ""
        }

        if (besøg.datoTidFra >= besøg.datoTidTil) {
            setOpretBesøgError("Fra-tidspunktet skal være tidligere end til-tidspunktet.")
            setTimeout(() => {
                setOpretBesøgError("")
            }, 5000)
            return
        }

        const nyAnsvarlig = chosenTask.ansvarlig.find(medarbejder => medarbejder._id === besøg.brugerID);
        
        axios.post(`${import.meta.env.VITE_API_URL}/besoeg`, besøg, {
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        })
        .then(res => {
            refetchBesøg ? setRefetchBesøg(false) : setRefetchBesøg(true)

            // ===== SEND EMAIL-NOTIFIKATION TIL MEDABEJDER, DER HAR ANSVAR FOR BESØGET =====
            if (besøg.brugerID !== user.id) {
                axios.post(`${import.meta.env.VITE_API_URL}/send-email`, {
                    to: nyAnsvarlig.email,
                    subject: `Du har fået et nyt besøg d. ${dayjs(besøg.datoTidFra).format("DD/MM")} kl. ${dayjs(besøg.datoTidFra).format("HH:mm")}-${dayjs(besøg.datoTidTil).format("HH:mm")}`,
                    html: `<p><b>Hej ${nyAnsvarlig.navn.split(' ')[0]},</b></p>
                        <p>Du er blevet booket til et nyt besøg på en opgave for Better Call Bob. Besøget er på:</p>
                        <p style="font-size: 1.2rem"><b>${chosenTask.adresse}, ${chosenTask.postnummerOgBy}</b><br/><span style="font-size: 1rem">${dayjs(besøg.datoTidFra).format("dddd [d.] DD. MMMM")} kl. ${dayjs(besøg.datoTidFra).format("HH:mm")}-${dayjs(besøg.datoTidTil).format("HH:mm")}</span></p>
                        <hr style="border: none; border-top: 1px solid #3c5a3f; margin: 20px 0;" />
                        <p><b>Overordnet opgavebeskrivelse:</b><br />${chosenTask.opgaveBeskrivelse}</p>
                        <p><b>Kommentar til besøget:</b><br />${besøg.kommentar ? besøg.kommentar : "Ingen kommentar til besøget."}</p>
                        <p><b>Kundens navn:</b><br />${chosenTask.navn}</p>
                        <hr style="border: none; border-top: 1px solid #3c5a3f; margin: 20px 0;" />
                        <p><a href="https://app.bettercallbob.dk">Åbn Better Call Bob-app'en</a> for at se flere detaljer.</p>
                        <p>Dbh.,<br/><b>Better Call Bob</b><br/>Tlf.: <a href="tel:71994848">71 99 48 48</a><br/>Web: <a href="https://bettercallbob.dk">https://bettercallbob.dk</a><br /><a href="https://app.bettercallbob.dk"><img src="https://bettercallbob.dk/wp-content/uploads/2024/01/Better-Call-Bob-logo-v2-1.svg" alt="BCB Logo" style="width: 200px; height: auto; display: flex; justify-content: flex-start; padding: 10px 20px 20px 20px; cursor: pointer; border-radius: 10px; margin-top: 20px; box-shadow: rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px;" /></a> <span style="color: #fff">.</span></p>`,
                    }, {
                        headers: {
                            'Authorization': `Bearer ${user.token}`
                        }
                    }
                )
                .then(response => {
                    console.log("Email-notifikation sendt til medarbejderen.");
                })
                .catch(error => {
                    console.log("Fejl: Kunne ikke sende email-notifikation til medarbejderen.");
                    console.log(error);
                })
            }
        })
        .catch(error => console.log(error))

        setChosenEndDate(null)
        props.setTrigger(false)
    }

    const calculateTableHeight = (opgaver) => {
        const estimatedHeight = (opgaver ? opgaver.length * 50 : 0) + 100;
        return estimatedHeight;
    }

    const maxHeightStyle = {
        maxHeight: calculateTableHeight(opgaver) + "px"
    }

    return (
        <Modal trigger={props.trigger} setTrigger={props.setTrigger} onClose={() => {
            resetState()
        }}>
            <h2 className={ModalStyles.modalHeading}>Tilføj besøg</h2>
            {user.isAdmin && !isOnTaskPage && !(tilknyttetAnsvarlig && tilknyttetOpgave) && (
                    <div className={Styles.modalButtonFlexContainer}>
                        <button className={`${Styles.stateButton} ${opretOpgave ? Styles.activeStateButton : ""}`} onClick={() => {setOpretOpgave(true); setTilknytOpgave(false); setTilknyttetOpgave(null)}}>Ny opgave</button>
                        <button className={`${Styles.stateButton} ${tilknytOpgave ? Styles.activeStateButton : ""}`} onClick={() => {setOpretOpgave(false); setTilknytOpgave(true); setTilknyttetAnsvarlig("")}}>Eksisterende opgave</button>
                    </div>
                )}
                
                {/* INFORMATIONS-CONTAINER VED EKSISTERENDE OPGAVE */}
                <div className={`${Styles.infoContainer} ${(tilknyttetAnsvarlig && tilknyttetOpgave) ? Styles.activeInfoContainer : ""}`}>
                    {opgaveOprettet && <p className={Styles.infoSuccessMessage}>Opgave oprettet! 🥳 </p>}
                    {(tilknyttetAnsvarlig && tilknyttetOpgave) && <p>Tilføjer besøg for <b style={{fontFamily: "OmnesBold"}}>{tilknyttetAnsvarlig.navn}</b><br /> på opgave på <b style={{fontFamily: "OmnesBold"}}>{tilknyttetOpgave.adresse}</b><br />tilknyttet kunde <b style={{fontFamily: "OmnesBold"}}>{tilknyttetOpgave.navn}</b>.</p>}
                </div>

                {/* NY OPGAVE, TRIN 1: OPRET OPGAVE */}
                <div className={`${Styles.opretOpgaveContainer} ${opretOpgave && !(tilknyttetOpgave && tilknyttetAnsvarlig) ? Styles.activeOpretOpgaveContainer : ""}`}>
                    <NyOpgaveFraOpretBesøg setTilknyttetOpgave={setTilknyttetOpgave} setTilknyttetAnsvarlig={setTilknyttetAnsvarlig} setOpgaveOprettet={setOpgaveOprettet} />
                </div>
                
                {/* VÆLG OPGAVE, TRIN 1: VÆLG OPGAVE */}
                <div className={`${Styles.vælgOpgaveContainer} ${(tilknytOpgave && !(tilknyttetAnsvarlig && tilknyttetOpgave)) ? Styles.activeVælgOpgaveContainer : ""}`} style={(tilknytOpgave && !(tilknyttetAnsvarlig && tilknyttetOpgave)) ? maxHeightStyle : {}}>
                    <VælgOpgaveVedNytBesøg tilknyttetOpgave={tilknyttetOpgave} setTilknyttetOpgave={setTilknyttetOpgave} opgaver={opgaver} opgaverLoading={opgaverLoading} setTilknyttetAnsvarlig={setTilknyttetAnsvarlig}/>
                </div>
                {/* VÆLG OPGAVE, TRIN 2: VÆLG ANSVARLIG */}
                <div className={`${Styles.vælgAnsvarligContainer} ${(tilknyttetOpgave && !(tilknyttetAnsvarlig && tilknyttetOpgave)) ? Styles.activeVælgAnsvarligContainer : ""}`} >
                    <h3 className={Styles.subHeading}>Vælg blandt {vælgAnsvarligBlandtAlleMedarbejdere ? "alle medarbejdere" : "ansvarlige"}:</h3>
                    <div className={Styles.vælgAnsvarligFlexContainer}>
                        {!vælgAnsvarligBlandtAlleMedarbejdere && <select className={ModalStyles.modalInput} id="ansvarlige" value={tilknyttetAnsvarlig} style={{cursor: "pointer"}} onChange={(e) => {setTilknyttetAnsvarlig(JSON.parse(e.target.value))}}>
                            <option value="" disabled hidden selected>Vælg ansvarlig ...</option>
                            {tilknyttetOpgave && tilknyttetOpgave.ansvarlig && tilknyttetOpgave.ansvarlig.length > 0 ? (
                                tilknyttetOpgave.ansvarlig.map((ansvarlig, index) => (
                                    <option key={index} value={JSON.stringify(ansvarlig)}>{ansvarlig.navn}</option>
                                ))
                            ) : (
                                <option value="">Ingen ansvarlige</option>
                                )}
                        </select>}
                        {vælgAnsvarligBlandtAlleMedarbejdere && <select className={ModalStyles.modalInput} id="ansvarlige" value={tilknyttetAnsvarlig} style={{cursor: "pointer"}} onChange={(e) => {setTilknyttetAnsvarlig(JSON.parse(e.target.value))}}>
                            <option value="" disabled hidden selected>Vælg ansvarlig ...</option>
                            {medarbejdere && (
                                medarbejdere.map((ansvarlig, index) => (
                                    <option key={index} value={JSON.stringify(ansvarlig)}>{ansvarlig.navn}</option>
                                ))
                            )}
                        </select>}
                        {!vælgAnsvarligBlandtAlleMedarbejdere && <button className={Styles.ansvarligeStateButton} onClick={() => setVælgAnsvarligBlandtAlleMedarbejdere(true)}>Ansvarlige <img src={SwitchArrows} alt="Switch arrows" /></button>}
                        {vælgAnsvarligBlandtAlleMedarbejdere && <button className={Styles.ansvarligeStateButton} onClick={() => setVælgAnsvarligBlandtAlleMedarbejdere(false)}>Alle <img src={SwitchArrows} alt="Switch arrows" /></button>}
                    </div>
                    
                </div>
                <div className={`${Styles.opretBesøgFraOverblikContainer} ${tilknyttetAnsvarlig ? Styles.activeOpretBesøgFraOverblikContainer : ""}`}>
                    <h3 className={Styles.subHeading}>Besøgsdetaljer:</h3>
                    <form action="" onSubmit={submitNewBesøgFromOverblikPage} style={{display: "flex", flexDirection: "column", gap: "10px"}}>
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
                        <button className={ModalStyles.buttonFullWidth} style={{marginBottom: "0"}}>Tilføj besøg</button>
                        {opretBesøgError && <p className={ModalStyles.errorMessage}>{opretBesøgError}</p>}
                    </form>
                </div>
            
            
            {isOnTaskPage && <div className={ModalStyles.modalSubheadingContainer}>
                <label className={ModalStyles.modalLabel}>Kundeinformationer</label>
                <h3 className={ModalStyles.modalSubheading}>{chosenTask ? chosenTask.navn : "Ingen person"}</h3>
                <h3 className={ModalStyles.modalSubheading}>{chosenTask ? chosenTask.adresse : "Ingen adresse"}</h3>
            </div>}
            {isOnTaskPage && <form action="" onSubmit={submitNewBesøgFromTaskPage} style={{display: "flex", flexDirection: "column", gap: "10px"}}>
                {user.isAdmin && isOnTaskPage && (
                    <>
                    <label className={ModalStyles.modalLabel} htmlFor="ansvarlige">Vælg medarbejder</label>
                    <select className={ModalStyles.modalInput} id="ansvarlige" value={selectedAnsvarlig} onChange={(e) => {setSelectedAnsvarlig(e.target.value)}}>
                        {chosenTask && chosenTask.ansvarlig && chosenTask.ansvarlig.length > 0 ? (
                            chosenTask.ansvarlig.map((ansvarlig, index) => (
                                <option key={index} value={ansvarlig._id}>{ansvarlig.navn}</option>
                            ))
                        ) : (
                            <option value="">Ingen ansvarlige</option>
                            )}
                        </select>
                    </>
                )}
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
                <button className={ModalStyles.buttonFullWidth}>Tilføj besøg</button>
                {opretBesøgError && <p className={ModalStyles.errorMessage}>{opretBesøgError}</p>}
            </form>}
        </Modal>
    )
}

export default AddBesøg