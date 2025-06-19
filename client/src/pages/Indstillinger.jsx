import React, { useEffect, useState } from 'react'
import PageAnimation from '../components/PageAnimation'
import Styles from './Indstillinger.module.css'
import { useAuthContext } from '../hooks/useAuthContext'
import axios from 'axios'
import LedighedCalendar from '../components/calendars/LedighedCalendar'
import dayjs from 'dayjs'
import { useNavigate } from 'react-router-dom'
import Modal from '../components/Modal.jsx'
import LocationMarker from '../assets/locationMarker.svg'
import { RectangleEllipsis, BellRing, BellOff, SquarePen } from 'lucide-react';
import ToolboxIcon from '../assets/toolboxIcon.svg'
import ClockIcon from '../assets/clockIcon.svg'
import subscribeToPush from '../utils/subscribeToPush'
import unSubscribeToPush from '../utils/unSubscribeToPush'
import sendPushnotifikation from '../utils/sendPushnotifikation.js'

const Indstillinger = () => {
    const {user} = useAuthContext();
    
    if (!user) {
        return
    }

    const userID = user.id;
    const navigate = useNavigate();

    const [bruger, setBruger] = useState(null);
    const [redigerPersonligeOplysninger, setRedigerPersonligeOplysninger] = useState(false);
    const [redigerLedigeTider, setRedigerLedigeTider] = useState(false);
    const [skiftKodeord, setSkiftKodeord] = useState(false)
    const [passwordError, setPasswordError] = useState("")
    const [ledigeTider, setLedigeTider] = useState([])
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [opdaterLedigeTider, setOpdaterLedigeTider] = useState(false)
    const [opgaveBesøg, setOpgaveBesøg] = useState([])
    const [kalenderVisning, setKalenderVisning] = useState("")
    const [pushDebugMessage, setPushDebugMessage] = useState("");

    
    // state for form fields
    const [redigerbartNavn, setRedigerbartNavn] = useState("")
    const [redigerbarTitel, setRedigerbarTitel] = useState("")
    const [redigerbarAdresse, setRedigerbarAdresse] = useState("")
    const [redigerbarTelefon, setRedigerbarTelefon] = useState("")
    const [redigerbarEmail, setRedigerbarEmail] = useState("")
    const [nytKodeord, setNytKodeord] = useState("")
    const [gentagNytKodeord, setGentagNytKodeord] = useState("")
    const [fraTid, setFraTid] = useState("08:00")
    const [tilTid, setTilTid] = useState("16:00")
    const [ledighedDato, setLedighedDato] = useState("")


    useEffect(() => {
      console.log(user)
    }, [user])

    useEffect(() => {
      axios.get(`${import.meta.env.VITE_API_URL}/brugere/${userID}`, {
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        })
        .then(res => {
            setBruger(res.data)
            setRedigerbartNavn(res.data.navn)
            setRedigerbarTitel(res.data.titel)
            setRedigerbarAdresse(res.data.adresse)
            setRedigerbarTelefon(res.data.telefon)
            setRedigerbarEmail(res.data.email)
            setKalenderVisning(res.data.showTraditionalCalendar)
        })
        .catch(error => console.log(error))
    }, [])

    useEffect(() => {
      axios.get(`${import.meta.env.VITE_API_URL}/besoeg`, {
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        })
        .then(res => {
            const personligeBesøg = res.data.filter(besøg => besøg.brugerID === userID)
            setOpgaveBesøg(personligeBesøg)
        })
        .catch(error => console.log(error))
    }, [])

    function submitÆndringer (e) {
      e.preventDefault();

      const redigeretBrugerData = {
        navn: redigerbartNavn,
        titel: redigerbarTitel,
        adresse: redigerbarAdresse,
        telefon: redigerbarTelefon,
        email: redigerbarEmail
      }
      
      axios.patch(`${import.meta.env.VITE_API_URL}/brugere/${userID}`, redigeretBrugerData, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      })
      .then(res => {
        setBruger((prevBruger) => ({
          ...prevBruger,
          ...redigeretBrugerData,
        }));
        setRedigerPersonligeOplysninger(false);
      })
      .catch(error => console.log(error))
    }

    function submitToSkiftKodeord (e) {
      e.preventDefault()

      if (nytKodeord === gentagNytKodeord) {
        passwordError && setPasswordError(false)
        
        axios.patch(`${import.meta.env.VITE_API_URL}/brugere/updatePassword/${userID}`, {password: nytKodeord}, {
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        })
        .then(res => {
          console.log(res.data)
          setSkiftKodeord(false);
        })
        .catch(error => console.log(error))

      } else {
        setPasswordError("Kodeord matcher ikke hinanden. Prøv igen.");
      }
    }

    function submitLedigeTider (e) {
      e.preventDefault()

      
      
      const valgtDato = selectedDate.format("YYYY-MM-DD")
      const datoTidFra = new Date(valgtDato + "T" + fraTid + ":00")
      const datoTidTil = new Date(valgtDato + "T" + tilTid + ":00")

      const ledigTid = {
        datoTidFra: datoTidFra,
        datoTidTil: datoTidTil,
        brugerID: userID
      }

      axios.post(`${import.meta.env.VITE_API_URL}/ledige-tider/`, ledigTid, {
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        })
        .then(res => {
          console.log(res.data)
          opdaterLedigeTider ? setOpdaterLedigeTider(false) : setOpdaterLedigeTider(true);
        })
        .catch(error => console.log(error))
    }

    useEffect(() => {
      axios.get(`${import.meta.env.VITE_API_URL}/ledige-tider/`, {
        headers: {
            'Authorization': `Bearer ${user.token}`
        }})
        .then(res => {
          const filteredData = res.data.filter(item => item.brugerID === userID);  
          setLedigeTider(filteredData)
        })
        .catch(error => console.log(error))
    }, [opdaterLedigeTider])

    function sletLedighed (id) {
      axios.delete(`${import.meta.env.VITE_API_URL}/ledige-tider/${id}`, {
        headers: {
            'Authorization': `Bearer ${user.token}`
        }})
        .then(res => {
          const nyeLedigeTider = [...ledigeTider];
          const index = nyeLedigeTider.findIndex(item => item._id === id);
          if (index !== -1) {
            nyeLedigeTider.splice(index, 1);
          }
          setLedigeTider(nyeLedigeTider);
        })
        .catch(error => console.log(error))
    }

    function navigateToOpgave(id) {
      setRedigerLedigeTider(false)
      navigate(`/opgave/${id}`)
    }

    function skiftKalendervisning() {
      const updatedKalenderVisning = !kalenderVisning;
      setKalenderVisning(updatedKalenderVisning);
      const redigeretBrugerData = { showTraditionalCalendar: updatedKalenderVisning };
      
      axios.patch(`${import.meta.env.VITE_API_URL}/brugere/${userID}`, redigeretBrugerData, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      })
      .then(res => {
        console.log("User data updated.")
      })
      .catch(error => console.log(error))
    }

    // function urlBase64ToUint8Array(base64String) {
    //   const padding = "=".repeat((4 - base64String.length % 4) % 4);
    //   const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    //   const rawData = atob(base64);
    //   return new Uint8Array([...rawData].map(char => char.charCodeAt(0)));
    // }
    
    // async function subscribeToPush() {
    //   try {
    //     if (!('serviceWorker' in navigator)) {
    //       return alert("Din browser understøtter ikke notifikationer.");
    //     }
    
    //     const permission = Notification.permission;
    
    //     if (permission === 'denied') {
    //       return alert("Du har blokeret notifikationer. Gå til Indstillinger > Notifikationer og slå dem til.");
    //     }
    
    //     if (permission !== 'granted') {
    //       const newPermission = await Notification.requestPermission();
    //       if (newPermission !== 'granted') {
    //         return alert("Du skal acceptere notifikationer for at det virker.");
    //       }
    //     }

    //     if(permission === 'granted') {
    //       alert("Du har allerede accepteret notifikationer.");
    //       return;
    //     }
    
    //     const registration = await navigator.serviceWorker.ready;
    
    //     let subscription = await registration.pushManager.getSubscription();
    
    //     if (!subscription) {
    //       subscription = await registration.pushManager.subscribe({
    //         userVisibleOnly: true,
    //         applicationServerKey: urlBase64ToUint8Array(import.meta.env.VITE_VAPID_PUBLIC_KEY)
    //       });
    //     }
    
    //     console.log("Push subscription:", subscription);
    
    //     // Send til backend
    //     await axios.post(`${import.meta.env.VITE_API_URL}/brugere/push-subscribe`, {
    //       subscription
    //     }, {
    //       headers: {
    //         'Authorization': `Bearer ${user.token}`
    //       }
    //     });
    
    //     alert("Push-notifikationer er nu aktiveret.");
    //   } catch (err) {
    //     console.error("Fejl ved push-tilmelding:", err);
    //     alert("Noget gik galt under tilmelding. Se konsollen for detaljer.");
    //   }
    // }
    
    const checkNotificationStatus = () => {
      let message = '';;
      switch (Notification.permission) {
        case 'granted':
          message = 'Du har givet tilladelse til notifikationer ✅';
          break;
        case 'denied':
          message = 'Du har afvist notifikationer ❌. Gå til indstillinger og aktiver dem.';
          break;
        case 'default':
          message = 'Du er endnu ikke blevet spurgt om notifikationer.';
          break;
      }
      setPushDebugMessage(message); // eller hvordan du håndterer beskeder i dit UI
    };
    

    // function sendTestNotification() {
    //   if (!user.pushSubscription) {
    //     alert("Ingen push subscription fundet på brugeren. Abonner først.");
    //     return;
    //   }
    
    //   const payload = {
    //     title: "Test-notifikation",
    //     body: "Dette er en test notifikation.",
    //   };
      
    //   console.log("Tjekker user.pushSubscription");
    //   console.log(user.pushSubscription);

    //   axios.post(`${import.meta.env.VITE_API_URL}/send-push`, {
    //     subscription: user.pushSubscription,
    //     payload
    //   }, {
    //     headers: {
    //       'Authorization': `Bearer ${user.token}`
    //     }
    //   })
    //   .then(() => {
    //     console.log("Test-notifikation er sendt.");
    //   })
    //   .catch(err => {
    //     console.error("Fejl ved test-notifikation:", err);
    //     alert("Fejl under afsendelse af test-notifikation. Se konsollen.");
    //   });
    // }



  return (
    <PageAnimation>
      <div className={Styles.pageContent}>
        <h1 className={`bold ${Styles.heading}`}>Indstillinger</h1>
        <div className={Styles.personligInfo}>
          <div className={Styles.infoListe}>
            <div className={Styles.personligInfoBox}>
              <div className={Styles.infoListeElement}>
                <b className={`${Styles.text} ${Styles.navn}`}>{bruger && bruger.navn}</b>
              </div>
              <div className={Styles.infoListeElement}>
                <i className={`${Styles.text} ${Styles.titel}`}>{bruger && bruger.titel}</i>
              </div>
              <div className={Styles.subPersonligInfo}>
                <div className={`${Styles.infoListeElement} ${Styles.marginTop10}`}>
                  <span className={Styles.text}>🏠 {bruger && bruger.adresse}</span>
                </div>
                <div className={Styles.infoListeElement}>
                  <span className={Styles.text}>✉️ {bruger && bruger.email}</span>
                </div>
                <div className={Styles.infoListeElement}>
                  <span className={Styles.text}>📞 {bruger && bruger.telefon}</span>
                </div>
              </div>
            </div>
            <button className={Styles.newButton} onClick={() => setRedigerPersonligeOplysninger(true)}><SquarePen style={{width: 20, height: 20, marginRight: 10}}/>Tilpas dine informationer</button>
            <Modal trigger={redigerPersonligeOplysninger} setTrigger={setRedigerPersonligeOplysninger}>
                <h2 className={Styles.modalHeading}>Personlige informationer</h2>
                <form onSubmit={submitÆndringer}>
                  <label className={Styles.label}>Navn</label>
                  <input type="text" className={Styles.modalInput} value={redigerbartNavn} onChange={(e) => {setRedigerbartNavn(e.target.value)}}/>
                  <label className={Styles.label}>Titel</label>
                  <input type="text" className={Styles.modalInput} value={redigerbarTitel} onChange={(e) => {setRedigerbarTitel(e.target.value)}}/>
                  <label className={Styles.label}>Adresse</label>
                  <input type="text" className={Styles.modalInput} value={redigerbarAdresse} onChange={(e) => {setRedigerbarAdresse(e.target.value)}}/>
                  <label className={Styles.label}>Telefon</label>
                  <input type="text" className={Styles.modalInput} value={redigerbarTelefon} onChange={(e) => {setRedigerbarTelefon(e.target.value)}}/>
                  <label className={Styles.label}>Email</label>
                  <input type="text" className={Styles.modalInput} value={redigerbarEmail} onChange={(e) => {setRedigerbarEmail(e.target.value)}}/>
                  <button className={Styles.buttonFullWidth}>Gem ændringer</button>
                </form>
            </Modal>
          <button className={Styles.newButton} onClick={() => setSkiftKodeord(true)}><RectangleEllipsis style={{width: 20, height: 20, marginRight: 10}}/>Skift kodeord</button>
          <Modal trigger={skiftKodeord} setTrigger={setSkiftKodeord}>
                <h2 className={Styles.modalHeading}>Skift kodeord</h2>
                <p className={`${Styles.text} ${Styles.marginBottom10}`}>Tips til et stærkt kodeord:</p>
                <ul>
                  <li className={`${Styles.text} ${Styles.listItem}`}>- Brug små bogstaver</li>
                  <li className={`${Styles.text} ${Styles.listItem}`}>- Brug store bogstaver</li>
                  <li className={`${Styles.text} ${Styles.listItem}`}>- Brug tal</li>
                  <li className={`${Styles.text} ${Styles.listItem}`}>- Brug symboler</li>
                  <li className={`${Styles.text} ${Styles.listItem}`}>- Brug mindst 10 karakterer</li>
                </ul>
                <form className={Styles.nytKodeordForm} onSubmit={submitToSkiftKodeord}>
                  <label className={Styles.label}>Nyt kodeord</label>
                  <input type="password" className={Styles.modalInput} value={nytKodeord} onChange={(e) => {setNytKodeord(e.target.value)}}/>
                  <label className={Styles.label}>Gentag nyt kodeord</label>
                  <input type="password" className={Styles.modalInput} value={gentagNytKodeord} onChange={(e) => {setGentagNytKodeord(e.target.value)}}/>
                  <button className={Styles.buttonFullWidth}>Gem nyt kodeord</button>
                  {passwordError && <p>{passwordError}</p>}
                </form>
          </Modal>
          {user.pushSubscription ? <button className={`${Styles.newButton} ${Styles.afmeldPush}`} onClick={() => {unSubscribeToPush(user)}}><BellOff style={{width: 20, height: 20, marginRight: 10}}/>Afmeld push-notifikationer</button> : <button className={`${Styles.newButton} ${Styles.marginBottom10}`} onClick={() => {subscribeToPush(user); checkNotificationStatus()}}><BellRing style={{width: 20, height: 20, marginRight: 10}}/>Accepter push-notifikationer</button>}
          <button className={Styles.newButton} onClick={() => sendPushnotifikation(user, user, "Modificerbar test-notifikation", "Dette er en modificerbar testnotifikation.")}><BellRing style={{width: 20, height: 20, marginRight: 10}}/>Send test-notifikation</button>
          <p>{pushDebugMessage}</p>
          </div>
        </div>
      </div>
    </PageAnimation>
  )
}

export default Indstillinger