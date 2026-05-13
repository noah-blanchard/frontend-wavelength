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
    },
    {
      id: "betrayal-brutus",
      en: { left: "Small betrayal", right: "Brutus-level betrayal" },
      fr: { left: "Petite trahison", right: "Trahison niveau Brutus" },
    },
    {
      id: "social-lie",
      en: { left: "Social lie", right: "Lie that destroys three families" },
      fr: { left: "Mensonge social", right: "Mensonge qui detruit trois familles" },
    },
    {
      id: "origin-villain",
      en: { left: "Questionable behavior", right: "Villain origin behavior" },
      fr: { left: "Comportement discutable", right: "Comportement de mechant d'origine" },
    },
    {
      id: "forgivable-move",
      en: { left: "Forgivable mistake", right: "Valid reason to move away" },
      fr: { left: "Erreur pardonnable", right: "Raison valable de demenager" },
    },
    {
      id: "file-reputation",
      en: { left: "Embarrassing file", right: "Dirt that buries a reputation" },
      fr: { left: "Dossier genant", right: "Dossier qui enterre une reputation" },
    },
    {
      id: "awkward-silence",
      en: { left: "5-second awkwardness", right: "Silence that haunts for 10 years" },
      fr: { left: "Malaise de 5 secondes", right: "Silence qui hante pendant 10 ans" },
    },
    {
      id: "manipulator-guru",
      en: { left: "Slightly manipulative", right: "Guru with premium subscription" },
      fr: { left: "Un peu manipulateur", right: "Gourou avec abonnement premium" },
    },
    {
      id: "abuse-tyranny",
      en: { left: "Petty abuse", right: "Domestic tyranny" },
      fr: { left: "Petit abus", right: "Tyrannie domestique" },
    },
    {
      id: "squabble-breakup",
      en: { left: "Between-friends squabble", right: "Definitive end of the group" },
      fr: { left: "Crasse entre potes", right: "Fin definitive du groupe" },
    },
    {
      id: "dark-humor",
      en: { left: "Dark humor", right: "Humor with disciplinary committee" },
      fr: { left: "Humour noir", right: "Humour avec comite disciplinaire" },
    },
    {
      id: "bad-joke",
      en: { left: "Bad joke", right: "Joke requiring a statement" },
      fr: { left: "Mauvaise blague", right: "Blague qui necessite un communique" },
    },
    {
      id: "disrespect-war",
      en: { left: "Lack of respect", right: "Personal declaration of war" },
      fr: { left: "Manque de respect", right: "Declaration de guerre personnelle" },
    },
    {
      id: "low-blow",
      en: { left: "Low blow", right: "Social execution" },
      fr: { left: "Coup bas", right: "Execution sociale" },
    },
    {
      id: "cowardice",
      en: { left: "A bit cowardly", right: "Historic cowardice" },
      fr: { left: "Un peu lache", right: "Lachete historique" },
    },
    {
      id: "humiliation-4k",
      en: { left: "Small humiliation", right: "Humiliation in 4K archived" },
      fr: { left: "Petite humiliation", right: "Humiliation en 4K archivee" },
    },
    {
      id: "opinion-safe",
      en: { left: "Questionable opinion", right: "Opinion kept in a safe" },
      fr: { left: "Opinion douteuse", right: "Opinion a garder dans un coffre" },
    },
    {
      id: "immoral-cartel",
      en: { left: "Immoral choice", right: "Cartel boss choice" },
      fr: { left: "Choix immoral", right: "Choix de boss de cartel" },
    },
    {
      id: "slip-crisis",
      en: { left: "Controlled slip", right: "Slip that triggers a crisis meeting" },
      fr: { left: "Derapage controle", right: "Derapage qui finit en reunion de crise" },
    },
    {
      id: "grudge-vendetta",
      en: { left: "Petty grudge", right: "Transgenerational vendetta" },
      fr: { left: "Rancune mesquine", right: "Vendetta transgenerationnelle" },
    },
    {
      id: "judgment-god",
      en: { left: "Judgment error", right: "Proof that God abandoned us" },
      fr: { left: "Erreur de jugement", right: "Preuve que Dieu nous a abandonnes" },
    },
    {
      id: "suspect-prime",
      en: { left: "A little suspicious", right: "Natural prime suspect" },
      fr: { left: "Un peu suspect", right: "Suspect principal naturel" },
    },
    {
      id: "flaw-eliminating",
      en: { left: "Cute flaw", right: "Eliminating flaw" },
      fr: { left: "Defaut mignon", right: "Defaut eliminatoire" },
    },
    {
      id: "vice-corrupt",
      en: { left: "Small vice", right: "Corrupting vice" },
      fr: { left: "Petit vice", right: "Vice de seigneur corrompu" },
    },
    {
      id: "argument-trial",
      en: { left: "Simple argument", right: "Public moral trial" },
      fr: { left: "Embrouille banale", right: "Proces moral public" },
    },
    {
      id: "ego-napoleon",
      en: { left: "Bruised ego", right: "Wish Napoleon" },
      fr: { left: "Ego froisse", right: "Napoleon de Wish" },
    },
    {
      id: "toughness-resignation",
      en: { left: "Assumed toughness", right: "Moral resignation" },
      fr: { left: "Fermete assumee", right: "Abandon de poste moral" },
    },
    {
      id: "jealousy-dictatorship",
      en: { left: "Normal jealousy", right: "Dictatorship surveillance" },
      fr: { left: "Jalousie normale", right: "Surveillance de dictature" },
    },
    {
      id: "revenge-destruction",
      en: { left: "Sweet revenge", right: "Methodical destruction" },
      fr: { left: "Revanche douce", right: "Destruction methodique" },
    },
    {
      id: "secret-heritage",
      en: { left: "Secret of shame", right: "Secret that changes an inheritance" },
      fr: { left: "Secret de honte", right: "Secret qui change un heritage" },
    },
    {
      id: "prank-sociopath",
      en: { left: "Dubious prank", right: "Sociopath trap" },
      fr: { left: "Prank douteux", right: "Piege de sociopathe" },
    },
    {
      id: "phrase-exile",
      en: { left: "Small slip", right: "Slip that triggers an exile" },
      fr: { left: "Petite phrase", right: "Phrase qui declenche un exil" },
    },
    {
      id: "petty-demon",
      en: { left: "Petty act", right: "Administrative demon act" },
      fr: { left: "Acte mesquin", right: "Acte de demon administratif" },
    },
    {
      id: "reflex-traitor",
      en: { left: "Bad reflex", right: "Traitor instinct" },
      fr: { left: "Mauvais reflexe", right: "Instinct de traitre" },
    },
    {
      id: "party-censored",
      en: { left: "Party cringe", right: "Censored episode" },
      fr: { left: "Connerie de soiree", right: "Episode censure" },
    },
    {
      id: "embarrassment-wedding",
      en: { left: "Passing embarrassment", right: "File resurfaces at a wedding" },
      fr: { left: "Gene passagere", right: "Dossier ressorti au mariage" },
    },
    {
      id: "fraud-org",
      en: { left: "Small fraud", right: "Fraud with org chart" },
      fr: { left: "Petite fraude", right: "Fraude avec organigramme" },
    },
    {
      id: "friend-infiltrated",
      en: { left: "Bad friend", right: "Infiltrated enemy" },
      fr: { left: "Mauvais ami", right: "Ennemi infiltre" },
    },
    {
      id: "parent-tyrant",
      en: { left: "Heavy parent", right: "Family tyrant" },
      fr: { left: "Parent relou", right: "Tyran familial" },
    },
    {
      id: "neighbor-antagonist",
      en: { left: "Annoying neighbor", right: "Real estate antagonist" },
      fr: { left: "Voisin penible", right: "Antagoniste immobilier" },
    },
    {
      id: "boss-feudal",
      en: { left: "Bossy boss", right: "Office feudal lord" },
      fr: { left: "Boss chiant", right: "Seigneur feodal de bureau" },
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

  const locale = i18n.resolvedLanguage?.startsWith("fr") ? "fr" : "en";
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
            className="group flex h-[180px] w-full flex-col justify-between rounded-2xl border border-white/10 bg-linear-to-br from-white/10 via-white/5 to-transparent p-4 text-left transition hover:border-emerald-300/60 hover:shadow-[0_12px_30px_rgba(16,185,129,0.15)]"
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
