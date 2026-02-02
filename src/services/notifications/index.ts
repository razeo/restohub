// ===========================================
// Notification Services Index
// RestoHub v2.0
// ===========================================

// Types
export * from './types';

// FCM Service
export {
  requestFcmPermission,
  getFcmToken,
  sendFcmNotification,
  subscribeToSector,
  unsubscribeFromSector,
  isSubscribedToSector,
  isFcmConfigured,
} from './fcm';

// Supabase Service
export {
  initSupabase,
  getSupabaseClient,
  registerFcmToken,
  unregisterFcmToken,
  subscribeToNotifications,
  unsubscribeFromNotifications,
  getUserSubscriptions,
  getFcmTokensBySector,
  logNotification,
  getNotificationLogs,
  subscribeToRealTimeNotifications,
} from './supabase';

// Telegram Service
export {
  sendTelegramNotification,
  sendTelegramMessage,
  sendTelegramToAllSectors,
  formatTelegramMessage,
  isTelegramConfigured,
} from './telegram';

// Notification Triggers
export {
  notificationTriggers,
  notifyOutOfStock,
  notifyWaste,
  notifyNewShift,
  notifyHandover,
  notifyRoomService,
  notifyDailyMenu,
  notifyAllergens,
  createNotification,
  sendNotification,
} from './trigger';

// Re-export types
export type { 
  NotificationPayload, 
  NotificationType, 
  NotificationSector, 
  NotificationPriority,
  NotificationChannel,
  NotificationSubscription,
  NotificationLog,
} from './types';
