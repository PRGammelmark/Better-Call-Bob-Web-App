import TableCSS from './Table.module.css'
import Styles from './KunderTabel.module.css'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuthContext } from "../../hooks/useAuthContext.js"
import BarLoader from '../loaders/BarLoader.js'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import * as beregn from '../../utils/beregninger.js'

const KunderTabel = ({search, filter, vælgKunde, setValgtKunde, valgtKunde}) => {

  const [loading, setLoading] = useState(true)
  const [opgaver, setOpgaver] = useState([])
  const [kunder, setKunder] = useState([])
  const [filteredKunder, setFilteredKunder] = useState([])
  const [searchedKunder, setSearchedKunder] = useState([])

  const {user} = useAuthContext()
  const navigate = useNavigate()

  // Fetch all data (kunder, opgaver & posteringer)
  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/kunder/`, {
        headers: {
            'Authorization': `Bearer ${user.token}`
        }
    })
    .then(res => {
        setKunder(res.data)
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
    if (filter === "privat") {
      setFilteredKunder(kunder.filter(kunde => !(kunde?.CVR || kunde?.virksomhed)))
    } else if (filter === "erhverv") {
      setFilteredKunder(kunder.filter(kunde => (kunde?.CVR || kunde?.virksomhed)))
    } else {
      setFilteredKunder(kunder)
    }
  }, [filter, kunder])

  useEffect(() => {
    if (search) {
      if (/^\d{4}-\d{4}$/.test(search)) {
        const [start, end] = search.split('-').map(Number);
        setSearchedKunder(filteredKunder.filter(kunde => {
          const postnummer = parseInt(kunde?.postnummerOgBy?.split(' ')[0], 10);
          return postnummer >= start && postnummer <= end;
        }));
      } else {
        setSearchedKunder((filteredKunder.filter(kunde => kunde?.fornavn?.toLowerCase().includes(search.toLowerCase()) || kunde?.efternavn?.toLowerCase().includes(search.toLowerCase()) || kunde?.virksomhed?.toLowerCase().includes(search.toLowerCase()) || kunde?.CVR?.toString().includes(search) || kunde?.adresse?.toLowerCase().includes(search.toLowerCase()) || kunde?.postnummerOgBy?.toLowerCase().includes(search.toLowerCase()) || kunde?.email?.toLowerCase().includes(search.toLowerCase()) || kunde?.telefon?.toString().includes(search))).slice(0, 15))
      }
    } else {
      if (!vælgKunde) {
        setSearchedKunder(filteredKunder.slice(0, 15))
      } else {
        if(valgtKunde){
          setSearchedKunder([valgtKunde])
        } else {
          setSearchedKunder([])
        }
      }
    }
  }, [search, filteredKunder, valgtKunde])

  return (
    <>
      <div className={Styles.desktopTable}>
        <div className={TableCSS.opgaveListe}>
          <div className={TableCSS.opgaveTabel}>
            <div className={`${TableCSS.opgaveHeader} ${Styles.kundeHeader}`}>
              <ul>
                <li>Navn</li>
                <li>Adresse</li>
                <li>Opgaver</li>
              </ul>
            </div>
            <div className={`${TableCSS.opgaveBody} ${Styles.kundeBody}`}>
              {searchedKunder && searchedKunder.length > 0 && searchedKunder.map(kunde => {

                const kundensOpgaver = opgaver?.filter(opg => opg.kundeID === kunde._id);
                const kundensAfsluttedeOpgaver = kundensOpgaver?.filter(opg => opg.opgaveAfsluttet);
                const kundensÅbneOpgaver = kundensOpgaver?.filter(opg => !opg.opgaveAfsluttet);
                const kundeErValgt = kunde._id === valgtKunde?._id;

                return (
                  <div className={`${TableCSS.opgaveListing} ${Styles.clickableListingItem} ${kundeErValgt ? Styles.valgtKunde : ""}`} key={kunde._id} onClick={() => {
                    if (vælgKunde) {
                      if(valgtKunde?._id === kunde._id) {
                        setValgtKunde(null)
                      } else {
                        setValgtKunde(kunde)
                      }
                    } else {
                      navigate(`../kunde/${kunde._id}`)
                    }
                  }}>
                    <ul>
                      <li style={{display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "center"}}>{kunde.fornavn + " " + kunde.efternavn}{(kunde.virksomhed || kunde.CVR) && <br />}<span className={Styles.kundeVirksomhedNavn}>{(kunde.virksomhed || kunde.CVR) && ((kunde?.virksomhed) + " " + (kunde?.CVR && ("(CVR.: " + kunde.CVR + ")")))}</span></li>
                      <li>{kunde.adresse}, {kunde.postnummerOgBy}</li>
                      <li><div style={{display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "flex-start", gap: "6px"}}>{kundensÅbneOpgaver?.length > 0 ? (<p className={Styles.igangværendeOpgaver}>{(kundensÅbneOpgaver.length + " igangværende")}</p>) : ""}{kundensAfsluttedeOpgaver?.length > 0 ? (<p className={Styles.afsluttedeOpgaver}>{(kundensAfsluttedeOpgaver.length + (kundensAfsluttedeOpgaver.length > 1 ? " afsluttede" : " afsluttet"))}</p>) : ""}</div></li>
                    </ul>
                  </div>
                )
              })}
              {searchedKunder && searchedKunder.length === 0 && <p className={Styles.ingenKunderFundet}>Ingen kunder matcher dine kriterier.</p>}        
            </div>
          </div>
        </div>
      </div>
      <div className={Styles.mobileTable}>
      <div className={TableCSS.opgaveListe}>
          <div className={TableCSS.opgaveTabel}>
            <div className={`${TableCSS.opgaveHeader} ${Styles.kundeHeader}`}>
              <ul>
                <li>Kunde</li>
                <li>Fakturabeløb</li>
                <li>Ansvarlige</li>
              </ul>
            </div>
            <div className={`${TableCSS.opgaveBody} ${Styles.kundeBody}`}>
              {searchedKunder && searchedKunder.length > 0 && searchedKunder.map(kunde => {

                const kundensOpgaver = opgaver.filter(opg => opg.kundeID === kunde._id);
                const kundeErValgt = kunde._id === valgtKunde?._id;

                return (
                  <div className={`${TableCSS.opgaveListing} ${Styles.clickableListingItem} ${kundeErValgt ? Styles.valgtKunde : ""}`} key={kunde._id} onClick={() => {
                    if (vælgKunde) {
                      if(valgtKunde?._id === kunde._id) {
                        setValgtKunde(null)
                      } else {
                        setValgtKunde(kunde)
                      }
                    } else {
                      navigate(`../kunde/${kunde._id}`)
                    }
                  }}>
                    <ul>
                      <li style={{display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "center"}}>{kunde.fornavn + " " + kunde.efternavn}{(kunde.virksomhed || kunde.CVR) && <br />}<span className={Styles.kundeVirksomhedNavn}>{(kunde.virksomhed || kunde.CVR) && ((kunde?.virksomhed) + " " + (kunde?.CVR && ("(CVR.: " + kunde.CVR + ")")))}</span></li>
                      <li>{kunde.adresse}</li>
                      <li>{kundensOpgaver?.length > 0 && kundensOpgaver.length || 0}</li>
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

export default KunderTabel
