// SliderLine.jsx
import React from "react";
import styles from "./inputStyles.module.css";

const SliderLine = ({ 
  label, 
  description, 
  name, 
  value,
  readableValue, 
  onChange, 
  min = 0, 
  max = 100, 
  step = 1 
}) => {
  return (
    <div className={styles.inputLine} style={{gap: "20px"}}>
  <label htmlFor={name}>
    {label}
    {description && <p>{description}</p>}
  </label>
  <div className={styles.sliderWrapper}>
    <input
      type="range"
      id={name}
      name={name}
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className={styles.slider}
    />
    <span className={styles.sliderValue}>{readableValue || value}</span>
  </div>
</div>
  );
};

export default SliderLine;
