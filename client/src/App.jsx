import './App.css'
import { createBrowserRouter, Route, Link, NavLink, createRoutesFromElements, RouterProvider} from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Content from './components/Content'

// pages
import Overblik from './pages/Overblik'
import AlleOpgaver from './pages/AlleOpgaver'
import MineOpgaver from './pages/MineOpgaver'
import Dokumenter from './pages/Dokumenter'
import Indstillinger from './pages/Indstillinger'
import ÅbenOpgave from './pages/ÅbenOpgave'
import NyOpgave from './pages/NyOpgave'

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Content />}>
      <Route index element={<Overblik />}/>
      <Route path="alle-opgaver" element={<AlleOpgaver />}/>
      <Route path="mine-opgaver" element={<MineOpgaver />}/>
      <Route path="dokumenter" element={<Dokumenter />}/>
      <Route path="indstillinger" element={<Indstillinger />}/>
      <Route path="opgave/:opgaveID" element={<ÅbenOpgave />}/>
      <Route path="ny-opgave" element={<NyOpgave />}/>
    </Route>
  )
)

function App() {

  return (
    <>
      <Header />
      <main>
        <RouterProvider router={router} />
      </main>
      <Footer />
    </>
  )
}

export default App
