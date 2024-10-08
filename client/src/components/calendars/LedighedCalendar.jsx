import * as React from 'react';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import dayjs from 'dayjs';
import Styles from "./LedighedCalendar.module.css"
import { PickersDay } from '@mui/x-date-pickers/PickersDay';

function HighlightablePickersDay (props) {
  const { highlightedDays = [], day, egneBesøg, egneLedigeTider, opgaveBesøg, outsideCurrentMonth, ...other } = props;
  
  const checkDayForLedighed = egneLedigeTider && egneLedigeTider.some((ledigTid) => 
    dayjs(ledigTid.datoTidFra).isSame(day, 'day')
  );
  
  const checkDayForEgneBesøg = egneBesøg && egneBesøg.some((besøg) => 
    dayjs(besøg.datoTidFra).isSame(day, 'day')
  );

  return (
    <div className={Styles.buttons}>
      <PickersDay {...other} outsideCurrentMonth={outsideCurrentMonth} day={day} />
  
      <div className={Styles.highlightDiv}>
        {checkDayForLedighed && (
            <div className={Styles.highlightLedighed}>
              {checkDayForEgneBesøg && (
                <div className={Styles.highlightEgenPlanlagtOpgave}></div>
              )}
            </div>
        )}
      </div>
    </div>
  )
}

const LedighedCalendar = ({selectedDate, setSelectedDate, egneLedigeTider, egneBesøg}) => {

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
              day: { egneLedigeTider, egneBesøg }
            }}
        />
    </>
  ) 
}

export default LedighedCalendar
