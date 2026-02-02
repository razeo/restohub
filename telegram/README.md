# RestoHub v2.0 Telegram Bot

Telegram bot infrastructure for Hotel Restaurant operations management.

## 📋 Table of Contents

- [Setup](#setup)
- [Bot Commands](#bot-commands)
- [Group Configuration](#group-configuration)
- [Environment Variables](#environment-variables)
- [Supabase Integration](#supabase-integration)

---

## 🚀 Setup

### 1. Create the Bot via BotFather

1. Open Telegram and search for **@BotFather**
2. Start a chat and send `/newbot`
3. Follow the prompts:
   - **Name**: Hotel Restaurant Bot
   - **Username**: @HotelRestaurantBot (must end with 'bot')
4. BotFather will return your **Bot Token** (save this securely!)
5. Optional: Set a bot picture using `/setuserpic`
6. Optional: Add description using `/setdescription`

### 2. Get Chat IDs for Groups

#### Method 1: Add Bot to Group and Check Updates

1. Add your bot to the required groups:
   - @hotel_restaurant_kitchen
   - @hotel_restaurant_service
   - @hotel_restaurant_bar
   - @hotel_restaurant_all

2. Send a message in each group (e.g., "/start")

3. Check your bot's updates by visiting:
   ```
   https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates
   ```

4. Look for `chat` → `id` in the response (will be negative for groups)

#### Method 2: Use @username_to_id_bot

1. Search for **@username_to_id_bot** on Telegram
2. Send the group username (e.g., @hotel_restaurant_kitchen)
3. The bot will return the chat ID

### 3. Configure Environment Variables

1. Copy the example file:
   ```bash
   cp .env.example.telegram .env
   ```

2. Edit `.env` and add your values:
   ```env
   TELEGRAM_BOT_TOKEN=your_bot_token_here
   TELEGRAM_KITCHEN_CHAT_ID=-1001234567890
   TELEGRAM_SERVICE_CHAT_ID=-1001234567891
   TELEGRAM_BAR_CHAT_ID=-1001234567892
   TELEGRAM_ALL_CHAT_ID=-1001234567893
   ```

---

## 🤖 Bot Commands

### User Commands

| Command | Description |
|---------|-------------|
| `/start` | Initialize the bot and show welcome message |
| `/status` | Get quick operational status update |

### Notification Types

The bot sends notifications for:

- **Out of Stock** - Kitchen stock alerts
- **Waste List** - Waste reporting and tracking
- **Shift Management** - Shift changes, coverage issues
- **Handover** - Shift handover reports
- **Room Service** - Room service order updates
- **Daily Menu** - Menu updates and specials
- **Allergen Alerts** - Allergen and dietary requirements

---

## 👥 Group Configuration

### Required Groups

| Group Name | Chat ID Variable | Purpose |
|------------|------------------|---------|
| @hotel_restaurant_kitchen | `TELEGRAM_KITCHEN_CHAT_ID` | Kitchen operations, stock alerts |
| @hotel_restaurant_service | `TELEGRAM_SERVICE_CHAT_ID` | Front of house, room service |
| @hotel_restaurant_bar | `TELEGRAM_BAR_CHAT_ID` | Bar operations |
| @hotel_restaurant_all | `TELEGRAM_ALL_CHAT_ID` | All-staff announcements |

### Bot Permissions Required

Ensure your bot has these permissions in each group:

- ✅ Send messages
- ✅ Send media (photos, documents)
- ✅ Use inline keyboards
- ✅ Add web page previews

---

## 🔐 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `TELEGRAM_BOT_TOKEN` | Yes | Your bot token from BotFather |
| `TELEGRAM_KITCHEN_CHAT_ID` | Yes | Chat ID for kitchen group |
| `TELEGRAM_SERVICE_CHAT_ID` | Yes | Chat ID for service group |
| `TELEGRAM_BAR_CHAT_ID` | Yes | Chat ID for bar group |
| `TELEGRAM_ALL_CHAT_ID` | Yes | Chat ID for all-staff group |

---

## 🗄️ Supabase Integration

This bot is designed to integrate with Supabase for Faza 1 completion.

### Planned Features

- Store notification history
- User authentication and authorization
- Shift scheduling database
- Inventory tracking
- Menu management

### Integration Status

```
Status: Ready for integration
Supabase client: To be configured
Database schema: Pending creation
```

---

## 📁 File Structure

```
telegram/
├── index.ts           # Bot entry point
├── bot.ts             # Main bot configuration
├── keyboard.ts        # Reply/inline keyboards
├── handlers/
│   ├── commands.ts    # /start, /status commands
│   ├── outofstock.ts  # Stock alert handlers
│   ├── wastelist.ts   # Waste reporting handlers
│   ├── shift.ts       # Shift management handlers
│   ├── handover.ts    # Handover report handlers
│   ├── roomservice.ts # Room service handlers
│   ├── daily_menu.ts  # Menu update handlers
│   └── allergen.ts    # Allergen alert handlers
└── README.md          # This file
```

---

## 🧪 Testing

### Test Bot in Development

```bash
# Install dependencies
npm install telegraf dotenv

# Run in development mode
npx ts-node telegram/index.ts
```

### Verify Bot is Running

1. Open Telegram and search for your bot
2. Send `/start`
3. You should receive the welcome message

---

## 🛠️ Troubleshooting

### Bot not responding?

1. Check bot token is correct in `.env`
2. Verify bot is added to all groups
3. Check bot has necessary permissions

### Not receiving group messages?

1. Ensure bot is admin in the group
2. Check chat ID is negative (groups have negative IDs)
3. Try sending a test message to the group

### Build errors?

1. Ensure TypeScript is configured correctly
2. Check all dependencies are installed
3. Verify tsconfig.json includes telegram folder

---

## 📝 Notes

- All timestamps are in **DD/MM/YYYY HH:mm** format
- Messages support HTML formatting
- Bot is configured for graceful shutdown (SIGINT/SIGTERM)
- Ready for production deployment once Supabase is configured
