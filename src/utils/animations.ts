// ===========================================
// Animation Variants for RestoHub
// Framer Motion animation configurations
// ===========================================

import { Variants } from 'framer-motion';

// Check for reduced motion preference
const prefersReducedMotion = typeof window !== 'undefined' 
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
  : false;

// Base duration for animations
export const BASE_DURATION = 0.3;
export const SPRING_CONFIG = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
};

// Page transition variants
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: BASE_DURATION,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: BASE_DURATION,
      ease: 'easeIn',
    },
  },
};

// Slide variants
export const slideVariants: Variants = {
  initial: {
    opacity: 0,
    x: -50,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      ...SPRING_CONFIG,
    },
  },
  exit: {
    opacity: 0,
    x: 50,
    transition: {
      duration: BASE_DURATION * 0.7,
    },
  },
};

// Fade variants
export const fadeVariants: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: BASE_DURATION,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: BASE_DURATION * 0.5,
    },
  },
};

// Scale variants for modals
export const scaleVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.9,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: BASE_DURATION,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: BASE_DURATION * 0.6,
    },
  },
};

// List item animation variants
export const listItemVariants: Variants = {
  initial: {
    opacity: 0,
    y: -10,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: BASE_DURATION * 0.7,
    },
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: {
      duration: BASE_DURATION * 0.5,
    },
  },
};

// Stagger container variants
export const staggerContainerVariants: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
    },
  },
  exit: {},
};

// Stagger item variants
export const staggerItemVariants: Variants = {
  initial: {
    opacity: 0,
    y: 10,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: BASE_DURATION,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: BASE_DURATION * 0.4,
    },
  },
};

// Toast variants
export const toastVariants: Variants = {
  initial: {
    opacity: 0,
    y: -50,
    scale: 0.9,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: BASE_DURATION,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.9,
    transition: {
      duration: BASE_DURATION * 0.5,
    },
  },
};

// Hover and tap variants for buttons
export const buttonHoverVariants: Variants = {
  initial: {
    scale: 1,
  },
  hover: {
    scale: 1.02,
    transition: {
      duration: 0.15,
    },
  },
  tap: {
    scale: 0.95,
    transition: {
      duration: 0.1,
    },
  },
};

// Input focus animation
export const inputFocusVariants: Variants = {
  initial: {
    scale: 1,
    borderColor: '#e2e8f0',
  },
  focus: {
    scale: 1.01,
    borderColor: '#3b82f6',
    boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
    transition: {
      duration: 0.2,
    },
  },
};

// Toggle switch variants
export const toggleVariants: Variants = {
  off: {
    backgroundColor: '#e2e8f0',
    transition: {
      duration: 0.2,
    },
  },
  on: {
    backgroundColor: '#22c55e',
    transition: {
      duration: 0.2,
    },
  },
};

export const toggleKnobVariants: Variants = {
  off: {
    x: 0,
    rotate: 0,
  },
  on: {
    x: 20,
    rotate: 0,
    transition: {
      duration: 0.2,
      ease: 'easeInOut',
    },
  },
};

// Checkbox animation
export const checkboxVariants: Variants = {
  unchecked: {
    scale: 1,
    backgroundColor: 'transparent',
    borderColor: '#e2e8f0',
  },
  checked: {
    scale: 1,
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
    transition: {
      duration: 0.2,
    },
  },
};

// Skeleton shimmer animation
export const skeletonVariants: Variants = {
  initial: {
    backgroundPosition: '-200% 0',
  },
  animate: {
    backgroundPosition: '200% 0',
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

// Avatar presence indicator pulse
export const presencePulseVariants: Variants = {
  initial: {
    scale: 1,
    opacity: 1,
  },
  pulse: {
    scale: [1, 1.2, 1],
    opacity: [1, 0.5, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// Modal backdrop variants
export const backdropVariants: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: BASE_DURATION * 0.5,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: BASE_DURATION * 0.3,
    },
  },
};

// Drag and drop ghost variants
export const dragGhostVariants: Variants = {
  drag: {
    scale: 1.05,
    opacity: 0.8,
    rotate: 2,
    transition: {
      duration: 0.1,
    },
  },
};

// Drop zone highlight variants
export const dropZoneVariants: Variants = {
  idle: {
    borderColor: '#e2e8f0',
    backgroundColor: 'transparent',
  },
  active: {
    borderColor: '#3b82f6',
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
    transition: {
      duration: 0.2,
    },
  },
};

// Export animation settings based on reduced motion preference
export const animationSettings = {
  duration: prefersReducedMotion ? 0 : BASE_DURATION,
  ease: prefersReducedMotion ? 'linear' : 'easeOut',
};

// Transition props helper for components
export const getTransitionProps = (customDuration?: number) => ({
  duration: prefersReducedMotion ? 0 : (customDuration || BASE_DURATION),
  ease: prefersReducedMotion ? 'linear' : 'easeOut',
});
