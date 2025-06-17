import TableCSS from './Table.module.css'
import Styles from './MedarbejdereTabel.module.css'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuthContext } from "../../hooks/useAuthContext.js"
import BarLoader from '../loaders/BarLoader.js'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import * as beregn from '../../utils/beregninger.js'

const MedarbejdereTabel = ({search, filter, vælgMedarbejder, setValgtMedarbejder, valgtMedarbejder, setBesøgPåOpgaven}) => {

  const [loading, setLoading] = useState(true)
  const [opgaver, setOpgaver] = useState([])
  const [medarbejdere, setMedarbejdere] = useState([])
  const [filteredMedarbejdere, setFilteredMedarbejdere] = useState([])
  const [searchedMedarbejdere, setSearchedMedarbejdere] = useState([])

  const {user} = useAuthContext()
  const navigate = useNavigate()

  // Fetch all data (medarbejdere & opgaver)
  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/brugere/`, {
        headers: {
            'Authorization': `Bearer ${user.token}`
        }
    })
    .then(res => {
        setMedarbejdere(res.data)
    })
    .catch(error => {
        console.log(error)
    })

    axios.get(`${import.meta.env.VITE_API_URL}/opgaver`, {
      headers: {
        'Authorization': `Bearer ${user.token}`
      }
    })
    .then(res => {
      setOpgaver(res.data)
      setLoading(false)
    })
    .catch(error => {
      console.log(error)
    })
  }, [user])

  useEffect(() => {
    const adminBrugere = medarbejdere?.filter(medarbejder => medarbejder?.isAdmin)
    const medarbejderBrugere = medarbejdere?.filter(medarbejder => !medarbejder?.isAdmin)
    const alleBrugere = [...adminBrugere, ...medarbejderBrugere]

    if (filter === "visMedarbejdere") {
      setFilteredMedarbejdere(medarbejderBrugere)
    } else if (filter === "visAdministratorer") {
      setFilteredMedarbejdere(adminBrugere)
    } else if (filter === "visAlle") {
      setFilteredMedarbejdere(alleBrugere)
    } else {
      setFilteredMedarbejdere(alleBrugere)
    }
  }, [filter, medarbejdere])

  useEffect(() => {
    if (search) {
      if (/^\d{4}-\d{4}$/.test(search)) {
        const [start, end] = search.split('-').map(Number);
        setSearchedMedarbejdere(filteredMedarbejdere.filter(medarbejder => {
          const postnummerMatch = medarbejder?.adresse?.match(/\d{4}/);
          const postnummer = postnummerMatch ? parseInt(postnummerMatch[0], 10) : null;
          return postnummer >= start && postnummer <= end;
        }));
      } else {
        setSearchedMedarbejdere((filteredMedarbejdere.filter(medarbejder => medarbejder?.navn?.toLowerCase().includes(search.toLowerCase()) || medarbejder?.titel?.toLowerCase().includes(search.toLowerCase()) || medarbejder?.adresse?.toLowerCase().includes(search.toLowerCase()) || medarbejder?.email?.toLowerCase().includes(search.toLowerCase()) || medarbejder?.telefon?.toString().includes(search))).slice(0, 5))
      }
    } else {
        setSearchedMedarbejdere(filteredMedarbejdere.slice(0, 5))
    }
  }, [search, filteredMedarbejdere])

  return (
    <>
      <div className={Styles.desktopTable}>
        <div className={TableCSS.opgaveListe}>
          <div className={TableCSS.opgaveTabel}>
            <div className={`${TableCSS.opgaveHeader} ${Styles.medarbejderHeader}`}>
              <ul>
                <li>Navn</li>
                <li>Adresse</li>
                <li>Opgaver</li>
              </ul>
            </div>
            <div className={`${TableCSS.opgaveBody} ${Styles.medarbejderBody}`}>
              {searchedMedarbejdere && searchedMedarbejdere.length > 0 && searchedMedarbejdere.map(medarbejder => {

                const medarbejderensOpgaver = opgaver?.filter(opg => opg?.ansvarlig?.some(ansvarlig => ansvarlig._id === medarbejder._id));
                const medarbejderensAfsluttedeOpgaver = medarbejderensOpgaver?.filter(opg => opg.opgaveAfsluttet);
                const medarbejderensÅbneOpgaver = medarbejderensOpgaver?.filter(opg => !opg.opgaveAfsluttet);
                const medarbejderErValgt = medarbejder._id === valgtMedarbejder?._id;

                return (
                  <div className={`${TableCSS.opgaveListing} ${Styles.clickableListingItem} ${medarbejderErValgt ? Styles.valgtMedarbejder : ""}`} key={medarbejder._id} onClick={() => {
                    if (vælgMedarbejder) {
                      setBesøgPåOpgaven(null)
                      if(valgtMedarbejder?._id === medarbejder._id) {
                        setValgtMedarbejder(null)
                      } else {
                        setValgtMedarbejder(medarbejder)
                      }
                    } else {
                      navigate(`../medarbejder/${medarbejder._id}`)
                    }
                  }}>
                    <ul>
                      <li style={{display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "center"}}>{medarbejder.navn}{(medarbejder.titel) && <br />}<span className={Styles.medarbejderVirksomhedNavn}>{medarbejder.titel}</span></li>
                      <li>{medarbejder.adresse}, {medarbejder.postnummerOgBy}</li>
                      <li><div style={{display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "flex-start", gap: "6px"}}>{medarbejderensÅbneOpgaver?.length > 0 ? (<p className={Styles.igangværendeOpgaver}>{(medarbejderensÅbneOpgaver.length + " igangværende")}</p>) : ""}{medarbejderensAfsluttedeOpgaver?.length > 0 ? (<p className={Styles.afsluttedeOpgaver}>{(medarbejderensAfsluttedeOpgaver.length + (medarbejderensAfsluttedeOpgaver.length > 1 ? " afsluttede" : " afsluttet"))}</p>) : ""}</div></li>
                    </ul>
                  </div>
                )
              })}
              {searchedMedarbejdere && searchedMedarbejdere.length === 0 && <p className={Styles.ingenMedarbejdereFundet}>Ingen medarbejdere matcher dine kriterier.</p>}        
            </div>
          </div>
        </div>
      </div>
      <div className={Styles.mobileTable}>
      <div className={TableCSS.opgaveListe}>
          <div className={TableCSS.opgaveTabel}>
            <div className={`${TableCSS.opgaveHeader} ${Styles.medarbejderHeader}`}>
              <ul>
                <li>Medarbejder</li>
                <li>Adresse</li>
                <li>Opgaver</li>
              </ul>
            </div>
            <div className={`${TableCSS.opgaveBody} ${Styles.medarbejderBody}`}>
              {searchedMedarbejdere && searchedMedarbejdere.length > 0 && searchedMedarbejdere.map(medarbejder => {

                const medarbejderensOpgaver = opgaver?.filter(opg => opg?.ansvarlig?.some(ansvarlig => ansvarlig._id === medarbejder._id));
                const medarbejderensAfsluttedeOpgaver = medarbejderensOpgaver?.filter(opg => opg.opgaveAfsluttet);
                const medarbejderensÅbneOpgaver = medarbejderensOpgaver?.filter(opg => !opg.opgaveAfsluttet);
                const medarbejderErValgt = medarbejder._id === valgtMedarbejder?._id;

                return (
                  <div className={`${TableCSS.opgaveListing} ${Styles.clickableListingItem} ${medarbejderErValgt ? Styles.valgtMedarbejder : ""}`} key={medarbejder._id} onClick={() => {
                    if (vælgMedarbejder) {
                      if(valgtMedarbejder?._id === medarbejder._id) {
                        setValgtMedarbejder(null)
                      } else {
                        setValgtMedarbejder(medarbejder)
                      }
                    } else {
                      navigate(`../medarbejder/${medarbejder._id}`)
                    }
                  }}>
                    <ul>
                      <li style={{display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "center"}}>{medarbejder.navn}{(medarbejder.titel) && <br />}<span className={Styles.medarbejderVirksomhedNavn}>{medarbejder.titel}</span></li>
                      <li>{medarbejder.adresse}, {medarbejder.postnummerOgBy}</li>
                      <li><div style={{display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "flex-start", gap: "6px"}}>{medarbejderensÅbneOpgaver?.length > 0 ? (<p className={Styles.igangværendeOpgaver}>{(medarbejderensÅbneOpgaver.length + " igangværende")}</p>) : ""}{medarbejderensAfsluttedeOpgaver?.length > 0 ? (<p className={Styles.afsluttedeOpgaver}>{(medarbejderensAfsluttedeOpgaver.length + (medarbejderensAfsluttedeOpgaver.length > 1 ? " afsluttede" : " afsluttet"))}</p>) : ""}</div></li>
                    </ul>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
      </>
  )
}

export default MedarbejdereTabel
