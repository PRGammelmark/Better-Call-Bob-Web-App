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
  const {user} = useAuthContext()

  const opgaver = props.opgaver
  const opgaverLoading = props.opgaverLoading

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
                  return (
                    <div className={`${TableCSS.opgaveListing} ${props.tilknyttetOpgave && props.tilknyttetOpgave._id === opgave._id ? TableCSS.activeOpgaveListing : ""}`} key={opgave._id} style={{cursor: "pointer"}} onClick={() => {
                      props.setTilknyttetOpgave(opgave)
                    }}>
                      <ul>
                        <li>#{opgave._id.slice(opgave._id.length - 3, opgave._id.length)}</li>
                        <li style={{display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "center"}}>{opgave.navn}{(opgave.virksomhed || opgave.CVR) && <br />}<span className={DelegatedTasksCSS.opgaveVirksomhedNavn}>{(opgave.virksomhed && opgave.virksomhed) || (opgave.CVR && "CVR.: " + opgave.CVR)}</span></li>
                        <li>{opgave.adresse}</li>
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
                  return (
                    <div className={`${TableCSS.opgaveListing} ${props.tilknyttetOpgave && props.tilknyttetOpgave._id === opgave._id ? TableCSS.activeOpgaveListing : ""}`} key={opgave._id} onClick={() => {
                      props.setTilknyttetOpgave(opgave)
                      props.setTilknyttetAnsvarlig("")
                    }}>
                      <ul>
                        <li style={{display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "center"}}>{opgave.navn}{(opgave.virksomhed || opgave.CVR) && <br />}<span className={DelegatedTasksCSS.opgaveVirksomhedNavn}>{(opgave.virksomhed && opgave.virksomhed) || (opgave.CVR && "CVR.: " + opgave.CVR)}</span></li>
                        <li>{opgave.adresse}</li>
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
