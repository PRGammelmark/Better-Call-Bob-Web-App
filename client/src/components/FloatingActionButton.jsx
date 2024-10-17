import React from 'react'
import FloatingActionButtonCSS from "./FloatingActionButton.module.css"
import ModalStyles from "./Modal.module.css"
import AddNewIcon from "../assets/add-new.svg"
import AddNewBesøgIcon from "../assets/add-besøg.svg"
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
    const { refetchBesøg, setRefetchBesøg, medarbejdere } = useBesøg();
    const [menuOpen, setMenuOpen] = useState(false);
    const [isOnTaskPage, setIsOnTaskPage] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedAnsvarlig, setSelectedAnsvarlig] = useState(chosenTask && chosenTask.ansvarlig && chosenTask.ansvarlig.length > 0 && chosenTask.ansvarlig[0]._id || user.id);
    const [selectedAnsvarligColor, setSelectedAnsvarligColor] = useState(""); 
    const [selectedTimeFrom, setSelectedTimeFrom] = useState("09:00");
    const [selectedTimeTo, setSelectedTimeTo] = useState("09:00");
    const [comment, setComment] = useState("");
    const [opretBesøgError, setOpretBesøgError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        setIsOnTaskPage(window.location.pathname.includes("/opgave/"));
    }, [window.location.pathname]);

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
            kommentar: comment ? comment : "",
            eventColor: selectedAnsvarligColor
        }

        if (besøg.datoTidFra >= besøg.datoTidTil) {
            setOpretBesøgError("'Fra kl.' skal være før 'Til kl.'.")
            setTimeout(() => {
                setOpretBesøgError("")
            }, 5000)
            return
        }
        
        axios.post(`${import.meta.env.VITE_API_URL}/besoeg`, besøg, {
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        })
        .then(res => {
            refetchBesøg ? setRefetchBesøg(false) : setRefetchBesøg(true)
        })
        .catch(error => console.log(error))

        setModalOpen(false);
    }

  return (
    <>
        <div className={FloatingActionButtonCSS.floatingActionButton} onClick={isOnTaskPage ? addNewBesøg :toggleMenu}>
            <img src={isOnTaskPage ? AddNewBesøgIcon : AddNewIcon} draggable="false" alt="" className={FloatingActionButtonCSS.addNewIcon} style={isOnTaskPage ? {} : {transform: menuOpen ? "rotate(0deg) scale(0.8)" : "rotate(135deg) scale(1)"}}/>
        </div>
        {!isOnTaskPage && 
            <>
                <div className={FloatingActionButtonCSS.addNewTaskButton} onClick={redirectCreateTask} style={{transform: menuOpen ? "translateY(-100px) scale(1)" : "translateY(0px) scale(0)", opacity: menuOpen ? "1" : "0"}}>
                    <span className={FloatingActionButtonCSS.icons}>📋</span>
            </div>
            <div className={FloatingActionButtonCSS.addNewUserButton} onClick={redirectCreateUser} style={{transform: menuOpen ? "translateX(-100px) scale(1)" : "translate(0px) scale(0)", opacity: menuOpen ? "1" : "0"}}>
                    <span className={FloatingActionButtonCSS.icons}>👷🏼‍♂️</span>
                </div>
            </>
        }
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
                    <select className={ModalStyles.modalInput} id="ansvarlige" value={selectedAnsvarlig} onChange={(e) => {setSelectedAnsvarlig(e.target.value); console.log(e.target.value)}}>
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
