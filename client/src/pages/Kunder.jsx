import React, { useState, useEffect } from 'react'
import { useAuthContext } from '../hooks/useAuthContext'
import styles from "./Kunder.module.css"
import KunderTabel from '../components/tables/KunderTabel.jsx'
import axios from "axios"
import PageAnimation from '../components/PageAnimation'

const Kunder = () => {

    const [kunder, setKunder] = useState([]);
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [filter, setFilter] = useState("alle")

    const {user} = useAuthContext()

    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API_URL}/kunder/`, {
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        })
        .then(res => {
            setKunder(res.data)
            setLoading(false)
        })
        .catch(error => {
            console.log(error)
            setLoading(false)
        })
    }, [])

  return (
        <div>
            <div className={styles.headingAndSearchContainer}>
                <h1 className={`bold ${styles.heading}`}>Kunder</h1>
                <input type="text" placeholder="Søg – fx postnumre: ''1000-1800'' ..." value={search} onChange={(e) => setSearch(e.target.value)} className={styles.searchInput} />
            </div>
            <div className={styles.filterButtonsDiv}>
                <button 
                    className={`${styles.filterButton} ${filter === "alle" ? styles.filterButtonActive : ""}`} 
                    onClick={() => setFilter("alle")}
                >
                    Alle kunder
                </button>
                <button 
                    className={`${styles.filterButton} ${filter === "privat" ? styles.filterButtonActive : ""}`} 
                    onClick={() => setFilter("privat")}
                >
                    Privatkunder
                </button>
                <button 
                    className={`${styles.filterButton} ${filter === "erhverv" ? styles.filterButtonActive : ""}`} 
                    onClick={() => setFilter("erhverv")}
                >
                    Erhvervskunder
                </button>
            </div>
            <KunderTabel search={search} filter={filter} />
        </div>
  )
}

export default Kunder
