import React, { useState } from 'react'
import Styles from './BookingSummary.module.css'
import { ShieldCheck, Tag, Clock, Check, MapPin, CalendarCheck, X, User, Mail, Phone, Building2 } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import dayjs from 'dayjs'
import 'dayjs/locale/da'

const BookingSummary = ({ kortOpgavebeskrivelse, estimeretTidsforbrugTimer, kategorier, isLoadingKortBeskrivelse, antalBesvaredeSpørgsmål, totaltAntalSpørgsmål, adresse, valgtDato, valgtTidspunkt, manualTimePreference, fuldeNavn, email, telefonnummer, erVirksomhed, virksomhed, cvr }) => {
  const [showPopup, setShowPopup] = useState(false)
  return (
    <div className={Styles.bookingSummaryContainer}>
      <div className={Styles.summaryTopContainer}>
      <b className={Styles.summaryHeading} style={{ fontFamily: 'OmnesBold', fontSize: '1.1rem' }}>Opsummering</b>
      {/* <p className={Styles.summaryConfirmationText}>Aftalen er ikke bindende før vi sender dig en endelig bekræftelse.</p> */}

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
                <Tag size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                {kategori}
              </span>
            ))}
          </div>
        </div>
      )}
      {(totaltAntalSpørgsmål > 0 || 
        (estimeretTidsforbrugTimer !== null && estimeretTidsforbrugTimer !== undefined) || 
        (adresse && adresse.trim()) || 
        (valgtDato || valgtTidspunkt || manualTimePreference)) && (
        <>
          <b className={Styles.sectionHeading}>Detaljer</b>
          <div className={Styles.summaryIconLinesContainer}>
          {totaltAntalSpørgsmål > 0 && (
            <div className={Styles.opfølgendeSpørgsmålContainer}>
              <Check size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
              <span className={Styles.opfølgendeSpørgsmål}>
                Opfølgende spørgsmål: {antalBesvaredeSpørgsmål}/{totaltAntalSpørgsmål}
              </span>
            </div>
          )}
          {estimeretTidsforbrugTimer !== null && estimeretTidsforbrugTimer !== undefined && (
            <div className={Styles.estimeretTidsforbrugContainer}>
              <Clock size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
              <span className={Styles.estimeretTidsforbrug}>
                Anslået tidsforbrug: {estimeretTidsforbrugTimer} {estimeretTidsforbrugTimer === 1 ? 'time' : 'timer'}
              </span>
            </div>
          )}
          {adresse && adresse.trim() && (
            <div className={Styles.adresseContainer}>
              <MapPin size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
              <span className={Styles.adresse}>
                {adresse}
              </span>
            </div>
          )}
          {(valgtDato || valgtTidspunkt || manualTimePreference) && (
            <div className={Styles.datoOgTidContainer}>
              <CalendarCheck size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
              <span className={Styles.datoOgTid}>
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
              </span>
            </div>
          )}
          </div>
        </>
      )}
      {valgtTidspunkt && (
        <div className={Styles.obsContainer}>
          <span className={Styles.obsLabel}>OBS!</span>
          <span className={Styles.obsText}>Tidspunkter og varighed kan i nogle tilfælde afvige fra de viste tider. <br /><span className={Styles.obsLink} onClick={() => setShowPopup(true)}>Læs mere</span></span>
        </div>
      )}
      {(fuldeNavn || email || telefonnummer || (erVirksomhed && (virksomhed || cvr))) && (
        <>
          <b className={Styles.sectionHeading}>Kontaktoplysninger</b>
          <div className={`${Styles.summaryIconLinesContainer} ${Styles.kontaktinfoBox}`}>
          {fuldeNavn && fuldeNavn.trim() && (
            <div className={Styles.kontaktinfoContainer}>
              <User size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
              <span className={Styles.kontaktinfoText}>
                {fuldeNavn}
              </span>
            </div>
          )}
          {email && email.trim() && (
            <div className={Styles.kontaktinfoContainer}>
              <Mail size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
              <span className={Styles.kontaktinfoText}>
                {email}
              </span>
            </div>
          )}
          {telefonnummer && telefonnummer.trim() && (
            <div className={Styles.kontaktinfoContainer}>
              <Phone size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
              <span className={Styles.kontaktinfoText}>
                {telefonnummer}
              </span>
            </div>
          )}
          {erVirksomhed && (virksomhed || cvr) && (
            <div className={Styles.kontaktinfoContainer}>
              <Building2 size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
              <span className={Styles.kontaktinfoText}>
                {virksomhed && cvr ? `${virksomhed} (CVR: ${cvr})` : virksomhed || `CVR: ${cvr}`}
              </span>
            </div>
          )}
          </div>
        </>
      )}
      </div>
      <div className={Styles.summaryBottomContainer}>
        <p><ShieldCheck /> Beskyttet af reCAPTCHA</p>
      </div>
      
      <AnimatePresence>
        {showPopup && (
          <>
            <motion.div
              className={Styles.popupOverlay}
              onClick={() => setShowPopup(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />
            <motion.div
              className={Styles.popup}
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <button className={Styles.popupCloseButton} onClick={() => setShowPopup(false)}>
                <X size={18} />
              </button>
              <h3 className={Styles.popupTitle}>Tider, der kan give sig lidt 😌</h3>
              <p className={Styles.popupText}>
                Vores system har vurderet, at en opgave som din vil tage os ca. {estimeretTidsforbrugTimer} {estimeretTidsforbrugTimer === 1 ? 'time' : 'timer'} at udføre.
              </p>
              <p className={Styles.popupText}>
              <b style={{ fontFamily: 'OmnesBold' }}>Vurderingen er et estimat.</b> Vi tager forbehold for, at alle opgaver er forskellige.
              Det faktiske tidsforbrug afhænger bl.a. af opgavens omfang, materialer og eventuelle overraskelser undervejs.
              </p>
              <p className={Styles.popupText}>
                Det samme gælder også for de opgaver, vi har løst før vi kommer ud til dig. Derfor må vi nogle gange rykke tiderne en smule. Vi bestræber os altid på at melde klart ud om evt. ændringer i løbet af dagen.
              </p>
              <p className={Styles.popupText}>
                Tusind tak for din forståelse!
              </p>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default BookingSummary
