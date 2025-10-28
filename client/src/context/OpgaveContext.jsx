import React, { createContext, useState, useEffect } from 'react';
import { useAuthContext } from '../hooks/useAuthContext';
import axios from 'axios';

const OpgaveContext = createContext();

export const OpgaveProvider = ({ children }) => {

    const [opgave, setOpgave] = useState(null);
    const [refetchOpgave, setRefetchOpgave] = useState(false);
    const [refetchPosteringer, setRefetchPosteringer] = useState(false);
    const { user } = useAuthContext();

    useEffect(() => {
        if (refetchOpgave && opgave?._id) {
            axios.get(`${import.meta.env.VITE_API_URL}/opgaver/${opgave._id}`, {
                headers: { 'Authorization': `Bearer ${user.token}` }
            })
            .then(res => {
                setOpgave(res.data);
                setRefetchOpgave(false); // nulstil refetch flag
            })
            .catch(error => {
                console.log(error);
                setRefetchOpgave(false); // nulstil selv ved fejl
            });
        }
    }, [refetchOpgave, opgave?._id, user?.token]);

    const userID = user?.id || user?._id;

    return (
        <OpgaveContext.Provider value={{
            opgave,
            setOpgave,
            refetchOpgave,
            setRefetchOpgave,
            refetchPosteringer,
            setRefetchPosteringer
        }}>
            {children}
        </OpgaveContext.Provider>
    )
}

export const useOpgave = () => {
    const context = React.useContext(OpgaveContext);
    if (!context) {
        throw new Error("useOpgave must be used within a OpgaveProvider");
    }
    return context;
}
