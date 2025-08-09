import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { Card, Avatar, Chip } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { mockRankings, isTestEnvironment } from '../data/mockData';

const { width } = Dimensions.get('window');

interface RankingUser {
  id: string;
  nickname: string;
  avatar_url?: string;
  total_points: number;
  rank: number;
}

interface RankingData {
  rankings: RankingUser[];
  current_user_rank?: {
    rank: number;
    points: number;
  };
  statistics: {
    total_ranked_users: number;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export const RankingScreen: React.FC = () => {
  const [rankingData, setRankingData] = useState<RankingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();

  const fetchRankings = async () => {
    try {
      console.log('ランキングデータ取得開始...');

      // ユーザーランキングを取得
      const { data: rankings, error: rankingsError } = await supabase
        .from('users')
        .select('id, nickname, avatar_url, total_points')
        .gt('total_points', 0)
        .order('total_points', { ascending: false })
        .order('created_at', { ascending: true })
        .limit(50);

      if (rankingsError) {
        console.error('ランキング取得エラー:', rankingsError);
        setRankingData({
          rankings: [],
          statistics: { total_ranked_users: 0 }
        });
        return;
      }

      // ランクを付与
      const rankingsWithRank = rankings?.map((user, index) => ({
        ...user,
        rank: index + 1
      })) || [];

      // 現在のユーザーのランクを取得
      let currentUserRank = undefined;
      if (user) {
        const userRankIndex = rankingsWithRank.findIndex(r => r.id === user.id);
        if (userRankIndex !== -1) {
          currentUserRank = {
            rank: userRankIndex + 1,
            points: rankingsWithRank[userRankIndex].total_points
          };
        }
      }

      console.log(`ランキングデータ取得完了: ${rankingsWithRank.length}人`);
      console.log('現在のユーザーランク:', currentUserRank);
      
      setRankingData({
        rankings: rankingsWithRank,
        current_user_rank: currentUserRank,
        statistics: {
          total_ranked_users: rankingsWithRank.length
        },
        pagination: {
          page: 1,
          limit: 50,
          total: rankingsWithRank.length,
          total_pages: 1
        }
      });

    } catch (error) {
      console.error('ランキング取得エラー:', error);
      setRankingData({
        rankings: [],
        statistics: { total_ranked_users: 0 }
      });
    }
  };

  useEffect(() => {
    const loadRankings = async () => {
      setLoading(true);
      await fetchRankings();
      setLoading(false);
    };

    loadRankings();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRankings();
    setRefreshing(false);
  };

  const getRankColors = (rank: number) => {
    switch (rank) {
      case 1:
        return ['#FFD700', '#FFA500', '#FF8C00'] as const; // Gold
      case 2:
        return ['#C0C0C0', '#A8A8A8', '#808080'] as const; // Silver
      case 3:
        return ['#CD7F32', '#B87333', '#A0522D'] as const; // Bronze
      default:
        return ['#1E3A5F', '#2C5282', '#1E3A5F'] as const; // Navy blue
    }
  };

  const getRankBadgeColors = (rank: number) => {
    if (rank === 1) return ['#FFD700', '#FF6B00'] as const;
    if (rank === 2) return ['#E5E4E2', '#C0C0C0'] as const;
    if (rank === 3) return ['#CD7F32', '#8B4513'] as const;
    return ['#4A5568', '#2D3748'] as const;
  };

  const renderRankingItem = ({ item: user }: { item: RankingUser }) => {
    const isCurrentUser = user.id === user.id;
    const rankColors = getRankColors(user.rank);
    const badgeColors = getRankBadgeColors(user.rank);

    return (
      <View style={[
        styles.rankingCardWrapper,
        user.rank <= 3 && styles.topThreeWrapper
      ]}>
        <LinearGradient
          colors={user.rank <= 3 ? rankColors : ['#FFFFFF', '#F7FAFC', '#EDF2F7']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.rankingCard,
            isCurrentUser && styles.currentUserCard,
            user.rank === 1 && styles.firstPlace,
            user.rank === 2 && styles.secondPlace,
            user.rank === 3 && styles.thirdPlace
          ]}
        >
          <View style={styles.rankingContent}>
            <LinearGradient
              colors={badgeColors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[
                styles.rankBadge,
                user.rank <= 3 && styles.topRankBadge
              ]}
            >
              <Text style={[
                styles.rankNumber,
                user.rank <= 3 && styles.topRankNumber
              ]}>
                {user.rank}
              </Text>
            </LinearGradient>

            <View style={[
              styles.avatarContainer,
              user.rank <= 3 && styles.topAvatarContainer
            ]}>
              <Avatar.Icon
                size={user.rank <= 3 ? 56 : 48}
                icon="account"
                style={[
                  styles.avatar,
                  { backgroundColor: user.rank <= 3 ? badgeColors[0] : '#2C5282' }
                ]}
              />
            </View>

            <View style={styles.userInfo}>
              <View style={styles.nameContainer}>
                <Text style={[
                  styles.nickname,
                  user.rank <= 3 && styles.topNickname
                ]}>
                  {user.nickname}
                </Text>
                {isCurrentUser && (
                  <View style={styles.youBadge}>
                    <Text style={styles.youBadgeText}>
                      YOU
                    </Text>
                  </View>
                )}
              </View>
              <View style={styles.pointsContainer}>
                <Text style={[
                  styles.points,
                  user.rank <= 3 && styles.topPoints
                ]}>
                  {user.total_points.toLocaleString()}
                </Text>
                <Text style={[
                  styles.pointsLabel,
                  user.rank <= 3 && styles.topPointsLabel
                ]}>
                  pts
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </View>
    );
  };

  if (loading && !rankingData) {
    return (
      <View style={styles.centered}>
        <Text>読み込み中...</Text>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={['#0A1929', '#1E3A5F', '#2C5282']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.container}
    >
      {rankingData?.current_user_rank && (
        <LinearGradient
          colors={['#FF6B00', '#FF8C00', '#FFA500']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.currentRankCard}
        >
          <View style={styles.currentRankContent}>
            <Text style={styles.currentRankTitle}>YOUR STANDING</Text>
            <View style={styles.currentRankInfo}>
              <View style={styles.currentRankBadge}>
                <Text style={styles.currentRank}>
                  #{rankingData.current_user_rank.rank}
                </Text>
              </View>
              <View style={styles.currentPointsBox}>
                <Text style={styles.currentPoints}>
                  {rankingData.current_user_rank.points.toLocaleString()}
                </Text>
                <Text style={styles.currentPointsLabel}>POINTS</Text>
              </View>
            </View>
            <View style={styles.totalUsersContainer}>
              <Text style={styles.totalUsers}>
                OUT OF {rankingData.statistics.total_ranked_users} PLAYERS
              </Text>
            </View>
          </View>
        </LinearGradient>
      )}

      <View style={styles.headerContainer}>
        <View style={styles.titleBorder} />
        <Text style={styles.sectionTitle}>WORLD RANKINGS</Text>
        <View style={styles.titleBorder} />
      </View>

      <FlatList
        data={rankingData?.rankings || []}
        renderItem={renderRankingItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor="#FFA500"
          />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  currentRankCard: {
    margin: 16,
    marginBottom: 8,
    borderRadius: 0,
    elevation: 8,
    shadowColor: '#FF6B00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  currentRankContent: {
    padding: 20,
  },
  currentRankTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 2,
    textShadowColor: '#000000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  currentRankInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 8,
  },
  currentRankBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 0,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  currentRank: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FF6B00',
    fontStyle: 'italic',
  },
  currentPointsBox: {
    alignItems: 'center',
  },
  currentPoints: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    textShadowColor: '#000000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  currentPointsLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFD700',
    letterSpacing: 1,
  },
  totalUsersContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 0,
    alignSelf: 'center',
  },
  totalUsers: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFD700',
    textAlign: 'center',
    letterSpacing: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 12,
  },
  titleBorder: {
    flex: 1,
    height: 3,
    backgroundColor: '#FFA500',
    marginHorizontal: 8,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
    textShadowColor: '#FFA500',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  listContainer: {
    paddingHorizontal: 12,
    paddingBottom: 16,
  },
  rankingCardWrapper: {
    marginBottom: 10,
  },
  topThreeWrapper: {
    transform: [{ scale: 1.02 }],
  },
  rankingCard: {
    borderRadius: 0,
    padding: 12,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  firstPlace: {
    borderColor: '#FFD700',
    borderWidth: 3,
    shadowColor: '#FFD700',
    shadowOpacity: 0.4,
  },
  secondPlace: {
    borderColor: '#C0C0C0',
    borderWidth: 2.5,
    shadowColor: '#C0C0C0',
    shadowOpacity: 0.3,
  },
  thirdPlace: {
    borderColor: '#CD7F32',
    borderWidth: 2,
    shadowColor: '#CD7F32',
    shadowOpacity: 0.3,
  },
  currentUserCard: {
    borderWidth: 3,
    borderColor: '#00FF00',
    backgroundColor: 'rgba(0, 255, 0, 0.05)',
  },
  rankingContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rankBadge: {
    width: 50,
    height: 50,
    borderRadius: 0,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  topRankBadge: {
    width: 60,
    height: 60,
    borderRadius: 0,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  rankNumber: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    fontStyle: 'italic',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  topRankNumber: {
    fontSize: 24,
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
  },
  avatarContainer: {
    marginRight: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    borderRadius: 0,
  },
  topAvatarContainer: {
    elevation: 5,
    shadowOpacity: 0.3,
    shadowRadius: 6,
    borderRadius: 0,
  },
  avatar: {
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  userInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  nickname: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
    marginRight: 10,
    letterSpacing: 0.5,
    textShadowColor: 'rgba(255, 255, 255, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  topNickname: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
  },
  youBadge: {
    backgroundColor: '#00FF00',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#00CC00',
    elevation: 2,
    shadowColor: '#00FF00',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  youBadgeText: {
    color: '#000000',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  points: {
    fontSize: 22,
    fontWeight: '900',
    color: '#2C5282',
    marginRight: 4,
    fontStyle: 'italic',
  },
  topPoints: {
    fontSize: 24,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  pointsLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4A5568',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  topPointsLabel: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
});