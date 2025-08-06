// WBC Comic Book Style Theme
export const COLORS = {
  // プライマリカラー - WBC ディープブルー
  PRIMARY: '#001e42',        // WBC ネイビーブルー
  PRIMARY_LIGHT: '#e8f0ff',  // 薄いブルー
  
  // セカンダリカラー - WBC レッド
  SECONDARY: '#c8102e',      // WBC クラシックレッド
  
  // バックグラウンド - コミックペーパー風
  BACKGROUND: '#faf8f5',     // クリームホワイト（コミック紙）
  BACKGROUND_WHITE: '#ffffff',
  
  // テキスト - コミックインク
  TEXT_PRIMARY: '#0a0a0a',   // コミックブラック
  TEXT_SECONDARY: '#3a3a3a', // ダークグレー
  TEXT_LIGHT: '#6a6a6a',     // ミディアムグレー
  TEXT_WHITE: '#ffffff',
  
  // ステータスカラー - WBCテーマ
  SUCCESS: '#00843d',        // WBC グリーン（勝利）
  SUCCESS_LIGHT: '#e6ffe6',
  ERROR: '#c8102e',          // WBC レッド（エラー）
  WARNING: '#ffb81c',        // WBC ゴールド（警告）
  
  // チームカラー（カテゴリ用）- WBCナショナルチームカラー
  CATEGORY_BLUE: '#003da5',    // USA ブルー
  CATEGORY_GREEN: '#00843d',   // メキシコ グリーン
  CATEGORY_ORANGE: '#ff6900',  // オランダ オレンジ
  CATEGORY_RED: '#c8102e',     // カナダ レッド
  CATEGORY_NAVY: '#001e42',    // 日本 ネイビー
  CATEGORY_GOLD: '#ffb81c',    // ゴールド
  CATEGORY_MAROON: '#7a003c',  // ベネズエラ マルーン
  
  // ボーダー・ディバイダー - コミックライン風
  BORDER_LIGHT: '#d0d0d0',     // コミックペンシルライン
  BORDER_LIGHTER: '#e8e8e8',   // より薄いライン
  DIVIDER: '#b0b0b0',          // コミックディバイダー
  
  // シャドウ - コミックシャドウ
  SHADOW: '#1a1a1a',
  SHADOW_COMIC: '#001e42',     // コミックブルーシャドウ
  SHADOW_RED: '#c8102e',       // レッドアクセントシャドウ
  
  // 投票・スコア関連 - WBCスコアボード風
  VOTE_CARD: '#f5f5f0',        // スコアボード背景
  POINTS_GREEN: '#00843d',     // WBC 得点グリーン
  
  // ポイント履歴カラー - WBC統計風
  POINTS_VOTE: '#e6f0ff',      // 投票統計（WBCライトブルー）
  POINTS_BONUS: '#ffe6ec',     // ボーナス（ライトレッド）
  POINTS_DAILY: '#e6f5e6',     // 日次ポイント（ライトグリーン）
  POINTS_REFERRAL: '#fff5e6',  // 紹介ポイント（ライトゴールド）
  
  // コミックスタイル用追加カラー
  COMIC_HIGHLIGHT: '#fff9e6',  // コミックハイライト
  COMIC_ACCENT: '#ffb81c',     // コミックアクセント（ゴールド）
  COMIC_PANEL_BG: '#fffcf8',   // コミックパネル背景
} as const;