import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Modal from '../Modal.jsx'
import Styles from './ØkonomiOverblikModal.module.css'
import ModalStyles from '../Modal.module.css'
import dayjs from 'dayjs'
import PageAnimation from '../PageAnimation'
import BackIcon from "../../assets/back.svg"
// import PosteringCSS from '../../pages/ÅbenOpgave.module.css'
import PosteringCSS from '../../components/Postering.module.css'
import satser from '../../variables'
import BackArrow from '../../assets/back.svg'
import axios from 'axios'
import * as beregn from '../../utils/beregninger.js'

const ØkonomiOverblikModal = (props) => {

    const navigate = useNavigate()
    const [år, setÅr] = useState(dayjs().year())
    const [tjentJanuar, setTjentJanuar] = useState(0)
    const [udlagtJanuar, setUdlagtJanuar] = useState(0)
    const [udbetalingJanuar, setUdbetalingJanuar] = useState(0)
    const [tjentFebruar, setTjentFebruar] = useState(0)
    const [udlagtFebruar, setUdlagtFebruar] = useState(0)
    const [udbetalingFebruar, setUdbetalingFebruar] = useState(0)
    const [tjentMarts, setTjentMarts] = useState(0)
    const [udlagtMarts, setUdlagtMarts] = useState(0)
    const [udbetalingMarts, setUdbetalingMarts] = useState(0)
    const [tjentApril, setTjentApril] = useState(0)
    const [udlagtApril, setUdlagtApril] = useState(0)
    const [udbetalingApril, setUdbetalingApril] = useState(0)
    const [tjentMaj, setTjentMaj] = useState(0)
    const [udlagtMaj, setUdlagtMaj] = useState(0)
    const [udbetalingMaj, setUdbetalingMaj] = useState(0)
    const [tjentJuni, setTjentJuni] = useState(0)
    const [udlagtJuni, setUdlagtJuni] = useState(0)
    const [udbetalingJuni, setUdbetalingJuni] = useState(0)
    const [tjentJuli, setTjentJuli] = useState(0)
    const [udlagtJuli, setUdlagtJuli] = useState(0)
    const [udbetalingJuli, setUdbetalingJuli] = useState(0)
    const [tjentAugust, setTjentAugust] = useState(0)
    const [udlagtAugust, setUdlagtAugust] = useState(0)
    const [udbetalingAugust, setUdbetalingAugust] = useState(0)
    const [tjentSeptember, setTjentSeptember] = useState(0)
    const [udlagtSeptember, setUdlagtSeptember] = useState(0)
    const [udbetalingSeptember, setUdbetalingSeptember] = useState(0)
    const [tjentOktober, setTjentOktober] = useState(0)
    const [udlagtOktober, setUdlagtOktober] = useState(0)
    const [udbetalingOktober, setUdbetalingOktober] = useState(0)
    const [tjentNovember, setTjentNovember] = useState(0)
    const [udlagtNovember, setUdlagtNovember] = useState(0)
    const [udbetalingNovember, setUdbetalingNovember] = useState(0)
    const [tjentDecember, setTjentDecember] = useState(0)
    const [udlagtDecember, setUdlagtDecember] = useState(0)
    const [udbetalingDecember, setUdbetalingDecember] = useState(0)
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
    const [åretsPosteringer, setÅretsPosteringer] = useState([])
    const [valgtMåned, setValgtMåned] = useState(null)
    const [posteringerDetaljer, setPosteringerDetaljer] = useState([])
    const [brugere, setBrugere] = useState([])
    const [opgaver, setOpgaver] = useState([])
    const [kunder, setKunder] = useState([])
    const [kvitteringBillede, setKvitteringBillede] = useState(null)
    
    const user = props.user
    const posteringer = props.posteringer;
    
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

    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API_URL}/kunder`, {
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        })
        .then(res => {
            setKunder(res.data);
        })
        .catch(error => console.log(error))
    }, [])

    const getOpgaveAdresse = (opgaveID) => {
        const opgave = opgaver && opgaver?.find(opgave => opgave._id === opgaveID);
        const kunde = kunder && kunder?.find(kunde => kunde._id === opgave.kundeID);
        return kunde?.adresse || 'Adresse utilgængelig';
    };

    function grupperPoster(posteringer, antalKey, satsKey) {
        const grupperet = {};
    
        posteringer.forEach(postering => {
            if(postering.dynamiskHonorarBeregning){
                const sats = postering.satser[satsKey];
                if (!grupperet[sats]) {
                    grupperet[sats] = 0;
                }
                grupperet[sats] += postering[antalKey];
            }
        });
    
        return Object.entries(grupperet).map(([sats, antal]) => ({
            sats: parseFloat(sats),
            antal,
            total: antal * parseFloat(sats)
        }));
    }

    function grupperTillæg(posteringer, tillægKey, tillægHonorarKey, baseHonorarKey, timerKey) {
        const grupperet = {};
    
        posteringer.forEach(postering => {
            if(postering.dynamiskHonorarBeregning){
                if (!postering[tillægKey]) return; // Skip if tillæg is not applied
                

                const tillægProcent = postering.satser[tillægHonorarKey] / 100; // Convert % to decimal
                const baseSats = postering.satser[baseHonorarKey]; // Base rate (handyman/tømrer/etc.)
                const ekstraHonorar = baseSats * tillægProcent; // Extra pay per hour
                const timer = postering[timerKey]; // Hours worked
                const totalEkstra = ekstraHonorar * timer; // Total extra pay
        
                if (!grupperet[ekstraHonorar]) {
                    grupperet[ekstraHonorar] = { total: 0, antal: 0 };
                }
        
                grupperet[ekstraHonorar].total += totalEkstra;
                grupperet[ekstraHonorar].antal += timer; // Accumulate total hours
            }
        });
    
        return Object.entries(grupperet).map(([sats, data]) => ({
            sats: parseFloat(sats),
            total: data.total,
            antal: data.antal // Total hours worked
        }));
    }  


    // function beregnAntalOpstart(posteringer){
    //     const månedensOpstartsgebyrer = posteringer.reduce((sum, postering) => sum + postering.opstart, 0)
    //     return månedensOpstartsgebyrer
    // }

    // function beregnSatsOpstart(posteringer){
    //     const antalOpstartsgebyrer = posteringer.reduce((sum, postering) => sum + postering.opstart, 0)
    //     const akkumuleredeSatser = posteringer.reduce((sum, postering) => sum + postering.satser.opstartsgebyrHonorar, 0)
    //     const gennemsnitligSats = antalOpstartsgebyrer === 0 ? akkumuleredeSatser : akkumuleredeSatser / antalOpstartsgebyrer
    //     return gennemsnitligSats
    // }
    
    // function beregnTjent(posteringer) {
    //     const månedensOpstartsgebyrer = posteringer.reduce((sum, postering) => sum + postering.opstart * postering.satser.opstartsgebyrHonorar, 0)
    //     const månedensHandymantimer = posteringer.reduce((sum, postering) => sum + postering.handymanTimer * postering.satser.handymanTimerHonorar, 0)
    //     const månedensTømrertimer = posteringer.reduce((sum, postering) => sum + postering.tømrerTimer * postering.satser.tømrerTimerHonorar, 0)
    //     const månedensRådgivningOpmålingVejledning = posteringer.reduce((sum, postering) => sum + postering.rådgivningOpmålingVejledning * postering.satser.rådgivningOpmålingVejledningHonorar, 0)
    //     const månedensAftenTillæg = posteringer.reduce((sum, postering) => sum + (postering.aftenTillæg ? (((postering.handymanTimer * postering.satser.handymanTimerHonorar) + (postering.tømrerTimer * postering.satser.tømrerTimerHonorar) + (postering.rådgivningOpmålingVejledning * postering.satser.rådgivningOpmålingVejledningHonorar)) * (postering.satser.aftenTillægHonorar / 100)) : 0), 0)
    //     const månedensNatTillæg = posteringer.reduce((sum, postering) => sum + (postering.natTillæg ? (((postering.handymanTimer * postering.satser.handymanTimerHonorar) + (postering.tømrerTimer * postering.satser.tømrerTimerHonorar) + (postering.rådgivningOpmålingVejledning * postering.satser.rådgivningOpmålingVejledningHonorar)) * (postering.satser.natTillægHonorar / 100)) : 0), 0)
    //     const månedensTrailer = posteringer.reduce((sum, postering) => sum + (postering.trailer ? postering.satser.trailerHonorar : 0), 0)
    //     const tjentFørRabat = månedensOpstartsgebyrer + månedensHandymantimer + månedensTømrertimer + månedensRådgivningOpmålingVejledning + månedensAftenTillæg + månedensNatTillæg + månedensTrailer;
    //     const månedensRabat = posteringer.reduce((sum, postering) => sum + (postering.rabatProcent > 0 ? ((postering.rabatProcent / 100) * (postering.opstart * postering.satser.opstartsgebyrHonorar + postering.handymanTimer * postering.satser.handymanTimerHonorar + postering.tømrerTimer * postering.satser.tømrerTimerHonorar + postering.rådgivningOpmålingVejledning * postering.satser.rådgivningOpmålingVejledningHonorar + (postering.aftenTillæg ? (((postering.handymanTimer * postering.satser.handymanTimerHonorar) + (postering.tømrerTimer * postering.satser.tømrerTimerHonorar) + (postering.rådgivningOpmålingVejledning * postering.satser.rådgivningOpmålingVejledningHonorar)) * (postering.satser.aftenTillægHonorar / 100)) : 0) + (postering.natTillæg ? (((postering.handymanTimer * postering.satser.handymanTimerHonorar) + (postering.tømrerTimer * postering.satser.tømrerTimerHonorar) + (postering.rådgivningOpmålingVejledning * postering.satser.rådgivningOpmålingVejledningHonorar)) * (postering.satser.natTillægHonorar / 100)) : 0) + (postering.trailer ? postering.satser.trailerHonorar : 0))) : 0), 0)
    //     return tjentFørRabat - månedensRabat;
    // }

    function beregnTjent(posteringer) {
        if(!posteringer) return 0
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

    function beregnRabat(posteringer){
        const månedensRabat = posteringer.reduce((sum, postering) => sum + (postering.rabatProcent > 0 ? ((postering.rabatProcent / 100) * (postering.opstart * postering.satser.opstartsgebyrHonorar + postering.handymanTimer * postering.satser.handymanTimerHonorar + postering.tømrerTimer * postering.satser.tømrerTimerHonorar + postering.rådgivningOpmålingVejledning * postering.satser.rådgivningOpmålingVejledningHonorar + (postering.aftenTillæg ? (((postering.handymanTimer * postering.satser.handymanTimerHonorar) + (postering.tømrerTimer * postering.satser.tømrerTimerHonorar) + (postering.rådgivningOpmålingVejledning * postering.satser.rådgivningOpmålingVejledningHonorar)) * (postering.satser.aftenTillægHonorar / 100)) : 0) + (postering.natTillæg ? (((postering.handymanTimer * postering.satser.handymanTimerHonorar) + (postering.tømrerTimer * postering.satser.tømrerTimerHonorar) + (postering.rådgivningOpmålingVejledning * postering.satser.rådgivningOpmålingVejledningHonorar)) * (postering.satser.natTillægHonorar / 100)) : 0) + (postering.trailer ? postering.satser.trailerHonorar : 0))) : 0), 0)
        return månedensRabat
    }

    function beregnUdlagt(posteringer) {
        const månedensUdlæg = posteringer.reduce((sum, postering) => {
            const udlægSum = postering.udlæg.reduce((udlægSum, udlægItem) => udlægSum + udlægItem.beløb, 0);
            return sum + udlægSum;
        }, 0);

        return månedensUdlæg;
    }

    function beregnFasteHonorarer(posteringer){
        const månedensFasteHonorarer = posteringer.reduce((sum, postering) => sum + (postering.dynamiskHonorarBeregning ? 0 : postering.fastHonorar), 0)
        return månedensFasteHonorarer
    }

    const opstartData = grupperPoster(posteringerDetaljer, "opstart", "opstartsgebyrHonorar")
    const handymanData = grupperPoster(posteringerDetaljer, "handymanTimer", "handymanTimerHonorar");
    const tømrerData = grupperPoster(posteringerDetaljer, "tømrerTimer", "tømrerTimerHonorar");
    const rådgivningData = grupperPoster(posteringerDetaljer, "rådgivningOpmålingVejledning", "rådgivningOpmålingVejledningHonorar");
    const trailerData = grupperPoster(posteringerDetaljer, "trailer", "trailerHonorar");
    const handymanAftenTillæg = grupperTillæg(posteringerDetaljer, "aftenTillæg", "aftenTillægHonorar", "handymanTimerHonorar", "handymanTimer");
    const handymanNatTillæg = grupperTillæg(posteringerDetaljer, "natTillæg", "natTillægHonorar", "handymanTimerHonorar", "handymanTimer");
    const tømrerAftenTillæg = grupperTillæg(posteringerDetaljer, "aftenTillæg", "aftenTillægHonorar", "tømrerTimerHonorar", "tømrerTimer");
    const tømrerNatTillæg = grupperTillæg(posteringerDetaljer, "natTillæg", "natTillægHonorar", "tømrerTimerHonorar", "tømrerTimer");
    const rådgivningAftenTillæg = grupperTillæg(posteringerDetaljer, "aftenTillæg", "aftenTillægHonorar", "rådgivningOpmålingVejledningHonorar", "rådgivningOpmålingVejledning");
    const rådgivningNatTillæg = grupperTillæg(posteringerDetaljer, "natTillæg", "natTillægHonorar", "rådgivningOpmålingVejledningHonorar", "rådgivningOpmålingVejledning");

    // let januarPosteringerX = []
    // let februarPosteringerX = []
    // let martsPosteringerX = []
    // let aprilPosteringerX = []
    // let majPosteringerX = []
    // let juniPosteringerX = []
    // let juliPosteringerX = []
    // let augustPosteringerX = []
    // let septemberPosteringerX = []
    // let oktoberPosteringerX = []
    // let novemberPosteringerX = []
    // let decemberPosteringerX = []  

    useEffect(() => {
        // januarPosteringerX = props.posteringer.filter(postering => dayjs(postering.createdAt).isAfter(dayjs(`${år-1}-12-20`).format('YYYY-MM-DD')) && dayjs(postering.createdAt).isBefore(dayjs(`${år}-01-19`).format('YYYY-MM-DD')))
        // februarPosteringerX = props.posteringer.filter(postering => dayjs(postering.createdAt).isAfter(dayjs(`${år}-01-20`).format('YYYY-MM-DD')) && dayjs(postering.createdAt).isBefore(dayjs(`${år}-02-19`).format('YYYY-MM-DD')))
        // martsPosteringerX = props.posteringer.filter(postering => dayjs(postering.createdAt).isAfter(dayjs(`${år}-02-20`).format('YYYY-MM-DD')) && dayjs(postering.createdAt).isBefore(dayjs(`${år}-03-19`).format('YYYY-MM-DD')))
        // aprilPosteringerX = props.posteringer.filter(postering => dayjs(postering.createdAt).isAfter(dayjs(`${år}-03-20`).format('YYYY-MM-DD')) && dayjs(postering.createdAt).isBefore(dayjs(`${år}-04-19`).format('YYYY-MM-DD')))
        // majPosteringerX = props.posteringer.filter(postering => dayjs(postering.createdAt).isAfter(dayjs(`${år}-04-20`).format('YYYY-MM-DD')) && dayjs(postering.createdAt).isBefore(dayjs(`${år}-05-19`).format('YYYY-MM-DD')))
        // juniPosteringerX = props.posteringer.filter(postering => dayjs(postering.createdAt).isAfter(dayjs(`${år}-05-20`).format('YYYY-MM-DD')) && dayjs(postering.createdAt).isBefore(dayjs(`${år}-06-19`).format('YYYY-MM-DD')))
        // juliPosteringerX = props.posteringer.filter(postering => dayjs(postering.createdAt).isAfter(dayjs(`${år}-06-20`).format('YYYY-MM-DD')) && dayjs(postering.createdAt).isBefore(dayjs(`${år}-07-19`).format('YYYY-MM-DD')))
        // augustPosteringerX = props.posteringer.filter(postering => dayjs(postering.createdAt).isAfter(dayjs(`${år}-07-20`).format('YYYY-MM-DD')) && dayjs(postering.createdAt).isBefore(dayjs(`${år}-08-19`).format('YYYY-MM-DD')))
        // septemberPosteringerX = props.posteringer.filter(postering => dayjs(postering.createdAt).isAfter(dayjs(`${år}-08-20`).format('YYYY-MM-DD')) && dayjs(postering.createdAt).isBefore(dayjs(`${år}-09-19`).format('YYYY-MM-DD')))
        // oktoberPosteringerX = props.posteringer.filter(postering => dayjs(postering.createdAt).isAfter(dayjs(`${år}-09-20`).format('YYYY-MM-DD')) && dayjs(postering.createdAt).isBefore(dayjs(`${år}-10-19`).format('YYYY-MM-DD')))
        // novemberPosteringerX = props.posteringer.filter(postering => dayjs(postering.createdAt).isAfter(dayjs(`${år}-10-20`).format('YYYY-MM-DD')) && dayjs(postering.createdAt).isBefore(dayjs(`${år}-11-19`).format('YYYY-MM-DD')))
        // decemberPosteringerX = props.posteringer.filter(postering => dayjs(postering.createdAt).isAfter(dayjs(`${år}-11-20`).format('YYYY-MM-DD')) && dayjs(postering.createdAt).isBefore(dayjs(`${år}-12-19`).format('YYYY-MM-DD')))

        const lavMånedsPosteringer = (år, posteringer) => {
            const månedNavne = [
              "januar", "februar", "marts", "april", "maj", "juni",
              "juli", "august", "september", "oktober", "november", "december"
            ]
          
            return månedNavne.map((navn, i) => {
              // i = 0 → januar, i = 11 → december
              const månedIndex = i + 1
          
              const start = dayjs(`${år}-${String(månedIndex).padStart(2, '0')}-20`).startOf('day')
              const end = start.add(1, 'month').date(19).endOf('day')
          
              const posteringerDenneMåned = posteringer.filter(p =>
                dayjs(p.createdAt).isSameOrAfter(start) &&
                dayjs(p.createdAt).isSameOrBefore(end)
              )
          
              return {
                navn,
                start,
                end,
                posteringer: posteringerDenneMåned
              }
            })
        }
          
        // brug:
        const m = lavMånedsPosteringer(år, props.posteringer)
          
        setJanuarPosteringer(m[0].posteringer)
        setFebruarPosteringer(m[1].posteringer)
        setMartsPosteringer(m[2].posteringer)
        setAprilPosteringer(m[3].posteringer)
        setMajPosteringer(m[4].posteringer)
        setJuniPosteringer(m[5].posteringer)
        setJuliPosteringer(m[6].posteringer)
        setAugustPosteringer(m[7].posteringer)
        setSeptemberPosteringer(m[8].posteringer)
        setOktoberPosteringer(m[9].posteringer)
        setNovemberPosteringer(m[10].posteringer)
        setDecemberPosteringer(m[11].posteringer)
        setÅretsPosteringer([
            ...m[0].posteringer,
            ...m[1].posteringer,
            ...m[2].posteringer,
            ...m[3].posteringer,
            ...m[4].posteringer,
            ...m[5].posteringer,
            ...m[6].posteringer,
            ...m[7].posteringer,
            ...m[8].posteringer,
            ...m[9].posteringer,
            ...m[10].posteringer,
            ...m[11].posteringer,
        ])

        setTjentJanuar(beregn.totalHonorar(m[0].posteringer)?.beløb - beregn.udlægHonorar(m[0].posteringer)?.beløb)
        setUdlagtJanuar(beregn.udlægHonorar(m[0].posteringer)?.beløb)
        setUdbetalingJanuar(beregn.totalHonorar(m[0].posteringer)?.beløb)
        setTjentFebruar(beregn.totalHonorar(m[1].posteringer)?.beløb - beregn.udlægHonorar(m[1].posteringer)?.beløb)
        setUdlagtFebruar(beregn.udlægHonorar(m[1].posteringer)?.beløb)
        setUdbetalingFebruar(beregn.totalHonorar(m[1].posteringer)?.beløb)
        setTjentMarts(beregn.totalHonorar(m[2].posteringer)?.beløb - beregn.udlægHonorar(m[2].posteringer)?.beløb)
        setUdlagtMarts(beregn.udlægHonorar(m[2].posteringer)?.beløb)
        setUdbetalingMarts(beregn.totalHonorar(m[2].posteringer)?.beløb)
        setTjentApril(beregn.totalHonorar(m[3].posteringer)?.beløb - beregn.udlægHonorar(m[3].posteringer)?.beløb)
        setUdlagtApril(beregn.udlægHonorar(m[3].posteringer)?.beløb)
        setUdbetalingApril(beregn.totalHonorar(m[3].posteringer)?.beløb)
        setTjentMaj(beregn.totalHonorar(m[4].posteringer)?.beløb - beregn.udlægHonorar(m[4].posteringer)?.beløb)
        setUdlagtMaj(beregn.udlægHonorar(m[4].posteringer)?.beløb)
        setUdbetalingMaj(beregn.totalHonorar(m[4].posteringer)?.beløb)
        setTjentJuni(beregn.totalHonorar(m[5].posteringer)?.beløb - beregn.udlægHonorar(m[5].posteringer)?.beløb)
        setUdlagtJuni(beregn.udlægHonorar(m[5].posteringer)?.beløb)
        setUdbetalingJuni(beregn.totalHonorar(m[5].posteringer)?.beløb)
        setTjentJuli(beregn.totalHonorar(m[6].posteringer)?.beløb - beregn.udlægHonorar(m[6].posteringer)?.beløb)
        setUdlagtJuli(beregn.udlægHonorar(m[6].posteringer)?.beløb)
        setUdbetalingJuli(beregn.totalHonorar(m[6].posteringer)?.beløb)
        setTjentAugust(beregn.totalHonorar(m[7].posteringer)?.beløb - beregn.udlægHonorar(m[7].posteringer)?.beløb)
        setUdlagtAugust(beregn.udlægHonorar(m[7].posteringer)?.beløb)
        setUdbetalingAugust(beregn.totalHonorar(m[7].posteringer)?.beløb)
        setTjentSeptember(beregn.totalHonorar(m[8].posteringer)?.beløb - beregn.udlægHonorar(m[8].posteringer)?.beløb)
        setUdlagtSeptember(beregn.udlægHonorar(m[8].posteringer)?.beløb)
        setUdbetalingSeptember(beregn.totalHonorar(m[8].posteringer)?.beløb)
        setTjentOktober(beregn.totalHonorar(m[9].posteringer)?.beløb - beregn.udlægHonorar(m[9].posteringer)?.beløb)
        setUdlagtOktober(beregn.udlægHonorar(m[9].posteringer)?.beløb)
        setUdbetalingOktober(beregn.totalHonorar(m[9].posteringer)?.beløb)
        setTjentNovember(beregn.totalHonorar(m[10].posteringer)?.beløb - beregn.udlægHonorar(m[10].posteringer)?.beløb)
        setUdlagtNovember(beregn.udlægHonorar(m[10].posteringer)?.beløb)
        setUdbetalingNovember(beregn.totalHonorar(m[10].posteringer)?.beløb)
        setTjentDecember(beregn.totalHonorar(m[11].posteringer)?.beløb - beregn.udlægHonorar(m[11].posteringer)?.beløb)
        setUdlagtDecember(beregn.udlægHonorar(m[11].posteringer)?.beløb)
        setUdbetalingDecember(beregn.totalHonorar(m[11].posteringer)?.beløb)

    }, [år, props.posteringer])

    

  return (
    <Modal trigger={props.trigger} setTrigger={props.setTrigger} onClose={() => {setPosteringerDetaljer([]); setKvitteringBillede(null)}} closeIsBackButton={kvitteringBillede} setBackFunction={setKvitteringBillede}>
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
                    <p>{udbetalingJanuar.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p>
                    {januarPosteringer && januarPosteringer.length > 0 ? <button onClick={() => {setPosteringerDetaljer(januarPosteringer); setValgtMåned("januar")}}>Posteringer</button> : <span style={{color: '#222222'}}>–</span>}
                </div>
                <div className={`${Styles.måned} ${Styles.ligeMåned}`}>
                    <p>Februar</p>
                    <p className={Styles.økonomiDetaljerTjent}>{tjentFebruar.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p>
                    <p className={Styles.økonomiDetaljerUdlagt}>{udlagtFebruar.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p>
                    <p>{udbetalingFebruar.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p>
                    {februarPosteringer && februarPosteringer.length > 0 ? <button onClick={() => {setPosteringerDetaljer(februarPosteringer); setValgtMåned("februar")}}>Posteringer</button> : <span style={{color: '#222222'}}>–</span>}
                </div>
                <div className={`${Styles.måned} ${Styles.uligeMåned}`}>
                    <p>Marts</p>
                    <p className={Styles.økonomiDetaljerTjent}>{tjentMarts.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p>
                    <p className={Styles.økonomiDetaljerUdlagt}>{udlagtMarts.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p>
                    <p>{udbetalingMarts.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p>
                    {martsPosteringer && martsPosteringer.length > 0 ? <button onClick={() => {setPosteringerDetaljer(martsPosteringer); setValgtMåned("marts")}}>Posteringer</button> : <span style={{color: '#222222'}}>–</span>}
                </div>
                <div className={`${Styles.måned} ${Styles.ligeMåned}`}>
                    <p>April</p>
                    <p className={Styles.økonomiDetaljerTjent}>{tjentApril.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p>
                    <p className={Styles.økonomiDetaljerUdlagt}>{udlagtApril.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p>
                    <p>{udbetalingApril.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p>
                    {aprilPosteringer && aprilPosteringer.length > 0 ? <button onClick={() => {setPosteringerDetaljer(aprilPosteringer); setValgtMåned("april")}}>Posteringer</button> : <span style={{color: '#222222'}}>–</span>}
                </div>
                <div className={`${Styles.måned} ${Styles.uligeMåned}`}>
                    <p>Maj</p>
                    <p className={Styles.økonomiDetaljerTjent}>{tjentMaj.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p>
                    <p className={Styles.økonomiDetaljerUdlagt}>{udlagtMaj.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p>
                    <p>{udbetalingMaj.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p>
                    {majPosteringer && majPosteringer.length > 0 ? <button onClick={() => {setPosteringerDetaljer(majPosteringer); setValgtMåned("maj")}}>Posteringer</button> : <span style={{color: '#222222'}}>–</span>}
                </div>
                <div className={`${Styles.måned} ${Styles.ligeMåned}`}>
                    <p>Juni</p>
                    <p className={Styles.økonomiDetaljerTjent}>{tjentJuni.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p>
                    <p className={Styles.økonomiDetaljerUdlagt}>{udlagtJuni.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p>
                    <p>{udbetalingJuni.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p>
                    {juniPosteringer && juniPosteringer.length > 0 ? <button onClick={() => {setPosteringerDetaljer(juniPosteringer); setValgtMåned("juni")}}>Posteringer</button> : <span style={{color: '#222222'}}>–</span>}
                </div>
                <div className={`${Styles.måned} ${Styles.uligeMåned}`}>
                    <p>Juli</p>
                    <p className={Styles.økonomiDetaljerTjent}>{tjentJuli.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p>
                    <p className={Styles.økonomiDetaljerUdlagt}>{udlagtJuli.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p>
                    <p>{udbetalingJuli.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p>
                    {juliPosteringer && juliPosteringer.length > 0 ? <button onClick={() => {setPosteringerDetaljer(juliPosteringer); setValgtMåned("juli")}}>Posteringer</button> : <span style={{color: '#222222'}}>–</span>}
                </div>
                <div className={`${Styles.måned} ${Styles.ligeMåned}`}>
                    <p>August</p>
                    <p className={Styles.økonomiDetaljerTjent}>{tjentAugust.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p>
                    <p className={Styles.økonomiDetaljerUdlagt}>{udlagtAugust.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p>
                    <p>{udbetalingAugust.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p>
                    {augustPosteringer && augustPosteringer.length > 0 ? <button onClick={() => {setPosteringerDetaljer(augustPosteringer); setValgtMåned("august")}}>Posteringer</button> : <span style={{color: '#222222'}}>–</span>}
                </div>
                <div className={`${Styles.måned} ${Styles.uligeMåned}`}>
                    <p>September</p>
                    <p className={Styles.økonomiDetaljerTjent}>{tjentSeptember.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p>
                    <p className={Styles.økonomiDetaljerUdlagt}>{udlagtSeptember.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p>
                    <p>{udbetalingSeptember.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p>
                    {septemberPosteringer && septemberPosteringer.length > 0 ? <button onClick={() => {setPosteringerDetaljer(septemberPosteringer); setValgtMåned("september")}}>Posteringer</button> : <span style={{color: '#222222'}}>–</span>}
                </div>
                <div className={`${Styles.måned} ${Styles.ligeMåned}`}>
                    <p>Oktober</p>
                    <p className={Styles.økonomiDetaljerTjent}>{tjentOktober.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p>
                    <p className={Styles.økonomiDetaljerUdlagt}>{udlagtOktober.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p>
                    <p>{udbetalingOktober.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p>
                    {oktoberPosteringer && oktoberPosteringer.length > 0 ? <button onClick={() => {setPosteringerDetaljer(oktoberPosteringer); setValgtMåned("oktober")}}>Posteringer</button> : <span style={{color: '#222222'}}>–</span>}
                </div>
                <div className={`${Styles.måned} ${Styles.uligeMåned}`}>
                    <p>November</p>
                    <p className={Styles.økonomiDetaljerTjent}>{tjentNovember.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p>
                    <p className={Styles.økonomiDetaljerUdlagt}>{udlagtNovember.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p>
                    <p>{udbetalingNovember.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p>
                    {novemberPosteringer && novemberPosteringer.length > 0 ? <button onClick={() => {setPosteringerDetaljer(novemberPosteringer); setValgtMåned("november")}}>Posteringer</button> : <span style={{color: '#222222'}}>–</span>}
                </div>
                <div className={`${Styles.måned} ${Styles.ligeMåned}`}>
                    <p>December</p>
                    <p className={Styles.økonomiDetaljerTjent}>{tjentDecember.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p>
                    <p className={Styles.økonomiDetaljerUdlagt}>{udlagtDecember.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p>
                    <p>{udbetalingDecember.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p>
                    {decemberPosteringer && decemberPosteringer.length > 0 ? <button onClick={() => {setPosteringerDetaljer(decemberPosteringer); setValgtMåned("december")}}>Posteringer</button> : <span style={{color: '#222222'}}>–</span>}
                </div>
                <div className={`${Styles.totalRække}`}>
                    <b>I alt, {år}</b>
                    <b>{(beregn.totalHonorar(åretsPosteringer, 2, false).beløb - beregn.udlægHonorar(åretsPosteringer, 2, false).beløb)?.toLocaleString('da-DK', { style: 'currency', currency: 'DKK'})}</b>
                    <b>{beregn.udlægHonorar(åretsPosteringer, 2, false)?.formateret}</b>
                    <b>{beregn.totalHonorar(åretsPosteringer, 2, false)?.formateret}</b>
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
                    <p>{udbetalingJanuar?.toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0  })}</p>
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
                    <p>{udbetalingFebruar?.toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0  })}</p>
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
                    <p>{udbetalingMarts?.toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0  })}</p>
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
                    <p>{udbetalingApril?.toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0  })}</p>
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
                    <p>{udbetalingMaj?.toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0  })}</p>
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
                    <p>{udbetalingJuni.toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0  })}</p>
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
                    <p>{udbetalingJuli?.toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0  })}</p>
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
                    <p>{udbetalingAugust?.toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0  })}</p>
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
                    <p>{udbetalingSeptember?.toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0  })}</p>
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
                    <p>{udbetalingOktober?.toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0  })}</p>
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
                    <p>{udbetalingNovember?.toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0  })}</p>
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
                    <p>{udbetalingDecember?.toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0  })}</p>
                </div>
                <div className={`${Styles.totalRække}`}>
                    <b>I alt</b>
                    <b>{(beregn.totalHonorar(åretsPosteringer, 2, false).beløb - beregn.udlægHonorar(åretsPosteringer, 2, false).beløb)?.toLocaleString('da-DK', { style: 'currency', currency: 'DKK'})}</b>
                    <b>{beregn.udlægHonorar(åretsPosteringer, 2, false)?.formateret}</b>
                    <b>{beregn.totalHonorar(åretsPosteringer, 2, false)?.formateret}</b>
                </div>
            </div>
        </PageAnimation>
        :
        <>
        <PageAnimation>
            {!kvitteringBillede ? <>
            <div className={Styles.modalHeaderContainer}>
                <img className={Styles.backIcon} src={BackIcon} alt="Tilbage" onClick={() => setPosteringerDetaljer([])}/>
                <h2 className={ModalStyles.modalHeading}>Din økonomi for {valgtMåned + " " + år}</h2>
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
                    <p className={Styles.økonomiDetaljerTjent}>{(beregn.totalHonorar(posteringerDetaljer, 2, false)?.beløb - beregn.udlægHonorar(posteringerDetaljer, 2, false)?.beløb)?.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p>
                    <p className={Styles.økonomiDetaljerUdlagt}>{(beregn.udlægHonorar(posteringerDetaljer, 2, false)?.formateret)}</p>
                    <p>{(beregn.totalHonorar(posteringerDetaljer, 2, false)?.formateret)}</p>
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
                    <p className={Styles.økonomiDetaljerTjent}>{(beregn.totalHonorar(posteringerDetaljer, 2, false)?.beløb - beregn.udlægHonorar(posteringerDetaljer, 2, false)?.beløb)?.toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                    <p className={Styles.økonomiDetaljerUdlagt}>{(beregn.udlægHonorar(posteringerDetaljer, 0, false)?.formateret)}</p>
                    <p>{(beregn.totalHonorar(posteringerDetaljer, 0, false)?.formateret)}</p>
                </div>
            </div>
            <div className={Styles.akkumuleretContainer}>
                <b style={{fontFamily: "OmnesBold", display: "block", marginBottom: 10}}>Akkumuleret for {valgtMåned + " " + år}:</b>
                <div className={Styles.akkumuleretØkonomiTableHeading}>
                    <div>
                        <b>Beskrivelse</b>
                    </div>
                    <div className={Styles.lineAlignRight}>
                        <b>Antal</b>
                    </div>
                    <div className={Styles.lineAlignRight}>
                        <b>Sats</b>
                    </div>
                    <div className={Styles.lineAlignRight}>
                        <b>Total</b>
                    </div>
                </div>
                
                {opstartData[0]?.antal > 0 && opstartData.map((entry, index) => (
                    <div key={`opstart-${index}`} className={Styles.akkumuleretØkonomiTableLine}>
                        <div><p>Opstart</p></div>
                        <div className={Styles.lineAlignRight}><p>{entry.antal}</p></div>
                        <div className={Styles.lineAlignRight}><p>{entry.sats}</p></div>
                        <div className={Styles.lineAlignRight}><p>{(entry.total).toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p></div>
                    </div>
                ))}
                
                {handymanData[0]?.antal > 0 && handymanData.map((entry, index) => (
                    <div key={`handyman-${index}`} className={Styles.akkumuleretØkonomiTableLine}>
                        <div><p>Handyman</p></div>
                        <div className={Styles.lineAlignRight}><p>{entry.antal}</p></div>
                        <div className={Styles.lineAlignRight}><p>{entry.sats}</p></div>
                        <div className={Styles.lineAlignRight}><p>{(entry.total).toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p></div>
                    </div>
                ))}

                {tømrerData[0]?.antal > 0 && tømrerData.map((entry, index) => (
                    <div key={`tømrer-${index}`} className={Styles.akkumuleretØkonomiTableLine}>
                        <div><p>Tømrer</p></div>
                        <div className={Styles.lineAlignRight}><p>{entry.antal}</p></div>
                        <div className={Styles.lineAlignRight}><p>{entry.sats}</p></div>
                        <div className={Styles.lineAlignRight}><p>{(entry.total).toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p></div>
                    </div>
                ))}

                {rådgivningData[0]?.antal > 0 && rådgivningData.map((entry, index) => (
                    <div key={`rådgivning-${index}`} className={Styles.akkumuleretØkonomiTableLine}>
                        <div><p>Rådgivning</p></div>
                        <div className={Styles.lineAlignRight}><p>{entry.antal}</p></div>
                        <div className={Styles.lineAlignRight}><p>{entry.sats}</p></div>
                        <div className={Styles.lineAlignRight}><p>{(entry.total).toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p></div>
                    </div>
                ))}
                {handymanAftenTillæg[0]?.antal > 0 && handymanAftenTillæg.map((entry, index) => (
                    <div key={`handyman-aften-${index}`} className={Styles.akkumuleretØkonomiTableLine}>
                        <div><p>Aftentillæg (hand.)</p></div>
                        <div className={Styles.lineAlignRight}><p>{entry.antal}</p></div>
                        <div className={Styles.lineAlignRight}><p>{entry.sats}</p></div>
                        <div className={Styles.lineAlignRight}><p>{(entry.total).toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p></div>
                    </div>
                ))}

                {tømrerAftenTillæg[0]?.antal > 0 && tømrerAftenTillæg.map((entry, index) => (
                    <div key={`tømrer-aften-${index}`} className={Styles.akkumuleretØkonomiTableLine}>
                        <div><p>Aftentillæg (tøm.)</p></div>
                        <div className={Styles.lineAlignRight}><p>{entry.antal}</p></div>
                        <div className={Styles.lineAlignRight}><p>{entry.sats}</p></div>
                        <div className={Styles.lineAlignRight}><p>{(entry.total).toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p></div>
                    </div>
                ))}

                {rådgivningAftenTillæg[0]?.antal > 0 && rådgivningAftenTillæg.map((entry, index) => (
                    <div key={`rådgivning-aften-${index}`} className={Styles.akkumuleretØkonomiTableLine}>
                        <div><p>Aftentillæg (vejl.)</p></div>
                        <div className={Styles.lineAlignRight}><p>{entry.antal}</p></div>
                        <div className={Styles.lineAlignRight}><p>{entry.sats}</p></div>
                        <div className={Styles.lineAlignRight}><p>{(entry.total).toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p></div>
                    </div>
                ))}

                {handymanNatTillæg[0]?.antal > 0 && handymanNatTillæg.map((entry, index) => (
                    <div key={`handyman-nat-${index}`} className={Styles.akkumuleretØkonomiTableLine}>
                        <div><p>Nattillæg (hand.)</p></div>
                        <div className={Styles.lineAlignRight}><p>{entry.antal}</p></div>
                        <div className={Styles.lineAlignRight}><p>{entry.sats}</p></div>
                        <div className={Styles.lineAlignRight}><p>{(entry.total).toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p></div>
                    </div>
                ))}

                {tømrerNatTillæg[0]?.antal > 0 && tømrerNatTillæg.map((entry, index) => (
                    <div key={`tømrer-nat-${index}`} className={Styles.akkumuleretØkonomiTableLine}>
                        <div><p>Nattillæg (tøm.)</p></div>
                        <div className={Styles.lineAlignRight}><p>{entry.antal}</p></div>
                        <div className={Styles.lineAlignRight}><p>{entry.sats}</p></div>
                        <div className={Styles.lineAlignRight}><p>{(entry.total).toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p></div>
                    </div>
                ))}

                {rådgivningNatTillæg[0]?.antal > 0 && rådgivningNatTillæg.map((entry, index) => (
                    <div key={`rådgivning-nat-${index}`} className={Styles.akkumuleretØkonomiTableLine}>
                        <div><p>Nattillæg (vejl.)</p></div>
                        <div className={Styles.lineAlignRight}><p>{entry.antal}</p></div>
                        <div className={Styles.lineAlignRight}><p>{entry.sats}</p></div>
                        <div className={Styles.lineAlignRight}><p>{(entry.total).toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p></div>
                    </div>
                ))}
                {trailerData[0]?.antal > 0 && trailerData.map((entry, index) => (
                    <div key={`trailer-${index}`} className={Styles.akkumuleretØkonomiTableLine}>
                        <div><p>Trailer</p></div>
                        <div className={Styles.lineAlignRight}><p>{entry.antal}</p></div>
                        <div className={Styles.lineAlignRight}><p>{entry.sats}</p></div>
                        <div className={Styles.lineAlignRight}><p>{(entry.total).toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p></div>
                    </div>
                ))}
                {beregnUdlagt(posteringerDetaljer) > 0 &&
                    <div key={`udlagt`} className={Styles.akkumuleretØkonomiTableLine}>
                        <div><p>Udlæg</p></div>
                        <div className={Styles.lineAlignRight}><p></p></div>
                        <div className={Styles.lineAlignRight}><p></p></div>
                        <div className={Styles.lineAlignRight}><p>{beregnUdlagt(posteringerDetaljer).toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p></div>
                    </div>
                }
                {beregnRabat(posteringerDetaljer) > 0 &&
                    <div key={`rabat`} className={Styles.akkumuleretØkonomiTableLine}>
                        <div><p>Rabat</p></div>
                        <div className={Styles.lineAlignRight}><p></p></div>
                        <div className={Styles.lineAlignRight}><p></p></div>
                        <div className={Styles.lineAlignRight}><p>- {beregnRabat(posteringerDetaljer).toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p></div>
                    </div>
                }
                {beregnFasteHonorarer(posteringerDetaljer) > 0 &&
                    <div key={`fasteHonorarer`} className={Styles.akkumuleretØkonomiTableLine}>
                        <div><p>Faste honorarer</p></div>
                        <div className={Styles.lineAlignRight}><p></p></div>
                        <div className={Styles.lineAlignRight}><p></p></div>
                        <div className={Styles.lineAlignRight}><p>{beregnFasteHonorarer(posteringerDetaljer).toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</p></div>
                    </div>
                }
                <div className={Styles.akkumuleretØkonomiTableTotals}>
                    <div>
                        <b style={{fontFamily: "OmnesBold"}}>Total</b>
                    </div>
                    <div className={Styles.lineAlignRight}>
                        <b></b>
                    </div>
                    <div className={Styles.lineAlignRight}>
                        <b></b>
                    </div>
                    <div className={Styles.lineAlignRight}>
                        <b style={{fontFamily: "OmnesBold"}}>{(beregnTjent(posteringerDetaljer) + beregnUdlagt(posteringerDetaljer)).toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}</b>
                    </div>
                </div>
            </div>
            <b style={{fontFamily: "OmnesBold", display: "block", marginBottom: 10, marginLeft: 10}}>Posteringsgrundlag:</b>
            <div className={Styles.posteringerDiv}>
            {posteringerDetaljer && posteringerDetaljer.map((postering) => {
                return (
                    <div className={PosteringCSS.posteringDiv} key={postering._id}>
                        <div className={PosteringCSS.posteringCard} style={{padding: '10px 20px'}}>

                            <div>
                                <p className={PosteringCSS.posteringDato}>{postering.dato && postering.dato.slice(0,10)}</p>
                                <p className={PosteringCSS.posteringBruger}>{postering.opgaveID && getOpgaveAdresse(postering.opgaveID)}</p>
                                <i className={PosteringCSS.posteringBeskrivelse}>{postering.beskrivelse ? postering.beskrivelse : "Ingen beskrivelse."}</i>
                                <div className={PosteringCSS.kvitteringBillederListe}>
                                    {postering.udlæg.map((udlæg, index) => {
                                        return udlæg.kvittering ? 
                                        <img 
                                        key={`udlæg-${index}`}
                                        className={PosteringCSS.kvitteringBillede} 
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
                            <div className={PosteringCSS.posteringListe}>
                                {postering.opstart > 0 && postering.dynamiskHonorarBeregning && (
                                    <div className={PosteringCSS.posteringRække}>
                                        <span className={PosteringCSS.posteringRækkeBeskrivelse}>Opstart </span>
                                        <span>{beregn.opstartHonorar(postering, 0, false)?.formateret}</span>
                                    </div>
                                )}
                                {postering.handymanTimer > 0 && postering.dynamiskHonorarBeregning && (
                                    <div className={PosteringCSS.posteringRække}>
                                        <span className={PosteringCSS.posteringRækkeBeskrivelse}>{postering.handymanTimer || 0} timer (handyman) </span>
                                        <span>{beregn.handymanHonorar(postering, 0, false)?.formateret}</span>
                                    </div>
                                )}
                                {postering.tømrerTimer > 0 && postering.dynamiskHonorarBeregning && (
                                    <div className={PosteringCSS.posteringRække}>
                                        <span className={PosteringCSS.posteringRækkeBeskrivelse}>{postering.tømrerTimer || 0} timer (tømrer) </span>
                                        <span>{beregn.tømrerHonorar(postering, 0, false)?.formateret}</span>
                                    </div>
                                )}
                                {postering.rådgivningOpmålingVejledning > 0 && postering.dynamiskHonorarBeregning && (
                                    <div className={PosteringCSS.posteringRække}>
                                        <span className={PosteringCSS.posteringRækkeBeskrivelse}>{postering.rådgivningOpmålingVejledning || 0} timer (rådgivning) </span>
                                        <span>{beregn.rådgivningHonorar(postering, 0, false)?.formateret}</span>
                                    </div>
                                )}
                                {postering.aftenTillæg && postering.dynamiskHonorarBeregning && (
                                    <div className={PosteringCSS.posteringRække}>
                                        <span className={PosteringCSS.posteringRækkeBeskrivelse}>Aftentillæg (+50% pr. time) </span>
                                        <span>{beregn.aftenTillægHonorar(postering, 0, false)?.formateret}</span>
                                    </div>
                                )}
                                {postering.natTillæg && postering.dynamiskHonorarBeregning && (
                                    <div className={PosteringCSS.posteringRække}>
                                        <span className={PosteringCSS.posteringRækkeBeskrivelse}>Nattillæg (+ 100% pr. time) </span>
                                        <span>{beregn.natTillægHonorar(postering, 0, false)?.formateret}</span>
                                    </div>
                                )}
                                {postering.trailer && postering.dynamiskHonorarBeregning && (
                                    <div className={PosteringCSS.posteringRække}>
                                        <span className={PosteringCSS.posteringRækkeBeskrivelse}>Trailer </span>
                                        <span>{beregn.trailerHonorar(postering, 0, false)?.formateret}</span>
                                    </div>
                                )}
                                {postering.udlæg.length > 0 && postering.dynamiskHonorarBeregning && (
                                    <div className={PosteringCSS.posteringRække}>
                                        <span className={PosteringCSS.posteringRækkeBeskrivelse}>{postering.udlæg.length > 0 ? postering.udlæg.length : 0} udlæg </span>
                                        <span>{beregn.udlægHonorar(postering, 0, false)?.formateret}</span>
                                    </div>
                                )}
                                {postering.rabatProcent > 0 && postering.dynamiskHonorarBeregning && (
                                    <div className={PosteringCSS.posteringRække}>
                                        <span className={PosteringCSS.posteringRækkeBeskrivelse}>{postering.rabatProcent}% rabat</span>
                                        <span>- {beregn.rabatHonorar(postering, 0, false)?.formateret}</span>
                                    </div>
                                )}
                                {!postering.dynamiskHonorarBeregning && (
                                    <div className={PosteringCSS.posteringRække}>
                                        <span className={PosteringCSS.posteringRækkeBeskrivelse}>Fast honorar: </span>
                                        <span>{beregn.fastHonorar(postering, 0, false)?.formateret}</span>
                                    </div>
                                )}
                                <div className={PosteringCSS.totalRække}>
                                    <b className={PosteringCSS.totalRækkeBeskrivelse}>Total: </b>
                                    <b className={PosteringCSS.totalRækkeResultat}>{(beregn.totalHonorar(postering, 0, false)?.beløb).toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</b>
                                </div>
                            </div>
                        </div>
                        <p style={{display: 'flex', marginTop: 10, justifyContent: 'center', cursor: 'pointer'}} className={PosteringCSS.prefix} onClick={() => {
                        navigate(`/opgave/${postering.opgaveID}`)
                    }}>Gå til opgave</p>
                    </div>
                );})}
            </div>
            </> 
            : 
            <PageAnimation>
                    <div className={PosteringCSS.billedModalHeader}>
                        <img className={PosteringCSS.backArrow} src={BackArrow} onClick={() => setKvitteringBillede("")}/><h2>Billedvisning</h2>    
                    </div>
                    <img src={kvitteringBillede} className={PosteringCSS.kvitteringBilledeStort} />
                </PageAnimation>}
        </PageAnimation>
        </>}
    </Modal>
  )
}

export default ØkonomiOverblikModal