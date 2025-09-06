import { useOutlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';

const AnimatedOutlet = () => {
  const location = useLocation();
  const outlet = useOutlet();

  return (
    <AnimatePresence mode="sync">
      {outlet && (
        <motion.div
          key={location.pathname} // <- dette er vigtigt
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0, transition: {duration: 0.2, delay: 0.7} }}
          exit={{ opacity: 0, x: -150, transition: {duration: 0.3} }}
        //   style={{ height: '100%' }}
        >
          {outlet}
          <div style={{height: 100}}>
            {/* This extra div gives some padding to the bottom of the viewport due to a bug introduced by using useOutlet */}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AnimatedOutlet;