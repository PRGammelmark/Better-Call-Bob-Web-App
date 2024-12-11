import { useState, useEffect, useCallback } from 'react'
import PageAnimation from '../components/PageAnimation'
import MyTasks from '../components/tables/MyTasks.jsx'
import Styles from './Overblik.module.css'
import axios from 'axios'
import { useAuthContext } from '../hooks/useAuthContext'
import dayjs from 'dayjs'
import { useNavigate } from 'react-router-dom'
import { useBesøg } from '../context/BesøgContext.jsx'
import ÅbenOpgaveCalendar from '../components/traditionalCalendars/ÅbenOpgaveCalendar.jsx'
import OpenTasks from '../components/tables/OpenTasks'
import PersonligtØkonomiskOverblik from '../components/okonomi/PersonligtØkonomiskOverblik'

const Overblik = () => {
  const {user} = useAuthContext();
    
  if (!user) {
    return
  }

  const navigate = useNavigate()

  const userID = user.id;
  
  const [brugere, setBrugere] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bruger, setBruger] = useState("")
  const [managerOverblik, setManagerOverblik] = useState(false)
  const [openDialog, setOpenDialog] = useState(false)
  const [eventData, setEventData] = useState(null)
  const [tilknyttetOpgave, setTilknyttetOpgave] = useState(null)
  const [aktueltBesøg, setAktueltBesøg] = useState(null)
  const { egneLedigeTider, egneBesøg, refetchLedigeTider, refetchBesøg, alleLedigeTider, alleBesøg, setEgneLedigeTider, setEgneBesøg, setAlleLedigeTider, setAlleBesøg, setRefetchLedigeTider, setRefetchBesøg } = useBesøg();

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/brugere/${userID}`, {
          headers: {
              'Authorization': `Bearer ${user.token}`
          }
      })
      .then(res => {
          setBruger(res.data)
      })
      .catch(error => console.log(error))
  }, [])

  useEffect(() => {
    if(user.isAdmin){
      setManagerOverblik(true)
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/brugere`, {
        headers: {
            'Authorization': `Bearer ${user.token}`
        }
    })
    .then(res => {
        setBrugere(res.data)
        console.log(res.data)
    })
    .catch(error => console.log(error))
}, [])

  const getBrugerName = (brugerID) => {
    const bruger = brugere && brugere.find(user => user._id === brugerID);
    return bruger ? bruger.navn : 'Unknown User';
};

  const openTableEvent = (besøg) => {
    const besøgID = besøg.tættesteBesøgID;
    const besøgTilÅbning = egneBesøg.find(besøg => besøg._id === besøgID);

    axios.get(`${import.meta.env.VITE_API_URL}/opgaver/${besøgTilÅbning.opgaveID}`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      })
      .then(res => {
        setTilknyttetOpgave(res.data)
      })
      .catch(error => console.log(error))

    setEventData(besøgTilÅbning);
    setOpenDialog(true);
  };

  if (loading) {
    return <div className={Styles.loadingContainer}>
    </div>
  }

  return (
    <PageAnimation>
      {managerOverblik && <div>
        <div className={Styles.overblikHeader}>
          <h1 className={`bold ${Styles.heading}`}>Manager-overblik 🧑‍💻</h1>
          <button onClick={() => setManagerOverblik(false)} className={Styles.transparentButton}>← Skift til personligt overblik</button>
        </div>
        <OpenTasks />
        <ÅbenOpgaveCalendar 
                        user={user} 
                        tilknyttetOpgave={tilknyttetOpgave}
                        setTilknyttetOpgave={setTilknyttetOpgave}
                        openDialog={openDialog}
                        setOpenDialog={setOpenDialog}
                        eventData={eventData}
                        setEventData={setEventData} 
                        aktueltBesøg={aktueltBesøg} 
                        brugere={brugere}
                        getBrugerName={getBrugerName}
                        egneLedigeTider={egneLedigeTider}
                        alleLedigeTider={alleLedigeTider}
                        egneBesøg={egneBesøg}
                        alleBesøg={alleBesøg}
                        setEgneLedigeTider={setEgneLedigeTider}
                        setEgneBesøg={setEgneBesøg}
                        refetchLedigeTider={refetchLedigeTider}
                        refetchBesøg={refetchBesøg}
                        setRefetchLedigeTider={setRefetchLedigeTider}
                        setRefetchBesøg={setRefetchBesøg}
                        setAlleLedigeTider={setAlleLedigeTider}
                        setAlleBesøg={setAlleBesøg}
                        userID={userID}
                        />

      </div>}
      
      {!managerOverblik && <div>
        <div className={Styles.overblikHeader}>
          <h1 className={`bold ${Styles.heading}`}>Dit personlige overblik 👨‍🔧</h1>
          {user.isAdmin && <button onClick={() => setManagerOverblik(true)} className={Styles.transparentButton}>Skift til manager-overblik →</button>}
        </div>
        <PersonligtØkonomiskOverblik user={user}/>
        <MyTasks openTableEvent={openTableEvent} />
        <ÅbenOpgaveCalendar 
                        user={user} 
                        tilknyttetOpgave={tilknyttetOpgave}
                        setTilknyttetOpgave={setTilknyttetOpgave}
                        openDialog={openDialog}
                        setOpenDialog={setOpenDialog}
                        eventData={eventData}
                        setEventData={setEventData} 
                        aktueltBesøg={aktueltBesøg} 
                        brugere={brugere}
                        getBrugerName={getBrugerName}
                        egneLedigeTider={egneLedigeTider}
                        alleLedigeTider={alleLedigeTider}
                        egneBesøg={egneBesøg}
                        alleBesøg={alleBesøg}
                        setEgneLedigeTider={setEgneLedigeTider}
                        setEgneBesøg={setEgneBesøg}
                        refetchLedigeTider={refetchLedigeTider}
                        refetchBesøg={refetchBesøg}
                        setRefetchLedigeTider={setRefetchLedigeTider}
                        setRefetchBesøg={setRefetchBesøg}
                        setAlleLedigeTider={setAlleLedigeTider}
                        setAlleBesøg={setAlleBesøg}
                        userID={userID}
                        />
      </div>}
    </PageAnimation>
  )
}

export default Overblik
