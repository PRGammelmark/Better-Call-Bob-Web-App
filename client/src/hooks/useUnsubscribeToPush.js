// src/hooks/useUnsubscribeToPush.js
import { useAuthContext } from "./useAuthContext";
import axios from "axios";

export const useUnsubscribeToPush = () => {
  const { user, dispatch } = useAuthContext(); // Henter bruger og dispatch fra context

  const unSubscribeToPush = async () => {
    try {
      if (!('serviceWorker' in navigator)) {
        return alert("Din browser understøtter ikke notifikationer.");
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        const successful = await subscription.unsubscribe();
        if (!successful) {
          console.warn("Kunne ikke afmelde push-subscription i browseren.");
        }
      }

      // Fortæl backend at subscription skal fjernes
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/brugere/push-unsubscribe`,
        {},
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      const updatedUserFromBackend = response.data;

    const updatedUser = {
    ...updatedUserFromBackend,
    token: user.token, // Beholder den eksisterende token fra context
    };

    // Opdater både context og localStorage
    dispatch({ type: "UPDATE_USER", payload: updatedUser });
    localStorage.setItem("user", JSON.stringify(updatedUser));

      alert("Push-notifikationer er nu afmeldt.");
    } catch (err) {
      console.error("Fejl ved afmelding af push:", err);
      alert("Noget gik galt under afmelding. Se konsollen for detaljer.");
    }
  };

  return unSubscribeToPush;
};
