import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthContext } from '../hooks/useAuthContext';
const BesøgContext = createContext();

export const BesøgProvider = ({ children }) => {
    const { user } = useAuthContext();
    
    // Declare all hooks at the top
    const [alleBesøg, setAlleBesøg] = useState([]);
    const [egneBesøg, setEgneBesøg] = useState([]);
    const [alleLedigeTider, setAlleLedigeTider] = useState([]);
    const [egneLedigeTider, setEgneLedigeTider] = useState([]);
    const [refetchBesøg, setRefetchBesøg] = useState(false);
    const [refetchLedigeTider, setRefetchLedigeTider] = useState(false);
    const [medarbejdere, setMedarbejdere] = useState([]);
    const [refetchMedarbejdere, setRefetchMedarbejdere] = useState(false);
    // Conditionally execute side-effects but don't return early
    useEffect(() => {
        if (user) {
            axios.get(`${import.meta.env.VITE_API_URL}/besoeg`, {
                headers: { 'Authorization': `Bearer ${user.token}` }
            })
            .then(res => {
                const filteredVisits = res.data.filter(besøg => besøg.brugerID === userID);
                setAlleBesøg(res.data);
                setEgneBesøg(filteredVisits);
            })
            .catch(error => console.log(error));
        }
    }, [user, refetchBesøg]);

    useEffect(() => {
        if (user) {
            axios.get(`${import.meta.env.VITE_API_URL}/brugere`, {
                headers: { 'Authorization': `Bearer ${user.token}` }
            })
            .then(res => {
                setMedarbejdere(res.data);
            })
            .catch(error => console.log(error));
        }
    }, [user, refetchMedarbejdere])

    useEffect(() => {
        if (user) {
            axios.get(`${import.meta.env.VITE_API_URL}/ledige-tider`, {
                headers: { 'Authorization': `Bearer ${user.token}` }
            })
            .then(res => {
                setAlleLedigeTider(res.data);
                setEgneLedigeTider(res.data.filter(ledigTid => ledigTid.brugerID === userID));
            })
            .catch(error => console.log(error));
        }
    }, [user, refetchLedigeTider]);

    const userID = user?.id || user?._id;

    return (
        <BesøgContext.Provider value={{ 
            egneBesøg, 
            alleBesøg, 
            egneLedigeTider, 
            alleLedigeTider,
            refetchBesøg,
            refetchLedigeTider,
            medarbejdere,
            refetchMedarbejdere,
            setEgneLedigeTider,
            setAlleLedigeTider,
            setEgneBesøg,
            setAlleBesøg,
            setRefetchBesøg,
            setRefetchLedigeTider,
            setMedarbejdere,
            setRefetchMedarbejdere,
            userID
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