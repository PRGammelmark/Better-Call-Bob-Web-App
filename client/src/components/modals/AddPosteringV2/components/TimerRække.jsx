import React from 'react';
import Styles from '../AddPosteringV2.module.css';

/**
 * Visning af en tilføjet timer-række
 */
const TimerRække = ({
    valgtTimetype,
    timetype,
    procentTillaeg,
    onClick
}) => {
    return (
        <div 
            className={Styles.timerRække}
            onClick={onClick}
        >
            <div className={Styles.timerRækkeHoved}>
                {/* Timetype (60%) */}
                <div className={Styles.timerRækkeTimetype}>
                    <span 
                        className={Styles.timetypeColorDot}
                        style={{ backgroundColor: timetype?.farve || '#3b82f6' }}
                    />
                    <span className={Styles.timetypeNumber}>{timetype?.nummer}</span>
                    <span className={Styles.timerRækkeNavn}>{timetype?.navn || 'Timetype'}</span>
                </div>
                
                {/* Antal (20%) */}
                <div className={Styles.timerRækkeAntal}>
                    <span className={Styles.timerRækkeVærdi}>{valgtTimetype.antal}</span>
                    <span className={Styles.timerRækkeEnhed}>timer</span>
                </div>
                
                {/* Rabat (20%) */}
                <div className={Styles.timerRækkeRabat}>
                    {valgtTimetype.rabat ? (
                        <span className={Styles.timerRækkeVærdi}>-{valgtTimetype.rabat}%</span>
                    ) : (
                        <span className={Styles.timerRækkeIngenRabat}>—</span>
                    )}
                </div>
            </div>
            
            {/* Tillæg badges under hovedlinjen */}
            {valgtTimetype.tillaeg && valgtTimetype.tillaeg.length > 0 && (
                <div className={Styles.timerRækkeTillaeg}>
                    {valgtTimetype.tillaeg.map((tillaegId) => {
                        const tillaeg = procentTillaeg.find(t => t._id === tillaegId);
                        return tillaeg ? (
                            <span 
                                key={tillaegId} 
                                className={Styles.timerRækkeTillaegBadge}
                                style={{ backgroundColor: tillaeg.farve || '#6b7280' }}
                            >
                                {tillaeg.navn} +{tillaeg.listeSats}%/{tillaeg.kostSats}%
                            </span>
                        ) : null;
                    })}
                </div>
            )}
        </div>
    );
};

export default TimerRække;

