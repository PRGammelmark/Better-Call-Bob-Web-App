/**
 * Standard-opgavetyper organiseret efter kategorier
 * Disse arrays kan importeres via UI'en i AppIndstillinger
 */

// Handyman opgavetyper
export const handymanOpgavetyper = [
    { opgavetype: "Ophængning af billeder", kategorier: ["Handyman"], kompleksitet: 1 },
    { opgavetype: "Ophængningsopgaver", kategorier: ["Handyman"], kompleksitet: 1 },
    { opgavetype: "Samling af møbler", kategorier: ["Handyman"], kompleksitet: 1 },
    { opgavetype: "Tætning af dør", kategorier: ["Handyman"], kompleksitet: 1 },
    { opgavetype: "Ophængning af TV", kategorier: ["Handyman"], kompleksitet: 1 },
    { opgavetype: "Ophængning af lamper", kategorier: ["Handyman"], kompleksitet: 1 },
    { opgavetype: "Oprydning", kategorier: ["Handyman", "Rengøring"], kompleksitet: 1 },
    { opgavetype: "Småt flyttehjælp", kategorier: ["Handyman"], kompleksitet: 1 },
    { opgavetype: "Almindelig rengøring", kategorier: ["Handyman", "Rengøring"], kompleksitet: 1 },
    { opgavetype: "Skift af stikkontakt", kategorier: ["Handyman", "Elektriker"], kompleksitet: 1 },
    { opgavetype: "Samling af klædeskab", kategorier: ["Handyman"], kompleksitet: 1 },
    { opgavetype: "Havearbejde", kategorier: ["Handyman"], kompleksitet: 1 },
    { opgavetype: "Sætte fliser op", kategorier: ["Handyman", "Murer"], kompleksitet: 2 },
    { opgavetype: "Ophængning af gardiner", kategorier: ["Handyman"], kompleksitet: 1 },
    { opgavetype: "Ophængning af hylder", kategorier: ["Handyman"], kompleksitet: 1 },
    { opgavetype: "Justering af skabslåger", kategorier: ["Handyman"], kompleksitet: 1 },
    { opgavetype: "Genmontering af beslag på låge", kategorier: ["Handyman"], kompleksitet: 1 },
    { opgavetype: "Alment malerarbejde", kategorier: ["Handyman", "Murer"], kompleksitet: 1 },
    { opgavetype: "Udskiftning af håndtag", kategorier: ["Handyman"], kompleksitet: 1 },
    { opgavetype: "Udskiftning af lås", kategorier: ["Handyman"], kompleksitet: 1 },
    { opgavetype: "Justering & tætning af døre og vinduer", kategorier: ["Handyman", "Tømrer"], kompleksitet: 2 },
    { opgavetype: "Udskiftning af silikonfuger", kategorier: ["Handyman"], kompleksitet: 1 },
    { opgavetype: "Opsætning af knagerækker", kategorier: ["Handyman"], kompleksitet: 1 },
    { opgavetype: "Montering af rullegardin", kategorier: ["Handyman"], kompleksitet: 1 },
    { opgavetype: "Udskiftning af brusehoved eller -slange", kategorier: ["Handyman", "VVS"], kompleksitet: 1 },
    { opgavetype: "Montering af blandingsbatteri", kategorier: ["Handyman", "VVS"], kompleksitet: 1 },
    { opgavetype: "Udskiftning af pakninger på armatur", kategorier: ["Handyman", "VVS"], kompleksitet: 1 },
    { opgavetype: "Vægmontering på badeværelser", kategorier: ["Handyman"], kompleksitet: 1 },
    { opgavetype: "Opsætning af Smart Home-enheder", kategorier: ["Handyman", "Elektriker"], kompleksitet: 1 },
    { opgavetype: "Smøring af hængsler og låse", kategorier: ["Handyman"], kompleksitet: 1 },
    { opgavetype: "Rensning af tagrender og nedløbsrør", kategorier: ["Handyman"], kompleksitet: 1 },
    { opgavetype: "Udskiftning af lampepærer eller spots", kategorier: ["Handyman", "Elektriker"], kompleksitet: 1 },
    { opgavetype: "Reparation af væghuller", kategorier: ["Handyman", "Murer"], kompleksitet: 1 },
    { opgavetype: "Montering af kabelbakker eller kabelstyring", kategorier: ["Handyman", "Elektriker"], kompleksitet: 1 },
    { opgavetype: "Mindre wc-reparationer", kategorier: ["Handyman", "VVS"], kompleksitet: 1 },
    { opgavetype: "Reparation af møbler", kategorier: ["Handyman"], kompleksitet: 1 },
    { opgavetype: "Montering af postkasse", kategorier: ["Handyman"], kompleksitet: 1 },
    { opgavetype: "Rensning af afløb", kategorier: ["Handyman", "VVS"], kompleksitet: 1 },
    { opgavetype: "Udskiftning af lister", kategorier: ["Handyman", "Tømrer"], kompleksitet: 1 },
    { opgavetype: "Oliebehandling af træoverflader", kategorier: ["Handyman"], kompleksitet: 1 },
    { opgavetype: "Opsætning af højskabe til væg", kategorier: ["Handyman", "Tømrer"], kompleksitet: 1 },
    { opgavetype: "Børnesikring", kategorier: ["Handyman"], kompleksitet: 1 }
];

