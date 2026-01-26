import React, { useState, useEffect, useMemo } from 'react'
import dayjs from 'dayjs'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import 'dayjs/locale/da'
import Styles from './ProfilØkonomi.module.css'
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Receipt, ExternalLink, TrendingUp, Wallet, FileText, Image } from 'lucide-react'
import * as beregn from '../utils/beregninger.js'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Rectangle } from 'recharts'

dayjs.extend(isSameOrAfter)
dayjs.extend(isSameOrBefore)
dayjs.locale('da')

// Custom shape for udlæg-bar der har afrundede hjørner i toppen hvis der ikke er optjent værdi
const UdlægBarShape = (props) => {
    const { x, y, width, height, payload } = props
    const hasOptjent = payload && payload.optjent > 0
    const radius = hasOptjent ? [0, 0, 0, 0] : [6, 6, 0, 0] // Afrundede hjørner i toppen hvis ingen optjent
    
    return (
        <Rectangle
            {...props}
            x={x}
            y={y}
            width={width}
            height={height}
            radius={radius}
        />
    )
}

const ProfilØkonomi = ({ posteringer, user, bruger }) => {
    const [månedOffset, setMånedOffset] = useState(0)
    const [kvitteringPopup, setKvitteringPopup] = useState(null)
    const [overblikÅben, setOverblikÅben] = useState(true)
    const [lønspecifikationÅben, setLønspecifikationÅben] = useState(false)
    const [udlægÅben, setUdlægÅben] = useState(false)
    const [diagramÅben, setDiagramÅben] = useState(true)

    // Beregn lønperiode (d. 20 - d. 19)
    const getLønperiode = (offset = 0) => {
        const startOfDenneMåned = (dayjs().date() >= 20 
            ? dayjs().date(20) 
            : dayjs().subtract(1, 'month').date(20)
        ).startOf('day')

        const endOfDenneMåned = startOfDenneMåned.add(1, 'month').date(19).endOf('day')

        return {
            start: startOfDenneMåned.subtract(offset, 'month').startOf('day'),
            end: endOfDenneMåned.subtract(offset, 'month').endOf('day')
        }
    }

    const customMåned = getLønperiode(månedOffset)

    // Filtrer posteringer for den valgte måned
    const denneMånedsPosteringer = useMemo(() => {
        if (!posteringer) return []
        return posteringer.filter(postering =>
            dayjs(postering.createdAt).isSameOrAfter(customMåned.start, 'day') &&
            dayjs(postering.createdAt).isSameOrBefore(customMåned.end, 'day')
        )
    }, [posteringer, customMåned.start, customMåned.end])

    // Beregn data for de sidste 6 måneder til diagram
    const sidsteSeksMåneder = useMemo(() => {
        if (!posteringer) return []
        
        const måneder = []
        for (let i = 5; i >= 0; i--) {
            const periode = getLønperiode(i)
            const månedsPosteringer = posteringer.filter(p =>
                dayjs(p.createdAt).isSameOrAfter(periode.start, 'day') &&
                dayjs(p.createdAt).isSameOrBefore(periode.end, 'day')
            )
            
            const totalHonorar = beregn.totalHonorar(månedsPosteringer, 2, false)?.beløb || 0
            const udlæg = beregn.udlægHonorar(månedsPosteringer, 2, false)?.beløb || 0
            const optjent = totalHonorar - udlæg

            måneder.push({
                label: periode.end.format('MMM'),
                fullLabel: periode.end.format('MMMM YYYY'),
                optjent,
                udlæg,
                total: totalHonorar,
                periode
            })
        }
        return måneder
    }, [posteringer])

    // Hent alle udlæg fra månedens posteringer med kvitteringer
    const månedensUdlæg = useMemo(() => {
        if (!denneMånedsPosteringer) return []
        
        const alleUdlæg = []
        denneMånedsPosteringer.forEach(postering => {
            // Tjek udlæg-array
            if (postering.udlæg && postering.udlæg.length > 0) {
                postering.udlæg.forEach(udlæg => {
                    alleUdlæg.push({
                        ...udlæg,
                        posteringId: postering._id,
                        posteringDato: postering.dato || postering.createdAt,
                        posteringBeskrivelse: postering.beskrivelse
                    })
                })
            }
            // Tjek materialer-array for udlæg
            if (postering.materialer && postering.materialer.length > 0) {
                postering.materialer.forEach(materiale => {
                    if (materiale.totalMedarbejderUdlaeg > 0) {
                        alleUdlæg.push({
                            beskrivelse: materiale.navn || 'Materiale',
                            beløb: materiale.totalMedarbejderUdlaeg,
                            kvittering: materiale.kvittering,
                            posteringId: postering._id,
                            posteringDato: postering.dato || postering.createdAt,
                            posteringBeskrivelse: postering.beskrivelse,
                            erMateriale: true
                        })
                    }
                })
            }
        })
        return alleUdlæg
    }, [denneMånedsPosteringer])

    // Beregn akkumulerede data for lønspecifikation
    const lønspecifikation = useMemo(() => {
        if (!denneMånedsPosteringer || denneMånedsPosteringer.length === 0) return null

        // Akkumuler timeregistreringer efter type
        const timeregistreringer = {}
        const fasteTillæg = {}
        const procentTillæg = {}

        denneMånedsPosteringer.forEach(postering => {
            // Timeregistreringer
            if (postering.timeregistrering) {
                postering.timeregistrering.forEach(tr => {
                    const key = tr.navn || 'Timer'
                    if (!timeregistreringer[key]) {
                        timeregistreringer[key] = { antal: 0, honorar: 0, sats: tr.honorar?.sats || 0 }
                    }
                    timeregistreringer[key].antal += tr.antal || 0
                    timeregistreringer[key].honorar += tr.honorar?.total || 0
                })
            }

            // Faste tillæg
            if (postering.fasteTillæg) {
                postering.fasteTillæg.forEach(ft => {
                    const key = ft.navn || 'Tillæg'
                    if (!fasteTillæg[key]) {
                        fasteTillæg[key] = { antal: 0, honorar: 0, sats: ft.honorar?.sats || 0 }
                    }
                    fasteTillæg[key].antal += ft.antal || 0
                    fasteTillæg[key].honorar += ft.honorar?.total || 0
                })
            }

            // Procent tillæg
            if (postering.procentTillæg) {
                postering.procentTillæg.forEach(pt => {
                    const key = pt.navn || 'Tillæg'
                    if (!procentTillæg[key]) {
                        procentTillæg[key] = { honorar: 0, procent: pt.honorar?.procent || 0 }
                    }
                    procentTillæg[key].honorar += pt.honorar?.total || 0
                })
            }
        })

        // Brug beregninger.js for totaler (sikrer konsistens)
        const totalUdlæg = beregn.udlægHonorar(denneMånedsPosteringer, 2, false)?.beløb || 0
        const totalRabat = beregn.rabatHonorar(denneMånedsPosteringer, 2, false)?.beløb || 0
        const totalFastHonorar = beregn.fastHonorar(denneMånedsPosteringer, 2, false)?.beløb || 0

        return {
            timeregistreringer: Object.entries(timeregistreringer).map(([navn, data]) => ({ navn, ...data })),
            fasteTillæg: Object.entries(fasteTillæg).map(([navn, data]) => ({ navn, ...data })),
            procentTillæg: Object.entries(procentTillæg).map(([navn, data]) => ({ navn, ...data })),
            totalUdlæg,
            totalRabat,
            totalFastHonorar
        }
    }, [denneMånedsPosteringer])

    // Beregn totaler
    const totalHonorar = beregn.totalHonorar(denneMånedsPosteringer, 2, false)?.beløb || 0
    const totalUdlæg = beregn.udlægHonorar(denneMånedsPosteringer, 2, false)?.beløb || 0
    const optjent = totalHonorar - totalUdlæg

    const formatBeløb = (beløb, decimaler = 0) => {
        return beløb.toLocaleString('da-DK', {
            style: 'currency',
            currency: 'DKK',
            minimumFractionDigits: decimaler,
            maximumFractionDigits: decimaler
        })
    }

    return (
        <div className={Styles.økonomiContainer}>
            {/* Månedsnavigation */}
            <div className={Styles.månedNavigationContainer}>
                <button 
                    className={Styles.månedNavButton}
                    onClick={() => setMånedOffset(månedOffset + 1)}
                >
                    <ChevronLeft size={20} />
                </button>
                <div className={Styles.månedInfo}>
                    <h3>{customMåned.end.format('MMMM YYYY')}</h3>
                    <span className={Styles.periodeText}>
                        {dayjs(customMåned.start).format('D. MMM')} – {dayjs(customMåned.end).format('D. MMM')}
                    </span>
                </div>
                <button 
                    className={Styles.månedNavButton}
                    onClick={() => setMånedOffset(Math.max(0, månedOffset - 1))}
                    disabled={månedOffset === 0}
                >
                    <ChevronRight size={20} />
                </button>
            </div>

            {/* 1. Simpelt overblik */}
            <div className={`${Styles.kollapsibel} ${overblikÅben ? Styles.åben : ''}`}>
                <h2 
                    className={Styles.sektionHeading}
                    onClick={() => setOverblikÅben(!overblikÅben)}
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Wallet size={20} />
                        Overblik
                    </span>
                    <ChevronDown size={18} className={Styles.chevron} />
                </h2>
                <div className={Styles.kollapsibeltIndhold}>
                    <div className={Styles.overblikGrid}>
                        <div className={Styles.overblikKort}>
                            <span className={Styles.overblikLabel}>Optjent</span>
                            <span className={`${Styles.overblikBeløb} ${Styles.optjent}`}>
                                {formatBeløb(optjent)}
                            </span>
                            <span className={Styles.overblikSubtext}>Før skat</span>
                        </div>
                        <div className={Styles.overblikKort}>
                            <span className={Styles.overblikLabel}>Udlæg</span>
                            <span className={`${Styles.overblikBeløb} ${Styles.udlæg}`}>
                                {formatBeløb(totalUdlæg)}
                            </span>
                            <span className={Styles.overblikSubtext}>Refunderes</span>
                        </div>
                        <div className={`${Styles.overblikKort} ${Styles.totalKort}`}>
                            <span className={Styles.overblikLabel}>Udbetaling</span>
                            <span className={Styles.overblikBeløb}>
                                {formatBeløb(totalHonorar)}
                            </span>
                            <span className={Styles.overblikSubtext}>Før skat</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Lønspecifikation */}
            {lønspecifikation && (
                <div className={`${Styles.kollapsibel} ${lønspecifikationÅben ? Styles.åben : ''}`}>
                    <h2 
                        className={Styles.sektionHeading}
                        onClick={() => setLønspecifikationÅben(!lønspecifikationÅben)}
                        style={{ cursor: 'pointer', userSelect: 'none' }}
                    >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FileText size={20} />
                            Lønspecifikation
                        </span>
                        <ChevronDown size={18} className={Styles.chevron} />
                    </h2>
                    <div className={Styles.kollapsibeltIndhold}>
                        <div className={Styles.specifikationContainer}>
                            <div className={Styles.specifikationHeader}>
                                <span>Beskrivelse</span>
                                <span>Antal</span>
                                <span>Sats</span>
                                <span>Honorar</span>
                            </div>

                            {/* Timeregistreringer */}
                            {lønspecifikation.timeregistreringer.map((tr, idx) => (
                                <div key={`tr-${idx}`} className={Styles.specifikationRække}>
                                    <span>{tr.navn}</span>
                                    <span>{tr.antal.toLocaleString('da-DK', { maximumFractionDigits: 2 })}</span>
                                    <span>{formatBeløb(tr.sats)}</span>
                                    <span>{formatBeløb(tr.honorar)}</span>
                                </div>
                            ))}

                            {/* Faste tillæg */}
                            {lønspecifikation.fasteTillæg.map((ft, idx) => (
                                <div key={`ft-${idx}`} className={Styles.specifikationRække}>
                                    <span>{ft.navn}</span>
                                    <span>{ft.antal}</span>
                                    <span>{formatBeløb(ft.sats)}</span>
                                    <span>{formatBeløb(ft.honorar)}</span>
                                </div>
                            ))}

                            {/* Procent tillæg */}
                            {lønspecifikation.procentTillæg.map((pt, idx) => (
                                <div key={`pt-${idx}`} className={Styles.specifikationRække}>
                                    <span>{pt.navn}</span>
                                    <span>–</span>
                                    <span>{pt.procent}%</span>
                                    <span>{formatBeløb(pt.honorar)}</span>
                                </div>
                            ))}

                            {/* Udlæg */}
                            {lønspecifikation.totalUdlæg > 0 && (
                                <div className={`${Styles.specifikationRække} ${Styles.udlægRække}`}>
                                    <span>Udlæg (refunderes)</span>
                                    <span>–</span>
                                    <span>–</span>
                                    <span>{formatBeløb(lønspecifikation.totalUdlæg)}</span>
                                </div>
                            )}

                            {/* Rabat */}
                            {lønspecifikation.totalRabat > 0 && (
                                <div className={`${Styles.specifikationRække} ${Styles.rabatRække}`}>
                                    <span>Rabat</span>
                                    <span>–</span>
                                    <span>–</span>
                                    <span>- {formatBeløb(lønspecifikation.totalRabat)}</span>
                                </div>
                            )}

                            {/* Faste honorarer */}
                            {lønspecifikation.totalFastHonorar > 0 && (
                                <div className={Styles.specifikationRække}>
                                    <span>Faste honorarer</span>
                                    <span>–</span>
                                    <span>–</span>
                                    <span>{formatBeløb(lønspecifikation.totalFastHonorar)}</span>
                                </div>
                            )}

                            {/* Total */}
                            <div className={Styles.specifikationTotal}>
                                <span>Total udbetaling</span>
                                <span></span>
                                <span></span>
                                <span>{formatBeløb(totalHonorar)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 3. Udlæg med kvitteringer */}
            {månedensUdlæg.length > 0 && (
                <div className={`${Styles.kollapsibel} ${udlægÅben ? Styles.åben : ''}`}>
                    <h2 
                        className={Styles.sektionHeading}
                        onClick={() => setUdlægÅben(!udlægÅben)}
                        style={{ cursor: 'pointer', userSelect: 'none' }}
                    >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Receipt size={20} />
                            Udlæg og kvitteringer
                        </span>
                        <ChevronDown size={18} className={Styles.chevron} />
                    </h2>
                    <div className={Styles.kollapsibeltIndhold}>
                        <div className={Styles.udlægIndholdWrapper}>
                            <div className={Styles.udlægListe}>
                                {månedensUdlæg.map((udlæg, idx) => (
                                    <div key={idx} className={Styles.udlægKort}>
                                        <div className={Styles.udlægInfo}>
                                            <span className={Styles.udlægBeskrivelse}>
                                                {udlæg.beskrivelse || 'Udlæg'}
                                                {udlæg.erMateriale && <span className={Styles.materialeBadge}>Materiale</span>}
                                            </span>
                                            <span className={Styles.udlægDato}>
                                                {dayjs(udlæg.posteringDato).format('D. MMM YYYY')}
                                            </span>
                                        </div>
                                        <div className={Styles.udlægActions}>
                                            <span className={Styles.udlægBeløb}>
                                                {formatBeløb(udlæg.beløb || udlæg.totalEksMoms || 0)}
                                            </span>
                                            {udlæg.kvittering && (
                                                <button 
                                                    className={Styles.kvitteringKnap}
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        setKvitteringPopup(udlæg.kvittering)
                                                    }}
                                                >
                                                    <Image size={16} />
                                                    <span>Se kvittering</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className={Styles.udlægTotal}>
                                <span>Samlet udlæg denne måned:</span>
                                <span>{formatBeløb(totalUdlæg)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 4. Søjlediagram */}
            <div className={`${Styles.kollapsibel} ${diagramÅben ? Styles.åben : ''}`}>
                <h2 
                    className={Styles.sektionHeading}
                    onClick={() => setDiagramÅben(!diagramÅben)}
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <TrendingUp size={20} />
                        Historik
                    </span>
                    <ChevronDown size={18} className={Styles.chevron} />
                </h2>
                <div className={Styles.kollapsibeltIndhold}>
                    <div className={Styles.diagramContainer}>
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart
                            data={sidsteSeksMåneder.map(m => ({
                                måned: m.label,
                                optjent: m.optjent,
                                udlæg: m.udlæg
                            }))}
                            margin={{ top: 10, right: 10, left: -15, bottom: 5 }}
                            barCategoryGap="40%"
                        >
                            <defs>
                                <linearGradient id="optjentGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#6dd627" stopOpacity={1}/>
                                    <stop offset="100%" stopColor="#4a9e18" stopOpacity={1}/>
                                </linearGradient>
                                <linearGradient id="udlægGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#ffb74d" stopOpacity={1}/>
                                    <stop offset="100%" stopColor="#e59818" stopOpacity={1}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid 
                                strokeDasharray="0" 
                                stroke="#f0f0f0" 
                                vertical={false}
                            />
                            <XAxis 
                                dataKey="måned" 
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#888', fontSize: 13, fontFamily: 'Omnes' }}
                                tickFormatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)}
                                dy={8}
                            />
                            <YAxis 
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#aaa', fontSize: 11 }}
                                tickFormatter={(value) => {
                                    if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
                                    return value.toString();
                                }}
                                width={45}
                            />
                            <Tooltip
                                cursor={{ fill: 'rgba(89, 191, 26, 0.08)', radius: 6 }}
                                contentStyle={{
                                    backgroundColor: 'rgba(34, 34, 34, 0.95)',
                                    backdropFilter: 'blur(10px)',
                                    border: 'none',
                                    borderRadius: '12px',
                                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)',
                                    padding: '14px 18px',
                                    color: 'white'
                                }}
                                itemStyle={{ color: 'white', fontSize: 13, padding: '3px 0' }}
                                labelStyle={{ 
                                    color: 'white', 
                                    fontFamily: 'OmnesBold', 
                                    fontSize: 14, 
                                    marginBottom: 8,
                                    textTransform: 'capitalize'
                                }}
                                formatter={(value, name) => {
                                    const formateret = formatBeløb(value);
                                    const label = name === 'optjent' ? 'Optjent' : 'Udlæg';
                                    return [<span style={{ color: 'white' }}>{formateret}</span>, <span style={{ color: 'white' }}>{label}</span>];
                                }}
                                labelFormatter={(label) => {
                                    const måned = sidsteSeksMåneder.find(m => m.label === label);
                                    return <span style={{ color: 'white' }}>{måned ? måned.fullLabel : label}</span>;
                                }}
                            />
                            <Bar 
                                dataKey="udlæg" 
                                stackId="a" 
                                fill="url(#udlægGradient)"
                                shape={<UdlægBarShape />}
                                animationDuration={800}
                                animationEasing="ease-out"
                            />
                            <Bar 
                                dataKey="optjent" 
                                stackId="a" 
                                fill="url(#optjentGradient)"
                                radius={[6, 6, 0, 0]}
                                animationDuration={800}
                                animationEasing="ease-out"
                            />
                        </BarChart>
                    </ResponsiveContainer>
                    <div className={Styles.diagramLegend}>
                        <div className={Styles.legendItem}>
                            <span className={`${Styles.legendDot} ${Styles.legendOptjent}`}></span>
                            <span>Optjent</span>
                        </div>
                        <div className={Styles.legendItem}>
                            <span className={`${Styles.legendDot} ${Styles.legendUdlæg}`}></span>
                            <span>Udlæg</span>
                        </div>
                    </div>
                    </div>
                </div>
            </div>

            {/* Kvittering popup */}
            {kvitteringPopup && (
                <div className={Styles.kvitteringOverlay} onClick={() => setKvitteringPopup(null)}>
                    <div className={Styles.kvitteringModal} onClick={e => e.stopPropagation()}>
                        <button 
                            className={Styles.lukKvittering}
                            onClick={() => setKvitteringPopup(null)}
                        >
                            ×
                        </button>
                        <img src={kvitteringPopup} alt="Kvittering" className={Styles.kvitteringBillede} />
                        <a 
                            href={kvitteringPopup} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className={Styles.åbnIFaneKnap}
                        >
                            <ExternalLink size={16} />
                            Åbn i ny fane
                        </a>
                    </div>
                </div>
            )}

            {/* Tom tilstand */}
            {denneMånedsPosteringer.length === 0 && (
                <div className={Styles.tomTilstand}>
                    <Wallet size={48} strokeWidth={1} />
                    <p>Ingen posteringer i denne periode</p>
                    <span>Posteringer vil blive vist her, når du har registreret arbejde.</span>
                </div>
            )}
        </div>
    )
}

export default ProfilØkonomi

