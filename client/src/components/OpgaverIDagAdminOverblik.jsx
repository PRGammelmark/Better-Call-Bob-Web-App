import React, { useState, useEffect } from 'react'
import Styles from './OpgaverIDagAdminOverblik.module.css'
import OpgaveListingsStyles from '../pages/opgaver/OpgaveListings.module.css'
import axios from 'axios'
import { useAuthContext } from '../hooks/useAuthContext'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import 'dayjs/locale/da'
import { MapPin, IdCardLanyard, UserRound, Calendar, Phone, Mail, NotebookTabs, Navigation, ArrowRightToLine } from 'lucide-react'
import OpgaveKommentarSection from './OpgaveKommentarSection'
import Tooltip from './basicComponents/Tooltip'
import BesoegsInfoModal from './modals/BesoegsInfoModal'
import TilfoejKommentarModal from './modals/TilfoejKommentarModal'
import PopUpMenu from './basicComponents/PopUpMenu'

const OpgaverIDagAdminOverblik = () => {
  const { user } = useAuthContext()
  const navigate = useNavigate()
  const [opgaver, setOpgaver] = useState([])
  const [alleBesøg, setAlleBesøg] = useState([])
  const [brugere, setBrugere] = useState([])
  const [kommentarerByOpgave, setKommentarerByOpgave] = useState({})
  const [openBesoegId, setOpenBesoegId] = useState(null)
  const [refetchBesøgKey, setRefetchBesøgKey] = useState(0)
  const [openKommentarModalForId, setOpenKommentarModalForId] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    dayjs.locale('da')
  }, [])

  // Fetch all tasks
  useEffect(() => {
    const fetchOpgaver = async () => {
      if (!user?.token) {
        setLoading(false)
        return
      }

      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/opgaver/populateKunder`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        })
        setOpgaver(res.data || [])
      } catch (err) {
        console.error('Error fetching opgaver:', err)
        setOpgaver([])
      }
    }

    fetchOpgaver()
  }, [user?.token])

  // Fetch all visits
  useEffect(() => {
    const fetchBesøg = async () => {
      if (!user?.token) return

      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/besoeg`, {
          headers: { Authorization: `Bearer ${user.token}` }
        })
        setAlleBesøg(res.data || [])
      } catch (e) {
        console.error('Error fetching besøg:', e)
        setAlleBesøg([])
      }
    }
    fetchBesøg()
  }, [user?.token, refetchBesøgKey])

  // Fetch all employees
  useEffect(() => {
    const fetchBrugere = async () => {
      if (!user?.token) return

      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/brugere`, {
          headers: { Authorization: `Bearer ${user.token}` }
        })
        setBrugere(res.data || [])
      } catch (e) {
        console.error('Error fetching brugere:', e)
        setBrugere([])
      }
    }
    fetchBrugere()
  }, [user?.token])

  // Fetch comments
  useEffect(() => {
    const fetchKommentarer = async () => {
      if (!user?.token || opgaver.length === 0) return
      
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/kommentarer`, {
          headers: { Authorization: `Bearer ${user.token}` }
        })
        
        const kommentarerMap = {}
        res.data.forEach(kommentar => {
          const opgaveID = String(kommentar.opgaveID)
          if (!kommentarerMap[opgaveID]) {
            kommentarerMap[opgaveID] = []
          }
          kommentarerMap[opgaveID].push(kommentar)
        })
        
        Object.keys(kommentarerMap).forEach(opgaveID => {
          kommentarerMap[opgaveID].sort((a, b) => 
            new Date(b.createdAt) - new Date(a.createdAt)
          )
        })
        
        setKommentarerByOpgave(kommentarerMap)
      } catch (e) {
        console.error('Error fetching kommentarer:', e)
      }
    }
    
    fetchKommentarer()
  }, [opgaver, user?.token])

  // Get all visits today across all tasks and employees
  const getVisitsToday = () => {
    const now = dayjs()
    const startOfDay = now.startOf('day')
    const endOfDay = now.endOf('day')

    // Get all visits today
    const visitsToday = alleBesøg.filter(besøg => {
      const besøgDato = dayjs(besøg.datoTidFra)
      return besøgDato.isBetween(startOfDay, endOfDay, null, '[]')
    })

    // Create a map of opgaveID to opgave for quick lookup
    const opgaverMap = new Map()
    opgaver.forEach(opgave => {
      const opgaveID = String(opgave._id || opgave.id)
      opgaverMap.set(opgaveID, opgave)
    })

    // Create a map of brugerID to bruger for quick lookup
    const brugereMap = new Map()
    brugere.forEach(bruger => {
      const brugerID = String(bruger._id || bruger.id)
      brugereMap.set(brugerID, bruger)
    })

    // Create entries combining visit + task + employee
    const entries = []
    visitsToday.forEach(besøg => {
      const opgaveID = typeof besøg.opgaveID === 'object' 
        ? String(besøg.opgaveID?._id || besøg.opgaveID?.id) 
        : String(besøg.opgaveID)
      
      const brugerID = typeof besøg.brugerID === 'object' 
        ? String(besøg.brugerID?._id || besøg.brugerID?.id) 
        : String(besøg.brugerID)
      
      const opgave = opgaverMap.get(opgaveID)
      const bruger = brugereMap.get(brugerID)
      
      if (opgave) {
        entries.push({
          ...opgave,
          _visitToday: besøg,
          _employee: bruger,
          _entryId: `${opgaveID}-${besøg._id}` // Unique ID for this entry
        })
      }
    })

    // Sort chronologically by visit time
    entries.sort((a, b) => {
      const aTime = dayjs(a._visitToday.datoTidFra)
      const bTime = dayjs(b._visitToday.datoTidFra)
      return aTime.diff(bTime)
    })

    return entries
  }

  const visitsToday = getVisitsToday()

  // Set loading to false once we have the necessary data
  useEffect(() => {
    if (opgaver.length >= 0 && alleBesøg.length >= 0 && brugere.length >= 0) {
      setLoading(false)
    }
  }, [opgaver, alleBesøg, brugere])

  const formatBesøgTid = (datoTidFra, datoTidTil) => {
    const fra = dayjs(datoTidFra).format('HH:mm')
    const til = dayjs(datoTidTil).format('HH:mm')
    return `${fra} - ${til}`
  }

  const getInitials = (name) => {
    if (!name) return '?'
    const parts = String(name).trim().split(/\s+/)
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
  }

  const handleTaskClick = (opgaveId) => {
    navigate(`../opgave/${opgaveId}`)
  }

  const åbnKortLink = (adresse) => {
    const appleMapsUrl = `maps://maps.apple.com/?q=${adresse}, Denmark`
    const googleMapsUrl = `https://maps.google.com/?q=${adresse}, Denmark`
    
    // Tjek om det er en iOS-enhed
    if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
      window.location.href = appleMapsUrl
    } else {
      window.location.href = googleMapsUrl
    }
  }

  if (loading) {
    return (
      <div className={Styles.container}>
        <div className={Styles.header}>
          <div className={`${Styles.heading} ${Styles.skeletonLine}`} style={{ width: '200px', height: '24px' }}></div>
        </div>
        <div className={Styles.cardsContainer}>
          {[1, 2].map((index) => (
            <div key={index} className={`${OpgaveListingsStyles.opgaveCard} ${Styles.opgaveCard} ${Styles.skeletonCard}`}>
              <div className={OpgaveListingsStyles.cardLeftSide}>
                <div className={`${Styles.skeletonLine} ${Styles.skeletonHeading}`} style={{ width: '180px', height: '24px', marginBottom: '8px' }}></div>
                <div className={OpgaveListingsStyles.opgaveDetaljerContainer}>
                  <div className={`${Styles.skeletonLine}`} style={{ width: '70%', height: '16px', marginBottom: '6px' }}></div>
                  <div className={`${Styles.skeletonLine}`} style={{ width: '85%', height: '16px', marginBottom: '6px' }}></div>
                  <div className={`${Styles.skeletonLine}`} style={{ width: '60%', height: '16px' }}></div>
                </div>
                <div className={OpgaveListingsStyles.opgaveBeskrivelseDiv}>
                  <div className={`${Styles.skeletonLine}`} style={{ width: '90%', height: '14px', marginBottom: '4px' }}></div>
                  <div className={`${Styles.skeletonLine}`} style={{ width: '75%', height: '14px' }}></div>
                </div>
                <div className={`${Styles.skeletonLine}`} style={{ width: '100px', height: '20px', marginTop: '8px' }}></div>
              </div>
              <div className={OpgaveListingsStyles.cardRightSide}>
                <div className={`${Styles.skeletonLine}`} style={{ width: '100%', height: '36px', marginBottom: '10px' }}></div>
                <div className={`${Styles.skeletonLine}`} style={{ width: '80%', height: '38px', alignSelf: 'flex-end' }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={Styles.container}>
      <div className={Styles.header}>
        <h2 className={Styles.heading}>
          Alle besøg i dag
          {visitsToday.length > 0 && (
            <span className={Styles.countBadge}>{visitsToday.length}</span>
          )}
        </h2>
      </div>

      {visitsToday.length === 0 ? (
        <div className={Styles.emptyState}>
          <p>Der er ingen besøg planlagt i dag.</p>
        </div>
      ) : (
        <>
          <div className={Styles.cardsContainer}>
            {visitsToday.map((opgave) => {
              const erhvervskunde = opgave?.kunde?.CVR || opgave?.kunde?.virksomhed
              const virksomhed = opgave?.kunde?.virksomhed || <i>Virksomhedsnavn ikke angivet</i>
              const navn = opgave?.kunde?.navn || (opgave?.kunde?.fornavn + ' ' + opgave?.kunde?.efternavn)
              const ansvarlig = opgave?.ansvarlig || []
              const kommentarer = kommentarerByOpgave[opgave._id] || []
              const telefon = opgave?.kunde?.telefon
              const email = opgave?.kunde?.email
              
              // Get the visit for this entry
              const visitToday = opgave._visitToday
              const employee = opgave._employee
              
              // Check if this specific visit is ongoing
              const now = dayjs()
              const isVisitOngoing = visitToday && 
                dayjs(visitToday.datoTidFra).isBefore(now) &&
                dayjs(visitToday.datoTidTil).isAfter(now)

              // Contact actions
              const kontaktActions = []
              if (telefon) {
                kontaktActions.push({
                  label: `Ring ${telefon}`,
                  icon: <Phone className={OpgaveListingsStyles.contactButtonIcon} />,
                  onClick: () => { window.location.href = `tel:${telefon}` }
                })
              }
              if (email) {
                kontaktActions.push({
                  label: `Skriv ${email}`,
                  icon: <Mail className={OpgaveListingsStyles.contactButtonIcon} />,
                  onClick: () => { window.location.href = `mailto:${email}` }
                })
              }

              return (
                <div
                  key={opgave._entryId || opgave._id}
                  className={`${OpgaveListingsStyles.opgaveCard} ${Styles.opgaveCard}`}
                  onClick={() => handleTaskClick(opgave._id)}
                >
                  <div className={OpgaveListingsStyles.cardLeftSide}>
                    <h3 className={OpgaveListingsStyles.opgaveHeading}>
                      {erhvervskunde ? virksomhed : navn}
                    </h3>
                    <div className={OpgaveListingsStyles.opgaveDetaljerContainer}>
                      {erhvervskunde && (
                        <p className={OpgaveListingsStyles.opgaveDetaljerLinje}>
                          <UserRound className={OpgaveListingsStyles.opgaveDetaljerIcon} />
                          Att.: {navn}
                        </p>
                      )}
                      <p className={OpgaveListingsStyles.opgaveDetaljerLinje}>
                        <MapPin className={OpgaveListingsStyles.opgaveDetaljerIcon} />
                        {opgave?.kunde?.adresse}, {opgave?.kunde?.postnummerOgBy}
                      </p>
                      {/* Employee assigned to visit */}
                      {employee && (
                        <p className={OpgaveListingsStyles.opgaveDetaljerLinje}>
                          <ArrowRightToLine className={OpgaveListingsStyles.opgaveDetaljerIcon} />
                          {employee.navn || 'Ukendt'}
                        </p>
                      )}
                    </div>
                    <div className={OpgaveListingsStyles.opgaveBeskrivelseDiv}>
                      <p className={OpgaveListingsStyles.opgaveBeskrivelse}>
                        {opgave.opgaveBeskrivelse}
                      </p>
                    </div>
                    <OpgaveKommentarSection
                      kommentarer={kommentarer}
                      onAddComment={() => setOpenKommentarModalForId(opgave._id)}
                    />
                  </div>
                  <div className={OpgaveListingsStyles.cardRightSide}>
                    {/* Ansvarlige section */}
                    {ansvarlig.length > 0 && (
                      <div
                        className={`${OpgaveListingsStyles.opgaveBeskrivelseDiv} ${OpgaveListingsStyles.ansvarligSectionCard} ${OpgaveListingsStyles.ansvarligInlineRow}`}
                        style={{ alignSelf: 'flex-end' }}
                      >
                        <div className={OpgaveListingsStyles.ansvarligIconPill}>
                          <IdCardLanyard className={OpgaveListingsStyles.ansvarligInlineIcon} />
                        </div>
                        <div className={OpgaveListingsStyles.ansvarligBadgesStrip}>
                          {ansvarlig.map((person, idx) => (
                            <div
                              key={person._id || idx}
                              className={OpgaveListingsStyles.ansvarligChip}
                              style={{ zIndex: 99 - idx }}
                            >
                              <Tooltip content={person.navn || 'Ukendt'}>
                                <span className={OpgaveListingsStyles.ansvarligAvatar}>
                                  {getInitials(person.navn)}
                                </span>
                              </Tooltip>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Find vej, Contact, and Visit buttons */}
                    {(opgave?.kunde?.adresse || visitToday || kontaktActions.length > 0) && (
                      <div className={OpgaveListingsStyles.actionButtonsColumn}>
                        {/* Find vej and Kontakt buttons - side by side when space allows */}
                        {(opgave?.kunde?.adresse || kontaktActions.length > 0) && (
                          <div className={Styles.topButtonsRow}>
                            {/* Find vej button */}
                            {opgave?.kunde?.adresse && (
                              <button
                                className={OpgaveListingsStyles.sekundaerKnap}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  åbnKortLink(opgave.kunde.adresse)
                                }}
                                aria-label="Find vej"
                              >
                                <Navigation className={OpgaveListingsStyles.contactButtonIcon} />
                                <span>Find vej</span>
                              </button>
                            )}
                            {/* Contact button */}
                            {kontaktActions.length > 0 && (
                              <div className={OpgaveListingsStyles.kontaktKnapper} onClick={(e) => e.stopPropagation()}>
                                <PopUpMenu actions={kontaktActions} text="Kontakt" icon={<NotebookTabs />} direction="right" variant="grey"/>
                              </div>
                            )}
                          </div>
                        )}
                        {/* Visit button */}
                        {visitToday && (
                          <button
                            className={`${OpgaveListingsStyles.sekundaerKnap} ${
                              isVisitOngoing ? OpgaveListingsStyles.besøgIgangKnap : ''
                            } ${Styles.besøgButtonEmphasized}`}
                            onClick={(e) => {
                              e.stopPropagation()
                              setOpenBesoegId(visitToday._id)
                            }}
                            aria-label="Åbn besøg"
                          >
                            <Calendar className={OpgaveListingsStyles.contactButtonIcon} />
                            <span>{formatBesøgTid(visitToday.datoTidFra, visitToday.datoTidTil)}</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      <BesoegsInfoModal
        trigger={Boolean(openBesoegId)}
        setTrigger={(v) => {
          if (!v) setOpenBesoegId(null)
        }}
        besoegId={openBesoegId}
        onUpdated={() => setRefetchBesøgKey((prev) => prev + 1)}
        onDeleted={() => setRefetchBesøgKey((prev) => prev + 1)}
      />
      {/* Use a Set to track unique opgave IDs to avoid duplicate modals */}
      {Array.from(new Set(visitsToday.map(opgave => opgave._id))).map((opgaveId) => (
        <TilfoejKommentarModal
          key={`kommentar-modal-${opgaveId}`}
          trigger={openKommentarModalForId === opgaveId}
          setTrigger={(v) => {
            if (!v) setOpenKommentarModalForId(null)
          }}
          opgaveID={opgaveId}
          onSuccess={async () => {
            try {
              const res = await axios.get(`${import.meta.env.VITE_API_URL}/kommentarer`, {
                headers: { Authorization: `Bearer ${user.token}` }
              })
              const kommentarerMap = {}
              res.data.forEach((kommentar) => {
                const opgaveID = String(kommentar.opgaveID)
                if (!kommentarerMap[opgaveID]) {
                  kommentarerMap[opgaveID] = []
                }
                kommentarerMap[opgaveID].push(kommentar)
              })
              Object.keys(kommentarerMap).forEach((opgaveID) => {
                kommentarerMap[opgaveID].sort(
                  (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
                )
              })
              setKommentarerByOpgave(kommentarerMap)
            } catch (e) {
              console.error('Error fetching kommentarer:', e)
            }
          }}
        />
      ))}
    </div>
  )
}

export default OpgaverIDagAdminOverblik
