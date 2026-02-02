// ===========================================
// Unified Notification Trigger System
// RestoHub v2.0
// ===========================================

import { 
  NotificationPayload, 
  NotificationType, 
  NotificationSector, 
  NotificationPriority,
  NotificationChannel,
  NOTIFICATION_EMOJIS 
} from './types';
import { sendFcmNotification } from './fcm';
import { sendTelegramNotification } from './telegram';
import { 
  logNotification, 
  getFcmTokensBySector 
} from './supabase';

// Default notification templates
const NOTIFICATION_TEMPLATES: Record<NotificationType, { title: string; defaultBody: string }> = {
  lista_86: {
    title: 'Lista 86 - Nema na stanju',
    defaultBody: 'Artikal je označen kao nema na stanju.',
  },
  lista_otpisa: {
    title: 'Lista otpisa',
    defaultBody: 'Artikal je dodan na listu otpisa.',
  },
  nova_smjena: {
    title: 'Nova smjena',
    defaultBody: 'Nova smjena je kreirana.',
  },
  primopredaja: {
    title: 'Primopredaja',
    defaultBody: 'Nova primopredaja je zabilježena.',
  },
  room_service: {
    title: 'Room Service',
    defaultBody: 'Nova Room Service narudžba.',
  },
  dnevna_ponuda: {
    title: 'Dnevna ponuda',
    defaultBody: 'Dnevna ponuda je ažurirana.',
  },
  alergeni: {
    title: 'Alergeni',
    defaultBody: 'Informacije o alergenima su ažurirane.',
  },
};

// Create notification payload
export const createNotification = (
  type: NotificationType,
  sector: NotificationSector,
  body: string,
  priority: NotificationPriority = 'normal',
  data?: Record<string, string>
): NotificationPayload => {
  const template = NOTIFICATION_TEMPLATES[type];
  
  return {
    type,
    title: `${NOTIFICATION_EMOJIS[type]} ${template.title}`,
    body: body || template.defaultBody,
    sector,
    priority,
    data: {
      ...data,
      notificationType: type,
      timestamp: new Date().toISOString(),
    },
  };
};

// Send notification to all configured channels
export const sendNotification = async (
  payload: NotificationPayload,
  channels: NotificationChannel[] = ['both']
): Promise<{ 
  success: boolean; 
  fcm?: { success: boolean; error?: string }; 
  telegram?: { success: boolean; error?: string };
}> => {
  const results: { fcm?: { success: boolean; error?: string }; telegram?: { success: boolean; error?: string } } = {};
  const recipients = { fcm: 0, telegram: 0 };

  // Get FCM tokens for the sector
  const fcmTokens = await getFcmTokensBySector(payload.sector);
  recipients.fcm = fcmTokens.length;

  // Send to FCM
  if ((channels.includes('fcm') || channels.includes('both')) && fcmTokens.length > 0) {
    const fcmResult = await sendFcmNotification(fcmTokens, payload);
    results.fcm = fcmResult;
    
    await logNotification(
      payload.type,
      payload.sector,
      payload.priority,
      'fcm',
      fcmTokens.length,
      payload.title,
      payload.body,
      fcmResult.success ? 'sent' : 'failed',
      fcmResult.error
    );
  }

  // Send to Telegram
  if (channels.includes('telegram') || channels.includes('both')) {
    const telegramResult = await sendTelegramNotification(payload);
    results.telegram = telegramResult;
    
    await logNotification(
      payload.type,
      payload.sector,
      payload.priority,
      'telegram',
      1, // Telegram sends to group, so count as 1 recipient
      payload.title,
      payload.body,
      telegramResult.success ? 'sent' : 'failed',
      telegramResult.error
    );
  }

  const success = (results.fcm?.success || !channels.includes('fcm')) && 
                  (results.telegram?.success || !channels.includes('telegram'));

  return { success, ...results };
};

// Quick notification functions for each type
export const notifyOutOfStock = async (
  item: string,
  reason: string,
  sector: NotificationSector = 'kitchen',
  priority: NotificationPriority = 'normal'
) => {
  const payload = createNotification(
    'lista_86',
    sector,
    `Artikal: ${item}\nRazlog: ${reason}`,
    priority,
    { item, reason }
  );
  return sendNotification(payload);
};

export const notifyWaste = async (
  item: string,
  quantity: string,
  reason: string,
  sector: NotificationSector = 'kitchen',
  priority: NotificationPriority = 'normal'
) => {
  const payload = createNotification(
    'lista_otpisa',
    sector,
    `Artikal: ${item}\nKoličina: ${quantity}\nRazlog: ${reason}`,
    priority,
    { item, quantity, reason }
  );
  return sendNotification(payload);
};

export const notifyNewShift = async (
  shiftLabel: string,
  time: string,
  sector: NotificationSector = 'all',
  priority: NotificationPriority = 'normal'
) => {
  const payload = createNotification(
    'nova_smjena',
    sector,
    `Smjena: ${shiftLabel}\nVrijeme: ${time}`,
    priority,
    { shiftLabel, time }
  );
  return sendNotification(payload);
};

export const notifyHandover = async (
  fromEmployee: string,
  toEmployee: string,
  notes: string,
  sector: NotificationSector = 'all',
  priority: NotificationPriority = 'normal'
) => {
  const payload = createNotification(
    'primopredaja',
    sector,
    `Od: ${fromEmployee}\nZa: ${toEmployee}\nNapomene: ${notes}`,
    priority,
    { fromEmployee, toEmployee, notes }
  );
  return sendNotification(payload);
};

export const notifyRoomService = async (
  orderNumber: string,
  roomNumber: string,
  items: string,
  priority: NotificationPriority = 'normal'
) => {
  const payload = createNotification(
    'room_service',
    'service',
    `Narudžba: ${orderNumber}\nSoba: ${roomNumber}\nStavke: ${items}`,
    priority,
    { orderNumber, roomNumber, items }
  );
  return sendNotification(payload);
};

export const notifyDailyMenu = async (
  menuItems: string,
  sector: NotificationSector = 'all',
  priority: NotificationPriority = 'normal'
) => {
  const payload = createNotification(
    'dnevna_ponuda',
    sector,
    menuItems,
    priority,
    { menuItems }
  );
  return sendNotification(payload);
};

export const notifyAllergens = async (
  allergenInfo: string,
  sector: NotificationSector = 'all',
  priority: NotificationPriority = 'high'
) => {
  const payload = createNotification(
    'alergeni',
    sector,
    allergenInfo,
    priority,
    { allergenInfo }
  );
  return sendNotification(payload);
};

// Export all notification functions
export const notificationTriggers = {
  notifyOutOfStock,
  notifyWaste,
  notifyNewShift,
  notifyHandover,
  notifyRoomService,
  notifyDailyMenu,
  notifyAllergens,
  createNotification,
  sendNotification,
};
