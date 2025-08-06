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
import { COLORS } from '../constants/colors';

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
            color: '#004225',
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
          color: '#004225',
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
              title: '大谷翔平選手、今季50本塁打達成！',
              summary: 'エンゼルスの大谷翔平選手が今季50本目のホームランを放ち、投打二刀流として驚異的な成績を記録しています。ファンからは「MVP確実」との声も。',
              created_at: new Date().toISOString(),
              created_by: {
                id: '1',
                nickname: 'スポーツ編集部'
              }
            },
            {
              id: '2',
              title: 'WBC2024開催決定、日本代表監督は？',
              summary: '次回のワールド・ベースボール・クラシック開催が正式決定。日本代表の監督人事に注目が集まっており、複数の有力候補が浮上している。',
              created_at: new Date(Date.now() - 86400000).toISOString(),
              created_by: {
                id: '2',
                nickname: '野球専門記者'
              }
            },
            {
              id: '3',
              title: 'メジャーリーグ、日本人選手の活躍続々',
              summary: 'ダルビッシュ有投手の好投、近藤健介選手の適時打など、メジャーで活躍する日本人選手たちのニュースが連日話題となっています。',
              created_at: new Date(Date.now() - 172800000).toISOString(),
              created_by: {
                id: '3',
                nickname: 'MLB担当'
              }
            },
            {
              id: '4',
              title: 'プロ野球オフシーズン、大型トレード予想',
              summary: 'NPBのオフシーズンが本格化し、各球団の補強ポイントが明確に。大型トレードの可能性や注目のFA選手についてまとめました。',
              created_at: new Date(Date.now() - 259200000).toISOString(),
              created_by: {
                id: '4',
                nickname: 'プロ野球担当'
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
          <ActivityIndicator size="large" color={COLORS.SECONDARY} />
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
                colors={[COLORS.SECONDARY]}
                tintColor={COLORS.SECONDARY}
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
    backgroundColor: COLORS.BACKGROUND,
  },
  safeArea: {
    flex: 1,
  },
  categoryContainer: {
    backgroundColor: COLORS.COMIC_PANEL_BG,
    paddingVertical: 14,
    borderBottomWidth: 3,
    borderBottomColor: COLORS.PRIMARY,
    shadowColor: COLORS.SHADOW_COMIC,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 0,
    elevation: 4,
  },
  categoryScroll: {
    paddingHorizontal: 16,
  },
  categoryChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 0,
    marginRight: 10,
    borderWidth: 2,
    backgroundColor: COLORS.BACKGROUND_WHITE,
    transform: [{ skewX: '-5deg' }],
    shadowColor: COLORS.SHADOW,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 0,
  },
  categoryChipSelected: {
    backgroundColor: COLORS.PRIMARY,
    borderColor: COLORS.SECONDARY,
    shadowColor: COLORS.SHADOW_RED,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 0,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    transform: [{ skewX: '5deg' }],
  },
  categoryTextSelected: {
    color: COLORS.TEXT_WHITE,
    textShadowColor: COLORS.SHADOW,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.PRIMARY,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    textShadowColor: COLORS.SHADOW,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  emptySubText: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    fontWeight: '500',
  },
  listContainer: {
    paddingVertical: 8,
  },
  newsCard: {
    marginHorizontal: 16,
    marginVertical: 10,
    elevation: 6,
    shadowColor: COLORS.SHADOW_COMIC,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 0,
    backgroundColor: COLORS.BACKGROUND_WHITE,
    borderWidth: 3,
    borderColor: COLORS.TEXT_PRIMARY,
    borderRadius: 0,
    transform: [{ rotate: '0.5deg' }],
  },
  newsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.COMIC_ACCENT,
  },
  newsTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.PRIMARY,
    marginRight: 12,
    lineHeight: 24,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textShadowColor: COLORS.COMIC_ACCENT,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  newsDate: {
    fontSize: 12,
    color: COLORS.SECONDARY,
    flexShrink: 0,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  newsSummary: {
    fontSize: 14,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 12,
    lineHeight: 22,
    fontWeight: '500',
  },
});