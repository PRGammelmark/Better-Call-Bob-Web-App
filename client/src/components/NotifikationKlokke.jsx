import { useState, useContext, useRef, useEffect, useActionState } from "react";
import { Bell, Trash2, Plus, BellDot, CalendarPlus, CalendarMinus, CalendarSearch, ClipboardPlus, MessageCirclePlus, MessageCircleMore, ClockPlus, ClockFading, ClockAlert, UserPlus, UserMinus, CircleFadingPlus, ClipboardCheck, ClipboardCopy, ImagePlus, ClipboardX, Settings, Check } from "lucide-react";
import { NotifikationContext } from "../context/NotifikationContext";
import Styles from './NotifikationKlokke.module.css'
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import 'dayjs/locale/da'; 
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuthContext } from "../hooks/useAuthContext";
import PopUpMenu from './basicComponents/PopUpMenu.jsx'
import { AnimatePresence, motion } from "framer-motion";

export default function NotifikationKlokke({ background, color }) {
  const { notifikationer, setNotifikationer } = useContext(NotifikationContext);
  const [henterFlereNotifikationer, setHenterFlereNotifikationer] = useState(false);
  const [ikkeFlereNotifikationer, setIkkeFlereNotifikationer] = useState(false);
  const [åbenNotifikationer, setÅbenNotifikationer] = useState(false);
  const wrapperRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  const { user } = useAuthContext();
  const navigate = useNavigate();
  dayjs.extend(relativeTime);
  dayjs.locale('da');

useEffect(() => {
  const handleResize = () => {
    setIsMobile(window.innerWidth <= 750);
  };

  handleResize(); // kør én gang ved mount
  window.addEventListener("resize", handleResize);

  return () => window.removeEventListener("resize", handleResize);
}, []);

  const dekstopAnimation = {
    initial: { opacity: 0, y: -10, scale: 0.2, transformOrigin: "top right" },
    animate: { opacity: 1, y: 0, scale: 1, transformOrigin: "top right" },
    exit: { opacity: 0, y: -10, scale: 0.2, transformOrigin: "top right" },
    transition: { type: "spring", stiffness: 300, damping: 24 }
  };

  const mobileAnimation = {
    initial: { opacity: 1, x: "100%" },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 1, x: "100%" },
    transition: { type: "spring", stiffness: 300, damping: 34 }
  };
  

  function iconMap(type) {
    switch (type) {
      case "nyOpgave":
        return <Plus />;
      case "besøgOprettet":
        return <CalendarPlus />;
      case "besøgFjernet":
        return <CalendarMinus />;
      case "besøgOpdateret":
        return <CalendarSearch />;
      case "opgaveOprettet":
        return <ClipboardPlus />;
      case "kommentarOprettet":
        return <MessageCirclePlus />;
      case "kommentarOpdateret":
        return <MessageCircleMore />;
      case "ledigTidOprettet":
        return <ClockPlus />;
      case "ledigTidOpdateret":
        return <ClockAlert />;
      case "ledigTidFjernet":
        return <ClockFading />;
      case "opgaveTildelt":
        return <ClipboardPlus />;
      case "opgaveFjernet":
        return <ClipboardX />;
      case "opgaveBeskrivelseOpdateret":
        return <CircleFadingPlus />;
      case "opgaveAfsluttet":
        return <ClipboardCheck />;
      case "opgaveGenåbnet":
        return <ClipboardCopy />;
      case "opgaveBillederTilføjet":
        return <ImagePlus />;
      default:
      return <BellDot />;
    }
  }
  
  const første10Notifikationer = notifikationer.slice(0, 10);
  const usete = første10Notifikationer.filter(n => !n.set);

  // Luk dropdown hvis klik udenfor
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setÅbenNotifikationer(false);
      }
    };
  
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
  
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);
  

  const handleClick = (notifikation) => {    
    axios.patch(`${import.meta.env.VITE_API_URL}/notifikationer/laest/${notifikation._id}`, {}, {
      headers: { 'Authorization': `Bearer ${user.token}` }
    })
    .then(res => {
      setNotifikationer(prev => prev.map(n => n._id === notifikation._id ? { ...n, læst: true } : n));
    })
    .catch(err => {
      console.log(err);
    })
    
    if(notifikation.link) {
      navigate(notifikation.link);
      setÅbenNotifikationer(false);
    } else {
      setTimeout(() => {
        setÅbenNotifikationer(false);
      }, 1000);
    }
  }

  function handleÅbnNotifikationer() {
  
    if (usete.length > 0) {
      const ids = usete.map(n => n._id);
  
      axios.patch(`${import.meta.env.VITE_API_URL}/notifikationer/set`, { ids }, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      })
      .then(() => {
        setNotifikationer(prev =>
          prev.map(n =>
            ids.includes(n._id) ? { ...n, set: true } : n
          )
        );
      })
      .catch(err => console.log(err));
    }
  
    setÅbenNotifikationer(!åbenNotifikationer);
  }

  function handleMarkérSomLæstEllerUlæst(notifikation) {
    const endpoint = notifikation.læst
      ? `${import.meta.env.VITE_API_URL}/notifikationer/ulaest/${notifikation._id}`
      : `${import.meta.env.VITE_API_URL}/notifikationer/laest/${notifikation._id}`;
  
    axios.patch(endpoint, {}, {
      headers: { 'Authorization': `Bearer ${user.token}` }
    })
    .then(() => {
      setNotifikationer(prev =>
        prev.map(n =>
          n._id === notifikation._id ? { ...n, læst: !n.læst } : n
        )
      );
    })
    .catch(err => console.log(err));
  }  
  

  function handleSletNotifikation(notifikation) {
    axios.delete(`${import.meta.env.VITE_API_URL}/notifikationer/${notifikation._id}`, {
      headers: { 'Authorization': `Bearer ${user.token}` }
    })
    .then(() => {
      setNotifikationer(prev =>
        prev.filter(n => n._id !== notifikation._id)
      );
    })
    .catch(err => console.log(err));
  }
  
  function handleÅbnSettings() {
    navigate("/din-konto");
    setTimeout(() => {
      setÅbenNotifikationer(false);
    }, 1000);
  }

  function hentFlereNotifikationer() {
    setHenterFlereNotifikationer(true);
    axios.get(`${import.meta.env.VITE_API_URL}/notifikationer/flere/${user.id}`, {
      params: { offset: notifikationer.length },
      headers: { Authorization: `Bearer ${user.token}` }
    })
    .then(res => {
      if(res.data.length === 0) {
        setIkkeFlereNotifikationer(true);
        setHenterFlereNotifikationer(false);
        return;
      }
      setNotifikationer(prev => [...prev, ...res.data]);
      setHenterFlereNotifikationer(false);
    })
    .catch(err => {
      console.log(err);
      setHenterFlereNotifikationer(false);
      setIkkeFlereNotifikationer(true);
      setTimeout(() => {
        setHenterFlereNotifikationer(false);
        setIkkeFlereNotifikationer(false);
      }, 10000);
    });
    
  }

  return (
    <div className={Styles.notifikationKlokkeContainer} ref={wrapperRef}>
      <div 
        className={Styles.bell} 
        style={{ background, color }} 
        onClick={() => handleÅbnNotifikationer()}
      >
        <Bell size={20} />
        {usete.length > 0 && (
          <span className={Styles.useteBadge}>{usete.length}</span>
        )}
      </div>
      <AnimatePresence mode="sync">
      {åbenNotifikationer && (
        <motion.div className={Styles.dropdownContainer} variants={isMobile ? mobileAnimation : dekstopAnimation} initial="initial" animate="animate" exit="exit" transition={isMobile ? mobileAnimation.transition : dekstopAnimation.transition}>
          <div className={Styles.dropdown}>
          <div className={Styles.notifikationerHeader}>
            <b className={Styles.notifikationerHeaderTitle}>Notifikationer</b>
            <div>
              <button onClick={() => handleÅbnSettings()}><Settings size={20} color="#222222" /></button>
            </div>
          </div>
          <div className={Styles.notifikationerContainer}>
          {notifikationer.length > 0 ? (
            notifikationer.map((n) => (
              <div key={n._id} className={`${Styles.notifikationRow} ${n.læst ? "" : Styles.ikkeLæstRow}`} onClick={() => handleClick(n)}>
                  <div className={Styles.notifikationIcon}>{iconMap(n.type)}</div>
                  <div>
                    <div className={Styles.title}><b>{n.titel}</b></div>
                    {n.besked && <div className={Styles.besked}>{n.besked}</div>}
                    <div className={Styles.notifikationDatoTid}>{dayjs(n.createdAt).fromNow()}</div>
                  </div>
                  <div className={Styles.læstDivContainer}>
                    {!n.læst && <div className={Styles.læstDiv}></div>}
                  </div>
                  <div className={Styles.popUpMenuContainer}>
                  <PopUpMenu
                      actions={[
                      n.læst && {
                          icon: <Check />,
                          label: "Markér som ulæst",
                          onClick: (e) => handleMarkérSomLæstEllerUlæst(n),
                      },
                      !n.læst && {
                          icon: <Check />,
                          label: "Markér som læst",
                          onClick: (e) => handleMarkérSomLæstEllerUlæst(n),
                      },
                      {
                        icon: <Trash2 />,
                        label: "Slet notifikation",
                        onClick: (e) => handleSletNotifikation(n),
                      }
                      ].filter(Boolean)}
                  />
                  </div>
              </div>
            ))
          ) : (
              <div className={Styles.empty}>Ingen notifikationer</div>
            )}
          </div>
          <div className={Styles.hentFlereNotifikationerDiv}>
            <button className={Styles.hentFlereNotifikationerButton} onClick={() => hentFlereNotifikationer()} disabled={henterFlereNotifikationer || ikkeFlereNotifikationer}>{henterFlereNotifikationer ? "Henter flere notifikationer..." : ikkeFlereNotifikationer ? "Ikke flere notifikationer" : "Hent flere notifikationer"}</button>
            </div>
          </div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}