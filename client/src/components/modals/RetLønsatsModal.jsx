import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import Modal from '../Modal.jsx'
import satser from '../../variables'
import Styles from './RetSatserModal.module.css'
import PosteringLønsatserForhåndsvisning from '../PosteringLønsatserForhåndsvisning.jsx'
import { useAuthContext } from '../../hooks/useAuthContext'

const RetLønsatsModal = (props) => {
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

    const gemLønsatser = () => {
        const nyeLønsatser = forhåndsvistPostering.satser;
        const manglendeFelt = Object.entries(nyeLønsatser).find(([key, value]) => value === undefined || value === null || value === '');
        
        if (manglendeFelt) {
            const [key] = manglendeFelt;
            alert(`Feltet "${key}" mangler en værdi`);
            return;
        }

        axios.patch(`${import.meta.env.VITE_API_URL}/posteringer/${forhåndsvistPostering._id}`, {
            satser: nyeLønsatser
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
            console.error('Fejl ved opdatering af lønsatser:', error);
        });
    }
      
      

  return (
    <Modal trigger={props.trigger} setTrigger={props.setTrigger} ref={containerRef}> 
        <h2>Ret lønsatser for postering</h2>
        {/* {console.log(scale)} */}
        <div className={Styles.posteringContainer} style={{maxHeight: `${scale * 350}px`}}>
            <div className={Styles.posteringScalableContainer} style={{transform: `scale(${scale})`}}>
                <PosteringLønsatserForhåndsvisning forhåndsvistPostering={forhåndsvistPostering} />
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
                <label className={Styles.label}>Opstart (pr. gebyr)</label>
                <div className={Styles.inputWrapper}>
                    <input
                        type="text"
                        inputMode="numeric"
                        onFocus={handleFocus}
                    onWheel={(e) => e.target.blur()}
                    placeholder={"Oprindelig: " + oprindeligeSatser.opstartsgebyrHonorar}
                    className={Styles.input}
                    value={forhåndsvistPostering.satser.opstartsgebyrHonorar}
                    onChange={(e) =>
                        {if (!isNaN(e.target.value)) {
                            setForhåndsvistPostering({
                            ...forhåndsvistPostering,
                            satser: { ...forhåndsvistPostering.satser, opstartsgebyrHonorar: e.target.value === '' ? "" : Number(e.target.value) },
                            })
                        }
                    }}
                    />
                    <span className={Styles.postfix}>kr.</span>
                </div>
            </div>
            <div className={Styles.inputLine}>
                <label className={Styles.label}>Handyman (pr. time)</label>
                <div className={Styles.inputWrapper}>
                    <input
                    type="text"
                    inputMode="numeric"
                    onFocus={handleFocus}
                    onWheel={(e) => e.target.blur()}
                    placeholder={"Oprindelig: " + oprindeligeSatser.handymanTimerHonorar}
                    className={Styles.input}
                    value={forhåndsvistPostering.satser.handymanTimerHonorar}
                    onChange={(e) =>
                        {if (!isNaN(e.target.value)) {
                            setForhåndsvistPostering({
                            ...forhåndsvistPostering,
                            satser: { ...forhåndsvistPostering.satser, handymanTimerHonorar: e.target.value === '' ? "" : Number(e.target.value) },
                            })
                        }}
                    }
                    />
                    <span className={Styles.postfix}>kr.</span>
                </div>
            </div>
            <div className={Styles.inputLine}>
                <label className={Styles.label}>Tømrer (pr. time)</label>
                <div className={Styles.inputWrapper}>
                    <input
                    type="text"
                    inputMode="numeric"
                    onFocus={handleFocus}
                    onWheel={(e) => e.target.blur()}
                    placeholder={"Oprindelig: " + oprindeligeSatser.tømrerTimerHonorar}
                    className={Styles.input}
                    value={forhåndsvistPostering.satser.tømrerTimerHonorar}
                    onChange={(e) =>
                        {if (!isNaN(e.target.value)) {
                            setForhåndsvistPostering({
                            ...forhåndsvistPostering,
                            satser: { ...forhåndsvistPostering.satser, tømrerTimerHonorar: e.target.value === '' ? "" : Number(e.target.value) },
                            })
                        }}
                    }
                    />
                    <span className={Styles.postfix}>kr.</span>
                </div>
            </div>
            <div className={Styles.inputLine}>
                <label className={Styles.label}>Rådgivning (pr. time)</label>
                <div className={Styles.inputWrapper}>
                    <input
                    type="text"
                    inputMode="numeric"
                    onFocus={handleFocus}
                    onWheel={(e) => e.target.blur()}
                    placeholder={"Oprindelig: " + oprindeligeSatser.rådgivningOpmålingVejledningHonorar}
                    className={Styles.input}
                    value={forhåndsvistPostering.satser.rådgivningOpmålingVejledningHonorar}
                    onChange={(e) =>
                        {if (!isNaN(e.target.value)) {
                            setForhåndsvistPostering({
                            ...forhåndsvistPostering,
                            satser: { ...forhåndsvistPostering.satser, rådgivningOpmålingVejledningHonorar: e.target.value === '' ? "" : Number(e.target.value) },
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
                    placeholder={"Oprindelig: " + oprindeligeSatser.aftenTillægHonorar + "%"}
                    className={Styles.input}
                    value={forhåndsvistPostering.satser.aftenTillægHonorar}
                    onChange={(e) =>
                        {if (!isNaN(e.target.value)) {
                            setForhåndsvistPostering({
                                ...forhåndsvistPostering,
                                satser: { ...forhåndsvistPostering.satser, aftenTillægHonorar: e.target.value === '' ? "" : Number(e.target.value) },
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
                    placeholder={"Oprindelig: " + oprindeligeSatser.natTillægHonorar + "%"}
                    className={Styles.input}
                    value={forhåndsvistPostering.satser.natTillægHonorar}
                    onChange={(e) =>
                        {if (!isNaN(e.target.value)) {
                            setForhåndsvistPostering({
                            ...forhåndsvistPostering,
                            satser: { ...forhåndsvistPostering.satser, natTillægHonorar: e.target.value === '' ? "" : Number(e.target.value) },
                            })
                        }}
                    }
                    />
                    <span className={Styles.postfix}>%</span>
                </div>
            </div>
            <div className={Styles.inputLine}>
                <label className={Styles.label}>Trailer (pr. gebyr)</label>
                <div className={Styles.inputWrapper}>
                    <input
                    type="text"
                    inputMode="numeric"
                    onFocus={handleFocus}
                    onWheel={(e) => e.target.blur()}
                    placeholder={"Oprindelig: " + oprindeligeSatser.trailerHonorar}
                    className={Styles.input}
                    value={forhåndsvistPostering.satser.trailerHonorar}
                    onChange={(e) =>
                        {if (!isNaN(e.target.value)) {
                            setForhåndsvistPostering({
                            ...forhåndsvistPostering,
                            satser: { ...forhåndsvistPostering.satser, trailerHonorar: e.target.value === '' ? "" : Number(e.target.value) },
                            })
                        }}
                    }
                    />
                    <span className={Styles.postfix}>kr.</span>
                </div>
            </div>
            <div style={{margin: 20, marginTop: 30}}>
                <button className={Styles.button} onClick={() => gemLønsatser()}>Gem lønsatser</button>
            </div>
        </div>
    </Modal>
  )
}

export default RetLønsatsModal

