import React from 'react'
import Styles from './BookingNavigationFooter.module.css'

const BookingNavigationFooter = ({ currentStep, setCurrentStep }) => {

  return (
    <div className={Styles.bookingNavigationFooter}>
      {currentStep > 1 && <button className={Styles.backButton} onClick={() => setCurrentStep(currentStep - 1)}>Tilbage</button>}
      <button className={Styles.nextButton} onClick={() => setCurrentStep(currentStep + 1)}>Næste</button>
    </div>
  )
}

export default BookingNavigationFooter
