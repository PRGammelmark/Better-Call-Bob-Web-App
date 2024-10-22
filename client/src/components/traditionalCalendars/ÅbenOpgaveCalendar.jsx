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

const ÅbenOpgaveCalendar = ({user, openDialog, setOpenDialog, tilknyttetOpgave, setTilknyttetOpgave, eventData, setEventData, aktueltBesøg, opgaveID, getBrugerName, ledigeAnsvarlige, egneLedigeTider, alleLedigeTider, egneBesøg, alleBesøg, setEgneLedigeTider, setEgneBesøg, refetchLedigeTider, refetchBesøg, setRefetchLedigeTider, setRefetchBesøg, setAlleLedigeTider, setAlleBesøg, userID}) => {

  const { chosenDate, setChosenDate } = useTaskAndDate();
  const [visEgneBesøg, setVisEgneBesøg] = useState(true)
  const [visAlleBesøg, setVisAlleBesøg] = useState(false)
  const [visLedighed, setVisLedighed] = useState(false)
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
      eventColor: ledigeAnsvarlige.find(ansvarlig => ansvarlig._id === ledigTid.brugerID)?.eventColor + '80' || '#3c5a3f80',
      title: getBrugerName(ledigTid.brugerID)
    }))

   const openCalendarEvent = useCallback((callEvent) => {
      const opgaveTilknyttetBesøg = callEvent.opgaveID || "";
      const ledighedTilknyttetBesøg = callEvent._id || "";

      if(opgaveTilknyttetBesøg !== ""){
      axios.get(`${import.meta.env.VITE_API_URL}/opgaver/${opgaveTilknyttetBesøg}`, {
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        })
        .then(res => {
          setTilknyttetOpgave(res.data)
        })
        .catch(error => console.log(error))
      } else {
        setTilknyttetOpgave(callEvent)
      }
      setEventData(callEvent);
      editBesøg && setEditBesøg(false);
      setOpenDialog(true);
}, [openDialog]);

const flytEllerÆndreEvent = useCallback(({event, start, end}) => {
  if(event.objectIsLedigTid){

    const newEventBorders = {
      datoTidFra: start,
      datoTidTil: end
    }

    setAlleLedigeTider(prevLedigeTider => 
      prevLedigeTider.map(ledigTid => 
        String(ledigTid._id) === String(event._id)  // Ensuring both IDs are strings for comparison
          ? { ...ledigTid, datoTidFra: start, datoTidTil: end }
          : ledigTid
      )
    );

    const tempEgneLedigeTider = egneLedigeTider;

    const overlappingTider = tempEgneLedigeTider.filter(tid => 
        (dayjs(newEventBorders.datoTidFra).isBefore(dayjs(tid.datoTidTil)) && dayjs(newEventBorders.datoTidTil).isAfter(dayjs(tid.datoTidFra)))
    );

    if (overlappingTider.length > 0) {
        const minDatoTidFra = dayjs.min(overlappingTider.map(tid => dayjs(tid.datoTidFra)));
        const maxDatoTidTil = dayjs.max(overlappingTider.map(tid => dayjs(tid.datoTidTil)));

        if (dayjs(newEventBorders.datoTidFra).isAfter(minDatoTidFra)) {
            newEventBorders.datoTidFra = minDatoTidFra.format("YYYY-MM-DDTHH:mm:ss.SSS");
        }

        if (dayjs(newEventBorders.datoTidTil).isBefore(maxDatoTidTil)) {
            newEventBorders.datoTidTil = maxDatoTidTil.format("YYYY-MM-DDTHH:mm:ss.SSS");
        }

        overlappingTider.forEach(tid => {
            if (tid._id !== event._id) {
                axios.delete(`${import.meta.env.VITE_API_URL}/ledige-tider/${tid._id}`, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    }
                })
                .then(res => {
                    console.log("Overlapping ledig tid slettet", res.data)
                })
                .catch(error => console.log(error))
            }
        });
    }

    axios.patch(`${import.meta.env.VITE_API_URL}/ledige-tider/${event._id}`, newEventBorders, {
      headers: {
        'Authorization': `Bearer ${user.token}`
      }
    })
    .then(res => {
      refetchLedigeTider ? setRefetchLedigeTider(false) : setRefetchLedigeTider(true)
    })
    .catch(error => console.log(error))


  } else {

  const newEventBorders = {
    datoTidFra: start,
    datoTidTil: end
  }

  setAlleBesøg(prevBesøg => 
    prevBesøg.map(besøg => 
      String(besøg._id) === String(event._id)  // Ensuring both IDs are strings for comparison
        ? { ...besøg, datoTidFra: start, datoTidTil: end }
        : besøg
    )
  );

  setEgneBesøg(prevBesøg => 
    prevBesøg.map(besøg => 
      String(besøg._id) === String(event._id)  // Ensuring both IDs are strings for comparison
        ? { ...besøg, datoTidFra: start, datoTidTil: end }
        : besøg
    )
  );

  setEgneLedigeTider(prevLedigeTider => 
    prevLedigeTider.map(ledigTid => 
      String(ledigTid._id) === String(event._id)  // Ensuring both IDs are strings for comparison
        ? { ...ledigTid, datoTidFra: start, datoTidTil: end }
        : ledigTid
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
}})

