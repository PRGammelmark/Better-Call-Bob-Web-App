/**
 * Standard-opgavetyper organiseret efter kategorier
 * Disse arrays kan importeres via UI'en i AppIndstillinger
 */

// Handyman opgavetyper
export const handymanOpgavetyper = [
    { opgavetype: "Ophængning af billeder", opgavetypeEn: "Picture hanging", kategorier: ["Handyman"], kompleksitet: 1 },
    { opgavetype: "Ophængningsopgaver", opgavetypeEn: "Hanging tasks", kategorier: ["Handyman"], kompleksitet: 1 },
    { opgavetype: "Samling af møbler", opgavetypeEn: "Furniture assembly", kategorier: ["Handyman"], kompleksitet: 1 },
    { opgavetype: "Ophængning af TV", opgavetypeEn: "TV mounting", kategorier: ["Handyman"], kompleksitet: 1 },
    { opgavetype: "Ophængning af lamper", opgavetypeEn: "Light fixture installation", kategorier: ["Handyman"], kompleksitet: 1 },
    { opgavetype: "Oprydning", opgavetypeEn: "Tidying up", kategorier: ["Handyman", "Rengøring"], kompleksitet: 1 },
    { opgavetype: "Småt flyttehjælp", opgavetypeEn: "Small moving assistance", kategorier: ["Handyman"], kompleksitet: 1 },
    { opgavetype: "Almindelig rengøring", opgavetypeEn: "Regular cleaning", kategorier: ["Handyman", "Rengøring"], kompleksitet: 1 },
    { opgavetype: "Skift af stikkontakt", opgavetypeEn: "Outlet replacement", kategorier: ["Handyman", "Elektriker"], kompleksitet: 1 },
    { opgavetype: "Samling af klædeskab", opgavetypeEn: "Wardrobe assembly", kategorier: ["Handyman"], kompleksitet: 1 },
    { opgavetype: "Havearbejde", opgavetypeEn: "Gardening work", kategorier: ["Handyman"], kompleksitet: 1 },
    { opgavetype: "Sætte fliser op", opgavetypeEn: "Tile installation", kategorier: ["Handyman", "Murer"], kompleksitet: 2 },
    { opgavetype: "Ophængning af gardiner", opgavetypeEn: "Curtain hanging", kategorier: ["Handyman"], kompleksitet: 1 },
    { opgavetype: "Ophængning af hylder", opgavetypeEn: "Shelf mounting", kategorier: ["Handyman"], kompleksitet: 1 },
    { opgavetype: "Justering af skabslåger", opgavetypeEn: "Cabinet door adjustment", kategorier: ["Handyman"], kompleksitet: 1 },
    { opgavetype: "Genmontering af beslag på låge", opgavetypeEn: "Reinstalling hardware on doors", kategorier: ["Handyman"], kompleksitet: 1 },
    { opgavetype: "Alment malerarbejde", opgavetypeEn: "General painting work", kategorier: ["Handyman", "Murer"], kompleksitet: 1 },
    { opgavetype: "Udskiftning af håndtag", opgavetypeEn: "Handle replacement", kategorier: ["Handyman"], kompleksitet: 1 },
    { opgavetype: "Udskiftning af lås", opgavetypeEn: "Lock replacement", kategorier: ["Handyman"], kompleksitet: 1 },
    { opgavetype: "Justering & tætning af døre og vinduer", opgavetypeEn: "Adjustment & sealing of doors and windows", kategorier: ["Handyman", "Tømrer"], kompleksitet: 2 },
    { opgavetype: "Udskiftning af silikonfuger", opgavetypeEn: "Silicone sealant replacement", kategorier: ["Handyman"], kompleksitet: 1 },
    { opgavetype: "Opsætning af knagerækker", opgavetypeEn: "Towel rail installation", kategorier: ["Handyman"], kompleksitet: 1 },
    { opgavetype: "Montering af rullegardin", opgavetypeEn: "Roller blind installation", kategorier: ["Handyman"], kompleksitet: 1 },
    { opgavetype: "Udskiftning af brusehoved eller -slange", opgavetypeEn: "Shower head or hose replacement", kategorier: ["Handyman", "VVS"], kompleksitet: 1 },
    { opgavetype: "Montering af blandingsbatteri", opgavetypeEn: "Mixer tap installation", kategorier: ["Handyman", "VVS"], kompleksitet: 1 },
    { opgavetype: "Udskiftning af pakninger på armatur", opgavetypeEn: "Fixture gasket replacement", kategorier: ["Handyman", "VVS"], kompleksitet: 1 },
    { opgavetype: "Vægmontering på badeværelser", opgavetypeEn: "Bathroom wall mounting", kategorier: ["Handyman"], kompleksitet: 1 },
    { opgavetype: "Opsætning af Smart Home-enheder", opgavetypeEn: "Smart Home device setup", kategorier: ["Handyman", "Elektriker"], kompleksitet: 1 },
    { opgavetype: "Smøring af hængsler og låse", opgavetypeEn: "Lubrication of hinges and locks", kategorier: ["Handyman"], kompleksitet: 1 },
    { opgavetype: "Rensning af tagrender og nedløbsrør", opgavetypeEn: "Gutter and downpipe cleaning", kategorier: ["Handyman"], kompleksitet: 1 },
    { opgavetype: "Udskiftning af lampepærer eller spots", opgavetypeEn: "Light bulb or spotlight replacement", kategorier: ["Handyman", "Elektriker"], kompleksitet: 1 },
    { opgavetype: "Reparation af væghuller", opgavetypeEn: "Wall hole repair", kategorier: ["Handyman", "Murer"], kompleksitet: 1 },
    { opgavetype: "Montering af kabelbakker eller kabelstyring", opgavetypeEn: "Cable tray or cable management installation", kategorier: ["Handyman", "Elektriker"], kompleksitet: 1 },
    { opgavetype: "Mindre wc-reparationer", opgavetypeEn: "Minor toilet repairs", kategorier: ["Handyman", "VVS"], kompleksitet: 1 },
    { opgavetype: "Reparation af møbler", opgavetypeEn: "Furniture repair", kategorier: ["Handyman"], kompleksitet: 1 },
    { opgavetype: "Montering af postkasse", opgavetypeEn: "Mailbox installation", kategorier: ["Handyman"], kompleksitet: 1 },
    { opgavetype: "Rensning af afløb", opgavetypeEn: "Drain cleaning", kategorier: ["Handyman", "VVS"], kompleksitet: 1 },
    { opgavetype: "Udskiftning af lister", opgavetypeEn: "Baseboard replacement", kategorier: ["Handyman", "Tømrer"], kompleksitet: 1 },
    { opgavetype: "Oliebehandling af træoverflader", opgavetypeEn: "Oil treatment of wood surfaces", kategorier: ["Handyman"], kompleksitet: 1 },
    { opgavetype: "Opsætning af højskabe til væg", opgavetypeEn: "Wall-mounted tall cabinet installation", kategorier: ["Handyman", "Tømrer"], kompleksitet: 1 },
    { opgavetype: "Børnesikring", opgavetypeEn: "Childproofing", kategorier: ["Handyman"], kompleksitet: 1 }
];

