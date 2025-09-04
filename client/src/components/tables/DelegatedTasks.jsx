import TableCSS from './Table.module.css'
import DelegatedTasksCSS from './DelegatedTasks.module.css'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuthContext } from "../../hooks/useAuthContext.js"
import BarLoader from '../loaders/BarLoader.js'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const DelegatedTasks = () => {
  const navigate = useNavigate()
  const [uddelegeredeOpgaver, setUddelegeredeOpgaver] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const {user} = useAuthContext()
  const [kunder, setKunder] = useState([])
  const [besøg, setBesøg] = useState([])

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/besoeg`, {
      headers: {
        'Authorization': `Bearer ${user.token}`
      }
    })
    .then(res => {
      setBesøg(res.data)
    })
    .catch(err => {
      console.log(err)
    })
  }, [uddelegeredeOpgaver])

  useEffect(()=>{
    const fetchOpgaver = async () => {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/opgaver/populateKunder`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      })
      const json = await response.json();

      if (response.ok) {
        const opgaverMedAnsvarlige = json.filter(opgave => opgave.ansvarlig.length > 0 && !opgave.isDeleted);
        const ufærdigeOpgaverMedAnsvarlige = opgaverMedAnsvarlige.filter(opgave => (!opgave.markeretSomFærdig && !opgave.opgaveAfsluttet))
        setUddelegeredeOpgaver(ufærdigeOpgaverMedAnsvarlige);
        setIsLoading(false)
      }
    }

    if (user) {
      fetchOpgaver()
    }
  }, [user])

  return (
        <>
        <div className={DelegatedTasksCSS.desktopTable}>
          <div className={TableCSS.opgaveListe}>
            <h2 className={TableCSS.tabelHeader}>Igangværende opgaver ({uddelegeredeOpgaver ? uddelegeredeOpgaver.length : 0})</h2>
            <div className={TableCSS.opgaveTabel}>
            <div className={`${TableCSS.opgaveHeader} ${DelegatedTasksCSS.delegatedTasksHeader}`}>
                <ul>
                  <li>ID</li>
                  <li>Kunde</li>
                  <li>Adresse</li>
                  <li>Ansvarlige</li>
                </ul>
              </div>
              <div className={`${TableCSS.opgaveBody} ${DelegatedTasksCSS.delegatedTasksBody}`}>
                {isLoading ? <div className={TableCSS.loadingSubmission}><BarLoader color="#59bf1a" width={100} ariaLabel="oval-loading" wrapperStyle={{}} wrapperClass="" /></div> : uddelegeredeOpgaver.length > 0 ? uddelegeredeOpgaver.map((opgave) => {
                  
                  const kunde = opgave?.kunde;
                  const besøgForOpgave = besøg?.filter(besøg => besøg?.opgaveID === opgave?._id)
                  const harBesøg = besøgForOpgave?.length > 0
                  
                  return (
                    <div className={TableCSS.opgaveListing} key={opgave._id} onClick={() => navigate(`../opgave/${opgave._id}`)}>
                      <ul>
                        <li>#{opgave._id.slice(opgave._id.length - 3, opgave._id.length)}</li>
                        <li style={{display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "center"}}>{kunde?.navn}{(kunde?.virksomhed || kunde?.CVR) && <br />}<span className={DelegatedTasksCSS.opgaveVirksomhedNavn}>{(kunde?.virksomhed && kunde?.virksomhed) || (kunde?.CVR && "CVR.: " + kunde?.CVR)}</span></li>
                        <li style={{display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "center", gap: "2px"}}><p>{kunde?.adresse}</p><p style={{fontSize: "10px", color: "#22222280" }}>{kunde?.postnummerOgBy}</p></li>
                        <li style={{display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "center", gap: "2px"}}><p>{opgave.ansvarlig.length > 1 ? opgave.ansvarlig[0].navn + " + " + (opgave.ansvarlig.length - 1) : opgave.ansvarlig.length > 0 ? opgave.ansvarlig[0].navn : "Ikke uddelegeret." }</p>{opgave.ansvarlig.length > 0 && (!harBesøg && <p style={{fontSize: "10px", color: "#222222", background: "#ffee8c", padding: "2px 6px", borderRadius: "4px", display: "flex", alignItems: "center", gap: "2px"}}>Ingen besøg</p>)}</li>
                      </ul>
                    </div>
                  )
                }) : <div className={TableCSS.noResults}><p>Ingen uddelegerede opgaver fundet.</p></div>}
              </div>
            </div>
          </div>
        </div>
        <div className={DelegatedTasksCSS.mobileTable}>
          <div className={TableCSS.opgaveListe}>
            <h2 className={TableCSS.tabelHeader}>Uddelegerede opgaver ({uddelegeredeOpgaver ? uddelegeredeOpgaver.length : 0})</h2>
            <div className={TableCSS.opgaveTabel}>
            <div className={`${TableCSS.opgaveHeader} ${DelegatedTasksCSS.delegatedTasksHeader}`}>
                <ul>
                  <li>Kunde</li>
                  <li>Adresse</li>
                  <li>Ansvarlige</li>
                </ul>
              </div>
              <div className={`${TableCSS.opgaveBody} ${DelegatedTasksCSS.delegatedTasksBody}`}>
                {isLoading ? <div className={TableCSS.loadingSubmission}><BarLoader color="#59bf1a" width={100} ariaLabel="oval-loading" wrapperStyle={{}} wrapperClass="" /></div> : uddelegeredeOpgaver.length > 0 ? uddelegeredeOpgaver.map((opgave) => {
                  
                  const kunde = opgave?.kunde;
                  const besøgForOpgave = besøg?.filter(besøg => besøg?.opgaveID === opgave?._id)
                  const harBesøg = besøgForOpgave?.length > 0

                  return (
                    <div className={TableCSS.opgaveListing} key={opgave._id} onClick={() => navigate(`../opgave/${opgave._id}`)}>
                      <ul>
                        <li style={{display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "center"}}>{kunde?.navn}{(kunde?.virksomhed || kunde?.CVR) && <br />}<span className={DelegatedTasksCSS.opgaveVirksomhedNavn}>{(kunde?.virksomhed && kunde?.virksomhed) || (kunde?.CVR && "CVR.: " + kunde?.CVR)}</span></li>
                        <li style={{display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "center", gap: "2px"}}><p>{kunde?.adresse}</p><p style={{fontSize: "10px", color: "#22222280" }}>{kunde?.postnummerOgBy}</p></li>
                        <li style={{display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "center", gap: "2px"}}><p>{opgave.ansvarlig.length > 1 ? opgave.ansvarlig[0].navn + " + " + (opgave.ansvarlig.length - 1) : opgave.ansvarlig.length > 0 ? opgave.ansvarlig[0].navn : "Ikke uddelegeret." }</p>{opgave.ansvarlig.length > 0 && (!harBesøg && <p style={{fontSize: "10px", color: "#222222", background: "#ffee8c", padding: "2px 6px", borderRadius: "4px", display: "flex", alignItems: "center", gap: "2px"}}>Ingen besøg</p>)}</li>
                      </ul>
                    </div>
                  )
                }) : <div className={TableCSS.noResults}><p>Ingen uddelegerede opgaver fundet.</p></div>}
              </div>
            </div>
          </div>
        </div>
        </>
  )
}

export default DelegatedTasks
