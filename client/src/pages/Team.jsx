import React from 'react'
import { useState, useEffect } from 'react'
import { useAuthContext } from '../hooks/useAuthContext'
import styles from "./Team.module.css"
import axios from "axios"
import PageAnimation from '../components/PageAnimation'

const Team = () => {
    const [team, setTeam] = useState(null)
    const [admins, setAdmins] = useState(null)
    const [medarbejdere, setMedarbejdere] = useState(null)
    const {user} = useAuthContext()

    useEffect(() => {
        axios.get(`http://localhost:3000/api/brugere/`, {
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        })
        .then(res => {
            setTeam(res.data);

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
    }, [])
  
    return (
        <PageAnimation>
    <div>
        <h1 className="bold">Teamet</h1>
        <div className={styles.adminDiv}>
            <h2 className={styles.subheading}>Admins</h2>
            <div className={styles.cardHolder}>
                {admins && admins.map((bruger)=>{
                    return (
                        <div className={styles.card} key={bruger._id}>
                            <p className={styles.name}>{bruger.navn}</p>
                            <span className={styles.italics}>{bruger.titel} {bruger.isAdmin ? "// admin" : null}</span>
                            <p className={styles.contactInfo}>✉️ <a className={styles.links} href={"mailto:" + bruger.email}>{bruger.email}</a></p>
                            <p className={styles.contactInfo}>📞 <a className={styles.links} href={"tel:" + bruger.telefon}>{bruger.telefon}</a></p>
                        </div>
                    )
                })}
            </div>
        </div>
        <div className={styles.medarbejdereDiv}>
            <h2 className={styles.subheading}>Medarbejdere</h2>
            <div className={styles.cardHolder}>
                {medarbejdere && medarbejdere.map((bruger)=>{
                    return (
                        <div className={styles.card} key={bruger._id}>
                            <p className={styles.name}>{bruger.navn}</p>
                            <span className={styles.italics}>{bruger.titel} {bruger.isAdmin ? "// admin" : null}</span>
                            <p className={styles.contactInfo}>✉️ <a className={styles.links} href={"mailto:" + bruger.email}>{bruger.email}</a></p>
                            <p className={styles.contactInfo}>📞 <a className={styles.links} href={"tel:" + bruger.telefon}>{bruger.telefon}</a></p>
                        </div>
                    )
                })}
            </div>
        </div>
    </div>
</PageAnimation>
  )
}

export default Team
