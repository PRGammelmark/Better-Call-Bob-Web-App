// components/ServiceWorkerMessageHandler.jsx
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const ServiceWorkerMessageHandler = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data?.type === 'NAVIGATE' && event.data.url) {
          navigate(event.data.url);
        }
      });
    }
  }, [navigate]);

  return null;
}

export default ServiceWorkerMessageHandler;