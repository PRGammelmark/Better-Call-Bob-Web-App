import React from 'react'
import { useMemo, useState, useEffect, useCallback } from 'react'
import { Calendar, dayjsLocalizer } from 'react-big-calendar'
import axios from 'axios'
import dayjs from 'dayjs'
import Styles from './ÅbenOpgaveCalendar.module.css'
import '../../extra-styles/styles.scss';
import Modal from '../../components/Modal.jsx'
import ModalStyles from '../../components/Modal.module.css';
import BesoegsInfoModal from '../../components/modals/BesoegsInfoModal.jsx'
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop'
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css'
import ThreeDayView from './ThreeDayView.jsx'
import { useTaskAndDate } from '../../context/TaskAndDateContext.jsx'
import AddBesøg from '../modals/AddBesøg.jsx'
import { justerForDST } from '../../utils/justerForDST.js'
import { getLedighed } from '../../utils/getLedighed.js'
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
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

const ManagerCalendar = ({user, openDialog, setOpenDialog, opgaveTilknyttetBesøg, setOpgaveTilknyttetBesøg, eventData, setEventData, aktueltBesøg, opgaveID, getBrugerName, brugere, egneLedigeTider, alleLedigeTider, egneBesøg, alleBesøg, setEgneLedigeTider, setEgneBesøg, refetchLedigeTider, refetchBesøg, setRefetchLedigeTider, setRefetchBesøg, setAlleLedigeTider, setAlleBesøg, userID}) => {

  const { chosenDate, setChosenDate } = useTaskAndDate();
  const [view, setView] = useState("month")
  const [visKunLedighedOverblik, setVisKunLedighedOverblik] = useState(false)
  const [visOgsåBesøgOverblik, setVisOgsåBesøgOverblik] = useState(true)
  const [fratrækBesøgFraLedigeTider, setFratrækBesøgFraLedigeTider] = useState(true)
  const [alleOpgaver, setAlleOpgaver] = useState([])
  const [besøgDenneMåned, setBesøgDenneMåned] = useState(0)
  const [igangværendeOpgaverDenneMåned, setIgangværendeOpgaverDenneMåned] = useState(0)
  const [addBesøgModal, setAddBesøgModal] = useState(false)
  const [kunder, setKunder] = useState([])
  const [kundeTilknyttetBesøg, setKundeTilknyttetBesøg] = useState(null)

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/opgaver`, {
      headers: { 'Authorization': `Bearer ${user.token}` }
    })
    .then(res => {
      setAlleOpgaver(res.data)
    })
    .catch(error => console.log(error))

    axios.get(`${import.meta.env.VITE_API_URL}/kunder`, {
      headers: { 'Authorization': `Bearer ${user.token}` }
    })
    .then(res => {
      setKunder(res.data)
    })
    .catch(error => console.log(error))
  }, [])

  // Find how many besøg in the current month + how many tasks those besøg are for
  useEffect(() => {
    const currentMonth = dayjs(chosenDate).format("YYYY-MM")
    const calculateBesøgDenneMåned = alleBesøg.filter(besøg => dayjs(besøg.datoTidFra).format("YYYY-MM") === currentMonth)
    setBesøgDenneMåned(calculateBesøgDenneMåned.length)
    
    const igangværendeOpgaverUdFraBesøg = []
    calculateBesøgDenneMåned.forEach(besøg => {
      if(igangværendeOpgaverUdFraBesøg.includes(besøg.opgaveID)){
        return
      } else {
        igangværendeOpgaverUdFraBesøg.push(besøg.opgaveID)
      }
    })
    setIgangværendeOpgaverDenneMåned(igangværendeOpgaverUdFraBesøg.length)
  }, [chosenDate, alleBesøg, alleOpgaver])

  const { messages } = useMemo(
      () => ({
        messages: lang['da'],
      }),
      []
  )

  const views = useMemo(() => ({
    month: true,
    week: false,
    threeDay: ThreeDayView, // custom 3-day view
    day: true,
  }), []);

    useEffect(() => {
      if(openDialog === false){
        setEventData(null)
        setOpgaveTilknyttetBesøg(null)
      }
    }, [openDialog]);

    
    // === EVENT AND LEDIG TID STYLES ===

    const eventStyleGetter = (event) => {
      // let backgroundColor = event.eventColor || '#3c5a3f';
      const isAiCreated = event.aiCreated === true;
      let style = {
        backgroundColor: isAiCreated ? 'transparent' : (event.eventColor || '#3c5a3f'),
        padding: "2px 3px 3px 3px",
        borderRadius: "2px",
        fontSize: "11px",
      };
      
      return {
        style: style,
        className: isAiCreated ? "aiCreatedCalendarEvent" : ""
      };
    };

    let besøgPStyles, besøgBStyles, ledigTidPStyles, ledigTidBStyles;
    
    if(view === "month"){
      besøgPStyles = {
        color: 'white',
        fontSize: 8,
        marginBottom: "3px"
      }
      besøgBStyles = {
        fontFamily: "OmnesBold",
        fontSize: "10px"
      }
      ledigTidPStyles = {
        color: 'white',
        fontSize: 8,
        marginBottom: "3px"
      }
      ledigTidBStyles = {
        fontFamily: "OmnesBold",
        fontSize: "10px"
      }
    }

    if(view === "threeDay" || view === "day"){
      besøgPStyles = {
        color: 'white',
        fontSize: 12,
        marginBottom: "3px"
      }
      
      besøgBStyles = {
        fontFamily: "OmnesBold",
        fontSize: "14px"
      }
      
      ledigTidPStyles = {
        color: 'white',
        fontSize: 12,
        marginBottom: "3px"
      }
      
      ledigTidBStyles = {
        fontFamily: "OmnesBold",
        fontSize: "14px"
      }
    }

    // === EVENT VISNINGSFORMATER ===

    const alleBesøgFormateret = alleBesøg.map((besøg) => {
      // const { start, end } = justerForDST(besøg.datoTidFra, besøg.datoTidTil);
      const start = dayjs(besøg.datoTidFra).toDate();
      const end = dayjs(besøg.datoTidTil).toDate();

      const isAiCreated = besøg.aiCreated === true;
      const titleColor = isAiCreated ? '#0369a1' : 'white';
      
      return {
      ...besøg,
      start,
      end,
      brugerID: besøg.brugerID,
      eventColor: brugere && brugere.find(ansvarlig => ansvarlig._id === besøg.brugerID)?.eventColor || '#3c5a3f',
      title: <span style={{color: titleColor}}><p style={{...besøgPStyles, color: titleColor}}>{dayjs(start).format("HH:mm")}-{dayjs(end).format("HH:mm")}</p><b style={{...besøgBStyles, color: titleColor}}>{besøg && besøg.brugerID === userID ? "Dit besøg" : getBrugerName(besøg.brugerID)}</b>{isAiCreated && <span style={{fontSize: '8px', marginLeft: '4px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px'}}>AI</span>}</span>
    };
  });

    // Beregn ledige tider minus besøg for alle brugere
    const ledigeTiderMinusBesøg = getLedighed(null, alleLedigeTider, alleBesøg);

    const ledigeTiderFormateret = ledigeTiderMinusBesøg.map((ledigTid) => {
      // const { start, end } = justerForDST(ledigTid.datoTidFra, ledigTid.datoTidTil);
      const start = dayjs(ledigTid.datoTidFra).toDate();
      const end = dayjs(ledigTid.datoTidTil).toDate();

      return {
      ...ledigTid,
      start,
      end,
      brugerID: ledigTid.brugerID,
      eventColor: brugere && brugere.find(ansvarlig => ansvarlig._id === ledigTid.brugerID)?.eventColor + '60' || '#3c5a3f60',
      title: <span style={{color: brugere && brugere.find(ansvarlig => ansvarlig._id === ledigTid.brugerID)?.eventColor}}><p style={{color: brugere && brugere.find(ansvarlig => ansvarlig._id === ledigTid.brugerID)?.eventColor, ledigTidPStyles}}>{dayjs(start).format("HH:mm")}-{dayjs(end).format("HH:mm")}</p><b style={ledigTidBStyles}>{ledigTid && ledigTid.brugerID === userID ? "Din ledighed" : getBrugerName(ledigTid.brugerID)}</b></span>
    };
  });

   const openCalendarEvent = useCallback((callEvent) => {
      // Tjek om det er ledig tid eller besøg
      if (callEvent.objectIsLedigTid) {
        // Håndter ledig tid - beholder eksisterende logik
        const opgaveTilknyttetBesøg = callEvent.opgaveID || "";
        if(opgaveTilknyttetBesøg !== ""){
          console.log("Opgave tilknyttet besøg", opgaveTilknyttetBesøg)
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
        } else {
          setOpgaveTilknyttetBesøg(callEvent)
          setKundeTilknyttetBesøg(kunder.find(kunde => kunde._id === callEvent.kundeID))
        }
        setEventData(callEvent);
        setOpenDialog(true);
      } else {
        // Håndter besøg - brug BesoegsInfoModal
        setEventData(callEvent);
        setOpenDialog(true);
      }
}, [setEventData, setOpenDialog, setOpgaveTilknyttetBesøg, setKundeTilknyttetBesøg, kunder, user.token]);

useEffect(() => {
  if(!openDialog){
    setOpgaveTilknyttetBesøg(null)
    setKundeTilknyttetBesøg(null)
    setEventData(null)
  }
}, [openDialog])

const flytEllerÆndreEvent = useCallback(({event, start, end}) => {
  
  if (!user.isAdmin && userID !== event.brugerID) {
    return;
  }
  
  if(event.objectIsLedigTid){

    const newEventBorders = {
      datoTidFra: start,
      datoTidTil: end
    }

    console.log(newEventBorders)

    setAlleLedigeTider(prevLedigeTider => 
      prevLedigeTider.map(ledigTid => 
        String(ledigTid._id) === String(event._id)
          ? { ...ledigTid, datoTidFra: start, datoTidTil: end }
          : ledigTid
      )
    );

    const tempEgneLedigeTider = egneLedigeTider;

    const overlappingTider = tempEgneLedigeTider.filter(tid => 
        tid._id !== event._id && 
        (dayjs(newEventBorders.datoTidFra).isBefore(dayjs(tid.datoTidTil)) && dayjs(newEventBorders.datoTidTil).isAfter(dayjs(tid.datoTidFra)))
    );

    console.log("Overlapping tider length")
    console.log(overlappingTider.length)
    console.log(overlappingTider)

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

    console.log(newEventBorders)

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

function kalenderVisningOgsåLedighedOverblik(){
  setVisKunLedighedOverblik(false)
  setVisOgsåBesøgOverblik(true)
}

function kalenderVisningKunLedighedOverblik(){
  setVisOgsåBesøgOverblik(false)
  setVisKunLedighedOverblik(true)
}

const handleDateChange = (date) => {
  console.log(date)
  setChosenDate(date);
}

const openCalendarDay = (slotInfo) => {
    if(slotInfo.action === "click"){
        return
    }
    setChosenDate(slotInfo.start)
    setAddBesøgModal(slotInfo)
}

  return (
    <div className={Styles.calendarContainer}>
      <div className={Styles.calendarHeadingDiv}>
        {visKunLedighedOverblik && <><b className={Styles.bold}>{besøgDenneMåned > 0 ? besøgDenneMåned > 1 ? besøgDenneMåned + " planlagte besøg i " + dayjs(chosenDate).format('MMMM') : besøgDenneMåned + " planlagt besøg i " + dayjs(chosenDate).format('MMMM') : "Ingen planlagte besøg i " + dayjs(chosenDate).format('MMMM')}</b><p className={Styles.calendarHeadingDivP}>- fordelt på {igangværendeOpgaverDenneMåned} opgaver</p></>}
        {visOgsåBesøgOverblik && <><b className={Styles.bold}>{besøgDenneMåned > 0 ? besøgDenneMåned > 1 ? besøgDenneMåned + " planlagte besøg i " + dayjs(chosenDate).format('MMMM') : besøgDenneMåned + " planlagt besøg i " + dayjs(chosenDate).format('MMMM') : "Ingen planlagte besøg i " + dayjs(chosenDate).format('MMMM')}</b><p className={Styles.calendarHeadingDivP}>- fordelt på {igangværendeOpgaverDenneMåned} opgaver</p></>}
      </div>
      <TradCalendar
        className={Styles.calendar}
        culture={'da'}
        localizer={localizer}
        events={(visOgsåBesøgOverblik ? alleBesøgFormateret : ledigeTiderFormateret)}
        backgroundEvents={visOgsåBesøgOverblik ? ledigeTiderFormateret : []}
        onSelectEvent={openCalendarEvent}
        selectable={'ignoreEvents'}
        onSelectSlot={openCalendarDay}
        startAccessor="start"
        endAccessor="end"
        messages={messages}
        style={{ height: 500 }}
        defaultView={"month"}
        view={view}
        date={chosenDate}
        views={views}
        formats={{
          dayHeaderFormat:(date)=>dayjs(date).format("ddd, D. MMM"),
          dayRangeHeaderFormat: ({ start, end }) => 
            `${dayjs(start).format("D.")}-${dayjs(end).format("D. MMM")}`,
          monthHeaderFormat:(date)=>dayjs(date).format("MMM YYYY"),
          eventTimeRangeFormat: ""
        }}
        // draggableAccessor={fratrækBesøgFraLedigeTider ? false : (egneBesøgFormateret) => true}
        draggableAccessor={(event) => event.objectIsLedigTid ? false : true}
        onEventDrop={flytEllerÆndreEvent}
        onEventResize={flytEllerÆndreEvent}
        onView={(view) => setView(view)}
        onNavigate={handleDateChange}
        eventPropGetter={eventStyleGetter}
      />
      <div className={Styles.besøgFilterDiv}>
          <div className={Styles.besøgFilterDivItem}>
            <div className={Styles.switcherDiv}>
              <label className={Styles.switch}>
                <input type="checkbox" className={Styles.checkboxSwitch} checked={visOgsåBesøgOverblik} onChange={kalenderVisningOgsåLedighedOverblik} />
                <span className={Styles.slider}></span>
              </label>
            </div>
            <b className={Styles.besøgFilterDivItemHeading}>Vis besøg<br /><span className={Styles.besøgFilterDivItemHeadingSpan}> (ledighed synlig i dagsvisning)</span></b>
          </div>
          <div className={Styles.besøgFilterDivItem}>
            <div className={Styles.switcherDiv}>
              <label className={Styles.switch}>
                <input type="checkbox" className={Styles.checkboxSwitch} checked={visKunLedighedOverblik} onChange={kalenderVisningKunLedighedOverblik} />
                <span className={Styles.slider}></span>
              </label>
            </div>
            <b className={Styles.besøgFilterDivItemHeading}>Ledighed</b>
          </div>
      </div>
      {/* Modal for ledig tid */}
      {eventData && eventData.objectIsLedigTid && (
        <Modal trigger={openDialog} setTrigger={setOpenDialog}>
          <>
            <h2 className={ModalStyles.modalHeading}>Ledig tid for {getBrugerName(opgaveTilknyttetBesøg?.brugerID || eventData.brugerID)}</h2>
            {eventData && <p><b className={ModalStyles.bold}>Dato & tid:</b> {eventData ? dayjs(eventData.datoTidFra).format("D. MMMM") : null}, kl. {eventData ? dayjs(eventData.datoTidFra).format("HH:mm") : null}-{eventData ? dayjs(eventData.datoTidTil).format("HH:mm") : null}</p>}
            {opgaveTilknyttetBesøg && opgaveTilknyttetBesøg.objectIsLedigTid && <button className={ModalStyles.buttonFullWidth} onClick={() => {setAddBesøgModal({action: "ledigTidSelect", ansvarligID: opgaveTilknyttetBesøg.brugerID, ansvarligNavn: getBrugerName(opgaveTilknyttetBesøg.brugerID), start: dayjs(eventData.datoTidFra), end: dayjs(eventData.datoTidTil)}); setOpenDialog(false)}}>Opret besøg</button>}
            {(user.isAdmin || (eventData?.brugerID === userID)) && (
              <div className={ModalStyles.deleteEditButtons}>
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
              </div>
            )}
          </>
        </Modal>
      )}
      
      {/* BesoegsInfoModal for besøg */}
      {eventData && !eventData.objectIsLedigTid && (
        <BesoegsInfoModal
          trigger={openDialog}
          setTrigger={setOpenDialog}
          besoegId={eventData._id}
          onUpdated={() => {
            refetchBesøg ? setRefetchBesøg(false) : setRefetchBesøg(true);
          }}
          onDeleted={() => {
            refetchBesøg ? setRefetchBesøg(false) : setRefetchBesøg(true);
          }}
        />
      )}
      {/* setAddBesøgModal({action: "ledigTidSelect", ansvarligID: opgaveTilknyttetBesøg.brugerID, ansvarligNavn: getBrugerName(opgaveTilknyttetBesøg.brugerID), start: dayjs(eventData.datoTidFra), end: dayjs(eventData.datoTidTil)}) */}
      <AddBesøg trigger={addBesøgModal} setTrigger={setAddBesøgModal} />
    </div>
  )
}

export default ManagerCalendar