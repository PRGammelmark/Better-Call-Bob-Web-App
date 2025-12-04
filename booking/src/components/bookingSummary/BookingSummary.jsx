import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Styles from './BookingSummary.module.css'
import { ShieldCheck, Tag, Clock, Check, MapPin, CalendarCheck, X, User, Mail, Phone, Building2 } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import dayjs from 'dayjs'
import 'dayjs/locale/da'
import 'dayjs/locale/en'

const BookingSummary = ({ kortOpgavebeskrivelse, estimeretTidsforbrugTimer, kategorier, isLoadingKortBeskrivelse, antalBesvaredeSpørgsmål, totaltAntalSpørgsmål, adresse, valgtDato, valgtTidspunkt, manualTimePreference, fuldeNavn, email, telefonnummer, erVirksomhed, virksomhed, cvr, onClose }) => {
  const { t, i18n } = useTranslation()
  const [showPopup, setShowPopup] = useState(false)
  
  // Opdater dayjs locale når sprog skifter
  useEffect(() => {
    dayjs.locale(i18n.language)
  }, [i18n.language])
  return (
    <div className={Styles.bookingSummaryContainer}>
      <div className={Styles.bookingSummaryHeadingContainer}>
        {onClose && (
          <div 
            className={Styles.summaryHandle} 
            onClick={onClose}
            style={{ touchAction: 'none' }}
          />
        )}
        <div className={Styles.summaryHeadingRow}>
          <div className={Styles.summaryHeadingContent}>
            <b className={Styles.summaryHeading} style={{ fontFamily: 'OmnesBold', fontSize: '1.1rem' }}>{t('summary.dinHandymanBooking')}</b>
            <p className={Styles.summaryConfirmationText}>{t('summary.viaBetterCallBob')}</p>
          </div>
          {onClose && (
            <button className={Styles.summaryCloseButton} onClick={onClose}>
              <X size={20} />
            </button>
          )}
        </div>
      </div>
      <div className={Styles.bookingSummaryContentContainer}>
        <div className={Styles.summaryTopContainer}>

        <div className={Styles.opgaveBeskrivelseContainer}>
          {!kortOpgavebeskrivelse && !isLoadingKortBeskrivelse && (
            <p className={Styles.kortBeskrivelse}>{t('summary.beskrivDinOpgave')}</p>
          )}
          {isLoadingKortBeskrivelse ? (
            <p className={Styles.kortBeskrivelse}>{t('summary.opsummererOpgave')}</p>
          ) : (
            <b className={Styles.kortBeskrivelse}>{kortOpgavebeskrivelse}</b>
          )}
        </div>

        {kategorier && kategorier.length > 0 && (
          <div className={Styles.kategorierContainer}>
            <div className={Styles.kategorierListe}>
              {kategorier.map((kategori, index) => {
                // Handle both string and object formats, use English if language is English
                const displayKategori = typeof kategori === 'string' 
                  ? kategori 
                  : (i18n.language === 'en' && kategori.opgavetypeEn ? kategori.opgavetypeEn : kategori.opgavetype)
                return (
                  <span key={index} className={Styles.kategoriPill}>
                    <Tag size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                    {displayKategori}
                  </span>
                )
              })}
            </div>
          </div>
        )}
        {(totaltAntalSpørgsmål > 0 || 
          (estimeretTidsforbrugTimer !== null && estimeretTidsforbrugTimer !== undefined) || 
          (adresse && adresse.trim()) || 
          (valgtDato || valgtTidspunkt || manualTimePreference)) && (
          <>
            <b className={Styles.sectionHeading}>{t('summary.detaljer')}</b>
            <div className={Styles.summaryIconLinesContainer}>
            {totaltAntalSpørgsmål > 0 && (
              <div className={Styles.opfølgendeSpørgsmålContainer}>
                <Check size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                <span className={Styles.opfølgendeSpørgsmål}>
                  {t('summary.opfølgendeSporgsmaal', { answered: antalBesvaredeSpørgsmål, total: totaltAntalSpørgsmål })}
                </span>
              </div>
            )}
            {estimeretTidsforbrugTimer !== null && estimeretTidsforbrugTimer !== undefined && (
              <div className={Styles.estimeretTidsforbrugContainer}>
                <Clock size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                <span className={Styles.estimeretTidsforbrug}>
                  {t('summary.anslaaetTidsforbrug', { 
                    hours: estimeretTidsforbrugTimer >= 8 ? '8+' : estimeretTidsforbrugTimer, 
                    hoursText: estimeretTidsforbrugTimer >= 8 ? t('summary.timer') : (estimeretTidsforbrugTimer === 1 ? t('summary.time') : t('summary.timer'))
                  })}
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
                      {valgtDato && dayjs(valgtDato).locale(i18n.language).format('D. MMMM YYYY')}
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
            <span className={Styles.obsLabel}>{t('summary.obs')}</span>
            <span className={Styles.obsText}>{t('summary.obsText')} <br /><span className={Styles.obsLink} onClick={() => setShowPopup(true)}>{t('summary.laesMere')}</span></span>
          </div>
        )}
        {(fuldeNavn || email || telefonnummer || (erVirksomhed && (virksomhed || cvr))) && (
          <>
            <b className={Styles.sectionHeading}>{t('summary.kontaktoplysninger')}</b>
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
          <p><ShieldCheck /> {t('summary.beskyttetAfRecaptcha')}</p>
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
                <h3 className={Styles.popupTitle}>{t('summary.tiderKanGiveSigLidt')}</h3>
                <p className={Styles.popupText}>
                  {t('summary.systemHarVurderet', { 
                    hours: estimeretTidsforbrugTimer >= 8 ? '8+' : estimeretTidsforbrugTimer, 
                    hoursText: estimeretTidsforbrugTimer >= 8 ? t('summary.timer') : (estimeretTidsforbrugTimer === 1 ? t('summary.time') : t('summary.timer'))
                  })}
                </p>
                <p className={Styles.popupText}>
                <b style={{ fontFamily: 'OmnesBold' }}>{t('summary.vurderingenErEtEstimat')}</b> {t('summary.viTagerForbehold')}
                </p>
                <p className={Styles.popupText}>
                  {t('summary.detSammeGaelder')}
                </p>
                <p className={Styles.popupText}>
                  {t('summary.tusindTak')}
                </p>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default BookingSummary
