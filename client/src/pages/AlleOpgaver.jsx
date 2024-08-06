import React from 'react'
import PageAnimation from '../components/PageAnimation'
import AlleOpgaverCSS from './AlleOpgaver.module.css'
import OpenTasks from '../components/tables/OpenTasks'
import DelegatedTasks from '../components/tables/DelegatedTasks'
import FinishedTasks from '../components/tables/FinishedTasks'

const Alle_opgaver = () => {
  return (
    <PageAnimation>
      <h1 className={AlleOpgaverCSS.heading}>Aktuelle opgaver</h1>
      <OpenTasks />
      <DelegatedTasks />
      <FinishedTasks />
    </PageAnimation>
  )
}

export default Alle_opgaver
