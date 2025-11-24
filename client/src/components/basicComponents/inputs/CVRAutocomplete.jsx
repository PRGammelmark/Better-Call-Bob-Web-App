// CVRAutocomplete.jsx
import React, { useState, useEffect, useRef } from 'react'
import { Building, Hash, Loader2 } from 'lucide-react'
import Styles from './CVRAutocomplete.module.css'
import ReactDOM from 'react-dom'

const CVRAutocomplete = ({ 
  title, 
  icon, 
  value, 
  onChange, 
  onSelect, 
  onBlur,
  placeholder,
  searchType = 'name' // 'name' or 'vat'
}) => {
  const [searchQuery, setSearchQuery] = useState(value || '')
  const [results, setResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const containerRef = useRef(null)
  const inputRef = useRef(null)
  const dropdownRef = useRef(null)
  const debounceTimerRef = useRef(null)

  useEffect(() => {
    setSearchQuery(value || '')
  }, [value])

  const searchCVR = async (query) => {
    if (!query || query.length < 2) {
      setResults([])
      setShowDropdown(false)
      return
    }

    setIsLoading(true)
    try {
      // User agent som specificeret i dokumentationen
      const userAgent = 'Better Call Bob - App-indstillinger - CVR opslag'
      
      const params = new URLSearchParams({
        country: 'dk',
        format: 'json'
      })

      // Tilføj specifik søgetype - enten vat eller name, ikke begge
      if (searchType === 'vat') {
        params.append('vat', query)
      } else {
        // Standard er name search
        params.append('name', query)
      }

      const response = await fetch(`https://cvrapi.dk/api?${params.toString()}`, {
        headers: {
          'User-Agent': userAgent
        }
      })

      if (!response.ok) {
        throw new Error('CVR API fejl')
      }

      const data = await response.json()
      
      // CVR API kan returnere forskellige formater
      // Hvis det er et array, brug det direkte
      if (Array.isArray(data)) {
        setResults(data.filter(item => item && item.vat)) // Filtrer gyldige resultater
      } else if (data && data.vat) {
        // Enkelt resultat objekt
        setResults([data])
      } else if (data.error) {
        // API returnerede en fejl
        console.warn('CVR API fejl:', data.error)
        setResults([])
      } else {
        setResults([])
      }

      setShowDropdown(true)
    } catch (error) {
      console.error('Fejl ved CVR søgning:', error)
      setResults([])
      setShowDropdown(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const newValue = e.target.value
    setSearchQuery(newValue)
    onChange?.(newValue)
    setSelectedIndex(-1)

    // Debounce API kald
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    debounceTimerRef.current = setTimeout(() => {
      searchCVR(newValue)
    }, 500) // 500ms debounce
  }

  const handleSelect = (company) => {
    // Opdater input feltet med det valgte navn eller CVR nummer
    const displayValue = company.name || company.company || company.vat || ''
    setSearchQuery(displayValue)
    setShowDropdown(false)
    setResults([])
    setSelectedIndex(-1)
    
    // Kald onSelect callback med hele company objektet
    onSelect?.(company)
  }

  const handleKeyDown = (e) => {
    if (!showDropdown || results.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => 
        prev < results.length - 1 ? prev + 1 : prev
      )
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault()
      handleSelect(results[selectedIndex])
    } else if (e.key === 'Escape') {
      setShowDropdown(false)
    }
  }

  const handleBlur = (e) => {
    // Delay for at tillade klik på dropdown items
    setTimeout(() => {
      if (!dropdownRef.current?.contains(document.activeElement)) {
        setShowDropdown(false)
        // Hvis der ikke er valgt noget fra dropdown, kald onBlur callback
        if (onBlur) {
          onBlur()
        }
      }
    }, 200)
  }

  const handleFocus = () => {
    if (results.length > 0) {
      setShowDropdown(true)
    }
  }

  // Beregn dropdown position
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 })

  useEffect(() => {
    if (showDropdown && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: rect.width
      })
    }
  }, [showDropdown, results])

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && dropdownRef.current) {
      const selectedElement = dropdownRef.current.querySelector(`[data-index="${selectedIndex}"]`)
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [selectedIndex])

  // Luk dropdown når man klikker uden for den
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown) {
        // Tjek om klikket er uden for både container og dropdown
        const clickedOutsideContainer = containerRef.current && !containerRef.current.contains(event.target)
        const clickedOutsideDropdown = dropdownRef.current && !dropdownRef.current.contains(event.target)
        
        if (clickedOutsideContainer && clickedOutsideDropdown) {
          setShowDropdown(false)
          setResults([])
          setSelectedIndex(-1)
        }
      }
    }

    if (showDropdown) {
      // Tilføj event listener når dropdown er åben
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        // Fjern event listener når dropdown lukkes eller komponenten unmountes
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [showDropdown])

  return (
    <div className={Styles.row} ref={containerRef}>
      <div className={Styles.iconAndTitleDiv}>
        {icon ? <span className={Styles.iconSpan}>{icon}</span> : ''}
        <h3>{title}</h3>
      </div>

      <div className={Styles.inputContainer}>
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder={placeholder}
          className={Styles.inputField}
        />
        {isLoading && (
          <Loader2 className={Styles.loader} size={16} />
        )}
      </div>

      {showDropdown && results.length > 0 && ReactDOM.createPortal(
        <div
          ref={dropdownRef}
          className={Styles.dropdown}
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            width: `${dropdownPosition.width}px`
          }}
        >
          {results.map((company, index) => (
            <div
              key={company.vat || index}
              data-index={index}
              className={`${Styles.dropdownItem} ${selectedIndex === index ? Styles.selected : ''}`}
              onClick={() => handleSelect(company)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <div className={Styles.companyName}>
                {company.name || company.company || 'Ukendt navn'}
              </div>
              {company.vat && (
                <div className={Styles.companyDetails}>
                  CVR: {company.vat}
                </div>
              )}
              {(company.address || company.street || company.city) && (
                <div className={Styles.companyDetails}>
                  {[company.street, company.city].filter(Boolean).join(', ') || company.address}
                </div>
              )}
            </div>
          ))}
        </div>,
        document.getElementById('portal') || document.body
      )}
    </div>
  )
}

export default CVRAutocomplete

