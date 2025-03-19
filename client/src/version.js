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
    version: "1.1.15",
    date: "19. marts 2025",
    changes: [
        "Rettede et problem, der gjorde, at brugeren kortvarigt ville se loginskærmen selvom man var logget ind når man åbnede app'en. Det sker nu ikke længere.",
        "Sikrede, at beskrivelsen i input-feltet over Mobile Pay-anmodningsknappen bliver vist i sin helhed selv på små skærme.",
        "Fjernede fejlbehæftet 'Gå til bruger'-knap, der dukkede op ved oprettelse af ny bruger.",
        "Akkumuleringsvisninger vises nu altid med to decimaler, hvilket gør det nemmere og mere gennemskueligt for brugere at kopiere data over i eget regnskab.",
        "Smårettelser og justeringer."
    ]
},{
    version: "1.1.14",
    date: "18. marts 2025",
    changes: [
        "Man kan nu klikke på billeder vedhæftet posteringer for at se billederne i en større version."
    ]
},{
    version: "1.1.13",
    date: "18. marts 2025",
    changes: [
        "Ved oprettelse og redigering af posteringer vil man nu kunne se en loading-spinner, når upload af kvitteringsbilleder er i gang.",
        "Smårettelser, justeringer og designforbedringer."
    ]
},{
    version: "1.1.12",
    date: "17. marts 2025",
    changes: [
        "Oprettelse af nye og redigering af eksisterende besøg og ledigheder er nu justeret til at registrere sig i kalenderen med danske tidszoner. Det var de ikke før.",
        "Man kan nu ikke længere registrere betaling for en fremtidig dato når man manuelt vil afslutte en opgave."
    ]
},{
    version: "1.1.11",
    date: "17. marts 2025",
    changes: [
        "Designforbedringer for posteringssatser-popup'en."
    ]
},{
    version: "1.1.10",
    date: "17. marts 2025",
    changes: [
        "Implementerede bedre fejlhåndtering i app'en. Hvis app'en støder på en fejl får brugeren nu mulighed for at gå tilbage til forsiden – og gentager fejlen sig får brugeren nu også instrukser til hvordan vedkommende giver udvikleren besked.",
        "Smårettelser og justeringer."
    ]
},{
    version: "1.1.9",
    date: "17. marts 2025",
    changes: [
        "Bugfix i økonomi-overblikket."
    ]
},{
    version: "1.1.8",
    date: "17. marts 2025",
    changes: [
        "Implementerede cloudlagring af genererede fakturaer.",
        "Når fakturaer sendes ud får modtageren nu både en SMS og en e-mail med fakturaen vedhæftet.",
        "Når en opgave afsluttes gennem oprettelse af faktura vil fakturaen nu kunne åbnes via en knap på opgave-siden i app'en. Dette gør det muligt for medarbejderen at åbne fakturaen direkte i app'en, og sende den videre til kunden i det tilfælde, at kunden ikke modtager den med det samme."
    ]
},{
    version: "1.1.7",
    date: "17. marts 2025",
    changes: [
        "Designforbedringer i posteringerne.",
        "Rettede et problem, der opstod hvis man indstillede rabatprocenten til 100%. Nu kan rabatprocenten indstilles op til 99%. Vil man give 100% rabat på en postering skal man derimod benytte sig af manuel indtastning af honorar / pris."
    ]
},{
    version: "1.1.6",
    date: "17. marts 2025",
    changes: [
        "Rettede et problem, der gjorde, at man ikke kunne uploade kvitteringer i posteringer på mobilen.",
        "Smårettelser og justeringer."
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