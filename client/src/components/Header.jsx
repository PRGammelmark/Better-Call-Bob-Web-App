import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Logo from '../assets/bcb-logo.svg'
import HamburgerIcon from '../assets/hamburgerIcon.svg'
import BackIcon from '../assets/backMobile.svg'
import SwitchArrows from '../assets/switchArrows.svg'
import { useLogout } from '../hooks/useLogout.js'
import Styles from './Header.module.css'
import { useAuthContext } from '../hooks/useAuthContext'
import MobileNavMenu from './MobileNavMenu'
import { useOverblikView } from '../context/OverblikViewContext.jsx'
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
    '/dokumenter': "📄 Dokumenter",
    '/indstillinger': "⚙️ Indstillinger",
    '/opgave/:opgaveID': "OpgaveID",
    '/ny-opgave': "📋 Opret ny opgave",
    '/ny-bruger': "👷🏼‍♂️ Opret ny bruger",
    '/login': "Log ind"
  }

  const routesWithBackIcon = ['/opgave', '/ny-opgave', '/ny-bruger'];

  // Set titles on location update
  useEffect(() => {
    if (location.pathname.startsWith('/opgave/')) {
      const opgaveID = location.pathname.split('/').pop() || ""
      const lastThreeChars = opgaveID.slice(-3)
      setNavTitle(`📋 Opgave #${lastThreeChars}`)
      setShowBackIcon(true); // Show back icon for dynamic opgave route
    } else if (routesWithBackIcon.includes(location.pathname)) {
      const currentTitle = routeTitles[location.pathname] || 'Ingen titel'
      setNavTitle(currentTitle)
      setShowBackIcon(true); // Show back icon for specific routes
    } else {
      const currentTitle = routeTitles[location.pathname] || 'Ingen titel'
      setNavTitle(currentTitle)
      setShowBackIcon(false); // Hide back icon for other routes
    }
  }, [location.pathname])

  const handleLogout = () => {
    logout()
  }

  const handleBackClick = () => {
    navigate(-1); // Navigate one step back in the history
  }

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
                {location.pathname === '/' && 
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