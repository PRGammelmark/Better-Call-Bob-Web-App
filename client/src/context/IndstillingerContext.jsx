// IndstillingerContext.jsx
import { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";

const IndstillingerContext = createContext();

export const IndstillingerProvider = ({ children }) => {
  const [indstillinger, setIndstillinger] = useState(null);

  useEffect(() => {
    // Start SSE connection
    const eventSource = new EventSource(`${import.meta.env.VITE_API_URL}/indstillinger/stream`);

    eventSource.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        setIndstillinger(data);
        console.log("Nye indstillinger sat.")
      } catch (err) {
        console.error("Kunne ikke parse indstillinger event:", err);
      }
    };

    eventSource.onerror = (err) => {
      console.error("SSE fejl:", err);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return (
    <IndstillingerContext.Provider value={{ indstillinger, setIndstillinger }}>
      {children}
    </IndstillingerContext.Provider>
  );
};

// Hook til nemmere brug
export const useIndstillinger = () => useContext(IndstillingerContext);