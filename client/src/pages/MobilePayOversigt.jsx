import React, {useState, useEffect} from 'react'
import Postering from '../components/Postering'
import axios from 'axios'
import { useAuthContext } from '../hooks/useAuthContext'

const MobilePayOversigt = () => {
    const { user } = useAuthContext();

    if(!user || !user?.isAdmin) {
        return
    }

    const [posteringerBetaltMedMobilePay, setPosteringerBetaltMedMobilePay] = useState([])

    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API_URL}/posteringer/betalt-med-mobile-pay`, {
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        })
        .then(res => {
            setPosteringerBetaltMedMobilePay(res.data)
            console.log(res.data)
        })
        .catch(error => console.log(error))
    }, [])

    return (
        <div>
          <h2>Posteringer betalt med MobilePay</h2>
      
          {posteringerBetaltMedMobilePay.length === 0 ? (
            <p>Ingen posteringer fundet.</p>
          ) : (
            <ul>
              {posteringerBetaltMedMobilePay.map((p) => (
                <li key={p._id}>
                  <b>{p?.kunde?.fornavn + " " + p?.kunde?.efternavn}</b><br />
                  Dato: {new Date(p.dato).toLocaleDateString("da-DK")}<br />
                  Beløb: {p.totalPris?.toFixed(2) || 0} kr
                </li>
              ))}
            </ul>
          )}
        </div>
      );
      
}

export default MobilePayOversigt