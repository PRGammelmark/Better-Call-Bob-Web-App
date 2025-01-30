import './App.css'
import { useEffect } from 'react'
import { createBrowserRouter, Route, Link, NavLink, createRoutesFromElements, RouterProvider, Navigate } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Content from './components/Content'
import { useAuthContext } from './hooks/useAuthContext'
import FastClick from 'fastclick'

// pages
import Overblik from './pages/Overblik'
import AlleOpgaver from './pages/AlleOpgaver'
import MineOpgaver from './pages/MineOpgaver'
import Dokumenter from './pages/Dokumenter'
import Indstillinger from './pages/Indstillinger'
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

  useEffect(() => {
    FastClick(document.body);
  }, [])

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
    </>
  )
}

export default App
