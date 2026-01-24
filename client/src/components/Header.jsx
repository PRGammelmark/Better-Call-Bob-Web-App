import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate, matchPath } from 'react-router-dom'
import LogoPlaceholder from '../assets/logo-placeholder.png'
import HamburgerIcon from '../assets/hamburgerIcon.svg'
import BackIcon from '../assets/backMobile.svg'
import SwitchArrows from '../assets/switchArrows.svg'
import Styles from './Header.module.css'
import { useAuthContext } from '../hooks/useAuthContext'
import MobileNavMenu from './MobileNavMenu'
import { useOverblikView } from '../context/OverblikViewContext.jsx'
import { useIndstillinger } from '../context/IndstillingerContext.jsx'
import { useAppSettingsNavigation } from '../context/AppSettingsNavigationContext.jsx'
import { currentVersion, changes } from '../version.js'
import { ArrowLeftRight, LayoutGrid, ClipboardList, ClipboardCheck, Trash2, Pin, User, IdCardLanyard, Users, UserRoundPlus, ScrollText, Settings, CircleQuestionMark, ClipboardPlus, Menu, Calendar, ChevronLeft, Coins } from 'lucide-react';
import NotifikationKlokke from './NotifikationKlokke'
import Søgning from './Søgning'


const Header = () => {

  const [showNavMenu, setShowNavMenu] = useState(false);
  const [navTitle, setNavTitle] = useState("")
  const [showBackIcon, setShowBackIcon] = useState(false)
  const [åbenNotifikationer, setÅbenNotifikationer] = useState(false);
  const [åbenSøgning, setÅbenSøgning] = useState(false);
  const notifikationKlokkeDesktopRef = useRef(null);
  const søgningDesktopRef = useRef(null);
  const { managerOverblik, setManagerOverblik } = useOverblikView()
  const { user } = useAuthContext();
  const { indstillinger } = useIndstillinger();
  const { activeSettingsPage, setActiveSettingsPage } = useAppSettingsNavigation();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 750);
  
  // Use logo from indstillinger if available, otherwise use placeholder logo
  const headerLogo = indstillinger?.logo || LogoPlaceholder;
  // Use logoSize from indstillinger if available, otherwise use default 100%
  const logoSize = indstillinger?.logoSize || 100;

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
    '/profil/:brugerID': (<div className={Styles.mobileTitle}> <User height={20} />Profil</div>),
    '/app-indstillinger': (<div className={Styles.mobileTitle}> <Settings height={20} />App-indstillinger</div>),
    '/okonomi': (<div className={Styles.mobileTitle}> <Coins height={20} />Økonomi</div>),
    '/ny-kunde': (<div className={Styles.mobileTitle}> <UserRoundPlus height={20} />Opret ny kunde</div>),
    '/hjaelp': (<div className={Styles.mobileTitle}> <CircleQuestionMark height={20} />Hjælp</div>),
    '/version': `Ændringslog (v${currentVersion})`,
    '/opgave/:opgaveID': "OpgaveID",
    '/ny-opgave': (<div className={Styles.mobileTitle}> <ClipboardPlus height={20} />Opret ny opgave</div>),
    '/ny-bruger': (<div className={Styles.mobileTitle}> <UserRoundPlus height={20} />Opret ny bruger</div>),
    '/login': "Log ind"
  }

  const showBackIconRoutes = ['/opgave/:opgaveID', '/ny-opgave', '/ny-bruger', '/kunde/:kundeID', '/ny-kunde'];

  // Page titles for app settings sub-pages
  const settingsPageTitles = {
    'virksomhedsoplysninger': 'Virksomhedsoplysninger',
    'links': 'Links',
    'beta-funktioner': 'Beta-funktioner',
    'timer-tillæg': 'Timer & tillæg',
    'materialer': 'Materialer',
    'opkrævning': 'Opkrævning',
    'rettigheder': 'Rettigheder',
    'arbejdspræferencer': 'Arbejdspræferencer',
    'branding': 'Branding',
    'fintuning': 'Fintuning',
    'informationsbokse': 'Informationsbokse'
  };

  // Handle window resize for mobile detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 750);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

const matchedRoute = showBackIconRoutes.find(route =>
  matchPath({ path: route, end: false }, location.pathname)
);

const currentTitleRoute = Object.keys(routeTitles).find(route =>
  matchPath({ path: route, end: true }, location.pathname)
);

