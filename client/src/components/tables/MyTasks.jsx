import TableCSS from './Table.module.css'
import Styles from './MyTasks.module.css'
import DelegatedTasksCSS from './DelegatedTasks.module.css'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuthContext } from "../../hooks/useAuthContext.js"
import axios from 'axios'

const MyTasks = () => {

  const [mineAktuelleOpgaver, setMineAktuelleOpgaver] = useState([])
  const {user} = useAuthContext()

  const userID = user.id;

  useEffect(()=>{
    axios.get(`${import.meta.env.VITE_API_URL}/opgaver`, {
        headers: {
            "Authorization": `Bearer ${user.token}`
        }
    })
    .then(res => {
        const filterMineOpgaver = res.data.filter((opgave) => 
            opgave.ansvarlig.some(ansvarlig => ansvarlig._id === userID)
        );
        const filterAktuelleOpgaver = filterMineOpgaver.filter((opgave) => 
            opgave.markeretSomFærdig === true
        );
        setMineAktuelleOpgaver(filterMineOpgaver)
    })
    .catch(error => console.log(error))
  }, [])

  return (
        <div className={`${TableCSS.opgaveListe} ${Styles.container}`}>
            <h2 className={TableCSS.tabelHeader}>Dine igangværende opgaver ({mineAktuelleOpgaver.length})</h2>
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
                    {mineAktuelleOpgaver && mineAktuelleOpgaver.map((opgave) => {
                        return (
                        <div className={TableCSS.opgaveListing} key={opgave._id}>
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

export default MyTasks
