// ===========================================
// Telegram Notification Service
// RestoHub v2.0
// ===========================================

import { NotificationPayload, NotificationSector, PRIORITY_EMOJIS } from './types';

// Telegram bot configuration
const getBotToken = (): string => {
  return import.meta.env.VITE_TELEGRAM_BOT_TOKEN || '';
};

// Get chat ID for sector
const getSectorChatId = (sector: NotificationSector): string | undefined => {
  const chatIds: Record<NotificationSector, string | undefined> = {
    kitchen: import.meta.env.VITE_TELEGRAM_KITCHEN_CHAT_ID,
    service: import.meta.env.VITE_TELEGRAM_SERVICE_CHAT_ID,
    bar: import.meta.env.VITE_TELEGRAM_BAR_CHAT_ID,
    all: import.meta.env.VITE_TELEGRAM_ALL_CHAT_ID,
  };
  return chatIds[sector];
};

// Check if Telegram is configured
export const isTelegramConfigured = (): boolean => {
  return !!(getBotToken() && getSectorChatId('all'));
};

// Format notification for Telegram (HTML)
export const formatTelegramMessage = (payload: NotificationPayload): string => {
  const emoji = PRIORITY_EMOJIS[payload.priority];
  
  let message = `${emoji} <b>${payload.title}</b>\n\n`;
  message += `${payload.body}\n\n`;
  message += `<i>Sent from RestoHub v2.0</i>`;
  
  return message;
};

// Send message to Telegram sector group
export const sendTelegramMessage = async (
  sector: NotificationSector,
  message: string
): Promise<{ success: boolean; error?: string }> => {
  const chatId = getSectorChatId(sector);
  
  if (!chatId) {
    console.warn(`Telegram chat ID not configured for sector: ${sector}`);
    return { success: false, error: `Chat ID not configured for sector: ${sector}` };
  }

  const botToken = getBotToken();
  
  if (!botToken) {
    console.warn('Telegram bot token not configured');
    return { success: false, error: 'Bot token not configured' };
  }

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'HTML',
          disable_web_page_preview: true,
        }),
      }
    );

    const data = await response.json();

    if (!data.ok) {
      return { success: false, error: data.description || 'Failed to send message' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error sending Telegram message:', error);
    return { success: false, error: String(error) };
  }
};

// Send notification to Telegram
export const sendTelegramNotification = async (
  payload: NotificationPayload
): Promise<{ success: boolean; error?: string }> => {
  const message = formatTelegramMessage(payload);
  const sectors: NotificationSector[] = payload.sector === 'all' 
    ? ['kitchen', 'service', 'bar'] 
    : [payload.sector];

  const results = await Promise.all(
    sectors.map(sector => sendTelegramMessage(sector, message))
  );

  const failed = results.filter(r => !r.success);
  
  if (failed.length > 0) {
    return { 
      success: false, 
      error: `Failed to send to ${failed.length}/${sectors.length} sectors` 
    };
  }

  return { success: true };
};

// Send to all sectors
export const sendTelegramToAllSectors = async (
  message: string
): Promise<{ success: boolean; errors: string[] }> => {
  const sectors: NotificationSector[] = ['kitchen', 'service', 'bar'];
  const errors: string[] = [];

  await Promise.all(
    sectors.map(async (sector) => {
      const result = await sendTelegramMessage(sector, message);
      if (!result.success && result.error) {
        errors.push(`${sector}: ${result.error}`);
      }
    })
  );

  return { success: errors.length === 0, errors };
};
