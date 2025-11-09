import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import OpgaveSidebar from "./OpgaveSidebar";
import Styles from "./MobileFilterModal.module.css";

const MobileFilterModal = ({ isOpen, onClose, activeTab, onFilterChange, onSortChange, filters, sortOption }) => {
  const mobileAnimation = {
    initial: { opacity: 1, x: "100%" },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 1, x: "100%" },
    transition: { type: "spring", stiffness: 300, damping: 34 }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className={Styles.backdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            onTouchStart={(e) => {
              // Only close if touching the backdrop, not if touch started on modal
              if (e.target === e.currentTarget) {
                onClose();
              }
            }}
          />
          
          {/* Slide-in panel */}
          <motion.div
            className={Styles.modal}
            variants={mobileAnimation}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={mobileAnimation.transition}
            onClick={(e) => e.stopPropagation()}
            // onTouchStart={(e) => e.stopPropagation()}
          >
            {/* <div className={Styles.header}>
              <h2 className={Styles.title}>Filtrer & Sorter</h2>
              <button onClick={onClose} className={Styles.closeButton}>
                <X size={24} />
              </button>
            </div> */}
            <div className={Styles.content}>
              <div className={Styles.sidebarWrapper}>
                <OpgaveSidebar
                  activeTab={activeTab}
                  onFilterChange={onFilterChange}
                  onSortChange={onSortChange}
                  filters={filters}
                  sortOption={sortOption}
                  forceVisible={true}
                />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileFilterModal;

