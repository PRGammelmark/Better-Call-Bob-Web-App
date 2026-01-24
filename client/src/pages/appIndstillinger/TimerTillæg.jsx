import React, { useState, useRef, useEffect } from 'react'
import Styles from './SettingsPage.module.css'
import { Clock, PlusCircle, Percent } from 'lucide-react'
import axios from 'axios'
import { useAuthContext } from '../../hooks/useAuthContext'
import { useIndstillinger } from '../../context/IndstillingerContext'
import SettingsButtons from '../../components/basicComponents/buttons/SettingsButtons'
import TimetyperTabel from './TimetyperTabel'
import FasteTillaegTabel from './FasteTillaegTabel'
import ProcentTillaegTabel from './ProcentTillaegTabel'

const tabs = [
    { id: 'timer', label: 'Timer', icon: <Clock size={18} /> },
    { id: 'tillæg', label: 'Tillæg', icon: <PlusCircle size={18} /> },
    { id: 'rabat', label: 'Rabat', icon: <Percent size={18} /> }
]

const TimerTillæg = () => {
    const { user } = useAuthContext()
    const { indstillinger } = useIndstillinger()
    const [activeTab, setActiveTab] = useState('timer')
    const [underlineStyle, setUnderlineStyle] = useState({ width: 0, left: 0 })
    const tabRefs = useRef([])
    
    // Rabat indstillinger state
    const [medarbejdereKanGiveRabat, setMedarbejdereKanGiveRabat] = useState(
        indstillinger?.medarbejdereKanGiveRabat ?? false
    )
    const [maksRabatSats, setMaksRabatSats] = useState(
        indstillinger?.maksRabatSats ?? 0
    )
    const [modregnKunderabatIMedarbejderlon, setModregnKunderabatIMedarbejderlon] = useState(
        indstillinger?.modregnKunderabatIMedarbejderlon ?? false
    )
    const [modregningsmetode, setModregningsmetode] = useState(
        indstillinger?.modregningsmetode ?? "Match beløb"
    )
    
    
    // Sync state with indstillinger when they update
    useEffect(() => {
        if (indstillinger) {
            if (indstillinger.medarbejdereKanGiveRabat !== undefined) {
                setMedarbejdereKanGiveRabat(indstillinger.medarbejdereKanGiveRabat)
            }
            if (indstillinger.maksRabatSats !== undefined) {
                setMaksRabatSats(indstillinger.maksRabatSats)
            }
            if (indstillinger.modregnKunderabatIMedarbejderlon !== undefined) {
                setModregnKunderabatIMedarbejderlon(indstillinger.modregnKunderabatIMedarbejderlon)
            }
            if (indstillinger.modregningsmetode !== undefined) {
                setModregningsmetode(indstillinger.modregningsmetode)
            }
        }
    }, [indstillinger])

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
            case 'timer':
                return (
                    <div>
                        <p style={{ marginBottom: '20px' }}>Opsæt timetyper, som dine medarbejdere skal kunne vælge når de opretter posteringer og registrerer deres arbejde.</p>
                        <TimetyperTabel user={user} />
                    </div>
                )
            case 'tillæg':
                return (
                    <div>
                        <p style={{ marginBottom: '20px' }}>Opsæt faste tillæg og procenttillæg, som dine medarbejdere skal kunne vælge når de opretter posteringer og registrerer deres arbejde.</p>
                        
                        <div style={{ marginBottom: '40px' }}>
                            <h3 style={{ marginBottom: '15px', fontSize: '18px', fontWeight: '600', color: '#212529' }}>Faste tillæg</h3>
                            <FasteTillaegTabel user={user} />
                        </div>

                        <div>
                            <h3 style={{ marginBottom: '15px', fontSize: '18px', fontWeight: '600', color: '#212529' }}>Procenttillæg</h3>
                            <ProcentTillaegTabel user={user} />
                        </div>
                    </div>
                )
            case 'rabat':
                return (
                    <div>
                        <p style={{ marginBottom: '20px' }}>Hvis dine medarbejdere selvstændigt skal kunne give kunder rabat, så kan du indstille deres muligheder for dette her.</p>
                        <SettingsButtons
                            items={[
                                {
                                    title: "Medarbejdere kan give rabat",
                                    switch: true,
                                    checked: medarbejdereKanGiveRabat,
                                    onChange: async (checked) => {
                                        setMedarbejdereKanGiveRabat(checked)
                                        try {
                                            await axios.patch(
                                                `${import.meta.env.VITE_API_URL}/indstillinger`,
                                                { medarbejdereKanGiveRabat: checked },
                                                {
                                                    headers: {
                                                        'Authorization': `Bearer ${user.token}`
                                                    }
                                                }
                                            )
                                        } catch (err) {
                                            console.error("Fejl ved opdatering af medarbejdereKanGiveRabat", err)
                                        }
                                    }
                                },
                                ...(medarbejdereKanGiveRabat ? [
                                    {
                                        title: "Maks rabat-sats",
                                        subtitle: "Rabatten kan gives på timer og tillæg, ikke materialer",
                                        input: true,
                                        type: "number",
                                        min: 0,
                                        max: 100,
                                        value: maksRabatSats,
                                        postfix: "%",
                                        onChange: (v) => setMaksRabatSats(v),
                                        onBlur: async () => {
                                            try {
                                                await axios.patch(
                                                    `${import.meta.env.VITE_API_URL}/indstillinger`,
                                                    { maksRabatSats: maksRabatSats || 0 },
                                                    {
                                                        headers: {
                                                            'Authorization': `Bearer ${user.token}`
                                                        }
                                                    }
                                                )
                                            } catch (err) {
                                                console.error("Fejl ved opdatering af maksRabatSats", err)
                                            }
                                        }
                                    },
                                    {
                                        title: "Modregn kunderabat i medarbejderløn",
                                        switch: true,
                                        checked: modregnKunderabatIMedarbejderlon,
                                        onChange: async (checked) => {
                                            setModregnKunderabatIMedarbejderlon(checked)
                                            // Hvis switcheren aktiveres, sæt modregningsmetode til "Match beløb"
                                            if (checked) {
                                                setModregningsmetode("Match beløb")
                                                try {
                                                    await axios.patch(
                                                        `${import.meta.env.VITE_API_URL}/indstillinger`,
                                                        { 
                                                            modregnKunderabatIMedarbejderlon: checked,
                                                            modregningsmetode: "Match beløb"
                                                        },
                                                        {
                                                            headers: {
                                                                'Authorization': `Bearer ${user.token}`
                                                            }
                                                        }
                                                    )
                                                } catch (err) {
                                                    console.error("Fejl ved opdatering af modregnKunderabatIMedarbejderlon", err)
                                                }
                                            } else {
                                                try {
                                                    await axios.patch(
                                                        `${import.meta.env.VITE_API_URL}/indstillinger`,
                                                        { modregnKunderabatIMedarbejderlon: checked },
                                                        {
                                                            headers: {
                                                                'Authorization': `Bearer ${user.token}`
                                                            }
                                                        }
                                                    )
                                                } catch (err) {
                                                    console.error("Fejl ved opdatering af modregnKunderabatIMedarbejderlon", err)
                                                }
                                            }
                                        }
                                    },
                                    ...(modregnKunderabatIMedarbejderlon ? [
                                        {
                                            title: "Modregningsmetode",
                                            input: true,
                                            type: "select",
                                            value: modregningsmetode,
                                            options: [
                                                { value: "Match beløb", label: "Match beløb" },
                                                { value: "Match procentdel", label: "Match procentdel" }
                                            ],
                                            onChange: async (value) => {
                                                setModregningsmetode(value)
                                                try {
                                                    await axios.patch(
                                                        `${import.meta.env.VITE_API_URL}/indstillinger`,
                                                        { modregningsmetode: value },
                                                        {
                                                            headers: {
                                                                'Authorization': `Bearer ${user.token}`
                                                            }
                                                        }
                                                    )
                                                } catch (err) {
                                                    console.error("Fejl ved opdatering af modregningsmetode", err)
                                                }
                                            }
                                        }
                                    ] : [])
                                ] : [])
                            ]}
                        />
                    </div>
                )
            default:
                return null
        }
    }

    return (
        <div className={Styles.settingsPage}>
            <h1>Timer & tillæg</h1>
            
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

export default TimerTillæg

