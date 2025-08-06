import { useState, useEffect } from 'react';
import { Alert, Share } from 'react-native';
import { DEFAULTS } from '../constants/defaults';
import { ReferralService, UserService } from '../services';
import { useAuth } from '../contexts/AuthContext';

export const useReferrals = () => {
  const [referralCount, setReferralCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const { user, profile, refreshProfile } = useAuth();

  const fetchReferralCount = async () => {
    if (!user) {
      setReferralCount(0);
      setLoading(false);
      return;
    }

    try {
      const { count, error } = await ReferralService.fetchReferralCount(user.id);

      if (error) {
        console.error('Error fetching referral count:', error);
        setReferralCount(0);
      } else {
        setReferralCount(count);
      }
    } catch (error) {
      console.error('Error fetching referral count:', error);
      setReferralCount(0);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async (): Promise<boolean> => {
    if (referralCount >= DEFAULTS.MAX_REFERRALS) {
      Alert.alert(
        '紹介回数上限',
        '紹介によるポイント獲得は5回までとなっています。',
        [{ text: 'OK' }]
      );
      return false;
    }

    try {
      const shareMessage = `ニュース投票アプリを一緒に楽しみませんか？\n\n気になるニュースに投票してポイントを貯めよう！\nダウンロードはこちら: [アプリのURL]\n\n紹介者: ${profile?.nickname}\n紹介コード: ${user?.id}`;
      
      await Share.share({
        message: shareMessage,
      });
      
      // 簡単な紹介ロジック：シェアボタンを押すだけでポイント付与
      return await handleReferralReward();
      
    } catch (error) {
      console.error('Share error:', error);
      return false;
    }
  };

  const handleReferralReward = async (): Promise<boolean> => {
    if (!user || referralCount >= DEFAULTS.MAX_REFERRALS) return false;

    try {
      // 紹介記録を追加
      const { success: referralSuccess, error: referralError } = await ReferralService.recordReferral(user.id);

      if (!referralSuccess) {
        console.error('Error recording referral:', referralError);
        return false;
      }

      // ユーザーのポイントを更新
      const newTotalPoints = (profile?.total_points || 0) + DEFAULTS.REFERRAL_POINTS;
      const { success: updateSuccess, error: updateError } = await UserService.updateUserPoints(user.id, newTotalPoints);

      if (!updateSuccess) {
        console.error('Error updating points:', updateError);
        return false;
      }

      // ポイント履歴を記録
      const { success: pointsSuccess, error: pointsError } = await UserService.recordPointHistory(
        user.id,
        DEFAULTS.REFERRAL_POINTS,
        'referral'
      );

      if (!pointsSuccess) {
        console.error('Error recording point history:', pointsError);
      }

      // UI更新
      if (refreshProfile) {
        await refreshProfile();
      }
      setReferralCount(prev => prev + 1);

      Alert.alert(
        'ポイント獲得！',
        `友達紹介で${DEFAULTS.REFERRAL_POINTS}ポイント獲得しました！\n残り紹介回数: ${DEFAULTS.MAX_REFERRALS - referralCount - 1}回`,
        [{ text: 'OK' }]
      );

      return true;
    } catch (error) {
      console.error('Error handling referral reward:', error);
      Alert.alert('エラー', 'ポイント付与に失敗しました。');
      return false;
    }
  };

  const getRemainingReferrals = (): number => {
    return Math.max(0, DEFAULTS.MAX_REFERRALS - referralCount);
  };

  const isMaxReferralsReached = (): boolean => {
    return referralCount >= DEFAULTS.MAX_REFERRALS;
  };

  useEffect(() => {
    fetchReferralCount();
  }, [user, profile?.total_points]);

  return {
    referralCount,
    loading,
    handleShare,
    getRemainingReferrals,
    isMaxReferralsReached,
    refetch: fetchReferralCount,
  };
};