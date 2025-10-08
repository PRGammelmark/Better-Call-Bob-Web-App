// SettingsButtons.jsx
import React from "react";
import Styles from "./SettingsButtons.module.css";
import { ChevronRight } from 'lucide-react'

const SettingsButtons = ({ items = [] }) => {
  return (
    <div className={Styles.container}>
      {items.map((item, idx) => (
        <div
          key={idx}
          className={`${Styles.row} ${item.input ? Styles.inputLine : ""}`}
          onClick={!item.input ? item.onClick : undefined}
          style={{ cursor: item.onClick && !item.input ? "pointer" : "default" }}
        >
          <div className={Styles.iconAndTitleDiv}>
            {item.icon ? <span className={Styles.iconSpan}>{item.icon}</span> : ""}
            <h3>{item.title}</h3>
          </div>

          {item.infoBoxes && (
            <div className={Styles.infoBoxes}>
              {item.infoBoxes.map((box, bIdx) => (
                <div key={bIdx} className={Styles.infoBox}>
                  {box.icon && <box.icon height={14} />}
                  {box.text}
                </div>
              ))}
            </div>
          )}

          {item.input ? (
            <div className={Styles.inputContainer}>
            <input
              type={item.type || "text"}
              value={item.value ?? ""}   // fallback til tom streng
              onChange={(e) => {
                if (item.type === "number") {
                  let v = Number(e.target.value);
                  if (isNaN(v)) v = item.min ?? 0;
                  if (item.min !== undefined) v = Math.max(v, item.min);
                  if (item.max !== undefined) v = Math.min(v, item.max);
                  item.onChange?.(v);
                } else {
                  item.onChange?.(e.target.value);
                }
              }}
              min={item.min}
              max={item.max}
              onBlur={item.onBlur}
              placeholder={item.placeholder}
              className={Styles.inputField}

            />
            <span className={Styles.postfix}>{item.postfix ? (" " + item.postfix) : ""}</span>
            <span className={Styles.chevronOpenIndicator}>{item.onClick && <ChevronRight height={18}/>}</span>
            </div>
          ) : item.value ? (
            <div className={Styles.itemValue}>
              {item.prefix ? " " + item.prefix : ""}
              {item.value}
              {item.postfix}
              {item.onClick && <ChevronRight height={16}/>}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
};

export default SettingsButtons;
