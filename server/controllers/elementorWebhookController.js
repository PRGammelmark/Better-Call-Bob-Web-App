import Kunde from "../models/kunderModel.js";
import Opgave from "../models/opgaveModel.js";
import Counter from "../models/counterModel.js";

export const handleElementorWebhook = async (req, res) => {

    try {

      console.log("Behandler ny opgave via Elementor webhook ...");
      console.log("Elementor felter:", req.body);

      const fields = {
        beskrivelse: req.body["Beskriv din opgave"] || req.body['Describe your task'] || "",
        navn: req.body["Navn"] || req.body["Name"] || "",
        email: req.body["E-mail"] || "",
        telefon: req.body["Tlf."] || req.body["Phone"] || "",
        adresse: req.body["Din adresse"] || req.body["Your adress"] || "",
        postnummer: req.body["Postnummer"] || req.body["ZIP code"] || "",
        by: req.body["By"] || req.body["City"] || "",
        onsketDato: req.body["Ønsket dato"] || req.body["Preferred date"] || "",
        typiskHjemme: req.body["Hvornår er du typisk hjemme?"] || req.body["When are you usually at home?"] || "",
        billeder: req.body["Vedhæft op til 3 billeder (valgfrit)"] || req.body["Attach up to 3 pictures (optional)"] || [],
      };

      console.log("Formaterede Elementor-felter:", fields);

      const onsketDato = fields?.onsketDato ? ` – Ønsket dato: ${fields.onsketDato}` : "";
      const typiskHjemme = fields?.typiskHjemme ? ` – Typisk hjemme: ${fields.typiskHjemme}` : "";
      const navnSplit = fields?.navn?.split(" ") || [];
      const fornavn = navnSplit[0] || "";
      const efternavn = navnSplit.slice(1).join(" ") || "";
      const billeder = fields.billeder
        ? fields.billeder.split(",").map(url => url.trim()).filter(url => url)
        : [];

      const counter = await Counter.findOneAndUpdate(
        { name: 'opgaveID' },
        { $inc: { value: 1 } },
        { new: true, upsert: true }
      );

      console.log("Counter:", counter);
      console.log("Counter value:", counter.value);
  
      // Map Elementor felter til vores opgavemodel
      const nyOpgaveObjekt = {
        opgaveBeskrivelse: fields?.beskrivelse + onsketDato + typiskHjemme || "",
        status: "Modtaget",
        ansvarlig: [],
        createdAt: new Date(),
        incrementalID: counter.value,
        opgaveBilleder: billeder,
        kilde: "HandymanKBH / HandymanFrederiksberg"
      };

      // Map Elementor felter til vores kundemodel
      const nyKundeObjekt = {
        navn: fields?.navn || "Ukendt",
        fornavn: fornavn.trim(),
        efternavn: efternavn.trim(),
        email: fields?.email.trim() || "",
        telefon: fields?.telefon.trim() || "",
        adresse: fields?.adresse || "",
        postnummerOgBy: fields?.postnummer.trim() + " " + fields?.by.trim() || "",
        createdAt: new Date(),
        engelskKunde: !!req.body['Describe your task'],
        kilde: "HandymanKBH / HandymanFrederiksberg"
      };

      console.log("Opgave godkendt. Tjekker kundedata med databasen ...")
      const eksisterendeKunde = await Kunde.findOne({ email: fields?.email });

      let nyOpgave;
      
      if(eksisterendeKunde){
        console.log("Eksisterende kunde fundet:", eksisterendeKunde);
        nyOpgaveObjekt.kundeID = eksisterendeKunde._id;
        nyOpgaveObjekt.kunde = eksisterendeKunde._id;
        nyOpgave = await Opgave.create(nyOpgaveObjekt);
        console.log("Opgave oprettet og tilknyttet eksisterende kunde:", nyOpgave);
      }

      if(!eksisterendeKunde){
        console.log("Ingen eksisterende kunde fundet. Opretter ny kunde ...")
        const nyKunde = await Kunde.create(nyKundeObjekt);
        console.log("Ny kunde oprettet:", nyKunde);
        nyOpgaveObjekt.kundeID = nyKunde._id;
        nyOpgaveObjekt.kunde = nyKunde._id;
        nyOpgave = await Opgave.create(nyOpgaveObjekt);
        console.log("Opgave oprettet og tilknyttet ny kunde:", nyOpgave);
      }
  
      return res.status(200).json({ success: true, opgave: nyOpgave });
    } catch (error) {
      console.error("Webhook-fejl:", error);
      return res.status(500).json({ success: false, message: "Serverfejl" });
    }
  };