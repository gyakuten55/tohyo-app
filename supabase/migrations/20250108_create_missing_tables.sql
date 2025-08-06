-- Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    icon TEXT,
    color TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create short_news table
CREATE TABLE IF NOT EXISTS public.short_news (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    url TEXT,
    source TEXT,
    category TEXT,
    image_url TEXT,
    is_published BOOLEAN DEFAULT false,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create user_referrals table
CREATE TABLE IF NOT EXISTS public.user_referrals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    referred_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    referral_code TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(referrer_id, referred_id)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON public.categories(is_active);
CREATE INDEX IF NOT EXISTS idx_short_news_published ON public.short_news(is_published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_short_news_category ON public.short_news(category);
CREATE INDEX IF NOT EXISTS idx_user_referrals_referrer ON public.user_referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_user_referrals_referred ON public.user_referrals(referred_id);
CREATE INDEX IF NOT EXISTS idx_user_referrals_code ON public.user_referrals(referral_code);

-- Set up Row Level Security (RLS)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.short_news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_referrals ENABLE ROW LEVEL SECURITY;

-- Categories policies (public read, admin write)
CREATE POLICY "Categories are viewable by everyone" ON public.categories
    FOR SELECT USING (true);

-- Short news policies (public read for published, admin write)
CREATE POLICY "Published short news are viewable by everyone" ON public.short_news
    FOR SELECT USING (is_published = true);

-- User referrals policies (users can see their own)
CREATE POLICY "Users can view their own referrals" ON public.user_referrals
    FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

CREATE POLICY "Users can create referrals" ON public.user_referrals
    FOR INSERT WITH CHECK (auth.uid() = referrer_id);

-- Insert default categories
INSERT INTO public.categories (name, slug, icon, color) VALUES
    ('政治', 'politics', 'bank', '#FF6B6B'),
    ('経済', 'economy', 'trending-up', '#4ECDC4'),
    ('国際', 'international', 'globe', '#45B7D1'),
    ('社会', 'society', 'users', '#96CEB4'),
    ('テクノロジー', 'technology', 'cpu', '#9B59B6'),
    ('スポーツ', 'sports', 'activity', '#F39C12'),
    ('エンタメ', 'entertainment', 'tv', '#E74C3C'),
    ('科学', 'science', 'zap', '#3498DB')
ON CONFLICT (slug) DO NOTHING;