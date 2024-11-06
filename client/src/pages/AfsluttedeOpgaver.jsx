import React from 'react'
import PageAnimation from '../components/PageAnimation'
import AlleOpgaverCSS from './AlleOpgaver.module.css'
import ClosedTasks from '../components/tables/ClosedTasks'
import OpgaverLinkBjælke from '../components/OpgaverLinkBjælke'

const Alle_opgaver = () => {
  return (
    <>
    <OpgaverLinkBjælke />
    <PageAnimation>
      <h1 className={AlleOpgaverCSS.heading}>Afsluttede opgaver</h1>
      <p>En opgave betragtes som afsluttet, når den er markeret som færdig og betalt.</p>
      <ClosedTasks />
      </PageAnimation>
    </>
  )
}

export default Alle_opgaver
