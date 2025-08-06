import { supabase } from '../lib/supabase';

export class VoteService {
  static async checkExistingVote(userId: string, articleId: string): Promise<boolean> {
    try {
      const { data: existingVote } = await supabase
        .from('votes')
        .select('id')
        .eq('user_id', userId)
        .eq('article_id', articleId)
        .single();

      return !!existingVote;
    } catch (error) {
      console.error('Error checking existing vote:', error);
      return false;
    }
  }

  static async submitVote(userId: string, articleId: string, choice: 'a' | 'b'): Promise<{ success: boolean; error?: string }> {
    try {
      // 重複投票チェック
      const hasVoted = await this.checkExistingVote(userId, articleId);
      if (hasVoted) {
        return { success: false, error: 'この記事にはすでに投票済みです。' };
      }

      // 投票を記録
      const { data: voteData, error: voteError } = await supabase
        .from('votes')
        .insert([
          {
            user_id: userId,
            article_id: articleId,
            choice: choice,
          }
        ])
        .select()
        .single();

      if (voteError) {
        console.error('投票エラー:', voteError);
        return { success: false, error: `投票に失敗しました: ${voteError.message}` };
      }

      console.log('投票記録成功:', voteData);
      return { success: true };
    } catch (error) {
      console.error('Vote error:', error);
      return { success: false, error: `投票に失敗しました: ${(error as Error).message}` };
    }
  }
}