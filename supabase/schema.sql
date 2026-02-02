-- ===========================================
-- RestoHub v2.0 - Supabase Database Schema
-- Complete schema with RLS, indexes, and relationships
-- ===========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===========================================
-- ENUMS
-- ===========================================

CREATE TYPE user_role AS ENUM (
  'SERVER',
  'CHEF',
  'BARTENDER',
  'HOST',
  'MANAGER',
  'DISHWASHER',
  'HEAD_WAITER'
);

CREATE TYPE day_of_week AS ENUM (
  'PONEDJELJAK',  -- Monday
  'UTORAK',       -- Tuesday
  SRIJEDA',       -- Wednesday
  'CETVRTAK',     -- Thursday
  'PETAK',        -- Friday
  'SUBOTA',       -- Saturday
  'NEDJELJA'      -- Sunday
);

CREATE TYPE shift_label AS ENUM (
  'I',  -- First shift (06:00-14:00)
  'II'  -- Second shift (14:00-22:00)
');

CREATE TYPE outofstock_reason AS ENUM (
  'NABAVKA',      -- Supply issue
  'KVALITET',     -- Quality issue
  'PRIPREMA'      -- Preparation issue
');

CREATE TYPE waste_reason AS ENUM (
  'OSTECEN',      -- Damaged
  'ISTEKAO',      -- Expired
  'KVALITET',     -- Quality
  'OSTALO'        -- Other
);

CREATE TYPE notification_type AS ENUM (
  'SUCCESS',
  'ERROR',
  'WARNING',
  'INFO'
);

-- ===========================================
-- SECTORS (Reference Table)
-- ===========================================

CREATE TABLE sectors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO sectors (name, description, sort_order) VALUES
  ('Kuhinja', 'Kitchen - Hot/cold prep, pastry', 1),
  ('Sank', 'Bar - Beverages and service', 2),
  ('Restoran', 'Restaurant - Front of house', 3);

-- ===========================================
-- USERS (Extended Employee Data)
-- ===========================================

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE,
  name VARCHAR(100) NOT NULL,
  role user_role NOT NULL DEFAULT 'SERVER',
  sector_id UUID REFERENCES sectors(id),
  phone VARCHAR(50),
  fcm_token TEXT,
  telegram_chat_id VARCHAR(100),
  availability DAY_OF_WEEK[],
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for users
CREATE INDEX idx_users_sector ON users(sector_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);
CREATE INDEX idx_users_auth ON users(auth_id);

-- ===========================================
-- DUTIES (Smena labels/colors)
-- ===========================================

CREATE TABLE duties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  label VARCHAR(100) NOT NULL,
  color VARCHAR(20) DEFAULT '#3B82F6',
  icon VARCHAR(50),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for duties
CREATE INDEX idx_duties_order ON duties(sort_order);

-- ===========================================
-- SHIFTS (Time slots)
-- ===========================================

CREATE TABLE shifts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  day day_of_week NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  label VARCHAR(100),
  notes TEXT,
  color VARCHAR(20),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for shifts
CREATE INDEX idx_shifts_day ON shifts(day);
CREATE INDEX idx_shifts_time ON shifts(start_time, end_time);

-- ===========================================
-- WEEKS (Week definitions)
-- ===========================================

CREATE TABLE weeks (
  id DATE PRIMARY KEY,  -- Monday's date
  week_number INTEGER NOT NULL,
  year INTEGER NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for weeks
CREATE INDEX idx_weeks_year ON weeks(year);

-- ===========================================
-- ASSIGNMENTS (Shift assignments to employees)
-- ===========================================

CREATE TABLE assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shift_id UUID NOT NULL REFERENCES shifts(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  week_id DATE NOT NULL REFERENCES weeks(id) ON DELETE CASCADE,
  special_duty TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(shift_id, employee_id, week_id)
);

-- Indexes for assignments
CREATE INDEX idx_assignments_shift ON assignments(shift_id);
CREATE INDEX idx_assignments_employee ON assignments(employee_id);
CREATE INDEX idx_assignments_week ON assignments(week_id);
CREATE INDEX idx_assignments_employee_week ON assignments(employee_id, week_id);

-- ===========================================
-- SHIFT TEMPLATES
-- ===========================================

CREATE TABLE shift_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- DAILY MENU (Dnevna Ponuda)
-- ===========================================

CREATE TABLE daily_menu (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL UNIQUE,
  couvert TEXT,
  soup_name TEXT,
  soup_extra TEXT,
  main_course_meat TEXT,
  main_course_fish TEXT,
  main_course_vegetarian TEXT,
  desert_sweet TEXT,
  desert_fruit TEXT,
  kitchen_supervisor TEXT,
  restaurant_supervisor TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for daily menu
CREATE INDEX idx_daily_menu_date ON daily_menu(date);

-- ===========================================
-- OUT OF STOCK (Lista 86)
-- ===========================================

CREATE TABLE outofstock (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  sector_id UUID REFERENCES sectors(id),
  responsible VARCHAR(100),
  briefing_done BOOLEAN DEFAULT FALSE,
  foh_informed BOOLEAN DEFAULT FALSE,
  bar_informed BOOLEAN DEFAULT FALSE,
  pos_updated BOOLEAN DEFAULT FALSE,
  notes TEXT,
  kitchen_signature TEXT,
  manager_signature TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE outofstock_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  outofstock_id UUID NOT NULL REFERENCES outofstock(id) ON DELETE CASCADE,
  item VARCHAR(200) NOT NULL,
  reason outofstock_reason NOT NULL DEFAULT 'NABAVKA',
  alternative TEXT,
  time_86 TIME,
  return_time TIME,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for outofstock
CREATE INDEX idx_outofstock_date ON outofstock(date);
CREATE INDEX idx_outofstock_sector ON outofstock(sector_id);
CREATE INDEX idx_outofstock_items_parent ON outofstock_items(outofstock_id);

-- ===========================================
-- SHIFT HANDOVER (Primopredaja smjene)
-- ===========================================

CREATE TABLE shift_handover (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  from_shift shift_label NOT NULL,
  from_manager VARCHAR(100),
  to_manager VARCHAR(100),
  reserved_tables TEXT,
  vip_arrivals TEXT,
  cash_status TEXT,
  report_submitted BOOLEAN DEFAULT FALSE,
  other_docs TEXT,
  missing_items TEXT,
  technical_issues TEXT,
  restock_needed TEXT,
  inventory_checked BOOLEAN DEFAULT FALSE,
  cleanliness_ok BOOLEAN DEFAULT FALSE,
  special_requests TEXT,
  briefing_done BOOLEAN DEFAULT FALSE,
  keys_handed_over BOOLEAN DEFAULT FALSE,
  pos_ok BOOLEAN DEFAULT FALSE,
  hygiene_ok BOOLEAN DEFAULT FALSE,
  from_signature TEXT,
  to_signature TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for shift handover
CREATE INDEX idx_handover_date ON shift_handover(date);

-- ===========================================
-- DAILY REPORT (Izvjestaj Pazara)
-- ===========================================

CREATE TABLE daily_report (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL UNIQUE,
  manager VARCHAR(100),
  
  -- Finance columns
  cash_i_shift DECIMAL(10,2) DEFAULT 0,
  cash_ii_shift DECIMAL(10,2) DEFAULT 0,
  cash_total DECIMAL(10,2) DEFAULT 0,
  cards_i_shift DECIMAL(10,2) DEFAULT 0,
  cards_ii_shift DECIMAL(10,2) DEFAULT 0,
  cards_total DECIMAL(10,2) DEFAULT 0,
  representation_i_shift DECIMAL(10,2) DEFAULT 0,
  representation_ii_shift DECIMAL(10,2) DEFAULT 0,
  representation_total DECIMAL(10,2) DEFAULT 0,
  total_pazar DECIMAL(10,2) DEFAULT 0,
  
  -- Tip payout
  tip_net_amount DECIMAL(10,2) DEFAULT 0,
  tip_receiver VARCHAR(100),
  
  -- Cash control
  x_report DECIMAL(10,2) DEFAULT 0,
  actual_cash DECIMAL(10,2) DEFAULT 0,
  difference DECIMAL(10,2) DEFAULT 0,
  
  -- Signatures
  chef_i_signature VARCHAR(100),
  chef_ii_signature VARCHAR(100),
  management_signature VARCHAR(100),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for daily report
CREATE INDEX idx_daily_report_date ON daily_report(date);

-- ===========================================
-- RESPONSIBILITY PLAN (Plan Odgovornosti)
-- ===========================================

CREATE TABLE responsibility_plan (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  shift shift_label NOT NULL,
  shift_leader VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(date, shift)
);

CREATE TABLE responsibility_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID NOT NULL REFERENCES responsibility_plan(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  section VARCHAR(100) NOT NULL,
  arrival TIME,
  departure TIME,
  side_work TEXT,
  notes TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for responsibility plan
CREATE INDEX idx_resp_plan_date ON responsibility_plan(date);
CREATE INDEX idx_resp_assignments_parent ON responsibility_assignments(plan_id);

-- ===========================================
-- ROOM SERVICE
-- ===========================================

CREATE TABLE room_service (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(date)
);

CREATE TABLE room_service_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_service_id UUID NOT NULL REFERENCES room_service(id) ON DELETE CASCADE,
  room_number VARCHAR(20) NOT NULL,
  order_received TIME,
  call_received_by VARCHAR(100),
  delivery_time TIME,
  delivered_by VARCHAR(100),
  cleaning_time TIME,
  cleaned_by VARCHAR(100),
  notes TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for room service
CREATE INDEX idx_room_service_date ON room_service(date);
CREATE INDEX idx_room_orders_parent ON room_service_orders(room_service_id);

-- ===========================================
-- WASTE LIST (Lista Otpisa)
-- ===========================================

CREATE TABLE waste_list (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  notes TEXT,
  kitchen_signature VARCHAR(100),
  manager_signature VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(date)
);

CREATE TABLE waste_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  waste_list_id UUID NOT NULL REFERENCES waste_list(id) ON DELETE CASCADE,
  item_id VARCHAR(50),
  item_name VARCHAR(200) NOT NULL,
  unit VARCHAR(10) NOT NULL,
  quantity DECIMAL(10,2) DEFAULT 0,
  reason waste_reason NOT NULL DEFAULT 'OSTALO',
  notes TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for waste list
CREATE INDEX idx_waste_list_date ON waste_list(date);
CREATE INDEX idx_waste_items_parent ON waste_items(waste_list_id);

-- ===========================================
-- ALLERGEN NOTES
-- ===========================================

CREATE TABLE allergen_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL UNIQUE,
  notes TEXT,
  selected_allergens TEXT[],  -- Array of allergen codes
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for allergen notes
CREATE INDEX idx_allergen_notes_date ON allergen_notes(date);

-- ===========================================
-- NOTIFICATIONS
-- ===========================================

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type notification_type DEFAULT 'INFO',
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for notifications
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX idx_notifications_created ON notifications(created_at);

-- ===========================================
-- AI RULES (Chat/Settings)
-- ===========================================

CREATE TABLE ai_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rules TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- APP SETTINGS
-- ===========================================

CREATE TABLE app_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4() DEFAULT 'default',
  theme VARCHAR(20) DEFAULT 'system',
  language VARCHAR(10) DEFAULT 'hr',
  date_format VARCHAR(20) DEFAULT 'YYYY-MM-DD',
  time_format VARCHAR(10) DEFAULT '24h',
  auto_save BOOLEAN DEFAULT TRUE,
  notifications BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- EXPORT DATA (For import/export functionality)
-- ===========================================

CREATE TABLE export_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exported_by UUID REFERENCES users(id),
  version VARCHAR(20) NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ===========================================

ALTER TABLE sectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE duties ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE weeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE shift_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_menu ENABLE ROW LEVEL SECURITY;
ALTER TABLE outofstock ENABLE ROW LEVEL SECURITY;
ALTER TABLE outofstock_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE shift_handover ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_report ENABLE ROW LEVEL SECURITY;
ALTER TABLE responsibility_plan ENABLE ROW LEVEL SECURITY;
ALTER TABLE responsibility_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_service ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_service_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE waste_list ENABLE ROW LEVEL SECURITY;
ALTER TABLE waste_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE allergen_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE export_history ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- RLS Policies by Role/Sector
-- ===========================================

-- SECTORS: Public read, authenticated write
CREATE POLICY "Public can read sectors" ON sectors FOR SELECT USING (true);
CREATE POLICY "Admins can modify sectors" ON sectors FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'MANAGER')
);

-- USERS: Users read all, modify own, Managers/Admins modify all
CREATE POLICY "Users can read all" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own" ON users FOR UPDATE USING (
  id = auth.uid() OR 
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'MANAGER')
);
CREATE POLICY "Managers can create users" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Managers can delete users" ON users FOR DELETE USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'MANAGER')
);

-- DUTIES: All authenticated can read, Managers modify
CREATE POLICY "Authenticated can read duties" ON duties FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Managers can modify duties" ON duties FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'MANAGER')
);

-- SHIFTS: All authenticated can read, Managers modify
CREATE POLICY "Authenticated can read shifts" ON shifts FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Managers can modify shifts" ON shifts FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'MANAGER')
);

-- WEEKS: All authenticated read, Managers modify
CREATE POLICY "Authenticated can read weeks" ON weeks FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Managers can modify weeks" ON weeks FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'MANAGER')
);

