import React from 'react'
import FloatingActionButtonCSS from "./FloatingActionButton.module.css"
import AddNewIcon from "../assets/add-new.svg"
import AddNewTaskIcon from "../assets/add-task.svg"
import { useState } from 'react'
import { useNavigate } from "react-router-dom"

const FloatingActionButton = () => {

    const [menuOpen, setMenuOpen] = useState(false);
    const navigate = useNavigate();

    function toggleMenu(){
        menuOpen ? setMenuOpen(false) : setMenuOpen(true);
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
        <div className={FloatingActionButtonCSS.floatingActionButton} onClick={toggleMenu}>
            <img src={AddNewIcon} draggable="false" alt="" className={FloatingActionButtonCSS.addNewIcon} style={{transform: menuOpen ? "rotate(0deg) scale(0.8)" : "rotate(135deg) scale(1)"}}/>
        </div>
        <div className={FloatingActionButtonCSS.addNewTaskButton} onClick={redirectCreateTask} style={{transform: menuOpen ? "translateY(-100px) scale(1)" : "translateY(0px) scale(0)", opacity: menuOpen ? "1" : "0"}}>
            <span className={FloatingActionButtonCSS.icons}>📋</span>
        </div>
        <div className={FloatingActionButtonCSS.addNewUserButton} onClick={redirectCreateUser} style={{transform: menuOpen ? "translateX(-100px) scale(1)" : "translate(0px) scale(0)", opacity: menuOpen ? "1" : "0"}}>
            <span className={FloatingActionButtonCSS.icons}>👷🏼‍♂️</span>
        </div>
    </>
  )
}

export default FloatingActionButton
