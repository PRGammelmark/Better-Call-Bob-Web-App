// TimeRangeLine.jsx
import React from "react";
import styles from "./inputStyles.module.css";

/**
 * @param {Object} props
 * @param {string} props.label
 * @param {string} [props.description]
 * @param {string} props.timeFrom - Time value in HH:mm format
 * @param {string} props.timeTo - Time value in HH:mm format
 * @param {(value: string) => void} props.onTimeFromChange
 * @param {(value: string) => void} props.onTimeToChange
 * @param {string} props.name
 * @param {boolean} [props.required]
 */

const TimeRangeLine = ({ label, description, timeFrom, timeTo, onTimeFromChange, onTimeToChange, name, required }) => {
  return (
    <div className={styles.inputLine}>
      <label htmlFor={name}>
        {label}
        {description && <p>{description}</p>}
      </label>
      <div className={styles.timeRangeWrapper}>
        <input
          id={`${name}-from`}
          name={`${name}-from`}
          type="time"
          value={timeFrom || ""}
          onChange={(e) => onTimeFromChange(e.target.value)}
          required={required}
          className={styles.timeInput}
        />
        <span className={styles.timeSeparator}>–</span>
        <input
          id={`${name}-to`}
          name={`${name}-to`}
          type="time"
          value={timeTo || ""}
          onChange={(e) => onTimeToChange(e.target.value)}
          required={required}
          className={styles.timeInput}
        />
      </div>
    </div>
  );
};

export default TimeRangeLine;

