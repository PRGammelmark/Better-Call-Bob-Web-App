import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const BesøgContext = createContext();

export const BesøgProvider = ({ user, children }) => {
  const [alleBesøg, setAlleBesøg] = useState([]);
  const [egneBesøg, setEgneBesøg] = useState([]);
  const [alleLedigeTider, setAlleLedigeTider] = useState([]);
  const [egneLedigeTider, setEgneLedigeTider] = useState([]);
  const [refetchBesøg, setRefetchBesøg] = useState(false);
  const [refetchLedigeTider, setRefetchLedigeTider] = useState(false);
  
  useEffect(() => {
    if (user) {
      axios.get(`${import.meta.env.VITE_API_URL}/besoeg`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      })
      .then(res => {
        const filteredVisits = res.data.filter(opgave => opgave.brugerID === user.id);
        setAlleBesøg(res.data);
        setEgneBesøg(filteredVisits);
      })
      .catch(error => console.log(error));
    }
  }, [user, refetchBesøg]);

  useEffect(() => {
    if (user) {
      axios.get(`${import.meta.env.VITE_API_URL}/ledige-tider`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      })
      .then(res => {
        setAlleLedigeTider(res.data);
        setEgneLedigeTider(res.data.filter(ledigtTid => ledigtTid.brugerID === user.id));
      })
      .catch(error => console.log(error));
    }
  }, [user, refetchLedigeTider]);

  return (
    <BesøgContext.Provider value={{ 
        egneBesøg, 
        alleBesøg, 
        egneLedigeTider, 
        alleLedigeTider,
        refetchBesøg,
        refetchLedigeTider,
        setEgneLedigeTider,
        setAlleLedigeTider,
        setEgneBesøg,
        setAlleBesøg,
        setRefetchBesøg,
        setRefetchLedigeTider
         }}>
      {children}
    </BesøgContext.Provider>
  );
};

export const useBesøg = () => {
  const context = React.useContext(BesøgContext);
  if (!context) {
    throw new Error("useBesøg must be used within a BesøgProvider");
  }
  return context;
};