"use client";

import { motion } from "motion/react";

export const PECK_MS = 320;
export const BIRD_W = 98;
export const BIRD_H = 120;

/** Palette stilizzata: rossi + bianchi da brand (mist / background). */
export const WOODPECKER_COLORS = {
  ink: "#5c1218",
  soft: "#8e1a22",
  cheek: "var(--brand-mist)",
  belly: "var(--background)",
  red: "#e53935",
  redDeep: "#c62828",
  redBright: "#ff5252",
  beak: "#3d2a1a",
  beakHi: "#6b4a2e",
  shoulder: "var(--brand-mist)",
  wingBar: "var(--brand-mist)",
} as const;

const C = WOODPECKER_COLORS;

type BirdProps = {
  pecking: boolean;
  className?: string;
  width?: number;
  height?: number;
};

/**
 * SVG articolato (zampe / coda / corpo / ala / testa / becco).
 */
export function WoodpeckerArticulated({
  pecking,
  className,
  width = BIRD_W,
  height = BIRD_H,
}: BirdProps) {
  const t = PECK_MS / 1000;
  const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];
  const hit = [0, 0.42, 1];

  return (
    <motion.svg
      width={width}
      height={height}
      viewBox="0 0 120 150"
      className={className ?? "drop-shadow-[0_2px_4px_rgba(0,0,0,0.28)]"}
      overflow="visible"
      aria-hidden
    >
      <motion.g
        style={{ transformOrigin: "92px 108px" }}
        animate={
          pecking
            ? { x: [0, 5, 0], y: [0, -2.5, 0], rotate: [0, 9, 0] }
            : { x: 0, y: 0, rotate: 0 }
        }
        transition={
          pecking
            ? { duration: t, ease, times: hit }
            : { type: "spring", stiffness: 280, damping: 24 }
        }
      >
        <motion.g
          style={{ transformOrigin: "58px 112px" }}
          animate={pecking ? { rotate: [0, -6, 0] } : { rotate: 0 }}
          transition={
            pecking ? { duration: t, ease, times: hit } : { duration: 0.2 }
          }
        >
          <path
            d="M52 108 C48 122 50 136 56 146 L62 134 C60 124 60 114 62 108 Z"
            fill={C.redDeep}
          />
          <path
            d="M60 110 C58 124 62 138 70 146 L74 132 C70 122 68 114 68 108 Z"
            fill={C.soft}
          />
          <path
            d="M54 118 C56 128 62 134 68 132 C64 124 60 118 56 114 Z"
            fill={C.redBright}
          />
        </motion.g>

        <g>
          <path
            d="M78 100 C88 106 96 112 104 118"
            fill="none"
            stroke={C.beak}
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <path
            d="M98 114 L106 112 M98 114 L106 120 M98 114 L108 116"
            fill="none"
            stroke={C.ink}
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M76 112 C86 120 94 128 102 136"
            fill="none"
            stroke={C.beak}
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <path
            d="M96 130 L104 128 M96 130 L104 136 M96 130 L106 132"
            fill="none"
            stroke={C.ink}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>

        <g>
          <path
            d="M48 58 C40 70 38 92 46 112 C52 122 64 126 74 118 C70 96 66 74 62 60 C58 54 52 54 48 58 Z"
            fill={C.belly}
          />
          <path
            d="M58 52 C66 48 78 54 84 68 C90 86 88 108 80 120 C72 128 62 124 58 114 C54 96 52 72 58 52 Z"
            fill={C.red}
          />
          <path
            d="M62 58 C70 54 80 60 84 72 C88 88 86 108 78 116 C72 120 64 116 62 108 C58 92 58 72 62 58 Z"
            fill={C.redDeep}
            opacity={0.45}
          />
          <ellipse
            cx="72"
            cy="78"
            rx="7"
            ry="11"
            fill={C.shoulder}
            transform="rotate(-18 72 78)"
          />
        </g>

        <motion.g
          style={{ transformOrigin: "62px 78px" }}
          animate={
            pecking
              ? { rotate: [0, 4, 0], scaleY: [1, 0.94, 1] }
              : { rotate: 0, scaleY: 1 }
          }
          transition={
            pecking ? { duration: t, ease, times: hit } : { duration: 0.2 }
          }
        >
          <path
            d="M50 66 C40 74 38 96 48 112 C56 122 68 120 74 110 C70 96 66 82 62 72 C58 66 54 64 50 66 Z"
            fill={C.soft}
          />
          <path
            d="M52 78 C46 88 48 102 56 110"
            fill="none"
            stroke={C.ink}
            strokeWidth="1.4"
            strokeLinecap="round"
            opacity={0.5}
          />
          <path
            d="M54 86 C58 90 64 92 70 90"
            fill="none"
            stroke={C.wingBar}
            strokeWidth="2.2"
            strokeLinecap="round"
            opacity={0.95}
          />
          <path
            d="M52 96 C58 100 64 102 70 100"
            fill="none"
            stroke={C.wingBar}
            strokeWidth="2"
            strokeLinecap="round"
            opacity={0.8}
          />
        </motion.g>

        <motion.g
          style={{ transformOrigin: "68px 58px" }}
          animate={
            pecking
              ? { rotate: [0, 7, 0], x: [0, 2.5, 0] }
              : { rotate: 0, x: 0 }
          }
          transition={
            pecking
              ? { duration: t, ease: [0.15, 0.9, 0.3, 1], times: hit }
              : { type: "spring", stiffness: 300, damping: 22 }
          }
        >
          <path
            d="M58 42 C62 28 74 22 88 28 C80 30 74 36 70 44 C66 48 62 48 58 42 Z"
            fill={C.redBright}
          />
          <ellipse cx="72" cy="48" rx="16" ry="14" fill={C.red} />
          <path
            d="M64 46 C68 40 82 40 88 48 C84 54 72 56 64 52 C62 50 62 48 64 46 Z"
            fill={C.cheek}
          />
          <path
            d="M66 48 C72 44 84 44 90 50 C86 52 74 52 66 48 Z"
            fill={C.redDeep}
            opacity={0.55}
          />
          <path
            d="M58 40 C62 32 74 30 82 36 C74 38 64 42 58 40 Z"
            fill={C.redBright}
          />
          <circle cx="80" cy="46" r="3.2" fill={C.cheek} />
          <circle cx="80.5" cy="46" r="1.6" fill={C.ink} />
          <circle cx="81.1" cy="45.4" r="0.55" fill="#fff" />

          <motion.g
            style={{ transformOrigin: "90px 50px" }}
            animate={
              pecking
                ? { x: [0, 3, 0], scaleX: [1, 1.04, 1] }
                : { x: 0, scaleX: 1 }
            }
            transition={
              pecking
                ? { duration: t, ease: [0.1, 0.95, 0.35, 1], times: hit }
                : { duration: 0.15 }
            }
          >
            <path d="M88 47 L114 51.5 L88 56 Z" fill={C.beak} />
            <path d="M88 47 L114 51.5 L88 51.2 Z" fill={C.beakHi} />
            <path
              d="M88 51.2 L114 51.5"
              stroke="#1a1a1a"
              strokeWidth="0.8"
              opacity={0.5}
            />
          </motion.g>
        </motion.g>
      </motion.g>
    </motion.svg>
  );
}

