"use client";

import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "framer-motion";

const AXIS_BANK = {
  pairs: [
    {
      id: "shame-torture",
      en: { left: "A little embarrassing", right: "Unforgivable even under torture" },
      fr: { left: "Un peu honteux", right: "Inavouable meme sous torture" },
      zh: { left: "有点尴尬", right: "严刑拷打也不可原谅" },
    },
    {
      id: "betrayal-brutus",
      en: { left: "Small betrayal", right: "Brutus-level betrayal" },
      fr: { left: "Petite trahison", right: "Trahison niveau Brutus" },
      zh: { left: "小背叛", right: "布鲁图斯级别的背叛" },
    },
    {
      id: "social-lie",
      en: { left: "Social lie", right: "Lie that destroys three families" },
      fr: { left: "Mensonge social", right: "Mensonge qui detruit trois familles" },
      zh: { left: "社交谎言", right: "摧毁三个家庭的谎言" },
    },
    {
      id: "origin-villain",
      en: { left: "Questionable behavior", right: "Villain origin behavior" },
      fr: { left: "Comportement discutable", right: "Comportement de mechant d'origine" },
      zh: { left: "可疑行为", right: "反派起源行为" },
    },
    {
      id: "forgivable-move",
      en: { left: "Forgivable mistake", right: "Valid reason to move away" },
      fr: { left: "Erreur pardonnable", right: "Raison valable de demenager" },
      zh: { left: "可原谅的错误", right: "搬家的正当理由" },
    },
    {
      id: "file-reputation",
      en: { left: "Embarrassing file", right: "Dirt that buries a reputation" },
      fr: { left: "Dossier genant", right: "Dossier qui enterre une reputation" },
      zh: { left: "尴尬的档案", right: "埋葬声誉的污点" },
    },
    {
      id: "awkward-silence",
      en: { left: "5-second awkwardness", right: "Silence that haunts for 10 years" },
      fr: { left: "Malaise de 5 secondes", right: "Silence qui hante pendant 10 ans" },
      zh: { left: "5秒尴尬", right: "萦绕10年的沉默" },
    },
    {
      id: "manipulator-guru",
      en: { left: "Slightly manipulative", right: "Guru with premium subscription" },
      fr: { left: "Un peu manipulateur", right: "Gourou avec abonnement premium" },
      zh: { left: "有点操控性", right: "高级订阅的导师" },
    },
    {
      id: "abuse-tyranny",
      en: { left: "Petty abuse", right: "Domestic tyranny" },
      fr: { left: "Petit abus", right: "Tyrannie domestique" },
      zh: { left: "小虐待", right: "家庭暴政" },
    },
    {
      id: "squabble-breakup",
      en: { left: "Between-friends squabble", right: "Definitive end of the group" },
      fr: { left: "Crasse entre potes", right: "Fin definitive du groupe" },
      zh: { left: "朋友间的小争吵", right: "群体的最终解散" },
    },
    {
      id: "dark-humor",
      en: { left: "Dark humor", right: "Humor with disciplinary committee" },
      fr: { left: "Humour noir", right: "Humour avec comite disciplinaire" },
      zh: { left: "黑色幽默", right: "需要纪律委员会的幽默" },
    },
    {
      id: "bad-joke",
      en: { left: "Bad joke", right: "Joke requiring a statement" },
      fr: { left: "Mauvaise blague", right: "Blague qui necessite un communique" },
      zh: { left: "糟糕的笑话", right: "需要声明的笑话" },
    },
    {
      id: "disrespect-war",
      en: { left: "Lack of respect", right: "Personal declaration of war" },
      fr: { left: "Manque de respect", right: "Declaration de guerre personnelle" },
      zh: { left: "缺乏尊重", right: "个人宣战" },
    },
    {
      id: "low-blow",
      en: { left: "Low blow", right: "Social execution" },
      fr: { left: "Coup bas", right: "Execution sociale" },
      zh: { left: "卑鄙手段", right: "社会性处决" },
    },
    {
      id: "cowardice",
      en: { left: "A bit cowardly", right: "Historic cowardice" },
      fr: { left: "Un peu lache", right: "Lachete historique" },
      zh: { left: "有点懦弱", right: "历史性的懦弱" },
    },
    {
      id: "humiliation-4k",
      en: { left: "Small humiliation", right: "Humiliation in 4K archived" },
      fr: { left: "Petite humiliation", right: "Humiliation en 4K archivee" },
      zh: { left: "小羞辱", right: "4K存档的羞辱" },
    },
    {
      id: "opinion-safe",
      en: { left: "Questionable opinion", right: "Opinion kept in a safe" },
      fr: { left: "Opinion douteuse", right: "Opinion a garder dans un coffre" },
      zh: { left: "可疑观点", right: "锁在保险箱里的观点" },
    },
    {
      id: "immoral-cartel",
      en: { left: "Immoral choice", right: "Cartel boss choice" },
      fr: { left: "Choix immoral", right: "Choix de boss de cartel" },
      zh: { left: "不道德的选择", right: "贩毒集团老板的选择" },
    },
    {
      id: "slip-crisis",
      en: { left: "Controlled slip", right: "Slip that triggers a crisis meeting" },
      fr: { left: "Derapage controle", right: "Derapage qui finit en reunion de crise" },
      zh: { left: "可控的失误", right: "引发危机会议的失误" },
    },
    {
      id: "grudge-vendetta",
      en: { left: "Petty grudge", right: "Transgenerational vendetta" },
      fr: { left: "Rancune mesquine", right: "Vendetta transgenerationnelle" },
      zh: { left: "小怨恨", right: "跨代复仇" },
    },
    {
      id: "judgment-god",
      en: { left: "Judgment error", right: "Proof that God abandoned us" },
      fr: { left: "Erreur de jugement", right: "Preuve que Dieu nous a abandonnes" },
      zh: { left: "判断错误", right: "上帝抛弃我们的证明" },
    },
    {
      id: "suspect-prime",
      en: { left: "A little suspicious", right: "Natural prime suspect" },
      fr: { left: "Un peu suspect", right: "Suspect principal naturel" },
      zh: { left: "有点可疑", right: "天然的主要嫌疑人" },
    },
    {
      id: "flaw-eliminating",
      en: { left: "Cute flaw", right: "Eliminating flaw" },
      fr: { left: "Defaut mignon", right: "Defaut eliminatoire" },
      zh: { left: "可爱的缺点", right: "淘汰性缺陷" },
    },
    {
      id: "vice-corrupt",
      en: { left: "Small vice", right: "Corrupting vice" },
      fr: { left: "Petit vice", right: "Vice de seigneur corrompu" },
      zh: { left: "小恶习", right: "腐蚀性的恶习" },
    },
    {
      id: "argument-trial",
      en: { left: "Simple argument", right: "Public moral trial" },
      fr: { left: "Embrouille banale", right: "Proces moral public" },
      zh: { left: "简单争论", right: "公开道德审判" },
    },
    {
      id: "ego-napoleon",
      en: { left: "Bruised ego", right: "Wish Napoleon" },
      fr: { left: "Ego froisse", right: "Napoleon de Wish" },
      zh: { left: "受伤的自尊", right: "山寨拿破仑" },
    },
    {
      id: "toughness-resignation",
      en: { left: "Assumed toughness", right: "Moral resignation" },
      fr: { left: "Fermete assumee", right: "Abandon de poste moral" },
      zh: { left: "表面强硬", right: "道德辞职" },
    },
    {
      id: "jealousy-dictatorship",
      en: { left: "Normal jealousy", right: "Dictatorship surveillance" },
      fr: { left: "Jalousie normale", right: "Surveillance de dictature" },
      zh: { left: "正常嫉妒", right: "独裁监控" },
    },
    {
      id: "revenge-destruction",
      en: { left: "Sweet revenge", right: "Methodical destruction" },
      fr: { left: "Revanche douce", right: "Destruction methodique" },
      zh: { left: "甜蜜的复仇", right: "有计划的毁灭" },
    },
    {
      id: "secret-heritage",
      en: { left: "Secret of shame", right: "Secret that changes an inheritance" },
      fr: { left: "Secret de honte", right: "Secret qui change un heritage" },
      zh: { left: "羞耻的秘密", right: "改变遗产的秘密" },
    },
    {
      id: "prank-sociopath",
      en: { left: "Dubious prank", right: "Sociopath trap" },
      fr: { left: "Prank douteux", right: "Piege de sociopathe" },
      zh: { left: "可疑的恶作剧", right: "反社会者陷阱" },
    },
    {
      id: "phrase-exile",
      en: { left: "Small slip", right: "Slip that triggers an exile" },
      fr: { left: "Petite phrase", right: "Phrase qui declenche un exil" },
      zh: { left: "小失误", right: "引发流放的失误" },
    },
    {
      id: "petty-demon",
      en: { left: "Petty act", right: "Administrative demon act" },
      fr: { left: "Acte mesquin", right: "Acte de demon administratif" },
      zh: { left: "小气行为", right: "行政恶魔行为" },
    },
    {
      id: "reflex-traitor",
      en: { left: "Bad reflex", right: "Traitor instinct" },
      fr: { left: "Mauvais reflexe", right: "Instinct de traitre" },
      zh: { left: "坏反射", right: "叛徒本能" },
    },
    {
      id: "party-censored",
      en: { left: "Party cringe", right: "Censored episode" },
      fr: { left: "Connerie de soiree", right: "Episode censure" },
      zh: { left: "派对尴尬", right: "被审查的片段" },
    },
    {
      id: "embarrassment-wedding",
      en: { left: "Passing embarrassment", right: "File resurfaces at a wedding" },
      fr: { left: "Gene passagere", right: "Dossier ressorti au mariage" },
      zh: { left: "短暂的尴尬", right: "婚礼上重现的档案" },
    },
    {
      id: "fraud-org",
      en: { left: "Small fraud", right: "Fraud with org chart" },
      fr: { left: "Petite fraude", right: "Fraude avec organigramme" },
      zh: { left: "小欺诈", right: "有组织架构的欺诈" },
    },
    {
      id: "friend-infiltrated",
      en: { left: "Bad friend", right: "Infiltrated enemy" },
      fr: { left: "Mauvais ami", right: "Ennemi infiltre" },
      zh: { left: "坏朋友", right: "渗透的敌人" },
    },
    {
      id: "parent-tyrant",
      en: { left: "Heavy parent", right: "Family tyrant" },
      fr: { left: "Parent relou", right: "Tyran familial" },
      zh: { left: "烦人的父母", right: "家庭暴君" },
    },
    {
      id: "neighbor-antagonist",
      en: { left: "Annoying neighbor", right: "Real estate antagonist" },
      fr: { left: "Voisin penible", right: "Antagoniste immobilier" },
      zh: { left: "讨厌的邻居", right: "房地产对手" },
    },
    {
      id: "boss-feudal",
      en: { left: "Bossy boss", right: "Office feudal lord" },
      fr: { left: "Boss chiant", right: "Seigneur feodal de bureau" },
      zh: { left: "专横的老板", right: "办公室封建领主" },
    },
  ],
};

