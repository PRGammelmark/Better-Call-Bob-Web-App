import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Logo from '../assets/bcb-logo.svg'
import HamburgerIcon from '../assets/hamburgerIcon.svg'
import BackIcon from '../assets/backMobile.svg'
import { useLogout } from '../hooks/useLogout.js'
import Styles from './Header.module.css'
import { useAuthContext } from '../hooks/useAuthContext'
import MobileNavMenu from './MobileNavMenu'

const Header = () => {

  const [showNavMenu, setShowNavMenu] = useState(false);
  const [navTitle, setNavTitle] = useState("")
  const [showBackIcon, setShowBackIcon] = useState(false)
  
  const { user } = useAuthContext();
  const { logout } = useLogout();
  const location = useLocation();
  const navigate = useNavigate();

  // Mapping of routes to titles
  const routeTitles = {
    '/': "🗓️ Overblik",
    '/alle-opgaver': "🗂️ Alle opgaver",
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