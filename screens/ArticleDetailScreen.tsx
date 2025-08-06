import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  SafeAreaView,
} from 'react-native';
import { ActivityIndicator, Button, TextInput } from 'react-native-paper';
import { useAuth } from '../contexts/AuthContext';
import { useArticles } from '../hooks/useArticles';
import { useComments } from '../hooks/useComments';
import { useVoting } from '../hooks/useVoting';
import { VotingCard } from '../components/VotingCard';
import { CommentList } from '../components/CommentList';
import { COLORS, MESSAGES } from '../constants';
import { Article } from '../types';

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
  const [newComment, setNewComment] = useState('');
  const { user } = useAuth();

  const { fetchArticleById } = useArticles(false);
  const { vote, voting } = useVoting();
  const {
    comments,
    loading: loadingComments,
    submitting: submittingComment,
    fetchComments,
    submitComment,
    deleteComment,
    canDeleteComment,
  } = useComments(articleId);

  const loadArticle = async () => {
    try {
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

  const renderComment = ({ item: comment }: { item: Comment }) => {
    const canDelete = profile?.role === 'admin' || comment.user.id === user?.id;
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
            <Text style={styles.commentAuthor}>{comment.user.nickname}</Text>
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
          <ActivityIndicator size="large" color="#6200ee" />
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
                  >
                    投稿
                  </Button>
                </View>
              )}

              {loadingComments ? (
                <ActivityIndicator size="small" color="#6200ee" style={styles.commentsLoader} />
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
    backgroundColor: '#f5f5f5',
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
    color: '#666',
  },
  articleCard: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  thumbnail: {
    width: '100%',
    height: 200,
    borderRadius: 8,
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 12,
    lineHeight: 30,
  },
  votedChip: {
    backgroundColor: '#e8f5e8',
  },
  votedChipText: {
    color: '#2e7d32',
    fontSize: 12,
  },
  dateText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 16,
  },
  content: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 8,
  },
  votingCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  votingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  choicesContainer: {
    gap: 12,
  },
  choiceButton: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    padding: 16,
  },
  choiceButtonVoted: {
    backgroundColor: '#e8f5e8',
    borderColor: '#2e7d32',
  },
  choiceButtonDisabled: {
    opacity: 0.6,
  },
  choiceText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  voteInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  voteCount: {
    fontSize: 14,
    color: '#666',
  },
  percentage: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6200ee',
  },
  totalVotes: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginTop: 16,
  },
  thankYouContainer: {
    backgroundColor: '#e8f5e8',
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
    alignItems: 'center',
  },
  thankYouText: {
    fontSize: 16,
    color: '#2e7d32',
    fontWeight: '600',
    marginBottom: 4,
  },
  pointText: {
    fontSize: 14,
    color: '#2e7d32',
    fontWeight: '500',
  },
  commentsCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    marginBottom: 32,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  commentsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  commentInput: {
    marginBottom: 16,
  },
  commentTextInput: {
    marginBottom: 8,
  },
  commentSubmitButton: {
    alignSelf: 'flex-end',
    backgroundColor: '#6200ee',
  },
  commentsLoader: {
    marginVertical: 16,
  },
  noCommentsText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
    marginVertical: 16,
  },
  commentItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingVertical: 12,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  commentAvatar: {
    backgroundColor: '#6200ee',
    marginRight: 12,
  },
  commentInfo: {
    flex: 1,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  commentDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  deleteButton: {
    marginLeft: 8,
  },
  commentContent: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginLeft: 44,
  },
});