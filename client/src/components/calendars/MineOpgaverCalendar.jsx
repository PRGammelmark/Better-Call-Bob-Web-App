import * as React from 'react';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import dayjs from 'dayjs';
import Styles from "./OpgavebesøgCalendar.module.css"
import { PickersDay } from '@mui/x-date-pickers/PickersDay';

function HighlightablePickersDay (props) {
  const { highlightedDays = [], day, userID, visLedighed, egneBesøg, egneLedigeTider, outsideCurrentMonth, ...other } = props;


  const checkDayForEgneBesøg = egneBesøg && egneBesøg.some((besøg) => 
    dayjs(besøg.datoTidFra).isSame(day, 'day')
  );

  const checkDayForLedighed = egneLedigeTider && egneLedigeTider.some((ledigTid) => 
    dayjs(ledigTid.datoTidFra).isSame(day, 'day')
  );

  return (
    <div className={Styles.buttons}>
      <PickersDay {...other} outsideCurrentMonth={outsideCurrentMonth} day={day} />
  
      <div className={Styles.highlightDiv}>
        {visLedighed ? (
          checkDayForLedighed && (
            <div className={Styles.highlightLedighed}>
              {checkDayForEgneBesøg && (
                <div className={Styles.highlightEgenPlanlagtOpgave}></div>
              )}
            </div>
          )
        ) : (
          (checkDayForEgneBesøg) && (
            <div className={Styles.highlightEgenPlanlagtOpgaveUdenLedighed}></div>
          )
        )}
      </div>
    </div>
  )
}

const LedighedCalendar = ({selectedOpgaveDate, setSelectedOpgaveDate, visLedighed, egneBesøg, egneLedigeTider, userID }) => {

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
              day: { egneLedigeTider, egneBesøg, userID, visLedighed }
            }}
        />
    </>
  ) 
}

export default LedighedCalendar
