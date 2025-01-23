import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Styles from './PersonligtØkonomiskOverblik.module.css'
import dayjs from 'dayjs'
import ØkonomiOverblikModal from '../modals/ØkonomiOverblikModal'
// import { handymanTimerHonorar, tømrerTimerHonorar, opstartsgebyrHonorar } from '../../variables'
import satser from '../../variables'

const PersonligtØkonomiskOverblik = (props) => {

    const [posteringer, setPosteringer] = useState([])
    const [tjentDenneMåned, setTjentDenneMåned] = useState(0)
    const [udlægDenneMåned, setUdlægDenneMåned] = useState(0)
    const [månedOffset, setMånedOffset] = useState(0)
    const [åbnØkonomiOverblikModal, setÅbnØkonomiOverblikModal] = useState(false)

    const startOfDenneMåned = dayjs().date() >= 20 ? dayjs().date(20) : dayjs().subtract(1, 'month').date(20);
    const endOfDenneMåned = startOfDenneMåned.add(1, 'month').date(19);

    const customMåned = {
        start: startOfDenneMåned.subtract(månedOffset, 'month'),
        end: endOfDenneMåned.subtract(månedOffset, 'month')
    }

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

    // FILTRER POSTERINGER OG BEREGN TJENT + UDLÆG FOR VALGT MÅNED
    useEffect(() => {
        const denneMånedsPosteringer = posteringer.filter(postering => dayjs(postering.createdAt).isAfter(dayjs(customMåned.start).format('YYYY-MM-DD')) && dayjs(postering.createdAt).isBefore(dayjs(customMåned.end).format('YYYY-MM-DD')))
        const denneMånedsOpstartsgebyrer = denneMånedsPosteringer.reduce((sum, postering) => sum + postering.opstart, 0)
        const denneMånedsHandymantimer = denneMånedsPosteringer.reduce((sum, postering) => sum + postering.handymanTimer, 0)
        const denneMånedsTømrertimer = denneMånedsPosteringer.reduce((sum, postering) => sum + postering.tømrerTimer, 0)
        const denneMånedsUdlæg = denneMånedsPosteringer.reduce((sum, postering) => {
            const udlægSum = postering.udlæg.reduce((udlægSum, udlægItem) => udlægSum + udlægItem.beløb, 0);
            return sum + udlægSum;
        }, 0);

        const sumUdlægDenneMåned = denneMånedsUdlæg;
        const sumTjentDenneMåned = denneMånedsOpstartsgebyrer + (denneMånedsHandymantimer * satser.handymanTimerHonorar) + (denneMånedsTømrertimer * satser.tømrerTimerHonorar)
        
        setTjentDenneMåned(sumTjentDenneMåned)
        setUdlægDenneMåned(sumUdlægDenneMåned)

    }, [posteringer, månedOffset])

  return (
    <div className={Styles.personligtØkonomiskOverblikContainer}>
      <div className={Styles.tjentContainer}>
        <div className={Styles.okonomiHeadingContainer}>
            <h2 style={{width: "400px"}} className={`bold ${Styles.heading}`}>Din økonomi - {customMåned.end.format('MMM YYYY')}</h2>
            <div className={Styles.chooseMonthButtonsContainer}>
                <button className={Styles.moveBackButton} onClick={() => setMånedOffset(månedOffset + 1)}>
                    &lt;
                </button>
                <button className={Styles.moveForwardButton} onClick={() => setMånedOffset(månedOffset - 1)}>
                    &gt;
                </button>
                <button className={Styles.åbnModalButton} onClick={() => setÅbnØkonomiOverblikModal(true)}>Detaljer</button>
            </div>
        </div>
        <p>({dayjs(customMåned.start).format('DD. MMM')} – {dayjs(customMåned.end).format('DD. MMM')})</p>
        <div className={Styles.økonomiDetaljer}>
            <div className={`${Styles.økonomiDetaljerDiv} ${Styles.økonomiDetaljerDivOptjent}`}>
                <h3 className={`bold ${Styles.økonomiDetaljerHeading}`}>Optjent</h3>
                <b style={{color: "#59bf1a"}} className={Styles.økonomiDetaljerContent}>{tjentDenneMåned ? tjentDenneMåned.toLocaleString() : (0).toLocaleString()} kr.</b>
            </div>
            <div className={`${Styles.økonomiDetaljerDiv} ${Styles.økonomiDetaljerDivUdlæg}`}>
                <h3 className={`bold ${Styles.økonomiDetaljerHeading}`}>Udlæg</h3>
                <b style={{color: "orange"}} className={Styles.økonomiDetaljerContent}>{udlægDenneMåned ? udlægDenneMåned.toLocaleString() : 0} kr.</b>
            </div>
            <div className={`${Styles.økonomiDetaljerDiv} ${Styles.økonomiDetaljerDivHonorar}`}>
                <h3 className={`bold ${Styles.økonomiDetaljerHeading}`}>Til udbetaling, i alt</h3>
                <b className={Styles.økonomiDetaljerContent}>{(tjentDenneMåned + udlægDenneMåned).toLocaleString()} kr.</b>
            </div>
        </div>
      </div>
      <ØkonomiOverblikModal trigger={åbnØkonomiOverblikModal} setTrigger={setÅbnØkonomiOverblikModal} posteringer={posteringer} user={props.user}/>
    </div>
  )
}

export default PersonligtØkonomiskOverblik