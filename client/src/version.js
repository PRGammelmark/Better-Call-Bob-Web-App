// ÆNDRINGER MARKERES I CHANGES-ARRAY'ET HERUNDER
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

// {
//     version: "2.1.2",
//     date: "2. juli 2025",
//     changes: [
//         "Afsluttede opgaver for privatkunder viser nu ikke længere 'Betal nu'-knappen umiddelbart efter at faktura er blevet oprettet på opgaven. Det gjorde de før ved en fejl.",
//         "Implementerede bedre fejlhåndtering, når man forsøger at uploade videoer på opgaver.",
//         "Ledige tider blev i nogle tilfælde fejlrepræsenteret pga. tidszoneforskelle i kalenderen. Dette er nu rettet.",
//         "Nu kan medarbejdere slette deres egne ledige tider i både overbliks- og opgavekalenderen. Administratorer kan slette egne og andres i de samme kalendere.",
//         "Fremover vil alle kalendre i app'en automatisk opdatere sig selv hvert 15. minut. Dette mindsker risikoen for, at brugere og administratorer sidder med forældede informationer.",
//         "Når man opretter en ny kunde i 'Ny opgave'-formularen vil felterne nu fjerne alle mellemrum i CVR-, telefon- og email-felterne. Derudover vil input-felterne i de øvrige automatisk fjerne ekstra mellemrum før og efter inputtet.",
//         "Det samme gør sig gældende når man opretter en ny kunde i 'Ny kunde'-formularen, såvel som når man redigerer en eksisterende kunde.",
//         "Tilføjede mulighed for at ændre en kundes telefonnummer.",
//         "Nu kan administratorer redigere i en kundes informationer direkte fra opgave-siden.",
        
//     ]
// }

