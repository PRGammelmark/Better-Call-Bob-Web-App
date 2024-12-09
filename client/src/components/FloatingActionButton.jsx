import React from 'react'
import FloatingActionButtonCSS from "./FloatingActionButton.module.css"
import ModalStyles from "./Modal.module.css"
import AddNewIcon from "../assets/add-new.svg"
import AddNewBesøgIcon from "../assets/add-besøg.svg"
import AddNewDocumentIcon from "../assets/add-document.svg"
import UploadDokumentModal from './modals/UploadDokumentModal.jsx'
import { useState, useEffect } from 'react'
import { useNavigate } from "react-router-dom"
import Modal from "./Modal.jsx"
import { useTaskAndDate } from '../context/TaskAndDateContext.jsx'
import dayjs from 'dayjs'
import { useAuthContext } from '../hooks/useAuthContext'
import axios from 'axios'
import { useBesøg } from '../context/BesøgContext.jsx'

const FloatingActionButton = () => {

    const { user } = useAuthContext();
    const { chosenDate, setChosenDate, chosenTask } = useTaskAndDate();
    const { refetchBesøg, setRefetchBesøg, refetchLedigeTider, setRefetchLedigeTider, egneLedigeTider, medarbejdere } = useBesøg();
    const [menuOpen, setMenuOpen] = useState(false);
    const [isOnTaskPage, setIsOnTaskPage] = useState(false);
    const [isOnDocumentsPage, setIsOnDocumentsPage] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [åbnUploadDokumentModal, setÅbnUploadDokumentModal] = useState(false);
    const [selectedAnsvarlig, setSelectedAnsvarlig] = useState(chosenTask && chosenTask.ansvarlig && chosenTask.ansvarlig.length > 0 && chosenTask.ansvarlig[0]._id || user.id);
    const [selectedAnsvarligColor, setSelectedAnsvarligColor] = useState(""); 
    const [selectedTimeFrom, setSelectedTimeFrom] = useState("08:00");
    const [selectedTimeTo, setSelectedTimeTo] = useState("09:00");
    const [comment, setComment] = useState("");
    const [opretBesøgError, setOpretBesøgError] = useState("");
    const [opretLedighedError, setOpretLedighedError] = useState("");
    const [opretLedighedSuccess, setOpretLedighedSuccess] = useState(false);
    const [addLedighed, setAddLedighed] = useState(false);
    const [tilføjRegelmæssigLedighed, setTilføjRegelmæssigLedighed] = useState(false);
    const [selectedWeekday, setSelectedWeekday] = useState("1");
    const [regelmæssigLedighedDatoFra, setRegelmæssigLedighedDatoFra] = useState("");
    const [weekdays, setWeekdays] = useState([]);
    const navigate = useNavigate();

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

    function toggleMenu(){
        menuOpen ? setMenuOpen(false) : setMenuOpen(true);
    }

    function addNewBesøg(){
        setModalOpen(true);
    }

    function redirectCreateTask() {
        setMenuOpen(false)
        navigate("ny-opgave")
    }

    function redirectCreateUser() {
        setMenuOpen(false)
        navigate("ny-bruger")
    }

    function submitNewBesøg(e){
        e.preventDefault();
        
        const besøg = {
            datoTidFra: `${chosenDate ? dayjs(chosenDate).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD")}T${selectedTimeFrom}:00.000`,
            datoTidTil: `${chosenDate ? dayjs(chosenDate).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD")}T${selectedTimeTo}:00.000`,
            brugerID: selectedAnsvarlig,
            opgaveID: chosenTask._id,
            kommentar: comment ? comment : ""
        }

        if (besøg.datoTidFra >= besøg.datoTidTil) {
            setOpretBesøgError("'Fra kl.' skal være før 'Til kl.'.")
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

        setModalOpen(false);
    }

    function tilføjLedighedFunction(){
        setAddLedighed(true);
        setMenuOpen(false);
    }

    function submitNewRegelmæssigLedighed(e){
        e.preventDefault();

        const tidFra = "T" + selectedTimeFrom + ":00.000";
        const tidTil = "T" + selectedTimeTo + ":00.000";

        const ledighedsDage = weekdays.map(day => ({
            datoTidFra: `${day}${tidFra}`,
            datoTidTil: `${day}${tidTil}`,
            brugerID: user.id,
            kommentar: selectedTimeFrom + " - " + selectedTimeTo,
            objectIsLedigTid: true
        }));

        if (ledighedsDage.length === 0) {
            setOpretLedighedError("Ingen dage valgt.")
            setTimeout(() => {
                setOpretLedighedError("")
            }, 5000)
            return
        }

        if (selectedTimeFrom >= selectedTimeTo) {
            setOpretLedighedError("'Fra kl.' skal være før 'Til kl.'.")
            setTimeout(() => {
                setOpretLedighedError("")
            }, 5000)
            return
        }

        const tempEgneLedigeTider = egneLedigeTider;

        ledighedsDage.forEach(ledigTid => {
            const overlappingTider = tempEgneLedigeTider.filter(tid => 
                (dayjs(ledigTid.datoTidFra).isBefore(dayjs(tid.datoTidTil)) && dayjs(ledigTid.datoTidTil).isAfter(dayjs(tid.datoTidFra)))
            );

            if (overlappingTider.length > 0) {
                const minDatoTidFra = dayjs.min(overlappingTider.map(tid => dayjs(tid.datoTidFra)));
                const maxDatoTidTil = dayjs.max(overlappingTider.map(tid => dayjs(tid.datoTidTil)));

                if (dayjs(ledigTid.datoTidFra).isAfter(minDatoTidFra)) {
                    ledigTid.datoTidFra = minDatoTidFra.format("YYYY-MM-DDTHH:mm:ss.SSS");
                }

                if (dayjs(ledigTid.datoTidTil).isBefore(maxDatoTidTil)) {
                    ledigTid.datoTidTil = maxDatoTidTil.format("YYYY-MM-DDTHH:mm:ss.SSS");
                }

                overlappingTider.forEach(tid => {
                        axios.delete(`${import.meta.env.VITE_API_URL}/ledige-tider/${tid._id}`, {
                            headers: {
                                'Authorization': `Bearer ${user.token}`
                            }
                        })
                        .then(res => {
                            console.log("Overlapping ledig tid slettet", res.data)
                        })
                        .catch(error => console.log(error))
                });
            }
        });
        
        axios.post(`${import.meta.env.VITE_API_URL}/ledige-tider`, ledighedsDage, {
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        })
        .then(res => {
            refetchLedigeTider ? setRefetchLedigeTider(false) : setRefetchLedigeTider(true)
            setOpretLedighedSuccess("Ledighed tilføjet!")
            setTimeout(() => {
                setOpretLedighedSuccess("")
            }, 5000)
            
        })
        .catch(error => console.log(error))

        setModalOpen(false);
    }

    function submitNewEnkeltLedighed(e){
        e.preventDefault();

        const enkeltLedighed = {
            datoTidFra: `${chosenDate ? dayjs(chosenDate).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD")}T${selectedTimeFrom}:00.000`,
            datoTidTil: `${chosenDate ? dayjs(chosenDate).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD")}T${selectedTimeTo}:00.000`,
            brugerID: user.id,
            kommentar: selectedTimeFrom + " - " + selectedTimeTo,
            objectIsLedigTid: true
        }

        if (selectedTimeFrom >= selectedTimeTo) {
            setOpretLedighedError("'Fra kl.' skal være før 'Til kl.'.")
            setTimeout(() => {
                setOpretLedighedError("")
            }, 5000)
            return
        }

        const tempEgneLedigeTider = egneLedigeTider;

        const overlappingTider = tempEgneLedigeTider.filter(tid => 
            (dayjs(enkeltLedighed.datoTidFra).isBefore(dayjs(tid.datoTidTil)) && dayjs(enkeltLedighed.datoTidTil).isAfter(dayjs(tid.datoTidFra)))
        );

        if (overlappingTider.length > 0) {
            const minDatoTidFra = dayjs.min(overlappingTider.map(tid => dayjs(tid.datoTidFra)));
                       const maxDatoTidTil = dayjs.max(overlappingTider.map(tid => dayjs(tid.datoTidTil)));

                       if (dayjs(enkeltLedighed.datoTidFra).isAfter(minDatoTidFra)) {
                enkeltLedighed.datoTidFra = minDatoTidFra.format("YYYY-MM-DDTHH:mm:ss.SSS");
            }

            if (dayjs(enkeltLedighed.datoTidTil).isBefore(maxDatoTidTil)) {
                enkeltLedighed.datoTidTil = maxDatoTidTil.format("YYYY-MM-DDTHH:mm:ss.SSS");
            }

            overlappingTider.forEach(tid => {
                    axios.delete(`${import.meta.env.VITE_API_URL}/ledige-tider/${tid._id}`, {
                        headers: {
                            'Authorization': `Bearer ${user.token}`
                        }
                    })
                    .then(res => {
                        console.log("Overlapping ledig tid slettet", res.data)
                    })
                    .catch(error => console.log(error))
            });
        }

        axios.post(`${import.meta.env.VITE_API_URL}/ledige-tider`, enkeltLedighed, {
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        })
        .then(res => {
            refetchLedigeTider ? setRefetchLedigeTider(false) : setRefetchLedigeTider(true)
            setOpretLedighedSuccess("Ledighed tilføjet!")
            setTimeout(() => {
                setOpretLedighedSuccess("")
            }, 5000)
        })
        .catch(error => console.log(error))
    }

    function addNewDocument(){
        setÅbnUploadDokumentModal(true)
    }


  return (
    <>
        {user.isAdmin && <div className={FloatingActionButtonCSS.floatingActionButton} onClick={isOnTaskPage ? addNewBesøg : (isOnDocumentsPage ? addNewDocument : toggleMenu)}>
            <img src={isOnTaskPage ? AddNewBesøgIcon : isOnDocumentsPage ? AddNewDocumentIcon : AddNewIcon} draggable="false" alt="" className={FloatingActionButtonCSS.addNewIcon} style={isOnTaskPage ? {} : isOnDocumentsPage ? {} : {transform: menuOpen ? "rotate(0deg) scale(0.8)" : "rotate(135deg) scale(1)"}}/>
        </div>}
        {!user.isAdmin && !isOnDocumentsPage && <div className={FloatingActionButtonCSS.floatingActionButton} onClick={isOnTaskPage ? addNewBesøg : toggleMenu}>
            <img src={isOnTaskPage ? AddNewBesøgIcon : isOnDocumentsPage ? AddNewDocumentIcon : AddNewIcon} draggable="false" alt="" className={FloatingActionButtonCSS.addNewIcon} style={isOnTaskPage ? {} : isOnDocumentsPage ? {} : {transform: menuOpen ? "rotate(0deg) scale(0.8)" : "rotate(135deg) scale(1)"}}/>
        </div>}
        {!isOnTaskPage && !isOnDocumentsPage && 
            <>
                <div className={FloatingActionButtonCSS.addLedighedButton} onClick={tilføjLedighedFunction} style={{transform: menuOpen ? "translate(-75px, -75px) scale(1)" : "translate(0px, 0px) scale(0)", opacity: menuOpen ? "1" : "0"}}>
                    <span className={FloatingActionButtonCSS.icons}>🙋🏽</span>
                    <span className={FloatingActionButtonCSS.addXText}>Reg. ledighed</span>
                </div>
                <div className={FloatingActionButtonCSS.addNewTaskButton} onClick={redirectCreateTask} style={{transform: menuOpen ? "translateY(-100px) scale(1)" : "translateY(0px) scale(0)", opacity: menuOpen ? "1" : "0"}}>
                    <span className={FloatingActionButtonCSS.icons}>📋</span>
                    <span className={FloatingActionButtonCSS.addXText}>Ny opgave</span>
                </div>
                <div className={FloatingActionButtonCSS.addNewUserButton} onClick={redirectCreateUser} style={{transform: menuOpen ? "translateX(-100px) scale(1)" : "translate(0px) scale(0)", opacity: menuOpen ? "1" : "0"}}>
                    <span className={FloatingActionButtonCSS.icons}>👷🏼‍♂️</span>
                    <span className={FloatingActionButtonCSS.addXText}>Ny bruger</span>
                </div>
            </>
        }

        <UploadDokumentModal åbnUploadDokumentModal={åbnUploadDokumentModal} setÅbnUploadDokumentModal={setÅbnUploadDokumentModal} />

        <Modal trigger={addLedighed} setTrigger={setAddLedighed}>
            <h2 className={ModalStyles.modalHeading}>Tilføj ledighed</h2>
            {tilføjRegelmæssigLedighed ? 
            <p className={ModalStyles.modalLink} onClick={() => setTilføjRegelmæssigLedighed(false)}>Tilføj ledighed for enkeltdato</p> : <p className={ModalStyles.modalLink} onClick={() => setTilføjRegelmæssigLedighed(true)}>Tilføj regelmæssig ledighed</p>}
            {tilføjRegelmæssigLedighed ? 
            <form action="" onSubmit={submitNewRegelmæssigLedighed}>
                <label className={ModalStyles.modalLabel} htmlFor="besøg-tid-fra">Meld dig ledig fra kl.</label>
                <div className={ModalStyles.timeInputs}>
                    <div className={ModalStyles.timeInput}>
                        <input className={ModalStyles.modalInput} type="time" id="besøg-tid-fra" value={selectedTimeFrom} onChange={(e) => setSelectedTimeFrom(e.target.value)} />
                    </div>
                    <div className={ModalStyles.timeSeparator}>–</div>
                    <div className={ModalStyles.timeInput}>
                        <input className={ModalStyles.modalInput} type="time" id="besøg-tid-til" value={selectedTimeTo} onChange={(e) => setSelectedTimeTo(e.target.value)} />
                    </div>
                </div>
                <label className={ModalStyles.modalLabel} htmlFor="ledighed-ugedag">hver</label>
                <select className={ModalStyles.modalInput} id="ledighed-ugedag" value={selectedWeekday} onChange={(e) => setSelectedWeekday(e.target.value)}>
                    <option value="1">mandag</option>
                    <option value="2">tirsdag</option>
                    <option value="3">onsdag</option>
                    <option value="4">torsdag</option>
                    <option value="5">fredag</option>
                    <option value="6">lørdag</option>
                    <option value="0">søndag</option>
                </select>
                <label className={ModalStyles.modalLabel} htmlFor="ledighed-dato-fra">fra</label>
                <input className={ModalStyles.modalInput} type="date" id="ledighed-dato-fra" value={regelmæssigLedighedDatoFra ? dayjs(regelmæssigLedighedDatoFra).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD")} onChange={(e) => setRegelmæssigLedighedDatoFra(e.target.value)} />
                <label className={ModalStyles.modalLabel} htmlFor="ledighed-dato-til">indtil</label>
                <input className={ModalStyles.modalInput} type="date" id="ledighed-dato-til" value={chosenDate ? dayjs(chosenDate).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD")} onChange={(e) => setChosenDate(e.target.value)} />
                <p><b className={ModalStyles.bold}>{weekdays.length > 0 ? weekdays.length : "Ingen dage"} {weekdays.length > 0 ? (selectedWeekday === "1" ? "mandag" : selectedWeekday === "2" ? "tirsdag" : selectedWeekday === "3" ? "onsdag" : selectedWeekday === "4" ? "torsdag" : selectedWeekday === "5" ? "fredag" : selectedWeekday === "6" ? "lørdag" : "søndag") : ""}{weekdays.length > 1 ? "e" : ""}</b> i markeret interval.</p>
                <button className={ModalStyles.buttonFullWidth}>Tilføj ledighed</button>
                {opretLedighedError && <p className={ModalStyles.errorMessage}>{opretLedighedError}</p>}
                {opretLedighedSuccess && <p className={ModalStyles.successMessage}>Ledighed tilføjet!</p>}
            </form>
            :
            <form action="" onSubmit={submitNewEnkeltLedighed}>
                <label className={ModalStyles.modalLabel} htmlFor="ledighed-dato">Dato</label>
                <input className={ModalStyles.modalInput} type="date" id="ledighed-dato" value={chosenDate ? dayjs(chosenDate).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD")} onChange={(e) => setChosenDate(e.target.value)} />
                <label className={ModalStyles.modalLabel} htmlFor="besøg-tid-fra">Tid</label>
                <div className={ModalStyles.timeInputs}>
                    <div className={ModalStyles.timeInput}>
                        <input className={ModalStyles.modalInput} type="time" id="besøg-tid-fra" value={selectedTimeFrom} onChange={(e) => setSelectedTimeFrom(e.target.value)} />
                    </div>
                    <div className={ModalStyles.timeSeparator}>–</div>
                    <div className={ModalStyles.timeInput}>
                        <input className={ModalStyles.modalInput} type="time" id="besøg-tid-til" value={selectedTimeTo} onChange={(e) => setSelectedTimeTo(e.target.value)} />
                    </div>
                </div>
                <button className={ModalStyles.buttonFullWidth}>Tilføj ledighed</button>
                {opretLedighedError && <p className={ModalStyles.errorMessage}>{opretLedighedError}</p>}
                {opretLedighedSuccess && <p className={ModalStyles.successMessage}>{opretLedighedSuccess}</p>}
            </form>}
        </Modal>

        {modalOpen && <Modal trigger={modalOpen} setTrigger={setModalOpen}>
            <h2 className={ModalStyles.modalHeading}>Tilføj besøg</h2>
            <div className={ModalStyles.modalSubheadingContainer}>
                <h3 className={ModalStyles.modalSubheading}>{chosenTask ? chosenTask.navn : "Ingen person"}</h3>
                <h3 className={ModalStyles.modalSubheading}>{chosenTask ? chosenTask.adresse : "Ingen adresse"}</h3>
            </div>
            <form action="" onSubmit={submitNewBesøg}>
                {user.isAdmin ? (
                    <>
                    <label className={ModalStyles.modalLabel} htmlFor="ansvarlige">Medarbejder</label>
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
                ) : (
                    <input className={ModalStyles.modalInput} type="text" id="ansvarlige" value={user.navn} readOnly />
                )}
                <label className={ModalStyles.modalLabel} htmlFor="besøg-dato">Dato</label>
                <input className={ModalStyles.modalInput} type="date" id="besøg-dato" value={chosenDate ? dayjs(chosenDate).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD")} onChange={(e) => setChosenDate(e.target.value)} />
                <label className={ModalStyles.modalLabel} htmlFor="besøg-tid-fra">Tid</label>
                <div className={ModalStyles.timeInputs}>
                    <div className={ModalStyles.timeInput}>
                        <input className={ModalStyles.modalInput} type="time" id="besøg-tid-fra" value={selectedTimeFrom} onChange={(e) => setSelectedTimeFrom(e.target.value)} />
                    </div>
                    <div className={ModalStyles.timeSeparator}>–</div>
                    <div className={ModalStyles.timeInput}>
                        <input className={ModalStyles.modalInput} type="time" id="besøg-tid-til" value={selectedTimeTo} onChange={(e) => setSelectedTimeTo(e.target.value)} />
                    </div>
                </div>
                <label className={ModalStyles.modalLabel} htmlFor="besøg-kommentar">Evt. kommentar</label>
                <textarea className={ModalStyles.modalInput} id="besøg-kommentar" rows="3" value={comment} onChange={(e) => setComment(e.target.value)}></textarea>
                <button className={ModalStyles.buttonFullWidth}>Tilføj besøg</button>
                {opretBesøgError && <p className={ModalStyles.errorMessage}>{opretBesøgError}</p>}
            </form>
        </Modal> }
    </>
  )
}

export default FloatingActionButton
