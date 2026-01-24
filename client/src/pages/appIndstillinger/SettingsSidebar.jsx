import React from 'react'
import SettingsButtons from '../../components/basicComponents/buttons/SettingsButtons.jsx'
import { Settings, Coins, Users, Calendar, ClipboardList } from 'lucide-react'
import Styles from './SettingsSidebar.module.css'

const SettingsSidebar = ({ activePage, setActivePage, isMobile }) => {
    const categories = [
        {
            name: "Generelt",
            icon: <Settings size={18} />,
            items: [
                { id: 'virksomhedsoplysninger', label: 'Virksomhedsoplysninger' },
                { id: 'links', label: 'Links' },
                { id: 'beta-funktioner', label: 'Beta-funktioner' }
            ]
        },
        {
            name: "Ressourcer",
            icon: <Coins size={18} />,
            items: [
                { id: 'timer-tillæg', label: 'Timer & tillæg' },
                { id: 'materialer', label: 'Materialer' },
                { id: 'pauser', label: 'Pauser' }
            ]
        },
        {
            name: "Registrering",
            icon: <ClipboardList size={18} />,
            items: [
                { id: 'opkrævning', label: 'Opkrævning' },
                { id: 'arbejdssedler', label: 'Arbejdssedler' }
            ]
        },
        {
            name: "Medarbejdere",
            icon: <Users size={18} />,
            items: [
                { id: 'rettigheder', label: 'Rettigheder' },
                { id: 'arbejdspræferencer', label: 'Arbejdspræferencer' }
            ]
        },
        {
            name: "Booking",
            icon: <Calendar size={18} />,
            items: [
                { id: 'branding', label: 'Branding' },
                { id: 'fintuning', label: 'Fintuning' },
                { id: 'informationsbokse', label: 'Informationsbokse' }
            ]
        }
    ]

    if (isMobile) {
        return (
            <div className={Styles.sidebarMobile}>
                <h1 className={Styles.mainHeading}>Systemindstillinger</h1>
                {categories.map((category, catIdx) => (
                    <div key={catIdx} className={Styles.categorySection}>
                        <h2 className={Styles.categoryHeading}>
                            <span className={Styles.categoryIcon}>{category.icon}</span>
                            {category.name}
                        </h2>
                        <SettingsButtons
                            items={category.items.map(item => ({
                                title: item.label,
                                onClick: () => setActivePage(item.id)
                            }))}
                        />
                    </div>
                ))}
            </div>
        )
    }

    return (
        <div className={Styles.sidebar}>
            <h1 className={Styles.mainHeading}>Systemindstillinger</h1>
            {categories.map((category, catIdx) => (
                <div key={catIdx} className={Styles.categorySection}>
                    <h3 className={Styles.categoryHeading}>
                        <span className={Styles.categoryIcon}>{category.icon}</span>
                        {category.name}
                    </h3>
                    <div className={Styles.categoryButtons}>
                        {category.items.map(item => (
                            <button
                                key={item.id}
                                className={`${Styles.sidebarButton} ${activePage === item.id ? Styles.active : ''}`}
                                onClick={() => setActivePage(item.id)}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    )
}

export default SettingsSidebar

