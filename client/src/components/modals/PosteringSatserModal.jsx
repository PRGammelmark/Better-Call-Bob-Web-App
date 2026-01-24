import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Modal from '../Modal.jsx'
import PosteringCSS from '../Postering.module.css'
import styles from './PosteringSatserModal.module.css'
import dayjs from 'dayjs'
import satser from '../../variables'
import BackArrow from '../../assets/back.svg'
import PageAnimation from '../PageAnimation.jsx'
import { useAuthContext } from '../../hooks/useAuthContext'

const PosteringSatserModal = (props) => {
    const { user } = useAuthContext();
    const [kvitteringBillede, setKvitteringBillede] = useState(null)
    const [timetyper, setTimetyper] = useState([]);
    const [fasteTillaeg, setFasteTillaeg] = useState([]);
    const [procentTillaeg, setProcentTillaeg] = useState([]);
    
    const postering = props.postering;
    const bruger = props.brugere && props.brugere.find(user => (user?._id || user?.id) === postering.brugerID);
    const brugersAktuelleSatser = bruger && bruger.satser || satser;

    // Hent dynamiske typer fra API
    useEffect(() => {
        if (user?.token) {
            // Hent timetyper
            axios.get(`${import.meta.env.VITE_API_URL}/timetyper/`, {
                headers: { 'Authorization': `Bearer ${user.token}` }
            })
            .then(response => {
                setTimetyper(response.data.sort((a, b) => a.rækkefølge - b.rækkefølge));
            })
            .catch(console.log);

            // Hent faste tillæg
            axios.get(`${import.meta.env.VITE_API_URL}/fasteTillaeg/`, {
                headers: { 'Authorization': `Bearer ${user.token}` }
            })
            .then(response => {
                setFasteTillaeg(response.data.sort((a, b) => a.rækkefølge - b.rækkefølge));
            })
            .catch(console.log);

            // Hent procent tillæg
            axios.get(`${import.meta.env.VITE_API_URL}/procentTillaeg/`, {
                headers: { 'Authorization': `Bearer ${user.token}` }
            })
            .then(response => {
                setProcentTillaeg(response.data.sort((a, b) => a.rækkefølge - b.rækkefølge));
            })
            .catch(console.log);
        }
    }, [user?.token]);

    // Helper: Check om posteringen bruger ny struktur
    const erNyPosteringStruktur = (postering) => {
        return postering.posteringVersion === 2 || 
               (postering.timeregistrering && postering.timeregistrering.length > 0) ||
               (postering.fasteTillæg && postering.fasteTillæg.length > 0) ||
               (postering.procentTillæg && postering.procentTillæg.length > 0);
    };

    const getBrugerName = (brugerID) => {
        const bruger = props.brugere && props.brugere.find(user => (user?._id || user?.id) === brugerID);
        return bruger ? bruger.navn : 'Unknown User';
    };

    // Beregn løngruppe for gamle posteringer
    const beregnLøngruppeGammel = (postering) => {
        const akkumuleredeStandardSatser = 
            Number(satser.handymanTimerHonorar) + 
            Number(satser.tømrerTimerHonorar) + 
            Number(satser.rådgivningOpmålingVejledningHonorar) + 
            Number(satser.opstartsgebyrHonorar) + 
            Number(satser.aftenTillægHonorar) + 
            Number(satser.natTillægHonorar) + 
            Number(satser.trailerHonorar);

        const akkumuleredeBrugerSatser = 
            Number(postering.satser?.handymanTimerHonorar || 0) + 
            Number(postering.satser?.tømrerTimerHonorar || 0) + 
            Number(postering.satser?.rådgivningOpmålingVejledningHonorar || 0) + 
            Number(postering.satser?.opstartsgebyrHonorar || 0) + 
            Number(postering.satser?.aftenTillægHonorar || 0) + 
            Number(postering.satser?.natTillægHonorar || 0) + 
            Number(postering.satser?.trailerHonorar || 0);

        const løntrin = Math.floor((akkumuleredeBrugerSatser / akkumuleredeStandardSatser) * 10);
        return løntrin;
    }

    // Beregn løngruppe for nye posteringer baseret på timeregistrering arrays
    const beregnLøngruppeNy = (postering) => {
        // For nye posteringer beregner vi baseret på gennemsnitlig honorar sats vs standard kostpris
        let totalHonorarSatser = 0;
        let totalStandardSatser = 0;
        let antalPoster = 0;

        // Timeregistrering
        if (postering.timeregistrering && postering.timeregistrering.length > 0) {
            postering.timeregistrering.forEach(tr => {
                const honorarSats = tr.honorar?.sats || 0;
                // Find matchende timetype for at få standard kostpris
                const matchendeTimetype = timetyper.find(t => t.navn === tr.navn);
                const standardSats = matchendeTimetype?.kostpris || honorarSats;
                
                totalHonorarSatser += honorarSats;
                totalStandardSatser += standardSats;
                antalPoster++;
            });
        }

        // Faste tillæg
        if (postering.fasteTillæg && postering.fasteTillæg.length > 0) {
            postering.fasteTillæg.forEach(ft => {
                const honorarSats = ft.honorar?.sats || 0;
                const matchendeTillaeg = fasteTillaeg.find(t => t.navn === ft.navn);
                const standardSats = matchendeTillaeg?.kostpris || honorarSats;
                
                totalHonorarSatser += honorarSats;
                totalStandardSatser += standardSats;
                antalPoster++;
            });
        }

        // Procent tillæg - brug procentSats
        if (postering.procentTillæg && postering.procentTillæg.length > 0) {
            postering.procentTillæg.forEach(pt => {
                const honorarSats = pt.honorar?.procentSats || 0;
                const matchendeTillaeg = procentTillaeg.find(t => t.navn === pt.navn);
                const standardSats = matchendeTillaeg?.kostSats || honorarSats;
                
                totalHonorarSatser += honorarSats;
                totalStandardSatser += standardSats;
                antalPoster++;
            });
        }

        if (antalPoster === 0 || totalStandardSatser === 0) {
            // Fallback til gammel beregning hvis ingen poster
            return beregnLøngruppeGammel(postering);
        }

        const løntrin = Math.floor((totalHonorarSatser / totalStandardSatser) * 10);
        return løntrin;
    }

    // Hovedfunktion til løngruppe beregning
    const beregnLøngruppe = (postering) => {
        if (erNyPosteringStruktur(postering)) {
            return beregnLøngruppeNy(postering);
        }
        return beregnLøngruppeGammel(postering);
    }

    // Beregn aktuel løngruppe baseret på brugerens satser og dynamiske typer
    const beregnAktuelLøngruppe = (brugersAktuelleSatser) => {
        // Hvis vi har dynamiske typer, beregn baseret på dem
        if (timetyper.length > 0 || fasteTillaeg.length > 0 || procentTillaeg.length > 0) {
            let totalBrugerSatser = 0;
            let totalStandardSatser = 0;

            // Timetyper
            timetyper.filter(t => t.aktiv).forEach(timetype => {
                const standardSats = timetype.kostpris || 0;
                // Check om bruger har custom sats for denne timetype
                const brugerSats = brugersAktuelleSatser?.timetyper?.[timetype._id] ?? standardSats;
                
                totalBrugerSatser += brugerSats;
                totalStandardSatser += standardSats;
            });

            // Faste tillæg
            fasteTillaeg.filter(t => t.aktiv).forEach(tillaeg => {
                const standardSats = tillaeg.kostpris || 0;
                const brugerSats = brugersAktuelleSatser?.fasteTillaeg?.[tillaeg._id] ?? standardSats;
                
                totalBrugerSatser += brugerSats;
                totalStandardSatser += standardSats;
            });

            // Procent tillæg
            procentTillaeg.filter(t => t.aktiv).forEach(tillaeg => {
                const standardSats = tillaeg.kostSats || 0;
                const brugerSats = brugersAktuelleSatser?.procentTillaeg?.[tillaeg._id] ?? standardSats;
                
                totalBrugerSatser += brugerSats;
                totalStandardSatser += standardSats;
            });

            if (totalStandardSatser > 0) {
                return Math.floor((totalBrugerSatser / totalStandardSatser) * 10);
            }
        }

        // Fallback til gammel beregning med legacy satser
        const akkumuleredeStandardSatser = 
            Number(satser.handymanTimerHonorar) + 
            Number(satser.tømrerTimerHonorar) + 
            Number(satser.rådgivningOpmålingVejledningHonorar) + 
            Number(satser.opstartsgebyrHonorar) + 
            Number(satser.aftenTillægHonorar) + 
            Number(satser.natTillægHonorar) + 
            Number(satser.trailerHonorar);

        const akkumuleredeBrugerSatser = 
            Number(brugersAktuelleSatser?.handymanTimerHonorar || satser.handymanTimerHonorar) + 
            Number(brugersAktuelleSatser?.tømrerTimerHonorar || satser.tømrerTimerHonorar) + 
            Number(brugersAktuelleSatser?.rådgivningOpmålingVejledningHonorar || satser.rådgivningOpmålingVejledningHonorar) + 
            Number(brugersAktuelleSatser?.opstartsgebyrHonorar || satser.opstartsgebyrHonorar) + 
            Number(brugersAktuelleSatser?.aftenTillægHonorar || satser.aftenTillægHonorar) + 
            Number(brugersAktuelleSatser?.natTillægHonorar || satser.natTillægHonorar) + 
            Number(brugersAktuelleSatser?.trailerHonorar || satser.trailerHonorar);
        
        const løntrin = Math.floor((akkumuleredeBrugerSatser / akkumuleredeStandardSatser) * 10);
        return løntrin;
    }

    // Formatter valuta
    const formatValuta = (beløb) => {
        return Number(beløb || 0).toLocaleString('da-DK', { 
            style: 'currency', 
            currency: 'DKK', 
            minimumFractionDigits: 0, 
            maximumFractionDigits: 0 
        });
    };

    // Beregn total honorar for postering
    const getTotalHonorar = (postering) => {
        if (erNyPosteringStruktur(postering)) {
            // For nye posteringer brug totalDynamiskHonorar eller totalFastHonorar
            if (postering.brugDynamiskHonorar) {
                return postering.totalDynamiskHonorar || 0;
            } else if (postering.brugFastHonorar) {
                return postering.totalFastHonorar || 0;
            }
            return postering.totalDynamiskHonorar || postering.totalHonorar || 0;
        }
        return postering.totalHonorar || 0;
    };

    // Render posteringsrækker for nye posteringer
    const renderNyePosteringRækker = () => {
        const rækker = [];

        // Timeregistrering
        if (postering.timeregistrering && postering.timeregistrering.length > 0) {
            postering.timeregistrering.forEach((tr, index) => {
                rækker.push(
                    <div key={`tr-${index}`} className={styles.posteringRække}>
                        <span className={styles.posteringRækkeBeskrivelse}>{tr.antal} {tr.navn}</span>
                        <span className={styles.posteringRækkeSatser}>a' {tr.honorar?.sats || 0} kr.</span>
                        <span className={styles.posteringRækkeSatser}>{formatValuta(tr.honorar?.total || 0)}</span>
                    </div>
                );
            });
        }

        // Faste tillæg
        if (postering.fasteTillæg && postering.fasteTillæg.length > 0) {
            postering.fasteTillæg.forEach((ft, index) => {
                rækker.push(
                    <div key={`ft-${index}`} className={styles.posteringRække}>
                        <span className={styles.posteringRækkeBeskrivelse}>{ft.antal} {ft.navn}</span>
                        <span className={styles.posteringRækkeSatser}>a' {ft.honorar?.sats || 0} kr.</span>
                        <span className={styles.posteringRækkeSatser}>{formatValuta(ft.honorar?.total || 0)}</span>
                    </div>
                );
            });
        }

        // Procent tillæg
        if (postering.procentTillæg && postering.procentTillæg.length > 0) {
            postering.procentTillæg.forEach((pt, index) => {
                rækker.push(
                    <div key={`pt-${index}`} className={styles.posteringRække}>
                        <span className={styles.posteringRækkeBeskrivelse}>{pt.navn} ({pt.timetypeNavn}, +{pt.honorar?.procentSats || 0}%)</span>
                        <span className={styles.posteringRækkeSatser}>-</span>
                        <span className={styles.posteringRækkeSatser}>{formatValuta(pt.honorar?.total || 0)}</span>
                    </div>
                );
            });
        }

        // Materialer (medarbejder udlæg)
        if (postering.materialer && postering.materialer.length > 0) {
            const medarbejderUdlaeg = postering.materialer.filter(m => m.totalMedarbejderUdlaeg > 0);
            if (medarbejderUdlaeg.length > 0) {
                const totalMaterialeUdlaeg = medarbejderUdlaeg.reduce((sum, m) => sum + (m.totalMedarbejderUdlaeg || 0), 0);
                rækker.push(
                    <div key="materialer-udlaeg" className={styles.posteringRække}>
                        <span className={styles.posteringRækkeBeskrivelse}>{medarbejderUdlaeg.length} materiale-udlæg</span>
                        <span className={styles.posteringRækkeSatser}>-</span>
                        <span className={styles.posteringRækkeSatser}>{formatValuta(totalMaterialeUdlaeg)}</span>
                    </div>
                );
            }
        }

        // Udlæg
        if (postering.udlæg && postering.udlæg.length > 0) {
            const totalUdlæg = postering.udlæg.reduce((sum, item) => sum + Number(item.beløb || item.totalEksMoms || 0), 0);
            rækker.push(
                <div key="udlaeg" className={styles.posteringRække}>
                    <span className={styles.posteringRækkeBeskrivelse}>{postering.udlæg.length} udlæg</span>
                    <span className={styles.posteringRækkeSatser}>-</span>
                    <span className={styles.posteringRækkeSatser}>{formatValuta(totalUdlæg)}</span>
                </div>
            );
        }

        return rækker;
    };

    // Render posteringsrækker for gamle posteringer
    const renderGamlePosteringRækker = () => {
        return (
            <>
                {postering.opstart > 0 && (
                    <div className={styles.posteringRække}>
                        <span className={styles.posteringRækkeBeskrivelse}>1 Opstart</span>
                        <span className={styles.posteringRækkeSatser}>a' {postering.satser?.opstartsgebyrHonorar} kr.</span>
                        <span className={styles.posteringRækkeSatser}>{formatValuta(postering.opstart * postering.satser?.opstartsgebyrHonorar)}</span>
                    </div>
                )}
                {postering.handymanTimer > 0 && (
                    <div className={styles.posteringRække}>
                        <span className={styles.posteringRækkeBeskrivelse}>{postering.handymanTimer || 0} timer (handyman)</span>
                        <span className={styles.posteringRækkeSatser}>a' {postering.satser?.handymanTimerHonorar} kr.</span>    
                        <span className={styles.posteringRækkeSatser}>{formatValuta(postering.handymanTimer * postering.satser?.handymanTimerHonorar)}</span>
                    </div>
                )}
                {postering.tømrerTimer > 0 && (
                    <div className={styles.posteringRække}>
                        <span className={styles.posteringRækkeBeskrivelse}>{postering.tømrerTimer || 0} timer (tømrer)</span>
                        <span className={styles.posteringRækkeSatser}>a' {postering.satser?.tømrerTimerHonorar} kr.</span>
                        <span className={styles.posteringRækkeSatser}>{formatValuta(postering.tømrerTimer * postering.satser?.tømrerTimerHonorar)}</span>
                    </div>
                )}
                {postering.rådgivningOpmålingVejledning > 0 && (
                    <div className={styles.posteringRække}>
                        <span className={styles.posteringRækkeBeskrivelse}>{postering.rådgivningOpmålingVejledning || 0} timer (rådgivning)</span>
                        <span className={styles.posteringRækkeSatser}>a' {postering.satser?.rådgivningOpmålingVejledningHonorar} kr.</span>
                        <span className={styles.posteringRækkeSatser}>{formatValuta(postering.rådgivningOpmålingVejledning * postering.satser?.rådgivningOpmålingVejledningHonorar)}</span>
                    </div>
                )}
                {postering.aftenTillæg && (
                    <div className={styles.posteringRække}>
                        <span className={styles.posteringRækkeBeskrivelse}>Aftentillæg ({postering.satser?.aftenTillægHonorar}% x {postering.handymanTimer + postering.tømrerTimer + postering.rådgivningOpmålingVejledning})</span>
                        <span className={styles.posteringRækkeSatser}>a' {postering.satser?.aftenTillægHonorar}%</span>
                        <span className={styles.posteringRækkeSatser}>{formatValuta((postering.handymanTimer + postering.tømrerTimer + postering.rådgivningOpmålingVejledning) * (postering.satser?.aftenTillægHonorar))}</span>
                    </div>
                )}
                {postering.natTillæg && (
                    <div className={styles.posteringRække}>
                        <span className={styles.posteringRækkeBeskrivelse}>Nattillæg ({postering.satser?.natTillægHonorar}% x {postering.handymanTimer + postering.tømrerTimer + postering.rådgivningOpmålingVejledning})</span>
                        <span className={styles.posteringRækkeSatser}>a' {postering.satser?.natTillægHonorar}%</span>
                        <span className={styles.posteringRækkeSatser}>{formatValuta((postering.handymanTimer + postering.tømrerTimer + postering.rådgivningOpmålingVejledning) * (postering.satser?.natTillægHonorar))}</span>
                    </div>
                )}
                {postering.trailer && (
                    <div className={styles.posteringRække}>
                        <span className={styles.posteringRækkeBeskrivelse}>Trailer</span>
                        <span className={styles.posteringRækkeSatser}>a' {postering.satser?.trailerHonorar} kr.</span>
                        <span className={styles.posteringRækkeSatser}>{formatValuta(postering.satser?.trailerHonorar)}</span>
                    </div>
                )}
                {postering.udlæg && postering.udlæg.length > 0 && (
                    <div className={styles.posteringRække}>
                        <span className={styles.posteringRækkeBeskrivelse}>{postering.udlæg.length} udlæg</span>
                        <span className={styles.posteringRækkeSatser}>-</span>
                        <span className={styles.posteringRækkeSatser}>{formatValuta(postering.udlæg.reduce((sum, item) => sum + Number(item.beløb), 0))}</span>
                    </div>
                )}
                {postering.rabatProcent > 0 && (
                    <div className={styles.posteringRække}>
                        <span className={styles.posteringRækkeBeskrivelse}>{postering.rabatProcent}% rabat</span>
                        <span className={styles.posteringRækkeSatser}>-</span>
                        <span className={styles.posteringRækkeSatser}>- {formatValuta((postering.totalHonorar / (100 - postering.rabatProcent) * 100) * (postering.rabatProcent/100))}</span>
                    </div>
                )}
            </>
        );
    };

    // Render brugerens nuværende satser
    const renderBrugerSatser = () => {
        // Hvis vi har dynamiske typer, vis dem
        if (timetyper.length > 0 || fasteTillaeg.length > 0 || procentTillaeg.length > 0) {
            return (
                <>
                    {/* Timetyper */}
                    {timetyper.filter(t => t.aktiv).map(timetype => {
                        const brugerSats = brugersAktuelleSatser?.timetyper?.[timetype._id] ?? 
                                          brugersAktuelleSatser?.[`${timetype.navn}Honorar`] ??
                                          timetype.kostpris;
                        return (
                            <div key={timetype._id} className={styles.inputLine}>
                                <p className={styles.label}>{timetype.navn}<br /><span className={styles.subLabel}>Kr./timen</span></p>
                                <p className={styles.label}>Kr. {brugerSats},-</p>
                            </div>
                        );
                    })}
                    
                    {/* Faste tillæg */}
                    {fasteTillaeg.filter(t => t.aktiv).map(tillaeg => {
                        const brugerSats = brugersAktuelleSatser?.fasteTillaeg?.[tillaeg._id] ?? 
                                          brugersAktuelleSatser?.[`${tillaeg.navn}Honorar`] ??
                                          tillaeg.kostpris;
                        return (
                            <div key={tillaeg._id} className={styles.inputLine}>
                                <p className={styles.label}>{tillaeg.navn}<br /><span className={styles.subLabel}>Kr./gang</span></p>
                                <p className={styles.label}>Kr. {brugerSats},-</p>
                            </div>
                        );
                    })}
                    
                    {/* Procent tillæg */}
                    {procentTillaeg.filter(t => t.aktiv).map(tillaeg => {
                        const brugerSats = brugersAktuelleSatser?.procentTillaeg?.[tillaeg._id] ?? 
                                          brugersAktuelleSatser?.[`${tillaeg.navn}Honorar`] ??
                                          tillaeg.kostSats;
                        return (
                            <div key={tillaeg._id} className={styles.inputLine}>
                                <p className={styles.label}>{tillaeg.navn}<br /><span className={styles.subLabel}>% tillæg</span></p>
                                <p className={styles.label}>{brugerSats}%</p>
                            </div>
                        );
                    })}
                </>
            );
        }

        // Fallback til legacy visning
        return (
            <>
                <div className={styles.inputLine}>
                    <p className={styles.label}>Handymantimer<br /><span className={styles.subLabel}>Kr./timen</span></p>
                    <p className={styles.label}>Kr. {brugersAktuelleSatser?.handymanTimerHonorar || satser.handymanTimerHonorar},-</p>
                </div>
                <div className={styles.inputLine}>
                    <p className={styles.label}>Tømrertimer <br /><span className={styles.subLabel}>Kr./timen</span></p>
                    <p className={styles.label}>Kr. {brugersAktuelleSatser?.tømrerTimerHonorar || satser.tømrerTimerHonorar},-</p>
                </div>
                <div className={styles.inputLine}>
                    <p className={styles.label}>Rådgivning/opmåling <br /><span className={styles.subLabel}>Kr./timen</span></p>
                    <p className={styles.label}>Kr. {brugersAktuelleSatser?.rådgivningOpmålingVejledningHonorar || satser.rådgivningOpmålingVejledningHonorar},-</p>
                </div>
                <div className={styles.inputLine}>
                    <p className={styles.label}>Opstartsgebyr <br /><span className={styles.subLabel}>Kr./gang</span></p>
                    <p className={styles.label}>Kr. {brugersAktuelleSatser?.opstartsgebyrHonorar || satser.opstartsgebyrHonorar},-</p>
                </div>
                <div className={styles.inputLine}>
                    <p className={styles.label}>Aftentillæg <br /><span className={styles.subLabel}>% pr. time</span></p>
                    <p className={styles.label}>{brugersAktuelleSatser?.aftenTillægHonorar || satser.aftenTillægHonorar}%</p>
                </div>
                <div className={styles.inputLine}>
                    <p className={styles.label}>Nattillæg <br /><span className={styles.subLabel}>% pr. time</span></p>
                    <p className={styles.label}>{brugersAktuelleSatser?.natTillægHonorar || satser.natTillægHonorar}%</p>
                </div>
                <div className={styles.inputLine}>
                    <p className={styles.label}>Trailer <br /><span className={styles.subLabel}>Kr./gang</span></p>
                    <p className={styles.label}>Kr. {brugersAktuelleSatser?.trailerHonorar || satser.trailerHonorar},-</p>
                </div>
            </>
        );
    };

    // Hent kvitteringsbilleder fra både udlæg og materialer
    const getAlleKvitteringer = () => {
        const kvitteringer = [];
        
        // Udlæg kvitteringer
        if (postering.udlæg && postering.udlæg.length > 0) {
            postering.udlæg.forEach((udlæg, index) => {
                if (udlæg.kvittering) {
                    kvitteringer.push({
                        key: `udlæg-${index}`,
                        src: udlæg.kvittering,
                        alt: udlæg.beskrivelse
                    });
                }
            });
        }
        
        // Materiale kvitteringer (kun for nye posteringer)
        if (postering.materialer && postering.materialer.length > 0) {
            postering.materialer.forEach((materiale, index) => {
                if (materiale.kvittering) {
                    kvitteringer.push({
                        key: `materiale-${index}`,
                        src: materiale.kvittering,
                        alt: materiale.beskrivelse
                    });
                }
                if (materiale.billede) {
                    kvitteringer.push({
                        key: `materiale-billede-${index}`,
                        src: materiale.billede,
                        alt: materiale.beskrivelse
                    });
                }
            });
        }
        
        return kvitteringer;
    };

    const alleKvitteringer = getAlleKvitteringer();

    return (
        <Modal trigger={props.trigger} setTrigger={props.setTrigger} onClose={() => setKvitteringBillede(null)} closeIsBackButton={kvitteringBillede} setBackFunction={setKvitteringBillede}>
            {!kvitteringBillede ? <>
            <h2 className={styles.modalHeading}>Satser for postering</h2>
            <p className={styles.løngruppeP}>{getBrugerName(postering.brugerID).split(' ')[0]} lønnes efter <span style={{fontFamily: 'OmnesBold', background: '#f0f0f0', padding: '2px 8px', borderRadius: '10px', marginRight: '2px'}}><b>løntrin {beregnLøngruppe(postering)}</b></span>på denne postering.</p>
            <div className={`${PosteringCSS.posteringCard} ${PosteringCSS.posteringCardSatsDisplay}`} style={{padding: '10px 20px'}}>
                <div>
                    <p className={PosteringCSS.posteringDato}>{postering.dato && postering.dato.slice(0,10)}</p>
                    <p className={PosteringCSS.posteringBruger}>{getBrugerName(postering.brugerID)}</p>
                    <i className={PosteringCSS.posteringBeskrivelse}>{postering.beskrivelse ? postering.beskrivelse : "Ingen beskrivelse."}</i>
                    <div className={PosteringCSS.kvitteringBillederListe}>
                        {alleKvitteringer.map((kvittering) => (
                            <img 
                                key={kvittering.key}
                                className={PosteringCSS.kvitteringBillede} 
                                src={kvittering.src} 
                                alt={kvittering.alt} 
                                onClick={() => setKvitteringBillede(kvittering.src)}
                            />
                        ))}
                    </div>
                </div>
                <div className={styles.posteringListe}>
                    <div className={styles.posteringRække}>
                        <span className={styles.posteringRækkeBeskrivelse}><b style={{fontFamily: "OmnesBold"}}>Beskrivelse</b></span>
                        <span className={styles.posteringRækkeSatser}><b style={{fontFamily: "OmnesBold"}}>Sats</b></span>
                        <span className={styles.posteringRækkeSatser}><b style={{fontFamily: "OmnesBold"}}>Total</b></span>
                    </div>
                    
                    {/* Render rækker baseret på postering struktur */}
                    {erNyPosteringStruktur(postering) 
                        ? renderNyePosteringRækker() 
                        : renderGamlePosteringRækker()
                    }
                    
                    <div className={styles.totalRække}>
                        <b className={styles.totalRækkeBeskrivelse}>Total: </b>
                        <b className={styles.totalRækkeResultat}>{formatValuta(getTotalHonorar(postering))}</b>
                    </div>
                </div>
            </div>
            <div className={styles.obsInfo}>
                <p>OBS! Satserne angivet i posteringen er hentet fra medarbejderens lønsatser på tidspunktet for posteringens oprettelse. Medarbejderens nuværende lønsatser kan være forskellige fra satserne angivet i posteringen.</p>
            </div>
            <div className={styles.alleMedarbejdersSatser}>
                <h3 className={styles.modalHeading3}>{getBrugerName(postering.brugerID).split(' ')[0]}s nuværende lønsatser (ekskl. moms)</h3>
                <p className={styles.løngruppeP}>{getBrugerName(postering.brugerID)} er pt. på <span style={{fontFamily: 'OmnesBold', background: '#f0f0f0', padding: '2px 8px', borderRadius: '10px', marginRight: '2px'}}><b>løntrin {beregnAktuelLøngruppe(brugersAktuelleSatser)}.</b></span></p>
                <div className={styles.inputLinesContainer}>
                    {renderBrugerSatser()}
                </div>
            </div>
            </> : <PageAnimation>
                    <div className={PosteringCSS.billedModalHeader}>
                        <img className={PosteringCSS.backArrow} src={BackArrow} onClick={() => setKvitteringBillede("")}/><h2>Billedvisning</h2>    
                    </div>
                    <img src={kvitteringBillede} className={PosteringCSS.kvitteringBilledeStort} />
                </PageAnimation>}
        </Modal>
    )
}

export default PosteringSatserModal
