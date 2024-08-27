import * as React from 'react';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import dayjs from 'dayjs';
import Styles from "./DelegationCalendar.module.css"
import { PickersDay } from '@mui/x-date-pickers/PickersDay';

function HighlightablePickersDay (props) {
  const { highlightedDays = [], day, opgave, outsideCurrentMonth, ...other } = props;
  
  const checkDayForHighlight = opgave && dayjs(opgave.onsketDato).isSame(day, 'day');

  return (
    <div className={Styles.buttons}>
      <PickersDay {...other} outsideCurrentMonth={outsideCurrentMonth} day={day}/>
      {checkDayForHighlight && <div className={Styles.highlightØnsketUdført}></div>}
    </div>
  )
}

const DelegationCalendar = ({selectedDate, setSelectedDate, opgave}) => {

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
              day: { opgave }
            }}
        />
    </>
  ) 
}

export default DelegationCalendar
