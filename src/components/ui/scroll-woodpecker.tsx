"use client";

import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "motion/react";
import {
  BIRD_H,
  BIRD_W,
  PECK_MS,
  WoodpeckerArticulated,
  spawnWoodChips,
  type WoodChip,
} from "@/components/ui/woodpecker-articulated";

const PECK_EVERY_PX = 72;
/** Sposta il picchio leggermente sopra il centro del thumb */
const Y_NUDGE_UP = 26;
/** Scala mobile: picchio fisso in basso a destra */
const MOBILE_SCALE = 0.72;
const DESKTOP_MQ = "(min-width: 640px)";

/** Centro verticale del thumb della scrollbar nativa (viewport coords). */
function scrollbarThumbCenterY(): number | null {
  const scrollHeight = document.documentElement.scrollHeight;
  const viewportH = window.innerHeight;
  const maxScroll = scrollHeight - viewportH;
  if (maxScroll <= 1) return null;

  const thumbH = Math.max((viewportH / scrollHeight) * viewportH, 28);
  const travel = Math.max(0, viewportH - thumbH);
  const progress = Math.min(1, Math.max(0, window.scrollY / maxScroll));
  return progress * travel + thumbH / 2;
}

function isPastHero(): boolean {
  const hero = document.getElementById("home");
  if (!hero) return window.scrollY > window.innerHeight * 0.85;
  return hero.getBoundingClientRect().bottom <= 8;
}

/**
 * Picchio allo scroll: su desktop segue il thumb; su mobile fisso in basso a destra.
 */
export function ScrollWoodpecker() {
  const reduceMotion = useReducedMotion();
  const [visible, setVisible] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [pecking, setPecking] = useState(false);
  const [chips, setChips] = useState<WoodChip[]>([]);

  const lastY = useRef(0);
  const accum = useRef(0);
  const peckLock = useRef(false);
  const peckTimer = useRef(0);
  const chipClearTimer = useRef(0);
  const burstId = useRef(0);
  const isDesktopRef = useRef(false);

  const thumbY = useMotionValue(0);
  const thumbYSmooth = useSpring(thumbY, {
    stiffness: 380,
    damping: 36,
    mass: 0.35,
  });

  useEffect(() => {
    if (reduceMotion) return;

    const mq = window.matchMedia(DESKTOP_MQ);
    const syncDesktop = () => {
      isDesktopRef.current = mq.matches;
      setIsDesktop(mq.matches);
    };
    syncDesktop();
    mq.addEventListener("change", syncDesktop);

    lastY.current = window.scrollY;

    const syncThumb = () => {
      const past = isPastHero();
      if (!isDesktopRef.current) {
        const scrollable =
          document.documentElement.scrollHeight > window.innerHeight + 1;
        setVisible(scrollable && past);
        return;
      }

      const center = scrollbarThumbCenterY();
      const show = center != null && past;
      setVisible(show);
      if (center == null) return;
      thumbY.set(center - BIRD_H / 2 - Y_NUDGE_UP);
    };

    const firePeck = () => {
      if (!isPastHero()) return;
      peckLock.current = true;
      setPecking(true);
      burstId.current += 1;
      setChips((prev) => [
        ...prev.slice(-20),
        ...spawnWoodChips(burstId.current),
      ]);

      window.clearTimeout(peckTimer.current);
      window.clearTimeout(chipClearTimer.current);
      peckTimer.current = window.setTimeout(() => {
        setPecking(false);
        peckLock.current = false;
      }, PECK_MS);
      chipClearTimer.current = window.setTimeout(() => {
        setChips([]);
      }, 700);
    };

    const onScroll = () => {
      const y = window.scrollY;
      const delta = Math.abs(y - lastY.current);
      lastY.current = y;

      syncThumb();

      if (!isPastHero() || delta < 0.5) return;

      accum.current += delta;
      if (accum.current < PECK_EVERY_PX || peckLock.current) return;

      accum.current %= PECK_EVERY_PX;
      firePeck();
    };

    syncThumb();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", syncThumb, { passive: true });
    return () => {
      mq.removeEventListener("change", syncDesktop);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", syncThumb);
      window.clearTimeout(peckTimer.current);
      window.clearTimeout(chipClearTimer.current);
    };
  }, [reduceMotion, thumbY]);

  if (reduceMotion) return null;

  return (
    <motion.div
      aria-hidden
      className={
        isDesktop
          ? "pointer-events-none fixed top-0 right-0 z-10 overflow-visible select-none"
          : "pointer-events-none fixed right-2 bottom-3 z-10 origin-bottom-right overflow-visible select-none"
      }
      style={
        isDesktop
          ? {
              y: thumbYSmooth,
              opacity: visible ? 1 : 0,
              width: BIRD_W,
              marginRight: 4,
              x: -12,
              rotate: -12,
            }
          : {
              opacity: visible ? 1 : 0,
              width: BIRD_W,
              scale: MOBILE_SCALE,
              rotate: -12,
            }
      }
    >
      <div className="relative">
        <div className="relative z-10 translate-x-1">
          <WoodpeckerArticulated pecking={pecking} />
        </div>

        <div className="absolute top-10 right-0 z-20 h-0 w-0 overflow-visible">
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
                  x: chip.dx,
                  y: chip.dy,
                  opacity: [0, 1, 1, 0],
                  rotate: chip.rot,
                  scale: [0.6, 1.15, 1, 0.5],
                }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 0.6,
                  delay: chip.delay,
                  ease: [0.2, 0.75, 0.25, 1],
                  times: [0, 0.12, 0.55, 1],
                }}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
