// InputsContainer.jsx
import React from "react";
import styles from "./inputStyles.module.css";

const InputsContainer = ({ children }) => {
  return (
    <div className={styles.inputLinesContainer}>
        {children}
    </div>
  )
};

export default InputsContainer;
