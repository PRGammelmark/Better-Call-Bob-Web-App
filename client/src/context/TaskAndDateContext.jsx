import React, { createContext, useState, useEffect } from 'react';
import dayjs from 'dayjs';
const TaskAndDateContext = createContext();
import axios from 'axios';
import { useAuthContext } from '../hooks/useAuthContext';

export const TaskAndDateProvider = ({ children }) => {
    const { user } = useAuthContext();
    const [chosenTask, setChosenTask] = useState(null);
    const [chosenDate, setChosenDate] = useState(dayjs());
    const [chosenEndDate, setChosenEndDate] = useState(null);
    const [customerForChosenTask, setCustomerForChosenTask] = useState({});
    
    useEffect(() => {
        if(user && chosenTask){
            axios.get(`${import.meta.env.VITE_API_URL}/kunder/${chosenTask?.kundeID}`, {
                headers: {
                    'Authorization': `Bearer ${user?.token}`
                }
            })
            .then(response => {
                setCustomerForChosenTask(response.data.kunde || response.data || {})
            })
            .catch(error => {
                console.log(error)
                setCustomerForChosenTask({})
            })
        }
        if(!user || !chosenTask){
            setCustomerForChosenTask({})
        }
    }, [chosenTask, user])

    return (
        <TaskAndDateContext.Provider value={{ 
            chosenTask,
            setChosenTask,
            chosenDate,
            setChosenDate,
            chosenEndDate,
            setChosenEndDate,
            customerForChosenTask
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