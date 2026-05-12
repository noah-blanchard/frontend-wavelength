"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { Dial } from "../components/Dial";
import { useSocket } from "../hooks/useSocket";

type Mode = "create" | "join";

type GuideFormProps = {
  onSubmit: (left: string, right: string, clue: string) => void;
  onSfx?: () => void;
};

const GuideForm = ({ onSubmit, onSfx }: GuideFormProps) => {
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
        Tu es le Guide. Invente ton axe et ton indice.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          value={leftExtreme}
          onChange={(event) => setLeftExtreme(event.target.value)}
          placeholder="Extreme gauche"
          className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-emerald-300"
        />
        <input
          value={rightExtreme}
          onChange={(event) => setRightExtreme(event.target.value)}
          placeholder="Extreme droite"
          className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-emerald-300"
        />
      </div>
      <input
        value={clue}
        onChange={(event) => setClue(event.target.value)}
        placeholder="Indice"
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
        Valider le theme
      </motion.button>
    </motion.div>
  );
};

export default function Home() {
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
  const audioRef = useRef<AudioContext | null>(null);
  const lastRevealIdRef = useRef<string | null>(null);
  const isInRoom = Boolean(roomState);

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

  const lockedCount = roomState?.lockedPlayers?.length ?? 0;
  const requiredLocks = roomState?.requiredLocks ?? 0;
  const hasLocked = roomState?.lockedPlayers?.includes(playerId ?? "") ?? false;

  const playerColors = Object.fromEntries(
    (roomState?.players ?? []).map((player) => [player.id, player.color])
  );
  const selfColor = playerId ? playerColors[playerId] ?? "#F8FAFC" : "#F8FAFC";

  const otherNeedles =
    roomState?.phase === "reveal" && roomState.perPlayerNeedles
      ? Object.entries(roomState.needleAngles ?? {})
          .filter(([playerIdEntry]) => playerIdEntry !== playerId)
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

  const phaseLabel = useMemo(() => {
    switch (roomState?.phase) {
      case "guide":
        return "Phase 1 — Le Guide propose";
      case "guess":
        return "Phase 2 — Les devineurs ajustent";
      case "reveal":
        return "Phase 3 — Revelation";
      default:
        return "";
    }
  }, [roomState?.phase]);

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
          <motion.p
            className="text-sm uppercase tracking-[0.3em] text-emerald-200/70"
            variants={itemVariants}
          >
            Cercle — Wavelength Live
          </motion.p>
          <motion.h1
            className="text-3xl font-semibold text-slate-50 sm:text-4xl"
            variants={itemVariants}
          >
            Ajustez l&apos;aiguille. Trouvez la zone cible.
          </motion.h1>
          <motion.p className="max-w-2xl text-slate-300" variants={itemVariants}>
            Un Guide place un indice entre deux extremes. Les devineurs
            synchronisent l&apos;aiguille pour viser la zone cachee.
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
              <h2 className="text-xl font-semibold">Entrer dans une room</h2>
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
                  Creer une room
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
                  Rejoindre
                </motion.button>
              </div>

              <div className="mt-6 grid gap-4">
                <label className="text-sm text-slate-300">
                  Pseudo
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Votre nom"
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-base text-white outline-none transition focus:border-emerald-300"
                  />
                </label>

                {mode === "join" ? (
                  <label className="text-sm text-slate-300">
                    Code room
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
                    Aiguille par joueur (mode individuel)
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
                {mode === "create" ? "Creer et demarrer" : "Rejoindre"}
              </motion.button>

              <p className="mt-4 text-xs text-slate-400">
                Statut: {connected ? "connecte" : "deconnecte"}
              </p>
              </motion.div>

              <motion.div
                className="rounded-3xl border border-white/10 bg-linear-to-br from-white/5 via-white/2 to-transparent p-8"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <h3 className="text-lg font-semibold">Regles rapides</h3>
                <ul className="mt-4 space-y-3 text-sm text-slate-300">
                  <li>Le Guide voit la zone cible et propose un theme.</li>
                  <li>Les devineurs tournent l&apos;aiguille ensemble.</li>
                  <li>Validez pour reveler la cible et le score.</li>
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
                    Room {roomState?.roomCode}
                  </p>
                  <h2 className="text-xl font-semibold">{phaseLabel}</h2>
                  <p className="mt-2 text-xs text-slate-400">
                    Aiguille: {roomState?.perPlayerNeedles ? "individuelle" : "commune"}
                  </p>
                </div>
                <motion.button
                  type="button"
                  onClick={handleLeaveRoom}
                  className="rounded-full border border-white/15 px-4 py-2 text-xs text-slate-200 hover:border-rose-300/70 hover:text-rose-100"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Quitter
                </motion.button>
              </div>

              <motion.div
                className="mt-6 flex flex-col items-center gap-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                <Dial
                  angle={roomState?.needleAngle ?? 90}
                  onAngleChange={updateNeedle}
                  targetAngle={roomState?.targetAngle ?? null}
                  targetSize={roomState?.targetSize ?? 30}
                  showTarget={showTarget}
                  leftLabel={roomState?.extremes.left}
                  rightLabel={roomState?.extremes.right}
                  otherNeedles={otherNeedles}
                  selfColor={selfColor}
                  animateReveal={roomState?.phase === "reveal"}
                  interactive={roomState?.phase === "guess" && !isGuide}
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
                        Le Guide choisit le theme. Patientez...
                      </p>
                    )}
                  </div>
                ) : null}

                {roomState?.phase === "guess" ? (
                  <div className="w-full rounded-2xl border border-white/10 bg-black/30 p-6">
                    <p className="text-sm text-slate-200">{roomState.clue}</p>
                    <p className="mt-2 text-sm text-slate-400">
                      Ajustez l&apos;aiguille ensemble puis validez.
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
                            {hasLocked ? "En attente" : "Valider"}
                          </motion.button>
                        ) : null}
                        <p className="text-xs text-slate-400">
                          Valide: {lockedCount}/{requiredLocks} devineurs
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
                        Valider
                      </motion.button>
                    ) : (
                      <p className="mt-4 text-xs text-slate-400">
                        Attendez que les devineurs verrouillent.
                      </p>
                    )}
                  </div>
                ) : null}

                {roomState?.phase === "reveal" ? (
                  <div className="w-full rounded-2xl border border-white/10 bg-black/30 p-6">
                    {roomState.perPlayerNeedles ? (
                      <div className="space-y-2 text-sm text-emerald-200">
                        <p>Scores individuels</p>
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
                                  {score} pts
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-emerald-200">
                        Score: {roomState.lastScore ?? 0} points
                      </p>
                    )}
                    <motion.button
                      type="button"
                      onClick={handleNextRound}
                      className="mt-4 rounded-xl bg-emerald-300 px-4 py-3 text-sm font-semibold text-slate-900"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Manche suivante
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
                Joueurs
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
                        {playerIsGuide ? "Guide" : "Devineur"}
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
