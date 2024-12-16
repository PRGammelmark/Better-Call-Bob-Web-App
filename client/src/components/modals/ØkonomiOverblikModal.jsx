import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Modal from '../Modal.jsx'
import Styles from './ØkonomiOverblikModal.module.css'
import ModalStyles from '../Modal.module.css'
import dayjs from 'dayjs'
import PageAnimation from '../PageAnimation'
import BackIcon from "../../assets/back.svg"
import ÅbenOpgaveCSS from '../../pages/ÅbenOpgave.module.css'
import Paperclip from "../../assets/paperclip.svg"
import { handymanTimerHonorar, tømrerTimerHonorar, opstartsgebyrHonorar } from '../../variables'
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
    
    const getBrugerName = (brugerID) => {
        const bruger = brugere && brugere.find(user => user._id === brugerID);
        return bruger ? bruger.navn : 'Unknown User';
    };

    const getOpgaveAdresse = (opgaveID) => {
        const opgave = opgaver && opgaver.find(opgave => opgave._id === opgaveID);
        return opgave ? opgave.adresse : 'Adresse utilgængelig';
    };
    
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
            <div className={Styles.måneder}>
                <div className={Styles.månedHeadings}>
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
        </PageAnimation>
        :
        <>
        <PageAnimation>
            <div className={Styles.modalHeaderContainer}>
                <img className={Styles.backIcon} src={BackIcon} alt="Tilbage" onClick={() => setPosteringerDetaljer([])}/>
                <h2 className={ModalStyles.modalHeading}>Dine posteringer for {valgtMåned + " " + år}</h2>
            </div>
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
            <p className={Styles.modalText}>Posteringsgrundlag for {valgtMåned + " " + år}:</p>
            <div className={Styles.posteringerDiv}>
                {posteringerDetaljer.map((postering, index) => (
                    <div className={ÅbenOpgaveCSS.posteringDiv} key={postering._id}>
                    <div className={ÅbenOpgaveCSS.posteringCard}>
                        <div>
                            <p className={ÅbenOpgaveCSS.posteringDato}>{postering.dato ? dayjs(postering.dato).format('DD. MMM YYYY') : "Ingen dato valgt"} – for opgave på</p>
                            <p className={ÅbenOpgaveCSS.posteringBruger}>{postering.opgaveID && getOpgaveAdresse(postering.opgaveID)}</p>
                            <i className={ÅbenOpgaveCSS.posteringBeskrivelse}>{postering.beskrivelse ? postering.beskrivelse : "Ingen beskrivelse."}</i>
                            <div className={ÅbenOpgaveCSS.kvitteringBillederListe}>
                                {postering.udlæg.map((udlæg, index) => {
                                    return udlæg.kvittering ? 
                                    <img 
                                    key={`udlæg-${index}`}
                                    className={ÅbenOpgaveCSS.kvitteringBillede} 
                                    src={`${import.meta.env.VITE_API_URL}${udlæg.kvittering}`} 
                                    alt={udlæg.beskrivelse} 
                                    onClick={() => {
                                        setKvitteringBillede(udlæg.kvittering);
                                    }}/> 
                                    : 
                                    null;
                                })}
                                {postering.øvrigt.map((øvrigt, index) => {
                                    return øvrigt.kvittering ? 
                                    <img 
                                    key={`øvrigt-${index}`}
                                    className={ÅbenOpgaveCSS.kvitteringBillede} 
                                    src={`${import.meta.env.VITE_API_URL}${øvrigt.kvittering}`} 
                                    alt={øvrigt.beskrivelse} 
                                    onClick={() => {
                                        setKvitteringBillede(øvrigt.kvittering);
                                    }}/> 
                                    : 
                                    null;
                                })}
                            </div>
                        </div>
                        <div className={ÅbenOpgaveCSS.posteringListe}>
                            <div className={ÅbenOpgaveCSS.posteringRække}>
                                <span className={ÅbenOpgaveCSS.posteringRækkeBeskrivelse}>Opstart: </span>
                                <span>{(postering.opstart ? postering.opstart : "0") + " kr."}</span>
                            </div>
                            <div className={ÅbenOpgaveCSS.posteringRække}>
                                <span className={ÅbenOpgaveCSS.posteringRækkeBeskrivelse}>{postering.handymanTimer > 0 ? postering.handymanTimer : 0} timer (handyman): </span>
                                <span>{(postering.handymanTimer * 300) + " kr."}</span>
                            </div>
                            <div className={ÅbenOpgaveCSS.posteringRække}>
                                <span className={ÅbenOpgaveCSS.posteringRækkeBeskrivelse}>{postering.tømrerTimer ? postering.tømrerTimer : 0} timer (tømrer): </span>
                                <span>{(postering.tømrerTimer * 360) + " kr."}</span>
                            </div>
                            <div className={ÅbenOpgaveCSS.posteringRække}>
                                <span className={ÅbenOpgaveCSS.posteringRækkeBeskrivelse}>{postering.udlæg.length > 0 ? postering.udlæg.length : 0} udlæg: </span>
                                <span>{postering.udlæg.reduce((sum, item) => sum + Number(item.beløb), 0) + " kr."}</span>
                            </div>
                            <div className={ÅbenOpgaveCSS.posteringRække}>
                                <span className={ÅbenOpgaveCSS.posteringRækkeBeskrivelse}>{postering.øvrigt.length > 0 ? postering.øvrigt.length : 0} øvrigt: </span>
                                <span>{postering.øvrigt.reduce((sum, item) => sum + Number(item.beløb), 0) + " kr."}</span>
                            </div>
                            <div className={ÅbenOpgaveCSS.totalRække}>
                                <b className={ÅbenOpgaveCSS.totalRækkeBeskrivelse}>Total: </b>
                                <b className={ÅbenOpgaveCSS.totalRækkeResultat}>{postering.total + " kr."}</b>
                            </div>
                        </div>
                    </div>
                    <p style={{display: 'flex', marginTop: 10, justifyContent: 'center', cursor: 'pointer'}} className={ÅbenOpgaveCSS.prefix} onClick={() => {
                        navigate(`/opgave/${postering.opgaveID}`)
                    }}>Gå til opgave</p>
                    </div>
                ))}
            </div>
        </PageAnimation>
        </>}
    </Modal>
  )
}

export default ØkonomiOverblikModal