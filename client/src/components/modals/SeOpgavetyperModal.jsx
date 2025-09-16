import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Modal from '../Modal.jsx'
import Styles from './SeOpgavetyperModal.module.css'
import { CirclePlus, ChevronLeft, Hammer, Undo2, Box, Trash2 } from 'lucide-react'
import PageAnimation from '../PageAnimation.jsx'
import InputsContainer from '../basicComponents/inputs/InputsContainer.jsx'
import InputLine from '../basicComponents/inputs/InputLine.jsx'
import SelectLine from '../basicComponents/inputs/SelectLine.jsx'
import SliderLine from '../basicComponents/inputs/SliderLine.jsx'
import Button from '../basicComponents/buttons/button.jsx'

const SeOpgavetyperModal = (props) => {

    const opgavetyper = props?.opgavetyper;
    const user = props.user;
    const opgavekategorier = props?.kategorier || [];

    const [opretNyOpgavetype, setOpretNyOpgavetype] = useState(false)
    const [opretNyOpgavekategori, setOpretNyOpgavekategori] = useState(false)
    const [redigerOpgavetype, setRedigerOpgavetype] = useState(false);
    const [errorMessage, setErrorMessage] = useState("")


    // state managers for oprettelse af ny opgavetype
    const [nyOpgavetypeNavn, setNyOpgavetypeNavn] = useState("")
    const [nyOpgavetypeKategori, setNyOpgavetypeKategori] = useState("")
    const [nyOpgavetypeAndenKategori, setNyOpgavetypeAndenKategori] = useState("")
    const [nyOpgavetypeKompleksitet, setNyOpgavetypeKompleksitet] = useState(1)

    // state manager for oprettelse af ny kategori
    const [nyKategoriNavn, setNyKategoriNavn] = useState("");

    const kompleksitetLabels = {
        1: "Simpel",
        2: "Middel",
        3: "Kompleks"
    };

    const opgavetyperByKategori = {};
    
    opgavetyper.forEach(opgavetype => {
        opgavetype.kategorier.forEach(kategori => {
            if (!opgavetyperByKategori[kategori]) {
                opgavetyperByKategori[kategori] = [];
            }
            opgavetyperByKategori[kategori].push(opgavetype);
        });
    });

    const openRedigerOpgavetype = (opgavetype) => {
        setRedigerOpgavetype({
            ...opgavetype,
            kategori1: opgavetype.kategorier[0] || "",
            kategori2: opgavetype.kategorier[1] || ""
        });
    };
    

    const handleReset = () => {
        setNyOpgavetypeKategori("")
        setNyOpgavetypeAndenKategori("")
        setNyOpgavetypeNavn("")
        setNyOpgavetypeKompleksitet(1)
    }

    const nyOpgavetype = {
        "opgavetype": nyOpgavetypeNavn,
        "kategorier": [nyOpgavetypeKategori, nyOpgavetypeAndenKategori].filter(Boolean),
        "kompleksitet": nyOpgavetypeKompleksitet
    }
     
    const handleSubmitNyOpgavetype = () => {

        if(!nyOpgavetypeKategori){
            setErrorMessage("Du skal vælge en kategori.");
            setTimeout(() => setErrorMessage(""), 5000); // fjerner beskeden efter 5 sekunder
            return;
        }

        axios.post(`${import.meta.env.VITE_API_URL}/opgavetyper/`, nyOpgavetype, {
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        })
        .then(res => {
            console.log(res.data)
            props.setRefetchOpgavetyper(!props.refetchOpgavetyper)
            setTimeout(() => setOpretNyOpgavetype(false), 500)
            handleReset();
        })
        .catch(error => {
            console.log(error)
        })
    }

    const handleOpretNyOpgaveKategori = () => {
        if(!(nyKategoriNavn.length > 2)){
            setErrorMessage("Du skal navngive den nye opgavetype.");
            setTimeout(() => setErrorMessage(""), 5000);
            return
        }

        if(opgavekategorier.some(kategori => (kategori.toLowerCase === nyKategoriNavn.toLowerCase))){
            setErrorMessage("Der findes allerede en kategori med samme navn.")
            console.log("Der findes allerede en kategori med samme navn.")
            setTimeout(() => setErrorMessage(""), 5000);
            return
        }
    }

    const handleUpdateOpgavetype = () => {
        const updated = {
            opgavetype: redigerOpgavetype.opgavetype,
            kategorier: [redigerOpgavetype.kategori1, redigerOpgavetype.kategori2].filter(Boolean),
            kompleksitet: redigerOpgavetype.kompleksitet
        };
    
        axios.patch(`${import.meta.env.VITE_API_URL}/opgavetyper/${redigerOpgavetype._id}`, updated, {
            headers: { 'Authorization': `Bearer ${user.token}` }
        })
        .then(res => {
            console.log(res.data);
            props.setRefetchOpgavetyper(!props.refetchOpgavetyper);
            setRedigerOpgavetype(null);
        })
        .catch(console.log);
    };

    const handleDeleteOpgavetype = () => {
        if (!redigerOpgavetype?._id) return;
    
        if (!window.confirm(`Er du sikker på, at du vil slette opgavetypen "${redigerOpgavetype.opgavetype}"?`)) {
            return;
        }
    
        axios.delete(`${import.meta.env.VITE_API_URL}/opgavetyper/${redigerOpgavetype._id}`, {
            headers: { 'Authorization': `Bearer ${user.token}` }
        })
        .then(res => {
            console.log("Slettet:", res.data);
            props.setRefetchOpgavetyper(!props.refetchOpgavetyper);
            setRedigerOpgavetype(null);
        })
        .catch(error => {
            console.error("Fejl ved sletning:", error);
        });
    };
    
    

    return (
        <Modal trigger={props.trigger} setTrigger={props.setTrigger} >
            {(!opretNyOpgavetype && !redigerOpgavetype && !opretNyOpgavekategori) && <PageAnimation>
            <h2 className={Styles.modalHeader}>Opgavetyper</h2>
            <p className={Styles.modalDescription}>Hvis en medarbejder kan løse en specifik type opgave kan medarbejderen tilvælge den pågældende opgavetype under sine arbejdspræferencer. Booking-systemet vil i så fald tage udgangspunkt i disse opgavetyper når nye opgaver skal uddelegeres.</p>
            {opgavetyper.length === 0 && <p>Ingen opgavetyper fundet.</p>}
            {opgavetyper.length > 0 && (
                <div className={Styles.opgavetypeKategorierContainer}>
                    {Object.entries(opgavetyperByKategori).map(([kategori, typer]) => (
                        <div key={kategori} className={Styles.opgavetypeKategori}>
                            <h3><Box />{kategori}</h3>
                            <div className={Styles.opgavetypePillContainer}>
                                {typer.map(t => (
                                    <div className={Styles.opgavetypePill} key={t._id} onClick={() => openRedigerOpgavetype(t)}>
                                        {t.opgavetype}
                                    </div>
                                ))}
                                <div className={`${Styles.opgavetypePill} ${Styles.addNewOpgavetypePill}`} onClick={() => {setNyOpgavetypeKategori(kategori); setOpretNyOpgavetype(true)}}>
                                    + Tilføj ...
                                </div>
                            </div>
                        </div>
                    ))}
                    
                </div>
            )}
            <div className={Styles.buttons}>
                <button className={Styles.opretOpgavetypeButton} onClick={() => setOpretNyOpgavetype(true)}><CirclePlus className={Styles.buttonIcon} />Opret opgavetype</button>
                <button className={Styles.opretOpgavetypeButton} onClick={() => setOpretNyOpgavekategori(true)}><CirclePlus className={Styles.buttonIcon} />Opret kategori</button>
            </div>
            </PageAnimation>}
            {opretNyOpgavetype && <PageAnimation>
                <div className={Styles.subpageHeader}>
                    <ChevronLeft className={Styles.tilbageKnap} onClick={() => setOpretNyOpgavetype(false)} />
                    <h2>Opret ny opgavetype</h2>
                </div>
                <p className={Styles.subpageBeskrivelse}>Husk: Opgavetypen skal kunne bruges til at opdele dine medarbejdere efter kompetencer.</p>
                <form action="">
                    <InputsContainer>
                        <InputLine label={"Navn"} placeholder={"Fx 'Ophængning af billeder'"} required={true} value={nyOpgavetypeNavn} onChange={setNyOpgavetypeNavn} />
                        <SelectLine label="Kategori" options={opgavekategorier} value={nyOpgavetypeKategori} onChange={setNyOpgavetypeKategori} />
                        <div className={`${Styles.animatedContainer} ${nyOpgavetypeKategori ? Styles.show : ""}`}>
                            <SelectLine label="Ekstra kategori (valgfri)" options={opgavekategorier} value={nyOpgavetypeAndenKategori} onChange={setNyOpgavetypeAndenKategori} />
                        </div>
                        <SliderLine label="Kompleksitet" description="Vælg et niveau" name="prioritet" value={nyOpgavetypeKompleksitet} readableValue={kompleksitetLabels[nyOpgavetypeKompleksitet]} onChange={setNyOpgavetypeKompleksitet} min={1} max={3} />
                    </InputsContainer>
                    <Button variant={"primary"} marginTop={20} onClick={() => handleSubmitNyOpgavetype()}>
                        <Hammer />Opret opgavetype
                    </Button>
                    {errorMessage && <p className={Styles.errorMessage}>{errorMessage}</p>}
                    <div className={Styles.flexButtonsDiv}>
                        <Button variant={"secondary"} onClick={() => setOpretNyOpgavetype(false)}>
                            Annuller
                        </Button>
                        <Button variant={"secondary"} onClick={() => handleReset()}>
                            <Undo2 />Start forfra
                        </Button>
                    </div>
                </form>
            </PageAnimation>}
            
            {redigerOpgavetype && (
                <PageAnimation>
                    <div className={Styles.subpageHeader}>
                        <ChevronLeft className={Styles.tilbageKnap} onClick={() => setRedigerOpgavetype(null)} />
                        <h2>Rediger opgavetype</h2>
                    </div>
                    <form>
                        <InputsContainer>
                            <InputLine 
                                label="Navn" 
                                value={redigerOpgavetype.opgavetype} 
                                onChange={val => setRedigerOpgavetype({...redigerOpgavetype, opgavetype: val})} 
                            />
                            <SelectLine 
                                label="Kategori" 
                                options={opgavekategorier} 
                                value={redigerOpgavetype.kategori1} 
                                onChange={val => setRedigerOpgavetype({...redigerOpgavetype, kategori1: val})} 
                            />
                            <SelectLine 
                                label="Ekstra kategori (valgfri)" 
                                options={opgavekategorier} 
                                value={redigerOpgavetype.kategori2} 
                                onChange={val => setRedigerOpgavetype({...redigerOpgavetype, kategori2: val})} 
                            />
                            <SliderLine 
                                label="Kompleksitet" 
                                min={1} max={3} 
                                value={redigerOpgavetype.kompleksitet} 
                                readableValue={kompleksitetLabels[redigerOpgavetype.kompleksitet]} 
                                onChange={val => setRedigerOpgavetype({...redigerOpgavetype, kompleksitet: val})} 
                            />
                        </InputsContainer>
                        <Button variant="primary" marginTop={20} onClick={handleUpdateOpgavetype}>
                            <Hammer /> Opdater opgavetype
                        </Button>
                        <div className={Styles.flexButtonsDiv}>
                        <Button variant="secondary" onClick={() => handleDeleteOpgavetype()}>
                            <Trash2 />
                            Slet opgavetype
                        </Button>
                        <Button variant="secondary" onClick={() => setRedigerOpgavetype({...redigerOpgavetype, kategori2: ""})}>
                            <Undo2 />
                            Fjern ekstra kategori
                        </Button>
                        </div>
                        <Button variant="secondary" onClick={() => setRedigerOpgavetype(null)}>Annuller</Button>
                    </form>
                </PageAnimation>
            )}

            {opretNyOpgavekategori && <PageAnimation>
                <div className={Styles.subpageHeader}>
                    <ChevronLeft className={Styles.tilbageKnap} onClick={() => setOpretNyOpgavekategori(false)} />
                    <h2>Opret ny opgavekategori</h2>
                </div>
                <div>
                    <b>Nuværende kategorier:</b>
                    <div className={Styles.kategorierContainer}>
                    <div className={Styles.opgavetypePillContainer}>
                        {opgavekategorier?.map(kategori => (
                            <div className={Styles.opgavetypePill} key={kategori}>
                                <Box />
                                {kategori}
                            </div>
                        ))}
                    </div>
                    </div>
                </div>
                <form action="">
                    <InputsContainer>
                        <InputLine label={"Kategoriens navn"} placeholder={"Fx 'Transport'"} required={true} value={nyKategoriNavn} onChange={setNyKategoriNavn} />
                    </InputsContainer>
                    <div className={Styles.buttonsDiv}>
                    <Button variant='primary' disabled={!(nyKategoriNavn.length > 2)} onClick={() => handleOpretNyOpgaveKategori()}>Opret kategori</Button>
                    {errorMessage && <p className={Styles.errorMessage}>{errorMessage}</p>}
                    <Button variant='secondary' onClick={() => setOpretNyOpgavekategori(null)}>Annuller</Button>
                    </div>
                </form>
            </PageAnimation>}
        </Modal>
    )
}

export default SeOpgavetyperModal