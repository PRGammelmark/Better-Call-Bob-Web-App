import React from 'react';
import Styles from '../../AddPosteringV2.module.css';
import { ClockFading } from 'lucide-react';

/**
 * Pauser tab komponent - Viser "Kommer snart" besked
 */
const PauserTab = ({
    pausetyper,
    valgtePauser,
    setValgtePauser
}) => {
    return (
        <div className={Styles.tabContent}>
            <div className={Styles.section}>
                <div className={Styles.sectionHeader}>
                    <ClockFading size={18} />
                    <h3 className={Styles.sectionTitle}>Pauser</h3>
                </div>

                <div className={Styles.kommerSnartContainer}>
                    <div className={Styles.kommerSnartIcon}>
                        <ClockFading size={48} />
                    </div>
                    <h4 className={Styles.kommerSnartTitle}>Kommer snart</h4>
                    <p className={Styles.kommerSnartText}>
                        Muligheden for at registrere pauser er på vej. Hold øje med opdateringer!
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PauserTab;

