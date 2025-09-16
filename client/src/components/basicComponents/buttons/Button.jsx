// Button.jsx
import React from 'react';
import ButtonStyles from './button.module.css'; // CSS-modul til styling

const Button = ({ 
  children,
  onClick,
  type = "button",
  variant = "",
  disabled = false,
  marginTop = 0,
  marginBottom = 0
}) => {
    const variantClass = variant ? ButtonStyles[variant] : "";

  return (
    <button 
      type={type} 
      onClick={onClick} 
      className={`${ButtonStyles.button} ${variantClass}`} 
      disabled={disabled}
      style={{marginTop: marginTop, marginBottom: marginBottom}}
    >
      {children}
    </button>
  );
};

export default Button;
