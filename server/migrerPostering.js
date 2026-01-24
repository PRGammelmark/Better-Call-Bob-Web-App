import mongoose from 'mongoose';
import Postering from './models/posteringModel.js';
import Timetype from './models/timetyperModel.js';
import FasteTillaeg from './models/fasteTillaegModel.js';
import ProcentTillaeg from './models/procentTillaegModel.js';
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

/**
 * Migrerer en gammel postering til den nye struktur
 * Scriptet er ikke-destruktivt - det udfylder kun felter, der ikke allerede er udfyldt
 * 
 * BRUG:
 * node server/migrerPostering.js <POSTERING_ID>
 * 
 * EKSEMPEL:
 * node server/migrerPostering.js 695d65d12b051d1399127597
 */

const connect = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('Connection failed:', err);
    process.exit(1);
  }
};

/**
 * Beregner momsbeløb og totaler for et beløb
 */
function beregnMomsOgTotaler(beløbEksMoms, momsSats = 25) {
  const momsBeløb = beløbEksMoms * (momsSats / 100);
  const totalInklMoms = beløbEksMoms + momsBeløb;
  return {
    momsBeløb,
    totalInklMoms
  };
}

/**
 * Konverterer gamle timer-felter til timeregistrering array
 * VIGTIGT: Opstart skal IKKE være her - det hører til i fasteTillæg
 * @param {Object} postering - Posteringen der skal migreres
 * @param {Array} timetyper - Array af alle aktive timetyper (til ID lookup)
 */
function konverterTimeregistrering(postering, timetyper) {
  // Hvis timeregistrering allerede eksisterer og har indhold, returner den
  if (postering.timeregistrering && Array.isArray(postering.timeregistrering) && postering.timeregistrering.length > 0) {
    return postering.timeregistrering;
  }

  const timeregistrering = [];
  const satser = postering.satser || {};
  const rabatProcent = postering.rabatProcent || 0;
  const rabatMultiplikator = 1 - (rabatProcent / 100);
  const momsSats = postering.momsDefault?.sats || 25;
  const momsLand = postering.momsDefault?.land || 'DK';

  // Find timetyper fra database
  const handymanTimetype = timetyper.find(t => 
    t.navn === 'Handymantime' || t.navn === 'Handymantimer' || t.nummer === 1
  );
  const tømrerTimetype = timetyper.find(t => 
    t.navn === 'Tømrertime' || t.navn === 'TømrerTimer' || t.nummer === 2
  );
  const rådgivningTimetype = timetyper.find(t => 
    t.navn === 'Rådgivningstime' || t.navn === 'Rådgivning, opmåling & vejledning' || t.navn === 'Rådgivning' || t.nummer === 3
  );

  // Handymantime
  if (postering.handymanTimer && postering.handymanTimer > 0) {
    const honorarSats = satser.handymanTimerHonorar || 300;
    const prisSats = satser.handymanTimerPris || (honorarSats * 1.544); // Standard ratio hvis ikke sat
    
    const honorarTotal = honorarSats * postering.handymanTimer * rabatMultiplikator;
    const prisEksMoms = prisSats * postering.handymanTimer * rabatMultiplikator;
    const { momsBeløb, totalInklMoms } = beregnMomsOgTotaler(prisEksMoms, momsSats);

    timeregistrering.push({
      timetypeId: handymanTimetype?._id || null,
      navn: 'Handymantime',
      beskrivelse: 'Opgaver, der kræver småt værktøj',
      antal: postering.handymanTimer,
      pris: {
        sats: prisSats,
        rabatProcent: rabatProcent,
        rabatBeløb: prisSats * postering.handymanTimer * (rabatProcent / 100),
        momsLand: momsLand,
        momsSats: momsSats,
        momsType: 'default',
        momsBeløb: momsBeløb,
        totalEksMoms: prisEksMoms,
        totalInklMoms: totalInklMoms
      },
      honorar: {
        sats: honorarSats,
        rabatProcent: rabatProcent,
        rabatBeløb: honorarSats * postering.handymanTimer * (rabatProcent / 100),
        total: honorarTotal
      }
    });
  }

  // Tømrertime
  if (postering.tømrerTimer && postering.tømrerTimer > 0) {
    const honorarSats = satser.tømrerTimerHonorar || 360;
    const prisSats = satser.tømrerTimerPris || (honorarSats * 1.509); // Standard ratio hvis ikke sat
    
    const honorarTotal = honorarSats * postering.tømrerTimer * rabatMultiplikator;
    const prisEksMoms = prisSats * postering.tømrerTimer * rabatMultiplikator;
    const { momsBeløb, totalInklMoms } = beregnMomsOgTotaler(prisEksMoms, momsSats);

    timeregistrering.push({
      timetypeId: tømrerTimetype?._id || null,
      navn: 'Tømrertime',
      beskrivelse: 'Opgaver, der kræver stort værktøj',
      antal: postering.tømrerTimer,
      pris: {
        sats: prisSats,
        rabatProcent: rabatProcent,
        rabatBeløb: prisSats * postering.tømrerTimer * (rabatProcent / 100),
        momsLand: momsLand,
        momsSats: momsSats,
        momsType: 'default',
        momsBeløb: momsBeløb,
        totalEksMoms: prisEksMoms,
        totalInklMoms: totalInklMoms
      },
      honorar: {
        sats: honorarSats,
        rabatProcent: rabatProcent,
        rabatBeløb: honorarSats * postering.tømrerTimer * (rabatProcent / 100),
        total: honorarTotal
      }
    });
  }

  // Rådgivning, opmåling & vejledning
  if (postering.rådgivningOpmålingVejledning && postering.rådgivningOpmålingVejledning > 0) {
    const honorarSats = satser.rådgivningOpmålingVejledningHonorar || 360;
    const prisSats = satser.rådgivningOpmålingVejledningPris || (honorarSats * 1.509); // Standard ratio hvis ikke sat
    
    const honorarTotal = honorarSats * postering.rådgivningOpmålingVejledning * rabatMultiplikator;
    const prisEksMoms = prisSats * postering.rådgivningOpmålingVejledning * rabatMultiplikator;
    const { momsBeløb, totalInklMoms } = beregnMomsOgTotaler(prisEksMoms, momsSats);

    timeregistrering.push({
      timetypeId: rådgivningTimetype?._id || null,
      navn: 'Rådgivningstime',
      beskrivelse: 'Rådgivning, opmåling & vejledning',
      antal: postering.rådgivningOpmålingVejledning,
      pris: {
        sats: prisSats,
        rabatProcent: rabatProcent,
        rabatBeløb: prisSats * postering.rådgivningOpmålingVejledning * (rabatProcent / 100),
        momsLand: momsLand,
        momsSats: momsSats,
        momsType: 'default',
        momsBeløb: momsBeløb,
        totalEksMoms: prisEksMoms,
        totalInklMoms: totalInklMoms
      },
      honorar: {
        sats: honorarSats,
        rabatProcent: rabatProcent,
        rabatBeløb: honorarSats * postering.rådgivningOpmålingVejledning * (rabatProcent / 100),
        total: honorarTotal
      }
    });
  }

  return timeregistrering;
}

