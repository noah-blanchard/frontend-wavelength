"use client";

import { useMemo, useState } from "react";
import { Dial } from "../components/Dial";
import { useSocket } from "../hooks/useSocket";

type Mode = "create" | "join";

type GuideFormProps = {
  onSubmit: (left: string, right: string, clue: string) => void;
};

const GuideForm = ({ onSubmit }: GuideFormProps) => {
  const [leftExtreme, setLeftExtreme] = useState("");
  const [rightExtreme, setRightExtreme] = useState("");
  const [clue, setClue] = useState("");

  const canSubmit =
    leftExtreme.trim().length > 0 &&
    rightExtreme.trim().length > 0 &&
    clue.trim().length > 0;

  return (
    <div className="grid gap-4">
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
      <button
        type="button"
        onClick={() => onSubmit(leftExtreme, rightExtreme, clue)}
        disabled={!canSubmit}
        className="rounded-xl bg-emerald-300 px-4 py-3 text-sm font-semibold text-slate-900 transition disabled:cursor-not-allowed disabled:bg-emerald-200/40"
      >
        Valider le theme
      </button>
    </div>
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
  const isInRoom = Boolean(roomState);

  const handleStart = () => {
    if (!name.trim()) {
      return;
    }
    resetError();
    if (mode === "create") {
      createRoom(name.trim(), { perPlayerNeedles });
    } else {
      joinRoom(name.trim(), roomCode.trim().toUpperCase());
    }
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

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#1f2937_0%,#0b111a_45%,#05070b_100%)] text-white">
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 py-10">
        <header className="flex flex-col gap-3">
          <p className="text-sm uppercase tracking-[0.3em] text-emerald-200/70">
            Cercle — Wavelength Live
          </p>
          <h1 className="text-3xl font-semibold text-slate-50 sm:text-4xl">
            Ajustez l&apos;aiguille. Trouvez la zone cible.
          </h1>
          <p className="max-w-2xl text-slate-300">
            Un Guide place un indice entre deux extremes. Les devineurs
            synchronisent l&apos;aiguille pour viser la zone cachee.
          </p>
        </header>

        {!isInRoom ? (
          <section className="mt-12 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
              <h2 className="text-xl font-semibold">Entrer dans une room</h2>
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setMode("create")}
                  className={`rounded-full px-5 py-2 text-sm font-medium transition ${
                    mode === "create"
                      ? "bg-emerald-400/90 text-slate-900"
                      : "border border-white/15 text-slate-300"
                  }`}
                >
                  Creer une room
                </button>
                <button
                  type="button"
                  onClick={() => setMode("join")}
                  className={`rounded-full px-5 py-2 text-sm font-medium transition ${
                    mode === "join"
                      ? "bg-sky-400/90 text-slate-900"
                      : "border border-white/15 text-slate-300"
                  }`}
                >
                  Rejoindre
                </button>
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

              <button
                type="button"
                onClick={handleStart}
                className="mt-6 w-full rounded-2xl bg-emerald-300 px-5 py-3 text-base font-semibold text-slate-900 transition hover:bg-emerald-200"
              >
                {mode === "create" ? "Creer et demarrer" : "Rejoindre"}
              </button>

              <p className="mt-4 text-xs text-slate-400">
                Statut: {connected ? "connecte" : "deconnecte"}
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-linear-to-br from-white/5 via-white/2 to-transparent p-8">
              <h3 className="text-lg font-semibold">Regles rapides</h3>
              <ul className="mt-4 space-y-3 text-sm text-slate-300">
                <li>Le Guide voit la zone cible et propose un theme.</li>
                <li>Les devineurs tournent l&apos;aiguille ensemble.</li>
                <li>Validez pour reveler la cible et le score.</li>
              </ul>
            </div>
          </section>
        ) : (
          <section className="mt-10 grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
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
                <button
                  type="button"
                  onClick={leaveRoom}
                  className="rounded-full border border-white/15 px-4 py-2 text-xs text-slate-200 hover:border-rose-300/70 hover:text-rose-100"
                >
                  Quitter
                </button>
              </div>

              <div className="mt-6 flex flex-col items-center gap-6">
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
                  interactive={roomState?.phase === "guess" && !isGuide}
                />

                {roomState?.phase === "guide" ? (
                  <div className="w-full rounded-2xl border border-white/10 bg-black/30 p-6">
                    {isGuide ? (
                      <GuideForm
                        key={`${roomState?.phase}-${roomState?.guideId}`}
                        onSubmit={submitGuide}
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
                          <button
                            type="button"
                            onClick={lockGuess}
                            disabled={hasLocked}
                            className="rounded-xl bg-sky-300 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-sky-200 disabled:cursor-not-allowed disabled:bg-sky-200/40"
                          >
                            {hasLocked ? "En attente" : "Valider"}
                          </button>
                        ) : null}
                        <p className="text-xs text-slate-400">
                          Valide: {lockedCount}/{requiredLocks} devineurs
                        </p>
                      </div>
                    ) : !isGuide ? (
                      <button
                        type="button"
                        onClick={lockGuess}
                        className="mt-4 rounded-xl bg-sky-300 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-sky-200"
                      >
                        Valider
                      </button>
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
                    <button
                      type="button"
                      onClick={nextRound}
                      className="mt-4 rounded-xl bg-emerald-300 px-4 py-3 text-sm font-semibold text-slate-900"
                    >
                      Manche suivante
                    </button>
                  </div>
                ) : null}
              </div>
            </div>

            <aside className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <h3 className="text-sm uppercase tracking-[0.2em] text-slate-300">
                Joueurs
              </h3>
              <div className="mt-4 space-y-3">
                {roomState?.players.map((player) => {
                  const playerIsGuide = player.id === roomState.guideId;
                  return (
                    <div
                      key={player.id}
                      className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-sm ${
                        playerIsGuide
                          ? "border-emerald-300/60 bg-emerald-400/10 text-emerald-100"
                          : "border-white/10 bg-black/20 text-slate-200"
                      }`}
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
                    </div>
                  );
                })}
              </div>
            </aside>
          </section>
        )}
      </main>
    </div>
  );
}
