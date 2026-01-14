-- ============================================
-- K-Beauty Platform - Messaging & Announcements Schema
-- Admin ↔ Owner/User communication system
-- ============================================

-- 1. Admin Announcements (공지 알림)
CREATE TABLE IF NOT EXISTS admin_announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    image_url TEXT,                           -- 첨부 이미지 URL
    target_type VARCHAR(20) NOT NULL,         -- 'all_users', 'all_owners', 'category', 'shop'
    target_category VARCHAR(50),              -- 카테고리 타겟 시 (nail, massage, hair 등)
    target_shop_id UUID REFERENCES shops(id) ON DELETE SET NULL,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Messages (1:1 채팅) - 기존 테이블이 있으면 컬럼 추가
DO $$
BEGIN
    -- Check if messages table exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'messages') THEN
        -- Create new table
        CREATE TABLE messages (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            conversation_id UUID NOT NULL,
            sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
            receiver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
            shop_id UUID REFERENCES shops(id) ON DELETE SET NULL,
            content TEXT NOT NULL,
            image_url TEXT,
            is_read BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMPTZ DEFAULT NOW()
        );
    ELSE
        -- Add missing columns to existing table
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'conversation_id') THEN
            ALTER TABLE messages ADD COLUMN conversation_id UUID;
            -- Generate conversation_id for existing rows
            UPDATE messages SET conversation_id = uuid_generate_v5(uuid_nil(), 
                CASE WHEN sender_id < receiver_id 
                    THEN sender_id::text || '-' || receiver_id::text 
                    ELSE receiver_id::text || '-' || sender_id::text 
                END
            ) WHERE conversation_id IS NULL;
            -- Make it NOT NULL after populating
            ALTER TABLE messages ALTER COLUMN conversation_id SET NOT NULL;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'image_url') THEN
            ALTER TABLE messages ADD COLUMN image_url TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'is_read') THEN
            ALTER TABLE messages ADD COLUMN is_read BOOLEAN DEFAULT FALSE;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'shop_id') THEN
            ALTER TABLE messages ADD COLUMN shop_id UUID REFERENCES shops(id) ON DELETE SET NULL;
        END IF;
    END IF;
END $$;

-- 3. Extend notifications table for announcements
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'notifications' AND column_name = 'announcement_id') THEN
        ALTER TABLE notifications ADD COLUMN announcement_id UUID REFERENCES admin_announcements(id) ON DELETE SET NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'notifications' AND column_name = 'image_url') THEN
        ALTER TABLE notifications ADD COLUMN image_url TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'notifications' AND column_name = 'sender_name') THEN
        ALTER TABLE notifications ADD COLUMN sender_name VARCHAR(100);
    END IF;
END $$;

-- ============================================
-- Indexes for performance (IF NOT EXISTS)
-- ============================================
CREATE INDEX IF NOT EXISTS idx_announcements_target ON admin_announcements(target_type);
CREATE INDEX IF NOT EXISTS idx_announcements_created ON admin_announcements(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at DESC);

-- ============================================
-- Enable RLS
-- ============================================
ALTER TABLE admin_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS Policies - Admin Announcements (DROP IF EXISTS first)
-- ============================================
DROP POLICY IF EXISTS "Anyone can view announcements" ON admin_announcements;
CREATE POLICY "Anyone can view announcements"
    ON admin_announcements FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Admins can manage announcements" ON admin_announcements;
CREATE POLICY "Admins can manage announcements"
    ON admin_announcements FOR ALL
    USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    )
    WITH CHECK (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

DROP POLICY IF EXISTS "Service role full access announcements" ON admin_announcements;
CREATE POLICY "Service role full access announcements"
    ON admin_announcements FOR ALL
    USING (true)
    WITH CHECK (true);

-- ============================================
-- RLS Policies - Messages (DROP IF EXISTS first)
-- ============================================
DROP POLICY IF EXISTS "Users can view own messages" ON messages;
CREATE POLICY "Users can view own messages"
    ON messages FOR SELECT
    USING (sender_id = auth.uid() OR receiver_id = auth.uid());

DROP POLICY IF EXISTS "Users can send messages" ON messages;
CREATE POLICY "Users can send messages"
    ON messages FOR INSERT
    WITH CHECK (sender_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own read status" ON messages;
CREATE POLICY "Users can update own read status"
    ON messages FOR UPDATE
    USING (receiver_id = auth.uid())
    WITH CHECK (receiver_id = auth.uid());

DROP POLICY IF EXISTS "Service role full access messages" ON messages;
CREATE POLICY "Service role full access messages"
    ON messages FOR ALL
    USING (true)
    WITH CHECK (true);

-- ============================================
-- Enable Realtime for messages (ignore error if already added)
-- ============================================
DO $$
BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE messages;
    EXCEPTION WHEN duplicate_object THEN
        -- Table already in publication, ignore
        NULL;
    END;
END $$;

-- ============================================
-- Helper function: Generate conversation_id
-- ============================================
CREATE OR REPLACE FUNCTION generate_conversation_id(user1 UUID, user2 UUID)
RETURNS UUID AS $$
BEGIN
    IF user1 < user2 THEN
        RETURN uuid_generate_v5(uuid_nil(), user1::text || '-' || user2::text);
    ELSE
        RETURN uuid_generate_v5(uuid_nil(), user2::text || '-' || user1::text);
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
