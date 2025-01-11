import TableCSS from './Table.module.css'
import OpenTasksCSS from './OpenTasks.module.css'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuthContext } from "../../hooks/useAuthContext.js"
import BarLoader from '../loaders/BarLoader.js'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime' // ES 2015
import { useNavigate } from 'react-router-dom'


dayjs.extend(relativeTime)

const OpenTasks = () => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [opgaver, setOpgaver] = useState(null)
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
        const opgaverUdenAnsvarlige = json.filter(opgave => opgave.ansvarlig.length === 0);
        const ufærdigeOpgaverUdenAnsvarlige = opgaverUdenAnsvarlige.filter(opgave => opgave.markeretSomFærdig === false && !opgave.isDeleted)
        setOpgaver(ufærdigeOpgaverUdenAnsvarlige);
        setIsLoading(false)
      }
    }

    if (user) {
      fetchOpgaver()
    }
  }, [user])

  const åbnOpgave = (opgaveID) => {
    navigate(`../opgave/${opgaveID}`)
  }

  return (
        <>
          <div className={OpenTasksCSS.desktopTable}>
            <div className={TableCSS.opgaveListe}>
              <h2 className={TableCSS.tabelHeader}>Åbne opgaver ({opgaver ? opgaver.length : 0})</h2>
              <div className={TableCSS.opgaveTabel}>
                <div className={`${TableCSS.opgaveHeader} ${OpenTasksCSS.openTasksHeaderDesktop}`}>
                  <ul>
                    <li>ID</li>
                    <li>Modtaget</li>
                    <li>Status</li>
                    <li>Kunde</li>
                    <li>Adresse</li>
                  </ul>
                </div>
                <div className={`${TableCSS.opgaveBody} ${OpenTasksCSS.openTasksBodyDesktop}`}>
                  {isLoading ? <div className={TableCSS.loadingSubmission}><BarLoader color="#59bf1a" width={100} ariaLabel="oval-loading" wrapperStyle={{}} wrapperClass="" /></div> : opgaver.length > 0 ? opgaver.map((opgave) => {
                    return (
                      <div className={TableCSS.opgaveListing} key={opgave._id}>
                        <ul>
                          <li>#{opgave._id.slice(opgave._id.length - 3, opgave._id.length)}</li>
                          <li>{new Date(opgave.createdAt).toLocaleDateString()}</li>
                          <li>{opgave.status}</li>
                          <li>{opgave.navn}</li>
                          <li>{opgave.adresse}</li>
                        </ul>
                        <Link className={TableCSS.link} to={`../opgave/${opgave._id}`}>
                          <button className={TableCSS.button}>Åbn</button>
                        </Link>
                      </div>
                    )
                  }) : <div className={TableCSS.noResults}><p>Ingen åbne opgaver fundet.</p></div>}
                </div>
              </div>
            </div>
          </div>
          <div className={OpenTasksCSS.mobileTable}>
            <div className={TableCSS.opgaveListe}>
              <h2 className={TableCSS.tabelHeader}>Åbne opgaver ({opgaver ? opgaver.length : 0})</h2>
              <div className={TableCSS.opgaveTabel}>
                <div className={`${TableCSS.opgaveHeader} ${OpenTasksCSS.openTasksHeaderMobile}`}>
                  <ul>
                    <li>Modtaget</li>
                    <li>Kunde</li>
                    <li>Adresse</li>
                    <li>Status</li>
                  </ul>
                </div>
                <div className={`${TableCSS.opgaveBody} ${OpenTasksCSS.openTasksBodyMobile}`}>
                  {isLoading ? <div className={TableCSS.loadingSubmission}><BarLoader color="#59bf1a" width={100} ariaLabel="oval-loading" wrapperStyle={{}} wrapperClass="" /></div> : opgaver.length > 0 ? opgaver.map((opgave) => {
                    return (
                      <div className={`${TableCSS.opgaveListing} ${opgave.status === "Dato aftalt" && OpenTasksCSS.markerKlarTilUddelegering}`} key={opgave._id} onClick={() => åbnOpgave(opgave._id)}>
                        <ul>
                          <li>{dayjs(opgave.createdAt).fromNow()}</li>
                          <li style={{display: "flex", flexDirection: "column", alignItems: "flex-start"}}>{opgave.navn}{(opgave.virksomhed || opgave.CVR) && <br />}<span className={OpenTasksCSS.opgaveVirksomhedNavn}>{(opgave.virksomhed && opgave.virksomhed) || (opgave.CVR && "CVR.: " + opgave.CVR)}</span></li>
                          <li>{opgave.adresse}</li>
                          <li>{opgave.status}</li>
                        </ul>
                      </div>
                    )
                  }) : <div className={TableCSS.noResults}><p>Ingen åbne opgaver fundet.</p></div>}
                </div>
              </div>
            </div>
          </div>
        </>
      
  )
}

export default OpenTasks
