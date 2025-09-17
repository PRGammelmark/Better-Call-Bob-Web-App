import React, { useState, useEffect, forwardRef } from "react";
import ReactDom from "react-dom";
import ModalStyles from "./Modal.module.css";
import ContentStyles from "./Content.module.css"
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
  initial: { transform: "translate(-50%, -40%)" }, // Start slightly above center
  animate: { transform: "translate(-50%, -50%)" }, // Move to center
  exit: { transform: "translate(-50%, -50%)" }, // Move slightly below center
};
  
const mobileAnimation = {
  initial: { y: 500, x: "-50%" },
  animate: { y: 0, x: "-50%" },
  exit: { y: 500, x: "-50%" }
}

const Modal = forwardRef(({ children, trigger, setTrigger, onClose, closeIsBackButton, setBackFunction }, ref) => {

    const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 750);


    // // Prevent scrolling of the background when modal is open
    // useEffect(() => {
    //   const contentElement = document.querySelector(`${ContentStyles.content}`); // Select the element
      
    //   const preventScroll = (e) => {
    //     e.preventDefault();
    //     e.stopPropagation();
    //     return false;
    //   };
    
    //   if (trigger) {
    //     document.body.style.overflow = "hidden";
    //     document.body.style.touchAction = "none";
    
    //     if (contentElement) {
    //       contentElement.style.overflow = "hidden";
    //       contentElement.style.touchAction = "none";
          
    //       // Fully block scroll behavior
    //       contentElement.addEventListener("wheel", preventScroll, { passive: false });
    //       contentElement.addEventListener("touchmove", preventScroll, { passive: false });
    //     }
    //   } else {
    //     document.body.style.overflow = "";
    //     document.body.style.touchAction = "";
    
    //     if (contentElement) {
    //       contentElement.style.overflow = "";
    //       contentElement.style.touchAction = "";
          
    //       // Remove listeners when modal closes
    //       contentElement.removeEventListener("wheel", preventScroll);
    //       contentElement.removeEventListener("touchmove", preventScroll);
    //     }
    //   }
    
    //   return () => {
    //     document.body.style.overflow = "";
    //     document.body.style.touchAction = "";
    
    //     if (contentElement) {
    //       contentElement.style.overflow = "";
    //       contentElement.style.touchAction = "";
    //       contentElement.removeEventListener("wheel", preventScroll);
    //       contentElement.removeEventListener("touchmove", preventScroll);
    //     }
    //   };
    // }, [trigger]);
    
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
    <>
    <AnimatePresence initial={false} mode="wait">
      {trigger && (
        <motion.div
          className={ModalStyles.overlay}
          onClick={() => {
            setTrigger(false)
            onClose && onClose()
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
            transition={{duration: 0.3}}
          >
            <button
              onClick={() => {
                if(!closeIsBackButton){
                  setTrigger(false)
                  onClose()
                } else {
                  setBackFunction(false)
                }
              }}
              className={ModalStyles.lukModal}
            >
              <img src={CloseIcon} alt="Luk modal" />
            </button>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </>,
    document.getElementById("portal")
  );
});

export default Modal;