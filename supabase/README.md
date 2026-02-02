# Supabase Setup - RestoHub v2.0

This folder contains the Supabase infrastructure for RestoHub v2.0, including database schema, migrations, and configuration.

## 📁 Folder Structure

```
supabase/
├── schema.sql           # Complete database schema with all tables, RLS policies
├── .env.example.supabase # Environment variable template
├── README.md            # This file
└── migrations/          # Incremental migration files
    └── 001_initial.sql  # Initial schema (optional)
```

## 🚀 Quick Start

### 1. Create Supabase Project

1. Go to [Supabase](https://supabase.com) and sign up/login
2. Click "New Project"
3. Fill in project details:
   - **Name**: `restohub-v2` (or your preferred name)
   - **Database Password**: Generate a strong password and save it
   - **Region**: Choose closest to your users (e.g., `eu-west-1` for Europe)
4. Click "Create new project"
5. Wait for project initialization (~1 minute)

### 2. Get API Credentials

1. Go to **Project Settings** (⚙️ icon) → **API**
2. Copy the following values:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** → `SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY` (click "Reveal" to see)

### 3. Set Up Environment Variables

```bash
# Copy the example file
cp supabase/.env.example.supabase .env.supabase

# Edit with your credentials
nano .env.supabase
```

### 4. Run Database Schema

#### Option A: SQL Editor (Recommended for initial setup)

1. In Supabase dashboard, go to **SQL Editor**
2. Open `supabase/schema.sql`
3. Copy all contents
4. Paste into SQL Editor
5. Click "Run" to execute

#### Option B: Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-id

# Push schema
supabase db push
```

### 5. Configure Application

Update your `.env.local` or environment configuration:

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 📊 Database Schema Overview

### Core Tables

| Table | Description |
|-------|-------------|
| `users` | Extended employee data with roles, sectors, FCM tokens |
| `sectors` | Service areas (Kitchen, Bar, Restaurant) |
| `shifts` | Time slots (day, start/end time) |
| `assignments` | Employee-shift assignments per week |
| `weeks` | Week definitions for scheduling |

### Operational Tables

| Table | Description |
|-------|-------------|
| `daily_menu` | Daily menu entries (Dnevna ponuda) |
| `outofstock` | Out of stock items (Lista 86) |
| `shift_handover` | Shift handover documentation |
| `daily_report` | Financial reports (Izvještaj pazara) |
| `responsibility_plan` | Daily team assignments |
| `room_service` | Room service order tracking |
| `waste_list` | Waste/spoilage tracking |
| `allergen_notes` | Allergen information and notes |

### Support Tables

| Table | Description |
|-------|-------------|
| `notifications` | In-app and push notifications |
| `ai_rules` | AI assistant rules configuration |
| `app_settings` | Application settings per user |
| `export_history` | Export/import history |

## 🔐 Row Level Security (RLS)

RLS policies are configured to restrict access based on user roles:

| Role | Access Level |
|------|--------------|
| `MANAGER` | Full access to all tables and data |
| `CHEF` | Kitchen-related tables only |
| `BARTENDER` | Bar-related tables only |
| `SERVER` | Read schedule, manage own data |
| `HOST` | Restaurant operations only |
| `DISHWASHER` | Limited operational data |
| `HEAD_WAITER` | Extended restaurant access |

### Key RLS Policies

- **Users can read all data** for schedule viewing
- **Managers can modify all data**
- **Kitchen staff** can modify kitchen-related tables
- **Service staff** can modify restaurant tables
- **Notifications** are private to each user

## 📝 Migrations

### Creating a New Migration

```bash
# Create migration file
touch supabase/migrations/002_add_new_feature.sql
```

### Migration Naming Convention

- Format: `XXX_description.sql`
- Example: `002_add_new_feature.sql`

### Example Migration

```sql
-- Migration: Add new column to users
-- Description: Adds telegram_chat_id to users for notifications

ALTER TABLE users ADD COLUMN telegram_chat_id VARCHAR(100);

-- Update RLS if needed
-- (RLS is usually already set up in schema.sql)

COMMENT ON COLUMN users.telegram_chat_id IS 'Telegram Chat ID for notifications';
```

### Running Migrations

1. Go to Supabase **SQL Editor**
2. Open migration file
3. Run SQL

Or use Supabase CLI:

```bash
supabase db push
```

## 🔔 Push Notifications Setup

### Firebase Cloud Messaging (FCM)

1. Create Firebase project: https://console.firebase.google.com
2. Add Android/iOS app
3. Copy server key for Supabase

### Supabase Dashboard

1. Go to **Project Settings** → **Notifications**
2. Add FCM credentials
3. Test notification

## 📱 Telegram Integration

1. Create Telegram Bot: https://core.telegram.org/bots#creating-a-new-bot
2. Get Bot Token
3. Store in `users.telegram_chat_id`

### Telegram RLS Note

Users must manually link their Telegram account by providing their `chat_id` to the bot.

## 🧪 Testing

### Test Data

Run this SQL to add test data:

```sql
-- Add test manager
INSERT INTO users (id, email, name, role, sector_id)
SELECT 
  gen_random_uuid(),
  'manager@test.com',
  'Test Manager',
  'MANAGER',
  id FROM sectors WHERE name = 'Restoran';

-- Add test employees
INSERT INTO users (email, name, role, sector_id)
SELECT 
  'chef' || i || '@test.com',
  'Chef ' || i,
  'CHEF',
  (SELECT id FROM sectors WHERE name = 'Kuhinja')
FROM generate_series(1, 3) i;
```

### Verify RLS

```sql
-- As anonymous user (should fail for protected tables)
SET LOCAL role TO anon;
SELECT * FROM daily_report;  -- Should return 0 rows or error
```

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Basics](https://www.postgresql.org/docs/)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase JS Client](https://supabase.com/docs/reference/javascript/installing)

## ❓ Troubleshooting

### Connection Issues

1. Check `.env` file has correct values
2. Verify project URL format: `https://xxxxx.supabase.co`
3. Check API keys are not expired

### RLS Issues

1. Check user roles in `users` table
2. Verify `auth_id` is linked to user
3. Test with service_role to bypass RLS

### Performance Issues

1. Check if indexes are created (see schema.sql)
2. Monitor query performance in Supabase Dashboard
3. Consider adding more indexes for frequently queried columns

## 📄 License

This Supabase configuration is part of RestoHub v2.0.
