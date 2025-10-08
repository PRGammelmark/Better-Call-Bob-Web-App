import React, { useEffect, useState } from 'react'
import Styles from './DinKonto.module.css'
import { useAuthContext } from '../hooks/useAuthContext.js'
import { useUnsubscribeToPush } from '../hooks/useUnsubscribeToPush.js'
import { useSubscribeToPush } from '../hooks/useSubscribeToPush.js'
import axios from 'axios'
import Modal from '../components/Modal.jsx'
import { RectangleEllipsis, BellRing, BellOff, SquarePen } from 'lucide-react';
import placeholderBillede from '../assets/avatarPlaceholder.png'
import Rating from 'react-rating'
import { Star, Radius, MapPin, Hammer, Box } from "lucide-react"
import ArbejdsRadiusMap from '../components/ArbejdsRadiusMap.jsx'
import ArbejdsOmrådeModal from '../components/modals/ArbejdsOmrådeModal.jsx'
import VælgOpgavetyperModal from '../components/modals/VælgOpgavetyperModal.jsx'
import { useIndstillinger } from '../context/IndstillingerContext.jsx'
import * as beregn from '../utils/beregninger.js'

const DinKonto = () => {
    const {user, updateUser} = useAuthContext();
    const { indstillinger } = useIndstillinger();
    const permission = Notification.permission;
    
    if (!user) {
        return
    }

    const [bruger, setBruger] = useState(null);
    const [refetchBruger, setRefetchBruger] = useState(false)
    const [opgaver, setOpgaver] = useState([]);
    const [posteringer, setPosteringer] = useState([])
    const [redigerPersonligeOplysninger, setRedigerPersonligeOplysninger] = useState(false);
    const [skiftKodeord, setSkiftKodeord] = useState(false)
    const [passwordError, setPasswordError] = useState("")
    const [pushDebugMessage, setPushDebugMessage] = useState("");

    // state for statistics range
    const [statisticsRange, setStatisticsRange] = useState("altid")

    // state for form fields
    const [redigerbartNavn, setRedigerbartNavn] = useState("")
    const [redigerbarTitel, setRedigerbarTitel] = useState("")
    const [redigerbarAdresse, setRedigerbarAdresse] = useState("")
    const [redigerbarTelefon, setRedigerbarTelefon] = useState("")
    const [redigerbarEmail, setRedigerbarEmail] = useState("")
    const [nytKodeord, setNytKodeord] = useState("")
    const [gentagNytKodeord, setGentagNytKodeord] = useState("")

    // state for popups
    const [arbejdsOmrådePopup, setArbejdsOmrådePopup] = useState(false)
    const [opgaveTyperPopup, setOpgaveTyperPopup] = useState(false)
    const [opgavetyper, setOpgavetyper] = useState([])
    
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
    }, [refetchBruger])

    useEffect(() => {
      axios.get(`${import.meta.env.VITE_API_URL}/opgavetyper`, {
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        })
        .then(res => {
            setOpgavetyper(res.data)
        })
        .catch(error => console.log(error))
    }, [])

    useEffect(() => {
      if(userID){
        axios.get(`${import.meta.env.VITE_API_URL}/posteringer/bruger/${userID}`, {
          headers: {
              'Authorization': `Bearer ${user.token}`
          }
      })
      .then(res => {
          setPosteringer(res.data)
      })
      .catch(error => console.log(error))
      }
    }, [userID])

    useEffect(() => {
      if(userID){
        axios.get(`${import.meta.env.VITE_API_URL}/opgaver/medarbejder/${userID}`, {
          headers: {
              'Authorization': `Bearer ${user.token}`
          }
      })
      .then(res => {
          setOpgaver(res.data)
      })
      .catch(error => console.log(error))
      }
    }, [userID])

    useEffect(() => {
      if(userID){
        axios.get(`${import.meta.env.VITE_API_URL}/opgavetyper`, {
          headers: {
              'Authorization': `Bearer ${user.token}`
          }
      })
      .then(res => {
          setOpgavetyper(res.data)
      })
      .catch(error => console.log(error))
      }
    }, [userID])

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

    const SVGIcon = (props) =>
      <svg className={props.className} pointerEvents="none">
        <use xlinkHref={props.href} />
      </svg>;

    const antalKategorierFraOpgavetyper = (typer) => {

    }

  return (
    // <PageAnimation>
      <div className={Styles.pageContent}>
        <div className={Styles.profilHeader}>

          <img src={bruger?.profilbillede || placeholderBillede} alt="Profilbillede" className={Styles.profilBillede} />
          <div className={Styles.profilInfo}>
            <h2>{bruger?.navn}</h2>
            <p>{bruger?.isAdmin ? "Administrator" : "Medarbejder"}{bruger?.titel ? (" • " + bruger?.titel) : "" }</p>
          </div>
        </div>
        <div className={Styles.indstillingerContent}>
          <div className={Styles.statistikSektion}>
            <div className={Styles.statistikSektionHeader}>
              <h2>Statistik</h2>
              {/* <div className={Styles.statistikButtonsDiv}>
                <button onClick={() => setStatisticsRange("denneMåned")} className={`${Styles.statistikButton} ${statisticsRange === "denneMåned" && Styles.activeStatistikButton}`}>
                  Denne måned
                </button>
                <button onClick={() => setStatisticsRange("treMåneder")} className={`${Styles.statistikButton} ${statisticsRange === "treMåneder" && Styles.activeStatistikButton}`}>
                  Sidste 3 måneder
                </button>
                <button onClick={() => setStatisticsRange("altid")} className={`${Styles.statistikButton} ${statisticsRange === "altid" && Styles.activeStatistikButton}`}>
                  Altid
                </button>
              </div> */}
            </div>
            <div className={`${Styles.boxFrame} ${Styles.flex}`}>
              <div className={Styles.opgaverStatistik}>
                <div className={Styles.statistikItem}>
                  <b>{opgaver?.length}</b>
                  <p>opgaver</p>
                </div>
                <div className={Styles.statistikItem}>
                  <b>{beregn.totalHonorar(posteringer).formateret}</b>
                  <p>tjent til dato</p>
                </div>
              </div>
              <div className={Styles.ratings} style={{position: "relative"}}>
                <p style={{position: "absolute", top: "50%", transform: "translateY(-50%)", whiteSpace: "nowrap", fontSize: 14, fontFamily: "OmnesBold"}}>Ratings – kommer snart ...</p>
                <div style={{opacity: 0.15}}>
                <Rating
                    fractions={2}
                    initialRating={3}
                    readonly
                    emptySymbol={<Star className={Styles.icon} />}
                    fullSymbol={<Star className={`${Styles.icon} ${Styles.full}`} />}
                  />
                  </div>
                {/* <div className={Styles.ratingStarsDiv}>
                  <Rating
                    fractions={2}
                    initialRating={3}
                    readonly
                    emptySymbol={<Star className={Styles.icon} />}
                    fullSymbol={<Star className={`${Styles.icon} ${Styles.full}`} />}
                  />
                </div>
                <div className={Styles.ratingsHeaderDiv}>
                  <p>4 vurderinger</p>
                  <p>Gns.: 4.8</p>
                </div> */}
              </div>
            </div>
          </div>
          <div className={Styles.arbejdsPræferencerSektion}>
            <h2>Arbejdspræferencer</h2>
            <div className={Styles.arbejdsPræferencerKnapperDiv}>
              <div className={Styles.arbejdsPræferencerKnap} onClick={() => setArbejdsOmrådePopup(true)}>
                <h3>Område</h3>
                <div className={Styles.arbejdsPræferencerKnapEndDiv}>
                  {bruger?.arbejdsOmråde?.adresse && <>
                  <div className={Styles.arbejdsPræferencerKnapGraaInfoBoks}>
                    <MapPin height={14} />
                    <span className={Styles.desktopInfoBox}>{bruger?.arbejdsOmråde?.adresse}</span>
                    <span className={Styles.mobileInfoBox}>{bruger?.arbejdsOmråde?.adresse?.split(", ")[1]}</span>
                  </div>
                  <div className={Styles.arbejdsPræferencerKnapGraaInfoBoks}>
                    <Radius height={14} />
                    {bruger?.arbejdsOmråde?.radius / 1000} km.
                  </div>
                  </>}
                </div>
              </div>
              <div className={Styles.arbejdsPræferencerKnap} onClick={() => setOpgaveTyperPopup(true)}>
                <h3>Opgavetyper</h3>
                <div className={Styles.arbejdsPræferencerKnapEndDiv}>
                  <div className={Styles.arbejdsPræferencerKnapGraaInfoBoks}>
                    <Hammer height={14} />
                    {bruger?.opgavetyper?.length || 0} valgte
                  </div>
                  {/* <div className={Styles.arbejdsPræferencerKnapGraaInfoBoks}>
                    <Box height={14} />
                    {antalKategorierFraOpgavetyper(bruger?.opgavetyper)} kategorier
                  </div> */}
                </div>
              </div>
            </div>
            {/* <ArbejdsRadiusMap /> */}
          </div>
          <div className={Styles.indstillingerSektion}>
            <h2>Indstillinger</h2>
            <div className={Styles.infoListe}>
              <button className={Styles.newButton} onClick={() => setRedigerPersonligeOplysninger(true)}><SquarePen style={{width: 20, height: 20, marginRight: 10}}/>Rediger indstillinger</button>
              <button className={Styles.newButton} onClick={() => setSkiftKodeord(true)}><RectangleEllipsis style={{width: 20, height: 20, marginRight: 10}}/>Skift kodeord</button>
            {isMobile && ((user.pushSubscription && permission === 'granted') ? <button className={`${Styles.newButton} ${Styles.afmeldPush}`} onClick={handleUnsubscribeToPush}><BellOff style={{width: 20, height: 20, marginRight: 10}}/>Afmeld push-notifikationer</button> : <button className={`${Styles.newButton} ${Styles.tilmeldPush}`} onClick={() => {handleSubscribeToPush(user, updateUser)}}><BellRing style={{width: 20, height: 20, marginRight: 10}}/>Accepter push-notifikationer</button>)}
            {/* <button className={Styles.newButton} onClick={() => nyNotifikation(user, user, "Modificerbar test-notifikation", "Dette er en modificerbar testnotifikation.")}><BellRing style={{width: 20, height: 20, marginRight: 10}}/>Send test-notifikation</button> */}
            <p>{pushDebugMessage}</p>
            </div>
          </div>
        </div>
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
          <ArbejdsOmrådeModal trigger={arbejdsOmrådePopup} setTrigger={setArbejdsOmrådePopup} user={user} bruger={bruger} refetchBruger={refetchBruger} setRefetchBruger={setRefetchBruger} />
          <VælgOpgavetyperModal trigger={opgaveTyperPopup} setTrigger={setOpgaveTyperPopup} user={user} bruger={bruger} refetchBruger={refetchBruger} setRefetchBruger={setRefetchBruger} opgavetyper={opgavetyper}/>
      </div>
    // </PageAnimation>
  )
}

export default DinKonto