import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import BackArrow from '../../assets/back.svg'
import dayjs from 'dayjs'
import Styles from './MedarbejderØkonomiDetaljer.module.css'
import PosteringCSS from '../../components/Postering.module.css'
import Modal from '../Modal.jsx'
import satser from '../../variables'
import PageAnimation from '../PageAnimation.jsx'
import * as beregn from '../../utils/beregninger.js'
import { ReceiptText, Download, ClipboardList } from 'lucide-react'


const MedarbejderØkonomiDetaljer = (props) => {

    const [kvitteringBillede, setKvitteringBillede] = useState(null)
    const [posteringerDetaljer, setPosteringerDetaljer] = useState(null)
    const [kunder, setKunder] = useState(null)

    const navigate = useNavigate()
    
    const posteringer = props && props.trigger
    const opgaveIDs = posteringer && posteringer.map(postering => postering.opgaveID);
    const uniqueOpgaveIDs = opgaveIDs && [...new Set(opgaveIDs)]
    const user = props && props.user
    const opgaver = props && props.opgaver

    const containerRef = useRef();
    const bottomRef = useRef();


    useEffect(() => {
        if (bottomRef.current) {
          bottomRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }, [posteringerDetaljer]);      
      
    

    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API_URL}/kunder`, {
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        })
        .then(response => {
            setKunder(response.data)
        })
        .catch(error => {
            console.log(error)
        })
    }, [])
    
    const getBrugerName = (brugerID) => {
        const bruger = props.brugere && props.brugere.find(user => (user?._id || user?.id) === brugerID);
        return bruger ? bruger.navn : 'Ukendt medarbejder';
    };

    const navn = posteringer.length > 0 && getBrugerName(posteringer[0].brugerID)
    const opgaverForBruger = opgaver && uniqueOpgaveIDs && opgaver.filter(opgave => uniqueOpgaveIDs.includes(opgave._id))

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
        const månedensRabat = posteringer && posteringer.reduce((sum, postering) => sum + (postering.dynamiskHonorarBeregning ? ((postering.rabatProcent > 0 ? ((postering.rabatProcent / 100) * (postering.opstart * postering.satser.opstartsgebyrHonorar + postering.handymanTimer * postering.satser.handymanTimerHonorar + postering.tømrerTimer * postering.satser.tømrerTimerHonorar + postering.rådgivningOpmålingVejledning * postering.satser.rådgivningOpmålingVejledningHonorar + (postering.aftenTillæg ? (((postering.handymanTimer * postering.satser.handymanTimerHonorar) + (postering.tømrerTimer * postering.satser.tømrerTimerHonorar) + (postering.rådgivningOpmålingVejledning * postering.satser.rådgivningOpmålingVejledningHonorar)) * (postering.satser.aftenTillægHonorar / 100)) : 0) + (postering.natTillæg ? (((postering.handymanTimer * postering.satser.handymanTimerHonorar) + (postering.tømrerTimer * postering.satser.tømrerTimerHonorar) + (postering.rådgivningOpmålingVejledning * postering.satser.rådgivningOpmålingVejledningHonorar)) * (postering.satser.natTillægHonorar / 100)) : 0) + (postering.trailer ? postering.satser.trailerHonorar : 0))) : 0)) : 0), 0)
        return månedensRabat
    }

    function beregnUdlagt(posteringer) {
        // if(!posteringer) return 0
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

    function grupperPoster(posteringer, antalKey, satsKey) {
        if(!posteringer) return 0
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
        if(!posteringer) return 0
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

    const opstartData = posteringer && grupperPoster(posteringer, "opstart", "opstartsgebyrHonorar")
    const handymanData = grupperPoster(posteringer, "handymanTimer", "handymanTimerHonorar");
    const tømrerData = grupperPoster(posteringer, "tømrerTimer", "tømrerTimerHonorar");
    const rådgivningData = grupperPoster(posteringer, "rådgivningOpmålingVejledning", "rådgivningOpmålingVejledningHonorar");
    const trailerData = grupperPoster(posteringer, "trailer", "trailerHonorar");
    const handymanAftenTillæg = grupperTillæg(posteringer, "aftenTillæg", "aftenTillægHonorar", "handymanTimerHonorar", "handymanTimer");
    const handymanNatTillæg = grupperTillæg(posteringer, "natTillæg", "natTillægHonorar", "handymanTimerHonorar", "handymanTimer");
    const tømrerAftenTillæg = grupperTillæg(posteringer, "aftenTillæg", "aftenTillægHonorar", "tømrerTimerHonorar", "tømrerTimer");
    const tømrerNatTillæg = grupperTillæg(posteringer, "natTillæg", "natTillægHonorar", "tømrerTimerHonorar", "tømrerTimer");
    const rådgivningAftenTillæg = grupperTillæg(posteringer, "aftenTillæg", "aftenTillægHonorar", "rådgivningOpmålingVejledningHonorar", "rådgivningOpmålingVejledning");
    const rådgivningNatTillæg = grupperTillæg(posteringer, "natTillæg", "natTillægHonorar", "rådgivningOpmålingVejledningHonorar", "rådgivningOpmålingVejledning");

    const getOpgaveAdresse = (opgaveID) => {
        const opgave = opgaver && opgaver.find(opgave => opgave._id === opgaveID);
        const kunde = kunder && kunder.find(kunde => kunde._id === opgave.kundeID);
        return kunde?.adresse || 'Adresse utilgængelig';
    };

    const handleDownload = async (selectedPosteringer) => {
        try {
          const ids = selectedPosteringer.map(p => p._id)
          const response = await axios.post(
            `${import.meta.env.VITE_API_URL}/posteringer/udlaeg/download-selected`,
            { posteringIds: ids },
            { headers: { Authorization: `Bearer ${user.token}` }, responseType: 'blob' }
          )
      
          const disposition = response.headers['content-disposition']
        //   let filename = 'udlaeg.zip'
          let filename = `${navn && navn.split(' ')[0]}s-udlæg-${props.customMåned.end.format('MMMM-YYYY')}.zip`
          if (disposition && disposition.includes('filename=')) {
            filename = disposition.split('filename=')[1]
          }
      
          const url = window.URL.createObjectURL(new Blob([response.data]))
          const link = document.createElement('a')
          link.href = url
          link.setAttribute('download', filename)
          document.body.appendChild(link)
          link.click()
          link.remove()
        } catch (err) {
          console.error('Fejl ved download af zip:', err)
        }
      }
      

    // const handleDownload = async (selectedPosteringer) => {
    //     try {
    //         const ids = selectedPosteringer.map(p => p._id)
    //         const response = await axios.post(`${import.meta.env.VITE_API_URL}/posteringer/udlaeg/download-selected`, { posteringIds: ids }, {headers: { Authorization: `Bearer ${user.token}` }, responseType: "blob"})
              
    //         // Få filnavn fra response header
    //         const disposition = response.headers["content-disposition"]
    //         let filename = "kvittering.jpg"
    //         if (disposition && disposition.includes("filename=")) {
    //           filename = disposition.split("filename=")[1]
    //         }
        
    //         const url = window.URL.createObjectURL(new Blob([response.data]))
    //         const link = document.createElement("a")
    //         link.href = url
    //         link.setAttribute("download", filename)
    //         document.body.appendChild(link)
    //         link.click()
    //         link.remove()
    //       } catch (err) {
    //         console.error("Fejl ved download:", err)
    //       }
        
    //     try {
    //         const ids = selectedPosteringer.map(p => p._id)
    
    //         const response = await axios.post(`${import.meta.env.VITE_API_URL}/posteringer/udlaeg/download-selected`, { posteringIds: ids }, { headers: {
    //             'Authorization': `Bearer ${user.token}`
    //         }}, { responseType: "blob" })
    
    //         // Lav en blob og force download
    //         const url = window.URL.createObjectURL(new Blob([response.data]))
    //         const link = document.createElement("a")
    //         link.href = url
    //         link.setAttribute("download", "udlaeg.zip")
    //         document.body.appendChild(link)
    //         link.click()
    //         link.remove()
    //     } catch (err) {
    //         console.error("Fejl ved download:", err)
    //     }
    // }
  
    return (
    <Modal trigger={props.trigger} setTrigger={props.setTrigger} onClose={() => setPosteringerDetaljer(null)} closeIsBackButton={kvitteringBillede} setBackFunction={setKvitteringBillede}> 
        <div>
            {!kvitteringBillede ? <>
            <h2 className={Styles.adminØkonomiHeading} style={{fontFamily: 'OmnesBold'}}>{navn && navn.split(' ')[0]}s økonomi <br /><span style={{fontFamily: 'Omnes', fontSize: '16px', color: '#696969'}}>- {props.customMåned.end.format('MMMM YYYY')}</span></h2>
            <div className={Styles.adminØkonomiContainer}>
                <div style={{borderTopLeftRadius: '10px', borderTopRightRadius: '10px'}} className={`${Styles.adminØkonomiHeadings} ${Styles.adminØkonomiHeadingsDesktop}`}>
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
                </div>
                <div style={{borderTopLeftRadius: '10px', borderTopRightRadius: '10px'}} className={`${Styles.adminØkonomiHeadings} ${Styles.adminØkonomiHeadingsMobile}`}>
                    <div>
                        <b>Medarb.</b>
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
                <div className={`${Styles.måned} ${Styles.uligeMåned} ${Styles.månedOverblikDesktop}`}>
                    <p>{navn && navn.split(' ')[0]}</p>
                    <p>{(beregn.totalHonorar(posteringer, 2, false)?.beløb - beregn.udlægHonorar(posteringer, 2, false)?.beløb)?.toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                    <p>{beregn.udlægHonorar(posteringer, 2, false)?.formateret}</p>
                    <p>{beregn.totalHonorar(posteringer, 2, false)?.formateret}</p>
                </div>
                <div className={`${Styles.måned} ${Styles.uligeMåned} ${Styles.månedOverblikMobile}`}>
                    <p>{navn && navn.split(' ')[0]}</p>
                    <p>{(beregn.totalHonorar(posteringer, 0, false)?.beløb - beregn.udlægHonorar(posteringer, 0, false)?.beløb)?.toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0})}</p>
                    <p>{(beregn.udlægHonorar(posteringer, 2, false)?.beløb)?.toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0})}</p>
                    <p>{beregn.totalHonorar(posteringer, 2, false)?.beløb?.toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0})}</p>
                </div>
            </div>
            <div className={Styles.akkumuleretContainer}>
                <b style={{fontFamily: "OmnesBold", display: "block", marginBottom: 10}}>Akkumuleret for {props.customMåned.end.format('MMMM YYYY')}:</b>
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
                {posteringer && beregnUdlagt(posteringer) > 0 &&
                    <div key={`udlagt`} className={Styles.akkumuleretØkonomiTableLine}>
                        <div><p>Udlæg</p></div>
                        <div className={Styles.lineAlignRight}><p></p></div>
                        <div className={Styles.lineAlignRight}><p></p></div>
                        <div className={Styles.lineAlignRight}><p>{beregn.udlægHonorar(posteringer, 2, false)?.formateret}</p></div>
                    </div>
                }
                {posteringer && beregnRabat(posteringer) > 0 &&
                    <div key={`rabat`} className={Styles.akkumuleretØkonomiTableLine}>
                        <div><p>Rabat</p></div>
                        <div className={Styles.lineAlignRight}><p></p></div>
                        <div className={Styles.lineAlignRight}><p></p></div>
                        <div className={Styles.lineAlignRight}><p>- {beregn.rabatHonorar(posteringer, 2, false)?.formateret}</p></div>
                    </div>
                }
                {posteringer && beregnFasteHonorarer(posteringer) > 0 && 
                    <div key={`fasteHonorarer`} className={Styles.akkumuleretØkonomiTableLine}>
                        <div><p>Faste honorarer</p></div>
                        <div className={Styles.lineAlignRight}><p></p></div>
                        <div className={Styles.lineAlignRight}><p></p></div>
                        <div className={Styles.lineAlignRight}><p>{beregn.fastHonorar(posteringer, 2, false)?.formateret}</p></div>
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
                        <b style={{fontFamily: "OmnesBold"}}>{beregn.totalHonorar(posteringer, 2, false)?.formateret}</b>
                    </div>
                </div>
            </div>
            <b>Fordelt på følgende opgaver:</b>
            <div className={Styles.adminØkonomiContainer}>
                <div style={{borderTopLeftRadius: '10px', borderTopRightRadius: '10px'}} className={`${Styles.adminØkonomiOpgaverHeadings} ${Styles.adminØkonomiOpgaverHeadingsDesktop}`}>
                    <div>
                        <b>Adresse</b>
                    </div>
                    <div>
                        <b>Opgavestatus</b>
                    </div>
                    <div>
                        <b>Honorar</b>
                    </div>
                    <div>
                        <b></b>
                    </div>
                    <div>
                        <b></b>
                    </div>
                </div>
                <div style={{borderTopLeftRadius: '10px', borderTopRightRadius: '10px'}} className={`${Styles.adminØkonomiOpgaverHeadings} ${Styles.adminØkonomiOpgaverHeadingsMobile}`}>
                    <div>
                        <b>Adresse</b>
                    </div>
                    <div>
                        <b>Status</b>
                    </div>
                    <div>
                        <b>Honorar</b>
                    </div>
                </div>
                {opgaverForBruger && opgaverForBruger.map(opgave => {
                    const posteringerForOpgave = posteringer && posteringer.filter(postering => postering.opgaveID === opgave._id)
                    return ( 
                    <div key={opgave._id}>
                        <div className={`${Styles.opgaver} ${Styles.uligeMåned} ${Styles.adminØkonomiOpgaverRækkeDesktop} ${posteringerDetaljer && posteringerDetaljer[0].opgaveID === opgave._id ? Styles.selectedOpgave : ''}`}>
                            <p>{getOpgaveAdresse(opgave._id)}</p>
                            <p>{(opgave.fakturaBetalt || opgave.opgaveBetaltMedMobilePay || opgave.opgaveAfsluttet) ? "✅ Betalt" : "❗️ Åben"}</p>
                            <p>{beregn.totalHonorar(posteringerForOpgave, 2, false)?.formateret}</p>
                            <p><button onClick={() => posteringerDetaljer && posteringerDetaljer[0].opgaveID === opgave._id ? setPosteringerDetaljer(null) : setPosteringerDetaljer(posteringerForOpgave)} className={Styles.sePosteringerButton}>Se posteringer</button></p>
                            <p><button onClick={() => navigate(`/opgave/${opgave._id}`)}>Gå til opgave</button></p>
                        </div>
                        <div onClick={() => posteringerDetaljer && posteringerDetaljer[0].opgaveID === opgave._id ? setPosteringerDetaljer(null) : setPosteringerDetaljer(posteringerForOpgave)} className={`${Styles.opgaver} ${Styles.uligeMåned} ${Styles.adminØkonomiOpgaverRækkeMobile} ${posteringerDetaljer && posteringerDetaljer[0].opgaveID === opgave._id ? Styles.selectedOpgave : ''}`}>
                            <p>{getOpgaveAdresse(opgave._id)}</p>
                            <p>{(opgave.fakturaBetalt || opgave.opgaveBetaltMedMobilePay || opgave.opgaveAfsluttet) ? "✅ Betalt" : "❗️ Åben"}</p>
                            <p>{beregn.totalHonorar(posteringerForOpgave, 2, false)?.formateret}</p>
                        </div>
                    </div>
                    )
                })}
            </div>
            {posteringerDetaljer && 
                <div ref={containerRef} className={Styles.posteringerContainer}>
                    <button className={Styles.lukPosteringerButton} onClick={() => setPosteringerDetaljer(null)}>-</button>
                    <div className={Styles.posteringerDiv}>
                        {posteringerDetaljer.map((postering, index) => (
                            <div className={PosteringCSS.posteringDiv} onClick={() => console.log(postering)} key={postering._id} ref={index === posteringerDetaljer.length - 1 ? bottomRef : null}>
                            <div className={PosteringCSS.posteringCard} style={{padding: '10px 20px'}}>

                                <div>
                                    <p className={PosteringCSS.posteringDato}>{postering.dato && postering.dato.slice(0,10)}</p>
                                    <p className={PosteringCSS.posteringBruger}>{postering.opgaveID && getOpgaveAdresse(postering.opgaveID)}</p>
                                    <i className={PosteringCSS.posteringBeskrivelse}>{postering.beskrivelse ? postering.beskrivelse : "Ingen beskrivelse."}</i>
                                    <div className={PosteringCSS.kvitteringBillederListe}>
                                        {postering.udlæg.map((udlæg, index) => {
                                            return udlæg.kvittering && 
                                            <img 
                                            key={`udlæg-${index}`}
                                            className={PosteringCSS.kvitteringBillede} 
                                            src={udlæg.kvittering} 
                                            alt={udlæg.beskrivelse} 
                                            onClick={() => {setKvitteringBillede(udlæg.kvittering)}}/> 
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
                                            <span className={PosteringCSS.posteringRækkeBeskrivelse}>Nattillæg (+100% pr. time) </span>
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
                                        <b className={PosteringCSS.totalRækkeResultat}>{beregn.totalHonorar(postering, 2, false)?.formateret}</b>
                                    </div>
                                </div>
                            </div>
                            <p style={{display: 'flex', marginTop: 10, justifyContent: 'center', cursor: 'pointer'}} className={PosteringCSS.prefix} onClick={() => {
                                navigate(`/opgave/${postering.opgaveID}`)
                            }}>Gå til opgave</p>
                        </div>
                    ))}
                </div>
            </div>}
            <div className={Styles.akkumuleretContainer}>
                <b style={{fontFamily: "OmnesBold", display: "block", marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "flex-start", gap: 8}}><ReceiptText height={16} width={16} />Alle {navn && navn.split(' ')[0]}s udlægskvitteringer for {props.customMåned.end.format('MMMM YYYY')}</b>
                <div className={Styles.posteringerUdlægDiv}>
                {posteringer && posteringer.length > 0 && posteringer?.map((p) =>
                    p.udlæg.map((udlaeg, idx) => 
                        udlaeg.kvittering ? (
                            <div className={Styles.udlægskvitteringDiv} key={p._id}>
                            <img
                            key={`${p._id}-${idx}`}
                            src={udlaeg.kvittering}
                            alt={`Kvittering ${idx + 1} for postering ${p._id}`}
                            style={{ maxWidth: '100px', maxHeight: '100px', margin: '4px', objectFit: 'cover', borderRadius: 4 }}
                            />
                            <button className={Styles.udlægskvitteringButton} onClick={() => navigate(`/opgave/${p.opgaveID}`)}><ClipboardList />Opg.</button>
                            </div>
                        ) : null

                    )
                )}
                </div>
                <button onClick={() => handleDownload(posteringer)} className={Styles.hentKvitteringerButton}><Download height={16} width={16} />Hent alle {navn && navn.split(' ')[0]}s kvitteringer for {props.customMåned.end.format('MMMM YYYY')}</button>
            </div>
            </> 
            : 
                <PageAnimation>
                    <div className={PosteringCSS.billedModalHeader}>
                        <img className={PosteringCSS.backArrow} src={BackArrow} onClick={() => setKvitteringBillede("")}/><h2>Billedvisning</h2>    
                    </div>
                    <img src={kvitteringBillede} className={PosteringCSS.kvitteringBilledeStort} />
                </PageAnimation>}
        </div>
    </Modal>
  )
}

export default MedarbejderØkonomiDetaljer