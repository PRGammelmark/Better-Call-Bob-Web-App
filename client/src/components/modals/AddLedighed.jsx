import React, { useState, useEffect } from 'react'
import axios from 'axios'
import ModalStyles from '../modals/Modal.module.css'
import dayjs from 'dayjs'
import satser from '../../variables'

const AddLedighed = (props) => {

    const [addLedighed, setAddLedighed] = useState(false)

    return (
        <Modal trigger={addLedighed} setTrigger={setAddLedighed}>
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
)}

export default AddLedighed