'use client';

import { motion, AnimatePresence, Variants, HTMLMotionProps } from 'motion/react';
import { ReactNode, ButtonHTMLAttributes } from 'react';

// ─── Variant Presets ────────────────────────────────────────────────────────

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.38, ease: [0.16, 1, 0.3, 1] } },
  exit:    { opacity: 0, y: -12, transition: { duration: 0.22, ease: 'easeIn' } },
};

export const fadeInScale: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
  exit:    { opacity: 0, scale: 0.96, transition: { duration: 0.2, ease: 'easeIn' } },
};

export const slideInFromRight: Variants = {
  hidden:  { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.38, ease: [0.16, 1, 0.3, 1] } },
  exit:    { opacity: 0, x: -30, transition: { duration: 0.22, ease: 'easeIn' } },
};

export const slideInFromLeft: Variants = {
  hidden:  { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.38, ease: [0.16, 1, 0.3, 1] } },
  exit:    { opacity: 0, x: 30, transition: { duration: 0.22, ease: 'easeIn' } },
};

export const staggerContainer: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

export const cardHover: Variants = {
  hover: { scale: 1.025, y: -3, transition: { type: 'spring', stiffness: 350, damping: 20 } },
  tap:   { scale: 0.975, transition: { type: 'spring', stiffness: 400, damping: 22 } },
};

export const listItemVariant: Variants = {
  hidden:  { opacity: 0, x: -16 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

// ─── Page Transition Wrapper ──────────────────────────────────────────────────

interface PageTransitionProps {
  children: ReactNode;
  tabKey: string;
  className?: string;
}

export function PageTransition({ children, tabKey, className = '' }: PageTransitionProps) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={tabKey}
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        exit="exit"
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Staggered Container ──────────────────────────────────────────────────────

interface StaggerProps {
  children: ReactNode;
  className?: string;
}

export function StaggerContainer({ children, className = '' }: StaggerProps) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className = '' }: StaggerProps) {
  return (
    <motion.div variants={fadeInUp} className={className}>
      {children}
    </motion.div>
  );
}

// ─── Animated Button ──────────────────────────────────────────────────────────

interface AnimatedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'default' | 'ghost' | 'danger' | 'success';
  ripple?: boolean;
}

export function AnimatedButton({
  children,
  className = '',
  onClick,
  ripple = true,
  disabled,
  ...rest
}: AnimatedButtonProps) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (ripple && !disabled) {
      const btn = e.currentTarget;
      const circle = document.createElement('span');
      const diameter = Math.max(btn.clientWidth, btn.clientHeight);
      const radius = diameter / 2;
      const rect = btn.getBoundingClientRect();

      circle.style.cssText = `
        width: ${diameter}px;
        height: ${diameter}px;
        left: ${e.clientX - rect.left - radius}px;
        top: ${e.clientY - rect.top - radius}px;
        position: absolute;
        border-radius: 50%;
        background: rgba(255,255,255,0.18);
        transform: scale(0);
        animation: ripple-burst 0.55s linear;
        pointer-events: none;
      `;
      btn.style.position = 'relative';
      btn.style.overflow = 'hidden';
      btn.appendChild(circle);
      circle.addEventListener('animationend', () => circle.remove());
    }
    onClick?.(e);
  };

  return (
    <motion.button
      whileTap={{ scale: disabled ? 1 : 0.96 }}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      transition={{ type: 'spring', stiffness: 420, damping: 22 }}
      className={className}
      onClick={handleClick}
      disabled={disabled}
      {...(rest as HTMLMotionProps<'button'>)}
    >
      {children}
    </motion.button>
  );
}

// ─── Hover Card ───────────────────────────────────────────────────────────────

interface HoverCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function HoverCard({ children, className = '', onClick }: HoverCardProps) {
  return (
    <motion.div
      variants={cardHover}
      whileHover="hover"
      whileTap="tap"
      onClick={onClick}
      className={`cursor-pointer ${className}`}
    >
      {children}
    </motion.div>
  );
}

// ─── Notification / Toast Pop ─────────────────────────────────────────────────

export const toastVariant: Variants = {
  hidden:  { opacity: 0, x: 60, scale: 0.9 },
  visible: { opacity: 1, x: 0,  scale: 1, transition: { type: 'spring', stiffness: 300, damping: 25 } },
  exit:    { opacity: 0, x: 60, scale: 0.85, transition: { duration: 0.2 } },
};

// ─── Modal / Drawer Slide ─────────────────────────────────────────────────────

export const drawerVariant: Variants = {
  hidden:  { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 26 } },
  exit:    { opacity: 0, y: 20, transition: { duration: 0.2 } },
};

export const backdropVariant: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit:    { opacity: 0, transition: { duration: 0.18 } },
};

// ─── Animated Counter Number ──────────────────────────────────────────────────

export { motion, AnimatePresence };
export type { Variants };
