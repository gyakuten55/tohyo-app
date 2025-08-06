import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  FlatList,
  Share,
} from 'react-native';
import { Card, Avatar, Button, TextInput, Divider, Chip } from 'react-native-paper';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { PointHistory } from '../types';
import { COLORS } from '../constants/colors';

export const ProfileScreen: React.FC = () => {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [newNickname, setNewNickname] = useState(profile?.nickname || '');
  const [updating, setUpdating] = useState(false);
  const [pointHistory, setPointHistory] = useState<PointHistory[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [referralCount, setReferralCount] = useState<number>(0);
  const [showHistory, setShowHistory] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const fetchUserRank = async () => {
    if (!user) return;

    try {
      // 現在のユーザーより多いポイントを持つユーザーの数を取得
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .gt('total_points', profile?.total_points || 0);

      if (error) {
        console.error('Error fetching user rank:', error);
      } else {
        // 自分より上位のユーザー数 + 1 = 自分の順位
        setUserRank((data?.length || 0) + 1);
      }
    } catch (error) {
      console.error('Error fetching user rank:', error);
    }
  };

  const fetchPointHistory = async () => {
    if (!user) return;

    setLoadingHistory(true);
    try {
      const { data, error } = await supabase
        .from('user_points')
        .select(`
          *,
          article:articles (
            id,
            title
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching point history:', error);
      } else {
        setPointHistory(data as PointHistory[]);
      }
    } catch (error) {
      console.error('Error fetching point history:', error);
    }
    setLoadingHistory(false);
  };

  const fetchReferralCount = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_referrals')
        .select('id')
        .eq('referrer_id', user.id);

      if (error) {
        console.error('Error fetching referral count:', error);
        setReferralCount(0);
      } else {
        setReferralCount(data?.length || 0);
      }
    } catch (error) {
      console.error('Error fetching referral count:', error);
      setReferralCount(0);
    }
  };

  useEffect(() => {
    if (profile) {
      fetchUserRank();
      fetchReferralCount();
    }
  }, [profile?.total_points]);

  const handleToggleHistory = () => {
    if (!showHistory) {
      fetchPointHistory();
    }
    setShowHistory(!showHistory);
  };

  const handleEditProfile = () => {
    setNewNickname(profile?.nickname || '');
    setEditing(true);
  };

  const handleCancelEdit = () => {
    setNewNickname(profile?.nickname || '');
    setEditing(false);
  };

  const handleSaveProfile = async () => {
    if (!user || !profile) return;

    if (newNickname.trim().length < 2) {
      Alert.alert('エラー', 'ニックネームは2文字以上で入力してください。');
      return;
    }

    if (newNickname.trim().length > 20) {
      Alert.alert('エラー', 'ニックネームは20文字以下で入力してください。');
      return;
    }

    setUpdating(true);

    try {
      const { error } = await supabase
        .from('users')
        .update({
          nickname: newNickname.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        Alert.alert('エラー', 'プロフィールの更新に失敗しました。');
      } else {
        await refreshProfile();
        setEditing(false);
        Alert.alert('成功', 'プロフィールを更新しました。');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      Alert.alert('エラー', 'プロフィールの更新に失敗しました。');
    }

    setUpdating(false);
  };

  const handleSignOut = () => {
    Alert.alert(
      'ログアウト',
      'ログアウトしますか？',
      [
        {
          text: 'キャンセル',
          style: 'cancel',
        },
        {
          text: 'ログアウト',
          style: 'destructive',
          onPress: signOut,
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP');
  };

  const getSourceText = (source: string) => {
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

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'vote':
        return COLORS.POINTS_VOTE;
      case 'bonus':
        return COLORS.POINTS_BONUS;
      case 'daily':
        return COLORS.POINTS_DAILY;
      case 'referral':
        return COLORS.POINTS_REFERRAL;
      default:
        return COLORS.BACKGROUND;
    }
  };

  const handleShare = async () => {
    if (referralCount >= 5) {
      Alert.alert(
        '紹介回数上限',
        '紹介によるポイント獲得は5回までとなっています。',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      const shareMessage = `ニュース投票アプリを一緒に楽しみませんか？\n\n気になるニュースに投票してポイントを貯めよう！\nダウンロードはこちら: [アプリのURL]\n\n紹介者: ${profile?.nickname}\n紹介コード: ${user?.id}`;
      
      await Share.share({
        message: shareMessage,
      });
      
      // 簡単な紹介ロジック：シェアボタンを押すだけでポイント付与
      await handleReferralReward();
      
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const handleReferralReward = async () => {
    if (!user || referralCount >= 5) return;

    try {
      // 紹介記録を追加
      const { error: referralError } = await supabase
        .from('user_referrals')
        .insert([
          {
            referrer_id: user.id,
            referred_at: new Date().toISOString(),
          }
        ]);

      if (referralError) {
        console.error('Error recording referral:', referralError);
        return;
      }

      // ユーザーのポイントを更新
      const newTotalPoints = (profile?.total_points || 0) + 10;
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          total_points: newTotalPoints,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('Error updating points:', updateError);
        return;
      }

      // ポイント履歴を記録
      const { error: pointsError } = await supabase
        .from('user_points')
        .insert([
          {
            user_id: user.id,
            points: 10,
            source: 'referral',
            created_at: new Date().toISOString(),
          }
        ]);

      if (pointsError) {
        console.error('Error recording point history:', pointsError);
      }

      // UI更新
      await refreshProfile();
      setReferralCount(prev => prev + 1);

      Alert.alert(
        'ポイント獲得！',
        `友達紹介で10ポイント獲得しました！\n残り紹介回数: ${4 - referralCount}回`,
        [{ text: 'OK' }]
      );

    } catch (error) {
      console.error('Error handling referral reward:', error);
      Alert.alert('エラー', 'ポイント付与に失敗しました。');
    }
  };

  if (!profile) {
    return (
      <View style={styles.centered}>
        <Text>プロフィールを読み込み中...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.profileCard}>
        <Card.Content style={styles.profileContent}>
          <Avatar.Icon
            size={80}
            icon="account"
            style={styles.avatar}
          />
          
          {editing ? (
            <View style={styles.editContainer}>
              <TextInput
                label="ニックネーム"
                value={newNickname}
                onChangeText={setNewNickname}
                mode="outlined"
                style={styles.nicknameInput}
                disabled={updating}
              />
              <View style={styles.editButtons}>
                <Button
                  mode="outlined"
                  onPress={handleCancelEdit}
                  disabled={updating}
                  style={styles.editButton}
                >
                  キャンセル
                </Button>
                <Button
                  mode="contained"
                  onPress={handleSaveProfile}
                  loading={updating}
                  disabled={updating}
                  style={styles.editButton}
                >
                  保存
                </Button>
              </View>
            </View>
          ) : (
            <View style={styles.profileInfo}>
              <Text style={styles.nickname}>{profile.nickname}</Text>
              <Text style={styles.email}>{profile.email}</Text>
              <TouchableOpacity
                style={styles.editLink}
                onPress={handleEditProfile}
              >
                <Text style={styles.editLinkText}>プロフィール編集</Text>
              </TouchableOpacity>
            </View>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.statsCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>統計</Text>
          
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>総獲得ポイント</Text>
            <Text style={styles.statValue}>
              {profile.total_points.toLocaleString()}ポイント
            </Text>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>現在のランキング順位</Text>
            <Text style={[
              styles.statValue,
              styles.rankText
            ]}>
              {userRank ? `${userRank}位` : '計算中...'}
            </Text>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>アカウント作成日</Text>
            <Text style={styles.statValue}>
              {formatDate(profile.created_at)}
            </Text>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>アカウントタイプ</Text>
            <Text style={[
              styles.statValue,
              profile.role === 'admin' && styles.adminText
            ]}>
              {profile.role === 'admin' ? '管理者' : '一般ユーザー'}
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Point History Section */}
      <Card style={styles.historyCard}>
        <Card.Content>
          <View style={styles.historyHeader}>
            <Text style={styles.sectionTitle}>ポイント履歴</Text>
            <Button
              mode="text"
              onPress={handleToggleHistory}
              loading={loadingHistory}
              compact
            >
              {showHistory ? '非表示' : '表示'}
            </Button>
          </View>

          {showHistory && (
            <View style={styles.historyContent}>
              {pointHistory.length === 0 && !loadingHistory ? (
                <Text style={styles.noHistoryText}>
                  ポイント履歴がありません
                </Text>
              ) : (
                <FlatList
                  data={pointHistory}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <View style={styles.historyItem}>
                      <View style={styles.historyItemHeader}>
                        <Chip
                          mode="flat"
                          style={[
                            styles.sourceChip,
                            { backgroundColor: getSourceColor(item.source) }
                          ]}
                          textStyle={styles.sourceChipText}
                        >
                          {getSourceText(item.source)}
                        </Chip>
                        <Text style={styles.pointsText}>
                          +{item.points}ポイント
                        </Text>
                      </View>
                      
                      {item.article && (
                        <Text style={styles.articleTitle} numberOfLines={2}>
                          記事: {item.article.title}
                        </Text>
                      )}
                      
                      <Text style={styles.historyDate}>
                        {formatDate(item.created_at)}
                      </Text>
                    </View>
                  )}
                  scrollEnabled={false}
                  showsVerticalScrollIndicator={false}
                />
              )}
            </View>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.actionsCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>アカウント操作</Text>
          
          <Button
            mode="outlined"
            onPress={handleSignOut}
            style={styles.signOutButton}
            textColor="#d32f2f"
            icon="logout"
          >
            ログアウト
          </Button>
        </Card.Content>
      </Card>

      <Card style={styles.referralCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>友達紹介</Text>
          <Text style={styles.referralDescription}>
            お友達にアプリを紹介して、両方がボーナスポイントをゲット！
          </Text>
          <Text style={styles.referralBonus}>
            紹介成功で <Text style={styles.bonusPoints}>+10ポイント</Text> 獲得
          </Text>
          <Text style={styles.referralLimit}>
            残り紹介回数: <Text style={styles.limitText}>{5 - referralCount}回</Text>
          </Text>
          
          <Button
            mode="contained"
            onPress={handleShare}
            style={[
              styles.shareButton,
              referralCount >= 5 && styles.shareButtonDisabled
            ]}
            icon="share"
            disabled={referralCount >= 5}
          >
            {referralCount >= 5 ? '紹介回数上限達成' : '紹介してポイントゲット！'}
          </Button>
        </Card.Content>
      </Card>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          ニュース投票アプリ v1.0.0
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileCard: {
    margin: 16,
    elevation: 6,
    shadowColor: COLORS.SHADOW_COMIC,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 0,
    backgroundColor: COLORS.BACKGROUND_WHITE,
    borderWidth: 3,
    borderColor: COLORS.TEXT_PRIMARY,
    borderRadius: 0,
    transform: [{ rotate: '-0.3deg' }],
  },
  profileContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  avatar: {
    backgroundColor: COLORS.PRIMARY,
    marginBottom: 16,
    borderWidth: 3,
    borderColor: COLORS.SECONDARY,
  },
  editContainer: {
    width: '100%',
    alignItems: 'center',
  },
  nicknameInput: {
    width: '100%',
    marginBottom: 16,
  },
  editButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  editButton: {
    marginHorizontal: 8,
    minWidth: 100,
  },
  profileInfo: {
    alignItems: 'center',
  },
  nickname: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 12,
    fontWeight: '500',
  },
  editLink: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: COLORS.COMIC_HIGHLIGHT,
    borderWidth: 2,
    borderColor: COLORS.PRIMARY,
    transform: [{ skewX: '-5deg' }],
  },
  editLinkText: {
    fontSize: 14,
    color: COLORS.PRIMARY,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    transform: [{ skewX: '5deg' }],
  },
  statsCard: {
    margin: 16,
    marginTop: 0,
    elevation: 6,
    shadowColor: COLORS.SHADOW_COMIC,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 0,
    backgroundColor: COLORS.BACKGROUND_WHITE,
    borderWidth: 3,
    borderColor: COLORS.TEXT_PRIMARY,
    borderRadius: 0,
    transform: [{ rotate: '0.3deg' }],
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.PRIMARY,
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    textShadowColor: COLORS.SHADOW,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  statLabel: {
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.SECONDARY,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  adminText: {
    color: COLORS.COMIC_ACCENT,
    fontWeight: '900',
    textShadowColor: COLORS.TEXT_PRIMARY,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  divider: {
    marginVertical: 8,
    backgroundColor: COLORS.DIVIDER,
    height: 2,
  },
  actionsCard: {
    margin: 16,
    marginTop: 0,
    elevation: 6,
    shadowColor: COLORS.SHADOW_RED,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 0,
    backgroundColor: COLORS.BACKGROUND_WHITE,
    borderWidth: 3,
    borderColor: COLORS.TEXT_PRIMARY,
    borderRadius: 0,
    transform: [{ rotate: '-0.2deg' }],
  },
  signOutButton: {
    borderColor: COLORS.SECONDARY,
    borderWidth: 2,
    borderRadius: 0,
    transform: [{ skewX: '-3deg' }],
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 12,
    color: COLORS.TEXT_LIGHT,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  historyCard: {
    margin: 16,
    marginTop: 0,
    elevation: 6,
    shadowColor: COLORS.SHADOW_COMIC,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 0,
    backgroundColor: COLORS.BACKGROUND_WHITE,
    borderWidth: 3,
    borderColor: COLORS.TEXT_PRIMARY,
    borderRadius: 0,
    transform: [{ rotate: '0.4deg' }],
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyContent: {
    marginTop: 8,
  },
  noHistoryText: {
    textAlign: 'center',
    color: COLORS.TEXT_SECONDARY,
    fontWeight: '600',
    paddingVertical: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  historyItem: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.BORDER_LIGHT,
    paddingVertical: 12,
  },
  historyItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sourceChip: {
    height: 30,
    borderWidth: 2,
    borderColor: COLORS.TEXT_PRIMARY,
    borderRadius: 0,
    transform: [{ skewX: '-5deg' }],
  },
  sourceChipText: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    transform: [{ skewX: '5deg' }],
  },
  pointsText: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.SUCCESS,
    textShadowColor: COLORS.TEXT_PRIMARY,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  articleTitle: {
    fontSize: 14,
    color: COLORS.TEXT_PRIMARY,
    marginTop: 4,
    marginBottom: 2,
    fontWeight: '500',
  },
  historyDate: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  rankText: {
    color: COLORS.COMIC_ACCENT,
    fontWeight: '900',
    fontSize: 18,
    textShadowColor: COLORS.TEXT_PRIMARY,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  referralCard: {
    margin: 16,
    marginTop: 0,
    elevation: 6,
    shadowColor: COLORS.COMIC_ACCENT,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 0,
    backgroundColor: COLORS.COMIC_HIGHLIGHT,
    borderWidth: 3,
    borderColor: COLORS.TEXT_PRIMARY,
    borderRadius: 0,
    transform: [{ rotate: '-0.5deg' }],
  },
  referralDescription: {
    fontSize: 14,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 8,
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  referralBonus: {
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '700',
  },
  bonusPoints: {
    color: COLORS.SECONDARY,
    fontWeight: '900',
    fontSize: 20,
    textShadowColor: COLORS.TEXT_PRIMARY,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  shareButton: {
    backgroundColor: COLORS.PRIMARY,
    marginTop: 8,
    borderWidth: 2,
    borderColor: COLORS.TEXT_PRIMARY,
    borderRadius: 0,
    transform: [{ skewX: '-3deg' }],
    shadowColor: COLORS.SHADOW_RED,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 0,
  },
  shareButtonDisabled: {
    backgroundColor: COLORS.TEXT_LIGHT,
    borderColor: COLORS.BORDER_LIGHT,
  },
  referralLimit: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '600',
  },
  limitText: {
    color: COLORS.SECONDARY,
    fontWeight: '900',
    textShadowColor: COLORS.TEXT_PRIMARY,
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 0,
  },
});