/**
 * Konverterer opstart og trailer til fasteTillæg array
 * Opstart og trailer er faste tillæg, ikke timer
 * @param {Object} postering - Posteringen der skal migreres
 * @param {Array} fasteTillaeg - Array af alle aktive faste tillæg (til ID lookup)
 */
function konverterFasteTillæg(postering, fasteTillaeg) {
  // Hvis fasteTillæg allerede eksisterer og har indhold, tjek om opstart og trailer allerede er der
  if (postering.fasteTillæg && Array.isArray(postering.fasteTillæg) && postering.fasteTillæg.length > 0) {
    const harOpstart = postering.fasteTillæg.some(ft => ft.navn === 'Opstartsgebyr' || ft.navn === 'Opstart');
    const harTrailer = postering.fasteTillæg.some(ft => ft.navn?.toLowerCase().includes('trailer'));
    
    // Hvis begge allerede findes, returner som den er
    if (harOpstart && (harTrailer || !postering.trailer)) {
      return postering.fasteTillæg;
    }
  }

  const fasteTillægArray = postering.fasteTillæg && Array.isArray(postering.fasteTillæg) ? [...postering.fasteTillæg] : [];
  const satser = postering.satser || {};
  const rabatProcent = postering.rabatProcent || 0;
  const rabatMultiplikator = 1 - (rabatProcent / 100);
  const momsSats = postering.momsDefault?.sats || 25;
  const momsLand = postering.momsDefault?.land || 'DK';

  // Find faste tillæg fra database
  const opstartTillaeg = fasteTillaeg.find(t => 
    t.navn === 'Opstartsgebyr' || t.navn === 'Opstart' || t.nummer === 1
  );
  const trailerTillaeg = fasteTillaeg.find(t => 
    t.navn?.toLowerCase().includes('trailer') || t.nummer === 2
  );

  // Tjek om opstart allerede er tilføjet
  const harOpstart = fasteTillægArray.some(ft => ft.navn === 'Opstartsgebyr' || ft.navn === 'Opstart');

  // Opstart - dette er et fast tillæg, ikke en timer
  if (!harOpstart && postering.opstart && postering.opstart > 0) {
    const honorarSats = satser.opstartsgebyrHonorar || 200;
    const prisSats = satser.opstartsgebyrPris || (honorarSats * 1.596); // Standard ratio hvis ikke sat
    
    const honorarTotal = honorarSats * postering.opstart * rabatMultiplikator;
    const prisEksMoms = prisSats * postering.opstart * rabatMultiplikator;
    const { momsBeløb, totalInklMoms } = beregnMomsOgTotaler(prisEksMoms, momsSats);

    fasteTillægArray.push({
      tillaegId: opstartTillaeg?._id || null,
      navn: 'Opstartsgebyr',
      beskrivelse: 'Opstartsgebyr',
      antal: postering.opstart,
      pris: {
        sats: prisSats,
        rabatProcent: rabatProcent,
        rabatBeløb: prisSats * postering.opstart * (rabatProcent / 100),
        momsLand: momsLand,
        momsSats: momsSats,
        momsType: 'default',
        momsBeløb: momsBeløb,
        totalEksMoms: prisEksMoms,
        totalInklMoms: totalInklMoms
      },
      honorar: {
        sats: honorarSats,
        rabatProcent: rabatProcent,
        rabatBeløb: honorarSats * postering.opstart * (rabatProcent / 100),
        total: honorarTotal
      }
    });
  }

  // Tjek om trailer allerede er tilføjet
  const harTrailer = fasteTillægArray.some(ft => ft.navn?.toLowerCase().includes('trailer'));

  // Trailer - dette er også et fast tillæg
  if (!harTrailer && postering.trailer === true) {
    const honorarSats = satser.trailerHonorar || 200;
    const prisSats = satser.trailerPris || (honorarSats * 1.596); // Standard ratio hvis ikke sat
    const antal = 1; // Trailer er 1 pr. postering i det gamle system
    
    const honorarTotal = honorarSats * antal * rabatMultiplikator;
    const prisEksMoms = prisSats * antal * rabatMultiplikator;
    const { momsBeløb, totalInklMoms } = beregnMomsOgTotaler(prisEksMoms, momsSats);

    fasteTillægArray.push({
      tillaegId: trailerTillaeg?._id || null,
      navn: 'Trailerudlejning',
      beskrivelse: 'Trailerudlejning',
      antal: antal,
      pris: {
        sats: prisSats,
        rabatProcent: rabatProcent,
        rabatBeløb: prisSats * antal * (rabatProcent / 100),
        momsLand: momsLand,
        momsSats: momsSats,
        momsType: 'default',
        momsBeløb: momsBeløb,
        totalEksMoms: prisEksMoms,
        totalInklMoms: totalInklMoms
      },
      honorar: {
        sats: honorarSats,
        rabatProcent: rabatProcent,
        rabatBeløb: honorarSats * antal * (rabatProcent / 100),
        total: honorarTotal
      }
    });
  }

  return fasteTillægArray;
}

/**
 * Konverterer gamle tillæg-felter til procentTillæg array
 * VIGTIGT: ProcentTillæg gives KUN på faktiske timer (handymanTimer, tømrerTimer, rådgivningOpmålingVejledning)
 * IKKE på faste tillæg eller opstart (Opstartsgebyr)
 * @param {Object} postering - Posteringen der skal migreres
 * @param {Array} procentTillaeg - Array af alle aktive procent tillæg (til ID lookup)
 */
