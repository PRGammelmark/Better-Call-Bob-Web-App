import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Modal from '../Modal.jsx'
import ÅbenOpgaveCSS from '../../pages/ÅbenOpgave.module.css'
import SwitcherStyles from '../../pages/Switcher.module.css'
import dayjs from 'dayjs'
import satser from '../../variables'
import SwithArrowsBlack from '../../assets/switchArrowsBlack.svg'
import RabatIcon from '../../assets/rabatIcon.svg'
import { useAuthContext } from '../../hooks/useAuthContext'

const AddPostering = (props) => {

    const {user} = useAuthContext()

    const [outlays, setOutlays] = useState([]);
    const [handymantimer, setHandymantimer] = useState(0);
    const [tømrertimer, setTømrertimer] = useState(0);
    const [posteringDato, setPosteringDato] = useState(dayjs().format('YYYY-MM-DD'));
    const [posteringBeskrivelse, setPosteringBeskrivelse] = useState("");
    const [inkluderOpstart, setInkluderOpstart] = useState(1);
    const [aftenTillæg, setAftenTillæg] = useState(false)
    const [natTillæg, setNatTillæg] = useState(false)
    const [trailer, setTrailer] = useState(false)
    const [rådgivningOpmålingVejledning, setRådgivningOpmålingVejledning] = useState(0)
    const [aktuelleSatser, setAktuelleSatser] = useState(user && user.satser ? user.satser : satser);
    const [dynamiskHonorarBeregning, setDynamiskHonorarBeregning] = useState(true);
    const [dynamiskPrisBeregning, setDynamiskPrisBeregning] = useState(true);
    const [posteringFastHonorar, setPosteringFastHonorar] = useState(0);
    const [posteringFastPris, setPosteringFastPris] = useState(0);
    const [previewDynamiskHonorar, setPreviewDynamiskHonorar] = useState(0);
    const [previewDynamiskOutlays, setPreviewDynamiskOutlays] = useState(0);
    const [rabatProcent, setRabatProcent] = useState(0);
    
    useEffect(() => {
        const xPosteringDynamiskHonorar = (
            ((handymantimer * aktuelleSatser.handymanTimerHonorar) * (1 - rabatProcent / 100)) + 
            ((tømrertimer * aktuelleSatser.tømrerTimerHonorar) * (1 - rabatProcent / 100)) + 
            (aftenTillæg ? ((handymantimer * aktuelleSatser.aftenTillægHonorar) + (tømrertimer * aktuelleSatser.aftenTillægHonorar) + (rådgivningOpmålingVejledning * aktuelleSatser.aftenTillægHonorar)) * (1 - rabatProcent / 100) : 0) + 
            (natTillæg ? ((handymantimer * aktuelleSatser.natTillægHonorar) + (tømrertimer * aktuelleSatser.natTillægHonorar) + (rådgivningOpmålingVejledning * aktuelleSatser.natTillægHonorar)) * (1 - rabatProcent / 100) : 0) + 
            ((inkluderOpstart * aktuelleSatser.opstartsgebyrHonorar) * (1 - rabatProcent / 100)) + 
            (outlays.reduce((sum, item) => sum + Number(item.beløb), 0)) + 
            (trailer ? aktuelleSatser.trailerHonorar * (1 - rabatProcent / 100) : 0) + 
            (rådgivningOpmålingVejledning * aktuelleSatser.rådgivningOpmålingVejledningHonorar * (1 - rabatProcent / 100))
        );

        const xOutlays = (outlays.reduce((sum, item) => sum + Number(item.beløb), 0));
        
        setPreviewDynamiskHonorar(xPosteringDynamiskHonorar)
        setPreviewDynamiskOutlays(xOutlays)
    }, [handymantimer, tømrertimer, aftenTillæg, natTillæg, inkluderOpstart, outlays, trailer, rådgivningOpmålingVejledning, aktuelleSatser, rabatProcent]);

    function tilføjPostering (e) {

        const posteringSatser = aktuelleSatser;
        const posteringFastHonorar = 0;
        const posteringFastPris = 0;
        const posteringDynamiskHonorar = (
            ((handymantimer * posteringSatser.handymanTimerHonorar) * (1 - rabatProcent / 100)) + 
            ((tømrertimer * posteringSatser.tømrerTimerHonorar) * (1 - rabatProcent / 100)) + 
            ((aftenTillæg ? ((handymantimer * posteringSatser.aftenTillægHonorar) + (tømrertimer * posteringSatser.aftenTillægHonorar) + (rådgivningOpmålingVejledning * posteringSatser.aftenTillægHonorar)) : 0) * (1 - rabatProcent / 100)) + 
            ((natTillæg ? ((handymantimer * posteringSatser.natTillægHonorar) + (tømrertimer * posteringSatser.natTillægHonorar) + (rådgivningOpmålingVejledning * posteringSatser.natTillægHonorar)) : 0) * (1 - rabatProcent / 100)) + 
            ((inkluderOpstart * posteringSatser.opstartsgebyrHonorar) * (1 - rabatProcent / 100)) + 
            (outlays.reduce((sum, item) => sum + Number(item.beløb), 0)) + 
            ((trailer ? posteringSatser.trailerHonorar : 0) * (1 - rabatProcent / 100)) + 
            ((rådgivningOpmålingVejledning * posteringSatser.rådgivningOpmålingVejledningHonorar) * (1 - rabatProcent / 100))
        );
        const posteringDynamiskPris = (
            ((handymantimer * posteringSatser.handymanTimerPris) * (1 - rabatProcent / 100)) + 
            ((tømrertimer * posteringSatser.tømrerTimerPris) * (1 - rabatProcent / 100)) + 
            ((aftenTillæg ? ((handymantimer * posteringSatser.aftenTillægPris) + (tømrertimer * posteringSatser.aftenTillægPris) + (rådgivningOpmålingVejledning * posteringSatser.aftenTillægPris)) : 0) * (1 - rabatProcent / 100)) + 
            ((natTillæg ? ((handymantimer * posteringSatser.natTillægPris) + (tømrertimer * posteringSatser.natTillægPris) + (rådgivningOpmålingVejledning * posteringSatser.natTillægPris)) : 0) * (1 - rabatProcent / 100)) + 
            ((inkluderOpstart * posteringSatser.opstartsgebyrPris) * (1 - rabatProcent / 100)) + 
            (outlays.reduce((sum, item) => sum + Number(item.beløb), 0)) + 
            ((trailer ? posteringSatser.trailerPris : 0) * (1 - rabatProcent / 100)) + 
            ((rådgivningOpmålingVejledning ? rådgivningOpmålingVejledning * posteringSatser.rådgivningOpmålingVejledningPris : 0) * (1 - rabatProcent / 100))
        );
        
        const postering = {
            dato: posteringDato,
            beskrivelse: posteringBeskrivelse,
            opstart: inkluderOpstart,
            handymanTimer: handymantimer,
            tømrerTimer: tømrertimer,
            udlæg: outlays,
            aftenTillæg: aftenTillæg,
            natTillæg: natTillæg,
            trailer: trailer,
            rådgivningOpmålingVejledning: rådgivningOpmålingVejledning,
            satser: posteringSatser,
            rabatProcent: rabatProcent,
            dynamiskHonorarBeregning: dynamiskHonorarBeregning,
            dynamiskPrisBeregning: dynamiskPrisBeregning,
            fastHonorar: posteringFastHonorar,
            fastPris: posteringFastPris,
            dynamiskHonorar: posteringDynamiskHonorar,
            dynamiskPris: posteringDynamiskPris,
            totalHonorar: dynamiskHonorarBeregning ? posteringDynamiskHonorar : posteringFastHonorar,
            totalPris: dynamiskPrisBeregning ? posteringDynamiskPris : posteringFastPris,
            opgaveID: props.opgaveID,
            brugerID: props.userID
        }

        axios.post(`${import.meta.env.VITE_API_URL}/posteringer/`, postering, {
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        })
        .then(res => {
            props.setTrigger(false);
            setPosteringDato(dayjs().format('YYYY-MM-DD'));
            setInkluderOpstart(1);
            setHandymantimer(0);
            setTømrertimer(0);
            setRådgivningOpmålingVejledning(0);
            setOutlays([]);
            setAftenTillæg(false);
            setNatTillæg(false);
            setTrailer(false);
            setAktuelleSatser(satser);
            setPosteringFastHonorar(0);
            setPosteringFastPris(0);
            setPosteringBeskrivelse("");
            setDynamiskHonorarBeregning(true);
            setDynamiskPrisBeregning(true);
            setRabatProcent(0);
        })
        .catch(error => console.log(error))
    }

    const handleOutlayChange = (index, event) => {
        const newOutlays = [...outlays];
        newOutlays[index][event.target.name] = event.target.value;
        setOutlays(newOutlays);
    };

    const addOutlay = (e) => {
        e.preventDefault();
        setOutlays([...outlays, { beskrivelse: '', beløb: '', kvittering: '' }]);
    }

    const deleteOutlay = (index) => {
        const newOutlays = [...outlays];
        const deletedOutlay = newOutlays.splice(index, 1)[0];
        setOutlays(newOutlays);

        if (deletedOutlay.kvittering) {
            axios.delete(`${import.meta.env.VITE_API_URL}${deletedOutlay.kvittering}`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            })
            .catch(error => console.log(error));
        }
    };

    return (
        <Modal trigger={props.trigger} setTrigger={props.setTrigger} style={{backgroundColor: 'red'}}>
            <h2 className={ÅbenOpgaveCSS.modalHeading}>Ny postering 📄</h2>
            <form className={`${ÅbenOpgaveCSS.modalForm} ${ÅbenOpgaveCSS.posteringForm}`} onSubmit={(e) => {
                e.preventDefault();
                tilføjPostering();
            }}>
                <label className={ÅbenOpgaveCSS.prefix} htmlFor="">Vælg dato ...</label>
                <input className={ÅbenOpgaveCSS.modalInput} type="date" value={posteringDato} onChange={(e) => setPosteringDato(e.target.value)} />
                <label className={ÅbenOpgaveCSS.prefix} htmlFor="">Beskrivelse</label>
                <textarea className={ÅbenOpgaveCSS.modalInput} type="text" value={posteringBeskrivelse} onChange={(e) => setPosteringBeskrivelse(e.target.value)} />
                <div className={ÅbenOpgaveCSS.dynamiskFastButtonsDiv}>
                    <button type="button" className={`${ÅbenOpgaveCSS.dynamiskFastButton} ${dynamiskHonorarBeregning ? '' : ÅbenOpgaveCSS.dynamiskFastButtonActive}`} onClick={() => setDynamiskHonorarBeregning(!dynamiskHonorarBeregning)}>{dynamiskHonorarBeregning ? 'Dynamisk honorar' : 'Fast honorar'}<img src={SwithArrowsBlack} alt="switch" /></button>
                    <button type="button" className={`${ÅbenOpgaveCSS.dynamiskFastButton} ${dynamiskPrisBeregning ? '' : ÅbenOpgaveCSS.dynamiskFastButtonActive}`} onClick={() => setDynamiskPrisBeregning(!dynamiskPrisBeregning)}>{dynamiskPrisBeregning ? 'Dynamisk pris' : 'Fast pris'}<img src={SwithArrowsBlack} alt="switch" /></button>
                </div>
                {!dynamiskHonorarBeregning && 
                <div>
                    <h3 className={ÅbenOpgaveCSS.modalHeading3}>Fast honorar</h3>
                    <div>
                        <input className={ÅbenOpgaveCSS.modalInput} value={posteringFastHonorar} onChange={(e) => setPosteringFastHonorar(e.target.value)} type="number" min="0" inputMode="numeric" pattern="[0-9]*" />
                    </div>
                </div>}
                {!dynamiskPrisBeregning && 
                <div>
                    <h3 className={ÅbenOpgaveCSS.modalHeading3}>Fast pris (ekskl. moms)</h3>
                    <div>
                        <input className={ÅbenOpgaveCSS.modalInput} value={posteringFastPris} onChange={(e) => setPosteringFastPris(e.target.value)} type="number" min="0" inputMode="numeric" pattern="[0-9]*" />
                    </div>
                </div>}
                {(dynamiskHonorarBeregning || dynamiskPrisBeregning) && 
                <div>
                    <h3 className={ÅbenOpgaveCSS.modalHeading3}>Timeregistrering</h3>
                    <div className={ÅbenOpgaveCSS.modalKolonner}>
                        <div>
                            <label className={ÅbenOpgaveCSS.prefix} htmlFor="">Handyman:</label>
                            <input className={ÅbenOpgaveCSS.modalInput} value={handymantimer} onChange={(e) => setHandymantimer(e.target.value)} type="number" min="0" inputMode="numeric" pattern="[0-9]*" />
                        </div>
                        <div>
                            <label className={ÅbenOpgaveCSS.prefix} htmlFor="">Tømrer:</label>
                            <input className={ÅbenOpgaveCSS.modalInput} value={tømrertimer} onChange={(e) => setTømrertimer(e.target.value)} type="number" min="0" inputMode="numeric" pattern="[0-9]*" />
                        </div>
                        <div>
                            <label className={ÅbenOpgaveCSS.prefix} htmlFor="">Rådgivning:</label>
                            <input className={ÅbenOpgaveCSS.modalInput} value={rådgivningOpmålingVejledning} onChange={(e) => setRådgivningOpmålingVejledning(e.target.value)} type="number" min="0" inputMode="numeric" pattern="[0-9]*" />
                        </div>
                    </div>
                    <h3 className={ÅbenOpgaveCSS.modalHeading3}>Tilvalg</h3>
                    <div className={ÅbenOpgaveCSS.posteringSwitchers}>
                        <div className={SwitcherStyles.checkboxContainer}>
                            <label className={SwitcherStyles.switch} htmlFor="opstartsgebyr">
                                <input type="checkbox" id="opstartsgebyr" name="opstartsgebyr" className={SwitcherStyles.checkboxInput} checked={inkluderOpstart === 1 ? true : false} onChange={(e) => setInkluderOpstart(inkluderOpstart === 1 ? 0 : 1)} />
                                <span className={SwitcherStyles.slider}></span>
                            </label>
                            <p>Opstart {dynamiskHonorarBeregning && `(${aktuelleSatser.opstartsgebyrHonorar} kr.)`}</p>
                        </div>
                        <div className={SwitcherStyles.checkboxContainer}>
                            <label className={SwitcherStyles.switch} htmlFor="aftentillæg">
                                <input type="checkbox" id="aftentillæg" name="aftentillæg" className={SwitcherStyles.checkboxInput} checked={aftenTillæg} onChange={(e) => {setAftenTillæg(aftenTillæg === true ? false : true); setNatTillæg(false)}} />
                                <span className={SwitcherStyles.slider}></span>
                            </label>
                            <p>Aftentillæg, kl. 18-23 {dynamiskHonorarBeregning && `(${aktuelleSatser.aftenTillægHonorar} kr./time)`}</p>
                        </div>
                        <div className={SwitcherStyles.checkboxContainer}>
                            <label className={SwitcherStyles.switch} htmlFor="nattillæg">
                                <input type="checkbox" id="nattillæg" name="nattillæg" className={SwitcherStyles.checkboxInput} checked={natTillæg} onChange={(e) => {setNatTillæg(natTillæg === true ? false : true); setAftenTillæg(false)}} />
                                <span className={SwitcherStyles.slider}></span>
                            </label>
                            <p>Nattillæg, kl. 23-07 {dynamiskHonorarBeregning && `(${aktuelleSatser.natTillægHonorar} kr./time)`}</p>
                        </div>
                        <div className={SwitcherStyles.checkboxContainer}>
                            <label className={SwitcherStyles.switch} htmlFor="trailer">
                                <input type="checkbox" id="trailer" name="trailer" className={SwitcherStyles.checkboxInput} checked={trailer} onChange={(e) => setTrailer(trailer === true ? false : true)} />
                                <span className={SwitcherStyles.slider}></span>
                            </label>
                            <p>Trailer {dynamiskHonorarBeregning && `(${aktuelleSatser.trailerHonorar} kr.)`}</p>
                        </div>
                    </div>
                    <h3 className={ÅbenOpgaveCSS.modalHeading3}>Rabat</h3>
                    <p>Rabatter vil kun blive givet på timer & tilvalg, og påvirker både kundens pris og dit honorar.</p>
                    <div className={ÅbenOpgaveCSS.rabatButtonsDiv}>
                        <button type="button" className={`${ÅbenOpgaveCSS.rabatButton} ${rabatProcent === 10 ? ÅbenOpgaveCSS.rabatButtonActive : ''}`} onClick={() => {rabatProcent === 10 ? setRabatProcent(0) : setRabatProcent(10)}}>10% rabat<img src={RabatIcon} alt="switch" /></button>
                        <button type="button" className={`${ÅbenOpgaveCSS.rabatButton} ${rabatProcent === 20 ? ÅbenOpgaveCSS.rabatButtonActive : ''}`} onClick={() => {rabatProcent === 20 ? setRabatProcent(0) : setRabatProcent(20)}}>20% rabat<img src={RabatIcon} alt="switch" /></button>
                    </div>
                    <div className={ÅbenOpgaveCSS.udlæg}>
                        <h3 className={ÅbenOpgaveCSS.modalHeading3}>Udlæg</h3>
                        <div className={ÅbenOpgaveCSS.listeOverUdlæg}>
                        {outlays.map((outlay, index) => (
                            <div className={ÅbenOpgaveCSS.enkeltUdlæg} key={index}>
                                <div className={ÅbenOpgaveCSS.udlægKvittering}>
                                    {outlay.kvittering ? (
                                        <img className={ÅbenOpgaveCSS.udlægKvitteringImg} src={`${import.meta.env.VITE_API_URL}${outlay.kvittering}`} alt={outlay.beskrivelse} />
                                    ) : (
                                        <label>
                                            <div className={ÅbenOpgaveCSS.udlægKvitteringInputContainer} onClick={() => document.getElementById(`ny-udlæg-file-input-${index}`).click()}>
                                            </div>
                                            <input
                                                id={`ny-udlæg-file-input-${index}`}
                                                type="file"
                                                accept="image/*"
                                                className={ÅbenOpgaveCSS.udlægKvitteringInput}
                                                onChange={(e) => {
                                                    const formData = new FormData();
                                                    formData.append('file', e.target.files[0]);
                                                    axios.post(`${import.meta.env.VITE_API_URL}/uploads`, formData, {
                                                        headers: {
                                                            'Content-Type': 'multipart/form-data',
                                                            'Authorization': `Bearer ${user.token}`
                                                        }
                                                    })
                                                    .then(res => {
                                                        console.log(res.data)
                                                        const updatedOutlay = { ...outlays[index], kvittering: res.data.filePath }; // Ensure kvittering is updated correctly
                                                        const newOutlays = [...outlays];
                                                        newOutlays[index] = updatedOutlay; // Replace the outlay at index
                                                        setOutlays(newOutlays);
                                                    })
                                                    .catch(error => console.log(error));
                                                }}
                                            />
                                        </label>
                                    )}
                                </div>
                                <div className={ÅbenOpgaveCSS.udlægBeskrivelse}>
                                    <label className={ÅbenOpgaveCSS.prefix} htmlFor={`beskrivelse-${index}`}>Beskrivelse:</label>
                                    <input
                                        type="text"
                                        className={ÅbenOpgaveCSS.udlægInput}
                                        name="beskrivelse"
                                        id={`beskrivelse-${index}`}
                                        value={outlay.beskrivelse}
                                        onChange={(e) => handleOutlayChange(index, e)}
                                    />
                                </div>
                                <div className={ÅbenOpgaveCSS.udlægBeløb}>
                                    <label className={ÅbenOpgaveCSS.prefix} htmlFor={`beløb-${index}`}>Beløb:</label>
                                    <input
                                        type="number"
                                        className={ÅbenOpgaveCSS.udlægInput}
                                        name="beløb"
                                        id={`beløb-${index}`}
                                        value={outlay.beløb}
                                        onChange={(e) => handleOutlayChange(index, e)}
                                    />
                                </div>
                                <button className={ÅbenOpgaveCSS.sletUdlægButton} onClick={(e) => {e.preventDefault(); deleteOutlay(index)}}>-</button>
                            </div>
                        ))}
                        <button className={ÅbenOpgaveCSS.tilføjUdlægButton} onClick={addOutlay}>+ Nyt udlæg</button>
                        </div>
                        
                    </div>
                </div>}
                <div className={ÅbenOpgaveCSS.previewTotalPostering}>
                    <div className={ÅbenOpgaveCSS.previewHonorarTotal}>
                        <h3 className={ÅbenOpgaveCSS.modalHeading4}>Total: {(dynamiskHonorarBeregning ? previewDynamiskHonorar : posteringFastHonorar).toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}{rabatProcent > 0 && <span className={ÅbenOpgaveCSS.overstregetPreview}>{(((previewDynamiskHonorar - previewDynamiskOutlays) / (100 - rabatProcent) * 100) + previewDynamiskOutlays).toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>}</h3>
                        <p className={ÅbenOpgaveCSS.modalSubheading}>Dit honorar for posteringen</p>
                    </div>
                    <button className={ÅbenOpgaveCSS.registrerPosteringButtonDesktop} type="submit">Registrér postering</button>
                    <button className={ÅbenOpgaveCSS.registrerPosteringButtonMobile} type="submit">Registrér</button>
                </div>
            </form>
        </Modal>
    )
}

export default AddPostering