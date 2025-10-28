import React, { useState, useLayoutEffect } from 'react'
import Styles from './KalenderTwoDayViewHeader.module.css'
import dayjs from 'dayjs'

const kalenderTwoDayViewHeader = ({ selectedDate, setSelectedDate, weekStart, weekOffset, setWeekOffset, prevWeek, currentWeek, nextWeek, allWeekDays }) => {

  const [enableTransition, setEnableTransition] = useState(false)

  useLayoutEffect(() => {
      setEnableTransition(true)
      setTimeout(() => {
          requestAnimationFrame(() => setEnableTransition(false))  
      }, 300)
  }, [selectedDate])

  // --- Placering af grid ---
  const today = dayjs()
  const firstDay = dayjs(prevWeek[0]) // forrige uges mandag
  const dayDiff = dayjs(selectedDate).diff(firstDay, 'day') // antal dage fra forrige mandag til i dag

  // vi viser 28 dage, så hver dag = 100/28 procent af bredden
  const translateX = `calc(-${dayDiff} * (100% / 28))`

  return (
    <div className={Styles.kalenderTwoDayViewHeaderContainer}>
        <div className={Styles.kalenderTwoDayViewHeaderBlankCorner}></div>
        <div className={Styles.kalenderTwoDayViewHeaderContent} style={{
            transform: `translateX(${translateX})`,
            transition: enableTransition ? 'transform 0.3s ease' : 'none'
          }}>
            {allWeekDays.map((day, index) => (
                    <div key={index} className={Styles.headerDay}><b>{day.label}</b></div>
            ))}

        </div>
    </div>
  )
}

export default kalenderTwoDayViewHeader
