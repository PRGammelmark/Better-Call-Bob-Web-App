// SettingsButtons.jsx
import React from "react";
import Styles from "./SettingsButtons.module.css";
import SwitcherStyles from "../../../pages/Switcher.module.css";
import { ChevronRight } from 'lucide-react'
import NumberPicker from "../inputs/NumberPicker.jsx";

const SettingsButtons = ({ items = [] }) => {
  return (
    <div className={Styles.container}>
      {items.map((item, idx) => (
        <div
          key={item.key || `${item.title}-${idx}`}
          className={`${Styles.row} ${item.input ? Styles.inputLine : ""} ${item.type === "numberPicker" ? Styles.numberPickerRow : ""}`}
          onClick={!item.input && !item.switch ? item.onClick : undefined}
          style={{ cursor: item.onClick && !item.input && !item.switch ? "pointer" : "default" }}
        >
          {item.type === "numberPicker" ? (
            // Special layout for numberPicker - header with button, wheel expands below
            <div className={Styles.numberPickerWrapper}>
              <div className={Styles.numberPickerHeader}>
                <div className={Styles.iconAndTitleDiv}>
                  {item.icon ? <span className={Styles.iconSpan}>{item.icon}</span> : ""}
                  <div className={Styles.titleContainer}>
                    <h3>{item.title}</h3>
                    {item.subtitle && <span className={Styles.subtitle}>{item.subtitle}</span>}
                  </div>
                </div>
              </div>
              {/* NumberPicker returns Fragment: valueButton + wheelContainer */}
              <NumberPicker
                value={item.value ?? 0}
                onChange={item.onChange}
                min={item.min ?? 0}
                max={item.max ?? 100}
                step={item.step ?? 0.5}
                placeholder={item.placeholder}
              />
            </div>
          ) : (
            <>
          <div className={Styles.iconAndTitleDiv}>
            {item.icon ? <span className={Styles.iconSpan}>{item.icon}</span> : ""}
            <div className={Styles.titleContainer}>
              <h3>{item.title}</h3>
              {item.subtitle && <span className={Styles.subtitle}>{item.subtitle}</span>}
            </div>
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

          {item.switch ? (
            <div className={SwitcherStyles.checkboxContainer} style={{ marginTop: 0 }} onClick={(e) => e.stopPropagation()}>
                  <label 
                    htmlFor={item.key || `switch-${idx}`} 
                    style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                <input
                  type="checkbox"
                      id={item.key || `switch-${idx}`}
                      name={item.key || `switch-${idx}`}
                  className={SwitcherStyles.checkboxInput}
                  checked={item.checked ?? false}
                  onChange={(e) => {
                    e.stopPropagation()
                    item.onChange?.(e.target.checked)
                  }}
                      onClick={(e) => e.stopPropagation()}
                />
                <div className={`${SwitcherStyles.switch} ${item.checked ? SwitcherStyles.switchActive : ''}`}>
                  <div className={SwitcherStyles.switchThumb}></div>
                </div>
              </label>
            </div>
          ) : item.input ? (
            <div className={Styles.inputContainer}>
            {item.type === "select" ? (
              <select
                value={item.value ?? ""}
                onChange={(e) => item.onChange?.(e.target.value)}
                className={Styles.inputField}
              >
                      {item.placeholder && (
                        <option value="" disabled>
                          {item.placeholder}
                        </option>
                      )}
                {item.options?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={item.type || "text"}
                      value={item.value ?? ""}
                onKeyDown={(e) => {
                  if (item.type === "number") {
                    const input = e.target;
                    const currentValue = String(item.value ?? "");
                    if (currentValue === "0" && /^[1-9]$/.test(e.key)) {
                      e.preventDefault();
                      const newValue = e.key;
                      const v = Number(newValue);
                      const finalValue = item.max !== undefined ? Math.min(v, item.max) : v;
                      const clampedValue = item.min !== undefined ? Math.max(finalValue, item.min) : finalValue;
                      item.onChange?.(clampedValue);
                      setTimeout(() => {
                        input.setSelectionRange(1, 1);
                      }, 0);
                    }
                  }
                }}
                onChange={(e) => {
                  if (item.type === "number") {
                    let inputValue = e.target.value;
                    if (inputValue.length > 1 && /^0[1-9]/.test(inputValue)) {
                      inputValue = inputValue.replace(/^0+/, '');
                    }
                    let v = Number(inputValue);
                    if (inputValue === '' || isNaN(v)) {
                      v = item.min ?? 0;
                    } else {
                      if (item.min !== undefined) v = Math.max(v, item.min);
                      if (item.max !== undefined) v = Math.min(v, item.max);
                    }
                    item.onChange?.(v);
                  } else {
                    item.onChange?.(e.target.value);
                  }
                }}
                min={item.min}
                max={item.max}
                onBlur={item.onBlur}
                placeholder={item.placeholder}
                      className={`${Styles.inputField} ${item.type === "date" ? Styles.dateInput : ""}`}
                      lang={item.type === "date" ? "da" : undefined}
              />
            )}
            <span className={Styles.postfix}>{item.postfix ? (" " + item.postfix) : ""}</span>
            <span className={Styles.chevronOpenIndicator}>{item.onClick && <ChevronRight height={18}/>}</span>
            </div>
          ) : item.fileUpload ? (
            <div className={Styles.fileUploadContainer}>
              {item.preview && (
                <img src={item.preview} alt="Preview" className={Styles.filePreview} />
              )}
              <label className={Styles.fileUploadButton}>
                <input
                  type="file"
                  accept={item.accept || "*/*"}
                  onChange={item.onFileChange}
                  disabled={item.isUploading}
                  style={{ display: 'none' }}
                />
                {item.isUploading ? 'Uploader...' : item.preview ? item.uploadButtonText || 'Skift' : item.uploadButtonText || 'Upload'}
              </label>
              {item.onClick && <ChevronRight height={16}/>}
            </div>
          ) : item.value ? (
            <div className={Styles.itemValue}>
              {item.prefix ? " " + item.prefix : ""}
              {item.value}
              {item.postfix}
              {item.onClick && <ChevronRight height={16}/>}
            </div>
          ) : null}
            </>
          )}
          
          {item.customContent && (
            <div className={Styles.customContent}>
              {item.customContent}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default SettingsButtons;
