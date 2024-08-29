import TableCSS from './Table.module.css'
import OpenTasksCSS from './OpenTasks.module.css'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuthContext } from "../../hooks/useAuthContext.js"

const OpenTasks = () => {

  const [opgaver, setOpgaver] = useState(null)
  const {user} = useAuthContext()

  useEffect(()=>{
    const fetchOpgaver = async () => {
      const response = await fetch('http://localhost:3000/api/opgaver', {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      })
      const json = await response.json();

      if (response.ok) {
        const filteredOpgaverForAnsvarlige = json.filter(opgave => opgave.ansvarlig.length === 0);
        const filteredOpgaverForIkkeFærdiggjorte = filteredOpgaverForAnsvarlige.filter(opgave => opgave.markeretSomFærdig === false)
        setOpgaver(filteredOpgaverForIkkeFærdiggjorte);
      }
    }

    if (user) {
      fetchOpgaver()
    }
  }, [user])

  return (
        <div className={TableCSS.opgaveListe}>
          <h2 className={TableCSS.tabelHeader}>Åbne opgaver (database fetch)</h2>
          <div className={TableCSS.opgaveTabel}>
            <div className={`${TableCSS.opgaveHeader} ${OpenTasksCSS.openTasksHeader}`}>
              <ul>
                <li>ID</li>
                <li>Modtaget</li>
                <li>Status</li>
                <li>Kunde</li>
                <li>Adresse</li>
                <li>Ansvarlig</li>
              </ul>
            </div>
            <div className={`${TableCSS.opgaveBody} ${OpenTasksCSS.openTasksBody}`}>
              {opgaver && opgaver.map((opgave) => {
                return (
                  <div className={TableCSS.opgaveListing} key={opgave._id}>
                    <ul>
                      <li>#{opgave._id.slice(opgave._id.length - 3, opgave._id.length)}</li>
                      <li>{new Date(opgave.createdAt).toLocaleDateString()}</li>
                      <li>{opgave.status}</li>
                      <li>{opgave.navn}</li>
                      <li>{opgave.adresse}</li>
                      <li>{opgave.ansvarlig.length > 1 ? opgave.ansvarlig[0].navn + " + flere..." : opgave.ansvarlig.length > 0 ? opgave.ansvarlig[0].navn : "Ikke uddelegeret." }</li> 
                    </ul>
                    <Link className={TableCSS.link} to={`../opgave/${opgave._id}`}>
                      <button className={TableCSS.button}>Åbn</button>
                    </Link>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      
  )
}

export default OpenTasks
