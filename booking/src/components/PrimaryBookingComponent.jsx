import React, { useState, useEffect, useCallback, useRef } from 'react'
import Styles from './PrimaryBookingComponent.module.css'
import BookingNavigationFooter from './bookingNavigationFooter/BookingNavigationFooter'
import BookingContent from './bookingContent/BookingContent'
import BookingSummary from './bookingSummary/BookingSummary'
import BookingHeader from './bookingHeader/BookingHeader'
import BeskrivOpgaven from './bookingContent/steps/BeskrivOpgaven'
import Ekstra from './bookingContent/steps/Ekstra'
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { storage } from '../firebase.js'
import { v4 as uuidv4 } from 'uuid'
import axios from 'axios'
import useRecaptcha from '../hooks/useRecaptcha'

const PrimaryBookingComponent = () => {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [opgaveBeskrivelse, setOpgaveBeskrivelse] = useState("")
  const [kortOpgavebeskrivelse, setKortOpgavebeskrivelse] = useState("")
  const [opgaveBilleder, setOpgaveBilleder] = useState([])
  const [kategorier, setKategorier] = useState([])
  const [isLoadingKategorier, setIsLoadingKategorier] = useState(false)
  const [isLoadingKortBeskrivelse, setIsLoadingKortBeskrivelse] = useState(false)
  const [opfølgendeSpørgsmålSvar, setOpfølgendeSpørgsmålSvar] = useState({})
  const prevStepRef = useRef(1)
  const { recaptchaSiteKey, executeRecaptcha, registerRecaptchaCallback } = useRecaptcha()

  const steps = [
    { 
      label: 'Din opgave', 
      render: () => (
        <BeskrivOpgaven 
          opgaveBeskrivelse={opgaveBeskrivelse}
          setOpgaveBeskrivelse={setOpgaveBeskrivelse}
          opgaveBilleder={opgaveBilleder}
          setOpgaveBilleder={setOpgaveBilleder}
          wordCount={countWords(opgaveBeskrivelse)}
        />
      )
    },
    { 
      label: 'Ekstra',
      render: () => (
        <Ekstra 
          kategorier={kategorier}
          isLoading={isLoadingKategorier}
          onAnswersChange={setOpfølgendeSpørgsmålSvar}
        />
      )
    },
    { label: 'Tid & sted' },
    { label: 'Kontaktinfo' },
  ]

  // Helper function to count words
  const countWords = (text) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length
  }

  // Update kortOpgavebeskrivelse only when leaving step 1
  useEffect(() => {
    // Check if we just left step 1 (previous step was 1, current step is not 1)
    const justLeftStep1 = prevStepRef.current === 1 && currentStep !== 1
    
    if (justLeftStep1 && opgaveBeskrivelse.trim()) {
      const wordCount = countWords(opgaveBeskrivelse)
      
      if (wordCount <= 10) {
        // If 10 words or less, use it directly
        setKortOpgavebeskrivelse(opgaveBeskrivelse)
      } else {
        // If more than 10 words, summarize with AI
        setIsLoadingKortBeskrivelse(true)
        axios.post(
          `${import.meta.env.VITE_API_URL}/ai/summarizeOpgavebeskrivelse`,
          { opgaveBeskrivelse }
        )
        .then(response => {
          setKortOpgavebeskrivelse(response.data || opgaveBeskrivelse)
        })
        .catch(error => {
          console.error('Error summarizing opgavebeskrivelse:', error)
          // Fallback to original if summarization fails
          setKortOpgavebeskrivelse(opgaveBeskrivelse)
        })
        .finally(() => {
          setIsLoadingKortBeskrivelse(false)
        })
      }
    }
    
    // Update previous step ref
    prevStepRef.current = currentStep
  }, [currentStep, opgaveBeskrivelse])

  // Fetch kategorier when moving to step 2
  useEffect(() => {
    const fetchKategorier = async () => {
      if (currentStep === 2 && opgaveBeskrivelse.trim()) {
        setIsLoadingKategorier(true)
        try {
          const response = await axios.post(
            `${import.meta.env.VITE_API_URL}/ai/parseKategorierFromText`,
            { opgaveBeskrivelse }
          )
          setKategorier(response.data || [])
        } catch (error) {
          console.error('Error fetching kategorier:', error)
          setKategorier([])
        } finally {
          setIsLoadingKategorier(false)
        }
      }
    }

    fetchKategorier()
  }, [currentStep, opgaveBeskrivelse])

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
        opfølgendeSpørgsmålSvar, // Svar fra opfølgende spørgsmål
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
  }, [opgaveBeskrivelse, opgaveBilleder, opfølgendeSpørgsmålSvar])

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
    return registerRecaptchaCallback(onSubmit)
  }, [onSubmit, registerRecaptchaCallback])

  const handleConfirmBooking = async () => {
    try {
      if (!recaptchaSiteKey) {
        throw new Error('reCAPTCHA site key mangler. Kontakt venligst support.')
      }

      const recaptchaToken = await executeRecaptcha('submit')
      await handleConfirmBookingWithToken(recaptchaToken)
    } catch (error) {
      console.error('Error getting reCAPTCHA token:', error)
      alert('Fejl ved reCAPTCHA verificering. Prøv venligst igen.')
      setIsSubmitting(false)
    }
  }

  const isLastStep = currentStep === steps.length
  
  // Check if step 1 has minimum 5 words
  const wordCount = countWords(opgaveBeskrivelse)
  const isStep1Valid = currentStep !== 1 || wordCount >= 5
  const shouldPulseButton = currentStep === 1 && wordCount >= 5 && !isSubmitting

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
          isStepValid={isStep1Valid}
          shouldPulse={shouldPulseButton}
        />
      </div>
      <div className={Styles.summaryContainer}>
        <BookingSummary 
          currentStep={currentStep} 
          setCurrentStep={setCurrentStep}
          kortOpgavebeskrivelse={kortOpgavebeskrivelse}
          kategorier={kategorier}
          isLoadingKortBeskrivelse={isLoadingKortBeskrivelse}
        />
      </div>
    </div>
  );
};

export default PrimaryBookingComponent;
