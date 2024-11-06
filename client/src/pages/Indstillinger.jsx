import React, { useEffect, useState } from 'react'
import PageAnimation from '../components/PageAnimation'
import Styles from './Indstillinger.module.css'
import { useAuthContext } from '../hooks/useAuthContext'
import axios from 'axios'
import LedighedCalendar from '../components/calendars/LedighedCalendar'
import dayjs from 'dayjs'
import { useNavigate } from 'react-router-dom'
import Modal from '../components/Modal.jsx'

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
    const [test, setTest] = useState(false);
    
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

  return (
    <PageAnimation>
      <div className={Styles.pageContent}>
        <h1 className={`bold ${Styles.heading}`}>Indstillinger</h1>
        <div className={Styles.personligInfo}>
          <p className={Styles.miniheading}>Personlig info:</p>
          <div className={Styles.infoListe}>
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
            <button className={Styles.button} onClick={() => setRedigerPersonligeOplysninger(true)}>Rediger dine personlige informationer</button>
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
          <button className={Styles.button} onClick={() => setSkiftKodeord(true)}>Skift kodeord</button>
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
          </div>
        </div>
        <div className={Styles.præferencer}>
          <p className={Styles.miniheading}>Præferencer:</p>
          <p>Ingen præferenceindstillinger i øjeblikket.</p>
        </div>
      </div>
    </PageAnimation>
  )
}

export default Indstillinger