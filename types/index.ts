// Core type definitions for News Voting App

export interface User {
  id: string;
  email: string;
  nickname: string;
  avatar_url?: string;
  role: 'admin' | 'user';
  total_points: number;
  created_at: string;
  updated_at: string;
}

export interface Article {
  id: string;
  title: string;
  content: string;
  thumbnail_url?: string;
  choice_a_text: string;
  choice_b_text: string;
  choice_a_votes: number;
  choice_b_votes: number;
  choice_a_odds: number;
  choice_b_odds: number;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
  created_by: string;
  created_by_user?: {
    id: string;
    nickname: string;
    avatar_url?: string;
  };
  user_vote?: 'a' | 'b' | null;
}

export interface Vote {
  id: string;
  user_id: string;
  article_id: string;
  choice: 'a' | 'b';
  created_at: string;
}

export interface Comment {
  id: string;
  user_id: string;
  article_id: string;
  parent_id?: string;
  content: string;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    nickname: string;
    avatar_url?: string;
  };
  replies?: Comment[];
}

export interface UserPoint {
  id: string;
  user_id: string;
  points: number;
  source: 'vote' | 'bonus' | 'penalty' | 'referral' | 'daily';
  article_id?: string;
  created_at: string;
}

export interface PointHistory {
  id: string;
  points: number;
  source: string;
  created_at: string;
  article?: {
    id: string;
    title: string;
  };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  color: string;
  icon?: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
}

export interface ShortNews {
  id: string;
  title: string;
  summary: string;
  category_id?: string;
  status: 'draft' | 'published';
  created_at: string;
  created_by: string;
}

export interface UserReferral {
  id: string;
  referrer_id: string;
  referred_at: string;
}

export interface RankingUser {
  id: string;
  nickname: string;
  avatar_url?: string;
  total_points: number;
  rank: number;
}

export interface RankingData {
  rankings: RankingUser[];
  current_user_rank?: {
    rank: number;
    points: number;
  };
  statistics: {
    total_ranked_users: number;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface ArticlesResponse {
  articles: Article[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface VoteResponse {
  success: boolean;
  vote: Vote;
  updated_odds: {
    choice_a_votes: number;
    choice_b_votes: number;
    choice_a_odds: number;
    choice_b_odds: number;
  };
}

export interface ApiError {
  error: string;
  details?: string;
}

// Navigation types
export type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
  Home: undefined;
  ArticleDetail: { articleId: string };
  Ranking: undefined;
  Profile: undefined;
  Admin: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Ranking: undefined;
  Profile: undefined;
  Admin?: undefined;
};

export type HomeStackParamList = {
  HomeList: undefined;
  ArticleDetail: { articleId: string };
};

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface SignUpForm {
  email: string;
  password: string;
  confirmPassword: string;
  nickname: string;
}

export interface ForgotPasswordForm {
  email: string;
}

export interface CreateArticleForm {
  title: string;
  content: string;
  choice_a_text: string;
  choice_b_text: string;
  status: 'draft' | 'published';
  thumbnail_url?: string;
}

export interface UpdateProfileForm {
  nickname: string;
  avatar_url?: string;
}

// Component prop types
export interface ArticleCardProps {
  article: Article;
  onPress: (article: Article) => void;
}

export interface VoteButtonProps {
  choice: 'a' | 'b';
  text: string;
  votes: number;
  odds: number;
  selected?: boolean;
  disabled?: boolean;
  onPress: () => void;
}

export interface RankingItemProps {
  user: RankingUser;
  isCurrentUser: boolean;
}

// Hook types
export interface UseArticlesResult {
  articles: Article[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  loadMore: () => Promise<void>;
  hasMore: boolean;
}

export interface UseRankingsResult {
  rankings: RankingData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export interface UseVotingResult {
  vote: (articleId: string, choice: 'a' | 'b') => Promise<VoteResponse | null>;
  loading: boolean;
  error: string | null;
}