-- ASSIGNMENTS: 
-- - Users can read their own assignments
-- - Users can read all assignments (for schedule viewing)
-- - Users can update their own
-- - Managers can do everything
CREATE POLICY "Authenticated can read assignments" ON assignments FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update own assignments" ON assignments FOR UPDATE USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'MANAGER')
);
CREATE POLICY "Managers can modify assignments" ON assignments FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'MANAGER')
);

-- SHIFT TEMPLATES: Managers only
CREATE POLICY "Managers can manage templates" ON shift_templates FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'MANAGER')
);

-- DAILY MENU: All authenticated read, Kitchen/Managers modify
CREATE POLICY "Authenticated can read daily menu" ON daily_menu FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Kitchen/Managers can modify daily menu" ON daily_menu FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'MANAGER') OR
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND sector_id IN (SELECT id FROM sectors WHERE name = 'Kuhinja'))
);

-- OUT OF STOCK: Kitchen/Bar/Managers modify
CREATE POLICY "Authenticated can read outofstock" ON outofstock FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Kitchen/Bar/Managers can modify outofstock" ON outofstock FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'MANAGER') OR
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND sector_id IN (SELECT id FROM sectors WHERE name IN ('Kuhinja', 'Sank')))
);

-- SHIFT HANDOVER: Managers and shift leaders
CREATE POLICY "Authenticated can read handover" ON shift_handover FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Managers can modify handover" ON shift_handover FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'MANAGER')
);

