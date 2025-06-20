import TableCSS from './Table.module.css'
import Styles from './MyTasks.module.css'
import MyEarlierTasksCSS from './MyEarlierTasks.module.css'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuthContext } from "../../hooks/useAuthContext.js"
import BarLoader from '../loaders/BarLoader.js'
import axios from 'axios'
import dayjs from 'dayjs'
import { useNavigate } from 'react-router-dom';

const MyEarlierTasks = ({openTableEvent}) => {

  const [mineAfsluttedeOpgaver, setMineAfsluttedeOpgaver] = useState([])
  const [mineBesøg, setMineBesøg] = useState([])
  const [minePosteringer, setMinePosteringer] = useState([])
  const [kunder, setKunder] = useState(null)
  const {user} = useAuthContext()
  const [isLoading, setIsLoading] = useState(true)
  const userID = user?.id || user?._id;
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
        const filterAfsluttedeOpgaver = filterMineOpgaver.filter((opgave) => 
            opgave.markeretSomFærdig === true
        );
        setMineAfsluttedeOpgaver(filterAfsluttedeOpgaver)
        setIsLoading(false)
    })
    .catch(error => console.log(error))

    axios.get(`${import.meta.env.VITE_API_URL}/posteringer/bruger/${userID}`, {
        headers: {
            "Authorization": `Bearer ${user.token}`
        }
    })
    .then(res => {
        setMinePosteringer(res.data)
        console.log(res.data)
    })
    .catch(error => console.log(error))
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
        <div className={`${TableCSS.opgaveListe} ${MyEarlierTasksCSS.container}`}>
            {mineAfsluttedeOpgaver.length > 0 && <h2>Afsluttede opgaver</h2>}
            <div className={`${TableCSS.opgaveTabel} ${MyEarlierTasksCSS.opgaveTabelDesktop}`}>
                <div className={`${TableCSS.opgaveHeader} ${MyEarlierTasksCSS.myTasksHeader}`}>
                    <ul>
                        <li>ID</li>
                        <li>Kunde</li>
                        <li>Adresse</li>
                        <li>Udbetaling (tjent)</li>
                    </ul>
                </div>
                <div className={`${TableCSS.opgaveBody} ${MyEarlierTasksCSS.myTasksBody}`}>
                    {isLoading ? 
                    <div className={TableCSS.loadingSubmission}><BarLoader color="#59bf1a" width={100} ariaLabel="oval-loading" wrapperStyle={{}} wrapperClass="" /></div> : mineAfsluttedeOpgaver.length > 0 ? mineAfsluttedeOpgaver.map((opgave) => {
                        
                        const minePosteringer = opgave.posteringer.filter((postering) => postering.brugerID === userID);
                        const posteringTotalHonorar = minePosteringer.reduce((sum, postering) => sum + postering.totalHonorar, 0);
                        const posteringTotalUdlæg = minePosteringer.reduce((sum, postering) => sum + postering.udlæg.reduce((sum, udlæg) => sum + udlæg.beløb, 0), 0);
                        const posteringTotalTjent = posteringTotalHonorar - posteringTotalUdlæg;
                        const kunde = kunder?.find(kunde => kunde._id === opgave.kundeID)

                        return (
                        <div className={TableCSS.opgaveListing} key={opgave._id}>
                            <ul>
                            <li>#{opgave._id.slice(opgave._id.length - 3, opgave._id.length)}</li>
                            <li style={{display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "center"}}>{kunde?.navn}{(kunde?.virksomhed || kunde?.CVR) && <br />}<span className={MyEarlierTasksCSS.opgaveVirksomhedNavn}>{(kunde?.virksomhed && kunde?.virksomhed) || (kunde?.CVR && "CVR.: " + kunde?.CVR)}</span></li>
                            <li>{kunde?.adresse}</li>
                            <li>{posteringTotalHonorar} kr. <span style={{color: "#59bf1a", marginLeft: "5px"}}>({posteringTotalTjent} kr.)</span></li>
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
            <div className={`${TableCSS.opgaveTabel} ${MyEarlierTasksCSS.opgaveTabelMobile}`}>
                <div className={`${TableCSS.opgaveHeader} ${MyEarlierTasksCSS.myTasksHeader}`}>
                    <ul>
                        <li>Kunde</li>
                        <li>Adresse</li>
                        <li>Udbetaling (tjent)</li>
                    </ul>
                </div>
                <div className={`${TableCSS.opgaveBody} ${MyEarlierTasksCSS.myTasksBody}`}>
                    {isLoading ? 
                    <div className={TableCSS.loadingSubmission}><BarLoader color="#59bf1a" width={100} ariaLabel="oval-loading" wrapperStyle={{}} wrapperClass="" /></div> : mineAfsluttedeOpgaver.length > 0 ? mineAfsluttedeOpgaver.map((opgave) => {
                        const posteringerForOpgave = minePosteringer.filter((postering) => postering.opgaveID === opgave._id);
                        const posteringTotalHonorar = posteringerForOpgave.reduce((sum, postering) => sum + postering.totalHonorar, 0);
                        const posteringTotalUdlæg = posteringerForOpgave.reduce((sum, postering) => sum + postering.udlæg.reduce((sum, udlæg) => sum + udlæg.beløb, 0), 0);
                        const posteringTotalTjent = posteringTotalHonorar - posteringTotalUdlæg;
                        const kunde = kunder?.find(kunde => kunde._id === opgave.kundeID)

                        return (
                        <div className={TableCSS.opgaveListing} key={opgave._id} onClick={() => åbnOpgave(opgave._id)}>
                            <ul>
                                <li style={{display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "center"}}>{kunde?.navn}{(kunde?.virksomhed || kunde?.CVR) && <br />}<span className={MyEarlierTasksCSS.opgaveVirksomhedNavn}>{(kunde?.virksomhed && kunde?.virksomhed) || (kunde?.CVR && "CVR.: " + kunde?.CVR)}</span></li>
                                <li>{kunde?.adresse}</li>
                                <li style={{display: "flex", flexDirection: "row"}}>{posteringTotalHonorar} kr. <span style={{color: "#59bf1a", marginLeft: "5px"}}>({posteringTotalTjent} kr.)</span></li>
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

export default MyEarlierTasks