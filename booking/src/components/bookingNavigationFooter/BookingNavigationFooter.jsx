import React from 'react'
import Styles from './BookingNavigationFooter.module.css'
import Tooltip from '../basicComponents/Tooltip'

const BookingNavigationFooter = ({ currentStep, setCurrentStep, isLastStep, onConfirm, isSubmitting, recaptchaSiteKey, isStepValid = true, shouldPulse = false, wordCount = 0, antalBesvaredeSpørgsmål = 0, onShowSummary }) => {

  // Determine tooltip message for disabled "Næste" button
  const getDisabledTooltipMessage = () => {
    if (isSubmitting) {
      return 'Sender...'
    }
    if (!isStepValid) {
      if (currentStep === 1) {
        return `Beskriv din opgave med mindst 5 ord (${wordCount}/5)`
      }
      if (currentStep === 4 || isLastStep) {
        return 'Udfyld alle påkrævede felter (Fulde navn, Mail og Accept af handelsbetingelser)'
      }
      return 'Udfyld alle påkrævede felter for at fortsætte'
    }
    return null
  }

  const isNextButtonDisabled = isSubmitting || !isStepValid
  const tooltipMessage = isNextButtonDisabled ? getDisabledTooltipMessage() : null

  // Determine button text for step 2 (Ekstra step)
  const getNextButtonText = () => {
    if (currentStep === 2 && antalBesvaredeSpørgsmål === 0) {
      return 'Spring over'
    }
    return 'Næste'
  }

  const nextButtonText = getNextButtonText()

  return (
    <div className={Styles.bookingNavigationFooter}>
      {/* <button className={Styles.summaryButton} onClick={onShowSummary}>Opsummering</button> */}
      {currentStep > 1 && <button className={Styles.backButton} onClick={() => setCurrentStep(currentStep - 1)} disabled={isSubmitting}>Tilbage</button>}
      {isLastStep ? (
        tooltipMessage ? (
          <>
            <Tooltip content={tooltipMessage} position="top">
              <button 
                className={`${Styles.nextButton} ${Styles.mobileSummaryButton}`}
                onClick={onShowSummary}
                disabled={isSubmitting || !isStepValid}
              >
                Opsummering & bekræft
              </button>
            </Tooltip>
            <Tooltip content={tooltipMessage} position="top">
              {recaptchaSiteKey ? (
                <button 
                  className={`${Styles.nextButton} ${Styles.desktopConfirmButton} g-recaptcha`}
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
                  disabled={isSubmitting || !isStepValid}
                >
                  {isSubmitting ? 'Sender...' : 'Bekræft booking'}
                </button>
              ) : (
                <button 
                  className={`${Styles.nextButton} ${Styles.desktopConfirmButton}`}
                  onClick={onConfirm} 
                  disabled={isSubmitting || !isStepValid}
                >
                  {isSubmitting ? 'Sender...' : 'Bekræft booking'}
                </button>
              )}
            </Tooltip>
          </>
        ) : (
          <>
            <button 
              className={`${Styles.nextButton} ${Styles.mobileSummaryButton}`}
              onClick={onShowSummary}
              disabled={isSubmitting || !isStepValid}
            >
              Opsummering & bekræft
            </button>
            {recaptchaSiteKey ? (
              <button 
                className={`${Styles.nextButton} ${Styles.desktopConfirmButton} g-recaptcha`}
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
                disabled={isSubmitting || !isStepValid}
              >
                {isSubmitting ? 'Sender...' : 'Bekræft booking'}
              </button>
            ) : (
              <button 
                className={`${Styles.nextButton} ${Styles.desktopConfirmButton}`}
                onClick={onConfirm} 
                disabled={isSubmitting || !isStepValid}
              >
                {isSubmitting ? 'Sender...' : 'Bekræft booking'}
              </button>
            )}
          </>
        )
      ) : (
        tooltipMessage ? (
          <Tooltip content={tooltipMessage} position="top">
            <button 
              className={`${Styles.nextButton} ${shouldPulse ? Styles.pulsating : ''}`}
              onClick={() => setCurrentStep(currentStep + 1)} 
              disabled={isNextButtonDisabled}
            >
              {nextButtonText}
            </button>
          </Tooltip>
        ) : (
          <button 
            className={`${Styles.nextButton} ${shouldPulse ? Styles.pulsating : ''}`}
            onClick={() => setCurrentStep(currentStep + 1)} 
            disabled={isNextButtonDisabled}
          >
            {nextButtonText}
          </button>
        )
      )}
    </div>
  )
}

export default BookingNavigationFooter
