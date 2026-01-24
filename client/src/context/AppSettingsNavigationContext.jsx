import React, { createContext, useState } from 'react';

const AppSettingsNavigationContext = createContext();

export const AppSettingsNavigationProvider = ({ children }) => {
    const [activeSettingsPage, setActiveSettingsPage] = useState(null);

    return (
        <AppSettingsNavigationContext.Provider value={{ 
            activeSettingsPage,
            setActiveSettingsPage
        }}>
            {children}
        </AppSettingsNavigationContext.Provider>
    );
};

export const useAppSettingsNavigation = () => {
    const context = React.useContext(AppSettingsNavigationContext);
    if (!context) {
        throw new Error("useAppSettingsNavigation must be used within a AppSettingsNavigationProvider");
    }
    return context;
};

