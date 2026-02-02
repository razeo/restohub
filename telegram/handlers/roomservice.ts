import { Telegraf } from 'telegraf';
import { formatNotification, sendToSector } from '../bot';
import { roomServiceStatusKeyboard } from '../keyboard';

/**
 * Handle Room Service notifications
 * Manages room service orders and updates
 */
export const handleRoomService = (bot: Telegraf) => {
  bot.action('rs_new', async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.replyWithHTML(
      '<b>🆕 New Room Service Order</b>\n\nPlease provide:\n• Room number\n• Order details\n• Guest preferences\n• Expected delivery time'
    );
  });

  bot.action('rs_progress', async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.replyWithHTML(
      '<b>🔥 Orders In Progress</b>\n\nPlease provide:\n• Room number\n• Current status\n• Estimated completion time'
    );
  });

  bot.action('rs_delivered', async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.replyWithHTML(
      '<b>✅ Order Delivered</b>\n\nPlease provide:\n• Room number\n• Delivery time\n• Guest feedback (if any)'
    );
  });
};

/**
 * Send new room service order notification
 */
export const notifyNewRoomServiceOrder = async (
  bot: Telegraf,
  roomNumber: string,
  orderDetails: string,
  guestName?: string,
  priority: 'normal' | 'vip' | 'urgent' = 'normal'
) => {
  const emoji: Record<string, string> = {
    normal: '🆕',
    vip: '⭐',
    urgent: '🚨',
  };

  const title: Record<string, string> = {
    normal: 'NEW ROOM SERVICE ORDER',
    vip: 'VIP ROOM SERVICE ORDER',
    urgent: 'URGENT ROOM SERVICE ORDER',
  };

  const details: Record<string, string | number | boolean | undefined> = {
    Room: roomNumber,
    Order: orderDetails,
    Time: new Date().toLocaleString('en-GB', { 
      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' 
    }),
  };

  if (guestName) {
    details['Guest'] = guestName;
  }

  const message = formatNotification(`${emoji[priority]} ${title[priority]}`, details, priority === 'urgent' ? 'high' : 'normal');
  await sendToSector(bot, 'service', message);
};

/**
 * Send room service order status update
 */
export const notifyRoomServiceUpdate = async (
  bot: Telegraf,
  roomNumber: string,
  status: 'preparing' | 'ready' | 'delivered' | 'cancelled',
  notes?: string
) => {
  const emoji: Record<string, string> = {
    preparing: '👨‍🍳',
    ready: '✅',
    delivered: '🎉',
    cancelled: '❌',
  };

  const details: Record<string, string | number | boolean | undefined> = {
    Room: roomNumber,
    Status: status.charAt(0).toUpperCase() + status.slice(1),
    Time: new Date().toLocaleString('en-GB', { 
      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' 
    }),
  };

  if (notes) {
    details['Notes'] = notes;
  }

  const message = formatNotification(`${emoji[status]} ORDER ${status.toUpperCase()}`, details, 'normal');
  await sendToSector(bot, 'service', message);
};

/**
 * Send room service summary for a time period
 */
export const notifyRoomServiceSummary = async (
  bot: Telegraf,
  period: string,
  stats: {
    totalOrders: number;
    delivered: number;
    cancelled: number;
    avgDeliveryTime: number;
  }
) => {
  let message = `📊 <b>ROOM SERVICE SUMMARY</b>\n\n`;
  message += `<b>Period:</b> ${period}\n\n`;
  message += `📦 <b>Total Orders:</b> ${stats.totalOrders}\n`;
  message += `✅ <b>Delivered:</b> ${stats.delivered}\n`;
  message += `❌ <b>Cancelled:</b> ${stats.cancelled}\n`;
  message += `⏱️ <b>Avg. Delivery:</b> ${stats.avgDeliveryTime} min\n`;
  message += `\n_<i>Sent from RestoHub v2.0</i>_`;

  await sendToSector(bot, 'service', message);
};

export default { 
  handleRoomService, 
  notifyNewRoomServiceOrder, 
  notifyRoomServiceUpdate, 
  notifyRoomServiceSummary 
};
