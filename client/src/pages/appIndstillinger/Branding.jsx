import React from 'react'
import { Image, Globe, Link } from 'lucide-react'
import SettingsButtons from '../../components/basicComponents/buttons/SettingsButtons.jsx'
import Styles from './SettingsPage.module.css'

const Branding = ({ 
    bookingLogo,
    bookingFavicon,
    bookingRedirectUrl,
    isUploadingLogo,
    isUploadingFavicon,
    handleLogoUpload,
    handleFaviconUpload,
    setBookingRedirectUrl,
    handleBookingRedirectUrlBlur
}) => {
    return (
        <div className={Styles.settingsPage}>
            <h1>Branding</h1>
            <SettingsButtons
                items={[
                    {
                        title: "Logo",
                        icon: <Image />,
                        fileUpload: true,
                        preview: bookingLogo,
                        isUploading: isUploadingLogo,
                        accept: "image/*",
                        uploadButtonText: bookingLogo ? "Skift logo" : "Upload logo",
                        onFileChange: handleLogoUpload
                    },
                    {
                        title: "Browserikon",
                        subtitle: "Dimensioner: 512x512 px.",
                        icon: <Globe />,
                        fileUpload: true,
                        preview: bookingFavicon,
                        isUploading: isUploadingFavicon,
                        accept: "image/*",
                        uploadButtonText: bookingFavicon ? "Skift ikon" : "Upload ikon",
                        onFileChange: handleFaviconUpload
                    },
                    {
                        title: "Omdirigering ved succes",
                        subtitle: "Indtast omdirigerings-URL ved succesfuld booking",
                        icon: <Link />,
                        input: true,
                        type: "text",
                        value: bookingRedirectUrl,
                        onChange: (v) => setBookingRedirectUrl(v),
                        onBlur: handleBookingRedirectUrlBlur,
                        placeholder: "https://eksempel.dk/tak"
                    }
                ]}
            />
        </div>
    )
}

export default Branding

