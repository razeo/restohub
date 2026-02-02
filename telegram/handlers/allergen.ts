import { Telegraf } from 'telegraf';
import { formatNotification, sendToSector } from '../bot';
import { allergenSeverityKeyboard } from '../keyboard';

/**
 * Handle Allergen notifications
 * Manages allergen alerts and dietary requirement communications
 */
export const handleAllergen = (bot: Telegraf) => {
  bot.action('allergen_severity', async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.replyWithHTML(
      '<b>⚠️ Allergen Alert</b>\n\nPlease provide:\n• Allergen type\n• Affected dishes\n• Severity level\n• Required action',
      allergenSeverityKeyboard
    );
  });

  bot.action('allergen_mild', async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.replyWithHTML('<b>🟡 Mild Allergen Alert</b>\n\nPlease provide details of the allergen concern.');
  });

  bot.action('allergen_moderate', async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.replyWithHTML('<b>🟠 Moderate Allergen Alert</b>\n\nPlease provide details of the allergen concern.');
  });

  bot.action('allergen_severe', async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.replyWithHTML('<b>🔴 SEVERE ALLERGEN ALERT</b>\n\n⚠️ IMMEDIATE ACTION REQUIRED\n\nPlease provide all relevant details immediately.');
  });
};

/**
 * Send allergen alert to all sectors
 */
export const notifyAllergenAlert = async (
  bot: Telegraf,
  allergenType: string,
  affectedDishes: string[],
  severity: 'mild' | 'moderate' | 'severe',
  action: string
) => {
  const emoji: Record<string, string> = {
    mild: '🟡',
    moderate: '🟠',
    severe: '🔴',
  };

  const details: Record<string, string | number | boolean | undefined> = {
    Allergen: allergenType,
    Severity: severity.charAt(0).toUpperCase() + severity.slice(1),
    'Required Action': action,
    Time: new Date().toLocaleString('en-GB', { 
      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' 
    }),
  };

  let message = `${emoji[severity]} <b>ALLERGEN ALERT</b>\n\n`;
  message += `<b>Allergen:</b> ${allergenType}\n`;
  message += `<b>Severity:</b> ${severity.toUpperCase()}\n\n`;
  
  message += `<b>Affected Dishes:</b>\n`;
  affectedDishes.forEach((dish) => {
    message += `• ${dish}\n`;
  });

  message += `\n<b>Action Required:</b>\n${action}`;
  message += `\n\n_<i>Sent from RestoHub v2.0</i>_`;

  await sendToSector(bot, 'all', message, severity === 'severe' ? { disable_web_page_preview: true } : {});
};

/**
 * Send ingredient substitution notice
 */
export const notifyIngredientSubstitution = async (
  bot: Telegraf,
  originalIngredient: string,
  substitute: string,
  reason: string
) => {
  const message = formatNotification('🔄 INGREDIENT SUBSTITUTION', {
    'Original': originalIngredient,
    'Substitute': substitute,
    Reason: reason,
    Time: new Date().toLocaleString('en-GB', { 
      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' 
    }),
  }, 'normal');

  await sendToSector(bot, 'kitchen', message);
};

/**
 * Send dietary requirement notification
 */
export const notifyDietaryRequirement = async (
  bot: Telegraf,
  tableNumber: string,
  requirement: string,
  guestName?: string
) => {
  const emoji = requirement.toLowerCase().includes('allerg') ? '⚠️' : '📋';
  
  const message = formatNotification(`${emoji} DIETARY REQUIREMENT`, {
    Table: tableNumber,
    Requirement: requirement,
    Time: new Date().toLocaleString('en-GB', { 
      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' 
    }),
  }, 'normal');

  if (guestName) {
    message.replace('Requirement:', `Guest: ${guestName}\nRequirement:`);
  }

  await sendToSector(bot, 'service', message);
};

/**
 * Send allergen training reminder
 */
export const notifyAllergenTrainingReminder = async (
  bot: Telegraf,
  topic: string,
  deadline?: string
) => {
  let message = `📚 <b>ALLERGEN TRAINING REMINDER</b>\n\n`;
  message += `<b>Topic:</b> ${topic}\n`;
  
  if (deadline) {
    message += `<b>Deadline:</b> ${deadline}\n`;
  }

  message += `\n_<i>Sent from RestoHub v2.0</i>_`;

  await sendToSector(bot, 'all', message);
};

export default { 
  handleAllergen, 
  notifyAllergenAlert, 
  notifyIngredientSubstitution, 
  notifyDietaryRequirement,
  notifyAllergenTrainingReminder 
};
