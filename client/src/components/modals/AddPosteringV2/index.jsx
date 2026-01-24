import React, { useEffect } from 'react';
import Modal from '../../Modal.jsx';
import ÅbenOpgaveCSS from '../../../pages/ÅbenOpgave.module.css';
import Styles from './AddPosteringV2.module.css';
import { ReceiptText } from 'lucide-react';
import BackArrow from '../../../assets/back.svg';
import PageAnimation from '../../PageAnimation.jsx';
import satser from '../../../variables';
import { storage } from '../../../firebase.js';
import { ref, deleteObject, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { v4 } from 'uuid';

// Context hooks
import { useAuthContext } from '../../../hooks/useAuthContext';
import { useOpgave } from '../../../context/OpgaveContext.jsx';
import { useIndstillinger } from '../../../context/IndstillingerContext';

// Custom hooks
import { useAddPosteringState } from './hooks/useAddPosteringState.js';
import { usePosteringApi, opretPostering, redigerPostering } from './hooks/usePosteringApi.js';
import { useHonorarBeregning } from './hooks/useHonorarBeregning.js';
import { useFileUpload } from './hooks/useFileUpload.js';

// Utils
import { 
    bygTimeregistrering, 
    bygFasteTillaeg, 
    bygProcentTillaeg, 
    bygUdlaeg, 
    bygMaterialer,
    bygPosteringObjekt 
} from './utils/posteringBeregninger.js';

// Components
import PosteringHeader from './components/PosteringHeader.jsx';
import PosteringTabs from './components/PosteringTabs.jsx';
import PosteringFooter from './components/PosteringFooter.jsx';
import BeskrivelseTab from './components/tabs/BeskrivelseTab.jsx';
import TimerTillaegTab from './components/tabs/TimerTillaegTab.jsx';
import MaterialerTab from './components/tabs/MaterialerTab.jsx';
import PauserTab from './components/tabs/PauserTab.jsx';

const AddPosteringV2 = (props) => {
    const { user } = useAuthContext();
    const userID = user?.id || user?._id;
    const { setRefetchOpgave, setRefetchPosteringer } = useOpgave();
    const { indstillinger } = useIndstillinger();

    // Initialize state hook
    const state = useAddPosteringState(props);
    
    // Destructure commonly used state
    const {
        valgtMedarbejder,
        medarbejdere,
        visMedarbejderDropdown,
        setVisMedarbejderDropdown,
        medarbejderSøgetekst,
        setMedarbejderSøgetekst,
        aktivFane,
        setAktivFane,
        dateInputRef,
        isMobile,
        setIsMobile,
        timetyper,
        fasteTillaeg,
        procentTillaeg,
        valgteTimetyper,
        setValgteTimetyper,
        valgteFasteTillaeg,
        setValgteFasteTillaeg,
        valgteProcentTillaeg,
        outlays,
        setOutlays,
        kvitteringLoadingStates,
        setKvitteringLoadingStates,
        materialer,
        setMaterialer,
        materialeKvitteringLoadingStates,
        setMaterialeKvitteringLoadingStates,
        redigerMaterialeIndex,
        setRedigerMaterialeIndex,
        posteringDato,
        setPosteringDato,
        posteringBeskrivelse,
        setPosteringBeskrivelse,
        dynamiskHonorarBeregning,
        setDynamiskHonorarBeregning,
        dynamiskPrisBeregning,
        setDynamiskPrisBeregning,
        posteringFastHonorar,
        setPosteringFastHonorar,
        posteringFastPris,
        setPosteringFastPris,
        fastPrisInfobox,
        setFastPrisInfobox,
        previewDynamiskHonorar,
        setPreviewDynamiskHonorar,
        previewDynamiskOutlays,
        setPreviewDynamiskOutlays,
        rabatProcent,
        kvitteringBillede,
        setKvitteringBillede,
        posteringBilleder,
        setPosteringBilleder,
        uploadingFiles,
        setUploadingFiles,
        åbnBillede,
        setÅbnBillede,
        isCompressingVideo,
        setIsCompressingVideo,
        dragging,
        setDragging,
        imageIndex,
        setImageIndex,
        ffmpegRef,
        ffmpegLoaded,
        nyeUploadedeBilleder,
        setNyeUploadedeBilleder,
        opgave,
        opgaveID,
        nuværendeAnsvarlige,
        posteringer,
        setPosteringer,
        opretPosteringPåVegneAfEnAnden,
        clearFormState,
        // Timer form state
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
        visTillaegFelter,
        setVisTillaegFelter,
        redigerTimerIndex,
        setRedigerTimerIndex,
        visTimetypeDropdown,
        setVisTimetypeDropdown,
        visTillaegDropdown,
        setVisTillaegDropdown,
        // Materialer state
        materialeSøgning,
        setMaterialeSøgning,
        søgningFokuseret,
        setSøgningFokuseret,
        visManuelTilføjelse,
        setVisManuelTilføjelse,
        filtreredeVarer,
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
        // Pauser state
        pausetyper,
        valgtePauser,
        setValgtePauser,
        // Kredit-postering state
        posteringType,
        setPosteringType,
        kreditererPostering,
        setKreditererPostering,
        kreditKommentar,
        setKreditKommentar,
        visKreditPosteringSøgning,
        setVisKreditPosteringSøgning,
        kreditPosteringSøgetekst,
        setKreditPosteringSøgetekst,
        søgbarePosteringer,
        setSøgbarePosteringer,
        // Lås postering state
        låsPosteringVedOprettelse,
        setLåsPosteringVedOprettelse,
        // Tilbudspris state
        tilbudsPrisEksklMoms,
        setTilbudsPrisEksklMoms,
        // Edit mode
        isEditMode,
        eksisterendePostering
    } = state;

    // Get current medarbejder
    const nuværendeMedarbejder = valgtMedarbejder || user;

    // API hook
    usePosteringApi({
        user,
        trigger: props.trigger,
        props,
        state
    });

    // Honorar beregning hook
    useHonorarBeregning({
        valgteTimetyper,
        valgteFasteTillaeg,
        valgteProcentTillaeg,
        outlays,
        materialer,
        rabatProcent,
        timetyper,
        fasteTillaeg,
        procentTillaeg,
        valgtMedarbejder,
        user,
        opgave,
        indstillinger,
        dynamiskHonorarBeregning,
        dynamiskPrisBeregning,
        setPreviewDynamiskHonorar,
        setPreviewDynamiskOutlays
    });

    // File upload hook
    const {
        handlePosteringFileChange,
        handlePosteringFileDrop,
        handleDeletePosteringFile,
        handleKvitteringUpload,
        handleMaterialeKvitteringUpload,
        cleanupUploadedFiles
    } = useFileUpload({
        posteringBilleder,
        setPosteringBilleder,
        uploadingFiles,
        setUploadingFiles,
        isCompressingVideo,
        setIsCompressingVideo,
        ffmpegRef,
        ffmpegLoaded,
        nyeUploadedeBilleder,
        setNyeUploadedeBilleder,
        setDragging,
        åbnBillede,
        setÅbnBillede,
        kvitteringLoadingStates,
        setKvitteringLoadingStates,
        outlays,
        setOutlays,
        materialeKvitteringLoadingStates,
        setMaterialeKvitteringLoadingStates,
        materialer,
        setMaterialer
    });

    // Listen for window resize
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 750);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (visMedarbejderDropdown && !event.target.closest('[data-medarbejder-dropdown]')) {
                setVisMedarbejderDropdown(false);
            }
            if (visTimetypeDropdown && !event.target.closest('[data-timetype-dropdown]')) {
                setVisTimetypeDropdown(false);
            }
            if (visTillaegDropdown && !event.target.closest('[data-tillaeg-dropdown]')) {
                setVisTillaegDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [visMedarbejderDropdown, visTimetypeDropdown, visTillaegDropdown]);

    // Check for first postering on tilbudsopgave
    useEffect(() => {
        if ((!posteringer?.length > 0) && (opgave?.fakturaOprettesManuelt)) {
            setDynamiskPrisBeregning(false);
            setPosteringFastPris(Number(opgave.tilbudAfgivet));
            setFastPrisInfobox(true);
        } else {
            setFastPrisInfobox(false);
        }
    }, [posteringer, opgave]);

    // Sæt dynamiskHonorarBeregning baseret på indstillinger
    useEffect(() => {
        if (indstillinger?.timelønViaArbejdssedler) {
            setDynamiskHonorarBeregning(true);
        }
    }, [indstillinger?.timelønViaArbejdssedler, props.trigger]);

    // Funktion til at kopiere værdier fra en postering ved modregning
    const kopierVærdierFraPostering = (postering) => {
        if (!postering) return;

        // Kopier beskrivelse
        setPosteringBeskrivelse(postering.beskrivelse || '');
        
        // Kopier dato (brug dagens dato for modregningen)
        // setPosteringDato er allerede sat til dagens dato

        // Kopier dynamisk/fast honorar indstillinger
        if (postering.brugDynamiskHonorar !== undefined) {
            setDynamiskHonorarBeregning(postering.brugDynamiskHonorar);
        } else if (postering.dynamiskHonorarBeregning !== undefined) {
            setDynamiskHonorarBeregning(postering.dynamiskHonorarBeregning);
        }

        // Kopier dynamisk/fast pris indstillinger
        if (postering.dynamiskPrisBeregning !== undefined) {
            setDynamiskPrisBeregning(postering.dynamiskPrisBeregning);
        }

        // Kopier fast honorar og pris
        if (postering.fastHonorar !== undefined) {
            setPosteringFastHonorar(postering.fastHonorar);
        }
        if (postering.fastPris !== undefined) {
            setPosteringFastPris(postering.fastPris);
        }

        // Kopier timeregistreringer til valgteTimetyper format
        if (postering.timeregistrering && postering.timeregistrering.length > 0) {
            const kopierdeTimetyper = postering.timeregistrering.map(tr => {
                // Find matchende timetype baseret på navn
                const matchendTimetype = timetyper.find(t => t.navn === tr.navn);
                return {
                    timetypeId: matchendTimetype?._id || null,
                    antal: tr.antal || 0,
                    tillaeg: [] // Tillæg skal genfindes
                };
            }).filter(t => t.timetypeId);
            setValgteTimetyper(kopierdeTimetyper);
        }

        // Kopier faste tillæg
        if (postering.fasteTillæg && postering.fasteTillæg.length > 0) {
            const kopieredeFasteTillaeg = postering.fasteTillæg.map(ft => {
                const matchendTillaeg = fasteTillaeg.find(t => t.navn === ft.navn);
                return {
                    tillaegId: matchendTillaeg?._id || null,
                    antal: ft.antal || 0
                };
            }).filter(t => t.tillaegId);
            setValgteFasteTillaeg(kopieredeFasteTillaeg);
        }

        // Kopier materialer
        if (postering.materialer && postering.materialer.length > 0) {
            const kopieredeMaterialer = postering.materialer.map(m => ({
                varenummer: m.varenummer || '',
                beskrivelse: m.beskrivelse || '',
                antal: m.antal || 1,
                kostpris: m.kostpris || 0,
                salgspris: m.salgspris || m.kostpris || 0,
                manueltRegistreret: true, // Marker som manuelt da vi kopierer
                erUdlaeg: m.totalMedarbejderUdlaeg > 0,
                totalMedarbejderUdlaeg: m.totalMedarbejderUdlaeg || 0,
                restMedarbejderUdlaeg: m.restMedarbejderUdlaeg || 0,
                kvittering: '', // Kopier ikke kvitteringer
                billede: '' // Kopier ikke billeder
            }));
            setMaterialer(kopieredeMaterialer);
        }

        // Kopier udlæg
        if (postering.udlæg && postering.udlæg.length > 0) {
            const kopierdeUdlaeg = postering.udlæg.map(u => ({
                beskrivelse: u.beskrivelse || '',
                beløb: u.beløb || 0,
                kvittering: '' // Kopier ikke kvitteringer
            }));
            setOutlays(kopierdeUdlaeg);
        }

        // Kopier tilbudspris hvis relevant
        if (postering.tilbudsPrisEksklMoms !== undefined && postering.tilbudsPrisEksklMoms !== null) {
            setTilbudsPrisEksklMoms(String(postering.tilbudsPrisEksklMoms));
        }
    };

    // Håndter valg af postering til modregning
    const handleVælgKreditPostering = (postering) => {
        setKreditererPostering(postering);
        setVisKreditPosteringSøgning(false);
        setKreditPosteringSøgetekst("");
        kopierVærdierFraPostering(postering);
    };

    // Handle outlay change
    const handleOutlayChange = (index, event) => {
        const newOutlays = [...outlays];
        newOutlays[index][event.target.name] = event.target.value;
        setOutlays(newOutlays);
    };

    // Delete outlay
    const deleteOutlay = async (index) => {
        setOutlays((prevOutlays) => {
            const newOutlays = [...prevOutlays];
            const deletedOutlay = newOutlays.splice(index, 1)[0];
    
            if (deletedOutlay?.kvittering) {
                const storageRef = ref(storage, deletedOutlay.kvittering);
                deleteObject(storageRef)
                    .then(() => console.log("Image deleted successfully"))
                    .catch(error => console.log("Error deleting image:", error));
            }
    
            return newOutlays;
        });
    };

    // Handle materiale change
    const handleMaterialeChange = (index, event) => {
        const newMaterialer = [...materialer];
        newMaterialer[index][event.target.name] = event.target.value;
        setMaterialer(newMaterialer);
    };

    // Delete materiale
    const deleteMateriale = async (index) => {
        setMaterialer((prevMaterialer) => {
            const newMaterialer = [...prevMaterialer];
            const deletedMateriale = newMaterialer.splice(index, 1)[0];
    
            if (deletedMateriale?.kvittering) {
                const storageRef = ref(storage, deletedMateriale.kvittering);
                deleteObject(storageRef)
                    .then(() => console.log("Kvittering deleted successfully"))
                    .catch(error => console.log("Error deleting kvittering:", error));
            }
            
            if (deletedMateriale?.billede && deletedMateriale.manueltRegistreret) {
                const storageRef = ref(storage, deletedMateriale.billede);
                deleteObject(storageRef)
                    .then(() => console.log("Billede deleted successfully"))
                    .catch(error => console.log("Error deleting billede:", error));
            }
    
            return newMaterialer;
        });
    };

    // Toggle materiale erUdlaeg
    const toggleMaterialeErUdlaeg = (index) => {
        setMaterialer((prevMaterialer) => {
            const newMaterialer = [...prevMaterialer];
            const materiale = newMaterialer[index];
            const erUdlaeg = !materiale.erUdlaeg;
            
            newMaterialer[index] = {
                ...materiale,
                erUdlaeg: erUdlaeg,
                // Hvis erUdlaeg bliver true, sæt totalMedarbejderUdlaeg til kostpris
                totalMedarbejderUdlaeg: erUdlaeg ? (parseFloat(materiale.kostpris) || 0) * (parseFloat(materiale.antal) || 1) : 0,
                restMedarbejderUdlaeg: erUdlaeg ? (parseFloat(materiale.kostpris) || 0) * (parseFloat(materiale.antal) || 1) : 0
            };
            
            return newMaterialer;
        });
    };

    // Slet materiale kvittering
    const sletMaterialeKvittering = async (index) => {
        const materiale = materialer[index];
        if (materiale?.kvittering) {
            try {
                const storageRef = ref(storage, materiale.kvittering);
                await deleteObject(storageRef);
                console.log("Kvittering deleted successfully");
            } catch (error) {
                console.log("Error deleting kvittering:", error);
            }
            
            // Opdater materiale uden kvittering
            setMaterialer((prevMaterialer) => {
                const newMaterialer = [...prevMaterialer];
                newMaterialer[index] = {
                    ...newMaterialer[index],
                    kvittering: ''
                };
                return newMaterialer;
            });
        }
    };

    // Handle manuel materiale billede (kvittering)
    const handleManuelMaterialeBillede = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        if (file.type.startsWith('image/')) {
            // Upload til Firebase
            setUploadingFiles(prev => [...prev, file]);
            
            const storageRef = ref(storage, `kvitteringer/${file.name + v4()}`);
            const uploadTask = uploadBytesResumable(storageRef, file);
            
            uploadTask.on(
                "state_changed",
                () => {},
                (error) => {
                    console.error("Error uploading kvittering:", error);
                    alert("Kvitteringsbillede kunne ikke uploades. Prøv igen.");
                    setUploadingFiles(prev => prev.filter(f => f !== file));
                },
                () => {
                    getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                        setNyMaterialeBilledePreview(downloadURL);
                        setNyMaterialeBillede(file);
                        setUploadingFiles(prev => prev.filter(f => f !== file));
                    });
                }
            );
        }
    };

    // Slet manuel materiale kvittering
    const handleSletManuelKvittering = async () => {
        if (nyMaterialeBilledePreview) {
            try {
                // Slet fra Firebase hvis det er en URL
                if (nyMaterialeBilledePreview.startsWith('http')) {
                    const storageRef = ref(storage, nyMaterialeBilledePreview);
                    await deleteObject(storageRef);
                    console.log("Kvittering deleted successfully");
                }
            } catch (error) {
                console.log("Error deleting kvittering:", error);
            }
            
            // Nulstil state
            setNyMaterialeBillede(null);
            setNyMaterialeBilledePreview(null);
        }
    };

    // Reset manuel materiale form
    const resetManuelMaterialeForm = () => {
        setNyMaterialeVarenummer("");
        setNyMaterialeBeskrivelse("");
        setNyMaterialeAntal("1");
        setNyMaterialeKostpris("0");
        setVisSalgspris(false);
        setNyMaterialeSalgspris("");
        setNyMaterialeBillede(null);
        setNyMaterialeBilledePreview(null);
        setNyMaterialeErUdlaeg(false);
        setVisManuelTilføjelse(false);
    };

    // Bekræft manuel materiale
    const bekræftManuelMateriale = () => {
        if (!nyMaterialeBeskrivelse.trim() || !nyMaterialeAntal || parseFloat(nyMaterialeAntal) <= 0) {
            return;
        }
        
        const antal = parseFloat(nyMaterialeAntal) || 1;
        const kostpris = parseFloat(nyMaterialeKostpris) || 0;
        const salgspris = visSalgspris && nyMaterialeSalgspris ? parseFloat(nyMaterialeSalgspris) : kostpris;
        const totalMedarbejderUdlaeg = nyMaterialeErUdlaeg ? kostpris * antal : 0;

        const nytMateriale = {
            varenummer: nyMaterialeVarenummer || '',
            beskrivelse: nyMaterialeBeskrivelse,
            antal: antal,
            kostpris: kostpris,
            salgspris: salgspris,
            billede: '',
            manueltRegistreret: true,
            erUdlaeg: nyMaterialeErUdlaeg,
            totalMedarbejderUdlaeg: totalMedarbejderUdlaeg,
            restMedarbejderUdlaeg: totalMedarbejderUdlaeg,
            kvittering: (nyMaterialeErUdlaeg && nyMaterialeBilledePreview) ? nyMaterialeBilledePreview : ''
        };

        setMaterialer((prev) => [...prev, nytMateriale]);
        resetManuelMaterialeForm();
    };

    // Clear state with cleanup
    const clearState = async () => {
        await cleanupUploadedFiles();
        clearFormState();
    };

    // Submit postering (opret eller rediger)
    const tilføjPostering = () => {
        const aktuelleSatser = valgtMedarbejder?.satser || user?.satser || satser;
        const kundeSatser = opgave?.kunde?.satser || {};
        const posteringSatser = { ...satser, ...aktuelleSatser, ...kundeSatser };
        
        // Hent brugerens individuelle honorarsatser (ny struktur med mappings)
        // Bruges KUN til honorar-beregning, ikke priser
        const brugerSatser = valgtMedarbejder?.satser || user?.satser || {};

        // Build postering arrays
        const timeregistrering = bygTimeregistrering({
            valgteTimetyper,
            timetyper,
            rabatProcent,
            indstillinger,
            brugerSatser  // Medarbejderens individuelle honorarsatser
        });

        const fasteTillæg = bygFasteTillaeg({
            valgteFasteTillaeg,
            fasteTillaeg,
            rabatProcent,
            indstillinger,
            brugerSatser  // Medarbejderens individuelle honorarsatser
        });

        const procentTillæg = bygProcentTillaeg({
            valgteTimetyper,
            timetyper,
            procentTillaeg,
            rabatProcent,
            indstillinger,
            brugerSatser  // Medarbejderens individuelle honorarsatser
        });

        const udlæg = bygUdlaeg(outlays);
        
        const materialerArray = bygMaterialer(materialer);

        // Build postering object
        const postering = bygPosteringObjekt({
            posteringDato,
            posteringBeskrivelse,
            timeregistrering,
            fasteTillæg,
            procentTillæg,
            udlæg,
            materialer: materialerArray,
            posteringBilleder,
            posteringSatser,
            rabatProcent,
            dynamiskHonorarBeregning,
            dynamiskPrisBeregning,
            posteringFastHonorar,
            posteringFastPris,
            opgaveID: isEditMode ? eksisterendePostering.opgaveID : opgaveID,
            brugerID: isEditMode ? eksisterendePostering.brugerID : userID,
            kundeID: isEditMode ? eksisterendePostering.kundeID : opgave?.kundeID,
            opretPosteringPåVegneAfEnAnden,
            valgtMedarbejder,
            // Nye felter
            posteringType,
            kreditererPostering,
            kreditKommentar,
            låsPosteringVedOprettelse,
            tilbudsPrisEksklMoms,
            momsDefault: indstillinger?.momsDefault || { land: 'DK', sats: 25 }
        });

        // Validate tilbudspris hvis aktiveret
        if (!dynamiskPrisBeregning && (!tilbudsPrisEksklMoms || Number(tilbudsPrisEksklMoms) < 0)) {
            window.alert("Du skal angive en tilbudspris (min. 0 kr.) når Tilbudspris er aktiveret.");
            return;
        }

        // Validate
        if (!postering.totalHonorar && !postering.totalPris) {
            window.alert(isEditMode 
                ? "Du kan ikke fjerne al indhold fra en postering. Du kan slette posteringen, eller tilføje andet indhold til den."
                : "Du kan ikke oprette en postering uden indhold. Tilføj data til posteringen, og prøv igen."
            );
            return;
        }

        if (!postering.kundeID) {
            window.alert("Kunde ikke registreret. Prøv igen.");
            return;
        }

        const actualOpgaveID = isEditMode ? eksisterendePostering.opgaveID : opgaveID;
        if (!actualOpgaveID) {
            window.alert("Opgave ikke registreret. Prøv igen.");
            return;
        }

        const actualBrugerID = isEditMode ? eksisterendePostering.brugerID : userID;
        if (!actualBrugerID) {
            window.alert("Bruger ikke registreret. Prøv igen.");
            return;
        }

        // Submit - brug redigerPostering hvis vi er i edit mode
        if (isEditMode) {
            redigerPostering({
                posteringId: eksisterendePostering._id,
                postering,
                user,
                props,
                setNyeUploadedeBilleder,
                clearFormState,
                refetchPostering: props.refetchPostering
            });
        } else {
            opretPostering({
                postering,
                user,
                props,
                opretPosteringPåVegneAfEnAnden,
                valgtMedarbejder,
                nuværendeAnsvarlige,
                opgave,
                setNyeUploadedeBilleder,
                clearFormState,
                setRefetchPosteringer
            });
        }
    };

    return (
        <>
            <Modal 
                trigger={props.trigger} 
                setTrigger={props.setTrigger} 
                closeIsBackButton={kvitteringBillede} 
                setBackFunction={setKvitteringBillede} 
                onClose={clearState}
            >
                {!kvitteringBillede ? (
                    <>
                        <h2 className={`${ÅbenOpgaveCSS.modalHeading} ${Styles.modalHeading}`}>
                            <ReceiptText size={20} />
                            {isEditMode ? 'Rediger postering' : 'Ny postering'}
                        </h2>
                        <form 
                            className={`${ÅbenOpgaveCSS.modalForm} ${ÅbenOpgaveCSS.posteringForm}`} 
                            onSubmit={(e) => {
                                e.preventDefault();
                                tilføjPostering();
                            }}
                        >
                            <PosteringHeader
                                user={user}
                                posteringDato={posteringDato}
                                setPosteringDato={setPosteringDato}
                                dateInputRef={dateInputRef}
                                nuværendeMedarbejder={nuværendeMedarbejder}
                                valgtMedarbejder={valgtMedarbejder}
                                setValgtMedarbejder={state.setValgtMedarbejder}
                                visMedarbejderDropdown={visMedarbejderDropdown}
                                setVisMedarbejderDropdown={setVisMedarbejderDropdown}
                                medarbejderSøgetekst={medarbejderSøgetekst}
                                setMedarbejderSøgetekst={setMedarbejderSøgetekst}
                                medarbejdere={medarbejdere}
                                dynamiskPrisBeregning={dynamiskPrisBeregning}
                                setDynamiskPrisBeregning={setDynamiskPrisBeregning}
                                dynamiskHonorarBeregning={dynamiskHonorarBeregning}
                                setDynamiskHonorarBeregning={setDynamiskHonorarBeregning}
                                posteringType={posteringType}
                                setPosteringType={setPosteringType}
                                låsPosteringVedOprettelse={låsPosteringVedOprettelse}
                                setLåsPosteringVedOprettelse={setLåsPosteringVedOprettelse}
                            />

                            <PosteringTabs 
                                aktivFane={aktivFane} 
                                setAktivFane={setAktivFane} 
                            />

                            {/* Fane: Beskrivelse */}
                            {aktivFane === 'beskrivelse' && (
                                <BeskrivelseTab
                                    user={user}
                                    dynamiskPrisBeregning={dynamiskPrisBeregning}
                                    dynamiskHonorarBeregning={dynamiskHonorarBeregning}
                                    posteringFastPris={posteringFastPris}
                                    setPosteringFastPris={setPosteringFastPris}
                                    posteringFastHonorar={posteringFastHonorar}
                                    setPosteringFastHonorar={setPosteringFastHonorar}
                                    posteringBeskrivelse={posteringBeskrivelse}
                                    setPosteringBeskrivelse={setPosteringBeskrivelse}
                                    fastPrisInfobox={fastPrisInfobox}
                                    posteringBilleder={posteringBilleder}
                                    uploadingFiles={uploadingFiles}
                                    isCompressingVideo={isCompressingVideo}
                                    dragging={dragging}
                                    setDragging={setDragging}
                                    handlePosteringFileChange={handlePosteringFileChange}
                                    handlePosteringFileDrop={handlePosteringFileDrop}
                                    handleDeletePosteringFile={handleDeletePosteringFile}
                                    åbnBillede={åbnBillede}
                                    setÅbnBillede={setÅbnBillede}
                                    imageIndex={imageIndex}
                                    setImageIndex={setImageIndex}
                                    // Kredit-postering props
                                    posteringType={posteringType}
                                    kreditererPostering={kreditererPostering}
                                    setKreditererPostering={setKreditererPostering}
                                    kreditKommentar={kreditKommentar}
                                    setKreditKommentar={setKreditKommentar}
                                    visKreditPosteringSøgning={visKreditPosteringSøgning}
                                    setVisKreditPosteringSøgning={setVisKreditPosteringSøgning}
                                    kreditPosteringSøgetekst={kreditPosteringSøgetekst}
                                    setKreditPosteringSøgetekst={setKreditPosteringSøgetekst}
                                    søgbarePosteringer={søgbarePosteringer}
                                    handleVælgKreditPostering={handleVælgKreditPostering}
                                    // Tilbudspris props
                                    tilbudsPrisEksklMoms={tilbudsPrisEksklMoms}
                                    setTilbudsPrisEksklMoms={setTilbudsPrisEksklMoms}
                                    // Preview honorar for modregning visning
                                    previewDynamiskHonorar={previewDynamiskHonorar}
                                />
                            )}

                            {/* Fane: Timer & tillæg */}
                            {aktivFane === 'timer' && (
                                <TimerTillaegTab
                                    isMobile={isMobile}
                                    timetyper={timetyper}
                                    fasteTillaeg={fasteTillaeg}
                                    procentTillaeg={procentTillaeg}
                                    valgteTimetyper={valgteTimetyper}
                                    setValgteTimetyper={setValgteTimetyper}
                                    valgteFasteTillaeg={valgteFasteTillaeg}
                                    setValgteFasteTillaeg={setValgteFasteTillaeg}
                                    visTilføjTimer={visTilføjTimer}
                                    setVisTilføjTimer={setVisTilføjTimer}
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
                                    visTillaegFelter={visTillaegFelter}
                                    setVisTillaegFelter={setVisTillaegFelter}
                                    redigerTimerIndex={redigerTimerIndex}
                                    setRedigerTimerIndex={setRedigerTimerIndex}
                                    dynamiskHonorarBeregning={dynamiskHonorarBeregning}
                                    dynamiskPrisBeregning={dynamiskPrisBeregning}
                                />
                            )}

                            {/* Fane: Materialer */}
                            {aktivFane === 'materialer' && (
                                <MaterialerTab
                                    isMobile={isMobile}
                                    materialer={materialer}
                                    setMaterialer={setMaterialer}
                                    materialeKvitteringLoadingStates={materialeKvitteringLoadingStates}
                                    redigerMaterialeIndex={redigerMaterialeIndex}
                                    setRedigerMaterialeIndex={setRedigerMaterialeIndex}
                                    materialeSøgning={materialeSøgning}
                                    setMaterialeSøgning={setMaterialeSøgning}
                                    søgningFokuseret={søgningFokuseret}
                                    setSøgningFokuseret={setSøgningFokuseret}
                                    visManuelTilføjelse={visManuelTilføjelse}
                                    setVisManuelTilføjelse={setVisManuelTilføjelse}
                                    filtreredeVarer={filtreredeVarer}
                                    varer={state.varer}
                                    nyMaterialeVarenummer={nyMaterialeVarenummer}
                                    setNyMaterialeVarenummer={setNyMaterialeVarenummer}
                                    nyMaterialeBeskrivelse={nyMaterialeBeskrivelse}
                                    setNyMaterialeBeskrivelse={setNyMaterialeBeskrivelse}
                                    nyMaterialeAntal={nyMaterialeAntal}
                                    setNyMaterialeAntal={setNyMaterialeAntal}
                                    nyMaterialeKostpris={nyMaterialeKostpris}
                                    setNyMaterialeKostpris={setNyMaterialeKostpris}
                                    visSalgspris={visSalgspris}
                                    setVisSalgspris={setVisSalgspris}
                                    nyMaterialeSalgspris={nyMaterialeSalgspris}
                                    setNyMaterialeSalgspris={setNyMaterialeSalgspris}
                                    nyMaterialeBillede={nyMaterialeBillede}
                                    setNyMaterialeBillede={setNyMaterialeBillede}
                                    nyMaterialeBilledePreview={nyMaterialeBilledePreview}
                                    setNyMaterialeBilledePreview={setNyMaterialeBilledePreview}
                                    nyMaterialeErUdlaeg={nyMaterialeErUdlaeg}
                                    setNyMaterialeErUdlaeg={setNyMaterialeErUdlaeg}
                                    handleMaterialeKvitteringUpload={handleMaterialeKvitteringUpload}
                                    handleManuelMaterialeBillede={handleManuelMaterialeBillede}
                                    handleSletManuelKvittering={handleSletManuelKvittering}
                                    bekræftManuelMateriale={bekræftManuelMateriale}
                                    resetManuelMaterialeForm={resetManuelMaterialeForm}
                                    handleMaterialeChange={handleMaterialeChange}
                                    deleteMateriale={deleteMateriale}
                                    toggleMaterialeErUdlaeg={toggleMaterialeErUdlaeg}
                                    sletMaterialeKvittering={sletMaterialeKvittering}
                                    setKvitteringBillede={setKvitteringBillede}
                                />
                            )}

                            {/* Fane: Pauser */}
                            {aktivFane === 'pauser' && (
                                <PauserTab
                                    pausetyper={pausetyper}
                                    valgtePauser={valgtePauser}
                                    setValgtePauser={setValgtePauser}
                                />
                            )}

                            <PosteringFooter
                                dynamiskHonorarBeregning={dynamiskHonorarBeregning}
                                previewDynamiskHonorar={previewDynamiskHonorar}
                                posteringFastHonorar={posteringFastHonorar}
                                rabatProcent={rabatProcent}
                                previewDynamiskOutlays={previewDynamiskOutlays}
                                kvitteringLoadingStates={kvitteringLoadingStates}
                                uploadingFiles={uploadingFiles}
                                brugHonorar={dynamiskHonorarBeregning || Number(posteringFastHonorar) > 0}
                                isEditMode={isEditMode}
                                isEditingTimer={visTilføjTimer || redigerTimerIndex !== null}
                                isEditingMateriale={visManuelTilføjelse || redigerMaterialeIndex !== null}
                            />
                        </form>
                    </>
                ) : (
                    <PageAnimation>
                        <div className={ÅbenOpgaveCSS.billedModalHeader}>
                            <img 
                                className={ÅbenOpgaveCSS.backArrow} 
                                src={BackArrow} 
                                onClick={() => setKvitteringBillede("")}
                            />
                            <h2>Billedvisning</h2>    
                        </div>
                        <img src={kvitteringBillede} className={ÅbenOpgaveCSS.kvitteringBilledeStort} />
                    </PageAnimation>
                )}
            </Modal>
        </>
    );
};

export default AddPosteringV2;

