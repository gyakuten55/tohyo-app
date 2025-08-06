import { supabase } from '../lib/supabase';

export class ReferralService {
  static async fetchReferralCount(userId: string): Promise<{ count: number; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('user_referrals')
        .select('id')
        .eq('referrer_id', userId);

      if (error) {
        console.error('Error fetching referral count:', error);
        return { count: 0, error: '紹介履歴の取得に失敗しました' };
      }

      return { count: data?.length || 0 };
    } catch (error) {
      console.error('Error fetching referral count:', error);
      return { count: 0, error: '紹介履歴の取得に失敗しました' };
    }
  }

  static async recordReferral(referrerId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('user_referrals')
        .insert([
          {
            referrer_id: referrerId,
            referred_at: new Date().toISOString(),
          }
        ]);

      if (error) {
        console.error('Error recording referral:', error);
        return { success: false, error: '紹介の記録に失敗しました' };
      }

      return { success: true };
    } catch (error) {
      console.error('Error recording referral:', error);
      return { success: false, error: '紹介の記録に失敗しました' };
    }
  }
}