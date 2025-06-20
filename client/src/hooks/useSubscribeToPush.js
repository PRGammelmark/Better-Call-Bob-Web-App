// src/hooks/useSubscribeToPush.js
import { useAuthContext } from "./useAuthContext";
import axios from "axios";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return new Uint8Array([...rawData].map(char => char.charCodeAt(0)));
}

export const useSubscribeToPush = () => {
  const { user, dispatch } = useAuthContext();

  const subscribeToPush = async () => {
    try {
      if (!('serviceWorker' in navigator)) {
        return alert("Din browser understøtter ikke notifikationer.");
      }

      if (Notification.permission === 'denied') {
        return alert("Du har blokeret notifikationer. Gå til Indstillinger > Notifikationer og slå dem til.");
      }

      if (Notification.permission !== 'granted') {
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

      // Send subscription til backend
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/brugere/push-subscribe`,
        { subscription },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      const updatedUserFromBackend = response.data;

      const updatedUser = {
        ...updatedUserFromBackend,
        token: user.token, // Behold token
      };

      dispatch({ type: "UPDATE_USER", payload: updatedUser });
      localStorage.setItem("user", JSON.stringify(updatedUser));

      alert("Push-notifikationer er nu aktiveret.");
    } catch (err) {
      console.error("Fejl ved push-tilmelding:", err);
      alert("Noget gik galt under tilmelding. Se konsollen for detaljer.");
    }
  };

  return subscribeToPush;
};
