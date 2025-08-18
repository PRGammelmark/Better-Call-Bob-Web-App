import React from 'react'
import Modal from '../Modal.jsx'
import { Radio, QrCode } from 'lucide-react';
import MobilePayLogo from "../../assets/mobilePay.png";
import Styles from './BetalViaMobilePayModals.module.css'

const VælgMobilePayBetalingsmetode = ({trigger, setTrigger, postering, setOpenBetalViaMobilePayAnmodningModal, setOpenBetalViaMobilePayScanQRModal}) => {
  return (
    <Modal trigger={trigger} setTrigger={setTrigger}>
        <div>
            <h2>Vælg betalingsmetode ...</h2>
            <div className={Styles.betalingsmetodeContainer}>
                <div className={Styles.betalingsmetode} onClick={() => {
                    setTrigger(false)
                    setOpenBetalViaMobilePayAnmodningModal(postering)
                }}>
                    <div className={Styles.betalingsmetodeHeader}>
                        <h3>Send anmodning</h3>
                        <img src={MobilePayLogo} alt="Mobile Pay logo" />
                    </div>
                    <Radio className={Styles.betalingsmetodeIkon}/>
                </div>
                <div className={Styles.betalingsmetode} onClick={() => {
                    setTrigger(false)
                    setOpenBetalViaMobilePayScanQRModal(postering)
                }}>
                    <div className={Styles.betalingsmetodeHeader}>
                        <h3>Scan QR-kode</h3>
                        <img src={MobilePayLogo} alt="Mobile Pay logo" />
                    </div>
                    <QrCode className={Styles.betalingsmetodeIkon}/>
                </div>
            </div>
        </div>
    </Modal>
  )
}

export default VælgMobilePayBetalingsmetode