// Tømrer opgavetyper
export const tømrerOpgavetyper = [
    { opgavetype: "Montering af døre (indvendige)", opgavetypeEn: "Door installation (interior)", kategorier: ["Tømrer"], kompleksitet: 2 },
    { opgavetype: "Udskiftning af dørkarme", opgavetypeEn: "Door frame replacement", kategorier: ["Tømrer"], kompleksitet: 2 },
    { opgavetype: "Montering af yderdøre", opgavetypeEn: "Exterior door installation", kategorier: ["Tømrer"], kompleksitet: 3 },
    { opgavetype: "Montering af vinduer", opgavetypeEn: "Window installation", kategorier: ["Tømrer"], kompleksitet: 3 },
    { opgavetype: "Udskiftning af vindueslister", opgavetypeEn: "Window trim replacement", kategorier: ["Tømrer"], kompleksitet: 1 },
    { opgavetype: "Reparation af vinduer", opgavetypeEn: "Window repair", kategorier: ["Tømrer"], kompleksitet: 2 },
    { opgavetype: "Opsætning af gipsvægge", opgavetypeEn: "Drywall installation", kategorier: ["Tømrer"], kompleksitet: 3 },
    { opgavetype: "Reparation af gipsvægge", opgavetypeEn: "Drywall repair", kategorier: ["Tømrer"], kompleksitet: 1 },
    { opgavetype: "Montering af loft i gips eller træ", opgavetypeEn: "Ceiling installation (drywall or wood)", kategorier: ["Tømrer"], kompleksitet: 3 },
    { opgavetype: "Opsætning af træpaneler", opgavetypeEn: "Wood paneling installation", kategorier: ["Tømrer"], kompleksitet: 2 },
    { opgavetype: "Montering af fodlister og gerigter", opgavetypeEn: "Baseboard and trim installation", kategorier: ["Tømrer"], kompleksitet: 1 },
    { opgavetype: "Opsætning af indfatninger", opgavetypeEn: "Door/window frame installation", kategorier: ["Tømrer"], kompleksitet: 1 },
    { opgavetype: "Opbygning af skillevægge", opgavetypeEn: "Partition wall construction", kategorier: ["Tømrer"], kompleksitet: 3 },
    { opgavetype: "Reparation af trægulve", opgavetypeEn: "Wood floor repair", kategorier: ["Tømrer"], kompleksitet: 2 },
    { opgavetype: "Lægning af trægulv", opgavetypeEn: "Wood floor installation", kategorier: ["Tømrer"], kompleksitet: 3 },
    { opgavetype: "Montering af køkkenelementer", opgavetypeEn: "Kitchen cabinet installation", kategorier: ["Tømrer"], kompleksitet: 2 },
    { opgavetype: "Udskiftning af bordplader", opgavetypeEn: "Countertop replacement", kategorier: ["Tømrer"], kompleksitet: 2 },
    { opgavetype: "Tilpasning af skabsmoduler", opgavetypeEn: "Cabinet module adjustment", kategorier: ["Tømrer"], kompleksitet: 2 },
    { opgavetype: "Opbygning af terrasse", opgavetypeEn: "Deck construction", kategorier: ["Tømrer"], kompleksitet: 3 },
    { opgavetype: "Reparation af terrasse", opgavetypeEn: "Deck repair", kategorier: ["Tømrer"], kompleksitet: 2 },
    { opgavetype: "Montering af hegn", opgavetypeEn: "Fence installation", kategorier: ["Tømrer"], kompleksitet: 2 },
    { opgavetype: "Opsætning af udhæng og sternbrædder", opgavetypeEn: "Eaves and fascia board installation", kategorier: ["Tømrer"], kompleksitet: 3 },
    { opgavetype: "Reparation af tagkonstruktioner", opgavetypeEn: "Roof structure repair", kategorier: ["Tømrer"], kompleksitet: 3 },
    { opgavetype: "Montering af tagvinduer (Velux)", opgavetypeEn: "Roof window installation (Velux)", kategorier: ["Tømrer"], kompleksitet: 3 },
    { opgavetype: "Isolering af loft", opgavetypeEn: "Attic insulation", kategorier: ["Tømrer"], kompleksitet: 2 },
    { opgavetype: "Isolering af ydervægge", opgavetypeEn: "Exterior wall insulation", kategorier: ["Tømrer"], kompleksitet: 2 },
    { opgavetype: "Udskiftning af loftbrædder", opgavetypeEn: "Ceiling board replacement", kategorier: ["Tømrer"], kompleksitet: 1 },
    { opgavetype: "Bygning af carport", opgavetypeEn: "Carport construction", kategorier: ["Tømrer"], kompleksitet: 3 },
    { opgavetype: "Reparation af skur", opgavetypeEn: "Shed repair", kategorier: ["Tømrer"], kompleksitet: 2 },
    { opgavetype: "Opbygning af redskabsrum", opgavetypeEn: "Tool shed construction", kategorier: ["Tømrer"], kompleksitet: 3 },
    { opgavetype: "Montering af gelænder og rækværk", opgavetypeEn: "Handrail and railing installation", kategorier: ["Tømrer"], kompleksitet: 2 }
];

