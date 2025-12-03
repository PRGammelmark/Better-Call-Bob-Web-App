import React from 'react'
import { useTranslation } from 'react-i18next'
import { Check, Tag, Clock, MapPin, CalendarCheck, User, Mail, Phone, Building2, FileText, MessageSquare, HelpCircle } from 'lucide-react'
import dayjs from 'dayjs'
import 'dayjs/locale/da'
import 'dayjs/locale/en'
import Styles from './BookingSuccess.module.css'
import StepsStyles from './Steps.module.css'

const BookingSuccess = ({ 
  bookingData,
  kortOpgavebeskrivelse,
  estimeretTidsforbrugTimer,
  kategorier,
  opfølgendeSpørgsmålSvar,
  opfølgendeSpørgsmål,
  adresse,
  formateretAdresse,
  valgtDato,
  valgtTidspunkt,
  manualTimePreference,
  fuldeNavn,
  email,
  telefonnummer,
  erVirksomhed,
  virksomhed,
  cvr,
  opgaveBilleder,
  kommentarer,
  modtagNyheder,
  availableWorkerNames
}) => {
  const { t, i18n } = useTranslation()

  // Opdater dayjs locale når sprog skifter
  React.useEffect(() => {
    dayjs.locale(i18n.language)
  }, [i18n.language])

  return (
    <div className={Styles.successContainer}>
      <div className={Styles.successHeader}>
        <div className={Styles.successIcon}>
          <Check size={48} />
        </div>
        <h1 className={Styles.successTitle}>{t('bookingSuccess.takForDinBooking')}</h1>
        <p className={Styles.successSubtitle}>{t('bookingSuccess.bookingOprettet')}</p>
      </div>

      <div className={Styles.successContent}>
        {/* Opgave Information */}
        <div className={Styles.section}>
          <h2 className={Styles.sectionTitle}>
            <div className={Styles.iconCircle}>
              <FileText size={18} className={Styles.sectionIcon} />
            </div>
            {t('bookingSuccess.opgave')}
          </h2>
          {kortOpgavebeskrivelse && (
            <p className={Styles.text}>
              <strong>{t('bookingSuccess.beskrivelse')}:</strong> {kortOpgavebeskrivelse}
            </p>
          )}
          {kategorier && kategorier.length > 0 && (
            <div className={Styles.categoriesContainer}>
              {kategorier.map((kategori, index) => {
                const displayKategori = typeof kategori === 'string' 
                  ? kategori 
                  : (i18n.language === 'en' && kategori.opgavetypeEn ? kategori.opgavetypeEn : kategori.opgavetype)
                return (
                  <span key={index} className={Styles.categoryTag}>
                    <Tag size={12} style={{ marginRight: 4 }} />
                    {displayKategori}
                  </span>
                )
              })}
            </div>
          )}
          {estimeretTidsforbrugTimer !== null && estimeretTidsforbrugTimer !== undefined && (
            <p className={Styles.text}>
              <Clock size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
              <strong>{t('bookingSuccess.anslaaetTidsforbrug')}:</strong> {estimeretTidsforbrugTimer} {estimeretTidsforbrugTimer === 1 ? t('summary.time') : t('summary.timer')}
            </p>
          )}
          {opgaveBilleder && opgaveBilleder.length > 0 && (
            <p className={Styles.text}>
              <strong>{t('bookingSuccess.billeder')}:</strong> {opgaveBilleder.length} {opgaveBilleder.length === 1 ? t('summary.billede') : t('summary.billeder')}
            </p>
          )}
        </div>

        {/* Opfølgende Spørgsmål */}
        {Object.keys(opfølgendeSpørgsmålSvar || {}).length > 0 && (
          <div className={Styles.section}>
            <h2 className={Styles.sectionTitle}>
              <div className={Styles.iconCircle}>
                <HelpCircle size={18} className={Styles.sectionIcon} />
              </div>
              {t('bookingSuccess.opfølgendeSporgsmaal')}
            </h2>
            {Object.entries(opfølgendeSpørgsmålSvar).map(([key, value]) => {
              if (value === null || value === undefined || value === '') return null
              const spørgsmål = opfølgendeSpørgsmål?.find(s => s.feltNavn === key)
              const displaySpørgsmålTekst = spørgsmål && i18n.language === 'en' && spørgsmål.spørgsmålEn 
                ? spørgsmål.spørgsmålEn 
                : (spørgsmål?.spørgsmål || key)
              let displayValue = String(value)
              if (spørgsmål?.type === 'Valgmuligheder' && i18n.language === 'en' && value.includes(':')) {
                const parts = String(value).split(':')
                displayValue = parts.length > 1 ? parts[1].trim() : displayValue
              }
              return (
                <p key={key} className={Styles.text}>
                  <strong>{displaySpørgsmålTekst}:</strong> {displayValue}
                </p>
              )
            })}
          </div>
        )}

        {/* Kommentarer */}
        {kommentarer && kommentarer.trim() && (
          <div className={Styles.section}>
            <h2 className={Styles.sectionTitle}>
              <div className={Styles.iconCircle}>
                <MessageSquare size={18} className={Styles.sectionIcon} />
              </div>
              {t('kontaktinfo.kommentarer')}
            </h2>
            <p className={Styles.text}>{kommentarer}</p>
          </div>
        )}

        {/* Tid & Sted */}
        <div className={Styles.section}>
          <h2 className={Styles.sectionTitle}>
            <div className={Styles.iconCircle}>
              <MapPin size={18} className={Styles.sectionIcon} />
            </div>
            {t('tidOgSted.tidOgSted')}
          </h2>
          {(formateretAdresse || adresse) && (
            <p className={Styles.text}>
              <MapPin size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
              <strong>{t('tidOgSted.adresse')}:</strong> {formateretAdresse || adresse}
            </p>
          )}
          {(valgtDato || valgtTidspunkt || manualTimePreference) && (
            <p className={Styles.text}>
              <CalendarCheck size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
              <strong>{t('tidOgSted.tidspunkt')}:</strong>{' '}
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
            </p>
          )}
        </div>

        {/* Kontaktoplysninger */}
        {(fuldeNavn || email || telefonnummer || (erVirksomhed && (virksomhed || cvr))) && (
          <div className={Styles.section}>
            <h2 className={Styles.sectionTitle}>
              <div className={Styles.iconCircle}>
                <User size={18} className={Styles.sectionIcon} />
              </div>
              {t('summary.kontaktoplysninger')}
            </h2>
            {fuldeNavn && (
              <p className={Styles.text}>
                <User size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                <strong>{t('kontaktinfo.fuldeNavn')}:</strong> {fuldeNavn}
              </p>
            )}
            {email && (
              <p className={Styles.text}>
                <Mail size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                <strong>{t('kontaktinfo.mail')}:</strong> {email}
              </p>
            )}
            {telefonnummer && (
              <p className={Styles.text}>
                <Phone size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                <strong>{t('kontaktinfo.telefon')}:</strong> {telefonnummer}
              </p>
            )}
            {erVirksomhed && (virksomhed || cvr) && (
              <p className={Styles.text}>
                <Building2 size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                <strong>{t('kontaktinfo.virksomhed')}:</strong> {virksomhed && cvr ? `${virksomhed} (CVR: ${cvr})` : virksomhed || `CVR: ${cvr}`}
              </p>
            )}
          </div>
        )}

        {/* Info om næste skridt */}
        <div className={Styles.infoBox}>
          <p className={Styles.infoText}>
            {t('bookingSuccess.viKontakterDigSnart')}
          </p>
        </div>
      </div>
    </div>
  )
}

export default BookingSuccess