-- DAILY REPORT: Managers only
CREATE POLICY "Managers can manage daily report" ON daily_report FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'MANAGER')
);

-- RESPONSIBILITY PLAN: Managers and service staff
CREATE POLICY "Authenticated can read responsibility plan" ON responsibility_plan FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Managers can modify responsibility plan" ON responsibility_plan FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'MANAGER')
);

-- ROOM SERVICE: Service staff and managers
CREATE POLICY "Authenticated can read room service" ON room_service FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Service/Managers can modify room service" ON room_service FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'MANAGER') OR
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND sector_id IN (SELECT id FROM sectors WHERE name IN ('Restoran', 'Sank')))
);

-- WASTE LIST: Kitchen and managers
CREATE POLICY "Authenticated can read waste list" ON waste_list FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Kitchen/Managers can modify waste list" ON waste_list FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'MANAGER') OR
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND sector_id IN (SELECT id FROM sectors WHERE name = 'Kuhinja'))
);

-- ALLERGEN NOTES: All authenticated
CREATE POLICY "Authenticated can read allergen notes" ON allergen_notes FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated can modify allergen notes" ON allergen_notes FOR ALL USING (
  auth.uid() IS NOT NULL
);

-- NOTIFICATIONS: Users read own
CREATE POLICY "Users read own notifications" ON notifications FOR SELECT USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- AI RULES: Managers only
CREATE POLICY "Managers can manage ai rules" ON ai_rules FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'MANAGER')
);

