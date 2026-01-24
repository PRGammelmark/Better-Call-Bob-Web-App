import React from 'react';
import Styles from '../../AddPosteringV2.module.css';
import ÅbenOpgaveCSS from '../../../../../pages/ÅbenOpgave.module.css';
import SettingsButtons from '../../../../basicComponents/buttons/SettingsButtons.jsx';
import MoonLoader from "react-spinners/MoonLoader";
import VisBilledeModal from '../../../VisBillede.jsx';
import PDFIcon from '../../../../../assets/pdf-logo.svg';
import { ImagePlus, Trash2, Search, X } from 'lucide-react';
import dayjs from 'dayjs';
import { getInitials } from '../../utils/posteringBeregninger.js';

/**
 * Beskrivelse tab - beskrivelse input og billede upload
 */
const BeskrivelseTab = ({
    user,
    dynamiskPrisBeregning,
    dynamiskHonorarBeregning,
    posteringFastPris,
    setPosteringFastPris,
    posteringFastHonorar,
    setPosteringFastHonorar,
    posteringBeskrivelse,
    setPosteringBeskrivelse,
    fastPrisInfobox,
    posteringBilleder,
    uploadingFiles,
    isCompressingVideo,
    dragging,
    setDragging,
    handlePosteringFileChange,
    handlePosteringFileDrop,
    handleDeletePosteringFile,
    åbnBillede,
    setÅbnBillede,
    imageIndex,
    setImageIndex,
    // Kredit-postering props
    posteringType,
    kreditererPostering,
    setKreditererPostering,
    kreditKommentar,
    setKreditKommentar,
    visKreditPosteringSøgning,
    setVisKreditPosteringSøgning,
    kreditPosteringSøgetekst,
    setKreditPosteringSøgetekst,
    søgbarePosteringer,
    handleVælgKreditPostering,
    // Tilbudspris props
    tilbudsPrisEksklMoms,
    setTilbudsPrisEksklMoms,
    // Preview honorar for modregning visning
    previewDynamiskHonorar
}) => {
    // Filtrer posteringer baseret på søgetekst
    const filtreredePosteringer = søgbarePosteringer.filter(p => {
        if (!kreditPosteringSøgetekst) return true;
        const søgetekst = kreditPosteringSøgetekst.toLowerCase();
        const brugerNavn = p.bruger?.navn?.toLowerCase() || '';
        const beskrivelse = p.beskrivelse?.toLowerCase() || '';
        const dato = dayjs(p.dato).format('DD/MM/YYYY');
        return brugerNavn.includes(søgetekst) || beskrivelse.includes(søgetekst) || dato.includes(søgetekst);
    });

    // Beregn modregningsbeløb
    const modregningsPris = kreditererPostering?.totalPris || 0;
    const modregningsHonorar = kreditererPostering?.totalHonorar || 0;
    const visHonorar = kreditererPostering?.brugDynamiskHonorar || kreditererPostering?.brugFastHonorar || 
                       kreditererPostering?.dynamiskHonorarBeregning !== undefined;

    return (
        <div className={Styles.tabContent}>
            {/* Modregn-felter (kun hvis type === 'kredit') */}
            {posteringType === 'kredit' && (
                <div className={Styles.kreditSection}>
                    <div className={Styles.kreditSectionHeader}>
                        <h4 className={Styles.kreditSectionTitle}>Modregn</h4>
                        <span className={Styles.betaBadge}>BETA</span>
                    </div>
                    
                    {/* Vælg postering at modregne */}
                    <div className={Styles.kreditPosteringVælger}>
                        <label className={Styles.kreditLabel}>Modregner postering</label>
                        <div 
                            className={Styles.kreditPosteringInput}
                            onClick={() => setVisKreditPosteringSøgning(!visKreditPosteringSøgning)}
                        >
                            {kreditererPostering ? (
                                <div className={Styles.valgtKreditPostering}>
                                    <span className={Styles.valgtKreditPosteringInfo}>
                                        {kreditererPostering.bruger?.navn || 'Ukendt'} - {dayjs(kreditererPostering.dato).format('DD/MM/YYYY')} - {kreditererPostering.totalPris?.toFixed(2)} kr.
                                    </span>
                                    <button
                                        type="button"
                                        className={Styles.fjernKreditPostering}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setKreditererPostering(null);
                                        }}
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ) : (
                                <span className={Styles.kreditPosteringPlaceholder}>
                                    Vælg postering at modregne...
                                </span>
                            )}
                        </div>
                        
                        {visKreditPosteringSøgning && (
                            <div className={Styles.kreditPosteringDropdown}>
                                <div className={Styles.kreditSøgefelt}>
                                    <Search size={16} />
                                    <input
                                        type="text"
                                        placeholder="Søg efter medarbejder, dato eller beskrivelse..."
                                        value={kreditPosteringSøgetekst}
                                        onChange={(e) => setKreditPosteringSøgetekst(e.target.value)}
                                        onClick={(e) => e.stopPropagation()}
                                        autoFocus
                                    />
                                </div>
                                <div className={Styles.kreditPosteringListe}>
                                    {filtreredePosteringer.length > 0 ? (
                                        filtreredePosteringer.slice(0, 10).map((postering) => (
                                            <div
                                                key={postering._id}
                                                className={`${Styles.kreditPosteringItem} ${kreditererPostering?._id === postering._id ? Styles.selected : ''}`}
                                                onClick={() => handleVælgKreditPostering(postering)}
                                            >
                                                <div className={Styles.kreditPosteringItemHeader}>
                                                    {postering.bruger?.profilbillede ? (
                                                        <img
                                                            src={postering.bruger.profilbillede}
                                                            alt={postering.bruger.navn}
                                                            className={Styles.kreditPosteringAvatar}
                                                        />
                                                    ) : (
                                                        <div className={Styles.kreditPosteringInitials}>
                                                            {getInitials(postering.bruger?.navn)}
                                                        </div>
                                                    )}
                                                    <span className={Styles.kreditPosteringNavn}>
                                                        {postering.bruger?.navn || 'Ukendt'}
                                                    </span>
                                                    <span className={Styles.kreditPosteringDato}>
                                                        {dayjs(postering.dato).format('DD/MM/YYYY')}
                                                    </span>
                                                </div>
                                                <div className={Styles.kreditPosteringItemDetaljer}>
                                                    <span className={Styles.kreditPosteringBeskrivelse}>
                                                        {postering.beskrivelse || 'Ingen beskrivelse'}
                                                    </span>
                                                    <span className={Styles.kreditPosteringPris}>
                                                        {postering.totalPris?.toFixed(2)} kr.
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className={Styles.ingenPosteringer}>
                                            Ingen posteringer fundet
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                    
                    {/* Modregn kommentar */}
                    <SettingsButtons
                        items={[
                            {
                                key: "kredit-kommentar",
                                title: "Kommentar til modregning",
                                input: true,
                                type: "text",
                                value: kreditKommentar || "",
                                onChange: (v) => setKreditKommentar(v),
                                placeholder: "Angiv årsag til modregning..."
                            }
                        ]}
                    />

                    {/* Vis modregningsbeløb når postering er valgt */}
                    {kreditererPostering && (
                        <div className={Styles.modregningBeløb}>
                            <div className={Styles.modregningBeløbRække}>
                                <span className={Styles.modregningBeløbLabel}>Modregnes (pris):</span>
                                <span className={Styles.modregningBeløbVærdi}>-{modregningsPris.toFixed(2)} kr.</span>
                            </div>
                            {visHonorar && (
                                <div className={Styles.modregningBeløbRække}>
                                    <span className={Styles.modregningBeløbLabel}>Modregnes (honorar):</span>
                                    <span className={Styles.modregningBeløbVærdi}>-{modregningsHonorar.toFixed(2)} kr.</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Input felt for Fast honorar (hvis aktiveret) */}
            {user.isAdmin && !dynamiskHonorarBeregning && (
                <SettingsButtons
                    items={[
                        {
                            key: "fast-honorar-input",
                            title: "Indtast beløb i DKK",
                            input: true,
                            type: "text",
                            value: posteringFastHonorar || "",
                            onChange: (value) => {
                                const val = String(value).replace(',', '.');
                                if (/^[0-9]*\.?[0-9]*$/.test(val) || val === "") {
                                    setPosteringFastHonorar(val);
                                }
                            },
                            placeholder: "0",
                            postfix: "kr."
                        }
                    ]}
                />
            )}

            {/* Beskrivelse */}
            <SettingsButtons
                items={[
                    {
                        key: "postering-beskrivelse",
                        title: "Beskrivelse",
                        input: true,
                        type: "text",
                        value: posteringBeskrivelse || "",
                        onChange: (v) => setPosteringBeskrivelse(v),
                        placeholder: "Beskrivelse af arbejdet..."
                    }
                ]}
            />

            {posteringBeskrivelse && (
                <p className={Styles.obsTekst}>
                    OBS! Beskrivelsen herover kommer med på fakturaen.
                </p>
            )}

            {fastPrisInfobox && (
                <div className={ÅbenOpgaveCSS.fastPrisInfoBox}>
                    <p>
                        Dette er den første postering på en opgave, hvor der allerede er lavet et fast 
                        tilbud til kunden. Den faste pris ovenfor er sat derefter – men du kan godt ændre i den.
                    </p>
                </div>
            )}

            {/* Billeder/videoer upload sektion */}
            <div className={Styles.billederDiv}>
                {posteringBilleder?.length > 0 && posteringBilleder.map((medie, index) => {
                    const isPDF = medie.includes('.pdf') || medie.includes('application/pdf');
                    return (
                        <div key={index} className={Styles.uploadetBillede}>
                            {medie.includes("video%") ? (
                                <video 
                                    className={Styles.playVideoPlaceholder} 
                                    src={medie}
                                    autoPlay
                                    muted
                                    playsInline
                                    loop
                                    onClick={() => { setÅbnBillede(medie); setImageIndex(index); }}
                                />
                            ) : isPDF ? (
                                <img 
                                    src={PDFIcon} 
                                    alt={`PDF ${index + 1}`} 
                                    className={Styles.imagePreview}
                                    onClick={() => { setÅbnBillede(medie); setImageIndex(index); }}
                                />
                            ) : (
                                <img 
                                    src={medie} 
                                    alt={`Preview ${index + 1}`} 
                                    className={Styles.imagePreview}
                                    onClick={() => { setÅbnBillede(medie); setImageIndex(index); }}
                                />
                            )}
                            <button
                                type="button"
                                onClick={() => handleDeletePosteringFile(medie, index)}
                                className={Styles.deleteButton}
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    );
                })}

                {uploadingFiles?.length > 0 && uploadingFiles.map((file, index) => (
                    <div key={index} className={Styles.spinnerDiv}>
                        <MoonLoader size="20px"/>
                        {isCompressingVideo && (
                            <p style={{ fontSize: 8, textAlign: "center" }}>
                                Behandler video <br />– vent venligst ...
                            </p>
                        )}
                    </div>
                ))}
                
                {!((uploadingFiles?.length + posteringBilleder?.length) > 9) && (
                    <div 
                        className={`${Styles.fileInput} ${dragging ? Styles.dragover : ''}`} 
                        onDragOver={(e) => { e.preventDefault(); setDragging(true); }} 
                        onDragLeave={() => setDragging(false)} 
                        onDrop={handlePosteringFileDrop}
                    >
                        <ImagePlus size={20} />
                        <input 
                            type="file" 
                            name="file" 
                            accept=".jpg, .jpeg, .png, .heic, .mp4, .mov, .avi, .hevc, .pdf" 
                            onChange={handlePosteringFileChange} 
                            multiple 
                            style={{ 
                                opacity: 0, 
                                position: 'absolute', 
                                top: 0, 
                                left: 0, 
                                width: '100%', 
                                height: '100%', 
                                cursor: 'pointer', 
                                padding: 0 
                            }} 
                        />
                    </div>
                )}
            </div>
            
            <VisBilledeModal 
                trigger={åbnBillede} 
                setTrigger={setÅbnBillede} 
                handleDeleteFile={handleDeletePosteringFile} 
                index={imageIndex} 
            />

            {/* Tilbudspris felt (kun hvis Tilbudspris er aktiveret) */}
            {user.isAdmin && !dynamiskPrisBeregning && (
                <div className={Styles.tilbudsprisSection}>
                    <h4 className={Styles.tilbudsprisSectionTitle}>Tilbudspris ekskl. moms</h4>
                    <SettingsButtons
                        items={[
                            {
                                key: "tilbudspris-input",
                                title: "",
                                input: true,
                                type: "text",
                                value: tilbudsPrisEksklMoms || "",
                                onChange: (value) => {
                                    const val = String(value).replace(',', '.');
                                    if (/^[0-9]*\.?[0-9]*$/.test(val) || val === "") {
                                        setTilbudsPrisEksklMoms(val);
                                    }
                                },
                                placeholder: "Indtast tilbudspris ekskl. moms",
                                postfix: "kr.",
                                required: true
                            }
                        ]}
                    />
                </div>
            )}
        </div>
    );
};

export default BeskrivelseTab;

