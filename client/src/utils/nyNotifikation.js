import axios from 'axios';
import { useAuthContext } from '../hooks/useAuthContext';

function nyNotifikation(user, modtager, titel, besked, url = '/') {
  // Tjek inputs
  if (!titel?.trim() || !besked?.trim()) {
    console.warn('⛔ Push-notifikation afvist: Titel eller besked mangler.');
    return;
  }

  if (!user?.token) {
    console.warn('⛔ Mangler bruger-token. Kan ikke sende push.');
    return;
  }

  const modtagere = Array.isArray(modtager) ? modtager : [modtager];

  const payload = {
    title: titel.trim(),
    body: besked.trim(),
    url
  };

  // Loop gennem alle brugere og send push individuelt
  modtagere.forEach((modtager) => {
    if (!modtager?.pushSubscription) {
      console.warn(`⚠️ Bruger ${modtager?.navn || '[ukendt]'} har ingen pushSubscription`);
      return;
    }

    axios.post(`${import.meta.env.VITE_API_URL}/send-push`, {
        modtager: modtager,
        payload
      }, {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      })
      .then(() => {
        console.log(`✅ Push-notifikation sendt til ${modtager?.navn}`);
      })
      .catch((err) => {
        console.error(`❌ Fejl ved push til ${modtager?.navn}:`, err.response?.data || err.message || err);
      });
  });
}

export default nyNotifikation;