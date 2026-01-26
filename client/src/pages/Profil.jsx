import React, { useEffect, useState, useRef, useMemo, useLayoutEffect } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Styles from './Profil.module.css'
import { useAuthContext } from '../hooks/useAuthContext.js'
import { useUnsubscribeToPush } from '../hooks/useUnsubscribeToPush.js'
import { useSubscribeToPush } from '../hooks/useSubscribeToPush.js'
import axios from 'axios'
import Modal from '../components/Modal.jsx'
import { RectangleEllipsis, BellRing, BellOff, SquarePen, LayoutDashboard, ClipboardList, Wallet, User, Settings, SlidersVertical, Phone, Mail } from 'lucide-react';
import placeholderBillede from '../assets/avatarPlaceholder.png'
import Rating from 'react-rating'
import { Star, Radius, MapPin, Hammer, Box, Calendar } from "lucide-react"
import ArbejdsRadiusMap from '../components/ArbejdsRadiusMap.jsx'
import ArbejdsOmrådeModal from '../components/modals/ArbejdsOmrådeModal.jsx'
import VælgOpgavetyperModal from '../components/modals/VælgOpgavetyperModal.jsx'
import PrioritetModal from '../components/modals/PrioritetModal.jsx'
import RedigerLøntrin from '../components/modals/RedigerLøntrin.jsx'
import ProfilePictureModal from '../components/modals/ProfilePictureModal.jsx'
import VisLedighedModal from '../components/modals/VisLedighedModal.jsx'
import { useIndstillinger } from '../context/IndstillingerContext.jsx'
import * as beregn from '../utils/beregninger.js'
import SettingsButtons from '../components/basicComponents/buttons/SettingsButtons.jsx'
import satser from '../variables.js'
import ProfilØkonomi from '../components/ProfilØkonomi.jsx'

// Tab configuration
const tabConfig = [
    {
        id: "overblik",
        label: "Overblik",
        iconType: "LayoutDashboard"
    },
    {
        id: "opgaver",
        label: "Opgaver",
        iconType: "ClipboardList"
    },
    {
      id: "arbejdspræferencer",
      label: "Arbejdspræferencer",
      iconType: "Hammer"
  },
    {
        id: "økonomi",
        label: "Økonomi",
        iconType: "Wallet"
    },
    {
        id: "om",
        label: "Om",
        iconType: "User"
    },
    {
        id: "indstillinger",
        label: "Indstillinger",
        iconType: "Settings"
    }
]

// Icon map for tabs
const iconMap = {
    LayoutDashboard: <LayoutDashboard size={18} />,
    ClipboardList: <ClipboardList size={18} />,
    Wallet: <Wallet size={18} />,
    User: <User size={18} />,
    Hammer: <Hammer size={18} />,
    Settings: <Settings size={18} />
}

