import React, { useState, useEffect, useRef } from 'react'
import Styles from './AppIndstillinger.module.css'
import axios from 'axios'
import { useAuthContext } from '../hooks/useAuthContext.js'
import { useIndstillinger } from '../context/IndstillingerContext.jsx'
import { useAppSettingsNavigation } from '../context/AppSettingsNavigationContext.jsx'
import { useNavigate } from 'react-router-dom'
import { storage } from '../firebase.js'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import imageCompression from 'browser-image-compression'
import { motion, AnimatePresence } from 'framer-motion'
import SettingsSidebar from './appIndstillinger/SettingsSidebar.jsx'
import Virksomhedsoplysninger from './appIndstillinger/Virksomhedsoplysninger.jsx'
import Links from './appIndstillinger/Links.jsx'
import Arbejdspræferencer from './appIndstillinger/Arbejdspræferencer.jsx'
import Branding from './appIndstillinger/Branding.jsx'
import Fintuning from './appIndstillinger/Fintuning.jsx'
import TimerTillæg from './appIndstillinger/TimerTillæg.jsx'
import Materialer from './appIndstillinger/Materialer.jsx'
import Pauser from './appIndstillinger/Pauser.jsx'
import Opkrævning from './appIndstillinger/Opkrævning.jsx'
import Arbejdssedler from './appIndstillinger/Arbejdssedler.jsx'
import Rettigheder from './appIndstillinger/Rettigheder.jsx'
import Informationsbokse from './appIndstillinger/Informationsbokse.jsx'
import BetaFunktioner from './appIndstillinger/BetaFunktioner.jsx'

// Page order for determining navigation direction on mobile
const PAGE_ORDER = [
    'virksomhedsoplysninger',
    'links',
    'beta-funktioner',
    'timer-tillæg',
    'materialer',
    'pauser',
    'opkrævning',
    'arbejdssedler',
    'rettigheder',
    'arbejdspræferencer',
    'branding',
    'fintuning',
    'informationsbokse'
]

// Page titles for mobile header
const PAGE_TITLES = {
    'virksomhedsoplysninger': 'Virksomhedsoplysninger',
    'links': 'Links',
    'beta-funktioner': 'Beta-funktioner',
    'timer-tillæg': 'Timer & tillæg',
    'materialer': 'Materialer',
    'pauser': 'Pauser',
    'opkrævning': 'Opkrævning',
    'arbejdssedler': 'Arbejdssedler',
    'rettigheder': 'Rettigheder',
    'arbejdspræferencer': 'Arbejdspræferencer',
    'branding': 'Branding',
    'fintuning': 'Fintuning',
    'informationsbokse': 'Informationsbokse'
}

// Animation variants for desktop (fade)
const desktopVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
}

// Animation variants for mobile (slide) - uses custom prop for dynamic direction
// Forward (into tree): both entry and exit move right-to-left
// Backward (out of tree): both entry and exit move left-to-right
const mobileVariants = {
    initial: (direction) => ({ 
        x: direction === 'forward' ? '100%' : '-100%', 
        opacity: 0 
    }),
    animate: { 
        x: 0, 
        opacity: 1 
    },
    exit: (direction) => ({ 
        x: direction === 'forward' ? '-100%' : '100%', 
        opacity: 0 
    })
}

