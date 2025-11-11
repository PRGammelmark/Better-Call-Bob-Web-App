import React, { useState, useRef, useEffect } from "react";
import Styles from "./OpgaveTabs.module.css";
import { BellRing, FolderOpen, CalendarCheck2, Wallet, CheckCircle, Archive, Trash2, Filter } from "lucide-react";
import OpgaveListings from "./OpgaveListings";
import OpgaveSidebar from "./OpgaveSidebar";
import MobileFilterModal from "./MobileFilterModal";
import axios from "axios";
import { useAuthContext } from "../../hooks/useAuthContext";
import { useLocation } from "react-router-dom";
import dayjs from "dayjs";

const adminTabs = [
  {
    id: "new",
    label: "Nye opgaver",
    icon: <BellRing size={18} />,
    endpoint: "/opgaver/new",
  },
  {
    id: "open",
    label: "Åbne",
    icon: <FolderOpen size={18} />,
    endpoint: "/opgaver/open",
  },
  {
    id: "planned",
    label: "Planlagte",
    icon: <CalendarCheck2 size={18} />,
    endpoint: "/opgaver/planned",
  },
  {
    id: "unpaid",
    label: "Ubetalte",
    icon: <Wallet size={18} />,
    endpoint: "/posteringer/unpaid",
  },
  {
    id: "done",
    label: "Afsluttede",
    icon: <CheckCircle size={18} />,
    endpoint: "/opgaver/done",
  },
  {
    id: "archived",
    label: "Arkiverede",
    icon: <Archive size={18} />,
    endpoint: "/opgaver/archived",
  },
  {
    id: "deleted",
    label: "Slettede",
    icon: <Trash2 size={18} />,
    endpoint: "/opgaver/deleted",
  },
];

const personalTabs = [
  {
    id: "current",
    label: "Aktuelle opgaver",
    icon: <CalendarCheck2 size={18} />,
    endpoint: "/opgaver/personal/current",
  },
  {
    id: "closed",
    label: "Afsluttede opgaver",
    icon: <CheckCircle size={18} />,
    endpoint: "/opgaver/personal/closed",
  },
];

