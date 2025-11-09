import React from 'react'
import Styles from './Tooltip.module.css'

const Tooltip = ({ content, children, position = 'top' }) => {
  return (
    <span className={Styles.tooltipWrapper} data-position={position}>
      {children}
      <span className={Styles.tooltipBubble} role="tooltip">
        {content}
        <span className={Styles.tooltipArrow} />
      </span>
    </span>
  )
}

export default Tooltip


