import axios from 'axios'

function urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const rawData = atob(base64);
    return new Uint8Array([...rawData].map(char => char.charCodeAt(0)));
  }

async function subscribeToPush(user) {
    try {
      if (!('serviceWorker' in navigator)) {
        return alert("Din browser understøtter ikke notifikationer.");
      }
  
      const permission = Notification.permission;
  
      if (permission === 'denied') {
        return alert("Du har blokeret notifikationer. Gå til Indstillinger > Notifikationer og slå dem til.");
      }
  
      if (permission !== 'granted') {
        const newPermission = await Notification.requestPermission();
        if (newPermission !== 'granted') {
          return alert("Du skal acceptere notifikationer for at det virker.");
        }
      }
  
      const registration = await navigator.serviceWorker.ready;
  
      let subscription = await registration.pushManager.getSubscription();
  
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(import.meta.env.VITE_VAPID_PUBLIC_KEY)
        });
      }
  
      console.log("Push subscription:", subscription);
  
      // Send til backend
      await axios.post(`${import.meta.env.VITE_API_URL}/brugere/push-subscribe`, {
        subscription
      }, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
  
      alert("Push-notifikationer er nu aktiveret.");
    } catch (err) {
      console.error("Fejl ved push-tilmelding:", err);
      alert("Noget gik galt under tilmelding. Se konsollen for detaljer.");
    }
  }

  export default subscribeToPush;