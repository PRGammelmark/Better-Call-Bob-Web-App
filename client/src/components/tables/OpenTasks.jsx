import TableCSS from './Table.module.css'
import OpenTasksCSS from './OpenTasks.module.css'
import { Link } from 'react-router-dom'

const opgaver = [{
  id: 0,
  navn: "Bjørn Jespersen",
  adresse: "Munkens Allé 1, 1000 København",
  modtaget: "10-04-2022, 15:45",
  status: "accepteret",
  fremskridt: "åben",
  ansvarlig: "Bob Testesen 2"
}, {
  id: 1,
  navn: "Hans Kristensen",
  adresse: "Vestergade 12, 1100 København Ø",
  modtaget: "11-04-2023, 08:32",
  status: "modtaget",
  fremskridt: "åben",
  ansvarlig: "Bob Testesen 1"
}]

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
              {opgaver.map((opgave) => {
                return (
                  <div className={TableCSS.opgaveListing} key={opgave.id}>
                    <ul>
                      <li>#{opgave.id}</li>
                      <li>{opgave.modtaget}</li>
                      <li>{opgave.status}</li>
                      <li>{opgave.navn}</li>
                      <li>{opgave.adresse}</li>
                      <li>{opgave.ansvarlig}</li>
                    </ul>
                    <Link className={TableCSS.link} to={`../opgave/${opgave.id}`}>
                      <button className={TableCSS.button}>Åbn</button>
                    </Link>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      
  )
}

export default OpenTasks
