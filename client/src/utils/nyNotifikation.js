import axios from 'axios';

async function nyNotifikation(user, modtager, titel, besked, url = '/') {

  console.log("Påbegynder push-notifikation til", modtager);

  if (!titel?.trim() || !besked?.trim()) {
    console.warn('⛔ Push-notifikation afvist: Titel eller besked mangler.');
    return;
  }

  if (!user?.token) {
    console.warn('⛔ Mangler bruger-token. Kan ikke sende push.');
    return;
  }

  try {
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/brugere/`, {
      headers: {
        Authorization: `Bearer ${user.token}`
      }
    });

    const brugere = res.data;

    const admin = brugere.find(bruger => (bruger?._id || bruger?.id) === "66bf3f6d832ab46100d38eb3");
    const admins = brugere.filter(bruger => bruger.isAdmin === true);
    const medarbejdere = brugere.filter(bruger => bruger.isAdmin === false);
    const alle = brugere;

    let modtagere = [];

    if (Array.isArray(modtager)) {
      modtagere = modtager;
    } else if (modtager === "admin") {
      modtagere = [admin];
    } else if (modtager === "admins") {
      modtagere = admins;
    } else if (modtager === "medarbejdere") {
      modtagere = medarbejdere;
    } else if (modtager === "alle") {
      modtagere = alle;
    } else {
      modtagere = [modtager]; // fallback
    }

    const payload = {
      title: titel.trim(),
      body: besked.trim(),
      url
    };

    for (const modt of modtagere) {
      if (!modt?.pushSubscription) {
        console.warn(`⚠️ Bruger ${modt?.navn || '[ukendt]'} har ingen pushSubscription`);
        continue;
      }

      await axios.post(`${import.meta.env.VITE_API_URL}/send-push`, {
        modtager: modt,
        payload
      }, {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });

      console.log(`✅ Push-notifikation sendt til ${modt?.navn}`);
    }

  } catch (err) {
    console.error('❌ Fejl ved hentning eller afsendelse af push:', err.response?.data || err.message || err);
  }
}

export default nyNotifikation;
