import React from 'react'
import PageAnimation from '../components/PageAnimation'
import AlleOpgaverCSS from './AlleOpgaver.module.css'
import SlettedeOpgaver from '../components/tables/SlettedeOpgaver'
import OpgaverLinkBjælke from '../components/OpgaverLinkBjælke' 

const Alle_opgaver = () => {
  return (
    <>
    <OpgaverLinkBjælke />
    <PageAnimation>
      <h1 className={AlleOpgaverCSS.heading}>Papirkurv 🗑️</h1>
      <p>Slettede opgaver vil ligge i papirkurven i 30 dage, hvorefter de vil blive slettet permanent.</p>
        <SlettedeOpgaver />
      </PageAnimation>
    </>
  )
}

export default Alle_opgaver
