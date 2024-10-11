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

const FloatingActionButton = () => {

    const { user } = useAuthContext();

    const { chosenDate, chosenTask } = useTaskAndDate();
    const [menuOpen, setMenuOpen] = useState(false);
    const [isOnTaskPage, setIsOnTaskPage] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        setIsOnTaskPage(window.location.pathname.includes("/opgave/"));
    }, [window.location.pathname]);

    isOnTaskPage && console.log("isOnTaskPage");

    function toggleMenu(){
        menuOpen ? setMenuOpen(false) : setMenuOpen(true);
    }

    function addNewBesøg(){
        
        setModalOpen(true);
        console.log(modalOpen)
    }

    function redirectCreateTask() {
        setMenuOpen(false)
        navigate("ny-opgave")
    }

    function redirectCreateUser() {
        setMenuOpen(false)
        navigate("ny-bruger")
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
            <form action="">
                {user.isAdmin ? (
                    <>
                    <label className={ModalStyles.modalLabel} htmlFor="ansvarlige">Medarbejder</label>
                    <select className={ModalStyles.modalInput} id="ansvarlige">
                        {chosenTask && chosenTask.ansvarlig && chosenTask.ansvarlig.length > 0 ? (
                            chosenTask.ansvarlig.map((ansvarlig, index) => (
                                <option key={index} value={ansvarlig.id}>{ansvarlig.navn}</option>
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
                <input className={ModalStyles.modalInput} type="date" id="besøg-dato" defaultValue={chosenDate ? dayjs(chosenDate).format("YYYY-MM-DD") : new Date().toISOString().split('T')[0]} />
                <label className={ModalStyles.modalLabel} htmlFor="besøg-tid-fra">Tid</label>
                <div className={ModalStyles.timeInputs}>
                    <div className={ModalStyles.timeInput}>
                        <input className={ModalStyles.modalInput} type="time" id="besøg-tid-fra" defaultValue={"09:00"}/>
                    </div>
                    <div className={ModalStyles.timeSeparator}>–</div>
                    <div className={ModalStyles.timeInput}>
                        <input className={ModalStyles.modalInput} type="time" id="besøg-tid-til" defaultValue={"09:00"}/>
                    </div>
                </div>
                <label className={ModalStyles.modalLabel} htmlFor="besøg-kommentar">Evt. kommentar</label>
                <textarea className={ModalStyles.modalInput} id="besøg-kommentar" rows="3"></textarea>
                <button className={ModalStyles.buttonFullWidth}>Tilføj besøg</button>
            </form>
        </Modal> }
    </>
  )
}

export default FloatingActionButton
