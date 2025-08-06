// テスト用のモックデータ（本番では使用されません）
export const mockArticles = [];

export const mockRankings = [
  {
    id: 'user1',
    nickname: 'テックマニア',
    avatar_url: undefined,
    total_points: 1250,
    rank: 1,
  },
  {
    id: 'user2',
    nickname: 'ニュースハンター',
    avatar_url: undefined,
    total_points: 980,
    rank: 2,
  },
  {
    id: 'user3',
    nickname: 'トレンドウォッチャー',
    avatar_url: undefined,
    total_points: 875,
    rank: 3,
  },
  {
    id: 'user4',
    nickname: '政治評論家',
    avatar_url: undefined,
    total_points: 720,
    rank: 4,
  },
  {
    id: 'user5',
    nickname: 'エコロジスト',
    avatar_url: undefined,
    total_points: 650,
    rank: 5,
  },
];

export const isTestEnvironment = () => {
  return process.env.EXPO_PUBLIC_SUPABASE_URL === 'https://dummy.supabase.co';
};