function konverterProcentTillæg(postering, procentTillaeg) {
  // Hvis procentTillæg allerede eksisterer og har indhold, returner den
  if (postering.procentTillæg && Array.isArray(postering.procentTillæg) && postering.procentTillæg.length > 0) {
    return postering.procentTillæg;
  }

  const procentTillægArray = [];
  const satser = postering.satser || {};
  const rabatProcent = postering.rabatProcent || 0;
  const momsSats = postering.momsDefault?.sats || 25;
  const momsLand = postering.momsDefault?.land || 'DK';

  // Find procent tillæg fra database
  const aftenTillaeg = procentTillaeg.find(t => 
    t.navn?.includes('Aften') || t.navn === 'Aftentillæg' || t.nummer === 1
  );
  const natTillaeg = procentTillaeg.find(t => 
    t.navn?.includes('Nat') || t.navn === 'Nattillæg' || t.nummer === 2
  );

  // Aften tillæg (50% tillæg) - KUN på timeregistrering, ikke på faste tillæg eller opstart
  if (postering.aftenTillæg) {
    // Find alle timeregistreringer der skal have aften tillæg
    // VIGTIGT: Vi itererer KUN over timeregistrering, ikke fasteTillæg
    // VIGTIGT: Opstart (Opstartsgebyr) skal IKKE have procentTillæg
    const timeregistrering = postering.timeregistrering || [];
    
    timeregistrering.forEach((tr) => {
      // Spring over opstart - procentTillæg gives kun på faktiske timer
      if (tr.navn === 'Opstartsgebyr' || tr.navn === 'Opstart') {
        return;
      }
      
      if (tr.antal > 0) {
        const aftenTillægProcentSats = satser.aftenTillægHonorar || 50;
        const aftenTillægPrisProcentSats = satser.aftenTillægPris || 50; // Procent, ikke beløb
        
        // Grundlag er timeregistreringens pris/honorar (allerede med rabat)
        // VIGTIGT: Rabat skal IKKE påføres igen - grundlaget er allerede med rabat
        const grundlagPris = tr.pris?.totalEksMoms || 0;
        const grundlagHonorar = tr.honorar?.total || 0;
        
        // Beregn tillægget som procent af grundlaget (ingen ekstra rabat)
        const tillægPris = grundlagPris * (aftenTillægPrisProcentSats / 100);
        const tillægHonorar = grundlagHonorar * (aftenTillægProcentSats / 100);
        
        const { momsBeløb, totalInklMoms } = beregnMomsOgTotaler(tillægPris, momsSats);

        procentTillægArray.push({
          procentTillaegId: aftenTillaeg?._id || null,
          timetypeId: tr.timetypeId || null,
          navn: 'Aftentillæg (kl. 18:00-23:00)',
          beskrivelse: 'Tillæg v. aftentarbejde',
          timetypeNavn: tr.navn,
          timetypeAntal: tr.antal,
          pris: {
            procentSats: aftenTillægPrisProcentSats,
            grundlag: grundlagPris,
            rabatProcent: rabatProcent,
            rabatBeløb: 0, // Rabat er allerede i grundlaget
            momsLand: momsLand,
            momsSats: momsSats,
            momsType: 'default',
            momsBeløb: momsBeløb,
            totalEksMoms: tillægPris,
            totalInklMoms: totalInklMoms
          },
          honorar: {
            procentSats: aftenTillægProcentSats,
            grundlag: grundlagHonorar,
            rabatProcent: rabatProcent,
            rabatBeløb: 0, // Rabat er allerede i grundlaget
            total: tillægHonorar
          }
        });
      }
    });
  }

  // Nat tillæg (100% tillæg) - KUN på timeregistrering, ikke på faste tillæg eller opstart
  if (postering.natTillæg) {
    // Find alle timeregistreringer der skal have nat tillæg
    // VIGTIGT: Vi itererer KUN over timeregistrering, ikke fasteTillæg
    // VIGTIGT: Opstart (Opstartsgebyr) skal IKKE have procentTillæg
    const timeregistrering = postering.timeregistrering || [];
    
    timeregistrering.forEach((tr) => {
      // Spring over opstart - procentTillæg gives kun på faktiske timer
      if (tr.navn === 'Opstartsgebyr' || tr.navn === 'Opstart') {
        return;
      }
      
      if (tr.antal > 0) {
        const natTillægProcentSats = satser.natTillægHonorar || 100;
        const natTillægPrisProcentSats = satser.natTillægPris || 100; // Procent, ikke beløb
        
        // Grundlag er timeregistreringens pris/honorar (allerede med rabat)
        // VIGTIGT: Rabat skal IKKE påføres igen - grundlaget er allerede med rabat
        const grundlagPris = tr.pris?.totalEksMoms || 0;
        const grundlagHonorar = tr.honorar?.total || 0;
        
        // Beregn tillægget som procent af grundlaget (ingen ekstra rabat)
        const tillægPris = grundlagPris * (natTillægPrisProcentSats / 100);
        const tillægHonorar = grundlagHonorar * (natTillægProcentSats / 100);
        
        const { momsBeløb, totalInklMoms } = beregnMomsOgTotaler(tillægPris, momsSats);

        procentTillægArray.push({
          procentTillaegId: natTillaeg?._id || null,
          timetypeId: tr.timetypeId || null,
          navn: 'Nattillæg (kl. 23:00-07:00)',
          beskrivelse: 'Tillæg v. natarbejde',
          timetypeNavn: tr.navn,
          timetypeAntal: tr.antal,
          pris: {
            procentSats: natTillægPrisProcentSats,
            grundlag: grundlagPris,
            rabatProcent: rabatProcent,
            rabatBeløb: 0, // Rabat er allerede i grundlaget
            momsLand: momsLand,
            momsSats: momsSats,
            momsType: 'default',
            momsBeløb: momsBeløb,
            totalEksMoms: tillægPris,
            totalInklMoms: totalInklMoms
          },
          honorar: {
            procentSats: natTillægProcentSats,
            grundlag: grundlagHonorar,
            rabatProcent: rabatProcent,
            rabatBeløb: 0, // Rabat er allerede i grundlaget
            total: tillægHonorar
          }
        });
      }
    });
  }

  return procentTillægArray;
}

/**
 * Konverterer gamle udlæg til materialer array med erUdlaeg: true
 * I det nye system gemmes udlæg som materialer med erUdlaeg-flagget sat
 * Beløbet i gamle udlæg er inkl. moms
 * @param {Object} postering - Posteringen der skal migreres
 */
function konverterUdlaegTilMaterialer(postering) {
  // Hvis der ikke er gamle udlæg, returner tom array
  if (!postering.udlæg || !Array.isArray(postering.udlæg) || postering.udlæg.length === 0) {
    return [];
  }

  const momsSats = postering.momsDefault?.sats || 25;
  const momsLand = postering.momsDefault?.land || 'DK';

  return postering.udlæg.map(udlæg => {
    // Udlæggets beløb er inkl. moms - dette er kostprisen (det medarbejderen har lagt ud)
    const udlægBeløb = udlæg.beløb || 0;
    
    // Kostpris = udlæggets beløb inkl. moms
    const kostpris = udlægBeløb;
    
    // totalInklMoms = kostpris + 25% (det kunden skal betale inkl. moms)
    const totalInklMoms = kostpris * 1.25;
    
    // Beregn resten baglæns fra totalInklMoms
    const totalEksMoms = totalInklMoms / (1 + momsSats / 100); // Fjern moms
    const momsBeløb = totalInklMoms - totalEksMoms;
    const salgspris = totalEksMoms; // Salgspris pr. stk (antal = 1)

    return {
      varenummer: "",
      beskrivelse: udlæg.beskrivelse || "Udlæg",
      antal: 1,
      kostpris: kostpris, // Medarbejderens kostpris = udlæggets beløb inkl. moms
      salgspris: salgspris, // Salgspris eks. moms pr. stk
      momsLand: momsLand,
      momsSats: momsSats,
      momsBeløb: momsBeløb,
      totalEksMoms: totalEksMoms,
      totalInklMoms: totalInklMoms,
      manueltRegistreret: true,
      erUdlaeg: true, // Markér som udlæg
      totalMedarbejderUdlaeg: kostpris, // Medarbejderen har lagt dette beløb ud
      restMedarbejderUdlaeg: kostpris, // Det skyldige beløb til medarbejderen
      kvittering: udlæg.kvittering || "",
      billede: ""
    };
  });
}

