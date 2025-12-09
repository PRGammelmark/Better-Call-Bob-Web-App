import React, { useState, useEffect, useRef } from 'react'
import Styles from './AppIndstillinger.module.css'
import { Info, Hammer, Box, Radius, Coins, Calendar, Download, Building, Hash, MapPin, Link, Brain, Image, Clock, MessageCircleQuestion } from 'lucide-react'
import axios from 'axios'
import { useAuthContext } from '../hooks/useAuthContext.js'
import { useIndstillinger } from '../context/IndstillingerContext.jsx'
import SeOpgavetyperModal from '../components/modals/SeOpgavetyperModal.jsx'
import AISystemPromptModal from '../components/modals/AISystemPromptModal.jsx'
import AITidsestimaterPromptModal from '../components/modals/AITidsestimaterPromptModal.jsx'
import ImportOpgavetyperModal from '../components/modals/ImportOpgavetyperModal.jsx'
import SettingsButtons from '../components/basicComponents/buttons/SettingsButtons.jsx'
import Button from '../components/basicComponents/buttons/Button.jsx'
import CVRAutocomplete from '../components/basicComponents/inputs/CVRAutocomplete.jsx'
import { useNavigate } from 'react-router-dom'
import { storage } from '../firebase.js'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import imageCompression from 'browser-image-compression'

