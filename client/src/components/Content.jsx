import { NavLink, Outlet } from 'react-router-dom'
import ContentCSS from './Content.module.css'
import FloatingActionButton from './FloatingActionButton'

const Sidebar = () => {
  return (
    <div className={ContentCSS.main}>
      <div className={ContentCSS.sidebar}>
        <ul>
          <li><NavLink to="/">Overblik</NavLink></li>
          <li><NavLink to="alle-opgaver">Alle opgaver</NavLink></li>
          <li><NavLink to="mine-opgaver">Mine opgaver</NavLink></li>
          <li><NavLink to="dokumenter">Dokumenter</NavLink></li>
          <li><NavLink to="indstillinger">Indstillinger</NavLink></li>
        </ul>
      </div>

      <div className={ContentCSS.content}>
        <Outlet />
      </div>
      <FloatingActionButton />
    </div>
  )
}

export default Sidebar
