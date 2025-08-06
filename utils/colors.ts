import { COLORS } from '../constants/colors';

// ポイント履歴のソース別カラー
export const getSourceColor = (source: string): string => {
  switch (source) {
    case 'vote':
      return COLORS.POINTS_VOTE;
    case 'bonus':
      return COLORS.POINTS_BONUS;
    case 'daily':
      return COLORS.POINTS_DAILY;
    case 'referral':
      return COLORS.POINTS_REFERRAL;
    default:
      return COLORS.BACKGROUND;
  }
};

// 記事ステータス別カラー
export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'published':
      return COLORS.SUCCESS;
    case 'draft':
      return COLORS.WARNING;
    case 'archived':
      return COLORS.TEXT_SECONDARY;
    default:
      return COLORS.TEXT_SECONDARY;
  }
};

// ランク別メダル取得
export const getRankMedal = (rank: number): string | null => {
  switch (rank) {
    case 1:
      return '🥇';
    case 2:
      return '🥈';
    case 3:
      return '🥉';
    default:
      return null;
  }
};