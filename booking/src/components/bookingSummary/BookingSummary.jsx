import React, { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import Styles from './BookingSummary.module.css'
import { ShieldCheck, Tag, Clock, Check, MapPin, CalendarCheck, X, User, Mail, Phone, Building2 } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import dayjs from 'dayjs'
import 'dayjs/locale/da'
import 'dayjs/locale/en'
import HenrikFoto from '../../assets/HenrikFoto.webp'

const BookingSummary = ({ currentStep, kortOpgavebeskrivelse, estimeretTidsforbrugTimer, kategorier, isLoadingKortBeskrivelse, totaltAntalSpørgsmål, adresse, valgtDato, valgtTidspunkt, manualTimePreference, fuldeNavn, email, telefonnummer, erVirksomhed, virksomhed, cvr, onClose }) => {
  const { t, i18n } = useTranslation()
  const [showPopup, setShowPopup] = useState(false)
  const [showPricePopup, setShowPricePopup] = useState(false)
  const [showKategorier, setShowKategorier] = useState(false)
  const holdTimerRef = useRef(null)
  
  // Opdater dayjs locale når sprog skifter
  useEffect(() => {
    dayjs.locale(i18n.language)
  }, [i18n.language])

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (holdTimerRef.current) {
        clearTimeout(holdTimerRef.current)
      }
    }
  }, [])

  const handlePressStart = () => {
    holdTimerRef.current = setTimeout(() => {
      setShowKategorier(true)
    }, 1000)
  }

  const handlePressEnd = () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current)
      holdTimerRef.current = null
    }
  }
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
            <p 
              className={Styles.kortBeskrivelse}
              onMouseDown={handlePressStart}
              onMouseUp={handlePressEnd}
              onMouseLeave={handlePressEnd}
              onTouchStart={handlePressStart}
              onTouchEnd={handlePressEnd}
              style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
            >
              {t('summary.beskrivDinOpgave')}
            </p>
          )}
          {isLoadingKortBeskrivelse ? (
            <p 
              className={Styles.kortBeskrivelse}
              onMouseDown={handlePressStart}
              onMouseUp={handlePressEnd}
              onMouseLeave={handlePressEnd}
              onTouchStart={handlePressStart}
              onTouchEnd={handlePressEnd}
              style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
            >
              {t('summary.opsummererOpgave')}
            </p>
          ) : (
            <b 
              className={Styles.kortBeskrivelse}
              onMouseDown={handlePressStart}
              onMouseUp={handlePressEnd}
              onMouseLeave={handlePressEnd}
              onTouchStart={handlePressStart}
              onTouchEnd={handlePressEnd}
              style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
            >
              {kortOpgavebeskrivelse}
            </b>
          )}
        </div>

        <AnimatePresence>
          {showKategorier && kategorier && kategorier.length > 0 && (
            <motion.div 
              className={Styles.kategorierContainer}
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 15 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <div className={Styles.kategorierListe}>
                {kategorier.map((kategori, index) => {
                  // Handle both string and object formats, use English if language is English
                  const displayKategori = typeof kategori === 'string' 
                    ? kategori 
                    : (i18n.language === 'en' && kategori.opgavetypeEn ? kategori.opgavetypeEn : kategori.opgavetype)
                  return (
                    <motion.span 
                      key={index} 
                      className={Styles.kategoriPill}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05, duration: 0.2 }}
                    >
                      <Tag size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                      {displayKategori}
                    </motion.span>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
                  {t('summary.opfølgendeSporgsmaal', { total: totaltAntalSpørgsmål })}
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
        {currentStep === 3 && (
          <div className={Styles.obsContainerPrice}>
            <span className={Styles.obsLabelPrice}>{t('summary.obs')}</span>
            <span className={Styles.obsTextPrice}>{t('summary.obsTextPriser')} <span className={Styles.obsLinkPrice} onClick={() => setShowPricePopup(true)}>{t('summary.laesMereHer')}</span>.</span>
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
          <img src={HenrikFoto} alt="Henrik" className={Styles.maskotFoto} />
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
        <AnimatePresence>
          {showPricePopup && (
            <>
              <motion.div
                className={Styles.popupOverlay}
                onClick={() => setShowPricePopup(false)}
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
                <button className={Styles.popupCloseButton} onClick={() => setShowPricePopup(false)}>
                  <X size={18} />
                </button>
                <h3 className={Styles.popupTitle}>{t('summary.voresPriser')}</h3>
                <p className={Styles.popupText}>
                  {t('summary.priserBrødtekst1')}
                </p>
                <p className={Styles.popupText} style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #e0e0e0' }}>
                  {t('summary.priserBrødtekst2')}
                </p>
                <p className={Styles.popupText} style={{ marginBottom: '0 px' }}>
                  <b style={{ fontFamily: 'OmnesBold' }}>{t('summary.opstartsgebyr')}</b>
                </p>
                <p className={Styles.popupText} style={{ fontSize: '0.8rem' }}>
                  {t('summary.opstartsgebyrBeskrivelse')}
                </p>
                <p className={Styles.popupText} style={{ marginBottom: '0px' }}>
                  <b style={{ fontFamily: 'OmnesBold' }}>{t('summary.timepris')}</b>
                </p>
                <p className={Styles.popupText} style={{ fontSize: '0.8rem' }}>
                  {t('summary.timeprisBeskrivelse')}
                </p>
                <p className={Styles.popupText} style={{ marginBottom: '0px' }}>
                  <b style={{ fontFamily: 'OmnesBold' }}>{t('summary.tillæg')}</b>
                </p>
                <p className={Styles.popupText} style={{ fontSize: '0.8rem' }}>
                  {t('summary.tillægBeskrivelse')}
                </p>
                <ul style={{ margin: '0 0 12px 20px', padding: 0 }}>
                  <li style={{ marginBottom: '8px', fontSize: '0.8rem', color: '#444444', marginBottom: '4px' }}>
                    <b style={{ fontFamily: 'OmnesBold' }}>{t('summary.aftentillæg')}</b>
                  </li>
                  <li style={{ marginBottom: '8px', fontSize: '0.8rem', color: '#444444', marginBottom: '4px' }}>
                    <b style={{ fontFamily: 'OmnesBold' }}>{t('summary.nattillæg')}</b>
                  </li>
                  <li style={{ marginBottom: '8px', fontSize: '0.8rem', color: '#444444' }}>
                    <b style={{ fontFamily: 'OmnesBold' }}>{t('summary.trailerTillæg')}</b>
                  </li>
                </ul>
                <p className={Styles.popupText} style={{ marginBottom: '0px' }}>
                  <b style={{ fontFamily: 'OmnesBold' }}>{t('summary.materialepriser')}</b>
                </p>
                <p className={Styles.popupText} style={{ fontSize: '0.8rem' }}>
                  {t('summary.materialepriserBeskrivelse')}
                </p>
                <p className={Styles.popupText} style={{ marginBottom: '0px' }}>
                  <b style={{ fontFamily: 'OmnesBold' }}>{t('summary.kørselUdenForCentrum')}</b>
                </p>
                <p className={Styles.popupText} style={{ fontSize: '0.8rem' }}>
                  {t('summary.kørselUdenForCentrumBeskrivelse')}
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
