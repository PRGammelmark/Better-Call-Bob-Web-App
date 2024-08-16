import React from 'react'
import Logo from '../assets/bcb-logo.svg'
import { useLogout } from '../hooks/useLogout.js'
import HeaderCSS from './Header.module.css'
import { useAuthContext } from '../hooks/useAuthContext'

const Header = () => {

  const { user } = useAuthContext();

  const { logout } = useLogout()

  const handleLogout = () => {
    logout()
  }

  return (
    <header>
        <img src={Logo} alt="" />
        <nav>
            <ul>
                {user ? <li onClick={handleLogout}>Log ud</li> : null}
            </ul>
        </nav>
    </header>
  )
}

export default Header
