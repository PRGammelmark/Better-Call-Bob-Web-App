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
  const [kunder, setKunder] = useState(null)

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
        console.log(json)
        const opgaverMedAnsvarlige = json.filter(opgave => opgave.ansvarlig.length > 0 && !opgave.isDeleted);
        const ufærdigeOpgaverMedAnsvarlige = opgaverMedAnsvarlige.filter(opgave => !opgave.markeretSomFærdig)
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
                  const kunde = kunder?.find(kunde => kunde._id === opgave.kundeID)
                  return (
                    <div className={TableCSS.opgaveListing} key={opgave._id}>
                      <ul>
                        <li>#{opgave._id.slice(opgave._id.length - 3, opgave._id.length)}</li>
                        <li style={{display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "center"}}>{kunde?.navn}{(kunde?.virksomhed || kunde?.CVR) && <br />}<span className={DelegatedTasksCSS.opgaveVirksomhedNavn}>{(kunde?.virksomhed && kunde?.virksomhed) || (kunde?.CVR && "CVR.: " + kunde?.CVR)}</span></li>
                        <li>{kunde?.adresse}</li>
                        <li>{opgave.ansvarlig.length > 1 ? opgave.ansvarlig[0].navn + " + " + (opgave.ansvarlig.length - 1) : opgave.ansvarlig.length > 0 ? opgave.ansvarlig[0].navn : "Ikke uddelegeret." }</li>
                      </ul>
                      <Link className={TableCSS.link} to={`../opgave/${opgave._id}`}>
                        <button className={TableCSS.button}>Åbn</button>
                      </Link>
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
                  const kunde = kunder?.find(kunde => kunde._id === opgave.kundeID)
                  return (
                    <div className={TableCSS.opgaveListing} key={opgave._id} onClick={() => navigate(`../opgave/${opgave._id}`)}>
                      <ul>
                        <li style={{display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "center"}}>{kunde?.navn}{(kunde?.virksomhed || kunde?.CVR) && <br />}<span className={DelegatedTasksCSS.opgaveVirksomhedNavn}>{(kunde?.virksomhed && kunde?.virksomhed) || (kunde?.CVR && "CVR.: " + kunde?.CVR)}</span></li>
                        <li>{kunde?.adresse}</li>
                        <li>{opgave.ansvarlig.length > 1 ? opgave.ansvarlig[0].navn + " + " + (opgave.ansvarlig.length - 1) : opgave.ansvarlig.length > 0 ? opgave.ansvarlig[0].navn : "Ikke uddelegeret." }</li>
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
