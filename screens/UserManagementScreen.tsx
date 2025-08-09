import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Card, Avatar, Chip, ActivityIndicator, Searchbar } from 'react-native-paper';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { COLORS } from '../constants/colors';
import { User } from '../types';

interface UserWithStats extends User {
  article_count?: number;
  vote_count?: number;
}

export const UserManagementScreen: React.FC = () => {
  const [users, setUsers] = useState<UserWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<UserWithStats[]>([]);
  
  const { profile } = useAuth();

  const fetchUsers = async () => {
    try {
      console.log('Fetching users...');
      
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .neq('role', 'admin') // 管理者以外のユーザーのみ取得
        .order('created_at', { ascending: false });

      if (usersError) {
        console.error('Error fetching users:', usersError);
        Alert.alert('エラー', 'ユーザー情報の取得に失敗しました。');
        return;
      }

      if (usersData) {
        console.log(`Found ${usersData.length} users`);
        
        // ユーザーの統計情報を取得
        const usersWithStats = await Promise.all(
          usersData.map(async (user) => {
            try {
              // 記事投稿数を取得
              const { count: articleCount } = await supabase
                .from('articles')
                .select('*', { count: 'exact', head: true })
                .eq('created_by', user.id);

              // 投票数を取得
              const { count: voteCount } = await supabase
                .from('votes')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id);

              return {
                ...user,
                article_count: articleCount || 0,
                vote_count: voteCount || 0,
              };
            } catch (error) {
              console.error('Error fetching user stats:', error);
              return {
                ...user,
                article_count: 0,
                vote_count: 0,
              };
            }
          })
        );

        setUsers(usersWithStats);
        setFilteredUsers(usersWithStats);
      }
    } catch (error) {
      console.error('Error in fetchUsers:', error);
      Alert.alert('エラー', 'ユーザー情報の取得に失敗しました。');
    }
  };

  useEffect(() => {
    if (profile?.role !== 'admin') {
      Alert.alert('アクセス拒否', '管理者権限が必要です。');
      return;
    }

    const loadUsers = async () => {
      setLoading(true);
      await fetchUsers();
      setLoading(false);
    };

    loadUsers();
  }, [profile]);

  useEffect(() => {
    // 検索フィルタリング
    if (searchQuery.trim() === '') {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user =>
        user.nickname.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, users]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUsers();
    setRefreshing(false);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return COLORS.ERROR;
      case 'user':
      default:
        return COLORS.SUCCESS;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderUserItem = ({ item: user }: { item: UserWithStats }) => {
    return (
      <Card style={styles.userCard}>
        <Card.Content>
          <View style={styles.userHeader}>
            <View style={styles.avatarSection}>
              <Avatar.Icon
                size={48}
                icon="account"
                style={[styles.avatar, { backgroundColor: getRoleColor(user.role) }]}
              />
              <View style={styles.userInfo}>
                <Text style={styles.nickname}>{user.nickname}</Text>
                <Text style={styles.email}>{user.email}</Text>
                <Text style={styles.joinDate}>
                  登録日: {formatDate(user.created_at)}
                </Text>
              </View>
            </View>
            
            <View style={styles.roleSection}>
              <Chip
                mode="outlined"
                textStyle={[styles.roleText, { color: getRoleColor(user.role) }]}
                style={[styles.roleChip, { borderColor: getRoleColor(user.role) }]}
              >
                {user.role === 'admin' ? '管理者' : '一般ユーザー'}
              </Chip>
            </View>
          </View>

          <View style={styles.statsSection}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user.total_points}</Text>
              <Text style={styles.statLabel}>ポイント</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user.article_count || 0}</Text>
              <Text style={styles.statLabel}>投稿記事</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user.vote_count || 0}</Text>
              <Text style={styles.statLabel}>投票数</Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.SECONDARY} />
          <Text style={styles.loadingText}>ユーザー情報を読み込み中...</Text>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>ユーザー管理</Text>
        <Text style={styles.headerSubtitle}>
          登録ユーザー数: {users.length}人
        </Text>
      </View>

      <View style={styles.searchSection}>
        <Searchbar
          placeholder="ユーザー名またはメールアドレスで検索"
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
      </View>

      <FlatList
        data={filteredUsers}
        renderItem={renderUserItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.SECONDARY]}
            tintColor={COLORS.SECONDARY}
          />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchQuery ? '検索結果が見つかりません' : 'ユーザーが見つかりません'}
            </Text>
            <Text style={styles.emptySubText}>
              {searchQuery ? '別のキーワードで検索してください' : '新しいユーザーの登録をお待ちください'}
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: '600',
  },
  header: {
    padding: 20,
    backgroundColor: COLORS.PRIMARY,
    borderBottomWidth: 3,
    borderBottomColor: COLORS.SECONDARY,
    shadowColor: COLORS.SHADOW,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 0,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.TEXT_WHITE,
    textTransform: 'uppercase',
    letterSpacing: 1,
    textShadowColor: COLORS.SHADOW,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.TEXT_WHITE,
    marginTop: 4,
    fontWeight: '600',
  },
  searchSection: {
    padding: 16,
    backgroundColor: COLORS.COMIC_PANEL_BG,
  },
  searchBar: {
    backgroundColor: COLORS.BACKGROUND_WHITE,
    borderWidth: 2,
    borderColor: COLORS.PRIMARY,
    borderRadius: 0,
    elevation: 2,
  },
  listContainer: {
    padding: 16,
  },
  userCard: {
    marginBottom: 16,
    borderWidth: 3,
    borderColor: COLORS.TEXT_PRIMARY,
    borderRadius: 0,
    backgroundColor: COLORS.BACKGROUND_WHITE,
    shadowColor: COLORS.SHADOW,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 0,
    elevation: 6,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  nickname: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  email: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 2,
    fontWeight: '500',
  },
  joinDate: {
    fontSize: 12,
    color: COLORS.TEXT_LIGHT,
    fontWeight: '500',
  },
  roleSection: {
    alignItems: 'flex-end',
  },
  roleChip: {
    borderWidth: 2,
    backgroundColor: COLORS.BACKGROUND_WHITE,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 2,
    borderTopColor: COLORS.BORDER_LIGHT,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.PRIMARY,
    marginBottom: 4,
    textShadowColor: COLORS.COMIC_ACCENT,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    marginTop: 64,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  emptySubText: {
    fontSize: 14,
    color: COLORS.TEXT_LIGHT,
    textAlign: 'center',
    fontWeight: '500',
  },
});