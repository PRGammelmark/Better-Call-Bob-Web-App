// SelectNumberLine.jsx
import React, { useState, useEffect, useRef, useMemo } from "react";
import ReactDOM from "react-dom";
import styles from "./inputStyles.module.css";

/**
 * @param {Object} props
 * @param {string} props.label
 * @param {string} [props.description]
 * @param {string|number} props.value
 * @param {string} props.placeholder
 * @param {(value: string) => void} props.onChange
 * @param {string} props.name
 * @param {boolean} [props.required]
 * @param {number} [props.min]
 * @param {number} [props.max]
 * @param {number} [props.step]
 */

const SelectNumberLine = ({ label, description, value, placeholder, onChange, required, name, min = 0, max = 100, step = 1 }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const listRef = useRef(null);
  const itemRefs = useRef({});

  // Generate numbers array
  const numbers = useMemo(() => {
    const nums = [];
    for (let i = min; i <= max; i += step) {
      nums.push(i);
    }
    return nums;
  }, [min, max, step]);

  // Find current value index
  useEffect(() => {
    const currentValue = Number(value);
    if (!isNaN(currentValue)) {
      const index = numbers.findIndex(n => n === currentValue);
      setSelectedIndex(index >= 0 ? index : null);
    } else {
      setSelectedIndex(null);
    }
  }, [value, numbers]);

  // Calculate dropdown position when it opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      const updatePosition = () => {
        if (inputRef.current) {
          const rect = inputRef.current.getBoundingClientRect();
          setDropdownPosition({
            top: rect.bottom + window.scrollY + 8,
            right: window.innerWidth - rect.right
          });
        }
      };
      
      updatePosition();
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      
      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [isOpen]);


  // Scroll to selected item when dropdown opens
  useEffect(() => {
    if (isOpen && selectedIndex !== null && listRef.current && itemRefs.current[selectedIndex]) {
      const itemElement = itemRefs.current[selectedIndex];
      const listElement = listRef.current;
      const itemTop = itemElement.offsetTop;
      const itemHeight = itemElement.offsetHeight;
      const listHeight = listElement.clientHeight;
      const scrollTop = itemTop - (listHeight / 2) + (itemHeight / 2);
      
      listElement.scrollTo({
        top: scrollTop,
        behavior: 'smooth'
      });
    }
  }, [isOpen, selectedIndex]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is on input or wrapper
      if (inputRef.current && (inputRef.current === event.target || inputRef.current.contains(event.target))) {
        return;
      }
      if (containerRef.current && containerRef.current.contains(event.target)) {
        return;
      }
      
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      // Use mousedown/touchstart to close when open
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('touchstart', handleClickOutside);
      };
    }
  }, [isOpen]);

  const handleInputMouseUp = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isOpen) {
      setIsOpen(true);
    }
  };

  const handleInputTouchEnd = (e) => {
    // Prevent default to avoid keyboard opening on mobile
    e.preventDefault();
    e.stopPropagation();
    if (!isOpen) {
      setIsOpen(true);
    }
  };

  const handleInputFocus = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isOpen) {
      setIsOpen(true);
    }
  };

  const handleNumberSelect = (number) => {
    onChange(String(number));
    setIsOpen(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsOpen(!isOpen);
    } else if (e.key === 'Escape' && isOpen) {
      setIsOpen(false);
    }
    // Prevent any other key input
    if (e.key !== 'Tab' && e.key !== 'Escape') {
      e.preventDefault();
    }
  };

  return (
    <div className={styles.inputLine} ref={containerRef}>
      <label htmlFor={name}>
        {label}
        {description && <p>{description}</p>}
      </label>
      <div className={styles.numberInputWrapper}>
        <input
          ref={inputRef}
          id={name}
          name={name}
          type="text"
          value={value}
          placeholder={placeholder}
          readOnly
          onMouseUp={handleInputMouseUp}
          onTouchEnd={handleInputTouchEnd}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          required={required}
          className={styles.numberInput}
        />
        <div className={styles.numberInputArrow} data-open={isOpen}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
      {isOpen && ReactDOM.createPortal(
        <div 
          className={styles.numberDropdown} 
          ref={dropdownRef}
          style={{
            top: `${dropdownPosition.top}px`,
            right: `${dropdownPosition.right}px`
          }}
        >
          <div className={styles.numberList} ref={listRef}>
            {numbers.map((number, index) => (
              <div
                key={number}
                ref={el => itemRefs.current[index] = el}
                className={`${styles.numberItem} ${selectedIndex === index ? styles.numberItemSelected : ''}`}
                onClick={() => handleNumberSelect(number)}
              >
                {number}
              </div>
            ))}
          </div>
        </div>,
        document.getElementById("portal") || document.body
      )}
    </div>
  );
};

export default SelectNumberLine;

