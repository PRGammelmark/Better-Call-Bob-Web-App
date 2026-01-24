import React from 'react'
import { useAuthContext } from '../hooks/useAuthContext'
import { Navigate } from 'react-router-dom'
import styles from "./Okonomi.module.css"
import PersonligtØkonomiskOverblik from '../components/okonomi/PersonligtØkonomiskOverblik'
import AdminØkonomiskOverblik from '../components/okonomi/AdminØkonomiskOverblik'

const Okonomi = () => {
    const { user } = useAuthContext()

    if(!user.isAdmin) {
        window.alert("Du skal være administrator for at kunne tilgå denne side.")
        return <Navigate to="/" replace />
    }

    return (
        <div className={styles.okonomiPage}>
            <AdminØkonomiskOverblik user={user} />
        </div>
    )
}

export default Okonomi

