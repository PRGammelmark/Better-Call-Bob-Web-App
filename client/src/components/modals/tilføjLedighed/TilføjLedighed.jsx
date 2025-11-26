import React from 'react'
import ModalStyles from '../../Modal.module.css'
import Modal from '../../Modal.jsx'
import { useState, useEffect } from 'react'
import dayjs from 'dayjs'
import axios from 'axios'
import { useAuthContext } from '../../../hooks/useAuthContext.js'
import { useBesøg } from '../../../context/BesøgContext.jsx'
import DateLine from '../../basicComponents/inputs/DateLine.jsx'
import TimeRangeLine from '../../basicComponents/inputs/TimeRangeLine.jsx'
import SelectLine from '../../basicComponents/inputs/SelectLine.jsx'
import SwitchLine from '../../basicComponents/inputs/SwitchLine.jsx'
import InputsContainer from '../../basicComponents/inputs/InputsContainer.jsx'
import Button from '../../basicComponents/buttons/Button.jsx'

const TilføjLedighed = (props) => {
    const { user } = useAuthContext();
    const userID = user?.id || user?._id;
    const { refetchLedigeTider, setRefetchLedigeTider, egneLedigeTider } = useBesøg();
    const [selectedTimeFrom, setSelectedTimeFrom] = useState("08:00");
    const [selectedTimeTo, setSelectedTimeTo] = useState("09:00");
    const [selectedWeekday, setSelectedWeekday] = useState("1");
    const [fraDato, setFraDato] = useState(dayjs().format("YYYY-MM-DD"));
    const [indtilDato, setIndtilDato] = useState("");
    const [gentag, setGentag] = useState(false);
    const [weekdays, setWeekdays] = useState([]);
    const [opretLedighedError, setOpretLedighedError] = useState("");
    const [opretLedighedSuccess, setOpretLedighedSuccess] = useState(false);

    useEffect(() => {
        if (!gentag || !indtilDato) {
            setWeekdays([]);
            return;
        }

        let currentDate = fraDato ? dayjs(fraDato) : dayjs();
        const endDate = indtilDato ? dayjs(indtilDato) : null;
        const ugedage = [];

        // Inkluder altid fra-datoen
        if (fraDato) {
            ugedage.push(fraDato);
        }

        // Find alle matchende ugedage efter fra-datoen
        if (endDate && (currentDate.isBefore(endDate) || currentDate.isSame(endDate, 'day'))) {
            // Start fra dagen efter fra-datoen
            currentDate = currentDate.add(1, 'day');
            while (currentDate.isBefore(endDate) || currentDate.isSame(endDate, 'day')) {
                if (currentDate.day() === Number(selectedWeekday)) {
                    ugedage.push(currentDate.format("YYYY-MM-DD"));
                }
                currentDate = currentDate.add(1, 'day');
            }
        }
        setWeekdays(ugedage);
    }, [fraDato, indtilDato, selectedWeekday, gentag])
    
    function submitLedighed(e){
        e.preventDefault();

        if (selectedTimeFrom >= selectedTimeTo) {
            setOpretLedighedError("'Fra kl.' skal være før 'Til kl.'.")
            setTimeout(() => {
                setOpretLedighedError("")
            }, 5000)
            return
        }

        const tidFra = "T" + selectedTimeFrom + ":00.000" + dayjs().format("Z");
        const tidTil = "T" + selectedTimeTo + ":00.000" + dayjs().format("Z");

        let ledighedsDage = [];

        if (gentag) {
            // Regelmæssig ledighed
            if (weekdays.length === 0) {
                setOpretLedighedError("Ingen dage valgt.")
                setTimeout(() => {
                    setOpretLedighedError("")
                }, 5000)
                return
            }

            ledighedsDage = weekdays.map(day => ({
                datoTidFra: dayjs(`${day}${tidFra}`),
                datoTidTil: dayjs(`${day}${tidTil}`),
                brugerID: userID,
                objectIsLedigTid: true
            }));
        } else {
            // Enkelt ledighed
            const datoTidFra = `${fraDato}T${selectedTimeFrom}:00.000${dayjs().format("Z")}`;
            const datoTidTil = `${fraDato}T${selectedTimeTo}:00.000${dayjs().format("Z")}`;

            ledighedsDage = [{
                datoTidFra,
                datoTidTil,
                brugerID: userID,
                objectIsLedigTid: true
            }];
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
            props.setTrigger(false);
        })
        .catch(error => console.log(error))
    }

  const weekdayOptions = [
    { value: "1", label: "mandag" },
    { value: "2", label: "tirsdag" },
    { value: "3", label: "onsdag" },
    { value: "4", label: "torsdag" },
    { value: "5", label: "fredag" },
    { value: "6", label: "lørdag" },
    { value: "0", label: "søndag" }
  ];

  const getWeekdayName = (value) => {
    const option = weekdayOptions.find(opt => opt.value === value);
    return option ? option.label : "";
  };

  return (
    <Modal trigger={props.trigger} setTrigger={props.setTrigger}>
      <h2 className={ModalStyles.modalHeading}>Tilføj ledighed</h2>
      <form action="" onSubmit={submitLedighed}>
        <InputsContainer>
          <TimeRangeLine
            label="Meld dig ledig fra kl."
            name="ledighed-tid"
            timeFrom={selectedTimeFrom}
            timeTo={selectedTimeTo}
            onTimeFromChange={setSelectedTimeFrom}
            onTimeToChange={setSelectedTimeTo}
          />
          <DateLine
            label="Dato"
            name="ledighed-dato"
            value={fraDato}
            onChange={setFraDato}
          />
          <SwitchLine
            label="Gentag"
            name="gentag"
            checked={gentag}
            onChange={setGentag}
          />
          {gentag && (
            <>
              <SelectLine
                label="Hver"
                name="ledighed-ugedag"
                value={selectedWeekday}
                onChange={setSelectedWeekday}
                options={weekdayOptions}
              />
              <DateLine
                label="Indtil"
                name="ledighed-dato-indtil"
                value={indtilDato}
                onChange={setIndtilDato}
              />
            </>
          )}
        </InputsContainer>
        {gentag && weekdays.length > 0 && (
          <p style={{ marginTop: '15px', marginBottom: '10px' }}>
            <b className={ModalStyles.bold}>
              {weekdays.length} dag{weekdays.length > 1 ? "e" : ""}
            </b> i markeret interval (inkl. fra-datoen).
          </p>
        )}
        <Button type="submit" variant="primary" style={{ width: '100%', marginTop: '20px' }}>
          Tilføj ledighed
        </Button>
        {opretLedighedError && <p className={ModalStyles.errorMessage} style={{ marginTop: '10px' }}>{opretLedighedError}</p>}
        {opretLedighedSuccess && <p className={ModalStyles.successMessage} style={{ marginTop: '10px' }}>Ledighed tilføjet!</p>}
      </form>
    </Modal>
  )
}

export default TilføjLedighed
