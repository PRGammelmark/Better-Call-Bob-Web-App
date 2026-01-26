import React, { useState, useRef, useEffect } from 'react';
import Styles from './popUpMenu.module.css';
import SwitcherStyles from '../../pages/Switcher.module.css';
import { Ellipsis, X } from 'lucide-react';

const PopUpMenu = ({ actions = [], buttonSize = 40, buttonClassName, menuClassName, text, icon, direction = 'right', variant = 'white', openAbove = false }) => {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const menuRef = useRef();
  const containerRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Ignore events originating inside the container (button or menu)
      if (containerRef.current && containerRef.current.contains(event.target)) return;
      handleClose();
    };
    document.addEventListener('pointerdown', handleClickOutside);
    return () => {
      document.removeEventListener('pointerdown', handleClickOutside);
    };
  }, []);

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      setOpen(false);
      setClosing(false);
    }, 200);
  };

  // Handle toggle
  const handleToggle = () => {
    if (open) handleClose();
    else setOpen(true);
  };

  return (
    <div
      ref={containerRef}
      className={Styles.popUpMenuContainer}
      style={{ width: text ? 'auto' : buttonSize, height: text ? 'auto' : buttonSize }}
      onClick={e => e.stopPropagation()}
      onPointerDown={e => e.stopPropagation()}
    >
      <button type="button" className={`${Styles.popUpMenuButton} ${text ? Styles.withText : ''} ${variant === 'grey' ? Styles.greyButton : ''} ${open ? Styles.buttonOnMenuOpen : ""} ${buttonClassName}`} onClick={handleToggle}>
        {!text && <X className={`${Styles.popUpMenuIcon} ${open ? Styles.iconClose : ''}`} />}
        {text ? (
          <span className={`${Styles.popUpMenuText ?? ''} ${open ? '' : Styles.iconOpen}`}>
            {icon && <span className={Styles.buttonIcon}>{icon}</span>}
            {text}
          </span>
        ) : (
          <Ellipsis className={`${Styles.popUpMenuIcon} ${open ? '' : Styles.iconOpen}`} />
        )}
      </button>

      {open && (
        <div ref={menuRef} className={`${Styles.popUpMenu} ${direction === 'left' ? Styles.alignLeft : Styles.alignRight} ${variant === 'grey' ? Styles.menuTight : ''} ${openAbove ? Styles.openAbove : ''} ${closing ? Styles.closing : Styles.opening} ${menuClassName}`}>
          {actions.map((action, index) => (
            action.switch ? (
              <div 
                key={index} 
                className={Styles.switchMenuItem}
                onTouchStart={(e) => {
                  // Prevent menu from closing when touching switch area
                  e.stopPropagation();
                }}
                onClick={(e) => {
                  // Prevent menu from closing when clicking switch area
                  e.stopPropagation();
                }}
              >
                <span className={Styles.switchMenuLabel}>{action.label}</span>
                <div 
                  className={SwitcherStyles.checkboxContainer} 
                  style={{ marginTop: 0 }}
                  onTouchStart={(e) => {
                    e.stopPropagation();
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <label 
                    htmlFor={`popup-switch-${index}`} 
                    style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                    onTouchStart={(e) => {
                      // Allow touch events to work properly on mobile
                      e.stopPropagation();
                    }}
                    onClick={(e) => {
                      // Prevent menu from closing when clicking switch
                      e.stopPropagation();
                    }}
                  >
                    <input
                      type="checkbox"
                      id={`popup-switch-${index}`}
                      name={`popup-switch-${index}`}
                      className={SwitcherStyles.checkboxInput}
                      checked={action.checked ?? false}
                      onChange={(e) => {
                        e.stopPropagation();
                        action.onChange?.(e.target.checked);
                      }}
                      onTouchStart={(e) => {
                        // Ensure touch events work on mobile
                        e.stopPropagation();
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    />
                    <div className={`${SwitcherStyles.switch} ${action.checked ? SwitcherStyles.switchActive : ''}`}>
                      <div className={SwitcherStyles.switchThumb}></div>
                    </div>
                  </label>
                </div>
              </div>
            ) : (
              <button type="button" key={index} onClick={() => { action.onClick(); handleClose(); }}>
              {action.icon && <span className={Styles.popUpMenuInnerIcon}>{action.icon}</span>}
              <span>{action.label}</span>
            </button>
            )
          ))}
        </div>
      )}
    </div>
  );
};

export default PopUpMenu;
