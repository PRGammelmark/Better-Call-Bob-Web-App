import axios from 'axios';

async function unSubscribeToPush(user, updateUser) {
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

    // Fortæl backend at subscription skal fjernes fra brugeren
    const response = await axios.post(`${import.meta.env.VITE_API_URL}/brugere/push-unsubscribe`, {}, {
      headers: {
        'Authorization': `Bearer ${user.token}`
      }
    });

    const updatedUser = response.data;
    updateUser(updatedUser);

    alert("Push-notifikationer er nu afmeldt.");
  } catch (err) {
    console.error("Fejl ved afmelding af push:", err);
    alert("Noget gik galt under afmelding. Se konsollen for detaljer.");
  }
}

export default unSubscribeToPush;
