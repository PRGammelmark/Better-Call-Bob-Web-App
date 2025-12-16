import React from 'react'
import { Link } from 'lucide-react'
import SettingsButtons from '../../components/basicComponents/buttons/SettingsButtons.jsx'
import Styles from './SettingsPage.module.css'

const Links = ({ 
    handelsbetingelser, 
    setHandelsbetingelser, 
    persondatapolitik, 
    setPersondatapolitik,
    handleHandelsbetingelserBlur,
    handlePersondatapolitikBlur
}) => {
    return (
        <div className={Styles.settingsPage}>
            <h1>Links</h1>
            <SettingsButtons
                items={[
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
                    }
                ]}
            />
        </div>
    )
}

export default Links

