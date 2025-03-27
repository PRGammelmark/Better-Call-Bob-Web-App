// ÆNDRINGER MARKERES I CHANGES-KONSTANTEN HERUNDER
// Nye ændringer tilføjes i begyndelsen af array'et.
// 
// ===================================================
// 
// Versioneringskonventioner:
// x.x.(+) => Hotfixes, bugfixes, rettelser og små tilpasninger i design og/eller funktionalitet
// 
// x.(+).x => Nye sekundærfunktioner, betydningsfulde designændringer 
// 
// (+).x.x => Nye primære funktioner
// 
// ===================================================
// 

const changes = [{
    version: "1.1.30",
    date: "27. marts 2025",
    changes: [
        "Implementerede sidestyring under 'Opdateringer', da listen efterhånden er blevet lang."
    ]
},{
    version: "1.1.29",
    date: "26. marts 2025",
    changes: [
        "Medarbejdere bliver nu gjort opmærksom på hvis opgaven, de arbejder på, er en tilbudsopgave. Tilbudsopgaver afregnes manuelt efter færdiggørelse, og medarbejderen skal derfor ikke selv stå for afregning med kunden. Medarbejderen skal oprette posteringer på tilbudsopgaver som man plejer – det er også beskrevet umiddelbart under 'Posteringer'-sektionen på opgaverne.",
        "Man kan nu trykke direkte på en postering for at vende den om. Denne funktion virker kun for administratorer.",
        "Rettede en fejl, hvor man kunne oprette besøg på afsluttede opgaver. Det kan man nu ikke længere.",
        "Rettede en lignende fejl, hvor man kunne gøre det samme på opgaver, der var færdiggjorte."
    ]
},{
    version: "1.1.28",
    date: "26. marts 2025",
    changes: [
        "Tilføjede en 'Indsend'-knap til kommentarer på opgaver ved siden af tekst-inputfeltet. I nogle tilfælde kunne det nemlig være forvirrende, at den eneste måde at indsende en kommentar på var gennem 'Enter'-knappen, eller via en knap indlejret på det virtuelle tastatur.",
        "Hvis man førhen ikke tilføjede en beskrivelse til en postering ville denne, når der blev genereret en faktura, i nogle tilfælde koble 'Ingen beskrivelse' efter fx 'Handymanarbejde: ' på den endelige faktura. Det gør den ikke længere.",
        "Nu kan brugere ikke længere færdiggøre og afregne med kunden for en opgave, hvis der er fremtidige besøg i kalenderen for den pågældende opgave. Dette sikrer, at en opgave løses helt færdig, og at alle posteringer kan oprettes inden afregning foretages med kunden."
    ]
},{
    version: "1.1.27",
    date: "25. marts 2025",
    changes: [
        "Smårettelser og justeringer.",
        "Rettede en fejl, der gjorde, at man ikke kunne begrænse brugeradgangen til uploadede dokumenter gennem upload-formularen – kun gennem 'Rediger dokument'-popup'en. Det virker korrekt nu.",
        "Rettede en fejl, der gjorde, at medarbejdere nogle gange blev bedt om at underskrive et dokument, der ikke skulle underskrives.",
        "Rettede en fejl, hvor ikke-administratorer fik en fejlmeddelelse når de klikkede på et billede-dokument for at se en forstørret version af billedet."
    ]
},{
    version: "1.1.26",
    date: "25. marts 2025",
    changes: [
        "Rettede en fejl, hvor alle og enhver kunne redigere og slette i både egne og andres opgavekommentarer. Nu kan forfattere til kommentarer kun redigere og slette deres egne. Administratorer kan slette andres kommentarer, men ikke redigere i dem."
    ]
},{
    version: "1.1.25",
    date: "25. marts 2025",
    changes: [
        "Forsøg på at oprette besøg gennem ledige tider i administratorens overblikskalender skabte nogle gange fejl. Mekanismen er rettet til.",
        "Rettede en fejl, hvor oprettelse af besøg gennem ledige tider vist i kalenderen på åbne opgavesider ikke sendte e-mailnotifikationer til den pågældende medarbejder, besøget blev oprettet på vegne af.",
        "Rettede en lignende fejl i email-notifikationerne sendt fra admin-overblikskalenderen.",
        "Smårettelser og justeringer."
    ]
},{
    version: "1.1.24",
    date: "21. marts 2025",
    changes: [
        "Forbedrede brugeroplevelsen ved upload af dokumenter. Nu får man feedback i form af en grå upload-knap samt en loading-spinner, når et upload er i gang.",
        "Rettede en fejl, der opstod når man vil uploade flere dokumenter i træk. Upload-vinduet antog tidligere, at man ikke var færdig med at uploade eller redigere i det første dokument, når man åbnede vinduet igen for at gå i gang med at uploade et andet.",
        "Rettede en fejl, der forhindrede en administrator i at begrænse dokument-deling hvis nogle allerede havde underskrevet et dokument. Idéen bag at forhindre begrænsning af dokumentdeling når nogle havde underskrevet var, at et underskrevet dokument ikke skulle kunne gøres utilgængeligt for den medarbejder, der havde underskrevet det. Men for medarbejdere, der alligevel ikke har underskrevet et dokument, skal dokumentet kunne gøres utilgængeligt igen. Fejlen er hermed rettet."
    ]
},{
    version: "1.1.23",
    date: "20. marts 2025",
    changes: [
        "Rettede en fejl, hvor almindelige brugere fik mulighed for at redigere besøg gennem popup-visning af ledige tider. Nu vises vinduet korrekt.",
        "Ikke-administratorer kan nu ikke længere slette eller redigere i andres besøg via kalenderen på opgavesiderne – de kan nu kun redigere og slette deres egne besøg. Administratorer kan fortsat oprette, redigere og slette besøg på vegne af medarbejdere.",
        "Rettede en fejl, hvor brugere i nogle tilfælde kunne oprette besøg via opgavekalenderen på vegne af andre. Det er nu kun administratorer, der kan det."
    ]
},{
    version: "1.1.22",
    date: "20. marts 2025",
    changes: [
        "Når man åbner en kvittering eller et billede i et popup-vindue vil luk-knappen fremover blot lukke billedvisningen – ikke hele popup-vinduet.",
        "Smårettelser og justeringer."
    ]
},{
    version: "1.1.21",
    date: "20. marts 2025",
    changes: [
        "Rettede en fejl, hvor ledige tider i kalenderen på opgavesider blev vist med forkerte tider, hvis en opgave for samme medarbejder var blevet oprettet i en del af samme tidsrum som den pågældende ledige tid. Nu vises de korrekte tider.",
        "Smårettelser og justeringer."
    ]
},{
    version: "1.1.20",
    date: "20. marts 2025",
    changes: [
        "Når man åbner et besøg fra kalenderen inde på en opgave vil man nu ikke længere se en ikke-funktionel knap, der forsøger at tage en til samme opgave.",
        "Designforbedringer på knapperne på besøg-popup'en (nu har man rent faktisk en chance for at ramme dem ordentligt på mobilen).",
        "Når man vil redigere et besøg fremstår redigeringsvinduet nu med flere relevante detaljer om besøget – bl.a. hvem besøget er hos, hvor det er henne og for hvilken medarbejder besøget er registreret. Dette var ikke tilfældet tidligere."
    ]
},{
    version: "1.1.19",
    date: "19. marts 2025",
    changes: [
        "Almindelige brugere kunne ved en fejl se alle opgaver i systemet hvis de forsøgte at oprette et besøg på en eksisterende opgave via kalenderen på overblikssiden. Funktionen gav også almindelige brugere mulighed for at oprette nye opgaver. Begge fejl er nu rettet.",
        "Oprettelse af besøg fra kalenderen på overblikssiden gør nu brugeren opmærksom på hvis der ikke findes eksisterende opgaver at knytte besøget til, og forhindrer brugeren i at gå videre.",
        "Kalenderen på overblikssiden vil nu for alle ikke-administratorer antage, at det er for brugeren selv at et besøg oprettes. Tidligere hen skulle brugeren specificere det manuelt. Administratorer kan fortsat oprette besøg for alle brugere via kalenderen på overblikssiden."
    ]
},{
    version: "1.1.18",
    date: "19. marts 2025",
    changes: [
        "Div. designforbedringer på 'Team'-siden."
    ]
},{
    version: "1.1.17",
    date: "19. marts 2025",
    changes: [
        "Fjernede ikke-funktionelle knapper og indstillinger på 'Indstillinger'-siden."
    ]
},{
    version: "1.1.16",
    date: "19. marts 2025",
    changes: [
        "Hvis man afregner med faktura til erhvervskunder vil systemet nu oprette en fakturakladde i stedet for en booket faktura. Fakturakladder kan manuelt gennemses og justeres i fra internt regnskabssystem inden de sendes videre til erhvervskunden. Ved oprettelse af fakturakladde får regnskabsansvarlig besked via mail – kunden får ikke notifikation på oprettelsen af kladden. Fakturakladden kan ikke åbnes via app'en – kun oprettes.",
        "Afregning med faktura afslutter nu opgaven med det samme. Når opgaven er afsluttet kan den ikke genåbnes i app'en. Fakturabetaling trackes herfra via regnskabssystem, og skal ikke registreres i app'en.",
        "Hvis man afregner med faktura til privatkunder bliver fakturaen booket og sendt afsted til kunden med det samme. Fakturaen kan åbnes via app'en.",
        "Rettede en fejl, hvor en afsluttet opgave viste en knap til åbning af faktura, der ikke virkede. Knappen virker nu.",
        "Smårettelser og justeringer."
    ]
},{
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