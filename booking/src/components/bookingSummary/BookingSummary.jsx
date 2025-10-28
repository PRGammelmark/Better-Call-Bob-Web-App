import React from 'react'
import Styles from './BookingSummary.module.css'

const BookingSummary = () => {
  return (
    <>
      <b>Detaljer om din opgave</b>
      <p className={Styles.summaryConfirmationText}>Aftalen er ikke bindende før vi sender dig en endelig bekræftelse.</p>
    </>
  )
}

export default BookingSummary
