import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import Styles from './PrimaryBookingComponent.module.css'
import BookingNavigationFooter from './bookingNavigationFooter/BookingNavigationFooter'
import BookingContent from './bookingContent/BookingContent'
import BookingSummary from './bookingSummary/BookingSummary'
import BookingHeader from './bookingHeader/BookingHeader'
import BeskrivOpgaven from './bookingContent/steps/BeskrivOpgaven'
import TidOgSted from './bookingContent/steps/TidOgSted'
import Kontaktinfo from './bookingContent/steps/Kontaktinfo'
import BookingSuccess from './bookingContent/steps/BookingSuccess'
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { storage } from '../firebase.js'
import { v4 as uuidv4 } from 'uuid'
import axios from 'axios'
import useRecaptcha from '../hooks/useRecaptcha'
import dayjs from 'dayjs'
import 'dayjs/locale/da'
import 'dayjs/locale/en'
import { AnimatePresence, motion } from 'framer-motion'
import { X, Tag, Clock, MapPin, CalendarCheck, User, Mail, Phone, Building2, FileText, Briefcase, Check } from 'lucide-react'
import SummaryStyles from './bookingSummary/BookingSummary.module.css'

const PrimaryBookingComponent = () => {
  const { t, i18n } = useTranslation()
  const [currentStep, setCurrentStep] = useState(1)
  const [direction, setDirection] = useState(1) // 1 for forward, -1 for backward
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Opdater dayjs locale når sprog skifter
  useEffect(() => {
    dayjs.locale(i18n.language)
  }, [i18n.language])
  const [opgaveBeskrivelse, setOpgaveBeskrivelse] = useState("")
  const [kortOpgavebeskrivelseDa, setKortOpgavebeskrivelseDa] = useState("")
  const [kortOpgavebeskrivelseEn, setKortOpgavebeskrivelseEn] = useState("")
  const [estimeretTidsforbrugTimer, setEstimeretTidsforbrugTimer] = useState(null)
  const [opgaveBilleder, setOpgaveBilleder] = useState([])
  const [kategorier, setKategorier] = useState([])
  const [isLoadingKategorier, setIsLoadingKategorier] = useState(false)
  const [isLoadingKortBeskrivelse, setIsLoadingKortBeskrivelse] = useState(false)
  const [opfølgendeSpørgsmålSvar, setOpfølgendeSpørgsmålSvar] = useState({})
  const [aiGeneratedQuestions, setAiGeneratedQuestions] = useState([])
  const [showQuestionsPopup, setShowQuestionsPopup] = useState(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [isAnalyzingStep1, setIsAnalyzingStep1] = useState(false)
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
  const [showSummaryModal, setShowSummaryModal] = useState(false)
  const [showSuccessScreen, setShowSuccessScreen] = useState(false)
  const [bookingResponse, setBookingResponse] = useState(null)
  const prevStepRef = useRef(1)
  const lastAnalyzedBeskrivelseRef = useRef("")
  const lastSummarizedBeskrivelseRef = useRef("")
  const lastKategorierRef = useRef(JSON.stringify(kategorier))
  const { recaptchaSiteKey, executeRecaptcha, registerRecaptchaCallback } = useRecaptcha()

  // Computed value for kortOpgavebeskrivelse based on current language
  const kortOpgavebeskrivelse = useMemo(() => {
    return i18n.language === 'en' ? kortOpgavebeskrivelseEn : kortOpgavebeskrivelseDa
  }, [i18n.language, kortOpgavebeskrivelseDa, kortOpgavebeskrivelseEn])

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
          onNavigateNext={handleStep1Next}
          isAnalyzing={isAnalyzingStep1}
          aiQuestions={aiGeneratedQuestions}
          showQuestionsPopup={showQuestionsPopup}
          currentQuestionIndex={currentQuestionIndex}
          onQuestionIndexChange={setCurrentQuestionIndex}
          onCloseQuestions={() => {
            setShowQuestionsPopup(false)
            // Optionally proceed to step 2 when closing
            if (kortOpgavebeskrivelseDa && kategorier.length > 0) {
              setDirection(1)
              setCurrentStep(2)
            }
          }}
          onContinueQuestions={() => {
            setShowQuestionsPopup(false)
            // Proceed to step 2
            if (kortOpgavebeskrivelseDa && kategorier.length > 0) {
              setDirection(1)
              setCurrentStep(2)
            }
          }}
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
          pulseField={step2PulseField}
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
            // Legacy format - set both to same value
            setKortOpgavebeskrivelseDa(summaryResponse.data || opgaveBeskrivelse)
            setKortOpgavebeskrivelseEn(summaryResponse.data || opgaveBeskrivelse)
            setEstimeretTidsforbrugTimer(null)
          } else {
            // New format with both Danish and English summaries
            const opsummeringDa = summaryResponse.data?.opsummeringDa || ""
            const opsummeringEn = summaryResponse.data?.opsummeringEn || ""
            
            // Only use fallback to opgaveBeskrivelse if both are empty
            setKortOpgavebeskrivelseDa(opsummeringDa || opgaveBeskrivelse)
            setKortOpgavebeskrivelseEn(opsummeringEn || opgaveBeskrivelse)
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
          setKortOpgavebeskrivelseDa(opgaveBeskrivelse)
          setKortOpgavebeskrivelseEn(opgaveBeskrivelse)
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
        
        console.log("=== CLIENT: KATEGORI FETCH START ===");
        console.log("📍 Current step:", currentStep);
        console.log("📝 Opgavebeskrivelse length:", opgaveBeskrivelse.trim().length);
        console.log("📝 Opgavebeskrivelse preview:", opgaveBeskrivelse.trim().substring(0, 200));
        console.log("🔄 Has beskrivelse changed?", hasBeskrivelseChanged);
        console.log("📋 Last analyzed:", lastAnalyzedBeskrivelseRef.current);
        
        if (hasBeskrivelseChanged) {
          setIsLoadingKategorier(true)
          console.log("🚀 Sender request til API...");
          console.log("🌐 API URL:", `${import.meta.env.VITE_API_URL}/ai/parseKategorierFromText`);
          
          try {
            const response = await axios.post(
              `${import.meta.env.VITE_API_URL}/ai/parseKategorierFromText`,
              { opgaveBeskrivelse }
            )
            
            console.log("✅ API response modtaget");
            console.log("📦 Response status:", response.status);
            console.log("📦 Response data:", response.data);
            console.log("📦 Response data type:", typeof response.data);
            console.log("📦 Response data is array?", Array.isArray(response.data));
            console.log("📦 Response data length:", Array.isArray(response.data) ? response.data.length : "N/A");
            
            const kategorier = response.data || []
            console.log("📊 Kategorier der sættes:", kategorier);
            console.log("📊 Antal kategorier:", kategorier.length);
            
            setKategorier(kategorier)
            // Update the ref to track what we last analyzed
            lastAnalyzedBeskrivelseRef.current = opgaveBeskrivelse.trim()
            // Reset answers when description changes (new analysis = new questions)
            setOpfølgendeSpørgsmålSvar({})
            
            console.log("✅ Kategorier sat succesfuldt");
            console.log("=== CLIENT: KATEGORI FETCH SLUT ===");
          } catch (error) {
            console.error("❌ FEJL ved fetch af kategorier");
            console.error("❌ Error message:", error.message);
            console.error("❌ Error response:", error.response?.data);
            console.error("❌ Error status:", error.response?.status);
            console.error("❌ Error config:", error.config);
            console.error("❌ Full error:", error);
            setKategorier([])
            console.log("=== CLIENT: KATEGORI FETCH SLUT (FEJL) ===");
          } finally {
            setIsLoadingKategorier(false)
          }
        } else {
          console.log("⏭️ Beskrivelse ikke ændret, springer fetch over");
          console.log("=== CLIENT: KATEGORI FETCH SLUT (SKIPPED) ===");
        }
        // If description hasn't changed, keep existing kategorier and answers
      } else {
        if (currentStep !== 2) {
          console.log("⏭️ Ikke på step 2, springer fetch over (step:", currentStep, ")");
        } else if (!opgaveBeskrivelse.trim()) {
          console.log("⏭️ Ingen opgavebeskrivelse, springer fetch over");
        }
      }
    }

    fetchKategorier()
  }, [currentStep, opgaveBeskrivelse])


  // Nulstil step 2 data når kategorier ændrer sig
  useEffect(() => {
    const currentKategorierStr = JSON.stringify(kategorier)
    const lastKategorierStr = lastKategorierRef.current
    
    // Tjek om kategorier faktisk er ændret (ikke bare første render)
    if (lastKategorierStr !== currentKategorierStr && lastKategorierStr !== JSON.stringify([])) {
      // Nulstil alle step 2 relaterede data
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

  // Hent ledige tider automatisk når man kommer tilbage til step 2 med eksisterende adresse og dato
  useEffect(() => {
    const fetchAvailableTimes = async () => {
      const hasAddress = adresse && adresse.trim()
      const hasDate = valgtDato !== null && valgtDato !== undefined
      const hasCategories = kategorier && kategorier.length > 0
      const needsData = allAvailableSlots.length === 0
      
      if (currentStep === 2 && hasAddress && hasDate && hasCategories && needsData && !isLoadingWorkers && !isLoadingTimes) {
        setIsLoadingWorkers(true)
        setIsLoadingTimes(true)
        setTidOgStedError(null)

        try {
          // Fetch available workers
          // Extract Danish category names for API (handle both string and object formats)
          const kategoriNavne = kategorier.map(k => typeof k === 'string' ? k : k.opgavetype)
          const workersResponse = await axios.post(
            `${import.meta.env.VITE_API_URL}/brugere/getAvailableWorkers`,
            {
              adresse,
              kategorier: kategoriNavne
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
          setTidOgStedError(t('tidOgSted.kunneIkkeHenteTidspunkter'))
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

  const totaltAntalSpørgsmål = aiGeneratedQuestions.length

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
      
      // Append AI questions to opgaveBeskrivelse if they exist
      let finalOpgaveBeskrivelse = opgaveBeskrivelse
      if (aiGeneratedQuestions && aiGeneratedQuestions.length > 0) {
        const questionsText = aiGeneratedQuestions.map((q, index) => {
          const questionText = i18n.language === 'en' 
            ? (q.spørgsmålEn || q.spørgsmål) 
            : (q.spørgsmål || q.spørgsmålEn)
          return `${index + 1}. ${questionText}`
        }).join('\n')
        
        finalOpgaveBeskrivelse = `${opgaveBeskrivelse}\n\n${t('beskrivOpgaven.aiSporgsmaal') || 'AI opfølgende spørgsmål:'}\n${questionsText}`
      }
      
      const bookingData = {
        opgaveBeskrivelse: finalOpgaveBeskrivelse,
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
        valgtTidspunkt: valgtTidspunkt || null, // Include selected timeslot with brugerID, start, end
        recaptchaToken
      }

      // Submit booking to server
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/opgaver/booking`,
        bookingData
      )

      if (response.data.success) {
        // Store booking response and show success screen
        setBookingResponse(response.data)
        setShowSuccessScreen(true)
      }
    } catch (error) {
      console.error('Error submitting booking:', error)
      alert(error.response?.data?.message || t('alerts.nogetGikGalt'))
    } finally {
      setIsSubmitting(false)
    }
  }, [
    opgaveBeskrivelse, 
    opgaveBilleder, 
    opfølgendeSpørgsmålSvar,
    aiGeneratedQuestions,
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
    modtagNyheder,
    i18n.language,
    t
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
    // setShowBookingPopup(true)
    
    // TODO: Uncomment this when ready to implement actual booking submission
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

  // Handler for step 1 "Next" button - analyzes task and generates questions
  const handleStep1Next = async () => {
    if (countWords(opgaveBeskrivelse) < 5) {
      return // Don't proceed if less than 5 words
    }

    // Check if the description has changed since last analysis
    const hasBeskrivelseChanged = lastAnalyzedBeskrivelseRef.current !== opgaveBeskrivelse.trim()
    
    // If description hasn't changed, skip analysis and proceed based on existing state
    if (!hasBeskrivelseChanged) {
      // If questions already exist, show them
      if (aiGeneratedQuestions.length > 0) {
        setCurrentQuestionIndex(0)
        setShowQuestionsPopup(true)
      } else {
        // Otherwise proceed to step 2
        setDirection(1)
        setCurrentStep(2)
      }
      return
    }

    setIsAnalyzingStep1(true)
    
    try {
      // Call all three endpoints in parallel
      const [summaryResponse, categoriesResponse, questionsResponse] = await Promise.all([
        axios.post(
          `${import.meta.env.VITE_API_URL}/ai/summarizeOpgavebeskrivelse`,
          { opgaveBeskrivelse }
        ),
        axios.post(
          `${import.meta.env.VITE_API_URL}/ai/parseKategorierFromText`,
          { opgaveBeskrivelse }
        ),
        axios.post(
          `${import.meta.env.VITE_API_URL}/ai/generateQuestions`,
          { opgaveBeskrivelse }
        )
      ])

      // Handle summary response
      if (typeof summaryResponse.data === 'string') {
        setKortOpgavebeskrivelseDa(summaryResponse.data || opgaveBeskrivelse)
        setKortOpgavebeskrivelseEn(summaryResponse.data || opgaveBeskrivelse)
        setEstimeretTidsforbrugTimer(null)
      } else {
        const opsummeringDa = summaryResponse.data?.opsummeringDa || ""
        const opsummeringEn = summaryResponse.data?.opsummeringEn || ""
        setKortOpgavebeskrivelseDa(opsummeringDa || opgaveBeskrivelse)
        setKortOpgavebeskrivelseEn(opsummeringEn || opgaveBeskrivelse)
        setEstimeretTidsforbrugTimer(summaryResponse.data?.estimeretTidsforbrugTimer || null)
      }

      // Handle categories response
      setKategorier(categoriesResponse.data || [])
      lastAnalyzedBeskrivelseRef.current = opgaveBeskrivelse.trim()
      lastSummarizedBeskrivelseRef.current = opgaveBeskrivelse.trim()

      // Handle questions response
      const questions = questionsResponse.data || []
      setAiGeneratedQuestions(questions)
      
      if (questions.length === 0) {
        // No questions - proceed to step 2
        setDirection(1)
        setCurrentStep(2)
      } else {
        // Questions generated - show popup and stay in step 1
        setCurrentQuestionIndex(0)
        setShowQuestionsPopup(true)
      }
    } catch (error) {
      console.error('Error analyzing step 1:', error)
      // On error, proceed to step 2 anyway
      setDirection(1)
      setCurrentStep(2)
    } finally {
      setIsAnalyzingStep1(false)
    }
  }

  // Wrapper function to handle step changes with direction tracking
  const handleStepChange = (newStep) => {
    // If trying to go forward from step 1, check if questions are already generated
    if (currentStep === 1 && newStep === 2) {
      // If questions are already generated, proceed to step 2
      if (aiGeneratedQuestions.length > 0) {
        setDirection(1)
        setCurrentStep(2)
      } else {
        // Otherwise, generate questions first
        handleStep1Next()
      }
      return
    }
    
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
  
  // Determine which field should pulse in step 2 (priority: adresse → dato → tidsunkt)
  const step2PulseField = React.useMemo(() => {
    if (currentStep !== 2) return null
    
    const hasAddress = (formateretAdresse || adresse) && (formateretAdresse || adresse).trim().length > 0
    const hasDate = valgtDato !== null && valgtDato !== undefined
    const hasTime = valgtTidspunkt !== null && valgtTidspunkt !== undefined
    
    // Check if manual time preference is needed (when no workers or no slots)
    const needsManualTime = availableWorkerIDs.length === 0 || (availableWorkerIDs.length > 0 && slotsWithin4Months.length === 0)
    const hasManualTime = manualTimePreference && manualTimePreference.trim().length > 0
    
    if (!hasAddress) {
      return 'adresse'
    }
    if (hasAddress && !hasDate) {
      // Only check for date if we have workers and slots
      if (availableWorkerIDs.length > 0 && slotsWithin4Months.length > 0) {
        return 'dato'
      }
      // If no workers or no slots, skip to manual time preference
      if (needsManualTime && !hasManualTime) {
        return 'manualTime'
      }
    }
    if (hasAddress && hasDate && !hasTime) {
      // Only check for time if we have slots
      if (slotsWithin4Months.length > 0) {
        return 'tidsunkt'
      }
      // If no slots, check manual time preference
      if (needsManualTime && !hasManualTime) {
        return 'manualTime'
      }
    }
    return null
  }, [currentStep, formateretAdresse, adresse, valgtDato, valgtTidspunkt, manualTimePreference, availableWorkerIDs, slotsWithin4Months])

  // Check if step 2 (Tid & Sted) is complete
  const isStep2Complete = React.useMemo(() => {
    if (currentStep !== 2) return false
    
    const hasAddress = (formateretAdresse || adresse) && (formateretAdresse || adresse).trim().length > 0
    const hasDate = valgtDato !== null && valgtDato !== undefined
    const hasTime = valgtTidspunkt !== null && valgtTidspunkt !== undefined
    
    // Check if manual time preference is needed
    const needsManualTime = availableWorkerIDs.length === 0 || (availableWorkerIDs.length > 0 && slotsWithin4Months.length === 0)
    const hasManualTime = manualTimePreference && manualTimePreference.trim().length > 0
    
    if (!hasAddress) return false
    
    // If we have workers and slots, we need both date and time
    if (availableWorkerIDs.length > 0 && slotsWithin4Months.length > 0) {
      return hasDate && hasTime
    }
    
    // If no workers or no slots, we need manual time preference
    if (needsManualTime) {
      return hasManualTime
    }
    
    return false
  }, [currentStep, formateretAdresse, adresse, valgtDato, valgtTidspunkt, manualTimePreference, availableWorkerIDs, slotsWithin4Months])
  
  // Check if step 2 (Tid & Sted) is valid: either has date+time OR manual time preference (when no workers OR no slots within 4 months)
  // Also requires address to be filled
  const hasAddress = (formateretAdresse || adresse) && (formateretAdresse || adresse).trim().length > 0
  const isStep2Valid = currentStep !== 2 || 
    (hasAddress && availableWorkerIDs.length > 0 && hasSlotsWithin4Months && valgtDato && valgtTidspunkt) ||
    (hasAddress && availableWorkerIDs.length > 0 && !hasSlotsWithin4Months && !isLoadingWorkers && manualTimePreference.trim().length > 0) ||
    (hasAddress && availableWorkerIDs.length === 0 && !isLoadingWorkers && manualTimePreference.trim().length > 0)
  
  // Check if step 3 (Kontaktinfo) is valid (handled by Kontaktinfo component via onValidationChange)
  const isStep3ValidCheck = currentStep !== 3 || isStep4Valid
  
  const isStepValid = isStep1Valid && isStep2Valid && isStep3ValidCheck
  const shouldPulseButton = (currentStep === 1 && wordCount >= 5 && !isSubmitting && !isAnalyzingStep1) || 
                            (currentStep === 2 && isStep2Complete && !isSubmitting)

  // Navigation conditions: check actual conditions regardless of current step
  // Step 2 (Tid & Sted) can be accessed if step 1 condition is met (wordCount >= 5)
  const canNavigateToStep2 = wordCount >= 5
  
  // Step 3 (Kontaktinfo) can be accessed if step 2 condition is met
  const canNavigateToStep3 = 
    (hasAddress && availableWorkerIDs.length > 0 && hasSlotsWithin4Months && valgtDato && valgtTidspunkt) ||
    (hasAddress && availableWorkerIDs.length > 0 && !hasSlotsWithin4Months && !isLoadingWorkers && manualTimePreference.trim().length > 0) ||
    (hasAddress && availableWorkerIDs.length === 0 && !isLoadingWorkers && manualTimePreference.trim().length > 0) ||
    (availableWorkerIDs.length === 0 && isLoadingWorkers)

  // Show success screen if booking was successful
  if (showSuccessScreen) {
    return (
      <div className={Styles.primaryBookingComponent} style={{ height: '100%', width: '100%' }}>
        <div className={`${Styles.bookingContainer} ${Styles.bookingContainerSuccess}`} style={{ width: '100%', padding: '20px', height: '100%', overflowY: 'auto', position: 'relative' }}>
          <BookingSuccess
            bookingData={bookingResponse}
            kortOpgavebeskrivelse={kortOpgavebeskrivelse}
            estimeretTidsforbrugTimer={estimeretTidsforbrugTimer}
            kategorier={kategorier}
            opfølgendeSpørgsmålSvar={opfølgendeSpørgsmålSvar}
            aiGeneratedQuestions={aiGeneratedQuestions}
            adresse={adresse}
            formateretAdresse={formateretAdresse}
            valgtDato={valgtDato}
            valgtTidspunkt={valgtTidspunkt}
            manualTimePreference={manualTimePreference}
            fuldeNavn={fuldeNavn}
            email={email}
            telefonnummer={telefonnummer}
            erVirksomhed={erVirksomhed}
            virksomhed={virksomhed}
            cvr={cvr}
            opgaveBilleder={opgaveBilleder}
            kommentarer={kommentarer}
            modtagNyheder={modtagNyheder}
            availableWorkerNames={availableWorkerNames}
          />
        </div>
      </div>
    )
  }

  return (
    <div className={Styles.primaryBookingComponent}>
      {/* Mobile: Fixed Header */}
      <div className={Styles.headerWrapper}>
        <BookingHeader 
          currentStep={currentStep} 
          setCurrentStep={handleStepChange} 
          steps={steps}
          canNavigateToStep2={canNavigateToStep2}
          canNavigateToStep3={canNavigateToStep3}
          wordCount={wordCount}
          valgtDato={valgtDato}
          valgtTidspunkt={valgtTidspunkt}
          manualTimePreference={manualTimePreference}
          availableWorkerIDs={availableWorkerIDs}
          isLoadingWorkers={isLoadingWorkers}
        />
      </div>
      
      <div className={Styles.bookingContainer}>
        {/* Desktop: Header inside container */}
        <div className={Styles.desktopHeader}>
          <BookingHeader 
            currentStep={currentStep} 
            setCurrentStep={handleStepChange} 
            steps={steps}
            canNavigateToStep2={canNavigateToStep2}
            canNavigateToStep3={canNavigateToStep3}
            wordCount={wordCount}
            valgtDato={valgtDato}
            valgtTidspunkt={valgtTidspunkt}
            manualTimePreference={manualTimePreference}
            availableWorkerIDs={availableWorkerIDs}
            isLoadingWorkers={isLoadingWorkers}
          />
        </div>
        <div className={Styles.bookingHeaderContentContainer}>
          <BookingContent currentStep={currentStep} steps={steps} direction={direction} />
        </div>
        {/* Desktop: Footer inside container */}
        <div className={Styles.desktopFooter}>
          <BookingNavigationFooter 
            currentStep={currentStep} 
            setCurrentStep={handleStepChange}
            isLastStep={isLastStep}
            onConfirm={handleConfirmBooking}
            isSubmitting={isSubmitting}
            isAnalyzing={isAnalyzingStep1}
            recaptchaSiteKey={recaptchaSiteKey}
            isStepValid={isStepValid}
            shouldPulse={shouldPulseButton}
            wordCount={wordCount}
            onShowSummary={() => setShowSummaryModal(true)}
          />
        </div>
      </div>
      
      {/* Mobile: Fixed Footer */}
      <div className={Styles.footerWrapper}>
        <BookingNavigationFooter 
          currentStep={currentStep} 
          setCurrentStep={handleStepChange}
          isLastStep={isLastStep}
          onConfirm={handleConfirmBooking}
          isSubmitting={isSubmitting}
          isAnalyzing={isAnalyzingStep1}
          recaptchaSiteKey={recaptchaSiteKey}
            isStepValid={isStepValid}
            shouldPulse={shouldPulseButton}
            wordCount={wordCount}
            onShowSummary={() => setShowSummaryModal(true)}
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
      
      {/* Summary Modal - Bottom Sheet */}
      <AnimatePresence>
        {showSummaryModal && (
          <>
            <motion.div
              className={SummaryStyles.modalOverlay}
              onClick={() => setShowSummaryModal(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />
            <motion.div
              className={SummaryStyles.bottomSheet}
              initial={{ y: '110%' }}
              animate={{ y: 1 }}
              exit={{ y: '110%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.2 }}
              onDragEnd={(event, info) => {
                // If dragged down more than 100px or with velocity > 500, close the modal
                if (info.offset.y > 100 || info.velocity.y > 500) {
                  setShowSummaryModal(false)
                }
                // Otherwise, the spring animation will return it to y: 1
              }}
            >
              <div 
                className={SummaryStyles.bottomSheetHandle} 
                onClick={() => setShowSummaryModal(false)}
                style={{ touchAction: 'none' }}
              />
              <div className={SummaryStyles.bottomSheetHeader}>
                <h2 className={SummaryStyles.bottomSheetTitle}>{t('summary.opsummering')}</h2>
                <button className={SummaryStyles.bottomSheetCloseButton} onClick={() => setShowSummaryModal(false)}>
                  <X size={20} />
                </button>
              </div>
              <div className={SummaryStyles.bottomSheetContent}>
                <BookingSummary 
                  currentStep={currentStep} 
                  setCurrentStep={setCurrentStep}
                  kortOpgavebeskrivelse={kortOpgavebeskrivelse}
                  estimeretTidsforbrugTimer={estimeretTidsforbrugTimer}
                  kategorier={kategorier}
                  isLoadingKortBeskrivelse={isLoadingKortBeskrivelse}
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
                  onClose={() => setShowSummaryModal(false)}
                />
              </div>
              <div className={SummaryStyles.bottomSheetFooter}>
                {recaptchaSiteKey ? (
                  <button 
                    className={`${SummaryStyles.confirmButton} g-recaptcha`}
                    data-sitekey={recaptchaSiteKey}
                    data-callback="onRecaptchaSubmit"
                    data-action="submit"
                    onClick={(e) => {
                      e.preventDefault()
                      if (!window.recaptchaCallbackTriggered) {
                        handleConfirmBooking()
                      }
                    }}
                    disabled={isSubmitting || !isStepValid}
                  >
                    {isSubmitting ? t('buttons.sender') : t('buttons.bekraeftBooking')}
                  </button>
                ) : (
                  <button 
                    className={SummaryStyles.confirmButton}
                    onClick={handleConfirmBooking} 
                    disabled={isSubmitting || !isStepValid}
                  >
                    {isSubmitting ? t('buttons.sender') : t('buttons.bekraeftBooking')}
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
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
              <h3 className={SummaryStyles.popupTitle}>Oplysninger om bookingen</h3>
              
              {/* Opgave Information */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ fontFamily: 'OmnesBold', fontSize: '0.95rem', color: '#222222', marginBottom: '10px' }}>Opgave</h4>
                {kortOpgavebeskrivelse && (
                  <p className={SummaryStyles.popupText} style={{ marginBottom: '8px' }}>
                    <strong>Beskrivelse:</strong> {kortOpgavebeskrivelse}
                  </p>
                )}
                {opgaveBeskrivelse && opgaveBeskrivelse !== kortOpgavebeskrivelseDa && opgaveBeskrivelse !== kortOpgavebeskrivelseEn && (
                  <p className={SummaryStyles.popupText} style={{ marginBottom: '8px', fontSize: '0.85rem', color: '#666' }}>
                    <strong>Fuld beskrivelse:</strong> {opgaveBeskrivelse}
                  </p>
                )}
                {kategorier && kategorier.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                    {kategorier.map((kategori, index) => {
                      // Handle both string and object formats, use English if language is English
                      const displayKategori = typeof kategori === 'string' 
                        ? kategori 
                        : (i18n.language === 'en' && kategori.opgavetypeEn ? kategori.opgavetypeEn : kategori.opgavetype)
                      return (
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
                          {displayKategori}
                        </span>
                      )
                    })}
                  </div>
                )}
                {estimeretTidsforbrugTimer !== null && estimeretTidsforbrugTimer !== undefined && (
                  <p className={SummaryStyles.popupText} style={{ marginTop: '8px', marginBottom: '0' }}>
                    <Clock size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                    <strong>Anslået tidsforbrug:</strong> {estimeretTidsforbrugTimer >= 8 ? '8+' : estimeretTidsforbrugTimer} {estimeretTidsforbrugTimer >= 8 ? 'timer' : (estimeretTidsforbrugTimer === 1 ? 'time' : 'timer')}
                  </p>
                )}
                {opgaveBilleder && opgaveBilleder.length > 0 && (
                  <p className={SummaryStyles.popupText} style={{ marginTop: '8px', marginBottom: '0' }}>
                    <strong>Billeder:</strong> {opgaveBilleder.length} {opgaveBilleder.length === 1 ? 'billede' : 'billeder'}
                  </p>
                )}
              </div>


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
                      <strong>Hvorfor:</strong> Disse medarbejdere blev valgt fordi de har arbejdsområder, der dækker adressen ({formateretAdresse || adresse}), og de har kompetencer inden for følgende opgavetyper: {kategorier && kategorier.length > 0 ? kategorier.map(k => typeof k === 'string' ? k : (i18n.language === 'en' && k.opgavetypeEn ? k.opgavetypeEn : k.opgavetype)).join(', ') : 'Generelle opgaver'}.
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
