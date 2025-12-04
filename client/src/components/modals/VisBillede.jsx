import React, { useState } from 'react'
import Modal from '../Modal.jsx'
import Styles from './VisBillede.module.css'
import PDFIcon from '../../assets/pdf-logo.svg'

const VisBillede = (props) => {
    const isPDF = props.trigger && (props.trigger.includes('.pdf') || props.trigger.includes('application/pdf'));
    const isVideo = props.trigger && props.trigger.includes("video%");

    return (
        <Modal trigger={props.trigger} setTrigger={props.setTrigger} handleDeleteFile={() => props?.handleDeleteFile() || null} index={props?.imageIndex}>
            {isVideo ? <h2>Vis video</h2> : isPDF ? <h2>Vis PDF</h2> : <h2>Vis billede</h2>}
            {isVideo 
            ? 
            <video 
                className={Styles.video} 
                src={props.trigger} 
                controls 
            />
            : isPDF
            ?
            <div style={{textAlign: 'center', padding: '20px'}}>
                <p style={{marginBottom: '15px'}}>Klik på ikonet for at åbne PDF'en i et nyt vindue.</p>
                <img 
                    className={Styles.pdfIcon} 
                    src={PDFIcon} 
                    alt="PDF" 
                    onClick={() => window.open(props.trigger, '_blank')}
                    style={{cursor: 'pointer', maxWidth: '200px'}}
                />
            </div>
            : 
            <img className={Styles.billede} src={props.trigger}></img>}
            {/* The 'handleDeleteFile'-function is defined at åbenOpgave.jsx and is for deleting opgavebilleder-files from the modal view. */}
            {props?.handleDeleteFile && <button className={Styles.sletButton} onClick={() => props.handleDeleteFile(props.trigger, props.index)}>Slet {isVideo ? "video" : isPDF ? "PDF" : "billede"}</button>}
        </Modal>
    )
}

export default VisBillede