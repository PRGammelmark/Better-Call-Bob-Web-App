// SwitchLine.jsx
import React from "react";
import styles from "./inputStyles.module.css";

/**
 * @param {Object} props
 * @param {string} props.label
 * @param {string} [props.description]
 * @param {boolean} props.checked
 * @param {(checked: boolean) => void} props.onChange
 * @param {string} props.name
 */

const SwitchLine = ({ label, description, checked, onChange, name }) => {
  return (
    <div className={styles.inputLine}>
      <label htmlFor={name}>
        {label}
        {description && <p>{description}</p>}
      </label>
      <div className={styles.switchContainer}>
        <label className={styles.switch} htmlFor={name}>
          <input
            type="checkbox"
            id={name}
            name={name}
            className={styles.checkboxInput}
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
          />
          <span className={styles.switchSlider}></span>
        </label>
      </div>
    </div>
  );
};

export default SwitchLine;

