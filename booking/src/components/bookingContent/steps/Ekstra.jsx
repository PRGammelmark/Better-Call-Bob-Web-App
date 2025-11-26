import React, { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Check } from 'lucide-react'
import StepsStyles from './Steps.module.css'
import Styles from './Ekstra.module.css'
import axios from 'axios'

const Ekstra = ({ kategorier, isLoading, onAnswersChange, initialAnswers = {}, førsteUbesvaredeSpørgsmål }) => {
  const { t, i18n } = useTranslation()
  const [spørgsmål, setSpørgsmål] = useState([])
  const [isLoadingSpørgsmål, setIsLoadingSpørgsmål] = useState(false)
  const [answers, setAnswers] = useState(initialAnswers)
  const lastKategorierRef = useRef([])

  // Initialize answers from initialAnswers when component mounts or when kategorier change
  useEffect(() => {
    // Check if kategorier have changed (new analysis)
    const kategorierChanged = JSON.stringify(lastKategorierRef.current) !== JSON.stringify(kategorier)
    
    if (kategorierChanged && !isLoading) {
      // Kategorier have changed, so this is a new analysis - use initialAnswers
      setAnswers(initialAnswers || {})
      lastKategorierRef.current = kategorier || []
    } else if (!kategorierChanged && Object.keys(initialAnswers).length > 0) {
      // Kategorier haven't changed - restore answers from initialAnswers to preserve user input
      setAnswers(initialAnswers)
    }
  }, [kategorier, isLoading, initialAnswers])

  // Fetch spørgsmål when kategorier are available
  useEffect(() => {
    const fetchSpørgsmål = async () => {
      if (!isLoading && kategorier && kategorier.length > 0) {
        setIsLoadingSpørgsmål(true)
        try {
          // Extract Danish category names for API (handle both string and object formats)
          const kategoriNavne = kategorier.map(k => typeof k === 'string' ? k : k.opgavetype)
          const response = await axios.post(
            `${import.meta.env.VITE_API_URL}/opfolgendeSporgsmaal/forKategorier`,
            { kategorier: kategoriNavne }
          )
          setSpørgsmål(response.data || [])
        } catch (error) {
          console.error('Error fetching opfølgende spørgsmål:', error)
          setSpørgsmål([])
        } finally {
          setIsLoadingSpørgsmål(false)
        }
      } else if (!isLoading && (!kategorier || kategorier.length === 0)) {
        setSpørgsmål([])
      }
    }

    fetchSpørgsmål()
  }, [kategorier, isLoading])

  // Update parent when answers change
  useEffect(() => {
    if (onAnswersChange) {
      onAnswersChange(answers)
    }
  }, [answers, onAnswersChange])

  const handleAnswerChange = (feltNavn, value) => {
    setAnswers(prev => ({
      ...prev,
      [feltNavn]: value
    }))
  }

  const renderSpørgsmål = (spørgsmålItem, index) => {
    const { _id, spørgsmål: spørgsmålTekst, spørgsmålEn, type, selectOptions, feltNavn } = spørgsmålItem
    // Use English text if language is English and English text exists
    const displaySpørgsmålTekst = i18n.language === 'en' && spørgsmålEn ? spørgsmålEn : spørgsmålTekst
    
    // For Valgmuligheder type, split selectOptions by ":" if language is English
    // We need to create a mapping between display text and original value
    let displaySelectOptions = selectOptions || []
    let optionValueMap = {} // Maps display text to original value
    
    if (type === 'Valgmuligheder' && i18n.language === 'en' && selectOptions && selectOptions.length > 0) {
      displaySelectOptions = selectOptions.map(option => {
        // Split by ":" and take the English part (after ":")
        const parts = option.split(':')
        const displayText = parts.length > 1 ? parts[1].trim() : option
        // Map display text to original value
        optionValueMap[displayText] = option
        return displayText
      })
    } else {
      // For Danish, display text equals original value
      selectOptions.forEach(option => {
        optionValueMap[option] = option
      })
    }
    
    const currentValue = answers[feltNavn]
    const shouldPulse = førsteUbesvaredeSpørgsmål && førsteUbesvaredeSpørgsmål._id === _id
    const isAnswered = currentValue !== null && currentValue !== undefined && currentValue !== ''

    if (type === 'Ja/nej') {
      return (
        <div key={_id} className={`${Styles.spørgsmålItem} ${isAnswered ? Styles.answered : ''} ${shouldPulse ? Styles.pulsatingCard : ''}`}>
          <div className={Styles.spørgsmålHeader}>
            <span className={Styles.questionNumber}>{index + 1}</span>
            <label className={Styles.spørgsmålLabel}>{displaySpørgsmålTekst}</label>
          </div>
          <div className={Styles.jaNejContainer}>
            <button
              type="button"
              className={`${Styles.jaNejButton} ${currentValue === true ? Styles.active : ''} ${shouldPulse && currentValue !== true ? Styles.pulsating : ''}`}
              onClick={() => handleAnswerChange(feltNavn, true)}
              aria-pressed={currentValue === true}
            >
              <span>{t('buttons.ja')}</span>
              {currentValue === true && (
                <div className={Styles.buttonCheckIcon}>
                  <Check size={16} />
                </div>
              )}
            </button>
            <button
              type="button"
              className={`${Styles.jaNejButton} ${currentValue === false ? Styles.active : ''} ${shouldPulse && currentValue !== false ? Styles.pulsating : ''}`}
              onClick={() => handleAnswerChange(feltNavn, false)}
              aria-pressed={currentValue === false}
            >
              <span>{t('buttons.nej')}</span>
              {currentValue === false && (
                <div className={Styles.buttonCheckIcon}>
                  <Check size={16} />
                </div>
              )}
            </button>
          </div>
        </div>
      )
    } else if (type === 'Valgmuligheder' && displaySelectOptions && displaySelectOptions.length > 0) {
      return (
        <div key={_id} className={`${Styles.spørgsmålItem} ${isAnswered ? Styles.answered : ''} ${shouldPulse ? Styles.pulsatingCard : ''}`}>
          <div className={Styles.spørgsmålHeader}>
            <span className={Styles.questionNumber}>{index + 1}</span>
            <label className={Styles.spørgsmålLabel} htmlFor={feltNavn}>
              {displaySpørgsmålTekst}
            </label>
          </div>
          <div className={`${Styles.selectWrapper} ${shouldPulse ? Styles.pulsating : ''}`}>
            <select
              id={feltNavn}
              className={`${Styles.selectInput} ${currentValue ? Styles.selectInputSelected : ''} ${shouldPulse ? Styles.pulsating : ''}`}
              value={(() => {
                // Map current stored value to display value
                if (!currentValue) return ''
                // If currentValue is in the map, find its display value
                const displayKey = Object.keys(optionValueMap).find(key => optionValueMap[key] === currentValue)
                return displayKey || currentValue
              })()}
              onChange={(e) => {
                // Map display value back to original value for storage
                const selectedDisplayValue = e.target.value
                const originalValue = optionValueMap[selectedDisplayValue] || selectedDisplayValue
                handleAnswerChange(feltNavn, originalValue)
              }}
            >
              <option value="">{t('ekstra.vaelgEnMulighed')}</option>
              {displaySelectOptions.map((displayOption, optIndex) => (
                <option key={optIndex} value={displayOption}>
                  {displayOption}
                </option>
              ))}
            </select>
            <span className={Styles.selectArrow}></span>
            {currentValue && (
              <div className={Styles.selectCheckIcon}>
                <Check size={16} />
              </div>
            )}
          </div>
        </div>
      )
    }

    return null
  }

  return (
    <div className={Styles.ekstraContainer}>
      <div className={Styles.headerSection}>
        <h2 className={StepsStyles.headingH2}>{t('ekstra.ekstraOplysninger')}</h2>
        {spørgsmål.length > 0 && (
          <p className={Styles.subtitle}>
            {t('ekstra.ladOsForstaa')}
          </p>
        )}
      </div>
      
      {isLoading || isLoadingSpørgsmål ? (
        <div className={Styles.loadingContainer}>
          <div className={Styles.loadingSpinner}></div>
          <p className={Styles.loadingText}>{t('ekstra.analysererDinOpgave')}</p>
          <p className={Styles.loadingSubtext}>{t('ekstra.givOsLigeEtKortOjeblik')}</p>
        </div>
      ) : kategorier && kategorier.length > 0 ? (
        <div className={Styles.spørgsmålContainer}>
          {spørgsmål.length > 0 ? (
            <div className={Styles.spørgsmålListe}>
              {spørgsmål.slice(0, 3).map((sp, index) => renderSpørgsmål(sp, index))}
            </div>
          ) : (
            <div className={Styles.ingenSpørgsmålContainer}>
              <div className={Styles.emptyStateIcon}>✨</div>
              <p className={Styles.emptyStateTitle}>{t('ekstra.ingenYderligereSporgsmaal')}</p>
              <p className={Styles.emptyStateText}>
                {t('ekstra.viHarAlleOplysninger')}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className={Styles.ingenKategorierContainer}>
          <div className={Styles.emptyStateIcon}>📝</div>
          <p className={Styles.emptyStateTitle}>{t('ekstra.ingenKategorier')}</p>
          <p className={Styles.emptyStateText}>
            {t('ekstra.kunneIkkeIdentificere')}
          </p>
        </div>
      )}
    </div>
  )
}

export default Ekstra

