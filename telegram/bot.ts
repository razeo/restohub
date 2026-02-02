import { Telegraf } from 'telegraf';
import { handleOutOfStock } from './handlers/outofstock';
import { handleWasteList } from './handlers/wastelist';
import { handleShift } from './handlers/shift';
import { handleHandover } from './handlers/handover';
import { handleRoomService } from './handlers/roomservice';
import { handleDailyMenu } from './handlers/daily_menu';
import { handleAllergen } from './handlers/allergen';

// Import Supabase client (for server-side use)
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase for bot
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabaseBotClient: ReturnType<typeof createClient> | null = null;

const initSupabaseBot = () => {
  if (!supabaseBotClient && supabaseUrl && supabaseServiceKey) {
    supabaseBotClient = createClient(supabaseUrl, supabaseServiceKey);
  }
  return supabaseBotClient;
};

// Get user by Telegram chat ID
export const getUserByChatId = async (chatId: string) => {
  initSupabaseBot();
  if (!supabaseBotClient) return null;

  const { data, error } = await supabaseBotClient
    .from('telegram_users')
    .select('*')
    .eq('chat_id', chatId)
    .single();

  if (error) return null;
  return data;
};

// Register or update Telegram user
export const registerTelegramUser = async (
  chatId: string,
  name: string,
  sector: 'kitchen' | 'service' | 'bar' | 'all'
) => {
  initSupabaseBot();
  if (!supabaseBotClient) return { success: false, error: 'Supabase not configured' };

  const { error } = await supabaseBotClient
    .from('telegram_users')
    .upsert({
      chat_id: chatId,
      name,
      sector,
      is_subscribed: true,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'chat_id',
    });

  if (error) return { success: false, error: error.message };
  return { success: true };
};

// Unsubscribe user
export const unsubscribeTelegramUser = async (chatId: string) => {
  initSupabaseBot();
  if (!supabaseBotClient) return { success: false, error: 'Supabase not configured' };

  const { error } = await supabaseBotClient
    .from('telegram_users')
    .update({ 
      is_subscribed: false,
      updated_at: new Date().toISOString(),
    })
    .eq('chat_id', chatId);

  if (error) return { success: false, error: error.message };
  return { success: true };
};

// Get sector chat ID
const getSectorChatId = (sector: 'kitchen' | 'service' | 'bar' | 'all'): string | undefined => {
  const chatIds: Record<string, string | undefined> = {
    kitchen: process.env.TELEGRAM_KITCHEN_CHAT_ID,
    service: process.env.TELEGRAM_SERVICE_CHAT_ID,
    bar: process.env.TELEGRAM_BAR_CHAT_ID,
    all: process.env.TELEGRAM_ALL_CHAT_ID,
  };
  return chatIds[sector];
};

// Export all handlers for registration
export const botHandlers = [
  handleOutOfStock,
  handleWasteList,
  handleShift,
  handleHandover,
  handleRoomService,
  handleDailyMenu,
  handleAllergen,
];

// Helper function to send messages to specific sectors
export const sendToSector = async (
  bot: Telegraf,
  sector: 'kitchen' | 'service' | 'bar' | 'all',
  message: string,
  options?: any
) => {
  const chatIds: Record<string, string | undefined> = {
    kitchen: process.env.TELEGRAM_KITCHEN_CHAT_ID,
    service: process.env.TELEGRAM_SERVICE_CHAT_ID,
    bar: process.env.TELEGRAM_BAR_CHAT_ID,
    all: process.env.TELEGRAM_ALL_CHAT_ID,
  };

  const chatId = chatIds[sector];
  
  if (!chatId) {
    console.warn(`⚠️ Chat ID not configured for sector: ${sector}`);
    return;
  }

  try {
    await bot.telegram.sendMessage(Number(chatId), message, {
      parse_mode: 'HTML',
      ...options,
    });
    console.log(`✅ Message sent to ${sector} sector`);
  } catch (error) {
    console.error(`❌ Failed to send message to ${sector}:`, error);
  }
};

// Helper to format notification messages
export const formatNotification = (
  title: string,
  details: Record<string, string | number | boolean | undefined>,
  priority: 'low' | 'normal' | 'high' = 'normal'
): string => {
  const emoji: Record<string, string> = {
    low: '📌',
    normal: '🔔',
    high: '🚨',
  };

  let message = `${emoji[priority]} <b>${title}</b>\n\n`;
  
  Object.entries(details).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      message += `• <b>${key}:</b> ${value}\n`;
    }
  });

  message += `\n_<i>Sent from RestoHub v2.0</i>_`;
  
  return message;
};
