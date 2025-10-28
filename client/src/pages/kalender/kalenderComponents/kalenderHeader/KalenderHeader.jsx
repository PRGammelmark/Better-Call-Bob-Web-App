import React, { useRef, useState, useEffect } from 'react'
import Styles from './KalenderHeader.module.css'
import { addDays, format, isSameDay, startOfWeek } from 'date-fns'

const KalenderHeader = ({ weekOffset, setWeekOffset, selectedDate, setSelectedDate, prevWeek, currentWeek, nextWeek }) => {
  const today = new Date()
  const [dragTranslate, setDragTranslate] = useState(0)
  const [transition, setTransition] = useState('0.2s ease')
  const dragStartX = useRef(0)
  const wrapperRef = useRef(null)
  const isDragging = useRef(false)

  const handleDragStart = (clientX) => {
    isDragging.current = true
    dragStartX.current = clientX
  }

  const handleDragMove = (clientX) => {
    if (!isDragging.current) return
    setDragTranslate(clientX - dragStartX.current)
  }

  const handleDragEnd = (clientX) => {
    if (!isDragging.current) return
    const weekWidth = wrapperRef.current.offsetWidth
    const dragDistance = clientX - dragStartX.current
    const threshold = 90
    let newOffset = weekOffset
  
    if (dragDistance > threshold) {
      newOffset = weekOffset - 1
      setDragTranslate(weekWidth) // flyt ugen til højre for snap
      setTimeout(() => {
        setSelectedDate(addDays(selectedDate, -7))
      }, 200)
    } else if (dragDistance < -threshold) {
      newOffset = weekOffset + 1
      setDragTranslate(-weekWidth) // flyt ugen til venstre for snap
      setTimeout(() => {
        setSelectedDate(addDays(selectedDate, 7))
      }, 200)
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
      }, 100)
      setTimeout(() => {
        setTransition("0.2s ease")
      }, 200)
    }
  }

  return (
    <div className={Styles.headerWeekWrapper}>
      <div className={Styles.headerControls}>
        {/* Statisk daginitialer */}
        <div className={Styles.weekDays}>
          {['M','T','O','T','F','L','S'].map((initial, i) => (
            <div key={i} className={Styles.dayCell}>
              <div className={Styles.dayName}>{initial}</div>
            </div>
          ))}
        </div>

        {/* Wrapper for 3 uger */}
        <div
          className={Styles.weekDaysWrapper}
          style={{
            transform: `translateX(calc(-33.33% + ${dragTranslate}px))`,
            transition: isDragging.current ? 'none' : transition
          }}
          onMouseDown={e => handleDragStart(e.clientX)}
          onMouseMove={e => { if (isDragging.current) { e.preventDefault(); handleDragMove(e.clientX) } }}
          onMouseUp={e => handleDragEnd(e.clientX)}
          onMouseLeave={e => handleDragEnd(e.clientX)}
          onTouchStart={e => handleDragStart(e.touches[0].clientX)}
          onTouchMove={e => { if (isDragging.current) { e.preventDefault(); handleDragMove(e.touches[0].clientX) } }}
          onTouchEnd={e => handleDragEnd(e.changedTouches[0].clientX)}
        >
          {[prevWeek, currentWeek, nextWeek].map((week, idx) => (
            <div key={idx} className={Styles.week} ref={wrapperRef}>
              {week.map(d => {
                const isToday = isSameDay(d, today)
                const isSelected = isSameDay(d, selectedDate)
                return (
                  <div
                    key={d.toISOString()}
                    onClick={() => setSelectedDate(d)}
                    className={`${Styles.dayCell} ${isToday ? Styles.currentDate : ''} ${isSelected ? Styles.selectedDate : ''}`}
                  >
                    <div className={Styles.dayNumber}>{format(d, 'd')}</div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default KalenderHeader
