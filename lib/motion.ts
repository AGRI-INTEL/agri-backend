'use client';

/**
 * Wrappers framer-motion compatibles React 19.
 * framer-motion@11 infère mal className sur motion.* avec @types/react@19.
 */
import { motion as fm, type MotionProps, type Variants, type Transition, type AnimationProps } from 'framer-motion';
import type { ComponentType } from 'react';

type MotionComponent = ComponentType<MotionProps & Record<string, unknown>>;

export const motion = {
  div: fm.div as MotionComponent,
  aside: fm.aside as MotionComponent,
  article: fm.article as MotionComponent,
  span: fm.span as MotionComponent,
  form: fm.form as MotionComponent,
  header: fm.header as MotionComponent,
  img: fm.img as MotionComponent,
  h1: fm.h1 as MotionComponent,
  h2: fm.h2 as MotionComponent,
  h3: fm.h3 as MotionComponent,
  h4: fm.h4 as MotionComponent,
  h5: fm.h5 as MotionComponent,
  h6: fm.h6 as MotionComponent,
  p: fm.p as MotionComponent,
  button: fm.button as MotionComponent,
  section: fm.section as MotionComponent,
  nav: fm.nav as MotionComponent,
  ul: fm.ul as MotionComponent,
  li: fm.li as MotionComponent,
  label: fm.label as MotionComponent,
};

export type { MotionProps, Variants, Transition, AnimationProps };
export {
  AnimatePresence,
  useInView,
  useMotionValue,
  useSpring,
  animate,
} from 'framer-motion';
