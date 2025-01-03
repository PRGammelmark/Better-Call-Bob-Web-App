import React, { useState, useEffect } from 'react'
import axios from 'axios'
import dayjs from 'dayjs'
import Styles from './AdminØkonomiskOverblik.module.css'
import { handymanTimerHonorar, tømrerTimerHonorar } from '../../variables'
import MedarbejderØkonomiDetaljer from '../modals/MedarbejderØkonomiDetaljer'

const AdminØkonomiskOverblik = (props) => {

    const [posteringer, setPosteringer] = useState([])
    const [brugere, setBrugere] = useState([])
    const [opgaver, setOpgaver] = useState([])
    const [månedOffset, setMånedOffset] = useState(0)
    const [ÅbnMedarbejderØkonomiDetaljerModal, setÅbnMedarbejderØkonomiDetaljerModal] = useState(false)
    const [valgtPeriode, setValgtPeriode] = useState(null)

    const user = props.user

    const startOfDenneMåned = dayjs().date() >= 20 ? dayjs().date(20) : dayjs().subtract(1, 'month').date(20);
    const endOfDenneMåned = startOfDenneMåned.add(1, 'month').date(19);

    const customMåned = {
        start: startOfDenneMåned.subtract(månedOffset, 'month'),
        end: endOfDenneMåned.subtract(månedOffset, 'month')
    }

    function beregnTjent(posteringer) {
        const månedensOpstartsgebyrer = posteringer.reduce((sum, postering) => sum + postering.opstart, 0)
        const månedensHandymantimer = posteringer.reduce((sum, postering) => sum + postering.handymanTimer, 0)
        const månedensTømrertimer = posteringer.reduce((sum, postering) => sum + postering.tømrerTimer, 0)

        return månedensOpstartsgebyrer + (månedensHandymantimer * handymanTimerHonorar) + (månedensTømrertimer * tømrerTimerHonorar)
    }

    function beregnUdlagt(posteringer) {
        const månedensUdlæg = posteringer.reduce((sum, postering) => {
            const udlægSum = postering.udlæg.reduce((udlægSum, udlægItem) => udlægSum + udlægItem.beløb, 0);
            return sum + udlægSum;
        }, 0);
        const månedensØvrigt = posteringer.reduce((sum, postering) => {
            const øvrigtSum = postering.øvrigt.reduce((øvrigtSum, øvrigtItem) => øvrigtSum + øvrigtItem.beløb, 0);
            return sum + øvrigtSum;
        }, 0);

        return månedensUdlæg + månedensØvrigt;
    }

    const posteringerDenneMåned = posteringer.filter(postering => dayjs(postering.createdAt).isAfter(dayjs(customMåned.start).format('YYYY-MM-DD')) && dayjs(postering.createdAt).isBefore(dayjs(customMåned.end).format('YYYY-MM-DD')))
    const totalTjentDenneMåned = beregnTjent(posteringerDenneMåned)
    const totalUdlagtDenneMåned = beregnUdlagt(posteringerDenneMåned)

    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API_URL}/posteringer`, {
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        })
        .then(res => {
            setPosteringer(res.data)
        })
    }, [])

    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API_URL}/brugere`, {
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        })
        .then(res => {
            setBrugere(res.data)
        })
    }, [])

    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API_URL}/opgaver`, {
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        })
        .then(res => {
            setOpgaver(res.data)
        })
        .catch(error => {
            console.log("error", error)
        })
    }, [])


  return (
    <div>
       <div className={Styles.okonomiHeadingContainer}>
            <h2 style={{width: "400px"}} className={`bold ${Styles.heading}`}>Økonomi for {customMåned.end.format('MMMM YYYY')}</h2>
            <div className={Styles.chooseMonthButtonsContainer}>
                <button className={Styles.moveBackButton} onClick={() => setMånedOffset(månedOffset + 1)}>
                    &lt;
                </button>
                <button className={Styles.moveForwardButton} onClick={() => setMånedOffset(månedOffset - 1)}>
                    &gt;
                </button>
            </div>
        </div>
        <p>({dayjs(customMåned.start).format('DD. MMM')} – {dayjs(customMåned.end).format('DD. MMM')})</p>

        <div className={Styles.adminØkonomiContainer}>
            <div style={{borderTopLeftRadius: '10px', borderTopRightRadius: '10px'}} className={Styles.adminØkonomiHeadings}>
                <div>
                    <b>Medarbejder</b>
                </div>
                <div>
                    <b>Optjent</b>
                </div>
                <div>
                    <b>Udlæg</b>
                </div>
                <div>
                    <b>Honorar</b>
                </div>
                <div className={Styles.åbnModalButtonKolonne}>
                    <b>Detaljer</b>
                </div>
            </div>
            {brugere && brugere.map((bruger, index) => {
                const brugerensPosteringer = posteringer && posteringer.filter(postering => postering.brugerID === bruger._id)
                const brugerensPosteringerDenneMåned = brugerensPosteringer.filter(postering => dayjs(postering.createdAt).isAfter(dayjs(customMåned.start).format('YYYY-MM-DD')) && dayjs(postering.createdAt).isBefore(dayjs(customMåned.end).format('YYYY-MM-DD')))
                const brugerensTjentDenneMåned = beregnTjent(brugerensPosteringerDenneMåned)
                const brugerensUdlagtDenneMåned = beregnUdlagt(brugerensPosteringerDenneMåned)

                const rowStyle = index % 2 === 0 ? Styles.evenRow : Styles.oddRow;

                return (
                    <div className={`${Styles.adminØkonomiRække} ${rowStyle}`} key={bruger._id} onClick={() => {
                        if (brugerensPosteringerDenneMåned.length > 0 && window.innerWidth <= 750) {
                                setÅbnMedarbejderØkonomiDetaljerModal(brugerensPosteringerDenneMåned);
                        }
                    }}>
                        <div>
                            <b>{bruger.navn}</b>
                        </div>
                        <div>
                            <p style={{color: '#59bf1a'}}>{brugerensTjentDenneMåned.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p>
                        </div>
                        <div>
                            <p style={{color: 'orange'}}>{brugerensUdlagtDenneMåned.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p>
                        </div>
                        <div>
                            <p>{(brugerensTjentDenneMåned + brugerensUdlagtDenneMåned).toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p>
                        </div>
                        <div className={Styles.åbnModalButtonKolonne}>
                            {brugerensPosteringerDenneMåned.length > 0 && <button className={Styles.åbnModalButton} onClick={() => setÅbnMedarbejderØkonomiDetaljerModal(brugerensPosteringerDenneMåned)}>Detaljer</button>}
                        </div>
                    </div>
                )
            })}
            <div className={Styles.adminØkonomiFooter}>
                <div>
                    <b>Total, {customMåned.end.format('MMM YYYY')}</b>
                </div>
                <div>
                    <b>{totalTjentDenneMåned.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</b>
                </div>
                <div>
                    <b>{totalUdlagtDenneMåned.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</b>
                </div>
                <div>
                    <b>{(totalTjentDenneMåned + totalUdlagtDenneMåned).toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</b>
                </div>
            </div>
        </div>
        <MedarbejderØkonomiDetaljer trigger={ÅbnMedarbejderØkonomiDetaljerModal} setTrigger={setÅbnMedarbejderØkonomiDetaljerModal} brugere={brugere} customMåned={customMåned} user={user} opgaver={opgaver}/>
    </div>
  )
}

export default AdminØkonomiskOverblik
