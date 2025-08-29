import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Modal from '../Modal.jsx'
import styles from './RedigerKundesPriser.module.css'
import SwitcherStyles from '../../pages/Switcher.module.css' 
import satser from '../../variables'
import { RotateCcw, Pin, Trash2 } from 'lucide-react'
import { useAuthContext } from '../../hooks/useAuthContext'
import PageAnimation from '../PageAnimation'

const RedigerKundesPriser = (props) => {
    const kunde = props.kunde
    const [kundePriser, setKundePriser] = useState(satser)
    const [visInklMoms, setVisInklMoms] = useState(false)
    const [fastfrysEllerFjern, setFastfrysEllerFjern] = useState(false)

    const {user} = useAuthContext();

    const prisSatser = Object.fromEntries(
        Object.entries(satser).filter(([key]) => !key.includes("Honorar"))
    )

    useEffect(() => {
        setKundePriser(kunde && kunde.satser ? kunde.satser : prisSatser)
        console.log(kunde?.satser)
    }, [kunde])

    function deepEqual(a, b) {
        if (a === b) return true;
      
        if (typeof a !== "object" || a === null ||
            typeof b !== "object" || b === null) {
          return false;
        }
      
        // Arrays
        if (Array.isArray(a) && Array.isArray(b)) {
          if (a.length !== b.length) return false;
          for (let i = 0; i < a.length; i++) {
            if (!deepEqual(a[i], b[i])) return false;
          }
          return true;
        }
      
        // Objects
        const keysA = Object.keys(a);
        const keysB = Object.keys(b);
      
        if (keysA.length !== keysB.length) return false;
      
        for (let key of keysA) {
          if (!keysB.includes(key) || !deepEqual(a[key], b[key])) {
            return false;
          }
        }
      
        return true;
    }
      

    const handleChange = (field, value, isProcent = false) => {
        if (isNaN(value)) return
        // procentfelter gemmes som de er
        if (isProcent) {
            setKundePriser({ ...kundePriser, [field]: value })
        } else {
            const valEkskl = visInklMoms ? value / 1.25 : value
            setKundePriser({ ...kundePriser, [field]: valEkskl })
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault()

        if (deepEqual(kundePriser, prisSatser)) {
            setFastfrysEllerFjern(true)
            return
        }
        
        const kundePriserUdenHonorar = Object.fromEntries(
            Object.entries(kundePriser).filter(([key]) => !key.includes("Honorar"))
        )

        axios.patch(`${import.meta.env.VITE_API_URL}/kunder/${kunde._id}`, {
            satser: kundePriserUdenHonorar
        }, {
            headers: {
                "Authorization": `Bearer ${user.token}`
            }
        })
        .then(res => {
            console.log(res)
            props.setTrigger(false)
            props.setOpdaterKunde(prev => !prev)
        })
        .catch(err => {
            console.log(err)
        })
    }

    const fastfrysPrissats = () => {
        const kundePriserUdenHonorar = Object.fromEntries(
            Object.entries(kundePriser).filter(([key]) => !key.includes("Honorar"))
        )

        axios.patch(`${import.meta.env.VITE_API_URL}/kunder/${kunde._id}`, {
            satser: kundePriserUdenHonorar
        }, {
            headers: {
                "Authorization": `Bearer ${user.token}`
            }
        })
        .then(res => {
            console.log(res)
            setFastfrysEllerFjern(false)
            props.setTrigger(false)
            props.setOpdaterKunde(prev => !prev)
        })
        .catch(err => {
            console.log(err)
        })
    }

    const fjernSpecialpriser = () => {

        axios.patch(`${import.meta.env.VITE_API_URL}/kunder/${kunde._id}`, {
            satser: null
        }, {
            headers: {
                "Authorization": `Bearer ${user.token}`
            }
        })
        .then(res => {
            console.log(res)
            setFastfrysEllerFjern(false)
            props.setTrigger(false)
            props.setOpdaterKunde(prev => !prev)
        })
        .catch(err => {
            console.log(err)
        })
    }

    const formatValue = (val, isProcent = false) => {
        if (val === null || val === undefined) return ""
        return isProcent ? val : (visInklMoms ? Math.round(val * 1.25) : val)
    }

    return (
        <Modal trigger={props.trigger} setTrigger={props.setTrigger}>
            <h2 className={styles.modalHeading}>Indstil prissatser for kunde: {kunde && kunde.navn}</h2>

            {fastfrysEllerFjern ? (
                <PageAnimation>
                <div className={styles.fastfrysEllerFjernContainer}>
                    <p>Du er ved at indstille kundens satser til de nuværende standardpriser. Vil du fastfryse kundens prissatser, så fremtidige globale prisændringer ikke vil påvirke kundens priser, eller skal kundens prissatser fjernes, så kundens priserfremover følge med den globale prisudvikling?</p>
                    <div style={{display: "flex", gap: 10}}>
                        <button className={styles.submitButton} onClick={() => fastfrysPrissats()}><Pin style={{width: 16, height: 16}} /> Fastfrys kundens prissatser</button>
                        <button className={styles.submitButton} onClick={() => fjernSpecialpriser()}><Trash2 style={{width: 16, height: 16}} /> Fjern specialpriser</button>
                    </div>
                    <button className={styles.sekundærButton} onClick={() => setFastfrysEllerFjern(false)}>Annullér</button>
                </div>
                </PageAnimation>
            ) : (
                <>

            {/* Switcher til inkl moms */}
            <PageAnimation>
            <div className={SwitcherStyles.checkboxContainer} style={{marginBottom: 20}}>
                <label className={SwitcherStyles.switch} htmlFor="visInklMoms">
                    <input
                        type="checkbox"
                        id="visInklMoms"
                        name="visInklMoms"
                        className={SwitcherStyles.checkboxInput}
                        checked={visInklMoms}
                        onChange={(e) => setVisInklMoms(e.target.checked)}
                    />
                    <span className={SwitcherStyles.slider}></span>
                </label>
                <p style={{ fontSize: 14, fontFamily: "OmnesBold" }}>
                    Vis og redigér priser inkl. moms
                </p>
            </div>

            <form onSubmit={handleSubmit}>
                <div className={styles.inputLinesContainer}>
                    <div className={styles.inputLine}>
                        <label className={styles.label}>Handymantimer<br /><span className={styles.subLabel}>Kr./timen</span></label>
                        <input
                            className={styles.modalInput}
                            type="number"
                            value={formatValue(kundePriser.handymanTimerPris)}
                            onChange={(e) => handleChange("handymanTimerPris", parseFloat(e.target.value))}
                        />
                    </div>
                    <div className={styles.inputLine}>
                        <label className={styles.label}>Tømrertimer<br /><span className={styles.subLabel}>Kr./timen</span></label>
                        <input
                            className={styles.modalInput}
                            type="number"
                            value={formatValue(kundePriser.tømrerTimerPris)}
                            onChange={(e) => handleChange("tømrerTimerPris", parseFloat(e.target.value))}
                        />
                    </div>
                    <div className={styles.inputLine}>
                        <label className={styles.label}>Rådgivning/opmåling<br /><span className={styles.subLabel}>Kr./timen</span></label>
                        <input
                            className={styles.modalInput}
                            type="number"
                            value={formatValue(kundePriser.rådgivningOpmålingVejledningPris)}
                            onChange={(e) => handleChange("rådgivningOpmålingVejledningPris", parseFloat(e.target.value))}
                        />
                    </div>
                    <div className={styles.inputLine}>
                        <label className={styles.label}>Opstartsgebyr<br /><span className={styles.subLabel}>Kr./gang</span></label>
                        <input
                            className={styles.modalInput}
                            type="number"
                            value={formatValue(kundePriser.opstartsgebyrPris)}
                            onChange={(e) => handleChange("opstartsgebyrPris", parseFloat(e.target.value))}
                        />
                    </div>
                    <div className={styles.inputLine}>
                        <label className={styles.label}>Aftentillæg<br /><span className={styles.subLabel}>Procent-tillæg til timepriser</span></label>
                        <input
                            className={styles.modalInput}
                            type="number"
                            value={formatValue(kundePriser.aftenTillægPris, true)}
                            onChange={(e) => handleChange("aftenTillægPris", parseFloat(e.target.value), true)}
                        />
                    </div>
                    <div className={styles.inputLine}>
                        <label className={styles.label}>Nattillæg<br /><span className={styles.subLabel}>Procent-tillæg til timepriser</span></label>
                        <input
                            className={styles.modalInput}
                            type="number"
                            value={formatValue(kundePriser.natTillægPris, true)}
                            onChange={(e) => handleChange("natTillægPris", parseFloat(e.target.value), true)}
                        />
                    </div>
                    <div className={styles.inputLine}>
                        <label className={styles.label}>Trailer<br /><span className={styles.subLabel}>Kr./gang</span></label>
                        <input
                            className={styles.modalInput}
                            type="number"
                            value={formatValue(kundePriser.trailerPris)}
                            onChange={(e) => handleChange("trailerPris", parseFloat(e.target.value))}
                        />
                    </div>
                </div>

                <div className={styles.obsInfo}>
                    <p>OBS! Ændringer i kundens prissatser gælder kun fremtidige posteringer – ikke nuværende eller tidligere. Du vil stadig kunne tilpasse enkelte posteringers prissatser manuelt fremover, selvom du sætter kundens specifikke satser her.</p>
                </div>
                <button className={styles.submitButton}><b style={{fontFamily: "OmnesBold"}}>Gem prissatser</b></button>
                <button type="button" className={styles.sekundærButton} onClick={() => setKundePriser(prisSatser)}>Gendan standardpriser<RotateCcw style={{width: 14, height: 14}} /></button>
            </form>
            </PageAnimation>
            </>
            )}
        </Modal>
    )
}

export default RedigerKundesPriser
