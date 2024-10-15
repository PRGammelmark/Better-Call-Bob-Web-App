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
import DivSlideAnimation from '../../components/DivSlideAnimation.jsx'

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

const ÅbenOpgaveCalendar = ({user, openDialog, setOpenDialog, tilknyttetOpgave, setTilknyttetOpgave, eventData, setEventData, aktueltBesøg, opgaveID, getBrugerName, ledigeAnsvarlige}) => {

  const { egneLedigeTider, alleLedigeTider, egneBesøg, alleBesøg, setEgneLedigeTider, setEgneBesøg, refetchLedigeTider, refetchBesøg, setRefetchLedigeTider, setRefetchBesøg, setAlleLedigeTider, setAlleBesøg, userID } = useBesøg();
  const { chosenDate, setChosenDate } = useTaskAndDate();
  const [visEgneBesøg, setVisEgneBesøg] = useState(true)
  const [visAlleBesøg, setVisAlleBesøg] = useState(false)
  const [visAlt, setVisAlt] = useState(false)
  const [editBesøg, setEditBesøg] = useState(false)
  const [selectedTimeFrom, setSelectedTimeFrom] = useState("");
  const [selectedTimeTo, setSelectedTimeTo] = useState("");
  const [comment, setComment] = useState("");
  const [opretBesøgError, setOpretBesøgError] = useState("");
  
  const filterEgneBesøgDenneOpgave = egneBesøg.filter(besøg => besøg.opgaveID === opgaveID)
  const filterAlleBesøgDenneOpgave = alleBesøg.filter(besøg => besøg.opgaveID === opgaveID)

  const eventStyleGetter = (event) => {
    let backgroundColor = event.eventColor || '#3c5a3f';
    let style = {
      backgroundColor: backgroundColor
    };
    return {
      style: style
    };
  };

  
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

    const egneBesøgFormateret = filterEgneBesøgDenneOpgave.map((besøg) => ({
      ...besøg,
      start: new Date(besøg.datoTidFra),
      end: new Date(besøg.datoTidTil),
      eventColor: ledigeAnsvarlige.find(ansvarlig => ansvarlig._id === besøg.brugerID)?.eventColor || '#3c5a3f',
      title: <span style={{color: 'white', fontSize: 10}}><b style={{fontFamily: "OmnesBold", fontSize: "12px"}}>Dig</b> (ca. {dayjs(besøg.datoTidFra).format("HH")}-{dayjs(besøg.datoTidTil).format("HH")})</span>
    }));

    const alleBesøgDenneOpgaveFormateret = filterAlleBesøgDenneOpgave.map((besøg) => ({
      ...besøg,
      start: new Date(besøg.datoTidFra),
      end: new Date(besøg.datoTidTil),
      eventColor: ledigeAnsvarlige.find(ansvarlig => ansvarlig._id === besøg.brugerID)?.eventColor || '#3c5a3f',
      title: <span style={{color: 'white'}}><b style={{fontFamily: "OmnesBold"}}>{besøg && besøg.brugerID === userID ? "Dit besøg" : getBrugerName(besøg.brugerID)}</b></span>
    }));

    const alleBesøgFormateret = alleBesøg.map((besøg) => ({
      ...besøg,
      start: new Date(besøg.datoTidFra),
      end: new Date(besøg.datoTidTil),
      eventColor: ledigeAnsvarlige.find(ansvarlig => ansvarlig._id === besøg.brugerID)?.eventColor || '#3c5a3f',
      title: "#" + besøg.opgaveID.slice(-3)
    }));

    const ledigeTiderFormateret =  alleLedigeTider.map((ledigTid) => ({
      ...ledigTid,
      start: new Date(ledigTid.datoTidFra),
      end: new Date(ledigTid.datoTidTil),
      eventColor: ledigTid.eventColor ? ledigTid.eventColor + '80' : '#00000080', // Adding '80' to make it half transparent
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
      editBesøg && setEditBesøg(false);
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

const openEditDialog = () => {
  setChosenDate(dayjs(eventData.datoTidFra).format("YYYY-MM-DD"))
  setSelectedTimeFrom(dayjs(eventData.datoTidFra).format("HH:mm"))
  setSelectedTimeTo(dayjs(eventData.datoTidTil).format("HH:mm"))
  setComment(eventData.kommentar)
  setEditBesøg(true)
}

const onRedigerBesøg = (e) => {
  e.preventDefault()

  const besøg = {
    datoTidFra: `${dayjs(chosenDate).format("YYYY-MM-DD")}T${selectedTimeFrom}:00.000`,
    datoTidTil: `${dayjs(chosenDate).format("YYYY-MM-DD")}T${selectedTimeTo}:00.000`,
    kommentar: comment ? comment : ""
  }

  axios.patch(`${import.meta.env.VITE_API_URL}/besoeg/${eventData._id}`, besøg, {
    headers: {
      'Authorization': `Bearer ${user.token}`
    }
  })
  .then(res => {
    console.log("Besøg opdateret", res.data)
    setOpenDialog(false)
    refetchBesøg ? setRefetchBesøg(false) : setRefetchBesøg(true)
  })
  .catch(error => console.log(error))
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
        eventPropGetter={eventStyleGetter}
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
        {editBesøg ? 
        <DivSlideAnimation>
        <h2 className={ModalStyles.modalHeading}>Rediger {eventData && eventData.brugerID === userID ? "dit" : ""} besøg</h2>
            <div className={ModalStyles.modalSubheadingContainer}>
              <h3 className={ModalStyles.modalSubheading}>{tilknyttetOpgave ? tilknyttetOpgave.navn : "Ingen person"}</h3>
              <h3 className={ModalStyles.modalSubheading}>{tilknyttetOpgave ? tilknyttetOpgave.adresse : "Ingen adresse"}</h3>
            </div>
            <form action="" onSubmit={onRedigerBesøg}>
                <label className={ModalStyles.modalLabel} htmlFor="besøg-dato">Dato</label>
                <input className={ModalStyles.modalInput} type="date" id="besøg-dato" value={chosenDate ? dayjs(chosenDate).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD")} onChange={(e) => setChosenDate(e.target.value)} />
                <label className={ModalStyles.modalLabel} htmlFor="besøg-tid-fra">Tid</label>
                <div className={ModalStyles.timeInputs}>
                    <div className={ModalStyles.timeInput}>
                        <input className={ModalStyles.modalInput} type="time" id="besøg-tid-fra" value={selectedTimeFrom} onChange={(e) => setSelectedTimeFrom(e.target.value)} />
                    </div>
                    <div className={ModalStyles.timeSeparator}>–</div>
                    <div className={ModalStyles.timeInput}>
                        <input className={ModalStyles.modalInput} type="time" id="besøg-tid-til" value={selectedTimeTo} onChange={(e) => setSelectedTimeTo(e.target.value)} />
                    </div>
                </div>
                <label className={ModalStyles.modalLabel} htmlFor="besøg-kommentar">Evt. kommentar</label>
                <textarea className={ModalStyles.modalInput} id="besøg-kommentar" rows="3" value={comment} onChange={(e) => setComment(e.target.value)}></textarea>
                <button className={ModalStyles.buttonFullWidth}>Opdatér besøg</button>
                {opretBesøgError && <p className={ModalStyles.errorMessage}>{opretBesøgError}</p>}
            </form>
        </DivSlideAnimation>
        
        : 
        <>
        <h2 className={ModalStyles.modalHeading}>{(tilknyttetOpgave || aktueltBesøg) ? "Planlagt besøg på " + (tilknyttetOpgave.adresse || aktueltBesøg.adresse) : "Ingen data"}</h2>
        <p><b className={ModalStyles.bold}>Hos:</b> {tilknyttetOpgave ? tilknyttetOpgave.navn : null}</p>
        <p><b className={ModalStyles.bold}>Dato & tid:</b> {eventData ? dayjs(eventData.datoTidFra).format("D. MMMM") : null}, kl. {eventData ? dayjs(eventData.datoTidFra).format("HH:mm") : null}-{eventData ? dayjs(eventData.datoTidTil).format("HH:mm") : null}</p>
        <br />
        <b className={ModalStyles.bold}>{eventData && eventData.kommentar ? "Kommentar" : "Ingen kommentarer til besøget"}</b>
        <p>{eventData ? eventData.kommentar : null}</p>
        <br />
        <b className={ModalStyles.bold}>Oprindelig opgavebeskrivelse:</b>
        <p>{tilknyttetOpgave ? tilknyttetOpgave.opgaveBeskrivelse : null}</p>
        <Link to={`../opgave/${tilknyttetOpgave ? tilknyttetOpgave._id : null}`}>
          <button className={ModalStyles.buttonFullWidth}>Gå til opgave {tilknyttetOpgave ? "#" + tilknyttetOpgave._id.slice(-3) : null}</button>
        </Link>
        {(user.isAdmin || (eventData && eventData._id === user.id)) && (
          <div className={ModalStyles.deleteEditButtons}>
            {eventData && (
              <>
                <button 
                  className={ModalStyles.deleteButton} 
                  onClick={() => {
                    if (window.confirm("Er du sikker på, at du vil slette dette besøg?")) {
                      axios.delete(`${import.meta.env.VITE_API_URL}/besoeg/${eventData._id}`, {
                        headers: {
                          'Authorization': `Bearer ${user.token}`
                        }
                      })
                      .then(res => {
                        setOpenDialog(false);
                        refetchBesøg ? setRefetchBesøg(false) : setRefetchBesøg(true);
                      })
                      .catch(error => console.log(error));
                    }
                  }}
                >
                  Slet besøg
                </button>
                <button 
                  className={ModalStyles.editButton} 
                  onClick={() => {
                    openEditDialog();
                  }}
                >
                  Rediger besøg
                </button>
              </>
            )}
          </div>
        )}
        </>
        
      }
      </Modal>
      
    </div>
  )
}

export default ÅbenOpgaveCalendar