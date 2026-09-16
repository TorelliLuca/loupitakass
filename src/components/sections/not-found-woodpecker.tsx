"use client";

import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "motion/react";
import {
  BIRD_H,
  BIRD_W,
  PECK_MS,
  WoodpeckerArticulated,
  spawnWoodChips,
  type WoodChip,
} from "@/components/ui/woodpecker-articulated";

const PECK_INTERVAL_MS = 780;
const BIRD_SCALE = 1.45;

/**
 * Box 404 grosso + picchio a lato che picchia il bordo.
 */
export function NotFoundWoodpecker() {
  const reduceMotion = useReducedMotion();
  const [pecking, setPecking] = useState(false);
  const [chips, setChips] = useState<WoodChip[]>([]);
  const peckTimer = useRef(0);
  const chipClearTimer = useRef(0);
  const burstId = useRef(0);

  useEffect(() => {
    if (reduceMotion) return;

    const firePeck = () => {
      setPecking(true);
      burstId.current += 1;
      setChips((prev) => [
        ...prev.slice(-24),
        ...spawnWoodChips(burstId.current, { angleFrom: -50, angleSpan: 100 }),
      ]);

      window.clearTimeout(peckTimer.current);
      window.clearTimeout(chipClearTimer.current);
      peckTimer.current = window.setTimeout(() => setPecking(false), PECK_MS);
      chipClearTimer.current = window.setTimeout(() => setChips([]), 700);
    };

    firePeck();
    const id = window.setInterval(firePeck, PECK_INTERVAL_MS);
    return () => {
      window.clearInterval(id);
      window.clearTimeout(peckTimer.current);
      window.clearTimeout(chipClearTimer.current);
    };
  }, [reduceMotion]);

  return (
    <div
      aria-hidden
      className="flex items-center justify-center gap-1 sm:gap-2"
    >
      <div
        className="relative shrink-0 origin-[85%_55%]"
        style={{
          width: BIRD_W,
          height: BIRD_H,
          transform: `rotate(-12deg) scale(${BIRD_SCALE})`,
        }}
      >
        <WoodpeckerArticulated pecking={!reduceMotion && pecking} />
        <div className="absolute top-[40%] right-[2%] z-20 h-0 w-0 overflow-visible">
          <AnimatePresence>
            {chips.map((chip) => (
              <motion.span
                key={chip.id}
                className="absolute block rounded-[1px] shadow-sm"
                style={{
                  width: chip.w,
                  height: chip.h,
                  background: chip.color,
                  boxShadow: "0 0 0 1px rgba(0,0,0,0.15)",
                }}
                initial={{ x: 0, y: 0, opacity: 0, rotate: 0, scale: 0.6 }}
                animate={{
                  x: chip.dx * 0.9,
                  y: chip.dy * 0.75,
                  opacity: [0, 1, 1, 0],
                  rotate: chip.rot,
                  scale: [0.6, 1.15, 1, 0.5],
                }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 0.55,
                  delay: chip.delay,
                  ease: [0.2, 0.75, 0.25, 1],
                  times: [0, 0.12, 0.55, 1],
                }}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>

      <motion.div
        className="relative flex h-[9.5rem] w-[11.5rem] items-center justify-center rounded-sm border border-brand-ink/15 bg-[linear-gradient(165deg,#f7f1e6_0%,#efe4d0_48%,#e8d8bc_100%)] shadow-[0_18px_40px_-24px_rgba(0,0,0,0.45)] sm:h-[11.5rem] sm:w-[14rem]"
        animate={
          reduceMotion
            ? undefined
            : {
                x: pecking ? [0, 3, 0] : 0,
                rotate: pecking ? [0, 0.7, 0] : 0,
              }
        }
        transition={{ duration: PECK_MS / 1000, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="absolute inset-0 opacity-[0.14] [background-image:repeating-linear-gradient(0deg,transparent,transparent_18px,rgba(92,58,34,0.35)_19px)]" />
        <span className="relative font-display text-[clamp(4.5rem,16vw,6.5rem)] leading-none tracking-tight text-brand-ink/80 select-none">
          404
        </span>
      </motion.div>
    </div>
  );
}
