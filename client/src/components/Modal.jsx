import React from 'react'
import ReactDom from 'react-dom'
import Styles from './Modal.module.css'

const Modal = ({ children, trigger, setTrigger }) => {
    if(!trigger){
        return null
    }
  
    return ReactDom.createPortal (
    <>
        <div className={Styles.overlay} onClick={() => setTrigger(false)}>
            <div className={Styles.modal} onClick={(e) => e.stopPropagation()}>
                <button onClick={() => setTrigger(false)} className={Styles.lukModal}>-</button>
                {children}
            </div>
        </div>
    </>,
    document.getElementById('portal')
  )
}

export default Modal
