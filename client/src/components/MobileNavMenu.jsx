import React from 'react'
import ReactDom from 'react-dom'
import Styles from './MobileNavMenu.module.css'
import { Link } from 'react-router-dom'
import { useAuthContext } from '../hooks/useAuthContext'
import { useLogout } from '../hooks/useLogout.js'
import { currentVersion } from '../version.js'


const MobileNavMenu = ({ setShowNavMenu}) => {

    const { user } = useAuthContext();
    const { logout } = useLogout();

    const linkStyles = {
        textDecoration: 'none',
        width: '100%'
    };

    const handleLogout = () => {
        logout()
    }

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
                {user.isAdmin && <Link style={linkStyles} to={'alle-opgaver'} onClick={() => setShowNavMenu(false)}>
                    <h2 className={Styles.mobileNavItem}>Alle opgaver</h2>
                </Link>}
                {!user.isAdmin && <Link style={linkStyles} to={'mine-opgaver'} onClick={() => setShowNavMenu(false)}>
                    <h2 className={Styles.mobileNavItem}>Mine opgaver</h2>
                </Link>}
                <Link style={linkStyles} to={'team'} onClick={() => setShowNavMenu(false)}>
                    <h2 className={Styles.mobileNavItem}>Team</h2>
                </Link>
                <Link style={linkStyles} to={'dokumenter'} onClick={() => setShowNavMenu(false)}>
                    <h2 className={Styles.mobileNavItem}>Dokumenter</h2>
                </Link>
                <Link style={linkStyles} to={'indstillinger'} onClick={() => setShowNavMenu(false)}>
                    <h2 className={Styles.mobileNavItem}>Indstillinger</h2>
                </Link>
                <Link style={linkStyles} to={'version'} onClick={() => setShowNavMenu(false)}>
                    <h2 className={Styles.mobileNavItem}>Opdateringer (v.{currentVersion % 1 === 0 ? currentVersion.toFixed(1) : currentVersion.toString()})</h2>
                </Link>
                <h2 className={Styles.mobileNavItem} onClick={handleLogoutClick}>Log ud</h2>
            </div>
        </div>
    </>,
    document.getElementById('portal')
  )
}

export default MobileNavMenu
