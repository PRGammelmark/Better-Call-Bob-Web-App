// ÆNDRINGER MARKERES I CHANGES-KONSTANTEN HERUNDER
// Nye ændringer tilføjes i begyndelsen af array'et.
// 
// ===================================================
// 
// Versioneringskonventioner:
// x.x.(+) => Hotfixes, bugfixes, rettelser og små tilpasninger
// 
// x.(+).x => Nye sekundærfunktioner, betydningsfulde designændringer 
// 
// (+).x.x => Nye primære funktioner
// 
// ===================================================
// 

const changes = [{
    version: "1.1.2",
    date: "15. marts 2025",
    changes: [
        "Rettede en fejl, hvor økonomioversigten på siden 'Overblik' nogle gange viste forkerte data til medarbejdere.",
        "Smårettelser og justeringer."
    ]
},{
    version: "1.1.1",
    date: "14. marts 2025",
    changes: [
        "Rettede en fejl, hvor den akkumulerede økonomi-oversigt ikke viste retvisende rabatter eller udlæg.",
        "Smårettelser og justeringer."
    ]
},{
    version: "1.1",
    date: "14. marts 2025",
    changes: [
        "Medarbejdere kan nu tilgå en oversigt over akkumulerede poster for en valgt måned. I sektionen 'Din Økonomi' på overblikssiden trykker man 'Detaljer', og vælger en måned – herefter får man hhv. en opsummering, en akkumulering af timer og tillæg samt et posteringsgrundlag for den pågældende måned.",
        "Designforbedringer.",
        "Smårettelser og justeringer."
    ]
},{
    version: "1.0.1",
    date: "13. marts 2025",
    changes: [
        "Smårettelser på versionssystemet."
    ]
},
{
    version: "1.0",
    date: "13. marts 2025",
    changes: [
        "Versionssystem implementeret.",
        "Ændringslog implementeret."
    ]
}]

const currentVersion = changes[0].version;

export { currentVersion, changes }