import React, { useState, useEffect } from 'react'
import StepsStyles from './Steps.module.css'
import Styles from './Ekstra.module.css'
import axios from 'axios'

const Ekstra = ({ kategorier, isLoading, onAnswersChange }) => {
  const [spørgsmål, setSpørgsmål] = useState([])
  const [isLoadingSpørgsmål, setIsLoadingSpørgsmål] = useState(false)
  const [answers, setAnswers] = useState({})

  // Fetch spørgsmål when kategorier are available
  useEffect(() => {
    const fetchSpørgsmål = async () => {
      if (!isLoading && kategorier && kategorier.length > 0) {
        setIsLoadingSpørgsmål(true)
        try {
          const response = await axios.post(
            `${import.meta.env.VITE_API_URL}/opfolgendeSporgsmaal/forKategorier`,
            { kategorier }
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
    const { _id, spørgsmål: spørgsmålTekst, type, selectOptions, feltNavn } = spørgsmålItem
    const currentValue = answers[feltNavn]

    if (type === 'Ja/nej') {
      return (
        <div key={_id} className={Styles.spørgsmålItem}>
          <div className={Styles.spørgsmålHeader}>
            <span className={Styles.questionNumber}>{index + 1}</span>
            <label className={Styles.spørgsmålLabel}>{spørgsmålTekst}</label>
          </div>
          <div className={Styles.jaNejContainer}>
            <button
              type="button"
              className={`${Styles.jaNejButton} ${currentValue === true ? Styles.active : ''}`}
              onClick={() => handleAnswerChange(feltNavn, true)}
              aria-pressed={currentValue === true}
            >
              <span>Ja</span>
            </button>
            <button
              type="button"
              className={`${Styles.jaNejButton} ${currentValue === false ? Styles.active : ''}`}
              onClick={() => handleAnswerChange(feltNavn, false)}
              aria-pressed={currentValue === false}
            >
              <span>Nej</span>
            </button>
          </div>
        </div>
      )
    } else if (type === 'Valgmuligheder' && selectOptions && selectOptions.length > 0) {
      return (
        <div key={_id} className={Styles.spørgsmålItem}>
          <div className={Styles.spørgsmålHeader}>
            <span className={Styles.questionNumber}>{index + 1}</span>
            <label className={Styles.spørgsmålLabel} htmlFor={feltNavn}>
              {spørgsmålTekst}
            </label>
          </div>
          <div className={Styles.selectWrapper}>
            <select
              id={feltNavn}
              className={Styles.selectInput}
              value={currentValue || ''}
              onChange={(e) => handleAnswerChange(feltNavn, e.target.value)}
            >
              <option value="">Vælg en mulighed...</option>
              {selectOptions.map((option, optIndex) => (
                <option key={optIndex} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <span className={Styles.selectArrow}></span>
          </div>
        </div>
      )
    }

    return null
  }

  return (
    <div className={Styles.ekstraContainer}>
      <div className={Styles.headerSection}>
        <h2 className={StepsStyles.headingH2}>Ekstra oplysninger</h2>
        {spørgsmål.length > 0 && (
          <p className={Styles.subtitle}>
            Lad os forstå din opgave lidt bedre, så vi kan løse den bedst muligt.
          </p>
        )}
      </div>
      
      {isLoading || isLoadingSpørgsmål ? (
        <div className={Styles.loadingContainer}>
          <div className={Styles.loadingSpinner}></div>
          <p className={Styles.loadingText}>Analyserer din opgave...</p>
          <p className={Styles.loadingSubtext}>Giv os lige et kort øjeblik.</p>
        </div>
      ) : kategorier && kategorier.length > 0 ? (
        <div className={Styles.spørgsmålContainer}>
          {spørgsmål.length > 0 ? (
            <div className={Styles.spørgsmålListe}>
              {spørgsmål.map((sp, index) => renderSpørgsmål(sp, index))}
            </div>
          ) : (
            <div className={Styles.ingenSpørgsmålContainer}>
              <div className={Styles.emptyStateIcon}>✨</div>
              <p className={Styles.emptyStateTitle}>Ingen yderligere spørgsmål</p>
              <p className={Styles.emptyStateText}>
                Vi har alle de oplysninger vi behøver. Du kan fortsætte til næste trin.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className={Styles.ingenKategorierContainer}>
          <div className={Styles.emptyStateIcon}>📝</div>
          <p className={Styles.emptyStateTitle}>Ingen kategorier identificeret</p>
          <p className={Styles.emptyStateText}>
            Vi kunne ikke identificere specifikke kategorier for din opgave. Du kan fortsætte til næste trin.
          </p>
        </div>
      )}
    </div>
  )
}

export default Ekstra

