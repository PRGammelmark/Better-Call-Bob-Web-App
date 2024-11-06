import React from 'react'
import PageAnimation from '../components/PageAnimation'
import AlleOpgaverCSS from './AlleOpgaver.module.css'
import OpenTasks from '../components/tables/OpenTasks'
import DelegatedTasks from '../components/tables/DelegatedTasks'
import FinishedTasks from '../components/tables/FinishedTasks'
import OpgaverLinkBjælke from '../components/OpgaverLinkBjælke'

const Alle_opgaver = () => {
  return (
    <>
    <OpgaverLinkBjælke />
    <PageAnimation>
      <h1 className={AlleOpgaverCSS.heading}>Aktuelle opgaver</h1>
      <p>Alle nye og igangværende opgaver vil blive vist her.</p>
      <OpenTasks />
      <DelegatedTasks />
      <FinishedTasks />
    </PageAnimation>
    </>
  )
}

export default Alle_opgaver
