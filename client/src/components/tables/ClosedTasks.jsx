import TableCSS from './Table.module.css'
import ClosedTasksCSS from './ClosedTasks.module.css'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuthContext } from "../../hooks/useAuthContext.js"
import BarLoader from '../loaders/BarLoader.js'

const ClosedTasks = () => {

  const [afsluttedeOpgaver, setAfsluttedeOpgaver] = useState(null)
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
        const færdigeOpgaver = json.filter(opgave => opgave.markeretSomFærdig && !opgave.isDeleted);
        const betalteOpgaver = færdigeOpgaver.filter(opgave => opgave.opgaveBetalt);
        setAfsluttedeOpgaver(betalteOpgaver);
      }
      setIsLoading(false)
    }

    if (user) {
      fetchOpgaver()
    }
  }, [user])

  return (
        <div className={TableCSS.opgaveListe}>
          <h2 className={TableCSS.tabelHeader}>Afsluttede opgaver</h2>
          <div className={TableCSS.opgaveTabel}>
            <div className={`${TableCSS.opgaveHeader} ${ClosedTasksCSS.closedTasksHeader}`}>
              <ul>
              <li>ID</li>
                <li>Udføres</li>
                <li>Kunde</li>
                <li>Adresse</li>
                <li>Ansvarlig</li>
              </ul>
            </div>
            <div className={`${TableCSS.opgaveBody} ${ClosedTasksCSS.closedTasksBody}`}>
              {isLoading ? <div className={TableCSS.loadingSubmission}><BarLoader color="#59bf1a" width={100} ariaLabel="oval-loading" wrapperStyle={{}} wrapperClass="" /></div> : afsluttedeOpgaver.length > 0 ? afsluttedeOpgaver.map((opgave) => {
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
              }) : <div className={TableCSS.noResults}><p>Ingen afsluttede opgaver fundet.</p></div>}
            </div>
          </div>
        </div>
      
  )
}

export default ClosedTasks
