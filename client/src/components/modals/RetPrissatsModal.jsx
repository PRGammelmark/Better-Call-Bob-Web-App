import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import Modal from '../Modal.jsx'
import satser from '../../variables'
import Styles from './RetSatserModal.module.css'
import PosteringPrissatserForhåndsvisning from '../PosteringPrissatserForhåndsvisning.jsx'
import { useAuthContext } from '../../hooks/useAuthContext'
import dayjs from 'dayjs'

const RetPrissatsModal = (props) => {
    const [forhåndsvistPostering, setForhåndsvistPostering] = useState(props?.postering)
    const [scale, setScale] = useState(1)
    const containerRef = useRef(null)
    const { user } = useAuthContext();
    const oprindeligeSatser = props?.postering?.satser || satser;
    
    // Funktion, der skalerer den forhåndsviste postering ned når man scroller i modalen
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
      
        const handleScroll = () => {
          const scrollTop = el.scrollTop;
          const maxScroll = el.scrollHeight - el.clientHeight;
          const scrollFraction = maxScroll === 0 ? 0 : scrollTop / maxScroll;
          const newScale = 1 - scrollFraction * 0.3;
          setScale(Math.max(0.75, newScale));
        };
      
        el.addEventListener('scroll', handleScroll);
        return () => el.removeEventListener('scroll', handleScroll);
    }, [props.trigger]);

    const handleFocus = (e) => {
        const len = e.target.value.length;
        e.target.setSelectionRange(len, len);
    };

    const gemPrissatser = () => {
        const nyePrissatser = forhåndsvistPostering.satser;
        const manglendeFelt = Object.entries(nyePrissatser).find(([key, value]) => value === undefined || value === null || value === '');
        
        if (manglendeFelt) {
            const [key] = manglendeFelt;
            alert(`Feltet "${key}" mangler en værdi`);
            return;
        }

        axios.patch(`${import.meta.env.VITE_API_URL}/posteringer/${forhåndsvistPostering._id}`, {
            satser: nyePrissatser
        }, {
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        })
        .then(response => {
            console.log(response)
            props.refetchPostering()
            props.setTrigger(false)
        })
        .catch(error => {
            console.error('Fejl ved opdatering af prissatser:', error);
        });
    }

  return (
    <Modal trigger={props.trigger} setTrigger={props.setTrigger} ref={containerRef}> 
        <h2>Ret prissatser for postering</h2>
        {/* {console.log(scale)} */}
        <div className={Styles.posteringContainer} style={{maxHeight: `${scale * 350}px`}}>
            <div className={Styles.posteringScalableContainer} style={{transform: `scale(${scale})`}}>
                <PosteringPrissatserForhåndsvisning forhåndsvistPostering={forhåndsvistPostering} />
            </div>
        </div>
        <div className={Styles.redigerSatserContainer}>
            {/* <div className={Styles.inputLine}>
                <label className={Styles.label}>Opstart (kr. pr. gebyr)</label>
                <input type="number" onWheel={(e) => e.target.blur()} placeholder={"Oprindelig: " + oprindeligeSatser.opstartsgebyrHonorar} className={Styles.input} value={forhåndsvistPostering.satser.opstartsgebyrHonorar} onChange={(e) => {
                    setForhåndsvistPostering({...forhåndsvistPostering, satser: {...forhåndsvistPostering.satser, opstartsgebyrHonorar: e.target.value}})
                }}/>
            </div> */}
            <div className={Styles.inputLine}>
                <label className={Styles.label}>Opstart (pr. gebyr)<br /><p style={{fontSize: 10, color: 'gray', transform: 'translate(0px, -12px)'}}>(u. moms)</p></label>
                <div className={Styles.inputWrapper}>
                    <input
                        type="text"
                        inputMode="numeric"
                        onFocus={handleFocus}
                    onWheel={(e) => e.target.blur()}
                    placeholder={"Oprindelig: " + oprindeligeSatser.opstartsgebyrPris}
                    className={Styles.input}
                    value={forhåndsvistPostering.satser.opstartsgebyrPris}
                    onChange={(e) =>
                        {if (!isNaN(e.target.value)) {
                            setForhåndsvistPostering({
                              ...forhåndsvistPostering,
                              satser: { ...forhåndsvistPostering.satser, opstartsgebyrPris: e.target.value === '' ? "" : Number(e.target.value) },
                            })
                        }
                    }}
                    />
                    <span className={Styles.postfix}>kr.</span>
                </div>
            </div>
            <div className={Styles.inputLine}>
                <label className={Styles.label}>Handyman (pr. time)<br /><p style={{fontSize: 10, color: 'gray', transform: 'translate(0px, -12px)'}}>(u. moms)</p></label>
                <div className={Styles.inputWrapper}>
                    <input
                    type="text"
                    inputMode="numeric"
                    onFocus={handleFocus}
                    onWheel={(e) => e.target.blur()}
                    placeholder={"Oprindelig: " + oprindeligeSatser.handymanTimerPris}
                    className={Styles.input}
                    value={forhåndsvistPostering.satser.handymanTimerPris}
                    onChange={(e) =>
                        {if (!isNaN(e.target.value)) {
                            setForhåndsvistPostering({
                            ...forhåndsvistPostering,
                            satser: { ...forhåndsvistPostering.satser, handymanTimerPris: e.target.value === '' ? "" : Number(e.target.value) },
                            })
                        }}
                    }
                    />
                    <span className={Styles.postfix}>kr.</span>
                </div>
            </div>
            <div className={Styles.inputLine}>
                <label className={Styles.label}>Tømrer (pr. time)<br /><p style={{fontSize: 10, color: 'gray', transform: 'translate(0px, -12px)'}}>(u. moms)</p></label>
                <div className={Styles.inputWrapper}>
                    <input
                    type="text"
                    inputMode="numeric"
                    onFocus={handleFocus}
                    onWheel={(e) => e.target.blur()}
                    placeholder={"Oprindelig: " + oprindeligeSatser.tømrerTimerPris}
                    className={Styles.input}
                    value={forhåndsvistPostering.satser.tømrerTimerPris}
                    onChange={(e) =>
                        {if (!isNaN(e.target.value)) {
                            setForhåndsvistPostering({
                            ...forhåndsvistPostering,
                            satser: { ...forhåndsvistPostering.satser, tømrerTimerPris: e.target.value === '' ? "" : Number(e.target.value) },
                            })
                        }}
                    }
                    />
                    <span className={Styles.postfix}>kr.</span>
                </div>
            </div>
            <div className={Styles.inputLine}>
                <label className={Styles.label}>Rådgivning (pr. time)<br /><p style={{fontSize: 10, color: 'gray', transform: 'translate(0px, -12px)'}}>(u. moms)</p></label>
                <div className={Styles.inputWrapper}>
                    <input
                    type="text"
                    inputMode="numeric"
                    onFocus={handleFocus}
                    onWheel={(e) => e.target.blur()}
                    placeholder={"Oprindelig: " + oprindeligeSatser.rådgivningOpmålingVejledningPris}
                    className={Styles.input}
                    value={forhåndsvistPostering.satser.rådgivningOpmålingVejledningPris}
                    onChange={(e) =>
                        {if (!isNaN(e.target.value)) {
                            setForhåndsvistPostering({
                            ...forhåndsvistPostering,
                            satser: { ...forhåndsvistPostering.satser, rådgivningOpmålingVejledningPris: e.target.value === '' ? "" : Number(e.target.value) },
                            })
                        }}
                    }
                    />
                    <span className={Styles.postfix}>kr.</span>
                </div>
            </div>
            <div className={Styles.inputLine}>
                <label className={Styles.label}>Aftentillæg (ekstra pr. time)</label>
                <div className={Styles.inputWrapper}>
                    <input
                    type="text"
                    inputMode="numeric"
                    onFocus={handleFocus}
                    onWheel={(e) => e.target.blur()}
                    placeholder={"Oprindelig: " + oprindeligeSatser.aftenTillægPris + "%"}
                    className={Styles.input}
                    value={forhåndsvistPostering.satser.aftenTillægPris}
                    onChange={(e) =>
                        {if (!isNaN(e.target.value)) {
                            setForhåndsvistPostering({
                                ...forhåndsvistPostering,
                                satser: { ...forhåndsvistPostering.satser, aftenTillægPris: e.target.value === '' ? "" : Number(e.target.value) },
                            })   
                        }}
                    }
                    />
                    <span className={Styles.postfix}>%</span>
                </div>
            </div>
            <div className={Styles.inputLine}>
                <label className={Styles.label}>Nattilæg (ekstra pr. time)</label>
                <div className={Styles.inputWrapper}>
                    <input
                    type="text"
                    inputMode="numeric"
                    onFocus={handleFocus}
                    onWheel={(e) => e.target.blur()}
                    placeholder={"Oprindelig: " + oprindeligeSatser.natTillægPris + "%"}
                    className={Styles.input}
                    value={forhåndsvistPostering.satser.natTillægPris}
                    onChange={(e) =>
                        {if (!isNaN(e.target.value)) {
                            setForhåndsvistPostering({
                            ...forhåndsvistPostering,
                            satser: { ...forhåndsvistPostering.satser, natTillægPris: e.target.value === '' ? "" : Number(e.target.value) },
                            })
                        }}
                    }
                    />
                    <span className={Styles.postfix}>%</span>
                </div>
            </div>
            <div className={Styles.inputLine}>
                <label className={Styles.label}>Trailer (pr. gebyr)<br /><p style={{fontSize: 10, color: 'gray', transform: 'translate(0px, -12px)'}}>(u. moms)</p></label>
                <div className={Styles.inputWrapper}>
                    <input
                    type="text"
                    inputMode="numeric"
                    onFocus={handleFocus}
                    onWheel={(e) => e.target.blur()}
                    placeholder={"Oprindelig: " + oprindeligeSatser.trailerPris}
                    className={Styles.input}
                    value={forhåndsvistPostering.satser.trailerPris}
                    onChange={(e) =>
                        {if (!isNaN(e.target.value)) {
                            setForhåndsvistPostering({
                            ...forhåndsvistPostering,
                            satser: { ...forhåndsvistPostering.satser, trailerPris: e.target.value === '' ? "" : Number(e.target.value) },
                            })
                        }}
                    }
                    />
                    <span className={Styles.postfix}>kr.</span>
                </div>
            </div>
            <div style={{margin: 20, marginTop: 30}}>
                <button className={Styles.button} onClick={() => gemPrissatser()}>Gem prissatser</button>
            </div>
        </div>
    </Modal>
  )
}

export default RetPrissatsModal

