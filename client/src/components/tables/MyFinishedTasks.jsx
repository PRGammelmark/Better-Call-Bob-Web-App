import TableCSS from './Table.module.css'
import Styles from './MyTasks.module.css'
import MyTasksCSS from './MyTasks.module.css'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuthContext } from "../../hooks/useAuthContext.js"
import BarLoader from '../loaders/BarLoader.js'
import axios from 'axios'
import dayjs from 'dayjs'

const MyTasks = ({openTableEvent}) => {

  const [mineFærdigeOpgaver, setMineFærdigeOpgaver] = useState([])
  const [mineBesøg, setMineBesøg] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const {user} = useAuthContext()
  const [kunder, setKunder] = useState(null)
  const userID = user?.id || user?._id;

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
    axios.get(`${import.meta.env.VITE_API_URL}/opgaver`, {
        headers: {
            "Authorization": `Bearer ${user.token}`
        }
    })
    .then(res => {
        const filterMineOpgaver = res.data.filter((opgave) => 
            opgave.ansvarlig.some(ansvarlig => ansvarlig._id === userID)
        );
        const filterFærdigeOpgaver = filterMineOpgaver.filter((opgave) => 
          ((opgave.markeretSomFærdig || opgave.opgaveAfsluttet) && !opgave.isDeleted)
        );
        setMineFærdigeOpgaver(filterFærdigeOpgaver)
        setIsLoading(false)
    })
    .catch(error => console.log(error))
  }, [])

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/besoeg/bruger/${userID}`, {
        headers: {
            "Authorization": `Bearer ${user.token}`
        }
    })
    .then(res => {
        setMineBesøg(res.data);
    })
    .catch(error => console.log(error));
}, [userID]);

const findTættesteBesøg = (opgaveID) => {
    const now = dayjs();

    // Filter besøg that matches opgaveID and has datoTidFra today or in the future
    const futureBesøg = mineBesøg
      .filter(besøg => besøg.opgaveID === opgaveID && dayjs(besøg.datoTidFra).isAfter(now))
      .sort((a, b) => dayjs(a.datoTidFra).diff(dayjs(b.datoTidFra))); // Sort by closest date

    // Return the closest one or null if no match
    return futureBesøg.length > 0 
        ? { tættesteBesøg: futureBesøg[0].datoTidFra, tættesteBesøgID: futureBesøg[0]._id }
        : null;
  };

  return (
        <div className={`${TableCSS.opgaveListe} ${Styles.container}`}>
            <h2 className={TableCSS.tabelHeader}>Du har {mineAktuelleOpgaver.length} åbne opgaver</h2>
            <div className={TableCSS.opgaveTabel}>
                <div className={`${TableCSS.opgaveHeader} ${MyTasksCSS.myTasksHeader}`}>
                    <ul>
                        <li>ID</li>
                        <li>Næste besøg</li>
                        <li>Kunde</li>
                        <li>Adresse</li>
                    </ul>
                    </div>
                    <div className={`${TableCSS.opgaveBody} ${MyTasksCSS.myTasksBody}`}>
                    {mineAktuelleOpgaver && mineAktuelleOpgaver.map((opgave) => {
                        const besøg = findTættesteBesøg(opgave._id);
                        const { tættesteBesøg, tættesteBesøgID } = besøg || {};
                        const kunde = kunder?.find(kunde => kunde._id === opgave.kundeID)

                        return (
                        <div className={TableCSS.opgaveListing} key={opgave._id}>
                            <ul>
                            <li>#{opgave._id.slice(opgave._id.length - 3, opgave._id.length)}</li>
                            <li>{tættesteBesøg ? <span onClick={() => openTableEvent(besøg)} className={Styles.planlagtBesøgButton}>{dayjs(tættesteBesøg).format('D/MM, [kl.] HH:mm')}</span> : <Link className={TableCSS.link} to={`../opgave/${opgave._id}`}><span className={Styles.planlægBesøgButton}>Planlæg besøg</span></Link>}</li>
                            <li>{kunde?.navn}{(kunde?.virksomhed || kunde?.CVR) && <br />}{(kunde?.virksomhed && "@ " + kunde?.virksomhed) || (kunde?.CVR && "@ cvr.: " + kunde?.CVR)}</li>
                            <li>{kunde?.adresse}</li>
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
