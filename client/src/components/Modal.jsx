import React from 'react'
import ReactDom from 'react-dom'
import ModalStyles from './Modal.module.css'

const Modal = ({ children, trigger, setTrigger }) => {
    if(!trigger){
        return null
    }
  
    return ReactDom.createPortal (
    <>
        <div className={ModalStyles.overlay} onClick={() => setTrigger(false)}>
            <div className={ModalStyles.modal} onClick={(e) => e.stopPropagation()}>
                <button onClick={() => setTrigger(false)} className={ModalStyles.lukModal}>-</button>
                {children}
            </div>
        </div>
    </>,
    document.getElementById('portal')
  )
}

export default Modal
