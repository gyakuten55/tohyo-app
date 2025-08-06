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
import { useArticles } from '../hooks/useArticles';
import { useCategories } from '../hooks/useCategories';
import { ArticleCard } from '../components/ArticleCard';
import { CategoryFilter } from '../components/CategoryFilter';
import { COLORS, MESSAGES } from '../constants';
import { Article } from '../types';

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

  useEffect(() => {
    // カテゴリフィルタリング
    if (selectedCategory === 'all') {
      setFilteredArticles(articles);
    } else {
      setFilteredArticles(articles.filter(article => article.category_id === selectedCategory));
    }
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
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
        
        {filteredArticles.length === 0 && !loading ? (
          <View style={styles.centered}>
            <Text style={styles.emptyText}>{MESSAGES.EMPTY_ARTICLES}</Text>
            <Text style={styles.emptySubText}>{MESSAGES.EMPTY_ARTICLES_SUB}</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
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
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
  },
  listContainer: {
    paddingVertical: 8,
  },
});