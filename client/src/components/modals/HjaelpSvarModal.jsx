import React from 'react'
import Modal from '../Modal.jsx'
import Styles from './HjaelpSvarModal.module.css'
import ReactPlayer from 'react-player'

const HjaelpSvarModal = (props) => {

    const question = props.trigger

    return (
        <Modal trigger={props.trigger} setTrigger={props.setTrigger} >
            <div>
                <h2 className={Styles.modalHeading}>{question.question}</h2>
                <div className={Styles.tagContainer}>
                    {question?.tags?.map((tag, index) => (
                        <span key={index} className={Styles.tag}>{tag.charAt(0).toUpperCase() + tag.slice(1)}</span>
                    ))}
                </div>
                {question.videoURL && 
                <div className={Styles.videoContainer}>
                    <ReactPlayer src={question.videoURL} width="100%" height="100%" controls playing={true} />
                </div>}
                <b className={Styles.modalSubheading}>Svar:</b>
                <p className={Styles.modalText}>{question.answer}</p>
            </div>
        </Modal>
    )
}

export default HjaelpSvarModal