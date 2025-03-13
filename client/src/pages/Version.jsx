import React from 'react'
import PageAnimation from '../components/PageAnimation'
import { currentVersion, changes } from '../version.js'
import Styles from './Version.module.css'

const Version = () => {
  return (
    <PageAnimation>
        <div className={Styles.content}>
          <h1 className={Styles.heading}>Aktuel version: {currentVersion}</h1>
          {changes && (changes.map((change => (
            <div className={Styles.changeEntry}>
              <div className={Styles.changeHeadingContainer}>
                <h3 className={Styles.changesHeading}>Version: {change.version}</h3>
                <p className={Styles.changesDate}>Implementeret {change.date}</p>
              </div>
              <ul className={Styles.changesList}>
              {change.changes.map((logEntry => (
                <li className={Styles.changesListItem}>{logEntry}</li>
              )))}
              </ul>
            </div>
          ))))}
        </div>
    </PageAnimation>
  )
}

export default Version