import { useState, useEffect, useRef } from "react";
import { Search, X, Users, ClipboardList, User, Calendar, ArrowRight, Building2, ChevronDown } from "lucide-react";
import Styles from './Søgning.module.css';
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuthContext } from "../hooks/useAuthContext";
import { AnimatePresence, motion } from "framer-motion";

export default function Søgning({ background, color, åbenSøgning, setÅbenSøgning, onOpen }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [collapsedCategories, setCollapsedCategories] = useState({});
  const inputRef = useRef(null);
  const mobileInputRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  const { user } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 750);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fokuser på input når søgning åbnes
  useEffect(() => {
    if (åbenSøgning) {
      setTimeout(() => {
        if (isMobile && mobileInputRef.current) {
          mobileInputRef.current.focus();
        } else if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 200);
    }
  }, [åbenSøgning, isMobile]);

  // Debounced søgning
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchTerm.trim().length < 2) {
      setResults(null);
      return;
    }

    setIsLoading(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/search?q=${encodeURIComponent(searchTerm)}`,
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
        setResults(response.data.results);
      } catch (error) {
        console.error("Søgefejl:", error);
        setResults(null);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, user.token]);

  const resultsAnimation = {
    initial: { opacity: 0, y: -10, scale: 0.95, transformOrigin: "top right" },
    animate: { opacity: 1, y: 0, scale: 1, transformOrigin: "top right" },
    exit: { opacity: 0, y: -10, scale: 0.95, transformOrigin: "top right" },
    transition: { type: "spring", stiffness: 400, damping: 30 }
  };

  const mobileResultsAnimation = {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { type: "spring", stiffness: 400, damping: 30 }
  };

  const handleOpenSøgning = () => {
    onOpen && onOpen();
    setÅbenSøgning(true);
  };

  const handleCloseSøgning = () => {
    setSearchTerm("");
    setResults(null);
    setÅbenSøgning(false);
  };

  const handleResultClick = (result) => {
    handleCloseSøgning();

    switch (result.type) {
      case 'kunde':
        navigate(`/kunde/${result._id}`);
        break;
      case 'opgave':
        navigate(`/opgave/${result._id}`);
        break;
      case 'medarbejder':
        navigate(`/profil/${result._id}`);
        break;
      case 'besøg':
        if (result.opgaveID) {
          navigate(`/opgave/${result.opgaveID}`);
        } else if (result.kundeID) {
          navigate(`/kunde/${result.kundeID}`);
        }
        break;
      default:
        break;
    }
  };

  const getIconForType = (type) => {
    switch (type) {
      case 'kunde':
        return <Users size={18} />;
      case 'opgave':
        return <ClipboardList size={18} />;
      case 'medarbejder':
        return <User size={18} />;
      case 'besøg':
        return <Calendar size={18} />;
      default:
        return <Search size={18} />;
    }
  };

  const getCategoryLabel = (type) => {
    switch (type) {
      case 'kunder':
        return 'Kunder';
      case 'opgaver':
        return 'Opgaver';
      case 'medarbejdere':
        return 'Medarbejdere';
      case 'besøg':
        return 'Besøg';
      default:
        return type;
    }
  };

  const hasResults = results && (
    results.kunder?.length > 0 ||
    results.opgaver?.length > 0 ||
    results.medarbejdere?.length > 0 ||
    results.besøg?.length > 0
  );

  const toggleCategory = (category) => {
    setCollapsedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const renderResults = () => {
    if (!results) return null;

    const categories = ['kunder', 'opgaver', 'medarbejdere', 'besøg'];
    
    return categories.map(category => {
      const items = results[category];
      if (!items || items.length === 0) return null;

      const isCollapsed = collapsedCategories[category];

      return (
        <div key={category} className={Styles.resultCategory}>
          <div 
            className={Styles.categoryHeader}
            onClick={() => toggleCategory(category)}
          >
            {getIconForType(items[0]?.type)}
            <span>{getCategoryLabel(category)}</span>
            <span className={Styles.categoryCount}>({items.length})</span>
            <ChevronDown 
              size={16} 
              className={`${Styles.categoryChevron} ${isCollapsed ? Styles.categoryChevronCollapsed : ''}`} 
            />
          </div>
          <AnimatePresence initial={false}>
            {!isCollapsed && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                style={{ overflow: 'hidden' }}
              >
                {items.map((item) => (
                  <div
                    key={item._id}
                    className={Styles.resultRow}
                    onClick={() => handleResultClick(item)}
                  >
                    <div className={Styles.resultIcon}>
                      {item.type === 'medarbejder' && item.profilbillede ? (
                        <img src={item.profilbillede} alt="" className={Styles.profileImage} />
                      ) : item.type === 'medarbejder' && item.eventColor ? (
                        <div className={Styles.colorDot} style={{ background: item.eventColor }} />
                      ) : (
                        getIconForType(item.type)
                      )}
                    </div>
                    <div className={Styles.resultContent}>
                      <div className={Styles.resultName}>
                        {item.type === 'opgave' && item.incrementalID && (
                          <span className={Styles.opgaveNummer}>#{String(item.incrementalID).slice(-3)}</span>
                        )}
                        {item.navn}
                        {item.type === 'kunde' && item.virksomhed && (
                          <span className={Styles.virksomhedBadge}>
                            <Building2 size={12} />
                            {item.virksomhed}
                          </span>
                        )}
                      </div>
                      <div className={Styles.resultSubtitle}>{item.subtitle}</div>
                      {item.type === 'opgave' && item.status && (
                        <span className={`${Styles.statusBadge} ${Styles[`status${item.status.replace(/\s/g, '')}`]}`}>
                          {item.status}
                        </span>
                      )}
                    </div>
                    <ArrowRight size={16} className={Styles.arrowIcon} />
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    });
  };

  // Desktop version
  if (!isMobile) {
    return (
      <div className={Styles.søgningContainer}>
        {/* Søgeknap der animerer til inputfelt */}
        <motion.div
          className={Styles.searchButtonWrapper}
          animate={{
            width: åbenSøgning ? '320px' : '40px',
            borderRadius: åbenSøgning ? '50px' : '50px',
          }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          style={{ background: åbenSøgning ? '#f5f5f5' : background }}
        >
          {/* Søgeikon - kun klikbart når lukket */}
          <div
            className={`${Styles.searchButton} ${åbenSøgning ? Styles.searchButtonOpen : ''}`}
            onClick={!åbenSøgning ? handleOpenSøgning : undefined}
            style={{ color: åbenSøgning ? '#888' : color, cursor: åbenSøgning ? 'default' : 'pointer' }}
          >
            <div className={Styles.iconWrapper}>
              <Search
                size={20}
                className={åbenSøgning ? Styles.iconHidden : Styles.iconVisible}
              />
            </div>
          </div>

          {/* Input felt der vises når åben */}
          <AnimatePresence>
            {åbenSøgning && (
              <motion.div 
                className={Styles.inputWrapper}
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              >
                <input
                  ref={inputRef}
                  type="text"
                  className={Styles.searchInput}
                  placeholder="Søg..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button
                  className={Styles.closeButton}
                  onClick={handleCloseSøgning}
                >
                  <X size={18} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Resultat dropdown */}
        <AnimatePresence mode="sync">
          {åbenSøgning && (
            <motion.div
              className={Styles.dropdownContainer}
              variants={resultsAnimation}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={resultsAnimation.transition}
            >
              <div className={Styles.dropdown}>
                <div className={Styles.resultsContainer}>
                  {isLoading && (
                    <div className={Styles.loadingState}>
                      <div className={Styles.loadingSpinner} />
                      <span>Søger...</span>
                    </div>
                  )}
                  {!isLoading && searchTerm.length >= 2 && !hasResults && (
                    <div className={Styles.emptyState}>
                      <Search size={32} strokeWidth={1.5} />
                      <span>Ingen resultater for "{searchTerm}"</span>
                    </div>
                  )}
                  {!isLoading && searchTerm.length < 2 && (
                    <div className={Styles.hintState}>
                      <Search size={32} strokeWidth={1.5} />
                      <span>Skriv mindst 2 tegn for at søge</span>
                    </div>
                  )}
                  {!isLoading && hasResults && renderResults()}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Mobile version - helt separat struktur
  return (
    <>
      {/* Søgeknap i header */}
      <div
        className={Styles.mobileSearchButton}
        style={{ background, color }}
        onClick={handleOpenSøgning}
      >
        <Search size={20} />
      </div>

      {/* Fullscreen overlay når åben */}
      <AnimatePresence>
        {åbenSøgning && (
          <>
            {/* Header med inputfelt */}
            <motion.div
              className={Styles.mobileSearchHeader}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            >
              <div className={Styles.mobileSearchInputWrapper}>
                <Search size={20} className={Styles.mobileSearchIcon} />
                <input
                  ref={mobileInputRef}
                  type="text"
                  className={Styles.mobileSearchInput}
                  placeholder="Søg efter kunder, opgaver..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoFocus
                />
                {searchTerm && (
                  <button
                    className={Styles.mobileClearButton}
                    onClick={() => {
                      setSearchTerm("");
                      setResults(null);
                      mobileInputRef.current?.focus();
                    }}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              <button
                className={Styles.mobileCloseButton}
                onClick={handleCloseSøgning}
              >
                Annuller
              </button>
            </motion.div>

            {/* Resultat container */}
            <motion.div
              className={Styles.mobileResultsContainer}
              variants={mobileResultsAnimation}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={mobileResultsAnimation.transition}
            >
              <div className={Styles.mobileResultsScroll}>
                {isLoading && (
                  <div className={Styles.loadingState}>
                    <div className={Styles.loadingSpinner} />
                    <span>Søger...</span>
                  </div>
                )}
                {!isLoading && searchTerm.length >= 2 && !hasResults && (
                  <div className={Styles.emptyState}>
                    <Search size={32} strokeWidth={1.5} />
                    <span>Ingen resultater for "{searchTerm}"</span>
                  </div>
                )}
                {!isLoading && searchTerm.length < 2 && (
                  <div className={Styles.hintState}>
                    <Search size={32} strokeWidth={1.5} />
                    <span>Skriv mindst 2 tegn for at søge</span>
                  </div>
                )}
                {!isLoading && hasResults && renderResults()}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
