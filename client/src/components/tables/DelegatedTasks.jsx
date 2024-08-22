import TableCSS from './Table.module.css'
import DelegatedTasksCSS from './DelegatedTasks.module.css'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuthContext } from "../../hooks/useAuthContext.js"

const DelegatedTasks = () => {

  const [uddelegeredeOpgaver, setUddelegeredeOpgaver] = useState(null)
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
        const filteredOpgaver = json.filter(opgave => opgave.ansvarlig.length > 0);
        setUddelegeredeOpgaver(filteredOpgaver);
      }
    }

    if (user) {
      fetchOpgaver()
    }
  }, [user])

  return (
        <div className={TableCSS.opgaveListe}>
          <h2 className={TableCSS.tabelHeader}>Uddelegerede opgaver</h2>
          <div className={TableCSS.opgaveTabel}>
          <div className={`${TableCSS.opgaveHeader} ${DelegatedTasksCSS.delegatedTasksHeader}`}>
              <ul>
                <li>ID</li>
                <li>Udføres</li>
                <li>Kunde</li>
                <li>Adresse</li>
                <li>Ansvarlig</li>
              </ul>
            </div>
            <div className={`${TableCSS.opgaveBody} ${DelegatedTasksCSS.delegatedTasksBody}`}>
              {uddelegeredeOpgaver && uddelegeredeOpgaver.map((opgave) => {
                return (
                  <div className={TableCSS.opgaveListing}>
                    <ul>
                      <li>#{opgave._id.slice(opgave._id.length - 3, opgave._id.length)}</li>
                      <li>{new Date(opgave.createdAt).toLocaleDateString()}</li>
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

export default DelegatedTasks
