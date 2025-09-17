// SelectLine.jsx
import React from "react";
import styles from "./inputStyles.module.css";

const SelectLine = ({ 
  label, 
  description, 
  name, 
  value, 
  onChange, 
  options = [],
  placeholder = " " 
}) => {

  return (
    <div className={styles.inputLine}>
      <label htmlFor={name}>
        {label}
        {description && <p>{description}</p>}
      </label>
      <select
        id={name}
        name={name}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
      >

        <option value="" disabled>
          {placeholder}
        </option>
        
        {options.map((opt, i) =>
          typeof opt === "string" ? (
            <option key={i} value={opt}>
              {opt}
            </option>
          ) : (
            <option key={i} value={opt.value}>
              {opt.label}
            </option>
          )
        )}
      </select>
    </div>
  );
};

export default SelectLine;
