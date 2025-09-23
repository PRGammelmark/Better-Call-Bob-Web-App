import Kunde from "../models/kunderModel.js";
import Opgave from "../models/opgaveModel.js";
import Counter from "../models/counterModel.js";

export const handleElementorWebhook = async (req, res) => {

    try {

      console.log("Behandler ny opgave via Elementor webhook ...");
      console.log("Elementor felter:", req.body);

      const fields = {
        beskrivelse: req.body["Beskriv din opgave"] || req.body["Beskriv jeres opgave"] || req.body['Describe your task'] || "",
        navn: req.body["Navn"] || req.body["Navn på kontaktperson"] || req.body["Name"] || req.body["Fulde navn"] || "",
        email: req.body["E-mail"] || req.body["Mail"] || "",
        telefon: req.body["Tlf."] || req.body["Telefonnummer"] || req.body["Telefonnummer (valgfri)"] || req.body["Phone"] || req.body["Phone Number"] || "",
        adresse: req.body["Din adresse"] || req.body["Adresse"] || req.body["Your adress"] || "",
        postnummer: req.body["Postnummer"] || req.body["ZIP code"] || req.body["Postal code"] || "",
        by: req.body["By"] || req.body["City"] || "",
        onsketDato: req.body["Ønsket dato"] || req.body["Preferred date"] || req.body["Preferred day"] || req.body["Hvilken dag skal vi komme?"] || "",
        onsketTidsrum: req.body["Hvilket tidsrum?"] || req.body["Which time slot?"] || req.body["Preferred time"] || req.body["Hvad tid?"] || "",
        typiskHjemme: req.body["Hvornår er du typisk hjemme?"] || req.body["When are you usually at home?"] || "",
        billeder: req.body["Vedhæft op til 3 billeder (valgfrit)"] || req.body["Attach up to 3 pictures (optional)"] || [],
        virksomhed: req.body["Virksomhed"] || req.body["Organisation"] || req.body["Company"] || "",
        CVR: req.body["CVR"] || req.body["CVR-nummer"] || req.body["CVR number"] || req.body["CVR-nummer (valgfri)"] || req.body["VAT-number (optional)"] || "",
      };

      console.log("Formaterede Elementor-felter:", fields);

      const onsketDato = fields?.onsketDato ? ` – Ønsket dato: ${fields.onsketDato} ${fields.onsketTidsrum ? ` – Ønsket tidsrum: ${fields.onsketTidsrum}` : ""}` : "";
      const typiskHjemme = fields?.typiskHjemme ? ` – Typisk hjemme: ${fields.typiskHjemme}` : "";
      const navnSplit = fields?.navn?.split(" ") || [];
      const fornavn = navnSplit[0] || "";
      const efternavn = navnSplit.slice(1).join(" ") || "";
      const billeder = Array.isArray(fields.billeder)
        ? fields.billeder // allerede et array (tomt eller med links)
        : typeof fields.billeder === "string"
          ? fields.billeder
              .split(",")
              .map(url => url.trim())
              .filter(url => url.length > 0) // fjerner tomme entries
          : [];

      const counter = await Counter.findOneAndUpdate(
        { name: 'opgaveID' },
        { $inc: { value: 1 } },
        { new: true, upsert: true }
      );
  
      // Map Elementor felter til vores opgavemodel
      const nyOpgaveObjekt = {
        opgaveBeskrivelse: fields?.beskrivelse + onsketDato + typiskHjemme || "",
        status: "Modtaget",
        ansvarlig: [],
        createdAt: new Date(),
        incrementalID: counter.value,
        opgaveBilleder: billeder,
        kilde: "Web-formular"
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
        virksomhed: fields?.virksomhed || "",
        CVR: fields?.CVR || "",
        kilde: "Web-formular"
      };

      console.log("Opgave godkendt. Tjekker kundedata med databasen ...")
      const eksisterendeKunde = await Kunde.findOne({ email: fields?.email });

      let nyOpgave;
      
      if(eksisterendeKunde){
        console.log("Eksisterende kunde fundet (ID: " + eksisterendeKunde._id + ").");
        nyOpgaveObjekt.kundeID = eksisterendeKunde._id;
        nyOpgaveObjekt.kunde = eksisterendeKunde._id;
        nyOpgave = await Opgave.create(nyOpgaveObjekt);
        console.log("Opgave oprettet (ID: " + nyOpgave._id + ") og tilknyttet eksisterende kunde (ID: " + eksisterendeKunde._id + ").");
      }

      if(!eksisterendeKunde){
        console.log("Ingen eksisterende kunde fundet. Opretter ny kunde ...")
        const nyKunde = await Kunde.create(nyKundeObjekt);
        console.log("Ny kunde oprettet (ID: " + nyKunde._id + ").");
        nyOpgaveObjekt.kundeID = nyKunde._id;
        nyOpgaveObjekt.kunde = nyKunde._id;
        nyOpgave = await Opgave.create(nyOpgaveObjekt);
        console.log("Opgave oprettet (ID: " + nyOpgave._id + ") og tilknyttet ny kunde (ID: " + nyKunde._id + ").");
      }
  
      return res.status(200).json({ success: true, opgave: nyOpgave });
    } catch (error) {
      console.error("Webhook-fejl:", error);
      return res.status(500).json({ success: false, message: "Serverfejl" });
    }
  };