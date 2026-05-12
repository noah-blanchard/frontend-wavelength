import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      app: {
        title: "Cercle — Wavelength Live",
        heroTitle: "Adjust the needle. Find the target zone.",
        heroSubtitle:
          "A Guide places a clue between two extremes. Guessers sync the needle to aim for the hidden zone.",
      },
      language: {
        toggleLabel: "Language",
        english: "English",
        french: "French",
      },
      lobby: {
        enterRoom: "Enter a room",
        createRoom: "Create a room",
        joinRoom: "Join",
        nameLabel: "Name",
        namePlaceholder: "Your name",
        roomCodeLabel: "Room code",
        perPlayerNeedle: "Per-player needle (individual mode)",
        startCreate: "Create and start",
        startJoin: "Join",
        status: "Status: {{state}}",
        connected: "connected",
        disconnected: "disconnected",
        quickRulesTitle: "Quick rules",
        rule1: "The Guide sees the target zone and proposes a theme.",
        rule2: "The guessers turn the needle together.",
        rule3: "Confirm to reveal the target and score.",
      },
      guideForm: {
        hint: "You are the Guide. Invent your axis and clue.",
        leftPlaceholder: "Left extreme",
        rightPlaceholder: "Right extreme",
        cluePlaceholder: "Clue",
        submitTheme: "Submit theme",
      },
      game: {
        roomCode: "Room {{code}}",
        phase: {
          guide: "Phase 1 — The Guide proposes",
          guess: "Phase 2 — Guessers adjust",
          reveal: "Phase 3 — Reveal",
        },
        needleLabel: "Needle: {{mode}}",
        needleMode: {
          individual: "individual",
          common: "shared",
        },
        leave: "Leave",
        guideWaiting: "The Guide picks a theme. Please wait...",
        guessPrompt: "Adjust the needle together, then confirm.",
        waitingForGuessers: "Wait for the guessers to lock in.",
        lock: "Confirm",
        lockWaiting: "Waiting",
        lockStatus: "Locked: {{locked}}/{{required}} guessers",
        scoresIndividual: "Individual scores",
        scorePoints: "{{score}} pts",
        scoreTotal: "Score: {{score}} points",
        nextRound: "Next round",
        players: "Players",
        role: {
          guide: "Guide",
          guesser: "Guesser",
        },
      },
      dial: {
        ariaLabel: "Wavelength dial",
        dragLabel: "Angle",
        leftDefault: "Left extreme",
        rightDefault: "Right extreme",
      },
    },
  },
  fr: {
    translation: {
      app: {
        title: "Cercle — Wavelength Live",
        heroTitle: "Ajustez l'aiguille. Trouvez la zone cible.",
        heroSubtitle:
          "Un Guide place un indice entre deux extremes. Les devineurs synchronisent l'aiguille pour viser la zone cachee.",
      },
      language: {
        toggleLabel: "Langue",
        english: "Anglais",
        french: "Francais",
      },
      lobby: {
        enterRoom: "Entrer dans une room",
        createRoom: "Creer une room",
        joinRoom: "Rejoindre",
        nameLabel: "Pseudo",
        namePlaceholder: "Votre nom",
        roomCodeLabel: "Code room",
        perPlayerNeedle: "Aiguille par joueur (mode individuel)",
        startCreate: "Creer et demarrer",
        startJoin: "Rejoindre",
        status: "Statut: {{state}}",
        connected: "connecte",
        disconnected: "deconnecte",
        quickRulesTitle: "Regles rapides",
        rule1: "Le Guide voit la zone cible et propose un theme.",
        rule2: "Les devineurs tournent l'aiguille ensemble.",
        rule3: "Validez pour reveler la cible et le score.",
      },
      guideForm: {
        hint: "Tu es le Guide. Invente ton axe et ton indice.",
        leftPlaceholder: "Extreme gauche",
        rightPlaceholder: "Extreme droite",
        cluePlaceholder: "Indice",
        submitTheme: "Valider le theme",
      },
      game: {
        roomCode: "Salle {{code}}",
        phase: {
          guide: "Phase 1 — Le Guide propose",
          guess: "Phase 2 — Les devineurs ajustent",
          reveal: "Phase 3 — Revelation",
        },
        needleLabel: "Aiguille: {{mode}}",
        needleMode: {
          individual: "individuelle",
          common: "commune",
        },
        leave: "Quitter",
        guideWaiting: "Le Guide choisit le theme. Patientez...",
        guessPrompt: "Ajustez l'aiguille ensemble puis validez.",
        waitingForGuessers: "Attendez que les devineurs verrouillent.",
        lock: "Valider",
        lockWaiting: "En attente",
        lockStatus: "Valide: {{locked}}/{{required}} devineurs",
        scoresIndividual: "Scores individuels",
        scorePoints: "{{score}} pts",
        scoreTotal: "Score: {{score}} points",
        nextRound: "Manche suivante",
        players: "Joueurs",
        role: {
          guide: "Guide",
          guesser: "Devineur",
        },
      },
      dial: {
        ariaLabel: "Cadran Wavelength",
        dragLabel: "Angle",
        leftDefault: "Extreme gauche",
        rightDefault: "Extreme droite",
      },
    },
  },
};

const detection = {
  order: ["localStorage", "navigator", "htmlTag"],
  caches: ["localStorage"],
  lookupLocalStorage: "cercle.locale",
};

export const initI18n = () => {
  if (i18n.isInitialized) {
    return i18n;
  }

  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources,
      fallbackLng: "en",
      supportedLngs: ["en", "fr"],
      interpolation: { escapeValue: false },
      detection,
      react: { useSuspense: false },
    });

  return i18n;
};
