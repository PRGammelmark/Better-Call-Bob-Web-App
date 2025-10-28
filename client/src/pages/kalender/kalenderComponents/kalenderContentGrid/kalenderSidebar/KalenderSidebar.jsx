import React from 'react'
import Styles from './KalenderSidebar.module.css'

const KalenderSidebar = ({ verticalScroll }) => {
  const hours = Array.from({ length: 25 }, (_, i) => {
    const hour = i === 24 ? 0 : i
    return `${hour.toString().padStart(2, '0')}.00`
  })

  return (
    <div className={Styles.kalenderSidebar}>
      <div className={Styles.kalenderSidebarHeader}></div>
      <div className={Styles.kalenderSidebarBody}>
        {hours.map((time) => (
          <div key={time} className={Styles.timeSlot}>{time}</div>
        ))}
      </div>
    </div>
  )
}

export default KalenderSidebar