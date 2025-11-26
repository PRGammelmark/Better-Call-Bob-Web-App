import React from 'react'
import FloatingActionButtonCSS from "./FloatingActionButton.module.css"
import AddNewIcon from "../assets/add-new.svg"
import AddNewBesøgIcon from "../assets/add-besøg.svg"
import AddNewDocumentIcon from "../assets/add-document.svg"
import UploadDokumentModal from './modals/UploadDokumentModal.jsx'
import { useState, useEffect } from 'react'
import { useNavigate } from "react-router-dom"
import { useAuthContext } from '../hooks/useAuthContext'
import AddBesøg from './modals/AddBesøg.jsx'
import TilføjLedighed from './modals/tilføjLedighed/TilføjLedighed.jsx'

const FloatingActionButton = () => {

    const { user } = useAuthContext();
    const [menuOpen, setMenuOpen] = useState(false);
    const [isOnTaskPage, setIsOnTaskPage] = useState(false);
    const [isOnDocumentsPage, setIsOnDocumentsPage] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [åbnUploadDokumentModal, setÅbnUploadDokumentModal] = useState(false);
    const [showTilføjLedighed, setShowTilføjLedighed] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        setIsOnTaskPage(window.location.pathname.includes("/opgave/"));
        setIsOnDocumentsPage(window.location.pathname.includes("/dokumenter"));
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

    function redirectCreateCustomer() {
        setMenuOpen(false)
        navigate("ny-kunde")
    }

    function tilføjLedighedFunction(){
        setShowTilføjLedighed(true);
        setMenuOpen(false);
    }

    function addNewDocument(){
        setÅbnUploadDokumentModal(true)
    }


  return (
    <div className={FloatingActionButtonCSS.mainDiv}>
        {user.isAdmin && <div className={FloatingActionButtonCSS.floatingActionButton} onClick={isOnTaskPage ? addNewBesøg : (isOnDocumentsPage ? addNewDocument : toggleMenu)}>
            <img src={isOnTaskPage ? AddNewBesøgIcon : isOnDocumentsPage ? AddNewDocumentIcon : AddNewIcon} draggable="false" alt="" className={FloatingActionButtonCSS.addNewIcon} style={isOnTaskPage ? {} : isOnDocumentsPage ? {} : {transform: menuOpen ? "rotate(0deg) scale(0.8)" : "rotate(135deg) scale(1)"}}/>
        </div>}
        {!user.isAdmin && !isOnDocumentsPage && <div className={FloatingActionButtonCSS.floatingActionButton} onClick={isOnTaskPage ? addNewBesøg : toggleMenu}>
            <img src={isOnTaskPage ? AddNewBesøgIcon : isOnDocumentsPage ? AddNewDocumentIcon : AddNewIcon} draggable="false" alt="" className={FloatingActionButtonCSS.addNewIcon} style={isOnTaskPage ? {} : isOnDocumentsPage ? {} : {transform: menuOpen ? "rotate(0deg) scale(0.8)" : "rotate(135deg) scale(1)"}}/>
        </div>}
        {!isOnTaskPage && !isOnDocumentsPage && 
            <>
                <div className={FloatingActionButtonCSS.addLedighedButton} onClick={tilføjLedighedFunction} style={{transform: menuOpen ? "translateY(-100px) scale(1)" : "translate(0px, 0px) scale(0)", opacity: menuOpen ? "1" : "0"}}>
                    <span className={FloatingActionButtonCSS.icons}>🙋🏽</span>
                    <span className={FloatingActionButtonCSS.addXText}>Reg. ledighed</span>
                </div>
                {user.isAdmin && <div className={FloatingActionButtonCSS.addNewTaskButton} onClick={redirectCreateTask} style={{transform: menuOpen ? "translate(-75px, -75px) scale(1)" : "translateY(0px) scale(0)", opacity: menuOpen ? "1" : "0"}}>
                    <span className={FloatingActionButtonCSS.icons}>📋</span>
                    <span className={FloatingActionButtonCSS.addXText}>Ny opgave</span>
                </div>}
                {user.isAdmin && <div className={FloatingActionButtonCSS.addNewUserButton} onClick={redirectCreateUser} style={{transform: menuOpen ? "translateX(-100px) scale(1)" : "translate(0px) scale(0)", opacity: menuOpen ? "1" : "0"}}>
                    <span className={FloatingActionButtonCSS.icons}>👷🏼‍♂️</span>
                    <span className={FloatingActionButtonCSS.addXText}>Ny bruger</span>
                </div>}
                {user.isAdmin && <div className={FloatingActionButtonCSS.addNewCustomerButton} onClick={redirectCreateCustomer} style={{transform: menuOpen ? "translateX(-190px) scale(1)" : "translate(0px) scale(0)", opacity: menuOpen ? "1" : "0"}}>
                    <span className={FloatingActionButtonCSS.icons}>👤</span>
                    <span className={FloatingActionButtonCSS.addXText}>Ny kunde</span>
                </div>}
            </>
        }

        <UploadDokumentModal åbnUploadDokumentModal={åbnUploadDokumentModal} setÅbnUploadDokumentModal={setÅbnUploadDokumentModal} />
        <TilføjLedighed trigger={showTilføjLedighed} setTrigger={setShowTilføjLedighed} />
        <AddBesøg trigger={modalOpen} setTrigger={setModalOpen} />
    </div>
  )
}

export default FloatingActionButton
