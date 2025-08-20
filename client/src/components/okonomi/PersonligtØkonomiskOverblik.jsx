import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Styles from './PersonligtØkonomiskOverblik.module.css'
import dayjs from 'dayjs'
import ØkonomiOverblikModal from '../modals/ØkonomiOverblikModal'
// import { handymanTimerHonorar, tømrerTimerHonorar, opstartsgebyrHonorar } from '../../variables'
import satser from '../../variables'
import * as beregn from '../../utils/beregninger.js'

const PersonligtØkonomiskOverblik = (props) => {

    const [posteringer, setPosteringer] = useState([])
    // const [tjentDenneMåned, setTjentDenneMåned] = useState(0)
    // const [udlægDenneMåned, setUdlægDenneMåned] = useState(0)
    const [månedOffset, setMånedOffset] = useState(0)
    const [åbnØkonomiOverblikModal, setÅbnØkonomiOverblikModal] = useState(false)

    const startOfDenneMåned = (dayjs().date() >= 20 
        ? dayjs().date(20) 
        : dayjs().subtract(1, 'month').date(20)
    ).startOf('day');

    const endOfDenneMåned = startOfDenneMåned.add(1, 'month').date(19).endOf('day');

    const customMåned = {
        start: startOfDenneMåned.subtract(månedOffset, 'month').startOf('day'),
        end: endOfDenneMåned.subtract(månedOffset, 'month').endOf('day')
    };

    // HENT MEDARBEJDERENS POSTERINGER
    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API_URL}/posteringer/bruger/${props.user?.id || props.user?._id}`, {
            headers: {
                'Authorization': `Bearer ${props.user.token}`
            }
        })
        .then(res => {
            setPosteringer(res.data)
        })
        .catch(error => console.log(error))
    }, [])

    // const denneMånedsPosteringer = posteringer.filter(postering => dayjs(postering.createdAt).isAfter(dayjs(customMåned.start).format('YYYY-MM-DD')) && dayjs(postering.createdAt).isBefore(dayjs(customMåned.end).format('YYYY-MM-DD')))
    const denneMånedsPosteringer = posteringer.filter(postering =>
        dayjs(postering.createdAt).isSameOrAfter(customMåned.start, 'day') &&
        dayjs(postering.createdAt).isSameOrBefore(customMåned.end, 'day')
    );

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
                <b style={{color: "#59bf1a"}} className={Styles.økonomiDetaljerContent}>{(beregn.totalHonorar(denneMånedsPosteringer, 2, false)?.beløb - beregn.udlægHonorar(denneMånedsPosteringer, 2, false)?.beløb)?.toLocaleString('da-DK', {minimumFractionDigits: 2, maximumFractionDigits: 2})} kr.</b>
            </div>
            <div className={`${Styles.økonomiDetaljerDiv} ${Styles.økonomiDetaljerDivUdlæg}`}>
                <h3 className={`bold ${Styles.økonomiDetaljerHeading}`}>Udlæg</h3>
                <b style={{color: "orange"}} className={Styles.økonomiDetaljerContent}>{beregn.udlægHonorar(denneMånedsPosteringer, 2, false)?.formateret}</b>
            </div>
            <div className={`${Styles.økonomiDetaljerDiv} ${Styles.økonomiDetaljerDivHonorar}`}>
                <h3 className={`bold ${Styles.økonomiDetaljerHeading}`}>Udbetaling (før skat)</h3>
                <b className={Styles.økonomiDetaljerContent}>{beregn.totalHonorar(denneMånedsPosteringer, 2, false)?.formateret}</b>
            </div>
        </div>
      </div>
      <ØkonomiOverblikModal trigger={åbnØkonomiOverblikModal} setTrigger={setÅbnØkonomiOverblikModal} posteringer={posteringer} user={props.user}/>
    </div>
  )
}

export default PersonligtØkonomiskOverblik