import { useState, useEffect } from 'react';
import { RankingData, RankingUser } from '../types';
import { DEFAULTS } from '../constants/defaults';
import { UserService } from '../services';
import { useAuth } from '../contexts/AuthContext';

export const useRanking = () => {
  const [rankingData, setRankingData] = useState<RankingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchRankings = async () => {
    try {
      setError(null);
      console.log('ランキングデータ取得開始...');

      // ユーザーランキングを取得
      const { data: rankings, error: rankingsError } = await UserService.fetchRanking(DEFAULTS.RANKING_PER_PAGE);

      if (rankingsError || !rankings) {
        console.error('ランキング取得エラー:', rankingsError);
        setError(rankingsError || 'ランキングの取得に失敗しました');
        setRankingData({
          rankings: [],
          statistics: { total_ranked_users: 0 },
          pagination: {
            page: 1,
            limit: DEFAULTS.RANKING_PER_PAGE,
            total: 0,
            total_pages: 0
          }
        });
        return;
      }

      // ランクを付与
      const rankingsWithRank: RankingUser[] = rankings?.map((user, index) => ({
        ...user,
        rank: index + 1
      })) || [];

      // 現在のユーザーのランクを取得
      let currentUserRank = undefined;
      if (user) {
        const userRankIndex = rankingsWithRank.findIndex(r => r.id === user.id);
        if (userRankIndex !== -1) {
          currentUserRank = {
            rank: userRankIndex + 1,
            points: rankingsWithRank[userRankIndex].total_points
          };
        }
      }

      console.log(`ランキングデータ取得完了: ${rankingsWithRank.length}人`);
      console.log('現在のユーザーランク:', currentUserRank);
      
      setRankingData({
        rankings: rankingsWithRank,
        current_user_rank: currentUserRank,
        statistics: {
          total_ranked_users: rankingsWithRank.length
        },
        pagination: {
          page: 1,
          limit: DEFAULTS.RANKING_PER_PAGE,
          total: rankingsWithRank.length,
          total_pages: 1
        }
      });

    } catch (error) {
      console.error('ランキング取得エラー:', error);
      setError('ランキングの取得に失敗しました');
      setRankingData({
        rankings: [],
        statistics: { total_ranked_users: 0 },
        pagination: {
          page: 1,
          limit: DEFAULTS.RANKING_PER_PAGE,
          total: 0,
          total_pages: 0
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const refetch = async () => {
    setLoading(true);
    await fetchRankings();
  };

  useEffect(() => {
    fetchRankings();
  }, []);

  return {
    rankingData,
    loading,
    error,
    refetch,
  };
};