import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Modal from '../Modal.jsx'
import Styles from './VælgOpgavetyperModal.module.css'
import { Box, Check } from 'lucide-react'
import Button from '../basicComponents/buttons/button.jsx'

const VælgOpgavetyperModal = (props) => {
    const { trigger, setTrigger, user, bruger, opgavetyper, refetchBruger, setRefetchBruger } = props;
    const [valgteOpgavetyper, setValgteOpgavetyper] = useState(bruger?.opgavetyper || []);

    useEffect(() => {
        setValgteOpgavetyper(bruger?.opgavetyper || []);
    }, [bruger]);

    const opgavetyperByKategori = {};
    opgavetyper?.forEach(opgavetype => {
        opgavetype?.kategorier?.forEach(kategori => {
            if (!opgavetyperByKategori[kategori]) {
                opgavetyperByKategori[kategori] = [];
            }
            opgavetyperByKategori[kategori].push(opgavetype);
        });
    });

    const toggleOpgavetype = (id) => {
        if (valgteOpgavetyper.includes(id)) {
            setValgteOpgavetyper(valgteOpgavetyper.filter(ot => ot !== id));
        } else {
            setValgteOpgavetyper([...valgteOpgavetyper, id]);
        }
    };

    const toggleOpgavekategori = (kategori) => {
        const typer = opgavetyperByKategori[kategori] || [];
        const ids = typer.map(t => t._id);
    
        const alleValgte = ids.every(id => valgteOpgavetyper.includes(id));
    
        if (alleValgte) {
            // Fjern alle fra kategorien
            setValgteOpgavetyper(valgteOpgavetyper.filter(id => !ids.includes(id)));
        } else {
            // Tilføj alle fra kategorien (uden at duplikere)
            setValgteOpgavetyper([
                ...valgteOpgavetyper,
                ...ids.filter(id => !valgteOpgavetyper.includes(id))
            ]);
        }
    };
    

    const gemValg = async () => {
        try {
            await axios.patch(`${import.meta.env.VITE_API_URL}/brugere/${bruger._id}`, {
                opgavetyper: valgteOpgavetyper
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
            <h2 className={Styles.modalHeader}>Vælg opgavetyper</h2>
            <p className={Styles.modalDescription}>Her kan du vælge, hvilke opgavetyper du kan udføre. Du kan også trykke på kategori-overskrifterne for at til- eller fravælge alle opgavetyper i den pågældende kategori.</p>
            <div className={Styles.opgavetyperContainer}>
                {opgavetyper.length > 0 && (
                    <div className={Styles.opgavetypeKategorierContainer}>
                        {Object.entries(opgavetyperByKategori).map(([kategori, typer]) => (
                            <div key={kategori} className={Styles.opgavetypeKategori}>
                                <h3 onClick={() => toggleOpgavekategori(kategori)}><Box />{kategori}</h3>
                                <div className={Styles.opgavetypePillContainer}>
                                    {typer.map(t => {
                                        const valgt = valgteOpgavetyper.includes(t._id);
                                        return (
                                            <div
                                                className={`${Styles.opgavetypePill} ${valgt ? Styles.valgt : ""}`}
                                                key={t._id}
                                                onClick={() => toggleOpgavetype(t._id)}
                                            >
                                                {valgteOpgavetyper.includes(t._id) && (
                                                    <Check className={Styles.checkIcon} />
                                                )}
                                                {t.opgavetype}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className={Styles.buttonsDiv}>
                <Button variant="primary" onClick={gemValg}>Gem</Button>
                <Button variant="secondary" onClick={() => setTrigger(false)}>Annuller</Button>
            </div>
        </Modal>
    );
};

export default VælgOpgavetyperModal;
