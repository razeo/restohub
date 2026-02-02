import { Telegraf } from 'telegraf';
import { formatNotification, sendToSector } from '../bot';
import { wasteReasonKeyboard } from '../keyboard';

/**
 * Handle Waste List notifications
 * Tracks and reports waste items across all sectors
 */
export const handleWasteList = (bot: Telegraf) => {
  bot.action('waste_report', async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.replyWithHTML(
      '<b>🗑️ Waste Report</b>\n\nPlease provide:\n• Item name\n• Quantity wasted\n• Reason for waste\n• Cost estimate (optional)',
      wasteReasonKeyboard
    );
  });

  // Waste reason selections
  bot.action('waste_expired', async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.replyWithHTML('<b>🥀 Expired Items</b>\n\nPlease list expired items with quantities:');
  });

  bot.action('waste_spoiled', async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.replyWithHTML('<b>🍽️ Spoiled Items</b>\n\nPlease list spoiled items with quantities:');
  });

  bot.action('waste_damaged', async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.replyWithHTML('<b>📦 Damaged Items</b>\n\nPlease list damaged items with quantities:');
  });

  bot.action('waste_quality', async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.replyWithHTML('<b>⚠️ Quality Issues</b>\n\nPlease describe the quality issues and affected items:');
  });
};

/**
 * Send waste notification to Kitchen sector
 */
export const notifyWaste = async (
  bot: Telegraf,
  itemName: string,
  quantity: number,
  reason: string,
  estimatedCost?: number
) => {
  const details: Record<string, string | number | boolean | undefined> = {
    Item: itemName,
    Quantity: quantity,
    Reason: reason.charAt(0).toUpperCase() + reason.slice(1),
    Time: new Date().toLocaleString('en-GB', { 
      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' 
    }),
  };

  if (estimatedCost) {
    details['Est. Cost'] = `£${estimatedCost.toFixed(2)}`;
  }

  const message = formatNotification('🗑️ WASTE REPORT', details, 'normal');
  await sendToSector(bot, 'kitchen', message);
};

/**
 * Send daily waste summary to Kitchen sector
 */
export const notifyDailyWasteSummary = async (
  bot: Telegraf,
  items: Array<{ name: string; quantity: number; reason: string; cost?: number }>
) => {
  let message = `📊 <b>DAILY WASTE SUMMARY</b>\n\n`;
  
  let totalCost = 0;
  
  items.forEach((item, index) => {
    message += `${index + 1}. ${item.name} - ${item.quantity}x (${item.reason})\n`;
    if (item.cost) totalCost += item.cost;
  });

  message += `\n<b>Total Items:</b> ${items.length}`;
  if (totalCost > 0) {
    message += `\n<b>Total Estimated Cost:</b> £${totalCost.toFixed(2)}`;
  }
  message += `\n_<i>Sent from RestoHub v2.0</i>_`;

  await sendToSector(bot, 'kitchen', message);
};

export default { handleWasteList, notifyWaste, notifyDailyWasteSummary };
