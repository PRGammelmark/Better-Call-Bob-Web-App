import { useOutlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect } from 'react';
import ContentCSS from './Content.module.css';

const AnimatedOutlet = ({ contentRef}) => {
  const location = useLocation();
  const outlet = useOutlet();

  return (
    <AnimatePresence mode="sync">
      {outlet && (
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, x: 25 }}
          animate={{ opacity: 1, x: 0, transition: {duration: 0.15, delay: 0.6} }}
          exit={{ opacity: 0, x: -150, transition: {duration: 0.3} }}
          className={ContentCSS.animatedOutlet}
          onAnimationComplete={() => {
            if (contentRef?.current) {
              contentRef.current.scrollTo({ top: 0, behavior: 'instant' });
            }
          }}
        >
          {outlet}
          {/* This extra div gives some padding to the bottom of the viewport due to a bug introduced by using useOutlet */}
          {/* <div style={{height: 100}}>
          
          </div> */}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AnimatedOutlet;