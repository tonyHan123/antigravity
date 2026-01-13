-- ============================================
-- K-Beauty Platform Database Schema
-- Supabase (PostgreSQL)
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUM TYPES
-- ============================================

CREATE TYPE user_role AS ENUM ('user', 'owner', 'admin');
CREATE TYPE shop_status AS ENUM ('pending', 'approved', 'suspended');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');
CREATE TYPE discount_type AS ENUM ('percent', 'fixed');

-- ============================================
-- TABLES
-- ============================================

-- Profiles (extends Supabase auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT,
    phone TEXT,
    role user_role DEFAULT 'user',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shops
CREATE TABLE shops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    name JSONB NOT NULL, -- { en: "Shop Name", jp: "店名", ... }
    category TEXT NOT NULL,
    region JSONB NOT NULL,
    address JSONB NOT NULL,
    description JSONB NOT NULL,
    rating DECIMAL(2,1) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    image_url TEXT,
    images TEXT[] DEFAULT '{}',
    status shop_status DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Services (Menu items for each shop)
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,
    name JSONB NOT NULL,
    duration_min INTEGER NOT NULL,
    price INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Coupons
CREATE TABLE coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    discount_type discount_type NOT NULL,
    discount_value INTEGER NOT NULL,
    min_purchase INTEGER DEFAULT 0,
    valid_until DATE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookings
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,
    service_id UUID REFERENCES services(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    time TEXT NOT NULL,
    status booking_status DEFAULT 'pending',
    total_price INTEGER NOT NULL,
    coupon_id UUID REFERENCES coupons(id) ON DELETE SET NULL,
    discount_amount INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wishlists (User favorites)
CREATE TABLE wishlists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, shop_id)
);

-- User Coupons (Claimed coupons)
CREATE TABLE user_coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    coupon_id UUID REFERENCES coupons(id) ON DELETE CASCADE,
    claimed_at TIMESTAMPTZ DEFAULT NOW(),
    used_at TIMESTAMPTZ,
    UNIQUE(user_id, coupon_id)
);

-- ============================================
-- INDEXES (Performance optimization)
-- ============================================

CREATE INDEX idx_shops_category ON shops(category);
CREATE INDEX idx_shops_status ON shops(status);
CREATE INDEX idx_shops_rating ON shops(rating DESC);
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_shop_id ON bookings(shop_id);
CREATE INDEX idx_bookings_date ON bookings(date);
CREATE INDEX idx_reviews_shop_id ON reviews(shop_id);
CREATE INDEX idx_wishlists_user_id ON wishlists(user_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_coupons ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read all, update own
CREATE POLICY "Profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Shops: Everyone can read approved, owners can manage own
CREATE POLICY "Approved shops are viewable by everyone" ON shops FOR SELECT USING (status = 'approved' OR owner_id = auth.uid());
CREATE POLICY "Owners can insert own shop" ON shops FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Owners can update own shop" ON shops FOR UPDATE USING (owner_id = auth.uid());

-- Services: Everyone can read
CREATE POLICY "Services are viewable by everyone" ON services FOR SELECT USING (true);
CREATE POLICY "Shop owners can manage services" ON services FOR ALL USING (
    EXISTS (SELECT 1 FROM shops WHERE shops.id = services.shop_id AND shops.owner_id = auth.uid())
);

-- Bookings: Users can manage own
CREATE POLICY "Users can view own bookings" ON bookings FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create bookings" ON bookings FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own bookings" ON bookings FOR UPDATE USING (user_id = auth.uid());

-- Reviews: Everyone can read, users can manage own
CREATE POLICY "Reviews are viewable by everyone" ON reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews" ON reviews FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own reviews" ON reviews FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own reviews" ON reviews FOR DELETE USING (user_id = auth.uid());

-- Coupons: Everyone can read active
CREATE POLICY "Active coupons are viewable" ON coupons FOR SELECT USING (is_active = true);
CREATE POLICY "Shop owners can manage coupons" ON coupons FOR ALL USING (
    EXISTS (SELECT 1 FROM shops WHERE shops.id = coupons.shop_id AND shops.owner_id = auth.uid())
);

-- Wishlists: Users can manage own
CREATE POLICY "Users can view own wishlist" ON wishlists FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can manage own wishlist" ON wishlists FOR ALL USING (user_id = auth.uid());

-- User Coupons: Users can manage own
CREATE POLICY "Users can view own coupons" ON user_coupons FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can claim coupons" ON user_coupons FOR INSERT WITH CHECK (user_id = auth.uid());

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, email, name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Update shop rating on review changes
CREATE OR REPLACE FUNCTION update_shop_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE shops SET
        rating = (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE shop_id = COALESCE(NEW.shop_id, OLD.shop_id)),
        review_count = (SELECT COUNT(*) FROM reviews WHERE shop_id = COALESCE(NEW.shop_id, OLD.shop_id)),
        updated_at = NOW()
    WHERE id = COALESCE(NEW.shop_id, OLD.shop_id);
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_review_change
    AFTER INSERT OR UPDATE OR DELETE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_shop_rating();

-- Update shop like count on wishlist changes
CREATE OR REPLACE FUNCTION update_shop_likes()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE shops SET
        like_count = (SELECT COUNT(*) FROM wishlists WHERE shop_id = COALESCE(NEW.shop_id, OLD.shop_id)),
        updated_at = NOW()
    WHERE id = COALESCE(NEW.shop_id, OLD.shop_id);
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_wishlist_change
    AFTER INSERT OR DELETE ON wishlists
    FOR EACH ROW EXECUTE FUNCTION update_shop_likes();
