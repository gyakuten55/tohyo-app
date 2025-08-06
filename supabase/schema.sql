-- News Voting App Database Schema
-- Based on specification requirements

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'user');
CREATE TYPE article_status AS ENUM ('draft', 'published', 'archived');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    nickname TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    role user_role DEFAULT 'user',
    total_points INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Articles table
CREATE TABLE public.articles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    thumbnail_url TEXT,
    choice_a_text TEXT NOT NULL,
    choice_b_text TEXT NOT NULL,
    choice_a_votes INTEGER DEFAULT 0,
    choice_b_votes INTEGER DEFAULT 0,
    choice_a_odds DECIMAL(5,2) DEFAULT 50.00,
    choice_b_odds DECIMAL(5,2) DEFAULT 50.00,
    status article_status DEFAULT 'draft',
    created_by UUID REFERENCES public.users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Votes table
CREATE TABLE public.votes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) NOT NULL,
    article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE NOT NULL,
    choice TEXT NOT NULL CHECK (choice IN ('a', 'b')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, article_id) -- Prevent duplicate votes
);

-- Comments table  
CREATE TABLE public.comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) NOT NULL,
    article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE NOT NULL,
    parent_id UUID REFERENCES public.comments(id), -- For threaded comments
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User points history table
CREATE TABLE public.user_points (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) NOT NULL,
    points INTEGER NOT NULL,
    source TEXT NOT NULL, -- 'vote', 'bonus', etc.
    article_id UUID REFERENCES public.articles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_articles_status ON public.articles(status);
CREATE INDEX idx_articles_created_at ON public.articles(created_at DESC);
CREATE INDEX idx_votes_article_id ON public.votes(article_id);
CREATE INDEX idx_votes_user_id ON public.votes(user_id);
CREATE INDEX idx_comments_article_id ON public.comments(article_id);
CREATE INDEX idx_comments_parent_id ON public.comments(parent_id);
CREATE INDEX idx_user_points_user_id ON public.user_points(user_id);
CREATE INDEX idx_users_total_points ON public.users(total_points DESC);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp_users BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER set_timestamp_articles BEFORE UPDATE ON public.articles
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER set_timestamp_comments BEFORE UPDATE ON public.comments
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Function to calculate and update odds
CREATE OR REPLACE FUNCTION public.update_article_odds(article_uuid UUID)
RETURNS VOID AS $$
DECLARE
    total_votes INTEGER;
    a_votes INTEGER;
    b_votes INTEGER;
BEGIN
    -- Get current vote counts
    SELECT choice_a_votes, choice_b_votes INTO a_votes, b_votes
    FROM public.articles WHERE id = article_uuid;
    
    total_votes := a_votes + b_votes;
    
    IF total_votes > 0 THEN
        UPDATE public.articles SET
            choice_a_odds = ROUND((a_votes::DECIMAL / total_votes::DECIMAL) * 100, 2),
            choice_b_odds = ROUND((b_votes::DECIMAL / total_votes::DECIMAL) * 100, 2),
            updated_at = NOW()
        WHERE id = article_uuid;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to handle vote insertion and update odds
CREATE OR REPLACE FUNCTION public.handle_vote()
RETURNS TRIGGER AS $$
BEGIN
    -- Update vote count
    IF NEW.choice = 'a' THEN
        UPDATE public.articles SET choice_a_votes = choice_a_votes + 1 WHERE id = NEW.article_id;
    ELSE
        UPDATE public.articles SET choice_b_votes = choice_b_votes + 1 WHERE id = NEW.article_id;
    END IF;
    
    -- Update odds
    PERFORM public.update_article_odds(NEW.article_id);
    
    -- Add point to user
    INSERT INTO public.user_points (user_id, points, source, article_id)
    VALUES (NEW.user_id, 1, 'vote', NEW.article_id);
    
    -- Update user total points
    UPDATE public.users SET 
        total_points = total_points + 1,
        updated_at = NOW()
    WHERE id = NEW.user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_vote_trigger AFTER INSERT ON public.votes
    FOR EACH ROW EXECUTE PROCEDURE public.handle_vote();

-- Function to handle vote deletion (if needed for admin)
CREATE OR REPLACE FUNCTION public.handle_vote_deletion()
RETURNS TRIGGER AS $$
BEGIN
    -- Update vote count
    IF OLD.choice = 'a' THEN
        UPDATE public.articles SET choice_a_votes = GREATEST(choice_a_votes - 1, 0) WHERE id = OLD.article_id;
    ELSE
        UPDATE public.articles SET choice_b_votes = GREATEST(choice_b_votes - 1, 0) WHERE id = OLD.article_id;
    END IF;
    
    -- Update odds
    PERFORM public.update_article_odds(OLD.article_id);
    
    -- Remove point from user
    UPDATE public.users SET 
        total_points = GREATEST(total_points - 1, 0),
        updated_at = NOW()
    WHERE id = OLD.user_id;
    
    -- Remove point history record
    DELETE FROM public.user_points 
    WHERE user_id = OLD.user_id AND article_id = OLD.article_id AND source = 'vote'
    ORDER BY created_at DESC LIMIT 1;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_vote_deletion_trigger AFTER DELETE ON public.votes
    FOR EACH ROW EXECUTE PROCEDURE public.handle_vote_deletion();