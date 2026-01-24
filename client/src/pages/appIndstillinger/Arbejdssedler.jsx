import React, { useState, useRef, useEffect } from 'react'
import Styles from './SettingsPage.module.css'
import { Lock, Percent, Plus, Trash2, Coins } from 'lucide-react'
import axios from 'axios'
import { useAuthContext } from '../../hooks/useAuthContext'
import { useIndstillinger } from '../../context/IndstillingerContext'
import SettingsButtons from '../../components/basicComponents/buttons/SettingsButtons'

const tabs = [
    { id: 'lås', label: 'Lås registreringer', icon: <Lock size={18} /> },
    { id: 'moms', label: 'Moms', icon: <Percent size={18} /> },
    { id: 'honorar', label: 'Honorar', icon: <Coins size={18} /> }
]

const Arbejdssedler = () => {
    const { user } = useAuthContext()
    const { indstillinger } = useIndstillinger()
    const [activeTab, setActiveTab] = useState('lås')
    const [underlineStyle, setUnderlineStyle] = useState({ width: 0, left: 0 })
    const tabRefs = useRef([])
    
    // Lås registreringer indstillinger state
    const [laasPosteringerEfterAntalDage, setLaasPosteringerEfterAntalDage] = useState(
        indstillinger?.laasPosteringerEfterAntalDage ?? false
    )
    const [laasPosteringerEfterAntalDageVærdi, setLaasPosteringerEfterAntalDageVærdi] = useState(
        indstillinger?.laasPosteringerEfterAntalDageVærdi ?? 1
    )
    const [laasPosteringerAutomatisk, setLaasPosteringerAutomatisk] = useState(
        indstillinger?.laasPosteringerAutomatisk ?? false
    )
    const [laasPosteringerAutomatiskType, setLaasPosteringerAutomatiskType] = useState(
        indstillinger?.laasPosteringerAutomatiskType ?? "ugedag"
    )
    const [laasPosteringerAutomatiskUgedag, setLaasPosteringerAutomatiskUgedag] = useState(
        indstillinger?.laasPosteringerAutomatiskUgedag ?? 1
    )
    const [laasPosteringerAutomatiskMånedsdag, setLaasPosteringerAutomatiskMånedsdag] = useState(
        indstillinger?.laasPosteringerAutomatiskMånedsdag ?? 1
    )
    
    // Moms indstillinger state
    const [tilgængeligeMomssatser, setTilgængeligeMomssatser] = useState(
        indstillinger?.tilgængeligeMomssatser ?? [
            { land: 'DK', sats: 25, navn: 'Danmark (25%)' },
            { land: 'DK', sats: 0, navn: 'Momsfri (0%)' }
        ]
    )
    const [standardMomssats, setStandardMomssats] = useState(
        indstillinger?.standardMomssats ?? { land: 'DK', sats: 25 }
    )
    const [nyMomssatsLand, setNyMomssatsLand] = useState('DK')
    const [nyMomssatsSats, setNyMomssatsSats] = useState('')
    const [nyMomssatsNavn, setNyMomssatsNavn] = useState('')
    
    // Honorar indstillinger state
    const [timelønViaArbejdssedler, setTimelønViaArbejdssedler] = useState(
        indstillinger?.timelønViaArbejdssedler ?? false
    )
    
    // Sync state with indstillinger when they update
    useEffect(() => {
        if (indstillinger) {
            if (indstillinger.laasPosteringerEfterAntalDage !== undefined) {
                setLaasPosteringerEfterAntalDage(indstillinger.laasPosteringerEfterAntalDage)
            }
            if (indstillinger.laasPosteringerEfterAntalDageVærdi !== undefined) {
                setLaasPosteringerEfterAntalDageVærdi(indstillinger.laasPosteringerEfterAntalDageVærdi)
            }
            if (indstillinger.laasPosteringerAutomatisk !== undefined) {
                setLaasPosteringerAutomatisk(indstillinger.laasPosteringerAutomatisk)
            }
            if (indstillinger.laasPosteringerAutomatiskType !== undefined) {
                setLaasPosteringerAutomatiskType(indstillinger.laasPosteringerAutomatiskType)
            }
            if (indstillinger.laasPosteringerAutomatiskUgedag !== undefined) {
                setLaasPosteringerAutomatiskUgedag(indstillinger.laasPosteringerAutomatiskUgedag)
            }
            if (indstillinger.laasPosteringerAutomatiskMånedsdag !== undefined) {
                setLaasPosteringerAutomatiskMånedsdag(indstillinger.laasPosteringerAutomatiskMånedsdag)
            }
            if (indstillinger.tilgængeligeMomssatser !== undefined) {
                setTilgængeligeMomssatser(indstillinger.tilgængeligeMomssatser)
            }
            if (indstillinger.standardMomssats !== undefined) {
                setStandardMomssats(indstillinger.standardMomssats)
            }
            if (indstillinger.timelønViaArbejdssedler !== undefined) {
                setTimelønViaArbejdssedler(indstillinger.timelønViaArbejdssedler)
            }
        }
    }, [indstillinger])

    // Tilføj ny momssats
    const tilføjMomssats = async () => {
        if (!nyMomssatsSats || isNaN(Number(nyMomssatsSats))) {
            alert('Angiv en gyldig momssats')
            return
        }
        
        const nyMomssats = {
            land: nyMomssatsLand || 'DK',
            sats: Number(nyMomssatsSats),
            navn: nyMomssatsNavn || `${nyMomssatsLand || 'DK'} (${nyMomssatsSats}%)`
        }
        
        const opdateretListe = [...tilgængeligeMomssatser, nyMomssats]
        setTilgængeligeMomssatser(opdateretListe)
        
        // Nulstil inputfelter
        setNyMomssatsLand('DK')
        setNyMomssatsSats('')
        setNyMomssatsNavn('')
        
        try {
            await axios.patch(
                `${import.meta.env.VITE_API_URL}/indstillinger`,
                { tilgængeligeMomssatser: opdateretListe },
                {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    }
                }
            )
        } catch (err) {
            console.error("Fejl ved tilføjelse af momssats", err)
        }
    }

    // Fjern momssats
    const fjernMomssats = async (index) => {
        const opdateretListe = tilgængeligeMomssatser.filter((_, i) => i !== index)
        setTilgængeligeMomssatser(opdateretListe)
        
        try {
            await axios.patch(
                `${import.meta.env.VITE_API_URL}/indstillinger`,
                { tilgængeligeMomssatser: opdateretListe },
                {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    }
                }
            )
        } catch (err) {
            console.error("Fejl ved fjernelse af momssats", err)
        }
    }

    // Opdater standard momssats
    const opdaterStandardMomssats = async (land, sats) => {
        const nyStandard = { land, sats: Number(sats) }
        setStandardMomssats(nyStandard)
        
        try {
            await axios.patch(
                `${import.meta.env.VITE_API_URL}/indstillinger`,
                { standardMomssats: nyStandard },
                {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    }
                }
            )
        } catch (err) {
            console.error("Fejl ved opdatering af standard momssats", err)
        }
    }

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
            case 'lås':
                return (
                    <div>
                        <p style={{ marginBottom: '20px' }}>Her kan du indstille hvornår registreringer af timer i posteringer automatisk skal låses, så du kan arbejde med tallene for perioden uden forstyrrelser.</p>
                        <SettingsButtons
                            items={[
                                {
                                    title: "Lås posteringer efter antal dage",
                                    switch: true,
                                    checked: laasPosteringerEfterAntalDage,
                                    onChange: async (checked) => {
                                        setLaasPosteringerEfterAntalDage(checked)
                                        try {
                                            await axios.patch(
                                                `${import.meta.env.VITE_API_URL}/indstillinger`,
                                                { laasPosteringerEfterAntalDage: checked },
                                                {
                                                    headers: {
                                                        'Authorization': `Bearer ${user.token}`
                                                    }
                                                }
                                            )
                                        } catch (err) {
                                            console.error("Fejl ved opdatering af laasPosteringerEfterAntalDage", err)
                                        }
                                    }
                                },
                                ...(laasPosteringerEfterAntalDage ? [
                                    {
                                        title: "Lås efter",
                                        input: true,
                                        type: "select",
                                        value: laasPosteringerEfterAntalDageVærdi,
                                        options: [
                                            { value: 1, label: "1 dag" },
                                            { value: 2, label: "2 dage" },
                                            { value: 3, label: "3 dage" },
                                            { value: 4, label: "4 dage" },
                                            { value: 5, label: "5 dage" },
                                            { value: 6, label: "6 dage" },
                                            { value: 7, label: "7 dage" }
                                        ],
                                        onChange: async (value) => {
                                            setLaasPosteringerEfterAntalDageVærdi(Number(value))
                                            try {
                                                await axios.patch(
                                                    `${import.meta.env.VITE_API_URL}/indstillinger`,
                                                    { laasPosteringerEfterAntalDageVærdi: Number(value) },
                                                    {
                                                        headers: {
                                                            'Authorization': `Bearer ${user.token}`
                                                        }
                                                    }
                                                )
                                            } catch (err) {
                                                console.error("Fejl ved opdatering af laasPosteringerEfterAntalDageVærdi", err)
                                            }
                                        }
                                    }
                                ] : []),
                                {
                                    title: "Lås posteringer på faste tidspunkter",
                                    switch: true,
                                    checked: laasPosteringerAutomatisk,
                                    onChange: async (checked) => {
                                        setLaasPosteringerAutomatisk(checked)
                                        try {
                                            await axios.patch(
                                                `${import.meta.env.VITE_API_URL}/indstillinger`,
                                                { laasPosteringerAutomatisk: checked },
                                                {
                                                    headers: {
                                                        'Authorization': `Bearer ${user.token}`
                                                    }
                                                }
                                            )
                                        } catch (err) {
                                            console.error("Fejl ved opdatering af laasPosteringerAutomatisk", err)
                                        }
                                    }
                                },
                                ...(laasPosteringerAutomatisk ? [
                                    {
                                        title: "Type",
                                        input: true,
                                        type: "select",
                                        value: laasPosteringerAutomatiskType,
                                        options: [
                                            { value: "ugedag", label: "Ugedag" },
                                            { value: "månedsdag", label: "Månedsdag" }
                                        ],
                                        onChange: async (value) => {
                                            setLaasPosteringerAutomatiskType(value)
                                            try {
                                                await axios.patch(
                                                    `${import.meta.env.VITE_API_URL}/indstillinger`,
                                                    { laasPosteringerAutomatiskType: value },
                                                    {
                                                        headers: {
                                                            'Authorization': `Bearer ${user.token}`
                                                        }
                                                    }
                                                )
                                            } catch (err) {
                                                console.error("Fejl ved opdatering af laasPosteringerAutomatiskType", err)
                                            }
                                        }
                                    },
                                    ...(laasPosteringerAutomatiskType === "ugedag" ? [
                                        {
                                            title: "Ugedag",
                                            input: true,
                                            type: "select",
                                            value: laasPosteringerAutomatiskUgedag,
                                            options: [
                                                { value: 0, label: "Søndag" },
                                                { value: 1, label: "Mandag" },
                                                { value: 2, label: "Tirsdag" },
                                                { value: 3, label: "Onsdag" },
                                                { value: 4, label: "Torsdag" },
                                                { value: 5, label: "Fredag" },
                                                { value: 6, label: "Lørdag" }
                                            ],
                                            onChange: async (value) => {
                                                setLaasPosteringerAutomatiskUgedag(Number(value))
                                                try {
                                                    await axios.patch(
                                                        `${import.meta.env.VITE_API_URL}/indstillinger`,
                                                        { laasPosteringerAutomatiskUgedag: Number(value) },
                                                        {
                                                            headers: {
                                                                'Authorization': `Bearer ${user.token}`
                                                            }
                                                        }
                                                    )
                                                } catch (err) {
                                                    console.error("Fejl ved opdatering af laasPosteringerAutomatiskUgedag", err)
                                                }
                                            }
                                        }
                                    ] : [
                                        {
                                            title: "Månedsdag",
                                            input: true,
                                            type: "select",
                                            value: laasPosteringerAutomatiskMånedsdag,
                                            options: Array.from({ length: 31 }, (_, i) => ({
                                                value: i + 1,
                                                label: `${i + 1}. dag`
                                            })),
                                            onChange: async (value) => {
                                                setLaasPosteringerAutomatiskMånedsdag(Number(value))
                                                try {
                                                    await axios.patch(
                                                        `${import.meta.env.VITE_API_URL}/indstillinger`,
                                                        { laasPosteringerAutomatiskMånedsdag: Number(value) },
                                                        {
                                                            headers: {
                                                                'Authorization': `Bearer ${user.token}`
                                                            }
                                                        }
                                                    )
                                                } catch (err) {
                                                    console.error("Fejl ved opdatering af laasPosteringerAutomatiskMånedsdag", err)
                                                }
                                            }
                                        }
                                    ])
                                ] : [])
                            ]}
                        />
                    </div>
                )
            case 'moms':
                return (
                    <div>
                        <p style={{ marginBottom: '20px' }}>Her kan du administrere hvilke momssatser der er tilgængelige i systemet, samt vælge standard momssats for nye posteringer.</p>
                        
                        {/* Standard momssats */}
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '12px' }}>Standard momssats</h3>
                        <SettingsButtons
                            items={[
                                {
                                    title: "Standard momssats",
                                    input: true,
                                    type: "select",
                                    value: `${standardMomssats.land}-${standardMomssats.sats}`,
                                    options: tilgængeligeMomssatser.map(m => ({
                                        value: `${m.land}-${m.sats}`,
                                        label: m.navn || `${m.land} (${m.sats}%)`
                                    })),
                                    onChange: (value) => {
                                        const [land, sats] = value.split('-')
                                        opdaterStandardMomssats(land, sats)
                                    }
                                }
                            ]}
                        />
                        
                        {/* Tilgængelige momssatser */}
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: '24px 0 12px 0' }}>Tilgængelige momssatser</h3>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                            {tilgængeligeMomssatser.map((momssats, index) => (
                                <div 
                                    key={index} 
                                    style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'space-between',
                                        padding: '12px 16px',
                                        background: '#f9fafb',
                                        borderRadius: '8px',
                                        border: '1px solid #e5e7eb'
                                    }}
                                >
                                    <div>
                                        <span style={{ fontWeight: 500 }}>{momssats.navn || `${momssats.land} (${momssats.sats}%)`}</span>
                                        <span style={{ color: '#6b7280', marginLeft: '8px', fontSize: '0.85rem' }}>
                                            Land: {momssats.land}, Sats: {momssats.sats}%
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => fjernMomssats(index)}
                                        style={{
                                            background: '#fee2e2',
                                            border: 'none',
                                            borderRadius: '6px',
                                            padding: '8px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: '#dc2626'
                                        }}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                        
                        {/* Tilføj ny momssats */}
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: '24px 0 12px 0' }}>Tilføj ny momssats</h3>
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                            <div style={{ flex: '1', minWidth: '100px' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px', color: '#374151' }}>Land</label>
                                <input
                                    type="text"
                                    value={nyMomssatsLand}
                                    onChange={(e) => setNyMomssatsLand(e.target.value.toUpperCase())}
                                    placeholder="DK"
                                    maxLength={2}
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        borderRadius: '6px',
                                        border: '1px solid #d1d5db',
                                        fontSize: '0.9rem'
                                    }}
                                />
                            </div>
                            <div style={{ flex: '1', minWidth: '100px' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px', color: '#374151' }}>Sats (%)</label>
                                <input
                                    type="number"
                                    value={nyMomssatsSats}
                                    onChange={(e) => setNyMomssatsSats(e.target.value)}
                                    placeholder="25"
                                    min="0"
                                    max="100"
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        borderRadius: '6px',
                                        border: '1px solid #d1d5db',
                                        fontSize: '0.9rem'
                                    }}
                                />
                            </div>
                            <div style={{ flex: '2', minWidth: '150px' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px', color: '#374151' }}>Navn (valgfrit)</label>
                                <input
                                    type="text"
                                    value={nyMomssatsNavn}
                                    onChange={(e) => setNyMomssatsNavn(e.target.value)}
                                    placeholder="f.eks. Danmark (25%)"
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        borderRadius: '6px',
                                        border: '1px solid #d1d5db',
                                        fontSize: '0.9rem'
                                    }}
                                />
                            </div>
                            <button
                                onClick={tilføjMomssats}
                                style={{
                                    background: '#3b82f6',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    padding: '10px 16px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    fontWeight: 500
                                }}
                            >
                                <Plus size={16} />
                                Tilføj
                            </button>
                        </div>
                    </div>
                )
            case 'honorar':
                return (
                    <div>
                        <p style={{ marginBottom: '20px' }}>Her kan du indstille om medarbejdere skal have timeløn beregnet via arbejdssedler.</p>
                        <SettingsButtons
                            items={[
                                {
                                    title: "Timeløn via arbejdssedler",
                                    description: "Når aktiveret, vil nye posteringer automatisk beregne medarbejderens honorar baseret på timeregistreringer.",
                                    switch: true,
                                    checked: timelønViaArbejdssedler,
                                    onChange: async (checked) => {
                                        setTimelønViaArbejdssedler(checked)
                                        try {
                                            await axios.patch(
                                                `${import.meta.env.VITE_API_URL}/indstillinger`,
                                                { timelønViaArbejdssedler: checked },
                                                {
                                                    headers: {
                                                        'Authorization': `Bearer ${user.token}`
                                                    }
                                                }
                                            )
                                        } catch (err) {
                                            console.error("Fejl ved opdatering af timelønViaArbejdssedler", err)
                                        }
                                    }
                                }
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
            <h1>Arbejdssedler</h1>
            
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

export default Arbejdssedler

