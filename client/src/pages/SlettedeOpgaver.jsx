import React, {useState, useEffect} from 'react'
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

  const [refetchOpgaver, setRefetchOpgaver] = useState(false)
  const [slettedeOpgaver, setSlettedeOpgaver] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  function handleCleanup () {
    if (window.confirm("Er du sikker på, at du vil tømme papirkurven? Opgaverne i papirkurven vil blive slettet permanent.")) {
      axios.post(`${import.meta.env.VITE_API_URL}/cleanup`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      })
      .then(res => {
        console.log(res.data.message)
        setRefetchOpgaver(!refetchOpgaver)
      })
      .catch(err => {
        console.log(err)
      })
    }
  };

  useEffect(()=>{
    const fetchOpgaver = async () => {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/opgaver`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      })
      const json = await response.json();

      if (response.ok) {
        const opgaverDerErSlettet = json.filter(opgave => opgave.isDeleted != null);
        setSlettedeOpgaver(opgaverDerErSlettet);
        setIsLoading(false)
      }
    }

    if (user) {
      fetchOpgaver()
    }
  }, [user, refetchOpgaver])

  return (
    <>
    <OpgaverLinkBjælke />
      <div className={Styles.papirkurvUpperContainer}>
        <div className={Styles.headingContainer}>
          <h1 className={AlleOpgaverCSS.heading}>Papirkurv 🗑️</h1>
          <button className={Styles.button} onClick={handleCleanup}>Tøm papirkurv</button>
        </div>
        <p>Slettede opgaver vil ligge i papirkurven i 30 dage, hvorefter de vil blive slettet permanent.</p>
      </div>
      <SlettedeOpgaver slettedeOpgaver={slettedeOpgaver} setSlettedeOpgaver={setSlettedeOpgaver} isLoading={isLoading} setIsLoading={setIsLoading} />
    </>
  )
}

export default Alle_opgaver
