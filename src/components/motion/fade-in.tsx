"use client";

import {
  motion,
  useReducedMotion,
  type HTMLMotionProps,
} from "motion/react";

export const motionEase = [0.22, 1, 0.36, 1] as const;

/** `amount: "some"` evita che blocchi alti (es. tabelle admin) restino a opacity 0. */
const defaultViewport = { once: true, amount: "some" as const };

type FadeInProps = HTMLMotionProps<"div"> & {
  delay?: number;
  y?: number;
  /** Se false, anima al mount invece che in viewport (utile in overlay/dialog). */
  inView?: boolean;
};

export function FadeIn({
  children,
  className,
  delay = 0,
  y = 12,
  inView = true,
  ...props
}: FadeInProps) {
  const reduceMotion = useReducedMotion();
  const hidden = reduceMotion ? false : { opacity: 0, y };
  const shown = { opacity: 1, y: 0 };
  const transition = {
    duration: 0.8,
    delay: reduceMotion ? 0 : delay,
    ease: motionEase,
  };

  if (inView) {
    return (
      <motion.div
        className={className}
        initial={hidden}
        whileInView={shown}
        viewport={defaultViewport}
        transition={transition}
        {...props}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      className={className}
      initial={hidden}
      animate={shown}
      transition={transition}
      {...props}
    >
      {children}
    </motion.div>
  );
}

type FadeInItemProps = {
  children: React.ReactNode;
  className?: string;
  y?: number;
  /** Elemento root: `li` per liste, `div` di default. */
  as?: "div" | "li";
};

/**
 * Voce staggered: usare dentro `Stagger`.
 * L’ingresso è guidato dalle variants del contenitore.
 */
export function FadeInItem({
  children,
  className,
  y = 8,
  as = "div",
}: FadeInItemProps) {
  const reduceMotion = useReducedMotion();
  const variants = {
    hidden: reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: motionEase },
    },
  };

  if (as === "li") {
    return (
      <motion.li className={className} variants={variants}>
        {children}
      </motion.li>
    );
  }

  return (
    <motion.div className={className} variants={variants}>
      {children}
    </motion.div>
  );
}

type StaggerProps = {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
  as?: "div" | "ul";
};

/** Contenitore che staggerizza i figli `FadeInItem`. */
export function Stagger({
  children,
  className,
  stagger = 0.06,
  as = "div",
}: StaggerProps) {
  const reduceMotion = useReducedMotion();
  const variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: reduceMotion ? 0 : stagger,
      },
    },
  };

  if (as === "ul") {
    return (
      <motion.ul
        className={className}
        initial="hidden"
        whileInView="visible"
        viewport={defaultViewport}
        variants={variants}
      >
        {children}
      </motion.ul>
    );
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={defaultViewport}
      variants={variants}
    >
      {children}
    </motion.div>
  );
}
