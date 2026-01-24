import React from 'react';
import Styles from '../AddPosteringV2.module.css';
import NumberPicker from '../../../basicComponents/inputs/NumberPicker.jsx';
import { ChevronDown, Check, X, Trash2 } from 'lucide-react';

/**
 * Genbrugelig formular til tilføjelse/redigering af timer
 */
const TimerForm = ({
    isMobile,
    timetyper,
    procentTillaeg,
    nyTimetypeValg,
    setNyTimetypeValg,
    nyTimetypeAntal,
    setNyTimetypeAntal,
    nyTimerRabat,
    setNyTimerRabat,
    visRabatFelter,
    setVisRabatFelter,
    nyTimerTillaeg,
    setNyTimerTillaeg,
    visTimetypeDropdown,
    setVisTimetypeDropdown,
    visTillaegDropdown,
    setVisTillaegDropdown,
    onConfirm,
    onCancel,
    onDelete,
    isEditing = false
}) => {
    const selectedTimetype = timetyper.find(t => t._id === nyTimetypeValg);
    const isValid = nyTimetypeValg && nyTimetypeAntal && parseFloat(nyTimetypeAntal) > 0;

    return (
        <>
            <div className={Styles.addFormHorizontal}>
                {/* Custom Timetype Selector */}
                <div className={Styles.timetypeSelectorWrapper} data-timetype-dropdown>
                    <label className={Styles.formLabel}>Timetype</label>
                    <button
                        type="button"
                        onClick={() => setVisTimetypeDropdown(!visTimetypeDropdown)}
                        className={Styles.timetypeSelectorButton}
                    >
                        {selectedTimetype ? (
                            <>
                                <span 
                                    className={Styles.timetypeColorDot}
                                    style={{ backgroundColor: selectedTimetype.farve || '#3b82f6' }}
                                />
                                <span className={Styles.timetypeNumber}>{selectedTimetype.nummer}</span>
                                <span className={Styles.timetypeName}>{selectedTimetype.navn}</span>
                            </>
                        ) : (
                            <span>Vælg timetype</span>
                        )}
                        <ChevronDown size={16} />
                    </button>
                    {visTimetypeDropdown && (
                        <div className={Styles.timetypeDropdown}>
                            {timetyper.map((timetype) => (
                                <button
                                    key={timetype._id}
                                    type="button"
                                    onClick={() => {
                                        setNyTimetypeValg(timetype._id);
                                        setVisTimetypeDropdown(false);
                                    }}
                                    className={`${Styles.timetypeOption} ${nyTimetypeValg === timetype._id ? Styles.timetypeOptionSelected : ''}`}
                                >
                                    <span 
                                        className={Styles.timetypeColorDot}
                                        style={{ backgroundColor: timetype.farve || '#3b82f6' }}
                                    />
                                    <span className={Styles.timetypeNumber}>{timetype.nummer}</span>
                                    <span className={Styles.timetypeName}>{timetype.navn}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Antal timer */}
                <div className={Styles.formFieldSmall}>
                    <label className={Styles.formLabel}>Antal</label>
                    {isMobile ? (
                        <NumberPicker
                            min={0}
                            max={100}
                            value={nyTimetypeAntal ? parseFloat(nyTimetypeAntal) : 0}
                            onChange={(val) => setNyTimetypeAntal(val.toString())}
                            step={0.5}
                        />
                    ) : (
                        <input
                            type="number"
                            value={nyTimetypeAntal}
                            onChange={(e) => {
                                const val = e.target.value.replace(',', '.');
                                if (/^[0-9]*\.?[0-9]*$/.test(val) || val === "") {
                                    setNyTimetypeAntal(val);
                                }
                            }}
                            className={Styles.formInput}
                            placeholder="0"
                            step="0.5"
                            min="0"
                        />
                    )}
                </div>

                {/* Tilføj rabat knap eller rabat-felter */}
                {!visRabatFelter ? (
                    <button
                        type="button"
                        onClick={() => setVisRabatFelter(true)}
                        className={Styles.tilføjRabatKnap}
                    >
                        + Rabat
                    </button>
                ) : (
                    <div className={Styles.formFieldRabat}>
                        <label className={Styles.formLabel}>Rabat</label>
                        {isMobile ? (
                            <NumberPicker
                                min={0}
                                max={100}
                                value={nyTimerRabat ? parseFloat(nyTimerRabat) : 0}
                                onChange={(val) => setNyTimerRabat(val.toString())}
                                step={1}
                            />
                        ) : (
                            <input
                                type="number"
                                value={nyTimerRabat}
                                onChange={(e) => {
                                    const val = e.target.value.replace(',', '.');
                                    if (/^[0-9]*\.?[0-9]*$/.test(val) || val === "") {
                                        setNyTimerRabat(val);
                                    }
                                }}
                                className={Styles.formInput}
                                placeholder="0"
                                min="0"
                            />
                        )}
                    </div>
                )}
            </div>
            
            {/* Tillæg sektion */}
            <div className={Styles.tillaegSektion} data-tillaeg-dropdown>
                <div className={Styles.tillaegHeader}>
                    <button
                        type="button"
                        onClick={() => setVisTillaegDropdown(!visTillaegDropdown)}
                        className={Styles.tilføjTillaegKnap}
                    >
                        + Tillæg
                        <ChevronDown size={14} className={visTillaegDropdown ? Styles.chevronRotated : ''} />
                    </button>
                    
                    {/* Valgte tillæg badges */}
                    {nyTimerTillaeg.length > 0 && (
                        <div className={Styles.valgteTillaegBadges}>
                            {nyTimerTillaeg.map((tillaegId) => {
                                const tillaeg = procentTillaeg.find(t => t._id === tillaegId);
                                return tillaeg ? (
                                    <span 
                                        key={tillaegId} 
                                        className={Styles.tillaegBadge}
                                        style={{ backgroundColor: tillaeg.farve || '#6b7280' }}
                                    >
                                        {tillaeg.navn}
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setNyTimerTillaeg(nyTimerTillaeg.filter(id => id !== tillaegId));
                                            }}
                                            className={Styles.tillaegBadgeRemove}
                                        >
                                            <X size={12} />
                                        </button>
                                    </span>
                                ) : null;
                            })}
                        </div>
                    )}
                </div>
                
                {/* Tillæg dropdown */}
                {visTillaegDropdown && (
                    <div className={Styles.tillaegDropdown}>
                        {procentTillaeg.map((tillaeg) => {
                            const isSelected = nyTimerTillaeg.includes(tillaeg._id);
                            return (
                                <button
                                    key={tillaeg._id}
                                    type="button"
                                    onClick={() => {
                                        if (isSelected) {
                                            setNyTimerTillaeg(nyTimerTillaeg.filter(id => id !== tillaeg._id));
                                        } else {
                                            setNyTimerTillaeg([...nyTimerTillaeg, tillaeg._id]);
                                        }
                                    }}
                                    className={`${Styles.tillaegOption} ${isSelected ? Styles.tillaegOptionSelected : ''}`}
                                >
                                    <span 
                                        className={Styles.tillaegColorDot}
                                        style={{ backgroundColor: tillaeg.farve || '#6b7280' }}
                                    />
                                    <span className={Styles.tillaegNavn}>{tillaeg.navn}</span>
                                    <span className={Styles.tillaegProcent}>+{tillaeg.listeSats}%/{tillaeg.kostSats}%</span>
                                    {isSelected && <Check size={16} className={Styles.tillaegCheck} />}
                                </button>
                            );
                        })}
                        {procentTillaeg.length === 0 && (
                            <p className={Styles.tillaegEmpty}>Ingen procenttillæg oprettet</p>
                        )}
                    </div>
                )}
            </div>

            <div className={Styles.formActionsIcons}>
                {isEditing && onDelete && (
                    <button
                        type="button"
                        onClick={onDelete}
                        className={`${Styles.iconButton} ${Styles.iconButtonDelete}`}
                        title="Slet"
                    >
                        <Trash2 size={20} />
                    </button>
                )}
                <button
                    type="button"
                    onClick={onCancel}
                    className={`${Styles.iconButton} ${Styles.iconButtonSecondary}`}
                    title="Annuller"
                >
                    <X size={20} />
                </button>
                <button
                    type="button"
                    onClick={onConfirm}
                    disabled={!isValid}
                    className={`${Styles.iconButton} ${Styles.iconButtonPrimary}`}
                    title={isEditing ? "Opdater" : "Tilføj"}
                >
                    <Check size={20} />
                </button>
            </div>
        </>
    );
};

export default TimerForm;

