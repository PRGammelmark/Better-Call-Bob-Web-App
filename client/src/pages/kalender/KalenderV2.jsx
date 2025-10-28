import React, { useState, useMemo, useEffect, useRef } from 'react'
import Styles from './KalenderV2.module.css'
import MedarbejderKalender from './MedarbejderKalender.jsx'
import { useAuthContext } from '../../hooks/useAuthContext' 
import { format, addDays, startOfWeek, addWeeks, subWeeks, isSameDay } from "date-fns";
import KalenderHeader from './kalenderComponents/kalenderHeader/KalenderHeader'
import KalenderContentGrid from './kalenderComponents/kalenderContentGrid/KalenderContentGrid.jsx'
import KalenderTwoDayViewHeader2 from './kalenderComponents/kalenderTwoDayViewHeader/kalenderTwoDayViewHeader2.jsx'
import KalenderTwoDayView2 from './kalenderComponents/kalenderTwoDayView/KalenderTwoDayView.jsx'
import dayjs from 'dayjs'



const Kalender = () => {
    const today = new Date()
    const [weekOffset, setWeekOffset] = useState(0);
    const [twoDayStartOffset, setTwoDayStartOffset] = useState(0);
    const [selectedDate, setSelectedDate] = useState(today);

    const weekStart = useMemo(() => startOfWeek(addWeeks(new Date(), weekOffset), { weekStartsOn: 1 }), [weekOffset]);
    const twoDayStart = useMemo(() => addDays(new Date(), twoDayStartOffset), [twoDayStartOffset]);

    const getWeekDays = (offset) => {
        const weekStart = addDays(startOfWeek(today, { weekStartsOn: 1 }), offset * 7)
        return Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i))
    }

    const prevWeek = getWeekDays(weekOffset - 1)
    const currentWeek = getWeekDays(weekOffset)
    const nextWeek = getWeekDays(weekOffset + 1)
    const nextNextWeek = getWeekDays(weekOffset + 2)

    const prevWeekDays = prevWeek.map((day) => {
        return {
          label: dayjs(day).format('ddd – DD. MMM')
        }
      })
    
      const currentWeekDays = currentWeek.map((day) => {
        return {
          label: dayjs(day).format('ddd – DD. MMM')
        }
      })
    
      const nextWeekDays = nextWeek.map((day) => {
        return {
          label: dayjs(day).format('ddd – DD. MMM')
        }
      })

      const nextNextWeekDays = nextNextWeek.map((day) => {
        return {
          label: dayjs(day).format('ddd – DD. MMM')
        }
      })
    
      const allWeekDays = [...prevWeekDays, ...currentWeekDays, ...nextWeekDays, ...nextNextWeekDays]

    return (
        <div className={Styles.kalenderContainer}>
            <KalenderHeader weekStart={weekStart} selectedDate={selectedDate} setSelectedDate={setSelectedDate} weekOffset={weekOffset} setWeekOffset={setWeekOffset} prevWeek={prevWeek} currentWeek={currentWeek} nextWeek={nextWeek} nextNextWeek={nextNextWeek} />
            <KalenderTwoDayViewHeader selectedDate={selectedDate} setSelectedDate={setSelectedDate} weekStart={weekStart} weekOffset={weekOffset} setWeekOffset={setWeekOffset} prevWeek={prevWeek} currentWeek={currentWeek} nextWeek={nextWeek} nextNextWeek={nextNextWeek} allWeekDays={allWeekDays}/>
            <KalenderTwoDayView weekStart={weekStart} selectedDate={selectedDate} setSelectedDate={setSelectedDate} weekOffset={weekOffset} setWeekOffset={setWeekOffset} prevWeek={prevWeek} currentWeek={currentWeek} nextWeek={nextWeek} nextNextWeek={nextNextWeek} allWeekDays={allWeekDays}/>
        </div>
    )
}

export default Kalender