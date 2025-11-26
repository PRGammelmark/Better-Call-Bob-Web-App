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
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: {duration: 0.15, delay: 0.6} }}
          exit={{ opacity: 0, transition: {duration: 0.25} }}
          className={ContentCSS.animatedOutlet}
          onAnimationComplete={() => {
            if (contentRef?.current) {
              contentRef.current.scrollTo({ top: 0, behavior: 'instant' });
            }
          }}
        >
          {outlet}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AnimatedOutlet;