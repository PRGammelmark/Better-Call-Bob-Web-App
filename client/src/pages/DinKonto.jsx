import React, { useEffect, useState } from 'react'
import PageAnimation from '../components/PageAnimation.jsx'
import Styles from './DinKonto.module.css'
import { useAuthContext } from '../hooks/useAuthContext.js'
import { useUnsubscribeToPush } from '../hooks/useUnsubscribeToPush.js'
import { useSubscribeToPush } from '../hooks/useSubscribeToPush.js'
import axios from 'axios'
import LedighedCalendar from '../components/calendars/LedighedCalendar.jsx'
import dayjs from 'dayjs'
import { useNavigate } from 'react-router-dom'
import Modal from '../components/Modal.jsx'
import LocationMarker from '../assets/locationMarker.svg'
import { RectangleEllipsis, BellRing, BellOff, SquarePen } from 'lucide-react';
import ToolboxIcon from '../assets/toolboxIcon.svg'
import ClockIcon from '../assets/clockIcon.svg'
import subscribeToPush from '../utils/subscribeToPush.js'
import unSubscribeToPush from '../utils/unSubscribeToPush.js'
import nyNotifikation from '../utils/nyNotifikation.js'
import placeholderBillede from '../assets/avatarPlaceholder.png'

const DinKonto = () => {
    const {user, updateUser} = useAuthContext();
    const permission = Notification.permission;
    
    if (!user) {
        return
    }

    useEffect(() => {
      console.log('DinKonto mounted');
      return () => console.log('DinKonto unmounted');
    }, []);

    const [bruger, setBruger] = useState(null);
    const [redigerPersonligeOplysninger, setRedigerPersonligeOplysninger] = useState(false);
    const [skiftKodeord, setSkiftKodeord] = useState(false)
    const [passwordError, setPasswordError] = useState("")
    const [pushDebugMessage, setPushDebugMessage] = useState("");

    // state for form fields
    const [redigerbartNavn, setRedigerbartNavn] = useState("")
    const [redigerbarTitel, setRedigerbarTitel] = useState("")
    const [redigerbarAdresse, setRedigerbarAdresse] = useState("")
    const [redigerbarTelefon, setRedigerbarTelefon] = useState("")
    const [redigerbarEmail, setRedigerbarEmail] = useState("")
    const [nytKodeord, setNytKodeord] = useState("")
    const [gentagNytKodeord, setGentagNytKodeord] = useState("")
    

    const userID = user?.id || user?._id;
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

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
  

    const unSubscribeToPush = useUnsubscribeToPush();
    const subscribeToPush = useSubscribeToPush();

    const handleUnsubscribeToPush = () => {
      unSubscribeToPush(user, updateUser);
    };

    const handleSubscribeToPush = () => {
      subscribeToPush(user, updateUser);
    };



  return (
    // <PageAnimation>
      <div className={Styles.pageContent}>
        <div className={Styles.profilHeader}>
          <img src={bruger?.profilbillede || placeholderBillede} alt="Profilbillede" className={Styles.profilBillede} />
          <div className={Styles.profilInfo}>
            <h1>{bruger?.navn}</h1>
            <p>{bruger?.isAdmin ? "Administrator" : "Medarbejder"}{bruger?.titel ? (" • " + bruger?.titel) : "" }</p>
          </div>
        </div>
        <div className={Styles.personligInfo}>
          <div className={Styles.infoListe}>
            {/* <div className={Styles.personligInfoBox}>
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
            </div> */}
            <button className={Styles.newButton} onClick={() => setRedigerPersonligeOplysninger(true)}><SquarePen style={{width: 20, height: 20, marginRight: 10}}/>Rediger indstillinger</button>
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
          {isMobile && ((user.pushSubscription && permission === 'granted') ? <button className={`${Styles.newButton} ${Styles.afmeldPush}`} onClick={handleUnsubscribeToPush}><BellOff style={{width: 20, height: 20, marginRight: 10}}/>Afmeld push-notifikationer</button> : <button className={`${Styles.newButton} ${Styles.tilmeldPush}`} onClick={() => {handleSubscribeToPush(user, updateUser)}}><BellRing style={{width: 20, height: 20, marginRight: 10}}/>Accepter push-notifikationer</button>)}
          {/* <button className={Styles.newButton} onClick={() => nyNotifikation(user, user, "Modificerbar test-notifikation", "Dette er en modificerbar testnotifikation.")}><BellRing style={{width: 20, height: 20, marginRight: 10}}/>Send test-notifikation</button> */}
          <p>{pushDebugMessage}</p>
          </div>
        </div>
      </div>
    // </PageAnimation>
  )
}

export default DinKonto