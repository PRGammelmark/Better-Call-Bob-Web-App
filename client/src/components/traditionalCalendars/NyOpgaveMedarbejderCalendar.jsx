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
import AddBesøgPåNyOpgave from '../modals/AddBesøgPåNyOpgave.jsx'

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

const NyOpgaveMedarbejderCalendar = ({user, tilknyttetMedarbejder, tilknyttetKunde, brugere, opgaver, setBesøg, setBesøgPåOpgaven, setBekræftDetaljer}) => {

  const { chosenDate, setChosenDate } = useTaskAndDate();
  const [currentView, setCurrentView] = useState("month")
  const [view, setView] = useState("month")
  const [visEgneBesøg, setVisEgneBesøg] = useState(true)
  const [visAlleBesøg, setVisAlleBesøg] = useState(false)
  const [visLedighed, setVisLedighed] = useState(false)
  const [visKunLedighedOverblik, setVisKunLedighedOverblik] = useState(false)
  const [visOgsåBesøgOverblik, setVisOgsåBesøgOverblik] = useState(true)
  const [editBesøg, setEditBesøg] = useState(false)
  const [selectedTimeFrom, setSelectedTimeFrom] = useState("");
  const [selectedTimeTo, setSelectedTimeTo] = useState("");
  const [comment, setComment] = useState("");
  const [opretBesøgError, setOpretBesøgError] = useState("");
  const [alleOpgaver, setAlleOpgaver] = useState([])
  const [besøgDenneMåned, setBesøgDenneMåned] = useState(0)
  const [addBesøgModal, setAddBesøgModal] = useState(false)
  const [openDialog, setOpenDialog] = useState(false)
  const [opgaveTilknyttetBesøg, setopgaveTilknyttetBesøg] = useState(null)
  const [eventData, setEventData] = useState(null)
  const [aktueltBesøg, setAktueltBesøg] = useState(null)
  const [medarbejdersBesøg, setMedarbejdersBesøg] = useState([])
  const [medarbejdersLedigeTider, setMedarbejdersLedigeTider] = useState([])
  const [medarbejdersOpgaver, setMedarbejdersOpgaver] = useState([])

  const getBrugerName = (brugerID) => {
    const bruger = brugere && brugere.find(user => (user?._id || user?.id) === brugerID);
    return bruger ? bruger.navn : 'Unknown User';
  };

  console.log(opgaver)
  
  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/opgaver/medarbejder/${tilknyttetMedarbejder?._id}`, {
      headers: { 'Authorization': `Bearer ${user.token}` }
    })
    .then(res => {
      console.log("Opgaver", res.data)
      setMedarbejdersOpgaver(res.data)
      axios.get(`${import.meta.env.VITE_API_URL}/ledige-tider/medarbejder/${tilknyttetMedarbejder?._id}`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      })
      .then(res => {
        console.log("Ledige tider", res.data)
        setMedarbejdersLedigeTider(res.data)
        axios.get(`${import.meta.env.VITE_API_URL}/besoeg/bruger/${tilknyttetMedarbejder?._id}`, {
          headers: { 'Authorization': `Bearer ${user.token}` }
        })
        .then(res => {
          console.log("Besøg", res.data)
          setMedarbejdersBesøg(res.data || [])
        })
        .catch(error => console.log(error))
      })
      .catch(error => console.log(error))
    })
    .catch(error => console.log(error))
  }, [tilknyttetMedarbejder])

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
        setopgaveTilknyttetBesøg(null)
      }
    }, [openDialog]);

    
    // === EVENT AND LEDIG TID STYLES ===

    const eventStyleGetter = (event) => {
      // let backgroundColor = event.eventColor || '#3c5a3f';
      let style = {
        backgroundColor: event.eventColor || '#3c5a3f',
        padding: "2px 3px 3px 3px",
        borderRadius: "2px",
        fontSize: "11px",
      };
      return {
        style: style
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

    // Formatering af besøg for denne medarbejder
    const medarbejdersBesøgFormateret = medarbejdersBesøg.map((besøg) => ({
      ...besøg,
      start: new Date(besøg.datoTidFra),
      end: new Date(besøg.datoTidTil),
      brugerID: besøg.brugerID,
      eventColor: brugere && brugere.find(ansvarlig => ansvarlig._id === besøg.brugerID)?.eventColor || '#3c5a3f',
      title: <span style={{color: 'white'}}><p style={besøgPStyles}>{dayjs(besøg.datoTidFra).format("HH:mm")}-{dayjs(besøg.datoTidTil).format("HH:mm")}</p><b style={besøgBStyles}>Besøg</b></span>
    }));

    const ledigeTiderMinusBesøg = medarbejdersLedigeTider.flatMap(tid => {
      let updatedTider = [tid];
      medarbejdersBesøgFormateret.forEach(besøg => {
        if (besøg.brugerID === tid.brugerID) {
          const besøgStart = dayjs(besøg.datoTidFra);
          const besøgEnd = dayjs(besøg.datoTidTil);
          updatedTider = updatedTider.flatMap(t => {
            const tidStart = dayjs(t.datoTidFra);
            const tidEnd = dayjs(t.datoTidTil);
            if (besøgStart.isBefore(tidEnd) && besøgEnd.isAfter(tidStart)) {
              if (besøgStart.isAfter(tidStart) && besøgEnd.isBefore(tidEnd)) {
                // Split the tid into two parts
                return [
                  { ...t, datoTidTil: besøgStart.toDate(), end: besøgStart.toDate() },
                  { ...t, datoTidFra: besøgEnd.toDate(), start: besøgEnd.toDate() }
                ];
              } else if (besøgStart.isAfter(tidStart)) {
                // Adjust the end of the tid
                return [{ ...t, datoTidTil: besøgStart.toDate(), end: besøgStart.toDate() }];
              } else if (besøgEnd.isBefore(tidEnd)) {
                // Adjust the start of the tid
                return [{ ...t, datoTidFra: besøgEnd.toDate(), start: besøgEnd.toDate() }];
              } else {
                // The besøg completely overlaps the tid
                return [];
              }
            }
            return [t];
          });
        }
      });
      return updatedTider;
    });

    const medarbejdersLedigeTiderFormateret =  ledigeTiderMinusBesøg.map((ledigTid) => ({
        ...ledigTid,
        start: new Date(ledigTid.datoTidFra),
        end: new Date(ledigTid.datoTidTil),
        brugerID: ledigTid.brugerID,
        eventColor: brugere && brugere.find(ansvarlig => ansvarlig._id === ledigTid.brugerID)?.eventColor + '60' || '#3c5a3f60',
        title: <span style={{color: brugere && brugere.find(ansvarlig => ansvarlig._id === ledigTid.brugerID)?.eventColor}}><p style={{color: brugere && brugere.find(ansvarlig => ansvarlig._id === ledigTid.brugerID)?.eventColor, ledigTidPStyles}}>{dayjs(ledigTid.datoTidFra).format("HH:mm")}-{dayjs(ledigTid.datoTidTil).format("HH:mm")}</p><b style={ledigTidBStyles}>{getBrugerName(ledigTid.brugerID)}</b></span>
      }))

   const openCalendarEvent = useCallback((callEvent) => {
      const opgaveTilknyttetBesøg = callEvent.opgaveID || "";

      if(opgaveTilknyttetBesøg !== ""){
        axios.get(`${import.meta.env.VITE_API_URL}/opgaver/${opgaveTilknyttetBesøg}`, {
            headers: {
              'Authorization': `Bearer ${user.token}`
            }
          })
          .then(res => {
            setopgaveTilknyttetBesøg(res.data)
          })
          .catch(error => console.log(error))
      } else {
        setopgaveTilknyttetBesøg(callEvent)
      }
      setEventData(callEvent);
      editBesøg && setEditBesøg(false);
      setOpenDialog(true);
}, [openDialog]);

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

const openCalendarDay = (slotInfo) => {
  setChosenDate(slotInfo.start)
  setAddBesøgModal(slotInfo)
}

  return (
    <div className={Styles.calendarContainer}>
      <Calendar
        className={Styles.calendar}
        culture={'da'}
        localizer={localizer}
        events={medarbejdersBesøgFormateret}
        backgroundEvents={medarbejdersLedigeTiderFormateret}
        onSelectEvent={openCalendarEvent}
        selectable={'ignoreEvents'}
        onSelectSlot={openCalendarDay}
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
          monthHeaderFormat:(date)=>dayjs(date).format("MMM YYYY"),
          eventTimeRangeFormat: ""
        }}
        onView={(view) => setView(view)}
        onNavigate={handleDateChange}
        eventPropGetter={eventStyleGetter}
      />

      
      
      <Modal trigger={openDialog} setTrigger={setOpenDialog}>
        {
        <>
        {opgaveTilknyttetBesøg && opgaveTilknyttetBesøg.objectIsLedigTid ? <h2 className={ModalStyles.modalHeading}>Ledig tid for {getBrugerName(opgaveTilknyttetBesøg.brugerID)}</h2> : <h2 className={ModalStyles.modalHeading}>{(opgaveTilknyttetBesøg && opgaveTilknyttetBesøg.adresse) || (aktueltBesøg && aktueltBesøg.adresse) ? "Planlagt besøg på " + (opgaveTilknyttetBesøg.adresse || aktueltBesøg.adresse) : "Ingen data"}</h2>}
        {opgaveTilknyttetBesøg && opgaveTilknyttetBesøg.objectIsLedigTid ? "" : <p><b className={ModalStyles.bold}>Hos:</b> {opgaveTilknyttetBesøg ? opgaveTilknyttetBesøg.navn : null}</p>}
        {eventData && <p><b className={ModalStyles.bold}>Dato & tid:</b> {eventData ? dayjs(eventData.datoTidFra).format("D. MMMM") : null}, kl. {eventData ? dayjs(eventData.datoTidFra).format("HH:mm") : null}-{eventData ? dayjs(eventData.datoTidTil).format("HH:mm") : null}</p>}
        {eventData && eventData?.brugerID && <p><b style={{fontFamily: "OmnesBold"}}>Medarbejder:</b> {getBrugerName(eventData?.brugerID)}</p>}
        {opgaveTilknyttetBesøg && opgaveTilknyttetBesøg.objectIsLedigTid ? <button className={ModalStyles.buttonFullWidth} onClick={() => {setAddBesøgModal({origin: "besøgFraLedigTid", action: "ledigTidSelect", ansvarligID: opgaveTilknyttetBesøg.brugerID, ansvarligNavn: getBrugerName(opgaveTilknyttetBesøg.brugerID), start: dayjs(eventData.datoTidFra), end: dayjs(eventData.datoTidTil)}); setOpenDialog(false)}}>Opret besøg</button> : ""}
        <br />
        {opgaveTilknyttetBesøg && opgaveTilknyttetBesøg.objectIsLedigTid ? "" : <b className={ModalStyles.bold}>{eventData && eventData.kommentar ? "Kommentar" : "Ingen kommentarer til besøget"}</b>}
        {opgaveTilknyttetBesøg && opgaveTilknyttetBesøg.objectIsLedigTid ? "" : <p>{eventData ? eventData.kommentar : null}</p>}
        <br />
        {opgaveTilknyttetBesøg && opgaveTilknyttetBesøg.objectIsLedigTid ? "" : <b className={ModalStyles.bold}>Oprindelig opgavebeskrivelse:</b>}
        {opgaveTilknyttetBesøg && opgaveTilknyttetBesøg.objectIsLedigTid ? "" : <p>{opgaveTilknyttetBesøg ? opgaveTilknyttetBesøg.opgaveBeskrivelse : null}</p>}
        </>
      
      }
      </Modal>
      <AddBesøgPåNyOpgave trigger={addBesøgModal} setTrigger={setAddBesøgModal} opgaveTilknyttetBesøg={opgaveTilknyttetBesøg} tilknyttetKunde={tilknyttetKunde} tilknyttetMedarbejder={tilknyttetMedarbejder} setBesøg={setBesøg} setBekræftDetaljer={setBekræftDetaljer} setBesøgPåOpgaven={setBesøgPåOpgaven} />
    </div>
  )
}

export default NyOpgaveMedarbejderCalendar