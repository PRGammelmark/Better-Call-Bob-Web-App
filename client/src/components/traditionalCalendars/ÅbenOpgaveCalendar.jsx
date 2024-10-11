import React from 'react'
import { useMemo, useState, useEffect, useCallback } from 'react'
import { Calendar, dayjsLocalizer } from 'react-big-calendar'
import axios from 'axios'
import dayjs from 'dayjs'
import Styles from './ÅbenOpgaveCalendar.module.css'
import '../../extra-styles/styles.scss';
import Modal from '../../components/Modal.jsx'
import ModalStyles from '../../components/Modal.module.css';
import { Link } from 'react-router-dom'
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop'
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css'
import ThreeDayView from './ThreeDayView.jsx'
import { useBesøg } from '../../context/BesøgContext.jsx'
import { useTaskAndDate } from '../../context/TaskAndDateContext.jsx'

const localizer = dayjsLocalizer(dayjs)

const lang = {
  da: {
    week: 'Uge',
    work_week: 'Arbejdsuge',
    threeDay: '3 dage',
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

const ÅbenOpgaveCalendar = ({user, openDialog, setOpenDialog, tilknyttetOpgave, setTilknyttetOpgave, eventData, setEventData, aktueltBesøg, opgaveID}) => {

  

  // const [egneBesøg, setEgneBesøg] = useState([]);
  // const [egneLedighedTider, setEgneLedighedTider] = useState([])

  const { egneLedigeTider, alleLedigeTider, egneBesøg, alleBesøg, setEgneLedigeTider, setEgneBesøg, refetchLedigeTider, refetchBesøg, setRefetchLedigeTider, setRefetchBesøg, setAlleLedigeTider, setAlleBesøg, userID } = useBesøg();
  const { chosenDate, setChosenDate } = useTaskAndDate();
  const [visEgneBesøg, setVisEgneBesøg] = useState(true)
  const [visAlleBesøg, setVisAlleBesøg] = useState(false)
  const [visAlt, setVisAlt] = useState(false)
  
  const filterEgneBesøgDenneOpgave = egneBesøg.filter(besøg => besøg.opgaveID === opgaveID)
  const filterAlleBesøgDenneOpgave = alleBesøg.filter(besøg => besøg.opgaveID === opgaveID)

  
  const { defaultDate, messages } = useMemo(
      () => ({
        defaultDate: new Date(2015, 3, 1),
        messages: lang['da'],
      }),
      []
  )

  const views = useMemo(() => ({
    month: true,
    week: false,
    threeDay: ThreeDayView,  // Adding the custom 3-day view
    day: true,
  }), []);

    useEffect(() => {
      if(openDialog === false){
        setEventData(null)
        setTilknyttetOpgave(null)
      }
    }, [openDialog]);

    // useEffect(() => {
    //   axios.get(`${import.meta.env.VITE_API_URL}/besoeg`, {
    //     headers: {
    //       'Authorization': `Bearer ${user.token}`
    //     }
    //   })
    //   .then(res => {
    //     const filterEgneBesøg = res.data.filter(opgave => opgave.brugerID === userID)
    //     setEgneBesøg(filterEgneBesøg)
    //     console.log("Egne besøg:")
    //     console.log(filterEgneBesøg)
    //   })
    //   .catch(error => console.log(error))
    // }, [])

    // useEffect(() => {
    //   axios.get(`${import.meta.env.VITE_API_URL}/ledige-tider`, {
    //     headers: {
    //       'Authorization': `Bearer ${user.token}`
    //     }
    //   })
    //   .then(res => {
    //     const filterEgneLedigeTider = res.data.filter(ledigTid => ledigTid.brugerID === userID)
    //     setEgneLedighedTider(filterEgneLedigeTider)
    //     console.log("Egne ledige tider:")
    //     console.log(filterEgneLedigeTider)
    //   })
    //   .catch(error => console.log(error))
    // }, [])

    const egneBesøgFormateret = filterEgneBesøgDenneOpgave.map((besøg) => ({
      ...besøg,
      start: new Date(besøg.datoTidFra),
      end: new Date(besøg.datoTidTil),
      title: "#" + besøg.opgaveID.slice(-3)
    }));

    const alleBesøgDenneOpgaveFormateret = filterAlleBesøgDenneOpgave.map((besøg) => ({
      ...besøg,
      start: new Date(besøg.datoTidFra),
      end: new Date(besøg.datoTidTil),
      title: "#" + besøg.opgaveID.slice(-3)
    }));

    const alleBesøgFormateret = alleBesøg.map((besøg) => ({
      ...besøg,
      start: new Date(besøg.datoTidFra),
      end: new Date(besøg.datoTidTil),
      title: "#" + besøg.opgaveID.slice(-3)
    }));

    const ledigeTiderFormateret =  alleLedigeTider.map((ledigTid) => ({
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
          setTilknyttetOpgave(res.data)
        })
        .catch(error => console.log(error))

      setEventData(callEvent);
      setOpenDialog(true);
}, [openDialog]);

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

function kalenderVisningEgneBesøg(){
  setVisAlleBesøg(false)
  setVisAlt(false)
  setVisEgneBesøg(true)
}

function kalenderVisningAlleBesøg(){
  setVisEgneBesøg(false)
  setVisAlt(false)
  setVisAlleBesøg(true)
}

function kalenderVisningAlt(){
  setVisEgneBesøg(false)
  setVisAlleBesøg(false)
  setVisAlt(true)
}

const handleDateChange = (date) => {
  console.log(date)
  setChosenDate(date);
}


// })

  return (
    <div className={Styles.calendarContainer}>
      <TradCalendar
        culture={'da'}
        localizer={localizer}
        events={visEgneBesøg ? egneBesøgFormateret : visAlleBesøg ? alleBesøgDenneOpgaveFormateret : alleBesøgFormateret}
        backgroundEvents={visAlt ? ledigeTiderFormateret : []}
        onSelectEvent={openCalendarEvent}
        startAccessor="start"
        endAccessor="end"
        messages={messages}
        style={{ height: 500 }}
        defaultView={"month"}
        views={views}
        formats={{
          dayHeaderFormat:(date)=>dayjs(date).format("ddd, D. MMM"),
          dayRangeHeaderFormat: ({ start, end }) => 
            `${dayjs(start).format("D.")}-${dayjs(end).format("D. MMM")}`,
          monthHeaderFormat:(date)=>dayjs(date).format("MMM YYYY")
        }}
        draggableAccessor={(egneBesøgFormateret) => true}
        onEventDrop={flytEllerÆndreEvent}
        onEventResize={flytEllerÆndreEvent}
        onNavigate={handleDateChange}
      />
      <div className={Styles.besøgFilterDiv}>
          <div className={Styles.besøgFilterDivItem}>
            <div className={Styles.switcherDiv}>
              <label className={Styles.switch}>
                <input type="checkbox" className={Styles.checkboxSwitch} checked={visEgneBesøg} onChange={kalenderVisningEgneBesøg} />
                <span className={Styles.slider}></span>
              </label>
            </div>
            <b className={Styles.besøgFilterDivItemHeading}>Vis dine besøg<br /><span className={Styles.besøgFilterDivItemHeadingSpan}> (denne opgave)</span></b>
          </div>
          <div className={Styles.besøgFilterDivItem}>
            <div className={Styles.switcherDiv}>
              <label className={Styles.switch}>
                <input type="checkbox" className={Styles.checkboxSwitch} checked={visAlleBesøg} onChange={kalenderVisningAlleBesøg} />
                <span className={Styles.slider}></span>
              </label>
            </div>
            <b className={Styles.besøgFilterDivItemHeading}>Vis alle besøg<br /><span className={Styles.besøgFilterDivItemHeadingSpan}> (denne opgave)</span></b>
          </div>
          <div className={Styles.besøgFilterDivItem}>
            <div className={Styles.switcherDiv}>
              <label className={Styles.switch}>
                <input type="checkbox" className={Styles.checkboxSwitch} checked={visAlt} onChange={kalenderVisningAlt} />
                <span className={Styles.slider}></span>
              </label>
            </div>
            <b className={Styles.besøgFilterDivItemHeading}>Vis alt<br /><span className={Styles.besøgFilterDivItemHeadingSpan}> (opgaver & ledighed)</span></b>
          </div>
      </div>
      <Modal trigger={openDialog} setTrigger={setOpenDialog}>
        <h2 className={ModalStyles.modalHeading}>{(tilknyttetOpgave || aktueltBesøg) ? "Planlagt besøg på " + (tilknyttetOpgave.adresse || aktueltBesøg.adresse) : "Ingen data"}</h2>
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

export default ÅbenOpgaveCalendar