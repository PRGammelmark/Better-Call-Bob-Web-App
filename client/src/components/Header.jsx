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
    '/': "🗓️ Overblik",
    '/alle-opgaver': "🗂️ Aktuelle opgaver",
    '/afsluttede-opgaver': "✅ Afsluttede opgaver",
    '/slettede-opgaver': "🗑️ Papirkurv",
    '/mine-opgaver': "📌 Mine opgaver",
    '/team': "🤝 Teamet",
    '/kunder': "👥 Kunder",
    '/kunde/:kundeID': "Kunde",
    '/dokumenter': "📄 Dokumenter",
    '/indstillinger': "⚙️ Indstillinger",
    '/ny-kunde': "👥 Opret ny kunde",
    '/hjaelp': "Hjælp",
    '/version': `Ændringslog (v${currentVersion})`,
    '/opgave/:opgaveID': "OpgaveID",
    '/ny-opgave': "📋 Opret ny opgave",
    '/ny-bruger': "👷🏼‍♂️ Opret ny bruger",
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
    setNavTitle(`📋 Opgave #${lastThreeChars}`);
  } else if (currentTitleRoute) {
    setNavTitle(routeTitles[currentTitleRoute]);
  } else {
    setNavTitle("Ingen titel");
  }

  setShowBackIcon(!!matchedRoute);
}, [location.pathname]);


  const handleLogout = () => {
    logout()
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
          <nav>
              <ul className={Styles.headerUl}>
                  {user ? <li className={Styles.headerLi} onClick={handleLogout}>Log ud</li> : null}
              </ul>
          </nav>
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
                  <img src={SwitchArrows} alt="" className={`${Styles.backIconMobile} ${Styles.switchIcon}`} />
                </div>}
              </div>
              <h3 className={Styles.mobileNavHeading}>{navTitle || "Ingen titel"}</h3>
              <img onClick={() => {showNavMenu ? setShowNavMenu(false) : setShowNavMenu(true)}} className={Styles.hamburgerMobile} src={HamburgerIcon} alt="" />
          </nav>
          {showNavMenu ? <MobileNavMenu handleLogout={handleLogout} setShowNavMenu={setShowNavMenu}/> : null}
      </header>
    </>
  )
}

export default Header