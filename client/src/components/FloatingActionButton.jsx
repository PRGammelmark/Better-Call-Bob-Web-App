import React from 'react'
import FloatingActionButtonCSS from "./FloatingActionButton.module.css"
import AddNewIcon from "../assets/add-new.svg"
import AddTaskIcon from "../assets/add-task.svg"
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

  return (
    <div className={FloatingActionButtonCSS.floatingActionButton} onClick={toggleMenu}>
        <img src={AddNewIcon} draggable="false" alt="" className={FloatingActionButtonCSS.addNewIcon} style={{transform: menuOpen ? "rotate(0deg) scale(0.8)" : "rotate(135deg) scale(1)"}}/>
        <div className={FloatingActionButtonCSS.addTaskButton} onClick={redirectCreateTask} style={{transform: menuOpen ? "translateY(-100px) scale(1)" : "translateY(0px) scale(0)", opacity: menuOpen ? "1" : "0"}}>
            <img src={AddTaskIcon} className={FloatingActionButtonCSS.addNewTaskIcon} alt="" />
        </div>
    </div>
  )
}

export default FloatingActionButton
