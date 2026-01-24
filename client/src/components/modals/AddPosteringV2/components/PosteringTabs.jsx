import React from 'react';
import Styles from '../AddPosteringV2.module.css';
import { FileText, Clock, Package, ClockFading } from 'lucide-react';

/**
 * Tab navigation komponent
 */
const PosteringTabs = ({ aktivFane, setAktivFane }) => {
    const tabs = [
        { id: 'beskrivelse', label: 'Overblik', icon: FileText },
        { id: 'timer', label: 'Timer & tillæg', icon: Clock },
        { id: 'materialer', label: 'Materialer', icon: Package },
        { id: 'pauser', label: 'Pauser', icon: ClockFading }
    ];

    return (
        <div className={Styles.tabsContainer}>
            {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                    <button 
                        key={tab.id}
                        type="button"
                        className={`${Styles.tab} ${aktivFane === tab.id ? Styles.tabActive : ''}`}
                        onClick={() => setAktivFane(tab.id)}
                    >
                        <Icon size={20} />
                        <span>{tab.label}</span>
                    </button>
                );
            })}
        </div>
    );
};

export default PosteringTabs;

