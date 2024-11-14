import TableCSS from './Table.module.css'
import SlettedeOpgaverCSS from './SlettedeOpgaver.module.css'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuthContext } from "../../hooks/useAuthContext.js"
import BarLoader from '../loaders/BarLoader.js'

const SlettedeOpgaver = () => {

  const [slettedeOpgaver, setSlettedeOpgaver] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
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
        const opgaverDerErSlettet = json.filter(opgave => opgave.isDeleted != null);
        setSlettedeOpgaver(opgaverDerErSlettet);
        setIsLoading(false)
      }
    }

    if (user) {
      fetchOpgaver()
    }
  }, [user])

  return (
        <div className={TableCSS.opgaveListe}>
          <h2 className={TableCSS.tabelHeader}>Slettede opgaver</h2>
          <div className={TableCSS.opgaveTabel}>
            <div className={`${TableCSS.opgaveHeader} ${SlettedeOpgaverCSS.slettedeOpgaverHeader}`}>
              <ul>
              <li>ID</li>
                <li>Udføres</li>
                <li>Kunde</li>
                <li>Adresse</li>
                <li>Ansvarlig</li>
              </ul>
            </div>
            <div className={`${TableCSS.opgaveBody} ${SlettedeOpgaverCSS.slettedeOpgaverBody}`}>
              {isLoading ? <div className={TableCSS.loadingSubmission}><BarLoader color="#59bf1a" width={100} ariaLabel="oval-loading" wrapperStyle={{}} wrapperClass="" /></div> : slettedeOpgaver.length > 0 ? slettedeOpgaver.map((opgave) => {
                return (
                  <div className={TableCSS.opgaveListing} key={opgave._id}>
                    <ul>
                      <li>#{opgave._id.slice(opgave._id.length - 3, opgave._id.length)}</li>
                      <li>{new Date(opgave.createdAt).toLocaleDateString()}</li>
                      <li>{opgave.navn}{(opgave.virksomhed || opgave.CVR) && <br />}{(opgave.virksomhed && "@ " + opgave.virksomhed) || (opgave.CVR && "@ cvr.: " + opgave.CVR)}</li>
                      <li>{opgave.adresse}</li>
                      <li>{opgave.ansvarlig.length > 1 ? opgave.ansvarlig[0].navn + " + flere..." : opgave.ansvarlig.length > 0 ? opgave.ansvarlig[0].navn : "Ikke uddelegeret." }</li>
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
      
  )
}

export default SlettedeOpgaver
