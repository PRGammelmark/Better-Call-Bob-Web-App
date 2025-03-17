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
    version: "1.1.6",
    date: "17. marts 2025",
    changes: [
        "Rettede et problem, der gjorde, at man ikke kunne uploade kvitteringer i posteringer på mobilen."
    ]
},{
    version: "1.1.5",
    date: "17. marts 2025",
    changes: [
        "Administratorer kan nu finjustere rabatsatsen for enkelte posteringer, både når posteringer oprettes og redigeres.",
        "Smårettelser og justeringer."
    ]
},{
    version: "1.1.4",
    date: "16. marts 2025",
    changes: [
        "Posteringer, der tilhører afsluttede lønperioder, er nu låst og kan ikke længere redigeres i  eller slettes. Lønperioder går fra d. 20.-d. 19. Medarbejdere har til og med d. 19. i hver måned til at oprette og justere i posteringer for den indeværende lønperiode. Denne ændring sikrer, at tidligere lønperioder, for hvilke der allerede er afregnet udbetalinger, altid holder retvisende data i systemet.",
        "Smårettelser og justeringer."
    ]
},{
    version: "1.1.3",
    date: "15. marts 2025",
    changes: [
        "Smårettelser og justeringer."
    ]
},{
    version: "1.1.2",
    date: "15. marts 2025",
    changes: [
        "Rettede en fejl, hvor økonomioversigten på siden 'Overblik' nogle gange viste forkerte data til medarbejdere.",
        "Rettede den samme fejl for administratorers økonomiske overblik.",
        "Nu kan administratorer også tilgå den samme oversigt over akkumulerede poster for en valgt måned for hver medarbejder.",
        "Opdaterede honorar-priserne for at medbringe egen trailer.",
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