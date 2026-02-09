// ===========================================
// Presence Indicator Component
// Shows online users and their activity status
// ===========================================

import React from 'react';
import { motion } from 'framer-motion';
import { presencePulseVariants } from '../../utils/animations';

export interface PresenceUser {
  id: string;
  name: string;
  avatar?: string;
  lastActive?: Date;
  isOnline?: boolean;
}

export interface PresenceIndicatorProps {
  users: PresenceUser[];
  maxVisible?: number;
  showNames?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const getSizeClasses = (size: 'sm' | 'md' | 'lg') => {
  switch (size) {
    case 'sm':
      return {
        avatar: 'w-6 h-6 text-xs',
        dot: 'w-1.5 h-1.5',
        container: 'gap-1',
      };
    case 'lg':
      return {
        avatar: 'w-10 h-10 text-sm',
        dot: 'w-2.5 h-2.5',
        container: 'gap-2',
      };
    default:
      return {
        avatar: 'w-8 h-8 text-xs',
        dot: 'w-2 h-2',
        container: 'gap-1.5',
      };
  }
};

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const formatLastActive = (date?: Date): string => {
  if (!date) return '';
  
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Upravo sada';
  if (diffMins < 60) return `Prije ${diffMins} min`;
  if (diffHours < 24) return `Prije ${diffHours}h`;
  if (diffDays < 7) return `Prije ${diffDays}d`;
  return date.toLocaleDateString();
};

export function PresenceIndicator({
  users,
  maxVisible = 4,
  showNames = false,
  size = 'md',
}: PresenceIndicatorProps) {
  const sizeClasses = getSizeClasses(size);
  const visibleUsers = users.slice(0, maxVisible);
  const remainingCount = Math.max(0, users.length - maxVisible);

  const onlineUsers = users.filter((u) => u.isOnline);
  const offlineUsers = users.filter((u) => !u.isOnline);

  return (
    <div className="flex items-center">
      {/* Avatar Stack */}
      <div className={`flex items-center ${sizeClasses.container}`}>
        {visibleUsers.map((user, index) => (
          <div
            key={user.id}
            className="relative group"
            style={{ zIndex: visibleUsers.length - index }}
          >
            {/* Avatar */}
            <motion.div
              className={`${sizeClasses.avatar} rounded-full bg-slate-200 flex items-center justify-center font-medium text-slate-600 overflow-hidden border-2 border-white shadow-sm`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{getInitials(user.name)}</span>
              )}
            </motion.div>

            {/* Online Status Dot */}
            {user.isOnline && (
              <motion.div
                className={`absolute -bottom-0.5 -right-0.5 ${sizeClasses.dot} bg-green-500 rounded-full border-2 border-white shadow-sm`}
                variants={presencePulseVariants}
                initial="initial"
                animate="pulse"
              />
            )}

            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
              <div className="font-medium">{user.name}</div>
              {user.lastActive && (
                <div className="text-slate-300 text-[10px]">
                  {formatLastActive(user.lastActive)}
                </div>
              )}
              {!user.isOnline && user.lastActive && (
                <div className="text-slate-400 text-[10px]">
                  Zadnji put: {formatLastActive(user.lastActive)}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Remaining count badge */}
        {remainingCount > 0 && (
          <motion.div
            className={`${sizeClasses.avatar} rounded-full bg-slate-100 flex items-center justify-center font-medium text-slate-500 border-2 border-white shadow-sm`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.1 }}
          >
            +{remainingCount}
          </motion.div>
        )}
      </div>

      {/* Names list */}
      {showNames && (
        <div className="ml-3">
          {visibleUsers.slice(0, 2).map((user, index) => (
            <div
              key={user.id}
              className="text-sm text-slate-600 flex items-center gap-1"
            >
              {user.isOnline && (
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
              )}
              <span className={user.isOnline ? 'font-medium' : 'text-slate-400'}>
                {user.name}
              </span>
              {index < Math.min(visibleUsers.length, 2) - 1 && ', '}
            </div>
          ))}
          {remainingCount > 0 && (
            <div className="text-sm text-slate-400">
              i još {remainingCount} drugih
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Activity Status Badge Component
export interface ActivityStatusProps {
  status: 'active' | 'idle' | 'away' | 'offline';
  lastActive?: Date;
  showLabel?: boolean;
}

export function ActivityStatus({
  status,
  lastActive,
  showLabel = true,
}: ActivityStatusProps) {
  const statusConfig = {
    active: {
      color: 'bg-green-500',
      label: 'Aktivan',
    },
    idle: {
      color: 'bg-yellow-500',
      label: 'Odsutan',
    },
    away: {
      color: 'bg-orange-500',
      label: 'Odsutan',
    },
    offline: {
      color: 'bg-slate-400',
      label: 'Offline',
    },
  };

  const config = statusConfig[status];

  return (
    <div className="flex items-center gap-2">
      <motion.div
        className={`w-2 h-2 rounded-full ${config.color}`}
        variants={presencePulseVariants}
        initial="initial"
        animate={status === 'active' ? 'pulse' : undefined}
      />
      {showLabel && (
        <span className="text-sm text-slate-600">
          {config.label}
          {lastActive && status === 'offline' && (
            <span className="text-slate-400 ml-1">
              ({formatLastActive(lastActive)})
            </span>
          )}
        </span>
      )}
    </div>
  );
}

export default PresenceIndicator;
