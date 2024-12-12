import React, { useState, useEffect } from 'react'
import Modal from '../Modal.jsx'
import Styles from './ØkonomiOverblikModal.module.css'
import ModalStyles from '../Modal.module.css'
import dayjs from 'dayjs'
import { handymanTimerHonorar, tømrerTimerHonorar, opstartsgebyrHonorar } from '../../variables'

const ØkonomiOverblikModal = (props) => {

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
    const [posteringerDetaljer, setPosteringerDetaljer] = useState([])

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
                <p>{tjentJanuar.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p>
                <p>{udlagtJanuar.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p>
                <b>{(tjentJanuar + udlagtJanuar).toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</b>
                {januarPosteringer && januarPosteringer.length > 0 ? <button onClick={() => setPosteringerDetaljer(januarPosteringer)}>Posteringer</button> : <span style={{color: '#222222'}}>–</span>}
            </div>
            <div className={`${Styles.måned} ${Styles.ligeMåned}`}>
                <p>Februar</p>
                <p>{tjentFebruar.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p>
                <p>{udlagtFebruar.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p>
                <b>{(tjentFebruar + udlagtFebruar).toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</b>
                {februarPosteringer && februarPosteringer.length > 0 ? <button onClick={() => setPosteringerDetaljer(februarPosteringer)}>Posteringer</button> : <span style={{color: '#222222'}}>–</span>}
            </div>
            <div className={`${Styles.måned} ${Styles.uligeMåned}`}>
                <p>Marts</p>
                <p>{tjentMarts.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p>
                <p>{udlagtMarts.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p>
                <b>{(tjentMarts + udlagtMarts).toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</b>
                {martsPosteringer && martsPosteringer.length > 0 ? <button onClick={() => setPosteringerDetaljer(martsPosteringer)}>Posteringer</button> : <span style={{color: '#222222'}}>–</span>}
            </div>
            <div className={`${Styles.måned} ${Styles.ligeMåned}`}>
                <p>April</p>
                <p>{tjentApril.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p>
                <p>{udlagtApril.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p>
                <b>{(tjentApril + udlagtApril).toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</b>
                {aprilPosteringer && aprilPosteringer.length > 0 ? <button onClick={() => setPosteringerDetaljer(aprilPosteringer)}>Posteringer</button> : <span style={{color: '#222222'}}>–</span>}
            </div>
            <div className={`${Styles.måned} ${Styles.uligeMåned}`}>
                <p>Maj</p>
                <p>{tjentMaj.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p>
                <p>{udlagtMaj.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p>
                <b>{(tjentMaj + udlagtMaj).toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</b>
                {majPosteringer && majPosteringer.length > 0 ? <button onClick={() => setPosteringerDetaljer(majPosteringer)}>Posteringer</button> : <span style={{color: '#222222'}}>–</span>}
            </div>
            <div className={`${Styles.måned} ${Styles.ligeMåned}`}>
                <p>Juni</p>
                <p>{tjentJuni.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p>
                <p>{udlagtJuni.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p>
                <b>{(tjentJuni + udlagtJuni).toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</b>
                {juniPosteringer && juniPosteringer.length > 0 ? <button onClick={() => setPosteringerDetaljer(juniPosteringer)}>Posteringer</button> : <span style={{color: '#222222'}}>–</span>}
            </div>
            <div className={`${Styles.måned} ${Styles.uligeMåned}`}>
                <p>Juli</p>
                <p>{tjentJuli.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p>
                <p>{udlagtJuli.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p>
                <b>{(tjentJuli + udlagtJuli).toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</b>
                {juliPosteringer && juliPosteringer.length > 0 ? <button onClick={() => setPosteringerDetaljer(juliPosteringer)}>Posteringer</button> : <span style={{color: '#222222'}}>–</span>}
            </div>
            <div className={`${Styles.måned} ${Styles.ligeMåned}`}>
                <p>August</p>
                <p>{tjentAugust.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p>
                <p>{udlagtAugust.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p>
                <b>{(tjentAugust + udlagtAugust).toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</b>
                {augustPosteringer && augustPosteringer.length > 0 ? <button onClick={() => setPosteringerDetaljer(augustPosteringer)}>Posteringer</button> : <span style={{color: '#222222'}}>–</span>}
            </div>
            <div className={`${Styles.måned} ${Styles.uligeMåned}`}>
                <p>September</p>
                <p>{tjentSeptember.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p>
                <p>{udlagtSeptember.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p>
                <b>{(tjentSeptember + udlagtSeptember).toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</b>
                {septemberPosteringer && septemberPosteringer.length > 0 ? <button onClick={() => setPosteringerDetaljer(septemberPosteringer)}>Posteringer</button> : <span style={{color: '#222222'}}>–</span>}
            </div>
            <div className={`${Styles.måned} ${Styles.ligeMåned}`}>
                <p>Oktober</p>
                <p>{tjentOktober.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p>
                <p>{udlagtOktober.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p>
                <b>{(tjentOktober + udlagtOktober).toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</b>
                {oktoberPosteringer && oktoberPosteringer.length > 0 ? <button onClick={() => setPosteringerDetaljer(oktoberPosteringer)}>Posteringer</button> : <span style={{color: '#222222'}}>–</span>}
            </div>
            <div className={`${Styles.måned} ${Styles.uligeMåned}`}>
                <p>November</p>
                <p>{tjentNovember.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p>
                <p>{udlagtNovember.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p>
                <b>{(tjentNovember + udlagtNovember).toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</b>
                {novemberPosteringer && novemberPosteringer.length > 0 ? <button onClick={() => setPosteringerDetaljer(novemberPosteringer)}>Posteringer</button> : <span style={{color: '#222222'}}>–</span>}
            </div>
            <div className={`${Styles.måned} ${Styles.ligeMåned}`}>
                <p>December</p>
                <p>{tjentDecember.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p>
                <p>{udlagtDecember.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p>
                <b>{(tjentDecember + udlagtDecember).toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</b>
                {decemberPosteringer && decemberPosteringer.length > 0 ? <button onClick={() => setPosteringerDetaljer(decemberPosteringer)}>Posteringer</button> : <span style={{color: '#222222'}}>–</span>}
            </div>
            <div className={`${Styles.totalRække}`}>
                <p>I alt, {år}</p>
                <p>{tjentDecember.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p>
                <p>{udlagtDecember.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p>
                <b>{(tjentDecember + udlagtDecember).toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</b>
                {decemberPosteringer && decemberPosteringer.length > 0 ? <button onClick={() => setPosteringerDetaljer(decemberPosteringer)}>Posteringer</button> : <span style={{color: '#222222'}}>–</span>}
            </div>
        </div>
    </Modal>
  )
}

export default ØkonomiOverblikModal