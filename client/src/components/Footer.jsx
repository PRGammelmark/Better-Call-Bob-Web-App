import React from 'react'
import Styles from './Footer.module.css'

const Footer = () => {
  return (
    <footer className={Styles.footer}>
        <span className={Styles.footerSpan}><p className='bold'>Better Call Bob</p> &nbsp; ©</span>
        <p>Alle rettigheder forbeholdes</p>
    </footer>
  )
}

export default Footer
