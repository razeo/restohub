import React from 'react';

interface SkeletonLoaderProps {
  variant?: 'text' | 'card' | 'table-row' | 'avatar' | 'paragraph';
  count?: number;
  className?: string;
}

// Base skeleton pulse animation
const skeletonPulse = 'animate-pulse bg-slate-200';

// Text skeleton - single line
export function SkeletonText({ className = '' }: { className?: string }) {
  return (
    <div className={`${skeletonPulse} h-4 rounded ${className}`} />
  );
}

// Paragraph skeleton - multiple lines
export function SkeletonParagraph({ 
  lines = 3, 
  className = '' 
}: { 
  lines?: number; 
  className?: string;
}) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div 
          key={i} 
          className={`${skeletonPulse} h-4 rounded`}
          style={{ width: i === lines - 1 ? '60%' : '100%' }}
        />
      ))}
    </div>
  );
}

// Avatar skeleton - circle
export function SkeletonAvatar({ 
  size = 'md',
  className = '' 
}: { 
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };
  
  return (
    <div className={`${skeletonPulse} rounded-full ${sizeClasses[size]} ${className}`} />
  );
}

// Card skeleton - rectangular shape with placeholder content
export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-slate-200 p-6 ${className}`}>
      {/* Header with avatar */}
      <div className="flex items-center gap-4 mb-4">
        <SkeletonAvatar size="md" />
        <div className="flex-1 space-y-2">
          <SkeletonText className="w-1/3" />
          <SkeletonText className="w-1/4" />
        </div>
      </div>
      {/* Content lines */}
      <div className="space-y-2">
        <SkeletonText />
        <SkeletonText className="w-5/6" />
        <SkeletonText className="w-4/6" />
      </div>
    </div>
  );
}

// Table row skeleton
export function SkeletonTableRow({ 
  columns = 4,
  className = '' 
}: { 
  columns?: number;
  className?: string;
}) {
  return (
    <tr className={className}>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className={`${skeletonPulse} h-4 rounded`} style={{ width: i === 0 ? '30%' : i === columns - 1 ? '15%' : '20%' }} />
        </td>
      ))}
    </tr>
  );
}

// Table skeleton - full table structure
export function SkeletonTable({ 
  rows = 5,
  columns = 4,
  className = '' 
}: { 
  rows?: number; 
  columns?: number;
  className?: string;
}) {
  return (
    <div className={`bg-white rounded-xl shadow-sm overflow-hidden ${className}`}>
      <table className="w-full">
        <thead className="bg-slate-50">
          <tr>
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className="px-4 py-3 text-left">
                <div className={`${skeletonPulse} h-4 rounded w-20`} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex} className="border-t border-slate-100">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <td key={colIndex} className="px-4 py-3">
                  <div className={`${skeletonPulse} h-4 rounded`} 
                    style={{ 
                      width: colIndex === 0 ? '30%' : 
                             colIndex === columns - 1 ? '10%' : 
                             '20%' 
                    }} 
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// List skeleton - vertical list of items
export function SkeletonList({ 
  items = 5,
  className = '' 
}: { 
  items?: number;
  className?: string;
}) {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: items }).map((_, i) => (
        <div 
          key={i} 
          className="bg-white rounded-xl shadow-sm border border-slate-200 p-4"
        >
          <div className="flex items-center gap-3">
            <SkeletonAvatar size="sm" />
            <div className="flex-1 space-y-2">
              <SkeletonText className="w-1/3" />
              <SkeletonText className="w-1/4" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Grid skeleton - grid of cards
export function SkeletonGrid({ 
  items = 4,
  columns = 2,
  className = '' 
}: { 
  items?: number; 
  columns?: number;
  className?: string;
}) {
  return (
    <div 
      className={`grid gap-4 ${className}`}
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {Array.from({ length: items }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

// Form skeleton - form field placeholders
export function SkeletonFormField({ className = '' }: { className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      <div className={`${skeletonPulse} h-4 rounded w-1/4`} />
      <div className={`${skeletonPulse} h-10 rounded-lg`} />
    </div>
  );
}

// Full page skeleton loader
export function PageSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Page header */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-3">
            <SkeletonText className="w-48 h-8" />
            <SkeletonText className="w-32" />
          </div>
          <SkeletonAvatar size="lg" />
        </div>
      </div>
      
      {/* Content area */}
      <SkeletonTable rows={6} columns={4} />
    </div>
  );
}

// Compact inline skeleton
export function InlineSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <SkeletonAvatar size="sm" />
      <SkeletonText className="flex-1" />
    </div>
  );
}

// Main component with common skeleton types
interface SkeletonLoaderComponentProps {
  variant: 'text' | 'card' | 'table-row' | 'avatar' | 'paragraph' | 'table' | 'list' | 'grid' | 'form' | 'page' | 'inline';
  count?: number;
  className?: string;
  lines?: number;
  rows?: number;
  columns?: number;
  items?: number;
  size?: 'sm' | 'md' | 'lg';
}

export function SkeletonLoader({
  variant,
  count = 1,
  className = '',
  lines,
  rows,
  columns,
  items,
  size,
}: SkeletonLoaderComponentProps) {
  const renderSkeleton = () => {
    switch (variant) {
      case 'text':
        return <SkeletonText className={className} />;
      case 'card':
        return <SkeletonCard className={className} />;
      case 'table-row':
        return <SkeletonTableRow columns={columns} className={className} />;
      case 'avatar':
        return <SkeletonAvatar size={size} className={className} />;
      case 'paragraph':
        return <SkeletonParagraph lines={lines} className={className} />;
      case 'table':
        return <SkeletonTable rows={rows} columns={columns} className={className} />;
      case 'list':
        return <SkeletonList items={items} className={className} />;
      case 'grid':
        return <SkeletonGrid items={items} columns={columns} className={className} />;
      case 'form':
        return <SkeletonFormField className={className} />;
      case 'page':
        return <PageSkeleton className={className} />;
      case 'inline':
        return <InlineSkeleton className={className} />;
      default:
        return <SkeletonText className={className} />;
    }
  };

  if (count === 1) {
    return renderSkeleton();
  }

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>{renderSkeleton()}</div>
      ))}
    </>
  );
}

export default SkeletonLoader;
