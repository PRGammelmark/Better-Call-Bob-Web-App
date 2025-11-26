// TimeLine.jsx
import React from "react";
import styles from "./inputStyles.module.css";

/**
 * @param {Object} props
 * @param {string} props.label
 * @param {string} [props.description]
 * @param {string} props.value - Time value in HH:mm format
 * @param {(value: string) => void} props.onChange
 * @param {string} props.name
 * @param {boolean} [props.required]
 * @param {string} [props.min] - Minimum time in HH:mm format
 * @param {string} [props.max] - Maximum time in HH:mm format
 */

const TimeLine = ({ label, description, value, onChange, required, name, min, max }) => {
  return (
    <div className={styles.inputLine}>
      <label htmlFor={name}>
        {label}
        {description && <p>{description}</p>}
      </label>
      <input
        id={name}
        name={name}
        type="time"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        min={min}
        max={max}
      />
    </div>
  );
};

export default TimeLine;

