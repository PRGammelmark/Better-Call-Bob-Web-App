import React from 'react'
import { Building, Hash, MapPin, Image, Maximize2, Phone, Mail, Globe, Mailbox } from 'lucide-react'
import SettingsButtons from '../../components/basicComponents/buttons/SettingsButtons.jsx'
import CVRAutocomplete from '../../components/basicComponents/inputs/CVRAutocomplete.jsx'
import Styles from './SettingsPage.module.css'

const Virksomhedsoplysninger = ({ 
    virksomhedsnavn, 
    setVirksomhedsnavn, 
    cvrNummer, 
    setCvrNummer, 
    adresse, 
    setAdresse,
    handleAdresseBlur,
    postnummer,
    setPostnummer,
    handlePostnummerBlur,
    by,
    setBy,
    handleByBlur,
    handleCVRSelect,
    telefonnummer,
    setTelefonnummer,
    handleTelefonnummerBlur,
    email,
    setEmail,
    handleEmailBlur,
    hjemmeside,
    setHjemmeside,
    handleHjemmesideBlur,
    logo,
    isUploadingLogo,
    handleLogoUpload,
    logoSize,
    handleLogoSizeChange
}) => {
    return (
        <div className={Styles.settingsPage}>
            <h1>Virksomhedsoplysninger</h1>
            
            {/* Virksomhed sektion */}
            <h2 className={Styles.sectionHeading}>Virksomhed</h2>
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
            </div>
            <div className={Styles.settingsButtonsWrapper}>
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
                        },
                        {
                            title: "Postnummer",
                            icon: <Mailbox />,
                            input: true,
                            type: "text",
                            value: postnummer,
                            onChange: (v) => setPostnummer(v),
                            onBlur: handlePostnummerBlur,
                            placeholder: "Indtast postnummer"
                        },
                        {
                            title: "By",
                            icon: <MapPin />,
                            input: true,
                            type: "text",
                            value: by,
                            onChange: (v) => setBy(v),
                            onBlur: handleByBlur,
                            placeholder: "Indtast by"
                        }
                    ]}
                />
            </div>

            {/* Kontakt sektion */}
            <h2 className={Styles.sectionHeading}>Kontakt</h2>
            <div className={Styles.settingsButtonsWrapper}>
                <SettingsButtons
                    items={[
                        {
                            title: "Telefonnummer",
                            icon: <Phone />,
                            input: true,
                            type: "text",
                            value: telefonnummer,
                            onChange: (v) => setTelefonnummer(v),
                            onBlur: handleTelefonnummerBlur,
                            placeholder: "Indtast telefonnummer"
                        },
                        {
                            title: "E-mail",
                            icon: <Mail />,
                            input: true,
                            type: "email",
                            value: email,
                            onChange: (v) => setEmail(v),
                            onBlur: handleEmailBlur,
                            placeholder: "Indtast e-mail"
                        },
                        {
                            title: "Hjemmeside",
                            icon: <Globe />,
                            input: true,
                            type: "text",
                            value: hjemmeside,
                            onChange: (v) => setHjemmeside(v),
                            onBlur: handleHjemmesideBlur,
                            placeholder: "Indtast hjemmeside URL"
                        }
                    ]}
                />
            </div>

            {/* Udseende sektion */}
            <h2 className={Styles.sectionHeading}>Udseende</h2>
            <div className={Styles.settingsButtonsWrapper}>
                <SettingsButtons
                    items={[
                        {
                            title: "Logo",
                            icon: <Image />,
                            fileUpload: true,
                            preview: logo,
                            isUploading: isUploadingLogo,
                            accept: "image/*",
                            uploadButtonText: logo ? "Skift logo" : "Upload logo",
                            onFileChange: handleLogoUpload
                        },
                        {
                            title: "Logo størrelse",
                            icon: <Maximize2 />,
                            input: true,
                            type: "select",
                            value: logoSize,
                            onChange: handleLogoSizeChange,
                            options: [
                                { value: 50, label: "50%" },
                                { value: 60, label: "60%" },
                                { value: 70, label: "70%" },
                                { value: 80, label: "80%" },
                                { value: 90, label: "90%" },
                                { value: 100, label: "100%" }
                            ]
                        }
                    ]}
                />
            </div>
        </div>
    )
}

export default Virksomhedsoplysninger

