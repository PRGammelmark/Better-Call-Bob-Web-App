import React from 'react'
import Styles from './BookingSummary.module.css'
import { ShieldCheck } from 'lucide-react'

const BookingSummary = ({ kortOpgavebeskrivelse, kategorier, isLoadingKortBeskrivelse }) => {
  return (
    <div className={Styles.bookingSummaryContainer}>
      <div className={Styles.summaryTopContainer}>
      <b>Detaljer om din opgave</b>
      <p className={Styles.summaryConfirmationText}>Aftalen er ikke bindende før vi sender dig en endelig bekræftelse.</p>

      {(kortOpgavebeskrivelse || isLoadingKortBeskrivelse) && (
        <div className={Styles.opgaveBeskrivelseContainer}>
          {isLoadingKortBeskrivelse ? (
            <p className={Styles.kortBeskrivelse}>Opsummerer opgave...</p>
          ) : (
            <b className={Styles.kortBeskrivelse}>{kortOpgavebeskrivelse}</b>
          )}
        </div>
      )}

      {kategorier && kategorier.length > 0 && (
        <div className={Styles.kategorierContainer}>
          <div className={Styles.kategorierListe}>
            {kategorier.map((kategori, index) => (
              <span key={index} className={Styles.kategoriPill}>
                {kategori}
              </span>
            ))}
          </div>
        </div>
      )}
      </div>
      <div className={Styles.summaryBottomContainer}>
        <p><ShieldCheck /> Beskyttet af reCAPTCHA</p>
      </div>
    </div>
  )
}

export default BookingSummary
