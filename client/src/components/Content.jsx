import { NavLink, Outlet } from 'react-router-dom'
import ContentCSS from './Content.module.css'
import FloatingActionButton from './FloatingActionButton'
import { useAuthContext } from '../hooks/useAuthContext'
import Header from './Header'
import Footer from './Footer'
import { currentVersion } from '../version.js'
import ServiceWorkerMessageHandler from '../serviceWorkerMessageHandler';


const Content = () => {

  const { user } = useAuthContext();


  return (
    <>
        <ServiceWorkerMessageHandler />
        <Header />
        <div className={ContentCSS.main}>

          <div className={ContentCSS.sidebar}>
            <div className={ContentCSS.velkomst}>
              <p className={ContentCSS.velkomstBesked}>Hej {user.navn.split(" ")[0]}! 👋</p>
            </div>
            <ul>
              <li><NavLink to="/">Overblik</NavLink></li>
              {user.isAdmin && <li><NavLink to="alle-opgaver">Alle opgaver</NavLink></li>}
              {!user.isAdmin && <li><NavLink to="mine-opgaver">Mine opgaver</NavLink></li>}
              {user.isAdmin && <li><NavLink to="kunder">Kunder</NavLink></li>}
              <li><NavLink to="team">Team</NavLink></li>
              <li><NavLink to="dokumenter">Dokumenter</NavLink></li>
              <li><NavLink to="indstillinger">Indstillinger</NavLink></li>
              {/* <li><NavLink to="version">Opdateringer (v{currentVersion})</NavLink></li> */}
            </ul>
          </div>

          <div className={ContentCSS.content}>
            <Outlet />
          </div>

          <FloatingActionButton />
        </div>
        
        <Footer />
    </>
  )
}

export default Content
