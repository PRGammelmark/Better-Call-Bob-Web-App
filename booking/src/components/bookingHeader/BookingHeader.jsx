import React from 'react'
import Styles from './BookingHeader.module.css'

const BookingHeader = ({ currentStep, setCurrentStep, steps }) => {
  const progress = ((currentStep - 1) / (steps.length - 1)) * 100

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
          {steps.map((step, index) => (
            <div 
              key={index} 
              className={Styles.circleWrapper}
              style={{ left: `${(index / (steps.length - 1)) * 100}%` }}
              onClick={() => setCurrentStep(index + 1)}
            >
                <div className={`${Styles.circle} ${index <= (currentStep - 1) ? Styles.active : ''}`}>
                    {index + 1}
                </div>
                <div className={Styles.circleLabel}>{step.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default BookingHeader