const Profil = () => {
    const { brugerID } = useParams();
    const {user, updateUser} = useAuthContext();
    const { indstillinger } = useIndstillinger();
    const permission = Notification.permission;
    
    if (!user) {
        return null
    }

    const currentUserID = user?.id || user?._id;
    const isOwnProfile = brugerID === currentUserID;
    const isAdmin = user?.isAdmin;
    const canViewFullProfile = isOwnProfile || isAdmin;
    const canEditSettings = isOwnProfile || isAdmin;
    const canEditPassword = isOwnProfile; // Kun egen profil kan ændre kodeord

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
    const [prioritet, setPrioritet] = useState(3)

    // state for popups
    const [arbejdsOmrådePopup, setArbejdsOmrådePopup] = useState(false)
    const [opgaveTyperPopup, setOpgaveTyperPopup] = useState(false)
    const [prioritetPopup, setPrioritetPopup] = useState(false)
    const [lønsatserModal, setLønsatserModal] = useState(null)
    const [profilbilledeModal, setProfilbilledeModal] = useState(false)
    const [ledighedModal, setLedighedModal] = useState(false)
    const [opgavetyper, setOpgavetyper] = useState([])
    
    // state for tabs
    const [activeTab, setActiveTab] = useState("overblik")
    const [underlineStyle, setUnderlineStyle] = useState({ width: 0, left: 0 })
    const [isScrolledToEnd, setIsScrolledToEnd] = useState(false)
    const tabRefs = useRef([])
    const tabsContainerRef = useRef(null)
    
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    // Create tabs with icons (memoized to prevent infinite loops)
    const tabs = useMemo(() => tabConfig.map(tab => ({
        ...tab,
        icon: iconMap[tab.iconType]
    })), [])

    useEffect(() => {
      if (!brugerID) return;
      
      axios.get(`${import.meta.env.VITE_API_URL}/brugere/${brugerID}`, {
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
            setPrioritet(res.data.prioritet ?? 3)
        })
        .catch(error => console.log(error))
    }, [brugerID, refetchBruger])

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
      if(brugerID && canViewFullProfile){
        axios.get(`${import.meta.env.VITE_API_URL}/posteringer/bruger/${brugerID}`, {
          headers: {
              'Authorization': `Bearer ${user.token}`
          }
      })
      .then(res => {
          setPosteringer(res.data)
      })
      .catch(error => console.log(error))
      }
    }, [brugerID, canViewFullProfile])

    useEffect(() => {
      if(brugerID && canViewFullProfile){
        axios.get(`${import.meta.env.VITE_API_URL}/opgaver/medarbejder/${brugerID}`, {
          headers: {
              'Authorization': `Bearer ${user.token}`
          }
      })
      .then(res => {
          setOpgaver(res.data)
      })
      .catch(error => console.log(error))
      }
    }, [brugerID, canViewFullProfile])

    useEffect(() => {
      if(brugerID){
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
    }, [brugerID])

    function submitÆndringer (e) {
      e.preventDefault();

      if (!canEditSettings) return;

      const redigeretBrugerData = {
        navn: redigerbartNavn,
        titel: redigerbarTitel,
        adresse: redigerbarAdresse,
        telefon: redigerbarTelefon,
        email: redigerbarEmail
      }
      
      axios.patch(`${import.meta.env.VITE_API_URL}/brugere/${brugerID}`, redigeretBrugerData, {
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

      if (!canEditPassword) return;

      if (nytKodeord === gentagNytKodeord) {
        passwordError && setPasswordError(false)
        
        axios.patch(`${import.meta.env.VITE_API_URL}/brugere/updatePassword/${brugerID}`, {password: nytKodeord}, {
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

    // Update underline position when active tab changes
    useLayoutEffect(() => {
        // Only run if bruger is loaded (tabs are rendered)
        if (!bruger) return;
        
        const activeIndex = tabs.findIndex((t) => t.id === activeTab);
        const activeTabElement = tabRefs.current[activeIndex];
        const container = tabsContainerRef.current;
        
        if (activeTabElement) {
            setUnderlineStyle({
                width: activeTabElement.offsetWidth,
                left: activeTabElement.offsetLeft,
            });
            
            // Scroll to active tab if it's not fully visible
            if (container) {
                const scrollLeft = container.scrollLeft;
                const tabLeft = activeTabElement.offsetLeft;
                const tabWidth = activeTabElement.offsetWidth;
                const containerWidth = container.clientWidth;
                
                const tabRight = tabLeft + tabWidth;
                const visibleLeft = scrollLeft;
                const visibleRight = scrollLeft + containerWidth;
                
                let newScrollLeft = scrollLeft;
                
                if (tabLeft < visibleLeft) {
                    newScrollLeft = tabLeft - 10;
                } else if (tabRight > visibleRight) {
                    newScrollLeft = tabRight - containerWidth + 10;
                }
                
                if (newScrollLeft !== scrollLeft) {
                    container.scrollTo({
                        left: newScrollLeft,
                        behavior: 'smooth'
                    });
                }
            }
        }
    }, [activeTab, tabs, bruger]);

    // Check scroll position to adjust border
    useEffect(() => {
        const container = tabsContainerRef.current;
        if (!container) return;

        const checkScroll = () => {
            const { scrollLeft, scrollWidth, clientWidth } = container;
            const isAtEnd = scrollLeft + clientWidth >= scrollWidth - 1; // 1px tolerance
            setIsScrolledToEnd(isAtEnd);
        };

        checkScroll(); // Check initially
        container.addEventListener('scroll', checkScroll);
        window.addEventListener('resize', checkScroll);

        return () => {
            container.removeEventListener('scroll', checkScroll);
            window.removeEventListener('resize', checkScroll);
        };
    }, [tabs]);

    // Handle tab change
    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        
        // Scroll to selected tab
        const activeIndex = tabs.findIndex((t) => t.id === tabId);
        const activeTabElement = tabRefs.current[activeIndex];
        const container = tabsContainerRef.current;
        
        if (activeTabElement && container) {
            const containerRect = container.getBoundingClientRect();
            const tabRect = activeTabElement.getBoundingClientRect();
            const scrollLeft = container.scrollLeft;
            const tabLeft = activeTabElement.offsetLeft;
            const tabWidth = activeTabElement.offsetWidth;
            const containerWidth = container.clientWidth;
            
            // Calculate if tab is outside visible area
            const tabRight = tabLeft + tabWidth;
            const visibleLeft = scrollLeft;
            const visibleRight = scrollLeft + containerWidth;
            
            let newScrollLeft = scrollLeft;
            
            // If tab is to the left of visible area
            if (tabLeft < visibleLeft) {
                newScrollLeft = tabLeft - 10; // 10px padding
            }
            // If tab is to the right of visible area
            else if (tabRight > visibleRight) {
                newScrollLeft = tabRight - containerWidth + 10; // 10px padding
            }
            
            // Smooth scroll to position
            container.scrollTo({
                left: newScrollLeft,
                behavior: 'smooth'
            });
        }
    }

    // Calculate løntrin for employee
    const beregnLøntrin = (bruger) => {
        if (!bruger) return null;
        
        const akkumuleredeStandardSatser = 
            Number(satser.handymanTimerHonorar) + 
            Number(satser.tømrerTimerHonorar) + 
            Number(satser.rådgivningOpmålingVejledningHonorar) + 
            Number(satser.opstartsgebyrHonorar) + 
            Number(satser.aftenTillægHonorar) + 
            Number(satser.natTillægHonorar) + 
            Number(satser.trailerHonorar);

        const akkumuleredeBrugerSatser = 
            Number(bruger.satser ? bruger.satser.handymanTimerHonorar : satser.handymanTimerHonorar) + 
            Number(bruger.satser ? bruger.satser.tømrerTimerHonorar : satser.tømrerTimerHonorar) + 
            Number(bruger.satser ? bruger.satser.rådgivningOpmålingVejledningHonorar : satser.rådgivningOpmålingVejledningHonorar) + 
            Number(bruger.satser ? bruger.satser.opstartsgebyrHonorar : satser.opstartsgebyrHonorar) + 
            Number(bruger.satser ? bruger.satser.aftenTillægHonorar : satser.aftenTillægHonorar) + 
            Number(bruger.satser ? bruger.satser.natTillægHonorar : satser.natTillægHonorar) + 
            Number(bruger.satser ? bruger.satser.trailerHonorar : satser.trailerHonorar);

        return Math.floor((akkumuleredeBrugerSatser / akkumuleredeStandardSatser) * 10);
    }

    if (!bruger) {
      return <div>Indlæser...</div>
    }

  return (
    // <PageAnimation>
      <div className={Styles.pageContent}>
        <div className={Styles.profilHeader}>
          <div 
            className={Styles.profilBilledeContainer}
            onClick={() => canEditSettings && setProfilbilledeModal(true)}
            style={{ cursor: canEditSettings ? 'pointer' : 'default' }}
          >
            <img src={bruger?.profilbillede || placeholderBillede} alt="Profilbillede" className={Styles.profilBillede} />
            {canEditSettings && (
              <div className={Styles.profilBilledeOverlay}>
                <span>Klik for at opdatere</span>
              </div>
            )}
          </div>
          <div className={Styles.profilInfo}>
            <h2>{bruger?.navn}</h2>
            <p>{bruger?.isAdmin ? "Administrator" : "Medarbejder"}{bruger?.titel ? (" • " + bruger?.titel) : "" }</p>
            {(bruger?.telefon || bruger?.email) && (
              <div className={Styles.kontaktKnapper}>
                {bruger?.telefon && (
                  <a href={`tel:${bruger.telefon}`} className={Styles.kontaktKnap}>
                    <Phone size={13} />
                    <span>{bruger.telefon}</span>
                  </a>
                )}
                {bruger?.email && (
                  <a href={`mailto:${bruger.email}`} className={Styles.kontaktKnap}>
                    <Mail size={13} />
                    <span>{bruger.email}</span>
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div className={Styles.tabNavigationContainer}>
          <div 
            ref={tabsContainerRef}
            className={Styles.profilTabsContainer}
          >
            <div className={`${Styles.profilTabsWrapper} ${isScrolledToEnd ? Styles.scrolledToEnd : ''}`}>
              {tabs.map((tab, index) => (
                <button
                  key={tab.id}
                  ref={(el) => (tabRefs.current[index] = el)}
                  onClick={() => handleTabChange(tab.id)}
                  className={`${Styles.profilTabButton} ${activeTab === tab.id ? Styles.active : ""}`}
                >
                  <span className={Styles.tabIcon}>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
              <div
                className={Styles.profilTabUnderline}
                style={{
                  width: underlineStyle.width,
                  transform: `translateX(${underlineStyle.left}px)`,
                  transition: 'width 0.2s ease, transform 0.4s ease',
                }}
              />
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className={Styles.indstillingerContent}>
          <AnimatePresence mode="wait">
            {/* Overblik Tab */}
            {activeTab === "overblik" && canViewFullProfile && (
            <motion.div
              key="overblik"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
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
            </motion.div>
          )}

          {/* Opgaver Tab */}
          {activeTab === "opgaver" && (
            <motion.div
              key="opgaver"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div>
                {/* Tom for nu */}
              </div>
            </motion.div>
          )}

          {/* Økonomi Tab */}
          {activeTab === "økonomi" && canViewFullProfile && (
            <motion.div
              key="økonomi"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <ProfilØkonomi 
                posteringer={posteringer} 
                user={user} 
                bruger={bruger}
              />
            </motion.div>
          )}

          {/* Om Tab */}
          {activeTab === "om" && (
            <motion.div
              key="om"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div>
                {/* Tom for nu */}
              </div>
            </motion.div>
          )}

          {/* Arbejdspræferencer Tab */}
          {activeTab === "arbejdspræferencer" && canViewFullProfile && (
            <motion.div
              key="arbejdspræferencer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className={Styles.arbejdsPræferencerSektion}>
                <h2>Arbejdspræferencer</h2>
                <div className={Styles.arbejdsPræferencerKnapperDiv}>
                  <div className={Styles.arbejdsPræferencerKnap} onClick={() => canEditSettings && setArbejdsOmrådePopup(true)} style={{cursor: canEditSettings ? 'pointer' : 'default'}}>
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
                  <div className={Styles.arbejdsPræferencerKnap} onClick={() => canEditSettings && setOpgaveTyperPopup(true)} style={{cursor: canEditSettings ? 'pointer' : 'default'}}>
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
                  <div className={Styles.arbejdsPræferencerKnap} onClick={() => setLedighedModal(true)} style={{cursor: 'pointer'}}>
                    <h3>Ledighed</h3>
                    <div className={Styles.arbejdsPræferencerKnapEndDiv}>
                      <div className={Styles.arbejdsPræferencerKnapGraaInfoBoks}>
                        <Calendar height={14} />
                      </div>
                    </div>
                  </div>
                </div>
                {/* <ArbejdsRadiusMap /> */}
              </div>
            </motion.div>
          )}

          {/* Indstillinger Tab */}
          {activeTab === "indstillinger" && canEditSettings && (
            <motion.div
              key="indstillinger"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className={Styles.indstillingerSektion}>
                <h2>Indstillinger</h2>
                <SettingsButtons
                  items={[
                    {
                      title: "Personlige informationer",
                      icon: <SquarePen />,
                      onClick: () => setRedigerPersonligeOplysninger(true),
                    },
                    ...(canEditPassword ? [{
                      title: "Skift kodeord",
                      icon: <RectangleEllipsis />,
                      onClick: () => setSkiftKodeord(true),
                    }] : [])
                  ]}
                />
                {isOwnProfile && isMobile && (
                  <div className={Styles.infoListe}>
                    {(user.pushSubscription && permission === 'granted') ? <button className={`${Styles.newButton} ${Styles.afmeldPush}`} onClick={handleUnsubscribeToPush}><BellOff style={{width: 20, height: 20, marginRight: 10}}/>Afmeld push-notifikationer</button> : <button className={`${Styles.newButton} ${Styles.tilmeldPush}`} onClick={() => {handleSubscribeToPush(user, updateUser)}}><BellRing style={{width: 20, height: 20, marginRight: 10}}/>Accepter push-notifikationer</button>}
                    {/* <button className={Styles.newButton} onClick={() => nyNotifikation(user, user, "Modificerbar test-notifikation", "Dette er en modificerbar testnotifikation.")}><BellRing style={{width: 20, height: 20, marginRight: 10}}/>Send test-notifikation</button> */}
                    <p>{pushDebugMessage}</p>
                  </div>
                )}
                {isAdmin && (!bruger?.isAdmin || isOwnProfile) && (
                  <div className={Styles.indstillingerSektion} style={{ marginTop: '2rem' }}>
                    <h2>Administrative indstillinger</h2>
                    <SettingsButtons
                      items={[
                        {
                          title: "Prioritet",
                          icon: <Star />,
                          onClick: () => setPrioritetPopup(true),
                          value: prioritet
                        },
                        {
                          title: "Lønsatser",
                          icon: <SlidersVertical />,
                          onClick: () => setLønsatserModal(bruger),
                          value: beregnLøntrin(bruger) ? `Løntrin ${beregnLøntrin(bruger)}` : null
                        }
                      ]}
                    />
                  </div>
                )}
              </div>
            </motion.div>
          )}
          </AnimatePresence>
        </div>
        {canEditSettings && (
          <>
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
                {canEditPassword && (
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
                )}
              <ProfilePictureModal trigger={profilbilledeModal} setTrigger={setProfilbilledeModal} user={user} bruger={bruger} refetchBruger={refetchBruger} setRefetchBruger={setRefetchBruger} />
              <ArbejdsOmrådeModal trigger={arbejdsOmrådePopup} setTrigger={setArbejdsOmrådePopup} user={user} bruger={bruger} refetchBruger={refetchBruger} setRefetchBruger={setRefetchBruger} />
              <VælgOpgavetyperModal trigger={opgaveTyperPopup} setTrigger={setOpgaveTyperPopup} user={user} bruger={bruger} refetchBruger={refetchBruger} setRefetchBruger={setRefetchBruger} opgavetyper={opgavetyper}/>
              <VisLedighedModal trigger={ledighedModal} setTrigger={setLedighedModal} brugerID={brugerID} />
              {isAdmin && (!bruger?.isAdmin || isOwnProfile) && (
                <>
                  <PrioritetModal trigger={prioritetPopup} setTrigger={setPrioritetPopup} user={user} bruger={bruger} refetchBruger={refetchBruger} setRefetchBruger={setRefetchBruger} />
                  <RedigerLøntrin trigger={lønsatserModal} setTrigger={(value) => {
                    setLønsatserModal(value);
                    if (!value) {
                      setRefetchBruger(prev => !prev);
                    }
                  }} />
                </>
              )}
          </>
        )}
      </div>
    // </PageAnimation>
  )
}

export default Profil

