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

const Overblik = () => {
  const {user} = useAuthContext();
    
  if (!user) {
    return
  }

  const navigate = useNavigate()

  const userID = user.id;
  
  const [selectedOpgaveDate, setSelectedOpgaveDate] = useState(dayjs())
  const [selectedDate, setSelectedDate] = useState(dayjs)
  const [egneLedigeTider, setEgneLedigeTider] = useState(null)
  const [egneBesøg, setEgneBesøg] = useState(null)
  const [visLedighed, setVisLedighed] = useState(false)
  const [refetchBesøg, setRefetchBesøg] = useState(false)
  const [refetchLedigeTider, setRefetchLedigeTider] = useState(false)
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
    axios.get(`${import.meta.env.VITE_API_URL}/ledige-tider`, {
      headers: {
        'Authorization': `Bearer ${user.token}`
      }
    })
    .then(res => {
      const filterEgneLedigeTider = res.data.filter((ledigTid) => ledigTid.brugerID === userID)
      setEgneLedigeTider(filterEgneLedigeTider)
    })
    .catch(error => console.log(error))
  }, [refetchLedigeTider])

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/besoeg`, {
      headers: {
        'Authorization': `Bearer ${user.token}`
      }
    })
    .then(res => {
      const filterEgneBesøg = res.data.filter(opgave => opgave.brugerID === userID)
      setEgneBesøg(filterEgneBesøg)
    })
    .catch(error => console.log(error))
  }, [refetchBesøg])

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
        <div className={Styles.flex}>
          {bruger.showTraditionalCalendar && bruger.showTraditionalCalendar 
          ? 
          <div className={Styles.traditionelBesøgsKalenderDiv}>
            <b className={Styles.overskrift}>Din kalender</b>
            <div>
              <TraditionalCalendar 
                user={user} 
                tilknyttetOpgave={tilknyttetOpgave}
                setTilknyttetOpgave={setTilknyttetOpgave}
                openDialog={openDialog}
                setOpenDialog={setOpenDialog}
                eventData={eventData}
                setEventData={setEventData} 
                aktueltBesøg={aktueltBesøg} />
            </div>
          </div>
          : 
          <div>
            <div className={Styles.næsteBesøgDiv}>
              <b className={Styles.overskrift}>Dit næste besøg</b>
            </div>
            <div className={Styles.moderneBesøgsKalenderDiv}>
              <div className={Styles.flexSb}>
                <b className={Styles.overskrift}>Din kalender</b>
                {visLedighed ? <button className={Styles.visLedighedButton} onClick={toggleVisLedighed}>Skjul din ledighed</button> : <button className={Styles.visLedighedButton} onClick={toggleVisLedighed}>Vis din ledighed</button>}
              </div>
              <MineOpgaverCalendar selectedOpgaveDate={selectedOpgaveDate} setSelectedOpgaveDate={setSelectedOpgaveDate} egneLedigeTider={egneLedigeTider} egneBesøg={egneBesøg} userID={userID} visLedighed={visLedighed}/>
              {(visLedighed && tilføjLedighed === false) ? <div className={Styles.redigerLedighed}>
                <button className={`${Styles.visLedighedButton} ${Styles.tilføjLedighedButton}`} onClick={() => setTilføjLedighed(true)}>+ Tilføj ledighed</button>
              </div> : null}
              {(visLedighed && tilføjLedighed) ? 
              <div className={Styles.opretLedigTidFormDiv}>
                <button className={Styles.lukTilføjLedighed} onClick={() => setTilføjLedighed(false)}>Luk</button>
                <form onSubmit={submitLedigeTider}>
                  <div className={Styles.timeSelectorDiv}>
                    <div className={Styles.timeInputLabel}>
                      <label className={Styles.label}>Fra kl.:</label>
                      <input type="time" value={fraTid} onChange={(e) => setFraTid(e.target.value)} className={Styles.modalInput} />
                    </div>
                    <div className={Styles.timeInputLabel}>
                      <label className={Styles.label}>Til kl.:</label>
                      <input type="time" value={tilTid} onChange={(e) => setTilTid(e.target.value)} className={Styles.modalInput} />
                    </div>
                  </div>
                  <button className={Styles.buttonFullWidth}>Registrer ledighed – {selectedOpgaveDate.format("DD. MMMM")}</button>
                  {registrerLedighedError ? registrerLedighedError : null}
                  </form>
              </div>
              : null}
              <div className={Styles.opgavebesøgDetaljer}>
                            <b>{selectedOpgaveDate ? "Dine besøg d. " + dayjs(selectedOpgaveDate).format("D. MMMM") : "Vælg en dato i kalenderen ..."}</b>
                            <div>
                                <div className={Styles.opgaveListevisning}>
                                    {visLedighed ? (egneLedigeTider && egneLedigeTider.map((ledigTid) => {
                                        if ((dayjs(ledigTid.datoTidFra).format("DD-MM-YYYY") === dayjs(selectedOpgaveDate).format("DD-MM-YYYY")) && ledigTid.brugerID === userID) {
                                            return (
                                                <div key={ledigTid._id} className={Styles.ledigTidDisplay}>
                                                    {egneBesøg && egneBesøg
                                                      .sort((a, b) => dayjs(a.datoTidFra).isAfter(dayjs(b.datoTidFra)) ? 1 : -1)
                                                      .map((besøg) => {
                                                        // EGNE BESØG PÅ DENNE OPGAVE
                                                        if ((dayjs(besøg.datoTidFra).isSame(selectedOpgaveDate, 'day')) && ((dayjs(besøg.datoTidFra).format("HH:mm") >= dayjs(ledigTid.datoTidFra).format("HH:mm")) && (dayjs(besøg.datoTidTil).format("HH:mm") <= dayjs(ledigTid.datoTidTil).format("HH:mm")))) {
                                                            return (
                                                                <div key={besøg._id} className={Styles.opgaveCardContainer}>
                                                                    <div className={Styles.opgaveCard} onClick={() => navigateToOpgave(besøg.opgaveID)}>
                                                                        <div className={Styles.opgaveCardIkon}>
                                                                            🛠️
                                                                        </div>
                                                                        <b className={Styles.opgaveCardName}>Opgave #{besøg.opgaveID.slice((besøg.opgaveID.length - 3), besøg.opgaveID.length)}</b>
                                                                        <div>
                                                                            <span className={Styles.opgaveCardTime}>{dayjs(besøg.datoTidFra).format("HH:mm")} - {dayjs(besøg.datoTidTil).format("HH:mm")}</span>
                                                                        </div>
                                                                    </div>
                                                                    <button onClick={() => sletBesøg(besøg._id)} className={Styles.sletBesøg}>Slet</button>
                                                                </div>
                                                                )
                                                        } else {
                                                            return null
                                                        }
                                                    })}
                                                    {sletLedighedErrors[ledigTid._id] && (
                                                      <div className={Styles.error}>
                                                        {sletLedighedErrors[ledigTid._id]}
                                                      </div>
                                                    )}
                                                    <p className={Styles.ledigTidMedarbejder}>Du er ledig fra {dayjs(ledigTid.datoTidFra).format("HH:mm")} – {dayjs(ledigTid.datoTidTil).format("HH:mm")}</p>
                                                    <p className={Styles.ledigTidSlet} onClick={() => sletLedighed(ledigTid._id)}>Slet</p>
                                                </div>
                                            )
                                        } else {
                                            return null
                                        }
                                    })) : (egneBesøg && egneBesøg
                                      .sort((a, b) => dayjs(a.datoTidFra).isAfter(dayjs(b.datoTidFra)) ? 1 : -1)
                                      .map((besøg) => {
                                        // EGNE BESØG PÅ DENNE OPGAVE
                                        if ((dayjs(besøg.datoTidFra).isSame(selectedOpgaveDate, 'day'))) {
                                            return (
                                                <div key={besøg._id} className={Styles.opgaveCardContainer}>
                                                    <div className={Styles.opgaveCard} onClick={() => navigateToOpgave(besøg.opgaveID)}>
                                                        <div className={Styles.opgaveCardIkon}>
                                                            🛠️
                                                        </div>
                                                        <b className={Styles.opgaveCardName}>Opgave #{besøg.opgaveID.slice(-3)}</b>
                                                        <div>
                                                            <span className={Styles.opgaveCardTime}>{dayjs(besøg.datoTidFra).format("HH:mm")} - {dayjs(besøg.datoTidTil).format("HH:mm")}</span>
                                                        </div>
                                                    </div>
                                                    <button onClick={() => sletBesøg(besøg._id)} className={Styles.sletBesøg}>Slet</button>
                                                </div>
                                                )
                                        } else {
                                            return null
                                        }
                                    }))}
                                    
                                </div>
                            </div>
                        </div>
            </div>
          </div>}
        </div>
      </div>
    </PageAnimation>
  )
}

export default Overblik
