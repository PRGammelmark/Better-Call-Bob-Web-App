import React, { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Styles from './AIFollowUpQuestionsPopup.module.css'

const AIFollowUpQuestionsPopup = ({ 
  questions = [], 
  currentIndex = 0, 
  onIndexChange,
  onFocusTextarea
}) => {
  const { t, i18n } = useTranslation()
  const [touchStart, setTouchStart] = useState(null)
  const [touchEnd, setTouchEnd] = useState(null)
  const [direction, setDirection] = useState(0) // -1 for left, 1 for right
  const prevIndexRef = useRef(currentIndex)

  // Minimum swipe distance
  const minSwipeDistance = 50

  const currentQuestion = questions[currentIndex] || null
  const questionText = currentQuestion 
    ? (i18n.language === 'en' ? currentQuestion.spørgsmålEn : currentQuestion.spørgsmål)
    : ''

  // Update direction when index changes
  useEffect(() => {
    if (prevIndexRef.current !== currentIndex) {
      setDirection(currentIndex > prevIndexRef.current ? 1 : -1)
      prevIndexRef.current = currentIndex
    }
  }, [currentIndex])

  const handleTouchStart = (e) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return

    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe && currentIndex < questions.length - 1) {
      setDirection(1)
      onIndexChange(currentIndex + 1)
    }
    if (isRightSwipe && currentIndex > 0) {
      setDirection(-1)
      onIndexChange(currentIndex - 1)
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setDirection(-1)
      onIndexChange(currentIndex - 1)
    }
  }

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setDirection(1)
      onIndexChange(currentIndex + 1)
    }
  }

  // Animation variants for question transitions
  const questionVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      x: direction > 0 ? -100 : 100,
      opacity: 0
    })
  }

  const questionTransition = {
    x: { type: 'spring', stiffness: 500, damping: 35 },
    opacity: { duration: 0.15 }
  }

  if (!currentQuestion || questions.length === 0) {
    return null
  }


  const handleContainerClick = (e) => {
    // Don't focus if clicking on navigation buttons or dots
    if (e.target.closest('button') || e.target.closest(`.${Styles.dotsContainer}`)) {
      return
    }
    // Focus textarea when clicking on the popup
    if (onFocusTextarea) {
      onFocusTextarea()
    }
  }

  return (
    <motion.div
      className={Styles.integratedContainer}
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={handleContainerClick}
      style={{ cursor: 'pointer' }}
    >
      <div className={Styles.integratedHeader}>
        <div className={Styles.questionNumber}>
          {t('beskrivOpgaven.uddybendeSporgsmaal') || 'Uddyb gerne ...'}
        </div>
      </div>

      <div className={Styles.integratedContent}>
        <div className={Styles.questionWrapper}>
          <AnimatePresence mode="sync" custom={direction}>
            <motion.p
              key={currentIndex}
              custom={direction}
              variants={questionVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={questionTransition}
              className={Styles.questionText}
            >
              {questionText}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      <div className={Styles.integratedFooter}>
        {currentIndex > 0 && (
          <button
            className={`${Styles.navButton} ${Styles.navButtonLeft}`}
            onClick={handlePrevious}
            aria-label={t('buttons.tilbage') || 'Tilbage'}
          >
            <ChevronLeft size={16} />
          </button>
        )}

        <div className={Styles.dotsContainer}>
          {questions.map((_, index) => (
            <div
              key={index}
              className={`${Styles.dot} ${index === currentIndex ? Styles.dotActive : ''}`}
            />
          ))}
        </div>

        {currentIndex < questions.length - 1 && (
          <button
            className={`${Styles.navButton} ${Styles.navButtonRight}`}
            onClick={handleNext}
            aria-label={t('buttons.naeste') || 'Næste'}
          >
            <ChevronRight size={16} />
          </button>
        )}
      </div>
    </motion.div>
  )
}

export default AIFollowUpQuestionsPopup