// VVS opgavetyper
export const vvsOpgavetyper = [
    { opgavetype: "Udskiftning af vandhane", opgavetypeEn: "Faucet replacement", kategorier: ["VVS"], kompleksitet: 1 },
    { opgavetype: "Reparation af dryppende vandhane", opgavetypeEn: "Dripping faucet repair", kategorier: ["VVS"], kompleksitet: 1 },
    { opgavetype: "Udskiftning af blandingsbatteri i bruser", opgavetypeEn: "Shower mixer tap replacement", kategorier: ["VVS"], kompleksitet: 2 },
    { opgavetype: "Montering af toilet", opgavetypeEn: "Toilet installation", kategorier: ["VVS"], kompleksitet: 2 },
    { opgavetype: "Reparation af løbende toilet", opgavetypeEn: "Running toilet repair", kategorier: ["VVS"], kompleksitet: 1 },
    { opgavetype: "Udskiftning af cisterne", opgavetypeEn: "Toilet tank replacement", kategorier: ["VVS"], kompleksitet: 2 },
    { opgavetype: "Montering af håndvask", opgavetypeEn: "Bathroom sink installation", kategorier: ["VVS"], kompleksitet: 2 },
    { opgavetype: "Udskiftning af vandlås", opgavetypeEn: "P-trap replacement", kategorier: ["VVS"], kompleksitet: 1 },
    { opgavetype: "Montering af køkkenvask", opgavetypeEn: "Kitchen sink installation", kategorier: ["VVS"], kompleksitet: 2 },
    { opgavetype: "Tætning af rørforbindelser", opgavetypeEn: "Pipe connection sealing", kategorier: ["VVS"], kompleksitet: 1 },
    { opgavetype: "Reparation af mindre rørskader", opgavetypeEn: "Minor pipe damage repair", kategorier: ["VVS"], kompleksitet: 2 },
    { opgavetype: "Udskiftning af synlige rør", opgavetypeEn: "Visible pipe replacement", kategorier: ["VVS"], kompleksitet: 2 },
    { opgavetype: "Montering af brusekabine", opgavetypeEn: "Shower cabin installation", kategorier: ["VVS"], kompleksitet: 2 },
    { opgavetype: "Udskiftning af bruser og slange", opgavetypeEn: "Shower head and hose replacement", kategorier: ["VVS"], kompleksitet: 1 },
    { opgavetype: "Installation af termostatbatteri", opgavetypeEn: "Thermostatic mixer tap installation", kategorier: ["VVS"], kompleksitet: 2 },
    { opgavetype: "Afkalkning af vandhane eller bruser", opgavetypeEn: "Descaling of faucet or shower", kategorier: ["VVS"], kompleksitet: 1 },
    { opgavetype: "Udskiftning af cirkulationspumpe", opgavetypeEn: "Circulation pump replacement", kategorier: ["VVS"], kompleksitet: 3 },
    { opgavetype: "Service på varmeanlæg", opgavetypeEn: "Heating system service", kategorier: ["VVS"], kompleksitet: 3 },
    { opgavetype: "Udskiftning af radiatorventil", opgavetypeEn: "Radiator valve replacement", kategorier: ["VVS"], kompleksitet: 2 },
    { opgavetype: "Montering af radiator", opgavetypeEn: "Radiator installation", kategorier: ["VVS"], kompleksitet: 3 },
    { opgavetype: "Udluftning af radiatorer", opgavetypeEn: "Radiator bleeding", kategorier: ["VVS"], kompleksitet: 1 },
    { opgavetype: "Rensning af afløb", opgavetypeEn: "Drain cleaning", kategorier: ["Handyman", "VVS"], kompleksitet: 1 },
    { opgavetype: "Montering af opvaskemaskine", opgavetypeEn: "Dishwasher installation", kategorier: ["VVS"], kompleksitet: 1 },
    { opgavetype: "Montering af vaskemaskine", opgavetypeEn: "Washing machine installation", kategorier: ["VVS"], kompleksitet: 1 },
    { opgavetype: "Montering af vandfilter", opgavetypeEn: "Water filter installation", kategorier: ["VVS"], kompleksitet: 2 }
  ];
  

