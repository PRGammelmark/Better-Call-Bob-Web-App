import TableCSS from './Table.module.css'
import Styles from './MyTasks.module.css'
import MyTasksCSS from './MyTasks.module.css'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuthContext } from "../../hooks/useAuthContext.js"
import BarLoader from '../loaders/BarLoader.js'
import axios from 'axios'
import dayjs from 'dayjs'
import { useNavigate } from 'react-router-dom';
const MyTasks = ({openTableEvent}) => {

  const [mineAktuelleOpgaver, setMineAktuelleOpgaver] = useState([])
  const [kunder, setKunder] = useState(null)
  const [mineBesøg, setMineBesøg] = useState([])
  const {user} = useAuthContext()
  const [isLoading, setIsLoading] = useState(true)
  const userID = user.id;
  const navigate = useNavigate();
  
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
        const filterAktuelleOpgaver = filterMineOpgaver.filter((opgave) => 
            opgave.markeretSomFærdig === false
        );
        setMineAktuelleOpgaver(filterAktuelleOpgaver)
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
    .catch(error => {
        console.log("Ingen besøg fundet for nuværende bruger.")
    });
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

  const åbnOpgave = (opgaveID) => {
    navigate(`../opgave/${opgaveID}`);
  }

  return (
        <div className={`${TableCSS.opgaveListe} ${Styles.container}`}>
            {mineAktuelleOpgaver.length > 0 ? mineAktuelleOpgaver.length === 1 ? <h2 className={TableCSS.tabelHeader}>Du har 1 åben opgave</h2> : <h2 className={TableCSS.tabelHeader}>Du har {mineAktuelleOpgaver.length} åbne opgaver</h2> : <h2 className={TableCSS.tabelHeader}>Du har ingen åbne opgaver</h2>}
            <div className={`${TableCSS.opgaveTabel} ${Styles.opgaveTabelDesktop}`}>
                <div className={`${TableCSS.opgaveHeader} ${MyTasksCSS.myTasksHeader}`}>
                    <ul>
                        <li>ID</li>
                        <li>Næste besøg</li>
                        <li>Kunde</li>
                        <li>Adresse</li>
                    </ul>
                </div>
                <div className={`${TableCSS.opgaveBody} ${MyTasksCSS.myTasksBody}`}>
                    {isLoading ? 
                    <div className={TableCSS.loadingSubmission}><BarLoader color="#59bf1a" width={100} ariaLabel="oval-loading" wrapperStyle={{}} wrapperClass="" /></div> : mineAktuelleOpgaver.length > 0 ? mineAktuelleOpgaver.map((opgave) => {
                        const besøg = findTættesteBesøg(opgave._id);
                        const { tættesteBesøg, tættesteBesøgID } = besøg || {};
                        const kunde = kunder?.find(kunde => kunde._id === opgave.kundeID)

                        return (
                        <div className={TableCSS.opgaveListing} key={opgave._id}>
                            <ul>
                            <li>#{opgave._id.slice(opgave._id.length - 3, opgave._id.length)}</li>
                            <li>{tættesteBesøg ? <span onClick={() => openTableEvent(besøg)} className={Styles.planlagtBesøgButton}>{dayjs(tættesteBesøg).format('D/MM, [kl.] HH:mm')}</span> : <Link className={TableCSS.link} to={`../opgave/${opgave._id}`}><span className={Styles.planlægBesøgButton}>Planlæg besøg</span></Link>}</li>
                            <li style={{display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "center"}}>{kunde?.navn}{(kunde?.virksomhed || kunde?.CVR) && <br />}<span className={Styles.opgaveVirksomhedNavn}>{(kunde?.virksomhed && kunde?.virksomhed) || (kunde?.CVR && "CVR.: " + kunde?.CVR)}</span></li>
                            <li>{kunde?.adresse}</li>
                            </ul>
                            <Link className={TableCSS.link} to={`../opgave/${opgave._id}`}>
                            <button className={TableCSS.button}>Åbn</button>
                            </Link>
                        </div>
                        )
                    }) 
                    : 
                    <div className={TableCSS.noResults}>
                        <p>Ingen åbne opgaver fundet.</p>
                    </div>}
                </div>
            </div>
            <div className={`${TableCSS.opgaveTabel} ${Styles.opgaveTabelMobile}`}>
                <div className={`${TableCSS.opgaveHeader} ${MyTasksCSS.myTasksHeader}`}>
                    <ul>
                        <li>Kunde</li>
                        <li>Adresse</li>
                        <li>Næste besøg</li>
                    </ul>
                </div>
                <div className={`${TableCSS.opgaveBody} ${MyTasksCSS.myTasksBody}`}>
                    {isLoading ? 
                    <div className={TableCSS.loadingSubmission}><BarLoader color="#59bf1a" width={100} ariaLabel="oval-loading" wrapperStyle={{}} wrapperClass="" /></div> : mineAktuelleOpgaver.length > 0 ? mineAktuelleOpgaver.map((opgave) => {
                        const besøg = findTættesteBesøg(opgave._id);
                        const { tættesteBesøg, tættesteBesøgID } = besøg || {};
                        const kunde = kunder?.find(kunde => kunde._id === opgave.kundeID)

                        return (
                        <div className={TableCSS.opgaveListing} key={opgave._id} onClick={() => åbnOpgave(opgave._id)}>
                            <ul>
                                <li style={{display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "center"}}>{kunde?.navn}{(kunde?.virksomhed || kunde?.CVR) && <br />}<span className={Styles.opgaveVirksomhedNavn}>{(kunde?.virksomhed && kunde?.virksomhed) || (kunde?.CVR && "CVR.: " + kunde?.CVR)}</span></li>
                                <li>{kunde?.adresse}</li>
                                <li>{tættesteBesøg ? <span onClick={() => openTableEvent(besøg)} className={Styles.planlagtBesøgButton}>{dayjs(tættesteBesøg).format('D/MM, [kl.] HH:mm')}</span> : <Link className={TableCSS.link} to={`../opgave/${opgave._id}`}><span className={Styles.planlægBesøgButton}>Planlæg besøg</span></Link>}</li>
                            </ul>
                        </div>
                        )
                    }) 
                    : 
                    <div className={TableCSS.noResults}>
                        <p>Ingen åbne opgaver fundet.</p>
                    </div>}
                </div>
            </div>
        </div>
  )
}

export default MyTasks
