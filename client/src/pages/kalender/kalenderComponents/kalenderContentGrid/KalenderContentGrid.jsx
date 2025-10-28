import React, { useState, useRef } from 'react'
import Styles from './KalenderContentGrid.module.css'
import KalenderSidebar from './kalenderSidebar/KalenderSidebar'
import { format } from 'date-fns'
import dayjs from 'dayjs'

const KalenderContentGrid = ({ weekStart, selectedDate, setSelectedDate, weekOffset, setWeekOffset, prevWeek, currentWeek, nextWeek, scrollableRef }) => {
  const [dragTranslate, setDragTranslate] = useState(0)
  const [transition, setTransition] = useState('0.2s ease')
  const dragDirection = useRef(null)
  const dragStartX = useRef(0)
  // const scrollableRef = useRef(null)
  const wrapperRef = useRef(null)
  const isDragging = useRef(false)

  const singleDayHourCells = []
  for (let i = 0; i < 24; i++) {
    singleDayHourCells.push(<div key={i} className={Styles.kalenderCell}></div>)
  }

  const prevWeekDays = prevWeek.map((day) => {
    return {
      label: dayjs(day).format('dddd – DD. MMM')
    }
  })

  const currentWeekDays = currentWeek.map((day) => {
    return {
      label: dayjs(day).format('dddd – DD. MMM')
    }
  })

  const nextWeekDays = nextWeek.map((day) => {
    return {
      label: dayjs(day).format('dddd – DD. MMM')
    }
  })

  const allWeekDays = [...prevWeekDays, ...currentWeekDays, ...nextWeekDays]

  const hours = Array.from({ length: 25 }, (_, i) => {
    const hour = i === 24 ? 0 : i
    return `${hour.toString().padStart(2, '0')}.00`
  })

  const handleDragStart = (clientX, clientY) => {
    isDragging.current = true
    dragStartX.current = {x: clientX, y: clientY}
    dragDirection.current = null
  }

  const handleDragMove = (clientX, clientY) => {
    if (!isDragging.current) return

    const deltaX = clientX - dragStartX.current.x;
    const deltaY = clientY - dragStartX.current.y;

    if (!dragDirection.current) {
      if (Math.abs(deltaX) > 10) {
        dragDirection.current = 'horizontal';
        scrollableRef.current.classList.add(Styles.touchLock);
      } else if (Math.abs(deltaY) > 10) {
        dragDirection.current = 'vertical';
      } else {
        return; // endnu for lille bevægelse
      }
    }

    if (dragDirection.current === 'horizontal') {
      setDragTranslate(deltaX);
    }
  }

  const handleDragEnd = (clientX) => {
    if (!isDragging.current) return

    scrollableRef.current.classList.remove(Styles.touchLock);
    
    if (!isDragging.current || dragDirection.current === 'vertical') {
      isDragging.current = false;
      return;
    }
    
    const weekWidth = wrapperRef.current.offsetWidth
    const dragDistance = clientX - dragStartX.current
    const threshold = 90
    let newOffset = weekOffset
  
    if (dragDistance > threshold) {
      newOffset = weekOffset - 1
      setDragTranslate(weekWidth) // flyt ugen til højre for snap
    } else if (dragDistance < -threshold) {
      newOffset = weekOffset + 1
      setDragTranslate(-weekWidth) // flyt ugen til venstre for snap
    } else {
      setDragTranslate(0) // tilbage til midten
    }
  
    isDragging.current = false
  
    // Opdater weekOffset EFTER en lille timeout, så det sker efter transitionen
    // State-rækkefølge vigtig her – ellers glitcher transitionen
    if (newOffset !== weekOffset) {
      setTimeout(() => {
        setTransition("none")
        setWeekOffset(newOffset);
        setDragTranslate(0)
      }, 200)
      setTimeout(() => {
        setTransition("0.2s ease")
      }, 300)
    }
  }

  return (
    <div className={Styles.kalenderContentGridWrapper}>
    <div className={Styles.kalenderContentGrid} ref={scrollableRef}>
      <KalenderSidebar />
      <div className={Styles.kalenderContentGridDaysWrapper}
      style={{
        transform: `translateX(calc(-33.33% + ${dragTranslate}px))`,
        transition: isDragging.current ? 'none' : transition
      }}
      onTouchStart={e => handleDragStart(e.touches[0].clientX, e.touches[0].clientY)}
      onTouchMove={e => handleDragMove(e.touches[0].clientX, e.touches[0].clientY)}
      onTouchEnd={e => handleDragEnd(e.changedTouches[0].clientX)}
      >
        {/* <KalenderSidebar /> */}
        {allWeekDays.map((day, index) => (
          <div key={index} className={Styles.kalenderContentGridDay}>
            <div className={Styles.kalenderContentGridDayHeader}><p className={Styles.kalenderContentGridDayHeaderText}>{day.label}</p></div>
            <div className={Styles.kalenderContentGridDayBody}>
              {singleDayHourCells}
            </div>
          </div>
        ))}
      </div>
    </div>
    </div>
  )
}

export default KalenderContentGrid