import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import Styles from './DawaAutocomplete.module.css'

const DawaAutocomplete = ({ 
  value, 
  onChange, 
  onSelect, 
  placeholder,
  className = '',
  pulseField = null,
  isFound = false
}) => {
  const [query, setQuery] = useState(value || '')
  const [suggestions, setSuggestions] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [isLoading, setIsLoading] = useState(false)
  const wrapperRef = useRef(null)
  const inputRef = useRef(null)
  const debounceTimerRef = useRef(null)

  // Update query when value prop changes externally
  useEffect(() => {
    if (value !== undefined && value !== query) {
      setQuery(value)
    }
  }, [value])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Fetch suggestions from DAWA API
  const fetchSuggestions = async (searchQuery) => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSuggestions([])
      setIsOpen(false)
      return
    }

    setIsLoading(true)
    try {
      const response = await axios.get(
        'https://api.dataforsyningen.dk/adresser/autocomplete',
        {
          params: {
            q: searchQuery.trim(),
            per_side: 10
          }
        }
      )

      const data = response.data || []
      console.log('📍 DAWA autocomplete suggestions:', data)
      if (data.length > 0) {
        console.log('📍 First suggestion structure:', data[0])
      }
      setSuggestions(data)
      setIsOpen(data.length > 0)
      setSelectedIndex(-1)
    } catch (error) {
      console.error('Error fetching DAWA suggestions:', error)
      setSuggestions([])
      setIsOpen(false)
    } finally {
      setIsLoading(false)
    }
  }

  // Debounce API calls
  const handleInputChange = (e) => {
    const newValue = e.target.value
    setQuery(newValue)
    
    // Call onChange immediately for controlled component
    if (onChange) {
      onChange(newValue)
    }

    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    // Set new timer for API call
    debounceTimerRef.current = setTimeout(() => {
      fetchSuggestions(newValue)
    }, 300) // 300ms debounce
  }

  const handleSelect = async (suggestion) => {
    const selectedAddress = suggestion.tekst || suggestion.visningstekst || ''
    setQuery(selectedAddress)
    setIsOpen(false)
    setSelectedIndex(-1)
    
    // Call onChange with selected address
    if (onChange) {
      onChange(selectedAddress)
    }
    
    // Log den originale suggestion struktur
    console.log('📍 Selected suggestion:', suggestion)
    
    // Hvis suggestion har en id, hent den fulde adresse med koordinater
    let fullAddressData = suggestion
    const addressId = suggestion.id || suggestion.adgangsadresse?.id || suggestion.data?.id
    
    console.log('📍 Address ID found:', addressId)
    
    if (addressId) {
      try {
        const addressResponse = await axios.get(
          `https://api.dataforsyningen.dk/adresser/${addressId}`,
          {
            params: {
              struktur: 'mini' // Brug mini struktur for mindre data
            }
          }
        )
        fullAddressData = addressResponse.data
        console.log('📍 Full DAWA address data:', fullAddressData)
      } catch (error) {
        console.error('Error fetching full address from DAWA:', error)
        console.error('Error details:', error.response?.data || error.message)
        // Fallback til original suggestion hvis hentning fejler
        console.log('📍 Using suggestion data directly:', suggestion)
      }
    } else {
      console.log('📍 No address ID found, checking if coordinates are in suggestion')
      // Tjek om koordinater allerede er i suggestion objektet
      if (suggestion.koordinater || suggestion.adgangsadresse?.koordinater) {
        console.log('📍 Coordinates found directly in suggestion')
      } else {
        console.log('📍 No coordinates found, will need to geocode on server')
      }
    }
    
    // Call onSelect callback with full address data (including coordinates if available)
    if (onSelect) {
      onSelect(fullAddressData)
    }
  }

  const handleKeyDown = (e) => {
    if (!isOpen || suggestions.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSelect(suggestions[selectedIndex])
        }
        break
      case 'Escape':
        setIsOpen(false)
        setSelectedIndex(-1)
        break
      default:
        break
    }
  }

  return (
    <div className={`${Styles.autocompleteWrapper} ${className}`} ref={wrapperRef}>
      <div className={`${Styles.inputWrapper} ${pulseField === 'adresse' ? Styles.pulsating : ''}`}>
        <input
          ref={inputRef}
          type="text"
          className={`${Styles.input} ${pulseField === 'adresse' ? Styles.pulsating : ''} ${isFound ? Styles.inputFound : ''}`}
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) {
              setIsOpen(true)
            }
          }}
          placeholder={placeholder}
          autoComplete="off"
        />
        {isLoading && (
          <div className={Styles.loadingSpinner}></div>
        )}
      </div>
      {isOpen && suggestions.length > 0 && (
        <ul className={Styles.suggestionsList}>
          {suggestions.map((suggestion, index) => {
            const displayText = suggestion.tekst || suggestion.visningstekst || ''
            return (
              <li
                key={suggestion.id || index}
                className={`${Styles.suggestionItem} ${
                  index === selectedIndex ? Styles.suggestionItemSelected : ''
                }`}
                onClick={() => handleSelect(suggestion)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                {displayText}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export default DawaAutocomplete