-- APP SETTINGS: Users read own settings
CREATE POLICY "Users read app settings" ON app_settings FOR SELECT USING (true);
CREATE POLICY "Users update app settings" ON app_settings FOR UPDATE USING (true);

-- EXPORT HISTORY: Managers only
CREATE POLICY "Managers can manage exports" ON export_history FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'MANAGER')
);

-- ===========================================
-- FUNCTIONS
-- ===========================================

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update trigger to all tables with updated_at
DO $$
DECLARE
  t TEXT;
BEGIN
  FOR t IN 
    SELECT table_name 
    FROM information_schema.columns 
    WHERE column_name = 'updated_at' 
    AND table_schema = 'public'
  LOOP
    EXECUTE format('CREATE TRIGGER update_%I_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at()', t, t);
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to get current week
CREATE OR REPLACE FUNCTION get_current_week()
RETURNS DATE AS $$
SELECT DATE_TRUNC('week', CURRENT_DATE)::DATE;
$$ LANGUAGE sql;

-- Function to calculate assignment totals by sector
CREATE OR REPLACE FUNCTION get_sector_assignment_counts(week_id DATE)
RETURNS TABLE (sector_name TEXT, count INTEGER) AS $$
SELECT s.name, COUNT(a.id)::INTEGER
FROM sectors s
LEFT JOIN users u ON u.sector_id = s.id
LEFT JOIN assignments a ON a.employee_id = u.id AND a.week_id = get_current_week()
GROUP BY s.name;
$$ LANGUAGE sql;

