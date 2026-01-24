import React, { useState, useRef, useEffect } from 'react';
import Styles from '../AddPosteringV2.module.css';
import MoonLoader from "react-spinners/MoonLoader";
import { Camera, Trash2, Edit2, Check, X, MoreVertical } from 'lucide-react';

/**
 * Komponent til visning af et enkelt materiale
 */
const MaterialeKort = ({
    materiale,
    index,
    kvitteringLoading,
    onKvitteringUpload,
    onDelete,
    onChange,
    onKvitteringClick,
    onToggleErUdlaeg,
    isEditing,
    onStartEdit,
    onCancelEdit,
    onSletKvittering
}) => {
    const [visMenu, setVisMenu] = useState(false);
    const menuRef = useRef(null);

    // Luk menu ved klik udenfor
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setVisMenu(false);
            }
        };
        
        if (visMenu) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [visMenu]);

    // View mode - kompakt visning
    if (!isEditing) {
        return (
            <div className={Styles.materialeKortKompakt}>
                {/* Billede/kvittering sektion */}
                <div className={Styles.materialeKvitteringSektionKompakt}>
                    {materiale.billede && !materiale.erUdlaeg ? (
                        <div 
                            className={Styles.materialeBilledePreviewKompakt}
                            onClick={() => onKvitteringClick(materiale.billede)}
                        >
                            <img src={materiale.billede} alt={materiale.beskrivelse} />
                        </div>
                    ) : materiale.erUdlaeg && materiale.kvittering ? (
                        <div 
                            className={Styles.materialeKvitteringPreviewKompakt} 
                            onClick={() => onKvitteringClick(materiale.kvittering)}
                        >
                            <img src={materiale.kvittering} alt={materiale.beskrivelse} />
                        </div>
                    ) : (
                        <div className={Styles.materialePlaceholderKompakt}>
                            {materiale.varenummer || 'MAT'}
                        </div>
                    )}
                </div>

                {/* Indhold sektion - klikbar for at åbne redigering */}
                <div 
                    className={Styles.materialeIndholdKompakt}
                    onClick={() => onStartEdit(index)}
                    style={{ cursor: 'pointer' }}
                >
                    <div className={Styles.materialeHovedInfo}>
                        {materiale.varenummer && (
                            <span className={Styles.materialeVarenummerText}>{materiale.varenummer}</span>
                        )}
                        <span className={Styles.materialeBeskrivelseText}>{materiale.beskrivelse}</span>
                    </div>
                    <div className={Styles.materialeDetaljer}>
                        <span className={Styles.materialeDetaljeItem}>Antal: {materiale.antal}</span>
                        <span className={Styles.materialeDetaljeItem}>Kostpris: {materiale.kostpris} kr.</span>
                        {materiale.salgspris && materiale.salgspris !== materiale.kostpris && (
                            <span className={Styles.materialeDetaljeItem}>Salgspris: {materiale.salgspris} kr.</span>
                        )}
                        {materiale.erUdlaeg && (
                            <span className={Styles.materialeUdlaegBadge}>Medarbejderudlæg</span>
                        )}
                    </div>
                </div>

                {/* Actions - Popup menu */}
                <div className={Styles.materialeActionsKompakt} ref={menuRef}>
                    <button 
                        type="button"
                        className={Styles.materialeMenuKnap}
                        onClick={(e) => {
                            e.stopPropagation();
                            setVisMenu(!visMenu);
                        }}
                        title="Handlinger"
                    >
                        <MoreVertical size={18} />
                    </button>
                    
                    {visMenu && (
                        <div className={Styles.materialePopupMenu}>
                            <button
                                type="button"
                                className={Styles.materialePopupMenuItem}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setVisMenu(false);
                                    onStartEdit(index);
                                }}
                            >
                                <Edit2 size={14} />
                                <span>Rediger</span>
                            </button>
                            <button
                                type="button"
                                className={`${Styles.materialePopupMenuItem} ${Styles.materialePopupMenuItemDanger}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    setVisMenu(false);
                                    onDelete(index);
                                }}
                            >
                                <Trash2 size={14} />
                                <span>Slet</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Edit mode - fuld redigeringsvisning
    return (
        <div className={Styles.materialeKort}>
            {/* Billede/kvittering sektion */}
            <div className={Styles.materialeKvitteringSektionEdit}>
                {materiale.billede && !materiale.erUdlaeg ? (
                    <div 
                        className={Styles.materialeBilledePreview}
                        onClick={() => onKvitteringClick(materiale.billede)}
                    >
                        <img src={materiale.billede} alt={materiale.beskrivelse} />
                    </div>
                ) : materiale.erUdlaeg ? (
                    <div className={Styles.materialeKvitteringEditWrapper}>
                        {kvitteringLoading ? (
                            <div className={Styles.materialeKvitteringLoading}>
                                <MoonLoader 
                                    color="#59bf1a"
                                    loading={true}
                                    size={24}
                                    aria-label="Loading Spinner"
                                />
                            </div>
                        ) : materiale.kvittering ? (
                            <>
                                <div 
                                    className={Styles.materialeKvitteringPreview} 
                                    onClick={() => onKvitteringClick(materiale.kvittering)}
                                >
                                    <img src={materiale.kvittering} alt={materiale.beskrivelse} />
                                </div>
                                <button
                                    type="button"
                                    className={Styles.kvitteringSletKnapEdit}
                                    onClick={() => onSletKvittering(index)}
                                >
                                    <X size={14} />
                                    <span>Slet</span>
                                </button>
                            </>
                        ) : (
                            <label className={Styles.materialeKvitteringUpload}>
                                <Camera size={20} />
                                <span>Tilføj kvittering</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        onKvitteringUpload(e.target.files[0], index);
                                        e.target.value = "";
                                    }}
                                />
                            </label>
                        )}
                    </div>
                ) : (
                    <div className={Styles.materialePlaceholder}>
                        {materiale.varenummer || 'MAT'}
                    </div>
                )}
            </div>

            {/* Indhold sektion */}
            <div className={Styles.materialeIndhold}>
                <div className={Styles.materialeFeltRow}>
                    <div className={Styles.materialeFeltSmall}>
                        <label className={Styles.formLabel}>Varenummer</label>
                        <input
                            type="text"
                            className={Styles.formInput}
                            name="varenummer"
                            value={materiale.varenummer || ''}
                            onChange={(e) => onChange(index, e)}
                            placeholder="Valgfrit"
                        />
                    </div>
                    <div className={Styles.materialeFeltMedium}>
                        <label className={Styles.formLabel}>Beskrivelse</label>
                        <input
                            type="text"
                            required
                            className={Styles.formInput}
                            name="beskrivelse"
                            value={materiale.beskrivelse}
                            onChange={(e) => onChange(index, e)}
                            placeholder="Beskrivelse"
                        />
                    </div>
                </div>

                <div className={Styles.materialeFeltRow}>
                    <div className={Styles.materialeFeltXSmall}>
                        <label className={Styles.formLabel}>Antal</label>
                        <input
                            type="number"
                            required
                            className={Styles.formInput}
                            name="antal"
                            value={materiale.antal}
                            onChange={(e) => onChange(index, e)}
                            placeholder="1"
                            step="0.5"
                            min="0.5"
                        />
                    </div>
                    <div className={Styles.materialeFeltSmall}>
                        <label className={Styles.formLabel}>Kostpris</label>
                        <input
                            type="number"
                            required
                            className={Styles.formInput}
                            name="kostpris"
                            value={materiale.kostpris}
                            onChange={(e) => onChange(index, e)}
                            placeholder="0"
                            min="0"
                        />
                    </div>
                    <div className={Styles.materialeFeltSmall}>
                        <label className={Styles.formLabel}>Salgspris</label>
                        <input
                            type="number"
                            className={Styles.formInput}
                            name="salgspris"
                            value={materiale.salgspris || ''}
                            onChange={(e) => onChange(index, e)}
                            placeholder="Valgfrit"
                            min="0"
                        />
                    </div>
                </div>

                {/* Udlæg switch */}
                <div className={Styles.materialeUdlaegSwitch}>
                    <label className={Styles.switchContainer}>
                        <input
                            type="checkbox"
                            checked={materiale.erUdlaeg || false}
                            onChange={() => onToggleErUdlaeg(index)}
                        />
                        <span className={Styles.switchSlider}></span>
                        <span className={Styles.switchLabel}>Jeg har lagt ud for dette</span>
                    </label>
                </div>

                {/* Gem/Annuller knapper */}
                <div className={Styles.materialeEditActions}>
                    <button 
                        type="button"
                        className={Styles.materialeAnnullerKnap}
                        onClick={() => onCancelEdit()}
                    >
                        <X size={18} />
                        <span>Annuller</span>
                    </button>
                    <button 
                        type="button"
                        className={Styles.materialeGemKnap}
                        onClick={() => onCancelEdit()}
                    >
                        <Check size={18} />
                        <span>Gem</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MaterialeKort;

