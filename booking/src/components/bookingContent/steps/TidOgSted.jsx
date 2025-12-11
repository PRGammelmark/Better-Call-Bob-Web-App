import React, { useState, useEffect, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { StaticDatePicker } from '@mui/x-date-pickers/StaticDatePicker'
import { PickersDay } from '@mui/x-date-pickers/PickersDay'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'
import 'dayjs/locale/da'
import 'dayjs/locale/en'
import { Check, MapPin, Calendar, Clock, ChevronDown } from 'lucide-react'
import StepsStyles from './Steps.module.css'
import Styles from './TidOgSted.module.css'
import DawaAutocomplete from './DawaAutocomplete'
import axios from 'axios'

// Custom day component to highlight days with available times
function HighlightablePickersDay(props) {
  const { day, datesWithAvailableTimes, selectedDate, outsideCurrentMonth, ...other } = props
  const dateStr = dayjs(day).format('YYYY-MM-DD')
  const today = dayjs().startOf('day')
  const tomorrow = today.add(1, 'day')
  const dayDate = dayjs(day).startOf('day')
  const isPastOrToday = dayDate.isBefore(tomorrow)
  const hasAvailableTimes = datesWithAvailableTimes.has(dateStr) && !isPastOrToday
  const isSelected = selectedDate && dayjs(selectedDate).format('YYYY-MM-DD') === dateStr

  return (
    <PickersDay
      {...other}
      outsideCurrentMonth={outsideCurrentMonth}
      day={day}
      sx={{
        ...(hasAvailableTimes && {
          backgroundColor: isSelected ? '#59bf1a' : 'rgba(89, 191, 26, 0.3)',
          color: isSelected ? '#ffffff' : '#333',
          fontWeight: isSelected ? 600 : 500,
          '&:hover': {
            backgroundColor: isSelected ? '#4aa015' : 'rgba(89, 191, 26, 0.5)'
          },
          '&.Mui-selected': {
            backgroundColor: '#59bf1a',
            color: '#ffffff',
            fontWeight: 600
          }
        })
      }}
    />
  )
}

const TidOgSted = ({ 
  kategorier, 
  adresse,
  formateretAdresse,
  onAddressChange, 
  onFormateretAdresseChange,
  onDateChange, 
  onTimeChange, 
  valgtDato, 
  valgtTidspunkt,
  manualTimePreference,
  onManualTimePreferenceChange,
  availableWorkerIDs,
  onAvailableWorkerIDsChange,
  availableWorkerNames,
  onAvailableWorkerNamesChange,
  allAvailableSlots,
  onAllAvailableSlotsChange,
  isLoadingWorkers,
  onIsLoadingWorkersChange,
  isLoadingTimes,
  onIsLoadingTimesChange,
  error,
  onErrorChange,
  estimeretTidsforbrugTimer = null,
  pulseField = null,
  step2WasWiped = false
}) => {
  const { t, i18n } = useTranslation()
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null)
  const [availableTimes, setAvailableTimes] = useState([])
  const [isCalendarOpen, setIsCalendarOpen] = useState(true)
  const prevKategorierRef = useRef(kategorier)
  
  // Opdater dayjs locale når sprog skifter
  useEffect(() => {
    dayjs.locale(i18n.language)
  }, [i18n.language])
  
  // Filtrer slots til kun at inkludere dem inden for de næste 4 måneder
  const slotsWithin4Months = useMemo(() => {
    const now = dayjs()
    const fourMonthsFromNow = now.add(4, 'month')
    
    return allAvailableSlots.filter(slot => {
      const slotDate = dayjs(slot.datoTidFra)
      return slotDate.isAfter(now) && slotDate.isBefore(fourMonthsFromNow)
    })
  }, [allAvailableSlots])
  
  // Beregn showCalendar baseret på om vi har data, valgt dato, ingen medarbejdere, eller ingen kategorier
  const hasNoCategories = !kategorier || kategorier.length === 0
  const hasSlotsWithin4Months = slotsWithin4Months.length > 0
  // Show calendar section if: we have a selected date, OR we have workers (regardless of slots), OR no workers but have address, OR no categories but have address
  const showCalendar = valgtDato !== null || availableWorkerIDs.length > 0 || (availableWorkerIDs.length === 0 && !isLoadingWorkers && formateretAdresse) || (hasNoCategories && formateretAdresse)

  // Reset kalender-data når kategorier ændres (men behold adressen)
  useEffect(() => {
    const prevKategorier = prevKategorierRef.current
    const kategorierChanged = JSON.stringify(prevKategorier) !== JSON.stringify(kategorier)
    
    if (kategorierChanged && prevKategorier !== undefined) {
      // Reset kalender-data, men behold adresse og formateretAdresse
      if (onDateChange) onDateChange(null)
      if (onTimeChange) onTimeChange(null)
      if (onAvailableWorkerIDsChange) onAvailableWorkerIDsChange([])
      if (onAllAvailableSlotsChange) onAllAvailableSlotsChange([])
      if (onManualTimePreferenceChange) onManualTimePreferenceChange("")
      if (onErrorChange) onErrorChange(null)
      setSelectedTimeSlot(null)
    }
    
    prevKategorierRef.current = kategorier
  }, [kategorier, onDateChange, onTimeChange, onAvailableWorkerIDsChange, onAllAvailableSlotsChange, onManualTimePreferenceChange, onErrorChange])

  // Synkroniser selectedTimeSlot med valgtTidspunkt når availableTimes ændres
  useEffect(() => {
    if (valgtTidspunkt && availableTimes.length > 0) {
      const matchingSlot = availableTimes.find(slot => {
        const slotStart = slot.start.format('YYYY-MM-DDTHH:mm:ss')
        const slotEnd = slot.end.format('YYYY-MM-DDTHH:mm:ss')
        const valgtStart = dayjs(valgtTidspunkt.start).format('YYYY-MM-DDTHH:mm:ss')
        const valgtEnd = dayjs(valgtTidspunkt.end).format('YYYY-MM-DDTHH:mm:ss')
        return slotStart === valgtStart && slotEnd === valgtEnd
      })
      if (matchingSlot && (!selectedTimeSlot || !matchingSlot.start.isSame(selectedTimeSlot.start))) {
        setSelectedTimeSlot(matchingSlot)
      }
    } else if (!valgtTidspunkt && selectedTimeSlot) {
      setSelectedTimeSlot(null)
    }
  }, [availableTimes, valgtTidspunkt, selectedTimeSlot])

  // Fetch available workers and times with a specific address
  const handleShowAvailableTimesWithAddress = async (addressToUse, dawaAddressData = null) => {
    if (!addressToUse || !addressToUse.trim()) {
      if (onErrorChange) {
        onErrorChange(t('tidOgSted.indtastAdresseFoerst'))
      }
      return
    }

    const hasNoCategories = !kategorier || kategorier.length === 0

    if (onIsLoadingWorkersChange) onIsLoadingWorkersChange(true)
    if (onIsLoadingTimesChange) onIsLoadingTimesChange(true)
    if (onErrorChange) onErrorChange(null)

    try {
      // Fetch available workers (dette validerer også adressen)
      // Extract Danish category names for API (handle both string and object formats)
      const kategoriNavne = hasNoCategories ? [] : kategorier.map(k => typeof k === 'string' ? k : k.opgavetype)
      
      // Hvis vi har DAWA adressedata med koordinater, send dem med
      const requestBody = {
        adresse: addressToUse,
        kategorier: kategoriNavne
      }
      
      console.log('📍 DAWA address data received:', dawaAddressData)
      
      // Hvis DAWA adressedata har koordinater, send dem med så serveren kan bruge dem direkte
      // DAWA bruger forskellige strukturer, så vi tjekker flere muligheder
      // Vigtigt: DAWA bruger x (længdegrad/longitude) og y (breddegrad/latitude)
      let lat, lng
      
      if (dawaAddressData) {
        // Struktur 1: adresse.x og adresse.y (fra autocomplete response)
        if (dawaAddressData.adresse?.x !== undefined && dawaAddressData.adresse?.y !== undefined) {
          lng = dawaAddressData.adresse.x  // x er længdegrad (longitude)
          lat = dawaAddressData.adresse.y   // y er breddegrad (latitude)
          console.log('📍 Found coordinates as x/y in adresse object:', { lat, lng })
        }
        // Struktur 2: x og y direkte på objektet (hvis adresse ikke er wrapped)
        else if (dawaAddressData.x !== undefined && dawaAddressData.y !== undefined) {
          lng = dawaAddressData.x  // x er længdegrad (longitude)
          lat = dawaAddressData.y   // y er breddegrad (latitude)
          console.log('📍 Found coordinates as x/y directly on object:', { lat, lng })
        }
        // Struktur 3: adgangsadresse.x og adgangsadresse.y (fuld adresse)
        else if (dawaAddressData.adgangsadresse?.x !== undefined && dawaAddressData.adgangsadresse?.y !== undefined) {
          lng = dawaAddressData.adgangsadresse.x
          lat = dawaAddressData.adgangsadresse.y
          console.log('📍 Found coordinates as x/y in adgangsadresse:', { lat, lng })
        }
        // Struktur 4: adgangsadresse.koordinater array (fuld adresse)
        else if (dawaAddressData.adgangsadresse?.koordinater && Array.isArray(dawaAddressData.adgangsadresse.koordinater)) {
          const koord = dawaAddressData.adgangsadresse.koordinater
          if (koord.length >= 2) {
            lng = koord[0]  // Første element er længdegrad
            lat = koord[1]  // Andet element er breddegrad
            console.log('📍 Found coordinates in adgangsadresse.koordinater array:', { lat, lng })
          }
        }
        // Struktur 5: koordinater direkte på objektet som array
        else if (dawaAddressData.koordinater && Array.isArray(dawaAddressData.koordinater)) {
          const koord = dawaAddressData.koordinater
          if (koord.length >= 2) {
            lng = koord[0]
            lat = koord[1]
            console.log('📍 Found coordinates directly on object as array:', { lat, lng })
          }
        }
      }
      
      if (lat !== undefined && lng !== undefined && !isNaN(lat) && !isNaN(lng)) {
        requestBody.latitude = parseFloat(lat)
        requestBody.longitude = parseFloat(lng)
        console.log('✅ Sending coordinates to server:', { latitude: requestBody.latitude, longitude: requestBody.longitude })
      } else {
        console.log('⚠️ No valid coordinates found in DAWA data')
        console.log('📍 Available properties:', Object.keys(dawaAddressData || {}))
        if (dawaAddressData?.adresse) {
          console.log('📍 Address object properties:', Object.keys(dawaAddressData.adresse))
          console.log('📍 Address object:', dawaAddressData.adresse)
        }
      }
      
      const workersResponse = await axios.post(
        `${import.meta.env.VITE_API_URL}/brugere/getAvailableWorkers`,
        requestBody
      )
      const workerIDs = workersResponse.data?.workerIDs || workersResponse.data || []
      const workerNames = workersResponse.data?.workerNames || []
      const formateretAdresseFraServer = workersResponse.data?.formateretAdresse || null
      
      if (onAvailableWorkerIDsChange) onAvailableWorkerIDsChange(workerIDs)
      if (onAvailableWorkerNamesChange) onAvailableWorkerNamesChange(workerNames)
      
      // Opdater formateret adresse hvis den findes, ellers brug den adresse vi brugte
      if (onFormateretAdresseChange) {
        onFormateretAdresseChange(formateretAdresseFraServer || addressToUse)
      }
      
      // Opdater parent med den formaterede adresse hvis den findes
      if (formateretAdresseFraServer && onAddressChange) {
        onAddressChange(formateretAdresseFraServer)
      }

      // Hvis der ikke er kategorier, vis den manuelle sektion efter validering
      if (hasNoCategories) {
        if (onIsLoadingWorkersChange) onIsLoadingWorkersChange(false)
        if (onIsLoadingTimesChange) onIsLoadingTimesChange(false)
        return
      }

      if (workerIDs.length === 0) {
        // Don't set error - we'll show the manual input instead
        if (onIsLoadingWorkersChange) onIsLoadingWorkersChange(false)
        if (onIsLoadingTimesChange) onIsLoadingTimesChange(false)
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
        if (onAllAvailableSlotsChange) onAllAvailableSlotsChange(timesResponse.data || [])
      } else {
        const timesResponse = await axios.post(
          `${import.meta.env.VITE_API_URL}/ledige-tider/ledighed-for-brugere`,
          {
            brugerIDs: workerIDs
          }
        )
        if (onAllAvailableSlotsChange) onAllAvailableSlotsChange(timesResponse.data || [])
      }
    } catch (error) {
      console.error('Error fetching available times:', error)
      
      // Hvis der ikke er kategorier, og vi får en formateret adresse fra fejlen, accepter den
      if (hasNoCategories && error.response?.data?.formateretAdresse) {
        const formateretAdresseFraServer = error.response.data.formateretAdresse
        if (onFormateretAdresseChange) {
          onFormateretAdresseChange(formateretAdresseFraServer)
        }
        if (formateretAdresseFraServer && onAddressChange) {
          onAddressChange(formateretAdresseFraServer)
        }
        if (onAvailableWorkerIDsChange) onAvailableWorkerIDsChange([])
        if (onAvailableWorkerNamesChange) onAvailableWorkerNamesChange([])
        if (onAllAvailableSlotsChange) onAllAvailableSlotsChange([])
        if (onIsLoadingWorkersChange) onIsLoadingWorkersChange(false)
        if (onIsLoadingTimesChange) onIsLoadingTimesChange(false)
        return
      }
      
      // Check if address was not found (404 error)
      if (error.response?.status === 404) {
        const errorMessage = error.response?.data?.error || 'Adressen kunne ikke findes. Prøv venligst med en anden adresse.'
        if (onErrorChange) onErrorChange(errorMessage)
      } else {
        // Hvis der ikke er kategorier, vis en mere specifik fejlbesked
        if (hasNoCategories) {
          if (onErrorChange) onErrorChange('Kunne ikke validere adressen. Prøv venligst igen.')
        } else {
          if (onErrorChange) onErrorChange(t('tidOgSted.kunneIkkeHenteTidspunkter'))
        }
      }
      
      if (onAvailableWorkerIDsChange) onAvailableWorkerIDsChange([])
      if (onAllAvailableSlotsChange) onAllAvailableSlotsChange([])
      if (onFormateretAdresseChange) onFormateretAdresseChange(null)
    } finally {
      if (onIsLoadingWorkersChange) onIsLoadingWorkersChange(false)
      if (onIsLoadingTimesChange) onIsLoadingTimesChange(false)
    }
  }

  // Fetch available workers and times
  const handleShowAvailableTimes = async () => {
    if (!adresse || !adresse.trim()) {
      if (onErrorChange) {
        onErrorChange(t('tidOgSted.indtastAdresseFoerst'))
      }
      return
    }
    await handleShowAvailableTimesWithAddress(adresse)
  }

  // Get dates that have available times (only from tomorrow onwards and within 4 months)
  const datesWithAvailableTimes = useMemo(() => {
    const dates = new Set()
    const tomorrow = dayjs().add(1, 'day').startOf('day')
    slotsWithin4Months.forEach(slot => {
      const slotDate = dayjs(slot.datoTidFra).startOf('day')
      // Only include dates from tomorrow onwards
      if (slotDate.isAfter(tomorrow) || slotDate.isSame(tomorrow)) {
        const date = slotDate.format('YYYY-MM-DD')
        dates.add(date)
      }
    })
    return dates
  }, [slotsWithin4Months])

  // Helper function to round time to nearest 15 minutes (00, 15, 30, 45)
  const roundToNearestQuarter = (time) => {
    const minutes = time.minute()
    const roundedMinutes = Math.round(minutes / 15) * 15
    return time.minute(roundedMinutes).second(0).millisecond(0)
  }

  // Helper function to round time up to next quarter hour
  const roundUpToNextQuarter = (time) => {
    const minutes = time.minute()
    const remainder = minutes % 15
    if (remainder === 0) {
      return time.second(0).millisecond(0)
    }
    return time.add(15 - remainder, 'minute').second(0).millisecond(0)
  }

  // Get available time slots for selected date
  useEffect(() => {
    if (!valgtDato) {
      setAvailableTimes([])
      if (onTimeChange) {
        onTimeChange(null)
      }
      return
    }

    const selectedDateStr = dayjs(valgtDato).format('YYYY-MM-DD')
    const usingNewEndpoint = estimeretTidsforbrugTimer && estimeretTidsforbrugTimer > 0

    const timesForDate = slotsWithin4Months
      .filter(slot => {
        const slotDate = dayjs(slot.datoTidFra).format('YYYY-MM-DD')
        return slotDate === selectedDateStr
      })
      .map(slot => {
        let start = dayjs(slot.datoTidFra)
        let end = dayjs(slot.datoTidTil)

        // Hvis vi bruger det nye endpoint, er slots allerede formateret korrekt
        // Men vi runder stadig til nærmeste kvarter for konsistent visning
        if (!usingNewEndpoint) {
          // Round start time to nearest quarter hour
          start = roundToNearestQuarter(start)
          // Round end time to nearest quarter hour (round down)
          end = roundToNearestQuarter(end)
        }

        return {
          start,
          end,
          id: slot._id || slot.id,
          brugerID: slot.brugerID
        }
      })
      .filter(slot => {
        // Hvis vi bruger det nye endpoint, er slots allerede korrekt formateret
        // så vi behøver ikke filtrere på varighed
        if (usingNewEndpoint) {
          return true
        }
        // Filter out slots shorter than 1 hour for det gamle endpoint
        const duration = slot.end.diff(slot.start, 'minute')
        return duration >= 60
      })
      .sort((a, b) => a.start.diff(b.start))

    setAvailableTimes(timesForDate)
  }, [valgtDato, slotsWithin4Months, onTimeChange, estimeretTidsforbrugTimer])

  const handleDateChange = (newDate) => {
    setSelectedTimeSlot(null) // Reset time selection when date changes
    if (onDateChange) {
      onDateChange(newDate)
    }
    if (onTimeChange) {
      onTimeChange(null) // Reset time selection when date changes
    }
    // On mobile, collapse calendar when date is selected, open when cleared
    if (window.innerWidth <= 750) {
      setIsCalendarOpen(!newDate)
    }
  }

  // Open calendar when date is cleared
  useEffect(() => {
    if (!valgtDato && window.innerWidth <= 750) {
      setIsCalendarOpen(true)
    }
  }, [valgtDato])

  const handleTimeSelect = (timeSlot) => {
    setSelectedTimeSlot(timeSlot)
    if (onTimeChange) {
      onTimeChange({
        start: timeSlot.start.toISOString(),
        end: timeSlot.end.toISOString(),
        brugerID: timeSlot.brugerID
      })
    }
  }

  // Check if a time slot is selected
  const isTimeSlotSelected = (timeSlot) => {
    if (!selectedTimeSlot) return false
    return selectedTimeSlot.start.isSame(timeSlot.start) && selectedTimeSlot.end.isSame(timeSlot.end)
  }

  // Disable dates that don't have available times or are today or in the past
  const shouldDisableDate = (date) => {
    const today = dayjs().startOf('day')
    const tomorrow = today.add(1, 'day')
    const dateDay = dayjs(date).startOf('day')
    
    // Disable today and past dates
    if (dateDay.isBefore(tomorrow)) {
      return true
    }
    
    // Disable dates without available times
    if (datesWithAvailableTimes.size === 0) {
      return true
    }
    
    const dateStr = dayjs(date).format('YYYY-MM-DD')
    return !datesWithAvailableTimes.has(dateStr)
  }

  return (
    <div className={Styles.tidOgStedContainer}>
      <div className={Styles.tidOgStedTopContainer}>
        <div className={Styles.headerSection}>
          <h2 className={StepsStyles.headingH2} style={{marginBottom: 0}}>
            <MapPin size={20} className={Styles.headingIcon} />
            {t('tidOgSted.hvorSkalOpgavenUdfores')}
          </h2>
        </div>
        <div className={Styles.addressSection}>
          <div className={`${Styles.addressInputWrapper} ${pulseField === 'adresse' ? Styles.pulsating : ''}`}>
            <DawaAutocomplete
              value={formateretAdresse || adresse}
              onChange={(newValue) => {
                if (onAddressChange) {
                  onAddressChange(newValue)
                }
                // Reset formateret adresse når brugeren ændrer input
                if (formateretAdresse && onFormateretAdresseChange) {
                  onFormateretAdresseChange(null)
                }
                // Clear error when user starts typing a new address
                if (error && onErrorChange) {
                  onErrorChange(null)
                }
                // Reset calendar data når adressen ændres
                if (showCalendar) {
                  if (onDateChange) onDateChange(null)
                  if (onTimeChange) onTimeChange(null)
                  if (onAvailableWorkerIDsChange) onAvailableWorkerIDsChange([])
                  if (onAllAvailableSlotsChange) onAllAvailableSlotsChange([])
                  if (onManualTimePreferenceChange) onManualTimePreferenceChange("")
                }
              }}
              onSelect={(selectedSuggestion) => {
                // Når en adresse vælges fra dropdown, hent medarbejdere automatisk
                const selectedAddress = selectedSuggestion.tekst || selectedSuggestion.visningstekst || ''
                if (selectedAddress && onAddressChange) {
                  onAddressChange(selectedAddress)
                }
                // Trigger worker fetching med den valgte adresse og koordinater hvis tilgængelige
                if (selectedAddress) {
                  handleShowAvailableTimesWithAddress(selectedAddress, selectedSuggestion)
                }
              }}
              placeholder={t('tidOgSted.placeholderAdresse')}
              pulseField={pulseField === 'adresse' ? 'adresse' : null}
              isFound={!!formateretAdresse}
            />
            {formateretAdresse && (
              <div className={Styles.addressCheckIcon}>
                <Check size={16} />
              </div>
            )}
          </div>
          {step2WasWiped && (
            <div className={Styles.wipeObsContainer}>
              <p className={Styles.wipeObsText}>
                {t('tidOgSted.systemHarAendretParametre')}
              </p>
            </div>
          )}
          {!showCalendar && (
            <button
              className={`${Styles.showTimesButton} ${error && !isLoadingWorkers && !isLoadingTimes ? Styles.showTimesButtonError : ''}`}
              onClick={handleShowAvailableTimes}
              disabled={!adresse.trim() || isLoadingWorkers || isLoadingTimes}
            >
              {isLoadingWorkers || isLoadingTimes 
                ? t('tidOgSted.henter')
                : error && !isLoadingWorkers && !isLoadingTimes
                ? error
                : !adresse.trim() 
                ? t('tidOgSted.indtastAdresseForAtVise')
                : t('tidOgSted.visLedigeTidspunkter')}
            </button>
          )}
        </div>

        {showCalendar && (
          <div className={Styles.calendarSection}>
            {isLoadingWorkers || isLoadingTimes ? (
              <div className={Styles.loadingContainer}>
                <div className={Styles.loadingSpinner}></div>
                <p className={Styles.loadingText}>
                  {isLoadingWorkers ? t('tidOgSted.soegerEfterMedarbejdere') : t('tidOgSted.henterLedigeTider')}
                </p>
              </div>
            ) : error ? (
              <div className={Styles.errorContainer}>
                <p className={Styles.errorText}>{error}</p>
              </div>
            ) : hasNoCategories ? (
              <div className={Styles.noWorkersManualContainer}>
                {/* <div className={Styles.obsContainer}>
                  <span className={Styles.obsLabel}>OBS!</span>
                  <span className={Styles.obsText}>
                    Vores system fandt desværre ingen medarbejdere til din opgave. Fortsæt bookingen, så ser vi på det manuelt når vi modtager den.
                  </span>
                </div> */}
                <div className={Styles.manualTimePreferenceSection}>
                  <h3 className={StepsStyles.headingH3}>
                    {t('tidOgSted.fortaelOsHvornaar')}
                  </h3>
                  <textarea
                    className={`${Styles.manualTimePreferenceInput} ${pulseField === 'manualTime' ? Styles.pulsating : ''}`}
                    placeholder={t('tidOgSted.placeholderManualTime')}
                    value={manualTimePreference || ""}
                    onChange={(e) => {
                      if (onManualTimePreferenceChange) {
                        onManualTimePreferenceChange(e.target.value)
                      }
                    }}
                    rows={4}
                  />
                </div>
              </div>
            ) : availableWorkerIDs.length === 0 && !isLoadingWorkers ? (
              <div className={Styles.noWorkersManualContainer}>
                {/* <div className={Styles.obsContainer}>
                  <span className={Styles.obsLabel}>OBS!</span>
                  <span className={Styles.obsText}>
                    Vores system fandt desværre ingen medarbejdere til din opgave. Fortsæt bookingen, så ser vi på det manuelt når vi modtager den.
                  </span>
                </div> */}
                <div className={Styles.manualTimePreferenceSection}>
                  <h3 className={StepsStyles.headingH3}>
                    {t('tidOgSted.fortaelOsHvornaar')}
                  </h3>
                  <textarea
                    className={`${Styles.manualTimePreferenceInput} ${pulseField === 'manualTime' ? Styles.pulsating : ''}`}
                    placeholder={t('tidOgSted.placeholderManualTime')}
                    value={manualTimePreference || ""}
                    onChange={(e) => {
                      if (onManualTimePreferenceChange) {
                        onManualTimePreferenceChange(e.target.value)
                      }
                    }}
                    rows={4}
                  />
                </div>
              </div>
            ) : availableWorkerIDs.length > 0 && hasSlotsWithin4Months ? (
              <div className={Styles.calendarWrapper}>
                <div className={Styles.calendarContainer}>
                  <h3 
                    className={`${StepsStyles.headingH3} ${Styles.dateHeader} ${valgtDato ? Styles.dateHeaderWithDate : ''} ${valgtDato && !isCalendarOpen ? Styles.dateHeaderCollapsed : ''}`}
                    onClick={() => {
                      if (window.innerWidth <= 750 && valgtDato) {
                        setIsCalendarOpen(!isCalendarOpen)
                      }
                    }}
                  >
                    <Calendar size={18} className={Styles.headingIcon} />
                    {valgtDato 
                      ? dayjs(valgtDato).locale(i18n.language).format('D. MMMM YYYY')
                      : t('tidOgSted.vaelgDato')
                    }
                    {valgtDato && (
                      <>
                        {isCalendarOpen ? (
                          <ChevronDown 
                            size={18} 
                            className={`${Styles.chevronIcon} ${Styles.chevronIconOpen}`}
                          />
                        ) : (
                          <div className={Styles.dateCheckIcon}>
                            <Check size={16} />
                          </div>
                        )}
                      </>
                    )}
                  </h3>
                  <div 
                    className={`${Styles.datePickerWrapper} ${formateretAdresse ? Styles.datePickerWrapperFound : ''} ${valgtDato && availableTimes.length > 0 ? Styles.datePickerWrapperSelected : ''} ${!isCalendarOpen ? Styles.datePickerWrapperCollapsed : ''} ${pulseField === 'dato' ? Styles.pulsating : ''}`}
                  >
                    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={i18n.language}>
                      <StaticDatePicker
                        value={valgtDato}
                        onChange={handleDateChange}
                        shouldDisableDate={shouldDisableDate}
                        disablePast
                        slots={{ 
                          day: HighlightablePickersDay,
                          toolbar: () => null,
                          actionBar: () => null
                        }}
                        slotProps={{
                          day: { datesWithAvailableTimes, selectedDate: valgtDato }
                        }}
                        sx={{
                          backgroundColor: 'transparent',
                          '& .MuiPaper-root': {
                            backgroundColor: 'transparent',
                            boxShadow: 'none'
                          },
                          '& .MuiPickersCalendarHeader-root': {
                            backgroundColor: 'transparent'
                          },
                          '& .MuiDayCalendar-root': {
                            backgroundColor: 'transparent'
                          },
                          '& .MuiPickersToolbar-root': {
                            display: 'none'
                          },
                          '& .MuiDialogActions-root': {
                            display: 'none'
                          },
                          '& .MuiPickersDay-root.Mui-selected': {
                            backgroundColor: '#59bf1a',
                            color: '#ffffff',
                            fontWeight: 600,
                            '&:hover': {
                              backgroundColor: '#4aa015'
                            },
                            '&:focus': {
                              backgroundColor: '#59bf1a'
                            }
                          },
                          '& .MuiPickersDay-root.Mui-selected.Mui-focusVisible': {
                            backgroundColor: '#59bf1a'
                          }
                        }}
                      />
                    </LocalizationProvider>
                  </div>
                </div>
                
                {valgtDato && (
                  <div className={Styles.timeSlotsContainer}>
                    <h3 className={StepsStyles.headingH3}>
                      <Clock size={18} className={Styles.headingIcon} />
                      {selectedTimeSlot 
                        ? `Kl. ${selectedTimeSlot.start.format('HH:mm')} - ${selectedTimeSlot.end.format('HH:mm')}*`
                        : t('tidOgSted.vaelgTidspunkt')
                      }
                    </h3>
                    {availableTimes.length > 0 ? (
                      <div className={Styles.timeSlotsGrid}>
                        {availableTimes.map((timeSlot, index) => {
                          const isFirst = index === 0
                          const isLast = index === availableTimes.length - 1
                          return (
                            <button
                              key={index}
                              className={`${Styles.timeSlotButton} ${isTimeSlotSelected(timeSlot) ? Styles.timeSlotButtonSelected : ''} ${pulseField === 'tidsunkt' ? Styles.pulsating : ''}`}
                              onClick={() => handleTimeSelect(timeSlot)}
                            >
                              {(isFirst || isLast) && (
                                <span className={Styles.timeSlotPreferredBadge}>
                                  {t('tidOgSted.foretrukket')}
                                </span>
                              )}
                              <div className={Styles.timeSlotButtonContent}>
                                <span className={Styles.timeSlotButtonText}>
                                  {timeSlot.start.format('HH:mm')} - {timeSlot.end.format('HH:mm')}
                                </span>
                                {isTimeSlotSelected(timeSlot) && (
                                  <span className={Styles.timeSlotObsMessage}>
                                    {t('tidOgSted.ankomstPlusMinusEnTime')}
                                  </span>
                                )}
                              </div>
                              <div className={Styles.timeSlotCheckIcon}>
                                <Check size={14} />
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    ) : (
                      <p className={Styles.noTimesText}>{t('tidOgSted.ingenLedigeTiderDenneDag')}</p>
                    )}
                  </div>
                )}
              </div>
            ) : availableWorkerIDs.length > 0 && !hasSlotsWithin4Months ? (
              <div className={Styles.noWorkersManualContainer}>
                {/* <div className={Styles.obsContainer}>
                  <span className={Styles.obsLabel}>OBS!</span>
                  <span className={Styles.obsText}>
                  Vores system fandt desværre ingen medarbejdere til din opgave. Fortsæt bookingen, så ser vi på det manuelt når vi modtager den.
                  </span>
                </div> */}
                <div className={Styles.manualTimePreferenceSection}>
                  <h3 className={StepsStyles.headingH3}>
                    {t('tidOgSted.fortaelOsHvornaar')}
                  </h3>
                  <textarea
                    className={`${Styles.manualTimePreferenceInput} ${pulseField === 'manualTime' ? Styles.pulsating : ''}`}
                    placeholder={t('tidOgSted.placeholderManualTime')}
                    value={manualTimePreference || ""}
                    onChange={(e) => {
                      if (onManualTimePreferenceChange) {
                        onManualTimePreferenceChange(e.target.value)
                      }
                    }}
                    rows={4}
                  />
                </div>
              </div>
            ) : (
              <div className={Styles.noWorkersContainer}>
                <div className={Styles.emptyStateIcon}>😔</div>
                <p className={Styles.emptyStateTitle}>{t('tidOgSted.ingenMedarbejdereFundet')}</p>
                <p className={Styles.emptyStateText}>
                  {t('tidOgSted.kunneIkkeFindeMedarbejdere')}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
      <div className={Styles.obsTekstContainer}>
      {selectedTimeSlot && <p>{t('tidOgSted.faktiskeTiderKanAfvige')}</p>}
      </div>
    </div>
  )
}

export default TidOgSted
