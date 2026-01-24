import React from 'react';
import Styles from '../../AddPosteringV2.module.css';
import SettingsButtons from '../../../../basicComponents/buttons/SettingsButtons.jsx';
import TimerForm from '../TimerForm.jsx';
import TimerRække from '../TimerRække.jsx';
import { Clock, CirclePlus, ClockPlus } from 'lucide-react';

/**
 * Timer & tillæg tab komponent
 */
const TimerTillaegTab = ({
    isMobile,
    timetyper,
    fasteTillaeg,
    procentTillaeg,
    valgteTimetyper,
    setValgteTimetyper,
    valgteFasteTillaeg,
    setValgteFasteTillaeg,
    visTilføjTimer,
    setVisTilføjTimer,
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
    visTillaegFelter,
    setVisTillaegFelter,
    redigerTimerIndex,
    setRedigerTimerIndex,
    dynamiskHonorarBeregning,
    dynamiskPrisBeregning
}) => {
    // Tilføj/opdater timer
    const bekræftTilføjTimer = () => {
        if (nyTimetypeValg && nyTimetypeAntal && parseFloat(nyTimetypeAntal) > 0) {
            if (redigerTimerIndex !== null) {
                // Opdater eksisterende timer
                const nye = [...valgteTimetyper];
                nye[redigerTimerIndex] = {
                    timetypeId: nyTimetypeValg,
                    antal: parseFloat(nyTimetypeAntal),
                    rabat: nyTimerRabat ? parseFloat(nyTimerRabat) : undefined,
                    rabatEnhed: nyTimerRabat ? "%" : undefined,
                    tillaeg: nyTimerTillaeg.length > 0 ? nyTimerTillaeg : undefined
                };
                setValgteTimetyper(nye);
                setRedigerTimerIndex(null);
            } else {
                // Tilføj ny timer
                setValgteTimetyper([...valgteTimetyper, { 
                    timetypeId: nyTimetypeValg, 
                    antal: parseFloat(nyTimetypeAntal),
                    rabat: nyTimerRabat ? parseFloat(nyTimerRabat) : undefined,
                    rabatEnhed: nyTimerRabat ? "%" : undefined,
                    tillaeg: nyTimerTillaeg.length > 0 ? nyTimerTillaeg : undefined
                }]);
            }
            resetForm();
        }
    };

    // Reset form
    const resetForm = () => {
        setNyTimetypeValg("");
        setNyTimetypeAntal("");
        setNyTimerRabat("");
        setNyTimerTillaeg([]);
        setVisTilføjTimer(false);
        setVisRabatFelter(false);
        setVisTillaegFelter(false);
        setVisTillaegDropdown(false);
        setVisTimetypeDropdown(false);
        setRedigerTimerIndex(null);
    };

    // Fjern timer
    const fjernTimetype = (index) => {
        setValgteTimetyper(valgteTimetyper.filter((_, i) => i !== index));
    };

    // Start redigering
    const startRedigering = (index, valgtTimetype) => {
        setRedigerTimerIndex(index);
        setVisTilføjTimer(true);
        setNyTimetypeValg(valgtTimetype.timetypeId);
        setNyTimetypeAntal(valgtTimetype.antal.toString());
        setNyTimerRabat(valgtTimetype.rabat ? valgtTimetype.rabat.toString() : "");
        setVisRabatFelter(!!valgtTimetype.rabat);
        setNyTimerTillaeg(valgtTimetype.tillaeg || []);
        setVisTillaegFelter(valgtTimetype.tillaeg && valgtTimetype.tillaeg.length > 0);
    };

    if (!dynamiskHonorarBeregning && !dynamiskPrisBeregning) {
        return null;
    }

    return (
        <div className={Styles.tabContent}>
            {/* Timer sektion */}
            <div className={Styles.section}>
                <div className={Styles.sectionHeader}>
                    <Clock size={18} />
                    <h3 className={Styles.sectionTitle}>Timer</h3>
                </div>
                
                <div className={Styles.timerTillægFelter}>
                    {valgteTimetyper.length === 0 && !visTilføjTimer && (
                        <p className={Styles.emptyStateText}>Ingen timer tilføjet endnu</p>
                    )}
                    
                    {valgteTimetyper.map((valgtTimetype, index) => {
                        const timetype = timetyper.find(t => t._id === valgtTimetype.timetypeId);
                        const isEditing = redigerTimerIndex === index;
                        
                        return (
                            <div key={index}>
                                {isEditing ? (
                                    <TimerForm
                                        isMobile={isMobile}
                                        timetyper={timetyper}
                                        procentTillaeg={procentTillaeg}
                                        nyTimetypeValg={nyTimetypeValg}
                                        setNyTimetypeValg={setNyTimetypeValg}
                                        nyTimetypeAntal={nyTimetypeAntal}
                                        setNyTimetypeAntal={setNyTimetypeAntal}
                                        nyTimerRabat={nyTimerRabat}
                                        setNyTimerRabat={setNyTimerRabat}
                                        visRabatFelter={visRabatFelter}
                                        setVisRabatFelter={setVisRabatFelter}
                                        nyTimerTillaeg={nyTimerTillaeg}
                                        setNyTimerTillaeg={setNyTimerTillaeg}
                                        visTimetypeDropdown={visTimetypeDropdown}
                                        setVisTimetypeDropdown={setVisTimetypeDropdown}
                                        visTillaegDropdown={visTillaegDropdown}
                                        setVisTillaegDropdown={setVisTillaegDropdown}
                                        onConfirm={bekræftTilføjTimer}
                                        onCancel={resetForm}
                                        onDelete={() => {
                                            fjernTimetype(index);
                                            resetForm();
                                        }}
                                        isEditing={true}
                                    />
                                ) : (
                                    <TimerRække
                                        valgtTimetype={valgtTimetype}
                                        timetype={timetype}
                                        procentTillaeg={procentTillaeg}
                                        onClick={() => startRedigering(index, valgtTimetype)}
                                    />
                                )}
                            </div>
                        );
                    })}

                    {visTilføjTimer && redigerTimerIndex === null && (
                        <TimerForm
                            isMobile={isMobile}
                            timetyper={timetyper}
                            procentTillaeg={procentTillaeg}
                            nyTimetypeValg={nyTimetypeValg}
                            setNyTimetypeValg={setNyTimetypeValg}
                            nyTimetypeAntal={nyTimetypeAntal}
                            setNyTimetypeAntal={setNyTimetypeAntal}
                            nyTimerRabat={nyTimerRabat}
                            setNyTimerRabat={setNyTimerRabat}
                            visRabatFelter={visRabatFelter}
                            setVisRabatFelter={setVisRabatFelter}
                            nyTimerTillaeg={nyTimerTillaeg}
                            setNyTimerTillaeg={setNyTimerTillaeg}
                            visTimetypeDropdown={visTimetypeDropdown}
                            setVisTimetypeDropdown={setVisTimetypeDropdown}
                            visTillaegDropdown={visTillaegDropdown}
                            setVisTillaegDropdown={setVisTillaegDropdown}
                            onConfirm={bekræftTilføjTimer}
                            onCancel={resetForm}
                            isEditing={false}
                        />
                    )}

                    {!visTilføjTimer && (
                        <div className={Styles.addButtonWrapper}>
                            <button 
                                type="button" 
                                onClick={() => setVisTilføjTimer(true)}
                                className={`${Styles.addButtonSmall} ${valgteTimetyper.length === 0 ? Styles.addButtonSmallPrimary : Styles.addButtonSmallSecondary}`}
                            >
                                <ClockPlus size={14} />
                                Tilføj timer
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Faste Tillæg sektion */}
            <div className={Styles.section}>
                <div className={Styles.sectionHeader}>
                    <CirclePlus size={18} />
                    <h3 className={Styles.sectionTitle}>Faste tillæg</h3>
                </div>

                {fasteTillaeg.length > 0 ? (
                    <SettingsButtons
                        items={fasteTillaeg.map((tillaeg) => {
                            const isActive = valgteFasteTillaeg.some(vt => vt.tillaegId === tillaeg._id);
                            return {
                                key: `fast-tillaeg-${tillaeg._id}`,
                                title: `${tillaeg.nummer} - ${tillaeg.navn}`,
                                icon: (
                                    <span 
                                        className={Styles.tillaegColorDot}
                                        style={{ backgroundColor: tillaeg.farve || '#3b82f6' }}
                                    />
                                ),
                                switch: true,
                                checked: isActive,
                                onChange: (checked) => {
                                    if (checked) {
                                        setValgteFasteTillaeg([...valgteFasteTillaeg, { tillaegId: tillaeg._id, antal: 1 }]);
                                    } else {
                                        setValgteFasteTillaeg(valgteFasteTillaeg.filter(vt => vt.tillaegId !== tillaeg._id));
                                    }
                                }
                            };
                        })}
                    />
                ) : (
                    <p className={Styles.emptyStateText}>Ingen faste tillæg oprettet</p>
                )}
            </div>
        </div>
    );
};

export default TimerTillaegTab;

