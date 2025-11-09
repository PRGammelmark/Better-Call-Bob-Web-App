import { useState, useEffect, useCallback } from 'react'
import PageAnimation from '../../components/PageAnimation'
import MyTasks from '../../components/tables/MyTasks.jsx'
import Styles from './Overblik.module.css'
import axios from 'axios'
import { useAuthContext } from '../../hooks/useAuthContext'
import dayjs from 'dayjs'
import { useNavigate } from 'react-router-dom'
import { useBesøg } from '../../context/BesøgContext.jsx'
import ÅbenOpgaveCalendar from '../../components/traditionalCalendars/ÅbenOpgaveCalendar.jsx'
import ManagerCalendar from '../../components/traditionalCalendars/ManagerCalendar.jsx'
import OpenTasks from '../../components/tables/OpenTasks'
import PersonligtØkonomiskOverblik from '../../components/okonomi/PersonligtØkonomiskOverblik'
import AdminØkonomiskOverblik from '../../components/okonomi/AdminØkonomiskOverblik'
import { useOverblikView } from '../../context/OverblikViewContext.jsx'
import { getHilsen } from '../../utils/hilsener.js'
import PopUpMenu from '../../components/basicComponents/PopUpMenu.jsx'
import { ArrowLeftRight } from 'lucide-react'
import OpgaverHurtigtAdminOverblik from '../../components/OpgaverHurtigtAdminOverblik'
import OpgaverHurtigtPersonligtOverblik from '../../components/OpgaverHurtigtPersonligtOverblik'
import OpgaverIDagAdminOverblik from '../../components/OpgaverIDagAdminOverblik'
// import ManagerOverblik from '../opgaver/ManagerOpgaver'

const Overblik = () => {
  const {user} = useAuthContext();
    
  if (!user) {
    return
  }

  const navigate = useNavigate()

  const userID = user?.id || user?._id;
  
  const [brugere, setBrugere] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bruger, setBruger] = useState("")
  const { managerOverblik, setManagerOverblik } = useOverblikView()
  const [openDialog, setOpenDialog] = useState(false)
  const [eventData, setEventData] = useState(null)
  const [opgaveTilknyttetBesøg, setOpgaveTilknyttetBesøg] = useState(null)
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
    } else {
      setManagerOverblik(false)
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
    })
    .catch(error => console.log(error))
}, [])

  const getBrugerName = (brugerID) => {
    const bruger = brugere && brugere.find(user => (user?._id || user?.id) === brugerID);
    return bruger ? bruger.navn : 'Ukendt medarbejder';
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
        setOpgaveTilknyttetBesøg(res.data)
      })
      .catch(error => console.log(error))

    setEventData(besøgTilÅbning);
    setOpenDialog(true);
  };

  if (loading) {
    return <div className={Styles.loadingContainer}>
    </div>
  }


  // <button onClick={() => setManagerOverblik(false)} className={`${Styles.transparentButton} ${Styles.switchButton}`}>← Skift til personligt overblik</button>
  return (
    <div className={Styles.overblikPageContainer}>
      <div className={Styles.overblikHeader}>
          {/* <b className={Styles.hilsenTekst}>{getHilsen(user.navn.split(" ")[0])}</b> */}
          <b className={Styles.hilsenTekst}></b>

          {user.isAdmin && <PopUpMenu actions={[{ icon: <ArrowLeftRight />, label: managerOverblik ? 'Skift til personligt overblik' : 'Skift til manager-overblik', onClick: () => setManagerOverblik(!managerOverblik) }]} />}
      </div>
      
      {managerOverblik && <div>
        
        {/* <OpenTasks /> */}
        <OpgaverHurtigtAdminOverblik />
        <OpgaverIDagAdminOverblik />
        {/* <p className={Styles.alleOpgaverButton} onClick={() => {
          navigate(`/alle-opgaver`)
        }}>Gå til alle opgaver</p> */}
        <ManagerCalendar 
                        user={user} 
                        opgaveTilknyttetBesøg={opgaveTilknyttetBesøg}
                        setOpgaveTilknyttetBesøg={setOpgaveTilknyttetBesøg}
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
        <AdminØkonomiskOverblik user={user} />
      </div>}
      
      {!managerOverblik && <div className={Styles.overblikContainer}>
        {/* <div className={Styles.overblikHeader}>
          <h1 className={`bold ${Styles.heading}`}>Dit personlige overblik 👨‍🔧</h1>
          {user.isAdmin && <button onClick={() => setManagerOverblik(true)} className={`${Styles.transparentButton} ${Styles.switchButton}`}>Skift til manager-overblik →</button>}
        </div> */}
        {/* <MyTasks openTableEvent={openTableEvent} /> */}
        <OpgaverHurtigtPersonligtOverblik />
        <ÅbenOpgaveCalendar 
                        user={user} 
                        opgaveTilknyttetBesøg={opgaveTilknyttetBesøg}
                        setOpgaveTilknyttetBesøg={setOpgaveTilknyttetBesøg}
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
        <PersonligtØkonomiskOverblik user={user}/>
      </div>}
      </div>
  )
}

export default Overblik