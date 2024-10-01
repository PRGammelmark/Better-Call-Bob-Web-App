import React from 'react'
import ReactDom from 'react-dom'
import Styles from './MobileNavMenu.module.css'
import { Link } from 'react-router-dom'

const MobileNavMenu = ({ handleLogout, setShowNavMenu}) => {

    const linkStyles = {
        textDecoration: 'none',
        width: '100%'
    };

    function handleLogoutClick(){
        setShowNavMenu(false)
        handleLogout()
    }
  
    return ReactDom.createPortal (
    <>
        <div className={Styles.overlay}>
            <div className={Styles.mobileMenu}>
                <Link style={linkStyles} to={'/'} onClick={() => setShowNavMenu(false)}>
                    <h2 className={Styles.mobileNavItem}>Overblik</h2>
                </Link>
                <Link style={linkStyles} to={'alle-opgaver'} onClick={() => setShowNavMenu(false)}>
                    <h2 className={Styles.mobileNavItem}>Alle opgaver</h2>
                </Link>
                <Link style={linkStyles} to={'team'} onClick={() => setShowNavMenu(false)}>
                    <h2 className={Styles.mobileNavItem}>Team</h2>
                </Link>
                <Link style={linkStyles} to={'dokumenter'} onClick={() => setShowNavMenu(false)}>
                    <h2 className={Styles.mobileNavItem}>Dokumenter</h2>
                </Link>
                <Link style={linkStyles} to={'indstillinger'} onClick={() => setShowNavMenu(false)}>
                    <h2 className={Styles.mobileNavItem}>Indstillinger</h2>
                </Link>
                <h2 className={Styles.mobileNavItem} onClick={handleLogoutClick}>Log ud</h2>
            </div>
        </div>
    </>,
    document.getElementById('portal')
  )
}

export default MobileNavMenu
