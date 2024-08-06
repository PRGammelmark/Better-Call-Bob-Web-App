import TableCSS from './Table.module.css'
import OpenTasksCSS from './OpenTasks.module.css'

const OpenTasks = () => {
  return (
        <div className={TableCSS.opgaveListe}>
          <h2 className={TableCSS.tabelHeader}>Åbne opgaver</h2>
          <div className={TableCSS.opgaveTabel}>
            <div className={`${TableCSS.opgaveHeader} ${OpenTasksCSS.openTasksHeader}`}>
              <ul>
                <li>ID</li>
                <li>Modtaget</li>
                <li>Status</li>
                <li>Kunde</li>
                <li>Adresse</li>
                <li>Ansvarlig</li>
              </ul>
            </div>
            <div className={`${TableCSS.opgaveBody} ${OpenTasksCSS.openTasksBody}`}>
              <div className={TableCSS.opgaveListing}>
                <ul>
                  <li>#123</li>
                  <li>4 dage siden</li>
                  <li>Accepteret</li>
                  <li>Bjørn Jespersen</li>
                  <li>Munkens Allé 1, 1000 København</li>
                  <li>Bob Testesen 2</li>
                </ul>
                <button className={TableCSS.button}>Åbn</button>
              </div>
              <div className={TableCSS.opgaveListing}>
                <ul>
                  <li>#123</li>
                  <li>4 dage siden</li>
                  <li>Accepteret</li>
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

export default OpenTasks
