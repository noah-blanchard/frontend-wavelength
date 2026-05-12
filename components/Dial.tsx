"use client";

import type { ChangeEvent } from "react";

const clampAngle = (angle: number) => Math.max(0, Math.min(180, angle));

const toPoint = (angle: number, radius: number, cx: number, cy: number) => {
  const clamped = clampAngle(angle);
  const rad = Math.PI - (clamped * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(rad),
    y: cy - radius * Math.sin(rad),
  };
};

type DialProps = {
  angle: number;
  onAngleChange?: (angle: number) => void;
  targetAngle: number | null;
  targetSize: number;
  showTarget: boolean;
  leftLabel?: string;
  rightLabel?: string;
  otherNeedles?: { angle: number; color: string }[];
  selfColor?: string;
  interactive?: boolean;
};

export const Dial = ({
  angle,
  onAngleChange,
  targetAngle,
  targetSize,
  showTarget,
  leftLabel,
  rightLabel,
  otherNeedles = [],
  selfColor = "#F8FAFC",
  interactive = false,
}: DialProps) => {
  const cx = 200;
  const cy = 200;
  const radius = 160;

  const needleRotation = clampAngle(angle) - 90;

  const targetSpan = Math.max(0, Math.min(180, targetSize));
  const targetStart =
    targetAngle === null ? null : clampAngle(targetAngle - targetSpan / 2);
  const targetEnd =
    targetAngle === null ? null : clampAngle(targetAngle + targetSpan / 2);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!onAngleChange) {
      return;
    }
    onAngleChange(Number(event.target.value));
  };

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

  const renderNeedle = (needleAngle: number, color: string, width: number) => (
    <g transform={`rotate(${clampAngle(needleAngle) - 90} ${cx} ${cy})`}>
      <line
        x1={cx}
        y1={cy}
        x2={cx}
        y2={cy - radius + 12}
        stroke={color}
        strokeWidth={width}
        strokeLinecap="round"
      />
    </g>
  );

  return (
    <div className="relative w-full max-w-xl">
      <div className="relative">
        <svg
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
            d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${
              cx + radius
            } ${cy}`}
            fill="none"
            stroke="url(#dialStroke)"
            strokeWidth="8"
          />

          {otherNeedles.map((needle, index) => (
            <g key={`other-${index}`}>
              {renderNeedle(needle.angle, needle.color, 3)}
            </g>
          ))}

          {renderNeedle(angle, selfColor, 6)}

          <circle cx={cx} cy={cy} r="6" fill="#F8FAFC" />
        </svg>

        {interactive ? (
          <input
            type="range"
            min={0}
            max={180}
            step={1}
            value={clampAngle(angle)}
            onChange={handleChange}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
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