export type WoodChip = {
  id: number;
  dx: number;
  dy: number;
  rot: number;
  w: number;
  h: number;
  color: string;
  delay: number;
};

const CHIP_COLORS = [
  "#f3e0c0",
  "#e8c48a",
  "#c9922e",
  "#8b5a2b",
  "#5c3a22",
  "#fff6e0",
];

type SpawnChipsOptions = {
  /** Angolo iniziale in gradi (default: verso sinistra, scrollbar). */
  angleFrom?: number;
  /** Ampiezza ventaglio in gradi. */
  angleSpan?: number;
};

export function spawnWoodChips(
  burstId: number,
  options: SpawnChipsOptions = {},
): WoodChip[] {
  const angleFrom = options.angleFrom ?? 120;
  const angleSpan = options.angleSpan ?? 120;

  return Array.from({ length: 10 }, (_, i) => {
    const w = 4 + Math.random() * 5;
    const angle = ((angleFrom + Math.random() * angleSpan) * Math.PI) / 180;
    const dist = 28 + Math.random() * 48;
    return {
      id: burstId * 20 + i,
      dx: Math.cos(angle) * dist,
      dy: Math.sin(angle) * dist,
      rot: -180 + Math.random() * 360,
      w,
      h: w * (0.35 + Math.random() * 0.5),
      color: CHIP_COLORS[i % CHIP_COLORS.length]!,
      delay: Math.random() * 0.05,
    };
  });
}