-- ===========================================
-- VIEWS
-- ===========================================

-- Full schedule view
CREATE VIEW v_full_schedule AS
SELECT 
  w.id AS week_id,
  w.week_number,
  w.year,
  w.start_date,
  w.end_date,
  s.day,
  s.start_time,
  s.end_time,
  s.label AS shift_label,
  u.id AS employee_id,
  u.name AS employee_name,
  u.role AS employee_role,
  sec.name AS sector_name,
  a.special_duty,
  a.notes AS assignment_notes
FROM weeks w
CROSS JOIN shifts s
LEFT JOIN assignments a ON a.week_id = w.id AND a.shift_id = s.id
LEFT JOIN users u ON u.id = a.employee_id
LEFT JOIN sectors sec ON sec.id = u.sector_id
WHERE w.id >= get_current_week() - INTERVAL '2 weeks'
AND w.id <= get_current_week() + INTERVAL '4 weeks';

-- Daily summary view
CREATE VIEW v_daily_summary AS
SELECT 
  dm.date,
  dm.couvert,
  dm.soup_name,
  dm.main_course_meat,
  dm.main_course_fish,
  dm.main_course_vegetarian,
  dm.desert_sweet,
  dm.kitchen_supervisor,
  dm.restaurant_supervisor,
  (SELECT COUNT(*) FROM outofstock oos WHERE oos.date = dm.date) AS outofstock_count,
  (SELECT COUNT(*) FROM waste_list wl WHERE wl.date = dm.date) AS waste_count,
  (SELECT COUNT(*) FROM room_service rs WHERE rs.date = dm.date) AS room_service_count
FROM daily_menu dm;

-- ===========================================
-- SEED DATA (Optional)
-- ===========================================

-- Insert default duties
INSERT INTO duties (label, color, icon, sort_order) VALUES
  ('Standardna', '#3B82F6', 'clock', 1),
  ('Vikend', '#10B981', 'calendar', 2),
  ('Praznik', '#F59E0B', 'star', 3),
  ('Extra', '#EF4444', 'zap', 4);

-- Insert default AI rules
INSERT INTO ai_rules (rules) VALUES 
('Balansiraj smjene između svih zaposlenika. Preferiraj iskusne servere za VIP goste. Osiguraj da svaki sektor ima dovoljno ljudi.');

-- Insert default app settings
INSERT INTO app_settings (id, theme, language, date_format, time_format, auto_save, notifications) VALUES
('default', 'system', 'hr', 'YYYY-MM-DD', '24h', true, true);

-- ===========================================
-- GRANT PERMISSIONS
-- ===========================================

-- Grant usage types
 onGRANT TYPE user_role TO authenticated;
GRANT TYPE day_of_week TO authenticated;
GRANT TYPE shift_label TO authenticated;
GRANT TYPE outofstock_reason TO authenticated;
GRANT TYPE waste_reason TO authenticated;
GRANT TYPE notification_type TO authenticated;

-- Grant permissions to service role (bypass RLS)
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;
