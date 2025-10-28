import React, { useState, useEffect } from 'react'
import Styles from './AppIndstillinger.module.css'
import { Info, Hammer, Box, Radius } from 'lucide-react'
import axios from 'axios'
import { useAuthContext } from '../hooks/useAuthContext.js'
import { useIndstillinger } from '../context/IndstillingerContext.jsx'
import SeOpgavetyperModal from '../components/modals/SeOpgavetyperModal.jsx'
import SettingsButtons from '../components/basicComponents/buttons/SettingsButtons.jsx'
import Button from '../components/basicComponents/buttons/Button.jsx'
import { useNavigate } from 'react-router-dom'

const AppIndstillinger = () => {

    const navigate = useNavigate();
    const { user } = useAuthContext();
    const { indstillinger } = useIndstillinger();

    const [visOpgavetyperInfo, setVisOpgavetyperInfo] = useState(false);
    const [visOpgavetyperModal, setVisOpgavetyperModal] = useState(false)
    const [opgavetyper, setOpgavetyper] = useState([])
    const [refetchOpgavetyper, setRefetchOpgavetyper] = useState(false)
    const [maxArbejdsradius, setMaxArbejdsradius] = useState( indstillinger?.arbejdsområdeKilometerRadius )

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

        <SeOpgavetyperModal trigger={visOpgavetyperModal} setTrigger={setVisOpgavetyperModal} opgavetyper={opgavetyper} user={user} refetchOpgavetyper={refetchOpgavetyper} setRefetchOpgavetyper={setRefetchOpgavetyper} kategorier={indstillinger?.opgavetyperKategorier}/>
    
        <Button onClick={() => navigate('/kalender')}>Gå til test-kalender (beta)</Button>
    </div>
  )
}

export default AppIndstillinger
