"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import AxisPicker from "../components/AxisPicker";
import { Dial } from "../components/Dial";
import { useSocket } from "../hooks/useSocket";

type Mode = "create" | "join";

type GuideFormProps = {
  onSubmit: (left: string, right: string, clue: string) => void;
  onSfx?: () => void;
};

const GuideForm = ({ onSubmit, onSfx }: GuideFormProps) => {
  const { t } = useTranslation();
  const [leftExtreme, setLeftExtreme] = useState("");
  const [rightExtreme, setRightExtreme] = useState("");
  const [clue, setClue] = useState("");

  const canSubmit =
    leftExtreme.trim().length > 0 &&
    rightExtreme.trim().length > 0 &&
    clue.trim().length > 0;

  return (
    <motion.div
      className="grid gap-4"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <p className="text-sm text-emerald-200">
        {t("guideForm.hint")}
      </p>
      <AxisPicker
        onPick={(left, right) => {
          setLeftExtreme(left);
          setRightExtreme(right);
          onSfx?.();
        }}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          value={leftExtreme}
          onChange={(event) => setLeftExtreme(event.target.value)}
          placeholder={t("guideForm.leftPlaceholder")}
          className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-emerald-300"
        />
        <input
          value={rightExtreme}
          onChange={(event) => setRightExtreme(event.target.value)}
          placeholder={t("guideForm.rightPlaceholder")}
          className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-emerald-300"
        />
      </div>
      <input
        value={clue}
        onChange={(event) => setClue(event.target.value)}
        placeholder={t("guideForm.cluePlaceholder")}
        className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-emerald-300"
      />
      <motion.button
        type="button"
        onClick={() => {
          onSfx?.();
          onSubmit(leftExtreme, rightExtreme, clue);
        }}
        disabled={!canSubmit}
        className="rounded-xl bg-emerald-300 px-4 py-3 text-sm font-semibold text-slate-900 transition disabled:cursor-not-allowed disabled:bg-emerald-200/40"
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
      >
        {t("guideForm.submitTheme")}
      </motion.button>
    </motion.div>
  );
};

