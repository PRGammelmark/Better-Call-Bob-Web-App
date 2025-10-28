import React, { useState, useLayoutEffect, useEffect, useRef } from 'react'
import Styles from './KalenderTwoDayView2.module.css'
import dayjs from 'dayjs'

const KalenderTwoDayView2 = ({ weekStart, selectedDate, setSelectedDate, weekOffset, setWeekOffset, prevWeek, currentWeek, nextWeek, allWeekDays }) => {
    const today = dayjs()
    const [enableTransition, setEnableTransition] = useState(false)
    const [dragTranslate, setDragTranslate] = useState(0)
    const [transition, setTransition] = useState('0.2s ease')
    const dragStartX = useRef(0)
    const dayWrapperRef = useRef(null)
    const isDragging = useRef(false)
    // let translateX

    useLayoutEffect(() => {
        setEnableTransition(true)
        setTimeout(() => {
            requestAnimationFrame(() => setEnableTransition(false))  
        }, 300)
    }, [selectedDate])

    useEffect(() => {
        // --- Placering af grid ---
        const firstDay = dayjs(prevWeek[0]) // forrige uges mandag
        const dayDiff = dayjs(selectedDate).diff(firstDay, 'day') // antal dage fra forrige mandag til i dag

        // vi viser 28 dage, så hver dag = 100/28 procent af bredden
        const translateX = `calc(-${dayDiff} * (100% / 28))`
    }, [selectedDate])

    // Sidebar hours
    const hours = Array.from({ length: 25 }, (_, i) => {
        const hour = i === 24 ? 0 : i
        return `${hour.toString().padStart(2, '0')}.00`
    })

    // Single day hour cells
    const singleDayHourCells = []
    for (let i = 0; i < 24; i++) {
        singleDayHourCells.push(<div key={i} className={Styles.kalenderHourCell}></div>)
    }

    // // --- Placering af grid ---
    // const firstDay = dayjs(prevWeek[0]) // forrige uges mandag
    // const dayDiff = dayjs(selectedDate).diff(firstDay, 'day') // antal dage fra forrige mandag til i dag

    // // vi viser 28 dage, så hver dag = 100/28 procent af bredden
    // const translateX = `calc(-${dayDiff} * (100% / 28))`

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
        const weekWidth = dayWrapperRef.current.offsetWidth
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
    <>
    <div className={Styles.kalenderTwoDayViewContainer}>
        <div className={Styles.kalenderTwoDayViewSidebar}>
            {hours.map((time) => (
                <div key={time} className={Styles.timeSlot}>{time}</div>
            ))}
        </div>
        <div className={Styles.kalenderTwoDayViewContentGrid} ref={dayWrapperRef} style={{
            transform: `translateX(${translateX})`,
            transition: enableTransition ? 'transform 0.3s ease' : 'none'
          }}
          onMouseDown={e => handleDragStart(e.clientX)}
          onMouseMove={e => { if (isDragging.current) { e.preventDefault(); handleDragMove(e.clientX) } }}
          onMouseUp={e => handleDragEnd(e.clientX)}
          onMouseLeave={e => handleDragEnd(e.clientX)}
          onTouchStart={e => handleDragStart(e.touches[0].clientX)}
          onTouchMove={e => { if (isDragging.current) { e.preventDefault(); handleDragMove(e.touches[0].clientX) } }}
          onTouchEnd={e => handleDragEnd(e.changedTouches[0].clientX)}
          >
            {allWeekDays.map((day, index) => (
                <div key={index} className={Styles.dayGrid}>
                    {singleDayHourCells}
                    {/* <div className={Styles.dayGridHeader}><p>{day.label}</p></div> */}
                </div>
            ))}
        </div>
    </div>





    {/* BACKGROUND LINES – DO NOT EDIT THIS */}
    <div className={Styles.kalenderTwoDayViewBackgroundLines}>
        <div className={Styles.kalenderTwoDayViewBackgroundLineSidebar}></div>
        <div className={Styles.kalenderTwoDayViewBackgroundLineFirstDayContainer}></div>
        <div className={Styles.kalenderTwoDayViewBackgroundLineSecondDayContainer}></div>
    </div>
    {/* END BACKGROUND LINES */}
    </>
  )
}

export default KalenderTwoDayView2