/**
 * Beregner totaler fra arrays
 */
function beregnTotaler(timeregistrering, fasteTillæg, procentTillæg, udlæg, materialer) {
  const totalPrisEksklMoms = 
    (timeregistrering || []).reduce((sum, tr) => sum + (tr.pris?.totalEksMoms || 0), 0) +
    (fasteTillæg || []).reduce((sum, ft) => sum + (ft.pris?.totalEksMoms || 0), 0) +
    (procentTillæg || []).reduce((sum, pt) => sum + (pt.pris?.totalEksMoms || 0), 0) +
    (udlæg || []).reduce((sum, u) => sum + (u.totalEksMoms || 0), 0) +
    (materialer || []).reduce((sum, m) => sum + (m.totalEksMoms || 0), 0);

  const totalMoms = 
    (timeregistrering || []).reduce((sum, tr) => sum + (tr.pris?.momsBeløb || 0), 0) +
    (fasteTillæg || []).reduce((sum, ft) => sum + (ft.pris?.momsBeløb || 0), 0) +
    (procentTillæg || []).reduce((sum, pt) => sum + (pt.pris?.momsBeløb || 0), 0) +
    (udlæg || []).reduce((sum, u) => sum + (u.momsBeløb || 0), 0) +
    (materialer || []).reduce((sum, m) => sum + (m.momsBeløb || 0), 0);

  const totalPrisInklMoms = totalPrisEksklMoms + totalMoms;

  const totalDynamiskHonorar = 
    (timeregistrering || []).reduce((sum, tr) => sum + (tr.honorar?.total || 0), 0) +
    (fasteTillæg || []).reduce((sum, ft) => sum + (ft.honorar?.total || 0), 0) +
    (procentTillæg || []).reduce((sum, pt) => sum + (pt.honorar?.total || 0), 0) +
    (udlæg || []).reduce((sum, u) => sum + (u.totalEksMoms || 0), 0) +
    (materialer || []).reduce((sum, m) => sum + (m.totalMedarbejderUdlaeg || 0), 0);

  return {
    totalPrisEksklMoms,
    totalMoms,
    totalPrisInklMoms,
    totalDynamiskHonorar
  };
}

/**
 * Migrerer satser fra gammel struktur til ny struktur
 * Bevarer legacy felter for bagudkompatibilitet
 * @param {Object} postering - Posteringen der skal migreres
 * @param {Array} timetyper - Array af alle aktive timetyper
 * @param {Array} fasteTillaeg - Array af alle aktive faste tillæg
 * @param {Array} procentTillaeg - Array af alle aktive procent tillæg
 */
function migrerSatser(postering, timetyper, fasteTillaeg, procentTillaeg) {
  // Hvis satser allerede har ny struktur (objekter med navn og honorarSats), returner som den er
  if (postering.satser?.timetyper) {
    const førsteTimetype = Object.values(postering.satser.timetyper)[0];
    if (førsteTimetype && typeof førsteTimetype === 'object' && førsteTimetype.navn && førsteTimetype.honorarSats) {
      return postering.satser; // Allerede i ny struktur med navn
    }
  }
  if (postering.satser?.fasteTillaeg) {
    const førsteFasteTillaeg = Object.values(postering.satser.fasteTillaeg)[0];
    if (førsteFasteTillaeg && typeof førsteFasteTillaeg === 'object' && førsteFasteTillaeg.navn && førsteFasteTillaeg.honorarSats) {
      return postering.satser; // Allerede i ny struktur med navn
    }
  }
  if (postering.satser?.procentTillaeg) {
    const førsteProcentTillaeg = Object.values(postering.satser.procentTillaeg)[0];
    if (førsteProcentTillaeg && typeof førsteProcentTillaeg === 'object' && førsteProcentTillaeg.navn && førsteProcentTillaeg.honorarSats) {
      return postering.satser; // Allerede i ny struktur med navn
    }
  }

  const gamleSatser = postering.satser || {};
  const nyeSatser = {
    timetyper: {},
    fasteTillaeg: {},
    procentTillaeg: {},
    // Behold alle legacy felter for bagudkompatibilitet
    ...gamleSatser
  };

  // Map gamle navne til nye IDs for timetyper
  // Prøv først at matche på navn, derefter på nummer
  const handymanTimetype = timetyper.find(t => 
    t.navn === 'Handymantime' || 
    t.navn === 'Handymantimer' ||
    t.nummer === 1
  );
  
  const tømrerTimetype = timetyper.find(t => 
    t.navn === 'Tømrertime' || 
    t.navn === 'TømrerTimer' ||
    t.nummer === 2
  );
  
  const rådgivningTimetype = timetyper.find(t => 
    t.navn === 'Rådgivningstime' || 
    t.navn === 'Rådgivning, opmåling & vejledning' ||
    t.navn === 'Rådgivning' ||
    t.nummer === 3
  );

  if (gamleSatser.handymanTimerHonorar && handymanTimetype) {
    nyeSatser.timetyper[handymanTimetype._id.toString()] = {
      navn: handymanTimetype.navn,
      honorarSats: gamleSatser.handymanTimerHonorar
    };
  }
  if (gamleSatser.tømrerTimerHonorar && tømrerTimetype) {
    nyeSatser.timetyper[tømrerTimetype._id.toString()] = {
      navn: tømrerTimetype.navn,
      honorarSats: gamleSatser.tømrerTimerHonorar
    };
  }
  if (gamleSatser.rådgivningOpmålingVejledningHonorar && rådgivningTimetype) {
    nyeSatser.timetyper[rådgivningTimetype._id.toString()] = {
      navn: rådgivningTimetype.navn,
      honorarSats: gamleSatser.rådgivningOpmålingVejledningHonorar
    };
  }

  // Map gamle navne til nye IDs for faste tillæg
  const opstartTillaeg = fasteTillaeg.find(t => 
    t.navn === 'Opstartsgebyr' || 
    t.navn === 'Opstart' ||
    t.nummer === 1
  );
  
  const trailerTillaeg = fasteTillaeg.find(t => 
    t.navn?.toLowerCase().includes('trailer') ||
    t.nummer === 2
  );

  if (gamleSatser.opstartsgebyrHonorar && opstartTillaeg) {
    nyeSatser.fasteTillaeg[opstartTillaeg._id.toString()] = {
      navn: opstartTillaeg.navn,
      honorarSats: gamleSatser.opstartsgebyrHonorar
    };
  }
  
  if (gamleSatser.trailerHonorar && trailerTillaeg) {
    nyeSatser.fasteTillaeg[trailerTillaeg._id.toString()] = {
      navn: trailerTillaeg.navn,
      honorarSats: gamleSatser.trailerHonorar
    };
  }

  // Map gamle navne til nye IDs for procent tillæg
  const aftenTillaeg = procentTillaeg.find(t => 
    t.navn.includes('Aften') || 
    t.navn === 'Aftentillæg' ||
    t.nummer === 1
  );
  
  const natTillaeg = procentTillaeg.find(t => 
    t.navn.includes('Nat') || 
    t.navn === 'Nattillæg' ||
    t.nummer === 2
  );

  if (gamleSatser.aftenTillægHonorar && aftenTillaeg) {
    nyeSatser.procentTillaeg[aftenTillaeg._id.toString()] = {
      navn: aftenTillaeg.navn,
      honorarSats: gamleSatser.aftenTillægHonorar
    };
  }
  if (gamleSatser.natTillægHonorar && natTillaeg) {
    nyeSatser.procentTillaeg[natTillaeg._id.toString()] = {
      navn: natTillaeg.navn,
      honorarSats: gamleSatser.natTillægHonorar
    };
  }

  return nyeSatser;
}

