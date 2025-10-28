import React, { useState, useMemo, useEffect, useRef } from 'react'
import Styles from './Kalender.module.css'
import MedarbejderKalender from './MedarbejderKalender.jsx'
import { useAuthContext } from '../../hooks/useAuthContext' 
import { format, addDays, startOfWeek, addWeeks, subWeeks, isSameDay } from "date-fns";
import KalenderHeader from './kalenderComponents/kalenderHeader/KalenderHeader'
import KalenderContentGrid from './kalenderComponents/kalenderContentGrid/KalenderContentGrid.jsx'



const Kalender = () => {
    const today = new Date()
    const [weekOffset, setWeekOffset] = useState(0);
    const [twoDayStartOffset, setTwoDayStartOffset] = useState(0);
    const [selectedDate, setSelectedDate] = useState(today);
    const scrollableRef = useRef(null);

    const weekStart = useMemo(() => startOfWeek(addWeeks(new Date(), weekOffset), { weekStartsOn: 1 }), [weekOffset]);
    const twoDayStart = useMemo(() => addDays(new Date(), twoDayStartOffset), [twoDayStartOffset]);

    const getWeekDays = (offset) => {
        const weekStart = addDays(startOfWeek(today, { weekStartsOn: 1 }), offset * 7)
        return Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i))
    }

    const prevWeek = getWeekDays(weekOffset - 1)
    const currentWeek = getWeekDays(weekOffset)
    const nextWeek = getWeekDays(weekOffset + 1)

    return (
        <div className={Styles.kalenderContainer} ref={scrollableRef}>
            <KalenderHeader weekStart={weekStart} selectedDate={selectedDate} setSelectedDate={setSelectedDate} weekOffset={weekOffset} setWeekOffset={setWeekOffset} prevWeek={prevWeek} currentWeek={currentWeek} nextWeek={nextWeek} />
            <KalenderContentGrid weekStart={weekStart} selectedDate={selectedDate} setSelectedDate={setSelectedDate} weekOffset={weekOffset} setWeekOffset={setWeekOffset} prevWeek={prevWeek} currentWeek={currentWeek} nextWeek={nextWeek} scrollableRef={scrollableRef} />
        </div>
    )
}

export default Kalender