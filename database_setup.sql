-- 不足しているテーブルを作成するためのSQL

-- 1. short_news テーブルの作成
CREATE TABLE IF NOT EXISTS public.short_news (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    summary TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'published' CHECK (status IN ('published', 'draft', 'archived')),
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. user_referrals テーブルの作成
CREATE TABLE IF NOT EXISTS public.user_referrals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    referrer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    referred_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    referral_code VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(referred_id), -- 一人のユーザーは一回だけ紹介される
    UNIQUE(referral_code)
);

-- 3. categories テーブルの作成（存在しない場合）
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(7), -- HEXカラーコード (#FFFFFF形式)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. article_images ストレージバケットの作成（存在しない場合）
INSERT INTO storage.buckets (id, name, public)
VALUES ('article-images', 'article-images', true)
ON CONFLICT (id) DO NOTHING;

-- 5. RLS (Row Level Security) ポリシーの設定

-- short_news テーブルのRLS
ALTER TABLE public.short_news ENABLE ROW LEVEL SECURITY;

-- 公開されたショートニュースは誰でも読める
CREATE POLICY "Anyone can read published short news" ON public.short_news
    FOR SELECT USING (status = 'published');

-- 管理者はすべてのショートニュースを読める
CREATE POLICY "Admins can read all short news" ON public.short_news
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() AND users.role = 'admin'
        )
    );

-- 管理者はショートニュースを作成・更新・削除できる
CREATE POLICY "Admins can manage short news" ON public.short_news
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() AND users.role = 'admin'
        )
    );

-- user_referrals テーブルのRLS
ALTER TABLE public.user_referrals ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分に関連する紹介情報を読める
CREATE POLICY "Users can read own referrals" ON public.user_referrals
    FOR SELECT USING (
        referrer_id = auth.uid() OR referred_id = auth.uid()
    );

-- ユーザーは紹介コードを作成できる
CREATE POLICY "Users can create referrals" ON public.user_referrals
    FOR INSERT WITH CHECK (referrer_id = auth.uid());

-- categories テーブルのRLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- 誰でもカテゴリを読める
CREATE POLICY "Anyone can read categories" ON public.categories
    FOR SELECT USING (true);

-- 管理者はカテゴリを管理できる
CREATE POLICY "Admins can manage categories" ON public.categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() AND users.role = 'admin'
        )
    );

-- 6. デフォルトカテゴリの挿入
INSERT INTO public.categories (name, description, color) VALUES
    ('スポーツ', 'スポーツ関連のニュース', '#FF6B00'),
    ('政治', '政治関連のニュース', '#004225'),
    ('経済', '経済・ビジネス関連のニュース', '#2C5282'),
    ('テクノロジー', 'IT・テクノロジー関連のニュース', '#7C3AED'),
    ('エンターテイメント', '芸能・エンタメ関連のニュース', '#DC2626'),
    ('社会', '社会問題・地域ニュース', '#059669')
ON CONFLICT (name) DO NOTHING;

-- 7. ストレージポリシーの設定
CREATE POLICY "Anyone can view article images" ON storage.objects
    FOR SELECT USING (bucket_id = 'article-images');

CREATE POLICY "Authenticated users can upload article images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'article-images' AND 
        auth.role() = 'authenticated'
    );

CREATE POLICY "Users can update own uploaded images" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'article-images' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Admins can delete article images" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'article-images' AND 
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() AND users.role = 'admin'
        )
    );

-- 8. articlesテーブルにthumbnail_urlカラムを追加（存在しない場合）
ALTER TABLE public.articles 
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

-- コメント作成
COMMENT ON TABLE public.short_news IS 'ショートニュース記事を格納するテーブル';
COMMENT ON TABLE public.user_referrals IS 'ユーザー紹介情報を格納するテーブル';
COMMENT ON TABLE public.categories IS '記事カテゴリを格納するテーブル';