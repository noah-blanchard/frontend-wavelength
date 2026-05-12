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
};

type SocketRef = Socket | null;

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:4000";

export const useSocket = () => {
  const socketRef = useRef<SocketRef>(null);
  const [connected, setConnected] = useState(false);
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      setPlayerId(socket.id ?? null);
    });

    socket.on("disconnect", () => {
      setConnected(false);
    });

    socket.on("room_state", (state: RoomState) => {
      setRoomState(state);
    });

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
