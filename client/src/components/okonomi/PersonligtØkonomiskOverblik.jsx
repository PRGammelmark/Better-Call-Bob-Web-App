import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Styles from './PersonligtØkonomiskOverblik.module.css'
import dayjs from 'dayjs'
import { handymanTimerHonorar, tømrerTimerHonorar, opstartsgebyrHonorar } from '../../variables'

const PersonligtØkonomiskOverblik = (props) => {

const [posteringer, setPosteringer] = useState([])
const [tjentDenneMåned, setTjentDenneMåned] = useState(0)
const [udlægDenneMåned, setUdlægDenneMåned] = useState(0)
const [tjentForrigeMåned, setTjentForrigeMåned] = useState(0)
const [udlægForrigeMåned, setUdlægForrigeMåned] = useState(0)
const denneMåned = dayjs().format('MMMM')
const forrigeMåned = dayjs().subtract(1, 'month').format('MMMM')

// HENT ALLE MEDARBEJDERENS POSTERINGER
useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/posteringer/bruger/${props.user.id}`, {
        headers: {
            'Authorization': `Bearer ${props.user.token}`
        }
    })
    .then(res => {
        setPosteringer(res.data)
    })
    .catch(error => console.log(error))
}, [])

// FILTRER POSTERINGER OG BEREGN TJENT + UDLÆG FOR DENNE OG SIDSTE MÅNED
useEffect(() => {
    const denneMånedsPosteringer = posteringer.filter(postering => dayjs(postering.createdAt).format('MMMM') === denneMåned)

    const denneMånedsOpstartsgebyrer = denneMånedsPosteringer.reduce((sum, postering) => sum + postering.opstart, 0)
    const denneMånedsHandymantimer = denneMånedsPosteringer.reduce((sum, postering) => sum + postering.handymanTimer, 0)
    const denneMånedsTømrertimer = denneMånedsPosteringer.reduce((sum, postering) => sum + postering.tømrerTimer, 0)
    const denneMånedsUdlæg = denneMånedsPosteringer.reduce((sum, postering) => {
        const udlægSum = postering.udlæg.reduce((udlægSum, udlægItem) => udlægSum + udlægItem.beløb, 0);
        return sum + udlægSum;
    }, 0);
    const denneMånedsØvrigt = denneMånedsPosteringer.reduce((sum, postering) => {
        const øvrigtSum = postering.øvrigt.reduce((øvrigtSum, øvrigtItem) => øvrigtSum + øvrigtItem.beløb, 0);
        return sum + øvrigtSum;
    }, 0);

    const sumUdlægDenneMåned = denneMånedsUdlæg + denneMånedsØvrigt
    const sumTjentDenneMåned = denneMånedsOpstartsgebyrer + (denneMånedsHandymantimer * handymanTimerHonorar) + (denneMånedsTømrertimer * tømrerTimerHonorar)

    const sidsteMånedsPosteringer = posteringer.filter(postering => dayjs(postering.createdAt).format('MMMM') === forrigeMåned)

    const sidsteMånedsOpstartsgebyrer = sidsteMånedsPosteringer.reduce((sum, postering) => sum + postering.opstart, 0)
    const sidsteMånedsHandymantimer = sidsteMånedsPosteringer.reduce((sum, postering) => sum + postering.handymanTimer, 0)
    const sidsteMånedsTømrertimer = sidsteMånedsPosteringer.reduce((sum, postering) => sum + postering.tømrerTimer, 0)
    const sidsteMånedsUdlæg = sidsteMånedsPosteringer.reduce((sum, postering) => {
        const udlægSum = postering.udlæg.reduce((udlægSum, udlægItem) => udlægSum + udlægItem.beløb, 0);
        return sum + udlægSum;
    }, 0);
    const sidsteMånedsØvrigt = sidsteMånedsPosteringer.reduce((sum, postering) => {
        const øvrigtSum = postering.øvrigt.reduce((øvrigtSum, øvrigtItem) => øvrigtSum + øvrigtItem.beløb, 0);
        return sum + øvrigtSum;
    }, 0);

    const sumUdlægForrigeMåned = sidsteMånedsUdlæg + sidsteMånedsØvrigt
    const sumTjentForrigeMåned = sidsteMånedsOpstartsgebyrer + (sidsteMånedsHandymantimer * handymanTimerHonorar) + (sidsteMånedsTømrertimer * tømrerTimerHonorar)
    
    setTjentDenneMåned(sumTjentDenneMåned)
    setUdlægDenneMåned(sumUdlægDenneMåned)
    setTjentForrigeMåned(sumTjentForrigeMåned)
    setUdlægForrigeMåned(sumUdlægForrigeMåned)

}, [posteringer])

  return (
    <div className={Styles.personligtØkonomiskOverblikContainer}>
      <div className={Styles.tjentContainer}>
        <h2 className={`bold ${Styles.heading}`}>Tjent i {denneMåned}</h2>
        <div className={Styles.økonomiDetaljer}>
            <div className={Styles.økonomiDetaljerDiv}>
                <h3 className={`bold ${Styles.økonomiDetaljerHeading}`}>Optjent</h3>
                <b style={{color: "#59bf1a"}} className={Styles.økonomiDetaljerContent}>{tjentDenneMåned ? tjentDenneMåned.toLocaleString() : (0).toLocaleString()} kr.</b>
            </div>
            <div className={Styles.økonomiDetaljerDiv}>
                <h3 className={`bold ${Styles.økonomiDetaljerHeading}`}>Udlæg</h3>
                <b style={{color: "orange"}} className={Styles.økonomiDetaljerContent}>{udlægDenneMåned ? udlægDenneMåned.toLocaleString() : 0} kr.</b>
            </div>
            <div className={Styles.økonomiDetaljerDiv}>
                <h3 className={`bold ${Styles.økonomiDetaljerHeading}`}>Udbetaling i alt (eks. moms)</h3>
                <b className={Styles.økonomiDetaljerContent}>{(tjentDenneMåned + udlægDenneMåned).toLocaleString()} kr.</b>
            </div>
        </div>
      </div>
    </div>
  )
}

export default PersonligtØkonomiskOverblik