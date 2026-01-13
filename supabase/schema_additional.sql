-- ============================================
-- K-Beauty Platform - Additional Schema
-- Messages & Settlements
-- ============================================

-- Messages (Owner <-> Admin communication)
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    shop_id UUID REFERENCES shops(id) ON DELETE CASCADE, -- Optional: link to shop for context
    subject TEXT,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Settlements (정산)
CREATE TABLE settlements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    gross_amount INTEGER NOT NULL, -- 총 매출
    fee_rate DECIMAL(4,2) NOT NULL, -- 수수료율 (예: 10.00%)
    fee_amount INTEGER NOT NULL, -- 수수료 금액
    net_amount INTEGER NOT NULL, -- 정산 금액 (순수익)
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed')),
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_messages_receiver ON messages(receiver_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_created ON messages(created_at DESC);
CREATE INDEX idx_settlements_shop ON settlements(shop_id);
CREATE INDEX idx_settlements_period ON settlements(period_start, period_end);

-- RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE settlements ENABLE ROW LEVEL SECURITY;

-- Messages: Users can see messages they sent or received
CREATE POLICY "Users can view own messages" ON messages
    FOR SELECT USING (sender_id = auth.uid() OR receiver_id = auth.uid());
CREATE POLICY "Users can send messages" ON messages
    FOR INSERT WITH CHECK (sender_id = auth.uid());
CREATE POLICY "Users can mark own received messages as read" ON messages
    FOR UPDATE USING (receiver_id = auth.uid());

-- Settlements: Shop owners can view their own settlements
CREATE POLICY "Owners can view own settlements" ON settlements
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM shops WHERE shops.id = settlements.shop_id AND shops.owner_id = auth.uid())
    );
