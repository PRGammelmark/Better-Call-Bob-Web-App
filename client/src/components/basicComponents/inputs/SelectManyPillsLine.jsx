// SelectManyPillsLine.jsx
import React from "react";
import styles from "./inputStyles.module.css";

/**
 * @param {Object} props
 * @param {string} props.label
 * @param {string} [props.description]
 * @param {string[]} props.options - Array of option strings to display as pills
 * @param {string[]} props.value - Array of selected option strings
 * @param {(option: string) => void} props.onToggle - Callback when an option is toggled
 * @param {string} props.name
 */

const SelectManyPillsLine = ({ label, description, options = [], value = [], onToggle, name }) => {
  return (
    <div className={styles.pillsContainer}>
      <label htmlFor={name}>
        {label}
        {description && <p>{description}</p>}
      </label>
      <div className={styles.pillsList}>
        {options.map((option) => (
          <div
            key={option}
            className={`${styles.pill} ${value.includes(option) ? styles.pillSelected : ""}`}
            onClick={() => onToggle(option)}
          >
            {option}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SelectManyPillsLine;

