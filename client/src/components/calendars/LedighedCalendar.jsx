import * as React from 'react';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import dayjs from 'dayjs';
import Styles from "./LedighedCalendar.module.css"
import { PickersDay } from '@mui/x-date-pickers/PickersDay';

function HighlightablePickersDay (props) {
  const { highlightedDays = [], day, ledigeTider, opgaveBesøg, outsideCurrentMonth, ...other } = props;
  
  const checkDayForLedighed = ledigeTider && ledigeTider.some((ledigTid) => 
    dayjs(ledigTid.datoTidFra).isSame(day, 'day')
  );
  
  const checkDayForOpgaver = opgaveBesøg && opgaveBesøg.some((planlagtOpgave) => 
    dayjs(planlagtOpgave.datoTidFra).isSame(day, 'day')
  ); 

  return (
    <div className={Styles.buttons}>
      <PickersDay {...other} outsideCurrentMonth={outsideCurrentMonth} day={day}/>
      <div className={Styles.highlightDiv}>
        {checkDayForLedighed && <div className={Styles.highlightØnsketUdført}></div>}
        {checkDayForOpgaver && <div className={Styles.highlightOpgaver}></div>}
      </div>
    </div>
  )
}

const LedighedCalendar = ({selectedDate, setSelectedDate, ledigeTider, opgaveBesøg}) => {

  return (
    <>
        <DateCalendar 
            className={Styles.yellow} 
            value={selectedDate} 
            onChange={(newValue) => {
                setSelectedDate(newValue);
            }}
            disableHighlightToday={false}
            displayWeekNumber={true}
            slots={{day: HighlightablePickersDay}}
            slotProps={{
              day: { ledigeTider, opgaveBesøg }
            }}
        />
    </>
  ) 
}

export default LedighedCalendar
