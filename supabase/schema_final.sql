-- ============================================
-- K-Beauty Platform - Final Schema Updates
-- Shop Management, User Blocking, Business Hours
-- ============================================

-- 1. Add commission_rate to shops
ALTER TABLE shops ADD COLUMN IF NOT EXISTS commission_rate DECIMAL(4,2) DEFAULT 10.00;

-- 2. Add is_blocked to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT false;

-- 3. Business Hours Table (영업시간)
CREATE TABLE IF NOT EXISTS shop_hours (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Sunday, 6=Saturday
    open_time TIME NOT NULL,
    close_time TIME NOT NULL,
    is_closed BOOLEAN DEFAULT false, -- 해당 요일 휴무
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(shop_id, day_of_week)
);

-- 4. Shop Holidays Table (휴무일)
CREATE TABLE IF NOT EXISTS shop_holidays (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,
    holiday_date DATE NOT NULL,
    reason TEXT, -- 휴무 사유 (선택)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(shop_id, holiday_date)
);

-- 5. Blocked Time Slots (예약 불가 시간)
CREATE TABLE IF NOT EXISTS shop_blocked_slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,
    blocked_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_shop_hours_shop ON shop_hours(shop_id);
CREATE INDEX IF NOT EXISTS idx_shop_holidays_shop ON shop_holidays(shop_id);
CREATE INDEX IF NOT EXISTS idx_shop_holidays_date ON shop_holidays(holiday_date);
CREATE INDEX IF NOT EXISTS idx_blocked_slots_shop ON shop_blocked_slots(shop_id);
CREATE INDEX IF NOT EXISTS idx_blocked_slots_date ON shop_blocked_slots(blocked_date);

-- RLS
ALTER TABLE shop_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_blocked_slots ENABLE ROW LEVEL SECURITY;

-- Everyone can read shop hours
CREATE POLICY "Shop hours are public" ON shop_hours FOR SELECT USING (true);
CREATE POLICY "Owners can manage shop hours" ON shop_hours FOR ALL USING (
    EXISTS (SELECT 1 FROM shops WHERE shops.id = shop_hours.shop_id AND shops.owner_id = auth.uid())
);

-- Everyone can read holidays
CREATE POLICY "Shop holidays are public" ON shop_holidays FOR SELECT USING (true);
CREATE POLICY "Owners can manage holidays" ON shop_holidays FOR ALL USING (
    EXISTS (SELECT 1 FROM shops WHERE shops.id = shop_holidays.shop_id AND shops.owner_id = auth.uid())
);
 c:/Users/phdbl/Desktop/antigravity/k-
-- Everyone can read blocked slots
CREATE POLICY "Blocked slots are public" ON shop_blocked_slots FOR SELECT USING (true);
CREATE POLICY "Owners can manage blocked slots" ON shop_blocked_slots FOR ALL USING (
    EXISTS (SELECT 1 FROM shops WHERE shops.id = shop_blocked_slots.shop_id AND shops.owner_id = auth.uid())
);
