import React from 'react'
import { useMemo, useState, useEffect, useCallback } from 'react'
import { Calendar, dayjsLocalizer } from 'react-big-calendar'
import axios from 'axios'
import dayjs from 'dayjs'
import Styles from './ÅbenOpgaveCalendar.module.css'
import '../../extra-styles/styles.scss';
import Modal from '../../components/Modal.jsx'
import ModalStyles from '../../components/Modal.module.css';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop'
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css'
import ThreeDayView from './ThreeDayView.jsx'
import { useTaskAndDate } from '../../context/TaskAndDateContext.jsx'
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

const LedighedsKalender = ({user, openDialog, setOpenDialog, eventData, setEventData, brugerID, getBrugerName, brugere, alleLedigeTider, alleBesøg, setAlleLedigeTider, refetchLedigeTider, setRefetchLedigeTider}) => {

  const { chosenDate, setChosenDate } = useTaskAndDate();
  const [view, setView] = useState("month")

  useEffect(() => {
    if(openDialog === false){
      setEventData(null)
    }
  }, [openDialog]);

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

  // === EVENT STYLES ===

  const eventStyleGetter = (event) => {
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

  let ledigTidPStyles, ledigTidBStyles;
  
  if(view === "month"){
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

  // Beregn ledige tider minus besøg for den specifikke medarbejder
  const ledigeTiderMinusBesøg = getLedighed(brugerID, alleLedigeTider, alleBesøg);

  const ledigeTiderFormateret = ledigeTiderMinusBesøg.map((ledigTid) => {
    const start = dayjs(ledigTid.datoTidFra).toDate();
    const end = dayjs(ledigTid.datoTidTil).toDate();

    return {
      ...ledigTid,
      start,
      end,
      brugerID: ledigTid.brugerID,
      objectIsLedigTid: true,
      eventColor: brugere && brugere.find(ansvarlig => ansvarlig._id === ledigTid.brugerID)?.eventColor + '60' || '#3c5a3f60',
      title: <span style={{color: brugere && brugere.find(ansvarlig => ansvarlig._id === ledigTid.brugerID)?.eventColor}}><p style={{color: brugere && brugere.find(ansvarlig => ansvarlig._id === ledigTid.brugerID)?.eventColor, ...ledigTidPStyles}}>{dayjs(start).format("HH:mm")}-{dayjs(end).format("HH:mm")}</p><b style={ledigTidBStyles}>{getBrugerName(ledigTid.brugerID)}</b></span>
    };
  });

  const openCalendarEvent = useCallback((callEvent) => {
    setEventData(callEvent);
    setOpenDialog(true);
  }, [setOpenDialog]);

  const flytEllerÆndreEvent = useCallback(({event, start, end}) => {
    
    if (!user.isAdmin && brugerID !== event.brugerID) {
      return;
    }
    
    const newEventBorders = {
      datoTidFra: start,
      datoTidTil: end
    }

    setAlleLedigeTider(prevLedigeTider => 
      prevLedigeTider.map(ledigTid => 
        String(ledigTid._id) === String(event._id)
          ? { ...ledigTid, datoTidFra: start, datoTidTil: end }
          : ledigTid
      )
    );

    axios.patch(`${import.meta.env.VITE_API_URL}/ledige-tider/${event._id}`, newEventBorders, {
      headers: {
        'Authorization': `Bearer ${user.token}`
      }
    })
    .then(res => {
      refetchLedigeTider ? setRefetchLedigeTider(false) : setRefetchLedigeTider(true)
    })
    .catch(error => console.log(error))
  }, [user, brugerID, setAlleLedigeTider, refetchLedigeTider, setRefetchLedigeTider]);

  const handleDateChange = (date) => {
    setChosenDate(date);
  }

  const opretLedigTid = useCallback((start, end) => {
    const startDayjs = dayjs(start);
    const endDayjs = dayjs(end);

    // Tjek for overlap med eksisterende ledige tider
    const tempAlleLedigeTider = alleLedigeTider || [];
    const overlappingTider = tempAlleLedigeTider.filter(tid => 
      tid.brugerID === brugerID &&
      (startDayjs.isBefore(dayjs(tid.datoTidTil)) && endDayjs.isAfter(dayjs(tid.datoTidFra)))
    );

    let finalStart = startDayjs;
    let finalEnd = endDayjs;

    if (overlappingTider.length > 0) {
      // Find min start og max end for at kombinere overlappende tider
      const allStarts = [startDayjs, ...overlappingTider.map(tid => dayjs(tid.datoTidFra))];
      const allEnds = [endDayjs, ...overlappingTider.map(tid => dayjs(tid.datoTidTil))];
      
      finalStart = dayjs.min(allStarts);
      finalEnd = dayjs.max(allEnds);

      // Fjern overlappende tider fra state først
      setAlleLedigeTider(prevLedigeTider => 
        prevLedigeTider.filter(tid => 
          !overlappingTider.some(overlapTid => overlapTid._id === tid._id)
        )
      );

      // Slet overlappende tider fra serveren
      overlappingTider.forEach(tid => {
        axios.delete(`${import.meta.env.VITE_API_URL}/ledige-tider/${tid._id}`, {
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        })
        .then(res => {
          console.log("Overlapping ledig tid slettet", res.data);
        })
        .catch(error => console.log(error));
      });
    }

    // Opdater lokal state med det samme for instant feedback
    const datoTidFraString = finalStart.format("YYYY-MM-DDTHH:mm:ss.SSS") + finalStart.format("Z");
    const datoTidTilString = finalEnd.format("YYYY-MM-DDTHH:mm:ss.SSS") + finalEnd.format("Z");

    const nyLedigTidTilState = {
      _id: `temp-${Date.now()}`, // Temporary ID
      datoTidFra: datoTidFraString,
      datoTidTil: datoTidTilString,
      brugerID: brugerID,
      objectIsLedigTid: true
    };

    setAlleLedigeTider(prevLedigeTider => [...prevLedigeTider, nyLedigTidTilState]);

    // Opret ledig tid på serveren
    const ledigTidTilServer = {
      datoTidFra: datoTidFraString,
      datoTidTil: datoTidTilString,
      brugerID: brugerID,
      objectIsLedigTid: true
    };

    axios.post(`${import.meta.env.VITE_API_URL}/ledige-tider`, [ledigTidTilServer], {
      headers: {
        'Authorization': `Bearer ${user.token}`
      }
    })
    .then(res => {
      // Opdater state med den rigtige ID fra serveren
      const oprettetLedigTid = res.data[0] || res.data; // API kan returnere array eller objekt
      setAlleLedigeTider(prevLedigeTider => 
        prevLedigeTider.map(tid => 
          tid._id === nyLedigTidTilState._id 
            ? oprettetLedigTid 
            : tid
        )
      );
      refetchLedigeTider ? setRefetchLedigeTider(false) : setRefetchLedigeTider(true);
    })
    .catch(error => {
      console.log(error);
      // Fjern den midlertidige ledig tid ved fejl
      setAlleLedigeTider(prevLedigeTider => 
        prevLedigeTider.filter(tid => tid._id !== nyLedigTidTilState._id)
      );
    });
  }, [brugerID, user, alleLedigeTider, setAlleLedigeTider, refetchLedigeTider, setRefetchLedigeTider]);

  const openCalendarSlot = useCallback((slotInfo) => {
    // Hvis det er et klik (ikke drag), og vi er i månedsvisning, skift til dag-visning
    if (slotInfo.action === "click" && view === "month") {
      setChosenDate(slotInfo.start);
      setView("day");
      return;
    }

    // Hvis det er et tidsrum (drag) i dag eller 3-dage visning, opret ledig tid
    if (slotInfo.action !== "click" && (view === "day" || view === "threeDay")) {
      const start = dayjs(slotInfo.start);
      const end = dayjs(slotInfo.end);
      
      // Tjek om start og end er på samme dag
      if (!start.isSame(end, 'day')) {
        // Hvis de er på forskellige dage, brug kun start-dagen og hele dagen
        const dayStart = start.startOf('day');
        const dayEnd = start.endOf('day');
        opretLedigTid(dayStart.toDate(), dayEnd.toDate());
      } else {
        opretLedigTid(slotInfo.start, slotInfo.end);
      }
    }
  }, [view, opretLedigTid]);

  return (
    <div className={Styles.calendarContainer}>
      <TradCalendar
        className={Styles.calendar}
        culture={'da'}
        localizer={localizer}
        events={ledigeTiderFormateret}
        backgroundEvents={[]}
        onSelectEvent={openCalendarEvent}
        onSelectSlot={openCalendarSlot}
        selectable={true}
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
        draggableAccessor={(event) => event.objectIsLedigTid ? true : false}
        onEventDrop={flytEllerÆndreEvent}
        onEventResize={flytEllerÆndreEvent}
        onView={(view) => setView(view)}
        onNavigate={handleDateChange}
        eventPropGetter={eventStyleGetter}
      />
      <Modal trigger={openDialog} setTrigger={setOpenDialog}>
        {eventData && (
          <>
            <h2 className={ModalStyles.modalHeading}>Ledig tid for {getBrugerName(eventData.brugerID)}</h2>
            <p><b className={ModalStyles.bold}>Dato & tid:</b> {eventData ? dayjs(eventData.datoTidFra).format("D. MMMM") : null}, kl. {eventData ? dayjs(eventData.datoTidFra).format("HH:mm") : null}-{eventData ? dayjs(eventData.datoTidTil).format("HH:mm") : null}</p>
            {(user.isAdmin || (eventData?.brugerID === brugerID)) && (
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
        )}
      </Modal>
    </div>
  )
}

export default LedighedsKalender

