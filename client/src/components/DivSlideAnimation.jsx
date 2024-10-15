import { motion, AnimatePresence } from "framer-motion"

const animation = {
    initial: {opacity: 0, x: 100},
    animate: {opacity: 1, x: 0},
    exit: {opacity: 0, x: -100}
}

const DivSlideAnimation = ({children}) => {
  return (
    <AnimatePresence>
        <motion.div variants={animation} initial="initial" animate="animate" exit="exit">
            {children}
        </motion.div>
    </AnimatePresence>
  )
}

export default DivSlideAnimation