const OpgaveTabs = ({ view = "admin" }) => {
  const { user } = useAuthContext();
  const location = useLocation();
  const STORAGE_KEY = view === "admin" ? "opgaveTabsState" : "opgaveTabsStatePersonal";
  const hasRestoredState = useRef(false);
  const isRestoringState = useRef(false);
  
  const tabs = view === "admin" ? adminTabs : personalTabs;
  const defaultTab = view === "admin" ? "new" : "current";
  const [openTab, setOpenTab] = useState(defaultTab);
  const [underlineStyle, setUnderlineStyle] = useState({ width: 0, left: 0 });
  const tabRefs = useRef([]);
  const [counts, setCounts] = useState({
    new: null,
    open: null,
    planned: null,
    unpaid: null,
  });
  const [warnings, setWarnings] = useState({
    new: { yellow: 0, red: 0 },
    open: { yellow: 0, red: 0 },
    planned: { yellow: 0, red: 0 },
    unpaid: { yellow: 0, red: 0 },
  });
  const [filters, setFilters] = useState({});
  const [sortOption, setSortOption] = useState(() => {
    // Set default sort based on stored tab, or default to "newest"
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // If we have a stored sortOption, use it; otherwise default based on tab
        if (parsed.sortOption) {
          return parsed.sortOption;
        }
        // If no stored sortOption, default to "nextVisit" for planned tab
        if (parsed.openTab === "planned") {
          return "nextVisit";
        }
      }
    } catch (e) {}
    return "newest";
  });
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const scrollContainerRef = useRef(null);
  const previousTabRef = useRef(openTab);

  // Restore state from sessionStorage when returning to overview page
  useEffect(() => {
    const pathToCheck = view === "admin" ? "/alle-opgaver" : "/mine-opgaver";
    if (location.pathname === pathToCheck && !hasRestoredState.current) {
      try {
        const stored = sessionStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          // Mark as restoring BEFORE setting state to prevent reset effect from running
          isRestoringState.current = true;
          hasRestoredState.current = true;
          
          if (parsed.openTab) {
            previousTabRef.current = parsed.openTab;
            setOpenTab(parsed.openTab);
          }
          // Always restore filters and sortOption, even if they're empty objects
          setFilters(parsed.filters || {});
      // Use stored sortOption, or default to "nextVisit" for planned/current tab, "newest" otherwise
      const defaultSort = (parsed.openTab === "planned" || parsed.openTab === "current") ? "nextVisit" : "newest";
      setSortOption(parsed.sortOption || defaultSort);
          
          // Clear restoration flag after a brief delay to allow state updates to complete
          setTimeout(() => {
            isRestoringState.current = false;
          }, 0);
        } else {
          hasRestoredState.current = true; // Mark as restored even if no stored state
        }
      } catch (e) {
        console.error("Error restoring state:", e);
        hasRestoredState.current = true;
      }
    } else {
      const pathToCheck = view === "admin" ? "/alle-opgaver" : "/mine-opgaver";
      if (location.pathname !== pathToCheck) {
        // Reset restoration flag when navigating away so we can restore again when coming back
        hasRestoredState.current = false;
      }
    }
  }, [location.pathname, view]);

  // Fetch counts and warnings for the first 4 tabs (admin) or all tabs (personal)
  useEffect(() => {
    if (!user?.token) return;

    const fetchCountsAndWarnings = async () => {
      const tabsToCount = view === "admin" ? tabs.slice(0, 4) : tabs; // First 4 tabs for admin, all for personal
      
      // Fetch besøg data for planned tab warnings
      let alleBesøg = [];
      try {
        const besøgRes = await axios.get(`${import.meta.env.VITE_API_URL}/besoeg`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        alleBesøg = besøgRes.data || [];
      } catch (e) {
        console.error("Error fetching besøg:", e);
      }

      const countPromises = tabsToCount.map(async (tab) => {
        try {
          const url = `${import.meta.env.VITE_API_URL}${tab.endpoint}`;
          const res = await axios.get(url, {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          });

          let count = 0;
          let yellowWarnings = 0;
          let redWarnings = 0;

          if (tab.id === "unpaid") {
            // For unpaid, we need to group posteringer by opgaveID (similar to OpgaveListings)
            const opgaverMap = new Map();
            res.data.forEach((postering) => {
              if (!postering.opgave) return;
              
              const opgaveID = String(
                postering.opgaveID || 
                postering.opgave?._id || 
                postering.opgave?.id || 
                ''
              );
              
              if (!opgaveID || opgaveID === 'undefined' || opgaveID === 'null') return;
              
              if (!opgaverMap.has(opgaveID)) {
                opgaverMap.set(opgaveID, [postering]);
              } else {
                opgaverMap.get(opgaveID).push(postering);
              }
            });
            
            count = opgaverMap.size;
            
            // Calculate warnings for unpaid tab
            opgaverMap.forEach((posteringer, opgaveID) => {
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
              
              // Red warning: opkrævning is missing
              const hardWarning = totalOpkrævetAmount < totalPosteringerAmount;
              
              // Yellow warning: payment due date exceeded
              let softWarning = false;
              if (totalOpkrævetAmount >= totalPosteringerAmount && totalRemainingAmount > 0) {
                const allPosteringerHaveOpkrævninger = posteringer.every(postering => 
                  postering?.opkrævninger?.length > 0
                );
                
                const allOpkrævningerAreFaktura = posteringer.every(postering => 
                  postering?.opkrævninger?.every(opkrævning => opkrævning.metode === 'faktura')
                );
                
                if (allPosteringerHaveOpkrævninger && allOpkrævningerAreFaktura) {
                  const now = dayjs();
                  softWarning = posteringer.some(postering => {
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
              
              if (hardWarning) redWarnings++;
              else if (softWarning) yellowWarnings++;
            });
          } else if (tab.id === "planned" || tab.id === "current") {
            const opgaver = Array.isArray(res.data) ? res.data : [];
            count = opgaver.length;
            
            // Calculate warnings for planned/current tab
            opgaver.forEach((opgave) => {
              const opgaveID = opgave._id || opgave.id;
              const opgaveBesøg = alleBesøg.filter(besøg => {
                const besøgOpgaveID = typeof besøg.opgaveID === 'object' ? (besøg.opgaveID?._id || besøg.opgaveID?.id) : besøg.opgaveID;
                return besøgOpgaveID === opgaveID;
              });
              
              const hasAnyVisits = opgaveBesøg.length > 0;
              const now = dayjs();
              
              // Check for future/ongoing visits (visits that end after now)
              const futureBesøg = opgaveBesøg.filter(besøg => {
                const besøgSlutter = dayjs(besøg.datoTidTil);
                return besøgSlutter.isAfter(now);
              });
              
              // Check for visits today
              const startOfDay = now.startOf('day');
              const endOfDay = now.endOf('day');
              const visitsToday = opgaveBesøg.filter(besøg => 
                dayjs(besøg.datoTidFra).isBetween(startOfDay, endOfDay, null, '[]')
              );
              const hasVisitsToday = visitsToday.length > 0;
              
              // Red warning: no visits at all
              const hardWarning = !hasAnyVisits;
              // Yellow warning: has visits but no future/ongoing visits (and no visits today)
              // This matches the logic in OpgaveListings.jsx
              const softWarning = hasAnyVisits && futureBesøg.length === 0 && !hasVisitsToday;
              
              if (hardWarning) redWarnings++;
              else if (softWarning) yellowWarnings++;
            });
          } else if (tab.id === "closed") {
            // For closed tab, just count the opgaver
            const opgaver = Array.isArray(res.data) ? res.data : [];
            count = opgaver.length;
          } else {
            // For new and open tabs
            const opgaver = Array.isArray(res.data) ? res.data : [];
            count = opgaver.length;
            
            // Calculate warnings based on hours since received
            opgaver.forEach((opgave) => {
              const hoursSinceReceived = dayjs().diff(dayjs(opgave.createdAt), 'hour');
              const softWarning = hoursSinceReceived > 12;
              const hardWarning = hoursSinceReceived > 24;
              
              if (hardWarning) redWarnings++;
              else if (softWarning) yellowWarnings++;
            });
          }

          return { 
            tabId: tab.id, 
            count,
            yellowWarnings,
            redWarnings
          };
        } catch (err) {
          console.error(`Error fetching count for ${tab.id}:`, err);
          return { 
            tabId: tab.id, 
            count: null,
            yellowWarnings: 0,
            redWarnings: 0
          };
        }
      });

      const results = await Promise.all(countPromises);
      const countsObj = {};
      const warningsObj = view === "admin" ? {
        new: { yellow: 0, red: 0 },
        open: { yellow: 0, red: 0 },
        planned: { yellow: 0, red: 0 },
        unpaid: { yellow: 0, red: 0 },
      } : {
        current: { yellow: 0, red: 0 },
        closed: { yellow: 0, red: 0 },
      };
      
      results.forEach(({ tabId, count, yellowWarnings, redWarnings }) => {
        countsObj[tabId] = count;
        warningsObj[tabId] = { yellow: yellowWarnings, red: redWarnings };
      });
      
      setCounts(countsObj);
      setWarnings(warningsObj);
    };

    fetchCountsAndWarnings();
  }, [user?.token, view]);

  useEffect(() => {
    const activeIndex = tabs.findIndex((t) => t.id === openTab);
    const activeTab = tabRefs.current[activeIndex];
    if (activeTab) {
      setUnderlineStyle({
        width: activeTab.offsetWidth,
        left: activeTab.offsetLeft,
      });
    }
  }, [openTab, counts, warnings]); // Also update when counts/warnings change to adjust underline position

  const currentTab = tabs.find(t => t.id === openTab) || tabs[0]; // Fallback to first tab if not found

  // Save state to sessionStorage whenever it changes
  useEffect(() => {
    // Only save if we've completed restoration (to avoid overwriting with default values)
    if (!hasRestoredState.current) {
      return;
    }
    const stateToSave = {
      openTab,
      filters,
      sortOption,
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
  }, [openTab, filters, sortOption]);

  // Reset filters and sort when tab changes (but only if user manually changed tab, not when restoring)
  useEffect(() => {
    // Skip reset if we're restoring state
    if (isRestoringState.current) {
      return;
    }
    if (!hasRestoredState.current) {
      previousTabRef.current = openTab;
      return;
    }
      // Only reset if tab actually changed (user action)
    if (previousTabRef.current !== openTab) {
      setFilters({});
      // Set default sort: "nextVisit" for planned/current tab, "newest" for others
      setSortOption((openTab === "planned" || openTab === "current") ? "nextVisit" : "newest");
      previousTabRef.current = openTab;
    }
  }, [openTab]);

  // Check if mobile
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 750);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className={Styles.overblikContainer}>
      <div className={Styles.container}>
        {!isMobile && (
          <OpgaveSidebar
            activeTab={currentTab}
            onFilterChange={setFilters}
            onSortChange={setSortOption}
            filters={filters}
            sortOption={sortOption}
            view={view}
          />
        )}
        <div className={Styles.contentColumn}>
          <div className={Styles.opgaveTabsContainer}>
            {tabs.map((tab, i) => {
              const showCount = (view === "admin" ? i < 4 : true) && counts[tab.id] !== null; // Show count for first 4 tabs (admin) or all (personal)
              const tabWarnings = (view === "admin" ? i < 4 : true) ? (warnings[tab.id] || { yellow: 0, red: 0 }) : { yellow: 0, red: 0 };
              const hasYellowWarning = tabWarnings && tabWarnings.yellow > 0;
              const hasRedWarning = tabWarnings && tabWarnings.red > 0;
              
              return (
                <button
                  key={tab.id}
                  ref={(el) => (tabRefs.current[i] = el)}
                  onClick={() => setOpenTab(tab.id)}
                  className={`${Styles.tabButton} ${openTab === tab.id ? Styles.active : ""}`}
                >
                  <span className={Styles.icon}>{tab.icon}</span>
                  {tab.label}
                  {(showCount || hasRedWarning || hasYellowWarning) && (
                    <span className={Styles.badgesContainer}>
                      {showCount && (
                        <span className={Styles.countBadge}>{counts[tab.id]}</span>
                      )}
                      {hasRedWarning && (
                        <span className={Styles.warningBadge} data-warning-type="red" title={`${tabWarnings.red} røde advarsler`}>
                          {tabWarnings.red}
                        </span>
                      )}
                      {hasYellowWarning && (
                        <span className={Styles.warningBadge} data-warning-type="yellow" title={`${tabWarnings.yellow} gule advarsler`}>
                          {tabWarnings.yellow}
                        </span>
                      )}
                    </span>
                  )}
                </button>
              );
            })}

          <div
            className={Styles.underline}
            style={{
              width: underlineStyle.width,
              transform: `translateX(${underlineStyle.left}px)`,
              transition: 'width 0.2s ease, transform 0.4s ease',
            }}
          />
          </div>
          <div ref={scrollContainerRef} className={Styles.opgaveListingsContainer}>
            <OpgaveListings 
              selectedTab={currentTab}
              filters={filters}
              sortOption={sortOption}
              scrollContainerRef={scrollContainerRef}
              view={view}
            />
          </div>
        </div>
      </div>

      {/* Mobile Filter FAB */}
      {isMobile && (
        <button
          className={Styles.filterFab}
          onClick={() => setIsMobileFilterOpen(true)}
          aria-label="Åbn filtre"
        >
          <Filter size={20} />
        </button>
      )}

      {/* Mobile Filter Modal */}
      {isMobile && (
        <MobileFilterModal
          isOpen={isMobileFilterOpen}
          onClose={() => setIsMobileFilterOpen(false)}
          activeTab={currentTab}
          onFilterChange={setFilters}
          onSortChange={setSortOption}
          filters={filters}
          sortOption={sortOption}
          view={view}
        />
      )}
    </div>
  );
};

export default OpgaveTabs;
