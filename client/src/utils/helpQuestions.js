// Kategorier: generelt, posteringer, opgaver, betalinger, dokumenter

const helpQuestions = [
    {
        question: "Hvordan installerer jeg app'en på min telefon?",
        answer: "Åbn Safari på din iPhone, eller en vilkårlig browser på din Android-telefon. Gå til https://app.bettercallbob.dk, og følg instruktionerne i popup-vinduet.",
        videoURL: "https://www.youtube.com/shorts/L0icZxl7MZ0",
        tags: ["generelt"],
        visible: true
    },
    {
        question: "Hvordan bruger jeg Octa?",
        answer: "Åbn app'en, og log ind med din email og dit kodeord. Her lander du på overblikssiden, hvor du kan se dine opgaver, din kalender samt hvad du har optjent i indeværende lønperiode.",
        videoURL: "https://www.youtube.com/watch?v=2t1FtQ6gIZY",
        tags: ["generelt"],
        visible: true
    },
    {
        question: "Hvordan slår jeg push-beskeder til?",
        answer: "Du kan slå push-beskeder til ved at gå ind i 'Indstillinger' og vælge 'Push-beskeder'. Tryk 'Tillad push-beskeder' for at slå dem til.",
        videoURL: "",
        tags: ["generelt"],
        visible: true
    },
    {
        question: "Hvad er posteringer?",
        answer: "Posteringer er økonomiske repræsentationer af arbejde, som du eller andre har udført. Posteringen registrerer timer, materialer samt evt. tillæg og rabatter. Posteringen kan også vise hvad kunden skal opkræves, og hvor meget løn du skal have for arbejdet. Al arbejde skal registreres med en eller flere posteringer.",
        videoURL: "",
        tags: ["posteringer"],
        visible: true
    },
    {
        question: "Hvordan opretter jeg en postering?",
        answer: "Åbn en opgave, du har fået tildelt, og tryk på 'Opret postering'. Her udfylder du de relevante oplysninger, og trykker på 'Registrér' når du er færdig.",
        videoURL: "https://www.youtube.com/shorts/n6zKnTIqvIU",
        tags: ["posteringer"],
        visible: true
    },
    {
        question: "Hvorfor kan jeg ikke oprette en postering på min opgave?",
        answer: "Hvis du ikke kan oprette en postering på din opgave er opgaven sandsynligvis afsluttet. Det kan også være, at du er blevet taget af opgaven, men stadig har adgang til at se den – det kan fx være hvis du tidligere har udført arbejde på opgaven, og skal have adgang til den for at se dine posteringer.",
        videoURL: "",
        tags: ["posteringer"],
        visible: true
    },
    {
        question: "Hvornår skal jeg give kunden rabat?",
        answer: "Som medarbejder kan du vælge at give kunden rabat på et stykke udført arbejde. Hvis kunden er utilfreds med arbejdet, resultatet, prisen eller andet, så kan du bruge rabatten til at fremme kundetilfredsheden og forbedre dine ratings. Rabatten angives i procent, og vil både påvirke den endelige pris kunden betaler, samt dit honorar for opgaven.",
        videoURL: "",
        tags: ["posteringer"],
        visible: true
    },
    {
        question: "Hvad er forskellen på dynamisk honorar og pris, og fast honorar og pris?",
        answer: "Hvis en postering arbejder med dynamisk honorar og/eller pris, så betyder det, at honoraret/prisen beregnes automatisk ud fra de oplysninger, du registrerer i posteringen – fx hvor mange timer du har arbejdet, hvilke tilvalg der gør sig gældende, osv. De dynamiske priser og honorarer tager udgangspunkt i hhv. kundens prissatser og dine lønsatser, med mindre andet er angivet. Faste priser eller honorarer betyder derimod, at prisen/honoraret er aftalt på forhånd, og at antallet af arbejdstimer eller øvrige vilkår ikke får indflydelse på den endelige beregning. I udgangspunktet oprettes en postering med dynamiske pris- og honorarberegninger.",
        videoURL: "",
        tags: ["posteringer"],
        visible: true
    },
    {
        question: "Hvordan beregnes min løn for en opgave?",
        answer: "Lønnen for en opgave beregnes ud fra posteringerne, der er oprettet på opgaven. Posteringerne tager udgangspunkt i dine lønsatser samt det, du registrerer i posteringerne – fx timer, tilvalg og udlæg.",
        videoURL: "",
        tags: ["posteringer"],
        visible: true
    },
    {
        question: "Min postering er låst – hvad gør jeg?",
        shortAnswer: "Posteringer bliver låst i tre tilfælde: 1) når der er registreret betalinger på posteringen, 2) når posteringen tilhører en afsluttet lønperiode, eller 3) når en administrator manuelt har låst den. Hvis posteringen er blevet låst manuelt kan du anmode en administrator om at åbne den igen.",
        videoURL: "",
        tags: ["posteringer"],
        visible: true
    },
    {
        question: "Hvordan opkræver jeg betaling for en opgave?",
        answer: "Normalt vil du skulle opkræve betaling for en opgave når du er færdig med at udføre den. I dette tilfælde trykker du 'Afslut opgave' på opgavesiden, hvorefter det foretrukne betalingsflow automatisk vil igangsættes. Privatkunder opkræves via Mobile Pay, mens erhvervskunder skal have en faktura.",
        videoURL: "https://www.youtube.com/shorts/Zpin4MCTwN0",
        tags: ["betalinger"],
        visible: true
    },
    {
        question: "Hvordan opkræver jeg en delvis betaling?",
        answer: "Via posteringsmenuen, som du altid finder umiddelbart under posteringen, kan du opkræve en enkeltstående betaling for den pågældende postering – uden først at afslutte opgaven. Dette kan være smart hvis opgaven strækker sig over flere dage, og aftalen er løbende betaling.",
        videoURL: "",
        tags: ["betalinger"],
        visible: true
    },
    {
        question: "Hvordan kan jeg se hvad der tidligere er blevet opkrævet på en opgave?",
        answer: "Du kan se hvad der tidligere er blevet opkrævet ved at trykke på 'Se betalinger' i posteringens menu. Her kan du se alle betalinger, der er foretaget på posteringen.",
        videoURL: "",
        tags: ["betalinger"],
        visible: true
    },
    {
        question: "Hvordan opretter jeg et besøg på en opgave?",
        answer: "Du kan oprette et besøg på en opgave ved at gå ind på opgaven, rulle ned til kalenderen og holde et kortvarigt tryk på den dato, du gerne vil oprette et besøg på. Du kan også trykke på den runde '+'-knap i nederste højre hjørne på opgavesiden.",
        videoURL: "https://www.youtube.com/shorts/e2NYQL-Hs8o",
        tags: ["opgaver"],
        visible: true
    },
    {
        question: "Hvordan viser jeg, at jeg kan arbejde i et givent tidsrum?",
        answer: "Fra overblikssiden kan du trykke på '+'-knappen nede i højre hjørne af skærmen. Her kan du oprette ledige tider – både enkeltstående tider samt generelle ugedage, hvor du er ledig i givne tidsrum.",
        videoURL: "https://www.youtube.com/watch?v=wh3l_u00fd8",
        tags: ["generelt"],
        visible: true
    },
    {
        question: "Hvordan kan jeg indstille hvor og med hvad jeg gerne vil arbejde?",
        answer: "På din profil kan du under 'Arbejdspræferencer' bl.a. indstille dit foretrukne arbejdsområde samt de opgavetyper, du gerne vil arbejde med.",
        videoURL: "https://www.youtube.com/shorts/LWyjAePCZVg",
        tags: ["generelt"],
        visible: true
    },
    {
        question: "Kan der være flere ansvarlige på én opgave?",
        answer: "Ja, der kan sagtens være flere ansvarlige på samme opgave. Du kan altid se hvem der er sat på en opgave på opgavens side. Er I flere på samme opgave skal du være opmærksom på at koordinere arbejdet med de andre ansvarlige – og opgaven skal ikke afsluttes før alles arbejde på opgaven er færdiggjort og repræsenteret i posteringer på opgaven.",
        videoURL: "",
        tags: ["opgaver"],
        visible: true
    },
    {
        question: "Hvor kan jeg finde oplysninger om min opgave?",
        answer: "Når du har fået tildelt en opgave vil den ligge tilgængelig for dig under 'Overblik'-siden i app'en. Tryk på opgaven i tabellen for at gå ind på den – inde på opgavesiden finder du alle relevante oplysninger om opgaven.",
        videoURL: "https://www.youtube.com/watch?v=PD6l2IGga34",
        tags: ["opgaver"],
        visible: true
    },
    {
        question: "Hvad er 'Dokumenter'?",
        answer: "Under 'Dokumenter' finder du dokumenter, der er relevante for dig. Det kan enten være kontrakter, aftaler, manualer eller andet relevant materiale.",
        videoURL: "",
        tags: ["dokumenter"],
        visible: true
    }
]

export default helpQuestions