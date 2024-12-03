import React, { createContext, useState, useEffect } from 'react';

const NewDocumentContext = createContext();

export const NewDocumentProvider = ({ children }) => {

    const [refetchDocuments, setRefetchDocuments] = useState(false);

    return (
        <NewDocumentContext.Provider value={{ 
            refetchDocuments,
            setRefetchDocuments
         }}>
          {children}
        </NewDocumentContext.Provider>
    );
};


export const useNewDocument = () => {
  const context = React.useContext(NewDocumentContext);
  if (!context) {
    throw new Error("useNewDocument must be used within a NewDocumentProvider");
  }
  return context;
};