import TableCSS from './Table.module.css'
import Styles from './CustomersTasks.module.css'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuthContext } from "../../hooks/useAuthContext.js"
import BarLoader from '../loaders/BarLoader.js'
import axios from 'axios'
import dayjs from 'dayjs'
import { useNavigate } from 'react-router-dom';

const CustomersTasks = ({kunde, kundeID, userID}) => {

    const [kundensOpgaver, setKundensOpgaver] = useState([])
    const {user} = useAuthContext()
    const [isLoading, setIsLoading] = useState(true)
    const navigate = useNavigate();

  useEffect(() => {
    if (kundeID) {
        axios.get(`${import.meta.env.VITE_API_URL}/opgaver/kunde/${kundeID}`, { 
            headers: {
                "Authorization": `Bearer ${user.token}`
            }
        })
        .then(res => {
            setKundensOpgaver(res.data)
            setIsLoading(false)
        })
        .catch(error => console.log(error))
    }
  }, [])

  const åbnOpgave = (opgaveID) => {
    navigate(`../opgave/${opgaveID}`);
  }

  return (
        <div className={`${TableCSS.opgaveListe} ${Styles.container}`}>
            <div className={`${TableCSS.opgaveTabel} ${Styles.opgaveTabelDesktop}`}>
                <div className={`${TableCSS.opgaveHeader} ${Styles.customersTasksHeader}`}>
                    <ul>
                        <li>Oprettet</li>
                        <li>Beskrivelse</li>
                        <li>Ansvarlige</li>
                        <li>Status</li>
                    </ul>
                </div>
                <div className={`${TableCSS.opgaveBody} ${Styles.customersTasksBody}`}>
                    {isLoading ? 
                    <div className={TableCSS.loadingSubmission}><BarLoader color="#59bf1a" width={100} ariaLabel="oval-loading" wrapperStyle={{}} wrapperClass="" /></div> : kundensOpgaver.length > 0 ? kundensOpgaver.map((opgave) => {

                        return (
                        <div className={`${TableCSS.opgaveListing} ${Styles.clickableListingItem}`} key={opgave._id} onClick={() => åbnOpgave(opgave._id)}>
                            <ul>
                                <li>{dayjs(opgave.createdAt).format('D. MMMM YYYY')}</li>
                                <li>{opgave.opgaveBeskrivelse.slice(0, 150)}{opgave.opgaveBeskrivelse.length > 150 ? "..." : ""}</li>
                                <li>{opgave.ansvarlig.length > 0 ? opgave.ansvarlig.map(ansvarlig => ansvarlig.navn).join(", ") : "Ikke uddelegeret."}</li>
                                <li>{opgave.opgaveAfsluttet ? "Afsluttet" : "Åben"}</li>
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

export default CustomersTasks
