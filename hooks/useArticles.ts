import { useState, useEffect } from 'react';
import { Article } from '../types';
import { ArticleService } from '../services';
import { useAuth } from '../contexts/AuthContext';

export const useArticles = (initialLoad: boolean = true) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(initialLoad);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchArticles = async () => {
    try {
      setError(null);
      console.log('Fetching articles...');
      
      const { data, error: fetchError } = await ArticleService.fetchArticles();

      if (fetchError || !data) {
        setError(fetchError || '記事の取得に失敗しました');
        setArticles([]);
        return;
      }

      if (data && data.length > 0) {
        console.log(`Found ${data.length} published articles`);
        
        // ユーザーの投票履歴も取得
        if (user) {
          const articleIds = data.map(article => article.id);
          const votesMap = await ArticleService.fetchUserVotes(user.id, articleIds);
          
          const articlesWithVotes = data.map(article => ({
            ...article,
            user_vote: votesMap.get(article.id) || null
          }));

          setArticles(articlesWithVotes as Article[]);
        } else {
          setArticles(data as Article[]);
        }
      } else {
        console.log('No published articles found');
        setArticles([]);
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
      setError('記事の取得に失敗しました');
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  const refetch = async () => {
    setLoading(true);
    await fetchArticles();
  };

  // 特定の記事を取得
  const fetchArticleById = async (articleId: string): Promise<Article | null> => {
    try {
      const { data, error: fetchError } = await ArticleService.fetchArticleById(articleId);

      if (fetchError || !data) {
        console.error('Error fetching article:', fetchError);
        return null;
      }

      // ユーザーの投票履歴を取得
      let article = data;
      if (user) {
        const userVote = await ArticleService.fetchUserVoteForArticle(user.id, articleId);
        article.user_vote = userVote;
      }

      return article;
    } catch (error) {
      console.error('Error fetching article:', error);
      return null;
    }
  };

  useEffect(() => {
    if (initialLoad) {
      fetchArticles();
    }
  }, [user]);

  return {
    articles,
    loading,
    error,
    refetch,
    fetchArticleById,
  };
};