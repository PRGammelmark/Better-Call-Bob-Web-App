import React from 'react'
import ÅbenOpgaveCSS from './ÅbenOpgave.module.css'
import PageAnimation from '../components/PageAnimation'
import { useParams } from 'react-router-dom'

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
  }
]


const ÅbenOpgave = () => {
    const { opgaveID } = useParams();

    const opgave = opgaver.find(({ id }) => id === Number(opgaveID));
  
    return (
    <PageAnimation>
        <div>
            <h2>Detaljer om opgaven:</h2>
            <br />
            <p>Opgave-ID: {opgave.id}</p>
            <p>Navn: {opgave.navn}</p>
            <p>Adresse: {opgave.adresse}</p>
            <p>Modtaget: {opgave.modtaget}</p>
            <p>Status: {opgave.status}</p>
            <p>Fremskridt: {opgave.fremskridt}</p>
            <p>Ansvarlig: {opgave.ansvarlig}</p>
        </div>
    </PageAnimation>
  )
}

export default ÅbenOpgave
