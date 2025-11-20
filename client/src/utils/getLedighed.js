import dayjs from 'dayjs'
import axios from 'axios'

/**
 * Hjælpefunktion til at beregne ledige tider minus besøg
 * @private
 */
function beregnLedigeTiderMinusBesøg(relevanteLedigeTider, relevanteBesøg) {
  return relevanteLedigeTider.flatMap(tid => {
    let updatedTider = [tid];
    
    relevanteBesøg.forEach(besøg => {
      // Tjek kun besøg for samme bruger
      if (String(besøg.brugerID) === String(tid.brugerID)) {
        const besøgStart = dayjs(besøg.datoTidFra);
        const besøgEnd = dayjs(besøg.datoTidTil);
        
        updatedTider = updatedTider.flatMap(t => {
          const tidStart = dayjs(t.datoTidFra);
          const tidEnd = dayjs(t.datoTidTil);
          
          // Tjek om besøget overlapper med den ledige tid
          if (besøgStart.isBefore(tidEnd) && besøgEnd.isAfter(tidStart)) {
            if (besøgStart.isAfter(tidStart) && besøgEnd.isBefore(tidEnd)) {
              // Besøget er midt i den ledige tid - split i to dele
              return [
                { ...t, datoTidTil: besøgStart.toDate() },
                { ...t, datoTidFra: besøgEnd.toDate() }
              ];
            } else if (besøgStart.isAfter(tidStart)) {
              // Besøget starter midt i den ledige tid - trim slutningen
              return [{ ...t, datoTidTil: besøgStart.toDate() }];
            } else if (besøgEnd.isBefore(tidEnd)) {
              // Besøget slutter midt i den ledige tid - trim starten
              return [{ ...t, datoTidFra: besøgEnd.toDate() }];
            } else {
              // Besøget overlapper fuldstændigt med den ledige tid
              return [];
            }
          }
          return [t];
        });
      }
    });
    
    return updatedTider;
  });
}

/**
 * Hjælpefunktion til at ekstrahere brugerID fra forskellige inputtyper
 * @private
 */
function ekstraherBrugerID(brugerIDEllerBruger) {
  if (brugerIDEllerBruger === null || brugerIDEllerBruger === undefined) {
    return null;
  }
  if (typeof brugerIDEllerBruger === 'string') {
    return brugerIDEllerBruger;
  }
  // Antager at det er et objekt med _id eller id property
  return brugerIDEllerBruger?._id || brugerIDEllerBruger?.id;
}

/**
 * Hjælpefunktion til at ekstrahere token fra user objekt eller direkte token
 * @private
 */
function ekstraherToken(userEllerToken) {
  if (!userEllerToken) return null;
  if (typeof userEllerToken === 'string') {
    return userEllerToken;
  }
  return userEllerToken.token || userEllerToken.accessToken;
}

/**
 * Synkron version af getLedighed - bruges når data allerede er tilgængelig
 * @param {string|object|null|undefined} brugerIDEllerBruger - Enten en brugerID (string), et bruger objekt med _id property, eller null/undefined for alle brugere
 * @param {Array} alleLedigeTider - Array af alle ledige tider
 * @param {Array} alleBesøg - Array af alle besøg
 * @returns {Array} Array af ledige tider hvor besøg er trukket fra
 */
export function getLedighedSync(brugerIDEllerBruger, alleLedigeTider, alleBesøg) {
  const brugerID = ekstraherBrugerID(brugerIDEllerBruger);
  
  // Filtrerer til kun ledige tider og besøg for denne bruger (eller alle hvis brugerID er null)
  const relevanteLedigeTider = brugerID === null
    ? alleLedigeTider
    : alleLedigeTider.filter(tid => String(tid.brugerID) === String(brugerID));
  
  const relevanteBesøg = brugerID === null
    ? alleBesøg
    : alleBesøg.filter(besøg => String(besøg.brugerID) === String(brugerID));

  // Beregner ledige tider minus besøg
  return beregnLedigeTiderMinusBesøg(relevanteLedigeTider, relevanteBesøg);
}

