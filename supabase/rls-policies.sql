-- Row-Level Security (RLS) Policies
-- As required by specification section 6

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_points ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view all user profiles" ON public.users
    FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "New users can be created during signup" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Articles table policies  
CREATE POLICY "Anyone can view published articles" ON public.articles
    FOR SELECT USING (status = 'published');

CREATE POLICY "Admins can view all articles" ON public.articles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can create articles" ON public.articles
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can update articles" ON public.articles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can delete articles" ON public.articles
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Votes table policies
CREATE POLICY "Users can view all votes for statistics" ON public.votes
    FOR SELECT USING (true);

CREATE POLICY "Users can create their own votes" ON public.votes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own votes" ON public.votes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can delete votes" ON public.votes
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Comments table policies
CREATE POLICY "Anyone can view comments" ON public.comments
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create comments" ON public.comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" ON public.comments
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" ON public.comments
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Admins can delete any comments" ON public.comments
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- User points table policies
CREATE POLICY "Users can view their own point history" ON public.user_points
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view all point summaries for ranking" ON public.user_points
    FOR SELECT USING (true);

CREATE POLICY "System can create point records" ON public.user_points
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all point records" ON public.user_points
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Policy for admins to delete point records (needed for article deletion)
CREATE POLICY "Admins can delete point records" ON public.user_points
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Create a view for public ranking that doesn't expose sensitive data
CREATE OR REPLACE VIEW public.user_rankings AS
SELECT 
    u.id,
    u.nickname,
    u.avatar_url,
    u.total_points,
    ROW_NUMBER() OVER (ORDER BY u.total_points DESC, u.created_at ASC) as rank
FROM public.users u
WHERE u.total_points > 0
ORDER BY u.total_points DESC, u.created_at ASC
LIMIT 100;

-- Grant access to the view
GRANT SELECT ON public.user_rankings TO authenticated;
GRANT SELECT ON public.user_rankings TO anon;