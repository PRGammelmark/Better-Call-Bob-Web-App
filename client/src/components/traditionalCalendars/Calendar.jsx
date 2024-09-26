import React from 'react'
import { useMemo, useState, useEffect, useCallback } from 'react'
import { Calendar, dayjsLocalizer } from 'react-big-calendar'
import axios from 'axios'
import dayjs from 'dayjs'
import Styles from './Calendar.module.css'
import '../../extra-styles/styles.scss';
import Modal from '../../components/Modal.jsx'
import ModalStyles from '../../components/Modal.module.css';
import { Link } from 'react-router-dom'


const localizer = dayjsLocalizer(dayjs)

const lang = {
  da: {
    week: 'Uge',
    work_week: 'Arbejdsuge',
    day: 'Dag',
    month: 'Måned',
    previous: 'Forrige',
    next: 'Næste',
    today: 'I dag',
    agenda: 'Plan',
    noEventsInRange: 'Der er ingen begivenheder i dette tidsinterval.',
    showMore: (total) => `+${total} mere`,
  }
}

const TraditionalCalendar = ({user}) => {

  const userID = user.id;
  
  const { defaultDate, messages } = useMemo(
      () => ({
        defaultDate: new Date(2015, 3, 1),
        messages: lang['da'],
      }),
      []
  )

    const [egneBesøg, setEgneBesøg] = useState([]);
    const [egneLedighedTider, setEgneLedighedTider] = useState([])
    const [openDialog, setOpenDialog] = useState(false)
    const [eventData, setEventData] = useState(null)
    const [tilknyttetOpgave, setTilknyttetOpgave] = useState(null)

    useEffect(() => {
      if(openDialog === false){
        setEventData(null)
        setTilknyttetOpgave(null)
      }
    }, [openDialog]);

    useEffect(() => {
      axios.get(`${import.meta.env.VITE_API_URL}/besoeg`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      })
      .then(res => {
        const filterEgneBesøg = res.data.filter(opgave => opgave.brugerID === userID)
        setEgneBesøg(filterEgneBesøg)
        console.log("Egne besøg:")
        console.log(filterEgneBesøg)
      })
      .catch(error => console.log(error))
    }, [])

    useEffect(() => {
      axios.get(`${import.meta.env.VITE_API_URL}/ledige-tider`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      })
      .then(res => {
        const filterEgneLedigeTider = res.data.filter(ledigTid => ledigTid.brugerID === userID)
        setEgneLedighedTider(filterEgneLedigeTider)
        console.log("Egne ledige tider:")
        console.log(filterEgneLedigeTider)
      })
      .catch(error => console.log(error))
    }, [])

    const egneBesøgFormateret = egneBesøg.map((besøg) => ({
      ...besøg,
      start: new Date(besøg.datoTidFra),
      end: new Date(besøg.datoTidTil),
      title: "Opg. #" + besøg.opgaveID.slice(-3)
    }));

    const egneLedigeTiderFormateret = egneLedighedTider.map((ledigTid) => ({
      ...ledigTid,
      start: new Date(ledigTid.datoTidFra),
      end: new Date(ledigTid.datoTidTil),
      title: ledigTid.opgaveID
    }))

   const openEvent = useCallback((callEvent) => {
    const opgaveTilknyttetBesøg = callEvent.opgaveID;
    
    axios.get(`${import.meta.env.VITE_API_URL}/opgaver/${opgaveTilknyttetBesøg}`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      })
      .then(res => {
        setTilknyttetOpgave(res.data)
      })
      .catch(error => console.log(error))

    console.log(callEvent);
    setEventData(callEvent);
    setOpenDialog(true); 
   })

  return (
    <div className={Styles.calendarContainer}>
      <Calendar
        culture={'da'}
        localizer={localizer}
        events={egneBesøgFormateret}
        backgroundEvents={egneLedigeTiderFormateret}
        onSelectEvent={openEvent}
        startAccessor="start"
        endAccessor="end"
        messages={messages}
        style={{ height: 500 }}
        defaultView={"month"}
        views={["month", "week", "day"]}
        formats={{dayHeaderFormat:(date)=>dayjs(date).format("dddd [d.] DD. MMMM YYYY")}}
      />
      <Modal trigger={openDialog} setTrigger={setOpenDialog}>
        <h2 className={ModalStyles.modalHeading}>{tilknyttetOpgave ? "Planlagt besøg på " + tilknyttetOpgave.adresse : "Ingen data"}</h2>
        <p><b className={ModalStyles.bold}>Hos:</b> {tilknyttetOpgave ? tilknyttetOpgave.navn : null}</p>
        <p><b className={ModalStyles.bold}>Dato & tid:</b> {eventData ? dayjs(eventData.datoTidFra).format("D. MMMM") : null}, kl. {eventData ? dayjs(eventData.datoTidFra).format("HH:mm") : null}-{eventData ? dayjs(eventData.datoTidTil).format("HH:mm") : null}</p>
        <br />
        <b className={ModalStyles.bold}>Oprindelig opgavebeskrivelse:</b>
        <p>{tilknyttetOpgave ? tilknyttetOpgave.opgaveBeskrivelse : null}</p>
        <Link to={`../opgave/${tilknyttetOpgave ? tilknyttetOpgave._id : null}`}>
          <button className={ModalStyles.buttonFullWidth}>Gå til opgave {tilknyttetOpgave ? "#" + tilknyttetOpgave._id.slice(-3) : null}</button>
        </Link>
      </Modal>
    </div>
  )
}

export default TraditionalCalendar