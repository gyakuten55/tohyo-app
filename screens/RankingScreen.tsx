import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
} from 'react-native';
import { Card, Avatar, Chip } from 'react-native-paper';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { mockRankings, isTestEnvironment } from '../data/mockData';

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

  const getRankMedal = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return null;
    }
  };

  const renderRankingItem = ({ item: user }: { item: RankingUser }) => {
    const isCurrentUser = user.id === user.id;
    const medal = getRankMedal(user.rank);

    return (
      <Card style={[styles.rankingCard, isCurrentUser && styles.currentUserCard]}>
        <Card.Content style={styles.rankingContent}>
          <View style={styles.rankContainer}>
            <Text style={styles.rankNumber}>
              {medal || `${user.rank}位`}
            </Text>
          </View>

          <Avatar.Icon
            size={48}
            icon="account"
            style={[
              styles.avatar,
              user.rank <= 3 && styles.topRankAvatar
            ]}
          />

          <View style={styles.userInfo}>
            <View style={styles.nameContainer}>
              <Text style={styles.nickname}>
                {user.nickname}
              </Text>
              {isCurrentUser && (
                <Chip
                  mode="flat"
                  style={styles.youChip}
                  textStyle={styles.youChipText}
                >
                  あなた
                </Chip>
              )}
            </View>
            <Text style={styles.points}>
              {user.total_points.toLocaleString()}ポイント
            </Text>
          </View>
        </Card.Content>
      </Card>
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
    <View style={styles.container}>
      {rankingData?.current_user_rank && (
        <Card style={styles.currentRankCard}>
          <Card.Content>
            <Text style={styles.currentRankTitle}>あなたの順位</Text>
            <View style={styles.currentRankInfo}>
              <Text style={styles.currentRank}>
                {rankingData.current_user_rank.rank}位
              </Text>
              <Text style={styles.currentPoints}>
                {rankingData.current_user_rank.points.toLocaleString()}ポイント
              </Text>
            </View>
            <Text style={styles.totalUsers}>
              / {rankingData.statistics.total_ranked_users}人中
            </Text>
          </Card.Content>
        </Card>
      )}

      <Text style={styles.sectionTitle}>ランキング</Text>

      <FlatList
        data={rankingData?.rankings || []}
        renderItem={renderRankingItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  currentRankCard: {
    margin: 16,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    backgroundColor: '#6750a4',
  },
  currentRankTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  currentRankInfo: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  currentRank: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginRight: 16,
  },
  currentPoints: {
    fontSize: 18,
    color: '#fff',
  },
  totalUsers: {
    fontSize: 12,
    color: '#fff',
    textAlign: 'center',
    opacity: 0.8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 16,
    marginVertical: 8,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  rankingCard: {
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  currentUserCard: {
    borderWidth: 2,
    borderColor: '#6750a4',
    backgroundColor: '#f3e5f5',
  },
  rankingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  rankContainer: {
    width: 50,
    alignItems: 'center',
  },
  rankNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  avatar: {
    backgroundColor: '#6750a4',
    marginRight: 16,
  },
  topRankAvatar: {
    backgroundColor: '#ff9800',
  },
  userInfo: {
    flex: 1,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  nickname: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginRight: 8,
  },
  youChip: {
    backgroundColor: '#e3f2fd',
  },
  youChipText: {
    color: '#1976d2',
    fontSize: 10,
  },
  points: {
    fontSize: 14,
    color: '#666',
  },
});