// Tømrer opgavetyper
export const tømrerOpgavetyper = [
    { opgavetype: "Montering af døre (indvendige)", kategorier: ["Tømrer"], kompleksitet: 2 },
    { opgavetype: "Udskiftning af dørkarme", kategorier: ["Tømrer"], kompleksitet: 2 },
    { opgavetype: "Montering af yderdøre", kategorier: ["Tømrer"], kompleksitet: 3 },
    { opgavetype: "Montering af vinduer", kategorier: ["Tømrer"], kompleksitet: 3 },
    { opgavetype: "Udskiftning af vindueslister", kategorier: ["Tømrer"], kompleksitet: 1 },
    { opgavetype: "Reparation af vinduer", kategorier: ["Tømrer"], kompleksitet: 2 },
    { opgavetype: "Opsætning af gipsvægge", kategorier: ["Tømrer"], kompleksitet: 3 },
    { opgavetype: "Reparation af gipsvægge", kategorier: ["Tømrer"], kompleksitet: 1 },
    { opgavetype: "Montering af loft i gips eller træ", kategorier: ["Tømrer"], kompleksitet: 3 },
    { opgavetype: "Opsætning af træpaneler", kategorier: ["Tømrer"], kompleksitet: 2 },
    { opgavetype: "Montering af fodlister og gerigter", kategorier: ["Tømrer"], kompleksitet: 1 },
    { opgavetype: "Opsætning af indfatninger", kategorier: ["Tømrer"], kompleksitet: 1 },
    { opgavetype: "Opbygning af skillevægge", kategorier: ["Tømrer"], kompleksitet: 3 },
    { opgavetype: "Reparation af trægulve", kategorier: ["Tømrer"], kompleksitet: 2 },
    { opgavetype: "Lægning af trægulv", kategorier: ["Tømrer"], kompleksitet: 3 },
    { opgavetype: "Montering af køkkenelementer", kategorier: ["Tømrer"], kompleksitet: 2 },
    { opgavetype: "Udskiftning af bordplader", kategorier: ["Tømrer"], kompleksitet: 2 },
    { opgavetype: "Tilpasning af skabsmoduler", kategorier: ["Tømrer"], kompleksitet: 2 },
    { opgavetype: "Opbygning af terrasse", kategorier: ["Tømrer"], kompleksitet: 3 },
    { opgavetype: "Reparation af terrasse", kategorier: ["Tømrer"], kompleksitet: 2 },
    { opgavetype: "Montering af hegn", kategorier: ["Tømrer"], kompleksitet: 2 },
    { opgavetype: "Opsætning af udhæng og sternbrædder", kategorier: ["Tømrer"], kompleksitet: 3 },
    { opgavetype: "Reparation af tagkonstruktioner", kategorier: ["Tømrer"], kompleksitet: 3 },
    { opgavetype: "Montering af tagvinduer (Velux)", kategorier: ["Tømrer"], kompleksitet: 3 },
    { opgavetype: "Isolering af loft", kategorier: ["Tømrer"], kompleksitet: 2 },
    { opgavetype: "Isolering af ydervægge", kategorier: ["Tømrer"], kompleksitet: 2 },
    { opgavetype: "Udskiftning af loftbrædder", kategorier: ["Tømrer"], kompleksitet: 1 },
    { opgavetype: "Bygning af carport", kategorier: ["Tømrer"], kompleksitet: 3 },
    { opgavetype: "Reparation af skur", kategorier: ["Tømrer"], kompleksitet: 2 },
    { opgavetype: "Opbygning af redskabsrum", kategorier: ["Tømrer"], kompleksitet: 3 },
    { opgavetype: "Montering af gelænder og rækværk", kategorier: ["Tømrer"], kompleksitet: 2 }
];

