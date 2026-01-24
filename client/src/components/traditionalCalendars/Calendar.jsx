import React from 'react'
import { useMemo, useState, useEffect, useCallback } from 'react'
import { Calendar, dayjsLocalizer } from 'react-big-calendar'
import axios from 'axios'
import dayjs from 'dayjs'
import Styles from './Calendar.module.css'
import '../../extra-styles/styles.scss';
import BesoegsInfoModal from '../../components/modals/BesoegsInfoModal.jsx'
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

    useEffect(() => {
      if(openDialog === false){
        setEventData(null)
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
      setEventData(callEvent);
      setOpenDialog(true);
}, [setEventData, setOpenDialog]);

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
      {eventData && (
        <BesoegsInfoModal
          trigger={openDialog}
          setTrigger={setOpenDialog}
          besoegId={eventData._id}
          onUpdated={() => {
            // Refetch besøg data
            axios.get(`${import.meta.env.VITE_API_URL}/besoeg`, {
              headers: {
                'Authorization': `Bearer ${user.token}`
              }
            })
            .then(res => {
              const filterEgneBesøg = res.data.filter(opgave => opgave.brugerID === userID)
              setEgneBesøg(filterEgneBesøg)
            })
            .catch(error => console.log(error))
          }}
          onDeleted={() => {
            // Refetch besøg data
            axios.get(`${import.meta.env.VITE_API_URL}/besoeg`, {
              headers: {
                'Authorization': `Bearer ${user.token}`
              }
            })
            .then(res => {
              const filterEgneBesøg = res.data.filter(opgave => opgave.brugerID === userID)
              setEgneBesøg(filterEgneBesøg)
            })
            .catch(error => console.log(error))
          }}
        />
      )}
    </div>
  )
}

export default TraditionalCalendar