function kalenderVisningEgneBesøg(){
  setVisAlleBesøg(false)
  setVisLedighed(false)
  setVisEgneBesøg(true)
}

function kalenderVisningAlleBesøg(){
  setVisEgneBesøg(false)
  setVisLedighed(false)
  setVisAlleBesøg(true)
}

function kalenderVisningLedighed(){
  setVisEgneBesøg(false)
  setVisAlleBesøg(false)
  setVisLedighed(true)
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

const onRedigerLedigTid = (e) => {
  e.preventDefault()

  const ledigTid = {
    datoTidFra: `${dayjs(chosenDate).format("YYYY-MM-DD")}T${selectedTimeFrom}:00.000`,
    datoTidTil: `${dayjs(chosenDate).format("YYYY-MM-DD")}T${selectedTimeTo}:00.000`
  }

  // ===== TJEKKER FOR OVERLAPPING TIDER =====
  
  const tempEgneLedigeTider = egneLedigeTider;

  const overlappingTider = tempEgneLedigeTider.filter(tid => 
    (dayjs(ledigTid.datoTidFra).isBefore(dayjs(tid.datoTidTil)) && dayjs(ledigTid.datoTidTil).isAfter(dayjs(tid.datoTidFra)))
  );

  if (overlappingTider.length > 0) {
    ledigTid.datoTidFra = dayjs.min(overlappingTider.map(tid => dayjs(tid.datoTidFra))).format("YYYY-MM-DDTHH:mm:ss.SSS");
    ledigTid.datoTidTil = dayjs.max(overlappingTider.map(tid => dayjs(tid.datoTidTil))).format("YYYY-MM-DDTHH:mm:ss.SSS");

    overlappingTider.forEach(tid => {
      if (tid._id !== eventData._id) {
        axios.delete(`${import.meta.env.VITE_API_URL}/ledige-tider/${tid._id}`, {
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        })
        .then(res => {
          console.log("Overlapping ledig tid slettet", res.data)
        })
        .catch(error => console.log(error))
      }
    });
  }
  
  // ===== ===== ===== ===== =====

  axios.patch(`${import.meta.env.VITE_API_URL}/ledige-tider/${eventData._id}`, ledigTid, {
    headers: {
      'Authorization': `Bearer ${user.token}`
    }
  })
  .then(res => {
    console.log("Ledig tid opdateret", res.data)
    setOpenDialog(false)
    refetchLedigeTider ? setRefetchLedigeTider(false) : setRefetchLedigeTider(true)
  })
  .catch(error => console.log(error))
}

// })

  return (
    <div className={Styles.calendarContainer}>
      <div className={Styles.calendarHeadingDiv}>
        {visEgneBesøg && <><b className={Styles.bold}>{egneBesøgFormateret.length > 0 ? egneBesøgFormateret.length > 1 ? "Du har " + egneBesøgFormateret.length + " planlagte besøg" : "Du har " + egneBesøgFormateret.length + " planlagt besøg" : "Du har ingen planlagte besøg"}</b><p className={Styles.calendarHeadingDivP}>(Viser dine besøg)</p></>}
        {visAlleBesøg && <><b className={Styles.bold}>{alleBesøgDenneOpgaveFormateret.length > 0 ? alleBesøgDenneOpgaveFormateret.length > 1 ? alleBesøgDenneOpgaveFormateret.length + " planlagte besøg på denne opgave" : alleBesøgDenneOpgaveFormateret.length + " planlagt besøg på denne opgave" : "Der er ingen planlagte besøg på denne opgave"}</b><p className={Styles.calendarHeadingDivP}>(Viser alle besøg på denne opgave)</p></>}
        {visLedighed && <><b className={Styles.bold}>Viser alle ledige tider</b><p className={Styles.calendarHeadingDivP}>(For alle medarbejdere)</p></>}
      </div>
      <TradCalendar
        culture={'da'}
        localizer={localizer}
        events={visEgneBesøg ? egneBesøgFormateret : visAlleBesøg ? alleBesøgDenneOpgaveFormateret : ledigeTiderFormateret}
        // backgroundEvents={visAlt ? ledigeTiderFormateret : []}
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
                <input type="checkbox" className={Styles.checkboxSwitch} checked={visLedighed} onChange={kalenderVisningLedighed} />
                <span className={Styles.slider}></span>
              </label>
            </div>
            <b className={Styles.besøgFilterDivItemHeading}>Vis ledighed<br /><span className={Styles.besøgFilterDivItemHeadingSpan}> (alle medarbejdere)</span></b>
          </div>
      </div>
      
      <Modal trigger={openDialog} setTrigger={setOpenDialog}>
        {editBesøg ? (
          tilknyttetOpgave && tilknyttetOpgave.objectIsLedigTid ? 
          (
            // Rediger ledig tid
            <DivSlideAnimation>
              <h2 className={ModalStyles.modalHeading}>Rediger ledig tid for {getBrugerName(eventData.brugerID)}</h2>
                  <form action="" onSubmit={onRedigerLedigTid}>
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
                      <button className={ModalStyles.buttonFullWidth}>Opdatér ledighed</button>
                      {opretBesøgError && <p className={ModalStyles.errorMessage}>{opretBesøgError}</p>}
                  </form>
              </DivSlideAnimation>
          )
          :
          (
            // Rediger planlagt besøg
            <DivSlideAnimation>
            <h2 className={ModalStyles.modalHeading}>Rediger {eventData && eventData.brugerID === userID ? "dit" : ""} besøg</h2>
                <div className={ModalStyles.modalSubheadingContainer}>
                  <h3 className={ModalStyles.modalSubheading}>{tilknyttetOpgave ? tilknyttetOpgave.navn : "Ingen person"}</h3>
                  {tilknyttetOpgave && tilknyttetOpgave.objectIsLedigTid === false && <h3 className={ModalStyles.modalSubheading}>{tilknyttetOpgave ? tilknyttetOpgave.adresse : "Ingen adresse"}</h3>}
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
          )
        )
        : 
        <>
        {tilknyttetOpgave && tilknyttetOpgave.objectIsLedigTid ? <h2 className={ModalStyles.modalHeading}>Ledig tid for {getBrugerName(tilknyttetOpgave.brugerID)}</h2> : <h2 className={ModalStyles.modalHeading}>{(tilknyttetOpgave && tilknyttetOpgave.adresse) || (aktueltBesøg && aktueltBesøg.adresse) ? "Planlagt besøg på " + (tilknyttetOpgave.adresse || aktueltBesøg.adresse) : "Ingen data"}</h2>}
        {tilknyttetOpgave && tilknyttetOpgave.objectIsLedigTid ? "" : <p><b className={ModalStyles.bold}>Hos:</b> {tilknyttetOpgave ? tilknyttetOpgave.navn : null}</p>}
        {eventData && <p><b className={ModalStyles.bold}>Dato & tid:</b> {eventData ? dayjs(eventData.datoTidFra).format("D. MMMM") : null}, kl. {eventData ? dayjs(eventData.datoTidFra).format("HH:mm") : null}-{eventData ? dayjs(eventData.datoTidTil).format("HH:mm") : null}</p>}
        <br />
        {tilknyttetOpgave && tilknyttetOpgave.objectIsLedigTid ? "" : <b className={ModalStyles.bold}>{eventData && eventData.kommentar ? "Kommentar" : "Ingen kommentarer til besøget"}</b>}
        {tilknyttetOpgave && tilknyttetOpgave.objectIsLedigTid ? "" : <p>{eventData ? eventData.kommentar : null}</p>}
        <br />
        {tilknyttetOpgave && tilknyttetOpgave.objectIsLedigTid ? "" : <b className={ModalStyles.bold}>Oprindelig opgavebeskrivelse:</b>}
        {tilknyttetOpgave && tilknyttetOpgave.objectIsLedigTid ? "" : <p>{tilknyttetOpgave ? tilknyttetOpgave.opgaveBeskrivelse : null}</p>}
        {tilknyttetOpgave && tilknyttetOpgave.objectIsLedigTid ? "" : <Link to={`../opgave/${tilknyttetOpgave ? tilknyttetOpgave._id : null}`}>
          <button className={ModalStyles.buttonFullWidth}>Gå til opgave {tilknyttetOpgave ? "#" + tilknyttetOpgave._id.slice(-3) : null}</button>
        </Link>}
        {(user.isAdmin || (eventData && eventData._id === user.id)) && tilknyttetOpgave && tilknyttetOpgave.objectIsLedigTid ? 
        (
          // Knapper til ledig tid
          <div className={ModalStyles.deleteEditButtons}>
            {eventData && (
              <>
                <button 
                  className={ModalStyles.deleteButton} 
                  onClick={() => {
                    if (window.confirm("Er du sikker på, at du vil slette denne ledige tid?")) {
                      axios.delete(`${import.meta.env.VITE_API_URL}/ledige-tider/${eventData._id}`, {
                        headers: {
                          'Authorization': `Bearer ${user.token}`
                        }
                      })
                      .then(res => {
                        setOpenDialog(false);
                        refetchLedigeTider ? setRefetchLedigeTider(false) : setRefetchLedigeTider(true);
                      })
                      .catch(error => console.log(error));
                    }
                  }}
                >
                  Slet ledig tid
                </button>
                <button 
                  className={ModalStyles.editButton} 
                  onClick={() => {
                    openEditDialog();
                  }}
                >
                  Rediger ledig tid
                </button>
              </>
            )}
          </div>
        )
        : (
          // Knapper til planlagt besøg
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