import React from 'react'
import { useTranslation } from 'react-i18next'
import Styles from './BookingHeader.module.css'
import Tooltip from '../basicComponents/Tooltip'

const BookingHeader = ({ 
  currentStep, 
  setCurrentStep, 
  steps, 
  canNavigateToStep2, 
  canNavigateToStep3, 
  wordCount = 0,
  valgtDato,
  valgtTidspunkt,
  manualTimePreference = '',
  availableWorkerIDs = [],
  isLoadingWorkers = false
}) => {
  const { t } = useTranslation()
  const progress = ((currentStep - 1) / (steps.length - 1)) * 100

  // Determine if a step can be clicked
  const canClickStep = (stepIndex) => {
    const stepNumber = stepIndex + 1
    
    // Step 1 is always clickable (can always go back)
    if (stepNumber === 1) {
      return true
    }
    
    // Step 2: clickable if step 1 condition is met (same as next button on step 1)
    if (stepNumber === 2) {
      return canNavigateToStep2
    }
    
    // Step 3: clickable if step 2 condition is met
    if (stepNumber === 3) {
      return canNavigateToStep3
    }
    
    // Default: allow clicking
    return true
  }

  // Get tooltip message for disabled steps
  const getDisabledTooltipMessage = (stepIndex) => {
    const stepNumber = stepIndex + 1
    
    if (stepNumber === 2) {
      return t('tooltips.beskrivDinOpgaveMindst5Ord', { count: wordCount })
    }
    
    if (stepNumber === 3) {
      return t('tooltips.beskrivDinOpgaveMindst5Ord', { count: wordCount })
    }
    
    if (stepNumber === 4) {
      // Check what's missing for step 3
      // if (availableWorkerIDs.length > 0) {
      //   if (!valgtDato) {
      //     return t('tooltips.vaelgEnDatoFoerst')
      //   }
      //   if (!valgtTidspunkt) {
      //     return t('tooltips.vaelgEtTidspunktFoerst')
      //   }
      // } else {
      //   if (isLoadingWorkers) {
      //     return t('tooltips.venterPaaLedigeMedarbejdere')
      //   }
      //   if (!manualTimePreference || !manualTimePreference.trim()) {
      //     return t('tooltips.udfyldOensketTidspunktFoerst')
      //   }
      // }
      return t('tooltips.udfyldStep3TidOgSted')
    }
    
    return null
  }

  const handleStepClick = (stepIndex) => {
    const stepNumber = stepIndex + 1
    if (canClickStep(stepIndex)) {
      setCurrentStep(stepNumber)
    }
  }

  return (
    <div className={Styles.bookingHeader}>
      <div className={Styles.progressWrapper}>
        <div className={Styles.progressBar}>
          <div 
            className={Styles.progressFill} 
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <div className={Styles.circles}>
          {steps.map((step, index) => {
            const isClickable = canClickStep(index)
            const isActive = index <= (currentStep - 1)
            const tooltipMessage = !isClickable ? getDisabledTooltipMessage(index) : null
            
            // Map step labels to translation keys
            const stepTranslationKeys = {
              'Din opgave': 'steps.dinOpgave',
              'Ekstra': 'steps.ekstra',
              'Tid & sted': 'steps.tidOgSted',
              'Kontaktinfo': 'steps.kontaktinfo'
            }
            const stepKey = stepTranslationKeys[step.label] || step.label
            const translatedLabel = stepTranslationKeys[step.label] ? t(stepKey) : step.label
            
            const circleContent = (
              <div 
                className={Styles.circleWrapper}
                style={{ left: `${(index / (steps.length - 1)) * 100}%` }}
                onClick={() => handleStepClick(index)}
              >
                <div className={`${Styles.circle} ${isActive ? Styles.active : ''} ${!isClickable ? Styles.disabled : ''}`}>
                    {index + 1}
                </div>
                <div className={`${Styles.circleLabel} ${!isClickable ? Styles.disabled : ''}`}>{translatedLabel}</div>
              </div>
            )
            
            if (tooltipMessage) {
              return (
                <div key={index} className={Styles.tooltipContainer} style={{ left: `${(index / (steps.length - 1)) * 100}%` }}>
                  <Tooltip content={tooltipMessage} position="bottom">
                    {circleContent}
                  </Tooltip>
                </div>
              )
            }
            
            return <React.Fragment key={index}>{circleContent}</React.Fragment>
          })}
        </div>
      </div>
    </div>
  )
}

export default BookingHeader
