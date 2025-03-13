import './App.css'
import { useEffect, useState } from 'react'
import { createBrowserRouter, Route, Link, NavLink, createRoutesFromElements, RouterProvider, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion';
import Header from './components/Header'
import Footer from './components/Footer'
import Content from './components/Content'
import { useAuthContext } from './hooks/useAuthContext'
import FastClick from 'fastclick'
import ÅbnIAppen from './components/modals/ÅbnIAppen.jsx'
// pages
import Overblik from './pages/Overblik'
import AlleOpgaver from './pages/AlleOpgaver'
import MineOpgaver from './pages/MineOpgaver'
import Dokumenter from './pages/Dokumenter'
import Indstillinger from './pages/Indstillinger'
import Version from './pages/Version'
import ÅbenOpgave from './pages/ÅbenOpgave'
import NyOpgave from './pages/NyOpgave'
import NyBruger from './pages/NyBruger'
import Login from './pages/Login'
import Team from './pages/Team'
import AfsluttedeOpgaver from './pages/AfsluttedeOpgaver'
import SlettedeOpgaver from './pages/SlettedeOpgaver'
import GendanKodeord from './pages/GendanKodeord'

function App() {

  const { user } = useAuthContext();
  const [openedInBrowser, setOpenedInBrowser] = useState(false);

  useEffect(() => {
    if (!window.matchMedia('(display-mode: standalone)').matches && window.innerWidth < 750) {  
      setOpenedInBrowser(true);
    }
  }, []);

  useEffect(() => {
    FastClick(document.body);
  }, [])

  useEffect(() => {
    // Registering the service worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')  // Ensure that sw.js is in the root folder
          .then((registration) => {
            console.log('Service Worker registered with scope:', registration.scope);
          })
          .catch((error) => {
            console.log('Service Worker registration failed:', error);
          });
      });
    }
  }, []);

  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route path="/" element={user ? <Content /> : <Login />}>
          <Route index element={<Overblik />}/>
          <Route path="alle-opgaver" element={<AlleOpgaver />}/>
          <Route path="afsluttede-opgaver" element={<AfsluttedeOpgaver />}/>
          <Route path="slettede-opgaver" element={<SlettedeOpgaver />}/>
          <Route path="mine-opgaver" element={<MineOpgaver />}/>
          <Route path="team" element={<Team />}/>
          <Route path="dokumenter" element={<Dokumenter />}/>
          <Route path="indstillinger" element={<Indstillinger />}/>
          <Route path="version" element={<Version />}/>
          <Route path="opgave/:opgaveID" element={<ÅbenOpgave />}/>
          <Route path="ny-opgave" element={<NyOpgave />}/>
          <Route path="ny-bruger" element={<NyBruger />}/>
          <Route path="login" element={!user ? <Login /> : <Navigate to="/" />}/>
        </Route>
        <Route path="gendan-kodeord" element={<GendanKodeord />}/>
      </>
    )
  )

  return (
    <>
      <RouterProvider router={router}>
        <main style={{ WebkitTapHighlightColor: "transparent"}}>
        </main>
      </RouterProvider>
      <ÅbnIAppen trigger={openedInBrowser} setTrigger={setOpenedInBrowser} />
    </>
  )
}

export default App
