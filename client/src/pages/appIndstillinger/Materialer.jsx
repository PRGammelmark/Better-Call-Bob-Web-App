import React, { useState, useRef, useEffect } from 'react'
import Styles from './SettingsPage.module.css'
import { Package } from 'lucide-react'
import { useAuthContext } from '../../hooks/useAuthContext'
import InterneVarerTabel from './InterneVarerTabel'

const tabs = [
    { id: 'interne-varer', label: 'Interne varer', icon: <Package size={18} /> }
]

const Materialer = () => {
    const { user } = useAuthContext()
    const [activeTab, setActiveTab] = useState('interne-varer')
    const [underlineStyle, setUnderlineStyle] = useState({ width: 0, left: 0 })
    const tabRefs = useRef([])

    useEffect(() => {
        const activeIndex = tabs.findIndex((t) => t.id === activeTab)
        const activeTabElement = tabRefs.current[activeIndex]
        if (activeTabElement) {
            setUnderlineStyle({
                width: activeTabElement.offsetWidth,
                left: activeTabElement.offsetLeft,
            })
        }
    }, [activeTab])

    const renderTabContent = () => {
        switch (activeTab) {
            case 'interne-varer':
                return (
                    <div>
                        <p style={{ marginBottom: '20px' }}>Opsæt interne varer, som dine medarbejdere skal kunne vælge når de opretter posteringer og registrerer materialer.</p>
                        <InterneVarerTabel user={user} />
                    </div>
                )
            default:
                return null
        }
    }

    return (
        <div className={Styles.settingsPage}>
            <h1>Materialer</h1>
            
            {/* Tab Navigation */}
            <div className={Styles.tabNavigationContainer}>
                <div className={Styles.tabsContainer}>
                    <div className={Styles.tabsWrapper}>
                        {tabs.map((tab, index) => (
                            <button
                                key={tab.id}
                                ref={(el) => (tabRefs.current[index] = el)}
                                onClick={() => setActiveTab(tab.id)}
                                className={`${Styles.tabButton} ${activeTab === tab.id ? Styles.active : ''}`}
                            >
                                <span className={Styles.tabIcon}>{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                        <div
                            className={Styles.tabUnderline}
                            style={{
                                width: underlineStyle.width,
                                transform: `translateX(${underlineStyle.left}px)`,
                                transition: 'width 0.2s ease, transform 0.4s ease',
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Tab Content */}
            <div className={Styles.tabContent}>
                {renderTabContent()}
            </div>
        </div>
    )
}

export default Materialer

