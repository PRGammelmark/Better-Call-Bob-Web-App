import * as React from 'react';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import dayjs from 'dayjs';
import Styles from "./OpgavebesøgCalendar.module.css"
import { PickersDay } from '@mui/x-date-pickers/PickersDay';

function HighlightablePickersDay (props) {
  const { highlightedDays = [], day, userID, visKalender, planlagteOpgaver, egneBesøg, opgave, egneLedigeTider, outsideCurrentMonth, ...other } = props;
  
  // const checkDayForEgneOpgaver = planlagteOpgaver && planlagteOpgaver.some((planlagtOpgave) => 
  //   dayjs(planlagtOpgave.datoTidFra).isSame(day, 'day') && planlagtOpgave.brugerID !== userID
  // );

  const checkDayForEgneBesøg = egneBesøg && egneBesøg.some((besøg) => 
    dayjs(besøg.datoTidFra).isSame(day, 'day') && besøg.opgaveID === opgave._id
  );

  const checkDayForAndresOpgaver = planlagteOpgaver && planlagteOpgaver.some((planlagtOpgave) => 
    dayjs(planlagtOpgave.datoTidFra).isSame(day, 'day') && planlagtOpgave.brugerID !== userID
  );

  const checkDayForHighlight = opgave && dayjs(opgave.onsketDato).isSame(day, 'day');

  const checkDayForLedighed = egneLedigeTider && egneLedigeTider.some((ledigTid) => 
    dayjs(ledigTid.datoTidFra).isSame(day, 'day')
  );

  return (
    <div className={Styles.buttons}>
      <PickersDay {...other} outsideCurrentMonth={outsideCurrentMonth} day={day} />
  
      {checkDayForHighlight && (
        <div className={Styles.highlightØnsketUdført}></div>
      )}
  
      <div className={Styles.highlightDiv}>
        {visKalender ? (
          checkDayForLedighed && (
            <div className={Styles.highlightLedighed}>
              {checkDayForEgneBesøg && (
                <div className={Styles.highlightEgenPlanlagtOpgave}></div>
              )}
            </div>
          )
        ) : (
          (checkDayForEgneBesøg || checkDayForAndresOpgaver) && (
            <div className={Styles.highlightEgenPlanlagtOpgaveUdenLedighed}></div>
          )
        )}
  
        {visKalender ? checkDayForAndresOpgaver && (
          <div className={Styles.highlightAndresPlanlagteOpgaver}></div>
        ) : null}
      </div>
    </div>
  )
}

const LedighedCalendar = ({selectedOpgaveDate, setSelectedOpgaveDate, visKalender, planlagteOpgaver, egneBesøg, opgave, egneLedigeTider, userID }) => {

  return (
    <>
        <DateCalendar 
            className={Styles.yellow} 
            value={selectedOpgaveDate} 
            onChange={(newValue) => {
                setSelectedOpgaveDate(newValue);
            }}
            disableHighlightToday={false}
            displayWeekNumber={true}
            slots={{day: HighlightablePickersDay}}
            slotProps={{
              day: { planlagteOpgaver, opgave, egneLedigeTider, egneBesøg, userID, visKalender }
            }}
        />
    </>
  ) 
}

export default LedighedCalendar
