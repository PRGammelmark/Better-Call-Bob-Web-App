import TableCSS from './Table.module.css'
import FinishedTasksCSS from './FinishedTasks.module.css'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuthContext } from "../../hooks/useAuthContext.js"
import BarLoader from '../loaders/BarLoader.js'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

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

  function beregnFakturaBeløb(posteringer) {
    const handymanTotal = posteringer.reduce((sum, postering) => sum + postering.handymanTimer * 447.2, 0)
    const tømrerTotal = posteringer.reduce((sum, postering) => sum + postering.tømrerTimer * 480, 0)
    const opstartTotal = posteringer.reduce((sum, postering) => sum + postering.opstart / 200 * 319, 0)
    const udlægTotal = posteringer.reduce((sum, postering) => sum + postering.udlæg.reduce((sum, item) => sum + Number(item.beløb), 0), 0)
    const øvrigtTotal = posteringer.reduce((sum, postering) => sum + postering.øvrigt.reduce((sum, item) => sum + Number(item.beløb), 0), 0)
    const totalBeløb = handymanTotal + tømrerTotal + opstartTotal + udlægTotal + øvrigtTotal
    return totalBeløb
  }

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
                const fakturaBeløb = beregnFakturaBeløb(posteringerForOpgave)
                return (
                  <div className={TableCSS.opgaveListing} key={opgave._id}>
                    <ul>
                      <li>#{opgave._id.slice(opgave._id.length - 3, opgave._id.length)}</li>
                      <li>{opgave.navn}{(opgave.virksomhed || opgave.CVR) && <br />}{(opgave.virksomhed && "@ " + opgave.virksomhed) || (opgave.CVR && "@ cvr.: " + opgave.CVR)}</li>
                      <li>{opgave.adresse}</li>
                      <li>{fakturaBeløb.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</li>
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
                const fakturaBeløb = beregnFakturaBeløb(posteringerForOpgave)
                return (
                  <div className={TableCSS.opgaveListing} key={opgave._id} onClick={() => navigate(`../opgave/${opgave._id}`)}>
                    <ul>
                      <li style={{display: "flex", flexDirection: "column", alignItems: "flex-start"}}>{opgave.navn}{(opgave.virksomhed || opgave.CVR) && <br />}<span className={FinishedTasksCSS.opgaveVirksomhedNavn}>{(opgave.virksomhed && opgave.virksomhed) || (opgave.CVR && "CVR.: " + opgave.CVR)}</span></li>
                      <li>{fakturaBeløb.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</li>
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
