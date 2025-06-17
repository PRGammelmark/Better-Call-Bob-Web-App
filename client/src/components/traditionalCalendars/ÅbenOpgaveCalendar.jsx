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
import AddBesøg from '../modals/AddBesøg.jsx'

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

const ÅbenOpgaveCalendar = ({user, openDialog, setOpenDialog, opgaveTilknyttetBesøg, setOpgaveTilknyttetBesøg, eventData, setEventData, aktueltBesøg, opgaveID, getBrugerName, brugere, egneLedigeTider, alleLedigeTider, egneBesøg, alleBesøg, setEgneLedigeTider, setEgneBesøg, refetchLedigeTider, refetchBesøg, setRefetchLedigeTider, setRefetchBesøg, setAlleLedigeTider, setAlleBesøg, userID, updateOpgave, setUpdateOpgave}) => {

  const { chosenDate, setChosenDate } = useTaskAndDate();
  const [currentView, setCurrentView] = useState("month")
  const [view, setView] = useState("month")
  const [visEgneBesøg, setVisEgneBesøg] = useState(opgaveID ? (user.isAdmin ? false : true) : false)
  const [visAlleBesøg, setVisAlleBesøg] = useState(user.isAdmin ? true : false)
  const [visLedighed, setVisLedighed] = useState(false)
  const [visKunLedighedOverblik, setVisKunLedighedOverblik] = useState(false)
  const [visOgsåBesøgOverblik, setVisOgsåBesøgOverblik] = useState(opgaveID ? false : true)
  const [editBesøg, setEditBesøg] = useState(false)
  const [selectedTimeFrom, setSelectedTimeFrom] = useState("");
  const [selectedTimeTo, setSelectedTimeTo] = useState("");
  const [comment, setComment] = useState("");
  const [opretBesøgError, setOpretBesøgError] = useState("");
  const [fratrækBesøgFraLedigeTider, setFratrækBesøgFraLedigeTider] = useState(true)
  const [alleOpgaver, setAlleOpgaver] = useState([])
  const [besøgDenneMåned, setBesøgDenneMåned] = useState(0)
  const [addBesøgModal, setAddBesøgModal] = useState(false)
  const [kunder, setKunder] = useState([])
  const [kundeTilknyttetBesøg, setKundeTilknyttetBesøg] = useState(null)

  const filterEgneBesøgDenneOpgave = egneBesøg.filter(besøg => besøg.opgaveID === opgaveID)
  const filterAlleBesøgDenneOpgave = alleBesøg.filter(besøg => besøg.opgaveID === opgaveID)

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

  // Find how many besøg in the current month
  useEffect(() => {
    const currentMonth = dayjs(chosenDate).format("YYYY-MM")
    const calculateBesøgDenneMåned = egneBesøg.filter(besøg => dayjs(besøg.datoTidFra).format("YYYY-MM") === currentMonth)
    setBesøgDenneMåned(calculateBesøgDenneMåned.length)
  }, [chosenDate, egneBesøg])

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
        setKundeTilknyttetBesøg(null)
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

    // "Vis dine besøg" - formatering af egne besøg
    const egneBesøgFormateret = filterEgneBesøgDenneOpgave.map((besøg) => ({
      ...besøg,
      start: new Date(besøg.datoTidFra),
      end: new Date(besøg.datoTidTil),
      brugerID: besøg.brugerID,
      eventColor: brugere && brugere.find(ansvarlig => ansvarlig._id === besøg.brugerID)?.eventColor || '#3c5a3f',
      title: <span style={{color: 'white'}}><p style={besøgPStyles}>{dayjs(besøg.datoTidFra).format("HH:mm")}-{dayjs(besøg.datoTidTil).format("HH:mm")}</p><b style={besøgBStyles}>Besøg</b></span>
    }));

    // "Vis alle besøg" - formatering af egne besøg på overblikssiden
    const egneBesøgAlleOpgaverFormateret = egneBesøg.map((besøg) => ({
      ...besøg,
      start: new Date(besøg.datoTidFra),
      end: new Date(besøg.datoTidTil),
      brugerID: besøg.brugerID,
      eventColor: brugere && brugere.find(ansvarlig => ansvarlig._id === besøg.brugerID)?.eventColor || '#3c5a3f',
      title: <span style={{color: 'white'}}><p style={besøgPStyles}>{dayjs(besøg.datoTidFra).format("HH:mm")}-{dayjs(besøg.datoTidTil).format("HH:mm")}</p><b style={besøgBStyles}>{alleOpgaver.find(opgave => opgave._id === besøg.opgaveID)?.adresse || besøg.opgaveID}</b></span>
    }));

    // "Vis alle besøg" - formatering af alle andre besøg ved siden af egne
    const alleBesøgDenneOpgaveFormateret = filterAlleBesøgDenneOpgave.map((besøg) => ({
      ...besøg,
      start: new Date(besøg.datoTidFra),
      end: new Date(besøg.datoTidTil),
      brugerID: besøg.brugerID,
      eventColor: brugere && brugere.find(ansvarlig => ansvarlig._id === besøg.brugerID)?.eventColor || '#3c5a3f',
      title: <span style={{color: 'white'}}><p style={besøgPStyles}>{dayjs(besøg.datoTidFra).format("HH:mm")}-{dayjs(besøg.datoTidTil).format("HH:mm")}</p><b style={besøgBStyles}>{besøg && besøg.brugerID === userID ? "Dit besøg" : getBrugerName(besøg.brugerID)}</b></span>
    }));

    const alleBesøgFormateret = alleBesøg.map((besøg) => ({
      ...besøg,
      start: new Date(besøg.datoTidFra),
      end: new Date(besøg.datoTidTil),
      brugerID: besøg.brugerID,
      eventColor: brugere && brugere.find(ansvarlig => ansvarlig._id === besøg.brugerID)?.eventColor || '#3c5a3f',
      title: <span style={{color: 'white'}}><p style={besøgPStyles}>{dayjs(besøg.datoTidFra).format("HH:mm")}-{dayjs(besøg.datoTidTil).format("HH:mm")}</p><b style={besøgBStyles}>{besøg && besøg.brugerID === userID ? "Dit besøg" : getBrugerName(besøg.brugerID)}</b></span>
    }));

    const egneLedigeTiderFormateret =  egneLedigeTider.map((ledigTid) => ({
      ...ledigTid,
      start: new Date(ledigTid.datoTidFra),
      end: new Date(ledigTid.datoTidTil),
      brugerID: ledigTid.brugerID,
      eventColor: brugere && brugere.find(ansvarlig => ansvarlig._id === ledigTid.brugerID)?.eventColor + '60' || '#3c5a3f60',
      title: <span style={{color: brugere && brugere.find(ansvarlig => ansvarlig._id === ledigTid.brugerID)?.eventColor}}><p style={{color: brugere && brugere.find(ansvarlig => ansvarlig._id === ledigTid.brugerID)?.eventColor, ledigTidPStyles}}>{dayjs(ledigTid.datoTidFra).format("HH:mm")}-{dayjs(ledigTid.datoTidTil).format("HH:mm")}</p><b style={ledigTidBStyles}>{ledigTid && ledigTid.brugerID === userID ? "Din ledighed" : getBrugerName(ledigTid.brugerID)}</b></span>
    }))

    // const ledigeTiderFormateret =  alleLedigeTider.map((ledigTid) => ({
    //   ...ledigTid,
    //   start: new Date(ledigTid.datoTidFra),
    //   end: new Date(ledigTid.datoTidTil),
    //   brugerID: ledigTid.brugerID,
    //   eventColor: brugere && brugere.find(ansvarlig => ansvarlig._id === ledigTid.brugerID)?.eventColor + '60' || '#3c5a3f60',
    //   title: <span style={{color: brugere && brugere.find(ansvarlig => ansvarlig._id === ledigTid.brugerID)?.eventColor}}><p style={{color: brugere && brugere.find(ansvarlig => ansvarlig._id === ledigTid.brugerID)?.eventColor, ledigTidPStyles}}>{dayjs(ledigTid.datoTidFra).format("HH:mm")}-{dayjs(ledigTid.datoTidTil).format("HH:mm")}</p><b style={ledigTidBStyles}>{ledigTid && ledigTid.brugerID === userID ? "Din ledighed" : getBrugerName(ledigTid.brugerID)}</b></span>
    // }))

    const ledigeTiderMinusBesøg = alleLedigeTider.flatMap(tid => {
      let updatedTider = [tid];
      alleBesøgFormateret.forEach(besøg => {
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

    const ledigeTiderFormateret = ledigeTiderMinusBesøg.map((ledigTid) => ({
      ...ledigTid,
      start: new Date(ledigTid.datoTidFra),
      end: new Date(ledigTid.datoTidTil),
      brugerID: ledigTid.brugerID,
      eventColor: brugere && brugere.find(ansvarlig => ansvarlig._id === ledigTid.brugerID)?.eventColor + '60' || '#3c5a3f60',
      title: <span style={{color: brugere && brugere.find(ansvarlig => ansvarlig._id === ledigTid.brugerID)?.eventColor}}><p style={{color: brugere && brugere.find(ansvarlig => ansvarlig._id === ledigTid.brugerID)?.eventColor, ledigTidPStyles}}>{dayjs(ledigTid.datoTidFra).format("HH:mm")}-{dayjs(ledigTid.datoTidTil).format("HH:mm")}</p><b style={ledigTidBStyles}>{ledigTid && ledigTid.brugerID === userID ? "Din ledighed" : getBrugerName(ledigTid.brugerID)}</b></span>
    }))

    console.log(kunder)

   const openCalendarEvent = useCallback((callEvent) => {
      const opgaveTilknyttetBesøg = callEvent.opgaveID || "";

      if(opgaveTilknyttetBesøg !== ""){
        axios.get(`${import.meta.env.VITE_API_URL}/opgaver/${opgaveTilknyttetBesøg}`, {
            headers: {
              'Authorization': `Bearer ${user.token}`
            }
          })
          .then(res => {
            setOpgaveTilknyttetBesøg(res.data)
            console.log(res.data.kundeID)
            console.log(kunder)
            setKundeTilknyttetBesøg(kunder?.find(kunde => kunde._id === res.data.kundeID))
          })
          .catch(error => console.log(error))
      } else {
        setOpgaveTilknyttetBesøg(callEvent)
        setKundeTilknyttetBesøg(kunder?.find(kunde => kunde._id === callEvent.kundeID))
      }
      setEventData(callEvent);
      editBesøg && setEditBesøg(false);
      setOpenDialog(true);
}, [openDialog, kunder]);

const flytEllerÆndreEvent = useCallback(({event, start, end}) => {
  
  if (!user.isAdmin && user.id !== event.brugerID) {
    return;
  }

  // if(fratrækBesøgFraLedigeTider && opgaveID){
  //   console.log("hey")
  //   return;
  // }
  
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

const onRedigerBesøg = (e) => {
  e.preventDefault()

  const besøg = {
    datoTidFra: dayjs(`${dayjs(chosenDate).format("YYYY-MM-DD")}T${selectedTimeFrom}:00.000${dayjs().format("Z")}`),
    datoTidTil: dayjs(`${dayjs(chosenDate).format("YYYY-MM-DD")}T${selectedTimeTo}:00.000${dayjs().format("Z")}`),
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

const sletLedigTid = () => {
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
    tid._id !== eventData._id && 
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

  return (
    <div className={Styles.calendarContainer}>
      {opgaveID 
      ? 
      // Vis dette på opgavesider
      <div className={Styles.calendarHeadingDiv}>
        {visEgneBesøg && <><b className={Styles.bold}>{egneBesøgFormateret.length > 0 ? egneBesøgFormateret.length > 1 ? "Du har " + egneBesøgFormateret.length + " planlagte besøg" : "Du har " + egneBesøgFormateret.length + " planlagt besøg" : "Du har ingen planlagte besøg"}</b><p className={Styles.calendarHeadingDivP}>(Viser dine besøg på denne opgave)</p></>}
        {visAlleBesøg && <><b className={Styles.bold}>{alleBesøgDenneOpgaveFormateret.length > 0 ? alleBesøgDenneOpgaveFormateret.length > 1 ? alleBesøgDenneOpgaveFormateret.length + " planlagte besøg på denne opgave" : alleBesøgDenneOpgaveFormateret.length + " planlagt besøg på denne opgave" : "Ingen planlagte besøg på denne opgave"}</b><p className={Styles.calendarHeadingDivP}>(Viser alle besøg på denne opgave)</p></>}
        {visLedighed && <><b className={Styles.bold}>Viser ledighed</b><p className={Styles.calendarHeadingDivP}>(For alle medarbejdere)</p></>}
      </div>
      :
      // Vis dette på overblikssiden
      <div className={Styles.calendarHeadingDiv}>
        {visKunLedighedOverblik && <><b className={Styles.bold}>{besøgDenneMåned > 0 ? besøgDenneMåned > 1 ? "Du har " + besøgDenneMåned + " planlagte besøg i " + dayjs(chosenDate).format('MMMM') : "Du har " + besøgDenneMåned + " planlagt besøg i " + dayjs(chosenDate).format('MMMM') : "Du har ingen planlagte besøg i " + dayjs(chosenDate).format('MMMM')}</b><p className={Styles.calendarHeadingDivP}>(Viser dine ledighedsblokke)</p></>}
        {visOgsåBesøgOverblik && <><b className={Styles.bold}>{besøgDenneMåned > 0 ? besøgDenneMåned > 1 ? "Du har " + besøgDenneMåned + " planlagte besøg i " + dayjs(chosenDate).format('MMMM') : "Du har " + besøgDenneMåned + " planlagt besøg i " + dayjs(chosenDate).format('MMMM') : "Du har ingen planlagte besøg i " + dayjs(chosenDate).format('MMMM')}</b><p className={Styles.calendarHeadingDivP}>(Viser dine besøg og hvornår du er registreret ledig)</p></>}
      </div> }
      <TradCalendar
        className={Styles.calendar}
        culture={'da'}
        localizer={localizer}
        events={
          opgaveID
          ?
          (visEgneBesøg ? egneBesøgFormateret : visAlleBesøg ? alleBesøgDenneOpgaveFormateret : ledigeTiderFormateret)
          :
          (visOgsåBesøgOverblik ? egneBesøgAlleOpgaverFormateret : egneLedigeTiderFormateret)
          }
        backgroundEvents={visOgsåBesøgOverblik ? egneLedigeTiderFormateret : []}
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
        // draggableAccessor={fratrækBesøgFraLedigeTider ? false : (egneBesøgFormateret) => true}
        draggableAccessor={(event) => event.objectIsLedigTid ? false : true}
        onEventDrop={flytEllerÆndreEvent}
        onEventResize={flytEllerÆndreEvent}
        onView={(view) => setView(view)}
        onNavigate={handleDateChange}
        eventPropGetter={eventStyleGetter}
      />
      {opgaveID ? <div className={Styles.besøgFilterDiv}>
          <div className={Styles.besøgFilterDivItem}>
            <div className={Styles.switcherDiv}>
              <label className={Styles.switch}>
                <input type="checkbox" className={Styles.checkboxSwitch} checked={visEgneBesøg} onChange={kalenderVisningEgneBesøg} />
                <span className={Styles.slider}></span>
              </label>
            </div>
            <b className={Styles.besøgFilterDivItemHeading}>Dine besøg ({egneBesøgFormateret.length})<br /><span className={Styles.besøgFilterDivItemHeadingSpan}> (denne opgave)</span></b>
          </div>
          <div className={Styles.besøgFilterDivItem}>
            <div className={Styles.switcherDiv}>
              <label className={Styles.switch}>
                <input type="checkbox" className={Styles.checkboxSwitch} checked={visAlleBesøg} onChange={kalenderVisningAlleBesøg} />
                <span className={Styles.slider}></span>
              </label>
            </div>
            <b className={Styles.besøgFilterDivItemHeading}>Alle besøg ({alleBesøgDenneOpgaveFormateret.length})<br /><span className={Styles.besøgFilterDivItemHeadingSpan}> (denne opgave)</span></b>
          </div>
          {user.isAdmin && <div className={Styles.besøgFilterDivItem}>
            <div className={Styles.switcherDiv}>
              <label className={Styles.switch}>
                <input type="checkbox" className={Styles.checkboxSwitch} checked={visLedighed} onChange={kalenderVisningLedighed} />
                <span className={Styles.slider}></span>
              </label>
            </div>
            <b className={Styles.besøgFilterDivItemHeading}>Ledighed<br /><span className={Styles.besøgFilterDivItemHeadingSpan}> (alle medarbejdere)</span></b>
          </div>}
      </div>
      :
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
            <b className={Styles.besøgFilterDivItemHeading}>Vis ledighed</b>
          </div>
      </div>
      }
      
      <Modal trigger={openDialog} setTrigger={setOpenDialog}>
        {editBesøg ? (
          opgaveTilknyttetBesøg && opgaveTilknyttetBesøg.objectIsLedigTid ? 
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
            <h2 className={ModalStyles.modalHeading}>Rediger {eventData && eventData.brugerID === userID ? "dit" : getBrugerName(eventData?.brugerID) + "s"} besøg</h2>
                <div className={ModalStyles.modalSubheadingContainer}>
                  <h3 className={ModalStyles.modalSubheading}>{opgaveTilknyttetBesøg ? <p><b style={{fontFamily: "OmnesBold"}}>Hos: </b> {kundeTilknyttetBesøg?.navn || "Ingen kunde"}</p> : "Ingen person"}</h3>
                  {opgaveTilknyttetBesøg && !opgaveTilknyttetBesøg.objectIsLedigTid && <h3 className={ModalStyles.modalSubheading}>{opgaveTilknyttetBesøg ? <p><b style={{fontFamily: "OmnesBold"}}>På: </b>{kundeTilknyttetBesøg?.adresse || "Ingen adresse"}</p> : "Ingen adresse"}</h3>}
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
        {opgaveTilknyttetBesøg && opgaveTilknyttetBesøg.objectIsLedigTid ? <h2 className={ModalStyles.modalHeading}>Ledig tid for {getBrugerName(opgaveTilknyttetBesøg.brugerID)}</h2> : <h2 className={ModalStyles.modalHeading}>{(kundeTilknyttetBesøg && kundeTilknyttetBesøg?.adresse) || (aktueltBesøg && aktueltBesøg.adresse) ? "Planlagt besøg på " + (kundeTilknyttetBesøg?.adresse || aktueltBesøg.adresse) : "Ingen data"}</h2>}
        {opgaveTilknyttetBesøg && opgaveTilknyttetBesøg.objectIsLedigTid ? "" : <p><b className={ModalStyles.bold}>Hos:</b> {kundeTilknyttetBesøg?.navn || "Ingen kunde"}</p>}
        {eventData && <p><b className={ModalStyles.bold}>Dato & tid:</b> {eventData ? dayjs(eventData.datoTidFra).format("D. MMMM") : null}, kl. {eventData ? dayjs(eventData.datoTidFra).format("HH:mm") : null}-{eventData ? dayjs(eventData.datoTidTil).format("HH:mm") : null}</p>}
        {eventData && eventData?.brugerID && <p><b style={{fontFamily: "OmnesBold"}}>Medarbejder:</b> {getBrugerName(eventData?.brugerID)}</p>}
        {opgaveTilknyttetBesøg && opgaveTilknyttetBesøg.objectIsLedigTid ? <button className={ModalStyles.buttonFullWidth} onClick={() => {setAddBesøgModal({origin: "besøgFraLedigTid", action: "ledigTidSelect", ansvarligID: opgaveTilknyttetBesøg.brugerID, ansvarligNavn: getBrugerName(opgaveTilknyttetBesøg.brugerID), start: dayjs(eventData.datoTidFra), end: dayjs(eventData.datoTidTil)}); setOpenDialog(false)}}>Opret besøg</button> : ""}
        <br />
        {opgaveTilknyttetBesøg && opgaveTilknyttetBesøg.objectIsLedigTid ? "" : <b className={ModalStyles.bold}>{eventData && eventData.kommentar ? "Kommentar" : "Ingen kommentarer til besøget"}</b>}
        {opgaveTilknyttetBesøg && opgaveTilknyttetBesøg.objectIsLedigTid ? "" : <p>{eventData ? eventData.kommentar : null}</p>}
        <br />
        {opgaveTilknyttetBesøg && opgaveTilknyttetBesøg.objectIsLedigTid ? "" : <b className={ModalStyles.bold}>Oprindelig opgavebeskrivelse:</b>}
        {opgaveTilknyttetBesøg && opgaveTilknyttetBesøg.objectIsLedigTid ? "" : <p>{opgaveTilknyttetBesøg ? opgaveTilknyttetBesøg.opgaveBeskrivelse : null}</p>}
        {(user.isAdmin || (eventData?.brugerID === userID)) && (opgaveTilknyttetBesøg?.objectIsLedigTid ? 
        
          // Knapper til ledig tid
          <div className={ModalStyles.deleteEditButtons} style={{marginTop: -10}}>
                <button 
                  className={ModalStyles.deleteButton} 
                  onClick={() => {sletLedigTid()}}
                >
                  Slet ledig tid
                </button>
          </div>
        
        : (
          // Knapper til planlagt besøg
          <div className={ModalStyles.deleteEditButtons}>
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
          </div>
        ))}
        </>
      
      }
      </Modal>
      <AddBesøg trigger={addBesøgModal} setTrigger={setAddBesøgModal} updateOpgave={updateOpgave} setUpdateOpgave={setUpdateOpgave}/>
    </div>
  )
}

export default ÅbenOpgaveCalendar