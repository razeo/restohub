import { Telegraf } from 'telegraf';
import { formatNotification, sendToSector } from '../bot';
import { stockStatusKeyboard } from '../keyboard';

/**
 * Handle Out of Stock notifications
 * Sends alerts to Kitchen sector when items are out of stock
 */
export const handleOutOfStock = (bot: Telegraf) => {
  bot.action('stock_low', async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.replyWithHTML(
      '<b>📉 Low Stock Report</b>\n\nPlease provide:\n• Item name\n• Quantity remaining\n• Supplier\n• Expected restock',
      stockStatusKeyboard
    );
  });

  bot.action('stock_out', async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.replyWithHTML(
      '<b>🚫 Out of Stock Report</b>\n\nPlease provide:\n• Item name\n• Category\n• Priority (Urgent/Normal)\n• Alternative item (if any)',
      stockStatusKeyboard
    );
  });

  bot.action('stock_restocked', async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.replyWithHTML(
      '<b>✅ Restock Confirmation</b>\n\nPlease provide:\n• Item name\n• Quantity received\n• Expiry date (if applicable)',
      stockStatusKeyboard
    );
  });
};

/**
 * Send out of stock notification to Kitchen sector
 * Ready for Supabase integration - replace placeholder with actual data
 */
export const notifyOutOfStock = async (
  bot: Telegraf,
  itemName: string,
  category: string,
  priority: 'low' | 'normal' | 'high' = 'normal'
) => {
  const message = formatNotification('🚫 OUT OF STOCK ALERT', {
    Item: itemName,
    Category: category,
    Priority: priority.charAt(0).toUpperCase() + priority.slice(1),
    Time: new Date().toLocaleString('en-GB', { 
      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' 
    }),
  }, priority === 'high' ? 'high' : 'normal');

  await sendToSector(bot, 'kitchen', message);
};

/**
 * Send low stock warning to Kitchen sector
 */
export const notifyLowStock = async (
  bot: Telegraf,
  itemName: string,
  quantity: number,
  reorderLevel: number
) => {
  const message = formatNotification('📉 LOW STOCK WARNING', {
    Item: itemName,
    'Current Qty': quantity,
    'Reorder Level': reorderLevel,
    Time: new Date().toLocaleString('en-GB', { 
      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' 
    }),
  }, 'normal');

  await sendToSector(bot, 'kitchen', message);
};

export default { handleOutOfStock, notifyOutOfStock, notifyLowStock };
