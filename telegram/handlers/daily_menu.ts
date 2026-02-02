import { Telegraf } from 'telegraf';
import { formatNotification, sendToSector } from '../bot';

/**
 * Handle Daily Menu notifications
 * Manages daily menu updates and announcements
 */
export const handleDailyMenu = (bot: Telegraf) => {
  bot.action('daily_menu', async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.replyWithHTML(
      '<b>📋 Daily Menu Options</b>\n\nSelect an action:\n• View today\'s menu\n• Update menu items\n• Add daily special\n• Remove unavailable items'
    );
  });
};

/**
 * Send daily menu announcement
 */
export const notifyDailyMenu = async (
  bot: Telegraf,
  date: string,
  menu: {
    starters: string[];
    mains: string[];
    desserts: string[];
    specials: string[];
  }
) => {
  let message = `📅 <b>DAILY MENU - ${date}</b>\n\n`;

  message += `🥗 <b>Starters:</b>\n`;
  menu.starters.forEach((item) => {
    message += `• ${item}\n`;
  });

  message += `\n🍽️ <b>Mains:</b>\n`;
  menu.mains.forEach((item) => {
    message += `• ${item}\n`;
  });

  message += `\n🍰 <b>Desserts:</b>\n`;
  menu.desserts.forEach((item) => {
    message += `• ${item}\n`;
  });

  if (menu.specials.length > 0) {
    message += `\n⭐ <b>Today\'s Specials:</b>\n`;
    menu.specials.forEach((item) => {
      message += `• ${item}\n`;
    });
  }

  message += `\n_<i>Sent from RestoHub v2.0</i>_`;

  await sendToSector(bot, 'all', message);
};

/**
 * Send menu item update notification
 */
export const notifyMenuUpdate = async (
  bot: Telegraf,
  action: 'added' | 'removed' | 'updated',
  category: string,
  itemName: string,
  details?: string
) => {
  const emoji: Record<string, string> = {
    added: '➕',
    removed: '➖',
    updated: '🔄',
  };

  const message = formatNotification(`${emoji[action]} MENU ITEM ${action.toUpperCase()}`, {
    Category: category,
    Item: itemName,
    Details: details || 'N/A',
    Time: new Date().toLocaleString('en-GB', { 
      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' 
    }),
  }, 'normal');

  await sendToSector(bot, 'all', message);
};

/**
 * Send daily special announcement
 */
export const notifyDailySpecial = async (
  bot: Telegraf,
  itemName: string,
  description: string,
  price?: string
) => {
  let message = `⭐ <b>DAILY SPECIAL</b>\n\n`;
  message += `<b>${itemName}</b>\n`;
  message += `${description}\n`;
  
  if (price) {
    message += `\n<b>Price:</b> ${price}`;
  }

  message += `\n\n_<i>Sent from RestoHub v2.0</i>_`;

  await sendToSector(bot, 'all', message);
};

/**
 * Send menu availability update
 */
export const notifyMenuAvailability = async (
  bot: Telegraf,
  unavailableItems: string[],
  reason: 'sold_out' | 'quality' | 'ingredients'
) => {
  const emoji: Record<string, string> = {
    sold_out: '🥀',
    quality: '⚠️',
    ingredients: '📦',
  };

  let message = `🚫 <b>ITEMS UNAVAILABLE</b>\n\n`;
  message += `<b>Reason:</b> ${reason.replace('_', ' ').toUpperCase()}\n\n`;

  unavailableItems.forEach((item, index) => {
    message += `${index + 1}. ${item}\n`;
  });

  message += `\n_<i>Sent from RestoHub v2.0</i>_`;

  await sendToSector(bot, 'all', message);
};

export default { 
  handleDailyMenu, 
  notifyDailyMenu, 
  notifyMenuUpdate, 
  notifyDailySpecial,
  notifyMenuAvailability 
};
