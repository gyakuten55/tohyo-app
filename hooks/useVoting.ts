import { useState } from 'react';
import { Alert } from 'react-native';
import { VoteService } from '../services';
import { useAuth } from '../contexts/AuthContext';

export const useVoting = () => {
  const [voting, setVoting] = useState(false);
  const { user, refreshProfile } = useAuth();

  const vote = async (articleId: string, choice: 'a' | 'b') => {
    if (!user) {
      Alert.alert('ログインが必要', 'ログインしてから投票してください。');
      return false;
    }

    setVoting(true);

    try {
      console.log(`投票開始: ユーザー ${user.id} が記事 ${articleId} の選択肢 ${choice} に投票`);

      const { success, error: voteError } = await VoteService.submitVote(user.id, articleId, choice);

      if (!success) {
        Alert.alert('投票エラー', voteError || '投票に失敗しました');
        return false;
      }

      // ユーザープロフィール更新（ポイント増加を反映）
      if (refreshProfile) {
        await refreshProfile();
      }

      Alert.alert(
        '投票完了',
        '投票ありがとうございます！1ポイント獲得しました。',
        [{ text: 'OK' }]
      );

      return true;
    } catch (error) {
      console.error('Vote error:', error);
      Alert.alert('エラー', `投票に失敗しました: ${(error as Error).message}`);
      return false;
    } finally {
      setVoting(false);
    }
  };

  return {
    vote,
    voting,
  };
};