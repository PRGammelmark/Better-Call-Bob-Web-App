import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Modal from '../Modal.jsx'
import styles from './RedigerLøntrin.module.css'
import SwitcherStyles from '../../pages/Switcher.module.css'
import dayjs from 'dayjs'
import satser from '../../variables'
import SwithArrowsBlack from '../../assets/switchArrowsBlack.svg'
import RabatIcon from '../../assets/rabatIcon.svg'
import { useAuthContext } from '../../hooks/useAuthContext'

const RedigerLøntrin = (props) => {

    const bruger = props.trigger
    const { user } = useAuthContext()
    
    // Dynamiske typer fra API
    const [timetyper, setTimetyper] = useState([]);
    const [fasteTillaeg, setFasteTillaeg] = useState([]);
    const [procentTillaeg, setProcentTillaeg] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Bruger satser - nu som objekt med mappings til dynamiske typer
    const [brugerSatser, setBrugerSatser] = useState({
        timetyper: {},
        fasteTillaeg: {},
        procentTillaeg: {},
        // Legacy felter for bagudkompatibilitet
        handymanTimerHonorar: satser.handymanTimerHonorar,
        tømrerTimerHonorar: satser.tømrerTimerHonorar,
        rådgivningOpmålingVejledningHonorar: satser.rådgivningOpmålingVejledningHonorar,
        opstartsgebyrHonorar: satser.opstartsgebyrHonorar,
        aftenTillægHonorar: satser.aftenTillægHonorar,
        natTillægHonorar: satser.natTillægHonorar,
        trailerHonorar: satser.trailerHonorar
    })
    
    const [forudindstilletLøntrin, setForudindstilletLøntrin] = useState(null)
    const [løntrin, setLøntrin] = useState(null)

    // Hent dynamiske typer fra API
    useEffect(() => {
        if (user?.token) {
            setLoading(true);
            
            Promise.all([
                axios.get(`${import.meta.env.VITE_API_URL}/timetyper/`, {
                    headers: { 'Authorization': `Bearer ${user.token}` }
                }),
                axios.get(`${import.meta.env.VITE_API_URL}/fasteTillaeg/`, {
                    headers: { 'Authorization': `Bearer ${user.token}` }
                }),
                axios.get(`${import.meta.env.VITE_API_URL}/procentTillaeg/`, {
                    headers: { 'Authorization': `Bearer ${user.token}` }
                })
            ])
            .then(([timetyperRes, fasteTillaegRes, procentTillaegRes]) => {
                const sortedTimetyper = timetyperRes.data.filter(t => t.aktiv).sort((a, b) => a.rækkefølge - b.rækkefølge);
                const sortedFasteTillaeg = fasteTillaegRes.data.filter(t => t.aktiv).sort((a, b) => a.rækkefølge - b.rækkefølge);
                const sortedProcentTillaeg = procentTillaegRes.data.filter(t => t.aktiv).sort((a, b) => a.rækkefølge - b.rækkefølge);
                
                setTimetyper(sortedTimetyper);
                setFasteTillaeg(sortedFasteTillaeg);
                setProcentTillaeg(sortedProcentTillaeg);
                setLoading(false);
            })
            .catch(err => {
                console.log(err);
                setLoading(false);
            });
        }
    }, [user?.token]);

    // Reset forudindstillet løntrin når modal åbnes med ny bruger
    useEffect(() => {
        setForudindstilletLøntrin(null)
    }, [props.trigger])
    
    // Initialiser bruger satser når bruger eller dynamiske typer ændres
    useEffect(() => {
        if (!bruger || loading) return;
        
        const eksisterendeSatser = bruger.satser || {};
        
        // Opbyg ny satser struktur
        const nySatser = {
            timetyper: {},
            fasteTillaeg: {},
            procentTillaeg: {},
            // Behold legacy felter for bagudkompatibilitet
            handymanTimerHonorar: eksisterendeSatser.handymanTimerHonorar ?? satser.handymanTimerHonorar,
            tømrerTimerHonorar: eksisterendeSatser.tømrerTimerHonorar ?? satser.tømrerTimerHonorar,
            rådgivningOpmålingVejledningHonorar: eksisterendeSatser.rådgivningOpmålingVejledningHonorar ?? satser.rådgivningOpmålingVejledningHonorar,
            opstartsgebyrHonorar: eksisterendeSatser.opstartsgebyrHonorar ?? satser.opstartsgebyrHonorar,
            aftenTillægHonorar: eksisterendeSatser.aftenTillægHonorar ?? satser.aftenTillægHonorar,
            natTillægHonorar: eksisterendeSatser.natTillægHonorar ?? satser.natTillægHonorar,
            trailerHonorar: eksisterendeSatser.trailerHonorar ?? satser.trailerHonorar
        };
        
        // Timetyper: Brug eksisterende mapping eller fallback til standard kostpris
        timetyper.forEach(timetype => {
            const eksisterendeSats = eksisterendeSatser.timetyper?.[timetype._id];
            nySatser.timetyper[timetype._id] = {
                navn: timetype.navn,
                honorarSats: typeof eksisterendeSats === 'object' && eksisterendeSats?.honorarSats 
                    ? eksisterendeSats.honorarSats 
                    : (typeof eksisterendeSats === 'number' ? eksisterendeSats : timetype.kostpris)
            };
        });
        
        // Faste tillæg
        fasteTillaeg.forEach(tillaeg => {
            const eksisterendeSats = eksisterendeSatser.fasteTillaeg?.[tillaeg._id];
            nySatser.fasteTillaeg[tillaeg._id] = {
                navn: tillaeg.navn,
                honorarSats: typeof eksisterendeSats === 'object' && eksisterendeSats?.honorarSats 
                    ? eksisterendeSats.honorarSats 
                    : (typeof eksisterendeSats === 'number' ? eksisterendeSats : tillaeg.kostpris)
            };
        });
        
        // Procent tillæg
        procentTillaeg.forEach(tillaeg => {
            const eksisterendeSats = eksisterendeSatser.procentTillaeg?.[tillaeg._id];
            nySatser.procentTillaeg[tillaeg._id] = {
                navn: tillaeg.navn,
                honorarSats: typeof eksisterendeSats === 'object' && eksisterendeSats?.honorarSats 
                    ? eksisterendeSats.honorarSats 
                    : (typeof eksisterendeSats === 'number' ? eksisterendeSats : tillaeg.kostSats)
            };
        });
        
        setBrugerSatser(nySatser);
    }, [bruger, timetyper, fasteTillaeg, procentTillaeg, loading]);

    // Beregn akkumulerede standard satser
    const beregnAkkumuleredeStandardSatser = () => {
        let total = 0;
        
        // Timetyper standard kostpris
        timetyper.forEach(timetype => {
            total += Number(timetype.kostpris || 0);
        });
        
        // Faste tillæg standard kostpris
        fasteTillaeg.forEach(tillaeg => {
            total += Number(tillaeg.kostpris || 0);
        });
        
        // Procent tillæg standard kostSats
        procentTillaeg.forEach(tillaeg => {
            total += Number(tillaeg.kostSats || 0);
        });
        
        // Fallback til legacy satser hvis ingen dynamiske typer
        if (total === 0) {
            total = Number(satser.handymanTimerHonorar) + 
                    Number(satser.tømrerTimerHonorar) + 
                    Number(satser.rådgivningOpmålingVejledningHonorar) + 
                    Number(satser.opstartsgebyrHonorar) + 
                    Number(satser.aftenTillægHonorar) + 
                    Number(satser.natTillægHonorar) + 
                    Number(satser.trailerHonorar);
        }
        
        return total;
    };

    // Beregn akkumulerede bruger satser
    const beregnAkkumuleredeBrugerSatser = () => {
        let total = 0;
        
        // Timetyper bruger satser
        timetyper.forEach(timetype => {
            const sats = brugerSatser.timetyper?.[timetype._id];
            const honorarSats = typeof sats === 'object' && sats?.honorarSats ? sats.honorarSats : (sats || timetype.kostpris || 0);
            total += Number(honorarSats);
        });
        
        // Faste tillæg bruger satser
        fasteTillaeg.forEach(tillaeg => {
            const sats = brugerSatser.fasteTillaeg?.[tillaeg._id];
            const honorarSats = typeof sats === 'object' && sats?.honorarSats ? sats.honorarSats : (sats || tillaeg.kostpris || 0);
            total += Number(honorarSats);
        });
        
        // Procent tillæg bruger satser
        procentTillaeg.forEach(tillaeg => {
            const sats = brugerSatser.procentTillaeg?.[tillaeg._id];
            const honorarSats = typeof sats === 'object' && sats?.honorarSats ? sats.honorarSats : (sats || tillaeg.kostSats || 0);
            total += Number(honorarSats);
        });
        
        // Fallback til legacy satser hvis ingen dynamiske typer
        if (total === 0) {
            total = Number(brugerSatser.handymanTimerHonorar || 0) + 
                    Number(brugerSatser.tømrerTimerHonorar || 0) + 
                    Number(brugerSatser.rådgivningOpmålingVejledningHonorar || 0) + 
                    Number(brugerSatser.opstartsgebyrHonorar || 0) + 
                    Number(brugerSatser.aftenTillægHonorar || 0) + 
                    Number(brugerSatser.natTillægHonorar || 0) + 
                    Number(brugerSatser.trailerHonorar || 0);
        }
        
        return total;
    };

    // Beregn løntrin når satser ændres
    useEffect(() => {
        const akkumuleredeStandardSatser = beregnAkkumuleredeStandardSatser();
        const akkumuleredeBrugerSatser = beregnAkkumuleredeBrugerSatser();
        
        if (akkumuleredeStandardSatser > 0) {
            const updatedLøntrin = Math.floor((akkumuleredeBrugerSatser / akkumuleredeStandardSatser) * 10);
            setLøntrin(updatedLøntrin);
        }
    }, [brugerSatser, timetyper, fasteTillaeg, procentTillaeg]);

    // Indstil løntrin - opdater alle satser til et givent løntrin
    const indstilLøntrin = (løntrinNummer) => {
        const løntrinTilSatser = løntrinNummer * 10; // løntrin 5 = 50%, løntrin 10 = 100%
        
        const nySatser = {
            timetyper: {},
            fasteTillaeg: {},
            procentTillaeg: {},
            // Legacy felter
            handymanTimerHonorar: Math.round(satser.handymanTimerHonorar * (løntrinTilSatser / 100)),
            tømrerTimerHonorar: Math.round(satser.tømrerTimerHonorar * (løntrinTilSatser / 100)),
            rådgivningOpmålingVejledningHonorar: Math.round(satser.rådgivningOpmålingVejledningHonorar * (løntrinTilSatser / 100)),
            opstartsgebyrHonorar: Math.round(satser.opstartsgebyrHonorar * (løntrinTilSatser / 100)),
            aftenTillægHonorar: Math.round(satser.aftenTillægHonorar * (løntrinTilSatser / 100)),
            natTillægHonorar: Math.round(satser.natTillægHonorar * (løntrinTilSatser / 100)),
            trailerHonorar: Math.round(satser.trailerHonorar * (løntrinTilSatser / 100))
        };
        
        // Beregn satser for dynamiske typer
        timetyper.forEach(timetype => {
            nySatser.timetyper[timetype._id] = {
                navn: timetype.navn,
                honorarSats: Math.round(timetype.kostpris * (løntrinTilSatser / 100))
            };
        });
        
        fasteTillaeg.forEach(tillaeg => {
            nySatser.fasteTillaeg[tillaeg._id] = {
                navn: tillaeg.navn,
                honorarSats: Math.round(tillaeg.kostpris * (løntrinTilSatser / 100))
            };
        });
        
        procentTillaeg.forEach(tillaeg => {
            nySatser.procentTillaeg[tillaeg._id] = {
                navn: tillaeg.navn,
                honorarSats: Math.round(tillaeg.kostSats * (løntrinTilSatser / 100))
            };
        });
        
        setForudindstilletLøntrin(løntrinNummer);
        setBrugerSatser(nySatser);
    };

    // Opdater enkelt timetype sats
    const updateTimetypeSats = (timetypeId, value) => {
        const timetype = timetyper.find(t => t._id === timetypeId);
        setBrugerSatser(prev => ({
            ...prev,
            timetyper: {
                ...prev.timetyper,
                [timetypeId]: {
                    navn: timetype?.navn || '',
                    honorarSats: Number(value) || 0
                }
            }
        }));
        setForudindstilletLøntrin(null);
    };

    // Opdater enkelt fast tillæg sats
    const updateFastTillaegSats = (tillaegId, value) => {
        const tillaeg = fasteTillaeg.find(t => t._id === tillaegId);
        setBrugerSatser(prev => ({
            ...prev,
            fasteTillaeg: {
                ...prev.fasteTillaeg,
                [tillaegId]: {
                    navn: tillaeg?.navn || '',
                    honorarSats: Number(value) || 0
                }
            }
        }));
        setForudindstilletLøntrin(null);
    };

    // Opdater enkelt procent tillæg sats
    const updateProcentTillaegSats = (tillaegId, value) => {
        const tillaeg = procentTillaeg.find(t => t._id === tillaegId);
        setBrugerSatser(prev => ({
            ...prev,
            procentTillaeg: {
                ...prev.procentTillaeg,
                [tillaegId]: {
                    navn: tillaeg?.navn || '',
                    honorarSats: Number(value) || 0
                }
            }
        }));
        setForudindstilletLøntrin(null);
    };

    const handleSubmit = (e) => {
        e.preventDefault()
        
        axios.patch(`${import.meta.env.VITE_API_URL}/brugere/${bruger._id}`, {
            satser: brugerSatser
        }, {
            headers: {
                "Authorization": `Bearer ${user.token}`
            }
        })
        .then(res => {
            console.log(res)
            props.setTrigger(false)
            // Trigger refetch af brugere hvis callback er givet
            if (props.onUpdate) {
                props.onUpdate();
            }
        })
        .catch(err => {
            console.log(err)
        })
    }

    // Vis loading state
    if (loading) {
        return (
            <Modal trigger={props.trigger} setTrigger={props.setTrigger}>
                <h2 className={styles.modalHeading}>Indlæser...</h2>
            </Modal>
        );
    }

    return (
        <Modal trigger={props.trigger} setTrigger={props.setTrigger} style={{backgroundColor: 'red'}}>
            <h2 className={styles.modalHeading}>Indstil lønsatser for {bruger && bruger.navn?.split(' ')[0]}</h2>
            <form action="" onSubmit={handleSubmit}>
                <b style={{fontFamily: 'OmnesBold'}}>Nuværende løntrin: {løntrin}</b>
                <p className={styles.infoText}>Løntrinnet er baseret på forholdet mellem medarbejderens lønsatser og standardsatser.</p>
                
                {/* Timetyper */}
                {timetyper.length > 0 && (
                    <>
                        <h3 className={styles.modalHeading3}>Timetyper (ekskl. moms)</h3>
                        <div className={styles.inputLinesContainer}>
                            {timetyper.map(timetype => (
                                <div key={timetype._id} className={styles.inputLine}>
                                    <label className={styles.label} htmlFor={`timetype-${timetype._id}`}>
                                        {timetype.navn}<br />
                                        <span className={styles.subLabel}>Kr./timen (standard: {timetype.kostpris})</span>
                                    </label>
                                    <input 
                                        className={styles.modalInput} 
                                        type="number" 
                                        id={`timetype-${timetype._id}`}
                                        value={typeof brugerSatser.timetyper?.[timetype._id] === 'object' 
                                            ? brugerSatser.timetyper[timetype._id].honorarSats 
                                            : (brugerSatser.timetyper?.[timetype._id] ?? timetype.kostpris)} 
                                        min={0} 
                                        max={9999} 
                                        onChange={(e) => updateTimetypeSats(timetype._id, e.target.value)}
                                    />
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* Faste tillæg */}
                {fasteTillaeg.length > 0 && (
                    <>
                        <h3 className={styles.modalHeading3}>Faste tillæg (ekskl. moms)</h3>
                        <div className={styles.inputLinesContainer}>
                            {fasteTillaeg.map(tillaeg => (
                                <div key={tillaeg._id} className={styles.inputLine}>
                                    <label className={styles.label} htmlFor={`fasttillaeg-${tillaeg._id}`}>
                                        {tillaeg.navn}<br />
                                        <span className={styles.subLabel}>Kr./gang (standard: {tillaeg.kostpris})</span>
                                    </label>
                                    <input 
                                        className={styles.modalInput} 
                                        type="number" 
                                        id={`fasttillaeg-${tillaeg._id}`}
                                        value={typeof brugerSatser.fasteTillaeg?.[tillaeg._id] === 'object' 
                                            ? brugerSatser.fasteTillaeg[tillaeg._id].honorarSats 
                                            : (brugerSatser.fasteTillaeg?.[tillaeg._id] ?? tillaeg.kostpris)} 
                                        min={0} 
                                        max={9999} 
                                        onChange={(e) => updateFastTillaegSats(tillaeg._id, e.target.value)}
                                    />
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* Procent tillæg */}
                {procentTillaeg.length > 0 && (
                    <>
                        <h3 className={styles.modalHeading3}>Procent tillæg</h3>
                        <div className={styles.inputLinesContainer}>
                            {procentTillaeg.map(tillaeg => (
                                <div key={tillaeg._id} className={styles.inputLine}>
                                    <label className={styles.label} htmlFor={`procenttillaeg-${tillaeg._id}`}>
                                        {tillaeg.navn}<br />
                                        <span className={styles.subLabel}>% tillæg (standard: {tillaeg.kostSats}%)</span>
                                    </label>
                                    <input 
                                        className={styles.modalInput} 
                                        type="number" 
                                        id={`procenttillaeg-${tillaeg._id}`}
                                        value={typeof brugerSatser.procentTillaeg?.[tillaeg._id] === 'object' 
                                            ? brugerSatser.procentTillaeg[tillaeg._id].honorarSats 
                                            : (brugerSatser.procentTillaeg?.[tillaeg._id] ?? tillaeg.kostSats)} 
                                        min={0} 
                                        max={999} 
                                        onChange={(e) => updateProcentTillaegSats(tillaeg._id, e.target.value)}
                                    />
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* Fallback til legacy felter hvis ingen dynamiske typer */}
                {timetyper.length === 0 && fasteTillaeg.length === 0 && procentTillaeg.length === 0 && (
                    <>
                        <h3 className={styles.modalHeading3}>Lønsatser (ekskl. moms)</h3>
                        <div className={styles.inputLinesContainer}>
                            <div className={styles.inputLine}>
                                <label className={styles.label} htmlFor="">Handymantimer<br /><span className={styles.subLabel}>Kr./timen</span></label>
                                <input className={styles.modalInput} type="number" value={brugerSatser.handymanTimerHonorar} min={0} max={999} onChange={(e) => {setBrugerSatser({...brugerSatser, handymanTimerHonorar: e.target.value}), setForudindstilletLøntrin(null)}}/>
                            </div>
                            <div className={styles.inputLine}>
                                <label className={styles.label} htmlFor="">Tømrertimer <br /><span className={styles.subLabel}>Kr./timen</span></label>
                                <input className={styles.modalInput} type="number" value={brugerSatser.tømrerTimerHonorar} min={0} max={999} onChange={(e) => {setBrugerSatser({...brugerSatser, tømrerTimerHonorar: e.target.value}), setForudindstilletLøntrin(null)}}/>
                            </div>
                            <div className={styles.inputLine}>
                                <label className={styles.label} htmlFor="">Rådgivning/opmåling <br /><span className={styles.subLabel}>Kr./timen</span></label>
                                <input className={styles.modalInput} type="number" value={brugerSatser.rådgivningOpmålingVejledningHonorar} min={0} max={999} onChange={(e) => {setBrugerSatser({...brugerSatser, rådgivningOpmålingVejledningHonorar: e.target.value}), setForudindstilletLøntrin(null)}}/>
                            </div>
                            <div className={styles.inputLine}>
                                <label className={styles.label} htmlFor="">Opstartsgebyr <br /><span className={styles.subLabel}>Kr./gang</span></label>
                                <input className={styles.modalInput} type="number" value={brugerSatser.opstartsgebyrHonorar} min={0} max={999} onChange={(e) => {setBrugerSatser({...brugerSatser, opstartsgebyrHonorar: e.target.value}), setForudindstilletLøntrin(null)}}/>
                            </div>
                            <div className={styles.inputLine}>
                                <label className={styles.label} htmlFor="">Aftentillæg <br /><span className={styles.subLabel}>% pr. time</span></label>
                                <input className={styles.modalInput} type="number" value={brugerSatser.aftenTillægHonorar} min={0} max={999} onChange={(e) => {setBrugerSatser({...brugerSatser, aftenTillægHonorar: e.target.value}), setForudindstilletLøntrin(null)}}/>
                            </div>
                            <div className={styles.inputLine}>
                                <label className={styles.label} htmlFor="">Nattillæg <br /><span className={styles.subLabel}>% pr. time</span></label>
                                <input className={styles.modalInput} type="number" value={brugerSatser.natTillægHonorar} min={0} max={999} onChange={(e) => {setBrugerSatser({...brugerSatser, natTillægHonorar: e.target.value}), setForudindstilletLøntrin(null)}}/>
                            </div>
                            <div className={styles.inputLine}>
                                <label className={styles.label} htmlFor="">Trailer <br /><span className={styles.subLabel}>Kr./gang</span></label>
                                <input className={styles.modalInput} type="number" value={brugerSatser.trailerHonorar} min={0} max={999} onChange={(e) => {setBrugerSatser({...brugerSatser, trailerHonorar: e.target.value}), setForudindstilletLøntrin(null)}}/>
                            </div>
                        </div>
                    </>
                )}

                <h3 className={styles.modalHeading3}>Indstil minimumssatser til løntrin</h3>
                <div className={styles.lynButtonContainer}>
                    <button type="button" className={`${styles.lynButton} ${forudindstilletLøntrin === 5 ? styles.activeLynButton : ''}`} onClick={() => indstilLøntrin(5)}>Løntrin 5</button>
                    <button type="button" className={`${styles.lynButton} ${forudindstilletLøntrin === 6 ? styles.activeLynButton : ''}`} onClick={() => indstilLøntrin(6)}>Løntrin 6</button>
                    <button type="button" className={`${styles.lynButton} ${forudindstilletLøntrin === 7 ? styles.activeLynButton : ''}`} onClick={() => indstilLøntrin(7)}>Løntrin 7</button>
                    <button type="button" className={`${styles.lynButton} ${forudindstilletLøntrin === 8 ? styles.activeLynButton : ''}`} onClick={() => indstilLøntrin(8)}>Løntrin 8</button>
                    <button type="button" className={`${styles.lynButton} ${forudindstilletLøntrin === 9 ? styles.activeLynButton : ''}`} onClick={() => indstilLøntrin(9)}>Løntrin 9</button>
                    <button type="button" className={`${styles.lynButton} ${forudindstilletLøntrin === 10 ? styles.activeLynButton : ''}`} onClick={() => indstilLøntrin(10)}>Løntrin 10</button>
                </div>
                <div className={styles.obsInfo}>
                    <p>OBS! Ændringer i medarbejderens lønsatser gælder for fremtidige posteringer – ikke nuværende eller tidligere.</p>
                </div>
                <button className={styles.submitButton}><b>Gem lønsatser</b></button>
            </form>
        </Modal>
    )
}

export default RedigerLøntrin
