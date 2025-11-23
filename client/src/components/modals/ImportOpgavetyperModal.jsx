import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Modal from '../Modal.jsx'
import Styles from './ImportOpgavetyperModal.module.css'
import { Download, Box, Check, ChevronDown, ChevronUp, Hammer } from 'lucide-react'
import PageAnimation from '../PageAnimation.jsx'
import Button from '../basicComponents/buttons/Button.jsx'

const ImportOpgavetyperModal = (props) => {
    const { trigger, setTrigger, user, kategorier = [], refetchOpgavetyper, setRefetchOpgavetyper } = props;

    const [expandedCategory, setExpandedCategory] = useState(null)
    const [availableOpgavetyper, setAvailableOpgavetyper] = useState({})
    const [loadingOpgavetyper, setLoadingOpgavetyper] = useState({})
    const [selectedOpgavetyper, setSelectedOpgavetyper] = useState([])
    const [isImporting, setIsImporting] = useState(false)
    const [importResult, setImportResult] = useState(null)
    const [errorMessage, setErrorMessage] = useState("")
    const [isInitialLoading, setIsInitialLoading] = useState(false)

    // Standard kategorier der kan importeres
    const standardKategorier = ["Handyman", "Tømrer", "VVS", "Elektriker", "Murer", "Rengøring"];

    // Hent alle opgavetyper når modal'en åbnes
    useEffect(() => {
        if (trigger && user?.token) {
            fetchAllOpgavetyper();
        }
    }, [trigger, user?.token]);

    const fetchAllOpgavetyper = async () => {
        setIsInitialLoading(true);
        const promises = standardKategorier.map(kategori => fetchOpgavetyperForKategori(kategori));
        
        try {
            await Promise.all(promises);
        } catch (error) {
            console.error("Fejl ved hentning af opgavetyper:", error);
        } finally {
            setIsInitialLoading(false);
        }
    }

    const fetchOpgavetyperForKategori = async (kategori) => {
        // Hvis vi allerede har data for denne kategori, spring over
        if (availableOpgavetyper[kategori]) {
            return;
        }

        setLoadingOpgavetyper(prev => ({ ...prev, [kategori]: true }));
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/opgavetyper/available/${kategori}`,
                {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    }
                }
            );
            setAvailableOpgavetyper(prev => ({ ...prev, [kategori]: response.data }));
        } catch (error) {
            console.error(`Fejl ved hentning af opgavetyper for ${kategori}:`, error);
            setAvailableOpgavetyper(prev => ({ ...prev, [kategori]: [] }));
        } finally {
            setLoadingOpgavetyper(prev => ({ ...prev, [kategori]: false }));
        }
    }

    const handleCategoryToggle = (kategori) => {
        if (expandedCategory === kategori) {
            setExpandedCategory(null);
        } else {
            setExpandedCategory(kategori);
        }
    }

    const handleOpgavetypeToggle = (opgavetype) => {
        const isSelected = selectedOpgavetyper.some(ot => ot.opgavetype === opgavetype.opgavetype);
        
        if (isSelected) {
            setSelectedOpgavetyper(selectedOpgavetyper.filter(ot => ot.opgavetype !== opgavetype.opgavetype));
        } else {
            setSelectedOpgavetyper([...selectedOpgavetyper, opgavetype]);
        }
    }

    const handleSelectAllInCategory = (kategori) => {
        const opgavetyper = availableOpgavetyper[kategori] || [];
        const allSelected = opgavetyper.every(ot => 
            selectedOpgavetyper.some(selected => selected.opgavetype === ot.opgavetype)
        );

        if (allSelected) {
            // Fjern alle fra denne kategori
            setSelectedOpgavetyper(prev => 
                prev.filter(ot => !opgavetyper.some(available => available.opgavetype === ot.opgavetype))
            );
        } else {
            // Tilføj alle fra denne kategori (kun dem der ikke allerede er valgt)
            const toAdd = opgavetyper.filter(ot => 
                !selectedOpgavetyper.some(selected => selected.opgavetype === ot.opgavetype)
            );
            setSelectedOpgavetyper(prev => [...prev, ...toAdd]);
        }
    }

    const handleImport = async () => {
        if (selectedOpgavetyper.length === 0) {
            setErrorMessage("Du skal vælge mindst én opgavetype at importere.");
            setTimeout(() => setErrorMessage(""), 5000);
            return;
        }

        setIsImporting(true);
        setErrorMessage("");
        setImportResult(null);

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/opgavetyper/import`,
                { opgavetyper: selectedOpgavetyper },
                {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    }
                }
            );

            setImportResult(response.data);
            if (response.data.success) {
                // Refetch opgavetyper
                setRefetchOpgavetyper(!refetchOpgavetyper);
                // Reset selection after successful import
                setTimeout(() => {
                    setSelectedOpgavetyper([]);
                    setImportResult(null);
                    setExpandedCategory(null);
                }, 3000);
            }
        } catch (error) {
            console.error("Fejl ved import:", error);
            setErrorMessage(error.response?.data?.error || "Der opstod en fejl ved import af opgavetyper.");
        } finally {
            setIsImporting(false);
        }
    }

    const handleClose = () => {
        setSelectedOpgavetyper([]);
        setImportResult(null);
        setErrorMessage("");
        setExpandedCategory(null);
        setAvailableOpgavetyper({});
        setIsInitialLoading(false);
        setTrigger(false);
    }

    const isOpgavetypeSelected = (opgavetype) => {
        return selectedOpgavetyper.some(ot => ot.opgavetype === opgavetype.opgavetype);
    }

    const getSelectedCountForCategory = (kategori) => {
        const opgavetyper = availableOpgavetyper[kategori] || [];
        return opgavetyper.filter(ot => isOpgavetypeSelected(ot)).length;
    }

    return (
        <Modal trigger={trigger} setTrigger={setTrigger} onClose={handleClose}>
            <PageAnimation>
                <h2 className={Styles.modalHeader}>Importer opgavetyper</h2>
                <p className={Styles.modalDescription}>
                    Vælg en kategori for at se tilgængelige opgavetyper, og vælg derefter de opgavetyper du vil importere. 
                    Opgavetyper der allerede eksisterer vil blive sprunget over.
                </p>

                {importResult && importResult.success && (
                    <div className={Styles.successMessage}>
                        ✅ {importResult.message}
                    </div>
                )}

                {errorMessage && (
                    <div className={Styles.errorMessage}>
                        {errorMessage}
                    </div>
                )}

                {isInitialLoading && (
                    <div className={Styles.loading}>Henter opgavetyper...</div>
                )}

                <div className={Styles.categoriesContainer}>
                    {standardKategorier.map(kategori => {
                        const isExpanded = expandedCategory === kategori;
                        const kategoriExists = kategorier.includes(kategori);
                        const opgavetyper = availableOpgavetyper[kategori] || [];
                        const selectedCount = getSelectedCountForCategory(kategori);
                        const isLoading = loadingOpgavetyper[kategori];
                        
                        return (
                            <div key={kategori} className={Styles.categorySection}>
                                <div
                                    className={`${Styles.categoryItem} ${isExpanded ? Styles.expanded : ""}`}
                                    onClick={() => handleCategoryToggle(kategori)}
                                >
                                    <div className={Styles.categoryHeader}>
                                        <Box className={Styles.categoryIcon} />
                                        <span className={Styles.categoryName}>{kategori}</span>
                                        {/* {kategoriExists && (
                                            <span className={Styles.existsBadge}>Eksisterer</span>
                                        )} */}
                                        {isExpanded ? (
                                            <ChevronUp className={Styles.expandIcon} />
                                        ) : (
                                            <ChevronDown className={Styles.expandIcon} />
                                        )}
                                    </div>
                                    {/* Vis statistik selv når kategorien ikke er udvidet */}
                                    <div className={Styles.categoryStats}>
                                        {isLoading ? (
                                            <span className={Styles.totalCount}>Henter...</span>
                                        ) : (
                                            <>
                                                {selectedCount > 0 && (
                                                    <span className={Styles.selectedCount}>
                                                        {selectedCount} valgt
                                                    </span>
                                                )}
                                                <span className={Styles.totalCount}>
                                                    {opgavetyper.length} tilgængelige
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div className={Styles.opgavetyperContainer}>
                                        {isLoading ? (
                                            <div className={Styles.loading}>Henter opgavetyper...</div>
                                        ) : opgavetyper.length === 0 ? (
                                            <div className={Styles.emptyMessage}>
                                                Ingen opgavetyper tilgængelige for denne kategori.
                                            </div>
                                        ) : (
                                            <>
                                                <button
                                                    className={Styles.selectAllButton}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleSelectAllInCategory(kategori);
                                                    }}
                                                >
                                                    {opgavetyper.every(ot => isOpgavetypeSelected(ot)) 
                                                        ? 'Fravælg alle' 
                                                        : 'Vælg alle'}
                                                </button>
                                                <div className={Styles.opgavetyperList}>
                                                    {opgavetyper.map((opgavetype, index) => {
                                                        const isSelected = isOpgavetypeSelected(opgavetype);
                                                        return (
                                                            <div
                                                                key={index}
                                                                className={`${Styles.opgavetypeItem} ${isSelected ? Styles.selected : ""}`}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleOpgavetypeToggle(opgavetype);
                                                                }}
                                                            >
                                                                <div className={Styles.checkbox}>
                                                                    {isSelected && <Check size={14} />}
                                                                </div>
                                                                <Hammer className={Styles.opgavetypeIcon} />
                                                                <span className={Styles.opgavetypeName}>{opgavetype.opgavetype}</span>
                                                                {opgavetype.kompleksitet && (
                                                                    <span className={Styles.kompleksitetBadge}>
                                                                        Kompleksitet: {opgavetype.kompleksitet}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* {selectedOpgavetyper.length > 0 && (
                    <div className={Styles.selectedSummary}>
                        <strong>{selectedOpgavetyper.length} opgavetype{selectedOpgavetyper.length !== 1 ? 'r' : ''} valgt til import</strong>
                    </div>
                )} */}

                <div className={Styles.buttons}>
                    <Button
                        variant="primary"
                        onClick={handleImport}
                        disabled={isImporting || selectedOpgavetyper.length === 0}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <Download style={{ width: 16, height: 16 }} />
                        {isImporting ? 'Importerer...' : `Importer ${selectedOpgavetyper.length} opgavetype${selectedOpgavetyper.length !== 1 ? 'r' : ''}`}
                    </Button>
                    <Button variant="secondary" onClick={handleClose}>
                        Annuller
                    </Button>
                </div>
            </PageAnimation>
        </Modal>
    )
}

export default ImportOpgavetyperModal
