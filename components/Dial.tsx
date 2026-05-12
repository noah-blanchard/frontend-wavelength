"use client";

import { animate, motion, useMotionValue, useSpring } from "framer-motion";
import { useCallback, useEffect, useRef } from "react";

const clampAngle = (angle: number) => Math.max(0, Math.min(180, angle));

const toPoint = (angle: number, radius: number, cx: number, cy: number) => {
  const clamped = clampAngle(angle);
  const rad = Math.PI - (clamped * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(rad),
    y: cy - radius * Math.sin(rad),
  };
};

type OtherNeedleProps = {
  angle: number;
  color: string;
  cx: number;
  cy: number;
  radius: number;
  animateReveal: boolean;
  delay: number;
};

const OtherNeedle = ({
  angle,
  color,
  cx,
  cy,
  radius,
  animateReveal,
  delay,
}: OtherNeedleProps) => {
  const targetRotation = clampAngle(angle) - 90;
  const rotVal = useMotionValue(animateReveal ? -90 : targetRotation);
  const opVal = useMotionValue(animateReveal ? 0 : 1);
  const gRef = useRef<SVGGElement>(null);

  useEffect(() => {
    const applyTransform = (r: number) => {
      gRef.current?.setAttribute("transform", `rotate(${r} ${cx} ${cy})`);
    };
    applyTransform(rotVal.get());
    const unsubRot = rotVal.on("change", applyTransform);

    if (!animateReveal) return unsubRot;

    const tid = window.setTimeout(() => {
      animate(rotVal, targetRotation, { duration: 2.4, ease: [0.16, 1, 0.3, 1] });
      animate(opVal, 1, { duration: 0.4 });
    }, delay * 1000);

    return () => {
      clearTimeout(tid);
      unsubRot();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.g ref={gRef as React.Ref<SVGGElement>} style={{ opacity: opVal }}>
      <line
        x1={cx}
        y1={cy}
        x2={cx}
        y2={cy - radius + 12}
        stroke={color}
        strokeWidth={3}
        strokeLinecap="round"
      />
    </motion.g>
  );
};

type DialProps = {
  angle: number;
  onAngleChange?: (angle: number) => void;
  onAngleCommit?: (angle: number) => void;
  targetAngle: number | null;
  targetSize: number;
  showTarget: boolean;
  leftLabel?: string;
  rightLabel?: string;
  otherNeedles?: { angle: number; color: string }[];
  showSelfNeedle?: boolean;
  selfColor?: string;
  interactive?: boolean;
  animateReveal?: boolean;
};

export const Dial = ({
  angle,
  onAngleChange,
  onAngleCommit,
  targetAngle,
  targetSize,
  showTarget,
  leftLabel,
  rightLabel,
  otherNeedles = [],
  showSelfNeedle = true,
  selfColor = "#F8FAFC",
  interactive = false,
  animateReveal = false,
}: DialProps) => {
  const cx = 200;
  const cy = 200;
  const radius = 160;
  const viewBoxWidth = 400;
  const viewBoxHeight = 220;
  const svgRef = useRef<SVGSVGElement>(null);
  const isDraggingRef = useRef(false);

  const selfRotation = useMotionValue(clampAngle(angle) - 90);
  const selfRotationSpring = useSpring(selfRotation, {
    stiffness: 300,
    damping: 32,
    mass: 0.9,
  });
  const selfNeedleRef = useRef<SVGGElement>(null);

  const targetSpan = Math.max(0, Math.min(180, targetSize));
  const targetStart =
    targetAngle === null ? null : clampAngle(targetAngle - targetSpan / 2);
  const targetEnd =
    targetAngle === null ? null : clampAngle(targetAngle + targetSpan / 2);

  useEffect(() => {
    selfRotation.set(clampAngle(angle) - 90);
  }, [angle, selfRotation]);

  useEffect(() => {
    const applyTransform = (r: number) => {
      selfNeedleRef.current?.setAttribute(
        "transform",
        `rotate(${r} ${cx} ${cy})`
      );
    };
    applyTransform(selfRotationSpring.get());
    const unsub = selfRotationSpring.on("change", applyTransform);
    return () => unsub();
  }, [cx, cy, selfRotationSpring]);

  const getAngleFromPointer = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const svg = svgRef.current;
      if (!svg) return clampAngle(angle);
      const rect = svg.getBoundingClientRect();
      if (!rect.width || !rect.height) return clampAngle(angle);
      const localX = ((event.clientX - rect.left) / rect.width) * viewBoxWidth;
      const localY = ((event.clientY - rect.top) / rect.height) * viewBoxHeight;
      const rad = Math.atan2(cy - localY, localX - cx);
      const deg = 180 - (rad * 180) / Math.PI;
      return clampAngle(deg);
    },
    [angle, cx, cy, viewBoxWidth, viewBoxHeight]
  );

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!interactive) return;
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      isDraggingRef.current = true;
      const nextAngle = getAngleFromPointer(event);
      onAngleChange?.(nextAngle);
    },
    [getAngleFromPointer, interactive, onAngleChange]
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!interactive || !isDraggingRef.current) return;
      event.preventDefault();
      const nextAngle = getAngleFromPointer(event);
      onAngleChange?.(nextAngle);
    },
    [getAngleFromPointer, interactive, onAngleChange]
  );

  const handlePointerUp = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!interactive || !isDraggingRef.current) return;
      event.preventDefault();
      isDraggingRef.current = false;
      const nextAngle = getAngleFromPointer(event);
      onAngleCommit?.(nextAngle);
    },
    [getAngleFromPointer, interactive, onAngleCommit]
  );

  const renderTarget =
    showTarget &&
    targetStart !== null &&
    targetEnd !== null &&
    targetAngle !== null;

  const targetPath = renderTarget
    ? (() => {
        const start = toPoint(targetStart, radius, cx, cy);
        const end = toPoint(targetEnd, radius, cx, cy);
        const sweepFlag = targetEnd >= targetStart ? 1 : 0;
        return `M ${cx} ${cy} L ${start.x} ${start.y} A ${radius} ${radius} 0 0 ${sweepFlag} ${end.x} ${end.y} Z`;
      })()
    : null;

  return (
    <div className="relative w-full max-w-xl">
      <div className="relative">
        <svg
          ref={svgRef}
          className="w-full"
          viewBox="0 0 400 220"
          role="img"
          aria-label="Wavelength dial"
        >
          <defs>
            <linearGradient id="dialStroke" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="#6EE7B7" stopOpacity="0.25" />
              <stop offset="50%" stopColor="#E2E8F0" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#93C5FD" stopOpacity="0.25" />
            </linearGradient>
          </defs>

          {renderTarget && targetPath ? (
            <path d={targetPath} fill="#22D3EE" fillOpacity="0.28" />
          ) : null}

          <path
            d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
            fill="none"
            stroke="url(#dialStroke)"
            strokeWidth="8"
          />

          {otherNeedles.map((needle, index) => (
            <OtherNeedle
              key={`other-${index}`}
              angle={needle.angle}
              color={needle.color}
              cx={cx}
              cy={cy}
              radius={radius}
              animateReveal={animateReveal}
              delay={index * 0.15}
            />
          ))}

          {showSelfNeedle ? (
            <motion.g ref={selfNeedleRef as React.Ref<SVGGElement>}>
              <line
                x1={cx}
                y1={cy}
                x2={cx}
                y2={cy - radius + 12}
                stroke={selfColor}
                strokeWidth={6}
                strokeLinecap="round"
              />
            </motion.g>
          ) : null}

          <circle cx={cx} cy={cy} r="6" fill="#F8FAFC" />
        </svg>

        {interactive ? (
          <motion.div
            className="absolute inset-0 h-full w-full cursor-grab"
            style={{ touchAction: "none" }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onPointerLeave={handlePointerUp}
            aria-label="Angle"
          />
        ) : null}
      </div>

      <div className="mt-3 flex justify-between text-sm text-slate-300">
        <span className="max-w-[45%] text-left">
          {leftLabel || "Extreme gauche"}
        </span>
        <span className="max-w-[45%] text-right">
          {rightLabel || "Extreme droite"}
        </span>
      </div>
    </div>
  );
};