// VVS opgavetyper
export const vvsOpgavetyper = [
    { opgavetype: "Udskiftning af vandhane", kategorier: ["VVS"], kompleksitet: 1 },
    { opgavetype: "Reparation af dryppende vandhane", kategorier: ["VVS"], kompleksitet: 1 },
    { opgavetype: "Udskiftning af blandingsbatteri i bruser", kategorier: ["VVS"], kompleksitet: 2 },
    { opgavetype: "Montering af toilet", kategorier: ["VVS"], kompleksitet: 2 },
    { opgavetype: "Reparation af løbende toilet", kategorier: ["VVS"], kompleksitet: 1 },
    { opgavetype: "Udskiftning af cisterne", kategorier: ["VVS"], kompleksitet: 2 },
    { opgavetype: "Montering af håndvask", kategorier: ["VVS"], kompleksitet: 2 },
    { opgavetype: "Udskiftning af vandlås", kategorier: ["VVS"], kompleksitet: 1 },
    { opgavetype: "Montering af køkkenvask", kategorier: ["VVS"], kompleksitet: 2 },
    { opgavetype: "Tætning af rørforbindelser", kategorier: ["VVS"], kompleksitet: 1 },
    { opgavetype: "Reparation af mindre rørskader", kategorier: ["VVS"], kompleksitet: 2 },
    { opgavetype: "Udskiftning af synlige rør", kategorier: ["VVS"], kompleksitet: 2 },
    { opgavetype: "Montering af brusekabine", kategorier: ["VVS"], kompleksitet: 2 },
    { opgavetype: "Udskiftning af bruser og slange", kategorier: ["VVS"], kompleksitet: 1 },
    { opgavetype: "Installation af termostatbatteri", kategorier: ["VVS"], kompleksitet: 2 },
    { opgavetype: "Afkalkning af vandhane eller bruser", kategorier: ["VVS"], kompleksitet: 1 },
    { opgavetype: "Udskiftning af cirkulationspumpe", kategorier: ["VVS"], kompleksitet: 3 },
    { opgavetype: "Service på varmeanlæg", kategorier: ["VVS"], kompleksitet: 3 },
    { opgavetype: "Udskiftning af radiatorventil", kategorier: ["VVS"], kompleksitet: 2 },
    { opgavetype: "Montering af radiator", kategorier: ["VVS"], kompleksitet: 3 },
    { opgavetype: "Udluftning af radiatorer", kategorier: ["VVS"], kompleksitet: 1 },
    { opgavetype: "Rensning af afløb", kategorier: ["Handyman", "VVS"], kompleksitet: 1 },
    { opgavetype: "Montering af opvaskemaskine", kategorier: ["VVS"], kompleksitet: 1 },
    { opgavetype: "Montering af vaskemaskine", kategorier: ["VVS"], kompleksitet: 1 },
    { opgavetype: "Montering af vandfilter", kategorier: ["VVS"], kompleksitet: 2 }
  ];
  

