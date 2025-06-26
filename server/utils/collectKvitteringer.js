import Postering from "../models/posteringModel.js";
import Bruger from "../models/brugerModel.js";
import Kunde from "../models/kunderModel.js";
import dayjs from "dayjs";
import 'dayjs/locale/da.js'; // importer dansk locale
import { sendEmail } from "../emailService.js";

dayjs.locale('da'); // sæt globalt til dansk

export const collectKvitteringer = async () => {
    
    const startOfDenneMåned = dayjs().date() >= 20 ? dayjs().date(20) : dayjs().subtract(1, 'month').date(20);
    const endOfDenneMåned = startOfDenneMåned.add(1, 'month').date(19);

    const sidsteLønperiode = {
        start: startOfDenneMåned.subtract(1, 'month'),
        end: endOfDenneMåned.subtract(1, 'month')
    }

    const startOfSidsteLønperiode = sidsteLønperiode.start.format('YYYY-MM-DD');
    const endOfSidsteLønperiode = sidsteLønperiode.end.format('YYYY-MM-DD');

    const medarbejdere = await Bruger.find({}).select("navn id");
    const kunder = await Kunde.find({}).select("navn id");

    const posteringerForSidsteLønperiode = await Postering.find({
        dato: { $gte: new Date(startOfSidsteLønperiode), $lte: new Date(endOfSidsteLønperiode) }
    });

    const posteringerMedUdlæg = posteringerForSidsteLønperiode.filter(
        postering => Array.isArray(postering.udlæg) && postering.udlæg.length > 0
    );      

    const medarbejdereMedUdlæg = medarbejdere
    .filter(medarbejder =>
      posteringerMedUdlæg.some(
        postering => postering.brugerID.toString() === medarbejder._id.toString()
      )
    )    
    .map(medarbejder => {
      const relevantePosteringer = posteringerMedUdlæg.filter(
        postering => postering.brugerID.toString() === medarbejder._id.toString()
      );
  
      const totalUdlæg = relevantePosteringer.reduce((acc, postering) => {
        const sum = postering.udlæg?.reduce((s, u) => s + (u.beløb || 0), 0);
        return acc + sum;
      }, 0);

      const antalUdlæg = relevantePosteringer.reduce((acc, postering) => {
        const sum = postering.udlæg?.length || 0;
        return acc + sum;
      }, 0);

      const antalKvitteringer = relevantePosteringer.reduce((acc, postering) => {
        const sum = postering.udlæg?.filter(u => !!u.kvittering).length || 0;
        return acc + sum;
      }, 0);
  
    //   const kvitteringer = relevantePosteringer.flatMap(postering =>
    //     postering.udlæg
    //       ?.filter(u => !!u.kvittering)
    //       .map(u => ({
    //         beløb: u.beløb,
    //         beskrivelse: u.beskrivelse,
    //         kvittering: u.kvittering
    //       })) || []
    //   );

        const kvitteringer = relevantePosteringer.flatMap(postering =>
            postering.udlæg
            ?.filter(u => !!u.kvittering)
            .map(u => (u.kvittering)) || []
        );
  
      return {
        navn: medarbejder.navn,
        totalUdlæg,
        antalUdlæg,
        kvitteringer,
        antalKvitteringer
      };
    });
  
    console.log("Medarbejdere med udlæg:", medarbejdereUdlæg);

    const emailBody = (
        `
        <h1>Medarbejderes bilag for sidste lønperiode (${startOfSidsteLønperiodeForEmail} - ${endOfSidsteLønperiodeForEmail})</h1>
        <p>Du modtager denne automatisk genererede mail, da sidste lønperiode er afsluttet. Her er dine medarbejderes bilag for sidste lønperiode:</p>
        ${medarbejdereUdlæg.map(medarbejder => `<b style="font-size: 1.2em; text-decoration: underline;">${medarbejder.navn}</b><br /><p style="margin-bottom: 0;">Samlet beløb for udlæg: ${medarbejder.totalUdlæg} kr.</p><p style="margin-top: 0; margin-bottom: 0;">Antal reg. udlæg: ${medarbejder.antalUdlæg} </p><p style="margin-top: 0; margin-bottom: 10px;">Antal kvitteringer: ${medarbejder.antalKvitteringer}</p>${medarbejder.antalUdlæg > medarbejder.antalKvitteringer ? `<p style="margin-top: 0; margin-bottom: 10px; color: red;">OBS! Nogle af ${medarbejder.navn.split(" ")[0]}s udlæg mangler bilag.</p>` : ""}<br />
            ${medarbejder.kvitteringer.map(kvittering => `
                <a href="${kvittering}" target="_blank">
                    <img src="${kvittering}" alt="Kvittering" style="width: 120px; height: 120px; object-fit: cover; border-radius: 5px; border: 1px solid #ccc;" />
                </a>
                `).join("\n")
            }
            <br /><br />`).join("\n")
        }
        <br /><br />
        <p>Dbh.,<br />App-robotten 🤖</p>
        `
    );

    await sendEmail("hej@bettercallbob.dk", `Bilag for sidste lønperiode (${startOfSidsteLønperiodeForEmail} - ${endOfSidsteLønperiodeForEmail})`, emailBody, emailBody);

    return {
        status: "success",
        periode: `${startOfSidsteLønperiodeForEmail} - ${endOfSidsteLønperiodeForEmail}`,
        antalMedarbejdere: medarbejdereUdlæg.length,
        totalKvitteringer: medarbejdereUdlæg.reduce((acc, m) => acc + m.antalKvitteringer, 0),
        medarbejdere: medarbejdereUdlæg.map(m => ({
          navn: m.navn,
          totalUdlæg: m.totalUdlæg,
          antalKvitteringer: m.antalKvitteringer
        }))
      };
}