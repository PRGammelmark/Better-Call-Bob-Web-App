import React, { useState, useEffect } from 'react'
import Styles from './OpgaverHurtigtAdminOverblik.module.css'
import { BellRing, FolderOpen, CalendarCheck2, Wallet, CheckCircle, Archive, Trash2, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react'
import axios from 'axios'
import { useAuthContext } from '../hooks/useAuthContext'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'

const adminTabs = [
  {
    id: "new",
    label: "Nye",
    icon: BellRing,
    endpoint: "/opgaver/new",
    color: "#3b82f6",
    bgColor: "#dbeafe",
  },
  {
    id: "open",
    label: "Åbne",
    icon: FolderOpen,
    endpoint: "/opgaver/open",
    color: "#f59e0b",
    bgColor: "#fef3c7",
  },
  {
    id: "planned",
    label: "Planlagte",
    icon: CalendarCheck2,
    endpoint: "/opgaver/planned",
    color: "#8b5cf6",
    bgColor: "#ede9fe",
  },
  {
    id: "unpaid",
    label: "Ubetalte",
    icon: Wallet,
    endpoint: "/posteringer/unpaid",
    color: "#ef4444",
    bgColor: "#fee2e2",
  },
//   {
//     id: "done",
//     label: "Afsluttede",
//     icon: CheckCircle,
//     endpoint: "/opgaver/done",
//     color: "#10b981",
//     bgColor: "#d1fae5",
//   },
//   {
//     id: "archived",
//     label: "Arkiverede",
//     icon: Archive,
//     endpoint: "/opgaver/archived",
//     color: "#6b7280",
//     bgColor: "#f3f4f6",
//   },
//   {
//     id: "deleted",
//     label: "Slettede",
//     icon: Trash2,
//     endpoint: "/opgaver/deleted",
//     color: "#9ca3af",
//     bgColor: "#f9fafb",
//   },
]

const OpgaverHurtigtAdminOverblik = () => {
  const { user } = useAuthContext()
  const navigate = useNavigate()
  const [counts, setCounts] = useState({})
  const [warnings, setWarnings] = useState({})
  const [statistics, setStatistics] = useState({}) // { tabId: { incoming: 0, outgoing: 0, warningIncoming: { red: 0, yellow: 0 }, warningOutgoing: { red: 0, yellow: 0 } } }
  const [loading, setLoading] = useState(true)

  const handleCardClick = (tabId) => {
    // Save the selected tab to sessionStorage so OpgaveTabs can restore it
    const stateToSave = {
      openTab: tabId,
      filters: {},
      sortOption: (tabId === "planned" || tabId === "current") ? "nextVisit" : "newest"
    }
    sessionStorage.setItem("opgaveTabsState", JSON.stringify(stateToSave))
    navigate('/alle-opgaver')
  }

  const handleWarningClick = (e, tabId, warningType) => {
    e.stopPropagation() // Prevent card click
    
    let filters = {}
    
    // Set filters based on tab and warning type
    if (tabId === "new" || tabId === "open") {
      // For new/open tabs, use timeWarning filter
      // Note: "warning" shows both yellow and red, but it's the best we can do with current filters
      filters = { timeWarning: "warning" }
    } else if (tabId === "planned") {
      if (warningType === "red") {
        // Red warning: no visits at all
        filters = { besøg: "noVisits" }
      } else if (warningType === "yellow") {
        // Yellow warning: has visits but no future visits
        // This is tricky - we'll use "hasVisits" and let user see all, or we could add a custom filter
        // For now, let's use "hasVisits" which will show tasks with visits (but not filter out future ones)
        // Actually, there's no direct filter for "has visits but no future", so we'll just show all with visits
        filters = { besøg: "hasVisits" }
      }
    } else if (tabId === "unpaid") {
      if (warningType === "red") {
        // Red warning: missing opkrævning
        filters = { paymentStatus: "missingOpkrævning" }
      } else if (warningType === "yellow") {
        // Yellow warning: overdue payment
        filters = { paymentStatus: "overdue" }
      }
    }
    
    const stateToSave = {
      openTab: tabId,
      filters: filters,
      sortOption: (tabId === "planned" || tabId === "current") ? "nextVisit" : "newest"
    }
    sessionStorage.setItem("opgaveTabsState", JSON.stringify(stateToSave))
    navigate('/alle-opgaver')
  }

  useEffect(() => {
    if (!user?.token) return

    const fetchCountsAndWarnings = async () => {
      setLoading(true)
      
      // Fetch besøg data for planned tab warnings
      let alleBesøg = []
      try {
        const besøgRes = await axios.get(`${import.meta.env.VITE_API_URL}/besoeg`, {
          headers: { Authorization: `Bearer ${user.token}` }
        })
        alleBesøg = besøgRes.data || []
      } catch (e) {
        console.error("Error fetching besøg:", e)
      }

      const countPromises = adminTabs.map(async (tab) => {
        try {
          const url = `${import.meta.env.VITE_API_URL}${tab.endpoint}`
          const res = await axios.get(url, {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          })

          let count = 0
          let yellowWarnings = 0
          let redWarnings = 0
          let incoming = 0
          let outgoing = 0
          let warningIncoming = { red: 0, yellow: 0 }
          let warningOutgoing = { red: 0, yellow: 0 }
          
          const now = dayjs()
          const dayStart = now.startOf('day') // Start of current day (00:00:00)

          if (tab.id === "unpaid") {
            // For unpaid, we need to group posteringer by opgaveID
            const opgaverMap = new Map()
            res.data.forEach((postering) => {
              if (!postering.opgave) return
              
              const opgaveID = String(
                postering.opgaveID || 
                postering.opgave?._id || 
                postering.opgave?.id || 
                ''
              )
              
              if (!opgaveID || opgaveID === 'undefined' || opgaveID === 'null') return
              
              if (!opgaverMap.has(opgaveID)) {
                opgaverMap.set(opgaveID, [postering])
              } else {
                opgaverMap.get(opgaveID).push(postering)
              }
              
              // Check if this postering became unpaid today
              if (postering.createdAt) {
                const posteringCreatedAt = dayjs(postering.createdAt)
                const posteringUpdatedAt = postering.updatedAt ? dayjs(postering.updatedAt) : null
                if (posteringCreatedAt.isAfter(dayStart) || posteringCreatedAt.isSame(dayStart) || (posteringUpdatedAt && (posteringUpdatedAt.isAfter(dayStart) || posteringUpdatedAt.isSame(dayStart)))) {
                  incoming++
                }
              }
            })
            
            count = opgaverMap.size
            
            // Calculate warnings for unpaid tab
            opgaverMap.forEach((posteringer) => {
              const firstPostering = posteringer[0]
              if (!firstPostering?.createdAt) return
              
              const posteringCreatedAt = dayjs(firstPostering.createdAt)
              const posteringUpdatedAt = firstPostering.updatedAt ? dayjs(firstPostering.updatedAt) : null
              const isRecent = posteringCreatedAt.isAfter(dayStart) || posteringCreatedAt.isSame(dayStart) || (posteringUpdatedAt && (posteringUpdatedAt.isAfter(dayStart) || posteringUpdatedAt.isSame(dayStart)))
              const totalPosteringerAmount = posteringer.reduce((total, postering) => {
                const posteringTotalPris = (postering.totalPris || 0) * 1.25
                return total + posteringTotalPris
              }, 0)
              
              const totalOpkrævetAmount = posteringer.reduce((total, postering) => {
                const opkrævningerSum = postering?.opkrævninger?.reduce((sum, opkrævning) => sum + (opkrævning.opkrævningsbeløb || 0), 0) || 0
                return total + opkrævningerSum
              }, 0)
              
              const totalRemainingAmount = posteringer.reduce((total, postering) => {
                const posteringTotalPris = (postering.totalPris || 0) * 1.25
                const betalingerSum = postering?.betalinger?.reduce((sum, betaling) => sum + (betaling.betalingsbeløb || 0), 0) || 0
                const remainingAmount = posteringTotalPris - betalingerSum
                return total + remainingAmount
              }, 0)
              
              // Red warning: opkrævning is missing
              const hardWarning = totalOpkrævetAmount < totalPosteringerAmount
              
              // Yellow warning: payment due date exceeded
              let softWarning = false
              if (totalOpkrævetAmount >= totalPosteringerAmount && totalRemainingAmount > 0) {
                const allPosteringerHaveOpkrævninger = posteringer.every(postering => 
                  postering?.opkrævninger?.length > 0
                )
                
                const allOpkrævningerAreFaktura = posteringer.every(postering => 
                  postering?.opkrævninger?.every(opkrævning => opkrævning.metode === 'faktura')
                )
                
                if (allPosteringerHaveOpkrævninger && allOpkrævningerAreFaktura) {
                  const now = dayjs()
                  softWarning = posteringer.some(postering => {
                    return postering?.opkrævninger?.some(opkrævning => {
                      if (opkrævning.metode !== 'faktura') return false
                      const opkrævningsDato = dayjs(opkrævning.dato)
                      const dueDate = opkrævning.betalingsdato 
                        ? dayjs(opkrævning.betalingsdato)
                        : opkrævningsDato.add(8, 'day')
                      return now.isAfter(dueDate)
                    })
                  })
                }
              }
              
              if (hardWarning) {
                redWarnings++
                if (isRecent) warningIncoming.red++
              } else if (softWarning) {
                yellowWarnings++
                if (isRecent) warningIncoming.yellow++
              }
            })
          } else if (tab.id === "planned") {
            const opgaver = Array.isArray(res.data) ? res.data : []
            count = opgaver.length
            
            // Calculate warnings for planned tab
            opgaver.forEach((opgave) => {
              if (!opgave.createdAt) return
              
              const opgaveCreatedAt = dayjs(opgave.createdAt)
              const opgaveUpdatedAt = opgave.updatedAt ? dayjs(opgave.updatedAt) : null
              const isRecent = opgaveCreatedAt.isAfter(dayStart) || opgaveCreatedAt.isSame(dayStart) || (opgaveUpdatedAt && (opgaveUpdatedAt.isAfter(dayStart) || opgaveUpdatedAt.isSame(dayStart)))
              
              if (isRecent) incoming++
              
              const opgaveID = opgave._id || opgave.id
              const opgaveBesøg = alleBesøg.filter(besøg => {
                const besøgOpgaveID = typeof besøg.opgaveID === 'object' ? (besøg.opgaveID?._id || besøg.opgaveID?.id) : besøg.opgaveID
                return besøgOpgaveID === opgaveID
              })
              
              const hasAnyVisits = opgaveBesøg.length > 0
              const hasFutureVisits = opgaveBesøg.some(besøg => dayjs(besøg.datoTidFra).isAfter(now))
              
              // Red warning: no visits at all
              const hardWarning = !hasAnyVisits
              // Yellow warning: has past visits but no future
              const softWarning = hasAnyVisits && !hasFutureVisits
              
              if (hardWarning) {
                redWarnings++
                if (isRecent) warningIncoming.red++
              } else if (softWarning) {
                yellowWarnings++
                if (isRecent) warningIncoming.yellow++
              }
            })
          } else if (tab.id === "done" || tab.id === "archived" || tab.id === "deleted") {
            // For done, archived, deleted tabs, just count the opgaver
            const opgaver = Array.isArray(res.data) ? res.data : []
            count = opgaver.length
          } else {
            // For new and open tabs
            const opgaver = Array.isArray(res.data) ? res.data : []
            count = opgaver.length
            
            // Calculate warnings based on hours since received
            opgaver.forEach((opgave) => {
              if (!opgave.createdAt) return
              
              const opgaveCreatedAt = dayjs(opgave.createdAt)
              const opgaveUpdatedAt = opgave.updatedAt ? dayjs(opgave.updatedAt) : null
              const isRecent = opgaveCreatedAt.isAfter(dayStart) || opgaveCreatedAt.isSame(dayStart) || (opgaveUpdatedAt && (opgaveUpdatedAt.isAfter(dayStart) || opgaveUpdatedAt.isSame(dayStart)))
              
              if (isRecent) incoming++
              
              const hoursSinceReceived = dayjs().diff(opgaveCreatedAt, 'hour')
              const softWarning = hoursSinceReceived > 12
              const hardWarning = hoursSinceReceived > 24
              
              if (hardWarning) {
                redWarnings++
                if (isRecent) warningIncoming.red++
              } else if (softWarning) {
                yellowWarnings++
                if (isRecent) warningIncoming.yellow++
              }
            })
          }

          return { 
            tabId: tab.id, 
            count,
            yellowWarnings,
            redWarnings,
            incoming,
            outgoing,
            warningIncoming,
            warningOutgoing
          }
        } catch (err) {
          console.error(`Error fetching count for ${tab.id}:`, err)
          return { 
            tabId: tab.id, 
            count: 0,
            yellowWarnings: 0,
            redWarnings: 0,
            incoming: 0,
            outgoing: 0,
            warningIncoming: { red: 0, yellow: 0 },
            warningOutgoing: { red: 0, yellow: 0 }
          }
        }
      })

      const results = await Promise.all(countPromises)
      const countsObj = {}
      const warningsObj = {}
      const statisticsObj = {}
      
      results.forEach(({ tabId, count, yellowWarnings, redWarnings, incoming, outgoing, warningIncoming, warningOutgoing }) => {
        countsObj[tabId] = count
        warningsObj[tabId] = { yellow: yellowWarnings, red: redWarnings }
        statisticsObj[tabId] = {
          incoming,
          outgoing,
          warningIncoming,
          warningOutgoing
        }
      })
      
      setCounts(countsObj)
      setWarnings(warningsObj)
      setStatistics(statisticsObj)
      setLoading(false)
    }

    fetchCountsAndWarnings()
  }, [user?.token])

  const getWarningLabels = (tabId) => {
    const labels = {
      new: {
        red: 'Over 24 timer',
        yellow: 'Over 12 timer'
      },
      open: {
        red: 'Over 24 timer',
        yellow: 'Over 12 timer'
      },
      planned: {
        red: 'Opg. uden besøg',
        yellow: 'Mangler opfølgning'
      },
      unpaid: {
        red: 'Mangler opkrævning',
        yellow: 'Forfalden'
      },
      done: {
        red: '',
        yellow: ''
      },
      archived: {
        red: '',
        yellow: ''
      },
      deleted: {
        red: '',
        yellow: ''
      }
    }
    return labels[tabId] || { red: '', yellow: '' }
  }

  if (loading) {
    return (
      <div className={Styles.opgaverHurtigtOverblikContainer}>
        <div className={Styles.cardsGrid}>
          {adminTabs.map((tab) => (
            <div key={tab.id} className={`${Styles.card} ${Styles.skeletonCard}`}>
              <div className={Styles.cardHeader}>
                <div className={`${Styles.iconWrapper} ${Styles.skeleton}`}></div>
                <div className={`${Styles.skeletonTitle} ${Styles.skeleton}`}></div>
              </div>
              <div className={Styles.cardContent}>
                <div className={Styles.countSection}>
                  <div className={`${Styles.skeletonCount} ${Styles.skeleton}`}></div>
                  <div className={`${Styles.skeletonLabel} ${Styles.skeleton}`}></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={Styles.opgaverHurtigtOverblikContainer}>
      <div className={Styles.cardsGrid}>
        {adminTabs.map((tab) => {
          const Icon = tab.icon
          const count = counts[tab.id] ?? 0
          const tabWarnings = warnings[tab.id] || { yellow: 0, red: 0 }
          const hasWarnings = tabWarnings.yellow > 0 || tabWarnings.red > 0
          const warningLabels = getWarningLabels(tab.id)

          return (
            <div 
              key={tab.id} 
              className={Styles.card}
              style={{ 
                '--card-color': tab.color,
                '--card-bg': tab.bgColor,
              }}
              onClick={() => handleCardClick(tab.id)}
            >
              <div className={Styles.cardHeader}>
                <div className={Styles.iconWrapper}>
                  <Icon size={24} />
                </div>
                <h3 className={Styles.cardTitle}>{tab.label}</h3>
                {statistics[tab.id] && count > 0 && (
                  <div className={Styles.statsBadges}>
                    {statistics[tab.id].incoming !== undefined && statistics[tab.id].incoming > 0 && (
                      <div className={`${Styles.statBadge} ${tab.id === 'unpaid' ? Styles.incomingRed : Styles.incomingGreen}`} title={`${statistics[tab.id].incoming} indgående i dag`}>
                        <TrendingUp size={12} />
                        <span>{statistics[tab.id].incoming}</span>
                      </div>
                    )}
                    {statistics[tab.id].outgoing !== undefined && statistics[tab.id].outgoing > 0 && (
                      <div className={`${Styles.statBadge} ${tab.id === 'unpaid' ? Styles.outgoingGreen : Styles.outgoingGrey}`} title={`${statistics[tab.id].outgoing} udgående i dag`}>
                        <TrendingDown size={12} />
                        <span>{statistics[tab.id].outgoing}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className={Styles.cardContent}>
                <div className={Styles.countSection}>
                  <span className={Styles.countNumber}>{count}</span>
                  <span className={Styles.countLabel}>
                    {count === 1 ? 'opgave' : 'opgaver'}
                  </span>
                </div>

                {hasWarnings && (
                  <div className={Styles.warningsSection}>
                    {tabWarnings.red > 0 && (
                      <div className={`${Styles.warningBadge} ${Styles.redWarning}`}>
                        <AlertTriangle size={14} />
                        <span className={Styles.warningCount}>{tabWarnings.red}</span>
                        <span 
                          className={Styles.warningLabel}
                          onClick={(e) => handleWarningClick(e, tab.id, "red")}
                          style={{ cursor: 'pointer' }}
                        >
                          {warningLabels.red}
                        </span>
                        {statistics[tab.id]?.warningIncoming?.red > 0 && (
                          <div className={`${Styles.warningStat} ${Styles.incomingRed}`} title={`${statistics[tab.id].warningIncoming.red} nye røde advarsler i dag`}>
                            <TrendingUp size={10} />
                            <span>{statistics[tab.id].warningIncoming.red}</span>
                          </div>
                        )}
                        {statistics[tab.id]?.warningOutgoing?.red > 0 && (
                          <div className={`${Styles.warningStat} ${Styles.outgoingGreen}`} title={`${statistics[tab.id].warningOutgoing.red} røde advarsler løst i dag`}>
                            <TrendingDown size={10} />
                            <span>{statistics[tab.id].warningOutgoing.red}</span>
                          </div>
                        )}
                      </div>
                    )}
                    {tabWarnings.yellow > 0 && (
                      <div className={`${Styles.warningBadge} ${Styles.yellowWarning}`}>
                        <AlertTriangle size={14} />
                        <span className={Styles.warningCount}>{tabWarnings.yellow}</span>
                        <span 
                          className={Styles.warningLabel}
                          onClick={(e) => handleWarningClick(e, tab.id, "yellow")}
                          style={{ cursor: 'pointer' }}
                        >
                          {warningLabels.yellow}
                        </span>
                        {statistics[tab.id]?.warningIncoming?.yellow > 0 && (
                          <div className={`${Styles.warningStat} ${Styles.incomingYellow}`} title={`${statistics[tab.id].warningIncoming.yellow} nye gule advarsler i dag`}>
                            <TrendingUp size={10} />
                            <span>{statistics[tab.id].warningIncoming.yellow}</span>
                          </div>
                        )}
                        {statistics[tab.id]?.warningOutgoing?.yellow > 0 && (
                          <div className={`${Styles.warningStat} ${Styles.outgoingGreen}`} title={`${statistics[tab.id].warningOutgoing.yellow} gule advarsler løst i dag`}>
                            <TrendingDown size={10} />
                            <span>{statistics[tab.id].warningOutgoing.yellow}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default OpgaverHurtigtAdminOverblik
