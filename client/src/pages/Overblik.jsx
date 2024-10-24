import { useState, useEffect, useCallback } from 'react'
import PageAnimation from '../components/PageAnimation'
import MyTasks from '../components/tables/MyTasks.jsx'
import Styles from './Overblik.module.css'
import MineOpgaverCalendar from '../components/calendars/MineOpgaverCalendar.jsx'
import axios from 'axios'
import { useAuthContext } from '../hooks/useAuthContext'
import dayjs from 'dayjs'
import { useNavigate } from 'react-router-dom'
import TraditionalCalendar from '../components/traditionalCalendars/Calendar.jsx'
import { useBesøg } from '../context/BesøgContext.jsx'
import ÅbenOpgaveCalendar from '../components/traditionalCalendars/ÅbenOpgaveCalendar.jsx'

const Overblik = () => {
  const {user} = useAuthContext();
    
  if (!user) {
    return
  }

  const navigate = useNavigate()

  const userID = user.id;
  
  const [brugere, setBrugere] = useState(null);
  const [selectedOpgaveDate, setSelectedOpgaveDate] = useState(dayjs())
  const [selectedDate, setSelectedDate] = useState(dayjs)
  // const [egneLedigeTider, setEgneLedigeTider] = useState(null)
  // const [egneBesøg, setEgneBesøg] = useState(null)
  const [visLedighed, setVisLedighed] = useState(false)
  // const [refetchBesøg, setRefetchBesøg] = useState(false)
  // const [refetchLedigeTider, setRefetchLedigeTider] = useState(false)
  const [tilføjLedighed, setTilføjLedighed] = useState(false)
  const [fraTid, setFraTid] = useState("08:00")
  const [tilTid, setTilTid] = useState("16:00")
  const [registrerLedighedError, setRegistrerLedighedError] = useState("")
  const [sletLedighedErrors, setSletLedighedErrors] = useState({})
  const [bruger, setBruger] = useState("")
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
  
  // useEffect(() => {
  //   axios.get(`${import.meta.env.VITE_API_URL}/ledige-tider`, {
  //     headers: {
  //       'Authorization': `Bearer ${user.token}`
  //     }
  //   })
  //   .then(res => {
  //     const filterEgneLedigeTider = res.data.filter((ledigTid) => ledigTid.brugerID === userID)
  //     setEgneLedigeTider(filterEgneLedigeTider)
  //   })
  //   .catch(error => console.log(error))
  // }, [refetchLedigeTider])

  // useEffect(() => {
  //   axios.get(`${import.meta.env.VITE_API_URL}/besoeg`, {
  //     headers: {
  //       'Authorization': `Bearer ${user.token}`
  //     }
  //   })
  //   .then(res => {
  //     const filterEgneBesøg = res.data.filter(opgave => opgave.brugerID === userID)
  //     setEgneBesøg(filterEgneBesøg)
  //   })
  //   .catch(error => console.log(error))
  // }, [refetchBesøg])

  const getBrugerName = (brugerID) => {
    const bruger = brugere && brugere.find(user => user._id === brugerID);
    return bruger ? bruger.navn : 'Unknown User';
};

  function toggleVisLedighed(){
    visLedighed ? setVisLedighed(false) : setVisLedighed(true)
  }

  function navigateToOpgave (id) {
    navigate(`/opgave/${id}`)
  }

  function sletBesøg(id) {
    axios.delete(`${import.meta.env.VITE_API_URL}/besoeg/${id}`, {
      headers: {
        'Authorization': `Bearer ${user.token}`
      }
    })
    .then(res => {
      refetchBesøg ? setRefetchBesøg(false) : setRefetchBesøg(true)
    })
    .catch(error => console.log(error))
  }

  function submitLedigeTider(e) {
    e.preventDefault();
  
    const valgtDato = selectedOpgaveDate.format("YYYY-MM-DD");
    const datoTidFra = new Date(valgtDato + "T" + fraTid + ":00");
    const datoTidTil = new Date(valgtDato + "T" + tilTid + ":00");
  
    // New availability slot to be added/merged
    const newLedigTid = {
      datoTidFra: datoTidFra,
      datoTidTil: datoTidTil,
      brugerID: userID,
    };
  
    // Fetch existing overlapping ledige tider for this user
    const overlappingTimes = egneLedigeTider.filter((ledigTid) => {
      return (
        (new Date(ledigTid.datoTidFra) <= datoTidTil && new Date(ledigTid.datoTidTil) >= datoTidFra)
        && ledigTid.brugerID === userID
      );
    });
  
    if (overlappingTimes.length > 0) {
      // Find the earliest start and latest end time across all overlapping slots and the new slot
      let earliestStart = new Date(Math.min(datoTidFra, ...overlappingTimes.map(lt => new Date(lt.datoTidFra))));
      let latestEnd = new Date(Math.max(datoTidTil, ...overlappingTimes.map(lt => new Date(lt.datoTidTil))));
  
      // Patch the first overlapping slot with the new time range
      const patchId = overlappingTimes[0]._id;
      const updatedLedigTid = {
        datoTidFra: earliestStart,
        datoTidTil: latestEnd,
        brugerID: userID,
      };
  
      axios.patch(`${import.meta.env.VITE_API_URL}/ledige-tider/${patchId}`, updatedLedigTid, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      })
      .then(res => {
        console.log(res.data);
  
        // If there are multiple overlapping slots, patch them and combine their ranges
        if (overlappingTimes.length > 1) {
          const remainingTimes = overlappingTimes.slice(1);
  
          remainingTimes.forEach((tid) => {
            axios.delete(`${import.meta.env.VITE_API_URL}/ledige-tider/${tid._id}`, {
              headers: {
                'Authorization': `Bearer ${user.token}`
              }
            })
            .catch(error => console.log(error));
          });
        }
        setRefetchLedigeTider(prev => !prev);
      })
      .catch(error => console.log(error));
  
    } else {
      // No overlap, simply create a new slot
      axios.post(`${import.meta.env.VITE_API_URL}/ledige-tider/`, newLedigTid, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      })
      .then(res => {
        console.log(res.data);
        setRefetchLedigeTider(prev => !prev);
      })
      .catch(error => console.log(error));
    }
  }
  
  function sletLedighed(id) {
    const ledigTidToDelete = egneLedigeTider.find(lt => lt._id === id);
  
    const hasOverlapWithBesøg = egneBesøg.some(besøg => {
      return (
        new Date(besøg.datoTidFra) < new Date(ledigTidToDelete.datoTidTil) &&
        new Date(besøg.datoTidTil) > new Date(ledigTidToDelete.datoTidFra)
      );
    });
  
    if (hasOverlapWithBesøg) {
      setSletLedighedErrors(prevErrors => ({
        ...prevErrors,
        [id]: "Dette ledighedsvindue indeholder besøg. Slet besøgene først."
      }));
      setTimeout(() => {
        setSletLedighedErrors(prevErrors => {
          const newErrors = { ...prevErrors };
          delete newErrors[id];
          return newErrors;
        });
      }, 5000);
    } else {
      axios.delete(`${import.meta.env.VITE_API_URL}/ledige-tider/${id}`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      })
      .then(res => {
        const nyeLedigeTider = [...egneLedigeTider];
        const index = nyeLedigeTider.findIndex(item => item._id === id);
        if (index !== -1) {
          nyeLedigeTider.splice(index, 1);
        }
        setEgneLedigeTider(nyeLedigeTider);
        setSletLedighedErrors(prevErrors => {
          const newErrors = { ...prevErrors };
          delete newErrors[id];
          return newErrors;
        });
      })
      .catch(error => console.log(error));
    }
  }

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

  return (
    <PageAnimation>
      <div>
        <h1 className={`bold ${Styles.heading}`}>Overblik</h1>
        <MyTasks openTableEvent={openTableEvent} />
        {/* <div className={Styles.flex}> */}
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

      </div>
    </PageAnimation>
  )
}

export default Overblik
