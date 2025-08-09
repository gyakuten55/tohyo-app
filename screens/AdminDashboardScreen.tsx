import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  Alert,
  RefreshControl,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { 
  Card, 
  Button, 
  TextInput, 
  Chip,
  FAB,
  Dialog,
  Portal,
  RadioButton,
  SegmentedButtons,
} from 'react-native-paper';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { CategoryManager } from '../components/CategoryManager';
import { Article, ShortNews, Category } from '../types';
import { COLORS } from '../constants/colors';

export const AdminDashboardScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'articles' | 'shortnews' | 'categories'>('articles');
  const [articles, setArticles] = useState<Article[]>([]);
  const [shortNews, setShortNews] = useState<ShortNews[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [editingShortNews, setEditingShortNews] = useState<ShortNews | null>(null);
  
  // Form state for articles
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [choiceAText, setChoiceAText] = useState('');
  const [choiceBText, setChoiceBText] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');

  // Form state for short news
  const [newsTitle, setNewsTitle] = useState('');
  const [newsSummary, setNewsSummary] = useState('');
  const [newsStatus, setNewsStatus] = useState<'draft' | 'published'>('published');

  const { user, profile } = useAuth();
  const { width } = useWindowDimensions();

  const fetchArticles = async () => {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select(`
          *,
          created_by:users!created_by (
            id,
            nickname,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching articles:', error);
        return;
      }

      if (data) {
        setArticles(data as Article[]);
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
    }
  };

  const fetchShortNews = async () => {
    try {
      const { data, error } = await supabase
        .from('short_news')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        // テーブルが存在しない場合はサンプルデータを表示
        if (error.code === 'PGRST200' || error.message?.includes('short_news')) {
          console.log('short_news table not found. Using empty data.');
          setShortNews([]);
        } else {
          console.error('Error fetching short news:', error);
          setShortNews([]);
        }
        return;
      }

      if (data) {
        setShortNews(data as ShortNews[]);
      }
    } catch (error) {
      console.error('Error fetching short news:', error);
      setShortNews([]);
    }
  };

  useEffect(() => {
    if (profile?.role !== 'admin') {
      Alert.alert('アクセス拒否', '管理者権限が必要です。');
      return;
    }

    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchArticles(), fetchShortNews()]);
      setLoading(false);
    };

    loadData();
  }, [profile]);

  const onRefresh = async () => {
    setRefreshing(true);
    if (activeTab === 'articles') {
      await fetchArticles();
    } else {
      await fetchShortNews();
    }
    setRefreshing(false);
  };

  const resetForm = () => {
    // Reset article form
    setTitle('');
    setContent('');
    setChoiceAText('');
    setChoiceBText('');
    setStatus('draft');
    setEditingArticle(null);
    
    // Reset news form
    setNewsTitle('');
    setNewsSummary('');
    setNewsStatus('published');
    setEditingShortNews(null);
  };

  const loadArticleForEdit = (article: Article) => {
    setEditingArticle(article);
    setTitle(article.title);
    setContent(article.content);
    setChoiceAText(article.choice_a_text);
    setChoiceBText(article.choice_b_text);
    setStatus(article.status === 'archived' ? 'draft' : article.status);
    setShowEditDialog(true);
  };

  const loadShortNewsForEdit = (news: ShortNews) => {
    setEditingShortNews(news);
    setNewsTitle(news.title);
    setNewsSummary(news.summary);
    setNewsStatus(news.status);
    setShowEditDialog(true);
  };

  const handleCreateArticle = async () => {
    if (!title.trim() || !content.trim() || !choiceAText.trim() || !choiceBText.trim()) {
      Alert.alert('エラー', 'すべての項目を入力してください。');
      return;
    }

    if (!user) return;

    setCreating(true);

    try {
      const { data, error } = await supabase
        .from('articles')
        .insert([
          {
            title: title.trim(),
            content: content.trim(),
            choice_a_text: choiceAText.trim(),
            choice_b_text: choiceBText.trim(),
            status,
            created_by: user.id,
          },
        ])
        .select()
        .single();

      if (error) {
        Alert.alert('エラー', '記事の作成に失敗しました。');
      } else {
        Alert.alert('成功', '記事を作成しました。');
        setShowCreateDialog(false);
        resetForm();
        await fetchArticles();
      }
    } catch (error) {
      console.error('Create article error:', error);
      Alert.alert('エラー', '記事の作成に失敗しました。');
    }

    setCreating(false);
  };

  const handleCreateShortNews = async () => {
    if (!newsTitle.trim() || !newsSummary.trim()) {
      Alert.alert('エラー', 'すべての項目を入力してください。');
      return;
    }

    if (!user) return;

    setCreating(true);

    try {
      const { data, error } = await supabase
        .from('short_news')
        .insert([
          {
            title: newsTitle.trim(),
            summary: newsSummary.trim(),
            status: newsStatus,
            created_by: user.id,
          },
        ])
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST200' || error.message?.includes('short_news')) {
          Alert.alert('エラー', 'ショートニュース機能はまだ準備中です。');
        } else {
          Alert.alert('エラー', 'ショートニュースの作成に失敗しました。');
        }
      } else {
        Alert.alert('成功', 'ショートニュースを作成しました。');
        setShowCreateDialog(false);
        resetForm();
        await fetchShortNews();
      }
    } catch (error) {
      console.error('Create short news error:', error);
      Alert.alert('エラー', 'ショートニュースの作成に失敗しました。');
    }

    setCreating(false);
  };

  const handleUpdateArticle = async () => {
    if (!title.trim() || !content.trim() || !choiceAText.trim() || !choiceBText.trim()) {
      Alert.alert('エラー', 'すべての項目を入力してください。');
      return;
    }

    if (!editingArticle) return;

    setEditing(true);

    try {
      const { error } = await supabase
        .from('articles')
        .update({
          title: title.trim(),
          content: content.trim(),
          choice_a_text: choiceAText.trim(),
          choice_b_text: choiceBText.trim(),
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingArticle.id);

      if (error) {
        console.error('Update article error:', error);
        Alert.alert('エラー', '記事の更新に失敗しました。');
      } else {
        Alert.alert('成功', '記事を更新しました。');
        setShowEditDialog(false);
        resetForm();
        await fetchArticles();
      }
    } catch (error) {
      console.error('Update article error:', error);
      Alert.alert('エラー', '記事の更新に失敗しました。');
    }

    setEditing(false);
  };

  const handleUpdateShortNews = async () => {
    if (!newsTitle.trim() || !newsSummary.trim()) {
      Alert.alert('エラー', 'すべての項目を入力してください。');
      return;
    }

    if (!editingShortNews) return;

    setEditing(true);

    try {
      const { error } = await supabase
        .from('short_news')
        .update({
          title: newsTitle.trim(),
          summary: newsSummary.trim(),
          status: newsStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingShortNews.id);

      if (error) {
        console.error('Update short news error:', error);
        Alert.alert('エラー', 'ショートニュースの更新に失敗しました。');
      } else {
        Alert.alert('成功', 'ショートニュースを更新しました。');
        setShowEditDialog(false);
        resetForm();
        await fetchShortNews();
      }
    } catch (error) {
      console.error('Update short news error:', error);
      Alert.alert('エラー', 'ショートニュースの更新に失敗しました。');
    }

    setEditing(false);
  };

  const handleToggleArticleStatus = async (articleId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'published' ? 'draft' : 'published';
    
    try {
      const { error } = await supabase
        .from('articles')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', articleId);

      if (error) {
        Alert.alert('エラー', 'ステータスの更新に失敗しました。');
      } else {
        await fetchArticles();
      }
    } catch (error) {
      console.error('Toggle status error:', error);
      Alert.alert('エラー', 'ステータスの更新に失敗しました。');
    }
  };

  const handleToggleShortNewsStatus = async (newsId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'published' ? 'draft' : 'published';
    
    try {
      const { error } = await supabase
        .from('short_news')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', newsId);

      if (error) {
        Alert.alert('エラー', 'ステータスの更新に失敗しました。');
      } else {
        await fetchShortNews();
      }
    } catch (error) {
      console.error('Toggle status error:', error);
      Alert.alert('エラー', 'ステータスの更新に失敗しました。');
    }
  };

  const handleDeleteArticle = async (articleId: string, title: string) => {
    Alert.alert(
      '記事削除',
      `「${title}」を削除しますか？この操作は元に戻せません。`,
      [
        {
          text: 'キャンセル',
          style: 'cancel',
        },
        {
          text: '削除',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('articles')
                .delete()
                .eq('id', articleId);

              if (error) {
                Alert.alert('削除エラー', '記事の削除に失敗しました。');
              } else {
                Alert.alert('削除完了', '記事を削除しました。');
                await fetchArticles();
              }
            } catch (error) {
              console.error('記事削除エラー:', error);
              Alert.alert('エラー', '記事の削除に失敗しました。');
            }
          },
        },
      ]
    );
  };

  const handleDeleteShortNews = async (newsId: string, title: string) => {
    Alert.alert(
      'ショートニュース削除',
      `「${title}」を削除しますか？この操作は元に戻せません。`,
      [
        {
          text: 'キャンセル',
          style: 'cancel',
        },
        {
          text: '削除',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('short_news')
                .delete()
                .eq('id', newsId);

              if (error) {
                Alert.alert('削除エラー', 'ショートニュースの削除に失敗しました。');
              } else {
                Alert.alert('削除完了', 'ショートニュースを削除しました。');
                await fetchShortNews();
              }
            } catch (error) {
              console.error('ショートニュース削除エラー:', error);
              Alert.alert('エラー', 'ショートニュースの削除に失敗しました。');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return '#4caf50';
      case 'draft':
        return '#ff9800';
      case 'archived':
        return '#757575';
      default:
        return '#757575';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published':
        return '公開中';
      case 'draft':
        return '下書き';
      case 'archived':
        return 'アーカイブ';
      default:
        return status;
    }
  };

  const renderArticleCard = ({ item: article }: { item: Article }) => {
    const totalVotes = article.choice_a_votes + article.choice_b_votes;

    return (
      <Card style={styles.articleCard}>
        <Card.Content>
          <View style={styles.articleHeader}>
            <Text style={styles.articleTitle} numberOfLines={2}>
              {article.title}
            </Text>
            <Chip
              mode="flat"
              style={[
                styles.statusChip,
                { backgroundColor: `${getStatusColor(article.status)}20` }
              ]}
              textStyle={[
                styles.statusChipText,
                { color: getStatusColor(article.status) }
              ]}
            >
              {getStatusText(article.status)}
            </Chip>
          </View>

          <Text style={styles.articleContent} numberOfLines={2}>
            {article.content}
          </Text>

          <View style={styles.choicesRow}>
            <Text style={styles.choiceText}>
              A: {article.choice_a_text} ({article.choice_a_votes}票)
            </Text>
            <Text style={styles.choiceText}>
              B: {article.choice_b_text} ({article.choice_b_votes}票)
            </Text>
          </View>

          <View style={styles.articleActions}>
            <Text style={styles.voteCount}>
              総票数: {totalVotes}
            </Text>
            <View style={styles.actionButtons}>
              <Button
                mode="outlined"
                onPress={() => loadArticleForEdit(article)}
                style={styles.actionButton}
                compact
              >
                編集
              </Button>
              <Button
                mode="outlined"
                onPress={() => handleToggleArticleStatus(article.id, article.status)}
                style={styles.actionButton}
                compact
              >
                {article.status === 'published' ? '非公開' : '公開'}
              </Button>
              <Button
                mode="outlined"
                onPress={() => handleDeleteArticle(article.id, article.title)}
                style={[styles.actionButton, styles.deleteButton]}
                textColor="#d32f2f"
                compact
              >
                削除
              </Button>
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderShortNewsCard = ({ item: news }: { item: ShortNews }) => {
    return (
      <Card style={styles.articleCard}>
        <Card.Content>
          <View style={styles.articleHeader}>
            <Text style={styles.articleTitle} numberOfLines={2}>
              {news.title}
            </Text>
            <Chip
              mode="flat"
              style={[
                styles.statusChip,
                { backgroundColor: `${getStatusColor(news.status)}20` }
              ]}
              textStyle={[
                styles.statusChipText,
                { color: getStatusColor(news.status) }
              ]}
            >
              {getStatusText(news.status)}
            </Chip>
          </View>

          <Text style={styles.articleContent} numberOfLines={3}>
            {news.summary}
          </Text>

          <View style={styles.articleActions}>
            <Text style={styles.newsDate}>
              {new Date(news.created_at).toLocaleDateString('ja-JP')}
            </Text>
            <View style={styles.actionButtons}>
              <Button
                mode="outlined"
                onPress={() => loadShortNewsForEdit(news)}
                style={styles.actionButton}
                compact
              >
                編集
              </Button>
              <Button
                mode="outlined"
                onPress={() => handleToggleShortNewsStatus(news.id, news.status)}
                style={styles.actionButton}
                compact
              >
                {news.status === 'published' ? '非公開' : '公開'}
              </Button>
              <Button
                mode="outlined"
                onPress={() => handleDeleteShortNews(news.id, news.title)}
                style={[styles.actionButton, styles.deleteButton]}
                textColor="#d32f2f"
                compact
              >
                削除
              </Button>
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  if (profile?.role !== 'admin') {
    return (
      <View style={styles.centered}>
        <Text>管理者権限が必要です</Text>
      </View>
    );
  }

  if (loading && articles.length === 0 && shortNews.length === 0) {
    return (
      <View style={styles.centered}>
        <Text>読み込み中...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <SegmentedButtons
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as 'articles' | 'shortnews' | 'categories')}
          buttons={[
            {
              value: 'articles',
              label: '応援記事',
              icon: 'vote',
              style: { borderRadius: 0 },
              labelStyle: { fontWeight: '700', textTransform: 'uppercase' },
            },
            {
              value: 'shortnews',
              label: 'ショートニュース', 
              icon: 'newspaper',
              style: { borderRadius: 0 },
              labelStyle: { fontWeight: '700', textTransform: 'uppercase' },
            },
            {
              value: 'categories',
              label: 'カテゴリ',
              icon: 'folder',
              style: { borderRadius: 0 },
              labelStyle: { fontWeight: '700', textTransform: 'uppercase' },
            },
          ]}
          style={styles.segmentedButtons}
        />
      </View>

      {activeTab === 'articles' ? (
        <FlatList
          data={articles}
          renderItem={renderArticleCard}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : activeTab === 'shortnews' ? (
        <FlatList
          data={shortNews}
          renderItem={renderShortNewsCard}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>ショートニュースがありません</Text>
              <Text style={styles.emptySubText}>
                右下の＋ボタンから新しいショートニュースを作成してください
              </Text>
            </View>
          }
        />
      ) : (
        <CategoryManager onRefresh={() => {
          fetchArticles();
          fetchShortNews();
        }} />
      )}

      {activeTab !== 'categories' && (
        <FAB
          style={styles.fab}
          icon="plus"
          onPress={() => setShowCreateDialog(true)}
          label={activeTab === 'articles' ? '記事作成' : 'ニュース作成'}
          color={COLORS.TEXT_WHITE}
        />
      )}

      <Portal>
        {/* Create/Edit Dialog for Articles */}
        {activeTab === 'articles' && (
          <Dialog 
            visible={showCreateDialog || (showEditDialog && editingArticle !== null)} 
            onDismiss={() => {
              setShowCreateDialog(false);
              setShowEditDialog(false);
              resetForm();
            }}
            style={styles.dialog}
          >
            <Dialog.Title style={styles.dialogTitle}>
              {editingArticle ? '記事を編集' : '新しい記事を作成'}
            </Dialog.Title>
            <Dialog.ScrollArea style={styles.dialogScrollArea}>
              <ScrollView 
                contentContainerStyle={styles.dialogContent}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.inputSection}>
                  <Text style={styles.sectionLabel}>記事タイトル</Text>
                  <TextInput
                    value={title}
                    onChangeText={setTitle}
                    mode="outlined"
                    style={styles.input}
                    disabled={creating || editing}
                    placeholder="投票に関する記事のタイトルを入力"
                    maxLength={100}
                  />
                  <Text style={styles.helperText}>{title.length}/100文字</Text>
                </View>

                <View style={styles.inputSection}>
                  <Text style={styles.sectionLabel}>記事内容</Text>
                  <View style={styles.contentInputContainer}>
                    <TextInput
                      value={content}
                      onChangeText={setContent}
                      mode="outlined"
                      multiline
                      numberOfLines={8}
                      style={[styles.input, styles.contentInput]}
                      disabled={creating || editing}
                      placeholder="記事の詳細内容を入力してください"
                      maxLength={1000}
                      contentStyle={styles.contentTextStyle}
                    />
                  </View>
                  <Text style={styles.helperText}>{content.length}/1000文字</Text>
                </View>

                <View style={styles.inputSection}>
                  <Text style={styles.sectionLabel}>投票選択肢</Text>
                  
                  <View style={styles.choiceRow}>
                    <View style={styles.choiceContainer}>
                      <Text style={styles.choiceLabel}>選択肢 A</Text>
                      <TextInput
                        value={choiceAText}
                        onChangeText={setChoiceAText}
                        mode="outlined"
                        style={styles.choiceInput}
                        disabled={creating || editing}
                        placeholder="選択肢Aの内容"
                        maxLength={50}
                      />
                      <Text style={styles.helperText}>{choiceAText.length}/50文字</Text>
                    </View>
                  </View>

                  <View style={styles.vsContainer}>
                    <Text style={styles.vsText}>VS</Text>
                  </View>

                  <View style={styles.choiceRow}>
                    <View style={styles.choiceContainer}>
                      <Text style={styles.choiceLabel}>選択肢 B</Text>
                      <TextInput
                        value={choiceBText}
                        onChangeText={setChoiceBText}
                        mode="outlined"
                        style={styles.choiceInput}
                        disabled={creating || editing}
                        placeholder="選択肢Bの内容"
                        maxLength={50}
                      />
                      <Text style={styles.helperText}>{choiceBText.length}/50文字</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.inputSection}>
                  <Text style={styles.sectionLabel}>公開設定</Text>
                  <RadioButton.Group 
                    onValueChange={(value) => setStatus(value as 'draft' | 'published')} 
                    value={status}
                  >
                    <TouchableOpacity 
                      style={[styles.radioCard, status === 'draft' && styles.radioCardSelected]}
                      onPress={() => setStatus('draft')}
                      disabled={creating || editing}
                    >
                      <RadioButton value="draft" disabled={creating || editing} />
                      <View style={styles.radioContent}>
                        <Text style={styles.radioTitle}>下書き</Text>
                        <Text style={styles.radioDescription}>後で編集・公開できます</Text>
                      </View>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[styles.radioCard, status === 'published' && styles.radioCardSelected]}
                      onPress={() => setStatus('published')}
                      disabled={creating || editing}
                    >
                      <RadioButton value="published" disabled={creating || editing} />
                      <View style={styles.radioContent}>
                        <Text style={styles.radioTitle}>すぐに公開</Text>
                        <Text style={styles.radioDescription}>ユーザーが投票できます</Text>
                      </View>
                    </TouchableOpacity>
                  </RadioButton.Group>
                </View>
              </ScrollView>
            </Dialog.ScrollArea>
            <Dialog.Actions style={styles.dialogActions}>
              <Button 
                onPress={() => {
                  setShowCreateDialog(false);
                  setShowEditDialog(false);
                  resetForm();
                }}
                disabled={creating || editing}
                style={styles.cancelButton}
                mode="outlined"
              >
                キャンセル
              </Button>
              <Button 
                onPress={editingArticle ? handleUpdateArticle : handleCreateArticle}
                loading={creating || editing}
                disabled={(creating || editing) || !title.trim() || !content.trim() || !choiceAText.trim() || !choiceBText.trim()}
                mode="contained"
                style={editingArticle ? styles.updateButton : styles.createButton}
              >
                {editingArticle ? (editing ? '更新中...' : '記事を更新') : (creating ? '作成中...' : '記事を作成')}
              </Button>
            </Dialog.Actions>
          </Dialog>
        )}

        {/* Create/Edit Dialog for Short News */}
        {activeTab === 'shortnews' && (
          <Dialog 
            visible={showCreateDialog || (showEditDialog && editingShortNews !== null)} 
            onDismiss={() => {
              setShowCreateDialog(false);
              setShowEditDialog(false);
              resetForm();
            }}
            style={styles.dialog}
          >
            <Dialog.Title style={styles.dialogTitle}>
              {editingShortNews ? 'ショートニュースを編集' : '新しいショートニュースを作成'}
            </Dialog.Title>
            <Dialog.ScrollArea style={styles.dialogScrollArea}>
              <ScrollView 
                contentContainerStyle={styles.dialogContent}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.inputSection}>
                  <Text style={styles.sectionLabel}>ニュースタイトル</Text>
                  <TextInput
                    value={newsTitle}
                    onChangeText={setNewsTitle}
                    mode="outlined"
                    style={styles.input}
                    disabled={creating || editing}
                    placeholder="短いニュースのタイトルを入力"
                    maxLength={100}
                  />
                  <Text style={styles.helperText}>{newsTitle.length}/100文字</Text>
                </View>

                <View style={styles.inputSection}>
                  <Text style={styles.sectionLabel}>ニュース概要</Text>
                  <View style={styles.contentInputContainer}>
                    <TextInput
                      value={newsSummary}
                      onChangeText={setNewsSummary}
                      mode="outlined"
                      multiline
                      numberOfLines={5}
                      style={[styles.input, styles.summaryInput]}
                      disabled={creating || editing}
                      placeholder="ニュースの概要を簡潔に入力してください"
                      maxLength={300}
                      contentStyle={styles.contentTextStyle}
                    />
                  </View>
                  <Text style={styles.helperText}>{newsSummary.length}/300文字</Text>
                </View>

                <View style={styles.inputSection}>
                  <Text style={styles.sectionLabel}>公開設定</Text>
                  <RadioButton.Group 
                    onValueChange={(value) => setNewsStatus(value as 'draft' | 'published')} 
                    value={newsStatus}
                  >
                    <TouchableOpacity 
                      style={[styles.radioCard, newsStatus === 'draft' && styles.radioCardSelected]}
                      onPress={() => setNewsStatus('draft')}
                      disabled={creating || editing}
                    >
                      <RadioButton value="draft" disabled={creating || editing} />
                      <View style={styles.radioContent}>
                        <Text style={styles.radioTitle}>下書き</Text>
                        <Text style={styles.radioDescription}>後で編集・公開できます</Text>
                      </View>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[styles.radioCard, newsStatus === 'published' && styles.radioCardSelected]}
                      onPress={() => setNewsStatus('published')}
                      disabled={creating || editing}
                    >
                      <RadioButton value="published" disabled={creating || editing} />
                      <View style={styles.radioContent}>
                        <Text style={styles.radioTitle}>すぐに公開</Text>
                        <Text style={styles.radioDescription}>ユーザーに表示されます</Text>
                      </View>
                    </TouchableOpacity>
                  </RadioButton.Group>
                </View>
              </ScrollView>
            </Dialog.ScrollArea>
            <Dialog.Actions style={styles.dialogActions}>
              <Button 
                onPress={() => {
                  setShowCreateDialog(false);
                  setShowEditDialog(false);
                  resetForm();
                }}
                disabled={creating || editing}
                style={styles.cancelButton}
                mode="outlined"
              >
                キャンセル
              </Button>
              <Button 
                onPress={editingShortNews ? handleUpdateShortNews : handleCreateShortNews}
                loading={creating || editing}
                disabled={(creating || editing) || !newsTitle.trim() || !newsSummary.trim()}
                mode="contained"
                style={editingShortNews ? styles.updateButton : styles.createButton}
              >
                {editingShortNews ? (editing ? '更新中...' : 'ニュースを更新') : (creating ? '作成中...' : 'ニュースを作成')}
              </Button>
            </Dialog.Actions>
          </Dialog>
        )}
      </Portal>
    </View>
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
  tabContainer: {
    backgroundColor: COLORS.COMIC_PANEL_BG,
    paddingHorizontal: 16,
    paddingVertical: 14,
    elevation: 6,
    shadowColor: COLORS.SHADOW_COMIC,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 0,
    borderBottomWidth: 3,
    borderBottomColor: COLORS.PRIMARY,
  },
  segmentedButtons: {
    backgroundColor: COLORS.BACKGROUND,
    borderWidth: 2,
    borderColor: COLORS.TEXT_PRIMARY,
    borderRadius: 0,
    overflow: 'hidden',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
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
    paddingHorizontal: 32,
    fontWeight: '500',
  },
  articleCard: {
    marginBottom: 20,
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
  articleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  articleTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.PRIMARY,
    flex: 1,
    marginRight: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textShadowColor: COLORS.COMIC_ACCENT,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  statusChip: {
    height: 30,
    borderWidth: 2,
    borderColor: COLORS.TEXT_PRIMARY,
    borderRadius: 0,
    transform: [{ skewX: '-5deg' }],
  },
  statusChipText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    transform: [{ skewX: '5deg' }],
  },
  articleContent: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 12,
    lineHeight: 20,
    fontWeight: '500',
  },
  choicesRow: {
    marginBottom: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: COLORS.COMIC_HIGHLIGHT,
    borderWidth: 2,
    borderColor: COLORS.PRIMARY,
    borderRadius: 0,
    transform: [{ skewX: '-2deg' }],
  },
  choiceText: {
    fontSize: 13,
    color: COLORS.PRIMARY,
    marginBottom: 4,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  articleActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  voteCount: {
    fontSize: 12,
    color: '#666',
  },
  newsDate: {
    fontSize: 12,
    color: '#666',
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  actionButton: {
    marginLeft: 4,
    marginVertical: 2,
  },
  deleteButton: {
    borderColor: '#d32f2f',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.PRIMARY,
    borderWidth: 3,
    borderColor: COLORS.TEXT_PRIMARY,
    borderRadius: 0,
    transform: [{ rotate: '-2deg' }],
    shadowColor: COLORS.SHADOW_RED,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 0,
  },
  dialog: {
    maxHeight: '95%',
    marginHorizontal: 12,
    maxWidth: 500,
    alignSelf: 'center',
    width: '100%',
  },
  dialogTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingVertical: 16,
  },
  dialogScrollArea: {
    maxHeight: 600,
  },
  dialogContent: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  inputSection: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    marginBottom: 8,
  },
  contentInputContainer: {
    width: '100%',
  },
  contentInput: {
    minHeight: 150,
    width: '100%',
  },
  summaryInput: {
    minHeight: 100,
    width: '100%',
  },
  contentTextStyle: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    textAlignVertical: 'top',
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
    marginBottom: 4,
  },
  choiceRow: {
    marginBottom: 12,
  },
  choiceContainer: {
    flex: 1,
  },
  choiceLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.PRIMARY,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  choiceInput: {
    marginBottom: 4,
  },
  vsContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  vsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#004225',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 0,
  },
  radioCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 0,
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  radioCardSelected: {
    borderColor: '#004225',
    backgroundColor: '#f8f5ff',
  },
  radioContent: {
    marginLeft: 8,
    flex: 1,
  },
  radioTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  radioDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  dialogActions: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  cancelButton: {
    marginRight: 8,
  },
  createButton: {
    backgroundColor: '#004225',
  },
  updateButton: {
    backgroundColor: '#2e7d32',
  },
});