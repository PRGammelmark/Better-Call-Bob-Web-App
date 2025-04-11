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
    version: "1.3.7",
    date: "11. april 2025",
    changes: [
        "Adskillige designjusteringer og -forbedringer på mobilversionen af opgavesiden."
    ]
},{
    version: "1.3.6",
    date: "11. april 2025",
    changes: [
        "Rettede en fejl, hvor videoer på opgavesider automatisk ville åbne så snart man åbnede opgavesiden. Det gør de nu ikke længere."
    ]
},{
    version: "1.3.5",
    date: "10. april 2025",
    changes: [
        "Forbedrede visning af videoer på opgavesider.",
        "Fejlrettelser og justeringer."
    ]
},{
    version: "1.3.4",
    date: "9. april 2025",
    changes: [
        "Opjusterede kvaliteten af uploadede videoer efter komprimering."
    ]
},{
    version: "1.3.3",
    date: "9. april 2025",
    changes: [
        "Ændrede antallet af billeder man kan uploade pr. opgave fra 5 til 10.",
        "Nu kan man også uploade videofiler.",
        "Smårettelser og justeringer."
    ]
},{
    version: "1.3.2",
    date: "8. april 2025",
    changes: [
        "Smårettelser og justeringer."
    ]
},{
    version: "1.3.1",
    date: "8. april 2025",
    changes: [
        "Tilrettede metoden man sletter opgavebilleder på på mobilen. Når man trykker ind på et billede har man nu muligheden for at slette den i popup'en, i stedet for, at man bliver promptet når man holder et billede nede i overblikket."
    ]
},{
    version: "1.3",
    date: "8. april 2025",
    changes: [
        "Nu kan man uploade billeder til en opgave. Upload af billeder er p.t. muligt når man er inde på en allerede oprettet opgave. Umiddelbart under opgavebeskrivelsen er der et billedfelt med et '+'-ikon. På mobilen kan man både vælge mellem billeder på telefonen såvel som at bruge telefonens kamera. På computer kan man enten vælge billeder fra sit arkiv, eller man kan trække-og-slippe et billede fra en mappe på computeren og i billedfeltet. Alle billeder vil blive komprimeret før upload for at spare plads og båndbredde. Op til fem billeder er tilladt pr. opgave. Tilknyttede billeder vises i en række under opgavebeskrivelsen. Man kan trykke dem store, og både almindelige medarbejdere og administratorer kan slette eksisterende billeder og uploade nye. Sletning kan lade sig gøre ved at klikke på skraldespanden når man bevæger musen over et billede, eller ved på mobilen at trykke og holde på det billede, man vil slette. På sigt vil billedupload også være muligt fra 'Opret opgave'-siden.",
        "Når man tømmer papirkurven under 'Slettede opgaver' skal man nu ikke længere opdatere siden før papirkurven nu også rent faktisk præsenterer sig selv som tømt.",
        "Rettede en fejl på infopillerne, der på computerskærme gjorde, at man kunne scrolle horisontalt på åbne opgaver. Det kan man ikke længere.",
        "Tilføjede et navigations-ikon til 'Find vej'-knappen på åbne opgavesider."
    ]
},{
    version: "1.2.7",
    date: "7. april 2025",
    changes: [
        "De første forberedelser til system-integration med Better Call Bob's websites er sat i søen. Da hjemmesidens besøgende ikke er logget ind i systemet får de adgang til en åben formular, der kan oprette opgaver direkte i app'en. Til gengæld er andre sikkerhedsforanstaltninger blevet opsat for disse formularer. Maks 5 opgaver kan oprettes i minuttet, og maks 100 opgaver kan oprettes om dagen. Inputs til nye opgaver valideres både på klienten og på serveren, og så er der opsat en usynlig ReCAPTCHA.",
        "Byggede en frontend-kopi af den aktuelle formular på Better Call Bob's website som et Wordpress-plugin."
    ]
},{
    version: "1.2.6",
    date: "2. april 2025",
    changes: [
        "Alle infopiller har nu samme højde.",
        "Hvis en mobilskærm ikke kan vise alle tilgængelige infopiller på een gang, så kan man nu scrolle horisontalt på dem.",
        "Tilføjet en infopille, der giver informationer om hvornår en kunde ønsker arbejdet starter.",
        "Infopillen, der viser om kunden har egen stige, lyser nu rød hvis kunden ikke har stige.",
        "Foretog flere rettelser i den automatiske email-kvittering, som kunden får tilsendt når vedkommende har betalt for en opgave via Mobile Pay. Bl.a. viste kvitteringen overflødige linjer for udlæg, manglede et minus foran rabat-linjen, og så indeholdt beregningen af hhv. rabatter og opstartsgebyrer fejl, som nu alle er rettet.",
        "Rettede desuden en fejl i email-kvitteringen, hvor posteringer med faste priser blev korrekt medregnet i totalbeløbet, men ikke listet korrekt i kvitteringsoversigten. Det gør de nu.",
        "Små designjusteringer på 'Tilføj postering'-popup'en."
    ]
},{
    version: "1.2.5",
    date: "1. april 2025",
    changes: [
        "Åbne opgaver indeholder nu info-piller under opgavebeskrivelsen. Infopillerne giver hurtige, nyttige informationer om opgaven – bl.a. om hvorvidt kunden er en erhvervskunde eller en privatkunde, og om hvorvidt kunden har egen stige eller ikke."
    ]
},{
    version: "1.2.4",
    date: "1. april 2025",
    changes: [
        "Smårettelser og justeringer på 'Opret opgave'-siden.",
        "Hvis kunden har egen stige kan man nu se det umiddelbart under opgavebeskrivelsen."
    ]
},{
    version: "1.2.3",
    date: "1. april 2025",
    changes: [
        "Rettede en fejl, hvor posteringer med faste priser ikke blev medtaget korrekt på den autogenererede faktura. Det gør de nu.",
        "Rettede en fejl, hvor privatkunder ville blive faktureret 49 kr. i administrationsgebyr pr. postering i stedet for i alt, hvis de ville betale via faktura i stedet for med Mobile Pay.",
        "Når man opretter en opgave kan man nu registrere om det er en opgave for en engelsk-talende kunde. I dette tilfælde vil al automatisk kommunikation med kunden – fx e-mails, SMS'er, regninger, osv. – være på engelsk.",
        "Man kan nu ændre kundens sprog-indstillinger under 'Rediger kundeinformationer' på åbne opgaver.",
        "Når en Mobile Pay-betaling er registreret afsluttes opgaven nu med det samme. Det krævede før en opdatering af opgave-siden.",
        "Rettede en fejl, der gjorde, at 'Opret regning' stadig var synlig efter en afsluttet Mobile Pay-betaling."
    ]
},{
    version: "1.2.2",
    date: "1. april 2025",
    changes: [
        "Rettede en fejl, der tidligere gjorde det muligt for almindelige medarbejdere at slette, redigere i og se satser for andre medarbejderes posteringer. Dette er nu ikke længere muligt. Fremover kan medarbejdere slette, redigere i og se satser udelukkende for egne posteringer. Administratorer kan fortsat både redigere, slette og se satser for alles posteringer.",
        "Smårettelser og justeringer.",
        "App'en sender nu mails fra 'hej@bettercallbob.dk' istedet for 'kontakt@bettercallbob.dk'."
    ]
},{
    version: "1.2.1",
    date: "31. marts 2025",
    changes: [
        "Når en administrator opretter en postering på en opgave på vegne af en anden medarbejder vil den pågældende medarbejder nu automatisk blive tilføjet som ansvarlig til opgaven, hvis medarbejderen ikke i forvejen er det. Medarbejderen vil også modtage en mail-notifikation om, at vedkommende er blevet tilknyttet en ny opgave.",
        "Når en administrator booker et besøg for en medarbejder fra overblikskalenderen, og tilknytter besøget til en eksisterende opgave, så vil administratoren nu i udgangspunktet kunne vælge mellem alle medarbejdere at knytte til besøget – ikke blot dem, som i forvejen står som værende ansvarlige på opgaven."
    ]
},{
    version: "1.2",
    date: "31. marts 2025",
    changes: [
        "Sektionen 'Udgifter' på opgavesiderne viste i nogle tilfælde beregninger baseret på standardsatser i stedet for medarbejdernes faktiske lønsatser. Fejlen er nu rettet.",
        "Nu kan administratorer oprette posteringer på vegne af medarbejdere på åbne opgaver, hvor den pågældende medarbejder er listet som ansvarlig. Vælger man en anden medarbejder justerer posteringen automatisk beregningen efter den pågældende medarbejders aktuelle lønsatser.",
        "Små designforbedringer i 'Opret postering'- og 'Rediger postering'-vinduet."
    ]
},{
    version: "1.1.32",
    date: "27. marts 2025",
    changes: [
        "Rettede en fejl, der gjorde det muligt at oprette posteringer uden indhold. Ligeledes kan man nu heller ikke fjerne al indhold fra en eksisterende postering."
    ]
},{
    version: "1.1.31",
    date: "27. marts 2025",
    changes: [
        "Smårettelser og justeringer.",
        "Rettede en fejl, hvor det ikke fremgik af en postering, at den enten arbejdede med fast honorar eller fast pris når man åbnede en eksisterende postering for at redigere i den.",
        "Rettede en fejl, hvor faste honorarer for indeværende måned ikke fremgik korrekt af overblikssidens akkumulerede økonomiske overblik – hverken for medarbejdere eller for administratorer. Det gør de nu."
    ]
},{
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