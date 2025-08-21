// components/ServiceWorkerMessageHandler.jsx
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const ServiceWorkerMessageHandler = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const handler = (event) => {
        if (event.data?.type === 'NAVIGATE' && event.data.url) {
          navigate(event.data.url);
        }
  
        if (event.data?.type === "NEW_VERSION_READY") {
          const shouldReload = window.confirm(
            "Der er en ny app-version tilgængelig, som kræver en genstart. Vil du genstarte nu?"
          );
          if (shouldReload) {
            window.location.reload();
          }
        }
      };
  
      navigator.serviceWorker.addEventListener('message', handler);
      return () => {
        navigator.serviceWorker.removeEventListener('message', handler);
      };
    }
  }, [navigate]);  

  return null;
}

export default ServiceWorkerMessageHandler;