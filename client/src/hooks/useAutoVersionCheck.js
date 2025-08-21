import { useEffect, useRef } from "react";
import axios from "axios";

const VERSION_URL = `${import.meta.env.VITE_API_URL}/version`;
const CHECK_INTERVAL_MS = 300 * 1000; // 5 min

export default function useAutoVersionCheck() {
  const lastCheck = useRef(0);

  useEffect(() => {
    const interval = setInterval(async () => {
      const now = Date.now();
      if (now - lastCheck.current < CHECK_INTERVAL_MS) return;

      lastCheck.current = now;

      try {
        const res = await axios.get(VERSION_URL);
        const { version: serverVersion } = res.data;
        const localVersion = localStorage.getItem("app_version");
        
        console.log("serverVersion", serverVersion);
        console.log("localVersion", localVersion);

        if (localVersion && localVersion !== serverVersion) {
          const ok = window.confirm(
            "Der er en ny app-version tilgængelig. Genstart nu?"
          );
          if (ok) {
            localStorage.setItem("app_version", serverVersion);
            window.location.reload();
          }
        } else {
          localStorage.setItem("app_version", serverVersion);
        }
      } catch (err) {
        console.error("Kunne ikke hente version:", err);
      }
    }, CHECK_INTERVAL_MS / 2);

    return () => clearInterval(interval);
  }, []);
}
