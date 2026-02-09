// ===========================================
// Page Transition Component
// Smooth navigation between pages with loading states
// ===========================================

import React, { Suspense, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { pageVariants, slideVariants, fadeVariants, staggerContainerVariants, staggerItemVariants } from '../../utils/animations';

export type TransitionType = 'fade' | 'slide' | 'scale' | 'none';

export interface PageTransitionProps {
  children: React.ReactNode;
  mode?: 'wait' | 'popLayout' | 'sync';
  transitionType?: TransitionType;
  className?: string;
  preserveScroll?: boolean;
}

const transitionVariants: Record<TransitionType, typeof pageVariants> = {
  fade: pageVariants,
  slide: slideVariants,
  scale: pageVariants,
  none: {
    initial: {},
    animate: {},
    exit: {},
  },
};

export function PageTransition({
  children,
  mode = 'wait',
  transitionType = 'fade',
  className = '',
  preserveScroll = true,
}: PageTransitionProps) {
  const variants = transitionVariants[transitionType];

  // Preserve scroll position on page change
  React.useEffect(() => {
    if (preserveScroll) {
      const scrollPositions = new Map<string, number>();
      
      // Save scroll position before unmount
      const currentPath = window.location.pathname;
      scrollPositions.set(currentPath, window.scrollY);

      return () => {
        // Restore scroll position when returning
        const savedPosition = scrollPositions.get(currentPath);
        if (savedPosition !== undefined) {
          window.scrollTo(0, savedPosition);
        }
      };
    }
  }, [preserveScroll]);

  return (
    <AnimatePresence mode={mode}>
      <motion.div
        key={typeof children === 'string' ? children : 'page'}
        className={className}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        style={{ width: '100%' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// Loading skeleton component
export interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  className?: string;
  animation?: 'pulse' | 'wave' | 'none';
}

export function Skeleton({
  variant = 'text',
  width,
  height,
  className = '',
  animation = 'pulse',
}: SkeletonProps) {
  const baseStyles = 'bg-slate-200';

  const variantStyles = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  const animationStyles = {
    pulse: 'animate-pulse',
    wave: 'skeleton-wave',
    none: '',
  };

  return (
    <motion.div
      className={`${baseStyles} ${variantStyles[variant]} ${animationStyles[animation]} ${className}`}
      animate={animation === 'pulse' ? { opacity: [0.5, 1, 0.5] } : undefined}
      transition={{
        duration: animation === 'pulse' ? 1.5 : undefined,
        repeat: animation === 'pulse' ? Infinity : undefined,
      }}
      style={{
        width: width,
        height: height || (variant === 'text' ? '1em' : undefined),
      }}
    />
  );
}

// Skeleton loader for pages
export interface PageSkeletonProps {
  title?: boolean;
  subtitle?: boolean;
  showHeader?: boolean;
  showContent?: boolean;
  contentLines?: number;
}

export function PageSkeleton({
  title = true,
  subtitle = true,
  showHeader = true,
  showContent = true,
  contentLines = 5,
}: PageSkeletonProps) {
  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-300">
      {showHeader && (
        <div className="space-y-3">
          {title && <Skeleton width="200px" height="32px" />}
          {subtitle && <Skeleton width="300px" height="20px" />}
        </div>
      )}

      {showContent && (
        <motion.div
          className="space-y-4"
          variants={staggerContainerVariants}
          initial="initial"
          animate="animate"
        >
          {Array.from({ length: contentLines }).map((_, i) => (
            <motion.div key={i} variants={staggerItemVariants}>
              <Skeleton
                width="100%"
                height="80px"
                variant="rectangular"
                className="rounded-xl"
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

// Card skeleton
export interface CardSkeletonProps {
  showImage?: boolean;
  imageSize?: number;
  lines?: number;
}

export function CardSkeleton({
  showImage = true,
  imageSize = 48,
  lines = 3,
}: CardSkeletonProps) {
  return (
    <div className="p-4 border border-slate-200 rounded-xl space-y-3">
      <div className="flex items-center gap-3">
        {showImage && (
          <Skeleton width={imageSize} height={imageSize} variant="circular" />
        )}
        <div className="flex-1 space-y-2">
          <Skeleton width="60%" height="16px" />
          <Skeleton width="40%" height="12px" />
        </div>
      </div>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} width="100%" height="12px" />
      ))}
    </div>
  );
}

// Table skeleton
export interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
}

export function TableSkeleton({
  rows = 5,
  columns = 4,
  showHeader = true,
}: TableSkeletonProps) {
  return (
    <div className="space-y-3">
      {showHeader && (
        <div className="flex gap-4 border-b border-slate-200 pb-3">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} width={`${100 / columns}%`} height="20px" />
          ))}
        </div>
      )}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4 py-3 border-b border-slate-100">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} width={`${100 / columns}%`} height="16px" />
          ))}
        </div>
      ))}
    </div>
  );
}

// Loading fallback component
export interface LoadingFallbackProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingFallback({ text = 'Učitavanje...', size = 'md' }: LoadingFallbackProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <motion.div
      className="flex flex-col items-center justify-center p-8 gap-4"
      variants={fadeVariants}
      initial="initial"
      animate="animate"
    >
      <motion.div
        className={`${sizeClasses[size]} border-2 border-slate-200 border-t-blue-500 rounded-full`}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
      {text && (
        <p className="text-sm text-slate-500">{text}</p>
      )}
    </motion.div>
  );
}

// Suspense wrapper with skeleton
export interface SuspenseWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error) => void;
}

export function SuspenseWrapper({
  children,
  fallback,
  onError,
}: SuspenseWrapperProps) {
  return (
    <React.Suspense
      fallback={
        fallback || (
          <LoadingFallback text="Učitavanje komponente..." />
        )
      }
      onError={(error) => {
        console.error('Suspense error:', error);
        onError?.(error as Error);
      }}
    >
      {children}
    </React.Suspense>
  );
}

export default PageTransition;
