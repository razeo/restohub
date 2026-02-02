import { Telegraf } from 'telegraf';
import { formatNotification, sendToSector } from '../bot';
import { shiftTypeKeyboard } from '../keyboard';

/**
 * Handle Shift-related notifications
 * Manages shift assignments, changes, and status updates
 */
export const handleShift = (bot: Telegraf) => {
  bot.action('shift_status', async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.replyWithHTML(
      '<b>🔄 Shift Status</b>\n\nSelect shift to view details or report an issue:',
      shiftTypeKeyboard
    );
  });

  // Shift type selections
  bot.action('shift_morning', async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.replyWithHTML(
      '<b>🌅 Morning Shift (06:00 - 14:00)</b>\n\nCurrent status: Active\n\nPlease report any issues or updates.'
    );
  });

  bot.action('shift_afternoon', async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.replyWithHTML(
      '<b>☀️ Afternoon Shift (14:00 - 22:00)</b>\n\nCurrent status: Active\n\nPlease report any issues or updates.'
    );
  });

  bot.action('shift_evening', async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.replyWithHTML(
      '<b>🌙 Evening Shift (22:00 - 06:00)</b>\n\nCurrent status: Upcoming\n\nPlease report any issues or updates.'
    );
  });
};

/**
 * Notify about shift assignment changes
 */
export const notifyShiftChange = async (
  bot: Telegraf,
  employeeName: string,
  oldShift: string,
  newShift: string,
  sector: 'kitchen' | 'service' | 'bar' | 'all' = 'all'
) => {
  const message = formatNotification('🔄 SHIFT CHANGE', {
    Employee: employeeName,
    'Old Shift': oldShift,
    'New Shift': newShift,
    Time: new Date().toLocaleString('en-GB', { 
      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' 
    }),
  }, 'normal');

  await sendToSector(bot, sector, message);
};

/**
 * Notify about shift coverage issues
 */
export const notifyShiftCoverage = async (
  bot: Telegraf,
  shift: string,
  position: string,
  status: 'short' | 'cancelled' | 'resolved',
  notes?: string
) => {
  const emoji: Record<string, string> = {
    short: '⚠️',
    cancelled: '🚫',
    resolved: '✅',
  };

  const title: Record<string, string> = {
    short: 'SHORT STAFFED',
    cancelled: 'SHIFT CANCELLED',
    resolved: 'COVERAGE RESOLVED',
  };

  const details: Record<string, string | number | boolean | undefined> = {
    Shift: shift,
    Position: position,
    Status: status.charAt(0).toUpperCase() + status.slice(1),
    Time: new Date().toLocaleString('en-GB', { 
      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' 
    }),
  };

  if (notes) {
    details['Notes'] = notes;
  }

  const message = formatNotification(`${emoji[status]} ${title[status]}`, details, status === 'short' ? 'high' : 'normal');
  await sendToSector(bot, 'all', message);
};

/**
 * Notify about shift start/end
 */
export const notifyShiftUpdate = async (
  bot: Telegraf,
  shift: string,
  sector: 'kitchen' | 'service' | 'bar' | 'all',
  action: 'started' | 'ended' | 'extended'
) => {
  const emoji: Record<string, string> = {
    started: '🟢',
    ended: '🔴',
    extended: '🟡',
  };

  const message = formatNotification(`${emoji[action]} ${shift.toUpperCase()} SHIFT ${action.toUpperCase()}`, {
    Sector: sector.charAt(0).toUpperCase() + sector.slice(1),
    Time: new Date().toLocaleString('en-GB', { 
      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' 
    }),
  }, 'normal');

  await sendToSector(bot, sector, message);
};

export default { handleShift, notifyShiftChange, notifyShiftCoverage, notifyShiftUpdate };
