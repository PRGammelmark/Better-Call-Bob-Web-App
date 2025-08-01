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
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop'
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css'


const localizer = dayjsLocalizer(dayjs)

const lang = {
  da: {
    week: 'Uge',
    work_week: 'Arbejdsuge',
    day: 'Dag',
    month: 'Måned',
    previous: '<',
    next: '>',
    today: 'I dag',
    agenda: 'Plan',
    noEventsInRange: 'Der er ingen begivenheder i dette tidsinterval.',
    showMore: (total) => `+${total} mere`,
  }
}

const TradCalendar = withDragAndDrop(Calendar);

const TraditionalCalendar = ({user, openDialog, setOpenDialog, opgaveTilknyttetBesøg, setOpgaveTilknyttetBesøg, eventData, setEventData, aktueltBesøg}) => {

  const userID = user?.id || user?._id;
  
  const { defaultDate, messages } = useMemo(
      () => ({
        defaultDate: new Date(2015, 3, 1),
        messages: lang['da'],
      }),
      []
  )

    const [egneBesøg, setEgneBesøg] = useState([]);
    const [egneLedighedTider, setEgneLedighedTider] = useState([])
    const [kundeTilknyttetBesøg, setKundeTilknyttetBesøg] = useState(null)
    const [kunder, setKunder] = useState([])

    useEffect(() => {
      if(openDialog === false){
        setEventData(null)
        setOpgaveTilknyttetBesøg(null)
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

      axios.get(`${import.meta.env.VITE_API_URL}/kunder`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      })
      .then(res => {
        setKunder(res.data)
      })
      .catch(error => console.log(error))
    }, [])

    // HVORDAN EVENTS VISES I KALENDEREN

    const egneBesøgFormateret = egneBesøg.map((besøg) => ({
      ...besøg,
      start: new Date(besøg.datoTidFra),
      end: new Date(besøg.datoTidTil),
      title: "#" + besøg.opgaveID.slice(-3)
    }));

    const egneLedigeTiderFormateret = egneLedighedTider.map((ledigTid) => ({
      ...ledigTid,
      start: new Date(ledigTid.datoTidFra),
      end: new Date(ledigTid.datoTidTil),
      title: ledigTid.opgaveID
    }))

   const openCalendarEvent = useCallback((callEvent) => {
      const opgaveTilknyttetBesøg = callEvent.opgaveID;

      axios.get(`${import.meta.env.VITE_API_URL}/opgaver/${opgaveTilknyttetBesøg}`, {
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        })
        .then(res => {
          setOpgaveTilknyttetBesøg(res.data)
          setKundeTilknyttetBesøg(kunder.find(kunde => kunde._id === res.data.kundeID))
        })
        .catch(error => console.log(error))

      setEventData(callEvent);
      setOpenDialog(true);
}, [openDialog, kunder]);

const flytEllerÆndreEvent = useCallback(({event, start, end}) => {
  const newEventBorders = {
    datoTidFra: start,
    datoTidTil: end
  }

  setEgneBesøg(prevBesøg => 
    prevBesøg.map(besøg => 
      besøg._id === event._id 
        ? { ...besøg, datoTidFra: start, datoTidTil: end }
        : besøg
    )
  );

  axios.patch(`${import.meta.env.VITE_API_URL}/besoeg/${event._id}`, newEventBorders, {
    headers: {
      'Authorization': `Bearer ${user.token}`
    }
  })
  .then(res => {
    // nothing yet ...
  })
  .catch(error => console.log(error))
})


// })

  return (
    <div className={Styles.calendarContainer}>
      <TradCalendar
        culture={'da'}
        localizer={localizer}
        events={egneBesøgFormateret}
        backgroundEvents={egneLedigeTiderFormateret}
        onSelectEvent={openCalendarEvent}
        startAccessor="start"
        endAccessor="end"
        messages={messages}
        style={{ height: 500 }}
        defaultView={"month"}
        views={["month", "week", "day"]}
        formats={{
          dayHeaderFormat:(date)=>dayjs(date).format("ddd, D. MMM"),
          dayRangeHeaderFormat: ({ start, end }) => 
    `${dayjs(start).format("D.")}-${dayjs(end).format("D. MMM")}`,
          monthHeaderFormat:(date)=>dayjs(date).format("MMM YYYY")
        }}
        draggableAccessor={(egneBesøgFormateret) => true}
        onEventDrop={flytEllerÆndreEvent}
        onEventResize={flytEllerÆndreEvent}
      />
      <Modal trigger={openDialog} setTrigger={setOpenDialog}>
        <h2 className={ModalStyles.modalHeading}>{(opgaveTilknyttetBesøg || aktueltBesøg) ? "Planlagt besøg på " + (kundeTilknyttetBesøg?.adresse || aktueltBesøg.adresse) : "Ingen data"}</h2>
        <p><b className={ModalStyles.bold}>Hos:</b> {kundeTilknyttetBesøg?.navn || "Ingen kunde"}</p>
        <p><b className={ModalStyles.bold}>Dato & tid:</b> {eventData ? dayjs(eventData.datoTidFra).format("D. MMMM") : null}, kl. {eventData ? dayjs(eventData.datoTidFra).format("HH:mm") : null}-{eventData ? dayjs(eventData.datoTidTil).format("HH:mm") : null}</p>
        <br />
        <b className={ModalStyles.bold}>Oprindelig opgavebeskrivelse:</b>
        <p>{opgaveTilknyttetBesøg ? opgaveTilknyttetBesøg.opgaveBeskrivelse : null}</p>
        <Link to={`../opgave/${opgaveTilknyttetBesøg ? opgaveTilknyttetBesøg._id : null}`}>
          <button className={ModalStyles.buttonFullWidth}>Gå til opgave {opgaveTilknyttetBesøg ? "#" + opgaveTilknyttetBesøg._id.slice(-3) : null}</button>
        </Link>
      </Modal>
    </div>
  )
}

export default TraditionalCalendar