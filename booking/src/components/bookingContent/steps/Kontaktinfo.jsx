import React, { useState, useEffect } from 'react'
import { User, Mail, Phone, Building2, FileText } from 'lucide-react'
import StepsStyles from './Steps.module.css'
import Styles from './Kontaktinfo.module.css'

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
  const [errors, setErrors] = useState({})

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
      newErrors.email = 'Ugyldig e-mailadresse'
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
        <h2 className={StepsStyles.headingH2}>Kontaktinfo</h2>
      </div>

      <div className={Styles.formSection}>
        {/* Fulde navn */}
        <div className={Styles.inputGroup}>
          <label htmlFor="fuldeNavn" className={Styles.label}>
            <User size={18} className={Styles.labelIcon} />
            Fulde navn
            {!errors.fuldeNavn && (!fuldeNavn || !fuldeNavn.trim()) && (
              <span className={Styles.requiredBadge}>Påkrævet</span>
            )}
          </label>
          <input
            id="fuldeNavn"
            type="text"
            className={Styles.input}
            placeholder="Fx Jens Hansen"
            value={fuldeNavn || ''}
            onChange={(e) => setFuldeNavn(e.target.value)}
          />
        </div>

        {/* Email and Telefonnummer side by side */}
        <div className={Styles.twoColumnRow}>
          <div className={Styles.inputGroup}>
            <label htmlFor="email" className={Styles.label}>
              <Mail size={18} className={Styles.labelIcon} />
              Mail
              {!errors.email && (!email || !email.trim()) && (
                <span className={Styles.requiredBadge}>Påkrævet</span>
              )}
            </label>
            <input
              id="email"
              type="email"
              className={Styles.input}
              placeholder="Fx jens@example.dk"
              value={email || ''}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && errors.email === 'Ugyldig e-mailadresse' && (
              <span className={Styles.errorText}>{errors.email}</span>
            )}
          </div>

          <div className={Styles.inputGroup}>
            <label htmlFor="telefonnummer" className={Styles.label}>
              <Phone size={18} className={Styles.labelIcon} />
              Telefonnummer
            </label>
            <input
              id="telefonnummer"
              type="tel"
              className={Styles.input}
              placeholder="Fx 12345678"
              value={telefonnummer || ''}
              onChange={(e) => setTelefonnummer(e.target.value)}
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
            <span>Jeg repræsenterer en virksomhed</span>
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
                  Virksomhed
                  {erVirksomhed && (!virksomhed || !virksomhed.trim()) && (!cvr || !cvr.trim()) && (
                    <span className={Styles.requiredBadge}>Påkrævet</span>
                  )}
                </label>
                <input
                  id="virksomhed"
                  type="text"
                  className={Styles.input}
                  placeholder="Fx Better Call Bob ApS"
                  value={virksomhed || ''}
                  onChange={(e) => setVirksomhed(e.target.value)}
                />
              </div>

              <div className={Styles.inputGroup}>
                <label htmlFor="cvr" className={Styles.label}>
                  <Building2 size={18} className={Styles.labelIcon} />
                  CVR
                  {erVirksomhed && (!virksomhed || !virksomhed.trim()) && (!cvr || !cvr.trim()) && (
                    <span className={Styles.requiredBadge}>Påkrævet</span>
                  )}
                </label>
                <input
                  id="cvr"
                  type="text"
                  className={Styles.input}
                  placeholder="Fx 12345678"
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
            Kommentarer
          </label>
          <textarea
            id="kommentarer"
            className={Styles.textarea}
            placeholder="Har du nogle ekstra kommentarer til os?"
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
                Jeg vil gerne modtage marketingmails med bl.a. sæsontilbud og rabatter
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
                Jeg accepterer handelsbetingelserne og persondatapolitikken
                {!accepterHandelsbetingelser && (
                  <span className={Styles.requiredBadge}>Påkrævet</span>
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

