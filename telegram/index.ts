// Telegram Bot Entry Point
import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';
import { botHandlers } from './bot';
import { startCommand, statusCommand } from './handlers/commands';

// Load environment variables
dotenv.config();

// Get bot token from environment
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

if (!BOT_TOKEN) {
  console.error('❌ TELEGRAM_BOT_TOKEN is not set in environment variables');
  console.error('Please copy .env.example.telegram to .env and add your bot token');
  process.exit(1);
}

// Initialize the bot
const bot = new Telegraf<BotContext>(BOT_TOKEN);

// Store bot instance in context for handlers
bot.context.bot = bot;

// Register command handlers
bot.command('start', startCommand);
bot.command('status', statusCommand);

// Register all notification handlers
botHandlers.forEach((handler) => {
  handler(bot);
});

// Handle errors
bot.catch((err, ctx) => {
  console.error(`❌ Error for ${ctx.updateType}:`, err);
});

// Start the bot
const startBot = async () => {
  try {
    await bot.launch();
    console.log('🤖 Telegram Bot started successfully!');
    console.log('📱 Bot is ready to receive commands and notifications');
  } catch (error) {
    console.error('❌ Failed to start bot:', error);
    process.exit(1);
  }
};

// Graceful shutdown
const stopBot = async () => {
  console.log('🛑 Stopping Telegram Bot...');
  await bot.stop();
  process.exit(0);
};

process.once('SIGINT', stopBot);
process.once('SIGTERM', stopBot);

// Export bot for external use
export { bot, startBot };

// Type definition for Bot Context
interface BotContext {
  bot: Telegraf<BotContext>;
  message?: {
    text: string;
    from: {
      id: number;
      first_name?: string;
      last_name?: string;
      username?: string;
    };
    chat: {
      id: number;
      type: string;
      title?: string;
    };
  };
  updateType: string;
  reply: (text: string, options?: any) => Promise<any>;
  replyWithHTML: (text: string, options?: any) => Promise<any>;
}