const AppIndstillinger = () => {

    const navigate = useNavigate();
    const { user } = useAuthContext();
    const { indstillinger } = useIndstillinger();
    const { activeSettingsPage, setActiveSettingsPage } = useAppSettingsNavigation();
    const isUpdatingFromContextRef = useRef(false) // Track if update is from context (Header)

    const [activePage, setActivePage] = useState(null) // null means show sidebar on mobile
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 750)
    const [animationDirection, setAnimationDirection] = useState('forward') // 'forward' or 'backward'
    const [visAISystemPromptModal, setVisAISystemPromptModal] = useState(false)
    const [visAITidsestimaterPromptModal, setVisAITidsestimaterPromptModal] = useState(false)
    const [opgavetyper, setOpgavetyper] = useState([])
    const [refetchOpgavetyper, setRefetchOpgavetyper] = useState(false)
    const [maxArbejdsradius, setMaxArbejdsradius] = useState( indstillinger?.arbejdsområdeKilometerRadius )
    const [kørerFakturaBetalingstjek, setKørerFakturaBetalingstjek] = useState(false)
    const [virksomhedsnavn, setVirksomhedsnavn] = useState(indstillinger?.virksomhedsnavn || "")
    const [cvrNummer, setCvrNummer] = useState(indstillinger?.cvrNummer || "")
    const [adresse, setAdresse] = useState(indstillinger?.adresse || "")
    const [postnummer, setPostnummer] = useState(indstillinger?.postnummer || "")
    const [by, setBy] = useState(indstillinger?.by || "")
    const [telefonnummer, setTelefonnummer] = useState(indstillinger?.telefonnummer || "")
    const [email, setEmail] = useState(indstillinger?.email || "")
    const [hjemmeside, setHjemmeside] = useState(indstillinger?.hjemmeside || "")
    const [handelsbetingelser, setHandelsbetingelser] = useState(indstillinger?.handelsbetingelser || "")
    const [persondatapolitik, setPersondatapolitik] = useState(indstillinger?.persondatapolitik || "")
    const [logo, setLogo] = useState(indstillinger?.logo || "")
    const [isUploadingLogo, setIsUploadingLogo] = useState(false)
    const [logoSize, setLogoSize] = useState(indstillinger?.logoSize || 100)
    const [bookingLogo, setBookingLogo] = useState(indstillinger?.bookingLogo || "")
    const [isUploadingBookingLogo, setIsUploadingBookingLogo] = useState(false)
    const [bookingFavicon, setBookingFavicon] = useState(indstillinger?.bookingFavicon || "")
    const [isUploadingFavicon, setIsUploadingFavicon] = useState(false)
    const [bookingRedirectUrl, setBookingRedirectUrl] = useState(indstillinger?.bookingRedirectUrl || "")

    // Handle page navigation with direction tracking
    const handlePageChange = (newPage) => {
        if (newPage === activePage) return
        
        const newIndex = newPage !== null ? PAGE_ORDER.indexOf(newPage) : -1
        const currentIndex = activePage !== null ? PAGE_ORDER.indexOf(activePage) : -1
        
        // Determine direction: going from sidebar (null) to page is forward, page to sidebar is backward
        if (activePage === null && newPage !== null) {
            setAnimationDirection('forward')
        } else if (activePage !== null && newPage === null) {
            setAnimationDirection('backward')
        } else if (newIndex > currentIndex) {
            setAnimationDirection('forward')
        } else {
            setAnimationDirection('backward')
        }
        
        setActivePage(newPage)
        // Mark that we're updating from local change, so useEffect ignores it
        isUpdatingFromContextRef.current = true
        // Update context for Header component (null when showing sidebar)
        setActiveSettingsPage(newPage)
    }

    // Handle window resize for mobile detection
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 750)
            // On desktop, always show a page (default to first if none selected)
            if (window.innerWidth > 750 && activePage === null) {
                setActivePage('virksomhedsoplysninger')
            }
        }
        handleResize() // Initial check
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [activePage])

    // Set default page on desktop
    useEffect(() => {
        if (!isMobile && activePage === null) {
            setActivePage('virksomhedsoplysninger')
        }
    }, [isMobile, activePage])

    // Sync local activePage state with context (for back button from Header)
    // This effect handles when Header updates the context (e.g., back button click)
    useEffect(() => {
        // Skip if this update came from our own handlePageChange
        if (isUpdatingFromContextRef.current) {
            isUpdatingFromContextRef.current = false
            return
        }
        
        // Only sync if context differs from local state (external change from Header)
        if (activeSettingsPage !== activePage) {
            if (activeSettingsPage === null && activePage !== null) {
                // Going back to sidebar from Header back button
                setAnimationDirection('backward')
                setActivePage(null)
            } else if (activeSettingsPage !== null && activePage !== activeSettingsPage) {
                // Navigating to a different page (shouldn't normally happen from Header)
                const newIndex = PAGE_ORDER.indexOf(activeSettingsPage)
                const currentIndex = activePage !== null ? PAGE_ORDER.indexOf(activePage) : -1
                setAnimationDirection(newIndex > currentIndex ? 'forward' : 'backward')
                setActivePage(activeSettingsPage)
            }
        }
    }, [activeSettingsPage]) // Only depend on activeSettingsPage to detect external changes

    // Cleanup: reset active settings page when component unmounts
    useEffect(() => {
        return () => {
            setActiveSettingsPage(null)
        }
    }, [setActiveSettingsPage])

    if(!user.isAdmin) {
        window.alert("Du skal være administrator for at kunne tilgå denne side.")
        return
    }

    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API_URL}/opgavetyper/`, {
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        })
        .then(res => {
            setOpgavetyper(res.data)
            // console.log(res.data)
        })
        .catch(error => console.log(error))
    }, [refetchOpgavetyper])

    // Initial load af indstillinger
    const hasInitializedRef = useRef(false)
    
    useEffect(() => {
        if (indstillinger?.arbejdsområdeKilometerRadius != null) {
            setMaxArbejdsradius(indstillinger.arbejdsområdeKilometerRadius);
        }
        // Kun opdater firmaoplysninger fra kontekst ved initial load (første gang indstillinger er sat)
        if (indstillinger && !hasInitializedRef.current) {
            if (indstillinger.virksomhedsnavn != null) {
                setVirksomhedsnavn(indstillinger.virksomhedsnavn);
            }
            if (indstillinger.cvrNummer != null) {
                setCvrNummer(indstillinger.cvrNummer);
            }
            if (indstillinger.adresse != null) {
                setAdresse(indstillinger.adresse);
            }
            if (indstillinger.postnummer != null) {
                setPostnummer(indstillinger.postnummer);
            }
            if (indstillinger.by != null) {
                setBy(indstillinger.by);
            }
            if (indstillinger.telefonnummer != null) {
                setTelefonnummer(indstillinger.telefonnummer);
            }
            if (indstillinger.email != null) {
                setEmail(indstillinger.email);
            }
            if (indstillinger.hjemmeside != null) {
                setHjemmeside(indstillinger.hjemmeside);
            }
            if (indstillinger.handelsbetingelser != null) {
                setHandelsbetingelser(indstillinger.handelsbetingelser);
            }
            if (indstillinger.persondatapolitik != null) {
                setPersondatapolitik(indstillinger.persondatapolitik);
            }
            if (indstillinger.logo != null) {
                setLogo(indstillinger.logo);
            }
            if (indstillinger.logoSize != null) {
                setLogoSize(indstillinger.logoSize);
            }
            if (indstillinger.bookingLogo != null) {
                setBookingLogo(indstillinger.bookingLogo);
            }
            if (indstillinger.bookingFavicon != null) {
                setBookingFavicon(indstillinger.bookingFavicon);
            }
            if (indstillinger.bookingRedirectUrl != null) {
                setBookingRedirectUrl(indstillinger.bookingRedirectUrl);
            }
            hasInitializedRef.current = true
        }
    }, [indstillinger])


    const handleRadiusBlur = async () => {
        try {
            console.log("Blurred")
            await axios.patch(
                `${import.meta.env.VITE_API_URL}/indstillinger`,
                { arbejdsområdeKilometerRadius: maxArbejdsradius },
                {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    }
                }
            )
            console.log("Radius opdateret til:", maxArbejdsradius)
        } catch (err) {
            console.error("Fejl ved opdatering af radius", err)
        }
    }

    const handleAdresseBlur = async () => {
        try {
            await axios.patch(
                `${import.meta.env.VITE_API_URL}/indstillinger`,
                { 
                    adresse: adresse
                },
                {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    }
                }
            )
            console.log("Adresse opdateret")
        } catch (err) {
            console.error("Fejl ved opdatering af adresse", err)
        }
    }

    const handlePostnummerBlur = async () => {
        try {
            await axios.patch(
                `${import.meta.env.VITE_API_URL}/indstillinger`,
                { 
                    postnummer: postnummer
                },
                {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    }
                }
            )
            console.log("Postnummer opdateret")
        } catch (err) {
            console.error("Fejl ved opdatering af postnummer", err)
        }
    }

    const handleByBlur = async () => {
        try {
            await axios.patch(
                `${import.meta.env.VITE_API_URL}/indstillinger`,
                { 
                    by: by
                },
                {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    }
                }
            )
            console.log("By opdateret")
        } catch (err) {
            console.error("Fejl ved opdatering af by", err)
        }
    }

    const handleTelefonnummerBlur = async () => {
        try {
            await axios.patch(
                `${import.meta.env.VITE_API_URL}/indstillinger`,
                { 
                    telefonnummer: telefonnummer
                },
                {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    }
                }
            )
            console.log("Telefonnummer opdateret")
        } catch (err) {
            console.error("Fejl ved opdatering af telefonnummer", err)
        }
    }

    const handleEmailBlur = async () => {
        try {
            await axios.patch(
                `${import.meta.env.VITE_API_URL}/indstillinger`,
                { 
                    email: email
                },
                {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    }
                }
            )
            console.log("E-mail opdateret")
        } catch (err) {
            console.error("Fejl ved opdatering af e-mail", err)
        }
    }

    const handleHjemmesideBlur = async () => {
        try {
            await axios.patch(
                `${import.meta.env.VITE_API_URL}/indstillinger`,
                { 
                    hjemmeside: hjemmeside
                },
                {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    }
                }
            )
        } catch (err) {
            console.error("Fejl ved opdatering af hjemmeside", err)
        }
    }

    const handleLogoSizeChange = async (newSize) => {
        setLogoSize(newSize)
        try {
            await axios.patch(
                `${import.meta.env.VITE_API_URL}/indstillinger`,
                { 
                    logoSize: newSize
                },
                {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    }
                }
            )
            console.log("Logo størrelse opdateret til:", newSize)
        } catch (err) {
            console.error("Fejl ved opdatering af logo størrelse", err)
        }
    }

    const handleHandelsbetingelserBlur = async () => {
        try {
            await axios.patch(
                `${import.meta.env.VITE_API_URL}/indstillinger`,
                { 
                    handelsbetingelser: handelsbetingelser
                },
                {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    }
                }
            )
            console.log("Handelsbetingelser opdateret")
        } catch (err) {
            console.error("Fejl ved opdatering af handelsbetingelser", err)
        }
    }

    const handlePersondatapolitikBlur = async () => {
        try {
            await axios.patch(
                `${import.meta.env.VITE_API_URL}/indstillinger`,
                { 
                    persondatapolitik: persondatapolitik
                },
                {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    }
                }
            )
            console.log("Persondatapolitik opdateret")
        } catch (err) {
            console.error("Fejl ved opdatering af persondatapolitik", err)
        }
    }

    const handleBookingRedirectUrlBlur = async () => {
        try {
            await axios.patch(
                `${import.meta.env.VITE_API_URL}/indstillinger`,
                { 
                    bookingRedirectUrl: bookingRedirectUrl
                },
                {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    }
                }
            )
            console.log("Redirect ved succes opdateret")
        } catch (err) {
            console.error("Fejl ved opdatering af redirect ved succes", err)
        }
    }

    const handleCVRSelect = async (company) => {
        // Opdater alle felter baseret på valgt virksomhed
        // CVR API kan returnere forskellige felter, så vi checker flere muligheder
        const newVirksomhedsnavn = company.name || company.company || virksomhedsnavn
        // CVR API returnerer CVR-nummer som tal, så vi konverterer til string
        const newCvrNummer = company.vat ? String(company.vat) : cvrNummer
        // Adresse, postnummer og by skal opdateres separat
        const newAdresse = company.street || adresse
        const newPostnummer = company.zipcode ? String(company.zipcode) : postnummer
        const newBy = company.city || by

        console.log("CVR Select - Nye værdier:", { newVirksomhedsnavn, newCvrNummer, newAdresse, newPostnummer, newBy })

        // Opdater state først
        setVirksomhedsnavn(newVirksomhedsnavn)
        setCvrNummer(newCvrNummer)
        setAdresse(newAdresse)
        setPostnummer(newPostnummer)
        setBy(newBy)

        // Gem til database
        try {
            const payload = { 
                virksomhedsnavn: String(newVirksomhedsnavn || ""),
                cvrNummer: String(newCvrNummer || ""),
                adresse: String(newAdresse || ""),
                postnummer: String(newPostnummer || ""),
                by: String(newBy || "")
            }
            console.log("Sender til API:", payload)
            
            const response = await axios.patch(
                `${import.meta.env.VITE_API_URL}/indstillinger`,
                payload,
                {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    }
                }
            )
            console.log("Firmaoplysninger opdateret fra CVR - Response:", response.data)
        } catch (err) {
            console.error("Fejl ved opdatering af firmaoplysninger", err)
            if (err.response) {
                console.error("Response data:", err.response.data)
                console.error("Response status:", err.response.status)
            }
            alert("Kunne ikke gemme firmaoplysninger. Prøv igen.")
        }
    }

    const handleKørFakturaBetalingstjek = async () => {
        if (window.confirm("Er du sikker på, at du vil køre fakturabetalingstjek nu? Du vil modtage en notifikation med resultatet.")) {
            setKørerFakturaBetalingstjek(true);
            try {
                await axios.post(
                    `${import.meta.env.VITE_API_URL}/faktura-betalingstjek`,
                    {},
                    {
                        headers: {
                            'Authorization': `Bearer ${user.token}`
                        }
                    }
                );
                alert("Fakturabetalingstjek er startet. Du vil modtage en notifikation med resultatet når det er færdigt.");
            } catch (error) {
                console.error("Fejl ved kørsel af fakturabetalingstjek:", error);
                alert(error.response?.data?.error || "Kunne ikke køre fakturabetalingstjek. Prøv igen.");
            } finally {
                setKørerFakturaBetalingstjek(false);
            }
        }
    }

    const handleLogoUpload = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Vælg venligst et billede')
            return
        }

        setIsUploadingLogo(true)
        try {
            // Compress the image
            const compressedFile = await imageCompression(file, {
                maxSizeMB: 0.5,
                maxWidthOrHeight: 500,
                useWebWorker: true,
            })

            // Upload to Firebase Storage
            const storagePath = `logo/logo.jpg`
            const storageRef = ref(storage, storagePath)

            // Delete old logo if it exists
            if (logo) {
                try {
                    const oldImageRef = ref(storage, storagePath)
                    await deleteObject(oldImageRef)
                } catch (error) {
                    console.log('Kunne ikke slette gammelt logo:', error)
                }
            }

            // Upload new logo
            await uploadBytes(storageRef, compressedFile)
            const downloadURL = await getDownloadURL(storageRef)

            // Update indstillinger in database
            await axios.patch(
                `${import.meta.env.VITE_API_URL}/indstillinger`,
                { logo: downloadURL },
                {
                    headers: {
                        'Authorization': `Bearer ${user.token}`,
                    },
                }
            )

            setLogo(downloadURL)
            console.log('Logo opdateret')
        } catch (error) {
            console.error('Fejl ved upload af logo:', error)
            alert('Kunne ikke uploade logo. Prøv igen.')
        } finally {
            setIsUploadingLogo(false)
            // Reset file input
            e.target.value = ''
        }
    }

    const handleBookingLogoUpload = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Vælg venligst et billede')
            return
        }

        setIsUploadingBookingLogo(true)
        try {
            // Compress the image
            const compressedFile = await imageCompression(file, {
                maxSizeMB: 0.5,
                maxWidthOrHeight: 500,
                useWebWorker: true,
            })

            // Upload to Firebase Storage
            const storagePath = `booking/logo.jpg`
            const storageRef = ref(storage, storagePath)

            // Delete old logo if it exists
            if (bookingLogo) {
                try {
                    const oldImageRef = ref(storage, storagePath)
                    await deleteObject(oldImageRef)
                } catch (error) {
                    console.log('Kunne ikke slette gammelt logo:', error)
                }
            }

            // Upload new logo
            await uploadBytes(storageRef, compressedFile)
            const downloadURL = await getDownloadURL(storageRef)

            // Update indstillinger in database
            await axios.patch(
                `${import.meta.env.VITE_API_URL}/indstillinger`,
                { bookingLogo: downloadURL },
                {
                    headers: {
                        'Authorization': `Bearer ${user.token}`,
                    },
                }
            )

            setBookingLogo(downloadURL)
            console.log('Booking logo opdateret')
        } catch (error) {
            console.error('Fejl ved upload af booking logo:', error)
            alert('Kunne ikke uploade booking logo. Prøv igen.')
        } finally {
            setIsUploadingBookingLogo(false)
            // Reset file input
            e.target.value = ''
        }
    }

    const handleFaviconUpload = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Vælg venligst et billede')
            return
        }

        setIsUploadingFavicon(true)
        try {
            // Compress the image - favicon should be smaller
            const compressedFile = await imageCompression(file, {
                maxSizeMB: 0.2,
                maxWidthOrHeight: 256,
                useWebWorker: true,
            })

            // Upload to Firebase Storage
            const storagePath = `booking/favicon.ico`
            const storageRef = ref(storage, storagePath)

            // Delete old favicon if it exists
            if (bookingFavicon) {
                try {
                    const oldImageRef = ref(storage, storagePath)
                    await deleteObject(oldImageRef)
                } catch (error) {
                    console.log('Kunne ikke slette gammelt favicon:', error)
                }
            }

            // Upload new favicon
            await uploadBytes(storageRef, compressedFile)
            const downloadURL = await getDownloadURL(storageRef)

            // Update indstillinger in database
            await axios.patch(
                `${import.meta.env.VITE_API_URL}/indstillinger`,
                { bookingFavicon: downloadURL },
                {
                    headers: {
                        'Authorization': `Bearer ${user.token}`,
                    },
                }
            )

            setBookingFavicon(downloadURL)
            console.log('Favicon opdateret')
        } catch (error) {
            console.error('Fejl ved upload af favicon:', error)
            alert('Kunne ikke uploade favicon. Prøv igen.')
        } finally {
            setIsUploadingFavicon(false)
            // Reset file input
            e.target.value = ''
        }
    }

    const renderPage = () => {
        switch (activePage) {
            case 'virksomhedsoplysninger':
                return (
                    <Virksomhedsoplysninger
                        virksomhedsnavn={virksomhedsnavn}
                        setVirksomhedsnavn={setVirksomhedsnavn}
                        cvrNummer={cvrNummer}
                        setCvrNummer={setCvrNummer}
                        adresse={adresse}
                        setAdresse={setAdresse}
                        handleAdresseBlur={handleAdresseBlur}
                        postnummer={postnummer}
                        setPostnummer={setPostnummer}
                        handlePostnummerBlur={handlePostnummerBlur}
                        by={by}
                        setBy={setBy}
                        handleByBlur={handleByBlur}
                        handleCVRSelect={handleCVRSelect}
                        telefonnummer={telefonnummer}
                        setTelefonnummer={setTelefonnummer}
                        handleTelefonnummerBlur={handleTelefonnummerBlur}
                        email={email}
                        setEmail={setEmail}
                        handleEmailBlur={handleEmailBlur}
                        hjemmeside={hjemmeside}
                        setHjemmeside={setHjemmeside}
                        handleHjemmesideBlur={handleHjemmesideBlur}
                        logo={logo}
                        isUploadingLogo={isUploadingLogo}
                        handleLogoUpload={handleLogoUpload}
                        logoSize={logoSize}
                        handleLogoSizeChange={handleLogoSizeChange}
                    />
                )
            case 'links':
                return (
                    <Links
                        handelsbetingelser={handelsbetingelser}
                        setHandelsbetingelser={setHandelsbetingelser}
                        persondatapolitik={persondatapolitik}
                        setPersondatapolitik={setPersondatapolitik}
                        handleHandelsbetingelserBlur={handleHandelsbetingelserBlur}
                        handlePersondatapolitikBlur={handlePersondatapolitikBlur}
                    />
                )
            case 'arbejdspræferencer':
                return (
                    <Arbejdspræferencer
                        opgavetyper={opgavetyper}
                        indstillinger={indstillinger}
                        user={user}
                        refetchOpgavetyper={refetchOpgavetyper}
                        setRefetchOpgavetyper={setRefetchOpgavetyper}
                        maxArbejdsradius={maxArbejdsradius}
                        setMaxArbejdsradius={setMaxArbejdsradius}
                        handleRadiusBlur={handleRadiusBlur}
                    />
                )
            case 'branding':
                return (
                    <Branding
                        bookingLogo={bookingLogo}
                        bookingFavicon={bookingFavicon}
                        bookingRedirectUrl={bookingRedirectUrl}
                        isUploadingLogo={isUploadingBookingLogo}
                        isUploadingFavicon={isUploadingFavicon}
                        handleLogoUpload={handleBookingLogoUpload}
                        handleFaviconUpload={handleFaviconUpload}
                        setBookingRedirectUrl={setBookingRedirectUrl}
                        handleBookingRedirectUrlBlur={handleBookingRedirectUrlBlur}
                    />
                )
            case 'fintuning':
                return (
                    <Fintuning
                        indstillinger={indstillinger}
                        user={user}
                        visAISystemPromptModal={visAISystemPromptModal}
                        setVisAISystemPromptModal={setVisAISystemPromptModal}
                        visAITidsestimaterPromptModal={visAITidsestimaterPromptModal}
                        setVisAITidsestimaterPromptModal={setVisAITidsestimaterPromptModal}
                    />
                )
            case 'timer-tillæg':
                return <TimerTillæg />
            case 'materialer':
                return <Materialer />
            case 'pauser':
                return <Pauser />
            case 'opkrævning':
                return <Opkrævning />
            case 'arbejdssedler':
                return <Arbejdssedler />
            case 'rettigheder':
                return <Rettigheder />
            case 'informationsbokse':
                return <Informationsbokse />
            case 'beta-funktioner':
                return (
                    <BetaFunktioner
                        kørerFakturaBetalingstjek={kørerFakturaBetalingstjek}
                        handleKørFakturaBetalingstjek={handleKørFakturaBetalingstjek}
                    />
                )
            default:
                return null
        }
    }

    // Get animation variants based on device type
    const getVariants = () => {
        return isMobile ? mobileVariants : desktopVariants
    }

    return (
        <div className={Styles.pageContent}>
            {/* <h1>App-indstillinger</h1> */}
            <div className={Styles.container}>
                {!isMobile && (
                    <SettingsSidebar 
                        activePage={activePage} 
                        setActivePage={handlePageChange} 
                        isMobile={isMobile}
                    />
                )}
                <div className={Styles.contentArea}>
                    <AnimatePresence mode="wait" custom={animationDirection}>
                        {isMobile && activePage === null && (
                            <motion.div
                                key="sidebar"
                                className={Styles.animatedContent}
                                custom={animationDirection}
                                variants={getVariants()}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                transition={{ duration: 0.25, ease: 'easeInOut' }}
                            >
                                <SettingsSidebar 
                                    activePage={activePage} 
                                    setActivePage={handlePageChange} 
                                    isMobile={isMobile}
                                />
                            </motion.div>
                        )}
                        {activePage && (
                            <motion.div
                                key={activePage}
                                className={Styles.animatedContent}
                                custom={animationDirection}
                                variants={getVariants()}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                transition={{ duration: 0.25, ease: 'easeInOut' }}
                                style={{ 
                                    overflowX: 'visible',
                                    overflowY: 'visible',
                                    paddingBottom: '10px',
                                    width: '100%'
                                }}
                            >
                                {renderPage()}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}

export default AppIndstillinger
