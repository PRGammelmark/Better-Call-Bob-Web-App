import React, { useState, useRef, useEffect } from 'react';
import Styles from './PopUpMenu.module.css';
import { Ellipsis, X } from 'lucide-react';

const PopUpMenu = ({ actions = [], buttonSize = 40, buttonClassName, menuClassName }) => {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const menuRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        handleClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
    <div className={Styles.popUpMenuContainer} style={{ width: buttonSize, height: buttonSize }}>
      <button className={`${Styles.popUpMenuButton} ${buttonClassName}`} onClick={handleToggle}>
        <X className={`${Styles.popUpMenuIcon} ${open ? Styles.iconClose : ''}`} />
        <Ellipsis className={`${Styles.popUpMenuIcon} ${open ? '' : Styles.iconOpen}`} />
      </button>

      {open && (
        <div ref={menuRef} className={`${Styles.popUpMenu} ${closing ? Styles.closing : Styles.opening} ${menuClassName}`}>
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
