import { NavLink, Outlet, useLocation, useOutlet } from 'react-router-dom'
import ContentCSS from './Content.module.css'
import FloatingActionButton from './FloatingActionButton'
import { useAuthContext } from '../hooks/useAuthContext'
import Header from './Header'
import Footer from './Footer'
import { currentVersion } from '../version.js'
import ServiceWorkerMessageHandler from '../serviceWorkerMessageHandler';
import { AnimatePresence, motion } from 'framer-motion'
import PageWrapper from '../pages/PageWrapper';
import { react, useState, useEffect, useRef } from 'react'
import AnimatedOutlet from './AnimatedOutlet.jsx'
import { LayoutGrid, Clipboard, ClipboardList, ClipboardCheck, Trash2, Pin, IdCardLanyard, User, Users, House, UserRoundPlus, ScrollText, Settings, CircleQuestionMark, ClipboardPlus, LogOut, Coins } from 'lucide-react';
import dayjs from 'dayjs';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Bottombar from './bottombar/Bottombar'
import { useLogout } from '../hooks/useLogout.js'


const Content = () => {
  const contentRef = useRef(null)
  const { user } = useAuthContext();
  const location = useLocation()
  const userID = user?.id || user?._id;
  const { logout } = useLogout();

  const handleLogout = () => {
    if(window.confirm("Er du sikker på, at du vil logge ud?")) {
      logout()
    }
  }

  return (
    <>
        <ServiceWorkerMessageHandler />
        <Header />
        <div className={ContentCSS.main}>
          <div className={ContentCSS.sidebar}>
            <div>
              <ul>
                <li><NavLink to="/" className={ContentCSS.sidebarItem}><LayoutGrid height={16} className={ContentCSS.sidebarIcon} /><p>Overblik</p></NavLink></li>
                {user.isAdmin && <li><NavLink to="alle-opgaver" className={ContentCSS.sidebarItem}><Clipboard height={16} className={ContentCSS.sidebarIcon} /><p>Alle opgaver</p></NavLink></li>}
                {!user.isAdmin && <li><NavLink to="mine-opgaver" className={ContentCSS.sidebarItem}><Clipboard height={16} className={ContentCSS.sidebarIcon} /><p>Mine opgaver</p></NavLink></li>}
                {user.isAdmin && <li><NavLink to="kunder" className={ContentCSS.sidebarItem}><Users height={16} className={ContentCSS.sidebarIcon} /><p>Kunder</p></NavLink></li>}
                <li><NavLink to="team" className={ContentCSS.sidebarItem}><House height={16} className={ContentCSS.sidebarIcon} /><p>Team</p></NavLink></li>
                {user.isAdmin && <li><NavLink to="okonomi" className={ContentCSS.sidebarItem}><Coins height={16} className={ContentCSS.sidebarIcon} /><p>Økonomi</p></NavLink></li>}
                <li><NavLink to="dokumenter" className={ContentCSS.sidebarItem}><ScrollText height={16} className={ContentCSS.sidebarIcon} /><p>Dokumenter</p></NavLink></li>
                <li><NavLink to={`profil/${userID}`} className={ContentCSS.sidebarItem}><User height={16} className={ContentCSS.sidebarIcon} /><p>Profil</p></NavLink></li>
                <li><NavLink to="app-indstillinger" className={ContentCSS.sidebarItem}><Settings height={16} className={ContentCSS.sidebarIcon} /><p>Indstillinger</p></NavLink></li>
                <li><NavLink to="hjaelp" className={ContentCSS.sidebarItem}><CircleQuestionMark height={16} className={ContentCSS.sidebarIcon} /><p>Hjælp</p></NavLink></li>
                <li><div onClick={handleLogout} className={ContentCSS.sidebarItem} style={{ cursor: 'pointer' }}><LogOut height={16} className={ContentCSS.sidebarIcon} /><p>Log ud</p></div></li>
              </ul>
            </div>
            <p className={ContentCSS.datoTekst}>{dayjs().format("DD. MMMM [kl.] HH:mm")}</p>
          </div>

          <div className={ContentCSS.content} ref={contentRef} style={{ overscrollBehavior: location.pathname === '/kalender' ? 'none' : 'auto' }}>
            <AnimatedOutlet contentRef={contentRef} />
          </div>
          
          <Bottombar />
          <FloatingActionButton />
        </div>
        
        <Footer />
    </>
  )
}
 
export default Content