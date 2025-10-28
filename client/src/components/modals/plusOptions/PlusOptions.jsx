import React from 'react'
import ModalStyles from "../../Modal.module.css"
import Styles from "./PlusOptions.module.css"
import { useState, useEffect } from 'react'
import Modal from "../../Modal.jsx"
import SettingsButtons from '../../basicComponents/buttons/SettingsButtons.jsx'
import { ClipboardList, Calendar, UserRoundPlus, ClipboardPlus, ClockPlus, FilePlus2, CalendarPlus, ReceiptText } from 'lucide-react'
import { useAuthContext } from '../../../hooks/useAuthContext.js'
import { useNavigate } from 'react-router-dom'
import { useOpgave } from '../../../context/OpgaveContext.jsx'

const PlusOptions = (props) => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { opgave } = useOpgave();

  return (
    <Modal trigger={props.trigger} setTrigger={props.setTrigger}>
        <h2 className={ModalStyles.modalHeading}>Opret ...</h2>
        <SettingsButtons 
            items={[
                {
                    title: "Postering",
                    icon: <ReceiptText />,
                    onClick: () => {props.setTrigger(false); props.setShowAddPosteringModal(true)},
                    value: "på denne opgave",
                    show: window.location.pathname.includes("/opgave/") && !opgave?.opgaveAfsluttet
                },
                {
                    title: "Besøg",
                    icon: <CalendarPlus />,
                    onClick: () => {props.setTrigger(false); props.setShowAddBesøgModal(true)},
                    value: "på denne opgave",
                    show: window.location.pathname.includes("/opgave/") && !opgave?.opgaveAfsluttet
                },
                {
                    title: "Opgave",
                    icon: <ClipboardPlus />,
                    onClick: () => {navigate('/ny-opgave'); props.setTrigger(false)},
                    show: user.isAdmin
                },
                {
                    title: "Kunde",
                    icon: <UserRoundPlus />,
                    onClick: () => {navigate('/ny-kunde'); props.setTrigger(false)},
                    show: user.isAdmin
                },
                {
                    title: "Ledighed",
                    icon: <ClockPlus />,
                    onClick: () => {props.setTrigger(false); props.setShowTilføjLedighed(true)},
                    show: true
                },
                {
                    title: "Dokument",
                    icon: <FilePlus2 />,
                    onClick: () => {navigate('/dokumenter'); props.setTrigger(false); props.setShowUploadDokumentModal(true)},
                    show: user.isAdmin
                },
                {
                    title: "Medarbejder",
                    icon: <UserRoundPlus />,
                    onClick: () => {navigate('/ny-bruger'); props.setTrigger(false)},
                    show: user.isAdmin
                }
            ].filter(item => item.show)}
        />
    </Modal>
  )
}

export default PlusOptions
