import { useEffect } from 'react';
import { beregnDynamiskHonorarOgPris } from '../utils/posteringBeregninger.js';

/**
 * Custom hook til at beregne dynamisk honorar og pris
 */
export function useHonorarBeregning({
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
}) {
    useEffect(() => {
        if (!dynamiskHonorarBeregning && !dynamiskPrisBeregning) return;

        // Hent brugerens individuelle honorarsatser (ny struktur med mappings)
        // Bruges KUN til honorar-beregning, ikke priser
        const brugerSatser = valgtMedarbejder?.satser || user?.satser || {};

        const { totalHonorar, totalOutlays } = beregnDynamiskHonorarOgPris({
            valgteTimetyper,
            valgteFasteTillaeg,
            valgteProcentTillaeg,
            outlays,
            materialer,
            rabatProcent,
            timetyper,
            fasteTillaeg,
            procentTillaeg,
            indstillinger,
            brugerSatser  // Medarbejderens individuelle honorarsatser
        });

        setPreviewDynamiskHonorar(totalHonorar);
        setPreviewDynamiskOutlays(totalOutlays);
    }, [
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
        dynamiskPrisBeregning
    ]);
}

export default useHonorarBeregning;
