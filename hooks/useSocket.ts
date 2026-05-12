"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

export type Phase = "guide" | "guess" | "reveal";

export type PlayerSummary = {
  id: string;
  name: string;
  color: string;
};

export type RoomState = {
  roomCode: string;
  players: PlayerSummary[];
  guideId: string | null;
  phase: Phase;
  targetAngle: number | null;
  targetSize: number;
  perPlayerNeedles: boolean;
  extremes: { left: string; right: string };
  clue: string;
  needleAngle: number;
  needleAngles: Record<string, number> | null;
  lockedPlayers: string[] | null;
  requiredLocks: number | null;
  lockedBy: string | null;
  lastScore: number | null;
  lastScores: Record<string, number> | null;
  stateVersion: number;
};

export type ConnectionState =
  | "connected"
  | "degraded"
  | "reconnecting"
  | "offline";

type SocketRef = Socket | null;

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:4000";

const STORAGE_KEYS = {
  sessionId: "cercle.sessionId",
  playerId: "cercle.playerId",
  roomCode: "cercle.roomCode",
};

const HEARTBEAT_INTERVAL_MS = 5_000;
const HEARTBEAT_MISS_THRESHOLD = 3;
const OFFLINE_MISS_THRESHOLD = 6;

export const useSocket = () => {
  const socketRef = useRef<SocketRef>(null);
  const [connected, setConnected] = useState(false);
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }
    return window.localStorage.getItem(STORAGE_KEYS.playerId);
  });
  const [sessionId, setSessionId] = useState<string | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }
    return window.localStorage.getItem(STORAGE_KEYS.sessionId);
  });
  const [connectionState, setConnectionState] =
    useState<ConnectionState>("reconnecting");
  const [error, setError] = useState<string | null>(null);

  const sessionIdRef = useRef<string | null>(sessionId);
  const playerIdRef = useRef<string | null>(playerId);
  const roomCodeRef = useRef<string | null>(
    typeof window === "undefined"
      ? null
      : window.localStorage.getItem(STORAGE_KEYS.roomCode)
  );
  const roomStateRef = useRef<RoomState | null>(roomState);
  const lastStateVersionRef = useRef<number>(0);
  const missedHeartbeatsRef = useRef<number>(0);
  const pendingResumeRef = useRef<boolean>(false);

  const connect = useCallback(() => {
    if (socketRef.current) {
      return;
    }

    const socket = io(SOCKET_URL, {
      transports: ["websocket"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      setConnectionState("connected");
      missedHeartbeatsRef.current = 0;
      pendingResumeRef.current = true;
      socket.emit("client_hello", {
        sessionId: sessionIdRef.current ?? undefined,
        playerId: playerIdRef.current ?? undefined,
      });
    });

    socket.on("disconnect", () => {
      setConnected(false);
      setConnectionState("reconnecting");
    });

    socket.on("room_state", (state: RoomState) => {
      if (state.stateVersion < lastStateVersionRef.current) {
        return;
      }
      lastStateVersionRef.current = state.stateVersion;
      roomStateRef.current = state;
      setRoomState(state);
      roomCodeRef.current = state.roomCode;
      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEYS.roomCode, state.roomCode);
      }
    });

    socket.on(
      "server_hello",
      (payload: { sessionId: string; playerId: string }) => {
        setSessionId(payload.sessionId);
        setPlayerId(payload.playerId);
        sessionIdRef.current = payload.sessionId;
        playerIdRef.current = payload.playerId;
        if (typeof window !== "undefined") {
          window.localStorage.setItem(STORAGE_KEYS.sessionId, payload.sessionId);
          window.localStorage.setItem(STORAGE_KEYS.playerId, payload.playerId);
        }

        const roomCode = roomCodeRef.current;
        if (pendingResumeRef.current && roomCode) {
          socket.emit("resume_room", {
            sessionId: payload.sessionId,
            playerId: payload.playerId,
            roomCode,
          });
        }
      }
    );

    socket.on(
      "server_heartbeat",
      (payload: {
        ok: boolean;
        stateVersion?: number;
        roomState?: RoomState;
      }) => {
        if (!payload.ok) {
          return;
        }
        missedHeartbeatsRef.current = 0;
        setConnectionState("connected");
        if (
          typeof payload.stateVersion === "number" &&
          payload.stateVersion > lastStateVersionRef.current
        ) {
          lastStateVersionRef.current = payload.stateVersion;
        }
        if (payload.roomState) {
          roomStateRef.current = payload.roomState;
          setRoomState(payload.roomState);
          roomCodeRef.current = payload.roomState.roomCode;
          if (typeof window !== "undefined") {
            window.localStorage.setItem(
              STORAGE_KEYS.roomCode,
              payload.roomState.roomCode
            );
          }
        }
      }
    );

    socket.on(
      "resume_ack",
      (payload: { ok: boolean; roomState?: RoomState; stateVersion?: number }) => {
        pendingResumeRef.current = false;
        if (!payload.ok) {
          roomCodeRef.current = null;
          setRoomState(null);
          if (typeof window !== "undefined") {
            window.localStorage.removeItem(STORAGE_KEYS.roomCode);
          }
          return;
        }
        if (payload.roomState) {
          lastStateVersionRef.current = payload.roomState.stateVersion;
          roomStateRef.current = payload.roomState;
          setRoomState(payload.roomState);
          roomCodeRef.current = payload.roomState.roomCode;
          if (typeof window !== "undefined") {
            window.localStorage.setItem(
              STORAGE_KEYS.roomCode,
              payload.roomState.roomCode
            );
          }
        } else if (typeof payload.stateVersion === "number") {
          lastStateVersionRef.current = payload.stateVersion;
        }
      }
    );

    socket.on("error_message", (message: string) => {
      setError(message);
    });
  }, []);

  useEffect(() => {
    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, []);

  useEffect(() => {
    sessionIdRef.current = sessionId;
  }, [sessionId]);

  useEffect(() => {
    playerIdRef.current = playerId;
  }, [playerId]);

  useEffect(() => {
    roomStateRef.current = roomState;
  }, [roomState]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      const socket = socketRef.current;
      if (!socket || !sessionIdRef.current || !playerIdRef.current) {
        return;
      }
      if (!socket.connected) {
        return;
      }

      const roomCode =
        roomCodeRef.current ?? roomStateRef.current?.roomCode ?? undefined;

      socket.emit("client_heartbeat", {
        sessionId: sessionIdRef.current,
        playerId: playerIdRef.current,
        roomCode,
        lastStateVersion: lastStateVersionRef.current,
      });

      missedHeartbeatsRef.current += 1;
      if (missedHeartbeatsRef.current >= OFFLINE_MISS_THRESHOLD) {
        setConnectionState("offline");
        return;
      }
      if (missedHeartbeatsRef.current >= HEARTBEAT_MISS_THRESHOLD) {
        setConnectionState("reconnecting");
        return;
      }
      if (missedHeartbeatsRef.current >= 2) {
        setConnectionState("degraded");
      }
    }, HEARTBEAT_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, []);

  const emitEvent = useCallback(
    (event: string, payload?: Record<string, unknown>) => {
      connect();
      socketRef.current?.emit(event, payload ?? {});
    },
    [connect]
  );

  const createRoom = useCallback(
    (name: string, options?: { perPlayerNeedles?: boolean }) => {
      emitEvent("create_room", {
        name,
        perPlayerNeedles: options?.perPlayerNeedles ?? false,
      });
    },
    [emitEvent]
  );

  const joinRoom = useCallback(
    (name: string, roomCode: string) => {
      emitEvent("join_room", { name, roomCode });
    },
    [emitEvent]
  );

  const leaveRoom = useCallback(() => {
    if (roomState?.roomCode) {
      emitEvent("leave_room", { roomCode: roomState.roomCode });
    }
    setRoomState(null);
    roomStateRef.current = null;
    roomCodeRef.current = null;
    lastStateVersionRef.current = 0;
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEYS.roomCode);
    }
  }, [emitEvent, roomState]);

  const submitGuide = useCallback(
    (left: string, right: string, clue: string) => {
      if (!roomState?.roomCode) {
        return;
      }
      emitEvent("guide_submit", {
        roomCode: roomState.roomCode,
        left,
        right,
        clue,
      });
    },
    [emitEvent, roomState]
  );

  const updateNeedle = useCallback(
    (angle: number) => {
      if (!roomState?.roomCode) {
        return;
      }
      emitEvent("guess_update", { roomCode: roomState.roomCode, angle });
    },
    [emitEvent, roomState]
  );

  const lockGuess = useCallback(() => {
    if (!roomState?.roomCode) {
      return;
    }
    emitEvent("guess_lock", { roomCode: roomState.roomCode });
  }, [emitEvent, roomState]);

  const nextRound = useCallback(() => {
    if (!roomState?.roomCode) {
      return;
    }
    emitEvent("next_round", { roomCode: roomState.roomCode });
  }, [emitEvent, roomState]);

  const resetError = useCallback(() => setError(null), []);

  const isGuide = roomState?.guideId === playerId;

  return {
    connected,
    connectionState,
    roomState,
    playerId,
    isGuide,
    error,
    resetError,
    createRoom,
    joinRoom,
    leaveRoom,
    submitGuide,
    updateNeedle,
    lockGuess,
    nextRound,
  };
};
