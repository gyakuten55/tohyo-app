import { useState } from 'react';
import { Alert } from 'react-native';
import { Comment } from '../types';
import { CommentService } from '../services';
import { useAuth } from '../contexts/AuthContext';

export const useComments = (articleId: string) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { user, profile } = useAuth();

  const fetchComments = async () => {
    setLoading(true);
    try {
      const { data, error } = await CommentService.fetchComments(articleId);

      if (error || !data) {
        console.error('Error fetching comments:', error);
        setComments([]);
      } else {
        setComments(data);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  const submitComment = async (content: string) => {
    if (!user) {
      Alert.alert('ログインが必要', 'ログインしてからコメントしてください。');
      return false;
    }

    setSubmitting(true);

    try {
      const { success, error } = await CommentService.createComment(articleId, user.id, content);

      if (!success) {
        Alert.alert('エラー', error || 'コメントの投稿に失敗しました。');
        return false;
      } else {
        await fetchComments();
        Alert.alert('成功', 'コメントを投稿しました。');
        return true;
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      Alert.alert('エラー', 'コメントの投稿に失敗しました。');
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const deleteComment = async (commentId: string) => {
    try {
      const { success, error } = await CommentService.deleteComment(commentId);

      if (!success) {
        Alert.alert('エラー', error || 'コメントの削除に失敗しました。');
        return false;
      } else {
        await fetchComments();
        Alert.alert('成功', 'コメントを削除しました。');
        return true;
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      Alert.alert('エラー', 'コメントの削除に失敗しました。');
      return false;
    }
  };

  const canDeleteComment = (comment: Comment): boolean => {
    return profile?.role === 'admin' || comment.user?.id === user?.id;
  };

  return {
    comments,
    loading,
    submitting,
    fetchComments,
    submitComment,
    deleteComment,
    canDeleteComment,
  };
};