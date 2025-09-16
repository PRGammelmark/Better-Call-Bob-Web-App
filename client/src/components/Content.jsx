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
import { react, useState, useEffect } from 'react'
import AnimatedOutlet from './AnimatedOutlet.jsx'
import { LayoutGrid, Clipboard, ClipboardList, ClipboardCheck, Trash2, Pin, IdCardLanyard, User, Users, House, UserRoundPlus, ScrollText, Settings, CircleQuestionMark, ClipboardPlus, LogOut } from 'lucide-react';


const Content = () => {

  const { user } = useAuthContext();
  const location = useLocation()

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
              <li><NavLink to="/" className={ContentCSS.sidebarItem}><LayoutGrid height={16} />Overblik</NavLink></li>
              {user.isAdmin && <li><NavLink to="alle-opgaver" className={ContentCSS.sidebarItem}><Clipboard height={16} />Alle opgaver</NavLink></li>}
              {!user.isAdmin && <li><NavLink to="mine-opgaver" className={ContentCSS.sidebarItem}><Clipboard height={16} />Mine opgaver</NavLink></li>}
              {user.isAdmin && <li><NavLink to="kunder" className={ContentCSS.sidebarItem}><Users height={16} />Kunder</NavLink></li>}
              <li><NavLink to="team" className={ContentCSS.sidebarItem}><House height={16} />Team</NavLink></li>
              <li><NavLink to="dokumenter" className={ContentCSS.sidebarItem}><ScrollText height={16} />Dokumenter</NavLink></li>
              <li><NavLink to="din-konto" className={ContentCSS.sidebarItem}><User height={16} />Profil</NavLink></li>
              <li><NavLink to="app-indstillinger" className={ContentCSS.sidebarItem}><Settings height={16} />Indstillinger</NavLink></li>
              <li><NavLink to="hjaelp" className={ContentCSS.sidebarItem}><CircleQuestionMark height={16} />Hjælp</NavLink></li>
            </ul>
          </div>

          <div className={ContentCSS.content}>
            <AnimatedOutlet />
          </div>
          <FloatingActionButton />
        </div>
        
        <Footer />
    </>
  )
}

export default Content