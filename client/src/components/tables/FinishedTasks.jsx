import TableCSS from './Table.module.css'
import FinishedTasksCSS from './FinishedTasks.module.css'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuthContext } from "../../hooks/useAuthContext.js"
import BarLoader from '../loaders/BarLoader.js'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import * as beregn from '../../utils/beregninger.js'

const FinishedTasks = () => {

  const navigate = useNavigate()
  const [færdiggjorteOpgaver, setFærdiggjorteOpgaver] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [posteringer, setPosteringer] = useState(null)
  const {user} = useAuthContext()

  useEffect(()=>{
    const fetchOpgaver = async () => {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/opgaver`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      })
      const json = await response.json();

      if (response.ok) {
        const færdigeOpgaver = json.filter(opgave => opgave.markeretSomFærdig && !opgave.isDeleted && !opgave.opgaveAfsluttet && !opgave.opgaveBetaltMedMobilePay);
        const færdigeOpgavermanglerBetaling = færdigeOpgaver.filter(opgave => !opgave.opgaveBetalt);
        setFærdiggjorteOpgaver(færdigeOpgavermanglerBetaling);
        setIsLoading(false)
      }
    }

    if (user) {
      fetchOpgaver()
    }
  }, [user])

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/posteringer`, {
      headers: {
        'Authorization': `Bearer ${user.token}`
      }
    })
    .then(res => {
      setPosteringer(res.data)
    })
  }, [user])
  

  return (
    <>
      <div className={FinishedTasksCSS.desktopTable}>
        <div className={TableCSS.opgaveListe}>
          <h2 className={TableCSS.tabelHeader}>Færdige, ubetalte opgaver ({færdiggjorteOpgaver ? færdiggjorteOpgaver.length : 0})</h2>
          <div className={TableCSS.opgaveTabel}>
            <div className={`${TableCSS.opgaveHeader} ${FinishedTasksCSS.finishedTasksHeader}`}>
              <ul>
                <li>ID</li>
                <li>Kunde</li>
                <li>Adresse</li>
                <li>Fakturabeløb</li>
                <li>Ansvarlige</li>
              </ul>
            </div>
            <div className={`${TableCSS.opgaveBody} ${FinishedTasksCSS.finishedTasksBody}`}>
              {isLoading ? <div className={TableCSS.loadingSubmission}><BarLoader color="#59bf1a" width={100} ariaLabel="oval-loading" wrapperStyle={{}} wrapperClass="" /></div> : færdiggjorteOpgaver.length > 0 ? færdiggjorteOpgaver.map((opgave) => {
                const posteringerForOpgave = posteringer && posteringer.filter(postering => postering.opgaveID === opgave._id)
                let momsvisning;
                
                if(opgave.virksomhed || opgave.CVR) {
                  console.log("Erhvervskunde")
                  momsvisning = false;
                } else {
                  console.log("Privatkunde")
                  momsvisning = true;
                }
                
                const fakturabeløbForOpgave = beregn.totalPris(posteringerForOpgave, 2, momsvisning)?.formateret;
                return (
                  <div className={TableCSS.opgaveListing} key={opgave._id}>
                    <ul>
                      <li>#{opgave._id.slice(opgave._id.length - 3, opgave._id.length)}</li>
                      <li style={{display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "center"}}>{opgave.navn}{(opgave.virksomhed || opgave.CVR) && <br />}<span className={FinishedTasksCSS.opgaveVirksomhedNavn}>{(opgave.virksomhed && opgave.virksomhed) || (opgave.CVR && "CVR.: " + opgave.CVR)}</span></li>
                      <li>{opgave.adresse}</li>
                      <li>{fakturabeløbForOpgave}</li>
                      <li>{opgave.ansvarlig.length > 1 ? opgave.ansvarlig[0].navn + " + flere..." : opgave.ansvarlig.length > 0 ? opgave.ansvarlig[0].navn : "Ikke uddelegeret." }</li>
                    </ul>
                    <Link className={TableCSS.link} to={`../opgave/${opgave._id}`}>
                      <button className={TableCSS.button}>Åbn</button>
                    </Link>
                  </div>
                )
              }) : <div className={TableCSS.noResults}><p>Ingen færdige opgaver, der mangler betaling.</p></div>}
            </div>
          </div>
        </div>
      </div>
      <div className={FinishedTasksCSS.mobileTable}>
      <div className={TableCSS.opgaveListe}>
          <h2 className={TableCSS.tabelHeader}>Færdige, ubetalte opgaver ({færdiggjorteOpgaver ? færdiggjorteOpgaver.length : 0})</h2>
          <div className={TableCSS.opgaveTabel}>
            <div className={`${TableCSS.opgaveHeader} ${FinishedTasksCSS.finishedTasksHeader}`}>
              <ul>
                <li>Kunde</li>
                <li>Fakturabeløb</li>
                <li>Ansvarlige</li>
              </ul>
            </div>
            <div className={`${TableCSS.opgaveBody} ${FinishedTasksCSS.finishedTasksBody}`}>
              {isLoading ? <div className={TableCSS.loadingSubmission}><BarLoader color="#59bf1a" width={100} ariaLabel="oval-loading" wrapperStyle={{}} wrapperClass="" /></div> : færdiggjorteOpgaver.length > 0 ? færdiggjorteOpgaver.map((opgave) => {
                const posteringerForOpgave = posteringer && posteringer.filter(postering => postering.opgaveID === opgave._id)
                let momsvisning;
                
                if(opgave.virksomhed || opgave.CVR) {
                  console.log("Erhvervskunde")
                  momsvisning = false;
                } else {
                  console.log("Privatkunde")
                  momsvisning = true;
                }
                
                const fakturabeløbForOpgave = beregn.totalPris(posteringerForOpgave, 2, momsvisning)?.formateret;
                return (
                  <div className={TableCSS.opgaveListing} key={opgave._id} onClick={() => navigate(`../opgave/${opgave._id}`)}>
                    <ul>
                      <li style={{display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "center"}}>{opgave.navn}{(opgave.virksomhed || opgave.CVR) && <br />}<span className={FinishedTasksCSS.opgaveVirksomhedNavn}>{(opgave.virksomhed && opgave.virksomhed) || (opgave.CVR && "CVR.: " + opgave.CVR)}</span></li>
                      <li>{fakturabeløbForOpgave}</li>
                      <li>{opgave.ansvarlig.length > 1 ? opgave.ansvarlig[0].navn + " + flere..." : opgave.ansvarlig.length > 0 ? opgave.ansvarlig[0].navn : "Ikke uddelegeret." }</li>
                    </ul>
                  </div>
                )
              }) : <div className={TableCSS.noResults}><p>Ingen færdige opgaver, der mangler betaling.</p></div>}
            </div>
          </div>
        </div>
      </div>
      </>
  )
}

export default FinishedTasks
