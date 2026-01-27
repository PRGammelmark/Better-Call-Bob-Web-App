import { useState, useRef, useEffect } from 'react';
import dayjs from 'dayjs';
import { FFmpeg } from '@ffmpeg/ffmpeg';

/**
 * Custom hook til at håndtere al state for AddPosteringV2
 * Grupperer relaterede states for bedre overblik
 */
export function useAddPosteringState(props) {
    // Hent eksisterende postering hvis vi er i redigeringstilstand
    const eksisterendePostering = props.eksisterendePostering || null;
    const isEditMode = !!eksisterendePostering;

    // ============================================
    // Medarbejder-valg states
    // ============================================
    const [opretPosteringPåVegneAfEnAnden, setOpretPosteringPåVegneAfEnAnden] = useState(false);
    const [medarbejdere, setMedarbejdere] = useState([]);
    const [valgtMedarbejder, setValgtMedarbejder] = useState(null);
    const [visMedarbejderDropdown, setVisMedarbejderDropdown] = useState(false);
    const [medarbejderSøgetekst, setMedarbejderSøgetekst] = useState("");

    // ============================================
    // UI states
    // ============================================
    const [visTimetypeDropdown, setVisTimetypeDropdown] = useState(false);
    const [visTillaegDropdown, setVisTillaegDropdown] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 750);
    const [aktivFane, setAktivFane] = useState("beskrivelse");
    const dateInputRef = useRef(null);

    // ============================================
    // Dynamiske typer states
    // ============================================
    const [timetyper, setTimetyper] = useState([]);
    const [fasteTillaeg, setFasteTillaeg] = useState([]);
    const [procentTillaeg, setProcentTillaeg] = useState([]);

    // ============================================
    // Timeregistrering states
    // ============================================
    const [valgteTimetyper, setValgteTimetyper] = useState([]); // Array af {timetypeId, antal, rabat?, rabatEnhed?}
    const [visTilføjTimer, setVisTilføjTimer] = useState(false);
    const [nyTimetypeValg, setNyTimetypeValg] = useState("");
    const [nyTimetypeAntal, setNyTimetypeAntal] = useState("");
    const [nyTimerRabat, setNyTimerRabat] = useState("");
    const [visRabatFelter, setVisRabatFelter] = useState(false);
    const [nyTimerTillaeg, setNyTimerTillaeg] = useState([]); // Array af valgte procenttillæg IDs
    const [visTillaegFelter, setVisTillaegFelter] = useState(false);
    const [redigerTimerIndex, setRedigerTimerIndex] = useState(null);

    // ============================================
    // Faste tillæg states
    // ============================================
    const [valgteFasteTillaeg, setValgteFasteTillaeg] = useState([]); // Array af {tillaegId, antal}

    // ============================================
    // Procent tillæg states
    // ============================================
    const [valgteProcentTillaeg, setValgteProcentTillaeg] = useState([]); // Array af {tillaegId, aktiv}
    const [visTillaegTypeValg, setVisTillaegTypeValg] = useState(false);

    // ============================================
    // Udlæg states
    // ============================================
    const [outlays, setOutlays] = useState([]);
    const [kvitteringLoadingStates, setKvitteringLoadingStates] = useState({});

    // ============================================
    // Materialer states
    // ============================================
    const [materialer, setMaterialer] = useState([]);
    const [materialeKvitteringLoadingStates, setMaterialeKvitteringLoadingStates] = useState({});
    const [redigerMaterialeIndex, setRedigerMaterialeIndex] = useState(null);

    // ============================================
    // Materialer søgning states
    // ============================================
    const [materialeSøgning, setMaterialeSøgning] = useState("");
    const [søgningFokuseret, setSøgningFokuseret] = useState(false);
    const [visManuelTilføjelse, setVisManuelTilføjelse] = useState(false);
    const [varer, setVarer] = useState([]);
    const [filtreredeVarer, setFiltreredeVarer] = useState([]);

    // ============================================
    // Manuel materiale tilføjelse states
    // ============================================
    const [nyMaterialeVarenummer, setNyMaterialeVarenummer] = useState("");
    const [nyMaterialeBeskrivelse, setNyMaterialeBeskrivelse] = useState("");
    const [nyMaterialeAntal, setNyMaterialeAntal] = useState("1");
    const [nyMaterialeKostpris, setNyMaterialeKostpris] = useState("0");
    const [visSalgspris, setVisSalgspris] = useState(false);
    const [nyMaterialeSalgspris, setNyMaterialeSalgspris] = useState("");
    const [nyMaterialeBillede, setNyMaterialeBillede] = useState(null);
    const [nyMaterialeBilledePreview, setNyMaterialeBilledePreview] = useState(null);
    const [nyMaterialeErUdlaeg, setNyMaterialeErUdlaeg] = useState(false);

    // ============================================
    // Pauser states
    // ============================================
    const [pausetyper, setPausetyper] = useState([]);
    const [valgtePauser, setValgtePauser] = useState([]);

    // ============================================
    // Postering hoveddata states
    // ============================================
    const [posteringDato, setPosteringDato] = useState(dayjs().format('YYYY-MM-DD'));
    const [posteringBeskrivelse, setPosteringBeskrivelse] = useState("");
    const [dynamiskHonorarBeregning, setDynamiskHonorarBeregning] = useState(false); // Default til false - sættes til true hvis timelønViaArbejdssedler er aktiv
    const [dynamiskPrisBeregning, setDynamiskPrisBeregning] = useState(true);
    const [posteringFastHonorar, setPosteringFastHonorar] = useState(0);
    const [posteringFastPris, setPosteringFastPris] = useState(0);
    const [fastPrisInfobox, setFastPrisInfobox] = useState(false);
    const [previewDynamiskHonorar, setPreviewDynamiskHonorar] = useState(0);
    const [previewDynamiskOutlays, setPreviewDynamiskOutlays] = useState(0);
    const [rabatProcent, setRabatProcent] = useState(0);
    const [kvitteringBillede, setKvitteringBillede] = useState(null);

    // ============================================
    // Kredit-postering states
    // ============================================
    const [posteringType, setPosteringType] = useState('debet'); // 'debet' eller 'kredit'
    const [kreditererPostering, setKreditererPostering] = useState(null); // ID på postering der krediteres
    const [kreditKommentar, setKreditKommentar] = useState("");
    const [visKreditPosteringSøgning, setVisKreditPosteringSøgning] = useState(false);
    const [kreditPosteringSøgetekst, setKreditPosteringSøgetekst] = useState("");
    const [søgbarePosteringer, setSøgbarePosteringer] = useState([]);

    // ============================================
    // Lås postering state
    // ============================================
    const [låsPosteringVedOprettelse, setLåsPosteringVedOprettelse] = useState(false);

    // ============================================
    // Tilbudspris state
    // ============================================
    const [tilbudsPrisEksklMoms, setTilbudsPrisEksklMoms] = useState("");

    // ============================================
    // Billeder/videoer upload states
    // ============================================
    const [posteringBilleder, setPosteringBilleder] = useState([]);
    const [uploadingFiles, setUploadingFiles] = useState([]);
    const [åbnBillede, setÅbnBillede] = useState("");
    const [isCompressingVideo, setIsCompressingVideo] = useState(false);
    const [dragging, setDragging] = useState(false);
    const [imageIndex, setImageIndex] = useState(null);
    const ffmpegRef = useRef(new FFmpeg());
    const ffmpegLoaded = useRef(false);
    const [nyeUploadedeBilleder, setNyeUploadedeBilleder] = useState([]);

    // ============================================
    // Props-baserede states
    // ============================================
    const [opgave, setOpgave] = useState(props.opgave || null);
    const [opgaveID, setOpgaveID] = useState(props.opgaveID || null);
    const [nuværendeAnsvarlige, setNuværendeAnsvarlige] = useState(props.nuværendeAnsvarlige || []);
    const [posteringer, setPosteringer] = useState(props.posteringer || []);
    const [visDatoPicker, setVisDatoPicker] = useState(false);

    // ============================================
    // Initialiser state fra eksisterende postering (edit mode)
    // ============================================
    useEffect(() => {
        if (props.trigger && eksisterendePostering) {
            // Postering hoveddata
            setPosteringDato(dayjs(eksisterendePostering.dato).format('YYYY-MM-DD'));
            setPosteringBeskrivelse(eksisterendePostering.beskrivelse || "");
            
            // Dynamisk/Fast honorar & pris
            setDynamiskHonorarBeregning(eksisterendePostering.brugDynamiskHonorar ?? eksisterendePostering.dynamiskHonorarBeregning ?? false);
            setDynamiskPrisBeregning(eksisterendePostering.dynamiskPrisBeregning ?? true);
            setPosteringFastHonorar(eksisterendePostering.totalFastHonorar ?? eksisterendePostering.fastHonorar ?? 0);
            setPosteringFastPris(eksisterendePostering.fastPris ?? 0);
            
            // Timeregistreringer
            if (eksisterendePostering.timeregistrering && eksisterendePostering.timeregistrering.length > 0) {
                const mappedTimetyper = eksisterendePostering.timeregistrering.map(tr => ({
                    timetypeId: tr.timetypeId || null,
                    navn: tr.navn,
                    antal: tr.antal || 0,
                    tillaeg: [], // Procent tillæg skal mappes separat
                    rabat: tr.honorar?.rabatProcent || tr.pris?.rabatProcent || 0
                }));
                setValgteTimetyper(mappedTimetyper);
            }
            
            // Faste tillæg
            if (eksisterendePostering.fasteTillæg && eksisterendePostering.fasteTillæg.length > 0) {
                const mappedFasteTillaeg = eksisterendePostering.fasteTillæg.map(ft => ({
                    tillaegId: ft.tillaegId || null,
                    navn: ft.navn,
                    antal: ft.antal || 0
                }));
                setValgteFasteTillaeg(mappedFasteTillaeg);
            }
            
            // Materialer
            if (eksisterendePostering.materialer && eksisterendePostering.materialer.length > 0) {
                const mappedMaterialer = eksisterendePostering.materialer.map(m => ({
                    _id: m._id,
                    varenummer: m.varenummer || '',
                    beskrivelse: m.beskrivelse || '',
                    antal: m.antal || 1,
                    kostpris: m.kostpris || 0,
                    salgspris: m.salgspris || m.kostpris || 0,
                    manueltRegistreret: m.manueltRegistreret ?? true,
                    erUdlaeg: m.erUdlaeg ?? (m.totalMedarbejderUdlaeg > 0),
                    totalMedarbejderUdlaeg: m.totalMedarbejderUdlaeg || 0,
                    restMedarbejderUdlaeg: m.restMedarbejderUdlaeg || 0,
                    kvittering: m.kvittering || '',
                    billede: m.billede || ''
                }));
                setMaterialer(mappedMaterialer);
            }
            
            // Udlæg (legacy)
            if (eksisterendePostering.udlæg && eksisterendePostering.udlæg.length > 0) {
                const mappedOutlays = eksisterendePostering.udlæg.map(u => ({
                    beskrivelse: u.beskrivelse || '',
                    beløb: u.beløb || u.totalInklMoms || 0,
                    kvittering: u.kvittering || ''
                }));
                setOutlays(mappedOutlays);
            }
            
            // Billeder
            if (eksisterendePostering.billeder && eksisterendePostering.billeder.length > 0) {
                setPosteringBilleder([...eksisterendePostering.billeder]);
            }
            
            // Kredit-postering
            setPosteringType(eksisterendePostering.type || 'debet');
            setKreditererPostering(eksisterendePostering.kreditererPostering || null);
            setKreditKommentar(eksisterendePostering.kreditKommentar || "");
            
            // Lås postering
            setLåsPosteringVedOprettelse(eksisterendePostering.låst || false);
            
            // Tilbudspris
            if (eksisterendePostering.tilbudsPrisEksklMoms !== undefined && eksisterendePostering.tilbudsPrisEksklMoms !== null) {
                setTilbudsPrisEksklMoms(String(eksisterendePostering.tilbudsPrisEksklMoms));
            }
            
            // Opgave info
            if (eksisterendePostering.opgaveID) {
                setOpgaveID(eksisterendePostering.opgaveID);
            }
        }
    }, [props.trigger, eksisterendePostering?._id]);

    // ============================================
    // Clear state funktion
    // ============================================
    const clearFormState = () => {
        setOpretPosteringPåVegneAfEnAnden(false);
        setValgtMedarbejder(null);
        setOutlays([]);
        setKvitteringLoadingStates({});
        setMaterialer([]);
        setMaterialeKvitteringLoadingStates({});
        setRedigerMaterialeIndex(null);
        setValgteTimetyper([]);
        setValgteFasteTillaeg([]);
        setValgteProcentTillaeg([]);
        setVisTilføjTimer(false);
        setVisTillaegTypeValg(false);
        setVisTimetypeDropdown(false);
        setNyTimetypeValg("");
        setNyTimetypeAntal("");
        setNyTimerRabat("");
        setVisRabatFelter(false);
        setRedigerTimerIndex(null);
        setPosteringDato(dayjs().format('YYYY-MM-DD'));
        setPosteringBeskrivelse("");
        setDynamiskHonorarBeregning(false);
        setDynamiskPrisBeregning(true);
        setPosteringFastHonorar(0);
        setPosteringFastPris(0);
        setFastPrisInfobox(false);
        setPreviewDynamiskHonorar(0);
        setPreviewDynamiskOutlays(0);
        setRabatProcent(0);
        setKvitteringBillede(null);
        setVisDatoPicker(false);
        setVisMedarbejderDropdown(false);
        setPosteringBilleder([]);
        setUploadingFiles([]);
        setÅbnBillede("");
        setIsCompressingVideo(false);
        setDragging(false);
        setImageIndex(null);
        setNyeUploadedeBilleder([]);
        setMaterialeSøgning("");
        setSøgningFokuseret(false);
        setVisManuelTilføjelse(false);
        setNyMaterialeVarenummer("");
        setNyMaterialeBeskrivelse("");
        setNyMaterialeAntal("1");
        setNyMaterialeKostpris("0");
        setVisSalgspris(false);
        setNyMaterialeSalgspris("");
        setNyMaterialeBillede(null);
        setNyMaterialeBilledePreview(null);
        setNyMaterialeErUdlaeg(false);
        setValgtePauser([]);
        setPosteringType('debet');
        setKreditererPostering(null);
        setKreditKommentar("");
        setVisKreditPosteringSøgning(false);
        setKreditPosteringSøgetekst("");
        setSøgbarePosteringer([]);
        setLåsPosteringVedOprettelse(false);
        setTilbudsPrisEksklMoms("");
    };

    return {
        // Medarbejder
        opretPosteringPåVegneAfEnAnden, setOpretPosteringPåVegneAfEnAnden,
        medarbejdere, setMedarbejdere,
        valgtMedarbejder, setValgtMedarbejder,
        visMedarbejderDropdown, setVisMedarbejderDropdown,
        medarbejderSøgetekst, setMedarbejderSøgetekst,

        // UI
        visTimetypeDropdown, setVisTimetypeDropdown,
        visTillaegDropdown, setVisTillaegDropdown,
        isMobile, setIsMobile,
        aktivFane, setAktivFane,
        dateInputRef,

        // Dynamiske typer
        timetyper, setTimetyper,
        fasteTillaeg, setFasteTillaeg,
        procentTillaeg, setProcentTillaeg,

        // Timeregistrering
        valgteTimetyper, setValgteTimetyper,
        visTilføjTimer, setVisTilføjTimer,
        nyTimetypeValg, setNyTimetypeValg,
        nyTimetypeAntal, setNyTimetypeAntal,
        nyTimerRabat, setNyTimerRabat,
        visRabatFelter, setVisRabatFelter,
        nyTimerTillaeg, setNyTimerTillaeg,
        visTillaegFelter, setVisTillaegFelter,
        redigerTimerIndex, setRedigerTimerIndex,

        // Faste tillæg
        valgteFasteTillaeg, setValgteFasteTillaeg,

        // Procent tillæg
        valgteProcentTillaeg, setValgteProcentTillaeg,
        visTillaegTypeValg, setVisTillaegTypeValg,

        // Udlæg
        outlays, setOutlays,
        kvitteringLoadingStates, setKvitteringLoadingStates,

        // Materialer
        materialer, setMaterialer,
        materialeKvitteringLoadingStates, setMaterialeKvitteringLoadingStates,
        redigerMaterialeIndex, setRedigerMaterialeIndex,

        // Materialer søgning
        materialeSøgning, setMaterialeSøgning,
        søgningFokuseret, setSøgningFokuseret,
        visManuelTilføjelse, setVisManuelTilføjelse,
        varer, setVarer,
        filtreredeVarer, setFiltreredeVarer,

        // Manuel materiale
        nyMaterialeVarenummer, setNyMaterialeVarenummer,
        nyMaterialeBeskrivelse, setNyMaterialeBeskrivelse,
        nyMaterialeAntal, setNyMaterialeAntal,
        nyMaterialeKostpris, setNyMaterialeKostpris,
        visSalgspris, setVisSalgspris,
        nyMaterialeSalgspris, setNyMaterialeSalgspris,
        nyMaterialeBillede, setNyMaterialeBillede,
        nyMaterialeBilledePreview, setNyMaterialeBilledePreview,
        nyMaterialeErUdlaeg, setNyMaterialeErUdlaeg,

        // Pauser
        pausetyper, setPausetyper,
        valgtePauser, setValgtePauser,

        // Postering hoveddata
        posteringDato, setPosteringDato,
        posteringBeskrivelse, setPosteringBeskrivelse,
        dynamiskHonorarBeregning, setDynamiskHonorarBeregning,
        dynamiskPrisBeregning, setDynamiskPrisBeregning,
        posteringFastHonorar, setPosteringFastHonorar,
        posteringFastPris, setPosteringFastPris,
        fastPrisInfobox, setFastPrisInfobox,
        previewDynamiskHonorar, setPreviewDynamiskHonorar,
        previewDynamiskOutlays, setPreviewDynamiskOutlays,
        rabatProcent, setRabatProcent,
        kvitteringBillede, setKvitteringBillede,

        // Kredit-postering
        posteringType, setPosteringType,
        kreditererPostering, setKreditererPostering,
        kreditKommentar, setKreditKommentar,
        visKreditPosteringSøgning, setVisKreditPosteringSøgning,
        kreditPosteringSøgetekst, setKreditPosteringSøgetekst,
        søgbarePosteringer, setSøgbarePosteringer,

        // Lås postering
        låsPosteringVedOprettelse, setLåsPosteringVedOprettelse,

        // Tilbudspris
        tilbudsPrisEksklMoms, setTilbudsPrisEksklMoms,

        // Billeder/videoer
        posteringBilleder, setPosteringBilleder,
        uploadingFiles, setUploadingFiles,
        åbnBillede, setÅbnBillede,
        isCompressingVideo, setIsCompressingVideo,
        dragging, setDragging,
        imageIndex, setImageIndex,
        ffmpegRef,
        ffmpegLoaded,
        nyeUploadedeBilleder, setNyeUploadedeBilleder,

        // Props-baserede
        opgave, setOpgave,
        opgaveID, setOpgaveID,
        nuværendeAnsvarlige, setNuværendeAnsvarlige,
        posteringer, setPosteringer,
        visDatoPicker, setVisDatoPicker,

        // Edit mode
        isEditMode,
        eksisterendePostering,

        // Funktioner
        clearFormState
    };
}

export default useAddPosteringState;

