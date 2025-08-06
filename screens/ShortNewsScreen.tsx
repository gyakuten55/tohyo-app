import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Card, ActivityIndicator } from 'react-native-paper';
import { supabase } from '../lib/supabase';
import { ShortNews, Category } from '../types';

export const ShortNewsScreen: React.FC = () => {
  const [news, setNews] = useState<ShortNews[]>([]);
  const [filteredNews, setFilteredNews] = useState<ShortNews[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true });

      if (error) {
        // テーブルが存在しない場合のデフォルトカテゴリ
        const defaultCategories: Category[] = [
          {
            id: 'all',
            name: '全て',
            slug: 'all',
            color: '#6750a4',
            order_index: 0,
            is_active: true,
            created_at: new Date().toISOString(),
          },
          {
            id: '1',
            name: '政治',
            slug: 'politics',
            color: '#2196F3',
            order_index: 1,
            is_active: true,
            created_at: new Date().toISOString(),
          },
          {
            id: '2',
            name: '経済',
            slug: 'economy',
            color: '#4CAF50',
            order_index: 2,
            is_active: true,
            created_at: new Date().toISOString(),
          },
          {
            id: '3',
            name: 'スポーツ',
            slug: 'sports',
            color: '#FF9800',
            order_index: 3,
            is_active: true,
            created_at: new Date().toISOString(),
          },
        ];
        setCategories(defaultCategories);
      } else if (data) {
        // "全て"カテゴリを追加
        const allCategory: Category = {
          id: 'all',
          name: '全て',
          slug: 'all',
          color: '#6750a4',
          order_index: -1,
          is_active: true,
          created_at: new Date().toISOString(),
        };
        setCategories([allCategory, ...data]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchShortNews = async () => {
    try {
      console.log('ShortNewsScreen: Fetching short news...');
      
      // テーブルが存在しない場合のエラーハンドリング
      const { data, error } = await supabase
        .from('short_news')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(50);

      console.log('ShortNewsScreen: Short news fetch response:', { 
        dataCount: data?.length || 0, 
        error 
      });

      if (error) {
        // テーブルが存在しない場合はサンプルデータを表示
        if (error.code === 'PGRST200' || error.message?.includes('short_news')) {
          console.log('ShortNewsScreen: short_news table not found. Using sample data.');
          const sampleNews: ShortNews[] = [
            {
              id: '1',
              title: '新機能リリースのお知らせ',
              summary: 'アプリに新しい投票機能が追加されました。より使いやすくなった投票システムをぜひお試しください。',
              created_at: new Date().toISOString(),
              created_by: {
                id: '1',
                nickname: 'システム管理者'
              }
            },
            {
              id: '2',
              title: 'メンテナンス予定',
              summary: '明日午前2時から4時まで、システムメンテナンスを実施します。この間、サービスがご利用いただけません。',
              created_at: new Date(Date.now() - 86400000).toISOString(),
              created_by: {
                id: '1',
                nickname: 'システム管理者'
              }
            },
            {
              id: '3',
              title: '投票ランキング更新',
              summary: '今週の投票ランキングが更新されました。トップユーザーには特別ボーナスが付与されます。',
              created_at: new Date(Date.now() - 172800000).toISOString(),
              created_by: {
                id: '1',
                nickname: 'システム管理者'
              }
            }
          ];
          setNews(sampleNews);
        } else {
          console.error('ShortNewsScreen: Error fetching short news:', error);
          setNews([]);
        }
        return;
      }

      if (data) {
        // created_byフィールドがない場合のデフォルト値を設定
        const newsWithDefaults = data.map(item => ({
          ...item,
          created_by: item.created_by || {
            id: 'unknown',
            nickname: '不明'
          }
        }));
        setNews(newsWithDefaults as ShortNews[]);
        console.log(`ShortNewsScreen: Found ${data.length} short news items`);
      } else {
        setNews([]);
        console.log('ShortNewsScreen: No short news items found');
      }
    } catch (error) {
      console.error('ShortNewsScreen: Error fetching short news:', error);
      setNews([]);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchCategories(), fetchShortNews()]);
      setLoading(false);
    };

    loadData();
  }, []);

  useEffect(() => {
    // カテゴリフィルタリング
    if (selectedCategory === 'all') {
      setFilteredNews(news);
    } else {
      setFilteredNews(news.filter(item => item.category_id === selectedCategory));
    }
  }, [selectedCategory, news]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchCategories(), fetchShortNews()]);
    setRefreshing(false);
  };

  const renderNewsItem = ({ item: newsItem }: { item: ShortNews }) => {
    const createdDate = new Date(newsItem.created_at).toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <Card style={styles.newsCard}>
        <Card.Content>
          <View style={styles.newsHeader}>
            <Text style={styles.newsTitle}>{newsItem.title}</Text>
            <Text style={styles.newsDate}>{createdDate}</Text>
          </View>
          
          <Text style={styles.newsSummary}>{newsItem.summary}</Text>
          
        </Card.Content>
      </Card>
    );
  };

  if (loading && news.length === 0) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6200ee" />
          <Text style={styles.loadingText}>読み込み中...</Text>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.categoryContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                onPress={() => setSelectedCategory(category.id)}
                style={[
                  styles.categoryChip,
                  selectedCategory === category.id && styles.categoryChipSelected,
                  { borderColor: category.color }
                ]}
              >
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === category.id && styles.categoryTextSelected,
                    { color: selectedCategory === category.id ? '#fff' : category.color }
                  ]}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        
        {filteredNews.length === 0 && !loading ? (
          <View style={styles.centered}>
            <Text style={styles.emptyText}>ショートニュースがありません</Text>
            <Text style={styles.emptySubText}>新しいニュースが投稿されるまでお待ちください</Text>
          </View>
        ) : (
          <FlatList
            data={filteredNews}
            renderItem={renderNewsItem}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl 
                refreshing={refreshing} 
                onRefresh={onRefresh}
                colors={['#6200ee']}
                tintColor={'#6200ee'}
              />
            }
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        )}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  safeArea: {
    flex: 1,
  },
  categoryContainer: {
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  categoryScroll: {
    paddingHorizontal: 16,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    backgroundColor: '#fff',
  },
  categoryChipSelected: {
    backgroundColor: '#6750a4',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  categoryTextSelected: {
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  listContainer: {
    paddingVertical: 8,
  },
  newsCard: {
    marginHorizontal: 16,
    marginVertical: 6,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
  },
  newsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  newsTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginRight: 12,
    lineHeight: 22,
  },
  newsDate: {
    fontSize: 12,
    color: '#666',
    flexShrink: 0,
  },
  newsSummary: {
    fontSize: 14,
    color: '#555',
    marginBottom: 12,
    lineHeight: 20,
  },
});