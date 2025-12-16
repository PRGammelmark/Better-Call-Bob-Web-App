import React from 'react'
import { Calendar, Coins } from 'lucide-react'
import SettingsButtons from '../../components/basicComponents/buttons/SettingsButtons.jsx'
import Button from '../../components/basicComponents/buttons/Button.jsx'
import { useNavigate } from 'react-router-dom'
import Styles from './SettingsPage.module.css'

const BetaFunktioner = ({ 
    kørerFakturaBetalingstjek,
    handleKørFakturaBetalingstjek
}) => {
    const navigate = useNavigate()

    return (
        <div className={Styles.settingsPage}>
            <h1>Beta-funktioner</h1>
            <SettingsButtons
                items={[
                    {
                        title: "Gå til test-kalender (beta)",
                        icon: <Calendar />,
                        onClick: () => navigate('/kalender')
                    },
                    {
                        title: "Kør fakturabetalingstjek",
                        icon: <Coins />,
                        onClick: handleKørFakturaBetalingstjek,
                        value: kørerFakturaBetalingstjek ? 'Kører...' : undefined
                    }
                ]}
            />
        </div>
    )
}

export default BetaFunktioner

