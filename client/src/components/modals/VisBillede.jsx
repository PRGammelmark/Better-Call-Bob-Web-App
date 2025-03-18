import React, { useState } from 'react'
import Modal from '../Modal.jsx'
import Styles from './VisBillede.module.css'

const VisBillede = (props) => {

    return (
        <Modal trigger={props.trigger} setTrigger={props.setTrigger} >
            <h2>Billedvisning</h2>
            <img className={Styles.billede} src={props.trigger}></img>
        </Modal>
    )
}

export default VisBillede