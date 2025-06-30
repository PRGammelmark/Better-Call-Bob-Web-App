import TableCSS from './Table.module.css'
import DelegatedTasksCSS from './DelegatedTasks.module.css'
import { useState, useEffect } from 'react'
import { useAuthContext } from "../../hooks/useAuthContext.js"
import BarLoader from '../loaders/BarLoader.js'
import axios from 'axios'
import dayjs from 'dayjs'

import relativeTime from 'dayjs/plugin/relativeTime' // ES 2015
dayjs.extend(relativeTime)

const VælgOpgaveVedNytBesøg = (props) => {
  const [isLoading, setIsLoading] = useState(true)
  const [kunder, setKunder] = useState([])
  const {user} = useAuthContext()

  const opgaver = props.opgaver
  const opgaverLoading = props.opgaverLoading

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/kunder`, {
      headers: {
        'Authorization': `Bearer ${user.token}`
      }
    })
    .then(res => {
      setKunder(res.data)
    })
    .catch(error => console.log(error))
  }, [])

  return (
    <>
        <div className={DelegatedTasksCSS.desktopTable}>
          <div className={TableCSS.opgaveListe}>
            <h4 className={TableCSS.tabelHeader}>Vælg blandt {opgaver ? opgaver.length : 0} opgaver:</h4>
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
                {opgaverLoading ? <div className={TableCSS.loadingSubmission}><BarLoader color="#59bf1a" width={100} ariaLabel="oval-loading" wrapperStyle={{}} wrapperClass="" /></div> : opgaver.length > 0 ? opgaver.map((opgave) => {
                  const kunde = kunder?.find(kunde => kunde._id === opgave.kundeID)
                  
                  return (
                    <div className={`${TableCSS.opgaveListing} ${props.opgaveTilknyttetBesøg && props.opgaveTilknyttetBesøg._id === opgave._id ? TableCSS.activeOpgaveListing : ""}`} key={opgave._id} style={{cursor: "pointer"}} onClick={() => {
                      props.setOpgaveTilknyttetBesøg(opgave)
                      props.setKundeTilknyttetBesøg(kunder.find(kunde => kunde._id === opgave.kundeID))
                    }}>
                      <ul>
                        <li>#{opgave._id.slice(opgave._id.length - 3, opgave._id.length)}</li>
                        <li style={{display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "center"}}>{kunde?.navn}{(kunde?.virksomhed || kunde?.CVR) && <br />}<span className={DelegatedTasksCSS.opgaveVirksomhedNavn}>{(kunde?.virksomhed && kunde?.virksomhed) || (kunde?.CVR && "CVR.: " + kunde?.CVR)}</span></li>
                        <li>{kunde?.adresse}</li>
                        <li>{opgave.ansvarlig.length > 1 ? opgave.ansvarlig[0].navn + " + " + (opgave.ansvarlig.length - 1) : opgave.ansvarlig.length > 0 ? opgave.ansvarlig[0].navn : "Ikke uddelegeret." }</li>
                      </ul>
                    </div>
                  )
                }) : <div className={TableCSS.noResults}><p>Ingen åbne eller uddelegerede opgaver fundet.</p></div>}
              </div>
            </div>
          </div>
        </div>
        <div className={DelegatedTasksCSS.mobileTable}>
          <div className={TableCSS.opgaveListe}>
            <h3 className={TableCSS.tabelHeader}>Vælg blandt {opgaver ? opgaver.length : 0} opgaver:</h3>
            <div className={TableCSS.opgaveTabel}>
            <div className={`${TableCSS.opgaveHeader} ${DelegatedTasksCSS.delegatedTasksHeader}`}>
                <ul>
                  <li>Kunde</li>
                  <li>Adresse</li>
                  <li>Ansvarlige</li>
                </ul>
              </div>
              <div className={`${TableCSS.opgaveBody} ${DelegatedTasksCSS.delegatedTasksBody}`}>
                {opgaverLoading ? <div className={TableCSS.loadingSubmission}><BarLoader color="#59bf1a" width={100} ariaLabel="oval-loading" wrapperStyle={{}} wrapperClass="" /></div> : opgaver.length > 0 ? opgaver.map((opgave) => {
                  const kunde = kunder?.find(kunde => kunde._id === opgave.kundeID)
                  
                  return (
                    <div className={`${TableCSS.opgaveListing} ${props.opgaveTilknyttetBesøg && props.opgaveTilknyttetBesøg._id === opgave._id ? TableCSS.activeOpgaveListing : ""}`} key={opgave._id} onClick={() => {
                      props.setOpgaveTilknyttetBesøg(opgave)
                      props.setKundeTilknyttetBesøg(kunder.find(kunde => kunde._id === opgave.kundeID))
                      props.setTilknyttetAnsvarlig("")
                    }}>
                      <ul>
                        <li style={{display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "center"}}>{kunde?.navn}{(kunde?.virksomhed || kunde?.CVR) && <br />}<span className={DelegatedTasksCSS.opgaveVirksomhedNavn}>{(kunde?.virksomhed && kunde?.virksomhed) || (kunde?.CVR && "CVR.: " + kunde?.CVR)}</span></li>
                        <li>{kunde?.adresse}</li>
                        <li>{opgave.ansvarlig.length > 1 ? opgave.ansvarlig[0].navn + " + " + (opgave.ansvarlig.length - 1) : opgave.ansvarlig.length > 0 ? opgave.ansvarlig[0].navn : "Ikke uddelegeret." }</li>
                      </ul>
                    </div>
                  )
                }) : <div className={TableCSS.noResults}><p>Ingen åbne eller uddelegerede opgaver fundet.</p></div>}
              </div>
            </div>
          </div>
        </div>
    </>
  )
}

export default VælgOpgaveVedNytBesøg
