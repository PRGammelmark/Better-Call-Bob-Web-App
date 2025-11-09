import React, { useState, useRef, useEffect } from 'react';
import Styles from './popUpMenu.module.css';
import { Ellipsis, X } from 'lucide-react';

const PopUpMenu = ({ actions = [], buttonSize = 40, buttonClassName, menuClassName, text, icon, direction = 'right', variant = 'white' }) => {
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
      <button className={`${Styles.popUpMenuButton} ${text ? Styles.withText : ''} ${variant === 'grey' ? Styles.greyButton : ''} ${open ? Styles.buttonOnMenuOpen : ""} ${buttonClassName}`} onClick={handleToggle}>
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
        <div ref={menuRef} className={`${Styles.popUpMenu} ${direction === 'left' ? Styles.alignLeft : Styles.alignRight} ${variant === 'grey' ? Styles.menuTight : ''} ${closing ? Styles.closing : Styles.opening} ${menuClassName}`}>
          {actions.map((action, index) => (
            <button key={index} onClick={() => { action.onClick(); handleClose(); }}>
              {action.icon && <span className={Styles.popUpMenuInnerIcon}>{action.icon}</span>}
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default PopUpMenu;
