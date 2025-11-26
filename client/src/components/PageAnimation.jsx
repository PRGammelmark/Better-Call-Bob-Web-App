import { motion, AnimatePresence } from "framer-motion";

// Define the animation variants with a transition duration
// const animation = {
//   initial: { opacity: 0, x: 30 },
//   animate: { opacity: 1, x: 0 },
//   exit: { opacity: 0, x: -30 }
// };

const animation = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
};

// The PageAnimation component
const PageAnimation = ({ children }) => {
  return (
    <motion.div
      variants={animation}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {children}
    </motion.div>
  );
};

export default PageAnimation;