/**
 * Migrerer en postering
 * @param {string} posteringId - ID på posteringen der skal migreres
 * @param {boolean} validateOnly - Hvis true, sammenligner kun værdier uden at gemme
 */
const migrerPostering = async (posteringId, validateOnly = false) => {
  try {
    const postering = await Postering.findById(posteringId);
    
    if (!postering) {
      console.error(`Postering med ID ${posteringId} blev ikke fundet.`);
      return;
    }

    console.log(`Migrerer postering: ${posteringId}`);
    console.log(`Beskrivelse: ${postering.beskrivelse || '(ingen)'}`);

    // Hent alle aktive typer fra databasen for satser-migration
    const timetyper = await Timetype.find({ aktiv: true }).lean();
    const fasteTillaeg = await FasteTillaeg.find({ aktiv: true }).lean();
    const procentTillaeg = await ProcentTillaeg.find({ aktiv: true }).lean();

    const opdateringer = {};

    // 1. Migrer satser fra gammel struktur til ny struktur
    if (postering.satser) {
      const migreredeSatser = migrerSatser(postering, timetyper, fasteTillaeg, procentTillaeg);
      
      // Tjek om der er ændringer (nye mappings tilføjet med navn og honorarSats)
      const harNyeMappings = 
        Object.keys(migreredeSatser.timetyper || {}).length > 0 ||
        Object.keys(migreredeSatser.fasteTillaeg || {}).length > 0 ||
        Object.keys(migreredeSatser.procentTillaeg || {}).length > 0;
      
      // Tjek om eksisterende mappings har ny struktur (objekter med navn og honorarSats)
      const harEksisterendeMappings = 
        (postering.satser.timetyper && Object.keys(postering.satser.timetyper).length > 0) ||
        (postering.satser.fasteTillaeg && Object.keys(postering.satser.fasteTillaeg).length > 0) ||
        (postering.satser.procentTillaeg && Object.keys(postering.satser.procentTillaeg).length > 0);
      
      // Tjek om eksisterende mappings har ny struktur med navn
      let harEksisterendeMappingsMedNavn = false;
      if (harEksisterendeMappings) {
        const førsteTimetype = postering.satser.timetyper ? Object.values(postering.satser.timetyper)[0] : null;
        const førsteFasteTillaeg = postering.satser.fasteTillaeg ? Object.values(postering.satser.fasteTillaeg)[0] : null;
        const førsteProcentTillaeg = postering.satser.procentTillaeg ? Object.values(postering.satser.procentTillaeg)[0] : null;
        
        harEksisterendeMappingsMedNavn = 
          (førsteTimetype && typeof førsteTimetype === 'object' && førsteTimetype.navn && førsteTimetype.honorarSats) ||
          (førsteFasteTillaeg && typeof førsteFasteTillaeg === 'object' && førsteFasteTillaeg.navn && førsteFasteTillaeg.honorarSats) ||
          (førsteProcentTillaeg && typeof førsteProcentTillaeg === 'object' && førsteProcentTillaeg.navn && førsteProcentTillaeg.honorarSats);
      }
      
      if (harNyeMappings && (!harEksisterendeMappings || !harEksisterendeMappingsMedNavn)) {
        opdateringer.satser = migreredeSatser;
        console.log('  - Migrerer satser til ny struktur');
        console.log(`    - Timetyper mappings: ${Object.keys(migreredeSatser.timetyper).length}`);
        console.log(`    - FasteTillæg mappings: ${Object.keys(migreredeSatser.fasteTillaeg).length}`);
        console.log(`    - ProcentTillæg mappings: ${Object.keys(migreredeSatser.procentTillaeg).length}`);
      }
    }

    // Opret postering med migrerede satser til brug i de andre funktioner
    const posteringMedMigreredeSatser = {
      ...postering.toObject(),
      satser: opdateringer.satser || postering.satser
    };

    // 2. Sæt posteringVersion hvis ikke sat
    if (postering.posteringVersion === undefined || postering.posteringVersion === null) {
      opdateringer.posteringVersion = 2;
      console.log('  - Sætter posteringVersion til 2');
    }

    // 3. Opdater momsDefault med _id hvis mangler (kun for gamle posteringer)
    // Tjek at posteringen ikke allerede er version 2
    if (postering.posteringVersion !== 2 && postering.momsDefault && !postering.momsDefault._id) {
      opdateringer.momsDefault = {
        ...postering.momsDefault,
        _id: new mongoose.Types.ObjectId()
      };
      console.log('  - Tilføjer _id til momsDefault');
    }

    // 4. Konverter timeregistrering (opstart skal IKKE være her)
    const nyTimeregistrering = konverterTimeregistrering(posteringMedMigreredeSatser, timetyper);
    
    // Fjern opstart fra timeregistrering hvis den findes der (fejl i gamle data)
    const timeregistreringUdenOpstart = nyTimeregistrering.filter(
      tr => tr.navn !== 'Opstartsgebyr' && tr.navn !== 'Opstart'
    );
    
    // Tjek også eksisterende timeregistrering for opstart
    const eksisterendeTimeregistrering = postering.timeregistrering || [];
    const harOpstartITimeregistrering = eksisterendeTimeregistrering.some(
      tr => tr.navn === 'Opstartsgebyr' || tr.navn === 'Opstart'
    );
    
    if (harOpstartITimeregistrering || timeregistreringUdenOpstart.length !== nyTimeregistrering.length) {
      // Fjern opstart fra eksisterende timeregistrering også
      const eksisterendeUdenOpstart = eksisterendeTimeregistrering.filter(
        tr => tr.navn !== 'Opstartsgebyr' && tr.navn !== 'Opstart'
      );
      
      if (eksisterendeUdenOpstart.length !== eksisterendeTimeregistrering.length) {
        opdateringer.timeregistrering = eksisterendeUdenOpstart;
        console.log('  - Fjerner opstart fra timeregistrering (skal være i fasteTillæg)');
      }
    }
    
    // Kun tilføj timeregistreringer hvis posteringen IKKE allerede har nogen
    if (timeregistreringUdenOpstart.length > 0 && (!postering.timeregistrering || postering.timeregistrering.length === 0)) {
      opdateringer.timeregistrering = timeregistreringUdenOpstart;
      console.log(`  - Tilføjer ${timeregistreringUdenOpstart.length} timeregistrering(er)`);
    }

    // 4b. Konverter opstart og trailer til fasteTillæg
    const nyeFasteTillæg = konverterFasteTillæg(posteringMedMigreredeSatser, fasteTillaeg);
    if (nyeFasteTillæg.length > (postering.fasteTillæg?.length || 0)) {
      opdateringer.fasteTillæg = nyeFasteTillæg;
      console.log(`  - Tilføjer opstart/trailer til fasteTillæg (${nyeFasteTillæg.length} stk)`);
    }

    // 5. Konverter procentTillæg (skal gøres efter timeregistrering er opdateret)
    // Brug den opdaterede postering til at beregne procentTillæg
    // VIGTIGT: Opstart er nu i fasteTillæg, så den vil automatisk blive sprunget over
    const posteringMedTimeregistrering = {
      ...posteringMedMigreredeSatser,
      ...opdateringer
    };
    const nyProcentTillæg = konverterProcentTillæg(posteringMedTimeregistrering, procentTillaeg);
    if (nyProcentTillæg.length > 0 && (!postering.procentTillæg || postering.procentTillæg.length === 0)) {
      opdateringer.procentTillæg = nyProcentTillæg;
      console.log(`  - Tilføjer ${nyProcentTillæg.length} procentTillæg`);
    }

    // 6. Konverter gamle udlæg til materialer med erUdlaeg: true
    const udlaegSomMaterialer = konverterUdlaegTilMaterialer(postering);
    if (udlaegSomMaterialer.length > 0) {
      // Flet med eksisterende materialer (hvis der er nogen)
      const eksisterendeMaterialer = postering.materialer || [];
      
      // Tjek om der allerede er migrerede udlæg i materialer
      const harMigreredeUdlaeg = eksisterendeMaterialer.some(m => m.erUdlaeg === true);
      
      if (!harMigreredeUdlaeg) {
        opdateringer.materialer = [...eksisterendeMaterialer, ...udlaegSomMaterialer];
        console.log(`  - Konverterer ${udlaegSomMaterialer.length} udlæg til materialer (erUdlaeg: true)`);
      }
    }

    // 7. Beregn og sæt totaler (kun hvis de ikke allerede er sat)
    const finalPostering = {
      ...postering.toObject(),
      ...opdateringer
    };
    
    const totaler = beregnTotaler(
      finalPostering.timeregistrering,
      finalPostering.fasteTillæg,
      finalPostering.procentTillæg,
      finalPostering.udlæg,
      finalPostering.materialer
    );

    if (postering.totalPrisEksklMoms === undefined || postering.totalPrisEksklMoms === null) {
      opdateringer.totalPrisEksklMoms = totaler.totalPrisEksklMoms;
      console.log(`  - Sætter totalPrisEksklMoms til ${totaler.totalPrisEksklMoms}`);
    }

    if (postering.totalMoms === undefined || postering.totalMoms === null) {
      opdateringer.totalMoms = totaler.totalMoms;
      console.log(`  - Sætter totalMoms til ${totaler.totalMoms}`);
    }

    if (postering.totalPrisInklMoms === undefined || postering.totalPrisInklMoms === null) {
      opdateringer.totalPrisInklMoms = totaler.totalPrisInklMoms;
      console.log(`  - Sætter totalPrisInklMoms til ${totaler.totalPrisInklMoms}`);
    }

    if (postering.totalDynamiskHonorar === undefined || postering.totalDynamiskHonorar === null) {
      opdateringer.totalDynamiskHonorar = totaler.totalDynamiskHonorar;
      console.log(`  - Sætter totalDynamiskHonorar til ${totaler.totalDynamiskHonorar}`);
    }

    // 8. Sæt brugDynamiskHonorar og brugFastHonorar baseret på eksisterende værdier
    // VIGTIGT: Schema har default: false, så vi kan ikke bruge undefined-check
    // Vi sætter altid disse værdier for gamle posteringer (version !== 2)
    const erGammelPostering = postering.posteringVersion !== 2;
    
    if (erGammelPostering) {
      // --- HONORAR ---
      console.log(`  - DEBUG: dynamiskHonorarBeregning = ${postering.dynamiskHonorarBeregning} (type: ${typeof postering.dynamiskHonorarBeregning})`);
      console.log(`  - DEBUG: fastHonorar = ${postering.fastHonorar} (type: ${typeof postering.fastHonorar})`);
      
      // Bestem om posteringen bruger fast honorar:
      // - Hvis dynamiskHonorarBeregning === false, så bruges fast honorar (også selvom det er 0)
      const dynamiskHonorarErSlåetFra = postering.dynamiskHonorarBeregning === false;
      
      // brugDynamiskHonorar = true MEDMINDRE dynamisk honorar er slået fra
      opdateringer.brugDynamiskHonorar = !dynamiskHonorarErSlåetFra;
      console.log(`  - Sætter brugDynamiskHonorar til ${opdateringer.brugDynamiskHonorar}`);
      
      // brugFastHonorar = true hvis dynamisk honorar er slået fra
      opdateringer.brugFastHonorar = dynamiskHonorarErSlåetFra;
      console.log(`  - Sætter brugFastHonorar til ${opdateringer.brugFastHonorar}`);
      
      opdateringer.totalFastHonorar = postering.fastHonorar || 0;
      console.log(`  - Sætter totalFastHonorar til ${opdateringer.totalFastHonorar}`);
      
      // --- PRIS ---
      console.log(`  - DEBUG: dynamiskPrisBeregning = ${postering.dynamiskPrisBeregning} (type: ${typeof postering.dynamiskPrisBeregning})`);
      console.log(`  - DEBUG: fastPris = ${postering.fastPris} (type: ${typeof postering.fastPris})`);
      
      // Bestem om posteringen bruger fast pris (tilbudspris):
      // - Hvis dynamiskPrisBeregning === false, så sæt tilbudsPrisEksklMoms (også selvom det er 0)
      const dynamiskPrisErSlåetFra = postering.dynamiskPrisBeregning === false;
      
      // Hvis dynamisk pris er slået fra, sæt tilbudsPrisEksklMoms og opdater totaler
      if (dynamiskPrisErSlåetFra) {
        const tilbudsPris = postering.fastPris || 0;
        const momsSats = postering.momsDefault?.sats || 25;
        
        opdateringer.tilbudsPrisEksklMoms = tilbudsPris;
        opdateringer.totalPrisEksklMoms = tilbudsPris;
        opdateringer.totalMoms = tilbudsPris * (momsSats / 100);
        opdateringer.totalPrisInklMoms = tilbudsPris + opdateringer.totalMoms;
        
        console.log(`  - Sætter tilbudsPrisEksklMoms til ${tilbudsPris}`);
        console.log(`  - Sætter totalPrisEksklMoms til ${tilbudsPris}`);
        console.log(`  - Sætter totalMoms til ${opdateringer.totalMoms}`);
        console.log(`  - Sætter totalPrisInklMoms til ${opdateringer.totalPrisInklMoms}`);
      }
      // Hvis dynamisk pris er slået TIL, skal tilbudsPrisEksklMoms forblive undefined (ikke sættes)
    }

    // 9. Validate mode: Sammenlign gammel og ny pris/honorar
    if (validateOnly) {
      // Beregn valideringsresultater
      const gammelTotalPris = postering.totalPris ?? postering.dynamiskPris ?? 0;
      const nyTotalPrisEksklMoms = opdateringer.totalPrisEksklMoms ?? postering.totalPrisEksklMoms ?? 0;
      const prisForskel = Math.abs(gammelTotalPris - nyTotalPrisEksklMoms);
      const prisMatch = prisForskel < 0.01;
      
      const gammelTotalHonorar = postering.totalHonorar ?? postering.dynamiskHonorar ?? 0;
      const nyTotalDynamiskHonorar = opdateringer.totalDynamiskHonorar ?? postering.totalDynamiskHonorar ?? 0;
      const nyTotalFastHonorar = opdateringer.totalFastHonorar ?? postering.totalFastHonorar ?? 0;
      const nyBrugFastHonorar = opdateringer.brugFastHonorar ?? postering.brugFastHonorar ?? false;
      const nyTotalHonorar = nyBrugFastHonorar ? nyTotalFastHonorar : nyTotalDynamiskHonorar;
      const honorarForskel = Math.abs(gammelTotalHonorar - nyTotalHonorar);
      const honorarMatch = honorarForskel < 0.01;
      
      // Returner resultat objekt (bruges af validateAll)
      return {
        posteringId: posteringId,
        beskrivelse: postering.beskrivelse || '(ingen)',
        prisMatch,
        honorarMatch,
        gammelTotalPris,
        nyTotalPrisEksklMoms,
        prisForskel,
        gammelTotalHonorar,
        nyTotalHonorar,
        honorarForskel,
        nyBrugFastHonorar,
        harTilbudspris: opdateringer.tilbudsPrisEksklMoms !== undefined,
        gammelFastPris: postering.fastPris ?? 0,
        nyTilbudspris: opdateringer.tilbudsPrisEksklMoms ?? 0
      };
    }

    // 10. Opdater posteringen (kun hvis der er ændringer og vi ikke er i validate mode)
    if (Object.keys(opdateringer).length > 0) {
      await Postering.findByIdAndUpdate(posteringId, { $set: opdateringer }, { new: true });
      console.log(`\n✅ Postering migreret succesfuldt!`);
      console.log(`   Opdaterede felter: ${Object.keys(opdateringer).join(', ')}`);
    } else {
      console.log(`\nℹ️  Posteringen har allerede alle nye felter udfyldt. Ingen ændringer nødvendige.`);
    }

  } catch (error) {
    console.error('Fejl ved migrering:', error);
    throw error;
  }
};

