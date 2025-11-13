import React from 'react'
import Styles from './BookingContent.module.css'

const BookingContent = ({ currentStep, steps }) => {
  const step = steps[currentStep - 1]

  return (
    <div className={Styles.bookingContent}>
        {step?.render && step.render()}
    </div>
  )
}

export default BookingContent
