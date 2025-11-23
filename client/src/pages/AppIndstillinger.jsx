import React, { useState, useEffect } from 'react'
import Styles from './AppIndstillinger.module.css'
import { Info, Hammer, Box, Radius, Coins, Calendar, Download } from 'lucide-react'
import axios from 'axios'
import { useAuthContext } from '../hooks/useAuthContext.js'
import { useIndstillinger } from '../context/IndstillingerContext.jsx'
import SeOpgavetyperModal from '../components/modals/SeOpgavetyperModal.jsx'
import OpfølgendeSpørgsmålModal from '../components/modals/OpfølgendeSpørgsmålModal.jsx'
import ImportOpgavetyperModal from '../components/modals/ImportOpgavetyperModal.jsx'
import SettingsButtons from '../components/basicComponents/buttons/SettingsButtons.jsx'
import Button from '../components/basicComponents/buttons/Button.jsx'
import { useNavigate } from 'react-router-dom'

const AppIndstillinger = () => {

    const navigate = useNavigate();
    const { user } = useAuthContext();
    const { indstillinger } = useIndstillinger();

    const [visOpgavetyperInfo, setVisOpgavetyperInfo] = useState(false);
    const [visOpgavetyperModal, setVisOpgavetyperModal] = useState(false)
    const [visOpfølgendeSpørgsmålModal, setVisOpfølgendeSpørgsmålModal] = useState(false)
    const [visImportOpgavetyperModal, setVisImportOpgavetyperModal] = useState(false)
    const [opgavetyper, setOpgavetyper] = useState([])
    const [refetchOpgavetyper, setRefetchOpgavetyper] = useState(false)
    const [maxArbejdsradius, setMaxArbejdsradius] = useState( indstillinger?.arbejdsområdeKilometerRadius )
    const [kørerFakturaBetalingstjek, setKørerFakturaBetalingstjek] = useState(false)
    const [antalSpørgsmål, setAntalSpørgsmål] = useState(0)

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

    useEffect(() => {
        if (indstillinger?.arbejdsområdeKilometerRadius != null) {
            setMaxArbejdsradius(indstillinger.arbejdsområdeKilometerRadius);
        }
    }, [indstillinger])

    useEffect(() => {
        if (user?.token) {
            axios.get(`${import.meta.env.VITE_API_URL}/opfolgendeSporgsmaal/`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            })
            .then(res => {
                setAntalSpørgsmål(res.data?.length || 0)
            })
            .catch(error => {
                console.log(error)
                setAntalSpørgsmål(0)
            })
        }
    }, [user, visOpfølgendeSpørgsmålModal])

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

  return (
    <div className={Styles.pageContent}>
        <h1>App-indstillinger</h1>
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
            <p className={Styles.infoText}>Administrer opfølgende spørgsmål til bookingsystemet. Disse spørgsmål vises baseret på de kategorier, som AI'en tildeler opgaverne.</p>
            <SettingsButtons
                items={[
                    {
                        title: "Opfølgende spørgsmål",
                        icon: <Calendar />,
                        onClick: () => setVisOpfølgendeSpørgsmålModal(true),
                        value: `${antalSpørgsmål} spørgsmål`,
                    }
                ]}
            />
        </div>

        <SeOpgavetyperModal trigger={visOpgavetyperModal} setTrigger={setVisOpgavetyperModal} opgavetyper={opgavetyper} user={user} refetchOpgavetyper={refetchOpgavetyper} setRefetchOpgavetyper={setRefetchOpgavetyper} kategorier={indstillinger?.opgavetyperKategorier}/>
        <ImportOpgavetyperModal trigger={visImportOpgavetyperModal} setTrigger={setVisImportOpgavetyperModal} user={user} kategorier={indstillinger?.opgavetyperKategorier || []} refetchOpgavetyper={refetchOpgavetyper} setRefetchOpgavetyper={setRefetchOpgavetyper} />
        <OpfølgendeSpørgsmålModal trigger={visOpfølgendeSpørgsmålModal} setTrigger={setVisOpfølgendeSpørgsmålModal} user={user} opgavetyper={opgavetyper} />
    
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
