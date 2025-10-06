import TableCSS from './Table.module.css'
import OpenTasksCSS from './OpenTasks.module.css'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuthContext } from "../../hooks/useAuthContext.js"
import BarLoader from '../loaders/BarLoader.js'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime' // ES 2015
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Check, X, ChevronRight, CircleQuestionMark } from 'lucide-react'


dayjs.extend(relativeTime)

const OpenTasks = () => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [opgaver, setOpgaver] = useState(null)
  const [kunder, setKunder] = useState(null)
  const {user} = useAuthContext()

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/kunder`, {
      headers: {
        'Authorization': `Bearer ${user.token}`
      }
    })
    .then(res => {
      setKunder(res.data)
    })
    .catch(err => {
      console.log(err)
    })
  }, [user])

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
        const ufærdigeOpgaverUdenAnsvarlige = opgaverUdenAnsvarlige.filter(opgave => !opgave.markeretSomFærdig && !opgave.isDeleted)
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
                <li>Modtaget</li>
                <li>Kunde</li>
                <li>Adresse</li>
                <li>Opgavebeskrivelse</li>
                <li></li>
              </ul>
            </div>
            <div className={`${TableCSS.opgaveBody} ${OpenTasksCSS.openTasksBodyDesktop}`}>
              {isLoading ? <div className={TableCSS.loadingSubmission}><BarLoader color="#59bf1a" width={100} ariaLabel="oval-loading" wrapperStyle={{}} wrapperClass="" /></div> : opgaver.length > 0 ? opgaver.map((opgave) => {
                
                const kunde = kunder?.find(kunde => kunde._id === opgave.kundeID)

                return (
                  <div className={TableCSS.opgaveListing} key={opgave._id} onClick={() => navigate(`../opgave/${opgave._id}`)}>
                    <div className={TableCSS.opgaveIdMarker}>
                      #{opgave._id.slice(opgave._id.length - 3, opgave._id.length)}
                    </div>
                    <ul>
                      <li style={{display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "center"}}>{dayjs(opgave.createdAt).fromNow()}{opgave.status === "Afventer svar" ? <p style={{fontSize: "10px", color: "#222222", backgroundColor: "#59bf1a99", padding: "2px 6px", borderRadius: "4px", display: "flex", alignItems: "center", gap: "2px"}}><CircleQuestionMark size={10} color="#222222" />Afventer svar</p> : (opgave.status === "Dato aftalt" ? <p style={{fontSize: "10px", color: "#222222", backgroundColor: "#EED202", padding: "2px 6px", borderRadius: "4px", display: "flex", alignItems: "center", gap: "2px"}}><Check size={10} color="#222222" />Dato aftalt</p> : <p style={{fontSize: "10px", color: "#222222", backgroundColor: "#EED202", padding: "2px 6px", borderRadius: "4px", display: "flex", alignItems: "center", gap: "2px"}}><X size={10} color="#222222" />Ikke kontaktet</p>)}</li>
                      <li style={{display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "center"}}>{kunde?.navn}{(kunde?.virksomhed || kunde?.CVR) && <br />}<span className={OpenTasksCSS.opgaveVirksomhedNavn}>{(kunde?.virksomhed && kunde?.virksomhed) || (kunde?.CVR && "CVR.: " + kunde?.CVR)}</span></li>
                      <li style={{display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "center", gap: "2px"}}><p>{kunde?.adresse}</p><p style={{fontSize: "10px", color: "#22222280" }}>{kunde?.postnummerOgBy}</p></li>
                      <li style={{display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "center", gap: "2px"}}><p className={TableCSS.ellipsisThreeLines}>{opgave.opgaveBeskrivelse}</p></li>
                      <li className={TableCSS.chevronRight}><ChevronRight size={16} color="#222222" /></li>
                    </ul>
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
                <li></li>
              </ul>
            </div>
            <div className={`${TableCSS.opgaveBody} ${OpenTasksCSS.openTasksBodyMobile}`}>
              {isLoading ? <div className={TableCSS.loadingSubmission}><BarLoader color="#59bf1a" width={100} ariaLabel="oval-loading" wrapperStyle={{}} wrapperClass="" /></div> : opgaver.length > 0 ? opgaver.map((opgave) => {
                const kunde = kunder?.find(kunde => kunde._id === opgave.kundeID)

                return (
                  <div className={TableCSS.opgaveListing} key={opgave._id} onClick={() => navigate(`../opgave/${opgave._id}`)}>
                    <div className={TableCSS.opgaveIdMarker}>
                      #{opgave._id.slice(opgave._id.length - 3, opgave._id.length)}
                    </div>
                    <ul>
                    <li style={{display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "center"}}>{dayjs(opgave.createdAt).fromNow()}{opgave.status === "Afventer svar" ? <p style={{fontSize: "10px", color: "#222222", backgroundColor: "#59bf1a99", padding: "2px 6px", borderRadius: "4px", display: "flex", alignItems: "center", gap: "2px"}}><CircleQuestionMark size={10} color="#222222" />Afventer svar</p> : (opgave.status === "Dato aftalt" ? <p style={{fontSize: "10px", color: "#222222", backgroundColor: "#EED202", padding: "2px 6px", borderRadius: "4px", display: "flex", alignItems: "center", gap: "2px"}}><Check size={10} color="#222222" />Dato aftalt</p> : <p style={{fontSize: "10px", color: "#222222", backgroundColor: "#EED202", padding: "2px 6px", borderRadius: "4px", display: "flex", alignItems: "center", gap: "2px"}}><X size={10} color="#222222" />Ikke kontaktet</p>)}</li>
                      <li style={{display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "center"}}>{kunde?.navn}{(kunde?.virksomhed || kunde?.CVR) && <br />}<span className={OpenTasksCSS.opgaveVirksomhedNavn}>{(kunde?.virksomhed && kunde?.virksomhed) || (kunde?.CVR && "CVR.: " + kunde?.CVR)}</span></li>
                      <li style={{display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "center", gap: "2px"}}><p>{kunde?.adresse}</p><p style={{fontSize: "10px", color: "#22222280" }}>{kunde?.postnummerOgBy}</p></li>
                      <li><ChevronRight size={16} color="#222222" /></li>
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
