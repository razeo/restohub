import { Telegraf } from 'telegraf';
import { formatNotification, sendToSector } from '../bot';
import { commonActionsKeyboard } from '../keyboard';

/**
 * Handle Handover notifications
 * Manages shift handover communications between teams
 */
export const handleHandover = (bot: Telegraf) => {
  bot.action('handover', async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.replyWithHTML(
      '<b>🚪 Handover Report</b>\n\nPlease provide:\n• Key outstanding tasks\n• Pending orders\n• Special instructions\n• Issues to note',
      commonActionsKeyboard
    );
  });

  bot.action('confirm', async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.replyWithHTML('<b>✅ Handover Confirmed</b>\n\nThe next shift has been notified.');
  });

  bot.action('cancel', async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.replyWithHTML('<b>❌ Handover Cancelled</b>\n\nNo action taken.');
  });
};

/**
 * Send handover notification to all sectors
 */
export const notifyHandover = async (
  bot: Telegraf,
  outgoingShift: string,
  incomingShift: string,
  tasks: string[],
  issues: string[],
  notes?: string
) => {
  let message = `🚪 <b>SHIFT HANDOVER</b>\n\n`;
  message += `<b>From:</b> ${outgoingShift}\n`;
  message += `<b>To:</b> ${incomingShift}\n\n`;
  
  message += `<b>📋 Outstanding Tasks:</b>\n`;
  tasks.forEach((task, index) => {
    message += `${index + 1}. ${task}\n`;
  });

  message += `\n<b>⚠️ Issues to Note:</b>\n`;
  if (issues.length > 0) {
    issues.forEach((issue, index) => {
      message += `${index + 1}. ${issue}\n`;
    });
  } else {
    message += `None\n`;
  }

  if (notes) {
    message += `\n<b>📝 Notes:</b>\n${notes}`;
  }

  message += `\n\n_<i>Sent from RestoHub v2.0</i>_`;

  await sendToSector(bot, 'all', message);
};

/**
 * Send urgent handover alert
 */
export const notifyUrgentHandover = async (
  bot: Telegraf,
  priority: string,
  details: string,
  sector: 'kitchen' | 'service' | 'bar' = 'all'
) => {
  const message = formatNotification(`🚨 URGENT HANDOVER: ${priority}`, {
    Details: details,
    Time: new Date().toLocaleString('en-GB', { 
      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' 
    }),
  }, 'high');

  await sendToSector(bot, sector, message);
};

/**
 * Confirm handover completion
 */
export const confirmHandover = async (bot: Telegraf, shift: string) => {
  const message = formatNotification('✅ HANDOVER COMPLETE', {
    Shift: shift,
    'Confirmed at': new Date().toLocaleString('en-GB', { 
      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' 
    }),
  }, 'normal');

  await sendToSector(bot, 'all', message);
};

export default { handleHandover, notifyHandover, notifyUrgentHandover, confirmHandover };
