import TableCSS from './Table.module.css'
import ClosedTasksCSS from './ClosedTasks.module.css'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuthContext } from "../../hooks/useAuthContext.js"
import BarLoader from '../loaders/BarLoader.js'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const ClosedTasks = () => {

  const navigate = useNavigate()
  const [afsluttedeOpgaver, setAfsluttedeOpgaver] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [posteringer, setPosteringer] = useState(null)
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
        const afsluttedeOpgaver = json.filter(opgave => (opgave.opgaveAfsluttet || opgave.opgaveBetaltMedMobilePay) && !opgave.isDeleted);
        setAfsluttedeOpgaver(afsluttedeOpgaver);
      }
      setIsLoading(false)
    }

    if (user) {
      fetchOpgaver()
    }
  }, [user])

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/posteringer`, {
      headers: {
        'Authorization': `Bearer ${user.token}`
      }
    })
    .then(res => {
      setPosteringer(res.data)
    })
    .catch(err => {
      console.log(err)
    })
  }, [user])

  function beregnFakturaBeløb(posteringer) {
    if (!Array.isArray(posteringer)) return 0; // Ensure posteringer is an array
    
    const handymanTotal = Array.isArray(posteringer) 
      ? posteringer.reduce((sum, postering) => sum + ((postering.handymanTimer || 0) * 447.2), 0)
      : 0;
  
    const tømrerTotal = Array.isArray(posteringer) 
      ? posteringer.reduce((sum, postering) => sum + ((postering.tømrerTimer || 0) * 480), 0)
      : 0;
  
    const opstartTotal = Array.isArray(posteringer) 
      ? posteringer.reduce((sum, postering) => sum + (((postering.opstart || 0) / 200) * 319), 0)
      : 0;
  
    const udlægTotal = Array.isArray(posteringer) 
      ? posteringer.reduce((sum, postering) => 
          sum + (Array.isArray(postering.udlæg) 
            ? postering.udlæg.reduce((innerSum, item) => innerSum + Number(item.beløb || 0), 0) 
            : 0), 
          0
        )
      : 0;
  
    const øvrigtTotal = Array.isArray(posteringer) 
      ? posteringer.reduce((sum, postering) => 
          sum + (Array.isArray(postering.øvrigt) 
            ? postering.øvrigt.reduce((innerSum, item) => innerSum + Number(item.beløb || 0), 0) 
            : 0), 
          0
        )
      : 0;
  
    const totalBeløb = handymanTotal + tømrerTotal + opstartTotal + udlægTotal + øvrigtTotal;
    return totalBeløb;
  }

  function beregnHonorarBeløb(posteringer) {
    if (!Array.isArray(posteringer)) return 0; // Ensure posteringer is an array
    
    const handymanTotal = Array.isArray(posteringer) 
      ? posteringer.reduce((sum, postering) => sum + ((postering.handymanTimer || 0) * 300), 0)
      : 0;
  
    const tømrerTotal = Array.isArray(posteringer) 
      ? posteringer.reduce((sum, postering) => sum + ((postering.tømrerTimer || 0) * 360), 0)
      : 0;
  
    const opstartTotal = Array.isArray(posteringer) 
      ? posteringer.reduce((sum, postering) => sum + (((postering.opstart || 0) / 200) * 200), 0)
      : 0;
  
    const udlægTotal = Array.isArray(posteringer) 
      ? posteringer.reduce((sum, postering) => 
          sum + (Array.isArray(postering.udlæg) 
            ? postering.udlæg.reduce((innerSum, item) => innerSum + Number(item.beløb || 0), 0) 
            : 0), 
          0
        )
      : 0;
  
    const øvrigtTotal = Array.isArray(posteringer) 
      ? posteringer.reduce((sum, postering) => 
          sum + (Array.isArray(postering.øvrigt) 
            ? postering.øvrigt.reduce((innerSum, item) => innerSum + Number(item.beløb || 0), 0) 
            : 0), 
          0
        )
      : 0;
  
    const totalHonorar = handymanTotal + tømrerTotal + opstartTotal + udlægTotal + øvrigtTotal;
    return totalHonorar;
  }

  return (
      <>
        <div className={ClosedTasksCSS.desktopTable}>
          <div className={TableCSS.opgaveListe}>
            <h2 className={TableCSS.tabelHeader}>Afsluttede opgaver ({afsluttedeOpgaver ? afsluttedeOpgaver.length : 0})</h2>
            <div className={TableCSS.opgaveTabel}>
              <div className={`${TableCSS.opgaveHeader} ${ClosedTasksCSS.closedTasksHeader}`}>
                <ul>
                  <li>ID</li>
                  <li>Kunde</li>
                  <li>Afsluttet</li>
                  <li>Faktura</li>
                  <li>Dækningsbidrag</li>
                </ul>
              </div>
              <div className={`${TableCSS.opgaveBody} ${ClosedTasksCSS.closedTasksBody}`}>
                {isLoading ? <div className={TableCSS.loadingSubmission}><BarLoader color="#59bf1a" width={100} ariaLabel="oval-loading" wrapperStyle={{}} wrapperClass="" /></div> : afsluttedeOpgaver.length > 0 ? afsluttedeOpgaver.map((opgave) => {
                  
                  const posteringerForOpgave = posteringer && posteringer.filter(postering => postering.opgaveID === opgave._id)
                  const fakturabeløbForOpgave = posteringerForOpgave ? posteringerForOpgave.reduce((sum, postering) => sum + postering.totalPris, 0) : 0;
                  const honorarBeløbForOpgave = posteringerForOpgave ? posteringerForOpgave.reduce((sum, postering) => sum + postering.totalHonorar, 0) : 0;
                  const dbBeløb = fakturabeløbForOpgave - honorarBeløbForOpgave;
                  return (
                    <div className={TableCSS.opgaveListing} key={opgave._id}>
                      <ul>
                        <li>#{opgave._id.slice(opgave._id.length - 3, opgave._id.length)}</li>
                        <li style={{display: "flex", flexDirection: "column", alignItems: "flex-start"}}>{opgave.navn}{(opgave.virksomhed || opgave.CVR) && <br />}<span className={ClosedTasksCSS.opgaveVirksomhedNavn}>{(opgave.virksomhed && opgave.virksomhed) || (opgave.CVR && "CVR.: " + opgave.CVR)}</span></li>
                        <li>{new Date(opgave.opgaveAfsluttet).toLocaleDateString()}</li>
                        <li>{fakturabeløbForOpgave.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</li>
                        <li>{dbBeløb.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</li>
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
        </div>
        <div className={ClosedTasksCSS.mobileTable}>
          <div className={TableCSS.opgaveListe}>
            <h2 className={TableCSS.tabelHeader}>Afsluttede opgaver ({afsluttedeOpgaver ? afsluttedeOpgaver.length : 0})</h2>
            <div className={TableCSS.opgaveTabel}>
              <div className={`${TableCSS.opgaveHeader} ${ClosedTasksCSS.closedTasksHeader}`}>
                <ul>
                  <li>Afsluttet</li>
                  <li>Kunde</li>
                  <li>Faktura</li>
                  <li>DB</li>
                </ul>
              </div>
              <div className={`${TableCSS.opgaveBody} ${ClosedTasksCSS.closedTasksBody}`}>
                {isLoading ? <div className={TableCSS.loadingSubmission}><BarLoader color="#59bf1a" width={100} ariaLabel="oval-loading" wrapperStyle={{}} wrapperClass="" /></div> : afsluttedeOpgaver.length > 0 ? afsluttedeOpgaver.map((opgave) => {
                  const posteringerForOpgave = posteringer && posteringer.filter(postering => postering.opgaveID === opgave._id)
                  const fakturabeløbForOpgave = posteringerForOpgave ? posteringerForOpgave.reduce((sum, postering) => sum + postering.totalPris, 0) : 0;
                  const honorarBeløbForOpgave = posteringerForOpgave ? posteringerForOpgave.reduce((sum, postering) => sum + postering.totalHonorar, 0) : 0;
                  const dbBeløb = fakturabeløbForOpgave - honorarBeløbForOpgave;
                  return (
                    <div className={TableCSS.opgaveListing} key={opgave._id} onClick={() => navigate(`../opgave/${opgave._id}`)}>
                      <ul>
                        <li>{new Date(opgave.opgaveAfsluttet).toLocaleDateString()}</li>
                        <li style={{display: "flex", flexDirection: "column", alignItems: "flex-start"}}>{opgave.navn}{(opgave.virksomhed || opgave.CVR) && <br />}<span className={ClosedTasksCSS.opgaveVirksomhedNavn}>{(opgave.virksomhed && opgave.virksomhed) || (opgave.CVR && "CVR.: " + opgave.CVR)}</span></li>
                        <li>{fakturabeløbForOpgave.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</li>
                        <li>{dbBeløb.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</li>
                      </ul>
                    </div>
                  )
                }) : <div className={TableCSS.noResults}><p>Ingen afsluttede opgaver fundet.</p></div>}
              </div>
            </div>
          </div>
        </div>
      </>
  )
}

export default ClosedTasks
