import React, { useState, useEffect } from 'react';
import Styles from '../../AddPosteringV2.module.css';
import NumberPicker from '../../../../basicComponents/inputs/NumberPicker.jsx';
import MaterialeKort from '../MaterialeKort.jsx';
import { Search, X, Package, Camera, Check } from 'lucide-react';

/**
 * Materialer tab - søgning, manuel tilføjelse, materialer liste
 */
const MaterialerTab = ({
    isMobile,
    materialer,
    setMaterialer,
    materialeKvitteringLoadingStates,
    redigerMaterialeIndex,
    setRedigerMaterialeIndex,
    materialeSøgning,
    setMaterialeSøgning,
    søgningFokuseret,
    setSøgningFokuseret,
    visManuelTilføjelse,
    setVisManuelTilføjelse,
    filtreredeVarer,
    varer,
    nyMaterialeVarenummer,
    setNyMaterialeVarenummer,
    nyMaterialeBeskrivelse,
    setNyMaterialeBeskrivelse,
    nyMaterialeAntal,
    setNyMaterialeAntal,
    nyMaterialeKostpris,
    setNyMaterialeKostpris,
    visSalgspris,
    setVisSalgspris,
    nyMaterialeSalgspris,
    setNyMaterialeSalgspris,
    nyMaterialeBillede,
    setNyMaterialeBillede,
    nyMaterialeBilledePreview,
    setNyMaterialeBilledePreview,
    nyMaterialeErUdlaeg,
    setNyMaterialeErUdlaeg,
    handleMaterialeKvitteringUpload,
    handleManuelMaterialeBillede,
    handleSletManuelKvittering,
    bekræftManuelMateriale,
    resetManuelMaterialeForm,
    handleMaterialeChange,
    deleteMateriale,
    toggleMaterialeErUdlaeg,
    sletMaterialeKvittering,
    setKvitteringBillede
}) => {
    const [visVareTilføjetInfo, setVisVareTilføjetInfo] = useState(false);

    // Auto-hide infoboks efter 3 sekunder
    useEffect(() => {
        if (visVareTilføjetInfo) {
            const timer = setTimeout(() => {
                setVisVareTilføjetInfo(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [visVareTilføjetInfo]);

    return (
        <div className={Styles.tabContent}>
            <div className={Styles.section}>
                {/* Søgefelt og Tilføj manuelt knap */}
                <div className={`${Styles.materialeSøgningContainer} ${søgningFokuseret ? Styles.materialeSøgningFokuseret : ''}`}>
                    <div className={Styles.materialeSøgningWrapper}>
                        <Search size={18} className={Styles.materialeSøgningIcon} />
                        <input
                            type="text"
                            className={Styles.materialeSøgningInput}
                            placeholder="Søg i varekatalog..."
                            value={materialeSøgning}
                            onChange={(e) => setMaterialeSøgning(e.target.value)}
                            onFocus={() => setSøgningFokuseret(true)}
                            onBlur={() => {
                                if (!materialeSøgning.trim()) {
                                    setSøgningFokuseret(false);
                                }
                            }}
                        />
                        {materialeSøgning && (
                            <button
                                type="button"
                                className={Styles.materialeSøgningClear}
                                onClick={() => {
                                    setMaterialeSøgning("");
                                    setSøgningFokuseret(false);
                                }}
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>
                    <button
                        type="button"
                        className={Styles.materialeTilføjManueltKnap}
                        onClick={() => setVisManuelTilføjelse(true)}
                        tabIndex={søgningFokuseret ? -1 : 0}
                    >
                        Tilføj manuelt
                    </button>
                </div>

                {/* Søgeresultater */}
                {søgningFokuseret && filtreredeVarer.length > 0 && (
                    <div className={Styles.materialeSøgeresultater}>
                        {filtreredeVarer.map((vare) => (
                            <div
                                key={vare._id}
                                className={Styles.materialeVareKortKompakt}
                                onClick={() => {
                                    // Tjek om varenummer allerede findes
                                    const eksisterendeIndex = materialer.findIndex(
                                        m => m.varenummer && vare.varenummer && m.varenummer === vare.varenummer
                                    );
                                    
                                    if (eksisterendeIndex !== -1) {
                                        // Opdater antal på eksisterende vare
                                        const opdateretMaterialer = [...materialer];
                                        opdateretMaterialer[eksisterendeIndex] = {
                                            ...opdateretMaterialer[eksisterendeIndex],
                                            antal: opdateretMaterialer[eksisterendeIndex].antal + 1
                                        };
                                        setMaterialer(opdateretMaterialer);
                                    } else {
                                        // Tilføj ny vare
                                        const nytMateriale = {
                                            varenummer: vare.varenummer || '',
                                            beskrivelse: vare.beskrivelse,
                                            antal: 1,
                                            kostpris: vare.kostpris || 0,
                                            salgspris: vare.listepris || 0,
                                            billede: vare.billedeURL || '',
                                            manueltRegistreret: false,
                                            erUdlaeg: false,
                                            kvittering: ''
                                        };
                                        setMaterialer([...materialer, nytMateriale]);
                                    }
                                    setVisVareTilføjetInfo(true);
                                    setMaterialeSøgning("");
                                    setSøgningFokuseret(false);
                                }}
                            >
                                <div className={Styles.materialeVareBilledeWrapper}>
                                    {vare.billedeURL ? (
                                        <img src={vare.billedeURL} alt={vare.beskrivelse} className={Styles.materialeVareBillede} />
                                    ) : (
                                        <div className={Styles.materialeVarePlaceholder}>
                                            {vare.varenummer || 'MAT'}
                                        </div>
                                    )}
                                </div>
                                <div className={Styles.materialeVareInfo}>
                                    <div className={Styles.materialeVareHovedInfo}>
                                        {vare.varenummer && (
                                            <span className={Styles.materialeVareVarenummer}>{vare.varenummer}</span>
                                        )}
                                        <span className={Styles.materialeVareBeskrivelse}>{vare.beskrivelse}</span>
                                    </div>
                                    <div className={Styles.materialeVareDetaljer}>
                                        {vare.kostpris > 0 && (
                                            <span className={Styles.materialeVareDetalje}>Kostpris: {vare.kostpris.toFixed(2)} kr.</span>
                                        )}
                                        {vare.listepris > 0 && (
                                            <span className={Styles.materialeVareDetalje}>Salgspris: {vare.listepris.toFixed(2)} kr.</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Manuel tilføjelse formular */}
                {visManuelTilføjelse && (
                    <div className={Styles.manuelMaterialeFormular}>
                        {/* Linje 1: Varenummer, Beskrivelse, Antal */}
                        <div className={Styles.addFormHorizontal}>
                            <div className={Styles.formFieldSmall}>
                                <label className={Styles.formLabel}>Varenummer</label>
                                <input
                                    type="text"
                                    className={`${Styles.formInput} ${nyMaterialeVarenummer && varer.find(v => v.varenummer === nyMaterialeVarenummer) ? Styles.formInputError : ''}`}
                                    value={nyMaterialeVarenummer}
                                    onChange={(e) => setNyMaterialeVarenummer(e.target.value)}
                                    placeholder="Valgfrit"
                                />
                                {nyMaterialeVarenummer && varer.find(v => v.varenummer === nyMaterialeVarenummer) && (
                                    <span className={Styles.formFieldError}>Dette varenummer findes i kataloget - brug søgefunktionen</span>
                                )}
                            </div>
                            <div className={Styles.formFieldMedium}>
                                <label className={Styles.formLabel}>Beskrivelse *</label>
                                <input
                                    type="text"
                                    required
                                    className={Styles.formInput}
                                    value={nyMaterialeBeskrivelse}
                                    onChange={(e) => setNyMaterialeBeskrivelse(e.target.value)}
                                    placeholder="Beskrivelse"
                                />
                            </div>
                            <div className={Styles.formFieldSmall}>
                                <label className={Styles.formLabel}>Antal *</label>
                                {isMobile ? (
                                    <NumberPicker
                                        min={0.5}
                                        max={100}
                                        value={nyMaterialeAntal ? parseFloat(nyMaterialeAntal) : 1}
                                        onChange={(val) => setNyMaterialeAntal(val.toString())}
                                        step={0.5}
                                    />
                                ) : (
                                    <input
                                        type="number"
                                        required
                                        className={Styles.formInput}
                                        value={nyMaterialeAntal}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(',', '.');
                                            if (/^[0-9]*\.?[0-9]*$/.test(val) || val === "") {
                                                setNyMaterialeAntal(val);
                                            }
                                        }}
                                        placeholder="1"
                                        step="0.5"
                                        min="0.5"
                                    />
                                )}
                            </div>
                        </div>

                        {/* Linje 2: Kostpris og Salgspris */}
                        <div className={Styles.addFormHorizontal}>
                            <div className={Styles.formFieldSmall}>
                                <label className={Styles.formLabel}>Kostpris (ekskl. moms)</label>
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    className={Styles.formInput}
                                    value={nyMaterialeKostpris}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(',', '.');
                                        if (/^[0-9]*\.?[0-9]*$/.test(val) || val === "") {
                                            setNyMaterialeKostpris(val);
                                        }
                                    }}
                                    placeholder="0"
                                />
                            </div>
                            {!visSalgspris ? (
                                <button
                                    type="button"
                                    onClick={() => setVisSalgspris(true)}
                                    className={Styles.tilføjSalgsprisKnap}
                                >
                                    + Salgspris
                                </button>
                            ) : (
                                <div className={Styles.formFieldSmall}>
                                    <label className={Styles.formLabel}>Salgspris (ekskl. moms)</label>
                                    <input
                                        type="text"
                                        inputMode="decimal"
                                        className={Styles.formInput}
                                        value={nyMaterialeSalgspris}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(',', '.');
                                            if (/^[0-9]*\.?[0-9]*$/.test(val) || val === "") {
                                                setNyMaterialeSalgspris(val);
                                            }
                                        }}
                                        placeholder="0"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Udlæg switch */}
                        <div className={Styles.materialeUdlaegSwitch}>
                            <label className={Styles.switchContainer}>
                                <input
                                    type="checkbox"
                                    checked={nyMaterialeErUdlaeg}
                                    onChange={() => setNyMaterialeErUdlaeg(!nyMaterialeErUdlaeg)}
                                />
                                <span className={Styles.switchSlider}></span>
                                <span className={Styles.switchLabel}>Jeg har lagt ud for dette</span>
                            </label>
                        </div>

                        {/* Kvittering upload (kun synlig hvis erUdlaeg er true) */}
                        {nyMaterialeErUdlaeg && (
                            <div className={Styles.manuelMaterialeKvitteringUpload}>
                                <label className={Styles.formLabel}>Kvittering (valgfrit)</label>
                                {nyMaterialeBilledePreview ? (
                                    <div className={Styles.kvitteringPreviewWrapper}>
                                        <div className={Styles.kvitteringPreviewContainer}>
                                            <img src={nyMaterialeBilledePreview} alt="Kvittering preview" className={Styles.kvitteringPreviewImage} />
                                        </div>
                                        <button
                                            type="button"
                                            className={Styles.kvitteringSletKnap}
                                            onClick={handleSletManuelKvittering}
                                        >
                                            <X size={16} />
                                            <span>Slet kvittering</span>
                                        </button>
                                    </div>
                                ) : (
                                    <label className={Styles.kvitteringUploadLabel}>
                                        <Camera size={18} />
                                        <span>Upload kvittering</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleManuelMaterialeBillede}
                                        />
                                    </label>
                                )}
                            </div>
                        )}

                        {/* Bekræft/Annuller knapper */}
                        <div className={Styles.formActionsIcons}>
                            <button
                                type="button"
                                onClick={resetManuelMaterialeForm}
                                className={`${Styles.iconButton} ${Styles.iconButtonSecondary}`}
                                title="Annuller"
                            >
                                <X size={20} />
                            </button>
                            <button
                                    type="button"
                                    onClick={bekræftManuelMateriale}
                                    disabled={
                                        !nyMaterialeBeskrivelse.trim() || 
                                        !nyMaterialeAntal || 
                                        parseFloat(nyMaterialeAntal) <= 0 ||
                                        (nyMaterialeVarenummer && varer.find(v => v.varenummer === nyMaterialeVarenummer))
                                    }
                                    className={`${Styles.iconButton} ${Styles.iconButtonPrimary}`}
                                title="Tilføj"
                            >
                                <Check size={20} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Empty state */}
                {!søgningFokuseret && !visManuelTilføjelse && materialer.length === 0 && (
                    <div className={Styles.materialeEmptyState}>
                        <Package size={48} className={Styles.materialeEmptyIcon} />
                        <p className={Styles.emptyStateText}>Ingen materialer tilføjet endnu</p>
                    </div>
                )}

                {/* Liste over tilføjede materialer - skjules under søgning eller manuel tilføjelse */}
                {!søgningFokuseret && !visManuelTilføjelse && materialer.length > 0 && (
                    <div className={Styles.materialeListe}>
                        {materialer.map((materiale, index) => (
                            <MaterialeKort
                                key={index}
                                materiale={materiale}
                                index={index}
                                kvitteringLoading={materialeKvitteringLoadingStates[index]}
                                onKvitteringUpload={handleMaterialeKvitteringUpload}
                                onDelete={deleteMateriale}
                                onChange={handleMaterialeChange}
                                onKvitteringClick={setKvitteringBillede}
                                onToggleErUdlaeg={toggleMaterialeErUdlaeg}
                                onSletKvittering={sletMaterialeKvittering}
                                isEditing={redigerMaterialeIndex === index}
                                onStartEdit={setRedigerMaterialeIndex}
                                onCancelEdit={() => setRedigerMaterialeIndex(null)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Infoboks når vare tilføjes */}
            <div className={`${Styles.vareTilføjetInfo} ${visVareTilføjetInfo ? Styles.vareTilføjetInfoVisible : ''}`}>
                Vare tilføjet til arbejdsseddel
                <div className={`${Styles.vareTilføjetTimer} ${visVareTilføjetInfo ? Styles.vareTilføjetTimerActive : ''}`} />
            </div>
        </div>
    );
};

export default MaterialerTab;

