// ===========================================
// Notification Types
// RestoHub v2.0
// ===========================================

// All 7 notification types
export type NotificationType =
  | 'lista_86'        // Out of stock
  | 'lista_otpisa'    // Waste
  | 'nova_smjena'     // New shift
  | 'primopredaja'    // Handover
  | 'room_service'    // Room Service
  | 'dnevna_ponuda'   // Daily menu
  | 'alergeni';       // Allergens

// Sectors
export type NotificationSector = 'kitchen' | 'service' | 'bar' | 'all';

// Priority levels
export type NotificationPriority = 'low' | 'normal' | 'high';

// Channels
export type NotificationChannel = 'fcm' | 'telegram' | 'both';

// Notification payload
export interface NotificationPayload {
  type: NotificationType;
  title: string;
  body: string;
  sector: NotificationSector;
  priority: NotificationPriority;
  data?: Record<string, string>;
}

// FCM Token registration
export interface FcmTokenRegistration {
  user_id: string;
  fcm_token: string;
  sector?: NotificationSector;
  created_at?: string;
}

// Subscription
export interface NotificationSubscription {
  id: string;
  user_id: string;
  sector: NotificationSector;
  notification_type: NotificationType;
  channel: NotificationChannel;
  is_active: boolean;
  created_at: string;
}

// Notification log
export interface NotificationLog {
  id: string;
  notification_type: NotificationType;
  sector: NotificationSector;
  priority: NotificationPriority;
  channel: NotificationChannel;
  recipient_count: number;
  message_title: string;
  message_body: string;
  status: 'pending' | 'sent' | 'failed';
  error_message?: string;
  created_at: string;
}

// Telegram user
export interface TelegramUser {
  id: string;
  chat_id: string;
  name: string;
  sector: NotificationSector;
  is_subscribed: boolean;
  created_at: string;
}

// Emoji mapping for notification types
export const NOTIFICATION_EMOJIS: Record<NotificationType, string> = {
  lista_86: '📦',
  lista_otpisa: '🗑️',
  nova_smjena: '🔄',
  primopredaja: '📋',
  room_service: '🛎️',
  dnevna_ponuda: '🍽️',
  alergeni: '⚠️',
};

// Emoji mapping for priority
export const PRIORITY_EMOJIS: Record<NotificationPriority, string> = {
  low: '📌',
  normal: '🔔',
  high: '🚨',
};
