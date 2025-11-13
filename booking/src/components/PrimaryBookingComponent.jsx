import React, { useState, useEffect, useRef, useCallback } from 'react'
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
  const [opgaveBeskrivelse, setOpgaveBeskrivelse] = useState("")
  const [opgaveBilleder, setOpgaveBilleder] = useState([]) // Array of { file, preview, type }
  const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY
  const recaptchaLoaderRef = useRef(null)

  const loadRecaptcha = useCallback(() => {
    if (!recaptchaSiteKey) {
      return Promise.reject(new Error('reCAPTCHA site key mangler i miljøvariablerne'))
    }

    // Check if Enterprise API is available
    if (window.grecaptcha && window.grecaptcha.enterprise) {
      return new Promise((resolve) => {
        window.grecaptcha.enterprise.ready(() => resolve(window.grecaptcha.enterprise))
      })
    }

    if (!recaptchaLoaderRef.current) {
      recaptchaLoaderRef.current = new Promise((resolve, reject) => {
        const existingScript = document.querySelector('script[src^="https://www.google.com/recaptcha/enterprise.js"]')

        const handleReady = () => {
          if (window.grecaptcha && window.grecaptcha.enterprise) {
            window.grecaptcha.enterprise.ready(() => resolve(window.grecaptcha.enterprise))
          } else {
            recaptchaLoaderRef.current = null
            reject(new Error('reCAPTCHA Enterprise script indlæst men grecaptcha.enterprise er ikke tilgængelig'))
          }
        }

        const handleError = () => {
          recaptchaLoaderRef.current = null
          reject(new Error('Kunne ikke indlæse reCAPTCHA Enterprise scriptet'))
        }

        if (existingScript) {
          existingScript.addEventListener('load', handleReady, { once: true })
          existingScript.addEventListener('error', handleError, { once: true })
          return
        }

        // Load Enterprise script
        const script = document.createElement('script')
        script.src = `https://www.google.com/recaptcha/enterprise.js?render=${recaptchaSiteKey}`
        script.async = true
        script.defer = true
        script.addEventListener('load', handleReady, { once: true })
        script.addEventListener('error', handleError, { once: true })
        document.body.appendChild(script)
      })
    }

    return recaptchaLoaderRef.current
  }, [recaptchaSiteKey])

  useEffect(() => {
    let cancelled = false

    loadRecaptcha().catch((error) => {
      if (!cancelled) {
        console.error('Fejl ved indlæsning af reCAPTCHA:', error)
      }
    })

    return () => {
      cancelled = true
    }
  }, [loadRecaptcha])

  const steps = [
    { 
      label: 'Din opgave', 
      render: () => (
        <BeskrivOpgaven 
          opgaveBeskrivelse={opgaveBeskrivelse}
          setOpgaveBeskrivelse={setOpgaveBeskrivelse}
          opgaveBilleder={opgaveBilleder}
          setOpgaveBilleder={setOpgaveBilleder}
        />
      )
    },
    { label: 'Ekstra' },
    { label: 'Tid & sted' },
    { label: 'Kontaktinfo' },
  ]

  const handleConfirmBookingWithToken = useCallback(async (recaptchaToken) => {
    setIsSubmitting(true)

    try {

      // Get files from opgaveBilleder state
      const files = opgaveBilleder.map(item => item.file)

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
  }, [opgaveBeskrivelse, opgaveBilleder])

  // Callback function for reCAPTCHA as per Google's guide
  const onSubmit = useCallback(async (token) => {
    if (!token) {
      throw new Error('reCAPTCHA token mangler')
    }
    // Mark that callback was triggered to prevent double submission
    if (typeof window !== 'undefined') {
      window.recaptchaCallbackTriggered = true
    }
    await handleConfirmBookingWithToken(token)
    // Reset flag after submission
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        window.recaptchaCallbackTriggered = false
      }
    }, 1000)
  }, [handleConfirmBookingWithToken])

  // Expose callback to window for reCAPTCHA button callback
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.onRecaptchaSubmit = onSubmit
    }
    return () => {
      if (typeof window !== 'undefined') {
        delete window.onRecaptchaSubmit
        delete window.recaptchaCallbackTriggered
      }
    }
  }, [onSubmit])

  const handleConfirmBooking = async () => {
    try {
      if (!recaptchaSiteKey) {
        throw new Error('reCAPTCHA site key mangler. Kontakt venligst support.')
      }

      const grecaptcha = await loadRecaptcha()
      // Use Enterprise API execute method
      const recaptchaToken = await grecaptcha.execute(recaptchaSiteKey, { action: 'submit' })
      await handleConfirmBookingWithToken(recaptchaToken)
    } catch (error) {
      console.error('Error getting reCAPTCHA token:', error)
      alert('Fejl ved reCAPTCHA verificering. Prøv venligst igen.')
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
          recaptchaSiteKey={recaptchaSiteKey}
        />
      </div>
      <div className={Styles.summaryContainer}>
        <BookingSummary currentStep={currentStep} setCurrentStep={setCurrentStep}/>
      </div>
    </div>
  );
};

export default PrimaryBookingComponent;
