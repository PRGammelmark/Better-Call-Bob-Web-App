// IndstillingerContext.jsx
import { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";

const IndstillingerContext = createContext();

export const IndstillingerProvider = ({ children }) => {
  const [indstillinger, setIndstillinger] = useState(null);

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/indstillinger`)
      .then(res => setIndstillinger(res.data))
      .catch(err => console.error("Kunne ikke hente indstillinger", err))
  }, []);

  return (
    <IndstillingerContext.Provider value={{ indstillinger, setIndstillinger }}>
      {children}
    </IndstillingerContext.Provider>
  );
};

// Hook til nemmere brug
export const useIndstillinger = () => useContext(IndstillingerContext);