// Elektriker opgavetyper
export const elektrikerOpgavetyper = [
    { opgavetype: "Udskiftning af stikkontakt", opgavetypeEn: "Outlet replacement", kategorier: ["Elektriker"], kompleksitet: 1 },
    { opgavetype: "Montering af ny stikkontakt", opgavetypeEn: "New outlet installation", kategorier: ["Elektriker"], kompleksitet: 1 },
    { opgavetype: "Udskiftning af afbryder", opgavetypeEn: "Switch replacement", kategorier: ["Elektriker"], kompleksitet: 1 },
    { opgavetype: "Montering af lampeudtag", opgavetypeEn: "Light fixture outlet installation", kategorier: ["Elektriker"], kompleksitet: 1 },
    { opgavetype: "Installation af loftlamper", opgavetypeEn: "Ceiling light installation", kategorier: ["Elektriker"], kompleksitet: 1 },
    { opgavetype: "Montering af spots (indbygningsspots)", opgavetypeEn: "Recessed spotlight installation", kategorier: ["Elektriker"], kompleksitet: 2 },
    { opgavetype: "Fejlfinding på elektriske installationer", opgavetypeEn: "Electrical installation troubleshooting", kategorier: ["Elektriker"], kompleksitet: 2 },
    { opgavetype: "Reparation af fejlstrømsafbryder (HPFI)", opgavetypeEn: "RCD (GFCI) repair", kategorier: ["Elektriker"], kompleksitet: 2 },
    { opgavetype: "Udskiftning af gruppesikring", opgavetypeEn: "Circuit breaker replacement", kategorier: ["Elektriker"], kompleksitet: 1 },
    { opgavetype: "Opsætning af nye lampeudtag eller grupper", opgavetypeEn: "New light fixture outlets or circuits", kategorier: ["Elektriker"], kompleksitet: 2 },
    { opgavetype: "Installation af ny gruppe i eltavlen", opgavetypeEn: "New circuit installation in electrical panel", kategorier: ["Elektriker"], kompleksitet: 3 },
    { opgavetype: "Udskiftning af eltavle", opgavetypeEn: "Electrical panel replacement", kategorier: ["Elektriker"], kompleksitet: 3 },
    { opgavetype: "Udskiftning af termostater", opgavetypeEn: "Thermostat replacement", kategorier: ["Elektriker"], kompleksitet: 1 },
    { opgavetype: "Montering af elradiator", opgavetypeEn: "Electric radiator installation", kategorier: ["Elektriker"], kompleksitet: 2 },
    { opgavetype: "Installation af ventilator på badeværelse", opgavetypeEn: "Bathroom fan installation", kategorier: ["Elektriker"], kompleksitet: 2 },
    { opgavetype: "Montering af emhætte", opgavetypeEn: "Range hood installation", kategorier: ["Elektriker"], kompleksitet: 2 },
    { opgavetype: "Montering af udendørs belysning", opgavetypeEn: "Outdoor lighting installation", kategorier: ["Elektriker"], kompleksitet: 1 },
    { opgavetype: "Fejlfinding på havelamper", opgavetypeEn: "Garden light troubleshooting", kategorier: ["Elektriker"], kompleksitet: 1 },
    { opgavetype: "Installation af ladestation til elbil", opgavetypeEn: "Electric car charging station installation", kategorier: ["Elektriker"], kompleksitet: 3 },
    { opgavetype: "Opsætning af smart home-styrede lysdæmpere", opgavetypeEn: "Smart home-controlled dimmer setup", kategorier: ["Elektriker"], kompleksitet: 2 },
    { opgavetype: "Montering af smart home-brytere", opgavetypeEn: "Smart home switch installation", kategorier: ["Elektriker"], kompleksitet: 1 },
    { opgavetype: "Reparation eller udskiftning af lampeudtag", opgavetypeEn: "Light fixture outlet repair or replacement", kategorier: ["Elektriker"], kompleksitet: 1 },
    { opgavetype: "Udtrækning af kabler gennem rør", opgavetypeEn: "Cable pulling through conduit", kategorier: ["Elektriker"], kompleksitet: 2 },
    { opgavetype: "Flytning af stikkontakt eller afbryder", opgavetypeEn: "Outlet or switch relocation", kategorier: ["Elektriker"], kompleksitet: 1 },
    { opgavetype: "Installation af udendørs stikkontakter", opgavetypeEn: "Outdoor outlet installation", kategorier: ["Elektriker"], kompleksitet: 2 }
  ];
  