export default function Home() {
  const { t, i18n } = useTranslation();
  const {
    connected,
    roomState,
    isGuide,
    playerId,
    error,
    resetError,
    createRoom,
    joinRoom,
    submitGuide,
    updateNeedle,
    lockGuess,
    nextRound,
    leaveRoom,
  } = useSocket();

  const [mode, setMode] = useState<Mode>("create");
  const [name, setName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [perPlayerNeedles, setPerPlayerNeedles] = useState(false);
  const [localAngle, setLocalAngle] = useState(90);
  const [isDragging, setIsDragging] = useState(false);
  const pendingCommitRef = useRef<number | null>(null);
  const audioRef = useRef<AudioContext | null>(null);
  const lastRevealIdRef = useRef<string | null>(null);
  const isInRoom = Boolean(roomState);
  const currentLang = i18n.resolvedLanguage?.startsWith("fr") ? "fr" : "en";

  const handleLocaleChange = (lang: "en" | "fr") => {
    i18n.changeLanguage(lang);
  };

  const playSfx = (
    frequency = 520,
    duration = 0.08,
    type: OscillatorType = "sine"
  ) => {
    if (typeof window === "undefined") {
      return;
    }
    const AudioContextRef =
      window.AudioContext ||
      (window as typeof window & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioContextRef) {
      return;
    }
    const context = audioRef.current ?? new AudioContextRef();
    audioRef.current = context;
    if (context.state === "suspended") {
      void context.resume();
    }
    const osc = context.createOscillator();
    const gain = context.createGain();
    osc.type = type;
    osc.frequency.value = frequency;
    gain.gain.value = 0.0001;
    gain.gain.exponentialRampToValueAtTime(0.08, context.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      context.currentTime + duration
    );
    osc.connect(gain);
    gain.connect(context.destination);
    osc.start();
    osc.stop(context.currentTime + duration + 0.02);
  };

  const handleModeChange = (nextMode: Mode) => {
    playSfx(nextMode === "create" ? 320 : 360, 0.06, "sine");
    setMode(nextMode);
  };

  const handleStart = () => {
    if (!name.trim()) {
      return;
    }
    playSfx(520, 0.1, "triangle");
    resetError();
    if (mode === "create") {
      createRoom(name.trim(), { perPlayerNeedles });
    } else {
      joinRoom(name.trim(), roomCode.trim().toUpperCase());
    }
  };

  const handleLockGuess = () => {
    playSfx(420, 0.08, "square");
    lockGuess();
  };

  const handleNextRound = () => {
    playSfx(620, 0.12, "sine");
    nextRound();
  };

  const handleLeaveRoom = () => {
    playSfx(220, 0.08, "sine");
    leaveRoom();
  };

  const playRiseSfx = () => {
    if (typeof window === "undefined") {
      return;
    }
    const AudioContextRef =
      window.AudioContext ||
      (window as typeof window & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioContextRef) {
      return;
    }
    const context = audioRef.current ?? new AudioContextRef();
    audioRef.current = context;
    if (context.state === "suspended") {
      void context.resume();
    }
    const osc = context.createOscillator();
    const gain = context.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(220, context.currentTime);
    osc.frequency.exponentialRampToValueAtTime(
      880,
      context.currentTime + 0.5
    );
    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.08, context.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      context.currentTime + 0.55
    );
    osc.connect(gain);
    gain.connect(context.destination);
    osc.start();
    osc.stop(context.currentTime + 0.6);
  };

  const showTarget =
    roomState?.phase === "reveal" || (roomState?.phase === "guide" && isGuide);

  const currentAngle = roomState?.needleAngle ?? 90;
  const isInteractive = roomState?.phase === "guess" && !isGuide;

  const lockedCount = roomState?.lockedPlayers?.length ?? 0;
  const requiredLocks = roomState?.requiredLocks ?? 0;
  const hasLocked = roomState?.lockedPlayers?.includes(playerId ?? "") ?? false;

  const playerColors = Object.fromEntries(
    (roomState?.players ?? []).map((player) => [player.id, player.color])
  );
  const selfColor = playerId ? playerColors[playerId] ?? "#F8FAFC" : "#F8FAFC";

  const hideGuideNeedle =
    isGuide &&
    (roomState?.phase === "guess" || roomState?.phase === "reveal");
  const showSelfNeedle = !hideGuideNeedle;

  const otherNeedles =
    roomState?.phase === "reveal" && roomState.perPlayerNeedles
      ? Object.entries(roomState.needleAngles ?? {})
          .filter(
            ([playerIdEntry]) =>
              playerIdEntry !== playerId &&
              playerIdEntry !== roomState?.guideId
          )
          .map(([playerIdEntry, angle]) => ({
            angle,
            color: playerColors[playerIdEntry] ?? "#94A3B8",
          }))
      : [];

  useEffect(() => {
    if (!roomState) {
      lastRevealIdRef.current = null;
      return;
    }
    const revealId = `${roomState.roomCode}-${roomState.phase}-${roomState.lockedBy ?? ""}`;
    if (
      roomState.phase === "reveal" &&
      roomState.perPlayerNeedles &&
      otherNeedles.length > 0 &&
      lastRevealIdRef.current !== revealId
    ) {
      lastRevealIdRef.current = revealId;
      playRiseSfx();
    }
  }, [otherNeedles.length, roomState]);

  useEffect(() => {
    let nextAngle: number | null = null;

    if (!isInteractive) {
      pendingCommitRef.current = null;
      nextAngle = currentAngle;
    } else if (!isDragging) {
      const pendingCommit = pendingCommitRef.current;
      if (pendingCommit === null) {
        nextAngle = currentAngle;
      } else if (Math.abs(currentAngle - pendingCommit) <= 0.5) {
        pendingCommitRef.current = null;
        nextAngle = currentAngle;
      }
    }

    if (nextAngle === null) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setLocalAngle(nextAngle);
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [currentAngle, isDragging, isInteractive]);

  useEffect(() => {
    if (!isInteractive) {
      const timeoutId = window.setTimeout(() => {
        setIsDragging(false);
      }, 0);

      return () => {
        window.clearTimeout(timeoutId);
      };
    }
  }, [isInteractive]);

  const handleAngleChange = (nextAngle: number) => {
    setIsDragging(true);
    setLocalAngle(nextAngle);
  };

  const handleAngleCommit = (nextAngle: number) => {
    setLocalAngle(nextAngle);
    setIsDragging(false);
    pendingCommitRef.current = nextAngle;
    updateNeedle(nextAngle);
  };

  const phaseLabel = useMemo(() => {
    if (!roomState?.phase) {
      return "";
    }
    return t(`game.phase.${roomState.phase}`);
  }, [roomState?.phase, t]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#1f2937_0%,#0b111a_45%,#05070b_100%)] text-white">
      <motion.div
        className="pointer-events-none absolute -left-32 top-16 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl"
        animate={{ y: [0, -12, 0], opacity: [0.6, 0.9, 0.6] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="pointer-events-none absolute -right-24 top-48 h-72 w-72 rounded-full bg-sky-400/20 blur-3xl"
        animate={{ y: [0, 10, 0], opacity: [0.6, 0.85, 0.6] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <main className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 py-10">
        <motion.header
          className="flex flex-col gap-3"
          initial="hidden"
          animate="show"
          variants={containerVariants}
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <motion.p
              className="text-sm uppercase tracking-[0.3em] text-emerald-200/70"
              variants={itemVariants}
            >
              {t("app.title")}
            </motion.p>
            <motion.div
              className="flex items-center gap-1 rounded-full border border-white/15 bg-black/30 p-1"
              role="group"
              aria-label={t("language.toggleLabel")}
              variants={itemVariants}
            >
              <button
                type="button"
                onClick={() => handleLocaleChange("en")}
                aria-label={t("language.english")}
                aria-pressed={currentLang === "en"}
                className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] transition ${
                  currentLang === "en"
                    ? "bg-emerald-300 text-slate-900"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => handleLocaleChange("fr")}
                aria-label={t("language.french")}
                aria-pressed={currentLang === "fr"}
                className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] transition ${
                  currentLang === "fr"
                    ? "bg-emerald-300 text-slate-900"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                FR
              </button>
            </motion.div>
          </div>
          <motion.h1
            className="text-3xl font-semibold text-slate-50 sm:text-4xl"
            variants={itemVariants}
          >
            {t("app.heroTitle")}
          </motion.h1>
          <motion.p className="max-w-2xl text-slate-300" variants={itemVariants}>
            {t("app.heroSubtitle")}
          </motion.p>
        </motion.header>

        <AnimatePresence mode="wait">
          {!isInRoom ? (
            <motion.section
              key="lobby"
              className="mt-12 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
              <h2 className="text-xl font-semibold">{t("lobby.enterRoom")}</h2>
              <div className="mt-6 flex gap-3">
                <motion.button
                  type="button"
                  onClick={() => handleModeChange("create")}
                  className={`rounded-full px-5 py-2 text-sm font-medium transition ${
                    mode === "create"
                      ? "bg-emerald-400/90 text-slate-900"
                      : "border border-white/15 text-slate-300"
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {t("lobby.createRoom")}
                </motion.button>
                <motion.button
                  type="button"
                  onClick={() => handleModeChange("join")}
                  className={`rounded-full px-5 py-2 text-sm font-medium transition ${
                    mode === "join"
                      ? "bg-sky-400/90 text-slate-900"
                      : "border border-white/15 text-slate-300"
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {t("lobby.joinRoom")}
                </motion.button>
              </div>

              <div className="mt-6 grid gap-4">
                <label className="text-sm text-slate-300">
                  {t("lobby.nameLabel")}
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder={t("lobby.namePlaceholder")}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-base text-white outline-none transition focus:border-emerald-300"
                  />
                </label>

                {mode === "join" ? (
                  <label className="text-sm text-slate-300">
                    {t("lobby.roomCodeLabel")}
                    <input
                      value={roomCode}
                      onChange={(event) =>
                        setRoomCode(event.target.value.toUpperCase())
                      }
                      placeholder="ABCD"
                      maxLength={4}
                      className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-base uppercase tracking-[0.25em] text-white outline-none transition focus:border-sky-300"
                    />
                  </label>
                ) : null}

                {mode === "create" ? (
                  <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-slate-200">
                    <input
                      type="checkbox"
                      checked={perPlayerNeedles}
                      onChange={(event) =>
                        setPerPlayerNeedles(event.target.checked)
                      }
                      className="h-4 w-4 rounded border-white/20 bg-black/60 text-emerald-300"
                    />
                    {t("lobby.perPlayerNeedle")}
                  </label>
                ) : null}

                {error ? (
                  <div className="rounded-xl border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                    {error}
                  </div>
                ) : null}
              </div>

              <motion.button
                type="button"
                onClick={handleStart}
                className="mt-6 w-full rounded-2xl bg-emerald-300 px-5 py-3 text-base font-semibold text-slate-900 transition hover:bg-emerald-200"
                whileHover={{ scale: 1.01, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                {mode === "create"
                  ? t("lobby.startCreate")
                  : t("lobby.startJoin")}
              </motion.button>

              <p className="mt-4 text-xs text-slate-400">
                {t("lobby.status", {
                  state: connected ? t("lobby.connected") : t("lobby.disconnected"),
                })}
              </p>
              </motion.div>

              <motion.div
                className="rounded-3xl border border-white/10 bg-linear-to-br from-white/5 via-white/2 to-transparent p-8"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <h3 className="text-lg font-semibold">
                  {t("lobby.quickRulesTitle")}
                </h3>
                <ul className="mt-4 space-y-3 text-sm text-slate-300">
                  <li>{t("lobby.rule1")}</li>
                  <li>{t("lobby.rule2")}</li>
                  <li>{t("lobby.rule3")}</li>
                </ul>
              </motion.div>
            </motion.section>
          ) : (
            <motion.section
              key="game"
              className="mt-10 grid gap-8 lg:grid-cols-[1.3fr_0.7fr]"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.45 }}
            >
              <motion.div className="rounded-3xl border border-white/10 bg-white/5 p-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-emerald-200/70">
                    {t("game.roomCode", { code: roomState?.roomCode ?? "" })}
                  </p>
                  <h2 className="text-xl font-semibold">{phaseLabel}</h2>
                  <p className="mt-2 text-xs text-slate-400">
                    {t("game.needleLabel", {
                      mode: roomState?.perPlayerNeedles
                        ? t("game.needleMode.individual")
                        : t("game.needleMode.common"),
                    })}
                  </p>
                </div>
                <motion.button
                  type="button"
                  onClick={handleLeaveRoom}
                  className="rounded-full border border-white/15 px-4 py-2 text-xs text-slate-200 hover:border-rose-300/70 hover:text-rose-100"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {t("game.leave")}
                </motion.button>
              </div>

              <motion.div
                className="mt-6 flex flex-col items-center gap-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                <Dial
                  angle={isInteractive ? localAngle : currentAngle}
                  onAngleChange={isInteractive ? handleAngleChange : undefined}
                  onAngleCommit={isInteractive ? handleAngleCommit : undefined}
                  targetAngle={roomState?.targetAngle ?? null}
                  targetSize={roomState?.targetSize ?? 30}
                  showTarget={showTarget}
                  leftLabel={roomState?.extremes.left}
                  rightLabel={roomState?.extremes.right}
                  otherNeedles={otherNeedles}
                  showSelfNeedle={showSelfNeedle}
                  selfColor={selfColor}
                  animateReveal={roomState?.phase === "reveal"}
                  interactive={isInteractive}
                />

                {roomState?.phase === "guide" ? (
                  <div className="w-full rounded-2xl border border-white/10 bg-black/30 p-6">
                    {isGuide ? (
                      <GuideForm
                        key={`${roomState?.phase}-${roomState?.guideId}`}
                        onSubmit={submitGuide}
                        onSfx={() => playSfx(560, 0.09, "triangle")}
                      />
                    ) : (
                      <p className="text-sm text-slate-300">
                        {t("game.guideWaiting")}
                      </p>
                    )}
                  </div>
                ) : null}

                {roomState?.phase === "guess" ? (
                  <div className="w-full rounded-2xl border border-white/10 bg-black/30 p-6">
                    <p className="text-sm text-slate-200">{roomState.clue}</p>
                    <p className="mt-2 text-sm text-slate-400">
                      {t("game.guessPrompt")}
                    </p>
                    {roomState.perPlayerNeedles ? (
                      <div className="mt-4 grid gap-3">
                        {!isGuide ? (
                          <motion.button
                            type="button"
                            onClick={handleLockGuess}
                            disabled={hasLocked}
                            className="rounded-xl bg-sky-300 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-sky-200 disabled:cursor-not-allowed disabled:bg-sky-200/40"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            {hasLocked ? t("game.lockWaiting") : t("game.lock")}
                          </motion.button>
                        ) : null}
                        <p className="text-xs text-slate-400">
                          {t("game.lockStatus", {
                            locked: lockedCount,
                            required: requiredLocks,
                          })}
                        </p>
                      </div>
                    ) : !isGuide ? (
                      <motion.button
                        type="button"
                        onClick={handleLockGuess}
                        className="mt-4 rounded-xl bg-sky-300 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-sky-200"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {t("game.lock")}
                      </motion.button>
                    ) : (
                      <p className="mt-4 text-xs text-slate-400">
                        {t("game.waitingForGuessers")}
                      </p>
                    )}
                  </div>
                ) : null}

                {roomState?.phase === "reveal" ? (
                  <div className="w-full rounded-2xl border border-white/10 bg-black/30 p-6">
                    {roomState.perPlayerNeedles ? (
                      <div className="space-y-2 text-sm text-emerald-200">
                        <p>{t("game.scoresIndividual")}</p>
                        <div className="grid gap-2 text-slate-100">
                          {roomState.players.map((player) => {
                            const score = roomState.lastScores?.[player.id] ?? 0;
                            const isSelf = player.id === playerId;
                            return (
                              <div
                                key={player.id}
                                className={`flex items-center justify-between rounded-lg border px-3 py-2 ${
                                  isSelf
                                    ? "border-emerald-300/50 bg-emerald-400/10"
                                    : "border-white/10 bg-black/20"
                                }`}
                              >
                                <span className="flex items-center gap-2">
                                  <span
                                    className="h-2.5 w-2.5 rounded-full"
                                    style={{ backgroundColor: player.color }}
                                  />
                                  {player.name}
                                </span>
                                <span className="text-xs text-emerald-100">
                                  {t("game.scorePoints", { score })}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-emerald-200">
                        {t("game.scoreTotal", {
                          score: roomState.lastScore ?? 0,
                        })}
                      </p>
                    )}
                    <motion.button
                      type="button"
                      onClick={handleNextRound}
                      className="mt-4 rounded-xl bg-emerald-300 px-4 py-3 text-sm font-semibold text-slate-900"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {t("game.nextRound")}
                    </motion.button>
                  </div>
                ) : null}
              </motion.div>
              </motion.div>

            <motion.aside
              className="rounded-3xl border border-white/10 bg-white/5 p-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <h3 className="text-sm uppercase tracking-[0.2em] text-slate-300">
                {t("game.players")}
              </h3>
              <div className="mt-4 space-y-3">
                {roomState?.players.map((player) => {
                  const playerIsGuide = player.id === roomState.guideId;
                  return (
                    <motion.div
                      key={player.id}
                      className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-sm ${
                        playerIsGuide
                          ? "border-emerald-300/60 bg-emerald-400/10 text-emerald-100"
                          : "border-white/10 bg-black/20 text-slate-200"
                      }`}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <span className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: player.color }}
                        />
                        {player.name}
                      </span>
                      <span className="text-xs">
                        {playerIsGuide ? t("game.role.guide") : t("game.role.guesser")}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </motion.aside>
          </motion.section>
        )}
        </AnimatePresence>
      </main>
    </div>
  );
}
