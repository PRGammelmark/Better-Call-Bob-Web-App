import React from 'react'
import { useTranslation } from 'react-i18next'
import Styles from './BookingNavigationFooter.module.css'
import Tooltip from '../basicComponents/Tooltip'

const BookingNavigationFooter = ({ currentStep, setCurrentStep, isLastStep, onConfirm, isSubmitting, recaptchaSiteKey, isStepValid = true, shouldPulse = false, wordCount = 0, onShowSummary }) => {
  const { t } = useTranslation()

  // Determine tooltip message for disabled "Næste" button
  const getDisabledTooltipMessage = () => {
    if (isSubmitting) {
      return t('buttons.sender')
    }
    if (!isStepValid) {
      if (currentStep === 1) {
        return t('validation.mindst5Ord', { count: wordCount })
      }
      if (currentStep === 3 || isLastStep) {
        return t('validation.udfyldAlleFelterKontakt')
      }
      return t('validation.udfyldAlleFelter')
    }
    return null
  }

  const isNextButtonDisabled = (isSubmitting !== undefined ? isSubmitting : false) || !isStepValid
  const tooltipMessage = isNextButtonDisabled ? getDisabledTooltipMessage() : null

  const nextButtonText = t('buttons.naeste')

  return (
    <div className={Styles.bookingNavigationFooter}>
      {/* <button className={Styles.summaryButton} onClick={onShowSummary}>Opsummering</button> */}
      {currentStep > 1 && <button className={Styles.backButton} onClick={() => setCurrentStep(currentStep - 1)} disabled={isSubmitting}>{t('buttons.tilbage')}</button>}
      {isLastStep ? (
        tooltipMessage ? (
          <>
            <Tooltip content={tooltipMessage} position="top">
              <button 
                className={`${Styles.nextButton} ${Styles.mobileSummaryButton}`}
                onClick={onShowSummary}
                disabled={isSubmitting || !isStepValid}
              >
                {t('buttons.opsummeringBekraeft')}
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
                  {isSubmitting ? t('buttons.sender') : t('buttons.bekraeftBooking')}
                </button>
              ) : (
                <button 
                  className={`${Styles.nextButton} ${Styles.desktopConfirmButton}`}
                  onClick={onConfirm} 
                  disabled={isSubmitting || !isStepValid}
                >
                  {isSubmitting ? t('buttons.sender') : t('buttons.bekraeftBooking')}
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
              {t('buttons.opsummeringBekraeft')}
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
                {isSubmitting ? t('buttons.sender') : t('buttons.bekraeftBooking')}
              </button>
            ) : (
              <button 
                className={`${Styles.nextButton} ${Styles.desktopConfirmButton}`}
                onClick={onConfirm} 
                disabled={isSubmitting || !isStepValid}
              >
                {isSubmitting ? t('buttons.sender') : t('buttons.bekraeftBooking')}
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
              {isSubmitting ? (
                <span className={Styles.buttonContent}>
                  <span className={Styles.spinner}></span>
                  {t('buttons.sender')}
                </span>
              ) : (
                nextButtonText
              )}
            </button>
          </Tooltip>
        ) : (
          <button 
            className={`${Styles.nextButton} ${shouldPulse ? Styles.pulsating : ''}`}
            onClick={() => setCurrentStep(currentStep + 1)} 
            disabled={isNextButtonDisabled}
          >
            {isSubmitting ? (
              <span className={Styles.buttonContent}>
                <span className={Styles.spinner}></span>
                {t('buttons.sender')}
              </span>
            ) : (
              nextButtonText
            )}
          </button>
        )
      )}
    </div>
  )
}

export default BookingNavigationFooter
