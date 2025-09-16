import React, { useState, useEffect } from 'react'
import Styles from './AppIndstillinger.module.css'
import { Info, Hammer, Box } from 'lucide-react'
import axios from 'axios'
import { useAuthContext } from '../hooks/useAuthContext.js'
import { useIndstillinger } from '../context/IndstillingerContext.jsx'
import SeOpgavetyperModal from '../components/modals/SeOpgavetyperModal.jsx'

const AppIndstillinger = () => {

    const [visOpgavetyperInfo, setVisOpgavetyperInfo] = useState(false);
    const [visOpgavetyperModal, setVisOpgavetyperModal] = useState(false)
    const [opgavetyper, setOpgavetyper] = useState([])
    const [refetchOpgavetyper, setRefetchOpgavetyper] = useState(false)

    const { user } = useAuthContext();
    const { indstillinger } = useIndstillinger();

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
          })
          .catch(error => console.log(error))
      }, [refetchOpgavetyper])

  return (
    <div className={Styles.pageContent}>
        <h1>App-indstillinger</h1>
        <h2>Arbejdspræferencer <Info className={`${Styles.infoIcon} ${visOpgavetyperInfo ? Styles.active : ""}`} onClick={() => setVisOpgavetyperInfo(!visOpgavetyperInfo)}/></h2>
        <p className={`${Styles.infoText} ${visOpgavetyperInfo ? Styles.visible : ""}`}>Herunder kan du bl.a. indstille hvilke opgavetyper, I arbejder med i jeres virksomhed. Du kan også definere maks. radius i dine medarbejderes områdeindstillinger.</p>
        <div className={Styles.indstillingerKnapperDiv}>
        
        <div className={Styles.indstillingerKnap} onClick={() => setVisOpgavetyperModal(true)}>
            <h3>Opsæt opgavetyper</h3>
            <div className={Styles.indstillingerKnapEndDiv}>
                <div className={Styles.indstillingerKnapGraaInfoBoks}>
                    <Hammer height={14} />
                    {opgavetyper?.length || 0} typer
                </div>
                <div className={Styles.indstillingerKnapGraaInfoBoks}>
                    <Box height={14} />
                    {indstillinger?.opgavetyperKategorier?.length || 0} kategorier
                </div>
            </div>
        </div>
        <div className={Styles.indstillingerKnap}>
            <h3>Importér standard-opgavetyper</h3>
            <div className={Styles.indstillingerKnapEndDiv}>
                
            </div>
        </div>

        </div>
        <SeOpgavetyperModal trigger={visOpgavetyperModal} setTrigger={setVisOpgavetyperModal} opgavetyper={opgavetyper} user={user} refetchOpgavetyper={refetchOpgavetyper} setRefetchOpgavetyper={setRefetchOpgavetyper} kategorier={indstillinger?.opgavetyperKategorier}/>
    </div>
  )
}

export default AppIndstillinger
