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
        axisBankTitle: "Axis bank",
        axisBankHint: "Pick a ready-made pair or keep your own extremes.",
        axisBankShuffle: "Shuffle",
        axisBankUse: "Use this pair",
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
        axisBankTitle: "Banque d'axes",
        axisBankHint: "Choisis un duo ou garde tes propres extremes.",
        axisBankShuffle: "Relancer",
        axisBankUse: "Utiliser ce duo",
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
  zh: {
    translation: {
      app: {
        title: "Cercle — 现场波长",
        heroTitle: "调整指针。找到目标区域。",
        heroSubtitle:
          "主持人在两个极端之间放置线索。猜测者同步指针瞄准隐藏区域。",
      },
      language: {
        toggleLabel: "语言",
        english: "英语",
        french: "法语",
        chinese: "中文",
      },
      lobby: {
        enterRoom: "进入房间",
        createRoom: "创建房间",
        joinRoom: "加入",
        nameLabel: "昵称",
        namePlaceholder: "你的名字",
        roomCodeLabel: "房间代码",
        perPlayerNeedle: "每玩家指针（个人模式）",
        startCreate: "创建并开始",
        startJoin: "加入",
        status: "状态: {{state}}",
        connected: "已连接",
        disconnected: "已断开",
        quickRulesTitle: "快速规则",
        rule1: "主持人看到目标区域并提出主题。",
        rule2: "猜测者一起转动指针。",
        rule3: "确认以揭示目标和得分。",
      },
      guideForm: {
        hint: "你是主持人。发明你的轴和线索。",
        leftPlaceholder: "左极端",
        rightPlaceholder: "右极端",
        cluePlaceholder: "线索",
        submitTheme: "提交主题",
        axisBankTitle: "轴库",
        axisBankHint: "选择现成的配对或保留你自己的极端。",
        axisBankShuffle: "洗牌",
        axisBankUse: "使用此配对",
      },
      game: {
        roomCode: "房间 {{code}}",
        phase: {
          guide: "第1阶段 — 主持人提议",
          guess: "第2阶段 — 猜测者调整",
          reveal: "第3阶段 — 揭示",
        },
        needleLabel: "指针: {{mode}}",
        needleMode: {
          individual: "个人",
          common: "共享",
        },
        leave: "离开",
        guideWaiting: "主持人正在选择主题。请稍候...",
        guessPrompt: "一起调整指针，然后确认。",
        waitingForGuessers: "等待猜测者锁定。",
        lock: "确认",
        lockWaiting: "等待中",
        lockStatus: "已锁定: {{locked}}/{{required}} 猜测者",
        scoresIndividual: "个人得分",
        scorePoints: "{{score}} 分",
        scoreTotal: "得分: {{score}} 分",
        nextRound: "下一轮",
        players: "玩家",
        role: {
          guide: "主持人",
          guesser: "猜测者",
        },
      },
      dial: {
        ariaLabel: "波长表盘",
        dragLabel: "角度",
        leftDefault: "左极端",
        rightDefault: "右极端",
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
      supportedLngs: ["en", "fr", "zh"],
      interpolation: { escapeValue: false },
      detection,
      react: { useSuspense: false },
    });

  return i18n;
};
