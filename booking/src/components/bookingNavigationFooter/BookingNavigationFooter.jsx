import React from 'react'
import Styles from './BookingNavigationFooter.module.css'

const BookingNavigationFooter = ({ currentStep, setCurrentStep, isLastStep, onConfirm, isSubmitting }) => {

  return (
    <div className={Styles.bookingNavigationFooter}>
      {currentStep > 1 && <button className={Styles.backButton} onClick={() => setCurrentStep(currentStep - 1)} disabled={isSubmitting}>Tilbage</button>}
      {isLastStep ? (
        <button className={Styles.nextButton} onClick={onConfirm} disabled={isSubmitting}>
          {isSubmitting ? 'Sender...' : 'Bekræft booking'}
        </button>
      ) : (
        <button className={Styles.nextButton} onClick={() => setCurrentStep(currentStep + 1)} disabled={isSubmitting}>Næste</button>
      )}
    </div>
  )
}

export default BookingNavigationFooter
