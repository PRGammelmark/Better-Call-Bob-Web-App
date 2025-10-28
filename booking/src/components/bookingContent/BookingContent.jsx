import React from 'react'
import Styles from './BookingContent.module.css'

const BookingContent = ({ currentStep, steps }) => {
  return (
    <div className={Styles.bookingContent}>
        {steps[currentStep - 1].content}
    </div>
  )
}

export default BookingContent
