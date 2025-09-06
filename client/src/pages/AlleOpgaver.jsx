import React from 'react'
import AlleOpgaverCSS from './AlleOpgaver.module.css'
import OpenTasks from '../components/tables/OpenTasks'
import DelegatedTasks from '../components/tables/DelegatedTasks'
import FinishedTasks from '../components/tables/FinishedTasks'
import OpgaverLinkBjælke from '../components/OpgaverLinkBjælke'

const Alle_opgaver = () => {
  return (
    <>
    <OpgaverLinkBjælke />
      <h1 className={AlleOpgaverCSS.heading}>Aktuelle opgaver</h1>
      <p>Alle nye og igangværende opgaver vil blive vist her.</p>
      <OpenTasks />
      <DelegatedTasks />
      <FinishedTasks />
    </>
  )
}

export default Alle_opgaver
