import type { Transition } from 'framer-motion';

export const fadeInUp = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 8 },
};

export const baseTransition: Transition = {
  duration: 0.2,
  ease: 'easeOut',
};

export const cardAppear = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { opacity: 1, scale: 1 },
  transition: baseTransition,
};
