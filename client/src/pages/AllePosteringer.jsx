import React, { useState, useEffect } from 'react'
import Postering from '../components/Postering'
import axios from 'axios'
import { useAuthContext } from '../hooks/useAuthContext'

const AllePosteringer = () => {
    const { user } = useAuthContext()
    const [posteringer, setPosteringer] = useState([])
    const [brugere, setBrugere] = useState([])
    const [opgaver, setOpgaver] = useState([])
    const [kunder, setKunder] = useState([])
    
    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API_URL}/posteringer`, {
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        })
        .then(response => {
            setPosteringer(response.data)
        })
        .catch(error => {
            console.error(error)
        })

        axios.get(`${import.meta.env.VITE_API_URL}/brugere`, {
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        })
        .then(response => {
            setBrugere(response.data)
        })
        .catch(error => {
            console.error(error)
        })
    }, [user])

    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API_URL}/opgaver`, {
        headers: {
            'Authorization': `Bearer ${user.token}`
        }
        })
        .then(response => {
            setOpgaver(response.data)
        })
        .catch(error => {
            console.error(error)
        })
    }, [user])

    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API_URL}/kunder`, {
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        })
        .then(response => {
            setKunder(response.data)
        })
        .catch(error => {
            console.error(error)
        })
    }, [user])

    console.log("Posteringer", posteringer)

    const arrayAfEksisterendeOpgaveIDer = opgaver.map(opgave => opgave._id)
    const arrayAfPosteringersOpgaveIDer = posteringer.map(postering => postering.opgaveID)
    const ikkeEksisterendeOpgaveIDer = arrayAfPosteringersOpgaveIDer.filter(opgaveID => !arrayAfEksisterendeOpgaveIDer.includes(opgaveID))
    const unikkeIkkeEksisterendeOpgaveIDer = [...new Set(ikkeEksisterendeOpgaveIDer)]

    console.log("Unikke ikke-eksisterende opgaveIDer", unikkeIkkeEksisterendeOpgaveIDer)

    const nyeOpgaveKundePar = unikkeIkkeEksisterendeOpgaveIDer.map(opgaveID => {
        const kundeID = posteringer.find(postering => postering.opgaveID === opgaveID)?.kundeID
        const brugerID = posteringer.find(postering => postering.opgaveID === opgaveID)?.brugerID
        return {
            opgaveID: opgaveID,
            kundeID: kundeID,
            brugerID: brugerID
        }
    })

    console.log("Nye opgave-kunde-par", nyeOpgaveKundePar)

    const submitOpgaver = async (e) => {
        e.preventDefault()

        const treFørstePar = nyeOpgaveKundePar.slice(0, 3)

        treFørstePar.forEach(opgaveKundePar => {
            const opgaveMedEksisterendeKunde = {
                _id: opgaveKundePar.opgaveID,
                opgaveBeskrivelse: "Opgavebeskrivelse mangler – opgave tilføjet som placeholder efter datatab.",
                fakturaOprettesManuelt: false,
                markeretSomFærdig: true,
                opgaveAfsluttet: new Date(),
                kundeID: opgaveKundePar.kundeID,
                kunde: opgaveKundePar.kundeID,
                ansvarlig: [brugere.find(bruger => bruger._id === opgaveKundePar.brugerID)]
            }

            axios.post(`${import.meta.env.VITE_API_URL}/opgaver`, opgaveMedEksisterendeKunde, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            })
            .then(response => {
                console.log("Opgave oprettet", response.data)
            })
            .catch(error => {
                console.error("Fejl ved oprettelse af opgave", error)
            })
        })

        // const opgaveMedEksisterendeKunde = {
        //     _id: nyeOpgaveKundePar[0].opgaveID,
        //     opgaveBeskrivelse: "Opgavebeskrivelse mangler – opgave tilføjet som placeholder efter datatab.",
        //     fakturaOprettesManuelt: false,
        //     markeretSomFærdig: true,
        //     opgaveAfsluttet: new Date(),
        //     kundeID: nyeOpgaveKundePar[0].kundeID,
        //     kunde: nyeOpgaveKundePar[0].kundeID,
        //     ansvarlig: [brugere.find(bruger => bruger._id === nyeOpgaveKundePar[0].brugerID)]
        // }

        // axios.post(`${import.meta.env.VITE_API_URL}/opgaver`, opgaveMedEksisterendeKunde, {
        //     headers: {
        //         'Authorization': `Bearer ${user.token}`
        //     }
        // })
        // .then(response => {
        //     console.log("Opgave oprettet", response.data)
        // })
        // .catch(error => {
        //     console.error("Fejl ved oprettelse af opgave", error)
        // })
    }

  return (
    <div style={{display: 'flex', flexDirection: 'row', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', padding: '10px'}}>
        {posteringer.map(postering => (
            <Postering key={postering._id} postering={postering} brugere={brugere} />
        ))}
        <button onClick={submitOpgaver}>Opret første opgave</button>
    </div>
  )
}

export default AllePosteringer
