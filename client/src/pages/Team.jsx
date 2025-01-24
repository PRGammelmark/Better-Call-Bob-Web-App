import React from 'react'
import { useState, useEffect } from 'react'
import { useAuthContext } from '../hooks/useAuthContext'
import styles from "./Team.module.css"
import axios from "axios"
import PageAnimation from '../components/PageAnimation'
import PhoneIcon from "../assets/phone.svg"
import MailIcon from "../assets/mail.svg"
import satser from '../variables'
import RedigerLøntrin from '../components/modals/RedigerLøntrin'

const Team = () => {
    const [team, setTeam] = useState(null)
    const [admins, setAdmins] = useState(null)
    const [medarbejdere, setMedarbejdere] = useState(null)
    const [løntrinModal, setLøntrinModal] = useState(null)
    const {user} = useAuthContext()

    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API_URL}/brugere/`, {
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
    }, [løntrinModal])

    const akkumuleredeStandardSatser = (
        Number(satser.handymanTimerHonorar) + 
        Number(satser.tømrerTimerHonorar) + 
        Number(satser.opstartsgebyrHonorar) + 
        Number(satser.aftenTillægHonorar) + 
        Number(satser.natTillægHonorar) + 
        Number(satser.trailerHonorar) + 
        Number(satser.rådgivningOpmålingVejledningHonorar)
    )

    const akkumuleredeSatserForBruger = (bruger) => {
        return Number(bruger.satser ? bruger.satser.handymanTimerHonorar : satser.handymanTimerHonorar) + 
        Number(bruger.satser ? bruger.satser.tømrerTimerHonorar : satser.tømrerTimerHonorar) + 
        Number(bruger.satser ? bruger.satser.opstartsgebyrHonorar : satser.opstartsgebyrHonorar) + 
        Number(bruger.satser ? bruger.satser.aftenTillægHonorar : satser.aftenTillægHonorar) + 
        Number(bruger.satser ? bruger.satser.natTillægHonorar : satser.natTillægHonorar) + 
        Number(bruger.satser ? bruger.satser.trailerHonorar : satser.trailerHonorar) + 
        Number(bruger.satser ? bruger.satser.rådgivningOpmålingVejledningHonorar : satser.rådgivningOpmålingVejledningHonorar)
    }
  
    return (
        <PageAnimation>
    <div className={styles.teamContainer}>
        <h1 className={`bold ${styles.heading}`}>Teamet</h1>
        <div className={styles.adminDiv}>
            <h2 className={styles.subheading}>Administratorer ({admins && admins.length})</h2>
            <p className={styles.infoText}>(Tryk og hold på en kontaktknap for at se flere muligheder.)</p>
            <div className={styles.cardHolder}>
                {admins && admins.map((bruger)=>{
                    return (
                        <div className={styles.card} key={bruger._id}>
                            <p className={styles.name}>{bruger.navn}</p>
                            <span className={styles.italics}>{bruger.titel} {bruger.isAdmin ? "// admin" : null}</span>
                            <div className={styles.kundeKontaktMobile}>
                                <a className={`${styles.postfix} ${styles.link}`} href={"tel:" + bruger.telefon}>
                                    <img src={PhoneIcon} alt="Phone Icon" />
                                    <span className={styles.popup}>{bruger.telefon}</span>
                                    Ring
                                </a>
                                <a className={`${styles.postfix} ${styles.link}`} href={"mailto:" + bruger.email}>
                                    <img src={MailIcon} alt="Mail Icon" />
                                    <span className={styles.popup}>{bruger.email}</span>
                                    Skriv
                                </a>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
        <div className={styles.medarbejdereDiv}>
            <h2 className={styles.subheading}>Medarbejdere ({medarbejdere && medarbejdere.length})</h2>
            <div className={styles.cardHolder}>
                {medarbejdere && medarbejdere.map((bruger)=>{
                    return (
                        <div className={styles.card} key={bruger._id}>
                            <p className={styles.name}>{bruger.navn}</p>
                            <span className={styles.italics}>{bruger.titel} {bruger.isAdmin ? "// admin" : null}</span>
                            <div className={styles.kundeKontaktMobile}>
                                <a className={`${styles.postfix} ${styles.link}`} href={"tel:" + bruger.telefon}>
                                    <img src={PhoneIcon} alt="Phone Icon" />
                                    <span className={styles.popup}>{bruger.telefon}</span>
                                    Ring
                                </a>
                                <a className={`${styles.postfix} ${styles.link}`} href={"mailto:" + bruger.email}>
                                    <img src={MailIcon} alt="Mail Icon" />
                                    <span className={styles.popup}>{bruger.email}</span>
                                    Skriv
                                </a>
                            </div>
                            <div className={styles.flereMedarbejderDetaljer}>
                                {!user.isAdmin && user.id === bruger._id && <b style={{textAlign: 'center', display: 'block'}}>Du er på løntrin {Math.floor((akkumuleredeSatserForBruger(bruger)/akkumuleredeStandardSatser) * 10)}</b>}
                                {user.isAdmin && <button className={styles.button} onClick={() => setLøntrinModal(bruger)}>Løntrin {Math.floor((akkumuleredeSatserForBruger(bruger)/akkumuleredeStandardSatser) * 10)}</button>}
                            </div>
                        </div>
                    )
                })}
                <RedigerLøntrin trigger={løntrinModal} setTrigger={setLøntrinModal} />
            </div>
        </div>
    </div>
</PageAnimation>
  )
}

export default Team
