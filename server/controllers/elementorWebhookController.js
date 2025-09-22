import Kunde from "../models/kunderModel.js";
import Opgave from "../models/opgaveModel.js";

export const handleElementorWebhook = async (req, res) => {

    try {

      console.log("Behandler ny opgave via Elementor webhook ...");
      console.log("Elementor felter:", req.body);

      const fields = {
        beskrivelse: req.body["Beskriv din opgave"] || "",
        navn: req.body["Navn"] || "",
        email: req.body["E-mail"] || "",
        telefon: req.body["Tlf."] || "",
        adresse: req.body["Din adresse"] || "",
        postnummer: req.body["Postnummer"] || "",
        by: req.body["By"] || "",
        onsketDato: req.body["Ønsket dato"] || "",
        typiskHjemme: req.body["Hvornår er du typisk hjemme?"] || "",
      };

      console.log("Formaterede Elementor-felter:", fields);

      const onsketDato = fields?.onsketDato ? ` – Ønsket dato: ${fields.onsketDato}` : "";
      const typiskHjemme = fields?.typiskHjemme ? ` – Typisk hjemme: ${fields.typiskHjemme}` : "";
      const navnSplit = fields?.navn?.split(" ") || [];
      const fornavn = navnSplit[0] || "";
      const efternavn = navnSplit.slice(1).join(" ") || "";
      
  
      // Map Elementor felter til vores opgavemodel
      const nyOpgaveObjekt = {
        opgaveBeskrivelse: fields?.beskrivelse + onsketDato + typiskHjemme || "",
        status: "Modtaget",
        ansvarlig: [],
        createdAt: new Date()
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
        createdAt: new Date()
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