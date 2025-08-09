import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { GestureHandlerRootView, PanGestureHandler, State } from 'react-native-gesture-handler';
import { useArticles } from '../hooks/useArticles';
import { useCategories } from '../hooks/useCategories';
import { ArticleCard } from '../components/ArticleCard';
import { CategoryFilter } from '../components/CategoryFilter';
import { COLORS, MESSAGES } from '../constants';
import { Article, Category } from '../types';

interface HomeScreenProps {
  navigation: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);

  const { articles, loading: articlesLoading, refetch: refetchArticles } = useArticles();
  const { categories, loading: categoriesLoading } = useCategories();

  const loading = articlesLoading || categoriesLoading;

  // スワイプでカテゴリ切り替え
  const handleSwipeGesture = (event: any) => {
    if (event.nativeEvent.state === State.END) {
      const { translationX } = event.nativeEvent;
      const threshold = 50; // スワイプの閾値

      if (Math.abs(translationX) > threshold && categories.length > 0) {
        // 重複を避けてカテゴリ配列を作成
        const categoryIds = categories.map(cat => cat.id).filter(id => id !== 'all');
        const allCategories = ['all', ...categoryIds];
        const currentIndex = allCategories.indexOf(selectedCategory);
        
        console.log('Swipe detected:', { translationX, currentIndex, allCategories, selectedCategory, categories: categories.length });

        if (translationX > 0 && currentIndex > 0) {
          // 右スワイプ：前のカテゴリ
          const newCategory = allCategories[currentIndex - 1];
          console.log('Switching to previous category:', newCategory);
          setSelectedCategory(newCategory);
        } else if (translationX < 0 && currentIndex < allCategories.length - 1) {
          // 左スワイプ：次のカテゴリ
          const newCategory = allCategories[currentIndex + 1];
          console.log('Switching to next category:', newCategory);
          setSelectedCategory(newCategory);
        }
      }
    }
  };

  useEffect(() => {
    // カテゴリフィルタリング
    if (selectedCategory === 'all') {
      setFilteredArticles(articles);
    } else {
      setFilteredArticles(articles.filter(article => (article as any).category_id === selectedCategory));
    }
    console.log('Category filtering:', { selectedCategory, articlesCount: articles.length, filteredCount: filteredArticles.length });
  }, [selectedCategory, articles]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetchArticles();
    setRefreshing(false);
  };

  const handleArticlePress = (article: Article) => {
    navigation.navigate('ArticleDetail', { articleId: article.id });
  };

  const renderArticleCard = ({ item: article }: { item: Article }) => {
    return (
      <ArticleCard 
        article={article} 
        onPress={handleArticlePress}
      />
    );
  };

  if (loading && articles.length === 0) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.SECONDARY} />
          <Text style={styles.loadingText}>{MESSAGES.LOADING}</Text>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
        
        <PanGestureHandler
          onHandlerStateChange={handleSwipeGesture}
          activeOffsetX={[-30, 30]}
          failOffsetY={[-30, 30]}
          minPointers={1}
          maxPointers={1}
        >
          <View style={styles.gestureContainer}>
            {filteredArticles.length === 0 && !loading ? (
              <View style={styles.centered}>
                <Text style={styles.emptyText}>{MESSAGES.EMPTY_ARTICLES}</Text>
                <Text style={styles.emptySubText}>{MESSAGES.EMPTY_ARTICLES_SUB}</Text>
                <Text style={styles.swipeHint}>← スワイプしてカテゴリを切り替え →</Text>
              </View>
            ) : (
              <FlatList
                data={filteredArticles}
                renderItem={renderArticleCard}
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
          </View>
        </PanGestureHandler>
      </SafeAreaView>
    </GestureHandlerRootView>
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
  gestureContainer: {
    flex: 1,
  },
  swipeHint: {
    fontSize: 12,
    color: COLORS.TEXT_LIGHT,
    textAlign: 'center',
    marginTop: 16,
    fontWeight: '500',
    fontStyle: 'italic',
  },
});