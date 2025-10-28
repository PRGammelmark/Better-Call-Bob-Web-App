import React from 'react'
import ModalStyles from '../../Modal.module.css'
import Modal from '../../Modal.jsx'
import { useState, useEffect } from 'react'
import dayjs from 'dayjs'
import axios from 'axios'
import { useAuthContext } from '../../../hooks/useAuthContext.js'
import { useBesøg } from '../../../context/BesøgContext.jsx'
import { useTaskAndDate } from '../../../context/TaskAndDateContext.jsx'

const TilføjLedighed = (props) => {
    const { user } = useAuthContext();
    const userID = user?.id || user?._id;
    const { chosenDate, setChosenDate, chosenTask } = useTaskAndDate();
    const { refetchBesøg, setRefetchBesøg, refetchLedigeTider, setRefetchLedigeTider, egneLedigeTider, medarbejdere } = useBesøg();
    const [selectedTimeFrom, setSelectedTimeFrom] = useState("08:00");
    const [selectedTimeTo, setSelectedTimeTo] = useState("09:00");
    const [selectedWeekday, setSelectedWeekday] = useState("1");
    const [regelmæssigLedighedDatoFra, setRegelmæssigLedighedDatoFra] = useState("");
    const [weekdays, setWeekdays] = useState([]);
    const [opretLedighedError, setOpretLedighedError] = useState("");
    const [opretLedighedSuccess, setOpretLedighedSuccess] = useState(false);
    const [tilføjRegelmæssigLedighed, setTilføjRegelmæssigLedighed] = useState(false);

    useEffect(() => {
        let currentDate = dayjs() || regelmæssigLedighedDatoFra;
        const endDate = chosenDate && dayjs(chosenDate).format("YYYY-MM-DD");
        const ugedage = [];

        while (currentDate.isBefore(endDate) || currentDate.isSame(endDate, 'day')) {
            if (currentDate.day() === Number(selectedWeekday)) {
                ugedage.push(currentDate.format("YYYY-MM-DD"));
            }
            currentDate = currentDate.add(1, 'day');
        }
        setWeekdays(ugedage);
    }, [regelmæssigLedighedDatoFra, chosenDate, selectedWeekday])
    
    function submitNewRegelmæssigLedighed(e){
        e.preventDefault();

        const tidFra = "T" + selectedTimeFrom + ":00.000" + dayjs().format("Z");
        const tidTil = "T" + selectedTimeTo + ":00.000" + dayjs().format("Z");

        const ledighedsDage = weekdays.map(day => ({
            datoTidFra: dayjs(`${day}${tidFra}`),
            datoTidTil: dayjs(`${day}${tidTil}`),
            brugerID: userID,
            objectIsLedigTid: true
        }));

        if (ledighedsDage.length === 0) {
            setOpretLedighedError("Ingen dage valgt.")
            setTimeout(() => {
                setOpretLedighedError("")
            }, 5000)
            return
        }
        
        if (selectedTimeFrom >= selectedTimeTo) {
            setOpretLedighedError("'Fra kl.' skal være før 'Til kl.'.")
            setTimeout(() => {
                setOpretLedighedError("")
            }, 5000)
            return
        }

        const tempEgneLedigeTider = egneLedigeTider;

        ledighedsDage.forEach(ledigTid => {
            const overlappingTider = tempEgneLedigeTider.filter(tid => 
                (dayjs(ledigTid.datoTidFra).isBefore(dayjs(tid.datoTidTil)) && dayjs(ledigTid.datoTidTil).isAfter(dayjs(tid.datoTidFra)))
            );

            if (overlappingTider.length > 0) {
                const minDatoTidFra = dayjs.min(overlappingTider.map(tid => dayjs(tid.datoTidFra)));
                const maxDatoTidTil = dayjs.max(overlappingTider.map(tid => dayjs(tid.datoTidTil)));

                if (dayjs(ledigTid.datoTidFra).isAfter(minDatoTidFra)) {
                    ledigTid.datoTidFra = minDatoTidFra.format("YYYY-MM-DDTHH:mm:ss.SSS");
                }

                if (dayjs(ledigTid.datoTidTil).isBefore(maxDatoTidTil)) {
                    ledigTid.datoTidTil = maxDatoTidTil.format("YYYY-MM-DDTHH:mm:ss.SSS");
                }

                overlappingTider.forEach(tid => {
                        axios.delete(`${import.meta.env.VITE_API_URL}/ledige-tider/${tid._id}`, {
                            headers: {
                                'Authorization': `Bearer ${user.token}`
                            }
                        })
                        .then(res => {
                            console.log("Overlapping ledig tid slettet", res.data)
                        })
                        .catch(error => console.log(error))
                });
            }
        });
        
        axios.post(`${import.meta.env.VITE_API_URL}/ledige-tider`, ledighedsDage, {
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        })
        .then(res => {
            refetchLedigeTider ? setRefetchLedigeTider(false) : setRefetchLedigeTider(true)
            setOpretLedighedSuccess("Ledighed tilføjet!")
            setTimeout(() => {
                setOpretLedighedSuccess("")
            }, 5000)
            
        })
        .catch(error => console.log(error))

        setModalOpen(false);
    }

    function submitNewEnkeltLedighed(e){
        e.preventDefault();

        const datoTidFra = `${chosenDate ? dayjs(chosenDate).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD")}T${selectedTimeFrom}:00.000${dayjs().format("Z")}`;
        const datoTidTil = `${chosenDate ? dayjs(chosenDate).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD")}T${selectedTimeTo}:00.000${dayjs().format("Z")}`;

        const enkeltLedighed = {
            datoTidFra,
            datoTidTil,
            brugerID: userID,
            objectIsLedigTid: true
        }

        if (selectedTimeFrom >= selectedTimeTo) {
            setOpretLedighedError("'Fra kl.' skal være før 'Til kl.'.")
            setTimeout(() => {
                setOpretLedighedError("")
            }, 5000)
            return
        }

        const tempEgneLedigeTider = egneLedigeTider;

        const overlappingTider = tempEgneLedigeTider.filter(tid => 
            (dayjs(enkeltLedighed.datoTidFra).isBefore(dayjs(tid.datoTidTil)) && dayjs(enkeltLedighed.datoTidTil).isAfter(dayjs(tid.datoTidFra)))
        );

        if (overlappingTider.length > 0) {
            const minDatoTidFra = dayjs.min(overlappingTider.map(tid => dayjs(tid.datoTidFra)));
                       const maxDatoTidTil = dayjs.max(overlappingTider.map(tid => dayjs(tid.datoTidTil)));

                       if (dayjs(enkeltLedighed.datoTidFra).isAfter(minDatoTidFra)) {
                enkeltLedighed.datoTidFra = minDatoTidFra.format("YYYY-MM-DDTHH:mm:ss.SSS");
            }

            if (dayjs(enkeltLedighed.datoTidTil).isBefore(maxDatoTidTil)) {
                enkeltLedighed.datoTidTil = maxDatoTidTil.format("YYYY-MM-DDTHH:mm:ss.SSS");
            }

            overlappingTider.forEach(tid => {
                    axios.delete(`${import.meta.env.VITE_API_URL}/ledige-tider/${tid._id}`, {
                        headers: {
                            'Authorization': `Bearer ${user.token}`
                        }
                    })
                    .then(res => {
                        console.log("Overlapping ledig tid slettet", res.data)
                    })
                    .catch(error => console.log(error))
            });
        }

        axios.post(`${import.meta.env.VITE_API_URL}/ledige-tider`, enkeltLedighed, {
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        })
        .then(res => {
            refetchLedigeTider ? setRefetchLedigeTider(false) : setRefetchLedigeTider(true)
            setOpretLedighedSuccess("Ledighed tilføjet!")
            setTimeout(() => {
                setOpretLedighedSuccess("")
            }, 5000)
        })
        .catch(error => console.log(error))
    }

  return (
    <Modal trigger={props.trigger} setTrigger={props.setTrigger}>
            <h2 className={ModalStyles.modalHeading}>Tilføj ledighed</h2>
            {tilføjRegelmæssigLedighed ? 
            <p className={ModalStyles.modalLink} onClick={() => setTilføjRegelmæssigLedighed(false)}>Tilføj ledighed for enkeltdato</p> : <p className={ModalStyles.modalLink} onClick={() => setTilføjRegelmæssigLedighed(true)}>Tilføj regelmæssig ledighed</p>}
            {tilføjRegelmæssigLedighed ? 
            <form action="" onSubmit={submitNewRegelmæssigLedighed}>
                <label className={ModalStyles.modalLabel} htmlFor="besøg-tid-fra">Meld dig ledig fra kl.</label>
                <div className={ModalStyles.timeInputs}>
                    <div className={ModalStyles.timeInput}>
                        <input className={ModalStyles.modalInput} type="time" id="besøg-tid-fra" value={selectedTimeFrom} onChange={(e) => setSelectedTimeFrom(e.target.value)} />
                    </div>
                    <div className={ModalStyles.timeSeparator}>–</div>
                    <div className={ModalStyles.timeInput}>
                        <input className={ModalStyles.modalInput} type="time" id="besøg-tid-til" value={selectedTimeTo} onChange={(e) => setSelectedTimeTo(e.target.value)} />
                    </div>
                </div>
                <label className={ModalStyles.modalLabel} htmlFor="ledighed-ugedag">hver</label>
                <select className={ModalStyles.modalInput} id="ledighed-ugedag" value={selectedWeekday} onChange={(e) => setSelectedWeekday(e.target.value)}>
                    <option value="1">mandag</option>
                    <option value="2">tirsdag</option>
                    <option value="3">onsdag</option>
                    <option value="4">torsdag</option>
                    <option value="5">fredag</option>
                    <option value="6">lørdag</option>
                    <option value="0">søndag</option>
                </select>
                <label className={ModalStyles.modalLabel} htmlFor="ledighed-dato-fra">fra</label>
                <input className={ModalStyles.modalInput} type="date" id="ledighed-dato-fra" value={regelmæssigLedighedDatoFra ? dayjs(regelmæssigLedighedDatoFra).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD")} onChange={(e) => setRegelmæssigLedighedDatoFra(e.target.value)} />
                <label className={ModalStyles.modalLabel} htmlFor="ledighed-dato-til">indtil</label>
                <input className={ModalStyles.modalInput} type="date" id="ledighed-dato-til" value={chosenDate ? dayjs(chosenDate).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD")} onChange={(e) => setChosenDate(e.target.value)} />
                <p><b className={ModalStyles.bold}>{weekdays.length > 0 ? weekdays.length : "Ingen dage"} {weekdays.length > 0 ? (selectedWeekday === "1" ? "mandag" : selectedWeekday === "2" ? "tirsdag" : selectedWeekday === "3" ? "onsdag" : selectedWeekday === "4" ? "torsdag" : selectedWeekday === "5" ? "fredag" : selectedWeekday === "6" ? "lørdag" : "søndag") : ""}{weekdays.length > 1 ? "e" : ""}</b> i markeret interval.</p>
                <button className={ModalStyles.buttonFullWidth}>Tilføj ledighed</button>
                {opretLedighedError && <p className={ModalStyles.errorMessage}>{opretLedighedError}</p>}
                {opretLedighedSuccess && <p className={ModalStyles.successMessage}>Ledighed tilføjet!</p>}
            </form>
            :
            <form action="" onSubmit={submitNewEnkeltLedighed}>
                <label className={ModalStyles.modalLabel} htmlFor="ledighed-dato">Dato</label>
                <input className={ModalStyles.modalInput} type="date" id="ledighed-dato" value={chosenDate ? dayjs(chosenDate).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD")} onChange={(e) => setChosenDate(e.target.value)} />
                <label className={ModalStyles.modalLabel} htmlFor="besøg-tid-fra">Tid</label>
                <div className={ModalStyles.timeInputs}>
                    <div className={ModalStyles.timeInput}>
                        <input className={ModalStyles.modalInput} type="time" id="besøg-tid-fra" value={selectedTimeFrom} onChange={(e) => setSelectedTimeFrom(e.target.value)} />
                    </div>
                    <div className={ModalStyles.timeSeparator}>–</div>
                    <div className={ModalStyles.timeInput}>
                        <input className={ModalStyles.modalInput} type="time" id="besøg-tid-til" value={selectedTimeTo} onChange={(e) => setSelectedTimeTo(e.target.value)} />
                    </div>
                </div>
                <button className={ModalStyles.buttonFullWidth}>Tilføj ledighed</button>
                {opretLedighedError && <p className={ModalStyles.errorMessage}>{opretLedighedError}</p>}
                {opretLedighedSuccess && <p className={ModalStyles.successMessage}>{opretLedighedSuccess}</p>}
            </form>}
        </Modal>
  )
}

export default TilføjLedighed
