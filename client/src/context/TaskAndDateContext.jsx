import React, { createContext, useState, useEffect } from 'react';
import dayjs from 'dayjs';
const TaskAndDateContext = createContext();

export const TaskAndDateProvider = ({ children }) => {

    const [chosenTask, setChosenTask] = useState(null);
    const [chosenDate, setChosenDate] = useState(dayjs());
    const [chosenEndDate, setChosenEndDate] = useState(null);

    return (
        <TaskAndDateContext.Provider value={{ 
            chosenTask,
            setChosenTask,
            chosenDate,
            setChosenDate,
            chosenEndDate,
            setChosenEndDate
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