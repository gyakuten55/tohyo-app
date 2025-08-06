import { User } from '../types';
import { supabase } from '../lib/supabase';

export class UserService {
  static async fetchUserRank(userId: string, userPoints: number): Promise<{ rank: number | null; error?: string }> {
    try {
      // 現在のユーザーより多いポイントを持つユーザーの数を取得
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .gt('total_points', userPoints);

      if (error) {
        console.error('Error fetching user rank:', error);
        return { rank: null, error: 'ランキングの取得に失敗しました' };
      }

      // 自分より上位のユーザー数 + 1 = 自分の順位
      return { rank: (data?.length || 0) + 1 };
    } catch (error) {
      console.error('Error fetching user rank:', error);
      return { rank: null, error: 'ランキングの取得に失敗しました' };
    }
  }

  static async fetchRanking(limit: number = 10): Promise<{ data: User[] | null; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, nickname, total_points, avatar_url')
        .gt('total_points', 0)
        .order('total_points', { ascending: false })
        .order('created_at', { ascending: true })
        .limit(limit);

      if (error) {
        console.error('Error fetching ranking:', error);
        return { data: null, error: 'ランキングの取得に失敗しました' };
      }

      return { data: (data as User[]) || [] };
    } catch (error) {
      console.error('Error fetching ranking:', error);
      return { data: null, error: 'ランキングの取得に失敗しました' };
    }
  }

  static async updateUserPoints(userId: string, newTotalPoints: number): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('users')
        .update({ 
          total_points: newTotalPoints,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) {
        console.error('Error updating points:', error);
        return { success: false, error: 'ポイントの更新に失敗しました' };
      }

      return { success: true };
    } catch (error) {
      console.error('Error updating points:', error);
      return { success: false, error: 'ポイントの更新に失敗しました' };
    }
  }

  static async recordPointHistory(userId: string, points: number, source: string, articleId?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('user_points')
        .insert([
          {
            user_id: userId,
            points: points,
            source: source,
            article_id: articleId || null,
            created_at: new Date().toISOString(),
          }
        ]);

      if (error) {
        console.error('Error recording point history:', error);
        return { success: false, error: 'ポイント履歴の記録に失敗しました' };
      }

      return { success: true };
    } catch (error) {
      console.error('Error recording point history:', error);
      return { success: false, error: 'ポイント履歴の記録に失敗しました' };
    }
  }

  static async fetchPointHistory(userId: string): Promise<{ data: any[] | null; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('user_points')
        .select(`
          id,
          points,
          source,
          created_at,
          article:articles(id, title)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching point history:', error);
        return { data: null, error: 'ポイント履歴の取得に失敗しました' };
      }

      return { data: data || [] };
    } catch (error) {
      console.error('Error fetching point history:', error);
      return { data: null, error: 'ポイント履歴の取得に失敗しました' };
    }
  }
}