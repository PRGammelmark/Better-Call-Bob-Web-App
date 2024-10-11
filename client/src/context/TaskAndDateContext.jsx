import React, { createContext, useState, useEffect } from 'react';
const TaskAndDateContext = createContext();

export const TaskAndDateProvider = ({ children }) => {

    const [chosenTask, setChosenTask] = useState(null);
    const [chosenDate, setChosenDate] = useState(null);

    return (
        <TaskAndDateContext.Provider value={{ 
            chosenTask,
            setChosenTask,
            chosenDate,
            setChosenDate
         }}>
          {children}
        </TaskAndDateContext.Provider>
    );
};


export const useTaskAndDate = () => {
  const context = React.useContext(TaskAndDateContext);
  if (!context) {
    throw new Error("useTaskAndDate must be used within a TaskAndDateProvider");
  }
  return context;
};