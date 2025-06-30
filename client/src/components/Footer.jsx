import React from 'react'
import Styles from './Footer.module.css'
import { Link } from 'react-router-dom'
import { currentVersion } from '../version.js'

const Footer = () => {
  return (
    <footer className={Styles.footer}>
        <div>
          <span className={Styles.footerSpan}><p className='bold'>Better Call Bob</p> &nbsp; ©</span>
          <p>Alle rettigheder forbeholdes</p>
        </div>
        <div className={Styles.versionDiv}>
          <p style={{fontSize: 14, marginBottom: 2}}>v.{currentVersion}</p>
          <Link to="/version" className={Styles.versionLink}>
            <p style={{fontSize: 12, marginBottom: 0}}><i>Ændringshistorik</i></p>
          </Link>
        </div>
        <p><i>Powered by OCTA</i></p>
    </footer>
  )
}

export default Footer