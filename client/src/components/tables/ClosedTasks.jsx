import TableCSS from './Table.module.css'
import ClosedTasksCSS from './ClosedTasks.module.css'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuthContext } from "../../hooks/useAuthContext.js"
import BarLoader from '../loaders/BarLoader.js'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import * as beregn from '../../utils/beregninger.js'

const ClosedTasks = () => {

  const navigate = useNavigate()
  const [afsluttedeOpgaver, setAfsluttedeOpgaver] = useState(null)
  const [kunder, setKunder] = useState([])
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
        const afsluttedeOpgaver = json.filter(opgave => (opgave.opgaveAfsluttet || opgave.opgaveBetaltMedMobilePay || opgave.markeretSomFærdig) && !opgave.isDeleted);
        setAfsluttedeOpgaver(afsluttedeOpgaver);
      }
      setIsLoading(false)
    }

    if (user) {
      fetchOpgaver()
    }
  }, [user])

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
                  const kunde = kunder?.find(kunde => kunde._id === opgave.kundeID)
                  let momsvisning;
                
                  if(kunde?.virksomhed || kunde?.CVR) {
                    momsvisning = false;
                  } else {
                    momsvisning = true;
                  }
                  
                  const fakturabeløbForOpgave = beregn.totalPris(posteringerForOpgave, 2, momsvisning)?.beløb;
                  const fakturabeløbForOpgaveEksklMoms = beregn.totalPris(posteringerForOpgave, 2, false)?.beløb;
                  const honorarBeløbForOpgave = beregn.totalHonorar(posteringerForOpgave, 2, false)?.beløb;
                  const dbBeløb = fakturabeløbForOpgaveEksklMoms - honorarBeløbForOpgave;
                  let opgaveBetalt = false;
                  const betalingerForOpgave = posteringerForOpgave.reduce((acc, postering) => acc + postering.betalinger.reduce((acc, betaling) => acc + betaling.betalingsbeløb, 0), 0);
                  if(betalingerForOpgave >= fakturabeløbForOpgave) {
                    opgaveBetalt = true;
                  }

                  return (
                    <div className={TableCSS.opgaveListing} key={opgave._id} style={{backgroundColor: opgaveBetalt ? "" : "#EED20280"}}>
                      <ul>
                        <li>#{opgave._id.slice(opgave._id.length - 3, opgave._id.length)}</li>
                        <li style={{display: "flex", flexDirection: "column", alignItems: "flex-start"}}>{kunde?.navn}{(kunde?.virksomhed || kunde?.CVR) && <br />}<span className={ClosedTasksCSS.opgaveVirksomhedNavn}>{(kunde?.virksomhed && kunde?.virksomhed) || (kunde?.CVR && "CVR.: " + kunde?.CVR)}</span></li>
                        <li>{new Date(opgave.opgaveAfsluttet).toLocaleDateString()}</li>
                        <li>{fakturabeløbForOpgave?.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</li>
                        <li>{dbBeløb?.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</li>
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
                  const kunde = kunder?.find(kunde => kunde._id === opgave.kundeID)
                  let momsvisning;
                
                  if(kunde?.virksomhed || kunde?.CVR) {
                    momsvisning = false;
                  } else {
                    momsvisning = true;
                  }
                  
                  const fakturabeløbForOpgave = beregn.totalPris(posteringerForOpgave, 2, momsvisning)?.beløb;
                  const fakturabeløbForOpgaveEksklMoms = beregn.totalPris(posteringerForOpgave, 2, false)?.beløb;
                  const honorarBeløbForOpgave = beregn.totalHonorar(posteringerForOpgave, 2, false)?.beløb;
                  const dbBeløb = fakturabeløbForOpgaveEksklMoms - honorarBeløbForOpgave;

                  let opgaveBetalt = false;
                  const betalingerForOpgave = posteringerForOpgave.reduce((acc, postering) => acc + postering.betalinger.reduce((acc, betaling) => acc + betaling.betalingsbeløb, 0), 0);
                  if(betalingerForOpgave >= fakturabeløbForOpgave) {
                    opgaveBetalt = true;
                  }

                  return (
                    <div className={TableCSS.opgaveListing} key={opgave._id} style={{backgroundColor: opgaveBetalt ? "" : "#EED20280"}} onClick={() => navigate(`../opgave/${opgave._id}`)}>
                      <ul>
                        <li>{new Date(opgave.opgaveAfsluttet).toLocaleDateString()}</li>
                        <li style={{display: "flex", flexDirection: "column", alignItems: "flex-start"}}>{kunde?.navn}{(kunde?.virksomhed || kunde?.CVR) && <br />}<span className={ClosedTasksCSS.opgaveVirksomhedNavn}>{(kunde?.virksomhed && kunde?.virksomhed) || (kunde?.CVR && "CVR.: " + kunde?.CVR)}</span></li>
                        <li>{fakturabeløbForOpgave?.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</li>
                        <li>{dbBeløb?.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</li>
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
