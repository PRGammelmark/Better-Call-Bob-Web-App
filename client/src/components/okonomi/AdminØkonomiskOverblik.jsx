import React, { useState, useEffect } from 'react'
import axios from 'axios'
import dayjs from 'dayjs'
import Styles from './AdminØkonomiskOverblik.module.css'
import satser from '../../variables'
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
        const månedensOpstartsgebyrer = posteringer.reduce((sum, postering) => sum + (postering.dynamiskHonorarBeregning ? (postering.opstart * postering.satser.opstartsgebyrHonorar) : 0), 0)
        const månedensHandymantimer = posteringer.reduce((sum, postering) => sum + (postering.dynamiskHonorarBeregning ? (postering.handymanTimer * postering.satser.handymanTimerHonorar) : 0), 0)
        const månedensTømrertimer = posteringer.reduce((sum, postering) => sum + (postering.dynamiskHonorarBeregning ? (postering.tømrerTimer * postering.satser.tømrerTimerHonorar) : 0), 0)
        const månedensRådgivningOpmålingVejledning = posteringer.reduce((sum, postering) => sum + (postering.dynamiskHonorarBeregning ? (postering.rådgivningOpmålingVejledning * postering.satser.rådgivningOpmålingVejledningHonorar) : 0), 0)
        const månedensAftenTillæg = posteringer.reduce((sum, postering) => sum + (postering.dynamiskHonorarBeregning ? ((postering.aftenTillæg ? (((postering.handymanTimer * postering.satser.handymanTimerHonorar) + (postering.tømrerTimer * postering.satser.tømrerTimerHonorar) + (postering.rådgivningOpmålingVejledning * postering.satser.rådgivningOpmålingVejledningHonorar)) * (postering.satser.aftenTillægHonorar / 100)) : 0)) : 0), 0)
        const månedensNatTillæg = posteringer.reduce((sum, postering) => sum + (postering.dynamiskHonorarBeregning ? ((postering.natTillæg ? (((postering.handymanTimer * postering.satser.handymanTimerHonorar) + (postering.tømrerTimer * postering.satser.tømrerTimerHonorar) + (postering.rådgivningOpmålingVejledning * postering.satser.rådgivningOpmålingVejledningHonorar)) * (postering.satser.natTillægHonorar / 100)) : 0)) : 0), 0)
        const månedensTrailer = posteringer.reduce((sum, postering) => sum + (postering.dynamiskHonorarBeregning ? ((postering.trailer ? postering.satser.trailerHonorar : 0)) : 0), 0)
        const månedensTjentFørRabat = månedensOpstartsgebyrer + månedensHandymantimer + månedensTømrertimer + månedensRådgivningOpmålingVejledning + månedensAftenTillæg + månedensNatTillæg + månedensTrailer
        const månedensRabat = posteringer.reduce((sum, postering) => sum + (postering.dynamiskHonorarBeregning ? ((postering.rabatProcent > 0 ? ((postering.rabatProcent / 100) * (postering.opstart * postering.satser.opstartsgebyrHonorar + postering.handymanTimer * postering.satser.handymanTimerHonorar + postering.tømrerTimer * postering.satser.tømrerTimerHonorar + postering.rådgivningOpmålingVejledning * postering.satser.rådgivningOpmålingVejledningHonorar + (postering.aftenTillæg ? (((postering.handymanTimer * postering.satser.handymanTimerHonorar) + (postering.tømrerTimer * postering.satser.tømrerTimerHonorar) + (postering.rådgivningOpmålingVejledning * postering.satser.rådgivningOpmålingVejledningHonorar)) * (postering.satser.aftenTillægHonorar / 100)) : 0) + (postering.natTillæg ? (((postering.handymanTimer * postering.satser.handymanTimerHonorar) + (postering.tømrerTimer * postering.satser.tømrerTimerHonorar) + (postering.rådgivningOpmålingVejledning * postering.satser.rådgivningOpmålingVejledningHonorar)) * (postering.satser.natTillægHonorar / 100)) : 0) + (postering.trailer ? postering.satser.trailerHonorar : 0))) : 0)) : 0), 0)
        const månedensDynamiskeHonorarer = månedensTjentFørRabat - månedensRabat;
        const månedensFasteHonorarer = posteringer.reduce((sum, postering) => sum + (postering.dynamiskHonorarBeregning ? 0 : postering.fastHonorar), 0)
        return månedensDynamiskeHonorarer + månedensFasteHonorarer;
    }

    function beregnUdlagt(posteringer) {
        const månedensUdlæg = posteringer.reduce((sum, postering) => {
            const udlægSum = postering.udlæg.reduce((udlægSum, udlægItem) => udlægSum + udlægItem.beløb, 0);
            return sum + udlægSum;
        }, 0);

        return månedensUdlæg;
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
                <div style={{textAlign: 'right'}}>
                    <b>Optjent</b>
                </div>
                <div style={{textAlign: 'right'}}>
                    <b>Udlæg</b>
                </div>
                <div style={{textAlign: 'right'}}>
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
                            <p style={{color: '#59bf1a', textAlign: 'right'}}>{brugerensTjentDenneMåned.toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                        </div>
                        <div>
                            <p style={{color: 'orange', textAlign: 'right'}}>{brugerensUdlagtDenneMåned.toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                        </div>
                        <div>
                            <p style={{textAlign: 'right'}}>{(brugerensTjentDenneMåned + brugerensUdlagtDenneMåned).toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
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
                <div style={{textAlign: 'right'}}>
                    <b>{totalTjentDenneMåned.toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</b>
                </div>
                <div style={{textAlign: 'right'}}>
                    <b>{totalUdlagtDenneMåned.toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</b>
                </div>
                <div style={{textAlign: 'right'}}>
                    <b>{(totalTjentDenneMåned + totalUdlagtDenneMåned).toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</b>
                </div>
            </div>
        </div>
        <MedarbejderØkonomiDetaljer trigger={ÅbnMedarbejderØkonomiDetaljerModal} setTrigger={setÅbnMedarbejderØkonomiDetaljerModal} brugere={brugere} customMåned={customMåned} user={user} opgaver={opgaver}/>
    </div>
  )
}

export default AdminØkonomiskOverblik
