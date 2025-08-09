import { Article } from '../types';
import { supabase } from '../lib/supabase';

export class ArticleService {
  static async fetchArticles(): Promise<{ data: Article[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select(`
          *,
          created_by:users!created_by (
            id,
            nickname,
            avatar_url
          )
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching articles:', error);
        return { data: null, error: '記事の取得に失敗しました' };
      }

      return { data: (data as Article[]) || [], error: null };
    } catch (error) {
      console.error('Error fetching articles:', error);
      return { data: null, error: '記事の取得に失敗しました' };
    }
  }

  static async fetchArticleById(articleId: string): Promise<{ data: Article | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select(`
          *,
          created_by:users!created_by (
            id,
            nickname,
            avatar_url
          )
        `)
        .eq('id', articleId)
        .single();

      if (error || !data) {
        console.error('Error fetching article:', error);
        return { data: null, error: '記事の取得に失敗しました' };
      }

      return { data: data as Article, error: null };
    } catch (error) {
      console.error('Error fetching article:', error);
      return { data: null, error: '記事の取得に失敗しました' };
    }
  }

  static async fetchUserVotes(userId: string, articleIds: string[]): Promise<Map<string, 'a' | 'b'>> {
    try {
      const { data: votes } = await supabase
        .from('votes')
        .select('article_id, choice')
        .eq('user_id', userId)
        .in('article_id', articleIds);

      return new Map(votes?.map(vote => [vote.article_id, vote.choice as 'a' | 'b']) || []);
    } catch (error) {
      console.error('Error fetching user votes:', error);
      return new Map();
    }
  }

  static async fetchUserVoteForArticle(userId: string, articleId: string): Promise<'a' | 'b' | null> {
    try {
      const { data: vote } = await supabase
        .from('votes')
        .select('choice')
        .eq('user_id', userId)
        .eq('article_id', articleId)
        .single();

      return (vote?.choice as 'a' | 'b') || null;
    } catch (error) {
      console.error('Error fetching user vote:', error);
      return null;
    }
  }
}