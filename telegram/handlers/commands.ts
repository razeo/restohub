import { Telegraf } from 'telegraf';
import { mainMenuKeyboard } from '../keyboard';

/**
 * Handle /start command for individual users
 */
export const startCommand = async (ctx: any) => {
  const userName = ctx.message.from.first_name || 'Guest';
  
  await ctx.replyWithHTML(
    `👋 <b>Welcome to RestoHub v2.0, ${userName}!</b>\n\n` +
    `I'm your hotel restaurant assistant bot. Here's what I can help you with:\n\n` +
    `📋 <b>Daily Operations</b>\n` +
    `• Menu updates and daily specials\n` +
    `• Stock alerts and inventory tracking\n` +
    `• Waste reporting\n\n` +
    `🔄 <b>Shift Management</b>\n` +
    `• Shift schedules and updates\n` +
    `• Handover reports\n` +
    `• Coverage notifications\n\n` +
    `🍽️ <b>Service</b>\n` +
    `• Room service order tracking\n` +
    `• Dietary requirements and allergens\n\n` +
    `Use the menu below or type /status for a quick update.`,
    mainMenuKeyboard
  );
};

/**
 * Handle /status command for quick updates
 */
export const statusCommand = async (ctx: any) => {
  // This can be extended to pull real data from Supabase
  const now = new Date();
  const time = now.toLocaleString('en-GB', { 
    hour: '2-digit', minute: '2-digit' 
  });
  const day = now.toLocaleDateString('en-GB', { 
    weekday: 'long', day: 'numeric', month: 'short' 
  });

  await ctx.replyWithHTML(
    `📊 <b>RESTOHUB STATUS</b>\n\n` +
    `📅 <b>${day}</b>\n` +
    `🕐 <b>${time}</b>\n\n` +
    `🔔 <b>System Status:</b> Operational\n\n` +
    `<i>Note: Full status updates will be available once Supabase integration is complete.</i>\n\n` +
    `Type /start to see all available commands.`
  );
};

export default { startCommand, statusCommand };
