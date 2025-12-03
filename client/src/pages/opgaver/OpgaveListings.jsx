import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Styles from "./OpgaveListings.module.css";
import { useAuthContext } from "../../hooks/useAuthContext";
import dayjs from 'dayjs'
import 'dayjs/locale/da'
import { MapPin, IdCardLanyard, CornerRightDown, Phone, Mail, ChevronDown, NotebookTabs, UserRound, CalendarClock, CircleAlert, Calendar, Coins, RotateCw, Shredder } from 'lucide-react'
import Tooltip from '../../components/basicComponents/Tooltip'
import SaetReminderModal from '../../components/modals/SaetReminderModal.jsx'
import PopUpMenu from '../../components/basicComponents/PopUpMenu'
import { useNavigate, useLocation } from 'react-router-dom'
import BesoegsInfoModal from '../../components/modals/BesoegsInfoModal.jsx'
import TilfoejKommentarModal from '../../components/modals/TilfoejKommentarModal.jsx'
import OpgaveKommentarSection from '../../components/OpgaveKommentarSection.jsx'
import { motion, AnimatePresence } from 'framer-motion'

const OpgaveListings = ({ selectedTab, filters = {}, sortOption = "newest", scrollContainerRef, view = "admin" }) => {
  const {user} = useAuthContext();
  const navigate = useNavigate()
  const location = useLocation()
  const SCROLL_STORAGE_KEY = view === "admin" ? "opgaveListingsScrollPosition" : "opgaveListingsScrollPositionPersonal"
  const [opgaver, setOpgaver] = useState([]);
  const [filteredOpgaver, setFilteredOpgaver] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);
  const [error, setError] = useState(null);
  
  // loading is true if either isFetching or isFiltering is true
  const loading = isFetching || isFiltering;
  const [openReminderForId, setOpenReminderForId] = useState(null);
  const [remindersByOpgave, setRemindersByOpgave] = useState({});
  const [alleBesøg, setAlleBesøg] = useState([]);
  const [openBesoegId, setOpenBesoegId] = useState(null);
  const [refetchBesøgKey, setRefetchBesøgKey] = useState(0);
  const [kommentarerByOpgave, setKommentarerByOpgave] = useState({});
  const [openKommentarModalForId, setOpenKommentarModalForId] = useState(null);

  useEffect(() => {
    // Ensure Danish locale for date formatting in this view
    dayjs.locale('da')

    const fetchOpgaver = async () => {
      if (!user?.token) {
        setIsFetching(false);
        return;
      }
      
      if (!selectedTab || !selectedTab.endpoint) {
        console.error("No selectedTab or endpoint:", selectedTab);
        setIsFetching(false);
        return;
      }
      
      setIsFetching(true);
      setError(null);

      try {
        const url = `${import.meta.env.VITE_API_URL}${selectedTab.endpoint}`;
        const res = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });

        if (selectedTab.id === "unpaid") {
          // Group posteringer by opgaveID
          const opgaverMap = new Map();
          
          res.data.forEach((postering) => {

            if(!postering.opgave) {
              return;
            }
            
            // Get opgaveID from various possible locations and normalize to string
            const opgaveID = String(
              postering.opgaveID || 
              postering.opgave?._id || 
              postering.opgave?.id || 
              ''
            );
            
            if (!opgaveID || opgaveID === 'undefined' || opgaveID === 'null') return; // Skip if no valid opgaveID
            
            if (!opgaverMap.has(opgaveID)) {
              if (!postering.opgave) {
                console.warn("Postering uden opgave:", postering);
              }
              // First postering for this opgave - create entry
              opgaverMap.set(opgaveID, {
                ...postering.opgave,
                _posteringer: [postering]
              });
            } else {
              // Additional postering for this opgave - add to array
              const existing = opgaverMap.get(opgaveID);
              existing._posteringer.push(postering);
            }
          });
          
          setOpgaver(Array.from(opgaverMap.values()));
        } else {
          // For all other tabs (including personal closed), the endpoint already returns the correct data
          setOpgaver(res.data);
        }
      } catch (err) {
        console.error(err);
        setError("Kunne ikke hente opgaver.");
      } finally {
        setIsFetching(false);
      }
    };
    if (user?.token && selectedTab?.endpoint) {
      fetchOpgaver();
    }
  }, [selectedTab, user?.token, view]);

  useEffect(() => {
    // fetch mine reminders
    const fetchReminders = async () => {
      try {
        const brugerID = user.id || user._id;
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/reminders/bruger/${brugerID}`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        const map = {};
        res.data.forEach(r => { 
          // Only include pending reminders - sent/cancelled reminders don't show "Påmindelse opsat"
          if (r.status === 'pending') {
            map[r.opgaveID] = r; 
          }
        });
        setRemindersByOpgave(map);
      } catch (e) {
        // ignore
      }
    };
    if (user?.token) fetchReminders();
  }, [user]);

  useEffect(() => {
    // Fetch all besøg when on planned or current tab
    const fetchBesøg = async () => {
      if ((selectedTab.id === "planned" || selectedTab.id === "current") && user?.token) {
        try {
          const res = await axios.get(`${import.meta.env.VITE_API_URL}/besoeg`, {
            headers: { Authorization: `Bearer ${user.token}` }
          });
          setAlleBesøg(res.data || []);
        } catch (e) {
          console.error("Error fetching besøg:", e);
          setAlleBesøg([]);
        }
      }
    };
    fetchBesøg();
  }, [selectedTab.id, user?.token, refetchBesøgKey]);

  // Fetch comments for all opgaver
  useEffect(() => {
    const fetchKommentarer = async () => {
      if (!user?.token || opgaver.length === 0) return;
      
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/kommentarer`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        
        // Group comments by opgaveID
        const kommentarerMap = {};
        res.data.forEach(kommentar => {
          const opgaveID = String(kommentar.opgaveID);
          if (!kommentarerMap[opgaveID]) {
            kommentarerMap[opgaveID] = [];
          }
          kommentarerMap[opgaveID].push(kommentar);
        });
        
        // Sort comments by createdAt (newest first) for each opgave
        Object.keys(kommentarerMap).forEach(opgaveID => {
          kommentarerMap[opgaveID].sort((a, b) => 
            new Date(b.createdAt) - new Date(a.createdAt)
          );
        });
        
        setKommentarerByOpgave(kommentarerMap);
      } catch (e) {
        console.error("Error fetching kommentarer:", e);
      }
    };
    
    fetchKommentarer();
  }, [opgaver, user?.token]);

  // Find next visit and check for any visits for an opgave
  const findNextVisit = (opgaveID) => {
    const now = dayjs();
    const startOfDay = dayjs().startOf('day');
    const endOfDay = dayjs().endOf('day');
    
    // Get all visits for this opgave
    const opgaveBesøg = alleBesøg.filter(besøg => {
      const besøgOpgaveID = typeof besøg.opgaveID === 'object' ? (besøg.opgaveID?._id || besøg.opgaveID?.id) : besøg.opgaveID;
      return besøgOpgaveID === opgaveID;
    });
    
    // Check if there are any visits at all
    const hasAnyVisits = opgaveBesøg.length > 0;
    
    // Get future visits and ongoing visits (visits that end after now)
    const futureBesøg = opgaveBesøg
      .filter(besøg => {
        const besøgSlutter = dayjs(besøg.datoTidTil);
        return besøgSlutter.isAfter(now);
      })
      .sort((a, b) => dayjs(a.datoTidFra).diff(dayjs(b.datoTidFra)));

    const visitsToday = opgaveBesøg
      .filter(besøg => dayjs(besøg.datoTidFra).isBetween(startOfDay, endOfDay, null, '[]'))
      .sort((a, b) => dayjs(a.datoTidFra).diff(dayjs(b.datoTidFra)));

    const hasVisitsToday = visitsToday.length > 0;

    const hasVisitsNow = opgaveBesøg.some(besøg =>
      dayjs(besøg.datoTidFra).isBefore(now) &&
      dayjs(besøg.datoTidTil).isAfter(now)
    );

    const visitsAfterToday = opgaveBesøg
      .filter(besøg => dayjs(besøg.datoTidFra).isAfter(dayjs().endOf('day')))
      .sort((a, b) => dayjs(a.datoTidFra).diff(dayjs(b.datoTidFra)));
    
    const nextVisit = futureBesøg.length > 0 
      ? { date: futureBesøg[0].datoTidFra, id: futureBesøg[0]._id }
      : null;
    
    // Get past visits (most recent first)
    const pastBesøg = opgaveBesøg
      .filter(besøg => dayjs(besøg.datoTidFra).isBefore(now) || dayjs(besøg.datoTidFra).isSame(now, 'minute'))
      .sort((a, b) => dayjs(b.datoTidFra).diff(dayjs(a.datoTidFra))); // Sort descending (most recent first)
    
    const lastVisit = pastBesøg.length > 0 
      ? { date: pastBesøg[0].datoTidFra, id: pastBesøg[0]._id }
      : null;
    
    // Get first and last visit (by date, not filtered by time)
    const sortedByDate = [...opgaveBesøg].sort((a, b) => dayjs(a.datoTidFra).diff(dayjs(b.datoTidFra)));
    const firstVisit = sortedByDate.length > 0 
      ? { date: sortedByDate[0].datoTidFra, id: sortedByDate[0]._id }
      : null;
    const lastVisitByDate = sortedByDate.length > 0 
      ? { date: sortedByDate[sortedByDate.length - 1].datoTidFra, id: sortedByDate[sortedByDate.length - 1]._id }
      : null;
    
    // Check if missing followup: has visits but no future/ongoing visits (and no visits today)
    // futureBesøg includes both future visits and ongoing visits (visits that end after now)
    const missingFollowup = hasAnyVisits && futureBesøg.length === 0 && !hasVisitsToday;
    
    return {
      nextVisit,
      lastVisit,
      firstVisit,
      lastVisitByDate,
      hasAnyVisits,
      hasVisitsToday,
      hasVisitsNow,
      hasFutureVisits: visitsAfterToday.length > 0,
      missingFollowup
    };
  };

  // Filter and sort opgaver
  useEffect(() => {
    if (!opgaver.length) {
      setFilteredOpgaver([]);
      setIsFiltering(false);
      return;
    }

    setIsFiltering(true);
    let filtered = [...opgaver];
    
    // If no filters are set, show all opgaver (but still apply sorting)
    const hasFilters = filters && Object.keys(filters).length > 0 && Object.values(filters).some(v => v !== "all" && v !== undefined);

    // Apply filters based on active tab
    if (selectedTab.id === "new" || selectedTab.id === "open") {
      // Status filter
      if (filters.status) {
        filtered = filtered.filter(opgave => opgave.status === filters.status);
      }

      // Kunde type filter
      if (filters.kundeType) {
        if (filters.kundeType === "erhverv") {
          filtered = filtered.filter(opgave => opgave?.kunde?.CVR || opgave?.kunde?.virksomhed);
        } else if (filters.kundeType === "privat") {
          filtered = filtered.filter(opgave => !opgave?.kunde?.CVR && !opgave?.kunde?.virksomhed);
        }
      }

      // Time warning filter
      if (filters.timeWarning) {
        filtered = filtered.filter(opgave => {
          const hoursSinceReceived = dayjs().diff(dayjs(opgave.createdAt), 'hour');
          
          if (filters.timeWarning === "over12timer") {
            return hoursSinceReceived > 12 && hoursSinceReceived < 24;
          } else if (filters.timeWarning === "over24timer") {
            return hoursSinceReceived > 24;
          } else if (filters.timeWarning === "noWarning") {
            return hoursSinceReceived < 12;
          }
          return true;
        });
      }
    }

    if (selectedTab.id === "planned" || selectedTab.id === "current") {
      // Besøg filter
      if (filters.besøg) {
        filtered = filtered.filter(opgave => {
          const visitInfo = findNextVisit(opgave._id);
          
          if (filters.besøg === "hasVisits") {
            return visitInfo.hasAnyVisits;
          } else if (filters.besøg === "noVisits") {
            return !visitInfo.hasAnyVisits;
          } else if (filters.besøg === "visitsToday") {
            return visitInfo.hasVisitsToday;
          } else if (filters.besøg === "visitsFuture") {
            return visitInfo.hasFutureVisits;
          } else if (filters.besøg === "missingFollowup") {
            return visitInfo.missingFollowup;
          }
          return true;
        });
      }

      // Kunde type filter
      if (filters.kundeType) {
        if (filters.kundeType === "erhverv") {
          filtered = filtered.filter(opgave => opgave?.kunde?.CVR || opgave?.kunde?.virksomhed);
        } else if (filters.kundeType === "privat") {
          filtered = filtered.filter(opgave => !opgave?.kunde?.CVR && !opgave?.kunde?.virksomhed);
        }
      }

      // AI-oprettet filter
      if (filters.aiCreated) {
        if (filters.aiCreated === "true") {
          filtered = filtered.filter(opgave => opgave.aiCreated === true);
        } else if (filters.aiCreated === "false") {
          filtered = filtered.filter(opgave => opgave.aiCreated !== true);
        }
      }
    }

    if (selectedTab.id === "unpaid") {
      // Payment status filter
      if (filters.paymentStatus) {
        filtered = filtered.filter(opgave => {
          const posteringer = opgave._posteringer || [];
          
          const totalPosteringerAmount = posteringer.reduce((total, postering) => {
            const posteringTotalPris = (postering.totalPris || 0) * 1.25;
            return total + posteringTotalPris;
          }, 0);
          
          const totalOpkrævetAmount = posteringer.reduce((total, postering) => {
            const opkrævningerSum = postering?.opkrævninger?.reduce((sum, opkrævning) => sum + (opkrævning.opkrævningsbeløb || 0), 0) || 0;
            return total + opkrævningerSum;
          }, 0);
          
          const totalRemainingAmount = posteringer.reduce((total, postering) => {
            const posteringTotalPris = (postering.totalPris || 0) * 1.25;
            const betalingerSum = postering?.betalinger?.reduce((sum, betaling) => sum + (betaling.betalingsbeløb || 0), 0) || 0;
            const remainingAmount = posteringTotalPris - betalingerSum;
            return total + remainingAmount;
          }, 0);

          if (filters.paymentStatus === "missingOpkrævning") {
            return totalOpkrævetAmount < totalPosteringerAmount;
          } else if (filters.paymentStatus === "overdue") {
            if (totalOpkrævetAmount >= totalPosteringerAmount && totalRemainingAmount > 0) {
              const allPosteringerHaveOpkrævninger = posteringer.every(postering => 
                postering?.opkrævninger?.length > 0
              );
              const allOpkrævningerAreFaktura = posteringer.every(postering => 
                postering?.opkrævninger?.every(opkrævning => opkrævning.metode === 'faktura')
              );
              
              if (allPosteringerHaveOpkrævninger && allOpkrævningerAreFaktura) {
                const now = dayjs();
                return posteringer.some(postering => {
                  return postering?.opkrævninger?.some(opkrævning => {
                    if (opkrævning.metode !== 'faktura') return false;
                    const opkrævningsDato = dayjs(opkrævning.dato);
                    const dueDate = (opkrævning.betalingsfrist || opkrævning.betalingsdato)
                      ? dayjs(opkrævning.betalingsfrist || opkrævning.betalingsdato)
                      : opkrævningsDato.add(8, 'day');
                    return now.isAfter(dueDate);
                  });
                });
              }
            }
            return false;
          } else if (filters.paymentStatus === "pending") {
            return totalOpkrævetAmount >= totalPosteringerAmount && totalRemainingAmount > 0;
          }
          return true;
        });
      }

      // Kunde type filter
      if (filters.kundeType) {
        if (filters.kundeType === "erhverv") {
          filtered = filtered.filter(opgave => opgave?.kunde?.CVR || opgave?.kunde?.virksomhed);
        } else if (filters.kundeType === "privat") {
          filtered = filtered.filter(opgave => !opgave?.kunde?.CVR && !opgave?.kunde?.virksomhed);
        }
      }
    }

    if (selectedTab.id === "done" || selectedTab.id === "closed" || selectedTab.id === "archived" || selectedTab.id === "deleted") {
      // Kunde type filter
      if (filters.kundeType) {
        if (filters.kundeType === "erhverv") {
          filtered = filtered.filter(opgave => opgave?.kunde?.CVR || opgave?.kunde?.virksomhed);
        } else if (filters.kundeType === "privat") {
          filtered = filtered.filter(opgave => !opgave?.kunde?.CVR && !opgave?.kunde?.virksomhed);
        }
      }
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (selectedTab.id === "new" || selectedTab.id === "open") {
        if (sortOption === "newest") {
          return dayjs(b.createdAt).diff(dayjs(a.createdAt));
        } else if (sortOption === "oldest") {
          return dayjs(a.createdAt).diff(dayjs(b.createdAt));
        } else if (sortOption === "name" || sortOption === "nameDesc") {
          const aName = (a?.kunde?.CVR || a?.kunde?.virksomhed) ? (a?.kunde?.virksomhed || "") : (a?.kunde?.navn || (a?.kunde?.fornavn + " " + a?.kunde?.efternavn) || "");
          const bName = (b?.kunde?.CVR || b?.kunde?.virksomhed) ? (b?.kunde?.virksomhed || "") : (b?.kunde?.navn || (b?.kunde?.fornavn + " " + b?.kunde?.efternavn) || "");
          return sortOption === "name" 
            ? aName.localeCompare(bName, 'da') 
            : bName.localeCompare(aName, 'da');
        }
      }

      if (selectedTab.id === "planned" || selectedTab.id === "current") {
        if (sortOption === "nextVisit") {
          const aVisitInfo = findNextVisit(a._id);
          const bVisitInfo = findNextVisit(b._id);
          
          // For "nextVisit" sorting:
          // - Opgaver with future/ongoing visits come first, sorted by next visit date
          // - Opgaver with only past visits come last, sorted by last visit date (most recent first)
          const aHasFuture = aVisitInfo.nextVisit !== null;
          const bHasFuture = bVisitInfo.nextVisit !== null;
          
          // If one has future visits and the other doesn't, the one with future visits comes first
          if (aHasFuture && !bHasFuture) return -1;
          if (!aHasFuture && bHasFuture) return 1;
          
          // Both have future visits: sort by next visit date (earliest first)
          if (aHasFuture && bHasFuture) {
            return dayjs(aVisitInfo.nextVisit.date).diff(dayjs(bVisitInfo.nextVisit.date));
          }
          
          // Both have only past visits: sort by last visit date (most recent first, so they appear at the end)
          const aLastDate = aVisitInfo.lastVisit?.date || null;
          const bLastDate = bVisitInfo.lastVisit?.date || null;
          
          if (!aLastDate && !bLastDate) return 0;
          if (!aLastDate) return 1;
          if (!bLastDate) return -1;
          // Sort descending (most recent last visit first) so they appear at the end
          return dayjs(bLastDate).diff(dayjs(aLastDate));
        } else if (sortOption === "visitsFirst") {
          // Sort by last visit date (earliest last visit first, ascending)
          const aVisitInfo = findNextVisit(a._id);
          const bVisitInfo = findNextVisit(b._id);
          
          const aDate = aVisitInfo.lastVisitByDate?.date || null;
          const bDate = bVisitInfo.lastVisitByDate?.date || null;
          
          if (!aDate && !bDate) return 0;
          if (!aDate) return 1;
          if (!bDate) return -1;
          return dayjs(aDate).diff(dayjs(bDate));
        } else if (sortOption === "visitsLast") {
          // Sort by last visit date (latest last visit first, descending)
          const aVisitInfo = findNextVisit(a._id);
          const bVisitInfo = findNextVisit(b._id);
          
          const aDate = aVisitInfo.lastVisitByDate?.date || null;
          const bDate = bVisitInfo.lastVisitByDate?.date || null;
          
          if (!aDate && !bDate) return 0;
          if (!aDate) return 1;
          if (!bDate) return -1;
          return dayjs(bDate).diff(dayjs(aDate));
        } else if (sortOption === "name" || sortOption === "nameDesc") {
          const aName = (a?.kunde?.CVR || a?.kunde?.virksomhed) ? (a?.kunde?.virksomhed || "") : (a?.kunde?.navn || (a?.kunde?.fornavn + " " + a?.kunde?.efternavn) || "");
          const bName = (b?.kunde?.CVR || b?.kunde?.virksomhed) ? (b?.kunde?.virksomhed || "") : (b?.kunde?.navn || (b?.kunde?.fornavn + " " + b?.kunde?.efternavn) || "");
          return sortOption === "name" 
            ? aName.localeCompare(bName, 'da') 
            : bName.localeCompare(aName, 'da');
        }
      }

      if (selectedTab.id === "unpaid") {
        if (sortOption === "newest") {
          // Sort by opgaveAfsluttet date (when opgave was completed), or createdAt if not available
          const aDate = a.opgaveAfsluttet || a.createdAt;
          const bDate = b.opgaveAfsluttet || b.createdAt;
          return dayjs(bDate).diff(dayjs(aDate));
        } else if (sortOption === "oldest") {
          // Sort by opgaveAfsluttet date (when opgave was completed), or createdAt if not available
          const aDate = a.opgaveAfsluttet || a.createdAt;
          const bDate = b.opgaveAfsluttet || b.createdAt;
          return dayjs(aDate).diff(dayjs(bDate));
        } else if (sortOption === "amountHigh" || sortOption === "amountLow") {
          const aAmount = (a._posteringer || []).reduce((total, postering) => {
            const posteringTotalPris = (postering.totalPris || 0) * 1.25;
            const betalingerSum = postering?.betalinger?.reduce((sum, betaling) => sum + (betaling.betalingsbeløb || 0), 0) || 0;
            return total + (posteringTotalPris - betalingerSum);
          }, 0);
          const bAmount = (b._posteringer || []).reduce((total, postering) => {
            const posteringTotalPris = (postering.totalPris || 0) * 1.25;
            const betalingerSum = postering?.betalinger?.reduce((sum, betaling) => sum + (betaling.betalingsbeløb || 0), 0) || 0;
            return total + (posteringTotalPris - betalingerSum);
          }, 0);
          return sortOption === "amountHigh" ? bAmount - aAmount : aAmount - bAmount;
        } else if (sortOption === "overdue") {
          // Sort by overdue status - those with overdue first
          const aPosteringer = a._posteringer || [];
          const bPosteringer = b._posteringer || [];
          
          const aIsOverdue = aPosteringer.some(postering => {
            return postering?.opkrævninger?.some(opkrævning => {
              if (opkrævning.metode !== 'faktura') return false;
              const opkrævningsDato = dayjs(opkrævning.dato);
              const dueDate = (opkrævning.betalingsfrist || opkrævning.betalingsdato)
                ? dayjs(opkrævning.betalingsfrist || opkrævning.betalingsdato)
                : opkrævningsDato.add(8, 'day');
              return dayjs().isAfter(dueDate);
            });
          });
          
          const bIsOverdue = bPosteringer.some(postering => {
            return postering?.opkrævninger?.some(opkrævning => {
              if (opkrævning.metode !== 'faktura') return false;
              const opkrævningsDato = dayjs(opkrævning.dato);
              const dueDate = (opkrævning.betalingsfrist || opkrævning.betalingsdato)
                ? dayjs(opkrævning.betalingsfrist || opkrævning.betalingsdato)
                : opkrævningsDato.add(8, 'day');
              return dayjs().isAfter(dueDate);
            });
          });
          
          if (aIsOverdue && !bIsOverdue) return -1;
          if (!aIsOverdue && bIsOverdue) return 1;
          return 0;
        } else if (sortOption === "name" || sortOption === "nameDesc") {
          const aName = (a?.kunde?.CVR || a?.kunde?.virksomhed) ? (a?.kunde?.virksomhed || "") : (a?.kunde?.navn || (a?.kunde?.fornavn + " " + a?.kunde?.efternavn) || "");
          const bName = (b?.kunde?.CVR || b?.kunde?.virksomhed) ? (b?.kunde?.virksomhed || "") : (b?.kunde?.navn || (b?.kunde?.fornavn + " " + b?.kunde?.efternavn) || "");
          return sortOption === "name" 
            ? aName.localeCompare(bName, 'da') 
            : bName.localeCompare(aName, 'da');
        }
      }

      if (selectedTab.id === "done" || selectedTab.id === "closed" || selectedTab.id === "archived" || selectedTab.id === "deleted") {
        if (sortOption === "recent") {
          const aDate = a.opgaveAfsluttet || a.isArchived || a.isDeleted || a.createdAt;
          const bDate = b.opgaveAfsluttet || b.isArchived || b.isDeleted || b.createdAt;
          return dayjs(bDate).diff(dayjs(aDate));
        } else if (sortOption === "oldest") {
          const aDate = a.opgaveAfsluttet || a.isArchived || a.isDeleted || a.createdAt;
          const bDate = b.opgaveAfsluttet || b.isArchived || b.isDeleted || b.createdAt;
          return dayjs(aDate).diff(dayjs(bDate));
        } else if (sortOption === "name" || sortOption === "nameDesc") {
          const aName = (a?.kunde?.CVR || a?.kunde?.virksomhed) ? (a?.kunde?.virksomhed || "") : (a?.kunde?.navn || (a?.kunde?.fornavn + " " + a?.kunde?.efternavn) || "");
          const bName = (b?.kunde?.CVR || b?.kunde?.virksomhed) ? (b?.kunde?.virksomhed || "") : (b?.kunde?.navn || (b?.kunde?.fornavn + " " + b?.kunde?.efternavn) || "");
          return sortOption === "name" 
            ? aName.localeCompare(bName, 'da') 
            : bName.localeCompare(aName, 'da');
        }
      }

      // Default: newest first
      return dayjs(b.createdAt).diff(dayjs(a.createdAt));
    });

    setFilteredOpgaver(filtered);
    // Use requestAnimationFrame to ensure state update happens after render
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsFiltering(false);
      });
    });
  }, [opgaver, filters, sortOption, selectedTab.id, alleBesøg]);

  // Save scroll position when navigating away
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (scrollContainerRef.current) {
        const scrollPosition = scrollContainerRef.current.scrollTop;
        sessionStorage.setItem(SCROLL_STORAGE_KEY, scrollPosition.toString());
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Save scroll position before navigating to a task
  const handleTaskClick = (opgaveId) => {
    if (scrollContainerRef.current) {
      const scrollPosition = scrollContainerRef.current.scrollTop;
      sessionStorage.setItem(SCROLL_STORAGE_KEY, scrollPosition.toString());
    }
    navigate(`../opgave/${opgaveId}`);
  };

  // Restore scroll position when returning to overview
  useEffect(() => {
    const pathToCheck = view === "admin" ? "/alle-opgaver" : "/mine-opgaver";
    if (location.pathname === pathToCheck && scrollContainerRef.current && !loading && filteredOpgaver.length > 0) {
      const savedScrollPosition = sessionStorage.getItem(SCROLL_STORAGE_KEY);
      if (savedScrollPosition) {
        // Use setTimeout to ensure DOM is ready
        setTimeout(() => {
          if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = parseInt(savedScrollPosition, 10);
          }
        }, 100);
      }
    }
  }, [location.pathname, loading, filteredOpgaver.length, view]);

  // Save scroll position on scroll
  useEffect(() => {
    const container = scrollContainerRef.current;
    const pathToCheck = view === "admin" ? "/alle-opgaver" : "/mine-opgaver";
    if (!container || location.pathname !== pathToCheck) return;

    const handleScroll = () => {
      sessionStorage.setItem(SCROLL_STORAGE_KEY, container.scrollTop.toString());
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [location.pathname, view]);

  const formatBesøgDato = (date) => {
    // Example: 7. nov. kl. 11.00
    return dayjs(date).locale('da').format('D. MMM [kl.] HH.mm');
  };

  const getInitials = (name) => {
    if (!name) return "?";
    const parts = String(name).trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  // Handler to reopen deleted task
  const handleReopenTask = async (id, event) => {
    if (event) {
      event.stopPropagation();
    }
    
    try {
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/opgaver/${id}`,
        { isDeleted: null },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
      // Remove from current list since it's now reopened and will appear in "new" tab
      setOpgaver((prev) => prev.filter((opg) => opg._id !== id));
    } catch (error) {
      alert("Kunne ikke genåbne opgave.");
    }
  };

  // Handler to update status
  const handleStatusChange = async (id, newStatus, opgave, event) => {
    const select = event?.target;
    
    // Handle special archive/delete actions with confirmation
    if (newStatus === "ARKIVER") {
      const confirmed = window.confirm("Er du sikker på, at du vil arkivere denne opgave?");
      if (!confirmed) {
        // Reset select to current status
        if (select) select.value = opgave.status;
        return;
      }
      
      try {
        await axios.patch(
          `${import.meta.env.VITE_API_URL}/opgaver/${id}`,
          { isArchived: new Date().toISOString() },
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          }
        );
        // Remove from current list since it's now archived
        setOpgaver((prev) => prev.filter((opg) => opg._id !== id));
      } catch (error) {
        alert("Kunne ikke arkivere opgave.");
        // Reset select on error
        if (select) select.value = opgave.status;
      }
      return;
    }

    if (newStatus === "SLET") {
      const confirmed = window.confirm("Er du sikker på, at du vil slette denne opgave?");
      if (!confirmed) {
        // Reset select to current status
        if (select) select.value = opgave.status;
        return;
      }
      
      try {
        await axios.patch(
          `${import.meta.env.VITE_API_URL}/opgaver/${id}`,
          { isDeleted: new Date().toISOString() },
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          }
        );

        // Find and delete related data
        const besøgPåDenneOpgave = alleBesøg.filter(besøg => {
          const besøgOpgaveID = typeof besøg.opgaveID === 'object' ? (besøg.opgaveID?._id || besøg.opgaveID?.id) : besøg.opgaveID;
          return String(besøgOpgaveID) === String(id);
        });
        
        const kommentarerPåDenneOpgave = kommentarerByOpgave[id] || [];

        // Fetch posteringer for this opgave
        let posteringerPåDenneOpgave = [];
        try {
          const posteringerRes = await axios.get(`${import.meta.env.VITE_API_URL}/posteringer/opgave/${id}`, {
            headers: { Authorization: `Bearer ${user.token}` }
          });
          posteringerPåDenneOpgave = posteringerRes.data || [];
        } catch (err) {
          console.error("Error fetching posteringer for deletion:", err);
        }

        // Delete posteringer
        if (posteringerPåDenneOpgave.length > 0) {
          posteringerPåDenneOpgave.forEach(postering => {
            axios.delete(`${import.meta.env.VITE_API_URL}/posteringer/${postering._id}`, {
              headers: { Authorization: `Bearer ${user.token}` }
            })
            .then(() => console.log('Postering slettet:', postering._id))
            .catch(error => console.error('Error deleting postering:', error));
          });
        }

        // Delete besøg
        if (besøgPåDenneOpgave.length > 0) {
          besøgPåDenneOpgave.forEach(besøg => {
            axios.delete(`${import.meta.env.VITE_API_URL}/besoeg/${besøg._id}`, {
              headers: { Authorization: `Bearer ${user.token}` }
            })
            .then(() => console.log('Besøg slettet:', besøg._id))
            .catch(error => console.error('Error deleting besøg:', error));
          });
        }

        // Delete kommentarer
        if (kommentarerPåDenneOpgave.length > 0) {
          kommentarerPåDenneOpgave.forEach(kommentar => {
            axios.delete(`${import.meta.env.VITE_API_URL}/kommentarer/${kommentar._id}`, {
              headers: { Authorization: `Bearer ${user.token}` }
            })
            .then(() => console.log('Kommentar slettet:', kommentar._id))
            .catch(error => console.error('Error deleting kommentar:', error));
          });
        }

        // Remove from current list since it's now deleted
        setOpgaver((prev) => prev.filter((opg) => opg._id !== id));
      } catch (error) {
        alert("Kunne ikke slette opgave.");
        // Reset select on error
        if (select) select.value = opgave.status;
      }
      return;
    }

    // Handle normal status updates
    try {
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/opgaver/${id}`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
      setOpgaver((prev) =>
        prev.map((opg) =>
          opg._id === id ? { ...opg, status: newStatus } : opg
        )
      );
    } catch (error) {
      alert("Kunne ikke opdatere status.");
      // Reset select on error
      if (select) select.value = opgave.status;
    }
  };

  if (error) return <div className={Styles.error}>{error}</div>;
  
  // Use filteredOpgaver for display (always sorted and filtered)
  // filteredOpgaver will always be set by the useEffect, so we can use it directly
  const displayOpgaver = filteredOpgaver.length > 0 ? filteredOpgaver : (opgaver.length > 0 && filteredOpgaver.length === 0 ? [] : opgaver);
  
  // Skeleton loading component
  const SkeletonCard = ({ index }) => (
    <motion.div
      className={`${Styles.opgaveCard} ${Styles.skeletonCard}`}
      initial={{ opacity: 1, y: 0 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1]
      }}
    >
      <div className={Styles.cardLeftSide}>
        <div className={Styles.skeletonPill} style={{ width: '120px', height: '24px', marginBottom: '4px' }}></div>
        <div className={Styles.skeletonLine} style={{ width: '70%', height: '20px', marginBottom: '8px' }}></div>
        <div className={Styles.skeletonLine} style={{ width: '50%', height: '14px', marginBottom: '4px' }}></div>
        <div className={Styles.skeletonLine} style={{ width: '80%', height: '14px', marginBottom: '8px' }}></div>
        <div className={Styles.skeletonLine} style={{ width: '90%', height: '14px', marginBottom: '4px' }}></div>
        <div className={Styles.skeletonLine} style={{ width: '60%', height: '14px' }}></div>
      </div>
      <div className={Styles.cardRightSide}>
        <div className={Styles.skeletonLine} style={{ width: '100%', height: '38px', marginBottom: '10px' }}></div>
        <div className={Styles.skeletonLine} style={{ width: '80%', height: '36px', alignSelf: 'flex-end' }}></div>
      </div>
    </motion.div>
  );

  if (!loading && displayOpgaver.length === 0) {
    if (opgaver.length === 0) {
      return <div className={Styles.empty}>Ingen opgaver fundet.</div>;
    } else {
      return <div className={Styles.empty}>Ingen opgaver matcher de valgte filtre.</div>;
    }
  }

  return (
    <>
    <AnimatePresence mode="wait">
      {loading ? (
        <motion.div
          key={`skeleton-container-${selectedTab.id}`}
          className={Styles.listContainer}
          initial={false}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {[0, 1, 2, 3, 4].map((index) => (
            <SkeletonCard key={index} index={index} />
          ))}
        </motion.div>
      ) : (
        <motion.div
          key={`opgaver-container-${selectedTab.id}`}
          className={Styles.listContainer}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {displayOpgaver.map((opgave) => {

        const erhvervskunde = opgave?.kunde?.CVR || opgave?.kunde?.virksomhed;
        const virksomhed = opgave?.kunde?.virksomhed || <i>Virksomhedsnavn ikke angivet</i>;
        const cvr = opgave?.kunde?.CVR || "";
        const navn = opgave?.kunde?.navn || (opgave?.kunde?.fornavn + " " + opgave?.kunde?.efternavn);
        const modtaget = dayjs(opgave.createdAt).fromNow()
        const hoursSinceReceived = dayjs().diff(dayjs(opgave.createdAt), 'hour')
        const softWarning = hoursSinceReceived > 12
        const hardWarning = hoursSinceReceived > 24
        const tidsindikatorBg =
          hoursSinceReceived < 12 ? '#d3f9d8' :
          hoursSinceReceived < 24 ? '#fff3bf' :
          '#ffc9c9'

        const tidsindikatorColor =
          hoursSinceReceived < 12 ? '#2b8a3e' :
          hoursSinceReceived < 24 ? '#e67700' :
          '#c92a2a'
        const telefon = opgave?.kunde?.telefon;
        const email = opgave?.kunde?.email;

        const kontaktActions = [];
        if (telefon) {
          kontaktActions.push({
            label: `Ring ${telefon}`,
            icon: <Phone className={Styles.contactButtonIcon} />,
            onClick: () => { window.location.href = `tel:${telefon}`; }
          });
        }
        if (email) {
          kontaktActions.push({
            label: `Skriv ${email}`,
            icon: <Mail className={Styles.contactButtonIcon} />,
            onClick: () => { window.location.href = `mailto:${email}`; }
          });
        }

        const existingReminder = remindersByOpgave[opgave._id];
        const kommentarer = kommentarerByOpgave[opgave._id] || [];

        const isAiCreated = opgave.aiCreated === true;

        return (
        <div key={opgave._id} className={`${Styles.opgaveCard} ${isAiCreated ? Styles.aiCreatedOpgaveCard : ''}`} onClick={() => handleTaskClick(opgave._id)}>
          {selectedTab.id === "new" && (
            <>
              <div className={Styles.cardLeftSide}>
                <div className={Styles.tidsindikatorPillContainer}><p className={`${Styles.opgaveDatomærke} ${Styles.nyOpgaveTidsindikatorPill}`} style={{ background: tidsindikatorBg, color: tidsindikatorColor }}><CornerRightDown className={Styles.modtagetIcon} color={tidsindikatorColor} />{modtaget}</p>{softWarning && <p className={`${Styles.opgaveDatomærke} ${Styles.nyOpgaveTidsindikatorPill} ${Styles.advarselsCirkel}`} style={{ background: tidsindikatorBg, color: tidsindikatorColor }}>{hardWarning ? "!" : "!"}</p>}</div>
                <h3 className={Styles.opgaveHeading}>{erhvervskunde ? virksomhed : navn}</h3>
                <div className={Styles.opgaveDetaljerContainer}>
                {erhvervskunde && <p className={Styles.opgaveDetaljerLinje}><UserRound className={Styles.opgaveDetaljerIcon}/>Att.: {navn}</p>}
                <p className={Styles.opgaveDetaljerLinje}><MapPin className={Styles.opgaveDetaljerIcon} />{opgave?.kunde?.adresse}, {opgave?.kunde?.postnummerOgBy}</p>
                </div>
                <div className={Styles.opgaveBeskrivelseDiv}>
                  <p className={Styles.opgaveBeskrivelse}>{opgave.opgaveBeskrivelse}</p>
                </div>
                <OpgaveKommentarSection
                  kommentarer={kommentarer}
                  onAddComment={() => setOpenKommentarModalForId(opgave._id)}
                />
              </div>
              <div className={Styles.cardRightSide}>
                <div className={Styles.statusSelectWrapper}>
                  <select
                    value={opgave.status}
                    onChange={e => handleStatusChange(opgave._id, e.target.value, opgave, e)}
                    onClick={(e) => e.stopPropagation()}
                    className={Styles.opgaveStatusSelect}
                  >
                    <option value="Modtaget">Opgave modtaget</option>
                    <option value="Afventer svar">Afventer svar</option>
                    <option value="Dato aftalt">Dato aftalt</option>
                    <option value="ARKIVER">Arkivér opgave</option>
                    <option value="SLET">Slet opgave</option>
                  </select>
                  <ChevronDown className={Styles.chevronDownIcon} />
                </div>
                <div className={Styles.actionButtonsColumn}>
                  <button className={`${Styles.sekundaerKnap} ${existingReminder ? Styles.highlightPåmindelseKnap : ""}`} onClick={(e) => { e.stopPropagation(); setOpenReminderForId(opgave._id); }}>
                    <CalendarClock className={Styles.contactButtonIcon} />
                    <span>{existingReminder ? 'Påmindelse opsat' : 'Påmind ...'}</span>
                  </button>
                  {kontaktActions.length > 0 && (
                    <div className={Styles.kontaktKnapper} onClick={(e) => e.stopPropagation()}>
                      <PopUpMenu actions={kontaktActions} text="Kontakt" icon={<NotebookTabs />} direction="right" variant="grey"/>
                    </div>
                  )}
                </div>
                <SaetReminderModal
                  trigger={openReminderForId === opgave._id}
                  setTrigger={(v) => { if(!v) setOpenReminderForId(null); }}
                  opgaveID={opgave._id}
                  kundeID={opgave.kunde?._id || opgave.kundeID}
                  existingReminder={existingReminder}
                  onSuccess={async () => {
                    try {
                      const brugerID = user.id || user._id;
                      const res = await axios.get(`${import.meta.env.VITE_API_URL}/reminders/bruger/${brugerID}`, {
                        headers: { Authorization: `Bearer ${user.token}` }
                      });
                      const map = {};
                      res.data.forEach(r => { 
                        // Only include pending reminders - sent/cancelled reminders don't show "Påmindelse opsat"
                        if (r.status === 'pending') {
                          map[r.opgaveID] = r; 
                        }
                      });
                      setRemindersByOpgave(map);
                    } catch (e) {}
                  }}
                />
              </div>
            </>
          )}

          {selectedTab.id === "open" && (
            <>
              <div className={Styles.cardLeftSide}>
                <div className={Styles.tidsindikatorPillContainer}><p className={`${Styles.opgaveDatomærke} ${Styles.nyOpgaveTidsindikatorPill}`} style={{ background: tidsindikatorBg, color: tidsindikatorColor }}><CornerRightDown className={Styles.modtagetIcon} color={tidsindikatorColor} />{modtaget}</p>{softWarning && <p className={`${Styles.opgaveDatomærke} ${Styles.nyOpgaveTidsindikatorPill} ${Styles.advarselsCirkel}`} style={{ background: tidsindikatorBg, color: tidsindikatorColor }}>{hardWarning ? "!" : "!"}</p>}</div>
                <h3 className={Styles.opgaveHeading}>{erhvervskunde ? virksomhed : navn}</h3>
                <div className={Styles.opgaveDetaljerContainer}>
                {erhvervskunde && <p className={Styles.opgaveDetaljerLinje}><UserRound className={Styles.opgaveDetaljerIcon}/>Att.: {navn}</p>}
                <p className={Styles.opgaveDetaljerLinje}><MapPin className={Styles.opgaveDetaljerIcon} />{opgave?.kunde?.adresse}, {opgave?.kunde?.postnummerOgBy}</p>
                </div>
                <div className={Styles.opgaveBeskrivelseDiv}>
                  <p className={Styles.opgaveBeskrivelse}>{opgave.opgaveBeskrivelse}</p>
                </div>
                <OpgaveKommentarSection
                  kommentarer={kommentarer}
                  onAddComment={() => setOpenKommentarModalForId(opgave._id)}
                />
              </div>
              <div className={Styles.cardRightSide}>
                <div className={Styles.statusSelectWrapper}>
                  <select
                    value={opgave.status}
                    onChange={e => handleStatusChange(opgave._id, e.target.value, opgave, e)}
                    onClick={(e) => e.stopPropagation()}
                    className={Styles.opgaveStatusSelect}
                  >
                    <option value="Modtaget">Opgave modtaget</option>
                    <option value="Afventer svar">Afventer svar</option>
                    <option value="Dato aftalt">Dato aftalt</option>
                    <option value="ARKIVER">Arkivér opgave</option>
                    <option value="SLET">Slet opgave</option>
                  </select>
                  <ChevronDown className={Styles.chevronDownIcon} />
                </div>
                <div className={Styles.actionButtonsColumn}>
                  <button className={`${Styles.sekundaerKnap} ${existingReminder ? Styles.highlightPåmindelseKnap : ""}`} onClick={(e) => { e.stopPropagation(); setOpenReminderForId(opgave._id); }}>
                    <CalendarClock className={Styles.contactButtonIcon} />
                    <span>{existingReminder ? 'Påmindelse opsat' : 'Påmind ...'}</span>
                  </button>
                  {kontaktActions.length > 0 && (
                    <div className={Styles.kontaktKnapper} onClick={(e) => e.stopPropagation()}>
                      <PopUpMenu actions={kontaktActions} text="Kontakt" icon={<NotebookTabs />} direction="right" variant="grey"/>
                    </div>
                  )}
                </div>
                <SaetReminderModal
                  trigger={openReminderForId === opgave._id}
                  setTrigger={(v) => { if(!v) setOpenReminderForId(null); }}
                  opgaveID={opgave._id}
                  kundeID={opgave.kunde?._id || opgave.kundeID}
                  existingReminder={existingReminder}
                  onSuccess={async () => {
                    try {
                      const brugerID = user.id || user._id;
                      const res = await axios.get(`${import.meta.env.VITE_API_URL}/reminders/bruger/${brugerID}`, {
                        headers: { Authorization: `Bearer ${user.token}` }
                      });
                      const map = {};
                      res.data.forEach(r => { 
                        // Only include pending reminders - sent/cancelled reminders don't show "Påmindelse opsat"
                        if (r.status === 'pending') {
                          map[r.opgaveID] = r; 
                        }
                      });
                      setRemindersByOpgave(map);
                    } catch (e) {}
                  }}
                />
              </div>
            </>
          )}

          {(selectedTab.id === "planned" || selectedTab.id === "current") && (() => {
            const visitInfo = findNextVisit(opgave._id);
            const ansvarlig = opgave?.ansvarlig || [];
            
            // Determine warning state
            const hardWarning = !visitInfo.hasAnyVisits; // No visits at all
            const softWarning = visitInfo.hasAnyVisits && !visitInfo.hasVisitsToday && !visitInfo.hasFutureVisits; // Has past visits but no future
            
            const warningBg = hardWarning ? '#ffc9c9' : '#fff3bf';
            const warningColor = hardWarning ? '#c92a2a' : '#e67700';
            const warningText = hardWarning ? 'Ingen besøg planlagt' : 'Mangler opfølgning';
            
            return (
              <>
                <div className={Styles.cardLeftSide}>
                  {(hardWarning || softWarning) && (
                    <div className={Styles.tidsindikatorPillContainer}>
                      <p className={`${Styles.opgaveDatomærke} ${Styles.nyOpgaveTidsindikatorPill}`} style={{ background: warningBg, color: warningColor }}>
                        <CircleAlert className={Styles.modtagetIcon} color={warningColor} />
                        {warningText}
                      </p>
                    </div>
                  )}
                  {isAiCreated && (
                    <div className={Styles.tidsindikatorPillContainer}>
                      <p className={`${Styles.opgaveDatomærke} ${Styles.aiCreatedPill}`}>AI-oprettet</p>
                    </div>
                  )}
                  <h3 className={`${Styles.opgaveHeading} ${isAiCreated ? Styles.aiCreatedHeading : ''}`}>{erhvervskunde ? virksomhed : navn}</h3>
                  <div className={Styles.opgaveDetaljerContainer}>
                    {erhvervskunde && <p className={Styles.opgaveDetaljerLinje}><UserRound className={Styles.opgaveDetaljerIcon}/>Att.: {navn}</p>}
                    <p className={Styles.opgaveDetaljerLinje}><MapPin className={Styles.opgaveDetaljerIcon} />{opgave?.kunde?.adresse}, {opgave?.kunde?.postnummerOgBy}</p>
                  </div>
                  <div className={Styles.opgaveBeskrivelseDiv}>
                    <p className={Styles.opgaveBeskrivelse}>{opgave.opgaveBeskrivelse}</p>
                  </div>
                  <OpgaveKommentarSection
                    kommentarer={kommentarer}
                    onAddComment={() => setOpenKommentarModalForId(opgave._id)}
                  />
                </div>
                <div className={Styles.cardRightSide}>
                  {/* Ansvarlige section - inline icon + overlapping badges */}
                  {ansvarlig.length > 0 && (
                    <div className={`${Styles.opgaveBeskrivelseDiv} ${Styles.ansvarligSectionCard} ${Styles.ansvarligInlineRow}`} style={{alignSelf: 'flex-end'}}>
                      {/* <div className={Styles.ansvarligInlineRow}> */}
                        <div className={Styles.ansvarligIconPill}>
                          <IdCardLanyard className={Styles.ansvarligInlineIcon} />
                        </div>
                        <div className={Styles.ansvarligBadgesStrip}>
                          {ansvarlig.map((person, idx) => (
                            <div
                              key={person._id || idx}
                              className={Styles.ansvarligChip}
                              style={{ zIndex: 99 - idx }}
                            >
                              <Tooltip content={person.navn || 'Ukendt'}>
                                <span className={Styles.ansvarligAvatar}>{getInitials(person.navn)}</span>
                              </Tooltip>
                            </div>
                          ))}
                        </div>
                      {/* </div> */}
                    </div>
                  )}

                  {/* Visit action button */}
                  {(visitInfo.nextVisit || visitInfo.lastVisit) && (() => {
                    const visitIdToOpen = visitInfo.nextVisit ? visitInfo.nextVisit.id : visitInfo.lastVisit.id;
                    const visitToShow = alleBesøg.find(besøg => besøg._id === visitIdToOpen);
                    const isVisitAiCreated = visitToShow?.aiCreated === true;
                    
                    return (
                      <div className={Styles.actionButtonsColumn}>
                        <b className={Styles.besøgButtonHeading}>{visitInfo.hasVisitsNow ? "Besøg i gang:" : (visitInfo.nextVisit ? "Næste besøg:" : "Sidste besøg:")}</b>
                        <button
                          className={`${Styles.sekundaerKnap} ${visitInfo.hasVisitsNow ? Styles.besøgIgangKnap : ""} ${isVisitAiCreated ? Styles.aiCreatedBesøgKnap : ""}`}
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            setOpenBesoegId(visitIdToOpen);
                          }}
                          aria-label={visitInfo.nextVisit ? 'Åbn næste besøg' : 'Åbn sidste besøg'}
                        >
                          <Calendar className={Styles.contactButtonIcon} />
                          <span>
                            {visitInfo.nextVisit ? formatBesøgDato(visitInfo.nextVisit.date) : formatBesøgDato(visitInfo.lastVisit.date)}
                          </span>
                          {isVisitAiCreated && (
                            <span className={Styles.aiCreatedBesøgBadge}>AI</span>
                          )}
                        </button>
                      </div>
                    );
                  })()}
                </div>
              </>
            );
          })()}

          {selectedTab.id === "unpaid" && (() => {
            const posteringer = opgave._posteringer || [];
            
            // Calculate total unpaid amount across all posteringer for this opgave
            const totalRemainingAmount = posteringer.reduce((total, postering) => {
              const posteringTotalPris = (postering.totalPris || 0) * 1.25;
              const betalingerSum = postering?.betalinger?.reduce((sum, betaling) => sum + (betaling.betalingsbeløb || 0), 0) || 0;
              const remainingAmount = posteringTotalPris - betalingerSum;
              return total + remainingAmount;
            }, 0);
            const formattedAmount = totalRemainingAmount.toLocaleString('da-DK', { 
              style: 'currency', 
              currency: 'DKK', 
              minimumFractionDigits: 0, 
              maximumFractionDigits: 0 
            });
            const ansvarlig = opgave?.ansvarlig || [];
            
            // Calculate total posteringer amount (what should be charged)
            const totalPosteringerAmount = posteringer.reduce((total, postering) => {
              const posteringTotalPris = (postering.totalPris || 0) * 1.25;
              return total + posteringTotalPris;
            }, 0);
            
            // Calculate total opkrævet amount (what has been charged)
            const totalOpkrævetAmount = posteringer.reduce((total, postering) => {
              const opkrævningerSum = postering?.opkrævninger?.reduce((sum, opkrævning) => sum + (opkrævning.opkrævningsbeløb || 0), 0) || 0;
              return total + opkrævningerSum;
            }, 0);
            
            // Check if opkrævning is missing (red warning)
            const hardWarning = totalOpkrævetAmount < totalPosteringerAmount;
            
            // Check if payment due date exceeded (yellow warning)
            // This happens when:
            // 1. Posteringer are fully opkrævet with faktura
            // 2. But payments are not fully paid
            // 3. And the due date has passed
            let softWarning = false;
            if (totalOpkrævetAmount >= totalPosteringerAmount && totalRemainingAmount > 0) {
              // Check if all opkrævninger are faktura (and all posteringer have opkrævninger)
              const allPosteringerHaveOpkrævninger = posteringer.every(postering => 
                postering?.opkrævninger?.length > 0
              );
              
              const allOpkrævningerAreFaktura = posteringer.every(postering => 
                postering?.opkrævninger?.every(opkrævning => opkrævning.metode === 'faktura')
              );
              
              if (allPosteringerHaveOpkrævninger && allOpkrævningerAreFaktura) {
                // Check if any faktura due date has passed
                const now = dayjs();
                softWarning = posteringer.some(postering => {
                  return postering?.opkrævninger?.some(opkrævning => {
                    if (opkrævning.metode !== 'faktura') return false;
                    
                    // Calculate due date: betalingsfrist if exists, otherwise dato + 8 days (bagudkompatibel med betalingsdato)
                    const opkrævningsDato = dayjs(opkrævning.dato);
                    const dueDate = (opkrævning.betalingsfrist || opkrævning.betalingsdato)
                      ? dayjs(opkrævning.betalingsfrist || opkrævning.betalingsdato)
                      : opkrævningsDato.add(8, 'day');
                    
                    // Check if due date has passed
                    return now.isAfter(dueDate);
                  });
                });
              }
            }
            
            // Determine which warning to show (red takes priority)
            const showWarning = hardWarning || softWarning;
            const warningBg = hardWarning ? '#ffc9c9' : '#fff3bf';
            const warningColor = hardWarning ? '#c92a2a' : '#e67700';
            const warningText = hardWarning ? 'Opkrævning mangler' : 'Betalingsfrist overskredet';
            
            return (
              <>
                <div className={Styles.cardLeftSide}>
                  {showWarning && (
                    <div className={Styles.tidsindikatorPillContainer}>
                      <p className={`${Styles.opgaveDatomærke} ${Styles.nyOpgaveTidsindikatorPill}`} style={{ background: warningBg, color: warningColor }}>
                        <CircleAlert className={Styles.modtagetIcon} color={warningColor} />
                        {warningText}
                      </p>
                    </div>
                  )}
                  <h3 className={Styles.opgaveHeading}>{erhvervskunde ? virksomhed : navn}</h3>
                  <div className={Styles.opgaveDetaljerContainer}>
                    {erhvervskunde && <p className={Styles.opgaveDetaljerLinje}><UserRound className={Styles.opgaveDetaljerIcon}/>Att.: {navn}</p>}
                    <p className={Styles.opgaveDetaljerLinje}><MapPin className={Styles.opgaveDetaljerIcon} />{opgave?.kunde?.adresse}, {opgave?.kunde?.postnummerOgBy}</p>
                  </div>
                  <div className={Styles.opgaveBeskrivelseDiv}>
                    <p className={Styles.opgaveBeskrivelse}>{opgave.opgaveBeskrivelse}</p>
                  </div>
                  <OpgaveKommentarSection
                    kommentarer={kommentarer}
                    onAddComment={() => setOpenKommentarModalForId(opgave._id)}
                  />
                </div>
                <div className={Styles.cardRightSide}>
                  {/* Ansvarlige section - inline icon + overlapping badges */}
                  {ansvarlig.length > 0 && (
                    <div className={`${Styles.opgaveBeskrivelseDiv} ${Styles.ansvarligSectionCard} ${Styles.ansvarligInlineRow}`} style={{alignSelf: 'flex-end'}}>
                      <div className={Styles.ansvarligIconPill}>
                        <IdCardLanyard className={Styles.ansvarligInlineIcon} />
                      </div>
                      <div className={Styles.ansvarligBadgesStrip}>
                        {ansvarlig.map((person, idx) => (
                          <div
                            key={person._id || idx}
                            className={Styles.ansvarligChip}
                            style={{ zIndex: 99 - idx }}
                          >
                            <Tooltip content={person.navn || 'Ukendt'}>
                              <span className={Styles.ansvarligAvatar}>{getInitials(person.navn)}</span>
                            </Tooltip>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Unpaid amount display */}
                  {totalRemainingAmount > 0 && (
                    <div className={Styles.actionButtonsColumn}>
                      {opgave.opgaveAfsluttet ? <p className={Styles.afsluttetTekst}>Afsluttet for {dayjs(opgave.opgaveAfsluttet).fromNow()}</p> : <p className={`${Styles.afsluttetTekst} ${Styles.ikkeAfsluttetTekst}`}>Opgave ikke afsluttet</p>}
                      <div className={Styles.sekundaerKnap} style={{ cursor: 'default' }}>
                        <Coins className={Styles.contactButtonIcon} />
                        <span>{formattedAmount}</span>
                      </div>
                    </div>
                  )}
                </div>
              </>
            );
          })()}

          {(selectedTab.id === "done" || selectedTab.id === "closed") && (() => {
            const ansvarlig = opgave?.ansvarlig || [];
            const posteringer = opgave._posteringer || [];
            
            // Calculate total unpaid amount if there are posteringer
            let totalRemainingAmount = 0;
            let formattedAmount = "";
            if (posteringer.length > 0) {
              totalRemainingAmount = posteringer.reduce((total, postering) => {
                const posteringTotalPris = (postering.totalPris || 0) * 1.25;
                const betalingerSum = postering?.betalinger?.reduce((sum, betaling) => sum + (betaling.betalingsbeløb || 0), 0) || 0;
                const remainingAmount = posteringTotalPris - betalingerSum;
                return total + remainingAmount;
              }, 0);
              formattedAmount = totalRemainingAmount.toLocaleString('da-DK', { 
                style: 'currency', 
                currency: 'DKK', 
                minimumFractionDigits: 0, 
                maximumFractionDigits: 0 
              });
            }
            
            return (
              <>
                <div className={Styles.cardLeftSide}>
                  <h3 className={Styles.opgaveHeading}>{erhvervskunde ? virksomhed : navn}</h3>
                  <div className={Styles.opgaveDetaljerContainer}>
                    {erhvervskunde && <p className={Styles.opgaveDetaljerLinje}><UserRound className={Styles.opgaveDetaljerIcon}/>Att.: {navn}</p>}
                    <p className={Styles.opgaveDetaljerLinje}><MapPin className={Styles.opgaveDetaljerIcon} />{opgave?.kunde?.adresse}, {opgave?.kunde?.postnummerOgBy}</p>
                  </div>
                  <div className={Styles.opgaveBeskrivelseDiv}>
                    <p className={Styles.opgaveBeskrivelse}>{opgave.opgaveBeskrivelse}</p>
                  </div>
                  <OpgaveKommentarSection
                    kommentarer={kommentarer}
                    onAddComment={() => setOpenKommentarModalForId(opgave._id)}
                  />
                </div>
                <div className={Styles.cardRightSide}>
                  {/* Ansvarlige section - inline icon + overlapping badges */}
                  {ansvarlig.length > 0 && (
                    <div className={`${Styles.opgaveBeskrivelseDiv} ${Styles.ansvarligSectionCard} ${Styles.ansvarligInlineRow}`} style={{alignSelf: 'flex-end'}}>
                      <div className={Styles.ansvarligIconPill}>
                        <IdCardLanyard className={Styles.ansvarligInlineIcon} />
                      </div>
                      <div className={Styles.ansvarligBadgesStrip}>
                        {ansvarlig.map((person, idx) => (
                          <div
                            key={person._id || idx}
                            className={Styles.ansvarligChip}
                            style={{ zIndex: 99 - idx }}
                          >
                            <Tooltip content={person.navn || 'Ukendt'}>
                              <span className={Styles.ansvarligAvatar}>{getInitials(person.navn)}</span>
                            </Tooltip>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Completion date and unpaid amount display */}
                  <div className={Styles.actionButtonsColumn}>
                    {opgave.opgaveAfsluttet && (
                      <p className={Styles.afsluttetTekst}>Afsluttet for {dayjs(opgave.opgaveAfsluttet).fromNow()}</p>
                    )}
                    {user.isAdmin && totalRemainingAmount > 0 && (
                      <div className={Styles.sekundaerKnap} style={{ cursor: 'default' }}>
                        <Coins className={Styles.contactButtonIcon} />
                        <span>{formattedAmount}</span>
                      </div>
                    )}
                  </div>
                </div>
              </>
            );
          })()}

          {selectedTab.id === "archived" && (
            <>
              <div className={Styles.cardLeftSide}>
                <div className={Styles.tidsindikatorPillContainer}>
                  <p className={`${Styles.opgaveDatomærke} ${Styles.nyOpgaveTidsindikatorPill}`} style={{ background: '#e9e9e9', color: '#666' }}>
                    <CornerRightDown className={Styles.modtagetIcon} color="#666" />
                    Arkiveret {dayjs(opgave.isArchived).fromNow()}
                  </p>
                </div>
                <h3 className={Styles.opgaveHeading}>{erhvervskunde ? virksomhed : navn}</h3>
                <div className={Styles.opgaveDetaljerContainer}>
                  {erhvervskunde && <p className={Styles.opgaveDetaljerLinje}><UserRound className={Styles.opgaveDetaljerIcon}/>Att.: {navn}</p>}
                  <p className={Styles.opgaveDetaljerLinje}><MapPin className={Styles.opgaveDetaljerIcon} />{opgave?.kunde?.adresse}, {opgave?.kunde?.postnummerOgBy}</p>
                </div>
                <div className={Styles.opgaveBeskrivelseDiv}>
                  <p className={Styles.opgaveBeskrivelse}>{opgave.opgaveBeskrivelse}</p>
                </div>
                <OpgaveKommentarSection
                  kommentarer={kommentarer}
                  onAddComment={() => setOpenKommentarModalForId(opgave._id)}
                />
              </div>
              <div className={Styles.cardRightSide}>
                <div className={Styles.statusSelectWrapper}>
                  <select
                    value={opgave.status}
                    onChange={e => handleStatusChange(opgave._id, e.target.value, opgave, e)}
                    onClick={(e) => e.stopPropagation()}
                    className={Styles.opgaveStatusSelect}
                  >
                    <option value="Modtaget">Opgave modtaget</option>
                    <option value="Afventer svar">Afventer svar</option>
                    <option value="Dato aftalt">Dato aftalt</option>
                    <option value="ARKIVER">Arkivér opgave</option>
                    <option value="SLET">Slet opgave</option>
                  </select>
                  <ChevronDown className={Styles.chevronDownIcon} />
                </div>
                <div className={Styles.actionButtonsColumn}>
                  {kontaktActions.length > 0 && (
                    <div className={Styles.kontaktKnapper} onClick={(e) => e.stopPropagation()}>
                      <PopUpMenu actions={kontaktActions} text="Kontakt" icon={<NotebookTabs />} direction="right" variant="grey"/>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {selectedTab.id === "deleted" && (
            <>
              <div className={Styles.cardLeftSide}>
                <div className={Styles.tidsindikatorPillContainer}>
                  <p className={`${Styles.opgaveDatomærke} ${Styles.nyOpgaveTidsindikatorPill}`} style={{ background: '#ffc9c9', color: '#c92a2a' }}>
                    <Shredder className={Styles.modtagetIcon} color="#c92a2a" />
                    Slettet for {dayjs(opgave.isDeleted).fromNow()}
                  </p>
                </div>
                <h3 className={Styles.opgaveHeading}>{erhvervskunde ? virksomhed : navn}</h3>
                <div className={Styles.opgaveDetaljerContainer}>
                  {erhvervskunde && <p className={Styles.opgaveDetaljerLinje}><UserRound className={Styles.opgaveDetaljerIcon}/>Att.: {navn}</p>}
                  <p className={Styles.opgaveDetaljerLinje}><MapPin className={Styles.opgaveDetaljerIcon} />{opgave?.kunde?.adresse}, {opgave?.kunde?.postnummerOgBy}</p>
                </div>
                <div className={Styles.opgaveBeskrivelseDiv}>
                  <p className={Styles.opgaveBeskrivelse}>{opgave.opgaveBeskrivelse}</p>
                </div>
                <OpgaveKommentarSection
                  kommentarer={kommentarer}
                  onAddComment={() => setOpenKommentarModalForId(opgave._id)}
                />
              </div>
              <div className={Styles.cardRightSide}>
                <div className={Styles.actionButtonsColumn}>
                  <button 
                    className={Styles.sekundaerKnap} 
                    onClick={(e) => handleReopenTask(opgave._id, e)}
                  >
                    <RotateCw className={Styles.contactButtonIcon} />
                    <span>Genåbn</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
        )
      })}
        </motion.div>
      )}
    </AnimatePresence>
    <BesoegsInfoModal 
      trigger={Boolean(openBesoegId)} 
      setTrigger={(v) => { if(!v) setOpenBesoegId(null) }} 
      besoegId={openBesoegId}
      onUpdated={() => setRefetchBesøgKey(prev => prev + 1)}
      onDeleted={() => setRefetchBesøgKey(prev => prev + 1)}
    />
    {displayOpgaver.map((opgave) => (
      <TilfoejKommentarModal
        key={`kommentar-modal-${opgave._id}`}
        trigger={openKommentarModalForId === opgave._id}
        setTrigger={(v) => { if(!v) setOpenKommentarModalForId(null); }}
        opgaveID={opgave._id}
        onSuccess={async () => {
          try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/kommentarer`, {
              headers: { Authorization: `Bearer ${user.token}` }
            });
            const kommentarerMap = {};
            res.data.forEach(kommentar => {
              const opgaveID = String(kommentar.opgaveID);
              if (!kommentarerMap[opgaveID]) {
                kommentarerMap[opgaveID] = [];
              }
              kommentarerMap[opgaveID].push(kommentar);
            });
            Object.keys(kommentarerMap).forEach(opgaveID => {
              kommentarerMap[opgaveID].sort((a, b) => 
                new Date(b.createdAt) - new Date(a.createdAt)
              );
            });
            setKommentarerByOpgave(kommentarerMap);
          } catch (e) {
            console.error("Error fetching kommentarer:", e);
          }
        }}
      />
    ))}
    </>
  );
};

export default OpgaveListings;