// Murer opgavetyper
export const murerOpgavetyper = [
    { opgavetype: "Reparation af murværk", opgavetypeEn: "Masonry repair", kategorier: ["Murer"], kompleksitet: 2 },
    { opgavetype: "Udskiftning eller reparation af fuger", opgavetypeEn: "Joint replacement or repair", kategorier: ["Murer"], kompleksitet: 2 },
    { opgavetype: "Opsætning af fliser", opgavetypeEn: "Tile installation", kategorier: ["Murer"], kompleksitet: 2 },
    { opgavetype: "Reparation af fliser eller klinker", opgavetypeEn: "Tile or brick repair", kategorier: ["Murer"], kompleksitet: 1 },
    { opgavetype: "Pudsning af vægge", opgavetypeEn: "Wall plastering", kategorier: ["Murer"], kompleksitet: 2 },
    { opgavetype: "Filtsning eller vandskuring af vægge", opgavetypeEn: "Wall sanding or water blasting", kategorier: ["Murer"], kompleksitet: 2 },
    { opgavetype: "Reparation af sokkel", opgavetypeEn: "Foundation/base repair", kategorier: ["Murer"], kompleksitet: 2 },
    { opgavetype: "Pudsning af sokkel", opgavetypeEn: "Foundation/base plastering", kategorier: ["Murer"], kompleksitet: 2 },
    { opgavetype: "Opmuring af mindre væg eller skillevæg", opgavetypeEn: "Small wall or partition wall masonry", kategorier: ["Murer"], kompleksitet: 3 },
    { opgavetype: "Reparation af beton", opgavetypeEn: "Concrete repair", kategorier: ["Murer"], kompleksitet: 2 },
    { opgavetype: "Udbedring af fugtskader", opgavetypeEn: "Moisture damage remediation", kategorier: ["Murer"], kompleksitet: 3 },
    { opgavetype: "Mikrocement på vægge eller gulve", opgavetypeEn: "Microcement on walls or floors", kategorier: ["Murer"], kompleksitet: 3 },
    { opgavetype: "Reparation af revner i vægge", opgavetypeEn: "Wall crack repair", kategorier: ["Murer"], kompleksitet: 1 }
  ];

