// components/ServiceWorkerMessageHandler.jsx
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const ServiceWorkerMessageHandler = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    let registrationRef = null;
    let onUpdateFound = null;

    const messageHandler = (event) => {
      if (event.data?.type === 'NAVIGATE' && event.data.url) {
        navigate(event.data.url);
      }
    };
    navigator.serviceWorker.addEventListener('message', messageHandler);

    const controllerChangeHandler = () => {
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener('controllerchange', controllerChangeHandler);

    navigator.serviceWorker.getRegistration().then((reg) => {
      if (!reg) return;
      registrationRef = reg;

      const promptAndSkip = () => {
        // kun prompt hvis der allerede var en controller (dvs. ikke første install)
        if (!navigator.serviceWorker.controller) return;
        const ok = window.confirm('Der er en ny app-version tilgængelig. Genstart nu?');
        if (ok && registrationRef.waiting) {
          registrationRef.waiting.postMessage({ action: 'skipWaiting' });
        }
      };

      // hvis en waiting worker allerede ligger klar
      if (registrationRef.waiting) {
        promptAndSkip();
      }

      onUpdateFound = () => {
        const newWorker = registrationRef.installing;
        if (!newWorker) return;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed') {
            promptAndSkip();
          }
        });
      };

      registrationRef.addEventListener('updatefound', onUpdateFound);
    });

    return () => {
      navigator.serviceWorker.removeEventListener('message', messageHandler);
      navigator.serviceWorker.removeEventListener('controllerchange', controllerChangeHandler);
      if (registrationRef && onUpdateFound) {
        registrationRef.removeEventListener('updatefound', onUpdateFound);
      }
    };
  }, [navigate]);

  return null;
};

export default ServiceWorkerMessageHandler;


// // components/ServiceWorkerMessageHandler.jsx
// import { useEffect } from 'react'
// import { useNavigate } from 'react-router-dom'

// const ServiceWorkerMessageHandler = () => {
//   const navigate = useNavigate();

//   useEffect(() => {
//     if (!('serviceWorker' in navigator)) return;

//     let registrationRef = null;

//     const messageHandler = (event) => {
//       if (event.data?.type === 'NAVIGATE' && event.data.url) {
//         navigate(event.data.url);
//       }
//     };
//     navigator.serviceWorker.addEventListener('message', messageHandler);

//     const controllerChangeHandler = () => {
//       // Når ny SW tager kontrol → reload for at hente nye assets
//       window.location.reload();
//     };
//     navigator.serviceWorker.addEventListener('controllerchange', controllerChangeHandler);

//     // Hent eksisterende registration (hvis SW registreret et andet sted)
//     navigator.serviceWorker.getRegistration().then((reg) => {
//       if (!reg) return;
//       registrationRef = reg;

//       // Hvis der allerede ligger en waiting worker (fx deploy mens siden var åben)
//       if (reg.waiting && navigator.serviceWorker.controller) {
//         // kun prompt hvis siden allerede var controlled (dvs. ikke første install)
//         const ok = window.confirm('Der er en ny app-version tilgængelig. Genstart nu?');
//         if (ok) reg.waiting.postMessage({ action: 'skipWaiting' });
//       }

//       // Når vi opdager en ny worker der bliver downloaded
//       const onUpdateFound = () => {
//         const newWorker = reg.installing;
//         if (!newWorker) return;
//         newWorker.addEventListener('statechange', () => {
//           if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
//             // ny version klar – prompt brugeren (kun hvis siden allerede var controlled)
//             const ok = window.confirm('Der er en ny app-version tilgængelig. Genstart nu?');
//             if (ok && reg.waiting) {
//               reg.waiting.postMessage({ action: 'skipWaiting' });
//             }
//           }
//         });
//       };

//       reg.addEventListener('updatefound', onUpdateFound);

//       // cleanup: fjern listener ved unmount
//       return () => {
//         reg.removeEventListener('updatefound', onUpdateFound);
//       };
//     });

//     return () => {
//       navigator.serviceWorker.removeEventListener('message', messageHandler);
//       navigator.serviceWorker.removeEventListener('controllerchange', controllerChangeHandler);
//     };
//   }, [navigate]);

//   return null;
// }

// export default ServiceWorkerMessageHandler;


// // // components/ServiceWorkerMessageHandler.jsx
// // import { useEffect } from 'react'
// // import { useNavigate } from 'react-router-dom'

// // const ServiceWorkerMessageHandler = () => {
// //   const navigate = useNavigate();

// //   useEffect(() => {
// //     if ('serviceWorker' in navigator) {
// //       const handler = (event) => {
// //         if (event.data?.type === 'NAVIGATE' && event.data.url) {
// //           navigate(event.data.url);
// //         }
  
// //         if (event.data?.type === "NEW_VERSION_READY" && navigator.serviceWorker.controller) {
// //           const shouldReload = window.confirm(
// //             "Der er en ny app-version tilgængelig, som kræver en genstart. Vil du genstarte nu?"
// //           );
// //           if (shouldReload) {
// //             window.location.reload();
// //           }
// //         }
// //       };
  
// //       navigator.serviceWorker.addEventListener('message', handler);
// //       return () => {
// //         navigator.serviceWorker.removeEventListener('message', handler);
// //       };
// //     }
// //   }, [navigate]);  

// //   return null;
// // }

// // export default ServiceWorkerMessageHandler;