// Elektriker opgavetyper
export const elektrikerOpgavetyper = [
    { opgavetype: "Udskiftning af stikkontakt", kategorier: ["Elektriker"], kompleksitet: 1 },
    { opgavetype: "Montering af ny stikkontakt", kategorier: ["Elektriker"], kompleksitet: 1 },
    { opgavetype: "Udskiftning af afbryder", kategorier: ["Elektriker"], kompleksitet: 1 },
    { opgavetype: "Montering af lampeudtag", kategorier: ["Elektriker"], kompleksitet: 1 },
    { opgavetype: "Installation af loftlamper", kategorier: ["Elektriker"], kompleksitet: 1 },
    { opgavetype: "Montering af spots (indbygningsspots)", kategorier: ["Elektriker"], kompleksitet: 2 },
    { opgavetype: "Fejlfinding på elektriske installationer", kategorier: ["Elektriker"], kompleksitet: 2 },
    { opgavetype: "Reparation af fejlstrømsafbryder (HPFI)", kategorier: ["Elektriker"], kompleksitet: 2 },
    { opgavetype: "Udskiftning af gruppesikring", kategorier: ["Elektriker"], kompleksitet: 1 },
    { opgavetype: "Opsætning af nye lampeudtag eller grupper", kategorier: ["Elektriker"], kompleksitet: 2 },
    { opgavetype: "Installation af ny gruppe i eltavlen", kategorier: ["Elektriker"], kompleksitet: 3 },
    { opgavetype: "Udskiftning af eltavle", kategorier: ["Elektriker"], kompleksitet: 3 },
    { opgavetype: "Udskiftning af termostater", kategorier: ["Elektriker"], kompleksitet: 1 },
    { opgavetype: "Montering af elradiator", kategorier: ["Elektriker"], kompleksitet: 2 },
    { opgavetype: "Installation af ventilator på badeværelse", kategorier: ["Elektriker"], kompleksitet: 2 },
    { opgavetype: "Montering af emhætte", kategorier: ["Elektriker"], kompleksitet: 2 },
    { opgavetype: "Montering af udendørs belysning", kategorier: ["Elektriker"], kompleksitet: 1 },
    { opgavetype: "Fejlfinding på havelamper", kategorier: ["Elektriker"], kompleksitet: 1 },
    { opgavetype: "Installation af ladestation til elbil", kategorier: ["Elektriker"], kompleksitet: 3 },
    { opgavetype: "Opsætning af smart home-styrede lysdæmpere", kategorier: ["Elektriker"], kompleksitet: 2 },
    { opgavetype: "Montering af smart home-brytere", kategorier: ["Elektriker"], kompleksitet: 1 },
    { opgavetype: "Reparation eller udskiftning af lampeudtag", kategorier: ["Elektriker"], kompleksitet: 1 },
    { opgavetype: "Udtrækning af kabler gennem rør", kategorier: ["Elektriker"], kompleksitet: 2 },
    { opgavetype: "Flytning af stikkontakt eller afbryder", kategorier: ["Elektriker"], kompleksitet: 1 },
    { opgavetype: "Installation af udendørs stikkontakter", kategorier: ["Elektriker"], kompleksitet: 2 }
  ];
  

// Murer opgavetyper
export const murerOpgavetyper = [
    { opgavetype: "Reparation af murværk", kategorier: ["Murer"], kompleksitet: 2 },
    { opgavetype: "Udskiftning eller reparation af fuger", kategorier: ["Murer"], kompleksitet: 2 },
    { opgavetype: "Opsætning af fliser", kategorier: ["Murer"], kompleksitet: 2 },
    { opgavetype: "Reparation af fliser eller klinker", kategorier: ["Murer"], kompleksitet: 1 },
    { opgavetype: "Pudsning af vægge", kategorier: ["Murer"], kompleksitet: 2 },
    { opgavetype: "Filtsning eller vandskuring af vægge", kategorier: ["Murer"], kompleksitet: 2 },
    { opgavetype: "Reparation af sokkel", kategorier: ["Murer"], kompleksitet: 2 },
    { opgavetype: "Pudsning af sokkel", kategorier: ["Murer"], kompleksitet: 2 },
    { opgavetype: "Opmuring af mindre væg eller skillevæg", kategorier: ["Murer"], kompleksitet: 3 },
    { opgavetype: "Reparation af beton", kategorier: ["Murer"], kompleksitet: 2 },
    { opgavetype: "Udbedring af fugtskader", kategorier: ["Murer"], kompleksitet: 3 },
    { opgavetype: "Mikrocement på vægge eller gulve", kategorier: ["Murer"], kompleksitet: 3 },
    { opgavetype: "Reparation af revner i vægge", kategorier: ["Murer"], kompleksitet: 1 }
  ];

