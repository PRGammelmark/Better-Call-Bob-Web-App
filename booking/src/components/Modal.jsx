import React, { useState, useEffect, forwardRef } from "react";
import ReactDom from "react-dom";
import ModalStyles from "./Modal.module.css";
import CloseIcon from "../assets/closeIcon.svg";
import { AnimatePresence, motion } from "framer-motion";

// Define animations for overlay and modal separately
const overlayAnimation = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

// Define animations for desktop and mobile
const desktopAnimation = {
  initial: { transform: "translate(-50%, -40%)" },
  animate: { transform: "translate(-50%, -50%)" },
  exit: { transform: "translate(-50%, -50%)" },
};
  
const mobileAnimation = {
  initial: { y: 500, x: "-50%" },
  animate: { y: 0, x: "-50%" },
  exit: { y: 500, x: "-50%" }
}

const Modal = forwardRef(({ children, trigger, setTrigger, onClose }, ref) => {
    const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 750);
    
    useEffect(() => {
      const handleResize = () => {
        setIsMobile(window.innerWidth <= 750);
      };
  
      handleResize();
      window.addEventListener("resize", handleResize);
  
      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }, []);

  const portalElement = document.getElementById("portal") || document.body;

  return ReactDom.createPortal(
    <>
    <AnimatePresence initial={false} mode="wait">
      {trigger && (
          <motion.div
            className={ModalStyles.overlay}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setTrigger(false);
                onClose && onClose();
              }
            }}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={overlayAnimation}
            transition={{duration: 0.2, ease: "easeOut"}}
          >
            <motion.div
              className={ModalStyles.modal}
              ref={ref}
              onClick={(e) => e.stopPropagation()}
              variants={isMobile ? mobileAnimation : desktopAnimation}
              transition={{duration: 0.35, ease: "easeOut"}}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setTrigger(false);
                  onClose && onClose();
                }}
                className={ModalStyles.lukModal}
                type="button"
              >
                <img src={CloseIcon} alt="Luk modal" />
              </button>
              {children}
            </motion.div>
          </motion.div>
      )}
    </AnimatePresence>
    </>,
    portalElement
  );
});

export default Modal;

