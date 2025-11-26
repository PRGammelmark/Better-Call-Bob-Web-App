import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import Modal from '../Modal.jsx'
import Styles from './VælgOpgavetyperModal.module.css'
import { Box, Check } from 'lucide-react'
import Button from '../basicComponents/buttons/Button.jsx'

const VælgOpgavetyperModal = (props) => {
    const { trigger, setTrigger, user, bruger, opgavetyper, refetchBruger, setRefetchBruger } = props;
    const [valgteOpgavetyper, setValgteOpgavetyper] = useState(bruger?.opgavetyper || []);
    const [isSaving, setIsSaving] = useState(false);
    const saveTimeoutRef = useRef(null);
    const hasChangesRef = useRef(false);

    // Opdater state når modalen åbnes
    useEffect(() => {
        if (trigger && bruger) {
            setValgteOpgavetyper(bruger?.opgavetyper || []);
            hasChangesRef.current = false;
        }
    }, [trigger, bruger?._id]);

    // Gem når modalen lukkes (hvis der er ændringer)
    useEffect(() => {
        if (!trigger && hasChangesRef.current) {
            gemValg(valgteOpgavetyper);
        }
    }, [trigger]);

    const opgavetyperByKategori = {};
    opgavetyper?.forEach(opgavetype => {
        opgavetype?.kategorier?.forEach(kategori => {
            if (!opgavetyperByKategori[kategori]) {
                opgavetyperByKategori[kategori] = [];
            }
            opgavetyperByKategori[kategori].push(opgavetype);
        });
    });

    const gemValg = async (opgavetyperToSave) => {
        if (!bruger?._id || isSaving) return;
        
        // Sammenlign med eksisterende værdier
        const eksisterendeOpgavetyper = bruger?.opgavetyper || [];
        const eksisterendeSorted = [...eksisterendeOpgavetyper].sort().join(',');
        const toSaveSorted = [...opgavetyperToSave].sort().join(',');
        
        if (eksisterendeSorted === toSaveSorted) {
            hasChangesRef.current = false;
            return; // Ingen ændringer
        }
        
        setIsSaving(true);
        try {
            const response = await axios.patch(`${import.meta.env.VITE_API_URL}/brugere/${bruger._id}`, {
                opgavetyper: opgavetyperToSave
            }, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            
            // Opdater lokal state med den gemte værdi
            setValgteOpgavetyper(response.data.opgavetyper || opgavetyperToSave);
            hasChangesRef.current = false;
            
            // Trigger refetch i parent
            setRefetchBruger(prev => !prev);
        } catch (err) {
            console.error('Fejl ved gem af opgavetyper:', err);
            alert(`Noget gik galt ved gem: ${err.response?.data?.error || err.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleToggleOpgavetype = (id) => {
        const newValgte = valgteOpgavetyper.includes(id)
            ? valgteOpgavetyper.filter(ot => ot !== id)
            : [...valgteOpgavetyper, id];
        
        setValgteOpgavetyper(newValgte);
        hasChangesRef.current = true;
        
        // Clear tidligere timeout
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }
        
        // Gem efter 300ms (simpel debounce)
        saveTimeoutRef.current = setTimeout(() => {
            gemValg(newValgte);
        }, 300);
    };

    const handleToggleOpgavekategori = (kategori) => {
        const typer = opgavetyperByKategori[kategori] || [];
        const ids = typer.map(t => t._id);
        const alleValgte = ids.every(id => valgteOpgavetyper.includes(id));
        
        const newValgte = alleValgte
            ? valgteOpgavetyper.filter(id => !ids.includes(id))
            : [...valgteOpgavetyper, ...ids.filter(id => !valgteOpgavetyper.includes(id))];
        
        setValgteOpgavetyper(newValgte);
        hasChangesRef.current = true;
        
        // Clear tidligere timeout
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }
        
        // Gem efter 300ms (simpel debounce)
        saveTimeoutRef.current = setTimeout(() => {
            gemValg(newValgte);
        }, 300);
    };

    const handleLuk = async () => {
        // Clear pending timeout
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
            saveTimeoutRef.current = null;
        }
        
        // Gem hvis der er ændringer
        if (hasChangesRef.current && !isSaving) {
            await gemValg(valgteOpgavetyper);
        }
        
        setTrigger(false);
    };

    // Cleanup timeout ved unmount
    useEffect(() => {
        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, []);

    return (
        <Modal trigger={trigger} setTrigger={setTrigger}>
            <h2 className={Styles.modalHeader}>Vælg opgavetyper</h2>
            <p className={Styles.modalDescription}>Her kan du vælge, hvilke opgavetyper du kan udføre. Du kan også trykke på kategori-overskrifterne for at til- eller fravælge alle opgavetyper i den pågældende kategori.</p>
            <div className={Styles.opgavetyperContainer}>
                {opgavetyper.length > 0 && (
                    <div className={Styles.opgavetypeKategorierContainer}>
                        {Object.entries(opgavetyperByKategori).map(([kategori, typer]) => (
                            <div key={kategori} className={Styles.opgavetypeKategori}>
                                <h3 onClick={() => handleToggleOpgavekategori(kategori)}><Box />{kategori}</h3>
                                <div className={Styles.opgavetypePillContainer}>
                                    {typer.map(t => {
                                        const valgt = valgteOpgavetyper.includes(t._id);
                                        return (
                                            <div
                                                className={`${Styles.opgavetypePill} ${valgt ? Styles.valgt : ""}`}
                                                key={t._id}
                                                onClick={() => handleToggleOpgavetype(t._id)}
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
                {isSaving && <span style={{ marginRight: '10px', color: '#666' }}>Gemmer...</span>}
                <Button variant="secondary" onClick={handleLuk}>Luk</Button>
            </div>
        </Modal>
    );
};

export default VælgOpgavetyperModal;
