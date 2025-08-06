// 日付フォーマッター
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('ja-JP');
};

export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ja-JP', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDateWithTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// 数値フォーマッター
export const formatNumber = (num: number): string => {
  return num.toLocaleString();
};

export const formatPoints = (points: number): string => {
  return `${points.toLocaleString()}ポイント`;
};

export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

// テキストフォーマッター
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
};

export const capitalizeFirst = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1);
};

// ポイント履歴用フォーマッター
export const getSourceText = (source: string): string => {
  switch (source) {
    case 'vote':
      return '投票';
    case 'bonus':
      return 'ボーナス';
    case 'daily':
      return 'デイリー';
    case 'referral':
      return '紹介';
    default:
      return source;
  }
};

// 記事ステータス用フォーマッター
export const getStatusText = (status: string): string => {
  switch (status) {
    case 'published':
      return '公開中';
    case 'draft':
      return '下書き';
    case 'archived':
      return 'アーカイブ';
    default:
      return status;
  }
};