const AppIndstillinger = () => {

    const navigate = useNavigate();
    const { user } = useAuthContext();
    const { indstillinger } = useIndstillinger();

    const [visOpgavetyperInfo, setVisOpgavetyperInfo] = useState(false);
    const [visOpgavetyperModal, setVisOpgavetyperModal] = useState(false)
    const [visAISystemPromptModal, setVisAISystemPromptModal] = useState(false)
    const [visAITidsestimaterPromptModal, setVisAITidsestimaterPromptModal] = useState(false)
    const [visImportOpgavetyperModal, setVisImportOpgavetyperModal] = useState(false)
    const [opgavetyper, setOpgavetyper] = useState([])
    const [refetchOpgavetyper, setRefetchOpgavetyper] = useState(false)
    const [maxArbejdsradius, setMaxArbejdsradius] = useState( indstillinger?.arbejdsområdeKilometerRadius )
    const [kørerFakturaBetalingstjek, setKørerFakturaBetalingstjek] = useState(false)
    const [virksomhedsnavn, setVirksomhedsnavn] = useState(indstillinger?.virksomhedsnavn || "")
    const [cvrNummer, setCvrNummer] = useState(indstillinger?.cvrNummer || "")
    const [adresse, setAdresse] = useState(indstillinger?.adresse || "")
    const [handelsbetingelser, setHandelsbetingelser] = useState(indstillinger?.handelsbetingelser || "")
    const [persondatapolitik, setPersondatapolitik] = useState(indstillinger?.persondatapolitik || "")
    const [bookingLogo, setBookingLogo] = useState(indstillinger?.bookingLogo || "")
    const [isUploadingLogo, setIsUploadingLogo] = useState(false)

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
            console.log(res.data)
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
            if (indstillinger.handelsbetingelser != null) {
                setHandelsbetingelser(indstillinger.handelsbetingelser);
            }
            if (indstillinger.persondatapolitik != null) {
                setPersondatapolitik(indstillinger.persondatapolitik);
            }
            if (indstillinger.bookingLogo != null) {
                setBookingLogo(indstillinger.bookingLogo);
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

    const handleCVRSelect = async (company) => {
        // Opdater alle felter baseret på valgt virksomhed
        // CVR API kan returnere forskellige felter, så vi checker flere muligheder
        const newVirksomhedsnavn = company.name || company.company || virksomhedsnavn
        // CVR API returnerer CVR-nummer som tal, så vi konverterer til string
        const newCvrNummer = company.vat ? String(company.vat) : cvrNummer
        // Adresse kan være i forskellige formater fra CVR API
        const addressParts = [
            company.street,
            company.zipcode,
            company.city
        ].filter(Boolean)
        const newAdresse = addressParts.length > 0 
            ? addressParts.join(', ') 
            : (company.address || adresse)

        console.log("CVR Select - Nye værdier:", { newVirksomhedsnavn, newCvrNummer, newAdresse })

        // Opdater state først
        setVirksomhedsnavn(newVirksomhedsnavn)
        setCvrNummer(newCvrNummer)
        setAdresse(newAdresse)

        // Gem til database
        try {
            const payload = { 
                virksomhedsnavn: String(newVirksomhedsnavn || ""),
                cvrNummer: String(newCvrNummer || ""),
                adresse: String(newAdresse || "")
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

  return (
    <div className={Styles.pageContent}>
        <h1>App-indstillinger</h1>
        <div className={Styles.indstillingerContainer}>
        <h2>Firmaoplysninger</h2>
        <div className={Styles.settingsButtonsWrapper}>
            <CVRAutocomplete
                title="Virksomhedsnavn"
                icon={<Building />}
                value={virksomhedsnavn}
                onChange={(v) => setVirksomhedsnavn(v)}
                onSelect={handleCVRSelect}
                placeholder="Indtast virksomhedsnavn"
                searchType="name"
            />
            <CVRAutocomplete
                title="CVR-nummer"
                icon={<Hash />}
                value={cvrNummer}
                onChange={(v) => setCvrNummer(v)}
                onSelect={handleCVRSelect}
                placeholder="Indtast CVR-nummer"
                searchType="vat"
            />
            <SettingsButtons
                items={[
                    {
                        title: "Adresse",
                        icon: <MapPin />,
                        input: true,
                        type: "text",
                        value: adresse,
                        onChange: (v) => setAdresse(v),
                        onBlur: handleAdresseBlur,
                        placeholder: "Indtast adresse"
                    }
                ]}
            />
        </div>
        </div>

        <div className={Styles.indstillingerContainer}>
        <h2>Arbejdspræferencer <Info className={`${Styles.infoIcon} ${visOpgavetyperInfo ? Styles.active : ""}`} onClick={() => setVisOpgavetyperInfo(!visOpgavetyperInfo)}/></h2>
        <p className={`${Styles.infoText} ${visOpgavetyperInfo ? Styles.visible : ""}`}>Herunder kan du bl.a. indstille hvilke opgavetyper, I arbejder med i jeres virksomhed. Du kan også definere maks. radius i dine medarbejderes områdeindstillinger.</p>
        <SettingsButtons
            items={[
                {
                    title: "Opgavetyper",
                    icon: <Hammer />,
                    onClick: () => setVisOpgavetyperModal(true),
                    value: `${opgavetyper?.length || 0} typer, ${indstillinger?.opgavetyperKategorier?.length || 0} kategorier`,
                },
                {
                    title: "Importer opgavetyper",
                    icon: <Download />,
                    onClick: () => setVisImportOpgavetyperModal(true),
                    // value: "Standard-opgavetyper",
                },
                {
                    title: "Max. arbejdsradius",
                    icon: <Radius />,
                    input: true,
                    type: "number",
                    min: 0,
                    max: 200,
                    value: maxArbejdsradius,
                    postfix: "km.",
                    onChange: (v) => setMaxArbejdsradius(v),
                    onBlur: handleRadiusBlur
                }
            ]}
        />
        </div>

        <div className={Styles.indstillingerContainer}>
            <h2>Booking <Info className={`${Styles.infoIcon}`} /></h2>
            <p className={Styles.infoText}>Administrer indstillinger til bookingsystemet. Tilpas AI'en, der genererer opfølgende spørgsmål baseret på opgavebeskrivelser.</p>
            <SettingsButtons
                items={[
                    {
                        title: "Opfølgende spørgsmål",
                        icon: <MessageCircleQuestion />,
                        onClick: () => setVisAISystemPromptModal(true),
                        value: indstillinger?.aiExtraRules ? "Tilpasset" : "Standard",
                    },
                    {
                        title: "Tidsestimater",
                        icon: <Clock />,
                        onClick: () => setVisAITidsestimaterPromptModal(true),
                        value: indstillinger?.aiTidsestimaterPrompt ? "Tilpasset" : "Standard",
                    },
                    {
                        title: "Handelsbetingelser",
                        icon: <Link />,
                        input: true,
                        type: "text",
                        value: handelsbetingelser,
                        onChange: (v) => setHandelsbetingelser(v),
                        onBlur: handleHandelsbetingelserBlur,
                        placeholder: "Indsæt link"
                    },
                    {
                        title: "Persondatapolitik",
                        icon: <Link />,
                        input: true,
                        type: "text",
                        value: persondatapolitik,
                        onChange: (v) => setPersondatapolitik(v),
                        onBlur: handlePersondatapolitikBlur,
                        placeholder: "Indsæt link"
                    },
                    {
                        title: "Logo",
                        icon: <Image />,
                        fileUpload: true,
                        preview: bookingLogo,
                        isUploading: isUploadingLogo,
                        accept: "image/*",
                        uploadButtonText: bookingLogo ? "Skift logo" : "Upload logo",
                        onFileChange: handleLogoUpload
                    }
                ]}
            />
        </div>

        <SeOpgavetyperModal trigger={visOpgavetyperModal} setTrigger={setVisOpgavetyperModal} opgavetyper={opgavetyper} user={user} refetchOpgavetyper={refetchOpgavetyper} setRefetchOpgavetyper={setRefetchOpgavetyper} kategorier={indstillinger?.opgavetyperKategorier}/>
        <ImportOpgavetyperModal trigger={visImportOpgavetyperModal} setTrigger={setVisImportOpgavetyperModal} user={user} kategorier={indstillinger?.opgavetyperKategorier || []} refetchOpgavetyper={refetchOpgavetyper} setRefetchOpgavetyper={setRefetchOpgavetyper} />
        <AISystemPromptModal trigger={visAISystemPromptModal} setTrigger={setVisAISystemPromptModal} user={user} indstillinger={indstillinger} />
        <AITidsestimaterPromptModal trigger={visAITidsestimaterPromptModal} setTrigger={setVisAITidsestimaterPromptModal} user={user} indstillinger={indstillinger} />
    
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <Button onClick={() => navigate('/kalender')}>Gå til test-kalender (beta)</Button>
            <Button 
                onClick={handleKørFakturaBetalingstjek} 
                disabled={kørerFakturaBetalingstjek}
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
                <Coins style={{ width: 16, height: 16 }} />
                {kørerFakturaBetalingstjek ? 'Kører...' : 'Kør fakturabetalingstjek'}
            </Button>
        </div>
    </div>
  )
}

export default AppIndstillinger
