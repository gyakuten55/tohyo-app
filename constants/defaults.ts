import { Category } from '../types';

// デフォルトカテゴリ設定
export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'all',
    name: '全て',
    slug: 'all',
    color: '#004225',
    order_index: 0,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: '1',
    name: '政治',
    slug: 'politics',
    color: '#1e3a8a',
    order_index: 1,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    name: '経済',
    slug: 'economy',
    color: '#228b22',
    order_index: 2,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'スポーツ',
    slug: 'sports',
    color: '#ff6900',
    order_index: 3,
    is_active: true,
    created_at: new Date().toISOString(),
  },
];

// カテゴリカラーパレット - スポーツチームカラー
export const CATEGORY_COLORS = [
  '#004225', '#1e3a8a', '#228b22', '#ff6900',
  '#dc143c', '#1a1a2e', '#ffd700', '#800000',
  '#8b4513', '#2f4f4f', '#556b2f', '#d2691e',
];

// アプリ設定のデフォルト値
export const DEFAULTS = {
  // ページネーション
  ARTICLES_PER_PAGE: 20,
  COMMENTS_PER_PAGE: 50,
  RANKING_PER_PAGE: 50,
  
  // ポイント設定
  VOTE_POINTS: 1,
  REFERRAL_POINTS: 10,
  MAX_REFERRALS: 5,
  
  // UI設定
  HEADER_HEIGHT: 60,
  CARD_BORDER_RADIUS: 8,
  BUTTON_BORDER_RADIUS: 20,
  
  // テキスト制限
  NICKNAME_MIN_LENGTH: 2,
  NICKNAME_MAX_LENGTH: 20,
  ARTICLE_TITLE_MAX_LENGTH: 100,
  ARTICLE_CONTENT_MAX_LENGTH: 1000,
  COMMENT_MAX_LENGTH: 500,
  CHOICE_MAX_LENGTH: 50,
  NEWS_TITLE_MAX_LENGTH: 100,
  NEWS_SUMMARY_MAX_LENGTH: 300,
  
  // 画像設定
  THUMBNAIL_ASPECT_RATIO: [16, 10] as const,
  IMAGE_QUALITY: 0.8,
  
  // データ更新間隔（ミリ秒）
  POLL_INTERVAL: 30000, // 30秒
  
} as const;

// ローディング・エラーメッセージ
export const MESSAGES = {
  LOADING: '読み込み中...',
  ERROR_GENERIC: 'エラーが発生しました。',
  ERROR_NETWORK: 'ネットワークエラーが発生しました。',
  ERROR_AUTH: '認証に失敗しました。',
  SUCCESS_SAVE: '保存しました。',
  SUCCESS_DELETE: '削除しました。',
  SUCCESS_VOTE: '投票ありがとうございました！',
  SUCCESS_COMMENT: 'コメントを投稿しました。',
  
  // 空データメッセージ
  EMPTY_ARTICLES: '記事がありません',
  EMPTY_ARTICLES_SUB: '新しい記事が投稿されるまでお待ちください',
  EMPTY_NEWS: 'ショートニュースがありません', 
  EMPTY_NEWS_SUB: '新しいニュースが投稿されるまでお待ちください',
  EMPTY_COMMENTS: 'まだコメントがありません。最初のコメントを投稿しましょう！',
  EMPTY_HISTORY: 'ポイント履歴がありません',
  
} as const;