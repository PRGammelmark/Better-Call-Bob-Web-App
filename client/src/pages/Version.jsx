import React, { useState } from 'react'
import PageAnimation from '../components/PageAnimation'
import { currentVersion, changes } from '../version.js'
import Styles from './Version.module.css'

const Version = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 10; // Number of changes per page
  const totalPages = Math.ceil(changes.length / entriesPerPage);

  const startIndex = (currentPage - 1) * entriesPerPage;
  const currentChanges = changes?.slice(startIndex, startIndex + entriesPerPage);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  return (
        <div className={Styles.content}>
          <h1 className={Styles.heading}>Aktuel version: {currentVersion}</h1>
          {currentChanges.map((change => (
            <div className={Styles.changeEntry} key={change.version}>
              <div className={Styles.changeHeadingContainer}>
                <h3 className={Styles.changesHeading}>Version: {change.version}</h3>
                <p className={Styles.changesDate}>Implementeret {change.date}</p>
              </div>
              <ul className={Styles.changesList}>
              {change.changes.map((logEntry, index) => (
                <li key={index} className={Styles.changesListItem}>{logEntry}</li>
              ))}
              </ul>
            </div>
          )))}
          <div className={Styles.pagination}>
            <button 
              onClick={() => handlePageChange(currentPage - 1)} 
              disabled={currentPage === 1}
              className={`${Styles.backNextButtons} ${Styles.backButton}`}
              style={{marginRight: 20}}
            >
              Forrige
            </button>

            {/* Page Numbers */}
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => handlePageChange(i + 1)}
                className={`${currentPage === i + 1 ? Styles.activePageButton : ''} ${Styles.pageButton}`}
              >
                {i + 1}
              </button>
            ))}

            <button 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`${Styles.backNextButtons} ${Styles.nextButton}`}
              style={{marginLeft: 20}}
            >
              Næste
            </button>
          </div>
        </div>
  )
}

export default Version