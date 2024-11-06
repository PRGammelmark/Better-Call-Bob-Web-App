import React from 'react'
import OpgaverLinkBjælkeCSS from './OpgaverLinkBjælke.module.css'
import { Link, useLocation } from 'react-router-dom'

const OpgaverLinkBjælke = () => {
  const location = useLocation();

  return (
    <div className={OpgaverLinkBjælkeCSS.opgaverLinkBjælke}>
      <Link to="/alle-opgaver" className={`${OpgaverLinkBjælkeCSS.aktuelleOpgaverLink} ${location.pathname === '/alle-opgaver' ? OpgaverLinkBjælkeCSS.active : ''}`}>Aktuelle opgaver 📋</Link>
      <Link to="/afsluttede-opgaver" className={`${OpgaverLinkBjælkeCSS.afsluttedeOpgaverLink} ${location.pathname === '/afsluttede-opgaver' ? OpgaverLinkBjælkeCSS.active : ''}`}>Afsluttede opgaver ✔️</Link>
      <Link to="/slettede-opgaver" className={`${OpgaverLinkBjælkeCSS.slettedeOpgaverLink} ${location.pathname === '/slettede-opgaver' ? OpgaverLinkBjælkeCSS.active : ''}`}>Papirkurv 🗑️</Link>
    </div>
  )
}

export default OpgaverLinkBjælke