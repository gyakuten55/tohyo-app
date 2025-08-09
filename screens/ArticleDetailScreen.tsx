import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { ActivityIndicator, Button, TextInput, Card, Chip, Avatar, IconButton } from 'react-native-paper';
import { useAuth } from '../contexts/AuthContext';
import { useArticles } from '../hooks/useArticles';
import { useComments } from '../hooks/useComments';
import { useVoting } from '../hooks/useVoting';
import { COLORS } from '../constants';
import { Article, Comment as CommentType } from '../types';

interface ArticleDetailScreenProps {
  route: any;
  navigation: any;
}

export const ArticleDetailScreen: React.FC<ArticleDetailScreenProps> = ({
  route,
  navigation,
}) => {
  const { articleId } = route.params;
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const { user, profile } = useAuth();

  const { fetchArticleById } = useArticles(false);
  const { vote, voting } = useVoting();
  const {
    comments,
    loading: loadingComments,
    submitting: submittingComment,
    fetchComments,
    submitComment,
    deleteComment,
  } = useComments(articleId);

  const loadArticle = async () => {
    try {
      setLoading(true);
      const fetchedArticle = await fetchArticleById(articleId);
      if (!fetchedArticle) {
        Alert.alert('エラー', '記事が見つかりません。');
        navigation.goBack();
        return;
      }
      setArticle(fetchedArticle);
    } catch (error) {
      console.error('Error fetching article:', error);
      Alert.alert('エラー', '記事の読み込みに失敗しました。');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArticle();
    fetchComments();
  }, [articleId]);

  const handleVote = async (choice: 'a' | 'b') => {
    if (!article) return;

    const success = await vote(articleId, choice);
    if (success) {
      // 投票成功後、記事データを更新
      await loadArticle();
    }
  };

  const handleSubmitComment = async () => {
    const success = await submitComment(newComment);
    if (success) {
      setNewComment('');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    Alert.alert(
      'コメント削除',
      'このコメントを削除しますか？',
      [
        {
          text: 'キャンセル',
          style: 'cancel',
        },
        {
          text: '削除',
          style: 'destructive',
          onPress: () => deleteComment(commentId),
        },
      ]
    );
  };

  const renderComment = ({ item: comment }: { item: CommentType }) => {
    const canDelete = profile?.role === 'admin' || comment.user?.id === user?.id;
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('ja-JP', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    };

    return (
      <View style={styles.commentItem}>
        <View style={styles.commentHeader}>
          <Avatar.Icon
            size={32}
            icon="account"
            style={styles.commentAvatar}
          />
          <View style={styles.commentInfo}>
            <Text style={styles.commentAuthor}>{comment.user?.nickname || '不明'}</Text>
            <Text style={styles.commentDate}>{formatDate(comment.created_at)}</Text>
          </View>
          {canDelete && (
            <IconButton
              icon="delete"
              size={20}
              onPress={() => handleDeleteComment(comment.id)}
              style={styles.deleteButton}
            />
          )}
        </View>
        <Text style={styles.commentContent}>{comment.content}</Text>
      </View>
    );
  };

  if (loading || !article) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.SECONDARY} />
          <Text style={styles.loadingText}>読み込み中...</Text>
        </SafeAreaView>
      </View>
    );
  }

  const totalVotes = article.choice_a_votes + article.choice_b_votes;
  const hasVoted = article.user_vote !== null;
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP');
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.scrollView}>
          <Card style={styles.articleCard}>
            <Card.Content>
              {article.thumbnail_url && (
                <Image 
                  source={{ uri: article.thumbnail_url }}
                  style={styles.thumbnail}
                  resizeMode="cover"
                />
              )}
              
              <View style={styles.header}>
                <Text style={styles.title}>
                  {article.title}
                </Text>
                {hasVoted && (
                  <Chip
                    mode="flat"
                    style={styles.votedChip}
                    textStyle={styles.votedChipText}
                  >
                    投票済み
                  </Chip>
                )}
              </View>

              <Text style={styles.dateText}>
                投稿日: {formatDate(article.created_at)}
              </Text>

              <Text style={styles.content}>
                {article.content}
              </Text>
            </Card.Content>
          </Card>

          <Card style={styles.votingCard}>
            <Card.Content>
              <Text style={styles.votingTitle}>
                投票してください
              </Text>
              
              <View style={styles.choicesContainer}>
                <TouchableOpacity
                  style={[
                    styles.choiceButton,
                    hasVoted && article.user_vote === 'a' && styles.choiceButtonVoted,
                    (hasVoted || voting) && styles.choiceButtonDisabled
                  ]}
                  onPress={() => handleVote('a')}
                  disabled={hasVoted || voting}
                >
                  <Text style={styles.choiceText}>{article.choice_a_text}</Text>
                  <View style={styles.voteInfo}>
                    <Text style={styles.voteCount}>{article.choice_a_votes}票</Text>
                    <Text style={styles.percentage}>{article.choice_a_odds.toFixed(1)}%</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.choiceButton,
                    hasVoted && article.user_vote === 'b' && styles.choiceButtonVoted,
                    (hasVoted || voting) && styles.choiceButtonDisabled
                  ]}
                  onPress={() => handleVote('b')}
                  disabled={hasVoted || voting}
                >
                  <Text style={styles.choiceText}>{article.choice_b_text}</Text>
                  <View style={styles.voteInfo}>
                    <Text style={styles.voteCount}>{article.choice_b_votes}票</Text>
                    <Text style={styles.percentage}>{article.choice_b_odds.toFixed(1)}%</Text>
                  </View>
                </TouchableOpacity>
              </View>

              <Text style={styles.totalVotes}>
                総投票数: {totalVotes}票
              </Text>

              {hasVoted && (
                <View style={styles.thankYouContainer}>
                  <Text style={styles.thankYouText}>
                    投票ありがとうございました！
                  </Text>
                  <Text style={styles.pointText}>
                    +1ポイント獲得
                  </Text>
                </View>
              )}
            </Card.Content>
          </Card>

          <Card style={styles.commentsCard}>
            <Card.Content>
              <Text style={styles.commentsTitle}>
                コメント ({comments.length})
              </Text>
              
              {user && (
                <View style={styles.commentInput}>
                  <TextInput
                    mode="outlined"
                    placeholder="コメントを書く..."
                    value={newComment}
                    onChangeText={setNewComment}
                    multiline
                    numberOfLines={3}
                    style={styles.commentTextInput}
                    disabled={submittingComment}
                  />
                  <Button
                    mode="contained"
                    onPress={handleSubmitComment}
                    loading={submittingComment}
                    disabled={submittingComment || !newComment.trim()}
                    style={styles.commentSubmitButton}
                    buttonColor={COLORS.PRIMARY}
                    textColor={COLORS.TEXT_WHITE}
                    labelStyle={{ fontWeight: '700', color: COLORS.TEXT_WHITE }}
                  >
                    投稿
                  </Button>
                </View>
              )}

              {loadingComments ? (
                <ActivityIndicator size="small" color={COLORS.SECONDARY} style={styles.commentsLoader} />
              ) : comments.length === 0 ? (
                <Text style={styles.noCommentsText}>
                  まだコメントがありません。最初のコメントを投稿しましょう！
                </Text>
              ) : (
                <FlatList
                  data={comments}
                  renderItem={renderComment}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                  showsVerticalScrollIndicator={false}
                />
              )}
            </Card.Content>
          </Card>
        </ScrollView>
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
  scrollView: {
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
  articleCard: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
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
  thumbnail: {
    width: '100%',
    height: 200,
    borderRadius: 0,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  title: {
    flex: 1,
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.PRIMARY,
    marginRight: 12,
    lineHeight: 32,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textShadowColor: COLORS.COMIC_ACCENT,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  votedChip: {
    backgroundColor: COLORS.SUCCESS_LIGHT,
    borderWidth: 2,
    borderColor: COLORS.SUCCESS,
    borderRadius: 0,
    transform: [{ skewX: '-5deg' }],
  },
  votedChipText: {
    color: COLORS.SUCCESS,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    transform: [{ skewX: '5deg' }],
  },
  dateText: {
    fontSize: 12,
    color: COLORS.SECONDARY,
    marginBottom: 16,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  content: {
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
    lineHeight: 24,
    marginBottom: 8,
    fontWeight: '500',
  },
  votingCard: {
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
    transform: [{ rotate: '0.3deg' }],
  },
  votingTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.PRIMARY,
    textAlign: 'center',
    marginBottom: 20,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    textShadowColor: COLORS.SHADOW,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  choicesContainer: {
    gap: 12,
  },
  choiceButton: {
    backgroundColor: COLORS.COMIC_HIGHLIGHT,
    borderRadius: 0,
    borderWidth: 3,
    borderColor: COLORS.TEXT_PRIMARY,
    padding: 16,
    transform: [{ skewX: '-2deg' }],
    shadowColor: COLORS.SHADOW,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 0,
  },
  choiceButtonVoted: {
    backgroundColor: COLORS.SUCCESS_LIGHT,
    borderColor: COLORS.SUCCESS,
    shadowColor: COLORS.SUCCESS,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 0,
  },
  choiceButtonDisabled: {
    opacity: 0.6,
  },
  choiceText: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.PRIMARY,
    marginBottom: 8,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  voteInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  voteCount: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: '600',
  },
  percentage: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.SECONDARY,
    textShadowColor: COLORS.TEXT_PRIMARY,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  totalVotes: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
    marginTop: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  thankYouContainer: {
    backgroundColor: COLORS.COMIC_HIGHLIGHT,
    borderRadius: 0,
    padding: 16,
    marginTop: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.SUCCESS,
    transform: [{ skewX: '-3deg' }],
  },
  thankYouText: {
    fontSize: 16,
    color: COLORS.SUCCESS,
    fontWeight: '800',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  pointText: {
    fontSize: 14,
    color: COLORS.SUCCESS,
    fontWeight: '700',
  },
  commentsCard: {
    marginHorizontal: 16,
    marginVertical: 10,
    marginBottom: 32,
    elevation: 6,
    shadowColor: COLORS.SHADOW_COMIC,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 0,
    backgroundColor: COLORS.BACKGROUND_WHITE,
    borderWidth: 3,
    borderColor: COLORS.TEXT_PRIMARY,
    borderRadius: 0,
    transform: [{ rotate: '-0.2deg' }],
  },
  commentsTitle: {
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
  commentInput: {
    marginBottom: 16,
  },
  commentTextInput: {
    marginBottom: 8,
  },
  commentSubmitButton: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.PRIMARY,
    borderWidth: 2,
    borderColor: COLORS.TEXT_PRIMARY,
    borderRadius: 0,
    transform: [{ skewX: '-3deg' }],
    shadowColor: COLORS.SHADOW_RED,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 0,
  },
  commentsLoader: {
    marginVertical: 16,
  },
  noCommentsText: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    fontWeight: '600',
    marginVertical: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  commentItem: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.BORDER_LIGHT,
    paddingVertical: 12,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  commentAvatar: {
    backgroundColor: COLORS.SECONDARY,
    marginRight: 12,
    borderWidth: 2,
    borderColor: COLORS.TEXT_PRIMARY,
  },
  commentInfo: {
    flex: 1,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.TEXT_PRIMARY,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  commentDate: {
    fontSize: 12,
    color: COLORS.TEXT_LIGHT,
    marginTop: 2,
    fontWeight: '600',
  },
  deleteButton: {
    marginLeft: 8,
  },
  commentContent: {
    fontSize: 14,
    color: COLORS.TEXT_PRIMARY,
    lineHeight: 20,
    marginLeft: 44,
    fontWeight: '500',
  },
});