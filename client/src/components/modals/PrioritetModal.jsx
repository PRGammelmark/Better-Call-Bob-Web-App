import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Modal from '../Modal.jsx'
import Styles from './PrioritetModal.module.css'
import { Plus, Minus } from 'lucide-react'
import Button from '../basicComponents/buttons/Button.jsx'

const PrioritetModal = (props) => {
    const { trigger, setTrigger, user, bruger, refetchBruger, setRefetchBruger } = props;
    const [prioritet, setPrioritet] = useState(bruger?.prioritet ?? 3);

    useEffect(() => {
        setPrioritet(bruger?.prioritet ?? 3);
    }, [bruger]);

    const incrementPrioritet = () => {
        if (prioritet < 5) {
            setPrioritet(prioritet + 1);
        }
    };

    const decrementPrioritet = () => {
        if (prioritet > 1) {
            setPrioritet(prioritet - 1);
        }
    };

    const handleInputChange = (e) => {
        const value = parseInt(e.target.value);
        if (!isNaN(value)) {
            if (value < 1) {
                setPrioritet(1);
            } else if (value > 5) {
                setPrioritet(5);
            } else {
                setPrioritet(value);
            }
        }
    };

    const gemPrioritet = async () => {
        try {
            await axios.patch(`${import.meta.env.VITE_API_URL}/brugere/${bruger._id}`, {
                prioritet: prioritet
            }, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setRefetchBruger(!refetchBruger);
            setTrigger(false);
        } catch (err) {
            console.error(err);
            alert("Noget gik galt ved gem.");
        }
    };

    return (
        <Modal trigger={trigger} setTrigger={setTrigger}>
            <h2 className={Styles.modalHeader}>Indstil prioritet for {bruger?.navn.split(' ')[0]}</h2>
            <p className={Styles.modalDescription} style={{marginBottom: 10}}>Indstil prioritet fra 1-5.</p>
            <p className={Styles.modalDescription}>
                Højt prioriterede medarbejdere vil bl.a.:
                <ul style={{marginLeft: 20}}>
                    <li>dukke først op i søgninger</li>
                    <li>blive anbefalet til udvalgte typer af opgaver</li>
                    <li>have forrang til opgaver uddelegeret af bookingsystemet</li>
                </ul>
            </p>
            
            <div className={Styles.prioritetContainer}>
                <div className={Styles.prioritetInputWrapper}>
                    <button 
                        className={`${Styles.prioritetButton} ${Styles.prioritetButtonLeft}`}
                        onClick={decrementPrioritet}
                        disabled={prioritet <= 1}
                        aria-label="Sænk prioritet"
                    >
                        <Minus size={20} />
                    </button>
                    <input
                        type="number"
                        min="1"
                        max="5"
                        value={prioritet}
                        onChange={handleInputChange}
                        className={Styles.prioritetInput}
                    />
                    <button 
                        className={`${Styles.prioritetButton} ${Styles.prioritetButtonRight}`}
                        onClick={incrementPrioritet}
                        disabled={prioritet >= 5}
                        aria-label="Hæv prioritet"
                    >
                        <Plus size={20} />
                    </button>
                </div>
            </div>

            <div className={Styles.buttonsDiv}>
                <Button variant="primary" onClick={gemPrioritet}>Gem</Button>
                <Button variant="secondary" onClick={() => setTrigger(false)}>Annuller</Button>
            </div>
        </Modal>
    );
};

export default PrioritetModal;

