import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import Styles from './PrimaryBookingComponent.module.css'
import BookingNavigationFooter from './bookingNavigationFooter/BookingNavigationFooter'
import BookingContent from './bookingContent/BookingContent'
import BookingSummary from './bookingSummary/BookingSummary'
import BookingHeader from './bookingHeader/BookingHeader'
import BeskrivOpgaven from './bookingContent/steps/BeskrivOpgaven'
import Ekstra from './bookingContent/steps/Ekstra'
import TidOgSted from './bookingContent/steps/TidOgSted'
import Kontaktinfo from './bookingContent/steps/Kontaktinfo'
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { storage } from '../firebase.js'
import { v4 as uuidv4 } from 'uuid'
import axios from 'axios'
import useRecaptcha from '../hooks/useRecaptcha'
import dayjs from 'dayjs'
import 'dayjs/locale/da'
import { AnimatePresence, motion } from 'framer-motion'
import { X, Tag, Clock, MapPin, CalendarCheck, User, Mail, Phone, Building2, FileText, Briefcase } from 'lucide-react'
import SummaryStyles from './bookingSummary/BookingSummary.module.css'

const PrimaryBookingComponent = () => {
  const [currentStep, setCurrentStep] = useState(1)
  const [direction, setDirection] = useState(1) // 1 for forward, -1 for backward
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [opgaveBeskrivelse, setOpgaveBeskrivelse] = useState("")
  const [kortOpgavebeskrivelse, setKortOpgavebeskrivelse] = useState("")
  const [estimeretTidsforbrugTimer, setEstimeretTidsforbrugTimer] = useState(null)
  const [opgaveBilleder, setOpgaveBilleder] = useState([])
  const [kategorier, setKategorier] = useState([])
  const [isLoadingKategorier, setIsLoadingKategorier] = useState(false)
  const [isLoadingKortBeskrivelse, setIsLoadingKortBeskrivelse] = useState(false)
  const [opfølgendeSpørgsmålSvar, setOpfølgendeSpørgsmålSvar] = useState({})
  const [opfølgendeSpørgsmål, setOpfølgendeSpørgsmål] = useState([])
  const [adresse, setAdresse] = useState("")
  const [formateretAdresse, setFormateretAdresse] = useState(null)
  const [valgtDato, setValgtDato] = useState(null)
  const [valgtTidspunkt, setValgtTidspunkt] = useState(null)
  const [manualTimePreference, setManualTimePreference] = useState("")
  const [availableWorkerIDs, setAvailableWorkerIDs] = useState([])
  const [availableWorkerNames, setAvailableWorkerNames] = useState([])
  const [allAvailableSlots, setAllAvailableSlots] = useState([])
  const [isLoadingWorkers, setIsLoadingWorkers] = useState(false)
  const [isLoadingTimes, setIsLoadingTimes] = useState(false)
  const [tidOgStedError, setTidOgStedError] = useState(null)
  // Kontaktinfo state
  const [fuldeNavn, setFuldeNavn] = useState("")
  const [email, setEmail] = useState("")
  const [telefonnummer, setTelefonnummer] = useState("")
  const [erVirksomhed, setErVirksomhed] = useState(false)
  const [virksomhed, setVirksomhed] = useState("")
  const [cvr, setCvr] = useState("")
  const [kommentarer, setKommentarer] = useState("")
  const [modtagNyheder, setModtagNyheder] = useState(true)
  const [accepterHandelsbetingelser, setAccepterHandelsbetingelser] = useState(false)
  const [isStep4Valid, setIsStep4Valid] = useState(false)
  const [showBookingPopup, setShowBookingPopup] = useState(false)
  const prevStepRef = useRef(1)
  const lastAnalyzedBeskrivelseRef = useRef("")
  const lastSummarizedBeskrivelseRef = useRef("")
  const lastKategorierRef = useRef(JSON.stringify(kategorier))
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
          initialAnswers={opfølgendeSpørgsmålSvar}
        />
      )
    },
    { 
      label: 'Tid & sted',
      render: () => (
        <TidOgSted 
          kategorier={kategorier}
          adresse={adresse}
          formateretAdresse={formateretAdresse}
          onAddressChange={setAdresse}
          onFormateretAdresseChange={setFormateretAdresse}
          onDateChange={setValgtDato}
          onTimeChange={setValgtTidspunkt}
          valgtDato={valgtDato}
          valgtTidspunkt={valgtTidspunkt}
          manualTimePreference={manualTimePreference}
          onManualTimePreferenceChange={setManualTimePreference}
          availableWorkerIDs={availableWorkerIDs}
          onAvailableWorkerIDsChange={setAvailableWorkerIDs}
          availableWorkerNames={availableWorkerNames}
          onAvailableWorkerNamesChange={setAvailableWorkerNames}
          allAvailableSlots={allAvailableSlots}
          onAllAvailableSlotsChange={setAllAvailableSlots}
          isLoadingWorkers={isLoadingWorkers}
          onIsLoadingWorkersChange={setIsLoadingWorkers}
          isLoadingTimes={isLoadingTimes}
          onIsLoadingTimesChange={setIsLoadingTimes}
          error={tidOgStedError}
          onErrorChange={setTidOgStedError}
          estimeretTidsforbrugTimer={estimeretTidsforbrugTimer}
        />
      )
    },
    { 
      label: 'Kontaktinfo',
      render: () => (
        <Kontaktinfo
          fuldeNavn={fuldeNavn}
          setFuldeNavn={setFuldeNavn}
          email={email}
          setEmail={setEmail}
          telefonnummer={telefonnummer}
          setTelefonnummer={setTelefonnummer}
          erVirksomhed={erVirksomhed}
          setErVirksomhed={setErVirksomhed}
          virksomhed={virksomhed}
          setVirksomhed={setVirksomhed}
          cvr={cvr}
          setCvr={setCvr}
          kommentarer={kommentarer}
          setKommentarer={setKommentarer}
          modtagNyheder={modtagNyheder}
          setModtagNyheder={setModtagNyheder}
          accepterHandelsbetingelser={accepterHandelsbetingelser}
          setAccepterHandelsbetingelser={setAccepterHandelsbetingelser}
          onValidationChange={setIsStep4Valid}
        />
      )
    },
  ]

  // Helper function to count words
  const countWords = (text) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length
  }

  // Update kortOpgavebeskrivelse and fetch kategorier when leaving step 1, but only if opgaveBeskrivelse has changed
  useEffect(() => {
    // Check if we just left step 1 (previous step was 1, current step is not 1)
    const justLeftStep1 = prevStepRef.current === 1 && currentStep !== 1
    
    if (justLeftStep1 && opgaveBeskrivelse.trim()) {
      // Only summarize if the description has changed since last summarization
      const hasBeskrivelseChanged = lastSummarizedBeskrivelseRef.current !== opgaveBeskrivelse.trim()
      
      if (hasBeskrivelseChanged) {
        // Always summarize with AI, regardless of word count
        setIsLoadingKortBeskrivelse(true)
        setIsLoadingKategorier(true)
        
        // Hent både opsummering og kategorier samtidig
        Promise.all([
          axios.post(
            `${import.meta.env.VITE_API_URL}/ai/summarizeOpgavebeskrivelse`,
            { opgaveBeskrivelse }
          ),
          axios.post(
            `${import.meta.env.VITE_API_URL}/ai/parseKategorierFromText`,
            { opgaveBeskrivelse }
          )
        ])
        .then(([summaryResponse, categoriesResponse]) => {
          // Handle summary response
          if (typeof summaryResponse.data === 'string') {
            setKortOpgavebeskrivelse(summaryResponse.data || opgaveBeskrivelse)
            setEstimeretTidsforbrugTimer(null)
          } else {
            setKortOpgavebeskrivelse(summaryResponse.data?.opsummering || opgaveBeskrivelse)
            setEstimeretTidsforbrugTimer(summaryResponse.data?.estimeretTidsforbrugTimer || null)
          }
          
          // Handle categories response
          setKategorier(categoriesResponse.data || [])
          lastAnalyzedBeskrivelseRef.current = opgaveBeskrivelse.trim()
          setOpfølgendeSpørgsmålSvar({}) // Reset answers when description changes
          
          lastSummarizedBeskrivelseRef.current = opgaveBeskrivelse.trim()
        })
        .catch(error => {
          console.error('Error summarizing opgavebeskrivelse or fetching kategorier:', error)
          // Fallback to original if summarization fails
          setKortOpgavebeskrivelse(opgaveBeskrivelse)
          setEstimeretTidsforbrugTimer(null)
          setKategorier([])
          lastSummarizedBeskrivelseRef.current = opgaveBeskrivelse.trim()
        })
        .finally(() => {
          setIsLoadingKortBeskrivelse(false)
          setIsLoadingKategorier(false)
        })
      }
      // If description hasn't changed, keep existing kortOpgavebeskrivelse
    }
    
    // Update previous step ref
    prevStepRef.current = currentStep
  }, [currentStep, opgaveBeskrivelse])

  // Kategorier hentes nu når man forlader step 1, så dette useEffect er ikke længere nødvendigt
  // Men vi beholder det som fallback hvis kategorier ikke blev hentet (f.eks. hvis brugeren går direkte til step 2)
  useEffect(() => {
    const fetchKategorier = async () => {
      if (currentStep === 2 && opgaveBeskrivelse.trim()) {
        // Only analyze if the description has changed since last analysis
        const hasBeskrivelseChanged = lastAnalyzedBeskrivelseRef.current !== opgaveBeskrivelse.trim()
        
        if (hasBeskrivelseChanged) {
          setIsLoadingKategorier(true)
          try {
            const response = await axios.post(
              `${import.meta.env.VITE_API_URL}/ai/parseKategorierFromText`,
              { opgaveBeskrivelse }
            )
            setKategorier(response.data || [])
            // Update the ref to track what we last analyzed
            lastAnalyzedBeskrivelseRef.current = opgaveBeskrivelse.trim()
            // Reset answers when description changes (new analysis = new questions)
            setOpfølgendeSpørgsmålSvar({})
          } catch (error) {
            console.error('Error fetching kategorier:', error)
            setKategorier([])
          } finally {
            setIsLoadingKategorier(false)
          }
        }
        // If description hasn't changed, keep existing kategorier and answers
      }
    }

    fetchKategorier()
  }, [currentStep, opgaveBeskrivelse])

  // Fetch opfølgende spørgsmål when kategorier are available
  useEffect(() => {
    const fetchSpørgsmål = async () => {
      if (kategorier && kategorier.length > 0) {
        try {
          const response = await axios.post(
            `${import.meta.env.VITE_API_URL}/opfolgendeSporgsmaal/forKategorier`,
            { kategorier }
          )
          setOpfølgendeSpørgsmål(response.data || [])
        } catch (error) {
          console.error('Error fetching opfølgende spørgsmål:', error)
          setOpfølgendeSpørgsmål([])
        }
      } else {
        setOpfølgendeSpørgsmål([])
      }
    }

    fetchSpørgsmål()
  }, [kategorier])

  // Nulstil step 3 data når kategorier ændrer sig
  useEffect(() => {
    const currentKategorierStr = JSON.stringify(kategorier)
    const lastKategorierStr = lastKategorierRef.current
    
    // Tjek om kategorier faktisk er ændret (ikke bare første render)
    if (lastKategorierStr !== currentKategorierStr && lastKategorierStr !== JSON.stringify([])) {
      // Nulstil alle step 3 relaterede data
      setAvailableWorkerIDs([])
      setAvailableWorkerNames([])
      setAllAvailableSlots([])
      setValgtDato(null)
      setValgtTidspunkt(null)
      setManualTimePreference("")
      setFormateretAdresse(null)
      setTidOgStedError(null)
      setIsLoadingWorkers(false)
      setIsLoadingTimes(false)
    }
    
    // Opdater ref til nuværende kategorier
    lastKategorierRef.current = currentKategorierStr
  }, [kategorier])

  // Hent ledige tider automatisk når man kommer tilbage til step 3 med eksisterende adresse og dato
  useEffect(() => {
    const fetchAvailableTimes = async () => {
      const hasAddress = adresse && adresse.trim()
      const hasDate = valgtDato !== null && valgtDato !== undefined
      const hasCategories = kategorier && kategorier.length > 0
      const needsData = allAvailableSlots.length === 0
      
      if (currentStep === 3 && hasAddress && hasDate && hasCategories && needsData && !isLoadingWorkers && !isLoadingTimes) {
        setIsLoadingWorkers(true)
        setIsLoadingTimes(true)
        setTidOgStedError(null)

        try {
          // Fetch available workers
          const workersResponse = await axios.post(
            `${import.meta.env.VITE_API_URL}/brugere/getAvailableWorkers`,
            {
              adresse,
              kategorier
            }
          )
          const workerIDs = workersResponse.data?.workerIDs || workersResponse.data || []
          const workerNames = workersResponse.data?.workerNames || []
          const formateretAdresseFraServer = workersResponse.data?.formateretAdresse || null
          
          setAvailableWorkerIDs(workerIDs)
          setAvailableWorkerNames(workerNames)
          
          if (formateretAdresseFraServer) {
            setFormateretAdresse(formateretAdresseFraServer)
            setAdresse(formateretAdresseFraServer)
          } else if (workerIDs.length === 0) {
            // Set formateretAdresse even when no workers found, so manual input can show
            setFormateretAdresse(adresse)
          }

          if (workerIDs.length === 0) {
            // Don't set error - TidOgSted will show manual input instead
            setIsLoadingWorkers(false)
            setIsLoadingTimes(false)
            return
          }

          // Fetch available times
          if (estimeretTidsforbrugTimer && estimeretTidsforbrugTimer > 0) {
            const timesResponse = await axios.post(
              `${import.meta.env.VITE_API_URL}/ledige-tider/get-ledige-booking-tider`,
              {
                brugerIDs: workerIDs,
                estimeretTidsforbrugTimer: estimeretTidsforbrugTimer
              }
            )
            setAllAvailableSlots(timesResponse.data || [])
          } else {
            const timesResponse = await axios.post(
              `${import.meta.env.VITE_API_URL}/ledige-tider/ledighed-for-brugere`,
              {
                brugerIDs: workerIDs
              }
            )
            setAllAvailableSlots(timesResponse.data || [])
          }
        } catch (error) {
          console.error('Error fetching available times:', error)
          setTidOgStedError('Kunne ikke hente ledige tidspunkter. Prøv venligst igen.')
          setAvailableWorkerIDs([])
          setAvailableWorkerNames([])
          setAllAvailableSlots([])
          setFormateretAdresse(null)
        } finally {
          setIsLoadingWorkers(false)
          setIsLoadingTimes(false)
        }
      }
    }

    fetchAvailableTimes()
  }, [currentStep, adresse, valgtDato, kategorier, allAvailableSlots.length, isLoadingWorkers, isLoadingTimes, estimeretTidsforbrugTimer])

  // Calculate answered questions count
  const antalBesvaredeSpørgsmål = React.useMemo(() => {
    if (!opfølgendeSpørgsmål || opfølgendeSpørgsmål.length === 0) return 0
    
    return opfølgendeSpørgsmål.filter(spørgsmål => {
      const svar = opfølgendeSpørgsmålSvar[spørgsmål.feltNavn]
      return svar !== null && svar !== undefined && svar !== ''
    }).length
  }, [opfølgendeSpørgsmål, opfølgendeSpørgsmålSvar])

  const totaltAntalSpørgsmål = opfølgendeSpørgsmål.length

  // Helper function to extract postnummerOgBy from address
  const extractPostnummerOgBy = (address) => {
    if (!address) return ""
    // Try to match pattern like "1234 City" or "Street, 1234 City"
    const match = address.match(/(\d{4})\s+([a-zA-ZæøåÆØÅ\s\-]+)$/)
    if (match) {
      return `${match[1]} ${match[2].trim()}`
    }
    // If no match, try to extract from end of string
    const parts = address.split(',').map(p => p.trim())
    if (parts.length > 1) {
      const lastPart = parts[parts.length - 1]
      const lastMatch = lastPart.match(/(\d{4})\s+([a-zA-ZæøåÆØÅ\s\-]+)$/)
      if (lastMatch) {
        return `${lastMatch[1]} ${lastMatch[2].trim()}`
      }
    }
    return ""
  }

  // Helper function to split full name into first and last name
  const splitNavn = (fuldeNavn) => {
    if (!fuldeNavn || !fuldeNavn.trim()) return { fornavn: "", efternavn: "" }
    const parts = fuldeNavn.trim().split(/\s+/)
    if (parts.length === 1) {
      return { fornavn: parts[0], efternavn: "" }
    }
    const fornavn = parts[0]
    const efternavn = parts.slice(1).join(" ")
    return { fornavn, efternavn }
  }

  // Helper function to normalize phone number (remove spaces, dashes, etc. and ensure 8 digits)
  const normalizeTelefon = (telefonnummer) => {
    if (!telefonnummer || !telefonnummer.trim()) return ""
    // Remove all non-digit characters
    const digits = telefonnummer.replace(/\D/g, "")
    // Return only if exactly 8 digits
    return digits.length === 8 ? digits : telefonnummer.trim()
  }

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

      // Parse full name into first and last name
      const { fornavn, efternavn } = splitNavn(fuldeNavn)
      
      // Extract postnummerOgBy from address
      const addressToUse = formateretAdresse || adresse
      const postnummerOgBy = extractPostnummerOgBy(addressToUse)
      
      // Get desired date/time
      let onsketDato = null
      if (valgtDato && valgtTidspunkt) {
        // Use selected date and time
        onsketDato = valgtTidspunkt.start
      } else if (valgtDato) {
        // Use selected date (start of day)
        onsketDato = new Date(valgtDato).toISOString()
      } else {
        // Fallback to current date/time
        onsketDato = new Date().toISOString()
      }
      
      // Check if harStige is in opfølgendeSpørgsmålSvar
      const harStige = opfølgendeSpørgsmålSvar?.harStige === true || opfølgendeSpørgsmålSvar?.harStige === "Ja"
      
      // Normalize phone number (server requires exactly 8 digits)
      const normalizedTelefon = normalizeTelefon(telefonnummer)
      // If phone is empty or invalid, use placeholder (server requires 8 digits)
      // Note: Server validation will catch this, but we provide a fallback
      const telefonToSend = normalizedTelefon || "00000000"
      
      const bookingData = {
        opgaveBeskrivelse,
        opgaveBilleder: uploadedFileURLs,
        fornavn,
        efternavn,
        adresse: addressToUse,
        postnummerOgBy,
        telefon: telefonToSend,
        email,
        onsketDato,
        harStige,
        CVR: cvr || "",
        virksomhed: virksomhed || "",
        engelskKunde: false, // TODO: Add this field if needed
        måKontaktesMedReklame: modtagNyheder,
        kommentarer: kommentarer || "",
        opfølgendeSpørgsmålSvar,
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
  }, [
    opgaveBeskrivelse, 
    opgaveBilleder, 
    opfølgendeSpørgsmålSvar,
    fuldeNavn,
    email,
    telefonnummer,
    adresse,
    formateretAdresse,
    valgtDato,
    valgtTidspunkt,
    cvr,
    virksomhed,
    kommentarer,
    modtagNyheder
  ])

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
    // For now, just show the popup instead of submitting
    setShowBookingPopup(true)
    
    // TODO: Uncomment this when ready to implement actual booking submission
    // try {
    //   if (!recaptchaSiteKey) {
    //     throw new Error('reCAPTCHA site key mangler. Kontakt venligst support.')
    //   }

    //   const recaptchaToken = await executeRecaptcha('submit')
    //   await handleConfirmBookingWithToken(recaptchaToken)
    // } catch (error) {
    //   console.error('Error getting reCAPTCHA token:', error)
    //   alert('Fejl ved reCAPTCHA verificering. Prøv venligst igen.')
    //   setIsSubmitting(false)
    // }
  }

  // Wrapper function to handle step changes with direction tracking
  const handleStepChange = (newStep) => {
    if (newStep > currentStep) {
      setDirection(1) // Forward
    } else if (newStep < currentStep) {
      setDirection(-1) // Backward
    }
    setCurrentStep(newStep)
  }

  const isLastStep = currentStep === steps.length
  
  // Check if step 1 has minimum 5 words
  const wordCount = countWords(opgaveBeskrivelse)
  const isStep1Valid = currentStep !== 1 || wordCount >= 5
  
  // Filtrer slots til kun at inkludere dem inden for de næste 4 måneder
  const slotsWithin4Months = useMemo(() => {
    const now = dayjs()
    const fourMonthsFromNow = now.add(4, 'month')
    
    return allAvailableSlots.filter(slot => {
      const slotDate = dayjs(slot.datoTidFra)
      return slotDate.isAfter(now) && slotDate.isBefore(fourMonthsFromNow)
    })
  }, [allAvailableSlots])
  
  const hasSlotsWithin4Months = slotsWithin4Months.length > 0
  
  // Check if step 3 is valid: either has date+time OR manual time preference (when no workers OR no slots within 4 months)
  // Also requires address to be filled
  const hasAddress = (formateretAdresse || adresse) && (formateretAdresse || adresse).trim().length > 0
  const isStep3Valid = currentStep !== 3 || 
    (hasAddress && availableWorkerIDs.length > 0 && hasSlotsWithin4Months && valgtDato && valgtTidspunkt) ||
    (hasAddress && availableWorkerIDs.length > 0 && !hasSlotsWithin4Months && !isLoadingWorkers && manualTimePreference.trim().length > 0) ||
    (hasAddress && availableWorkerIDs.length === 0 && !isLoadingWorkers && manualTimePreference.trim().length > 0)
  
  // Check if step 4 is valid (handled by Kontaktinfo component via onValidationChange)
  const isStep4ValidCheck = currentStep !== 4 || isStep4Valid
  
  const isStepValid = isStep1Valid && isStep3Valid && isStep4ValidCheck
  const shouldPulseButton = currentStep === 1 && wordCount >= 5 && !isSubmitting

  // Navigation conditions: check actual conditions regardless of current step
  // Step 2 can be accessed if step 1 condition is met (wordCount >= 5)
  const canNavigateToStep2 = wordCount >= 5
  
  // Step 3 can be accessed if step 2 can be accessed (same condition)
  const canNavigateToStep3 = canNavigateToStep2
  
  // Step 4 can be accessed if step 3 condition is met
  const canNavigateToStep4 = 
    (hasAddress && availableWorkerIDs.length > 0 && hasSlotsWithin4Months && valgtDato && valgtTidspunkt) ||
    (hasAddress && availableWorkerIDs.length > 0 && !hasSlotsWithin4Months && !isLoadingWorkers && manualTimePreference.trim().length > 0) ||
    (hasAddress && availableWorkerIDs.length === 0 && !isLoadingWorkers && manualTimePreference.trim().length > 0) ||
    (availableWorkerIDs.length === 0 && isLoadingWorkers)

  return (
    <div className={Styles.primaryBookingComponent}>
      <div className={Styles.bookingContainer}>
        <div className={Styles.bookingHeaderContentContainer}>
        <BookingHeader 
          currentStep={currentStep} 
          setCurrentStep={handleStepChange} 
          steps={steps}
          canNavigateToStep2={canNavigateToStep2}
          canNavigateToStep3={canNavigateToStep3}
          canNavigateToStep4={canNavigateToStep4}
          wordCount={wordCount}
          valgtDato={valgtDato}
          valgtTidspunkt={valgtTidspunkt}
          manualTimePreference={manualTimePreference}
          availableWorkerIDs={availableWorkerIDs}
          isLoadingWorkers={isLoadingWorkers}
        />
        <BookingContent currentStep={currentStep} steps={steps} direction={direction} />
        </div>
        <BookingNavigationFooter 
          currentStep={currentStep} 
          setCurrentStep={handleStepChange}
          isLastStep={isLastStep}
          onConfirm={handleConfirmBooking}
          isSubmitting={isSubmitting}
          recaptchaSiteKey={recaptchaSiteKey}
          isStepValid={isStepValid}
          shouldPulse={shouldPulseButton}
          wordCount={wordCount}
          antalBesvaredeSpørgsmål={antalBesvaredeSpørgsmål}
        />
      </div>
      <div className={Styles.summaryContainer}>
        <BookingSummary 
          currentStep={currentStep} 
          setCurrentStep={setCurrentStep}
          kortOpgavebeskrivelse={kortOpgavebeskrivelse}
          estimeretTidsforbrugTimer={estimeretTidsforbrugTimer}
          kategorier={kategorier}
          isLoadingKortBeskrivelse={isLoadingKortBeskrivelse}
          antalBesvaredeSpørgsmål={antalBesvaredeSpørgsmål}
          totaltAntalSpørgsmål={totaltAntalSpørgsmål}
          adresse={adresse}
          valgtDato={valgtDato}
          valgtTidspunkt={valgtTidspunkt}
          manualTimePreference={manualTimePreference}
          fuldeNavn={fuldeNavn}
          email={email}
          telefonnummer={telefonnummer}
          erVirksomhed={erVirksomhed}
          virksomhed={virksomhed}
          cvr={cvr}
        />
      </div>
      
      {/* Booking Confirmation Popup */}
      <AnimatePresence>
        {showBookingPopup && (
          <>
            <motion.div
              className={SummaryStyles.popupOverlay}
              onClick={() => setShowBookingPopup(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />
            <motion.div
              className={SummaryStyles.popup}
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95, x: '-50%', y: '-50%' }}
              animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
              exit={{ opacity: 0, scale: 0.95, x: '-50%', y: '-50%' }}
              transition={{ duration: 0.2 }}
              style={{ maxWidth: '600px' }}
            >
              <button className={SummaryStyles.popupCloseButton} onClick={() => setShowBookingPopup(false)}>
                <X size={18} />
              </button>
              <h3 className={SummaryStyles.popupTitle}>Oplysninger om bookingHeaderContentContainer</h3>
              
              {/* Opgave Information */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ fontFamily: 'OmnesBold', fontSize: '0.95rem', color: '#222222', marginBottom: '10px' }}>Opgave</h4>
                {kortOpgavebeskrivelse && (
                  <p className={SummaryStyles.popupText} style={{ marginBottom: '8px' }}>
                    <strong>Beskrivelse:</strong> {kortOpgavebeskrivelse}
                  </p>
                )}
                {opgaveBeskrivelse && opgaveBeskrivelse !== kortOpgavebeskrivelse && (
                  <p className={SummaryStyles.popupText} style={{ marginBottom: '8px', fontSize: '0.85rem', color: '#666' }}>
                    <strong>Fuld beskrivelse:</strong> {opgaveBeskrivelse}
                  </p>
                )}
                {kategorier && kategorier.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                    {kategorier.map((kategori, index) => (
                      <span key={index} style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        backgroundColor: '#f0f0f0', 
                        border: '1px solid #22222220', 
                        borderRadius: '12px', 
                        padding: '4px 10px', 
                        fontSize: '0.75rem',
                        color: '#222222'
                      }}>
                        <Tag size={10} style={{ marginRight: 4 }} />
                        {kategori}
                      </span>
                    ))}
                  </div>
                )}
                {estimeretTidsforbrugTimer !== null && estimeretTidsforbrugTimer !== undefined && (
                  <p className={SummaryStyles.popupText} style={{ marginTop: '8px', marginBottom: '0' }}>
                    <Clock size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                    <strong>Anslået tidsforbrug:</strong> {estimeretTidsforbrugTimer} {estimeretTidsforbrugTimer === 1 ? 'time' : 'timer'}
                  </p>
                )}
                {opgaveBilleder && opgaveBilleder.length > 0 && (
                  <p className={SummaryStyles.popupText} style={{ marginTop: '8px', marginBottom: '0' }}>
                    <strong>Billeder:</strong> {opgaveBilleder.length} {opgaveBilleder.length === 1 ? 'billede' : 'billeder'}
                  </p>
                )}
              </div>

              {/* Opfølgende Spørgsmål */}
              {Object.keys(opfølgendeSpørgsmålSvar).length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ fontFamily: 'OmnesBold', fontSize: '0.95rem', color: '#222222', marginBottom: '10px' }}>Opfølgende spørgsmål</h4>
                  {Object.entries(opfølgendeSpørgsmålSvar).map(([key, value]) => {
                    if (value === null || value === undefined || value === '') return null
                    const spørgsmål = opfølgendeSpørgsmål.find(s => s.feltNavn === key)
                    return (
                      <p key={key} className={SummaryStyles.popupText} style={{ marginBottom: '6px', fontSize: '0.85rem' }}>
                        <strong>{spørgsmål?.spørgsmålTekst || key}:</strong> {String(value)}
                      </p>
                    )
                  })}
                </div>
              )}

              {/* Kommentarer */}
              {kommentarer && kommentarer.trim() && (
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ fontFamily: 'OmnesBold', fontSize: '0.95rem', color: '#222222', marginBottom: '10px' }}>Kommentarer</h4>
                  <p className={SummaryStyles.popupText} style={{ marginBottom: '0' }}>
                    {kommentarer}
                  </p>
                </div>
              )}

              {/* Tid & Sted */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ fontFamily: 'OmnesBold', fontSize: '0.95rem', color: '#222222', marginBottom: '10px' }}>Tid & sted</h4>
                {(formateretAdresse || adresse) && (
                  <p className={SummaryStyles.popupText} style={{ marginBottom: '8px' }}>
                    <MapPin size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                    <strong>Adresse:</strong> {formateretAdresse || adresse}
                  </p>
                )}
                {(valgtDato || valgtTidspunkt || manualTimePreference) && (
                  <p className={SummaryStyles.popupText} style={{ marginBottom: '0' }}>
                    <CalendarCheck size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                    <strong>Tidspunkt:</strong>{' '}
                    {manualTimePreference ? (
                      manualTimePreference
                    ) : (
                      <>
                        {valgtDato && dayjs(valgtDato).locale('da').format('D. MMMM YYYY')}
                        {valgtDato && valgtTidspunkt && ' kl. '}
                        {valgtTidspunkt && dayjs(valgtTidspunkt.start).format('HH:mm')}
                        {valgtTidspunkt && valgtTidspunkt.end && ` - ${dayjs(valgtTidspunkt.end).format('HH:mm')}`}
                      </>
                    )}
                  </p>
                )}
              </div>

              {/* Kontaktoplysninger */}
              {(fuldeNavn || email || telefonnummer || (erVirksomhed && (virksomhed || cvr))) && (
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ fontFamily: 'OmnesBold', fontSize: '0.95rem', color: '#222222', marginBottom: '10px' }}>Kontaktoplysninger</h4>
                  {fuldeNavn && (
                    <p className={SummaryStyles.popupText} style={{ marginBottom: '6px' }}>
                      <User size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                      <strong>Navn:</strong> {fuldeNavn}
                    </p>
                  )}
                  {email && (
                    <p className={SummaryStyles.popupText} style={{ marginBottom: '6px' }}>
                      <Mail size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                      <strong>Email:</strong> {email}
                    </p>
                  )}
                  {telefonnummer && (
                    <p className={SummaryStyles.popupText} style={{ marginBottom: '6px' }}>
                      <Phone size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                      <strong>Telefon:</strong> {telefonnummer}
                    </p>
                  )}
                  {erVirksomhed && (virksomhed || cvr) && (
                    <p className={SummaryStyles.popupText} style={{ marginBottom: '0' }}>
                      <Building2 size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                      <strong>Virksomhed:</strong> {virksomhed && cvr ? `${virksomhed} (CVR: ${cvr})` : virksomhed || `CVR: ${cvr}`}
                    </p>
                  )}
                  {modtagNyheder !== undefined && (
                    <p className={SummaryStyles.popupText} style={{ marginTop: '8px', marginBottom: '0', fontSize: '0.85rem', color: '#666' }}>
                      {modtagNyheder ? '✓ Må kontaktes med reklame' : '✗ Må ikke kontaktes med reklame'}
                    </p>
                  )}
                </div>
              )}

              {/* Medarbejder Information */}
              <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #e0e0e0' }}>
                <h4 style={{ fontFamily: 'OmnesBold', fontSize: '0.95rem', color: '#222222', marginBottom: '10px' }}>
                  <Briefcase size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                  Medarbejdertildeling
                </h4>
                {availableWorkerIDs && availableWorkerIDs.length > 0 ? (
                  <>
                    <p className={SummaryStyles.popupText} style={{ marginBottom: '10px' }}>
                      <strong>Valgte medarbejdere:</strong>
                    </p>
                    <ul style={{ margin: '0 0 10px 20px', padding: 0 }}>
                      {availableWorkerIDs.map((workerID, index) => {
                        const workerName = availableWorkerNames && availableWorkerNames[index] ? availableWorkerNames[index] : null
                        return (
                          <li key={index} style={{ marginBottom: '6px', fontSize: '0.9rem', color: '#444444' }}>
                            {workerName || `Medarbejder ID: ${workerID}`}
                          </li>
                        )
                      })}
                    </ul>
                    <p className={SummaryStyles.popupText} style={{ marginTop: '10px', marginBottom: '0', fontSize: '0.85rem', color: '#666', fontStyle: 'italic' }}>
                      <strong>Hvorfor:</strong> Disse medarbejdere blev valgt fordi de har arbejdsområder, der dækker adressen ({formateretAdresse || adresse}), og de har kompetencer inden for følgende opgavetyper: {kategorier && kategorier.length > 0 ? kategorier.join(', ') : 'Generelle opgaver'}.
                    </p>
                  </>
                ) : (
                  <p className={SummaryStyles.popupText} style={{ marginBottom: '0', fontSize: '0.85rem', color: '#666' }}>
                    Ingen medarbejdere blev automatisk tildelt. Opgaven vil blive manuelt tildelt efter modtagelse.
                  </p>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PrimaryBookingComponent;
