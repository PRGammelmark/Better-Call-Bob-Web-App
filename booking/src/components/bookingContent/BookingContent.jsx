import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Styles from './BookingContent.module.css'

const BookingContent = ({ currentStep, steps, direction = 1 }) => {
  const step = steps[currentStep - 1]

  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
      zIndex: 2
    }),
    center: {
      x: 0,
      opacity: 1,
      zIndex: 2
    },
    exit: (direction) => ({
      x: direction > 0 ? '-100%' : '100%',
      opacity: 0,
      zIndex: 1
    })
  }

  const transition = {
    x: { type: 'spring', stiffness: 170, damping: 25 },
    opacity: { duration: 0.2 }
  }

  return (
    <div className={Styles.bookingContent}>
      <AnimatePresence mode="sync" custom={direction}>
        {step?.render && (
          <motion.div
            key={currentStep}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={transition}
            className={Styles.stepContent}
          >
            {step.render()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default BookingContent
