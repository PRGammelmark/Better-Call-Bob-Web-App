import { useEffect } from 'react';
import axios from 'axios';

/**
 * Custom hook til at håndtere API-kald for AddPosteringV2
 */
export function usePosteringApi({
    user,
    trigger,
    props,
    state
}) {
    const {
        setTimetyper,
        setFasteTillaeg,
        setProcentTillaeg,
        setVarer,
        setPausetyper,
        setMedarbejdere,
        setOpgave,
        setOpgaveID,
        setNuværendeAnsvarlige,
        setPosteringer,
        setPosteringBilleder,
        setNyeUploadedeBilleder,
        setFiltreredeVarer,
        materialeSøgning,
        varer,
        setSøgbarePosteringer,
        posteringType
    } = state;

    // Hent timetyper, faste tillæg, procent tillæg og varer
    useEffect(() => {
        if (user?.token) {
            // Hent timetyper
            axios.get(`${import.meta.env.VITE_API_URL}/timetyper/`, {
                headers: { 'Authorization': `Bearer ${user.token}` }
            })
            .then(response => {
                setTimetyper(response.data.filter(t => t.aktiv).sort((a, b) => a.rækkefølge - b.rækkefølge));
            })
            .catch(console.log);

            // Hent faste tillæg
            axios.get(`${import.meta.env.VITE_API_URL}/fasteTillaeg/`, {
                headers: { 'Authorization': `Bearer ${user.token}` }
            })
            .then(response => {
                setFasteTillaeg(response.data.filter(t => t.aktiv).sort((a, b) => a.rækkefølge - b.rækkefølge));
            })
            .catch(console.log);

            // Hent procent tillæg
            axios.get(`${import.meta.env.VITE_API_URL}/procentTillaeg/`, {
                headers: { 'Authorization': `Bearer ${user.token}` }
            })
            .then(response => {
                setProcentTillaeg(response.data.filter(t => t.aktiv).sort((a, b) => a.rækkefølge - b.rækkefølge));
            })
            .catch(console.log);

            // Hent varer (varekatalog)
            axios.get(`${import.meta.env.VITE_API_URL}/varer/`, {
                headers: { 'Authorization': `Bearer ${user.token}` }
            })
            .then(response => {
                setVarer(response.data || []);
            })
            .catch(console.log);

            // Hent pausetyper (TODO: Skal senere hentes fra separat pausetyper endpoint)
            setPausetyper([
                { _id: '1', beskrivelse: 'Frokostpause', varighed: 30 },
                { _id: '2', beskrivelse: 'Kort pause', varighed: 15 },
                { _id: '3', beskrivelse: 'Længere pause', varighed: 60 }
            ]);
        }
    }, [user?.token]);

    // Filtrer varer baseret på søgning
    useEffect(() => {
        if (!materialeSøgning.trim()) {
            setFiltreredeVarer([]);
        } else {
            const søgning = materialeSøgning.toLowerCase();
            const filtrerede = varer.filter(vare => 
                vare.varenummer?.toLowerCase().includes(søgning) ||
                vare.beskrivelse?.toLowerCase().includes(søgning)
            );
            setFiltreredeVarer(filtrerede);
        }
    }, [materialeSøgning, varer]);

    // Hvis der ikke er en opgaveID, så hent den fra URL'en
    useEffect(() => {
        if (window.location.pathname.includes("opgave") && !props.opgaveID) {
            const opgaveIDFromURL = window.location.pathname.split("/").pop();

            axios.get(`${import.meta.env.VITE_API_URL}/opgaver/${opgaveIDFromURL}`, {
                headers: { 'Authorization': `Bearer ${user.token}` }
            })
            .then(response => {
                setOpgave(response.data);
                setOpgaveID(response.data._id);
                setNuværendeAnsvarlige(response.data.ansvarlig);
            })
            .catch(console.log);

            axios.get(`${import.meta.env.VITE_API_URL}/posteringer/opgave/${opgaveIDFromURL}`, {
                headers: { 'Authorization': `Bearer ${user.token}` }
            })
            .then(response => {
                setPosteringer(response.data);
            })
            .catch(console.log);
        }
    }, [trigger]);

    // Hent medarbejdere når modalen åbnes
    useEffect(() => {
        if (trigger && user?.token) {
            axios.get(`${import.meta.env.VITE_API_URL}/brugere`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            })
            .then(response => {
                setMedarbejdere(response.data);
            })
            .catch(error => {
                console.log(error);
            });
        }
    }, [trigger, user?.token]);

    // Hent posteringer til kredit-søgning når posteringType er 'kredit'
    useEffect(() => {
        if (posteringType === 'kredit' && user?.token) {
            axios.get(`${import.meta.env.VITE_API_URL}/posteringer/`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            })
            .then(response => {
                // Sorter efter dato (nyeste først) og filtrer kun debet-posteringer
                const debetPosteringer = response.data
                    .filter(p => p.type !== 'kredit')
                    .sort((a, b) => new Date(b.dato) - new Date(a.dato));
                setSøgbarePosteringer(debetPosteringer);
            })
            .catch(error => {
                console.log(error);
            });
        }
    }, [posteringType, user?.token]);

    // Initialiser billeder når modalen åbnes
    useEffect(() => {
        if (trigger) {
            if (props.postering?.billeder && Array.isArray(props.postering.billeder)) {
                setPosteringBilleder([...props.postering.billeder]);
                setNyeUploadedeBilleder([]);
            } else {
                setPosteringBilleder([]);
                setNyeUploadedeBilleder([]);
            }
        }
    }, [trigger, props.postering?.billeder]);
}

