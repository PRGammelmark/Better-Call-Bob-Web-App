import { useCallback, useEffect, useRef } from 'react'

const useRecaptcha = () => {
  const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY
  const recaptchaLoaderRef = useRef(null)

  const loadRecaptcha = useCallback(() => {
    if (!recaptchaSiteKey) {
      return Promise.reject(new Error('reCAPTCHA site key mangler i miljøvariablerne'))
    }

    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return Promise.reject(new Error('reCAPTCHA kan ikke indlæses i dette miljø'))
    }

    if (window.grecaptcha && window.grecaptcha.enterprise) {
      return new Promise((resolve) => {
        window.grecaptcha.enterprise.ready(() => resolve(window.grecaptcha.enterprise))
      })
    }

    if (!recaptchaLoaderRef.current) {
      recaptchaLoaderRef.current = new Promise((resolve, reject) => {
        const existingScript = document.querySelector('script[src^="https://www.google.com/recaptcha/enterprise.js"]')

        const handleReady = () => {
          if (window.grecaptcha && window.grecaptcha.enterprise) {
            window.grecaptcha.enterprise.ready(() => resolve(window.grecaptcha.enterprise))
          } else {
            recaptchaLoaderRef.current = null
            reject(new Error('reCAPTCHA Enterprise script indlæst men grecaptcha.enterprise er ikke tilgængelig'))
          }
        }

        const handleError = () => {
          recaptchaLoaderRef.current = null
          reject(new Error('Kunne ikke indlæse reCAPTCHA Enterprise scriptet'))
        }

        if (existingScript) {
          existingScript.addEventListener('load', handleReady, { once: true })
          existingScript.addEventListener('error', handleError, { once: true })
          return
        }

        const script = document.createElement('script')
        script.src = `https://www.google.com/recaptcha/enterprise.js?render=${recaptchaSiteKey}`
        script.async = true
        script.defer = true
        script.addEventListener('load', handleReady, { once: true })
        script.addEventListener('error', handleError, { once: true })
        document.body.appendChild(script)
      })
    }

    return recaptchaLoaderRef.current
  }, [recaptchaSiteKey])

  useEffect(() => {
    let cancelled = false

    loadRecaptcha().catch((error) => {
      if (!cancelled) {
        console.error('Fejl ved indlæsning af reCAPTCHA:', error)
      }
    })

    return () => {
      cancelled = true
    }
  }, [loadRecaptcha])

  const executeRecaptcha = useCallback(
    async (action = 'submit') => {
      if (!recaptchaSiteKey) {
        throw new Error('reCAPTCHA site key mangler. Kontakt venligst support.')
      }

      const grecaptcha = await loadRecaptcha()
      return grecaptcha.execute(recaptchaSiteKey, { action })
    },
    [loadRecaptcha, recaptchaSiteKey]
  )

  const registerRecaptchaCallback = useCallback((callback) => {
    if (typeof window === 'undefined') {
      return () => {}
    }

    window.onRecaptchaSubmit = callback
    window.recaptchaCallbackTriggered = false

    return () => {
      if (typeof window !== 'undefined') {
        delete window.onRecaptchaSubmit
        delete window.recaptchaCallbackTriggered
      }
    }
  }, [])

  return {
    recaptchaSiteKey,
    loadRecaptcha,
    executeRecaptcha,
    registerRecaptchaCallback,
  }
}

export default useRecaptcha

