import React, { useState } from 'react'
import Styles from './PrimaryBookingComponent.module.css'
import BookingNavigationFooter from './bookingNavigationFooter/BookingNavigationFooter'
import BookingContent from './bookingContent/BookingContent'
import BookingSummary from './bookingSummary/BookingSummary'
import BookingHeader from './bookingHeader/BookingHeader'
import BeskrivOpgaven from './bookingContent/steps/BeskrivOpgaven'

const PrimaryBookingComponent = () => {
  const [currentStep, setCurrentStep] = useState(1)

  const steps = [
    { label: 'Din opgave', content: <BeskrivOpgaven /> },
    { label: 'Ekstra' },
    { label: 'Kontaktinfo' },
    { label: 'Dato og tid' }
  ]

  return (
    <div className={Styles.primaryBookingComponent}>
      <div className={Styles.bookingContainer}>
        <div className={Styles.bookingHeaderContentContainer}>
        <BookingHeader currentStep={currentStep} setCurrentStep={setCurrentStep} steps={steps} />
        <BookingContent currentStep={currentStep} steps={steps} />
        </div>
        <BookingNavigationFooter currentStep={currentStep} setCurrentStep={setCurrentStep}/>
      </div>
      <div className={Styles.summaryContainer}>
        <BookingSummary currentStep={currentStep} setCurrentStep={setCurrentStep}/>
      </div>
    </div>
  );
};

export default PrimaryBookingComponent;
