import React from 'react'
import ReactDom from 'react-dom'
import Styles from './MobileNavMenu.module.css'
import { Link } from 'react-router-dom'
import { useAuthContext } from '../hooks/useAuthContext'
import { useLogout } from '../hooks/useLogout.js'
import { currentVersion } from '../version.js'
import { LayoutGrid, ClipboardCheck, User, Users, ScrollText, Settings, Library, X, House } from 'lucide-react';


const MobileNavMenu = ({ setShowNavMenu}) => {

    const { user } = useAuthContext();
    const { logout } = useLogout();
    const userID = user?.id || user?._id;

    const linkStyles = {
        textDecoration: 'none',
        width: '100%'
    };

    const handleLogout = () => {
        if(window.confirm("Er du sikker på, at du vil logge ud?")) {
          logout()
        }
    }

    function handleLogoutClick(){
        setShowNavMenu(false)
        handleLogout()
    }
  
    return ReactDom.createPortal (
    <>
        <div className={Styles.overlay}>
            <div className={Styles.mobileMenuNavHeader}>
                <h3 className={Styles.mobileNavHeading}>Navigation</h3>
                <X className={Styles.closeIcon} onClick={() => {setShowNavMenu(false)}} />
            </div>
            <div className={Styles.mobileMenu}>
                <div className={Styles.mobileNavItems}>
                    <Link style={linkStyles} to={'/'} onClick={() => setShowNavMenu(false)}>
                        <div className={Styles.newMobileNavItem}>
                            <div className={Styles.newMobileNavItemIconCircle}>
                                <LayoutGrid className={Styles.newMobileNavItemIcon} />
                            </div>
                            <h2>Overblik</h2>
                        </div>
                    </Link>
                    {user.isAdmin && <Link style={linkStyles} to={'alle-opgaver'} onClick={() => setShowNavMenu(false)}>
                        <div className={Styles.newMobileNavItem}>
                            <div className={Styles.newMobileNavItemIconCircle}>
                                <ClipboardCheck className={Styles.newMobileNavItemIcon} />
                            </div>
                            <h2>Alle opgaver</h2>
                        </div>
                    </Link>}
                    {!user.isAdmin && <Link style={linkStyles} to={'mine-opgaver'} onClick={() => setShowNavMenu(false)}>
                        <div className={Styles.newMobileNavItem}>
                            <div className={Styles.newMobileNavItemIconCircle}>
                                <ClipboardCheck className={Styles.newMobileNavItemIcon} />
                            </div>
                            <h2>Mine opgaver</h2>
                        </div>
                    </Link>}
                    {user.isAdmin && <Link style={linkStyles} to={'kunder'} onClick={() => setShowNavMenu(false)}>
                        <div className={Styles.newMobileNavItem}>
                            <div className={Styles.newMobileNavItemIconCircle}>
                                <Users className={Styles.newMobileNavItemIcon} />
                            </div>
                            <h2>Kunder</h2>
                        </div>
                    </Link>}
                    <Link style={linkStyles} to={'team'} onClick={() => setShowNavMenu(false)}>
                        <div className={Styles.newMobileNavItem}>
                            <div className={Styles.newMobileNavItemIconCircle}>
                                <House className={Styles.newMobileNavItemIcon} />
                            </div>
                            <h2>Team</h2>
                        </div>
                    </Link>
                    <Link style={linkStyles} to={'dokumenter'} onClick={() => setShowNavMenu(false)}>
                        <div className={Styles.newMobileNavItem}>
                            <div className={Styles.newMobileNavItemIconCircle}>
                                <ScrollText className={Styles.newMobileNavItemIcon} />
                            </div>
                            <h2>Dokumenter</h2>
                        </div>
                    </Link>
                    <Link style={linkStyles} to={`profil/${userID}`} onClick={() => setShowNavMenu(false)}>
                        <div className={Styles.newMobileNavItem}>
                            <div className={Styles.newMobileNavItemIconCircle}>
                                <User className={Styles.newMobileNavItemIcon} />
                            </div>
                            <h2>Profil</h2>
                        </div>
                    </Link>
                    {user.isAdmin && <Link style={linkStyles} to={'app-indstillinger'} onClick={() => setShowNavMenu(false)}>
                        <div className={Styles.newMobileNavItem}>
                            <div className={Styles.newMobileNavItemIconCircle}>
                                <Settings className={Styles.newMobileNavItemIcon} />
                            </div>
                            <h2>App-indstillinger</h2>
                        </div>
                    </Link>}
                    <Link style={linkStyles} to={'/hjaelp'} onClick={() => setShowNavMenu(false)}>
                        <div className={Styles.newMobileNavItem}>
                            <div className={Styles.newMobileNavItemIconCircle}>
                                <Library className={Styles.newMobileNavItemIcon} />
                            </div>
                            <h2>Hjælp</h2>
                        </div>
                    </Link>
                </div>
                <div className={Styles.mobileNavFooter}>
                    <p className={Styles.mobileNavFooterHeading}><b style={{fontFamily: 'OmnesBold'}}>Udviklet med ♥️ af OCTA</b></p>
                    <div className={Styles.mobileNavFooterVersion}>
                        <p className={Styles.mobileNavFooterVersionText}>v.{currentVersion}</p>
                        <Link to={'version'} onClick={() => setShowNavMenu(false)} style={{textDecoration: 'none', color: '#fff'}}>
                            <p>Ændringer</p>
                        </Link>
                        <p onClick={handleLogoutClick}>Log ud</p>
                    </div>
                </div>
            </div>
        </div>
    </>,
    document.getElementById('portal')
  )
}

export default MobileNavMenu
