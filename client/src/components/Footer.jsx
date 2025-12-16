import React from 'react'
import Styles from './Footer.module.css'
import { Link } from 'react-router-dom'
import { currentVersion } from '../version.js'
import { useIndstillinger } from '../context/IndstillingerContext.jsx'

const Footer = () => {
  const { indstillinger } = useIndstillinger()
  const virksomhedsnavn = indstillinger?.virksomhedsnavn || 'Better Call Bob'

  return (
    <footer className={Styles.footer}>
        <div>
          <span className={Styles.footerSpan}><p className='bold'>{virksomhedsnavn}</p></span>
        </div>
        <div className={Styles.versionDiv}>
          <p style={{fontSize: 14, marginBottom: 2}}>v.{currentVersion}</p>
          <Link to="/version" className={Styles.versionLink}>
            <p style={{fontSize: 12, marginBottom: 0}}><i>Ændringshistorik</i></p>
          </Link>
        </div>
        <div>
        <p style={{fontSize: "0.9rem"}}>Udviklet med ♥️ af OCTA</p>
        <p style={{fontSize: "0.75rem"}}>Alle rettigheder forbeholdes © </p>
        </div>
    </footer>
  )
}

export default Footer