// Rengøring opgavetyper
export const rengøringOpgavetyper = [
    { opgavetype: "Almindelig rengøring", kategorier: ["Rengøring", "Handyman"], kompleksitet: 1 },
    { opgavetype: "Hovedrengøring", kategorier: ["Rengøring"], kompleksitet: 2 },
    { opgavetype: "Køkkenrengøring", kategorier: ["Rengøring"], kompleksitet: 1 },
    { opgavetype: "Badeværelsesrengøring", kategorier: ["Rengøring"], kompleksitet: 1 },
    { opgavetype: "Vinduespudsning", kategorier: ["Rengøring"], kompleksitet: 1 },
    { opgavetype: "Flytterengøring", kategorier: ["Rengøring"], kompleksitet: 2 },
    { opgavetype: "Rengøring efter håndværkere", kategorier: ["Rengøring"], kompleksitet: 2 },
    { opgavetype: "Gulvbehandling (vask, polering)", kategorier: ["Rengøring"], kompleksitet: 2 },
    { opgavetype: "Tæpperens", kategorier: ["Rengøring"], kompleksitet: 2 },
    { opgavetype: "Møbelrens", kategorier: ["Rengøring"], kompleksitet: 2 }
  ];

/**
 * Hent alle tilgængelige opgavetyper for en kategori
 */
export const getOpgavetyperForKategori = (kategori) => {
    const kategoriMap = {
        'Handyman': handymanOpgavetyper,
        'Tømrer': tømrerOpgavetyper,
        'VVS': vvsOpgavetyper,
        'Elektriker': elektrikerOpgavetyper,
        'Murer': murerOpgavetyper,
        'Rengøring': rengøringOpgavetyper
    };
    
    return kategoriMap[kategori] || [];
};

/**
 * Hjælpefunktion til at importere specifikke opgavetyper
 */
export const importOpgavetyper = async (opgavetyperToImport, OpgavetyperModel) => {
    try {
        if (!opgavetyperToImport || opgavetyperToImport.length === 0) {
            return { success: false, message: 'Ingen opgavetyper valgt til import' };
        }

        // Tjek om opgavetyper allerede eksisterer (baseret på navn)
        const existingNames = new Set();
        const existingOpgavetyper = await OpgavetyperModel.find({});
        existingOpgavetyper.forEach(ot => existingNames.add(ot.opgavetype));

        // Filtrer væk opgavetyper der allerede eksisterer
        const newOpgavetyper = opgavetyperToImport.filter(ot => !existingNames.has(ot.opgavetype));

        if (newOpgavetyper.length === 0) {
            return { success: false, message: 'Alle valgte opgavetyper eksisterer allerede' };
        }

        // Opret de nye opgavetyper
        await OpgavetyperModel.insertMany(newOpgavetyper);
        
        return { 
            success: true, 
            imported: newOpgavetyper.length,
            skipped: opgavetyperToImport.length - newOpgavetyper.length,
            message: `Importeret ${newOpgavetyper.length} opgavetyper. ${opgavetyperToImport.length - newOpgavetyper.length} eksisterede allerede.`
        };
    } catch (error) {
        console.error('❌ Fejl ved import af opgavetyper:', error);
        return { success: false, message: error.message };
    }
};

/**
 * Hjælpefunktion til at importere opgavetyper for valgte kategorier (for bagudkompatibilitet)
 */
export const importOpgavetyperForKategorier = async (selectedCategories, OpgavetyperModel) => {
    try {
        const kategoriMap = {
            'Handyman': handymanOpgavetyper,
            'Tømrer': tømrerOpgavetyper,
            'VVS': vvsOpgavetyper,
            'Elektriker': elektrikerOpgavetyper,
            'Murer': murerOpgavetyper,
            'Rengøring': rengøringOpgavetyper
        };

        const opgavetyperToImport = [];
        
        selectedCategories.forEach(kategori => {
            const opgavetyper = kategoriMap[kategori] || [];
            opgavetyperToImport.push(...opgavetyper);
        });

        return await importOpgavetyper(opgavetyperToImport, OpgavetyperModel);
    } catch (error) {
        console.error('❌ Fejl ved import af opgavetyper:', error);
        return { success: false, message: error.message };
    }
};