/**
 * Funktion til at oprette postering via API
 */
export async function opretPostering({
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
}) {
    try {
        const res = await axios.post(`${import.meta.env.VITE_API_URL}/posteringer/`, postering, {
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        });

        // Håndter tilføjelse af medarbejder som ansvarlig
        if (opretPosteringPåVegneAfEnAnden && valgtMedarbejder && 
            !nuværendeAnsvarlige.some(ansvarlig => ansvarlig._id === valgtMedarbejder._id)) {
            
            await axios.patch(`${import.meta.env.VITE_API_URL}/opgaver/${props.opgaveID}`, {
                ansvarlig: [...nuværendeAnsvarlige, valgtMedarbejder],
            }, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });

            if (props?.setNuværendeAnsvarlige) {
                props.setNuværendeAnsvarlige([...nuværendeAnsvarlige, valgtMedarbejder]);
            }

            // Send email notifikation
            try {
                const kundeRes = await axios.get(`${import.meta.env.VITE_API_URL}/kunder/${opgave.kundeID}`, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    }
                });
                const kunde = kundeRes.data;

                await axios.post(`${import.meta.env.VITE_API_URL}/send-email`, {
                    to: valgtMedarbejder?.email,
                    subject: "Du har fået tildelt en ny opgave",
                    body: "Du har fået tildelt en ny opgave hos Better Call Bob.\n\nOpgaveinformationer:\n\nKundens navn: " + kunde?.navn + "\n\nAdresse: " + kunde?.adresse + "\n\nOpgavebeskrivelse: " + opgave.opgaveBeskrivelse + "\n\nGå ind på app'en for at se opgaven.\n\n//Better Call Bob",
                    html: "<p>Du har fået tildelt en ny opgave hos Better Call Bob.</p><b>Opgaveinformationer:</b><br />Kundens navn: " + kunde?.navn + "<br />Adresse: " + kunde?.adresse + "<br />Opgavebeskrivelse: " + opgave.opgaveBeskrivelse + "</p><p>Gå ind på <a href='https://app.bettercallbob.dk'>app'en</a> for at se opgaven.</p><p>//Better Call Bob</p>"
                });
            } catch (emailError) {
                console.log("Email fejl:", emailError);
            }
        }

        // Ryd op
        setNyeUploadedeBilleder([]);
        props.setTrigger(false);
        clearFormState();

        if (!props.opgaveID) {
            setRefetchPosteringer(true);
        }

        return { success: true, data: res.data };
    } catch (error) {
        console.log(error);
        return { success: false, error };
    }
}

/**
 * Funktion til at redigere en eksisterende postering via API (PATCH)
 */
export async function redigerPostering({
    posteringId,
    postering,
    user,
    props,
    setNyeUploadedeBilleder,
    clearFormState,
    refetchPostering
}) {
    try {
        const res = await axios.patch(`${import.meta.env.VITE_API_URL}/posteringer/${posteringId}`, postering, {
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        });

        // Ryd op
        setNyeUploadedeBilleder([]);
        props.setTrigger(false);
        clearFormState();

        // Refetch posteringen for at opdatere UI
        if (refetchPostering) {
            refetchPostering();
        }

        return { success: true, data: res.data };
    } catch (error) {
        console.log(error);
        return { success: false, error };
    }
}

export default usePosteringApi;

