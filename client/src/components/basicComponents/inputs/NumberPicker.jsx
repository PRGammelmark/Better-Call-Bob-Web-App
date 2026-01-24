// NumberPicker.jsx
import React, { useState, useEffect, useRef } from 'react';
import Styles from './NumberPicker.module.css';

const MOBILE_BREAKPOINT = 750;

const NumberPicker = ({ 
  value, 
  onChange, 
  min = 0, 
  max = 100, 
  step = 0.5,
  placeholder = "0"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value !== undefined && value !== null ? value : 0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < MOBILE_BREAKPOINT);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const wheelRef = useRef(null);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const scrollTimeoutRef = useRef(null);
  const isScrollingRef = useRef(false);

  // Listen for window resize to update isMobile
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Constants for scroll calculations
  const ITEM_HEIGHT = 50;
  const WHEEL_HEIGHT = 250;
  const CSS_PADDING = 100; // padding: 100px 0 in CSS
  const SPACER_COUNT = 2; // 2 spacer divs at top
  const TOTAL_OFFSET = CSS_PADDING + (SPACER_COUNT * ITEM_HEIGHT); // 200px total before first item
  const CENTER_POSITION = WHEEL_HEIGHT / 2; // 125px - center of visible area

  // Generate numbers array
  const numbers = [];
  for (let i = min; i <= max; i += step) {
    numbers.push(parseFloat(i.toFixed(step < 1 ? 2 : 0)));
  }

  // Calculate scroll position to center an item at given index
  const getScrollPositionForIndex = (index) => {
    const itemCenterPosition = TOTAL_OFFSET + (index * ITEM_HEIGHT) + (ITEM_HEIGHT / 2);
    return itemCenterPosition - CENTER_POSITION;
  };

  // Calculate which index is centered at given scroll position
  const getIndexFromScrollPosition = (scrollTop) => {
    const index = Math.round((scrollTop + CENTER_POSITION - TOTAL_OFFSET - ITEM_HEIGHT / 2) / ITEM_HEIGHT);
    return Math.max(0, Math.min(index, numbers.length - 1));
  };

  // Update selected value when value prop changes
  useEffect(() => {
    if (value !== undefined && value !== null) {
      setSelectedValue(value);
    }
  }, [value]);

  // Lock scroll on modal/body when bottom sheet is open on mobile
  useEffect(() => {
    if (isMobile && isOpen) {
      // Find all scrollable ancestors and lock them
      const scrollableElements = [];
      let element = containerRef.current?.parentElement;
      
      while (element) {
        const style = window.getComputedStyle(element);
        const overflowY = style.overflowY;
        if (overflowY === 'auto' || overflowY === 'scroll') {
          scrollableElements.push({
            element,
            originalOverflow: element.style.overflow
          });
          element.style.overflow = 'hidden';
        }
        element = element.parentElement;
      }
      
      // Also lock body
      const originalBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      
      return () => {
        // Restore all scrollable elements
        scrollableElements.forEach(({ element, originalOverflow }) => {
          element.style.overflow = originalOverflow;
        });
        document.body.style.overflow = originalBodyOverflow;
      };
    }
  }, [isMobile, isOpen]);

  // Scroll to selected value when opened
  useEffect(() => {
    if (isOpen && wheelRef.current && !isScrollingRef.current) {
      requestAnimationFrame(() => {
        if (!wheelRef.current) return;
        
        const currentValue = selectedValue !== undefined && selectedValue !== null ? selectedValue : 0;
        const index = numbers.findIndex(n => Math.abs(n - currentValue) < step / 2);
        
        if (index >= 0) {
          const scrollPosition = getScrollPositionForIndex(index);
          wheelRef.current.scrollTop = Math.max(0, scrollPosition);
        } else {
          wheelRef.current.scrollTop = Math.max(0, getScrollPositionForIndex(0));
        }
      });
    }
  }, [isOpen]);

  const handleButtonClick = (e) => {
    e.stopPropagation();
    
    if (isMobile) {
      // Mobile: toggle wheel picker
      const newIsOpen = !isOpen;
      setIsOpen(newIsOpen);
      
      if (newIsOpen && (selectedValue === undefined || selectedValue === null || selectedValue === "")) {
        setSelectedValue(0);
        onChange?.(0);
      }
    } else {
      // Desktop: switch to edit mode
      setIsEditing(true);
      setEditValue(selectedValue !== undefined && selectedValue !== null ? String(selectedValue) : "");
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 0);
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value.replace(',', '.');
    if (/^[0-9]*\.?[0-9]*$/.test(val) || val === "") {
      setEditValue(val);
    }
  };

  const handleInputBlur = () => {
    setIsEditing(false);
    let numValue = parseFloat(editValue);
    if (isNaN(numValue) || editValue === "") {
      numValue = min;
    }
    // Clamp to min/max
    numValue = Math.max(min, Math.min(max, numValue));
    // Round to nearest step
    numValue = Math.round(numValue / step) * step;
    numValue = parseFloat(numValue.toFixed(step < 1 ? 2 : 0));
    
    setSelectedValue(numValue);
    onChange?.(numValue);
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      inputRef.current?.blur();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditValue("");
    }
  };

  const handleWheelScroll = (e) => {
    if (!wheelRef.current) return;
    
    isScrollingRef.current = true;
    
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = setTimeout(() => {
      handleWheelScrollEnd();
    }, 100);
  };

  const handleWheelScrollEnd = () => {
    if (!wheelRef.current) return;
    
    isScrollingRef.current = false;
    
    const scrollTop = wheelRef.current.scrollTop;
    const centeredIndex = getIndexFromScrollPosition(scrollTop);
    const targetValue = numbers[centeredIndex];
    
    // Only update value, CSS scroll-snap handles the positioning
    if (targetValue !== selectedValue) {
      setSelectedValue(targetValue);
      onChange?.(targetValue);
    }
  };

  const [isClosing, setIsClosing] = useState(false);

  const closePicker = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, 300); // Match animation duration
  };

  const handleItemClick = (num, index) => {
    if (wheelRef.current) {
      const scrollPosition = getScrollPositionForIndex(index);
      wheelRef.current.scrollTo({
        top: Math.max(0, scrollPosition),
        behavior: 'smooth'
      });
    }
    setSelectedValue(num);
    onChange?.(num);
    
    // Close picker after selecting
    setTimeout(() => {
      closePicker();
    }, 200);
  };

  const handleConfirm = () => {
    closePicker();
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      closePicker();
    }
  };

  // Get currently centered index for visual highlighting
  const [centeredIndex, setCenteredIndex] = useState(0);
  
  useEffect(() => {
    if (isOpen && wheelRef.current) {
      const handleScroll = () => {
        const scrollTop = wheelRef.current.scrollTop;
        const newCenteredIndex = getIndexFromScrollPosition(scrollTop);
        setCenteredIndex(newCenteredIndex);
      };
      
      wheelRef.current.addEventListener('scroll', handleScroll);
      handleScroll();
      
      return () => {
        if (wheelRef.current) {
          wheelRef.current.removeEventListener('scroll', handleScroll);
        }
      };
    }
  }, [isOpen, numbers.length]);

  return (
    <>
      {/* Value button / input - clickable to toggle picker (mobile) or edit (desktop) */}
      {isEditing && !isMobile ? (
        <input
          ref={inputRef}
          type="text"
          inputMode="decimal"
          className={Styles.valueInput}
          value={editValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={handleInputKeyDown}
          placeholder={placeholder}
        />
      ) : (
        <div 
          className={Styles.valueButton}
          onClick={handleButtonClick}
          ref={containerRef}
        >
          {selectedValue !== undefined && selectedValue !== null && selectedValue !== "" 
            ? selectedValue 
            : placeholder}
        </div>
      )}
      
      {/* Bottom sheet wheel picker - only on mobile */}
      {isMobile && isOpen && (
        <div 
          className={`${Styles.bottomSheetOverlay} ${isClosing ? Styles.bottomSheetOverlayClosing : ''}`}
          onClick={handleOverlayClick}
        >
          <div className={`${Styles.bottomSheet} ${isClosing ? Styles.bottomSheetClosing : ''}`}>
            {/* Header */}
            <div className={Styles.bottomSheetHeader}>
              <button 
                type="button"
                className={Styles.bottomSheetCancel}
                onClick={closePicker}
              >
                Annuller
              </button>
              <span className={Styles.bottomSheetTitle}>Vælg værdi</span>
              <button 
                type="button"
                className={Styles.bottomSheetConfirm}
                onClick={handleConfirm}
              >
                Bekræft
              </button>
            </div>
            
            {/* Wheel picker */}
          <div className={Styles.wheelMask}>
            {/* Center indicator */}
            <div className={Styles.centerIndicator}></div>
            <div 
              className={Styles.wheel}
              ref={wheelRef}
              onScroll={handleWheelScroll}
            >
              {/* Spacer items to allow first item to be centered */}
              <div className={Styles.wheelSpacer}></div>
              <div className={Styles.wheelSpacer}></div>
              
              {numbers.map((num, index) => (
                <div
                  key={index}
                  className={`${Styles.wheelItem} ${centeredIndex === index ? Styles.wheelItemCentered : ''} ${selectedValue === num ? Styles.wheelItemSelected : ''}`}
                  onClick={() => handleItemClick(num, index)}
                >
                  {num}
                </div>
              ))}
              
              {/* Spacer items to allow last item to be centered */}
              <div className={Styles.wheelSpacer}></div>
              <div className={Styles.wheelSpacer}></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NumberPicker;
