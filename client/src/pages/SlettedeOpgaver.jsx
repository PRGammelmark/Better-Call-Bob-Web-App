import React from 'react'
import PageAnimation from '../components/PageAnimation'
import AlleOpgaverCSS from './AlleOpgaver.module.css'
import Styles from './SlettedeOpgaver.module.css'
import SlettedeOpgaver from '../components/tables/SlettedeOpgaver'
import OpgaverLinkBjælke from '../components/OpgaverLinkBjælke' 
import axios from 'axios'
import { useAuthContext } from '../hooks/useAuthContext'

const Alle_opgaver = () => {

  const { user } = useAuthContext();
  if(!user) {
    return
  }

  function handleCleanup () {
    if (window.confirm("Er du sikker på, at du vil tømme papirkurven? Opgaverne i papirkurven vil blive slettet permanent.")) {
      axios.post(`${import.meta.env.VITE_API_URL}/cleanup`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      })
      .then(res => {
        console.log(res.data.message)
      })
      .catch(err => {
        console.log(err)
      })
    }
  };

  return (
    <>
    <OpgaverLinkBjælke />
    <PageAnimation>
      <div className={Styles.papirkurvUpperContainer}>
        <div className={Styles.headingContainer}>
          <h1 className={AlleOpgaverCSS.heading}>Papirkurv 🗑️</h1>
          <button className={Styles.button} onClick={handleCleanup}>Tøm papirkurv</button>
        </div>
        <p>Slettede opgaver vil ligge i papirkurven i 30 dage, hvorefter de vil blive slettet permanent.</p>
      </div>
      <SlettedeOpgaver />
      </PageAnimation>
    </>
  )
}

export default Alle_opgaver
