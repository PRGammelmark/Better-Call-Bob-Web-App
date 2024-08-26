import * as React from 'react';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import dayjs from 'dayjs';
import Styles from "./UserCalendar.module.css"
import { PickersDay } from '@mui/x-date-pickers/PickersDay';

function HighlightablePickersDay (props) {
  const { highlightedDays = [], day, ledigeTider, outsideCurrentMonth, ...other } = props;
  
  const checkDayForLedighed = ledigeTider && ledigeTider.some((ledigTid) => 
    dayjs(ledigTid.datoTidFra).isSame(day, 'day')
  );
  

  return (
    <div className={Styles.buttons}>
      <PickersDay {...other} outsideCurrentMonth={outsideCurrentMonth} day={day}/>
      {checkDayForLedighed && <div className={Styles.highlightØnsketUdført}></div>}
    </div>
  )
}

const UserCalendar = ({selectedDate, setSelectedDate, ledigeTider}) => {

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
              day: { ledigeTider }
            }}
        />
    </>
  ) 
}

export default UserCalendar
