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
import NyKunde from './pages/NyKunde'
import Login from './pages/Login'
import Team from './pages/Team'
import Kunder from './pages/Kunder'
import ErrorPage from './pages/ErrorPage'
import AfsluttedeOpgaver from './pages/AfsluttedeOpgaver'
import SlettedeOpgaver from './pages/SlettedeOpgaver'
import GendanKodeord from './pages/GendanKodeord'
import Kunde from './pages/Kunde'
import subscribeToPush from './utils/subscribeToPush'

function App() {

  const { user, authIsReady } = useAuthContext();
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
          .register('/sw.js')
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
          <Route index element={<Overblik />} errorElement={<ErrorPage />}/>
          <Route path="alle-opgaver" element={<AlleOpgaver />} errorElement={<ErrorPage />}/>
          <Route path="afsluttede-opgaver" element={<AfsluttedeOpgaver />} errorElement={<ErrorPage />}/>
          <Route path="slettede-opgaver" element={<SlettedeOpgaver />} errorElement={<ErrorPage />}/>
          <Route path="mine-opgaver" element={<MineOpgaver />} errorElement={<ErrorPage />}/>
          <Route path="team" element={<Team />} errorElement={<ErrorPage />}/>
          <Route path="kunder" element={<Kunder />} errorElement={<ErrorPage />}/>
          <Route path="dokumenter" element={<Dokumenter />} errorElement={<ErrorPage />}/>
          <Route path="indstillinger" element={<Indstillinger />} errorElement={<ErrorPage />}/>
          <Route path="version" element={<Version />} errorElement={<ErrorPage />}/>
          <Route path="opgave/:opgaveID" element={<ÅbenOpgave />} errorElement={<ErrorPage />}/>
          <Route path="ny-opgave" element={<NyOpgave />} errorElement={<ErrorPage />}/>
          <Route path="ny-opgave/kunde/:kundeID" element={<NyOpgave />} errorElement={<ErrorPage />}/>
          <Route path="ny-bruger" element={<NyBruger />} errorElement={<ErrorPage />}/>
          <Route path="ny-kunde" element={<NyKunde />} errorElement={<ErrorPage />}/>
          <Route path="kunde/:kundeID" element={<Kunde />} errorElement={<ErrorPage />}/>
          <Route path="login" element={!user ? <Login /> : <Navigate to="/" />}/>
        </Route>
        <Route path="gendan-kodeord" element={<GendanKodeord />}/>
      </>
    )
  )

  if (!authIsReady) {
    return null; // Prevent flickering (or show a loading spinner)
  }

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
