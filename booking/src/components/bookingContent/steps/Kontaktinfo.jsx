import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { User, Mail, Phone, Building2, FileText, ExternalLink } from 'lucide-react'
import StepsStyles from './Steps.module.css'
import Styles from './Kontaktinfo.module.css'
import axios from 'axios'

const Kontaktinfo = ({
  fuldeNavn,
  setFuldeNavn,
  email,
  setEmail,
  telefonnummer,
  setTelefonnummer,
  erVirksomhed,
  setErVirksomhed,
  virksomhed,
  setVirksomhed,
  cvr,
  setCvr,
  kommentarer,
  setKommentarer,
  modtagNyheder,
  setModtagNyheder,
  accepterHandelsbetingelser,
  setAccepterHandelsbetingelser,
  onValidationChange
}) => {
  const { t } = useTranslation()
  const [errors, setErrors] = useState({})
  const [handelsbetingelserLink, setHandelsbetingelserLink] = useState('')
  const [persondatapolitikLink, setPersondatapolitikLink] = useState('')

  // Fetch indstillinger on mount
  useEffect(() => {
    const fetchIndstillinger = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/indstillinger`)
        if (response.data) {
          setHandelsbetingelserLink(response.data.handelsbetingelser || '')
          setPersondatapolitikLink(response.data.persondatapolitik || '')
        }
      } catch (error) {
        console.error('Error fetching indstillinger:', error)
      }
    }
    fetchIndstillinger()
  }, [])

  // Validate form whenever values change
  useEffect(() => {
    const newErrors = {}
    let isValid = true
    
    // Required fields - validate but don't show error messages (only badge)
    if (!fuldeNavn || !fuldeNavn.trim()) {
      isValid = false
    }
    
    if (!email || !email.trim()) {
      isValid = false
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      // Only show error for invalid email format, not for empty
      newErrors.email = t('validation.ugyldigEmail')
      isValid = false
    }
    
    if (!accepterHandelsbetingelser) {
      isValid = false
    }
    
    // Company validation: if erVirksomhed is true, at least one of virksomhed or cvr must be filled
    if (erVirksomhed) {
      const hasVirksomhed = virksomhed && virksomhed.trim()
      const hasCvr = cvr && cvr.trim()
      
      if (!hasVirksomhed && !hasCvr) {
        isValid = false
        // Don't show error messages, only badge
      }
    }
    
    setErrors(newErrors)
    
    // Notify parent about validation status
    if (onValidationChange) {
      onValidationChange(isValid)
    }
  }, [
    fuldeNavn,
    email,
    telefonnummer,
    erVirksomhed,
    virksomhed,
    cvr,
    kommentarer,
    accepterHandelsbetingelser,
    onValidationChange
  ])

  return (
    <div className={Styles.kontaktinfoContainer}>
      <div className={Styles.headerSection}>
        <h2 className={StepsStyles.headingH2}>{t('kontaktinfo.kontaktinfo')}</h2>
      </div>

      <div className={Styles.formSection}>
        {/* Fulde navn */}
        <div className={Styles.inputGroup}>
          <label htmlFor="fuldeNavn" className={Styles.label}>
            <User size={18} className={Styles.labelIcon} />
            {t('kontaktinfo.fuldeNavn')}
            {!errors.fuldeNavn && (!fuldeNavn || !fuldeNavn.trim()) && (
              <span className={Styles.requiredBadge}>{t('kontaktinfo.paakraevet')}</span>
            )}
          </label>
          <input
            id="fuldeNavn"
            type="text"
            className={Styles.input}
            placeholder={t('kontaktinfo.placeholder.fuldeNavn')}
            value={fuldeNavn || ''}
            onChange={(e) => setFuldeNavn(e.target.value)}
            enterKeyHint="next"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                document.getElementById('email')?.focus()
              }
            }}
          />
        </div>

        {/* Email and Telefonnummer side by side */}
        <div className={Styles.twoColumnRow}>
          <div className={Styles.inputGroup}>
            <label htmlFor="email" className={Styles.label}>
              <Mail size={18} className={Styles.labelIcon} />
              {t('kontaktinfo.mail')}
              {!errors.email && (!email || !email.trim()) && (
                <span className={Styles.requiredBadge}>{t('kontaktinfo.paakraevet')}</span>
              )}
            </label>
            <input
              id="email"
              type="email"
              className={Styles.input}
              placeholder={t('kontaktinfo.placeholder.email')}
              value={email || ''}
              onChange={(e) => setEmail(e.target.value)}
              enterKeyHint="next"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  document.getElementById('telefonnummer')?.focus()
                }
              }}
            />
            {errors.email && errors.email === 'Ugyldig e-mailadresse' && (
              <span className={Styles.errorText}>{errors.email}</span>
            )}
          </div>

          <div className={Styles.inputGroup}>
            <label htmlFor="telefonnummer" className={Styles.label}>
              <Phone size={18} className={Styles.labelIcon} />
              {t('kontaktinfo.telefon')}
            </label>
            <input
              id="telefonnummer"
              type="tel"
              className={Styles.input}
              placeholder={t('kontaktinfo.placeholder.telefonnummer')}
              value={telefonnummer || ''}
              onChange={(e) => setTelefonnummer(e.target.value)}
              enterKeyHint="next"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  document.getElementById('kommentarer')?.focus()
                }
              }}
            />
            {/* {!telefonnummer && (
              <p className={Styles.hintText}>
                Anbefalet: Hjælper os med at kontakte dig hurtigere
              </p>
            )} */}
          </div>
        </div>

        {/* Virksomhed toggle with expandable container */}
        <div className={`${Styles.toggleGroup} ${erVirksomhed ? Styles.toggleGroupExpanded : ''}`}>
          <button
            type="button"
            className={`${Styles.toggleButton} ${erVirksomhed ? Styles.toggleButtonActive : ''}`}
            onClick={() => setErVirksomhed(!erVirksomhed)}
          >
            <Building2 size={18} className={Styles.toggleIcon} />
            <span>{t('kontaktinfo.erVirksomhed')}</span>
            <div className={`${Styles.toggleSwitch} ${erVirksomhed ? Styles.toggleSwitchActive : ''}`}>
              <div className={Styles.toggleSwitchThumb}></div>
            </div>
          </button>

          {/* Virksomhed fields - shown when erVirksomhed is true */}
          <div className={Styles.companyFieldsContainer}>
            <div className={Styles.companyFields}>
              <div className={Styles.inputGroup}>
                <label htmlFor="virksomhed" className={Styles.label}>
                  <Building2 size={18} className={Styles.labelIcon} />
                  {t('kontaktinfo.virksomhed')}
                  {erVirksomhed && (!virksomhed || !virksomhed.trim()) && (!cvr || !cvr.trim()) && (
                    <span className={Styles.requiredBadge}>{t('kontaktinfo.paakraevet')}</span>
                  )}
                </label>
                <input
                  id="virksomhed"
                  type="text"
                  className={Styles.input}
                  placeholder={t('kontaktinfo.placeholder.virksomhed')}
                  value={virksomhed || ''}
                  onChange={(e) => setVirksomhed(e.target.value)}
                />
              </div>

              <div className={Styles.inputGroup}>
                <label htmlFor="cvr" className={Styles.label}>
                  <Building2 size={18} className={Styles.labelIcon} />
                  {t('kontaktinfo.cvr')}
                  {erVirksomhed && (!virksomhed || !virksomhed.trim()) && (!cvr || !cvr.trim()) && (
                    <span className={Styles.requiredBadge}>{t('kontaktinfo.paakraevet')}</span>
                  )}
                </label>
                <input
                  id="cvr"
                  type="text"
                  className={Styles.input}
                  placeholder={t('kontaktinfo.placeholder.cvr')}
                  value={cvr || ''}
                  onChange={(e) => setCvr(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Kommentarer */}
        <div className={Styles.inputGroup}>
          <label htmlFor="kommentarer" className={Styles.label}>
            <FileText size={18} className={Styles.labelIcon} />
            {t('kontaktinfo.kommentarer')}
          </label>
          <textarea
            id="kommentarer"
            className={Styles.textarea}
            placeholder={t('kontaktinfo.placeholder.kommentarer')}
            value={kommentarer || ''}
            onChange={(e) => setKommentarer(e.target.value)}
            rows={4}
          />
        </div>

        {/* Switch buttons */}
        <div className={Styles.switchesSection}>
          <div className={Styles.switchGroup}>
            <label className={Styles.switchLabel}>
              <input
                type="checkbox"
                className={Styles.switchInput}
                checked={modtagNyheder}
                onChange={(e) => setModtagNyheder(e.target.checked)}
              />
              <div className={`${Styles.switch} ${modtagNyheder ? Styles.switchActive : ''}`}>
                <div className={Styles.switchThumb}></div>
              </div>
              <span className={Styles.switchText}>
                {t('kontaktinfo.modtagNyheder')}
              </span>
            </label>
          </div>

          <div className={Styles.switchGroup}>
            <label className={Styles.switchLabel}>
              <input
                type="checkbox"
                className={Styles.switchInput}
                checked={accepterHandelsbetingelser}
                onChange={(e) => setAccepterHandelsbetingelser(e.target.checked)}
              />
              <div className={`${Styles.switch} ${accepterHandelsbetingelser ? Styles.switchActive : ''}`}>
                <div className={Styles.switchThumb}></div>
              </div>
              <span className={Styles.switchText}>
                {t('kontaktinfo.accepterHandelsbetingelser')}{' '}
                {handelsbetingelserLink ? (
                  <a 
                    href={handelsbetingelserLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    style={{ textDecoration: 'none', color: '#59bf1a', display: 'inline-flex', alignItems: 'flex-start', gap: '3px' }}
                  >
                    {t('kontaktinfo.handelsbetingelser')}
                    <ExternalLink size={11} style={{ marginTop: '2px' }} />
                  </a>
                ) : (
                  t('kontaktinfo.handelsbetingelser')
                )}
                {' '}{t('kontaktinfo.og')}{' '}
                {persondatapolitikLink ? (
                  <a 
                    href={persondatapolitikLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    style={{ textDecoration: 'none', color: '#59bf1a', display: 'inline-flex', alignItems: 'flex-start', gap: '3px' }}
                  >
                    {t('kontaktinfo.persondatapolitik')}
                    <ExternalLink size={11} style={{ marginTop: '2px' }} />
                  </a>
                ) : (
                  t('kontaktinfo.persondatapolitik')
                )}
                {!accepterHandelsbetingelser && (
                  <span className={Styles.requiredBadge}>{t('kontaktinfo.paakraevet')}</span>
                )}
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Kontaktinfo

