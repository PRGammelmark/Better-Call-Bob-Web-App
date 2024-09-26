import React from 'react'
import { useMemo, useState, useEffect, useRef, useCallback } from 'react'
import { Calendar, dayjsLocalizer } from 'react-big-calendar'
import axios from 'axios'
import dayjs from 'dayjs'
import Styles from './Calendar.module.css'
import '../../extra-styles/styles.scss';
import Modal from '../../components/Modal.jsx'

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
  const clickRef = useRef(null)  
  
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

    useEffect(() => {
      axios.get('http://localhost:3000/api/besoeg', {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      })
      .then(res => {
        const filterEgneBesøg = res.data.filter(opgave => opgave.brugerID === userID)
        setEgneBesøg(filterEgneBesøg)
        console.log(filterEgneBesøg)
      })
      .catch(error => console.log(error))
    }, [])

    useEffect(() => {
      axios.get('http://localhost:3000/api/ledige-tider', {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      })
      .then(res => {
        const filterEgneLedigeTider = res.data.filter(ledigTid => ledigTid.brugerID === userID)
        setEgneLedighedTider(filterEgneLedigeTider)
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
    axios
    
    console.log(callEvent);
    setEventData(callEvent);
    setOpenDialog(true); 
   })

   const closeDialog = () => {
    setOpenDialog(false);
    setEventData(null);
  };

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
      {/* <Modal trigger={openDialog} setTrigger={setOpenDialog}>
        <h2 className={Styles.modalHeading}>Besøg #{eventData._id}</h2>
      </Modal> */}
      {/* {openDialog ? 
      <div className={Styles.overlay} onClick={() => setOpenDialog(false)}>
        <div className={Styles.modal} onClick={(e) => e.stopPropagation()}>
          <button onClick={() => {closeDialog()}}className={Styles.lukModal}>-</button>
          <h2 className={Styles.modalHeading}>Besøg #{eventData._id}</h2>
                
        </div>
      </div>
      :
      null} */}
    </div>
  )
}

export default TraditionalCalendar