useEffect(() => {
  // Reset active settings page if we navigate away from app-indstillinger
  if (location.pathname !== '/app-indstillinger' && activeSettingsPage) {
    setActiveSettingsPage(null);
  }

  // Check if we're on app-indstillinger with an active sub-page (mobile only)
  const isOnSettingsWithSubPage = location.pathname === '/app-indstillinger' && activeSettingsPage && isMobile;
  
  if (isOnSettingsWithSubPage) {
    // Show sub-page title in header
    setNavTitle(settingsPageTitles[activeSettingsPage] || "Indstillinger");
    setShowBackIcon(true);
  } else if (location.pathname.startsWith('/opgave/')) {
    const opgaveID = location.pathname.split('/').pop() || "";
    const lastThreeChars = opgaveID.slice(-3);
    setNavTitle(<div className={Styles.mobileTitle}><ClipboardList height={20} />Opgave #{lastThreeChars}</div>);
    setShowBackIcon(!!matchedRoute);
  } else if (currentTitleRoute) {
    setNavTitle(routeTitles[currentTitleRoute]);
    setShowBackIcon(!!matchedRoute);
  } else {
    setNavTitle("Ingen titel");
    setShowBackIcon(!!matchedRoute);
  }
}, [location.pathname, activeSettingsPage, isMobile, setActiveSettingsPage]);

useEffect(() => {
  const handleClickOutside = (event) => {
    if (åbenNotifikationer) {
      const isClickInsideDesktop = notifikationKlokkeDesktopRef.current?.contains(event.target);
      
      if (!isClickInsideDesktop) {
        setÅbenNotifikationer(false);
      }
    }
    // På mobil håndterer Søgning-komponenten selv sin close-logik via "Annuller"-knappen
    // så vi skal ikke lukke den via click outside her
    if (åbenSøgning && !isMobile) {
      const isClickInsideSøgning = søgningDesktopRef.current?.contains(event.target);
      
      if (!isClickInsideSøgning) {
        setÅbenSøgning(false);
      }
    }
  };

  if (åbenNotifikationer || (åbenSøgning && !isMobile)) {
    document.addEventListener('mousedown', handleClickOutside);
  }

  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
  };
}, [åbenNotifikationer, åbenSøgning, isMobile]);

  const handleBackClick = () => {
    // If we're on app-indstillinger with an active sub-page, go back to settings sidebar
    if (location.pathname === '/app-indstillinger' && activeSettingsPage && isMobile) {
      setActiveSettingsPage(null);
    } else if (window.history.length > 1) {
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
          <img 
            className={Styles.headerImg} 
            src={headerLogo} 
            alt="" 
            style={{ height: `${logoSize}%` }}
          />
          <div className={Styles.headerButtonsContainer}>
            <div ref={søgningDesktopRef}>
              <Søgning background="#e7eae7" color="#222222" åbenSøgning={åbenSøgning} setÅbenSøgning={setÅbenSøgning} onOpen={() => setÅbenNotifikationer(false)} />
            </div>
            <div ref={notifikationKlokkeDesktopRef}>
              <NotifikationKlokke background="#e7eae7" color="#222222" åbenNotifikationer={åbenNotifikationer} setÅbenNotifikationer={setÅbenNotifikationer} onOpen={() => setÅbenSøgning(false)} />
            </div>
          </div>
      </header>
      <header className={`${Styles.header} ${Styles.mobileHeader}`}>
          <nav className={Styles.mobileNavList}>
              <div className={`${Styles.backIconContainer} ${(åbenNotifikationer || åbenSøgning) ? Styles.fadeOut : ''}`}>
                {showBackIcon && (
                  location.pathname === '/app-indstillinger' && activeSettingsPage && isMobile ? (
                    <ChevronLeft size={24} className={Styles.backChevronMobile} onClick={handleBackClick} />
                  ) : (
                    <img src={BackIcon} alt="" className={Styles.backIconMobile} onClick={handleBackClick}/>
                  )
                )}
                {user.isAdmin && location.pathname === '/' && !activeSettingsPage && 
                <div className={Styles.switchButtonContainer} onClick={handleSwitchClick}>
                    <p className={`${Styles.switchText} ${managerOverblik ? Styles.switchTextVisible : ''}`}>
                      Manager
                    </p>
                    <p className={`${Styles.switchText} ${!managerOverblik ? Styles.switchTextVisible : ''}`}>
                      Personlig
                    </p>
                  <div className={Styles.switchIconContainer}>
                    <ArrowLeftRight size={20} />
                  </div>
                </div>}
              </div>
              <h3 className={`${Styles.mobileNavHeading} ${(åbenNotifikationer || åbenSøgning) ? Styles.fadeOut : ''}`}>{navTitle || "Ingen titel"}</h3>
              <div className={Styles.headerButtonsContainer}>
                <Søgning background={"#ffffff20"} color={"#ffffff"} åbenSøgning={åbenSøgning} setÅbenSøgning={setÅbenSøgning} onOpen={() => setÅbenNotifikationer(false)} />
                <NotifikationKlokke background={"#ffffff20"} color={"#ffffff"} åbenNotifikationer={åbenNotifikationer} setÅbenNotifikationer={setÅbenNotifikationer} onOpen={() => setÅbenSøgning(false)} />
              </div>
          </nav>
          {showNavMenu ? <MobileNavMenu setShowNavMenu={setShowNavMenu}/> : null}
      </header>
    </>
  )
}

export default Header