import React from 'react';
import { FileText, Users, Calendar, Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: 'file' | 'users' | 'calendar' | 'inbox' | 'custom';
  customIcon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  };
  className?: string;
}

const iconMap = {
  file: FileText,
  users: Users,
  calendar: Calendar,
  inbox: Inbox,
};

export function EmptyState({
  icon = 'inbox',
  customIcon,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  const IconComponent = iconMap[icon] || Inbox;

  return (
    <div 
      className={`flex flex-col items-center justify-center py-12 px-4 ${className}`}
      role="region"
      aria-label={title}
    >
      {/* Icon */}
      <div className="mb-4">
        {customIcon ? (
          <div className="text-slate-300">
            {customIcon}
          </div>
        ) : (
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
            <IconComponent size={32} className="text-slate-300" />
          </div>
        )}
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-slate-700 mb-2">
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className="text-slate-500 text-center max-w-sm mb-6">
          {description}
        </p>
      )}

      {/* Action button */}
      {action && (
        <button
          onClick={action.onClick}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            action.variant === 'secondary'
              ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

// Compact empty state for inline use
export function EmptyStateInline({
  title,
  className = '',
}: {
  title: string;
  className?: string;
}) {
  return (
    <div 
      className={`flex items-center justify-center py-8 text-slate-400 ${className}`}
      role="status"
    >
      <Inbox size={20} className="mr-2" />
      <span>{title}</span>
    </div>
  );
}

export default EmptyState;
