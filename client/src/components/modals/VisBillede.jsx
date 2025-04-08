import React, { useState } from 'react'
import Modal from '../Modal.jsx'
import Styles from './VisBillede.module.css'

const VisBillede = (props) => {

    return (
        <Modal trigger={props.trigger} setTrigger={props.setTrigger} handleDeleteFile={() => props?.handleDeleteFile() || null} index={props?.imageIndex}>
            <h2>Billedvisning</h2>
            <img className={Styles.billede} src={props.trigger}></img>
            {/* The 'handleDeleteFile'-function is defined at åbenOpgave.jsx and is for deleting opgavebilleder-files from the modal view. */}
            {props?.handleDeleteFile && <button className={Styles.sletButton} onClick={() => props.handleDeleteFile(props.trigger, props.index)}>Slet billede</button>}
        </Modal>
    )
}

export default VisBillede