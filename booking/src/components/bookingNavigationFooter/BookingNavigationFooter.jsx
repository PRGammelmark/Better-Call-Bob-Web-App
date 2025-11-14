import React from 'react'
import Styles from './BookingNavigationFooter.module.css'

const BookingNavigationFooter = ({ currentStep, setCurrentStep, isLastStep, onConfirm, isSubmitting, recaptchaSiteKey, isStepValid = true, shouldPulse = false }) => {

  return (
    <div className={Styles.bookingNavigationFooter}>
      {currentStep > 1 && <button className={Styles.backButton} onClick={() => setCurrentStep(currentStep - 1)} disabled={isSubmitting}>Tilbage</button>}
      {isLastStep ? (
        recaptchaSiteKey ? (
          <button 
            className={`${Styles.nextButton} g-recaptcha`}
            data-sitekey={recaptchaSiteKey}
            data-callback="onRecaptchaSubmit"
            data-action="submit"
            onClick={(e) => {
              // Prevent default form submission if callback handles it
              // The callback will be called by reCAPTCHA, but we also handle onClick as fallback
              e.preventDefault()
              // Only call onConfirm if callback hasn't been triggered
              // This is a fallback if reCAPTCHA callback doesn't work
              if (!window.recaptchaCallbackTriggered) {
                onConfirm()
              }
            }}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Sender...' : 'Bekræft booking'}
          </button>
        ) : (
          <button className={Styles.nextButton} onClick={onConfirm} disabled={isSubmitting}>
            {isSubmitting ? 'Sender...' : 'Bekræft booking'}
          </button>
        )
      ) : (
        <button 
          className={`${Styles.nextButton} ${shouldPulse ? Styles.pulsating : ''}`}
          onClick={() => setCurrentStep(currentStep + 1)} 
          disabled={isSubmitting || !isStepValid}
        >
          Næste
        </button>
      )}
    </div>
  )
}

export default BookingNavigationFooter