/**
 * Printer detaljeret validerings-output for en enkelt postering
 */
function printValideringsResultat(result) {
  console.log('\n📊 VALIDERING (ingen ændringer gemmes):');
  console.log('─'.repeat(60));
  
  console.log(`\n💰 PRIS:`);
  console.log(`   Gammel totalPris:       ${result.gammelTotalPris.toFixed(2)} kr.`);
  console.log(`   Ny totalPrisEksklMoms:  ${result.nyTotalPrisEksklMoms.toFixed(2)} kr.`);
  console.log(`   Forskel:                ${result.prisForskel.toFixed(2)} kr.`);
  console.log(`   Status:                 ${result.prisMatch ? '✅ MATCHER' : '⚠️  AFVIGER'}`);
  
  console.log(`\n🏆 HONORAR:`);
  console.log(`   Gammel totalHonorar:    ${result.gammelTotalHonorar.toFixed(2)} kr.`);
  console.log(`   Ny totalHonorar:        ${result.nyTotalHonorar.toFixed(2)} kr. (${result.nyBrugFastHonorar ? 'fast' : 'dynamisk'})`);
  console.log(`   Forskel:                ${result.honorarForskel.toFixed(2)} kr.`);
  console.log(`   Status:                 ${result.honorarMatch ? '✅ MATCHER' : '⚠️  AFVIGER'}`);
  
  if (result.harTilbudspris) {
    console.log(`\n📋 TILBUDSPRIS:`);
    console.log(`   Gammel fastPris:        ${result.gammelFastPris.toFixed(2)} kr.`);
    console.log(`   Ny tilbudsPrisEksklMoms: ${result.nyTilbudspris.toFixed(2)} kr.`);
  }
  
  console.log('\n' + '─'.repeat(60));
  if (result.prisMatch && result.honorarMatch) {
    console.log('✅ VALIDERING OK: Alle værdier matcher!');
  } else {
    console.log('⚠️  VALIDERING: Der er afvigelser - tjek om det er forventet.');
  }
}