/**
 * Beregner medarbejderens faktiske ledige tider ved at trække besøg fra registrerede ledige tider
 * 
 * Kan kaldes på flere måder:
 * - getLedighed() - returnerer ledighed for alle brugere (fetcher data automatisk hvis user/token er tilgængelig)
 * - getLedighed(brugerID) - returnerer ledighed for specifik bruger (fetcher data automatisk)
 * - getLedighed(bruger) - returnerer ledighed for specifik bruger (fetcher data automatisk)
 * - getLedighed(brugerID, alleLedigeTider, alleBesøg) - bruger eksisterende data (synkron)
 * - getLedighed(bruger, alleLedigeTider, alleBesøg) - bruger eksisterende data (synkron)
 * 
 * @param {string|object|null|undefined} brugerIDEllerBruger - Enten en brugerID (string), et bruger objekt med _id property, eller null/undefined for alle brugere
 * @param {Array|object|string} alleLedigeTiderEllerUser - Enten array af ledige tider, eller user objekt/token hvis data skal fetches
 * @param {Array|object|string} alleBesøgEllerToken - Enten array af besøg, eller user objekt/token hvis data skal fetches
 * @returns {Array|Promise<Array>} Array af ledige tider hvor besøg er trukket fra (synkron hvis data er givet, ellers Promise)
 */
export function getLedighed(brugerIDEllerBruger, alleLedigeTiderEllerUser, alleBesøgEllerToken) {
  // Hvis begge arrays er givet, brug synkron version
  if (Array.isArray(alleLedigeTiderEllerUser) && Array.isArray(alleBesøgEllerToken)) {
    return getLedighedSync(brugerIDEllerBruger, alleLedigeTiderEllerUser, alleBesøgEllerToken);
  }
  
  // Ellers brug async version
  return getLedighedAsync(brugerIDEllerBruger, alleLedigeTiderEllerUser, alleBesøgEllerToken);
}

/**
 * Async version af getLedighed - fetcher data hvis det ikke er givet
 * @private
 */
async function getLedighedAsync(brugerIDEllerBruger, alleLedigeTiderEllerUser, alleBesøgEllerToken) {
  // Bestem hvilke parametre der er givet
  let brugerID = ekstraherBrugerID(brugerIDEllerBruger);
  let alleLedigeTider = null;
  let alleBesøg = null;
  let token = null;

  // Tjek om alleLedigeTiderEllerUser er et array (eksisterende data) eller user/token/undefined
  if (Array.isArray(alleLedigeTiderEllerUser)) {
    // Eksisterende data er givet
    alleLedigeTider = alleLedigeTiderEllerUser;
    alleBesøg = Array.isArray(alleBesøgEllerToken) ? alleBesøgEllerToken : null;
  } else {
    // Data skal fetches - alleLedigeTiderEllerUser er user/token eller undefined
    token = ekstraherToken(alleLedigeTiderEllerUser);
  }

  // Hvis ikke token er givet endnu, prøv at hente fra localStorage
  if (!token) {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        token = parsedUser.token;
      }
    } catch (e) {
      console.warn('getLedighed: Kunne ikke hente token fra localStorage');
    }
  }

  // Fetch data hvis det ikke er givet
  if (!alleLedigeTider || !alleBesøg) {
    if (!token) {
      throw new Error('getLedighed: Token er påkrævet for at fetche data. Giv enten user objekt, token, eller eksisterende data arrays.');
    }

    try {
      const [ledigeTiderRes, besøgRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/ledige-tider`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        axios.get(`${import.meta.env.VITE_API_URL}/besoeg`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      alleLedigeTider = alleLedigeTider || ledigeTiderRes.data;
      alleBesøg = alleBesøg || besøgRes.data;
    } catch (error) {
      console.error('getLedighed: Fejl ved fetching af data:', error);
      throw error;
    }
  }

  // Filtrerer til kun ledige tider og besøg for denne bruger (eller alle hvis brugerID er null)
  const relevanteLedigeTider = brugerID === null
    ? alleLedigeTider
    : alleLedigeTider.filter(tid => String(tid.brugerID) === String(brugerID));
  
  const relevanteBesøg = brugerID === null
    ? alleBesøg
    : alleBesøg.filter(besøg => String(besøg.brugerID) === String(brugerID));

  // Beregner ledige tider minus besøg
  return beregnLedigeTiderMinusBesøg(relevanteLedigeTider, relevanteBesøg);
}