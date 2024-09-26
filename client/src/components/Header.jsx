import React from 'react'
import Logo from '../assets/bcb-logo.svg'
import { useLogout } from '../hooks/useLogout.js'
import Styles from './Header.module.css'
import { useAuthContext } from '../hooks/useAuthContext'

const Header = () => {

  const { user } = useAuthContext();

  const { logout } = useLogout()

  const handleLogout = () => {
    logout()
  }

  return (
    <header className={Styles.header}>
        <img className={Styles.headerImg} src={Logo} alt="" />
        <nav>
            <ul className={Styles.headerUl}>
                {user ? <li className={Styles.headerLi} onClick={handleLogout}>Log ud</li> : null}
            </ul>
        </nav>
    </header>
  )
}

export default Header