/**
 * Validerer alle posteringer i databasen
 */
const validateAll = async () => {
  console.log('🔍 VALIDERER ALLE POSTERINGER...\n');
  
  // Hent alle posteringer der ikke er version 2 (gamle posteringer)
  const posteringer = await Postering.find({ 
    posteringVersion: { $ne: 2 } 
  }).select('_id beskrivelse').lean();
  
  console.log(`📋 Fandt ${posteringer.length} posteringer der skal valideres.\n`);
  
  if (posteringer.length === 0) {
    console.log('✅ Ingen posteringer at validere - alle er allerede version 2!');
    return;
  }
  
  const resultater = [];
  const afvigelser = [];
  
  for (let i = 0; i < posteringer.length; i++) {
    const postering = posteringer[i];
    process.stdout.write(`\rValiderer ${i + 1}/${posteringer.length}...`);
    
    try {
      const result = await migrerPostering(postering._id.toString(), true);
      if (result) {
        resultater.push(result);
        if (!result.prisMatch || !result.honorarMatch) {
          afvigelser.push(result);
        }
      }
    } catch (error) {
      console.error(`\n❌ Fejl ved validering af ${postering._id}: ${error.message}`);
    }
  }
  
  // Print samlet rapport
  console.log('\n\n' + '═'.repeat(70));
  console.log('📊 SAMLET VALIDERINGSRAPPORT');
  console.log('═'.repeat(70));
  
  console.log(`\n📋 Posteringer tjekket:  ${resultater.length}`);
  console.log(`✅ Matcher:              ${resultater.length - afvigelser.length}`);
  console.log(`⚠️  Afvigelser:           ${afvigelser.length}`);
  
  if (afvigelser.length > 0) {
    console.log('\n' + '─'.repeat(70));
    console.log('⚠️  POSTERINGER MED AFVIGELSER:');
    console.log('─'.repeat(70));
    
    afvigelser.forEach((result, index) => {
      console.log(`\n${index + 1}. ID: ${result.posteringId}`);
      console.log(`   Beskrivelse: ${result.beskrivelse}`);
      if (!result.prisMatch) {
        console.log(`   💰 Pris afviger: ${result.gammelTotalPris.toFixed(2)} → ${result.nyTotalPrisEksklMoms.toFixed(2)} (${result.prisForskel.toFixed(2)} kr.)`);
      }
      if (!result.honorarMatch) {
        console.log(`   🏆 Honorar afviger: ${result.gammelTotalHonorar.toFixed(2)} → ${result.nyTotalHonorar.toFixed(2)} (${result.honorarForskel.toFixed(2)} kr.)`);
      }
    });
  }
  
  console.log('\n' + '═'.repeat(70));
  if (afvigelser.length === 0) {
    console.log('✅ ALLE POSTERINGER VALIDERET OK!');
  } else {
    console.log(`⚠️  ${afvigelser.length} POSTERINGER HAR AFVIGELSER - TJEK MANUELT`);
  }
  console.log('═'.repeat(70));
};

