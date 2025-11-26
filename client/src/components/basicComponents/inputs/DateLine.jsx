// DateLine.jsx
import React from "react";
import styles from "./inputStyles.module.css";

/**
 * @param {Object} props
 * @param {string} props.label
 * @param {string} [props.description]
 * @param {string} props.value - Date value in YYYY-MM-DD format
 * @param {(value: string) => void} props.onChange
 * @param {string} props.name
 * @param {boolean} [props.required]
 * @param {string} [props.min] - Minimum date in YYYY-MM-DD format
 * @param {string} [props.max] - Maximum date in YYYY-MM-DD format
 */

const DateLine = ({ label, description, value, onChange, required, name, min, max }) => {
  return (
    <div className={styles.inputLine}>
      <label htmlFor={name}>
        {label}
        {description && <p>{description}</p>}
      </label>
      <input
        id={name}
        name={name}
        type="date"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        min={min}
        max={max}
      />
    </div>
  );
};

export default DateLine;

