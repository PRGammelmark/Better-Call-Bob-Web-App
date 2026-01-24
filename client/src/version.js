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

const changes = [{
    version: "4.0.0",
    date: "25. januar 2026",
    changes: [
        "Posteringer er blevet opdaterede med faner og dynamiske timetyper, tillæg og materialekartotek. Al indhold på posteringer kan styres af administratoren fra systemindstillinger.",
        "Kredit-posteringer er blevet introduceret i beta-version.",
        "Medarbejderes løntrin og satser opdaterer nu på de dynamiske timetyper og tillægstyper i app'en.",
        "Implementerede en number-picker-funktion på flere steder i app'en, hvor simple tal skal indtastes.",
        "Nu kan man søge opgaver, kunder, medarbejdere osv. frem via søgefeltet i toppen af app'en.",
        "Besøgs-popup'en har fået et nyt, bedre og mere overskueligt design.",
        "Justerede mobil-headeren, så knapperne udnytter pladsen bedre.",
        "Notifikationsvinduet vil nu altid åbne med korrekt fane-visning.",
        "Når man åbner notifikationer på mobilen vil headeren nu ikke vise andet end en lukke-knap. Knappen vil lukke notifikationerne igen.",
        "Rettede en fejl, der gjorde, at man ikke altid kunne hente flere notifikationer i mobilvinduet.",
        "På åbne opgaver er 'Rediger kunde' nu blevet erstattet af en dropdown-menu, hvor man både kan redigere i kundeinformationerne samt gå til kunden direkte. Et tryk på kundens navn leder nu også til kundens side.",
        "Popup'en, hvori man fra opgavesiden kan redigere i kundeinformationerne, er nu blevet mere overskuelig.",
        "Switcher-knapper i app'en har fået et nyt og mere moderne udtryk.",
        "Optimerede navigationen i indstillinger-view'et på mobilen, så titlen og tilbageknappen på indstillinger-undersider nu står i headeren i stedet for i content-vinduet.",
        "'Timer & tillæg'-siden i indstillinger er blevet opdateret. Nu kan administratorer tilpasse timer, tillæg, rabat og låse-indstillinger for posteringerne i app'en – herunder også priser og standard-honorarsatser.",
        "Administratorer kan nu tilpasse moms-indstillinger for app'en under app-indstillinger.",
        "Administratorer kan nu oprette og redigere i et fast, internt varesortiment, som medarbejdere nemt kan fremsøge og vælge elementer fra i 'Materialer'-tabben fra posteringer.",
        "Log ud-knappen på desktop er blevet flyttet fra headeren og til sidebaren.",
        "Der er blevet oprettet en ny side: 'Økonomi'. Det økonomiske overblik, der tidligere lå på 'Overblik'-siden, er blevet flyttet til denne side."
    ]
},{
    version: "3.11.3",
    date: "21. december 2025",
    changes: [
        "Implementerede en ny offentlig serverfunktion, der returnerer de næste syv ledige tider fra medarbejdergruppen.",
    ]
},{
    version: "3.11.2",
    date: "19. december 2025",
    changes: [
        "Tilføjede rettelser i bookingsystemet, der reducerer risikoen for, at browsere automatisk vil forsøge at oversætte UI-teksterne.",
        "Nu vil bookingsystemet automatisk indlæses med den indbyggede engelsksprogede oversættelse for engelsksprogede brugere."
    ]
},{
    version: "3.11.1",
    date: "19. december 2025",
    changes: [
        "Rettede en fejl i bookingsystemet, så tryk på opfølgende spørgsmål fremover automatisk vil placere cursoren i tekstinputfeltet til opgavebeskrivelsen.",
        "Justerede server-endpoint, der leverer information om næste ledige tid til booking, så det nu også giver en engelsk version af dato og tidspunkt.",
    ]
},{
    version: "3.11.0",
    date: "16. december 2025",
    changes: [
        "App-indstillinger-siden er blevet opdateret med nyt design, struktur og indstillingsmuligheder.",
        "Serveren har nu fået et offentligt endpoint, der gør det muligt for hjemmesiden at hente de næste to sammenhængende ledige timer fra medarbejdergruppen."
    ]
},{
    version: "3.10.5",
    date: "11. december 2025",
    changes: [
        "Ved booking-succes leder bookingsystemet nu tilbage til hjemmesidens 'Tak for din booking'-side for nemmere Google Ads-tracking. Fremover vil kunder kunne inputte redirect-URL'en til bookingsystemer under App-indstillinger -> Booking -> Omdirigering ved succes.",
        "Nu lagrer bookingsystemet også informationer om evt. Google Ads-kampagner, der har ledt kunden til bookingsystemet."
    ]
},{
    version: "3.10.4",
    date: "11. december 2025",
    changes: [
        "Opdaterede bookingsystemets sprog-knap, så det nu fremstår med et globus-ikon i stedet for et flag.",
        "Nu kan man indstille bookingsystemets browser-ikon fra app'en.",
        "Bookingsystemets boks til opfølgende spørgsmål fylder nu ikke så meget i højden på mobil-skærme, hvilket gør det nemmere at læse både spørgsmålet og input-feltet når tastaturet er åbent.",
        "Justerede ikonernes stregtykkelse på bookingsystemets upload-knap.",
        "Bookingsystemet vil nu sende en automatisk mail til kunden med en bekræftelse efter succesfuld booking.",
        "Rettede en fejl i app'en, der gjorde, at kalendervisningen på administratorens overbliksside ikke blev opdateret med besøgsevents fra alle medarbejdere, hvis administratoren selv tidligere havde ændret sine egne ledige tidspunkter fra ledighedskalenderen på profilsidens arbejdspræferencer-tab."
    ]
},{
    version: "3.10.3",
    date: "10. december 2025",
    changes: [
        "Rettede en fejl i bookingsystemet, der gjorde, at billeder og videoer blev 'tabt' ved navigation tilbage til step 1 fra et senere led i bookingprocessen.",
        "Rettede en fejl, hvor åbning af uploadede billeder i popup i bookingsystemet ikke virkede efter hensigten.",
        "Mobilversionen af bookingsystemet har nu fået maskot-billede på step 1. Derudover har AI obs-teksten fået en blur-baggrund hen over footeren.",
        "Upload-knappen i bookingsystemets step 1 har fået grønt fokus. Fjernede teksten, der specificerede hvad brugeren kunne uploade, og tilføjede i stedet animerede ikoner, der viser hvad upload-knappen kan bruges til.",
        "Designjusteringer på steps-indikatorer i bookingsystemets header."
    ]
},{
    version: "3.10.2",
    date: "10. december 2025",
    changes: [
        "Bookingsystemet har nu fået endnu mere responsivitet til forskellige skærmstørrelser.",
        "Nu er der mulighed for at tilføje et maskot-billede i bunden af bookingsystemets summary-sektion.",
        "OBS-felt med priser er blevet tilføjet til bookingsystemet.",
        "Smårettelser og justeringer."
    ]
},{
    version: "3.10.1",
    date: "9. december 2025",
    changes: [
        "Nu præsenteres bookingsystemet med et logo i øverste venstre hjørne. Man kan indstille logoet fra app'en.",
        "Nu kan man tilpasse bookingsystemets tidsestimater fra app'en."
    ]
},{
    version: "3.10.0",
    date: "8. december 2025",
    changes: [
        "Bookingsystemet stiller nu automatisk opfølgende spørgsmål til opgavebeskrivelsen ved hjælp af AI.",
        "Step 2 – 'Ekstra' – er blevet fjernet fra bookingsystemet, og funktionaliteten er integreret i step 1 i stedet.",
        "'Opfølgende spørgsmål'-knappen i admins app-indstillinger har fået en ny funktion. I stedet for at åbne modalen, hvor man kunne skræddersy spørgsmål til hver opgavetype, får man nu en popup, hvor man kan tilpasse regler og retningslinjer til den AI, der står for at stille opfølgende spørgsmål.",
        "Designjusteringer og -forbedringer."
    ]
},{
    version: "3.9.9",
    date: "5. december 2025",
    changes: [
        "Fremover vil bookingsystemet nu automatisk foreslå adresser for brugeren i en dropdown-liste efterhånden som man taster i adressefeltet.",
        "Forbedrede adresse-håndteringen i bookingsystemet, så det nu kan håndtere etagenumre, osv.",
        "Timeslots i bookingsystemets step 3 vises nu i én kolonne på mobilen i stedet for to."
    ]
},{
    version: "3.9.8",
    date: "5. december 2025",
    changes: [
        "Hvis man opretter et besøg på en opgave vil opgaven nu automatisk opdatere sin status til 'Dato aftalt'.",
    ]
},{
    version: "3.9.7",
    date: "5. december 2025",
    changes: [
        "Bekræftelses-siden efter succesfuld booking kan nu scrolles, så man rent faktisk kan læse alle detaljerne.",
        "Nu kan nye kunder vedhæfte PDF-filer til deres opgaver – det kunne fx være samlevejledninger til møbler, fakturaer, arbejdsplaner eller andet.",
        "Nu kan man også åbne vedhæftede billeder, videofiler og PDF-filer i et popup-vindue i bookingsystemet. Det kunne man ikke før.",
        "Rettede en fejl, der gjorde, at video-uploads i bookingsystemet kunne hænge. Det er komprimeringen af visse videoformater, der ikke altid lykkes. Nu får komprimeringsprocessen en frist på 10 sekunder, hvorefter den automatisk afbrydes og den ikkekomprimerede videofil vil blive vedhæftet i stedet.",
        "Smårettelser og justeringer."
    ]
},{
    version: "3.9.6",
    date: "4. december 2025",
    changes: [
        "Forbedrede bookingsystemets responsivitet ved forskellige skærmstørrelser.",
        "Nu afsætter bookingsystemet maks 8 timer til et besøg, hvis opgaven er af større omfang.",
        "Notifikationer om nye opgaver burde ikke længere erklære adressen som 'undefined'.",
        "Uploads af dokumenter uden begrænset adgang udløser nu en notifikation for alle brugere i app'en."
    ]
},{
    version: "3.9.5",
    date: "4. december 2025",
    changes: [
        "Fanerne på profilsiden er blevet opdateret med en subtil fade-effekt og overflow, så det er blevet mere intuitivt at navigere mellem dem.",
        "Bookingsystemet viser nu et forbehold for valgte tidspunkter, når en kunde vælger et timeslot, direkte i timeslottet.",
        "Bookingsystemet markerer nu foretrukne timeslots, så kunder nudges til at vælge dem, der også passer os bedst.",
        "Bookingsystemet oversætter nu korrekt opsummerede opgavebeskrivelser, afhængigt af kundens sprogpræferencer."
    ]
},{
    version: "3.9.4",
    date: "26. november 2025",
    changes: [
        "Booking-system er live i test-version.",
        "En succesfuld booking vil nu lede kunden hen på en succes-side, hvor man kan se detaljerne om sin booking.",
        "Opgaver og besøg, der er automatisk oprettet og tildelt via bookingsystemet, vil nu have en AI-markering, så de tydeligt kan skelnes og følges op på. Disse opgaver er både markeret på administratorens overbliksside, Alle opgaver-siden samt når man er inde på opgaven. AI-oprettede besøg vil være markeret med en særskilt, karakteristisk blå-lys farve i administrator- og opgavekalenderen.",
        "'Planlagte opgaver'-kortet på administratorens overbliksside viser nu også antallet af AI-oprettede opgaver i systemet. Trykker man på denne vil den åbne 'Alle opgaver'-siden op på 'Planlagte'-tabben med AI-filteret markeret.",
        "I 'Alle opgaver'-overblikket kan man nu filtrere planlagte opgaver efter om de er AI-oprettet eller ej.",
        "Det er muligt at fjerne AI-markeringen af opgaver, der er oprettet gennem bookingsystemet. Når man som admin er inde på en sådan opgave skal man blot trykke på menu-knappen i toppen, hvorefter man kan trykke 'Fjern AI-markering'.",
        "Kommentarer til slettede opgaver blev ikke slettet ordentligt førhen, og blev derfor hængende som 'forælderløs' data. Nu bliver kommentarer slettet korrekt.",
        "Smårettelser og justeringer."
    ]
},{
    version: "3.9.3",
    date: "26. november 2025",
    changes: [
        "Brugere kan nu tilføje ledighed direkte i en ny ledighedskalender, der ligger under Profil -> Arbejdspræferencer -> Ledighed. Knappen åbner et popup-vindue, hvor man frit kan 'tegne' sine ledige tidspunkter ind i kalenderen. Administratorer kan tilgå øvrige medarbejderes ledighedskalender, og oprette, redigere i og slette ledige tider på vegne af medarbejderen.",
        "Smårettelser og justeringer."
    ]
},{
    version: "3.9.2",
    date: "26. november 2025",
    changes: [
        "Rettede en fejl, der gjorde, at det personlige overblik over ens egne opgaver for en given dag ikke altid medtog alle besøg.",
    ]
},{
    version: "3.9.1",
    date: "26. november 2025",
    changes: [
        "Rettede en fejl, der gjorde, at administratorer ikke kunne redigere i medarbejderes arbejdspræferencer og arbejdsområder.",
        "Rettede en anden fejl, der gjorde, at en medarbejders markerede opgavetyper ikke altid blev registreret korrekt.",
        "'Opret ledighed'-popup'en har fået et simplere og mere intuitivt design."
    ]
},{
    version: "3.9.0",
    date: "26. november 2025",
    changes: [
        "Bookingsystemet er blevet opdateret med internationalisering. Kunder kan nu vælge mellem dansk og engelsk sprog under bookingprocessen. Alle tekster i bookingsystemet er nu oversat til begge sprog, og AI'en tilpasser output til kundens sprogpræferencer.",
        "Profil-siden er blevet opdateret med et nyt og mere overskueligt design. Bl.a. er der implementeret faner til forskellige emner. Ikke alle faner har indhold endnu.",
        "Medarbejdere kan nu uploade og beskære profilbilleder via en ny profilbillede-modal. Billederne komprimeres automatisk og vises på medarbejderens profilside samt på Team-siden.",
        "Team-siden har fået et nyt og mere overskueligt design.",
        // "Administratorer kan nu indstille prioritet for medarbejdere (1-5) via en ny prioritet-modal. Prioritet lægges bl.a. ind i algoritmen, der bestemmer hvilke medarbejdere der automatisk får tildelt nye opgaver via bookingsystemet.",
        "Når administratorer opretter nye opgavetyper har man nu mulighed for at oprette en engelsk oversættelse af opgavetypens viste navn. Det samme gør sig gældende når administratorer opretter og redigerer opfølgende spørgsmål.",
        "Animationen ved navigation i app'en er gjort enklere og hurtigere.",
        "Diverse designjusteringer og funktionelle forbedringer til bookingsystemet."
    ]
},{
    version: "3.8.13",
    date: "25. november 2025",
    changes: [
        "Nu kan andre medarbejderes sider tilgås via Team-siden. Administratorer har desuden mulighed for at redigere i arbejdspræferencer og kontaktinformationer for medarbejdere."
    ]
},{
    version: "3.8.12",
    date: "24. november 2025",
    changes: [
        "Flere indstillingsmuligheder er blevet tilføjet til App-indstillinger-siden.",
        "Diverse designforbedringer og funktionelle justeringer til bookingsystemet."
    ]
},{
    version: "3.8.11",
    date: "23. november 2025",
    changes: [
        "Nu har administratorer mulighed for at importere standard-opgavetyper fra App-indstillinger-siden.",
        "Tilføjede ca. 150 opgavetyper fordelt på seks håndværker-kategorier."
    ]
},{
    version: "3.8.10",
    date: "22. november 2025",
    changes: [
        "App'en initialiserer nu automatisk standard-opgavetyper ved første opstart, hvis der ikke findes nogen opgavetyper i databasen.",
        "Administratorer kan nu søge i opfølgende spørgsmål efter spørgsmålstekst, feltnavn og opgavetyper.",
        "Vinduet til visning af opfølgende spørgsmål indeholder nu flere visningsmuligheder for bedre overblik.",
        "Designjusteringer og -forbedringer."
    ]
},{
    version: "3.8.9",
    date: "22. november 2025",
    changes: [
        "Åbnede op for administratorers mulighed for at redigere i og slette posteringer, der tilhører afsluttede lønperioder. Medarbejdere, hvis posteringer bliver redigeret, bliver underrettet via en notifikation om ændringerne.",
    ]
},{
    version: "3.8.8",
    date: "14. november 2025",
    changes: [
        "Administratorer kan nu fra 'App-indstillinger'-siden oprette og redigere i opfølgende spørgsmål, som bookingsystemet kan stille til nye kunder baseret på en AI-kategorisering af opgaven, som den pågældende kunde er ved at udfylde.",
        "Flere design- og funktionsjusteringer til bookingsystemet."
    ]
},{
    version: "3.8.7",
    date: "12. november 2025",
    changes: [
        "Implementerede første version af automatiseret bookingsystem på 'https://book.bettercallbob.dk'.",
        "Rettede en fejl, der gjorde, at system-notifikationer udløst uden menneskelig indblanding ikke blev sendt afsted.",
        "Smårettelser og justeringer."
    ]
},{
    version: "3.8.6",
    date: "12. november 2025",
    changes: [
        "Når en faktura-rykker sendes ud til en kunde vil kunden nu også modtage en påmindelse via SMS.",
    ]
},{
    version: "3.8.5",
    date: "11. november 2025",
    changes: [
        "Rettede en fejl, der gjorde, at man ikke manuelt kunne registrere fakturaopkrævninger på posteringer.",
        "Når man vil registrere en fakturaopkrævning manuelt, så vil app'en nu automatisk hente fakturaens oplysninger (fx opkrævningsbeløb og betalingsfrist) fra regnskabssystemet ud fra fakturanummeret. Hvis regnskabssystemet ikke finder en faktura med det angivne fakturanummer vil modtageren få en fejlmeddelelse.",
        "Mindre rettelser og justeringer."
    ]
},{
    version: "3.8.4",
    date: "10. november 2025",
    changes: [
        "Postering-menuen vil nu altid åbne op i sin grundmenu, i stedet for i en undermenu hvis den før i samme sessionhar været åbnet og navigeret i.",
    ]
},{
    version: "3.8.3",
    date: "10. november 2025",
    changes: [
        "Implementerede et automatisk fakturabetalingstjek på alle posteringer, der har opkrævninger via faktura. Tjekket kører kl. 03:00 hver nat, og vil underrette administratorer om nye betalinger via en notifikation.",
    ]
},{
    version: "3.8.2",
    date: "10. november 2025",
    changes: [
        "Rettede fejl i opgavefiltreringen under 'Planlagte opgaver', der gjorde, at den ikke optalte antallet korrekt.",
        "Nu kan man filtrere nye og åbne opgaver efter deres specifikke advarselsmærkater. Det kunne man ikke før.",
        "Fjernede 'sidste besøg'-filter fra 'Planlagte opgaver', og tilføjede i stedet 'Besøg (først - sidst)' og 'Besøg (sidst - først)'. Tilføjede desuden også et filter for 'Mangler opfølgning'.",
        "Tryk på advarselsmærkaterne på forsidens overblikskort leder nu til de rigtige filtre på 'Alle opgaver'-siden.",
        "Manuel registrering af opkrævninger understøttede ikke beløbsregistrering, hvilket førte til forkerte kategoriseringer af de pårørte opgaver. Dette er nu rettet.",
        "Smårettelser og -justeringer."
    ]
},{
    version: "3.8.1",
    date: "9. november 2025",
    changes: [
        "Administratorers indikator for nye opgaver på overblikssiden er nu blevet mere synlig og opmærksomhedskrævende.",
        "Påmindelser kan nu sættes med flere muligheder for tidsindstillinger.",
        "Fremover vil man kunne vælge om en påmindelse skal være knyttet til en opgave eller til en kunde.",
        "Påmindelser kan nu også af admins sættes til andre medarbejdere end en selv.",
        "Designjusteringer og -forbedringer.",
    ]
},{
    version: "3.8.0",
    date: "9. november 2025",
    changes: [
        "Administratorers overbliksside er blevet opdateret. Øverst på overblikssiden får man et overblik over alle ikke-afsluttede opgaver, opdelt i kategorier efter hvor langt de er i deres respektive pipelines. Kategorierne viser også advarsler, hvis der er opgaver i de pågældende kategorier der kræver akut opmærksomhed. Derudover kan administratorer nu også hurtigt se hvordan hver enkelt kategoris indhold har ændret sig over de sidste 24 timer.",
        "Umiddelbart under kategori-overblikket får administratoren nu også et overblik over de opgaver hvortil er der tilknyttet besøg i dag. Opgaverne listes kronologisk efter hvornår besøgene ligger, og på hver opgave ligger der både kundeinformationer, kontaktinfo, navigationsvejledning samt opgavebeskrivelsen og den nyeste kommentar.",
        "Medarbejdernes overbliksside er ligeledes blevet opdateret. Nu får medarbejderen et overblik over opgaver, hvor de har besøg på den indeværende dag. Opgaverne listes kronologisk efter hvornår besøgene ligger, og på hver opgave ligger der både kundeinformationer, kontaktinfo, navigationsvejledning samt opgavebeskrivelsen og den nyeste kommentar.",
        "'Alle opgaver'-siden er blevet opdateret. Den gamle tabelvisning er erstattet med en ny filtrerbar og sorterbar listevisning, der både tilføjer mere funktionalitet og et bedre, interaktivt overblik.",
        "Popup-vinduer animeres nu hurtigere ind og ud. Derudover vil app'en nu ikke længere reagere uhensigtsmæssigt på klik uden for popup-vinduet, hvis dette klik sker på et interaktivt område i baggrunden.",
        "Man kan nu sætte reminders på opgaver fra hhv. listeoverblikssidens 'Nye'- og 'Åbne'-faner, samt direkte fra opgavesiden øverst på '...'-knappen. En reminder vil sende dig en notifikation på et selvvalgt tidspunkt, hvis du fx gerne vil mindes om at følge op på en opgave.",
        "Notifikationer er nu blevet opdelt i to faner: 'Vigtige' og 'Alle'. Vigtige notifikationer vises som udgangspunkt først, og disse inkluderer bl.a. nye kommentarer, ændringer i opgavebeskrivelser, osv.",
        "Man kan nu registre fakturerbar adresse på kunder. Hvis en fakturerbar adresse er registreret vil denne nu fremover blive brugt i stedet for den almindelige adresse når man fakturerer kunden.",
        "Opkrævninger registreres nu også med beløb. Det gjorde de ikke før.",
        "Designjusteringer og -forbedringer."
    ]
},{
    version: "3.7.1",
    date: "7. november 2025",
    changes: [
        "CVR-felter understøtter nu område-præfikser, fx DK12345678 eller SE123456789012.",
    ]
},{
    version: "3.7.0",
    date: "2. november 2025",
    changes: [
        "Administratorer kan nu sætte påmindelser på opgaver. En påmindelse dukker op blandt notifikationer, men bliver fremhævet for ekstra synlighed.",
        "Notifikationer kan nu markeres som vigtige. Vigtige notifikationer har fået deres egen tab i notifikationsvinduet, ved siden af 'Alle', som lister alle notifikationer.",
        "Når man opretter en faktura eller en fakturakladde vil alle fakturaens linjer nu altid være markeret med datoer i dansk format.",
        "Nogle gange kunne der førhen opstå udfordringer med at trykke på inputfelterne på Login-siden. Dette er nu rettet.",
        "Rettede en fejl, hvor nogle brugere oplevede, at det ikke var muligt at oprette posteringer.",
        "Det er nu muligt at arkivere opgaver. Arkiverede opgaver vil blive lagt til side, men dataene om dem og den dertilknyttede kunde vil blive gemt til fremtidig reference, brug eller opfølgning."
    ]
},{
    version: "3.6.2",
    date: "29. oktober 2025",
    changes: [
        "Rettede en fejl, der gjorde, at der på mobiler var en lille del af skærmens nederste område, som app'en ikke udfyldte.",
        
    ]
},{
    version: "3.6.1",
    date: "29. oktober 2025",
    changes: [
        "Bottombarens tredje knap leder nu til 'Kunder' for administratorer, og 'Profil' for almindelige medarbejdere."
    ]
},{
    version: "3.6.0",
    date: "28. oktober 2025",
    changes: [
        "App'en har fået en bottombar, der gør det lettere og hurtigere at navigere. Den flydende action-knap er blevet fjernet, og erstattet med en mere funktionel plus-knap, der ligger i bunden af actionbaren.",
        "Plus-knappen giver både mulighed for at oprette nye opgaver, kunder, dokumenter og medarbejdere. Almindelige brugere kan også oprette ledige tider gennem knappen, og er man på en opgave vil man også kunne oprette både besøg og posteringer gennem knappen.",
        "Menu-knappen er på mobil blevet flyttet fra headeren og til bunden.",
        "På desktop har sidebaren fået nyt design, og den skrumper også når man er færdig med at navigere.",
        "Når en delvist betalt postering opkræves for resten via faktura, så vil fakturaen nu også modtage data om hvad der allerede er betalt på posteringen.",
        "Flere tabeller er blevet opdateret, så de i udgangspunktet nu viser indhold sorteret efter dato.",
        "Diverse designjusteringer og -forbedringer."
    ]
},{
    version: "3.5.14",
    date: "27. oktober 2025",
    changes: [
        "Rettede en fejl, der ved datoskift genstartede til- og fra-tidspunkterne for et besøg under oprettelse når man ville oprette et nyt besøg via manager-kalenderen.",
    ]
},{
    version: "3.5.13",
    date: "26. oktober 2025",
    changes: [
        "Rettede flere fejl relateret til vintertid i kalenderen samt visninger af besøg og ledige tider."
    ]
},{
    version: "3.5.12",
    date: "14. oktober 2025",
    changes: [
        "Rettede en fejl, der gjorde, at telefoner med andre sprogindstillinger nogle gange ikke kunne registrere timer på mobilen når man oprettede eller redigerede en postering.",
        "En anden fejl gjorde tidligere, at man ikke kunne opkræve samlet for en opgave igen via hverken mobile pay eller faktura når først en enkelt mobile pay-opkrævning var sendt ud. Dette skabte problemer, hvis den pågældende mobile pay-betaling fejlede eller ikke blev betalt – så kunne man ikke opkræve igen. Det kan man nu.",
        "Smårettelser og justeringer."
    ]
},{
    version: "3.5.11",
    date: "10. oktober 2025",
    changes: [
        "Diverse forbedringer af stabiliteten på kortet til arbejdsområdeindstillinger.",
        "Tidligere hen opdaterede opgaver ikke altid ordentligt før et page refresh når man foretog betalinger via Mobile Pay. Det gør de nu.",
    ]
},{
    version: "3.5.10",
    date: "10. oktober 2025",
    changes: [
        "Forbedringer af app'ens fejlhåndtering.",
        "Forbedrede app'ens integrationen til hjemmesidernes webformularer for at mindske risikoen for fejl."
    ]
},{
    version: "3.5.9",
    date: "9. oktober 2025",
    changes: [
        "Små justeringer og bugfixes."
    ]
},{
    version: "3.5.8",
    date: "9. oktober 2025",
    changes: [
        "Designjusteringer og -forbedringer på 'Profil'-, 'App-indstillinger' og 'Hjælp'-siderne."
    ]
},{
    version: "3.5.7",
    date: "8. oktober 2025",
    changes: [
        "Når en administrator opretter et nyt besøg på en ny opgave, så vil tidspunkterne nu ikke længere nulstille hvis man efterfølgende justerer datoen.",
        "Smårettelser og justeringer."
    ]
},{
    version: "3.5.6",
    date: "8. oktober 2025",
    changes: [
        "App'ens kalendere viser nu korrekte tider for events både i sommer- og vintertid.",
        "Flyttede det økonomiske overblik for medarbejdere til bunden af 'Overblik'-siden, så det første man ser er hvilke opgaver man skal ud på."
    ]
},{
    version: "3.5.5",
    date: "7. oktober 2025",
    changes: [
        "Tabellen over åbne opgaver viser nu en anden farve på statusikonet, hvis en dato er aftalt med kunden.",
        "Smårettelser og justeringer af arbejdsområdekortet."
    ]
},{
    version: "3.5.4",
    date: "6. oktober 2025",
    changes: [
        "Rettede en fejl, der gjorde, at app'en i nogle tilfælde ikke kunne oprette en opgave, hvor en ansvarlig medarbejder blev tilknyttet i samme oprettelsesflow."
    ]
},{
    version: "3.5.3",
    date: "6. oktober 2025",
    changes: [
        "Nu viser overblikstabellen for 'Åbne opgaver' den korrekte status for opgaver, hvor datoen er blevet aftalt."
    ]
},{
    version: "3.5.2",
    date: "6. oktober 2025",
    changes: [
        "Rettede flere fejl, der gjorde, at serveren crashede ved nogle handlinger med besøgsdata."
    ]
},{
    version: "3.5.1",
    date: "5. oktober 2025",
    changes: [
        "Rettede en fejl, der gjorde, at notifikationer ikke blev vist korrekt på mobilen.",
        "Nu viser app'ens header en mere korrekt højde på mobilen, afhængigt af den pågældende enheds skærmstørrelse."
    ]
},{
    version: "3.5.0",
    date: "5. oktober 2025",
    changes: [
        "Interne live-notifikationer er blevet implementeret i app'en, og kan tilgås via 'Notifikationer'-knappen i headeren.",
        "Notifikationer oprettes automatisk for bestemte brugere ved bestemte hændelser – fx hvis man får en opgave, hvis opgavebeskrivelsen bliver ændret undervejs i et opgaveforløb, eller hvis der kommer kommentarer på en opgave.",
        "Ikke-sete notifikationer indikeres med et notifikation-badge over notifikation-knappen. Notifikationer, man ikke har handlet på, markeres med en grøn prik i notifikationsmenuen, eller med en farvemarkering på mobilen.",
        "Et par simple handlingsmuligheder er også blevet implementeret i notifikationsmenuen.",
        "Designjusteringer og -forbedringer."
    ]
},{
    version: "3.4.6",
    date: "23. september 2025",
    changes: [
        "Systemserveren er nu sat op til at kunne modtage nye åbne opgaver og oprette dertilhørende kunder direkte fra Better Call Bob's webformularer.",
        "Designjusteringer på infopillerne under opgavebeskrivelsen – nu kan pillerne bl.a. rulle hele vejen over mobilskærmen uden at blive 'klippet over' af margener.",
        "Alle opgaver indeholder nu en ekstra infopille, der viser dato og klokkeslet for opgavens oprettelse.",
        "Hvis en opgave er blevet automatisk oprettet i systemet via en web-formular, så vil en ny infopille vise denne information.",
        "En dynamisk hilsen er blevet implementeret i toppen af 'Overblik'siden.",
        "Sidebar'en har fået overskriften 'Navigation'. Derudover viser sidebaren nu også den aktuelle dato og klokkeslet i bunden.",
        "Hvis en tilknyttet erhvervskunde ikke er blevet registreret med et CVR-nummer vil dette nu fremgå korrekt af opgave-siden.",
        "Hvis en kunde mangler enten email eller telefonnummer vil disse nu ikke længere blive vist i tomme felter på opgave-siden.",
        "Nu er der kommet dedikerede knapper til at redigere i både opgave- og kundeindstillinger og -informationer på opgavesiderne.",
        "Når man opretter eller redigerer posteringer på mobilen vil udlægslinjer nu ikke længere stå skævt.",
        "'Find vej'-knappen er blevet rykket ned til kunde-sektionen på opgaver. 'Opgavestatus'-knappen er blevet rykket op under opgavebilleder, umiddelbart under opgavebeskrivelsen.",
        "'Åbne opgaver'-tabellen under 'Overblik' og 'Alle opgaver' viser nu mere relevante og fyldestgørende informationer."
    ]
},{
    version: "3.4.5",
    date: "21. september 2025",
    changes: [
        "Rettede en fejl, hvor mellemregningerne i det økonomiske overblik for medarbejdere ikke blev vist korrekt."
    ]
},{
    version: "3.4.4",
    date: "19. september 2025",
    changes: [
        "Nu vil administratorers ændringer i app'ens globale indstillinger automatisk blive pushet ud til alle brugeres enheder med det samme. Førhen krævede en ændring en genindlæsning af hver enheds app før ændringerne blev afspejlet.",
        "Administratorer kan nu styre den maksimale arbejdsradius, som medarbejdere kan indstille under deres profil, fra 'Indstillinger'-siden.",
        "Flere funktionelle og designmæssige rettelser til 'Indstillinger'-siden og 'Profil'-siden."
    ]
},{
    version: "3.4.3",
    date: "17. september 2025",
    changes: [
        "Rettede en fejl, hvor 'Opret opgave'-siden automatisk ville scrolle et stykke ned på siden ved load."
    ]
},{
    version: "3.4.2",
    date: "17. september 2025",
    changes: [
        "Rettede højden på arbejdsområde-kortet, så den ikke optager al skærmens højde på mobilen.",
        "Nu viser arbejdsområdekortet den sidst valgte adresse når du åbner kortet.",
        "Arbejdsområdekortet blev ikke vist på mobilen med en prik i centrum. Det gør den nu.",
        "Rettede en fejl, der gjorde, at man med to fingre kunne zoome ind og ud på kortet på mobilen uden at radius ændrede sig proportionelt. Nu skal man altid tilpasse arbejdsradius via slideren under kortet.",
        "Førhen viste kortet arbejdsradiuscirklen i forkert opløsning når man åbnede det første gang på mobilen. Nu vises det korrekt.",
        "Rettede en fejl på modal-popup's, som hakkede når man åbnede dem efter sidste opdatering.",
        "Lavede flere designforbedringer i opgavetyper-popup'en fra app-indstillinger-siden."
    ]
},{
    version: "3.4.1",
    date: "16. september 2025",
    changes: [
        "Små rettelser til mobil-menuen."
    ]
},{
    version: "3.4.0",
    date: "16. september 2025",
    changes: [
        "Nu kan administratorer downloade mapper med medarbejdernes udlægskvitteringer direkte fra overblikssiden.",
        "En ny side, 'App-indstillinger', er blevet oprettet i systemet. Administratorer har adgang til siden, hvor de fremover kan indstille overordnede rammer for brug af app'en.",
        "Implementerede visuel feedback på bl.a. luk-knappen på modaler, samt flere submit-knapper i app'en.",
        "Sidebaren har nu fået passende ikoner på desktop-versionen af app'en.",
        "Siden 'Profil' er blevet udbygget med arbejdspræferencer. Nu kan medarbejdere definere det område, hvor de gerne vil arbejde i, på et kort. Derudover kan medarbejdere nu også vælge de opgavetyper, som de har kompetencerne til at udføre.",
        "'Profil' har også fået indført en lille statistik-sektion, hvor man bl.a. kan se hvor meget man har tjent over en given periode, hvor mange opgaver man har udført samt hvilken rating man i gennemsnit har fået fra de kunder, man har haft ansvaret for. Rating-systemet bliver fuldt implementeret og finpudset i en senere opdatering.",
        "App'en har som standard et sæt opgavetyper og kategorier, der benyttes. Administratorer har mulighed for at tilføje flere efter behov via siden 'App-indstillinger'.",
        "Ændringsloggen var begyndt at indeholde mange sider, hvilket gav en udfordring med at repræsentere antallet af sider i navigationslinjen i bunden. Dette er nu blevet rettet til, så man i navigationen nu ser den første side, den sidste side samt den aktuelle side + 2 sider i hver retning, og ellers blot '...', der repræsenterer skulte sider i navigationen."
    ]
},{
    version: "3.3.1",
    date: "6. semptember 2025",
    changes: [
        "Rettede en fejl, hvor mobilenheder ikke viste indhold med den korrekte højde."
    ]
},{
    version: "3.3.0",
    date: "6. semptember 2025",
    changes: [
        "Siden 'Indstillinger' har fået ændret sit navn til 'Konto', og forarbejdet til et nyt design til siden er lagt.",
        "Nu har siderne i app'en fået exit- og entry-animationer, hvilket giver en mere flydende oplevelse når man navigerer. Destinationssiden begynder desuden nu at loade i baggrunden, under exit-animationen, med det samme man trykker på knappen der navigerer derhen, så app'en fremover vil flakke mindre.",
        "Login-skærmen har fået udvidede muligheder for at gemme login-informationer til autoudfyldning fremover."
    ]
},{
    version: "3.2.1",
    date: "4. september 2025",
    changes: [
        "Fjernede 'Åbn'-knappen fra uddelegerede opgaver i tabelvisningen. Nu kan man bare klikke/trykke på tabelrækken for at gå til opgaven.",
        "Nu vises postnummeret og byen under adressen i samme tabel.",
        "I tabellen kan man nu også se om der er booket besøg ind på opgaven uden at gå ind på den først.",
        "Smårettelser og designjusteringer.",
    ]
},{
    version: "3.2.0",
    date: "2. september 2025",
    changes: [
        "Nu er der oprettet en 'Hjælp'-sektion i app'en, hvor du kan finde svar på nogle af de mest almindelige spørgsmål.",
        "Der vil løbende blive lavet video-guides til app'en, som du også kan finde i 'Hjælp'-sektionen.",
        "Designjusteringer og -forbedringer."
    ]
},{
    version: "3.1.7",
    date: "2. september 2025",
    changes: [
        "UI- & UX-forbedringer når man registrerer timer på en ny eller eksisterende postering.",
        "Rettede en fejl, hvor besøgsdetaljer ikke fremgik korrekt øverst når man oprettede et nyt besøg fra kalenderen på opgavesiden.",
    ]
},{
    version: "3.1.6",
    date: "1. september 2025",
    changes: [
        "Rettede en fejl, der kunne opstå når medarbejderes lønsatser indstilles."
    ]
},{
    version: "3.1.5",
    date: "28. august 2025",
    changes: [
        "Nu kan administratorer indstille enkelte kunders prissatser på den pågældende kundes side. Man kan både bestemme gebyrsatser, timesatser såvel som tillægsprocenter for aften- og natarbejde. Nyoprettede posteringer vil i så fald tage udgangspunkt i de prissatser, som kunden har fået defineret. Har kunden ikke fået særlige prissatser vil nyoprettede posteringer fortsat trække prissatserne fra de globale prissatser. Administratorer kan både indstille andre satser, eller fastfryse de nuværende, så fremtidige opdateringer i de globale prissatser ikke kommer til at påvirke kundens priser.",
        "Hvis en kunde har fået fastsat særlige prissatser vil man kunne se dette i en info-pille i toppen af kundens side.",
        "Når man registrerer regelmæssig ledighed, så vil de endelige tidspunkter nu ikke længere forskydes en time frem eller en time bagud når de repræsenteres i kalenderen.",
        "Smårettelser og designjusteringer."
    ]
},{
    version: "3.1.4",
    date: "27. august 2025",
    changes: [
        "Knappen 'Registrer CVR-nummer' i 'Betal via faktura'-flowet virker nu som den skal.",
        "Betalingsknapperne på afsluttede opgaver er blevet designet om, så de er mere intuitive og lettere at bruge. Derudover er infolinjerne blevet rykket ned under betalingsknapperne, så det bliver mere intuitivt for medarbejderen at se det næste skridt i betalingsflowet.",
        "Når man opretter eller redigerer en postering vil man nu kunne se små advarsler, der indikerer hvilke beskrivelsesfelter, der vil komme med på en evt. faktura.",
        "Fremover vil opgaver ikke længere vise betalingsknapper, hvis der allerede er registreret opkrævninger på opgavens posteringer. Dette skal mindske risikoen for dobbeltopkrævninger. Er der behov for yderligere opkrævninger på en opgave håndterer man disse for enkelte posteringer ad gangen.",
        "Designjusteringer og -forbedringer samt diverse smårettelser."
    ]
},{
    version: "3.1.3",
    date: "26. august 2025",
    changes: [
        "Endnu flere rettelser på tabelvisningerne af opgaver. Nu kan administratorer se mere detaljerede informationer om hvorvidt afsluttede opgaver er betalte eller ej.",
        "Designjusteringer og -forbedringer."
    ]
},{
    version: "3.1.2",
    date: "26. august 2025",
    changes: [
        "Rettede fejl i flere tabeller, der bl.a. viste afsluttede opgaver som igangværende.",
        "Afsluttede opgaver vises nu med en gul farve for administratorer, hvis indbetalingerne på opgavens posteringer endnu ikke matcher posteringernes akkumulerede betalingsbeløb."
    ]
},{
    version: "3.1.1",
    date: "20. august 2025",
    changes: [
        "Fjernede 'Opdateringer'-knappen fra sidebaren på desktop-views. 'Opdateringer' kan fremover findes på desktop-views ved at trykke på 'Ændringshistorik' i bunden af siden."
    ]
},{
    version: "3.1.0",
    date: "20. august 2025",
    changes: [
        "Implementerede en funktion, der automatisk lytter efter opdateringer til app'en. Hvis der findes en opdatering, så vil brugeren blive promptet til at genstarte app'en."
    ]
},{
    version: "3.0.4",
    date: "20. august 2025",
    changes: [
        "Rettede en fejl, hvor det ikke var alle posteringer, der blev medregnet i medarbejderens eget økonomiske overblik."
    ]
},{
    version: "3.0.3",
    date: "20. august 2025",
    changes: [
        "Posteringer, der er oprettet i en tidligere lønperiode, får nu låst deres lønsatser. Dette var ved en fejl ikke tilfældet tidligere.",
        "Rettede en fejl, der gjorde, at en posterings bagside kortvarigt ville flimre frem og væk igen når man åbnede posteringens menu på mobilen.",
        "Rettede en afrundingsfejl, der gjorde, at 'Afslut opgave'-knappen blev vist på opgaver, hvor der slet ikke var oprettet posteringer endnu.",
        "Medarbejdere kan nu ikke længere se deres løntrin under 'Team'. Specifikationer om lønsatser vil blive introduceret igen i en snarlig app-version, hvor medarbejdere får egne profilsider.",
        "Rettede en fejl, hvor 'Afslut opgave'-knappen ikke altid blev vist selvom opgaven var klar til at blive afsluttet."
    ]
},{
    version: "3.0.2",
    date: "20. august 2025",
    changes: [
        "Rettede en tidszonefejl, der gjorde, at posteringer oprettet på uheldige skæringstidspunkter ikke blev vist i økonomiske overblik for medarbejdere."
    ]
},{
    version: "3.0.1",
    date: "19. august 2025",
    changes: [
        "Nu kan man manuelt registrere tidligere oprettede faktura-opkrævninger på posteringer. Dette gøres ved at trykke på 'Tilknyt faktura' i posteringens menu. Alt man skal gøre er blot at indtaste fakturaens nummer samt dato for posteringen.",
        "Små designforbedringer i 'Se opkrævninger'-menuen."
    ]
},{
    version: "3.0.0",
    date: "18. august 2025",
    changes: [
        "Posteringer har nu fået en masse nye funktioner, nyt design og bedre datastruktur.",
        "Opgaver kan ikke længere færdiggøres – nu afslutter man en opgave med det samme man er færdig med den. Ved afslutning af en opgave vil man med det samme blive promptet til at anmode kunden om betaling. Privatkunder kan betale med Mobile Pay (via enten anmodning eller QR-kode), og erhvervskunder kan betale med faktura. Vil en privatkunde betale med faktura lukker medarbejderen blot den automatiske prompt ned, og trykker på knappen 'Betal via faktura', som efter afslutning af opgaven bliver synlig på opgavesiden.",
        "Nu er det muligt at foretage delbetaling af opgaver. Medarbejdere kan, uden først at afslutte eller færdiggøre en opgave, opkræve særskilt betaling for en enkelt postering. Dette kan gøres via den særlige postering-menu, der vises umiddelbart under posteringen.",
        "Hver postering tracker nu sin egen opkrævnings- og betalingsstatus. Relevante brugere kan se opkrævninger og betalinger for posteringen via posteringens menu.",
        "Hvis man allerede har fået delvis betaling for en postering, eller hvis man har fået betalt nogle af posteringerne tilknyttet en opgave og vil opkræve resten, så vil opkrævningen via Mobile Pay automatisk tage højde for de indbetalinger, der allerede er foretaget, så der ikke bliver opkrævet for meget.",
        "En postering kan nu have fire status-tilstande: 'Ikke opkrævet', 'Faktura sendt', 'Delvist betalt' og 'Betalt'. Posteringer får ikke opdateret opkrævningsstatus ved Mobile Pay-betalinger, da betalingsvinduet her er kortere. Hvis en postering er blevet overbetalt vil dette også fremgå under 'Betalinger'-sektionen på den pågældende postering.",
        "Når posteringer for en opgave opkræves via faktura, så vil posteringen gemme fakturareferencen. Admins kan løbende tjekke op på fakturaens betalingsstatus direkte via posteringens opkrævningsmenu. Hvis en faktura registreres som betalt vil registreringen også automatisk opdatere posteringens status. Under posteringens 'Opkrævninger'-menu kan man desuden også se den pågældende faktura, der er blevet sendt ud til kunden, og man kan gensende den samme faktura til kunden igen som en reminder.",
        "Posteringers prissatser og lønsatser kan nu finjusteres efter oprettelse. Dette gøres ved at trykke på 'Ret' i posteringsmenuen, hvorefter man kan rette indhold, priser eller løn. Mens man retter satserne kan man også se et live-preview af posteringen som den vil fremgå efter ændringerne.",
        "Nu kan man registrere betaling manuelt på posteringerne direkte i app'en. Betalinger registreres manuelt ved at trykke på 'Ret', og derefter 'Reg. betaling'. Når man vil registrere en betaling kan det både være hele beløbet eller et delvist beløb – man kan her også se hvad der mangler at blive betalt på posteringen. Vil man knytte betalingen op til fx en faktura eller en Mobile Pay-indbetaling kan man også kopiere betalings-ID'et ind i det relevante felt under registreringen.",
        "Posteringer vender nu med prissiden opad i udgangspunktet. Man kan vende en postering ved at klikke på den, eller ved at trykke 'Vend' i posteringens menu. Man kan kun vende posteringer, som enten er tilknyttet en selv eller hvis man er administrator.",
        "Admins kan nu låse posteringer. En låst postering kan ikke redigeres af posteringens ophavsmand, men kan stadig ses og redigeres i af admins. Indhold og priser i en postering kan ikke ændres af hverken admins eller medarbejdere efter posteringen har registreret indbetalinger. Lønsatser på en postering kan ændres af admins frem til udgangen af den indeværende lønperiode."
    ]
},{
    version: "2.1.12",
    date: "8. august 2025",
    changes: [
        "Rettede en fejl, hvor nye brugere ikke kunne trække dynamiske prissatser når de oprettede posteringer."
    ]
},{
    version: "2.1.11",
    date: "2. august 2025",
    changes: [
        "Rettelser i betalings- og afslutningsflow."
    ]
},{
    version: "2.1.10",
    date: "28. juli 2025",
    changes: [
        "Opdaterede prissatserne i app'en for fremtidige posteringer."
    ]
},{
    version: "2.1.9",
    date: "25. juli 2025",
    changes: [
        "Rettede en fejl, der kunne forhindre en medarbejder i at tilgå sin liste over nuværende og tidligere opgaver."
    ]
},{
    version: "2.1.8",
    date: "8. juli 2025",
    changes: [
        "Hvis man forsøger at oprette en ny kunde med samme email som en eksisterende kunde i systemet får man nu en fejlmeddelelse, man rent faktisk kan tolke. Dette sker nu både i 'Ny opgave'- og 'Ny kunde'-flowet.",
        "Tidligere hen viste besøg i medarbejderes overblikskalender ID'et for den pågældende opgave. Nu viser besøgene i stedet kundens adresse.",
        "Når en medarbejder trykker sig ind på et besøg i overblikskalenderen, så vil der nu automatisk blive vist en knap til at gå til den pågældende opgave.",
        "Rettede en række fejl i overblikskalenderen.",
        "Øvrige smårettelser og justeringer."
    ]
},{
    version: "2.1.7",
    date: "6. juli 2025",
    changes: [
        "Der har været et problem med tabelvisninger af opgaver. Dette er nu rettet."
    ]
},{
    version: "2.1.6",
    date: "3. juli 2025",
    changes: [
        "Opdateringer af databasemodeller – gør dataflow lettere i app'en.",
        "Småt oprydningsarbejde."
    ]
},{
    version: "2.1.5",
    date: "3. juli 2025",
    changes: [
        "Førhen blev Mobile Pay-betalinger blot reserveret på kundens konto når kunden godkendte en Mobile Pay-betaling. Nu bliver de trukket med det samme umiddelbart efter reservationen.",
        "Rettede en fejl, hvor en åben opgave ikke afsluttede sig selv før reload efter succesfuld Mobile Pay-betaling."
    ]
},{
    version: "2.1.4",
    date: "2. juli 2025",
    changes: [
        "Afsluttede opgaver for privatkunder viser nu ikke længere 'Betal nu'-knappen umiddelbart efter at faktura er blevet oprettet på opgaven. Det gjorde de før ved en fejl.",
        "Implementerede bedre fejlhåndtering, når man forsøger at uploade videoer på opgaver.",
        "Ledige tider blev i nogle tilfælde fejlrepræsenteret pga. tidszoneforskelle i kalenderen. Dette er nu rettet.",
        "Nu kan medarbejdere slette deres egne ledige tider i både overbliks- og opgavekalenderen. Administratorer kan slette egne og andres i de samme kalendere. Hvis man sletter en ledig tid inden for hvilken der i forvejen er booket et besøg på den pågældende medarbejder vil besøget ikke blive påvirket.",
        "Fremover vil alle kalendre i app'en automatisk opdatere sig selv hvert 15. minut. Dette mindsker risikoen for, at brugere og administratorer sidder med forældede informationer.",
        "Når man opretter en ny kunde i 'Ny opgave'-formularen vil felterne nu fjerne alle mellemrum i CVR-, telefon- og email-felterne. Derudover vil input-felterne i de øvrige automatisk fjerne ekstra mellemrum før og efter inputtet.",
        "Det samme gør sig gældende når man opretter en ny kunde i 'Ny kunde'-formularen, såvel som når man redigerer en eksisterende kunde.",
        "Tilføjede mulighed for at ændre en eksisterende kundes telefonnummer (hvilket af Gud ved hvilken årsag ikke var muligt tidligere).",
        "Nu kan administratorer redigere i en kundes informationer direkte fra opgave-siden."
    ]
},{
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