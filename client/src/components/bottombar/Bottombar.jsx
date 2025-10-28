import React, { useState } from 'react'
import BottombarCSS from './Bottombar.module.css'
import { LayoutGrid, Calendar, PlusCircle, MessageCircle, Menu, Plus, User, ClipboardList } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'
import { useLogout } from '../../hooks/useLogout.js'
import MobileNavMenu from '../MobileNavMenu.jsx'
import { useAuthContext } from '../../hooks/useAuthContext.js'
import PlusOptions from '../modals/plusOptions/PlusOptions.jsx'
import TilføjLedighed from '../modals/tilføjLedighed/TilføjLedighed.jsx'
import UploadDokumentModal from '../modals/UploadDokumentModal.jsx'
import AddBesøg from '../modals/AddBesøg.jsx'
import AddPostering from '../modals/AddPostering.jsx'

const Bottombar = () => {

    const { user } = useAuthContext();
    const [showNavMenu, setShowNavMenu] = useState(false);
    const [showPlusOptions, setShowPlusOptions] = useState(false);
    const [showTilføjLedighed, setShowTilføjLedighed] = useState(false);
    const [showUploadDokumentModal, setShowUploadDokumentModal] = useState(false);
    const [showAddBesøgModal, setShowAddBesøgModal] = useState(false);
    const [showAddPosteringModal, setShowAddPosteringModal] = useState(false);
    const { logout } = useLogout();

    const handleLogout = () => {
        if(window.confirm("Er du sikker på, at du vil logge ud?")) {
          logout()
        }
    }

  return (
    <>
    <div className={BottombarCSS.bottomBar}>
        <NavLink to="/" className={`${BottombarCSS.bottomBarItemContainer} ${BottombarCSS.bottomBarItem}`}>
          <LayoutGrid className={BottombarCSS.bottomBarItemIcon} />
          <p>Overblik</p>
        </NavLink>
        {/* <NavLink to="/kalender" className={`${BottombarCSS.bottomBarItemContainer} ${BottombarCSS.bottomBarItem}`}>
            <Calendar className={BottombarCSS.bottomBarItemIcon} />
            <p>Kalender</p>
        </NavLink> */}
        {!user.isAdmin && <NavLink to="/mine-opgaver" className={`${BottombarCSS.bottomBarItemContainer} ${BottombarCSS.bottomBarItem}`}>
            <ClipboardList className={BottombarCSS.bottomBarItemIcon} />
            <p>Mine opgaver</p>
        </NavLink>}
        {user.isAdmin && <NavLink to="/alle-opgaver" className={`${BottombarCSS.bottomBarItemContainer} ${BottombarCSS.bottomBarItem}`}>
            <ClipboardList className={BottombarCSS.bottomBarItemIcon} />
            <p>Alle opgaver</p>
        </NavLink>}
        <div className={BottombarCSS.bottomBarCenterPlus}>
            <div className={BottombarCSS.bottomBarCenterPlusButton} onClick={() => setShowPlusOptions(true)}>
                <Plus className={BottombarCSS.bottomBarCenterItemIcon} />
            </div>
        </div>
        <NavLink to="/din-konto" className={`${BottombarCSS.bottomBarItemContainer} ${BottombarCSS.bottomBarItem}`}>
            <User className={BottombarCSS.bottomBarItemIcon} />
            <p>Profil</p>
            </NavLink>
        <div className={`${BottombarCSS.bottomBarItemContainer} ${BottombarCSS.bottomBarItem}`} onClick={() => setShowNavMenu(true)}>
            <Menu className={BottombarCSS.bottomBarItemIcon} />
          <p>Menu</p>
        </div>
    </div>
    {showNavMenu ? <MobileNavMenu setShowNavMenu={setShowNavMenu}/> : null}
    <PlusOptions trigger={showPlusOptions} setTrigger={setShowPlusOptions} setShowTilføjLedighed={setShowTilføjLedighed} setShowUploadDokumentModal={setShowUploadDokumentModal} setShowAddBesøgModal={setShowAddBesøgModal} setShowAddPosteringModal={setShowAddPosteringModal} />
    <TilføjLedighed trigger={showTilføjLedighed} setTrigger={setShowTilføjLedighed}/>
    <UploadDokumentModal trigger={showUploadDokumentModal} setTrigger={setShowUploadDokumentModal}/>
    <AddBesøg trigger={showAddBesøgModal} setTrigger={setShowAddBesøgModal}/>
    <AddPostering trigger={showAddPosteringModal} setTrigger={setShowAddPosteringModal}/>
    </>
  )
}

export default Bottombar
