import React, { useState, useEffect } from 'react'
import ModalStyles from '../Modal.module.css'
import Modal from '../Modal.jsx'
import axios from 'axios'
import { useAuthContext } from '../../hooks/useAuthContext.js'
import { useBesøg } from '../../context/BesøgContext.jsx'
import LedighedsKalender from '../traditionalCalendars/ledighedsKalender.jsx'

const VisLedighedModal = ({ trigger, setTrigger, brugerID }) => {
    const { user } = useAuthContext();
    const { egneLedigeTider, alleLedigeTider, egneBesøg, alleBesøg, setEgneLedigeTider, setEgneBesøg, refetchLedigeTider, refetchBesøg, setRefetchLedigeTider, setRefetchBesøg, setAlleLedigeTider, setAlleBesøg } = useBesøg();
    const [brugere, setBrugere] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [eventData, setEventData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    // Local state for filtered data - don't modify global context
    const [localAlleLedigeTider, setLocalAlleLedigeTider] = useState([]);
    const [localAlleBesøg, setLocalAlleBesøg] = useState([]);
    const [localEgneLedigeTider, setLocalEgneLedigeTider] = useState([]);
    const [localEgneBesøg, setLocalEgneBesøg] = useState([]);

    const getBrugerName = (brugerID) => {
        const bruger = brugere && brugere.find(user => (user?._id || user?.id) === brugerID);
        return bruger ? bruger.navn : 'Ukendt medarbejder';
    };

    useEffect(() => {
        if (trigger && brugerID && user?.token) {
            setIsLoading(true);
            
            // Fetch all data in parallel
            Promise.all([
                // Fetch brugere for getBrugerName function
                axios.get(`${import.meta.env.VITE_API_URL}/brugere`, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    }
                }).catch(error => {
                    console.log('Error fetching brugere:', error);
                    return { data: [] };
                }),
                // Fetch ledige tider for the user
                axios.get(`${import.meta.env.VITE_API_URL}/ledige-tider/medarbejder/${brugerID}`, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    }
                }).catch(error => {
                    console.log('Error fetching ledige tider:', error);
                    return { data: [] };
                }),
                // Fetch alle ledige tider
                axios.get(`${import.meta.env.VITE_API_URL}/ledige-tider`, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    }
                }).catch(error => {
                    console.log('Error fetching alle ledige tider:', error);
                    return { data: [] };
                }),
                // Fetch besøg for the user
                axios.get(`${import.meta.env.VITE_API_URL}/besoeg/bruger/${brugerID}`, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    }
                }).catch(error => {
                    console.log('Error fetching besøg:', error);
                    return { data: [] };
                }),
                // Fetch alle besøg
                axios.get(`${import.meta.env.VITE_API_URL}/besoeg`, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    }
                }).catch(error => {
                    console.log('Error fetching alle besøg:', error);
                    return { data: [] };
                })
            ]).then(([brugereRes, egneLedigeTiderRes, alleLedigeTiderRes, egneBesøgRes, alleBesøgRes]) => {
                setBrugere(brugereRes.data || []);
                
                // Use local state instead of modifying global context
                setLocalEgneLedigeTider(egneLedigeTiderRes.data || []);
                
                // Filter to only show ledige tider for the selected user
                const filteredLedigeTider = (alleLedigeTiderRes.data || []).filter(ledigTid => {
                    const tidBrugerID = typeof ledigTid.brugerID === 'object' 
                        ? String(ledigTid.brugerID?._id || ledigTid.brugerID?.id) 
                        : String(ledigTid.brugerID);
                    const targetBrugerID = String(brugerID);
                    return tidBrugerID === targetBrugerID;
                });
                setLocalAlleLedigeTider(filteredLedigeTider);
                
                setLocalEgneBesøg(egneBesøgRes.data || []);
                
                // Filter to only show besøg for the selected user
                const filteredBesøg = (alleBesøgRes.data || []).filter(besøg => {
                    const besøgBrugerID = typeof besøg.brugerID === 'object' 
                        ? String(besøg.brugerID?._id || besøg.brugerID?.id) 
                        : String(besøg.brugerID);
                    const targetBrugerID = String(brugerID);
                    return besøgBrugerID === targetBrugerID;
                });
                setLocalAlleBesøg(filteredBesøg);
                
                setIsLoading(false);
            });
        } else if (!trigger) {
            // Reset state when modal closes
            setIsLoading(false);
            // Clear local state when modal closes
            setLocalAlleLedigeTider([]);
            setLocalAlleBesøg([]);
            setLocalEgneLedigeTider([]);
            setLocalEgneBesøg([]);
        }
    }, [trigger, brugerID, user, setEgneLedigeTider, setEgneBesøg, setAlleLedigeTider, setAlleBesøg]);

    return (
        <Modal trigger={trigger} setTrigger={setTrigger}>
            <h2 className={ModalStyles.modalHeading}>Ledighed</h2>
            {isLoading ? (
                <p>Indlæser...</p>
            ) : (
                <div style={{ padding: '20px 0' }}>
                    <LedighedsKalender 
                        user={user} 
                        openDialog={openDialog}
                        setOpenDialog={setOpenDialog}
                        eventData={eventData}
                        setEventData={setEventData} 
                        brugerID={brugerID}
                        brugere={brugere}
                        getBrugerName={getBrugerName}
                        alleLedigeTider={localAlleLedigeTider}
                        alleBesøg={localAlleBesøg}
                        setAlleLedigeTider={(updater) => {
                            // Update local state, and also trigger refetch of global context
                            if (typeof updater === 'function') {
                                setLocalAlleLedigeTider(updater);
                            } else {
                                setLocalAlleLedigeTider(updater);
                            }
                            // Trigger refetch of global context so changes persist
                            refetchLedigeTider ? setRefetchLedigeTider(false) : setRefetchLedigeTider(true);
                        }}
                        refetchLedigeTider={refetchLedigeTider}
                        setRefetchLedigeTider={setRefetchLedigeTider}
                    />
                </div>
            )}
        </Modal>
    )
}

export default VisLedighedModal