const changes = [{
    version: "2.1.3",
    date: "2. juli 2025",
    changes: [
        "Rettede en fejl, hvor processen for AI-udtræk af data fra opgavebeskrivelsen ikke kunne startes igen før page reload, hvis der var en fejl i AI'ens output. Tilføjede derudover fejlmeddelelser, der beskriver hvad der gik galt, hvis der opstod en fejl.",
        "Gjorde AI-outputtet mere stabilt i data-udtræk fra opgavebeskrivelsen."
    ]
},{
    version: "2.1.2",
    date: "2. juli 2025",
    changes: [
        "Når man opretter en ny kunde i 'Ny opgave'-formularen vil felterne nu fjerne alle mellemrum i CVR-, telefon- og email-felterne. Derudover vil input-felterne i de øvrige automatisk fjerne ekstra mellemrum før og efter inputtet.",
        "Implementerede en AI, der automatisk kan udtrække data fra opgavebeskrivelsen og indsætte det i de relevante felter i 'Ny opgave'-formularen."
    ]
},{
    version: "2.1.1",
    date: "1. juli 2025",
    changes: [
        "Rettede en fejl, hvor man førhen ikke kunne ændre en kundes postnummer og by efter kunden var blevet oprettet.",
        "'Rediger kunde'-formularen fortæller nu hvis der sker en fejl under opdateringen af kunden."
    ]
},{
    version: "2.1.0",
    date: "1. juli 2025",
    changes: [
        "'Opret opgave'-formularen er blevet gjort lettere og hurtigere at bruge.",
        "Når man opretter en ny opgave er fanen 'Opgave' og 'Kunde' nu samlet i ét trin i stedet for flere.", 
        "Formularen giver nu mere finkornet feedback, hvis der er felter, man mangler at udfylde.",
        "'Opret opgave'-formularen antager nu også, at man vil oprette en ny kunde før man vælger det – og man kan altid vælge at finde en eksisterende kunde til den nye opgave i stedet.",
        "Formularen tillader nu også, at man kan oprette et besøg inden man har tilknyttet en medarbejder til opgaven. I dette tilfælde kan man hoppe direkte til tabben 'besøg', der vil vise alle medarbejderes ledige tider. Her vælger man blot den ønskede medarbejders ledige tid, og opretter et besøg gennem denne.",
        "'Opret opgave'-formularen hopper nu automatisk til besøgskalenderen når man har tilknyttet en medarbejder til opgaven. Besøgskalenderen vil her vise medarbejderens ledighed i stedet for besøg, så man nemt kan booke et nyt besøg direkte ind i den.",
        "Feltet under opgavebeskrivelsen, hvor man kunne indtaste kundens ønskede udførelsesdato, er blevet fjernet, da processen nu lægger op til, at man vil booke et besøg på opgaven med det samme.",
        "Designjusteringer og -forbedringer på samme formular.",
        "Smårettelser og justeringer."
    ]
},{
    version: "2.0.13",
    date: "30. juni 2025",
    changes: [
        "Førhen opdaterede opgavesiden ikke sig selv automatisk før reload når en opgave blev afsluttet via fakturaoprettelse. Dette er nu rettet."
    ]
},{
    version: "2.0.12",
    date: "30. juni 2025",
    changes: [
        "Navigationsmenuen på mobilen har fået en UX-forbedring, og er nu mere intuitiv og enkel at bruge.",
        "Smårettelser og justeringer."
    ]
},{
    version: "2.0.11",
    date: "30. juni 2025",
    changes: [
        "I nogle tilfælde kunne tilbudsopgaver ikke færdiggøres. Dette er nu rettet."
    ]
},{
    version: "2.0.10",
    date: "27. juni 2025",
    changes: [
        "Når man tidligere oprettede et besøg på en eksisterende opgave, så blev kunden ikke korrekt vist i popup-vinduet. Dette er nu rettet.",
        "Rettede en fejl i push-notifikationen, som administratoren modtager når en kunde har fået tilsendt en faktura – linket virkede ikke tidligere. Det gør det nu.",
        "Flere fejlrettelser i 'Betal med faktura'-flowet. Nu er flowet både mere robust, og eventuelle fejlmeddelelser vises nu også direkte til brugeren, hvis noget går galt i fakturaoprettelsesprocessen.",
        "Smårettelser og justeringer."
    ]
},{
    version: "2.0.9",
    date: "26. juni 2025",
    changes: [
        "Fiksede en fejl i headerens visning på mobil.",
        "Når man kigger på det økonomiske overblik fra 'Overblik'-siden, så vil popup-vinduet nu automatisk scrolle til bunden når man åbner detaljer om posteringer for en valgt opgave.",
        "Oprydninger."
    ]
},{
    version: "2.0.8",
    date: "26. juni 2025",
    changes: [
        "Rettede en fejl på push-notifikationer, der gjorde, at de i nogle tilfælde kun blev sendt til en bruger hvis det var den samme bruger, der triggede notifikationen.",
        "Implementerede en fast, månedlig udlægsrapport, der sendes til administratoren. Udlægsrapporten indeholder en oversigt over alle udlæg, der er registreret i den forgangne lønperiode.",
        "Rettede en display-fejl, der opstod når Android-telefoner blev brugt til at åbne app'en.",
        "Posteringer knytter sig nu fremover direkte til kunder, ud over medarbejdere og opgaver. Førhen var posteringer blot knyttet til medarbejdere og opgaver.",
        "Smårettelser og justeringer.",
        "Rettede en fejl, der gjorde, at fakturaer i nogle tilfælde hang under oprettelsen ved betalingsflow."
    ]
},{
    version: "2.0.7",
    date: "24. juni 2025",
    changes: [
        "Push-notifikationer er nu implementeret. Brugere af app'en kan tilmelde sig push-notifikationer på deres 'Indstillinger'-side.",
        "Brugere af app'en vil bl.a. få push-notifikationer, når de har fået tildelt en ny opgave, når der er oprettet et nyt besøg på en eksisterende opgave på vegne af dem, eller når en opgave bliver afsluttet. Når der bliver uploadet et nyt dokument med begrænset brugeradgang vil brugere, der har adgang til dokumentet, også få en push-notifikation. Admin vil også få en notifikation når en ny faktura eller en fakturakladde bliver oprettet.",
        "Rettede en fejl, der gjorde, at 'Tilbage'-knappen i header'en på mobil-views nogle gange ikke virkede korrekt. Det gør den nu.",
        "Smårettelser og justeringer."
    ]
},{
    version: "2.0.6",
    date: "20. juni 2025",
    changes: [
        "Bruger-data er nu mere stabile i app'en.",
        "Endnu flere forberedelser til implementering af push-notifikationer.",
        "Reducerede mængden af cachede data, der bliver gemt i app'en – dette gør app'en hurtigere til at afspejle opdateringer hos brugerne.",
        "Smårettelser og justeringer."
    ]
},{
    version: "2.0.5",
    date: "19. juni 2025",
    changes: [
        "Rettede en fejl, der gjorde, at man i særlige tilfælde kunne oprette nye opgaver uden tilknyttede kunder.",
        "Tilføjede bedre beskrivelser af potentielle fejl, der kan opstå ved upload af udlægsbilleder."
    ]
},{
    version: "2.0.4",
    date: "18. juni 2025",
    changes: [
        "Forbereder implementering af push-notifikationer."
    ]
},{
    version: "2.0.3",
    date: "17. juni 2025",
    changes: [
        "Rettede en fejl, hvor knappen 'Beskriv opgaven ...' på 'Ny opgave'-flowet ikke blev vist korrekt når en kunde er valgt på forhånd før opgavebeskrivelsen er blevet udfyldt.",
        "Implementerede flere forskellige tiltag, der skal gøre det nemmere for brugere på mobilen at klikke/trykke sig ind på input-felter og knapper."
    ]
},{
    version: "2.0.2",
    date: "17. juni 2025",
    changes: [
        "Opjusterede antallet af medarbejdere, der i udgangspunktet vises i søgeresultaterne i medarbejdertabellen.",
        "Rettede en fejl, hvor knappen der leder til en ny kunde efter oprettelse af den pågældende kunde ikke virkede korrekt."
    ]
},{
    version: "2.0.1",
    date: "17. juni 2025",
    changes: [
        "Rettede flere fejl i kundetabellen på mobilen."
    ]
},{
    version: "2.0",
    date: "17. juni 2025",
    changes: [
        "Alle kunder er nu tilgængelige som selvstændige objekter i app'en, og præsenteres i et dynamisk kundekartotek. Dette kan tilgås via menupunktet 'Kunder'.",
        "I kartoteket præsenteres en kunde med navn, adresse og antallet af igangværende og afsluttede opgaver.",
        "En kunde kan nemt søges frem via søgefeltet i kundekartoteket. Søgefeltet gennemgår både kunders navn, adresser, postnumre, virksomhedsnavne, CVR-numre, mm. Derudover indeholder kartoteket knapper til filtrering af hhv. erhvervskunder og privatkunder.",
        "Hver eksisterende og ny kunde får en særskilt side. Denne kan man se ved at trykke på en kunde i kundekartoteket. Her kan man se flere detaljer om hver kunde – fx om kunden har en stige, vil kontaktes med reklamer, om kunden taler engelsk, osv. Man har også mulighed for at tilknytte noter til en kunde. Derudover præsenterer kundesiderne den pågældende kundes opgavehistorik. Ved opgavehistorikken kan man nu også direkte oprette en ny opgave på den pågældende kunde. Vil man redigere i en eksisterende kundes informationer kan dette også gøres via kundens side.",
        "'Opret opgave'-proceduren er blevet revideret. Nu er processen trinopdelt i hhv. 'Opgave', 'Kunde', 'Medarbejder' og 'Besøg'. For alle nye opgaver er det påkrævet at udfylde opgavebeskrivelsen samt informationer om kunden. Kunden kan både oprettes som en ny kunde, eller vælges blandt eksisterende kunder. Administratoren har også mulighed for at tilknytte medarbejdere til opgaven med det samme, men det er ikke et krav. Ligeledes kan et besøg også oprettes med det samme via 'Opret opgave'-formularen, men dette er heller ikke påkrævet.",
        "Den flydende action-knap i nederste højre hjørne har fået en ny knap: 'Opret kunde'. Her kan man oprette en kunde i databasen uden, i første omgang, at knytte kunden til en ny eller eksisterende opgave.",
        "Justeringer i design af kundesektionen på åbne opgaver – nu viser sektionen først virksomhedsinformationer hvis kunden er en erhvervskunde, og efterfølgende kontaktinformationer på kontaktpersonen i virksomheden. Tidligere var det altid blot kontaktpersonen, der var fremhævet.",
        "Smårettelser og justeringer."
    ]
},{
    version: "1.4.9",
    date: "16. juni 2025",
    changes: [
        "Nu kan administratorer genåbne afsluttede opgaver. Dette gøres ved at trykke på knappen 'Genåbn afsluttet opgave' på åbne opgaver."
    ]
},{
    version: "1.4.8",
    date: "11. juni 2025",
    changes: [
        "Hvis en kunde er registreret som erhvervskunde (CVR- og/eller virksomhedsfeltet udfyldt) vil fakturaen nu blive oprettet med virksomhedens navn på fakturaen i stedet for kontaktpersonens navn."
    ]
},{
    version: "1.4.7",
    date: "11. juni 2025",
    changes: [
        "Rettede en fejl, hvor en postering nogle gange kunne blive oprettet med forkerte satser for medarbejderens honorar.",
        "Nu starter alle nye medarbejdere som hovedregel på løntrin 10."
    ]
},{
    version: "1.4.6",
    date: "4. juni 2025",
    changes: [
        "Om igen: Rettede en fejl, hvor det i nogle tilfælde var den forkerte medarbejder, der blev tilknyttet et besøg."
    ]
},{
    version: "1.4.5",
    date: "4. juni 2025",
    changes: [
        "Rettede en fejl, hvor betalinger via Mobile Pay ikke kunne gennemføres hvis opgavebeskrivelsen var for lang."
    ]
},{
    version: "1.4.4",
    date: "4. juni 2025",
    changes: [
        "Hotfix: Nu vil nyoprettede besøg fra opgavesiderne vise de korrekte tider i kalenderen.",
        "Det samme gør sig gældende når man forsøger at redigere et besøg.",
        "Rettede en fejl, hvor det i nogle tilfælde var den forkerte medarbejder, der blev tilknyttet et besøg."
    ]
},
    {
    version: "1.4.3",
    date: "23. maj 2025",
    changes: [
        "Tidligere hen kunne man ikke få lov til at færdiggøre en opgave hvis der var registreret besøg med opstart ude i fremtiden. Nu får man blot en advarsel hvis det er tilfældet, men som medarbejder kan man godt omgå den."
    ]
},{
    version: "1.4.2",
    date: "23. maj 2025",
    changes: [
        "Den første postering oprettet på en opgave, hvor der på forhånd er givet et fast tilbud til kunden, vil nu i udgangspunktet være med en fast pris på tilbudsprisen.",
        "Rettede en fejl, hvor oprettelse af nye posteringer ikke altid registrerede brugeren for hvem posteringen blev oprettet, hvis en administrator oprettede posteringen på vegne af en anden.",
        "Oprettelse af nye posteringer på vegne af andre medarbejdere kunne i nogle tilfælde lede til en fejl, hvis den anden medarbejders honorarsatser afveg fra administratorens egne registrerede satser. Fejlen er nu rettet.",
        "Hvis man tidligere oprettede en postering på en opgave for umiddelbart efter at oprette en mere uden i mellemtiden at opdatere siden ville man støde på en fejl, hvor man som administrator ikke kunne vælge at oprette den nye postering på vegne af andre medarbejdere. Denne fejl er nu fikset.",
        "Smårettelser og justeringer."
    ]
},{
    version: "1.4.1",
    date: "21. maj 2025",
    changes: [
        "Små designjusteringer og forbedringer i loading- og succes-popup's når man sender faktura.",
        "Rettede en fejl, hvor CVR-nummeret ikke blev givet korrekt videre til regnskabssystemet når man oprettede erhvervskunder.",
        "Fjernede link til app'en fra automailen, som medarbejdere får når de er blevet tildelt en opgave.",
        "Når man opretter en fakturakladde til erhvervskunder fremgår det nu også korrekt i de efterfølgende popup's. Tidligere stod der, at fakturaen var blevet sendt til kunden, hvilket ikke var tilfældet."
    ]
},{
    version: "1.4",
    date: "20. maj 2025",
    changes: [
        "Alle økonomiske beregninger i app'en er blevet centraliseret. Dette sikrer større overensstemmelse mellem app'ens forskellige beregninger af indtægter og udgifter på opgaver og til medarbejdere.",
        "Nu vises alle tal i app'en i udgangspunktet med to decimaler.",
        "Op til nu blev alle priser på opgaver vist ekskl. moms. Dette er nu ændret, så prisen i udgangspunktet vil blive vist inkl. moms ved privatkunder, og ekskl. moms ved erhvervskunder. Vil man ændre i momsvisningen er der nu kommet to knapper til dette på åbne opgaver – ved hhv. posteringer-sektionen og sektionen med det økonomiske overblik.",
        "Er kunden registreret som erhvervskunde vil priserne i udgangspunktet vises uden moms. Man kan stadig slå inkl. moms-visningen til manuelt.",
        "Knappen 'Markér opgave som færdig' forhåndsviser nu den samlede pris som kunden skal betale for udførelsen af opgaven. Det samme gør knappen 'Opret regning.'",
        "'Indsend'-knappen ved kommentarfeltet har fået et nyt design.",
        "Når man er ved at oprette en faktura vil popup'en nu i udgangspunktet vise prisen ekskl. moms, hvis der er tale om en erhvervskunde, og prisen inkl. moms hvis der er tale om en privatkunde. Tidligere viste popup'en blot prisen inkl. moms i begyndelsen, og efterfølgende prisen ekskl. moms i en parentes uanset om der var tale om en erhvervs- eller privatkunde.",
        "Rettede en fejl, hvor betalingsflowet ikke afspejlede om en oprettet faktura ville blive sendt til manuel gennemgang (ved erhvervskunder) eller sendt direkte til kunden (ved privatkunder). Det fremgår nu af informationerne i app'en når man fremover opretter en faktura.",
        "Når man opretter en faktura til en privatkunde kan man nu vælge at fritage kunden for at betale administrationsgebyr på 49 kr. Dette var tidligere ikke muligt.",
        "Oversigtens opgavetabeller, der viser fakturabeløb, viser nu fakturabeløbet inkl. moms for privatkunder, og ekskl. moms for erhvervskunder, så dette tal altid matcher standardindstillingerne for momsvisning, når man åbner opgaven.",
        "Rettede en fejl, hvor medarbejderes personlige økonomiske overblik for året ikke akkumulerede i bunden af tabellen. Det gør det nu."
    ]
},{
    version: "1.3.8",
    date: "8. maj 2025",
    changes: [
        "Nogle kunder oplevede, at logoet ikke blev ordentligt vedhæftet på mailkvitteringer. Implementerede rettelser, der fremover øger sandsynligheden for korrekt visning af logoet på alle kunders mailklienter.",
        "Tilføjede mulighed for at bruge decimaltal når man indtaster fast honorar eller fast pris på en postering.",
        "Alle medarbejdere har nu mulighed for at vende posteringer, så man både kan se hvad kunden skal betale såvel som hvad posteringen har registreret af kommende honorarbetalinger for det pågældende arbejde.",
        "Posteringer på opgaver viser nu indtægter i udgangspunktet. For at se ens honorarbetaling skal man nu vende posteringen om."
    ]
},{
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