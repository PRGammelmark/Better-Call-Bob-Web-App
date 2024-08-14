import React from 'react'
import ÅbenOpgaveCSS from './ÅbenOpgave.module.css'
import PageAnimation from '../components/PageAnimation'
import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'

const ÅbenOpgave = () => {
    const { opgaveID } = useParams();

    const [opgaver, setOpgaver] = useState(null)
    const [loading, setLoading] = useState(true);

    useEffect(()=>{
        const fetchOpgaver = async () => {
        const response = await fetch('http://localhost:3000/api/opgaver')
        const json = await response.json();

        if (response.ok) {
            setOpgaver(json);
            setLoading(false);
        } 
        }

        fetchOpgaver()
    }, [])

    if (loading) {
        return (
            <PageAnimation>
                <div>
                    <h2>Opgave #</h2>
                    <br />
                    <p>Indlæser opgave ...</p>
                </div>
            </PageAnimation>
        );
    }

    const opgave = opgaver ? opgaver.find(({ _id }) => _id === opgaveID) : null;

    return (
    
        <div>
            <h2>Opgave #{opgave._id.slice(0,3)}</h2>
            <br />
            <PageAnimation>
            <p>Opgave-ID: {opgave._id}</p>
            <p>Navn: {opgave.navn}</p>
            <p>Adresse: {opgave.adresse}</p>
            <p>Modtaget: {new Date(opgave.createdAt).toLocaleDateString()}</p>
            <p>Status: {opgave.status}</p>
            <p>Fremskridt: {opgave.fremskridt}</p>
            <p>Ansvarlig: {opgave.ansvarlig ? opgave.ansvarlig : "Ikke uddelegeret"}</p>
            </PageAnimation>
        </div>
  )
}

export default ÅbenOpgave
