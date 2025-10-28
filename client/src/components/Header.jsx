import { useState, useEffect } from 'react'
import { useLocation, useNavigate, matchPath } from 'react-router-dom'
import Logo from '../assets/bcb-logo.svg'
import HamburgerIcon from '../assets/hamburgerIcon.svg'
import BackIcon from '../assets/backMobile.svg'
import SwitchArrows from '../assets/switchArrows.svg'
import { useLogout } from '../hooks/useLogout.js'
import Styles from './Header.module.css'
import { useAuthContext } from '../hooks/useAuthContext'
import MobileNavMenu from './MobileNavMenu'
import { useOverblikView } from '../context/OverblikViewContext.jsx'
import { currentVersion, changes } from '../version.js'
import { ArrowLeftRight, LayoutGrid, ClipboardList, ClipboardCheck, Trash2, Pin, User, IdCardLanyard, Users, UserRoundPlus, ScrollText, Settings, CircleQuestionMark, ClipboardPlus, LogOut, Menu, Calendar } from 'lucide-react';
import NotifikationKlokke from './NotifikationKlokke'


const Header = () => {

  const [showNavMenu, setShowNavMenu] = useState(false);
  const [navTitle, setNavTitle] = useState("")
  const [showBackIcon, setShowBackIcon] = useState(false)
  const { managerOverblik, setManagerOverblik } = useOverblikView()
  const { user } = useAuthContext();
  const { logout } = useLogout();
  const location = useLocation();
  const navigate = useNavigate();

  // Mapping of routes to titles
  const routeTitles = {
    '/': (<div className={Styles.mobileTitle}> <LayoutGrid height={20} />Overblik</div>),
    '/alle-opgaver': (<div className={Styles.mobileTitle}> <ClipboardList height={20} />Aktuelle opgaver</div>),
    '/afsluttede-opgaver': (<div className={Styles.mobileTitle}> <ClipboardCheck height={20} />Afsluttede opgaver</div>),
    '/slettede-opgaver': (<div className={Styles.mobileTitle}> <Trash2 height={20} />Papirkurv</div>),
    '/mine-opgaver': (<div className={Styles.mobileTitle}> <Pin height={20} />Mine opgaver</div>),
    '/team': (<div className={Styles.mobileTitle}> <IdCardLanyard height={20} />Teamet</div>),
    '/kunder': (<div className={Styles.mobileTitle}> <Users height={20} />Kunder</div>),
    '/kunde/:kundeID': "Kunde",
    '/kalender': (<div className={Styles.mobileTitle}> <Calendar height={20} />Kalender</div>),
    '/dokumenter': (<div className={Styles.mobileTitle}> <ScrollText height={20} />Dokumenter</div>),
    '/din-konto': (<div className={Styles.mobileTitle}> <User height={20} />Profil</div>),
    '/app-indstillinger': (<div className={Styles.mobileTitle}> <Settings height={20} />App-indstillinger</div>),
    '/ny-kunde': (<div className={Styles.mobileTitle}> <UserRoundPlus height={20} />Opret ny kunde</div>),
    '/hjaelp': (<div className={Styles.mobileTitle}> <CircleQuestionMark height={20} />Hjælp</div>),
    '/version': `Ændringslog (v${currentVersion})`,
    '/opgave/:opgaveID': "OpgaveID",
    '/ny-opgave': (<div className={Styles.mobileTitle}> <ClipboardPlus height={20} />Opret ny opgave</div>),
    '/ny-bruger': (<div className={Styles.mobileTitle}> <UserRoundPlus height={20} />Opret ny bruger</div>),
    '/login': "Log ind"
  }

  // ===== PADDING TOP FOR ANDROID =====
  // useEffect(() => {
  //   const isAndroid = /android/i.test(navigator.userAgent);
  //   const headerEl = document.querySelector(`.${Styles.header}`);
  //   if (isAndroid && headerEl) {
  //     // typisk 24px er statusbar-højde på Android
  //     headerEl.style.paddingTop = '24px';
  //   }
  // }, []);

  const showBackIconRoutes = ['/opgave/:opgaveID', '/ny-opgave', '/ny-bruger', '/kunde/:kundeID', '/ny-kunde'];

const matchedRoute = showBackIconRoutes.find(route =>
  matchPath({ path: route, end: false }, location.pathname)
);

const currentTitleRoute = Object.keys(routeTitles).find(route =>
  matchPath({ path: route, end: true }, location.pathname)
);

useEffect(() => {
  if (location.pathname.startsWith('/opgave/')) {
    const opgaveID = location.pathname.split('/').pop() || "";
    const lastThreeChars = opgaveID.slice(-3);
    setNavTitle(<div className={Styles.mobileTitle}><ClipboardList height={20} />Opgave #{lastThreeChars}</div>);
  } else if (currentTitleRoute) {
    setNavTitle(routeTitles[currentTitleRoute]);
  } else {
    setNavTitle("Ingen titel");
  }

  setShowBackIcon(!!matchedRoute);
}, [location.pathname]);


  const handleLogout = () => {
    if(window.confirm("Er du sikker på, at du vil logge ud?")) {
      logout()
    }
  }

  const handleBackClick = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  const handleSwitchClick = () => {
    setManagerOverblik(!managerOverblik)
  }

  return (
    <>
      <header className={`${Styles.header} ${Styles.desktopHeader}`}>
          <img className={Styles.headerImg} src={Logo} alt="" />
          <div className={Styles.headerButtonsContainer}>
            <NotifikationKlokke background="#e7eae7" color="#222222" />
            <div className={Styles.headerButton} onClick={handleLogout}>
              <LogOut />
            </div>
          </div>
          {/* <nav>
              <ul className={Styles.headerUl}>
                  {user ? <li className={Styles.headerLi} onClick={handleLogout}><LogOut />Log ud</li> : null}
              </ul>
          </nav> */}
      </header>
      <header className={`${Styles.header} ${Styles.mobileHeader}`}>
          <nav className={Styles.mobileNavList}>
              <div className={Styles.backIconContainer}>
                {showBackIcon && <img src={BackIcon} alt="" className={Styles.backIconMobile} onClick={handleBackClick}/>}
                {user.isAdmin && location.pathname === '/' && 
                <div className={Styles.switchButtonContainer} onClick={handleSwitchClick}>
                    <p className={`${Styles.switchText} ${managerOverblik ? Styles.switchTextVisible : ''}`}>
                      Manager
                    </p>
                    <p className={`${Styles.switchText} ${!managerOverblik ? Styles.switchTextVisible : ''}`}>
                      Personlig
                    </p>
                  <div className={Styles.switchIconContainer}>
                    <ArrowLeftRight size={20} />
                    {/* <img src={SwitchArrows} alt="" className={`${Styles.backIconMobile} ${Styles.switchIcon}`} /> */}
                  </div>
                </div>}
              </div>
              <h3 className={Styles.mobileNavHeading}>{navTitle || "Ingen titel"}</h3>
              <div className={Styles.headerButtonsContainer}>
              <NotifikationKlokke background="#ffffff20" color="#ffffff" />
              {/* <div className={Styles.hamburgerMobileContainer}><Menu onClick={() => {showNavMenu ? setShowNavMenu(false) : setShowNavMenu(true)}} className={Styles.hamburgerMobile} size={20} /></div> */}
              </div>
              {/* <img onClick={() => {showNavMenu ? setShowNavMenu(false) : setShowNavMenu(true)}} className={Styles.hamburgerMobile} src={HamburgerIcon} alt="" /> */}
          </nav>
          {showNavMenu ? <MobileNavMenu handleLogout={handleLogout} setShowNavMenu={setShowNavMenu}/> : null}
      </header>
    </>
  )
}

export default Header