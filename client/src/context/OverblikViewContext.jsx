import React, { createContext, useState, useEffect } from 'react';
const OverblikViewContext = createContext();

export const OverblikViewProvider = ({ children }) => {

    const [managerOverblik, setManagerOverblik] = useState(false)

    return (
        <OverblikViewContext.Provider value={{ 
            managerOverblik,
            setManagerOverblik
         }}>
          {children}
        </OverblikViewContext.Provider>
    );
};


export const useOverblikView = () => {
  const context = React.useContext(OverblikViewContext);
  if (!context) {
    throw new Error("useOverblikView must be used within a OverblikViewProvider");
  }
  return context;
};