type AxisPair = (typeof AXIS_BANK.pairs)[number];

type AxisPickerProps = {
  onPick: (left: string, right: string) => void;
};

const getRandomPairs = (pairs: AxisPair[], count: number) => {
  const pool = [...pairs];
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count);
};

const AxisPicker = ({ onPick }: AxisPickerProps) => {
  const { t, i18n } = useTranslation();
  const [suggestions, setSuggestions] = useState<AxisPair[]>(() =>
    getRandomPairs(AXIS_BANK.pairs, 3)
  );

  const locale = i18n.resolvedLanguage?.startsWith("fr")
    ? "fr"
    : i18n.resolvedLanguage?.startsWith("zh")
      ? "zh"
      : "en";
  const suggestionContent = useMemo(
    () =>
      suggestions.map((pair) => ({
        id: pair.id,
        left: pair[locale].left,
        right: pair[locale].right,
      })),
    [locale, suggestions]
  );

  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-200/70">
            {t("guideForm.axisBankTitle")}
          </p>
          <p className="mt-2 text-sm text-slate-300">
            {t("guideForm.axisBankHint")}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setSuggestions(getRandomPairs(AXIS_BANK.pairs, 3))}
          className="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-200 transition hover:border-emerald-200/80 hover:text-emerald-100"
        >
          {t("guideForm.axisBankShuffle")}
        </button>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {suggestionContent.map((pair, index) => (
          <button
            key={index}
            type="button"
            onClick={() => onPick(pair.left, pair.right)}
            className="group flex h-45 w-full flex-col justify-between rounded-2xl border border-white/10 bg-linear-to-br from-white/10 via-white/5 to-transparent p-4 text-left transition hover:border-emerald-300/60 hover:shadow-[0_12px_30px_rgba(16,185,129,0.15)]"
          >
            <div>
              <AnimatePresence mode="wait">
                <motion.p
                  key={pair.id + "-left"}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-sm font-semibold text-slate-100"
                >
                  {pair.left}
                </motion.p>
              </AnimatePresence>
              <div className="mt-3 h-px w-8 bg-emerald-300/50" />
              <AnimatePresence mode="wait">
                <motion.p
                  key={pair.id + "-right"}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-3 text-sm font-semibold text-slate-100"
                >
                  {pair.right}
                </motion.p>
              </AnimatePresence>
            </div>
            <div className="mt-4 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-200/80 group-hover:text-emerald-100">
              {t("guideForm.axisBankUse")}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default AxisPicker;
