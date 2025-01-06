import React, { useState, useEffect } from "react";
import ReactDom from "react-dom";
import ModalStyles from "./Modal.module.css";
import { AnimatePresence, motion } from "framer-motion";

// Define animations for overlay and modal separately
const overlayAnimation = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

// Define animations for desktop and mobile
const desktopAnimation = {
    initial: { opacity: 0, transform: "translate(-50%, -40%)" }, // Start slightly above center
    animate: { opacity: 1, transform: "translate(-50%, -50%)" }, // Move to center
    exit: { opacity: 0, transform: "translate(-50%, -50%)" }, // Move slightly below center
  };
  
  const mobileAnimation = {
    initial: { opacity: 0, transform: "translate(-50%, 100%)" }, // Start off-screen
    animate: { opacity: 1, transform: "translate(-50%, 0%)" }, // Slide to center
    exit: { opacity: 0, transform: "translate(-50%, 100%)" }, // Slide off-screen
  };
  

const Modal = ({ children, trigger, setTrigger }) => {

    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
      const handleResize = () => {
        setIsMobile(window.innerWidth <= 750); // Adjust 750px to your desired breakpoint
      };
  
      // Run the resize handler initially
      handleResize();
  
      // Add event listener on window resize
      window.addEventListener("resize", handleResize);
  
      // Clean up listener on component unmount
      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }, []);

  return ReactDom.createPortal(
    <AnimatePresence>
      {trigger && (
        <motion.div
          className={ModalStyles.overlay}
          onClick={() => setTrigger(false)}
          initial="initial"
          animate="animate"
          exit="exit"
          variants={overlayAnimation}
        >
          <motion.div
            className={ModalStyles.modal}
            onClick={(e) => e.stopPropagation()}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={isMobile ? mobileAnimation : desktopAnimation}
            transition={{ duration: 0.8 }} // Added transition duration
          >
            <button
              onClick={() => setTrigger(false)}
              className={ModalStyles.lukModal}
            >
              -
            </button>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.getElementById("portal")
  );
};

export default Modal;