/**
 * Migrerer alle posteringer i databasen
 */
const migrateAll = async () => {
  console.log('🚀 MIGRERER ALLE POSTERINGER...\n');
  console.log('⚠️  ADVARSEL: Dette vil opdatere alle gamle posteringer i databasen!');
  console.log('');
  
  // Hent alle posteringer der ikke er version 2 (gamle posteringer)
  const posteringer = await Postering.find({ 
    posteringVersion: { $ne: 2 } 
  }).select('_id beskrivelse').lean();
  
  console.log(`📋 Fandt ${posteringer.length} posteringer der skal migreres.\n`);
  
  if (posteringer.length === 0) {
    console.log('✅ Ingen posteringer at migrere - alle er allerede version 2!');
    return;
  }
  
  // Bekræftelse
  console.log('─'.repeat(70));
  console.log(`Vil du fortsætte med at migrere ${posteringer.length} posteringer?`);
  console.log('Tryk CTRL+C for at afbryde, eller vent 5 sekunder for at fortsætte...');
  console.log('─'.repeat(70));
  
  // Vent 5 sekunder så brugeren kan afbryde
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  console.log('\n🔄 Starter migrering...\n');
  
  let succesCount = 0;
  let fejlCount = 0;
  const fejlListe = [];
  
  for (let i = 0; i < posteringer.length; i++) {
    const postering = posteringer[i];
    process.stdout.write(`\rMigrerer ${i + 1}/${posteringer.length}...`);
    
    try {
      await migrerPostering(postering._id.toString(), false);
      succesCount++;
    } catch (error) {
      fejlCount++;
      fejlListe.push({
        posteringId: postering._id.toString(),
        beskrivelse: postering.beskrivelse || '(ingen)',
        fejl: error.message
      });
      console.error(`\n❌ Fejl ved migrering af ${postering._id}: ${error.message}`);
    }
  }
  
  // Print samlet rapport
  console.log('\n\n' + '═'.repeat(70));
  console.log('📊 SAMLET MIGRERINGSRAPPORT');
  console.log('═'.repeat(70));
  
  console.log(`\n📋 Posteringer behandlet: ${posteringer.length}`);
  console.log(`✅ Succes:                ${succesCount}`);
  console.log(`❌ Fejl:                  ${fejlCount}`);
  
  if (fejlListe.length > 0) {
    console.log('\n' + '─'.repeat(70));
    console.log('❌ POSTERINGER MED FEJL:');
    console.log('─'.repeat(70));
    
    fejlListe.forEach((fejl, index) => {
      console.log(`\n${index + 1}. ID: ${fejl.posteringId}`);
      console.log(`   Beskrivelse: ${fejl.beskrivelse}`);
      console.log(`   Fejl: ${fejl.fejl}`);
    });
  }
  
  console.log('\n' + '═'.repeat(70));
  if (fejlCount === 0) {
    console.log('✅ ALLE POSTERINGER MIGRERET SUCCESFULDT!');
  } else {
    console.log(`⚠️  ${fejlCount} POSTERINGER FEJLEDE - TJEK MANUELT`);
  }
  console.log('═'.repeat(70));
};

const run = async () => {
  const args = process.argv.slice(2);
  const validateOnly = args.includes('--validate');
  const validateAllFlag = args.includes('--validate-all');
  const migrateAllFlag = args.includes('--migrate-all');
  const posteringId = args.find(arg => !arg.startsWith('--'));
  
  // Validate-all mode
  if (validateAllFlag) {
    await connect();
    await validateAll();
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
    return;
  }
  
  // Migrate-all mode
  if (migrateAllFlag) {
    await connect();
    await migrateAll();
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
    return;
  }
  
  // Enkelt postering mode
  if (!posteringId) {
    console.error('FEJL: Du skal angive en postering ID som argument.');
    console.error('');
    console.error('Brug:');
    console.error('  node server/migrerPostering.js <POSTERING_ID>              # Migrér postering');
    console.error('  node server/migrerPostering.js <POSTERING_ID> --validate   # Kun validér (gem ikke)');
    console.error('  node server/migrerPostering.js --validate-all              # Validér alle posteringer');
    console.error('  node server/migrerPostering.js --migrate-all               # Migrér alle posteringer');
    console.error('');
    console.error('Eksempel:');
    console.error('  node server/migrerPostering.js 695d65d12b051d1399127597');
    console.error('  node server/migrerPostering.js 695d65d12b051d1399127597 --validate');
    process.exit(1);
  }

  if (validateOnly) {
    console.log('🔍 VALIDERINGS-MODE: Ingen ændringer vil blive gemt.\n');
  }

  await connect();
  const result = await migrerPostering(posteringId, validateOnly);
  
  // Print detaljeret resultat for enkelt validering
  if (validateOnly && result) {
    printValideringsResultat(result);
  }
  
  await mongoose.disconnect();
  console.log('\nDisconnected from MongoDB');
};

run();