// Rengøring opgavetyper
export const rengøringOpgavetyper = [
    { opgavetype: "Almindelig rengøring", opgavetypeEn: "Regular cleaning", kategorier: ["Rengøring", "Handyman"], kompleksitet: 1 },
    { opgavetype: "Hovedrengøring", opgavetypeEn: "Deep cleaning", kategorier: ["Rengøring"], kompleksitet: 2 },
    { opgavetype: "Køkkenrengøring", opgavetypeEn: "Kitchen cleaning", kategorier: ["Rengøring"], kompleksitet: 1 },
    { opgavetype: "Badeværelsesrengøring", opgavetypeEn: "Bathroom cleaning", kategorier: ["Rengøring"], kompleksitet: 1 },
    { opgavetype: "Vinduespudsning", opgavetypeEn: "Window cleaning", kategorier: ["Rengøring"], kompleksitet: 1 },
    { opgavetype: "Flytterengøring", opgavetypeEn: "Move-out cleaning", kategorier: ["Rengøring"], kompleksitet: 2 },
    { opgavetype: "Rengøring efter håndværkere", opgavetypeEn: "Post-construction cleaning", kategorier: ["Rengøring"], kompleksitet: 2 },
    { opgavetype: "Gulvbehandling (vask, polering)", opgavetypeEn: "Floor treatment (washing, polishing)", kategorier: ["Rengøring"], kompleksitet: 2 },
    { opgavetype: "Tæpperens", opgavetypeEn: "Carpet cleaning", kategorier: ["Rengøring"], kompleksitet: 2 },
    { opgavetype: "Møbelrens", opgavetypeEn: "Furniture cleaning", kategorier: ["Rengøring"], kompleksitet: 2 }
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
