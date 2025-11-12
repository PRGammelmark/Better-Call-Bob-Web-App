import React, { useState, useRef, useEffect } from 'react'
import Styles from './PrimaryBookingComponent.module.css'
import BookingNavigationFooter from './bookingNavigationFooter/BookingNavigationFooter'
import BookingContent from './bookingContent/BookingContent'
import BookingSummary from './bookingSummary/BookingSummary'
import BookingHeader from './bookingHeader/BookingHeader'
import BeskrivOpgaven from './bookingContent/steps/BeskrivOpgaven'
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { storage } from '../firebase.js'
import { v4 as uuidv4 } from 'uuid'
import axios from 'axios'

const PrimaryBookingComponent = () => {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const beskrivOpgavenRef = useRef(null)

  // Load reCAPTCHA script
  useEffect(() => {
    const script = document.createElement('script')
    script.src = `https://www.google.com/recaptcha/api.js?render=${import.meta.env.VITE_RECAPTCHA_SITE_KEY}`
    script.async = true
    script.defer = true
    document.body.appendChild(script)

    return () => {
      // Cleanup script on unmount
      const existingScript = document.querySelector(`script[src*="recaptcha"]`)
      if (existingScript) {
        document.body.removeChild(existingScript)
      }
    }
  }, [])

  const steps = [
    { label: 'Din opgave', content: <BeskrivOpgaven ref={beskrivOpgavenRef} /> },
    { label: 'Ekstra' },
    { label: 'Tid & sted' },
    { label: 'Kontaktinfo' },
  ]

  const handleConfirmBooking = async () => {
    if (!beskrivOpgavenRef.current) {
      console.error('BeskrivOpgaven ref not available')
      return
    }

    setIsSubmitting(true)

    try {
      // Get reCAPTCHA token
      const recaptchaToken = await new Promise((resolve, reject) => {
        if (window.grecaptcha && window.grecaptcha.ready) {
          window.grecaptcha.ready(() => {
            window.grecaptcha.execute(import.meta.env.VITE_RECAPTCHA_SITE_KEY, { action: 'submit' })
              .then(resolve)
              .catch(reject)
          })
        } else {
          reject(new Error('reCAPTCHA not loaded'))
        }
      })

      // Get data from BeskrivOpgaven
      const opgaveBeskrivelse = beskrivOpgavenRef.current.getOpgaveBeskrivelse()
      const files = beskrivOpgavenRef.current.getOpgaveBilleder()

      // Upload files to Firebase
      const uploadedFileURLs = []
      if (files && files.length > 0) {
        const uploadPromises = files.map((file) => {
          const storageRef = ref(storage, `opgaver/${file.type || 'file'}_${uuidv4()}`)
          const uploadTask = uploadBytesResumable(storageRef, file)

          return new Promise((resolve, reject) => {
            uploadTask.on(
              "state_changed",
              (snapshot) => {
                // Progress tracking can be added here if needed
              },
              (error) => {
                reject(error)
              },
              () => {
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                  resolve(downloadURL)
                })
              }
            )
          })
        })

        uploadedFileURLs.push(...await Promise.all(uploadPromises))
      }

      // TODO: Get other booking data from other steps (kontaktinfo, tid & sted, etc.)
      // For now, using placeholder data - these should come from other step components
      const bookingData = {
        opgaveBeskrivelse,
        opgaveBilleder: uploadedFileURLs,
        fornavn: "Test", // TODO: Get from Kontaktinfo step
        efternavn: "Testesen", // TODO: Get from Kontaktinfo step
        adresse: "Testvej 1", // TODO: Get from Tid & sted step
        postnummerOgBy: "2000 Frederiksberg", // TODO: Get from Tid & sted step
        telefon: "12345678", // TODO: Get from Kontaktinfo step
        email: "test@test.dk", // TODO: Get from Kontaktinfo step
        onsketDato: new Date().toISOString(), // TODO: Get from Tid & sted step
        harStige: false, // TODO: Get from Ekstra step
        CVR: "",
        virksomhed: "",
        engelskKunde: false,
        måKontaktesMedReklame: false,
        recaptchaToken
      }

      // Submit booking to server
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/opgaver/booking`,
        bookingData
      )

      if (response.data.success) {
        // Show success message
        alert('Din booking er blevet oprettet! Vi kontakter dig snart.')
        // TODO: Redirect or reset form
      }
    } catch (error) {
      console.error('Error submitting booking:', error)
      alert(error.response?.data?.message || 'Noget gik galt. Prøv venligst igen.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isLastStep = currentStep === steps.length

  return (
    <div className={Styles.primaryBookingComponent}>
      <div className={Styles.bookingContainer}>
        <div className={Styles.bookingHeaderContentContainer}>
        <BookingHeader currentStep={currentStep} setCurrentStep={setCurrentStep} steps={steps} />
        <BookingContent currentStep={currentStep} steps={steps} />
        </div>
        <BookingNavigationFooter 
          currentStep={currentStep} 
          setCurrentStep={setCurrentStep}
          isLastStep={isLastStep}
          onConfirm={handleConfirmBooking}
          isSubmitting={isSubmitting}
        />
      </div>
      <div className={Styles.summaryContainer}>
        <BookingSummary currentStep={currentStep} setCurrentStep={setCurrentStep}/>
      </div>
    </div>
  );
};

export default PrimaryBookingComponent;
