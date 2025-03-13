import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Modal from '../Modal.jsx'
import Styles from './ØkonomiOverblikModal.module.css'
import ModalStyles from '../Modal.module.css'
import dayjs from 'dayjs'
import PageAnimation from '../PageAnimation'
import BackIcon from "../../assets/back.svg"
import ÅbenOpgaveCSS from '../../pages/ÅbenOpgave.module.css'
import satser from '../../variables'
import axios from 'axios'

const ØkonomiOverblikModal = (props) => {

    const navigate = useNavigate()
    const [år, setÅr] = useState(dayjs().year())
    const [tjentJanuar, setTjentJanuar] = useState(0)
    const [udlagtJanuar, setUdlagtJanuar] = useState(0)
    const [tjentFebruar, setTjentFebruar] = useState(0)
    const [udlagtFebruar, setUdlagtFebruar] = useState(0)
    const [tjentMarts, setTjentMarts] = useState(0)
    const [udlagtMarts, setUdlagtMarts] = useState(0)
    const [tjentApril, setTjentApril] = useState(0)
    const [udlagtApril, setUdlagtApril] = useState(0)
    const [tjentMaj, setTjentMaj] = useState(0)
    const [udlagtMaj, setUdlagtMaj] = useState(0)
    const [tjentJuni, setTjentJuni] = useState(0)
    const [udlagtJuni, setUdlagtJuni] = useState(0)
    const [tjentJuli, setTjentJuli] = useState(0)
    const [udlagtJuli, setUdlagtJuli] = useState(0)
    const [tjentAugust, setTjentAugust] = useState(0)
    const [udlagtAugust, setUdlagtAugust] = useState(0)
    const [tjentSeptember, setTjentSeptember] = useState(0)
    const [udlagtSeptember, setUdlagtSeptember] = useState(0)
    const [tjentOktober, setTjentOktober] = useState(0)
    const [udlagtOktober, setUdlagtOktober] = useState(0)
    const [tjentNovember, setTjentNovember] = useState(0)
    const [udlagtNovember, setUdlagtNovember] = useState(0)
    const [tjentDecember, setTjentDecember] = useState(0)
    const [udlagtDecember, setUdlagtDecember] = useState(0)
    const [januarPosteringer, setJanuarPosteringer] = useState([])
    const [februarPosteringer, setFebruarPosteringer] = useState([])
    const [martsPosteringer, setMartsPosteringer] = useState([])
    const [aprilPosteringer, setAprilPosteringer] = useState([])
    const [majPosteringer, setMajPosteringer] = useState([])
    const [juniPosteringer, setJuniPosteringer] = useState([])
    const [juliPosteringer, setJuliPosteringer] = useState([])
    const [augustPosteringer, setAugustPosteringer] = useState([])
    const [septemberPosteringer, setSeptemberPosteringer] = useState([])
    const [oktoberPosteringer, setOktoberPosteringer] = useState([])
    const [novemberPosteringer, setNovemberPosteringer] = useState([])
    const [decemberPosteringer, setDecemberPosteringer] = useState([])
    const [valgtMåned, setValgtMåned] = useState(null)
    const [posteringerDetaljer, setPosteringerDetaljer] = useState([])
    const [brugere, setBrugere] = useState([])
    const [opgaver, setOpgaver] = useState([])
    
    const user = props.user
    
    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API_URL}/brugere`, {
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        })
        .then(res => {
            setBrugere(res.data);
        })
        .catch(error => console.log(error))
    }, [])

    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API_URL}/opgaver`, {
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        })
        .then(res => {
            setOpgaver(res.data);
        })
        .catch(error => console.log(error))
    }, [])

    const getOpgaveAdresse = (opgaveID) => {
        const opgave = opgaver && opgaver.find(opgave => opgave._id === opgaveID);
        return opgave ? opgave.adresse : 'Adresse utilgængelig';
    };
    
    function beregnTjent(posteringer) {
        const månedensOpstartsgebyrer = posteringer.reduce((sum, postering) => sum + postering.opstart * postering.satser.opstartsgebyrHonorar, 0)
        const månedensHandymantimer = posteringer.reduce((sum, postering) => sum + postering.handymanTimer * postering.satser.handymanTimerHonorar, 0)
        const månedensTømrertimer = posteringer.reduce((sum, postering) => sum + postering.tømrerTimer * postering.satser.tømrerTimerHonorar, 0)
        const månedensRådgivningOpmålingVejledning = posteringer.reduce((sum, postering) => sum + postering.rådgivningOpmålingVejledning * postering.satser.rådgivningOpmålingVejledningHonorar, 0)
        const månedensAftenTillæg = posteringer.reduce((sum, postering) => sum + (postering.aftenTillæg ? (((postering.handymanTimer * postering.satser.handymanTimerHonorar) + (postering.tømrerTimer * postering.satser.tømrerTimerHonorar) + (postering.rådgivningOpmålingVejledning * postering.satser.rådgivningOpmålingVejledningHonorar)) * (postering.satser.aftenTillægHonorar / 100)) : 0), 0)
        const månedensNatTillæg = posteringer.reduce((sum, postering) => sum + (postering.natTillæg ? (((postering.handymanTimer * postering.satser.handymanTimerHonorar) + (postering.tømrerTimer * postering.satser.tømrerTimerHonorar) + (postering.rådgivningOpmålingVejledning * postering.satser.rådgivningOpmålingVejledningHonorar)) * (postering.satser.natTillægHonorar / 100)) : 0), 0)
        const månedensTrailer = posteringer.reduce((sum, postering) => sum + (postering.trailer ? postering.satser.trailerHonorar : 0), 0)

        return månedensOpstartsgebyrer + månedensHandymantimer + månedensTømrertimer + månedensRådgivningOpmålingVejledning + månedensAftenTillæg + månedensNatTillæg + månedensTrailer
    }

    function beregnUdlagt(posteringer) {
        const månedensUdlæg = posteringer.reduce((sum, postering) => {
            const udlægSum = postering.udlæg.reduce((udlægSum, udlægItem) => udlægSum + udlægItem.beløb, 0);
            return sum + udlægSum;
        }, 0);

        return månedensUdlæg;
    }

    let januarPosteringerX = []
    let februarPosteringerX = []
    let martsPosteringerX = []
    let aprilPosteringerX = []
    let majPosteringerX = []
    let juniPosteringerX = []
    let juliPosteringerX = []
    let augustPosteringerX = []
    let septemberPosteringerX = []
    let oktoberPosteringerX = []
    let novemberPosteringerX = []
    let decemberPosteringerX = []

    useEffect(() => {
        januarPosteringerX = props.posteringer.filter(postering => dayjs(postering.createdAt).isAfter(dayjs(`${år-1}-12-20`).format('YYYY-MM-DD')) && dayjs(postering.createdAt).isBefore(dayjs(`${år}-01-19`).format('YYYY-MM-DD')))
        februarPosteringerX = props.posteringer.filter(postering => dayjs(postering.createdAt).isAfter(dayjs(`${år}-01-20`).format('YYYY-MM-DD')) && dayjs(postering.createdAt).isBefore(dayjs(`${år}-02-19`).format('YYYY-MM-DD')))
        martsPosteringerX = props.posteringer.filter(postering => dayjs(postering.createdAt).isAfter(dayjs(`${år}-02-20`).format('YYYY-MM-DD')) && dayjs(postering.createdAt).isBefore(dayjs(`${år}-03-19`).format('YYYY-MM-DD')))
        aprilPosteringerX = props.posteringer.filter(postering => dayjs(postering.createdAt).isAfter(dayjs(`${år}-03-20`).format('YYYY-MM-DD')) && dayjs(postering.createdAt).isBefore(dayjs(`${år}-04-19`).format('YYYY-MM-DD')))
        majPosteringerX = props.posteringer.filter(postering => dayjs(postering.createdAt).isAfter(dayjs(`${år}-04-20`).format('YYYY-MM-DD')) && dayjs(postering.createdAt).isBefore(dayjs(`${år}-05-19`).format('YYYY-MM-DD')))
        juniPosteringerX = props.posteringer.filter(postering => dayjs(postering.createdAt).isAfter(dayjs(`${år}-05-20`).format('YYYY-MM-DD')) && dayjs(postering.createdAt).isBefore(dayjs(`${år}-06-19`).format('YYYY-MM-DD')))
        juliPosteringerX = props.posteringer.filter(postering => dayjs(postering.createdAt).isAfter(dayjs(`${år}-06-20`).format('YYYY-MM-DD')) && dayjs(postering.createdAt).isBefore(dayjs(`${år}-07-19`).format('YYYY-MM-DD')))
        augustPosteringerX = props.posteringer.filter(postering => dayjs(postering.createdAt).isAfter(dayjs(`${år}-07-20`).format('YYYY-MM-DD')) && dayjs(postering.createdAt).isBefore(dayjs(`${år}-08-19`).format('YYYY-MM-DD')))
        septemberPosteringerX = props.posteringer.filter(postering => dayjs(postering.createdAt).isAfter(dayjs(`${år}-08-20`).format('YYYY-MM-DD')) && dayjs(postering.createdAt).isBefore(dayjs(`${år}-09-19`).format('YYYY-MM-DD')))
        oktoberPosteringerX = props.posteringer.filter(postering => dayjs(postering.createdAt).isAfter(dayjs(`${år}-09-20`).format('YYYY-MM-DD')) && dayjs(postering.createdAt).isBefore(dayjs(`${år}-10-19`).format('YYYY-MM-DD')))
        novemberPosteringerX = props.posteringer.filter(postering => dayjs(postering.createdAt).isAfter(dayjs(`${år}-10-20`).format('YYYY-MM-DD')) && dayjs(postering.createdAt).isBefore(dayjs(`${år}-11-19`).format('YYYY-MM-DD')))
        decemberPosteringerX = props.posteringer.filter(postering => dayjs(postering.createdAt).isAfter(dayjs(`${år}-11-20`).format('YYYY-MM-DD')) && dayjs(postering.createdAt).isBefore(dayjs(`${år}-12-19`).format('YYYY-MM-DD')))

        setJanuarPosteringer(januarPosteringerX)
        setFebruarPosteringer(februarPosteringerX)
        setMartsPosteringer(martsPosteringerX)
        setAprilPosteringer(aprilPosteringerX)
        setMajPosteringer(majPosteringerX)
        setJuniPosteringer(juniPosteringerX)
        setJuliPosteringer(juliPosteringerX)
        setAugustPosteringer(augustPosteringerX)
        setSeptemberPosteringer(septemberPosteringerX)
        setOktoberPosteringer(oktoberPosteringerX)
        setNovemberPosteringer(novemberPosteringerX)
        setDecemberPosteringer(decemberPosteringerX)

        setTjentJanuar(beregnTjent(januarPosteringerX))
        setUdlagtJanuar(beregnUdlagt(januarPosteringerX))
        setTjentFebruar(beregnTjent(februarPosteringerX))
        setUdlagtFebruar(beregnUdlagt(februarPosteringerX))
        setTjentMarts(beregnTjent(martsPosteringerX))
        setUdlagtMarts(beregnUdlagt(martsPosteringerX))
        setTjentApril(beregnTjent(aprilPosteringerX))
        setUdlagtApril(beregnUdlagt(aprilPosteringerX))
        setTjentMaj(beregnTjent(majPosteringerX))
        setUdlagtMaj(beregnUdlagt(majPosteringerX))
        setTjentJuni(beregnTjent(juniPosteringerX))
        setUdlagtJuni(beregnUdlagt(juniPosteringerX))
        setTjentJuli(beregnTjent(juliPosteringerX))
        setUdlagtJuli(beregnUdlagt(juliPosteringerX))
        setTjentAugust(beregnTjent(augustPosteringerX))
        setUdlagtAugust(beregnUdlagt(augustPosteringerX))
        setTjentSeptember(beregnTjent(septemberPosteringerX))
        setUdlagtSeptember(beregnUdlagt(septemberPosteringerX))
        setTjentOktober(beregnTjent(oktoberPosteringerX))
        setUdlagtOktober(beregnUdlagt(oktoberPosteringerX))
        setTjentNovember(beregnTjent(novemberPosteringerX))
        setUdlagtNovember(beregnUdlagt(novemberPosteringerX))
        setTjentDecember(beregnTjent(decemberPosteringerX))
        setUdlagtDecember(beregnUdlagt(decemberPosteringerX))

    }, [år, props.posteringer])



  return (
    <Modal trigger={props.trigger} setTrigger={props.setTrigger}>
        {!posteringerDetaljer.length > 0 
        ? <PageAnimation>
            <h2 className={ModalStyles.modalHeading}>Økonomisk overblik</h2>
            <p className={Styles.modalText}>Se hvad du har optjent, udlagt og fået udbetalt i de forskellige måneder.</p>
            <div className={Styles.vælgÅr}>
                <h3>{år}</h3>
                <button className={Styles.moveBackButton} onClick={() => setÅr(år - 1)}>
                    &lt;
                </button>
                <button className={Styles.moveForwardButton} onClick={() => setÅr(år + 1)}>
                    &gt;
                </button>
            </div>
            <div className={`${Styles.måneder} ${Styles.månederDesktop}`}>
                <div className={`${Styles.månedHeadings} ${Styles.månedHeadingsDesktop}`}>
                    <div>
                        <b>Måned</b>
                    </div>
                    <div>
                        <b>Optjent</b>
                    </div>
                    <div>
                        <b>Udlæg</b>
                    </div>
                    <div>
                        <b>Udbetaling</b>
                    </div>
                    <div>
                        <b>Grundlag</b>
                    </div>
                </div>
                <div className={`${Styles.måned} ${Styles.uligeMåned}`}>
                    <p>Januar</p>
                    <p className={Styles.økonomiDetaljerTjent}>{tjentJanuar.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p>
                    <p className={Styles.økonomiDetaljerUdlagt}>{udlagtJanuar.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p>
                    <p>{(tjentJanuar + udlagtJanuar).toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p>
                    {januarPosteringer && januarPosteringer.length > 0 ? <button onClick={() => {setPosteringerDetaljer(januarPosteringer); setValgtMåned("januar")}}>Posteringer</button> : <span style={{color: '#222222'}}>–</span>}
                </div>
                <div className={`${Styles.måned} ${Styles.ligeMåned}`}>
                    <p>Februar</p>
                    <p className={Styles.økonomiDetaljerTjent}>{tjentFebruar.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p>
                    <p className={Styles.økonomiDetaljerUdlagt}>{udlagtFebruar.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p>
                    <p>{(tjentFebruar + udlagtFebruar).toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p>
                    {februarPosteringer && februarPosteringer.length > 0 ? <button onClick={() => {setPosteringerDetaljer(februarPosteringer); setValgtMåned("februar")}}>Posteringer</button> : <span style={{color: '#222222'}}>–</span>}
                </div>
                <div className={`${Styles.måned} ${Styles.uligeMåned}`}>
                    <p>Marts</p>
                    <p className={Styles.økonomiDetaljerTjent}>{tjentMarts.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p>
                    <p className={Styles.økonomiDetaljerUdlagt}>{udlagtMarts.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p>
                    <p>{(tjentMarts + udlagtMarts).toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p>
                    {martsPosteringer && martsPosteringer.length > 0 ? <button onClick={() => {setPosteringerDetaljer(martsPosteringer); setValgtMåned("marts")}}>Posteringer</button> : <span style={{color: '#222222'}}>–</span>}
                </div>
                <div className={`${Styles.måned} ${Styles.ligeMåned}`}>
                    <p>April</p>
                    <p className={Styles.økonomiDetaljerTjent}>{tjentApril.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p>
                    <p className={Styles.økonomiDetaljerUdlagt}>{udlagtApril.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p>
                    <p>{(tjentApril + udlagtApril).toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p>
                    {aprilPosteringer && aprilPosteringer.length > 0 ? <button onClick={() => {setPosteringerDetaljer(aprilPosteringer); setValgtMåned("april")}}>Posteringer</button> : <span style={{color: '#222222'}}>–</span>}
                </div>
                <div className={`${Styles.måned} ${Styles.uligeMåned}`}>
                    <p>Maj</p>
                    <p className={Styles.økonomiDetaljerTjent}>{tjentMaj.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p>
                    <p className={Styles.økonomiDetaljerUdlagt}>{udlagtMaj.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p>
                    <p>{(tjentMaj + udlagtMaj).toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p>
                    {majPosteringer && majPosteringer.length > 0 ? <button onClick={() => {setPosteringerDetaljer(majPosteringer); setValgtMåned("maj")}}>Posteringer</button> : <span style={{color: '#222222'}}>–</span>}
                </div>
                <div className={`${Styles.måned} ${Styles.ligeMåned}`}>
                    <p>Juni</p>
                    <p className={Styles.økonomiDetaljerTjent}>{tjentJuni.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p>
                    <p className={Styles.økonomiDetaljerUdlagt}>{udlagtJuni.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p>
                    <p>{(tjentJuni + udlagtJuni).toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p>
                    {juniPosteringer && juniPosteringer.length > 0 ? <button onClick={() => {setPosteringerDetaljer(juniPosteringer); setValgtMåned("juni")}}>Posteringer</button> : <span style={{color: '#222222'}}>–</span>}
                </div>
                <div className={`${Styles.måned} ${Styles.uligeMåned}`}>
                    <p>Juli</p>
                    <p className={Styles.økonomiDetaljerTjent}>{tjentJuli.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p>
                    <p className={Styles.økonomiDetaljerUdlagt}>{udlagtJuli.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p>
                    <p>{(tjentJuli + udlagtJuli).toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p>
                    {juliPosteringer && juliPosteringer.length > 0 ? <button onClick={() => {setPosteringerDetaljer(juliPosteringer); setValgtMåned("juli")}}>Posteringer</button> : <span style={{color: '#222222'}}>–</span>}
                </div>
                <div className={`${Styles.måned} ${Styles.ligeMåned}`}>
                    <p>August</p>
                    <p className={Styles.økonomiDetaljerTjent}>{tjentAugust.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p>
                    <p className={Styles.økonomiDetaljerUdlagt}>{udlagtAugust.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p>
                    <p>{(tjentAugust + udlagtAugust).toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p>
                    {augustPosteringer && augustPosteringer.length > 0 ? <button onClick={() => {setPosteringerDetaljer(augustPosteringer); setValgtMåned("august")}}>Posteringer</button> : <span style={{color: '#222222'}}>–</span>}
                </div>
                <div className={`${Styles.måned} ${Styles.uligeMåned}`}>
                    <p>September</p>
                    <p className={Styles.økonomiDetaljerTjent}>{tjentSeptember.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p>
                    <p className={Styles.økonomiDetaljerUdlagt}>{udlagtSeptember.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p>
                    <p>{(tjentSeptember + udlagtSeptember).toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p>
                    {septemberPosteringer && septemberPosteringer.length > 0 ? <button onClick={() => {setPosteringerDetaljer(septemberPosteringer); setValgtMåned("september")}}>Posteringer</button> : <span style={{color: '#222222'}}>–</span>}
                </div>
                <div className={`${Styles.måned} ${Styles.ligeMåned}`}>
                    <p>Oktober</p>
                    <p className={Styles.økonomiDetaljerTjent}>{tjentOktober.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p>
                    <p className={Styles.økonomiDetaljerUdlagt}>{udlagtOktober.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p>
                    <p>{(tjentOktober + udlagtOktober).toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p>
                    {oktoberPosteringer && oktoberPosteringer.length > 0 ? <button onClick={() => {setPosteringerDetaljer(oktoberPosteringer); setValgtMåned("oktober")}}>Posteringer</button> : <span style={{color: '#222222'}}>–</span>}
                </div>
                <div className={`${Styles.måned} ${Styles.uligeMåned}`}>
                    <p>November</p>
                    <p className={Styles.økonomiDetaljerTjent}>{tjentNovember.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p>
                    <p className={Styles.økonomiDetaljerUdlagt}>{udlagtNovember.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p>
                    <p>{(tjentNovember + udlagtNovember).toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p>
                    {novemberPosteringer && novemberPosteringer.length > 0 ? <button onClick={() => {setPosteringerDetaljer(novemberPosteringer); setValgtMåned("november")}}>Posteringer</button> : <span style={{color: '#222222'}}>–</span>}
                </div>
                <div className={`${Styles.måned} ${Styles.ligeMåned}`}>
                    <p>December</p>
                    <p className={Styles.økonomiDetaljerTjent}>{tjentDecember.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p>
                    <p className={Styles.økonomiDetaljerUdlagt}>{udlagtDecember.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p>
                    <p>{(tjentDecember + udlagtDecember).toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p>
                    {decemberPosteringer && decemberPosteringer.length > 0 ? <button onClick={() => {setPosteringerDetaljer(decemberPosteringer); setValgtMåned("december")}}>Posteringer</button> : <span style={{color: '#222222'}}>–</span>}
                </div>
                <div className={`${Styles.totalRække}`}>
                    <b>I alt, {år}</b>
                    <b>{tjentDecember.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</b>
                    <b>{udlagtDecember.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</b>
                    <b>{(tjentDecember + udlagtDecember).toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</b>
                </div>
            </div>
            <div className={`${Styles.måneder} ${Styles.månederMobile}`}>
                <div className={`${Styles.månedHeadings} ${Styles.månedHeadingsMobile}`}>
                    <div>
                        <b>Md.</b>
                    </div>
                    <div>
                        <b>Tjent</b>
                    </div>
                    <div>
                        <b>Udlæg</b>
                    </div>
                    <div>
                        <b>Honorar</b>
                    </div>
                </div>
                <div className={`${Styles.måned} ${Styles.uligeMåned} ${januarPosteringer && januarPosteringer.length > 0 ? Styles.mobilPosteringIndikator : null}`} onClick={() => {januarPosteringer && januarPosteringer.length > 0 ? setPosteringerDetaljer(januarPosteringer) && setValgtMåned("januar") : null}}>
                    <p>Jan</p>
                    <p className={Styles.økonomiDetaljerTjent}>{tjentJanuar.toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0  })}</p>
                    <p className={Styles.økonomiDetaljerUdlagt}>{udlagtJanuar.toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0  })}</p>
                    <p>{(tjentJanuar + udlagtJanuar).toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0  })}</p>
                </div>
                <div className={`${Styles.måned} ${Styles.ligeMåned} ${februarPosteringer && februarPosteringer.length > 0 ? Styles.mobilPosteringIndikator : null}`} onClick={() => {
                    if (februarPosteringer && februarPosteringer.length > 0) {
                        setValgtMåned("februar");
                        setPosteringerDetaljer(februarPosteringer);
                    }
                }}>
                    <p>Feb</p>
                    <p className={Styles.økonomiDetaljerTjent}>{tjentFebruar.toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0  })}</p>
                    <p className={Styles.økonomiDetaljerUdlagt}>{udlagtFebruar.toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0  })}</p>
                    <p>{(tjentFebruar + udlagtFebruar).toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0  })}</p>
                </div>
                <div className={`${Styles.måned} ${Styles.uligeMåned} ${martsPosteringer && martsPosteringer.length > 0 ? Styles.mobilPosteringIndikator : null}`} onClick={() => {
                    if (martsPosteringer && martsPosteringer.length > 0) {
                        setValgtMåned("marts");
                        setPosteringerDetaljer(martsPosteringer);
                    }
                }}>
                    <p>Mar</p>
                    <p className={Styles.økonomiDetaljerTjent}>{tjentMarts.toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0  })}</p>
                    <p className={Styles.økonomiDetaljerUdlagt}>{udlagtMarts.toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0  })}</p>
                    <p>{(tjentMarts + udlagtMarts).toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0  })}</p>
                </div>
                <div className={`${Styles.måned} ${Styles.ligeMåned} ${aprilPosteringer && aprilPosteringer.length > 0 ? Styles.mobilPosteringIndikator : null}`} onClick={() => {
                    if (aprilPosteringer && aprilPosteringer.length > 0) {
                        setValgtMåned("april");
                        setPosteringerDetaljer(aprilPosteringer);
                    }
                }}>
                    <p>Apr</p>
                    <p className={Styles.økonomiDetaljerTjent}>{tjentApril.toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0  })}</p>
                    <p className={Styles.økonomiDetaljerUdlagt}>{udlagtApril.toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0  })}</p>
                    <p>{(tjentApril + udlagtApril).toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0  })}</p>
                </div>
                <div className={`${Styles.måned} ${Styles.uligeMåned} ${majPosteringer && majPosteringer.length > 0 ? Styles.mobilPosteringIndikator : null}`} onClick={() => {
                    if (majPosteringer && majPosteringer.length > 0) {
                        setValgtMåned("maj");
                        setPosteringerDetaljer(majPosteringer);
                    }
                }}>
                    <p>Maj</p>
                    <p className={Styles.økonomiDetaljerTjent}>{tjentMaj.toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0  })}</p>
                    <p className={Styles.økonomiDetaljerUdlagt}>{udlagtMaj.toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0  })}</p>
                    <p>{(tjentMaj + udlagtMaj).toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0  })}</p>
                </div>
                <div className={`${Styles.måned} ${Styles.ligeMåned} ${juniPosteringer && juniPosteringer.length > 0 ? Styles.mobilPosteringIndikator : null}`} onClick={() => {
                    if (juniPosteringer && juniPosteringer.length > 0) {
                        setValgtMåned("juni");
                        setPosteringerDetaljer(juniPosteringer);
                    }
                }}>
                    <p>Jun</p>
                    <p className={Styles.økonomiDetaljerTjent}>{tjentJuni.toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0  })}</p>
                    <p className={Styles.økonomiDetaljerUdlagt}>{udlagtJuni.toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0  })}</p>
                    <p>{(tjentJuni + udlagtJuni).toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0  })}</p>
                </div>
                <div className={`${Styles.måned} ${Styles.uligeMåned} ${juliPosteringer && juliPosteringer.length > 0 ? Styles.mobilPosteringIndikator : null}`} onClick={() => {
                    if (juliPosteringer && juliPosteringer.length > 0) {
                        setValgtMåned("juli");
                        setPosteringerDetaljer(juliPosteringer);
                    }
                }}>
                    <p>Jul</p>
                    <p className={Styles.økonomiDetaljerTjent}>{tjentJuli.toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0  })}</p>
                    <p className={Styles.økonomiDetaljerUdlagt}>{udlagtJuli.toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0  })}</p>
                    <p>{(tjentJuli + udlagtJuli).toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0  })}</p>
                </div>
                <div className={`${Styles.måned} ${Styles.ligeMåned} ${augustPosteringer && augustPosteringer.length > 0 ? Styles.mobilPosteringIndikator : null}`} onClick={() => {
                    if (augustPosteringer && augustPosteringer.length > 0) {
                        setValgtMåned("august");
                        setPosteringerDetaljer(augustPosteringer);
                    }
                }}>
                    <p>Aug</p>
                    <p className={Styles.økonomiDetaljerTjent}>{tjentAugust.toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0  })}</p>
                    <p className={Styles.økonomiDetaljerUdlagt}>{udlagtAugust.toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0  })}</p>
                    <p>{(tjentAugust + udlagtAugust).toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0  })}</p>
                </div>
                <div className={`${Styles.måned} ${Styles.uligeMåned} ${septemberPosteringer && septemberPosteringer.length > 0 ? Styles.mobilPosteringIndikator : null}`} onClick={() => {
                    if (septemberPosteringer && septemberPosteringer.length > 0) {
                        setValgtMåned("september");
                        setPosteringerDetaljer(septemberPosteringer);
                    }
                }}>
                    <p>Sep</p>
                    <p className={Styles.økonomiDetaljerTjent}>{tjentSeptember.toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0  })}</p>
                    <p className={Styles.økonomiDetaljerUdlagt}>{udlagtSeptember.toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0  })}</p>
                    <p>{(tjentSeptember + udlagtSeptember).toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0  })}</p>
                </div>
                <div className={`${Styles.måned} ${Styles.ligeMåned} ${oktoberPosteringer && oktoberPosteringer.length > 0 ? Styles.mobilPosteringIndikator : null}`} onClick={() => {
                    if (oktoberPosteringer && oktoberPosteringer.length > 0) {
                        setValgtMåned("oktober");
                        setPosteringerDetaljer(oktoberPosteringer);
                    }
                }}>
                    <p>Okt</p>
                    <p className={Styles.økonomiDetaljerTjent}>{tjentOktober.toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0  })}</p>
                    <p className={Styles.økonomiDetaljerUdlagt}>{udlagtOktober.toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0  })}</p>
                    <p>{(tjentOktober + udlagtOktober).toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0  })}</p>
                </div>
                <div className={`${Styles.måned} ${Styles.uligeMåned} ${novemberPosteringer && novemberPosteringer.length > 0 ? Styles.mobilPosteringIndikator : null}`} onClick={() => {
                    if (novemberPosteringer && novemberPosteringer.length > 0) {
                        setValgtMåned("november");
                        setPosteringerDetaljer(novemberPosteringer);
                    }
                }}>
                    <p>Nov</p>
                    <p className={Styles.økonomiDetaljerTjent}>{tjentNovember.toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0  })}</p>
                    <p className={Styles.økonomiDetaljerUdlagt}>{udlagtNovember.toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0  })}</p>
                    <p>{(tjentNovember + udlagtNovember).toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0  })}</p>
                </div>
                <div className={`${Styles.måned} ${Styles.ligeMåned} ${decemberPosteringer && decemberPosteringer.length > 0 ? Styles.mobilPosteringIndikator : null}`} onClick={() => {
                    if (decemberPosteringer && decemberPosteringer.length > 0) {
                        setValgtMåned("december");
                        setPosteringerDetaljer(decemberPosteringer);
                    }
                }}>
                    <p>Dec</p>
                    <p className={Styles.økonomiDetaljerTjent}>{tjentDecember.toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0  })}</p>
                    <p className={Styles.økonomiDetaljerUdlagt}>{udlagtDecember.toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0  })}</p>
                    <p>{(tjentDecember + udlagtDecember).toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0  })}</p>
                </div>
                <div className={`${Styles.totalRække}`}>
                    <b>I alt</b>
                    <b>{tjentDecember.toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</b>
                    <b>{udlagtDecember.toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0  })}</b>
                    <b>{(tjentDecember + udlagtDecember).toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0  })}</b>
                </div>
            </div>
        </PageAnimation>
        :
        <>
        <PageAnimation>
            <div className={Styles.modalHeaderContainer}>
                <img className={Styles.backIcon} src={BackIcon} alt="Tilbage" onClick={() => setPosteringerDetaljer([])}/>
                <h2 className={ModalStyles.modalHeading}>Dine posteringer for {valgtMåned + " " + år}</h2>
            </div>
            <div className={Styles.posteringDetaljerDesktop}>
                <div style={{borderTopLeftRadius: '10px', borderTopRightRadius: '10px', gridTemplateColumns: '1fr 1fr 1fr 1fr'}} className={Styles.månedHeadings}>
                    <div>
                        <b>Måned</b>
                    </div>
                    <div>
                        <b>Optjent</b>
                    </div>
                    <div>
                        <b>Udlæg</b>
                    </div>
                    <div>
                        <b>Udbetaling</b>
                    </div>
                </div>
                <div style={{borderBottomLeftRadius: '10px', borderBottomRightRadius: '10px', marginBottom: '20px', gridTemplateColumns: '1fr 1fr 1fr 1fr'}} className={`${Styles.måned} ${Styles.ligeMåned}`}>
                    <p>{valgtMåned}</p>
                    <p className={Styles.økonomiDetaljerTjent}>{beregnTjent(posteringerDetaljer).toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p>
                    <p className={Styles.økonomiDetaljerUdlagt}>{beregnUdlagt(posteringerDetaljer).toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p>
                    <p>{(beregnTjent(posteringerDetaljer)+beregnUdlagt(posteringerDetaljer)).toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p>
                </div>
            </div>
            <div className={Styles.posteringDetaljerMobile}>
                <div style={{borderTopLeftRadius: '10px', borderTopRightRadius: '10px', gridTemplateColumns: '1fr 1fr 1fr 1fr'}} className={Styles.månedHeadings}>
                    <div>
                        <b>Md.</b>
                    </div>
                    <div>
                        <b>Tjent</b>
                    </div>
                    <div>
                        <b>Udlæg</b>
                    </div>
                    <div>
                        <b>Honorar</b>
                    </div>
                </div>
                <div style={{borderBottomLeftRadius: '10px', borderBottomRightRadius: '10px', marginBottom: '20px', gridTemplateColumns: '1fr 1fr 1fr 1fr'}} className={`${Styles.måned} ${Styles.ligeMåned}`}>
                    <p>{valgtMåned.slice(0, 3)}</p>
                    <p className={Styles.økonomiDetaljerTjent}>{beregnTjent(posteringerDetaljer).toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                    <p className={Styles.økonomiDetaljerUdlagt}>{beregnUdlagt(posteringerDetaljer).toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                    <p>{(beregnTjent(posteringerDetaljer)+beregnUdlagt(posteringerDetaljer)).toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                </div>
            </div>
            <p className={Styles.modalText}>Posteringsgrundlag for {valgtMåned + " " + år}:</p>
            <div className={Styles.posteringerDiv}>
            {posteringerDetaljer && posteringerDetaljer.map((postering) => {
                return (
                    <div className={ÅbenOpgaveCSS.posteringDiv} key={postering._id}>
                        <div className={ÅbenOpgaveCSS.posteringCard}>

                            <div>
                                <p className={ÅbenOpgaveCSS.posteringDato}>{postering.dato && postering.dato.slice(0,10)}</p>
                                <p className={ÅbenOpgaveCSS.posteringBruger}>{postering.opgaveID && getOpgaveAdresse(postering.opgaveID)}</p>
                                <i className={ÅbenOpgaveCSS.posteringBeskrivelse}>{postering.beskrivelse ? postering.beskrivelse : "Ingen beskrivelse."}</i>
                                <div className={ÅbenOpgaveCSS.kvitteringBillederListe}>
                                    {postering.udlæg.map((udlæg, index) => {
                                        return udlæg.kvittering ? 
                                        <img 
                                        key={`udlæg-${index}`}
                                        className={ÅbenOpgaveCSS.kvitteringBillede} 
                                        src={udlæg.kvittering} 
                                        alt={udlæg.beskrivelse} 
                                        onClick={() => {
                                            setKvitteringBillede(udlæg.kvittering);
                                        }}/> 
                                        : 
                                        null;
                                    })}
                                </div>
                            </div>
                            <div className={ÅbenOpgaveCSS.posteringListe}>
                                {postering.opstart > 0 && postering.dynamiskHonorarBeregning && (
                                    <div className={ÅbenOpgaveCSS.posteringRække}>
                                        <span className={ÅbenOpgaveCSS.posteringRækkeBeskrivelse}>Opstart </span>
                                        <span>{(postering.opstart * postering.satser.opstartsgebyrHonorar).toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                                    </div>
                                )}
                                {postering.handymanTimer > 0 && postering.dynamiskHonorarBeregning && (
                                    <div className={ÅbenOpgaveCSS.posteringRække}>
                                        <span className={ÅbenOpgaveCSS.posteringRækkeBeskrivelse}>{postering.handymanTimer || 0} timer (handyman) </span>
                                        <span>{(postering.handymanTimer * postering.satser.handymanTimerHonorar).toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                                    </div>
                                )}
                                {postering.tømrerTimer > 0 && postering.dynamiskHonorarBeregning && (
                                    <div className={ÅbenOpgaveCSS.posteringRække}>
                                        <span className={ÅbenOpgaveCSS.posteringRækkeBeskrivelse}>{postering.tømrerTimer || 0} timer (tømrer) </span>
                                        <span>{(postering.tømrerTimer * postering.satser.tømrerTimerHonorar).toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                                    </div>
                                )}
                                {postering.rådgivningOpmålingVejledning > 0 && postering.dynamiskHonorarBeregning && (
                                    <div className={ÅbenOpgaveCSS.posteringRække}>
                                        <span className={ÅbenOpgaveCSS.posteringRækkeBeskrivelse}>{postering.rådgivningOpmålingVejledning || 0} timer (rådgivning) </span>
                                        <span>{(postering.rådgivningOpmålingVejledning * postering.satser.rådgivningOpmålingVejledningHonorar).toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                                    </div>
                                )}
                                {postering.aftenTillæg && postering.dynamiskHonorarBeregning && (
                                    <div className={ÅbenOpgaveCSS.posteringRække}>
                                        <span className={ÅbenOpgaveCSS.posteringRækkeBeskrivelse}>Aftentillæg (+50% pr. time) </span>
                                        <span>{(((postering.handymanTimer * postering.satser.handymanTimerHonorar) + (postering.tømrerTimer * postering.satser.tømrerTimerHonorar) + (postering.rådgivningOpmålingVejledning * postering.satser.rådgivningOpmålingVejledningHonorar)) * (postering.satser.aftenTillægHonorar / 100)).toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                                    </div>
                                )}
                                {postering.natTillæg && postering.dynamiskHonorarBeregning && (
                                    <div className={ÅbenOpgaveCSS.posteringRække}>
                                        <span className={ÅbenOpgaveCSS.posteringRækkeBeskrivelse}>Nattillæg (+ 100% pr. time) </span>
                                        <span>{(((postering.handymanTimer * postering.satser.handymanTimerHonorar) + (postering.tømrerTimer * postering.satser.tømrerTimerHonorar) + (postering.rådgivningOpmålingVejledning * postering.satser.rådgivningOpmålingVejledningHonorar)) * (postering.satser.natTillægHonorar / 100)).toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                                    </div>
                                )}
                                {postering.trailer && postering.dynamiskHonorarBeregning && (
                                    <div className={ÅbenOpgaveCSS.posteringRække}>
                                        <span className={ÅbenOpgaveCSS.posteringRækkeBeskrivelse}>Trailer </span>
                                        <span>{(postering.satser.trailerHonorar).toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                                    </div>
                                )}
                                {postering.udlæg.length > 0 && postering.dynamiskHonorarBeregning && (
                                    <div className={ÅbenOpgaveCSS.posteringRække}>
                                        <span className={ÅbenOpgaveCSS.posteringRækkeBeskrivelse}>{postering.udlæg.length > 0 ? postering.udlæg.length : 0} udlæg </span>
                                        <span>{(postering.udlæg.reduce((sum, item) => sum + Number(item.beløb), 0)).toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                                    </div>
                                )}
                                {postering.rabatProcent > 0 && postering.dynamiskHonorarBeregning && (
                                    <div className={ÅbenOpgaveCSS.posteringRække}>
                                        <span className={ÅbenOpgaveCSS.posteringRækkeBeskrivelse}>{postering.rabatProcent}% rabat</span>
                                        <span>- {(((postering.totalHonorar - postering.udlæg.reduce((sum, item) => sum + Number(item.beløb), 0)) / (100 - postering.rabatProcent) * 100) * (postering.rabatProcent/100)).toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                                    </div>
                                )}
                                {!postering.dynamiskHonorarBeregning && (
                                    <div className={ÅbenOpgaveCSS.posteringRække}>
                                        <span className={ÅbenOpgaveCSS.posteringRækkeBeskrivelse}>Fast honorar: </span>
                                        <span>{postering.fastHonorar.toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                                    </div>
                                )}
                                <div className={ÅbenOpgaveCSS.totalRække}>
                                    <b className={ÅbenOpgaveCSS.totalRækkeBeskrivelse}>Total: </b>
                                    <b className={ÅbenOpgaveCSS.totalRækkeResultat}>{(postering.totalHonorar).toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</b>
                                </div>
                            </div>
                        </div>
                        <p style={{display: 'flex', marginTop: 10, justifyContent: 'center', cursor: 'pointer'}} className={ÅbenOpgaveCSS.prefix} onClick={() => {
                        navigate(`/opgave/${postering.opgaveID}`)
                    }}>Gå til opgave</p>
                    </div>
                );})}
            </div>
        </PageAnimation>
        </>}
    </Modal>
  )
}

export default ØkonomiOverblikModal