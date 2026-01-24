import React from 'react';
import Styles from '../AddPosteringV2.module.css';
import MoonLoader from "react-spinners/MoonLoader";
import { Camera, Trash2 } from 'lucide-react';

/**
 * Komponent til visning af et enkelt udlæg/materiale
 */
const UdlægKort = ({
    outlay,
    index,
    kvitteringLoading,
    onKvitteringUpload,
    onDelete,
    onChange,
    onKvitteringClick
}) => {
    return (
        <div className={Styles.udlægKort}>
            {/* Kvittering sektion */}
            <div className={Styles.udlægKvitteringSektion}>
                {kvitteringLoading ? (
                    <div className={Styles.udlægKvitteringLoading}>
                        <MoonLoader 
                            color="#59bf1a"
                            loading={true}
                            size={24}
                            aria-label="Loading Spinner"
                        />
                    </div>
                ) : outlay.kvittering ? (
                    <div 
                        className={Styles.udlægKvitteringPreview} 
                        onClick={() => onKvitteringClick(outlay.kvittering)}
                    >
                        <img src={outlay.kvittering} alt={outlay.beskrivelse} />
                    </div>
                ) : (
                    <label className={Styles.udlægKvitteringUpload}>
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

            {/* Indhold sektion */}
            <div className={Styles.udlægIndhold}>
                <div className={Styles.udlægFelt}>
                    <label className={Styles.formLabel}>Beskrivelse</label>
                    <input
                        type="text"
                        required
                        className={Styles.formInput}
                        name="beskrivelse"
                        value={outlay.beskrivelse}
                        onChange={(e) => onChange(index, e)}
                        placeholder="Hvad er materialet til?"
                    />
                </div>
                <div className={Styles.udlægFeltRow}>
                    <div className={Styles.udlægFeltSmall}>
                        <label className={Styles.formLabel}>Beløb (inkl. moms)</label>
                        <input
                            type="number"
                            required
                            className={Styles.formInput}
                            name="beløb"
                            value={outlay.beløb}
                            onChange={(e) => onChange(index, e)}
                            placeholder="0"
                        />
                    </div>
                    {!kvitteringLoading && (
                        <button 
                            type="button"
                            className={Styles.udlægSletKnap}
                            onClick={(e) => { e.preventDefault(); onDelete(index); }}
                        >
                            <Trash2 size={18} />
                        </button>
                    )}
                </div>
                <p className={Styles.udlægHjælpetekst}>Beskrivelsen vises på fakturaen</p>
            </div>
        </div>
    );
};

export default UdlægKort;

