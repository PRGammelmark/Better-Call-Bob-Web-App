import { createContext, useState, useEffect, useRef } from "react";
import axios from "axios";
import { useAuthContext } from "../hooks/useAuthContext";
import * as Sentry from "@sentry/react";

export const NotifikationContext = createContext();

export const NotifikationProvider = ({ children }) => {
  const [notifikationer, setNotifikationer] = useState([]);
  const { user } = useAuthContext();
  const evtSourceRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const retryDelayRef = useRef(1000); // starter med 1s

  useEffect(() => {
    if (!user) return;
    const userID = user.id || user._id;

    // Hent eksisterende notifikationer
    axios.get(`${import.meta.env.VITE_API_URL}/notifikationer/bruger/${userID}`)
      .then(res => {
        setNotifikationer(res.data);
        // console.log("Notifikationer hentet:", res.data);
      })
      .catch(err => console.error("Kunne ikke hente notifikationer:", err));

    const connectSSE = () => {
      // console.log("Opretter SSE forbindelse...");
      evtSourceRef.current = new EventSource(`${import.meta.env.VITE_API_URL}/notifikationer/stream/${userID}`);

      evtSourceRef.current.onmessage = (event) => {
        retryDelayRef.current = 1000; // nulstil backoff ved succes
        const data = JSON.parse(event.data);
        setNotifikationer(prev => [data, ...prev]);
      };

      evtSourceRef.current.onerror = (err) => {
        console.error("SSE fejl:", err);
        Sentry.captureException(new Error("SSE connection failed"), {
          extra: { userID, event: err }
        });

        evtSourceRef.current.close();

        // Eksponentiel backoff med max 30s
        const delay = Math.min(retryDelayRef.current, 30000);
        console.log(`Forsøger genforbindelse om ${delay / 1000}s...`);
        reconnectTimeoutRef.current = setTimeout(connectSSE, delay);
        retryDelayRef.current *= 2;
      };
    };

    connectSSE();

    return () => {
      if (evtSourceRef.current) evtSourceRef.current.close();
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    };
  }, [user]);

  return (
    <NotifikationContext.Provider value={{ notifikationer, setNotifikationer }}>
      {children}
    </NotifikationContext.Provider>
  );
};


// import { createContext, useState, useEffect, useRef } from "react";
// import axios from "axios";
// import { useAuthContext } from "../hooks/useAuthContext";

// export const NotifikationContext = createContext();

// export const NotifikationProvider = ({ children }) => {
//   const [notifikationer, setNotifikationer] = useState([]);
//   const { user } = useAuthContext();

//   useEffect(() => {
//     if(!user) return;
    
//     const userID = user.id || user._id;

//     // Hent eksisterende notifikationer
//     axios.get(`${import.meta.env.VITE_API_URL}/notifikationer/bruger/${userID}`)
//       .then(res => {
//         setNotifikationer(res.data);
//         console.log("Notifikationer hentet:", res.data);
//       })
//       .catch(err => console.error("Kunne ikke hente notifikationer:", err));

//     // Start SSE
//     const evtSource = new EventSource(`${import.meta.env.VITE_API_URL}/notifikationer/stream/${userID}`);

//     evtSource.onmessage = (event) => {
//       const data = JSON.parse(event.data);
//       setNotifikationer((prev) => [data, ...prev]);
//     };

//     evtSource.onerror = (err) => {
//       console.error("SSE fejl:", err);
//     };

//     return () => evtSource.close();
//   }, [user]);

//   return (
//     <NotifikationContext.Provider value={{ notifikationer, setNotifikationer }}>
//       {children}
//     </NotifikationContext.Provider>
//   );
// };
