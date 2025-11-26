import React from 'react'
import { useState, useEffect } from 'react'
import { useAuthContext } from '../hooks/useAuthContext'
import { Link, useNavigate } from 'react-router-dom'
import styles from "./Team.module.css"
import axios from "axios"
import placeholderBillede from '../assets/avatarPlaceholder.png'
import { Plus } from 'lucide-react'

const Team = () => {
    const [admins, setAdmins] = useState(null)
    const [medarbejdere, setMedarbejdere] = useState(null)
    const {user} = useAuthContext()
    const navigate = useNavigate()

    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API_URL}/brugere/`, {
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        })
        .then(res => {
            const adminsArray = [];
            const medarbejdereArray = [];

            res.data.forEach(bruger => {
                if (bruger.isAdmin) {
                    adminsArray.push(bruger)
                } else {
                    medarbejdereArray.push(bruger)
                }
            })

            setAdmins(adminsArray)
            setMedarbejdere(medarbejdereArray)
        })
        .catch(error => console.log(error))
    }, [user])
  
    return (
        <div className={styles.teamContainer}>
            <h1 className={styles.heading}>Teamet</h1>
            
            {admins && admins.length > 0 && (
                <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionHeading}>
                            Administratorer
                            <span className={styles.countBadge}>{admins.length}</span>
                        </h2>
                        <button 
                            className={styles.addButton}
                            onClick={() => navigate('/ny-bruger')}
                        >
                            <Plus size={16} />
                            Tilføj
                        </button>
                    </div>
                    <div className={styles.cardGrid}>
                        {admins.map((bruger) => (
                            <Link 
                                to={`/profil/${bruger._id}`} 
                                className={styles.cardLink}
                                key={bruger._id}
                            >
                                <div className={styles.avatarContainer}>
                                    <img 
                                        src={bruger.profilbillede || placeholderBillede} 
                                        alt={bruger.navn}
                                        className={styles.avatar}
                                    />
                                </div>
                                <div className={styles.card}>
                                    <div className={styles.cardContent}>
                                        <h3 className={styles.name}>{bruger.navn}</h3>
                                        {bruger.titel && (
                                            <p className={styles.description}>{bruger.titel}</p>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {medarbejdere && medarbejdere.length > 0 && (
                <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionHeading}>
                            Medarbejdere
                            <span className={styles.countBadge}>{medarbejdere.length}</span>
                        </h2>
                        <button 
                            className={styles.addButton}
                            onClick={() => navigate('/ny-bruger')}
                        >
                            <Plus size={16} />
                            Tilføj
                        </button>
                    </div>
                    <div className={styles.cardGrid}>
                        {medarbejdere.map((bruger) => (
                            <Link 
                                to={`/profil/${bruger._id}`} 
                                className={styles.cardLink}
                                key={bruger._id}
                            >
                                <div className={styles.avatarContainer}>
                                    <img 
                                        src={bruger.profilbillede || placeholderBillede} 
                                        alt={bruger.navn}
                                        className={styles.avatar}
                                    />
                                </div>
                                <div className={styles.card}>
                                    <div className={styles.cardContent}>
                                        <h3 className={styles.name}>{bruger.navn}</h3>
                                        {bruger.titel && (
                                            <p className={styles.description}>{bruger.titel}</p>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default Team
