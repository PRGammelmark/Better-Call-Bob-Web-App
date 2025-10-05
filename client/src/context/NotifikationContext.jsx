import { createContext, useState, useEffect } from "react";
import axios from "axios";
import { useAuthContext } from "../hooks/useAuthContext";

export const NotifikationContext = createContext();

export const NotifikationProvider = ({ children }) => {
  const [notifikationer, setNotifikationer] = useState([]);
  const { user } = useAuthContext();

  useEffect(() => {
    if(!user) return;
    
    const userID = user.id || user._id;

    // Hent eksisterende notifikationer
    axios.get(`${import.meta.env.VITE_API_URL}/notifikationer/bruger/${userID}`)
      .then(res => {
        setNotifikationer(res.data);
        console.log("Notifikationer hentet:", res.data);
      })
      .catch(err => console.error("Kunne ikke hente notifikationer:", err));

    // Start SSE
    const evtSource = new EventSource(`${import.meta.env.VITE_API_URL}/notifikationer/stream/${userID}`);

    evtSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setNotifikationer((prev) => [data, ...prev]);
    };

    evtSource.onerror = (err) => {
      console.error("SSE fejl:", err);
    };

    return () => evtSource.close();
  }, [user]);

  // useEffect(() => {
  //   console.log("userID", userID)
  //   console.log("user", user)
  //   if (!userID) return;

  //   // 1. Hent eksisterende notifikationer
  //   axios.get(`${import.meta.env.VITE_API_URL}/notifikationer/${userID}`)
  //     .then(res => {
  //       setNotifikationer(res.data),
  //       console.log("Notifikationer hentet:", res.data)
  //     })
  //     .catch(err => console.error("Kunne ikke hente notifikationer:", err));

  //   // 2. Start SSE
  //   const evtSource = new EventSource(`${import.meta.env.VITE_API_URL}/notifikationer/stream/${userID}`);

  //   evtSource.onmessage = (event) => {
  //     const data = JSON.parse(event.data);
  //     setNotifikationer((prev) => [data, ...prev]);
  //   };

  //   evtSource.onerror = (err) => {
  //     console.error("SSE fejl:", err);
  //     // evtSource.close(); // lad browseren prøve reconnect
  //   };

  //   return () => evtSource.close();
  // }, [userID]);

  return (
    <NotifikationContext.Provider value={{ notifikationer, setNotifikationer }}>
      {children}
    </NotifikationContext.Provider>
  );
};
