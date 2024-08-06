import TableCSS from './Table.module.css'
import FinishedTasksCSS from './FinishedTasks.module.css'

const FinishedTasks = () => {
  return (
        <div className={TableCSS.opgaveListe}>
          <h2 className={TableCSS.tabelHeader}>Færdige opgaver</h2>
          <div className={TableCSS.opgaveTabel}>
            <div className={`${TableCSS.opgaveHeader} ${FinishedTasksCSS.finishedTasksHeader}`}>
              <ul>
              <li>ID</li>
                <li>Udføres</li>
                <li>Kunde</li>
                <li>Adresse</li>
                <li>Ansvarlig</li>
              </ul>
            </div>
            <div className={`${TableCSS.opgaveBody} ${FinishedTasksCSS.finishedTasksBody}`}>
              <div className={TableCSS.opgaveListing}>
                <ul>
                  <li>#123</li>
                  <li>3 dage siden</li>
                  <li>Bjørn Jespersen</li>
                  <li>Munkens Allé 1, 1000 København</li>
                  <li>Bob Testesen 2</li>
                </ul>
                <button className={TableCSS.button}>Åbn</button>
              </div>
              <div className={TableCSS.opgaveListing}>
                <ul>
                  <li>#123</li>
                  <li>3 dage siden</li>
                  <li>Bjørn Jespersen</li>
                  <li>Munkens Allé 1, 1000 København</li>
                  <li>Bob Testesen 2</li>
                </ul>
                <button className={TableCSS.button}>Åbn</button>
              </div>
            </div>
          </div>
        </div>
      
  )
}

export default FinishedTasks
