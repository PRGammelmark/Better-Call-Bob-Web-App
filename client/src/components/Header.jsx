import React from 'react'
import Logo from '../assets/bcb-logo.svg'
import HeaderCSS from './Header.module.css'

const Header = () => {
  return (
    <header>
        <img src={Logo} alt="" />
        <nav>
            <ul>
                <li>Log ud</li>
            </ul>
        </nav>
    </header>
  )
}

export default Header
