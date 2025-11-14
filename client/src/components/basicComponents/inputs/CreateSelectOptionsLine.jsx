// CreateSelectOptionsLine.jsx
import React from "react";
import { X, Plus } from 'lucide-react';
import styles from "./inputStyles.module.css";

/**
 * @param {Object} props
 * @param {string} props.label
 * @param {string} [props.description]
 * @param {string[]} props.value - Array of select options
 * @param {string} props.newOptionValue - Current value of the new option input
 * @param {(value: string) => void} props.onNewOptionChange - Callback when new option input changes
 * @param {() => void} props.onAddOption - Callback to add a new option
 * @param {(index: number) => void} props.onRemoveOption - Callback to remove an option by index
 * @param {string} props.name
 */

const CreateSelectOptionsLine = ({ 
    label, 
    description, 
    value = [], 
    newOptionValue,
    onNewOptionChange,
    onAddOption,
    onRemoveOption,
    name 
}) => {
    return (
        <div className={styles.selectOptionsContainer}>
            <label htmlFor={name}>
                {label}
                {description && <p>{description}</p>}
            </label>
            <div className={styles.selectOptionsList}>
                {value.map((option, index) => (
                    <div key={index} className={styles.selectOptionItem}>
                        <span>{option}</span>
                        <X className={styles.removeIcon} onClick={() => onRemoveOption(index)} />
                    </div>
                ))}
            </div>
            <div className={styles.addOptionContainer}>
                <input
                    type="text"
                    value={newOptionValue}
                    onChange={(e) => onNewOptionChange(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), onAddOption())}
                    placeholder="Tilføj valg..."
                    className={styles.addOptionInput}
                />
                <button type="button" onClick={onAddOption} className={styles.addOptionButton}>
                    <Plus /> Tilføj
                </button>
            </div>
        </div>
    );
};

export default CreateSelectOptionsLine;

