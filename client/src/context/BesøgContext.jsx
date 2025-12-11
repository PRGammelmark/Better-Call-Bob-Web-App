import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthContext } from '../hooks/useAuthContext';
const BesøgContext = createContext();

export const BesøgProvider = ({ children }) => {
    const { user } = useAuthContext();
    const userID = user?.id || user?._id;
    
    const [alleBesøg, setAlleBesøg] = useState([]);
    const [egneBesøg, setEgneBesøg] = useState([]);
    const [alleLedigeTider, setAlleLedigeTider] = useState([]);
    const [egneLedigeTider, setEgneLedigeTider] = useState([]);
    const [refetchBesøg, setRefetchBesøg] = useState(false);
    const [refetchLedigeTider, setRefetchLedigeTider] = useState(false);
    const [medarbejdere, setMedarbejdere] = useState([]);
    const [refetchMedarbejdere, setRefetchMedarbejdere] = useState(false);
    
    useEffect(() => {
        const interval = setInterval(() => {
            setRefetchBesøg(prev => !prev);
            setRefetchLedigeTider(prev => !prev);
            console.log("Refetching besøg og ledige tider");
        }, 15 * 60 * 1000); // 15 minutter
    
        return () => clearInterval(interval); // Cleanup
    }, []);
    
    // Conditionally execute side-effects but don't return early
    useEffect(() => {
        if (user && userID) {
            axios.get(`${import.meta.env.VITE_API_URL}/besoeg`, {
                headers: { 'Authorization': `Bearer ${user.token}` }
            })
            .then(res => {
                const filteredVisits = res.data.filter(besøg => {
                    const besøgBrugerID = typeof besøg.brugerID === 'object' 
                        ? String(besøg.brugerID?._id || besøg.brugerID?.id) 
                        : String(besøg.brugerID);
                    return besøgBrugerID === String(userID);
                });
                setAlleBesøg(res.data);
                setEgneBesøg(filteredVisits);
            })
            .catch(error => console.log(error));
        }
    }, [user, userID, refetchBesøg]);

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
        if (user && userID) {
            axios.get(`${import.meta.env.VITE_API_URL}/ledige-tider`, {
                headers: { 'Authorization': `Bearer ${user.token}` }
            })
            .then(res => {
                setAlleLedigeTider(res.data);
                const filteredLedigeTider = res.data.filter(ledigTid => {
                    const tidBrugerID = typeof ledigTid.brugerID === 'object' 
                        ? String(ledigTid.brugerID?._id || ledigTid.brugerID?.id) 
                        : String(ledigTid.brugerID);
                    return tidBrugerID === String(userID);
                });
                setEgneLedigeTider(filteredLedigeTider);
            })
            .catch(error => console.log(error));
        }
    }, [user, userID, refetchLedigeTider]);

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