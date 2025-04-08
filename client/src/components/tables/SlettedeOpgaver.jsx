import TableCSS from './Table.module.css'
import SlettedeOpgaverCSS from './SlettedeOpgaver.module.css'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuthContext } from "../../hooks/useAuthContext.js"
import BarLoader from '../loaders/BarLoader.js'
import dayjs from 'dayjs'
import { useNavigate } from 'react-router-dom'

const SlettedeOpgaver = ({slettedeOpgaver, setSlettedeOpgaver, isLoading, setIsLoading}) => {

  const navigate = useNavigate()
  const {user} = useAuthContext()

  return (
    <>
        <div className={SlettedeOpgaverCSS.desktopTable}>
          <div className={TableCSS.opgaveListe}>
            <h2 className={TableCSS.tabelHeader}>Slettede opgaver ({slettedeOpgaver ? slettedeOpgaver.length : 0})</h2>
            <div className={TableCSS.opgaveTabel}>
            <div className={`${TableCSS.opgaveHeader} ${SlettedeOpgaverCSS.slettedeOpgaverHeader}`}>
              <ul>
                <li>ID</li>
                <li>Kunde</li>
                <li>Adresse</li>
                <li>Slettet</li>
              </ul>
            </div>
            <div className={`${TableCSS.opgaveBody} ${SlettedeOpgaverCSS.slettedeOpgaverBody}`}>
              {isLoading ? <div className={TableCSS.loadingSubmission}><BarLoader color="#59bf1a" width={100} ariaLabel="oval-loading" wrapperStyle={{}} wrapperClass="" /></div> : slettedeOpgaver.length > 0 ? slettedeOpgaver.map((opgave) => {
                return (
                  <div className={TableCSS.opgaveListing} key={opgave._id}>
                    <ul>
                      <li>#{opgave._id.slice(opgave._id.length - 3, opgave._id.length)}</li>
                      <li style={{display: "flex", flexDirection: "column", alignItems: "flex-start"}}>{opgave.navn}{(opgave.virksomhed || opgave.CVR) && <br />}<span className={SlettedeOpgaverCSS.opgaveVirksomhedNavn}>{(opgave.virksomhed && opgave.virksomhed) || (opgave.CVR && "CVR.: " + opgave.CVR)}</span></li>
                      <li>{opgave.adresse}</li>
                      <li>{dayjs(opgave.isDeleted).fromNow()}</li>
                    </ul>
                    <Link className={TableCSS.link} to={`../opgave/${opgave._id}`}>
                      <button className={TableCSS.button}>Åbn</button>
                    </Link>
                  </div>
                )
              }) : <div className={TableCSS.noResults}><p>Ingen slettede opgaver fundet.</p></div>}
            </div>
          </div>
        </div>
      </div>
      <div className={SlettedeOpgaverCSS.mobileTable}>
          <div className={TableCSS.opgaveListe}>
            <h2 className={TableCSS.tabelHeader}>Slettede opgaver ({slettedeOpgaver ? slettedeOpgaver.length : 0})</h2>
            <div className={TableCSS.opgaveTabel}>
            <div className={`${TableCSS.opgaveHeader} ${SlettedeOpgaverCSS.slettedeOpgaverHeader}`}>
              <ul>
                <li>Kunde</li>
                <li>Adresse</li>
                <li>Slettet</li>
              </ul>
            </div>
            <div className={`${TableCSS.opgaveBody} ${SlettedeOpgaverCSS.slettedeOpgaverBody}`}>
              {isLoading ? <div className={TableCSS.loadingSubmission}><BarLoader color="#59bf1a" width={100} ariaLabel="oval-loading" wrapperStyle={{}} wrapperClass="" /></div> : slettedeOpgaver.length > 0 ? slettedeOpgaver.map((opgave) => {
                return (
                  <div className={TableCSS.opgaveListing} key={opgave._id} onClick={() => navigate(`../opgave/${opgave._id}`)}>
                    <ul>
                    <li style={{display: "flex", flexDirection: "column", alignItems: "flex-start"}}>{opgave.navn}{(opgave.virksomhed || opgave.CVR) && <br />}<span className={SlettedeOpgaverCSS.opgaveVirksomhedNavn}>{(opgave.virksomhed && opgave.virksomhed) || (opgave.CVR && "CVR.: " + opgave.CVR)}</span></li>
                      <li>{opgave.adresse}</li>
                      <li>{dayjs(opgave.isDeleted).fromNow()}</li>
                    </ul>
                  </div>
                )
              }) : <div className={TableCSS.noResults}><p>Ingen slettede opgaver fundet.</p></div>}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default SlettedeOpgaver
